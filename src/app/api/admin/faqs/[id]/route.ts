import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getSession } from '@/lib/session'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
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
  } catch (e: any) {
    console.error('[faqs PATCH]', e)
    return NextResponse.json({ error: e.message || 'Failed to update FAQ' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const session = await getSession()
    if (!session || session.role !== 'ADMIN') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    await db.faq.delete({ where: { id } })
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    console.error('[faqs DELETE]', e)
    return NextResponse.json({ error: e.message || 'Failed to delete FAQ' }, { status: 500 })
  }
}
