import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const top = searchParams.get('top') === '1'
  const limit = Math.min(Number(searchParams.get('limit')) || 12, 50)

  let vendors = await db.vendor.findMany({
    where: { status: 'APPROVED' },
    take: limit,
    orderBy: top ? { totalSales: 'desc' } : { createdAt: 'desc' },
    include: { user: true },
  })

  return NextResponse.json(vendors.map(v => ({
    id: v.id,
    storeName: v.storeName,
    slug: v.slug,
    logo: v.logo,
    banner: v.banner,
    description: v.description,
    verified: v.verified,
    rating: v.rating,
    reviewCount: v.reviewCount,
    totalSales: v.totalSales,
    totalOrders: v.totalOrders,
    createdAt: v.createdAt,
  })))
}
