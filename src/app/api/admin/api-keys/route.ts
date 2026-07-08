import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getSession } from '@/lib/session'

export async function GET() {
  try {
    const keys = await db.apiKey.findMany({ orderBy: { createdAt: 'desc' } })
    return NextResponse.json(keys)
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession()
    if (!session || session.role !== 'ADMIN') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const body = await req.json()
    if (!body.name || !body.provider) return NextResponse.json({ error: 'Name and provider required' }, { status: 400 })
    const key = await db.apiKey.create({
      data: {
        name: body.name,
        provider: body.provider,
        key: body.key || '',
        secret: body.secret || null,
        webhookUrl: body.webhookUrl || null,
        active: body.active !== false,
      },
    })
    return NextResponse.json(key)
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
