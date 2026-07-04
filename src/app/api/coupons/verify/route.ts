import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(req: NextRequest) {
  const { code, subtotal } = await req.json()
  if (!code) return NextResponse.json({ error: 'Coupon code required' }, { status: 400 })

  const coupon = await db.coupon.findUnique({ where: { code: code.toUpperCase().trim() } })
  if (!coupon || !coupon.active) {
    return NextResponse.json({ error: 'Invalid coupon code' }, { status: 404 })
  }
  if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) {
    return NextResponse.json({ error: 'Coupon has expired' }, { status: 400 })
  }
  if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
    return NextResponse.json({ error: 'Coupon usage limit reached' }, { status: 400 })
  }
  if (subtotal < coupon.minOrder) {
    return NextResponse.json({ error: `Minimum order of ${coupon.minOrder} ETB required` }, { status: 400 })
  }

  const discount = coupon.type === 'PERCENT'
    ? Math.round(subtotal * (coupon.value / 100))
    : Math.min(coupon.value, subtotal)

  return NextResponse.json({
    code: coupon.code,
    type: coupon.type,
    value: coupon.value,
    discount,
  })
}
