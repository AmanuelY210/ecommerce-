import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getSession } from '@/lib/session'

export async function GET() {
  const pages = await db.page.findMany({ orderBy: [{ order: 'asc' }, { createdAt: 'desc' }] })
  return NextResponse.json(pages)
}

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session || session.role !== 'ADMIN') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await req.json()
  const slug = body.slug || body.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')
  const page = await db.page.create({
    data: {
      title: body.title,
      slug,
      content: body.content || '',
      status: body.status || 'PUBLISHED',
      order: Number(body.order) || 0,
      showInFooter: body.showInFooter !== false,
    },
  })
  return NextResponse.json(page)
}
