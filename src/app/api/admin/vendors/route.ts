import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getSession } from '@/lib/session'

export async function GET(req: NextRequest) {
  const session = await getSession()
  if (!session || !['ADMIN', 'MODERATOR'].includes(session.role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const { searchParams } = new URL(req.url)
  const withSubscription = searchParams.get('withSubscription') === '1'

  const vendors = await db.vendor.findMany({
    include: {
      user: true,
      subscription: withSubscription ? { include: { package: true } } : false,
    },
    orderBy: { createdAt: 'desc' },
  }) as any[]

  // If subscription requested, parse the JSON fields
  if (withSubscription) {
    return NextResponse.json(vendors.map(v => ({
      ...v,
      subscription: v.subscription ? {
        ...v.subscription,
        businessInfo: v.subscription.businessInfo ? JSON.parse(v.subscription.businessInfo) : null,
        bankInfo: v.subscription.bankInfo ? JSON.parse(v.subscription.bankInfo) : null,
        storeInfo: v.subscription.storeInfo ? JSON.parse(v.subscription.storeInfo) : null,
        documents: v.subscription.documents ? JSON.parse(v.subscription.documents) : null,
        package: v.subscription.package ? { ...v.subscription.package, features: JSON.parse(v.subscription.package.features) } : null,
      } : null,
    })))
  }

  return NextResponse.json(vendors)
}

export async function PATCH(req: NextRequest) {
  const session = await getSession()
  if (!session || !['ADMIN', 'MODERATOR'].includes(session.role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const { id, action, commissionRate, reviewNote } = await req.json()

  const vendor = await db.vendor.findUnique({ where: { id } })
  if (!vendor) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  let data: any = {}
  if (action === 'approve') { data.status = 'APPROVED'; data.verified = true }
  else if (action === 'reject') { data.status = 'REJECTED' }
  else if (action === 'suspend') { data.status = 'SUSPENDED'; data.verified = false }
  else if (action === 'reinstate') { data.status = 'APPROVED'; data.verified = true }
  else if (action === 'setCommission') { data.commissionRate = commissionRate }

  const updated = await db.vendor.update({ where: { id }, data })

  // If vendor has a subscription, sync its status too
  if (['approve', 'reject', 'suspend', 'reinstate'].includes(action)) {
    const subStatus = action === 'approve' || action === 'reinstate' ? 'ACTIVE' : action === 'suspend' ? 'SUSPENDED' : 'CANCELLED'
    await db.vendorSubscription.updateMany({
      where: { vendorId: id },
      data: {
        status: subStatus,
        reviewedBy: session.id,
        reviewedAt: new Date(),
        reviewNote: reviewNote || null,
      },
    })
  }

  // Log moderation
  await db.moderationLog.create({
    data: { type: 'VENDOR', targetId: id, action: action.toUpperCase(), moderatorId: session.id, reason: reviewNote || `Status changed to ${data.status || 'updated'}` }
  })

  // Notify vendor
  await db.notification.create({
    data: {
      userId: vendor.userId,
      type: 'SYSTEM',
      title: `Store ${action}`,
      message: `Your store "${vendor.storeName}" has been ${action}${action === 'setCommission' ? ` to ${commissionRate}%` : ''}.${reviewNote ? ` Note: ${reviewNote}` : ''}`,
      link: '/vendor',
    },
  })

  return NextResponse.json(updated)
}
