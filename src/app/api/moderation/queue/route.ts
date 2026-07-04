import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getSession } from '@/lib/session'

export async function GET(req: NextRequest) {
  const session = await getSession()
  if (!session || !['MODERATOR', 'ADMIN'].includes(session.role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const { searchParams } = new URL(req.url)
  const type = searchParams.get('type') || 'all'

  const [pendingVendors, pendingProducts, flaggedReviews, pendingTickets, highValueOrders] = await Promise.all([
    db.vendor.findMany({ where: { status: 'PENDING' }, include: { user: true, subscription: { include: { package: true } } }, orderBy: { createdAt: 'desc' } }),
    db.product.findMany({ where: { status: 'PENDING' }, include: { vendor: true, category: true }, orderBy: { createdAt: 'desc' }, take: 50 }),
    db.review.findMany({ where: { status: 'PENDING' }, include: { user: true, product: true }, orderBy: { createdAt: 'desc' }, take: 50 }),
    db.ticket.findMany({ where: { status: 'OPEN', category: { in: ['PRODUCT', 'VENDOR'] } }, include: { customer: true }, orderBy: { createdAt: 'desc' }, take: 30 }),
    db.order.findMany({ where: { total: { gte: 50000 }, status: 'PENDING' }, include: { customer: true, vendor: true }, orderBy: { createdAt: 'desc' }, take: 20 }),
  ])

  return NextResponse.json({
    vendors: pendingVendors.map(v => ({
      ...v,
      subscription: v.subscription ? {
        ...v.subscription,
        businessInfo: v.subscription.businessInfo ? JSON.parse(v.subscription.businessInfo) : null,
        bankInfo: v.subscription.bankInfo ? JSON.parse(v.subscription.bankInfo) : null,
        storeInfo: v.subscription.storeInfo ? JSON.parse(v.subscription.storeInfo) : null,
        documents: v.subscription.documents ? JSON.parse(v.subscription.documents) : null,
        package: v.subscription.package ? { ...v.subscription.package, features: JSON.parse(v.subscription.package.features) } : null,
      } : null,
    })),
    products: pendingProducts.map(p => ({ ...p, images: JSON.parse(p.images) })),
    reviews: flaggedReviews,
    tickets: pendingTickets,
    highValueOrders,
    counts: {
      vendors: pendingVendors.length,
      products: pendingProducts.length,
      reviews: flaggedReviews.length,
      tickets: pendingTickets.length,
      orders: highValueOrders.length,
    },
  })
}
