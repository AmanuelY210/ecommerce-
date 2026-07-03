import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getSession } from '@/lib/session'

export async function GET() {
  const session = await getSession()
  if (!session || session.role !== 'VENDOR' || !session.vendorId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const vendor = await db.vendor.findUnique({
    where: { id: session.vendorId },
    include: {
      products: { take: 100, orderBy: { createdAt: 'desc' }, include: { category: true, brand: true } },
      orders: { include: { items: true, customer: true }, orderBy: { createdAt: 'desc' }, take: 100 },
      withdrawals: { orderBy: { createdAt: 'desc' }, take: 30 },
      reviews: { take: 20, orderBy: { createdAt: 'desc' }, include: { user: true, product: true } },
    },
  })
  if (!vendor) return NextResponse.json({ error: 'Vendor not found' }, { status: 404 })

  const last30 = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
  const last7 = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)

  const recentOrders = vendor.orders.filter(o => o.createdAt >= last30)
  const last7Orders = vendor.orders.filter(o => o.createdAt >= last7)
  const revenue30 = recentOrders.reduce((s, o) => s + o.total, 0)
  const commission30 = recentOrders.reduce((s, o) => s + o.commission, 0)
  const net30 = revenue30 - commission30

  // Chart data: last 14 days
  const days: { date: string; sales: number; orders: number }[] = []
  for (let i = 13; i >= 0; i--) {
    const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000)
    const dayStr = d.toISOString().slice(0, 10)
    const dayOrders = vendor.orders.filter(o => o.createdAt.toISOString().slice(0, 10) === dayStr)
    days.push({ date: dayStr, sales: dayOrders.reduce((s, o) => s + o.total, 0), orders: dayOrders.length })
  }

  const topProducts = await db.orderItem.groupBy({
    by: ['productId'],
    where: { vendorId: session.vendorId },
    _sum: { quantity: true, total: true },
    orderBy: { _sum: { total: 'desc' } },
    take: 5,
  })
  const topProductIds = topProducts.map(p => p.productId)
  const topProductRecords = await db.product.findMany({ where: { id: { in: topProductIds } } })
  const topProductsWithData = topProducts.map(p => {
    const prod = topProductRecords.find(r => r.id === p.productId)
    return {
      name: prod?.name || 'Unknown',
      qty: p._sum.quantity || 0,
      revenue: p._sum.total || 0,
    }
  })

  return NextResponse.json({
    vendor: {
      id: vendor.id,
      storeName: vendor.storeName,
      logo: vendor.logo,
      banner: vendor.banner,
      description: vendor.description,
      status: vendor.status,
      verified: vendor.verified,
      rating: vendor.rating,
      reviewCount: vendor.reviewCount,
      totalSales: vendor.totalSales,
      totalOrders: vendor.totalOrders,
      balance: vendor.balance,
      pendingBalance: vendor.pendingBalance,
      commissionRate: vendor.commissionRate,
      licenseNumber: vendor.licenseNumber,
      taxNumber: vendor.taxNumber,
      businessType: vendor.businessType,
    },
    products: vendor.products.map(p => ({ ...p, images: JSON.parse(p.images) })),
    orders: vendor.orders,
    withdrawals: vendor.withdrawals,
    reviews: vendor.reviews,
    stats: {
      revenue30,
      commission30,
      net30,
      orders30: recentOrders.length,
      orders7: last7Orders.length,
      balance: vendor.balance,
      pending: vendor.pendingBalance,
      totalProducts: vendor.products.length,
      totalOrders: vendor.totalOrders,
      rating: vendor.rating,
    },
    chart: days,
    topProducts: topProductsWithData,
  })
}
