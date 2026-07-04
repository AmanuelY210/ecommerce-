'use client'
import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Mail, Lock, User, Phone, Loader2, ShieldCheck, Store, CheckCircle2 } from 'lucide-react'
import { useT } from '@/hooks/use-t'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp'
import { StorefrontShell } from '@/components/layout/storefront-shell'
import { useAuth } from '@/lib/store'
import { toast } from 'sonner'

export default function RegisterPage() {
  const { t } = useT()
  const router = useRouter()
  const sp = useSearchParams()
  const setUser = useAuth((s) => s.setUser)
  const user = useAuth((s) => s.user)

  const [step, setStep] = useState<'form' | 'otp' | 'done'>('form')
  const [form, setForm] = useState({
    name: '', email: '', phone: '', password: '',
    role: (sp.get('role') as 'CUSTOMER' | 'VENDOR') || 'CUSTOMER',
  })
  const [otp, setOtp] = useState('')
  const [devOtp, setDevOtp] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => { if (user) router.replace('/') }, [user, router])

  const handleInitiate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name || !form.email || !form.password) {
      toast.error('Please fill all required fields')
      return
    }
    setLoading(true)
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ step: 'initiate', ...form }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error || 'Registration failed')
      } else {
        setDevOtp(data.devCode || '')
        setStep('otp')
        toast.success('OTP sent to your email/phone (demo mode)')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleVerify = async () => {
    if (otp.length !== 6) {
      toast.error('Please enter the 6-digit code')
      return
    }
    setLoading(true)
    try {
      // Verify OTP
      const verifyRes = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ step: 'verify', email: form.email, code: otp }),
      })
      if (!verifyRes.ok) {
        const d = await verifyRes.json()
        toast.error(d.error || 'Verification failed')
        setLoading(false)
        return
      }

      // Auto-login
      const loginRes = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: form.email, password: form.password }),
      })
      const userData = await loginRes.json()
      if (loginRes.ok) {
        setUser(userData)
        setStep('done')
        toast.success('Account created!')
        setTimeout(() => {
          router.push(userData.role === 'VENDOR' ? '/vendor' : '/')
        }, 1500)
      } else {
        router.push('/login')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <StorefrontShell>
      <div className="max-w-md mx-auto px-4 py-8 sm:py-12 w-full">
        {step === 'form' && (
          <Card className="p-6 sm:p-8">
            <h1 className="text-2xl font-bold mb-1">{t('auth.signup.title')}</h1>
            <p className="text-sm text-slate-500 mb-6">{t('auth.signup.subtitle')}</p>

            <form onSubmit={handleInitiate} className="space-y-4">
              <div>
                <Label className="text-sm font-medium">{t('auth.role')}</Label>
                <RadioGroup value={form.role} onValueChange={(v) => setForm(s => ({...s, role: v as any}))} className="grid grid-cols-2 gap-2 mt-2">
                  <label className={`border-2 rounded-lg p-3 cursor-pointer flex items-center gap-2 ${form.role === 'CUSTOMER' ? 'border-amz-orange bg-orange-50' : 'border-slate-200'}`}>
                    <RadioGroupItem value="CUSTOMER" />
                    <User className="w-4 h-4" />
                    <span className="text-sm font-medium">{t('auth.role.customer')}</span>
                  </label>
                  <label className={`border-2 rounded-lg p-3 cursor-pointer flex items-center gap-2 ${form.role === 'VENDOR' ? 'border-amz-orange bg-orange-50' : 'border-slate-200'}`}>
                    <RadioGroupItem value="VENDOR" />
                    <Store className="w-4 h-4" />
                    <span className="text-sm font-medium">{t('auth.role.vendor')}</span>
                  </label>
                </RadioGroup>
              </div>

              <div>
                <Label className="text-sm font-medium">{t('auth.name')}</Label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <Input value={form.name} onChange={(e) => setForm(s => ({...s, name: e.target.value}))} className="pl-9" required />
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium">{t('auth.email')}</Label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <Input type="email" value={form.email} onChange={(e) => setForm(s => ({...s, email: e.target.value}))} className="pl-9" required />
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium">{t('auth.phone')}</Label>
                <div className="relative">
                  <Phone className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <Input value={form.phone} onChange={(e) => setForm(s => ({...s, phone: e.target.value}))} placeholder="+2519..." className="pl-9" />
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium">{t('auth.password')}</Label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <Input type="password" value={form.password} onChange={(e) => setForm(s => ({...s, password: e.target.value}))} className="pl-9" required />
                </div>
              </div>

              <Button type="submit" className="w-full amz-bg-yellow hover:bg-[#f7ca00] text-black font-semibold h-11" disabled={loading}>
                {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                {t('auth.signup.cta')}
              </Button>
            </form>

            <div className="text-center text-sm text-slate-500 mt-4">
              {t('auth.haveAccount')} <Link href="/login" className="amz-link hover:underline font-semibold">{t('nav.signin')}</Link>
            </div>
          </Card>
        )}

        {step === 'otp' && (
          <Card className="p-6 sm:p-8">
            <div className="text-center mb-6">
              <div className="w-16 h-16 mx-auto bg-blue-100 rounded-full flex items-center justify-center mb-3">
                <ShieldCheck className="w-8 h-8 text-blue-600" />
              </div>
              <h1 className="text-xl font-bold mb-1">{t('auth.otp.title')}</h1>
              <p className="text-sm text-slate-500">{t('auth.otp.desc').replace('{target}', form.email)}</p>
            </div>
            {devOtp && (
              <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded text-center text-sm text-amber-800">
                <span className="font-semibold">Demo OTP:</span> <span className="font-mono font-bold text-lg">{devOtp}</span>
              </div>
            )}
            <div className="flex justify-center mb-4">
              <InputOTP maxLength={6} value={otp} onChange={(v) => setOtp(v)}>
                <InputOTPGroup>
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                  <InputOTPSlot index={3} />
                  <InputOTPSlot index={4} />
                  <InputOTPSlot index={5} />
                </InputOTPGroup>
              </InputOTP>
            </div>
            <Button className="w-full amz-bg-yellow hover:bg-[#f7ca00] text-black font-semibold h-11" onClick={handleVerify} disabled={loading}>
              {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              {t('auth.verify')}
            </Button>
            <button className="w-full text-center text-xs amz-link mt-3 hover:underline">{t('auth.otp.resend')}</button>
          </Card>
        )}

        {step === 'done' && (
          <Card className="p-8 text-center">
            <CheckCircle2 className="w-16 h-16 mx-auto text-emerald-500 mb-3" />
            <h1 className="text-xl font-bold mb-2">Account Created!</h1>
            <p className="text-sm text-slate-500">Redirecting you to your dashboard...</p>
          </Card>
        )}
      </div>
    </StorefrontShell>
  )
}
