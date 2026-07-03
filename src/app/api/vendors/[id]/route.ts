import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const vendor = await db.vendor.findUnique({
    where: { id },
    include: { user: true },
  })
  if (!vendor) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const products = await db.product.findMany({
    where: { vendorId: vendor.id, status: 'APPROVED' },
    take: 24,
    orderBy: { sold: 'desc' },
  })

  return NextResponse.json({
    ...vendor,
    products: products.map(p => ({ ...p, images: JSON.parse(p.images) })),
  })
}
