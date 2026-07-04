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
    for (const k of ['title', 'image', 'link', 'position', 'active', 'order']) {
      if (k in body) data[k] = body[k]
    }
    if (body.startAt !== undefined) data.startAt = body.startAt ? new Date(body.startAt) : null
    if (body.endAt !== undefined) data.endAt = body.endAt ? new Date(body.endAt) : null
    const banner = await db.banner.update({ where: { id }, data })
    return NextResponse.json(banner)
  } catch (e: any) {
    console.error('[banners PATCH]', e)
    return NextResponse.json({ error: e.message || 'Failed to update banner' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const session = await getSession()
    if (!session || session.role !== 'ADMIN') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    await db.banner.delete({ where: { id } })
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    console.error('[banners DELETE]', e)
    return NextResponse.json({ error: e.message || 'Failed to delete banner' }, { status: 500 })
  }
}
