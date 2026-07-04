'use client'
import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Check, ChevronRight, ChevronLeft, Shield, Zap, Building2, FileText, CreditCard, Loader2, Upload, Rocket, Crown, Sparkles, CheckCircle2 } from 'lucide-react'
import { useT } from '@/hooks/use-t'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { StorefrontShell } from '@/components/layout/storefront-shell'
import { FileUpload } from '@/components/shared/file-upload'
import { useAuth } from '@/lib/store'
import { ETB, ETHIOPIAN_BANKS, CHAPA_METHODS } from '@/lib/helpers'
import { ETHIOPIA_REGIONS, getCitiesForRegion, getSubCitiesForCity } from '@/lib/ethiopia-geo'
import { toast } from 'sonner'

interface Pkg {
  id: string; name: string; slug: string; description: string | null;
  priceMonthly: number; priceYearly: number; productLimit: number; commissionRate: number; popular: boolean; features: string[];
}

const STEPS = ['package', 'payment', 'business', 'documents', 'review'] as const
type Step = typeof STEPS[number]

function VendorRegisterInner() {
  const { t } = useT()
  const router = useRouter()
  const sp = useSearchParams()
  const user = useAuth((s) => s.user)

  const [step, setStep] = useState<Step>('package')
  const [packages, setPackages] = useState<Pkg[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  const preselectedSlug = sp.get('package') || 'professional'

  // Form state
  const [selectedPkg, setSelectedPkg] = useState<Pkg | null>(null)
  const [billingCycle, setBillingCycle] = useState<'MONTHLY' | 'YEARLY'>('MONTHLY')
  const [payment, setPayment] = useState({
    provider: 'chapa' as 'chapa' | 'bank',
    method: 'mobile',
    bank: 'cbe',
    otp: '',
    bankRef: '',
  })
  const [paymentVerified, setPaymentVerified] = useState(false)
  const [business, setBusiness] = useState({
    businessName: '', businessType: 'COMPANY', licenseNumber: '', tinNumber: '', vatNumber: '',
    region: 'Addis Ababa', city: 'Addis Ababa', subCity: '', woreda: '', postalCode: '',
  })
  const [bank, setBank] = useState({
    bankName: ETHIOPIAN_BANKS[0].name, accountHolder: '', accountNumber: '', chapaAccount: '',
  })
  const [store, setStore] = useState({
    storeName: user?.name ? `${user.name}'s Store` : '', storeDescription: '', storeAddress: '', businessHours: 'Mon-Sat 9:00-19:00',
  })
  const [documents, setDocuments] = useState({
    nationalId: '', businessLicense: '', tinCertificate: '', storePhoto: '', selfieVerification: '',
  })

  useEffect(() => {
    fetch('/api/vendor-packages').then(r => r.json()).then(d => {
      const list = Array.isArray(d) ? d : []
      setPackages(list)
      const pre = list.find(p => p.slug === preselectedSlug) || list[0]
      if (pre) setSelectedPkg(pre)
      setLoading(false)
    })
  }, [preselectedSlug])

  const verifyPayment = async () => {
    // Mock Chapa/bank payment verification (same as checkout flow)
    if (payment.provider === 'chapa' && payment.method === 'mobile') {
      if (payment.otp.length !== 6) { toast.error('Enter the 6-digit OTP'); return }
    } else if (payment.provider === 'bank') {
      if (payment.bankRef.length < 4) { toast.error('Enter your bank transaction reference'); return }
    }
    setSubmitting(true)
    try {
      const reference = payment.provider === 'chapa' ? `CHAPA-${payment.otp}` : payment.bankRef.toUpperCase()
      const amount = billingCycle === 'YEARLY' ? selectedPkg!.priceYearly : selectedPkg!.priceMonthly
      const res = await fetch('/api/payment/verify', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider: payment.provider, method: payment.method,
          bank: payment.provider === 'bank' ? payment.bank : undefined,
          reference, amount,
        }),
      })
      const data = await res.json()
      if (!res.ok) { toast.error(data.message || 'Payment verification failed'); setSubmitting(false); return }
      setPaymentVerified(true)
      toast.success('Payment verified! Continue to business info.')
      setStep('business')
    } finally { setSubmitting(false) }
  }

  const submit = async () => {
    if (!selectedPkg) { toast.error('Select a package'); return }
    // Validate
    if (!business.businessName || !business.licenseNumber || !business.region || !business.subCity) {
      toast.error('Please fill all required business fields'); setStep('business'); return
    }
    if (!bank.accountHolder || !bank.accountNumber) { toast.error('Please fill bank details'); setStep('business'); return }
    if (!store.storeName) { toast.error('Store name required'); setStep('business'); return }
    if (!documents.nationalId || !documents.businessLicense || !documents.tinCertificate) {
      toast.error('Please upload all required documents'); setStep('documents'); return
    }

    setSubmitting(true)
    try {
      const reference = payment.provider === 'chapa' ? `CHAPA-${payment.otp}` : payment.bankRef.toUpperCase()
      const res = await fetch('/api/vendor/subscriptions', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          packageId: selectedPkg.id, billingCycle,
          payment: { provider: payment.provider, method: payment.method, reference },
          businessInfo: business, bankInfo: bank, storeInfo: store, documents,
        }),
      })
      const data = await res.json()
      if (!res.ok) { toast.error(data.error || 'Submission failed'); setSubmitting(false); return }
      toast.success('Application submitted! Admin will review within 24-48 hours.')
      router.push('/vendor')
    } finally { setSubmitting(false) }
  }

  if (loading) {
    return <StorefrontShell><div className="max-w-3xl mx-auto p-8"><div className="animate-pulse">Loading...</div></div></StorefrontShell>
  }

  if (!user) {
    // Prompt to sign in first
    return (
      <StorefrontShell>
        <div className="max-w-md mx-auto px-4 py-12">
          <Card className="p-8 text-center">
            <Shield className="w-16 h-16 mx-auto text-slate-300 mb-4" />
            <h1 className="text-xl font-bold mb-2">Sign in to become a vendor</h1>
            <p className="text-slate-500 text-sm mb-6">You need a customer account first. Then you can upgrade to a vendor subscription.</p>
            <div className="flex flex-col gap-2">
              <Button asChild className="amz-bg-yellow hover:bg-[#f7ca00] text-black"><Link href={`/login?redirect=/vendor/pricing`}>Sign In</Link></Button>
              <Button asChild variant="outline"><Link href={`/register?role=VENDOR&package=${preselectedSlug}`}>Create Account</Link></Button>
            </div>
          </Card>
        </div>
      </StorefrontShell>
    )
  }

  const stepIdx = STEPS.indexOf(step)
  const amount = selectedPkg ? (billingCycle === 'YEARLY' ? selectedPkg.priceYearly : selectedPkg.priceMonthly) : 0

  return (
    <StorefrontShell>
      <div className="max-w-4xl mx-auto px-4 py-8 w-full">
        <h1 className="text-2xl font-bold mb-1">Become a Vendor</h1>
        <p className="text-slate-500 text-sm mb-6">Complete the steps below to activate your store on ETMarket.</p>

        {/* Stepper */}
        <div className="flex items-center justify-between mb-8 gap-2">
          {STEPS.map((s, i) => {
            const done = i < stepIdx
            const active = i === stepIdx
            return (
              <div key={s} className="flex items-center gap-2 flex-1">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold shrink-0 ${active ? 'bg-amz-orange text-white' : done ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-500'}`}>
                  {done ? <Check className="w-4 h-4" /> : i + 1}
                </div>
                <span className={`text-xs sm:text-sm capitalize ${active ? 'font-semibold text-slate-900' : done ? 'text-emerald-600' : 'text-slate-400'}`}>{s}</span>
                {i < STEPS.length - 1 && <div className={`h-0.5 flex-1 ${done ? 'bg-emerald-500' : 'bg-slate-200'}`} />}
              </div>
            )
          })}
        </div>

        {/* Step 1: Package selection */}
        {step === 'package' && (
          <Card className="p-6">
            <h2 className="text-lg font-bold mb-1">Choose Your Subscription Package</h2>
            <p className="text-sm text-slate-500 mb-4">Pick the plan that fits your business. You can upgrade later.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
              {packages.map(p => (
                <button
                  key={p.id}
                  onClick={() => setSelectedPkg(p)}
                  className={`text-left border-2 rounded-lg p-4 transition-all ${selectedPkg?.id === p.id ? 'border-amz-orange bg-orange-50' : 'border-slate-200 hover:border-slate-300'}`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="font-bold">{p.name}</div>
                    {p.popular && <Badge className="bg-amz-orange text-white text-xs">Popular</Badge>}
                  </div>
                  <div className="flex items-baseline gap-1 mb-2">
                    <span className="text-xl font-bold">{p.priceMonthly === 0 ? 'Custom' : ETB(p.priceMonthly)}</span>
                    {p.priceMonthly > 0 && <span className="text-xs text-slate-500">/month</span>}
                  </div>
                  <div className="text-xs text-slate-500 mb-2">
                    {p.productLimit === -1 ? 'Unlimited' : p.productLimit} products · {p.commissionRate}% commission
                  </div>
                  <div className="text-xs text-slate-600 line-clamp-2">{p.description}</div>
                </button>
              ))}
            </div>
            {/* Billing cycle */}
            <div className="flex items-center gap-3 mb-4">
              <Label>Billing Cycle:</Label>
              <RadioGroup value={billingCycle} onValueChange={(v) => setBillingCycle(v as any)} className="flex gap-3">
                <label className={`flex items-center gap-1 cursor-pointer px-3 py-1 border rounded text-sm ${billingCycle === 'MONTHLY' ? 'border-amz-orange bg-orange-50' : 'border-slate-200'}`}>
                  <RadioGroupItem value="MONTHLY" /> Monthly
                </label>
                <label className={`flex items-center gap-1 cursor-pointer px-3 py-1 border rounded text-sm ${billingCycle === 'YEARLY' ? 'border-amz-orange bg-orange-50' : 'border-slate-200'}`}>
                  <RadioGroupItem value="YEARLY" /> Yearly <span className="text-emerald-600 text-xs">(save 2 months)</span>
                </label>
              </RadioGroup>
            </div>
            {selectedPkg && (
              <div className="bg-slate-50 rounded p-3 text-sm mb-4">
                <div className="flex justify-between"><span>Package</span><span className="font-semibold">{selectedPkg.name}</span></div>
                <div className="flex justify-between"><span>Billing</span><span className="font-semibold">{billingCycle === 'YEARLY' ? 'Yearly' : 'Monthly'}</span></div>
                <div className="flex justify-between border-t mt-2 pt-2"><span className="font-semibold">Total Due Today</span><span className="font-bold text-amz-orange">{ETB(amount)}</span></div>
              </div>
            )}
            <div className="flex justify-end">
              <Button className="amz-bg-yellow hover:bg-[#f7ca00] text-black" disabled={!selectedPkg} onClick={() => setStep('payment')}>
                Continue to Payment <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </Card>
        )}

        {/* Step 2: Payment */}
        {step === 'payment' && (
          <Card className="p-6">
            <h2 className="text-lg font-bold mb-1">Payment</h2>
            <p className="text-sm text-slate-500 mb-4">Pay {ETB(amount)} for {selectedPkg?.name} ({billingCycle.toLowerCase()})</p>
            {!paymentVerified ? (
              <>
                <RadioGroup value={payment.provider} onValueChange={(v) => setPayment(s => ({...s, provider: v as any}))} className="space-y-2 mb-4">
                  <label className={`border-2 rounded-lg p-3 cursor-pointer flex items-start gap-3 ${payment.provider === 'chapa' ? 'border-amz-orange bg-orange-50' : 'border-slate-200'}`}>
                    <RadioGroupItem value="chapa" className="mt-1" />
                    <div>
                      <div className="font-semibold flex items-center gap-2">
                        <div className="w-8 h-8 rounded bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-[10px]">CHAPA</div>
                        Chapa
                      </div>
                      <div className="text-xs text-slate-500">Mobile money, card, or bank transfer via Chapa</div>
                      {payment.provider === 'chapa' && (
                        <div className="grid grid-cols-3 gap-2 mt-2">
                          {CHAPA_METHODS.map(m => (
                            <button key={m.code} onClick={() => setPayment(s => ({...s, method: m.code}))} className={`text-xs p-2 border rounded text-left ${payment.method === m.code ? 'border-amz-orange bg-amber-50' : 'border-slate-200'}`}>
                              <div className="font-semibold">{m.name}</div>
                              <div className="text-slate-500 text-[10px]">{m.desc}</div>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </label>
                  <label className={`border-2 rounded-lg p-3 cursor-pointer flex items-start gap-3 ${payment.provider === 'bank' ? 'border-amz-orange bg-orange-50' : 'border-slate-200'}`}>
                    <RadioGroupItem value="bank" className="mt-1" />
                    <div>
                      <div className="font-semibold">Ethiopian Bank Transfer</div>
                      <div className="text-xs text-slate-500">Pay directly to our bank account</div>
                      {payment.provider === 'bank' && (
                        <Select value={payment.bank} onValueChange={(v) => setPayment(s => ({...s, bank: v}))}>
                          <SelectTrigger className="h-8 mt-2 text-xs"><SelectValue /></SelectTrigger>
                          <SelectContent className="max-h-60">
                            {ETHIOPIAN_BANKS.map(b => <SelectItem key={b.code} value={b.code}>{b.name}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      )}
                    </div>
                  </label>
                </RadioGroup>
                {payment.provider === 'chapa' && payment.method === 'mobile' && (
                  <div className="mb-4">
                    <Label>OTP (demo: any 6 digits)</Label>
                    <Input maxLength={6} value={payment.otp} onChange={(e) => setPayment(s => ({...s, otp: e.target.value}))} placeholder="123456" />
                  </div>
                )}
                {payment.provider === 'bank' && (
                  <div className="mb-4">
                    <Label>Bank Transaction Reference</Label>
                    <Input value={payment.bankRef} onChange={(e) => setPayment(s => ({...s, bankRef: e.target.value}))} placeholder="TRX12345678" />
                    <p className="text-xs text-slate-500 mt-1">Transfer {ETB(amount)} to: {ETHIOPIAN_BANKS.find(b => b.code === payment.bank)?.name}, Account {ETHIOPIAN_BANKS.find(b => b.code === payment.bank)?.account}, Name: ETMarket PLC</p>
                  </div>
                )}
                <div className="flex justify-between">
                  <Button variant="outline" onClick={() => setStep('package')}><ChevronLeft className="w-4 h-4 mr-1" /> Back</Button>
                  <Button className="amz-bg-yellow hover:bg-[#f7ca00] text-black" onClick={verifyPayment} disabled={submitting}>
                    {submitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <CreditCard className="w-4 h-4 mr-2" />}Verify & Pay {ETB(amount)}
                  </Button>
                </div>
              </>
            ) : (
              <div className="text-center py-8">
                <CheckCircle2 className="w-16 h-16 mx-auto text-emerald-500 mb-3" />
                <h3 className="text-xl font-bold mb-1">Payment Successful!</h3>
                <p className="text-slate-500 mb-6">Your payment of {ETB(amount)} has been verified. Continue to set up your business profile.</p>
                <Button className="amz-bg-yellow hover:bg-[#f7ca00] text-black" onClick={() => setStep('business')}>Continue <ChevronRight className="w-4 h-4" /></Button>
              </div>
            )}
          </Card>
        )}

        {/* Step 3: Business + Bank + Store info */}
        {step === 'business' && (
          <Card className="p-6">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2"><Building2 className="w-5 h-5" /> Business Information</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
              <div>
                <Label>Business Name *</Label>
                <Input value={business.businessName} onChange={(e) => setBusiness(s => ({...s, businessName: e.target.value}))} />
              </div>
              <div>
                <Label>Business Type *</Label>
                <Select value={business.businessType} onValueChange={(v) => setBusiness(s => ({...s, businessType: v}))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="INDIVIDUAL">Individual / Sole Proprietor</SelectItem>
                    <SelectItem value="SME">Small & Medium Enterprise</SelectItem>
                    <SelectItem value="COMPANY">Registered Company</SelectItem>
                    <SelectItem value="IMPORTER">Import / Export</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Business License Number *</Label>
                <Input value={business.licenseNumber} onChange={(e) => setBusiness(s => ({...s, licenseNumber: e.target.value}))} placeholder="AA/14/0000000" />
              </div>
              <div>
                <Label>TIN Number</Label>
                <Input value={business.tinNumber} onChange={(e) => setBusiness(s => ({...s, tinNumber: e.target.value}))} placeholder="0000000000" />
              </div>
              <div>
                <Label>VAT Number</Label>
                <Input value={business.vatNumber} onChange={(e) => setBusiness(s => ({...s, vatNumber: e.target.value}))} />
              </div>
              <div>
                <Label>Postal Code</Label>
                <Input value={business.postalCode} onChange={(e) => setBusiness(s => ({...s, postalCode: e.target.value}))} />
              </div>
              <div>
                <Label>Region *</Label>
                <Select value={business.region} onValueChange={(v) => {
                  const cities = getCitiesForRegion(v)
                  setBusiness(s => ({...s, region: v, city: cities[0]?.name || '', subCity: getSubCitiesForCity(v, cities[0]?.name || '')[0] || ''}))
                }}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{ETHIOPIA_REGIONS.map(r => <SelectItem key={r.code} value={r.name}>{r.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <Label>City *</Label>
                <Select value={business.city} onValueChange={(v) => setBusiness(s => ({...s, city: v, subCity: getSubCitiesForCity(business.region, v)[0] || ''}))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{getCitiesForRegion(business.region).map(c => <SelectItem key={c.name} value={c.name}>{c.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <Label>Sub-City / Woreda *</Label>
                <Select value={business.subCity} onValueChange={(v) => setBusiness(s => ({...s, subCity: v}))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{getSubCitiesForCity(business.region, business.city).map(sc => <SelectItem key={sc} value={sc}>{sc}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <Label>Woreda</Label>
                <Input value={business.woreda} onChange={(e) => setBusiness(s => ({...s, woreda: e.target.value}))} placeholder="Woreda 03" />
              </div>
            </div>

            <h3 className="font-bold mt-6 mb-3 flex items-center gap-2"><CreditCard className="w-4 h-4" /> Bank Information</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
              <div>
                <Label>Bank Name *</Label>
                <Select value={bank.bankName} onValueChange={(v) => setBank(s => ({...s, bankName: v}))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent className="max-h-60">{ETHIOPIAN_BANKS.map(b => <SelectItem key={b.code} value={b.name}>{b.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <Label>Account Holder Name *</Label>
                <Input value={bank.accountHolder} onChange={(e) => setBank(s => ({...s, accountHolder: e.target.value}))} />
              </div>
              <div>
                <Label>Account Number *</Label>
                <Input value={bank.accountNumber} onChange={(e) => setBank(s => ({...s, accountNumber: e.target.value}))} placeholder="1234-5678-9012" />
              </div>
              <div>
                <Label>Chapa Account (optional)</Label>
                <Input value={bank.chapaAccount} onChange={(e) => setBank(s => ({...s, chapaAccount: e.target.value}))} placeholder="you@chapa.et" />
              </div>
            </div>

            <h3 className="font-bold mt-6 mb-3 flex items-center gap-2"><Store2 /> Store Information</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <Label>Store Name *</Label>
                <Input value={store.storeName} onChange={(e) => setStore(s => ({...s, storeName: e.target.value}))} />
              </div>
              <div>
                <Label>Business Hours</Label>
                <Input value={store.businessHours} onChange={(e) => setStore(s => ({...s, businessHours: e.target.value}))} />
              </div>
              <div className="col-span-2">
                <Label>Store Description</Label>
                <Textarea rows={2} value={store.storeDescription} onChange={(e) => setStore(s => ({...s, storeDescription: e.target.value}))} placeholder="Briefly describe your store..." />
              </div>
              <div className="col-span-2">
                <Label>Store Address</Label>
                <Input value={store.storeAddress} onChange={(e) => setStore(s => ({...s, storeAddress: e.target.value}))} placeholder="Bole Road, Addis Ababa" />
              </div>
            </div>

            <div className="flex justify-between mt-6">
              <Button variant="outline" onClick={() => setStep('payment')}><ChevronLeft className="w-4 h-4 mr-1" /> Back</Button>
              <Button className="amz-bg-yellow hover:bg-[#f7ca00] text-black" onClick={() => setStep('documents')}>Continue to Documents <ChevronRight className="w-4 h-4" /></Button>
            </div>
          </Card>
        )}

        {/* Step 4: Documents */}
        {step === 'documents' && (
          <Card className="p-6">
            <h2 className="text-lg font-bold mb-1 flex items-center gap-2"><FileText className="w-5 h-5" /> Upload Documents</h2>
            <p className="text-sm text-slate-500 mb-4">Upload clear photos or scans. Files must be JPG, PNG, or PDF, max 5MB each.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { key: 'nationalId', label: 'National ID / Passport', desc: 'Front of Ethiopian ID or passport', required: true },
                { key: 'businessLicense', label: 'Business License', desc: 'Valid trade license from Ethiopian government', required: true },
                { key: 'tinCertificate', label: 'TIN Certificate', desc: 'Tax identification certificate', required: true },
                { key: 'storePhoto', label: 'Store Photo', desc: 'Photo of your physical store or warehouse', required: false },
                { key: 'selfieVerification', label: 'Selfie Verification', desc: 'Selfie holding your ID for verification (optional)', required: false },
              ].map(d => (
                <FileUpload
                  key={d.key}
                  label={d.label}
                  description={d.desc}
                  required={d.required}
                  value={(documents as any)[d.key] || ''}
                  onChange={(url) => setDocuments(s => ({ ...s, [d.key]: url }))}
                  accept=".jpg,.jpeg,.png,.pdf"
                  maxSize={5 * 1024 * 1024}
                />
              ))}
            </div>
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-800">
              <strong>📌 Tips for clear documents:</strong>
              <ul className="list-disc list-inside mt-1 space-y-0.5">
                <li>Use good lighting and avoid shadows or glare</li>
                <li>Make sure all text is readable and edges are visible</li>
                <li>For IDs, photograph the front side clearly</li>
                <li>PDF scans are preferred for multi-page documents</li>
              </ul>
            </div>
            <div className="flex justify-between mt-6">
              <Button variant="outline" onClick={() => setStep('business')}><ChevronLeft className="w-4 h-4 mr-1" /> Back</Button>
              <Button className="amz-bg-yellow hover:bg-[#f7ca00] text-black" onClick={() => {
                if (!documents.nationalId || !documents.businessLicense || !documents.tinCertificate) {
                  toast.error('Please upload all required documents (National ID, Business License, TIN Certificate)')
                  return
                }
                setStep('review')
              }}>Review Application <ChevronRight className="w-4 h-4" /></Button>
            </div>
          </Card>
        )}

        {/* Step 5: Review */}
        {step === 'review' && (
          <Card className="p-6">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2"><Shield className="w-5 h-5" /> Review & Submit</h2>
            <div className="space-y-4">
              <div className="border rounded p-3">
                <div className="text-xs text-slate-500 uppercase mb-1">Package</div>
                <div className="font-semibold">{selectedPkg?.name} · {billingCycle} · {ETB(amount)}</div>
                <div className="text-xs text-slate-500">{selectedPkg?.productLimit === -1 ? 'Unlimited' : selectedPkg?.productLimit} products · {selectedPkg?.commissionRate}% commission</div>
              </div>
              <div className="border rounded p-3">
                <div className="text-xs text-slate-500 uppercase mb-1">Business</div>
                <div className="font-semibold">{business.businessName} ({business.businessType})</div>
                <div className="text-xs text-slate-500">License: {business.licenseNumber} · TIN: {business.tinNumber || '—'}</div>
                <div className="text-xs text-slate-500">{business.subCity}, {business.city}, {business.region}</div>
              </div>
              <div className="border rounded p-3">
                <div className="text-xs text-slate-500 uppercase mb-1">Bank</div>
                <div className="text-sm">{bank.bankName}</div>
                <div className="text-xs text-slate-500">{bank.accountHolder} · {bank.accountNumber}</div>
              </div>
              <div className="border rounded p-3">
                <div className="text-xs text-slate-500 uppercase mb-1">Store</div>
                <div className="font-semibold">{store.storeName}</div>
                <div className="text-xs text-slate-500 line-clamp-2">{store.storeDescription}</div>
              </div>
              <div className="border rounded p-3">
                <div className="text-xs text-slate-500 uppercase mb-1">Documents</div>
                <div className="text-xs space-y-0.5">
                  <div>National ID: {documents.nationalId ? '✓' : '✗'}</div>
                  <div>Business License: {documents.businessLicense ? '✓' : '✗'}</div>
                  <div>TIN Certificate: {documents.tinCertificate ? '✓' : '✗'}</div>
                  <div>Store Photo: {documents.storePhoto ? '✓' : '—'}</div>
                  <div>Selfie: {documents.selfieVerification ? '✓' : '—'}</div>
                </div>
              </div>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded p-3 text-xs text-blue-800 mt-4">
              After submission, our admin team will review your application within 24-48 hours. You'll receive a notification once your vendor dashboard is activated.
            </div>
            <div className="flex justify-between mt-6">
              <Button variant="outline" onClick={() => setStep('documents')}><ChevronLeft className="w-4 h-4 mr-1" /> Back</Button>
              <Button className="amz-bg-yellow hover:bg-[#f7ca00] text-black" onClick={submit} disabled={submitting}>
                {submitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Check className="w-4 h-4 mr-2" />}Submit Application
              </Button>
            </div>
          </Card>
        )}
      </div>
    </StorefrontShell>
  )
}

function Store2() {
  return <span className="text-base">🏪</span>
}

export default function VendorRegisterPage() {
  return <Suspense fallback={<div className="min-h-screen" />}><VendorRegisterInner /></Suspense>
}
