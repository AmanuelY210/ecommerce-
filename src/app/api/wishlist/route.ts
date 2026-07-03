import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getSession } from '@/lib/session'

export async function GET() {
  const session = await getSession()
  if (!session) return NextResponse.json([])
  const items = await db.wishlist.findMany({
    where: { userId: session.id },
    include: { product: { include: { vendor: true } } },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(items.map(i => ({ ...i, product: { ...i.product, images: JSON.parse(i.product.images) } })))
}

export async function POST(req: Request) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { productId } = await req.json()
  if (!productId) return NextResponse.json({ error: 'productId required' }, { status: 400 })

  try {
    const item = await db.wishlist.create({ data: { userId: session.id, productId } })
    return NextResponse.json(item)
  } catch {
    return NextResponse.json({ error: 'Already in wishlist' }, { status: 409 })
  }
}

export async function DELETE(req: Request) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { searchParams } = new URL(req.url)
  const productId = searchParams.get('productId')
  if (!productId) return NextResponse.json({ error: 'productId required' }, { status: 400 })

  await db.wishlist.deleteMany({ where: { userId: session.id, productId } })
  return NextResponse.json({ ok: true })
}
