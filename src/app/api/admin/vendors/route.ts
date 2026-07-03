import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getSession } from '@/lib/session'

export async function GET() {
  const session = await getSession()
  if (!session || !['ADMIN', 'MODERATOR'].includes(session.role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const vendors = await db.vendor.findMany({
    include: { user: true },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(vendors)
}

export async function PATCH(req: NextRequest) {
  const session = await getSession()
  if (!session || !['ADMIN', 'MODERATOR'].includes(session.role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const { id, action, commissionRate } = await req.json()

  const vendor = await db.vendor.findUnique({ where: { id } })
  if (!vendor) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  let data: any = {}
  if (action === 'approve') { data.status = 'APPROVED'; data.verified = true }
  else if (action === 'reject') { data.status = 'REJECTED' }
  else if (action === 'suspend') { data.status = 'SUSPENDED' }
  else if (action === 'reinstate') { data.status = 'APPROVED' }
  else if (action === 'setCommission') { data.commissionRate = commissionRate }

  const updated = await db.vendor.update({ where: { id }, data })

  // Log moderation
  await db.moderationLog.create({
    data: { type: 'VENDOR', targetId: id, action: action.toUpperCase(), moderatorId: session.id, reason: `Status changed to ${data.status || 'updated'}` }
  })

  // Notify vendor
  await db.notification.create({
    data: {
      userId: vendor.userId,
      type: 'SYSTEM',
      title: `Store ${action}`,
      message: `Your store "${vendor.storeName}" has been ${action}${action === 'setCommission' ? ` to ${commissionRate}%` : ''}.`,
      link: '/vendor',
    },
  })

  return NextResponse.json(updated)
}
