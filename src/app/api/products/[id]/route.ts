import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const product = await db.product.findUnique({
    where: { id },
    include: {
      vendor: true,
      category: true,
      brand: true,
      reviews: { where: { status: 'APPROVED' }, include: { user: true }, orderBy: { helpful: 'desc' }, take: 20 },
    },
  })
  if (!product) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  // Fetch related products (same category, exclude current)
  const related = await db.product.findMany({
    where: { categoryId: product.categoryId, status: 'APPROVED', id: { not: product.id } },
    take: 8,
    orderBy: { rating: 'desc' },
  })

  return NextResponse.json({
    ...product,
    images: JSON.parse(product.images),
    tags: product.tags ? JSON.parse(product.tags) : [],
    variants: product.variants ? JSON.parse(product.variants) : null,
    vendor: product.vendor ? {
      id: product.vendor.id, storeName: product.vendor.storeName, slug: product.vendor.slug,
      logo: product.vendor.logo, banner: product.vendor.banner, description: product.vendor.description,
      verified: product.vendor.verified, rating: product.vendor.rating, reviewCount: product.vendor.reviewCount,
      totalSales: product.vendor.totalSales, totalOrders: product.vendor.totalOrders,
    } : null,
    category: product.category,
    brand: product.brand,
    reviews: product.reviews.map(r => ({
      ...r,
      user: r.user ? { id: r.user.id, name: r.user.name, avatar: r.user.avatar } : null,
    })),
    related: related.map(p => ({ ...p, images: JSON.parse(p.images), vendor: null })),
  })
}
