import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getSession } from '@/lib/session'

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { productId, rating, title, comment } = await req.json()
  if (!productId || !rating || !comment) {
    return NextResponse.json({ error: 'Product, rating, comment required' }, { status: 400 })
  }

  const product = await db.product.findUnique({ where: { id: productId } })
  if (!product) return NextResponse.json({ error: 'Product not found' }, { status: 404 })

  const review = await db.review.create({
    data: {
      productId, userId: session.id, vendorId: product.vendorId,
      rating: Number(rating), title: title || '', comment, status: 'APPROVED',
    },
  })

  // Recompute product rating
  const allReviews = await db.review.findMany({ where: { productId, status: 'APPROVED' } })
  const avg = allReviews.reduce((s, r) => s + r.rating, 0) / allReviews.length
  await db.product.update({ where: { id: productId }, data: { rating: Math.round(avg * 10) / 10, reviewCount: allReviews.length } })

  return NextResponse.json(review)
}
