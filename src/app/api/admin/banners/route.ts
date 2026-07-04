import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getSession } from '@/lib/session'

export async function GET() {
  try {
    const banners = await db.banner.findMany({ orderBy: [{ order: 'asc' }, { createdAt: 'desc' }] })
    return NextResponse.json(banners)
  } catch (e: any) {
    console.error('[banners GET]', e)
    return NextResponse.json({ error: e.message || 'Failed to fetch banners' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession()
    if (!session || session.role !== 'ADMIN') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const body = await req.json()
    if (!body.title) return NextResponse.json({ error: 'Title is required' }, { status: 400 })
    if (!body.image) return NextResponse.json({ error: 'Image is required' }, { status: 400 })

    const banner = await db.banner.create({
      data: {
        title: body.title,
        image: body.image,
        link: body.link || null,
        position: body.position || 'HOME_HERO',
        active: body.active !== false,
        order: Number(body.order) || 0,
        startAt: body.startAt ? new Date(body.startAt) : null,
        endAt: body.endAt ? new Date(body.endAt) : null,
      },
    })
    return NextResponse.json(banner)
  } catch (e: any) {
    console.error('[banners POST]', e)
    return NextResponse.json({ error: e.message || 'Failed to create banner' }, { status: 500 })
  }
}
