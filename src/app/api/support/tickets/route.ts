import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getSession } from '@/lib/session'

export async function GET() {
  const session = await getSession()
  if (!session || !['SUPPORT', 'ADMIN'].includes(session.role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const tickets = await db.ticket.findMany({
    include: { customer: true, messages: true },
    orderBy: { createdAt: 'desc' },
    take: 200,
  })
  return NextResponse.json(tickets)
}
