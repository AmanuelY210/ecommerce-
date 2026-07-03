import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  const brands = await db.brand.findMany({ where: { active: true }, orderBy: { name: 'asc' } })
  return NextResponse.json(brands)
}
