import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { FALLBACK_CATEGORIES } from '@/lib/fallback-data'

export async function GET() {
  try {
    const cats = await db.category.findMany({
      where: { parentId: null, active: true },
      include: { children: true },
      orderBy: { order: 'asc' },
    })
    if (cats.length > 0) return NextResponse.json(cats)
    return NextResponse.json(FALLBACK_CATEGORIES)
  } catch {
    return NextResponse.json(FALLBACK_CATEGORIES)
  }
}
