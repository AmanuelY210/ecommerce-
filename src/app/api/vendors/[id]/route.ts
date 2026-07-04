import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  // Find vendor by id or slug — only if approved AND has active subscription
  const vendor = await db.vendor.findFirst({
    where: {
      AND: [
        { OR: [{ id }, { slug: id }] },
        { status: 'APPROVED' },
        { subscription: { status: 'ACTIVE' } },
      ],
    },
    include: {
      user: true,
      subscription: { include: { package: true } },
      reviews: { where: { status: 'APPROVED' }, take: 10, orderBy: { helpful: 'desc' }, include: { user: true, product: true } },
    },
  })

  if (!vendor) return NextResponse.json({ error: 'Vendor not found or not active' }, { status: 404 })

  // Get all approved products for this vendor
  const products = await db.product.findMany({
    where: { vendorId: vendor.id, status: 'APPROVED' },
    orderBy: { sold: 'desc' },
    take: 100,
  })

  // Parse subscription data
  const sub = vendor.subscription as any
  const businessInfo = sub?.businessInfo ? JSON.parse(sub.businessInfo) : null
  const storeInfo = sub?.storeInfo ? JSON.parse(sub.storeInfo) : null

  return NextResponse.json({
    id: vendor.id,
    storeName: vendor.storeName,
    slug: vendor.slug,
    logo: vendor.logo,
    banner: vendor.banner,
    description: vendor.description || storeInfo?.storeDescription,
    businessType: vendor.businessType,
    licenseNumber: vendor.licenseNumber,
    taxNumber: vendor.taxNumber,
    verified: vendor.verified,
    rating: vendor.rating,
    reviewCount: vendor.reviewCount,
    totalSales: vendor.totalSales,
    totalOrders: vendor.totalOrders,
    createdAt: vendor.createdAt,
    // Subscription
    package: sub?.package ? { name: sub.package.name, slug: sub.package.slug, commissionRate: sub.package.commissionRate } : null,
    // Store info from subscription
    storeAddress: storeInfo?.storeAddress,
    businessHours: storeInfo?.businessHours,
    // Products
    products: products.map(p => ({
      ...p,
      images: JSON.parse(p.images),
      tags: p.tags ? JSON.parse(p.tags) : [],
    })),
    // Reviews
    reviews: vendor.reviews.map(r => ({
      ...r,
      user: r.user ? { name: r.user.name, avatar: r.user.avatar } : null,
      product: r.product ? { name: r.product.name } : null,
    })),
  })
}
