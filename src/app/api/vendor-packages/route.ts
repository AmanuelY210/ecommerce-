import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getSession } from '@/lib/session'

// Public: list all active packages
export async function GET() {
  const packages = await db.vendorPackage.findMany({
    where: { active: true },
    orderBy: { order: 'asc' },
  })
  return NextResponse.json(packages.map(p => ({
    ...p,
    features: JSON.parse(p.features),
  })))
}

// Admin: create a new package
export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session || session.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const body = await req.json()
  const slug = body.slug || body.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')
  const pkg = await db.vendorPackage.create({
    data: {
      name: body.name,
      slug,
      description: body.description || null,
      priceMonthly: Number(body.priceMonthly) || 0,
      priceYearly: Number(body.priceYearly) || 0,
      productLimit: Number(body.productLimit) || 50,
      storageLimitMb: Number(body.storageLimitMb) || 500,
      imageLimit: Number(body.imageLimit) || 5,
      videoLimit: Number(body.videoLimit) || 0,
      staffAccounts: Number(body.staffAccounts) || 1,
      warehouses: Number(body.warehouses) || 1,
      commissionRate: Number(body.commissionRate) || 10,
      order: Number(body.order) || 0,
      active: body.active !== false,
      popular: body.popular === true,
      features: JSON.stringify(body.features || []),
    },
  })
  return NextResponse.json(pkg)
}
