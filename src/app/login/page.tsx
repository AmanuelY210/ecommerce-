'use client'
import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Mail, Lock, Eye, EyeOff, Loader2, ShieldCheck, Store, User, Headphones } from 'lucide-react'
import { useT } from '@/hooks/use-t'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { StorefrontShell } from '@/components/layout/storefront-shell'
import { useAuth } from '@/lib/store'
import { toast } from 'sonner'

const DEMO_ACCOUNTS = [
  { role: 'Customer', email: 'customer@etmarket.et', icon: User, color: 'bg-blue-500' },
  { role: 'Vendor', email: 'vendor@etmarket.et', icon: Store, color: 'bg-emerald-500' },
  { role: 'Admin', email: 'admin@etmarket.et', icon: ShieldCheck, color: 'bg-purple-500' },
  { role: 'Support', email: 'support@etmarket.et', icon: Headphones, color: 'bg-amber-500' },
]

export default function LoginPage() {
  const { t } = useT()
  const router = useRouter()
  const sp = useSearchParams()
  const redirect = sp.get('redirect') || '/'
  const setUser = useAuth((s) => s.setUser)
  const user = useAuth((s) => s.user)

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [demoLoading, setDemoLoading] = useState<string | null>(null)

  useEffect(() => {
    if (user) router.replace(redirect)
  }, [user, router, redirect])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) return
    setLoading(true)
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error || 'Login failed')
      } else {
        setUser(data)
        toast.success(`Welcome back, ${data.name}!`)
        // Redirect by role
        const home = data.role === 'VENDOR' ? '/vendor' : data.role === 'ADMIN' ? '/admin' : data.role === 'MODERATOR' ? '/moderator' : data.role === 'SUPPORT' ? '/support' : redirect
        router.push(home)
      }
    } finally {
      setLoading(false)
    }
  }

  const handleDemoLogin = async (demoEmail: string, role: string) => {
    setDemoLoading(role)
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: demoEmail, password: 'demo1234' }),
      })
      const data = await res.json()
      if (res.ok) {
        setUser(data)
        toast.success(`Signed in as ${role}`)
        const home = data.role === 'VENDOR' ? '/vendor' : data.role === 'ADMIN' ? '/admin' : data.role === 'MODERATOR' ? '/moderator' : data.role === 'SUPPORT' ? '/support' : '/'
        router.push(home)
      } else {
        toast.error(data.error || 'Demo login failed')
      }
    } finally {
      setDemoLoading(null)
    }
  }

  return (
    <StorefrontShell>
      <div className="max-w-md mx-auto px-4 py-8 sm:py-12 w-full">
        <Card className="p-6 sm:p-8">
          <h1 className="text-2xl font-bold mb-1">{t('auth.signin.title')}</h1>
          <p className="text-sm text-slate-500 mb-6">{t('auth.signin.subtitle')}</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label className="text-sm font-medium">{t('auth.email')}</Label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className="pl-9" required />
              </div>
            </div>
            <div>
              <Label className="text-sm font-medium">{t('auth.password')}</Label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <Input type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="pl-9 pr-9" required />
                <button type="button" onClick={() => setShowPassword(s => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div className="flex items-center justify-between text-xs">
              <label className="flex items-center gap-1"><input type="checkbox" /> Remember me</label>
              <Link href="#" className="amz-link hover:underline">{t('auth.forgot')}</Link>
            </div>
            <Button type="submit" className="w-full amz-bg-yellow hover:bg-[#f7ca00] text-black font-semibold h-11" disabled={loading}>
              {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              {t('auth.signin.cta')}
            </Button>
          </form>

          <div className="text-center text-sm text-slate-500 mt-4">
            {t('auth.noAccount')} <Link href="/register" className="amz-link hover:underline font-semibold">{t('auth.signup.title')}</Link>
          </div>
        </Card>

        {/* Demo accounts */}
        <Card className="p-5 mt-4 bg-amber-50 border-amber-200">
          <div className="mb-3">
            <h3 className="font-bold text-sm flex items-center gap-2">⚡ {t('auth.demo')}</h3>
            <p className="text-xs text-slate-500">{t('auth.demo.desc')} · password: <code className="bg-white px-1 rounded">demo1234</code></p>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {DEMO_ACCOUNTS.map(d => (
              <Button key={d.role} variant="outline" size="sm" onClick={() => handleDemoLogin(d.email, d.role)} disabled={!!demoLoading} className="justify-start h-auto py-2">
                {demoLoading === d.role ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <div className={`w-6 h-6 rounded-full ${d.color} flex items-center justify-center mr-2`}><d.icon className="w-3.5 h-3.5 text-white" /></div>}
                <span className="text-xs">{d.role}</span>
              </Button>
            ))}
          </div>
        </Card>
      </div>
    </StorefrontShell>
  )
}
