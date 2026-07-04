import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getSession } from '@/lib/session'
import { genOrderNo, genRef } from '@/lib/helpers'

export async function GET() {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  if (session.role === 'VENDOR' && session.vendorId) {
    const orders = await db.order.findMany({
      where: { vendorId: session.vendorId },
      include: { items: true, customer: true },
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json(orders)
  }
  if (session.role === 'ADMIN') {
    const orders = await db.order.findMany({
      include: { items: true, customer: true, vendor: true },
      orderBy: { createdAt: 'desc' },
      take: 200,
    })
    return NextResponse.json(orders)
  }

  const orders = await db.order.findMany({
    where: { customerId: session.id },
    include: { items: true, vendor: true },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(orders)
}

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Please sign in to place an order' }, { status: 401 })

  const body = await req.json()
  const { items, address, payment, couponCode, couponDiscount, shippingFee = 0 } = body as {
    items: { productId: string; name: string; price: number; image?: string; qty: number; vendorId?: string }[]
    address: { region: string; city: string; area: string; detail: string; phone: string; fullName: string }
    payment: { provider: string; method: string; bank?: string; reference?: string; txnId?: string }
    couponCode?: string
    couponDiscount?: number
    shippingFee?: number
  }

  if (!items?.length) return NextResponse.json({ error: 'Cart is empty' }, { status: 400 })

  // Validate products & compute totals
  const productIds = items.map(i => i.productId)
  const products = await db.product.findMany({ where: { id: { in: productIds } } })
  const productMap = new Map(products.map(p => [p.id, p]))

  let subtotal = 0
  const orderItems: any[] = []
  const vendorId = items[0]?.vendorId || products[0]?.vendorId

  for (const item of items) {
    const p = productMap.get(item.productId)
    if (!p) continue
    const lineTotal = p.price * item.qty
    subtotal += lineTotal
    orderItems.push({
      productId: p.id,
      name: p.name,
      image: JSON.parse(p.images)[0],
      price: p.price,
      quantity: item.qty,
      total: lineTotal,
      vendorId: p.vendorId,
    })
  }

  const tax = Math.round(subtotal * 0.15)
  const discount = Math.min(couponDiscount || 0, subtotal)
  const total = subtotal + shippingFee + tax - discount

  // Get vendor commission rate
  let commission = 0
  if (vendorId) {
    const v = await db.vendor.findUnique({ where: { id: vendorId } })
    if (v) commission = Math.round((subtotal - discount) * (v.commissionRate / 100))
  }

  const orderNo = genOrderNo()
  const order = await db.order.create({
    data: {
      orderNumber: orderNo,
      customerId: session.id,
      vendorId: vendorId || null,
      status: payment.method === 'cod' ? 'CONFIRMED' : 'CONFIRMED',
      paymentStatus: 'PAID',
      paymentMethod: payment.bank || payment.provider,
      paymentProvider: payment.provider,
      paymentRef: payment.reference || genRef(),
      subtotal, shipping: shippingFee, tax, commission, discount, total,
      shippingAddress: JSON.stringify(address),
      trackingNumber: null,
      items: { create: orderItems },
    },
    include: { items: true },
  })

  // Create payment record
  await db.payment.create({
    data: {
      orderId: order.id,
      provider: payment.provider,
      method: payment.method,
      bank: payment.bank || null,
      amount: total,
      status: 'SUCCESS',
      reference: payment.reference || order.paymentRef,
      txnId: payment.txnId || `TXN${Date.now()}`,
    },
  })

  // Create delivery record for tracking
  await db.delivery.create({
    data: {
      orderId: order.id,
      status: 'ASSIGNED',
      zone: address.region,
      otp: String(Math.floor(1000 + Math.random() * 9000)),
    },
  })

  // Update product stock & sold counts
  for (const item of items) {
    const p = productMap.get(item.productId)
    if (p) {
      await db.product.update({
        where: { id: p.id },
        data: { stock: Math.max(0, p.stock - item.qty), sold: p.sold + item.qty },
      })
    }
  }

  // Increment coupon usage
  if (couponCode) {
    await db.coupon.updateMany({ where: { code: couponCode }, data: { usedCount: { increment: 1 } } })
  }

  // Notify vendor (if any)
  if (vendorId) {
    const v = await db.vendor.findUnique({ where: { id: vendorId } })
    if (v) {
      await db.notification.create({
        data: { userId: v.userId, type: 'ORDER', title: 'New order received', message: `Order ${orderNo} for ${total} ETB`, link: '/vendor/orders' },
      })
      await db.vendor.update({ where: { id: vendorId }, data: { pendingBalance: { increment: (total - commission) }, totalOrders: { increment: 1 } } })
    }
  }

  await db.notification.create({
    data: { userId: session.id, type: 'ORDER', title: 'Order placed successfully', message: `Your order ${orderNo} has been confirmed.`, link: `/orders/${order.id}` },
  })

  return NextResponse.json({ order, ok: true })
}
