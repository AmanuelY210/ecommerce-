import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getSession } from '@/lib/session'

export async function GET(req: NextRequest) {
  const session = await getSession()
  if (!session || !['ADMIN', 'MODERATOR'].includes(session.role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const { searchParams } = new URL(req.url)
  const status = searchParams.get('status') || undefined

  const products = await db.product.findMany({
    where: status ? { status } : undefined,
    include: { vendor: true, category: true, brand: true },
    orderBy: { createdAt: 'desc' },
    take: 200,
  })
  return NextResponse.json(products.map(p => ({ ...p, images: JSON.parse(p.images), tags: p.tags ? JSON.parse(p.tags) : [] })))
}

export async function PATCH(req: NextRequest) {
  const session = await getSession()
  if (!session || !['ADMIN', 'MODERATOR'].includes(session.role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const { id, action } = await req.json()
  const product = await db.product.findUnique({ where: { id } })
  if (!product) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  let status = product.status
  if (action === 'approve') status = 'APPROVED'
  else if (action === 'reject') status = 'REJECTED'
  else if (action === 'suspend') status = 'SUSPENDED'

  const updated = await db.product.update({ where: { id }, data: { status } })
  await db.moderationLog.create({ data: { type: 'PRODUCT', targetId: id, action: action.toUpperCase(), moderatorId: session.id } })
  return NextResponse.json(updated)
}
