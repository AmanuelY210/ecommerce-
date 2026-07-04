import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  const cats = await db.category.findMany({
    where: { parentId: null, active: true },
    include: { children: true },
    orderBy: { order: 'asc' },
  })
  return NextResponse.json(cats)
}
