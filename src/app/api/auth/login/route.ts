import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyPassword } from '@/lib/helpers'
import { setSession } from '@/lib/session'

export async function POST(req: NextRequest) {
  const { email, password } = await req.json()
  if (!email || !password) {
    return NextResponse.json({ error: 'Email and password required' }, { status: 400 })
  }
  const user = await db.user.findUnique({ where: { email: email.toLowerCase() }, include: { vendor: true } })
  if (!user || !verifyPassword(password, user.password)) {
    return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 })
  }
  if (user.status !== 'ACTIVE') {
    return NextResponse.json({ error: `Account is ${user.status.toLowerCase()}. Contact support.` }, { status: 403 })
  }
  await db.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } })
  await setSession({
    id: user.id, email: user.email, name: user.name, role: user.role,
    phone: user.phone, avatar: user.avatar, vendorId: user.vendor?.id || null,
  })
  return NextResponse.json({
    id: user.id, email: user.email, name: user.name, role: user.role,
    phone: user.phone, avatar: user.avatar, vendorId: user.vendor?.id || null,
  })
}
