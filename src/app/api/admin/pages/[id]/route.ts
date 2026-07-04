import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getSession } from '@/lib/session'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const session = await getSession()
    if (!session || session.role !== 'ADMIN') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const body = await req.json()

    // If slug is changing, check for conflicts
    if (body.slug) {
      const existing = await db.page.findFirst({ where: { slug: body.slug, NOT: { id } } })
      if (existing) return NextResponse.json({ error: `Slug "${body.slug}" is already used by another page` }, { status: 409 })
    }

    const data: any = {}
    for (const k of ['title', 'content', 'status', 'order', 'showInFooter']) {
      if (k in body) data[k] = body[k]
    }
    if (body.slug) data.slug = body.slug

    const page = await db.page.update({ where: { id }, data })
    return NextResponse.json(page)
  } catch (e: any) {
    console.error('[pages PATCH]', e)
    return NextResponse.json({ error: e.message || 'Failed to update page' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const session = await getSession()
    if (!session || session.role !== 'ADMIN') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    await db.page.delete({ where: { id } })
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    console.error('[pages DELETE]', e)
    return NextResponse.json({ error: e.message || 'Failed to delete page' }, { status: 500 })
  }
}
