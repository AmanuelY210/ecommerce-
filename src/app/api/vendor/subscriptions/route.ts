import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getSession } from '@/lib/session'

// Vendor: get their subscription status
export async function GET() {
  const session = await getSession()
  if (!session || session.role !== 'VENDOR' || !session.vendorId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const sub = await db.vendorSubscription.findUnique({
    where: { vendorId: session.vendorId },
    include: { package: true },
  })
  if (!sub) return NextResponse.json(null)

  // Count vendor's products for limit display
  const productCount = await db.product.count({ where: { vendorId: session.vendorId } })

  return NextResponse.json({
    ...sub,
    businessInfo: sub.businessInfo ? JSON.parse(sub.businessInfo) : null,
    bankInfo: sub.bankInfo ? JSON.parse(sub.bankInfo) : null,
    storeInfo: sub.storeInfo ? JSON.parse(sub.storeInfo) : null,
    documents: sub.documents ? JSON.parse(sub.documents) : null,
    package: { ...sub.package, features: JSON.parse(sub.package.features) },
    productCount,
    productLimit: sub.package.productLimit,
    atProductLimit: sub.package.productLimit !== -1 && productCount >= sub.package.productLimit,
  })
}

// Vendor: subscribe to a package (initiates the subscription process)
export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session || session.role !== 'VENDOR' || !session.vendorId) {
    return NextResponse.json({ error: 'Unauthorized — please sign in as a vendor' }, { status: 401 })
  }

  const body = await req.json()
  const { packageId, billingCycle, payment, businessInfo, bankInfo, storeInfo, documents } = body as {
    packageId: string
    billingCycle: 'MONTHLY' | 'YEARLY'
    payment: { provider: string; method: string; reference: string }
    businessInfo: any
    bankInfo: any
    storeInfo: any
    documents: any
  }

  if (!packageId) return NextResponse.json({ error: 'Package ID required' }, { status: 400 })

  const pkg = await db.vendorPackage.findUnique({ where: { id: packageId } })
  if (!pkg) return NextResponse.json({ error: 'Package not found' }, { status: 404 })

  const amount = billingCycle === 'YEARLY' ? pkg.priceYearly : pkg.priceMonthly

  // Check if vendor already has a subscription
  const existing = await db.vendorSubscription.findUnique({ where: { vendorId: session.vendorId } })
  if (existing && existing.status === 'ACTIVE') {
    return NextResponse.json({ error: 'You already have an active subscription. Please contact support to change packages.' }, { status: 400 })
  }

  const now = new Date()
  const expiresAt = new Date(now.getTime() + (billingCycle === 'YEARLY' ? 365 : 30) * 24 * 60 * 60 * 1000)

  const data: any = {
    vendorId: session.vendorId,
    packageId,
    status: 'PENDING_APPROVAL', // Payment verified, now waiting for admin review
    billingCycle,
    amountPaid: amount,
    paymentRef: payment.reference,
    paymentProvider: payment.provider,
    paymentMethod: payment.method,
    startedAt: now,
    expiresAt,
    businessInfo: JSON.stringify(businessInfo || {}),
    bankInfo: JSON.stringify(bankInfo || {}),
    storeInfo: JSON.stringify(storeInfo || {}),
    documents: JSON.stringify(documents || {}),
  }

  if (existing) {
    // Update existing (was PENDING_PAYMENT or REJECTED)
    const updated = await db.vendorSubscription.update({ where: { id: existing.id }, data })
    return NextResponse.json(updated)
  } else {
    const created = await db.vendorSubscription.create({ data })
    return NextResponse.json(created)
  }
}
