// Server-side session helpers (cookie-based simple session)
import { cookies } from 'next/headers'
import { db } from '@/lib/db'

export interface SessionUser {
  id: string
  email: string
  name: string
  role: string
  phone?: string | null
  avatar?: string | null
  vendorId?: string | null
}

const SESSION_COOKIE = 'etm-session'

export async function getSession(): Promise<SessionUser | null> {
  const store = await cookies()
  const raw = store.get(SESSION_COOKIE)?.value
  if (!raw) return null
  try {
    const parsed = JSON.parse(raw) as SessionUser
    // Re-validate against DB (cheap)
    const u = await db.user.findUnique({ where: { id: parsed.id }, include: { vendor: true } })
    if (!u || u.status !== 'ACTIVE') return null
    return {
      id: u.id,
      email: u.email,
      name: u.name,
      role: u.role,
      phone: u.phone,
      avatar: u.avatar,
      vendorId: u.vendor?.id || null,
    }
  } catch {
    return null
  }
}

export async function setSession(user: SessionUser) {
  const store = await cookies()
  store.set(SESSION_COOKIE, JSON.stringify(user), {
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7,
    path: '/',
  })
}

export async function clearSession() {
  const store = await cookies()
  store.delete(SESSION_COOKIE)
}

export async function requireSession(): Promise<SessionUser> {
  const s = await getSession()
  if (!s) throw new Error('UNAUTHORIZED')
  return s
}

export async function requireRole(...roles: string[]): Promise<SessionUser> {
  const s = await requireSession()
  if (!roles.includes(s.role)) throw new Error('FORBIDDEN')
  return s
}
