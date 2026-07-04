import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getSession } from '@/lib/session'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await getSession()
  if (!session || session.role !== 'ADMIN') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await req.json()
  const data: any = {}
  for (const k of ['question', 'answer', 'category', 'order', 'active']) {
    if (k in body) data[k] = body[k]
  }
  const faq = await db.faq.update({ where: { id }, data })
  return NextResponse.json(faq)
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await getSession()
  if (!session || session.role !== 'ADMIN') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  await db.faq.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
