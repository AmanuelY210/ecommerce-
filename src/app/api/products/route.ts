import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const q = searchParams.get('q')?.toLowerCase()
  const cat = searchParams.get('cat')
  const brand = searchParams.get('brand')
  const minPrice = Number(searchParams.get('minPrice')) || null
  const maxPrice = Number(searchParams.get('maxPrice')) || null
  const minRating = Number(searchParams.get('minRating')) || null
  const sort = searchParams.get('sort') || 'relevance'
  const deals = searchParams.get('deals') === '1'
  const featured = searchParams.get('featured') === '1'
  const page = Number(searchParams.get('page')) || 1
  const limit = Math.min(Number(searchParams.get('limit')) || 24, 60)

  const where: any = { status: 'APPROVED' }
  if (q) {
    where.OR = [
      { name: { contains: q } },
      { description: { contains: q } },
    ]
  }
  if (cat) {
    where.category = { slug: { contains: cat } }
  }
  if (brand) {
    where.brand = { slug: brand }
  }
  if (minPrice !== null || maxPrice !== null) {
    where.price = {}
    if (minPrice !== null) where.price.gte = minPrice
    if (maxPrice !== null) where.price.lte = maxPrice
  }
  if (minRating !== null) {
    where.rating = { gte: minRating }
  }
  if (deals) {
    where.comparePrice = { not: null }
  }
  if (featured) {
    where.featured = true
  }

  let orderBy: any = { createdAt: 'desc' }
  if (sort === 'priceLow') orderBy = { price: 'asc' }
  else if (sort === 'priceHigh') orderBy = { price: 'desc' }
  else if (sort === 'rating') orderBy = { rating: 'desc' }
  else if (sort === 'newest') orderBy = { createdAt: 'desc' }

  const [total, products] = await Promise.all([
    db.product.count({ where }),
    db.product.findMany({
      where,
      include: { vendor: true, category: true, brand: true },
      orderBy,
      skip: (page - 1) * limit,
      take: limit,
    }),
  ])

  return NextResponse.json({
    products: products.map(p => ({
      ...p,
      images: JSON.parse(p.images),
      tags: p.tags ? JSON.parse(p.tags) : [],
      vendor: p.vendor ? { id: p.vendor.id, storeName: p.vendor.storeName, slug: p.vendor.slug, verified: p.vendor.verified, rating: p.vendor.rating } : null,
      category: p.category ? { id: p.category.id, name: p.category.name, slug: p.category.slug } : null,
      brand: p.brand ? { id: p.brand.id, name: p.brand.name, slug: p.brand.slug } : null,
    })),
    total,
    page,
    pages: Math.ceil(total / limit),
  })
}
