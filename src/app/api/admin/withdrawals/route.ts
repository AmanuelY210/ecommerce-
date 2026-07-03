import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getSession } from '@/lib/session'

export async function GET() {
  const session = await getSession()
  if (!session || session.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const withdrawals = await db.withdrawal.findMany({
    include: { vendor: true },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(withdrawals)
}

export async function PATCH(req: NextRequest) {
  const session = await getSession()
  if (!session || session.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const { id, action } = await req.json()
  const w = await db.withdrawal.findUnique({ where: { id }, include: { vendor: true } })
  if (!w) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  let status = w.status
  if (action === 'approve') status = 'APPROVED'
  else if (action === 'pay') {
    status = 'PAID'
    // Deduct from vendor balance
    await db.vendor.update({ where: { id: w.vendorId }, data: { balance: { decrement: w.amount } } })
  } else if (action === 'reject') status = 'REJECTED'

  const updated = await db.withdrawal.update({ where: { id }, data: { status, reference: `WD-${Date.now()}` } })
  await db.notification.create({
    data: {
      userId: w.vendor.userId,
      type: 'PAYMENT',
      title: `Withdrawal ${status.toLowerCase()}`,
      message: `Your withdrawal of ${w.amount} ETB has been ${status.toLowerCase()}.`,
      link: '/vendor/wallet',
    },
  })
  return NextResponse.json(updated)
}
