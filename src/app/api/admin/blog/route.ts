import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getSession } from '@/lib/session'

export async function GET() {
  try {
    const posts = await db.blogPost.findMany({ orderBy: { createdAt: 'desc' } })
    return NextResponse.json(posts.map(p => ({
      ...p,
      tags: p.tags ? JSON.parse(p.tags) : [],
    })))
  } catch (e: any) {
    console.error('[blog GET]', e)
    return NextResponse.json({ error: e.message || 'Failed to fetch blog posts' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession()
    if (!session || session.role !== 'ADMIN') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const body = await req.json()
    if (!body.title) return NextResponse.json({ error: 'Title is required' }, { status: 400 })

    const slug = body.slug || body.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')

    const existing = await db.blogPost.findUnique({ where: { slug } })
    if (existing) return NextResponse.json({ error: `A post with slug "${slug}" already exists` }, { status: 409 })

    const post = await db.blogPost.create({
      data: {
        title: body.title,
        slug,
        excerpt: body.excerpt || null,
        content: body.content || '',
        coverImage: body.coverImage || null,
        author: body.author || 'ETMarket Team',
        tags: JSON.stringify(body.tags || []),
        status: body.status || 'PUBLISHED',
        publishedAt: body.status === 'PUBLISHED' ? new Date() : null,
      },
    })
    return NextResponse.json(post)
  } catch (e: any) {
    console.error('[blog POST]', e)
    return NextResponse.json({ error: e.message || 'Failed to create blog post' }, { status: 500 })
  }
}
