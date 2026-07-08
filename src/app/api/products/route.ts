import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { FALLBACK_PRODUCTS } from '@/lib/fallback-data'

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

  try {
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

    if (products.length === 0 && total === 0) {
      // DB is empty — return fallback products
      let fbProducts = [...FALLBACK_PRODUCTS]
      if (deals) fbProducts = fbProducts.filter(p => p.comparePrice !== null)
      if (featured) fbProducts = fbProducts.filter(p => p.featured)
      if (q) fbProducts = fbProducts.filter(p => p.name.toLowerCase().includes(q) || (p.description || '').toLowerCase().includes(q))
      if (cat) fbProducts = fbProducts.filter(p => p.category.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').includes(cat.toLowerCase().replace(/[^a-z0-9]+/g, '-')))
      if (minPrice !== null) fbProducts = fbProducts.filter(p => p.price >= minPrice)
      if (maxPrice !== null) fbProducts = fbProducts.filter(p => p.price <= maxPrice)
      if (minRating !== null) fbProducts = fbProducts.filter(p => p.rating >= minRating)
      
      if (sort === 'priceLow') fbProducts.sort((a, b) => a.price - b.price)
      else if (sort === 'priceHigh') fbProducts.sort((a, b) => b.price - a.price)
      else if (sort === 'rating') fbProducts.sort((a, b) => b.rating - a.rating)
      
      return NextResponse.json({
        products: fbProducts,
        total: fbProducts.length,
        page: 1,
        pages: 1,
      })
    }

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
  } catch (error) {
    // DB not available — return fallback products
    return NextResponse.json({
      products: FALLBACK_PRODUCTS,
      total: FALLBACK_PRODUCTS.length,
      page: 1,
      pages: 1,
    })
  }
}
