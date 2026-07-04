'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState, type ComponentType } from 'react'
import { Home, LogOut, Bell, Menu, User, type LucideIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetHeader } from '@/components/ui/sheet'
import { useAuth } from '@/lib/store'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

interface SessionUserInfo {
  id: string
  email: string
  name: string
  role: string
  phone?: string | null
  avatar?: string | null
  vendorId?: string | null
}

interface NavItem { label: string; href: string; icon: LucideIcon; badge?: number }
interface DashboardShellProps {
  children: React.ReactNode
  nav: NavItem[]
  title: string
  role: string
  requiredRole: string | string[]
}

function SidebarContent({ current, nav, role, pathname, onNavigate }: {
  current: SessionUserInfo
  nav: NavItem[]
  role: string
  pathname: string
  onNavigate?: () => void
}) {
  return (
    <>
      <div className="p-4 border-b border-white/10">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-xl font-bold text-white">et<span className="amz-text-yellow">market</span></span>
          <span className="text-xs text-white/50 uppercase">{role}</span>
        </Link>
      </div>

      <div className="p-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <Avatar className="w-10 h-10">
            <AvatarImage src={current.avatar || undefined} />
            <AvatarFallback>{current.name.slice(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <div className="text-sm font-semibold text-white truncate">{current.name}</div>
            <div className="text-xs text-white/50 truncate">{current.email}</div>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-2 overflow-y-auto">
        <Link href="/" className="flex items-center gap-2 px-3 py-2 text-sm text-white/80 hover:bg-white/10 rounded mb-2" onClick={onNavigate}>
          <Home className="w-4 h-4" /> Back to Storefront
        </Link>
        {nav.map(item => {
          const active = pathname === item.href || (item.href !== `/${role}` && pathname.startsWith(item.href))
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-2 px-3 py-2 text-sm rounded mb-1 transition-colors ${active ? 'bg-amz-orange text-white font-semibold' : 'text-white/80 hover:bg-white/10'}`}
              onClick={onNavigate}
            >
              <item.icon className="w-4 h-4" />
              <span className="flex-1">{item.label}</span>
              {item.badge ? <Badge className="bg-red-500 text-white text-xs px-1.5 py-0">{item.badge}</Badge> : null}
            </Link>
          )
        })}
      </nav>
    </>
  )
}

export function DashboardShell({ children, nav, title, role, requiredRole }: DashboardShellProps) {
  const router = useRouter()
  const pathname = usePathname()
  const user = useAuth((s) => s.user)
  const setUser = useAuth((s) => s.setUser)
  const logout = useAuth((s) => s.logout)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [authState, setAuthState] = useState<'loading' | 'ok' | 'redirecting'>('loading')
  // Local copy of the session user (used when Zustand store hasn't been hydrated yet)
  const [sessionUser, setSessionUser] = useState<SessionUserInfo | null>(null)

  useEffect(() => {
    let cancelled = false
    const check = async () => {
      // Always verify with the server (cookie session)
      try {
        const res = await fetch('/api/auth/me')
        const data = await res.json()
        if (cancelled) return
        if (!data.user) {
          setAuthState('redirecting')
          router.replace('/login')
          return
        }
        const allowed = Array.isArray(requiredRole) ? requiredRole.includes(data.user.role) : data.user.role === requiredRole
        if (!allowed) {
          setAuthState('redirecting')
          router.replace('/')
          return
        }
        // Sync the fetched user into the Zustand store so the header and other
        // components have the correct data (handles page-refresh case where the
        // store is empty but the cookie session is still valid).
        setUser(data.user)
        setSessionUser(data.user)
        setAuthState('ok')
      } catch {
        if (!cancelled) {
          setAuthState('redirecting')
          router.replace('/login')
        }
      }
    }
    check()
    return () => { cancelled = true }
  }, [requiredRole, router, setUser])

  if (authState !== 'ok') {
    return <div className="min-h-screen flex items-center justify-center bg-slate-50"><div className="text-slate-400">Loading...</div></div>
  }

  // Prefer the Zustand user, fall back to the session user fetched from /api/auth/me
  const current = user || sessionUser
  if (!current) {
    // Should never happen because authState === 'ok' implies we have a user,
    // but guard against any race condition to avoid a null-deref crash.
    return <div className="min-h-screen flex items-center justify-center bg-slate-50"><div className="text-slate-400">Loading...</div></div>
  }

  return (
    <div className="min-h-screen flex bg-slate-50">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-64 amz-navy flex-col fixed inset-y-0 left-0 z-30">
        <SidebarContent current={current} nav={nav} role={role} pathname={pathname} />
        <div className="p-2 border-t border-white/10">
          <button
            onClick={() => { logout(); router.push('/') }}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-white/80 hover:bg-white/10 rounded"
          >
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>
      </aside>

      {/* Mobile sidebar */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="w-64 p-0 amz-navy border-0 flex flex-col">
          <SheetHeader className="sr-only"><SheetTitle>Menu</SheetTitle></SheetHeader>
          <SidebarContent current={current} nav={nav} role={role} pathname={pathname} onNavigate={() => setMobileOpen(false)} />
          <div className="p-2 border-t border-white/10">
            <button
              onClick={() => { logout(); router.push('/') }}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-white/80 hover:bg-white/10 rounded"
            >
              <LogOut className="w-4 h-4" /> Sign Out
            </button>
          </div>
        </SheetContent>
      </Sheet>

      {/* Main */}
      <div className="flex-1 lg:ml-64 flex flex-col min-w-0">
        <header className="h-14 amz-navy2 text-white flex items-center justify-between px-4 sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" className="lg:hidden text-white" onClick={() => setMobileOpen(true)}>
              <Menu className="w-5 h-5" />
            </Button>
            <h1 className="font-semibold">{title}</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" className="text-white relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
            </Button>
            <Button variant="ghost" size="sm" className="text-white" asChild>
              <Link href="/account"><User className="w-5 h-5" /></Link>
            </Button>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 max-w-full overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  )
}
