import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getSession } from '@/lib/session'

export async function GET() {
  const posts = await db.blogPost.findMany({ orderBy: { createdAt: 'desc' } })
  return NextResponse.json(posts.map(p => ({
    ...p,
    tags: p.tags ? JSON.parse(p.tags) : [],
  })))
}

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session || session.role !== 'ADMIN') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await req.json()
  const slug = body.slug || body.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')
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
}
