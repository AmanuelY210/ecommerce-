import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getSession } from '@/lib/session'

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session || session.role !== 'VENDOR' || !session.vendorId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const { amount, bankName, accountNo } = await req.json()
  if (!amount || !bankName || !accountNo) {
    return NextResponse.json({ error: 'Amount, bank name, account number required' }, { status: 400 })
  }

  const vendor = await db.vendor.findUnique({ where: { id: session.vendorId } })
  if (!vendor) return NextResponse.json({ error: 'Vendor not found' }, { status: 404 })
  if (amount > vendor.balance) {
    return NextResponse.json({ error: 'Insufficient balance' }, { status: 400 })
  }

  const withdrawal = await db.withdrawal.create({
    data: { vendorId: session.vendorId, amount: Number(amount), bankName, accountNo, status: 'PENDING' },
  })
  // Lock funds immediately
  await db.vendor.update({
    where: { id: session.vendorId },
    data: { balance: { decrement: Number(amount) }, pendingBalance: { increment: Number(amount) } },
  })

  // Notify admin
  const admins = await db.user.findMany({ where: { role: 'ADMIN' } })
  for (const a of admins) {
    await db.notification.create({
      data: { userId: a.id, type: 'PAYMENT', title: 'New withdrawal request', message: `${vendor.storeName} requested ${amount} ETB`, link: '/admin/financial' },
    })
  }

  return NextResponse.json(withdrawal)
}

export async function GET() {
  const session = await getSession()
  if (!session || session.role !== 'VENDOR' || !session.vendorId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const withdrawals = await db.withdrawal.findMany({
    where: { vendorId: session.vendorId },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(withdrawals)
}
