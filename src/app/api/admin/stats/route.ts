import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getSession } from '@/lib/session'

export async function GET() {
  const session = await getSession()
  if (!session || !['ADMIN', 'VENDOR', 'SUPPORT', 'MODERATOR'].includes(session.role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const now = new Date()
  const last30 = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
  const last7 = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

  const [
    totalOrders, recentOrders, paidOrders, totalUsers, totalVendors, approvedVendors,
    pendingVendors, totalProducts, approvedProducts, pendingProducts, refunds, withdrawals,
    recentOrderData, recentCustomers, recentVendors,
  ] = await Promise.all([
    db.order.count(),
    db.order.count({ where: { createdAt: { gte: last30 } } }),
    db.order.count({ where: { paymentStatus: 'PAID' } }),
    db.user.count(),
    db.vendor.count(),
    db.vendor.count({ where: { status: 'APPROVED' } }),
    db.vendor.count({ where: { status: 'PENDING' } }),
    db.product.count(),
    db.product.count({ where: { status: 'APPROVED' } }),
    db.product.count({ where: { status: 'PENDING' } }),
    db.refund.count({ where: { status: 'PENDING' } }),
    db.withdrawal.count({ where: { status: 'PENDING' } }),
    db.order.findMany({ where: { createdAt: { gte: last30 } }, select: { total: true, createdAt: true, status: true } }),
    db.user.findMany({ where: { role: 'CUSTOMER', createdAt: { gte: last30 } }, select: { id: true, createdAt: true } }),
    db.user.findMany({ where: { role: 'VENDOR', createdAt: { gte: last30 } }, select: { id: true, createdAt: true } }),
  ])

  const gmv = recentOrderData.reduce((s, o) => s + o.total, 0)
  const netRevenue = Math.round(gmv * 0.10) // approximate commission (10%)
  const commission = netRevenue

  // Build last 30 day chart
  const days: { date: string; gmv: number; orders: number }[] = []
  for (let i = 29; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000)
    const dayStr = d.toISOString().slice(0, 10)
    const dayOrders = recentOrderData.filter(o => o.createdAt.toISOString().slice(0, 10) === dayStr)
    days.push({ date: dayStr, gmv: dayOrders.reduce((s, o) => s + o.total, 0), orders: dayOrders.length })
  }

  // Top categories
  const topCategoriesData = await db.product.groupBy({
    by: ['categoryId'],
    _sum: { sold: true },
    orderBy: { _sum: { sold: 'desc' } },
    take: 6,
  })
  const topCategories = await Promise.all(
    topCategoriesData.map(async (c) => {
      const cat = await db.category.findUnique({ where: { id: c.categoryId } })
      return { name: cat?.name || 'Unknown', value: c._sum.sold || 0 }
    })
  )

  // Top vendors
  const topVendors = await db.vendor.findMany({
    orderBy: { totalSales: 'desc' },
    take: 8,
    select: { id: true, storeName: true, totalSales: true, totalOrders: true, rating: true },
  })

  // Status distribution
  const statusCounts = await db.order.groupBy({ by: ['status'], _count: true })

  return NextResponse.json({
    counts: {
      totalOrders, recentOrders, paidOrders, totalUsers, totalVendors, approvedVendors,
      pendingVendors, totalProducts, approvedProducts, pendingProducts, refunds, withdrawals,
      gmv, netRevenue, commission,
      recentCustomers: recentCustomers.length,
      recentVendors: recentVendors.length,
    },
    chart: days,
    topCategories,
    topVendors,
    statusCounts: statusCounts.reduce((m, s) => { m[s.status] = s._count; return m }, {} as Record<string, number>),
  })
}
