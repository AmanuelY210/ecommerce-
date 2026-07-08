import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getSession } from '@/lib/session'
import { FALLBACK_SETTINGS } from '@/lib/fallback-data'

export async function GET() {
  try {
    const settings = await db.setting.findMany()
    const map: Record<string, string> = {}
    for (const s of settings) map[s.key] = s.value
    
    // If DB is empty or has very few settings, merge with fallback defaults
    if (Object.keys(map).length < 5) {
      return NextResponse.json({ ...FALLBACK_SETTINGS, ...map })
    }
    return NextResponse.json(map)
  } catch (error) {
    // DB not available (Vercel without database) — return fallback settings
    return NextResponse.json(FALLBACK_SETTINGS)
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getSession()
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const body = await req.json()
    for (const [key, value] of Object.entries(body)) {
      await db.setting.upsert({ where: { key }, update: { value: String(value) }, create: { key, value: String(value) } })
    }
    await db.auditLog.create({ data: { userId: session.id, action: 'SETTINGS_UPDATED', target: 'settings', meta: JSON.stringify(body) } })
    return NextResponse.json({ ok: true })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to save settings — database not available' }, { status: 500 })
  }
}
