import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getSession } from '@/lib/session'

// Admin: list all subscriptions
export async function GET(req: NextRequest) {
  const session = await getSession()
  if (!session || session.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const { searchParams } = new URL(req.url)
  const status = searchParams.get('status')

  const subs = await db.vendorSubscription.findMany({
    where: status ? { status } : undefined,
    include: { vendor: { include: { user: true } }, package: true },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json(subs.map(s => ({
    ...s,
    businessInfo: s.businessInfo ? JSON.parse(s.businessInfo) : null,
    bankInfo: s.bankInfo ? JSON.parse(s.bankInfo) : null,
    storeInfo: s.storeInfo ? JSON.parse(s.storeInfo) : null,
    documents: s.documents ? JSON.parse(s.documents) : null,
    package: { ...s.package, features: JSON.parse(s.package.features) },
    vendor: s.vendor ? {
      id: s.vendor.id,
      storeName: s.vendor.storeName,
      email: s.vendor.user?.email,
      name: s.vendor.user?.name,
    } : null,
  })))
}

// Admin: approve / reject / suspend / renew a subscription
export async function PATCH(req: NextRequest) {
  const session = await getSession()
  if (!session || session.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const { id, action, reviewNote } = await req.json()

  const sub = await db.vendorSubscription.findUnique({
    where: { id },
    include: { vendor: true, package: true },
  })
  if (!sub) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  let status = sub.status
  if (action === 'approve') status = 'ACTIVE'
  else if (action === 'reject') status = 'CANCELLED'
  else if (action === 'suspend') status = 'SUSPENDED'
  else if (action === 'reactivate') status = 'ACTIVE'
  else if (action === 'extend') {
    // Extend by 30 days
    const now = new Date()
    const baseDate = sub.expiresAt && new Date(sub.expiresAt) > now ? new Date(sub.expiresAt) : now
    const newExpiry = new Date(baseDate.getTime() + 30 * 24 * 60 * 60 * 1000)
    await db.vendorSubscription.update({
      where: { id },
      data: { expiresAt: newExpiry, status: 'ACTIVE' },
    })
    return NextResponse.json({ ok: true, expiresAt: newExpiry })
  }

  const updated = await db.vendorSubscription.update({
    where: { id },
    data: {
      status,
      reviewedBy: session.id,
      reviewedAt: new Date(),
      reviewNote: reviewNote || null,
    },
  })

  // When approving, also approve the vendor record
  if (action === 'approve' && sub.vendor) {
    await db.vendor.update({
      where: { id: sub.vendorId },
      data: { status: 'APPROVED', verified: true, commissionRate: sub.package.commissionRate },
    })
    await db.notification.create({
      data: {
        userId: sub.vendor.userId,
        type: 'SYSTEM',
        title: 'Vendor application approved!',
        message: `Your ${sub.package.name} subscription is now active. You can start listing products.`,
        link: '/vendor',
      },
    })
  } else if (action === 'reject' && sub.vendor) {
    await db.vendor.update({
      where: { id: sub.vendorId },
      data: { status: 'REJECTED' },
    })
    await db.notification.create({
      data: {
        userId: sub.vendor.userId,
        type: 'SYSTEM',
        title: 'Vendor application needs revision',
        message: reviewNote || 'Please review your application and resubmit.',
        link: '/vendor/register',
      },
    })
  }

  return NextResponse.json(updated)
}
