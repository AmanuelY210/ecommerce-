import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getSession } from '@/lib/session'

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const order = await db.order.findUnique({
    where: { id },
    include: { items: true, customer: true, vendor: true, payments: true, delivery: true, refunds: true },
  })
  if (!order) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  // Authorization
  if (session.role === 'CUSTOMER' && order.customerId !== session.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }
  if (session.role === 'VENDOR' && order.vendorId !== session.vendorId) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  return NextResponse.json({
    ...order,
    shippingAddress: order.shippingAddress ? JSON.parse(order.shippingAddress) : null,
    items: order.items,
  })
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { action } = body

  const order = await db.order.findUnique({ where: { id } })
  if (!order) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  // Vendor actions
  if (session.role === 'VENDOR' && order.vendorId === session.vendorId) {
    if (action === 'confirm') {
      const updated = await db.order.update({ where: { id }, data: { status: 'CONFIRMED' } })
      await db.delivery.updateMany({ where: { orderId: id }, data: { status: 'ASSIGNED' } })
      return NextResponse.json(updated)
    }
    if (action === 'pack') {
      const updated = await db.order.update({ where: { id }, data: { status: 'PACKED' } })
      return NextResponse.json(updated)
    }
    if (action === 'ship') {
      const tracking = `TRK${Math.random().toString(36).substring(2, 12).toUpperCase()}`
      const updated = await db.order.update({ where: { id }, data: { status: 'SHIPPED', trackingNumber: tracking } })
      await db.delivery.updateMany({ where: { orderId: id }, data: { status: 'IN_TRANSIT', pickupAt: new Date() } })
      return NextResponse.json(updated)
    }
    if (action === 'deliver') {
      const updated = await db.order.update({ where: { id }, data: { status: 'DELIVERED' } })
      await db.delivery.updateMany({ where: { orderId: id }, data: { status: 'DELIVERED', deliveredAt: new Date() } })
      // Move funds from pending to available balance
      if (order.vendorId) {
        const earnings = order.total - order.commission - order.shipping - order.tax
        await db.vendor.update({
          where: { id: order.vendorId },
          data: {
            pendingBalance: { decrement: earnings },
            balance: { increment: earnings },
            totalSales: { increment: order.total },
          },
        })
      }
      return NextResponse.json(updated)
    }
    if (action === 'cancel') {
      const updated = await db.order.update({ where: { id }, data: { status: 'CANCELLED', paymentStatus: 'REFUNDED' } })
      return NextResponse.json(updated)
    }
  }

  // Customer actions
  if (session.role === 'CUSTOMER' && order.customerId === session.id) {
    if (action === 'cancel') {
      const updated = await db.order.update({ where: { id }, data: { status: 'CANCELLED' } })
      return NextResponse.json(updated)
    }
    if (action === 'return') {
      const refund = await db.refund.create({
        data: { orderId: id, userId: session.id, amount: order.total, reason: body.reason || 'Customer requested return', status: 'PENDING' },
      })
      const updated = await db.order.update({ where: { id }, data: { status: 'RETURNED' } })
      return NextResponse.json({ order: updated, refund })
    }
  }

  // Admin actions (any of the above)
  if (session.role === 'ADMIN') {
    if (body.status) {
      const updated = await db.order.update({ where: { id }, data: { status: body.status } })
      return NextResponse.json(updated)
    }
  }

  return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
}
