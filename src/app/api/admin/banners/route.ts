import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getSession } from '@/lib/session'

export async function GET() {
  const banners = await db.banner.findMany({ orderBy: [{ order: 'asc' }, { createdAt: 'desc' }] })
  return NextResponse.json(banners)
}

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session || session.role !== 'ADMIN') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await req.json()
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
}
