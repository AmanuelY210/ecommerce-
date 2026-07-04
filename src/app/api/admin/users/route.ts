import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getSession } from '@/lib/session'

export async function GET() {
  const session = await getSession()
  if (!session || session.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const users = await db.user.findMany({
    orderBy: { createdAt: 'desc' },
    take: 200,
    include: { vendor: true },
  })
  return NextResponse.json(users)
}

export async function PATCH(req: Request) {
  const session = await getSession()
  if (!session || session.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const { id, status, role } = await req.json()
  const data: any = {}
  if (status) data.status = status
  if (role) data.role = role
  const user = await db.user.update({ where: { id }, data })
  await db.auditLog.create({ data: { userId: session.id, action: 'USER_UPDATE', target: id, meta: JSON.stringify(data) } })
  return NextResponse.json(user)
}
