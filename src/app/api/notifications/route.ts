import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getSession } from '@/lib/session'

export async function GET() {
  const session = await getSession()
  if (!session) return NextResponse.json([])
  const items = await db.notification.findMany({
    where: { userId: session.id },
    orderBy: { createdAt: 'desc' },
    take: 30,
  })
  return NextResponse.json(items)
}

export async function PATCH(req: Request) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id, read } = await req.json()
  if (id === 'all') {
    await db.notification.updateMany({ where: { userId: session.id, read: false }, data: { read: true } })
    return NextResponse.json({ ok: true })
  }
  await db.notification.update({ where: { id }, data: { read } })
  return NextResponse.json({ ok: true })
}
