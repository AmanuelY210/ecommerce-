import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getSession } from '@/lib/session'

export async function GET() {
  try {
    const pages = await db.page.findMany({ orderBy: [{ order: 'asc' }, { createdAt: 'desc' }] })
    return NextResponse.json(pages)
  } catch (e: any) {
    console.error('[pages GET]', e)
    return NextResponse.json({ error: e.message || 'Failed to fetch pages' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession()
    if (!session || session.role !== 'ADMIN') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const body = await req.json()
    if (!body.title) return NextResponse.json({ error: 'Title is required' }, { status: 400 })

    const slug = body.slug || body.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')

    // Check for existing slug
    const existing = await db.page.findUnique({ where: { slug } })
    if (existing) return NextResponse.json({ error: `A page with slug "${slug}" already exists` }, { status: 409 })

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
  } catch (e: any) {
    console.error('[pages POST]', e)
    return NextResponse.json({ error: e.message || 'Failed to create page' }, { status: 500 })
  }
}
