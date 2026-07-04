import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getSession } from '@/lib/session'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await getSession()
  if (!session || session.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const body = await req.json()
  const data: any = {}
  for (const k of ['name','description','priceMonthly','priceYearly','productLimit','storageLimitMb','imageLimit','videoLimit','staffAccounts','warehouses','commissionRate','order','active','popular']) {
    if (k in body) data[k] = body[k]
  }
  if (body.features) data.features = JSON.stringify(body.features)
  if (body.slug) data.slug = body.slug
  const pkg = await db.vendorPackage.update({ where: { id }, data })
  return NextResponse.json(pkg)
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await getSession()
  if (!session || session.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  await db.vendorPackage.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
