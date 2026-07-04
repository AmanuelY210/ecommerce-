import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getSession } from '@/lib/session'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const session = await getSession()
    if (!session || session.role !== 'ADMIN') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const body = await req.json()

    if (body.slug) {
      const existing = await db.blogPost.findFirst({ where: { slug: body.slug, NOT: { id } } })
      if (existing) return NextResponse.json({ error: `Slug "${body.slug}" is already used by another post` }, { status: 409 })
    }

    const data: any = {}
    for (const k of ['title', 'excerpt', 'content', 'coverImage', 'author', 'status']) {
      if (k in body) data[k] = body[k]
    }
    if (body.slug) data.slug = body.slug
    if (body.tags) data.tags = JSON.stringify(body.tags)
    if (body.status === 'PUBLISHED') data.publishedAt = new Date()

    const post = await db.blogPost.update({ where: { id }, data })
    return NextResponse.json(post)
  } catch (e: any) {
    console.error('[blog PATCH]', e)
    return NextResponse.json({ error: e.message || 'Failed to update blog post' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const session = await getSession()
    if (!session || session.role !== 'ADMIN') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    await db.blogPost.delete({ where: { id } })
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    console.error('[blog DELETE]', e)
    return NextResponse.json({ error: e.message || 'Failed to delete blog post' }, { status: 500 })
  }
}
