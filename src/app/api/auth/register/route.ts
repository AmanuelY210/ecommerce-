import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { hashPassword } from '@/lib/helpers'

// In-memory OTP store (resets on server restart — fine for demo)
const OTP_STORE: Map<string, { code: string; expires: number; data: any }> = new Map()

export async function POST(req: NextRequest) {
  const body = await req.json()

  // Step 1: initiate registration — generate OTP
  if (body.step === 'initiate') {
    const { email, password, name, phone, role } = body
    if (!email || !password || !name || !role) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }
    const existing = await db.user.findUnique({ where: { email: email.toLowerCase() } })
    if (existing) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 409 })
    }
    if (!['CUSTOMER', 'VENDOR'].includes(role)) {
      return NextResponse.json({ error: 'Invalid role for self-registration' }, { status: 400 })
    }
    const code = String(Math.floor(100000 + Math.random() * 900000))
    OTP_STORE.set(email.toLowerCase(), {
      code,
      expires: Date.now() + 5 * 60 * 1000,
      data: { email: email.toLowerCase(), password, name, phone, role },
    })
    console.log(`[OTP] Registration OTP for ${email}: ${code}`)
    return NextResponse.json({ message: 'OTP sent', devCode: code })
  }

  // Step 2: verify OTP and create user
  if (body.step === 'verify') {
    const { email, code } = body
    const entry = OTP_STORE.get(email.toLowerCase())
    if (!entry) return NextResponse.json({ error: 'No registration in progress' }, { status: 400 })
    if (Date.now() > entry.expires) {
      OTP_STORE.delete(email.toLowerCase())
      return NextResponse.json({ error: 'OTP expired' }, { status: 400 })
    }
    if (entry.code !== code) {
      return NextResponse.json({ error: 'Invalid OTP' }, { status: 400 })
    }

    const { password, name, phone, role } = entry.data
    const user = await db.user.create({
      data: { email: email.toLowerCase(), password: hashPassword(password), name, phone, role, status: 'ACTIVE' },
    })

    // If vendor, create a pending vendor record
    if (role === 'VENDOR') {
      const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') + '-' + user.id.slice(-4)
      await db.vendor.create({
        data: {
          userId: user.id,
          storeName: name + ' Store',
          slug,
          description: 'Welcome to my store on ETMarket.',
          businessType: 'INDIVIDUAL',
          status: 'PENDING',
        },
      })
    }

    OTP_STORE.delete(email.toLowerCase())
    return NextResponse.json({ id: user.id, email: user.email, name: user.name, role: user.role })
  }

  return NextResponse.json({ error: 'Invalid step' }, { status: 400 })
}
