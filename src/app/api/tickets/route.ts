import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getSession } from '@/lib/session'

export async function GET() {
  const session = await getSession()
  if (!session) return NextResponse.json([])
  const tickets = await db.ticket.findMany({
    where: { customerId: session.id },
    include: { messages: true },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(tickets)
}

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { subject, category, priority, message } = await req.json()
  if (!subject || !message) return NextResponse.json({ error: 'Subject and message required' }, { status: 400 })

  const ticketNo = `TKT-${Math.floor(10000 + Math.random() * 90000)}`
  const ticket = await db.ticket.create({
    data: {
      ticketNo,
      customerId: session.id,
      subject,
      category: category || 'GENERAL',
      priority: priority || 'NORMAL',
      status: 'OPEN',
    },
  })
  await db.ticketMessage.create({
    data: { ticketId: ticket.id, senderId: session.id, message, isStaff: false },
  })

  // Notify support staff
  const supports = await db.user.findMany({ where: { role: 'SUPPORT' } })
  for (const s of supports) {
    await db.notification.create({
      data: { userId: s.id, type: 'SYSTEM', title: 'New support ticket', message: `${subject} — ${ticketNo}`, link: '/support' },
    })
  }

  return NextResponse.json(ticket)
}
