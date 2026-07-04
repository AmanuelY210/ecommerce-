import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getSession } from '@/lib/session'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await getSession()
  if (!session || session.role !== 'ADMIN') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await req.json()
  const data: any = {}
  for (const k of ['title', 'excerpt', 'content', 'coverImage', 'author', 'status']) {
    if (k in body) data[k] = body[k]
  }
  if (body.slug) data.slug = body.slug
  if (body.tags) data.tags = JSON.stringify(body.tags)
  if (body.status === 'PUBLISHED') data.publishedAt = new Date()
  const post = await db.blogPost.update({ where: { id }, data })
  return NextResponse.json(post)
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await getSession()
  if (!session || session.role !== 'ADMIN') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  await db.blogPost.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
