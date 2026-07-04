import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const top = searchParams.get('top') === '1'
  const limit = Math.min(Number(searchParams.get('limit')) || 50, 100)
  const q = searchParams.get('q')?.toLowerCase()

  // Only show vendors that have an ACTIVE subscription (paid vendors)
  let vendors = await db.vendor.findMany({
    where: {
      status: 'APPROVED',
      subscription: { status: 'ACTIVE' },
      ...(q ? { OR: [
        { storeName: { contains: q } },
        { description: { contains: q } },
      ] } : {}),
    },
    take: limit,
    orderBy: top ? { totalSales: 'desc' } : { createdAt: 'desc' },
    include: {
      user: true,
      subscription: { include: { package: true } },
      products: { where: { status: 'APPROVED' }, select: { id: true, name: true, price: true, images: true, slug: true, rating: true, reviewCount: true }, take: 6 },
    },
  })

  return NextResponse.json(vendors.map(v => ({
    id: v.id,
    storeName: v.storeName,
    slug: v.slug,
    logo: v.logo,
    banner: v.banner,
    description: v.description,
    businessType: v.businessType,
    verified: v.verified,
    rating: v.rating,
    reviewCount: v.reviewCount,
    totalSales: v.totalSales,
    totalOrders: v.totalOrders,
    createdAt: v.createdAt,
    // Subscription info
    packageName: v.subscription?.package?.name || null,
    packageSlug: v.subscription?.package?.slug || null,
    // Count of approved products
    productCount: v.products.length,
    // Sample products for preview
    sampleProducts: v.products.map(p => ({
      ...p,
      images: JSON.parse(p.images),
    })),
  })))
}
