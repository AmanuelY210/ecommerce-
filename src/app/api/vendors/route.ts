import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const top = searchParams.get('top') === '1'
  const limit = Math.min(Number(searchParams.get('limit')) || 50, 100)
  const q = searchParams.get('q')?.toLowerCase()

  // Show ALL vendors with an active subscription (both verified and unverified)
  // Verified vendors are sorted first, then by sales/orders
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

  // Sort: verified first, then by the requested sort order
  const result = vendors.map(v => ({
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
    packageName: v.subscription?.package?.name || null,
    packageSlug: v.subscription?.package?.slug || null,
    productCount: v.products.length,
    sampleProducts: v.products.map(p => ({
      ...p,
      images: JSON.parse(p.images),
    })),
  }))

  // Sort: verified vendors first, then by original order
  result.sort((a, b) => {
    if (a.verified !== b.verified) return a.verified ? -1 : 1
    return 0 // keep original order within each group
  })

  return NextResponse.json(result)
}
