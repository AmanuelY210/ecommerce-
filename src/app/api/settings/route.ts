import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getSession } from '@/lib/session'

export async function GET() {
  const settings = await db.setting.findMany()
  const map: Record<string, string> = {}
  for (const s of settings) map[s.key] = s.value
  return NextResponse.json(map)
}

export async function PATCH(req: NextRequest) {
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
}
