import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getSession } from '@/lib/session'

export async function GET() {
  const session = await getSession()
  if (!session || session.role !== 'VENDOR' || !session.vendorId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const products = await db.product.findMany({
    where: { vendorId: session.vendorId },
    include: { category: true, brand: true },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(products.map(p => ({ ...p, images: JSON.parse(p.images), tags: p.tags ? JSON.parse(p.tags) : [] })))
}

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session || session.role !== 'VENDOR' || !session.vendorId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const body = await req.json()
  const { name, description, price, comparePrice, stock, categoryId, brandId, sku, barcode, images, lowStockAt = 5 } = body

  if (!name || !price || !categoryId) {
    return NextResponse.json({ error: 'Name, price, category required' }, { status: 400 })
  }

  const slugBase = name.toLowerCase().replace(/[^a-z0-9]+/g, '-')
  const slug = `${slugBase}-${Date.now().toString(36)}`

  const product = await db.product.create({
    data: {
      vendorId: session.vendorId,
      categoryId,
      brandId: brandId || null,
      name,
      slug,
      description: description || '',
      price: Number(price),
      comparePrice: comparePrice ? Number(comparePrice) : null,
      sku: sku || `SKU-${Date.now().toString(36).toUpperCase()}`,
      barcode: barcode || null,
      stock: Number(stock) || 0,
      lowStockAt: Number(lowStockAt),
      images: JSON.stringify(images || [`https://picsum.photos/seed/${slug}/600/600`]),
      status: 'PENDING', // requires moderator approval
    },
  })
  return NextResponse.json(product)
}

export async function PATCH(req: NextRequest) {
  const session = await getSession()
  if (!session || session.role !== 'VENDOR' || !session.vendorId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const body = await req.json()
  const { id, ...fields } = body

  const existing = await db.product.findUnique({ where: { id } })
  if (!existing || existing.vendorId !== session.vendorId) {
    return NextResponse.json({ error: 'Not found or unauthorized' }, { status: 404 })
  }

  const data: any = {}
  for (const k of ['name','description','price','comparePrice','stock','categoryId','brandId','sku','barcode','lowStockAt','featured']) {
    if (k in fields) data[k] = fields[k]
  }
  if (fields.images) data.images = JSON.stringify(fields.images)

  const updated = await db.product.update({ where: { id }, data })
  return NextResponse.json(updated)
}

export async function DELETE(req: NextRequest) {
  const session = await getSession()
  if (!session || session.role !== 'VENDOR' || !session.vendorId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 })

  const existing = await db.product.findUnique({ where: { id } })
  if (!existing || existing.vendorId !== session.vendorId) {
    return NextResponse.json({ error: 'Not found or unauthorized' }, { status: 404 })
  }

  await db.product.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
