import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { FALLBACK_BANNERS } from '@/lib/fallback-data'

export async function GET() {
  try {
    const banners = await db.banner.findMany({
      where: { active: true },
      orderBy: { order: 'asc' },
    })
    if (banners.length > 0) return NextResponse.json(banners)
    return NextResponse.json(FALLBACK_BANNERS)
  } catch {
    return NextResponse.json(FALLBACK_BANNERS)
  }
}
