import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getSession } from '@/lib/session'

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const ticket = await db.ticket.findUnique({
    where: { id },
    include: { customer: true, messages: { include: { sender: true }, orderBy: { createdAt: 'asc' } } },
  })
  if (!ticket) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  if (session.role === 'CUSTOMER' && ticket.customerId !== session.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  return NextResponse.json(ticket)
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { action, status, priority, assignedTo, message } = body

  const ticket = await db.ticket.findUnique({ where: { id } })
  if (!ticket) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  if (action === 'message' && message) {
    const msg = await db.ticketMessage.create({
      data: { ticketId: id, senderId: session.id, message, isStaff: session.role !== 'CUSTOMER' },
    })
    // If staff replies, mark as in_progress
    if (session.role !== 'CUSTOMER' && ticket.status === 'OPEN') {
      await db.ticket.update({ where: { id }, data: { status: 'IN_PROGRESS', assignedTo: session.id } })
    }
    return NextResponse.json(msg)
  }

  const data: any = {}
  if (status) data.status = status
  if (priority) data.priority = priority
  if (assignedTo !== undefined) data.assignedTo = assignedTo

  const updated = await db.ticket.update({ where: { id }, data })
  return NextResponse.json(updated)
}
