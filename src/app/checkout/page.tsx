'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Smartphone, CreditCard, Building2, Banknote, ShieldCheck, CheckCircle2, Loader2, MapPin, ArrowLeft, ArrowRight, Check } from 'lucide-react'
import { useT } from '@/hooks/use-t'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { StorefrontShell } from '@/components/layout/storefront-shell'
import { useCart, useAuth } from '@/lib/store'
import { ETB, ETHIOPIAN_BANKS, CHAPA_METHODS } from '@/lib/helpers'
import { toast } from 'sonner'
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp'

type Step = 'address' | 'payment' | 'verify' | 'success'
type PaymentProvider = 'chapa' | 'bank' | 'cod'

export default function CheckoutPage() {
  const { t } = useT()
  const router = useRouter()
  const lines = useCart((s) => s.lines)
  const couponCode = useCart((s) => s.couponCode)
  const couponDiscount = useCart((s) => s.couponDiscount)
  const clearCart = useCart((s) => s.clear)
  const user = useAuth((s) => s.user)

  const [step, setStep] = useState<Step>('address')
  const [address, setAddress] = useState({
    fullName: user?.name || '',
    phone: user?.phone || '',
    region: 'Addis Ababa',
    city: 'Addis Ababa',
    area: '',
    detail: '',
  })
  const [provider, setProvider] = useState<PaymentProvider>('chapa')
  const [chapaMethod, setChapaMethod] = useState('mobile')
  const [bank, setBank] = useState('cbe')
  const [otp, setOtp] = useState('')
  const [bankRef, setBankRef] = useState('')
  const [verifying, setVerifying] = useState(false)
  const [placedOrder, setPlacedOrder] = useState<any>(null)
  const [devOtp, setDevOtp] = useState('')

  useEffect(() => {
    // Redirect to cart if empty (unless we're showing success)
    if (lines.length === 0 && step !== 'success') {
      router.push('/cart')
    }
  }, [lines.length, step, router])

  const subtotal = lines.reduce((s, l) => s + l.price * l.qty, 0)
  const shipping = subtotal > 5000 ? 0 : 150
  const tax = Math.round(subtotal * 0.15)
  const total = subtotal + shipping + tax - couponDiscount

  const handleProceedToPayment = () => {
    if (!address.fullName || !address.phone || !address.area || !address.detail) {
      toast.error('Please fill all address fields')
      return
    }
    setStep('payment')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handlePay = async () => {
    setStep('verify')
    // Generate mock OTP for chapa mobile
    if (provider === 'chapa' && chapaMethod === 'mobile') {
      const code = String(Math.floor(100000 + Math.random() * 900000))
      setDevOtp(code)
      console.log(`[Mock OTP for Chapa mobile] ${code}`)
    }
  }

  const handleVerify = async () => {
    setVerifying(true)
    try {
      let reference = ''
      if (provider === 'chapa' && chapaMethod === 'mobile') {
        if (otp.length !== 6) {
          toast.error('Please enter the 6-digit OTP')
          setVerifying(false)
          return
        }
        reference = `CHAPA-${otp}`
      } else if (provider === 'chapa' && chapaMethod === 'card') {
        if (otp.length !== 6) {
          toast.error('Please enter the 6-digit card OTP')
          setVerifying(false)
          return
        }
        reference = `CARD-${otp}`
      } else if (provider === 'bank') {
        if (bankRef.length < 4) {
          toast.error('Please enter your bank transaction reference')
          setVerifying(false)
          return
        }
        reference = bankRef.toUpperCase()
      } else if (provider === 'cod') {
        reference = `COD-${Date.now()}`
      }

      // 1. Verify payment (mock Chapa/bank)
      const verifyRes = await fetch('/api/payment/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider, method: chapaMethod, bank: provider === 'bank' ? bank : undefined,
          reference, amount: total,
        }),
      })
      const verifyData = await verifyRes.json()
      if (!verifyRes.ok) {
        toast.error(verifyData.message || 'Payment verification failed')
        setStep('payment')
        setVerifying(false)
        return
      }

      // 2. Place the order
      const orderRes = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: lines.map(l => ({ productId: l.productId, name: l.name, price: l.price, image: l.image, qty: l.qty, vendorId: l.vendorId })),
          address,
          payment: {
            provider, method: provider === 'chapa' ? chapaMethod : provider === 'bank' ? 'transfer' : 'cod',
            bank: provider === 'bank' ? bank : undefined,
            reference: verifyData.reference,
            txnId: verifyData.txnId,
          },
          couponCode, couponDiscount, shippingFee: shipping,
        }),
      })
      const orderData = await orderRes.json()
      if (!orderRes.ok) {
        toast.error(orderData.error || 'Failed to place order')
        setStep('payment')
        setVerifying(false)
        return
      }

      setPlacedOrder(orderData.order)
      clearCart()
      setStep('success')
      toast.success('Payment successful! Order placed.')
    } catch (e: any) {
      toast.error(e.message || 'Payment failed')
      setStep('payment')
    } finally {
      setVerifying(false)
    }
  }

  // Success page
  if (step === 'success' && placedOrder) {
    return (
      <StorefrontShell>
        <div className="max-w-2xl mx-auto px-4 py-12">
          <Card className="p-8 text-center">
            <div className="w-20 h-20 mx-auto bg-emerald-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle2 className="w-12 h-12 text-emerald-600" />
            </div>
            <h1 className="text-2xl font-bold mb-2">{t('pay.success')}</h1>
            <p className="text-slate-600 mb-6">{t('pay.success.desc')}</p>

            <div className="bg-slate-50 rounded-lg p-4 text-left mb-6">
              <div className="flex justify-between mb-2"><span className="text-slate-500">Order Number</span><span className="font-bold">{placedOrder.orderNumber}</span></div>
              <div className="flex justify-between mb-2"><span className="text-slate-500">Total Paid</span><span className="font-bold text-red-600">{ETB(placedOrder.total)}</span></div>
              <div className="flex justify-between mb-2"><span className="text-slate-500">Payment</span><span className="font-medium capitalize">{placedOrder.paymentProvider} · {placedOrder.paymentMethod}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Payment Ref</span><span className="font-mono text-xs">{placedOrder.paymentRef}</span></div>
            </div>

            <div className="flex gap-3 justify-center">
              <Button asChild className="amz-bg-yellow hover:bg-[#f7ca00] text-black">
                <Link href={`/orders/${placedOrder.id}`}>Track Order</Link>
              </Button>
              <Button variant="outline" asChild><Link href="/products">Continue Shopping</Link></Button>
            </div>
          </Card>
        </div>
      </StorefrontShell>
    )
  }

  // Verify page (payment processing)
  if (step === 'verify') {
    const providerLabel = provider === 'chapa' ? 'Chapa' : provider === 'bank' ? ETHIOPIAN_BANKS.find(b => b.code === bank)?.name || 'Bank' : 'Cash on Delivery'
    return (
      <StorefrontShell>
        <div className="max-w-md mx-auto px-4 py-12">
          <Card className="p-6">
            <div className="text-center mb-6">
              <div className="w-16 h-16 mx-auto bg-blue-100 rounded-full flex items-center justify-center mb-3">
                {verifying ? <Loader2 className="w-8 h-8 text-blue-600 animate-spin" /> : <ShieldCheck className="w-8 h-8 text-blue-600" />}
              </div>
              <h1 className="text-xl font-bold mb-1">{t('pay.verify.title')}</h1>
              <p className="text-sm text-slate-500">{t('pay.verify.desc').replace('{provider}', providerLabel)}</p>
            </div>

            {!verifying && (
              <>
                {provider === 'chapa' && chapaMethod === 'mobile' && (
                  <div className="mb-4">
                    <Label className="text-sm font-medium mb-2 block">{t('pay.verify.otp')}</Label>
                    <p className="text-xs text-slate-500 mb-3">A 6-digit code was sent to your phone {address.phone}</p>
                    {devOtp && <div className="mb-3 p-2 bg-amber-50 border border-amber-200 rounded text-xs text-amber-800">Demo OTP: <span className="font-mono font-bold">{devOtp}</span></div>}
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
                )}
                {provider === 'chapa' && chapaMethod === 'card' && (
                  <div className="mb-4">
                    <Label className="text-sm font-medium mb-2 block">Card OTP</Label>
                    <p className="text-xs text-slate-500 mb-3">Enter the OTP sent to your registered phone</p>
                    {devOtp && <div className="mb-3 p-2 bg-amber-50 border border-amber-200 rounded text-xs text-amber-800">Demo OTP: <span className="font-mono font-bold">{devOtp}</span></div>}
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
                )}
                {provider === 'bank' && (
                  <div className="mb-4">
                    <Label className="text-sm font-medium mb-2 block">{t('pay.verify.bankRef')}</Label>
                    <p className="text-xs text-slate-500 mb-3">
                      Transfer {ETB(total)} to:<br />
                      <span className="font-semibold">{ETHIOPIAN_BANKS.find(b => b.code === bank)?.name}</span><br />
                      Account: <span className="font-mono">{ETHIOPIAN_BANKS.find(b => b.code === bank)?.account}</span><br />
                      Name: ETMarket PLC
                    </p>
                    <Input
                      placeholder="e.g. TRX12345678"
                      value={bankRef}
                      onChange={(e) => setBankRef(e.target.value)}
                      className="font-mono"
                    />
                  </div>
                )}
                {provider === 'cod' && (
                  <div className="mb-4 p-3 bg-blue-50 rounded text-sm text-blue-800">
                    Pay {ETB(total)} in cash when your order is delivered. Please have exact change ready.
                  </div>
                )}

                <Button className="w-full amz-bg-yellow hover:bg-[#f7ca00] text-black font-semibold h-12" onClick={handleVerify}>
                  Confirm & Pay {ETB(total)}
                </Button>
                <Button variant="ghost" className="w-full mt-2" onClick={() => setStep('payment')}>← Back to payment</Button>
              </>
            )}

            {verifying && (
              <div className="text-center py-4">
                <p className="text-sm text-slate-600 mb-4">{t('pay.processing')}</p>
                <p className="text-xs text-slate-400">Verifying with {providerLabel}...</p>
              </div>
            )}
          </Card>
        </div>
      </StorefrontShell>
    )
  }

  return (
    <StorefrontShell>
      <div className="max-w-[1500px] mx-auto px-2 sm:px-4 py-4 w-full">
        <div className="flex items-center gap-2 mb-4">
          <Button variant="ghost" size="sm" asChild><Link href="/cart"><ArrowLeft className="w-4 h-4 mr-1" /> Cart</Link></Button>
          <h1 className="text-2xl font-bold">{t('checkout.title')}</h1>
        </div>

        {/* Step indicator */}
        <div className="flex items-center justify-center mb-6 gap-2 text-sm">
          <div className={`flex items-center gap-2 ${step === 'address' ? 'text-amz-orange font-semibold' : 'text-slate-400'}`}>
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs ${step === 'address' ? 'bg-amz-orange text-white' : ['payment', 'verify', 'success'].includes(step) ? 'bg-emerald-500 text-white' : 'bg-slate-200'}`}>
              {step !== 'address' ? <Check className="w-4 h-4" /> : '1'}
            </div> Address
          </div>
          <div className="w-8 h-0.5 bg-slate-200" />
          <div className={`flex items-center gap-2 ${step === 'payment' ? 'text-amz-orange font-semibold' : 'text-slate-400'}`}>
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs ${step === 'payment' ? 'bg-amz-orange text-white' : step === 'success' ? 'bg-emerald-500 text-white' : 'bg-slate-200'}`}>
              {step === 'success' ? <Check className="w-4 h-4" /> : '2'}
            </div> Payment
          </div>
          <div className="w-8 h-0.5 bg-slate-200" />
          <div className={`flex items-center gap-2 ${step === 'success' ? 'text-emerald-600 font-semibold' : 'text-slate-400'}`}>
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs ${step === 'success' ? 'bg-emerald-500 text-white' : 'bg-slate-200'}`}>3</div> Done
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Main */}
          <div className="lg:col-span-8">
            {step === 'address' && (
              <Card className="p-6">
                <h2 className="font-bold text-lg mb-4 flex items-center gap-2"><MapPin className="w-5 h-5 text-amz-orange" /> {t('checkout.address')}</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <Label className="text-sm">Full Name *</Label>
                    <Input value={address.fullName} onChange={(e) => setAddress(s => ({...s, fullName: e.target.value}))} />
                  </div>
                  <div>
                    <Label className="text-sm">Phone Number *</Label>
                    <Input value={address.phone} onChange={(e) => setAddress(s => ({...s, phone: e.target.value}))} placeholder="+2519..." />
                  </div>
                  <div>
                    <Label className="text-sm">Region *</Label>
                    <select value={address.region} onChange={(e) => setAddress(s => ({...s, region: e.target.value}))} className="w-full h-9 px-3 border border-slate-300 rounded-md text-sm">
                      <option>Addis Ababa</option><option>Oromia</option><option>Amhara</option><option>Tigray</option><option>SNNPR</option><option>Sidama</option><option>Dire Dawa</option>
                    </select>
                  </div>
                  <div>
                    <Label className="text-sm">City *</Label>
                    <Input value={address.city} onChange={(e) => setAddress(s => ({...s, city: e.target.value}))} />
                  </div>
                  <div>
                    <Label className="text-sm">Area / Sub-City *</Label>
                    <Input value={address.area} onChange={(e) => setAddress(s => ({...s, area: e.target.value}))} placeholder="e.g. Bole, Kazanchis" />
                  </div>
                  <div>
                    <Label className="text-sm">House / Building No.</Label>
                    <Input value={address.detail} onChange={(e) => setAddress(s => ({...s, detail: e.target.value}))} placeholder="House 123, Floor 2" />
                  </div>
                </div>
                <div className="mt-3">
                  <Label className="text-sm">Delivery Notes (optional)</Label>
                  <Textarea placeholder="e.g. Please call before delivery" rows={2} />
                </div>
                <Button className="mt-4 amz-bg-yellow hover:bg-[#f7ca00] text-black font-semibold h-12" onClick={handleProceedToPayment}>
                  Continue to Payment <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Card>
            )}

            {step === 'payment' && (
              <Card className="p-6">
                <h2 className="font-bold text-lg mb-4">{t('pay.select')}</h2>
                <RadioGroup value={provider} onValueChange={(v) => setProvider(v as PaymentProvider)}>
                  {/* Chapa */}
                  <label className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${provider === 'chapa' ? 'border-amz-orange bg-orange-50' : 'border-slate-200 hover:border-slate-300'}`}>
                    <div className="flex items-start gap-3">
                      <RadioGroupItem value="chapa" className="mt-1" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <div className="w-10 h-10 rounded bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-xs">CHAPA</div>
                          <div>
                            <div className="font-semibold">{t('pay.chapa.title')}</div>
                            <div className="text-xs text-slate-500">{t('pay.chapa.desc')}</div>
                          </div>
                        </div>
                        {provider === 'chapa' && (
                          <div className="mt-3 grid grid-cols-3 gap-2">
                            {CHAPA_METHODS.map(m => (
                              <button key={m.code} onClick={() => setChapaMethod(m.code)} className={`text-xs p-2 border rounded text-left ${chapaMethod === m.code ? 'border-amz-orange bg-amber-50' : 'border-slate-200'}`}>
                                <div className="font-semibold">{m.name}</div>
                                <div className="text-slate-500 text-[10px]">{m.desc}</div>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </label>

                  {/* Ethiopian Banks */}
                  <label className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${provider === 'bank' ? 'border-amz-orange bg-orange-50' : 'border-slate-200 hover:border-slate-300'}`}>
                    <div className="flex items-start gap-3">
                      <RadioGroupItem value="bank" className="mt-1" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <div className="w-10 h-10 rounded bg-gradient-to-br from-emerald-600 to-teal-700 flex items-center justify-center text-white">
                            <Building2 className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="font-semibold">{t('pay.bank.title')}</div>
                            <div className="text-xs text-slate-500">{t('pay.bank.desc')}</div>
                          </div>
                        </div>
                        {provider === 'bank' && (
                          <div className="mt-3 max-h-64 overflow-y-auto scroll-pretty pr-1">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              {ETHIOPIAN_BANKS.map(b => (
                                <button key={b.code} onClick={() => setBank(b.code)} className={`text-xs p-2 border rounded flex items-center gap-2 text-left ${bank === b.code ? 'border-amz-orange bg-amber-50' : 'border-slate-200 hover:border-slate-300'}`}>
                                  <span className="text-xl">{b.logo}</span>
                                  <div className="min-w-0">
                                    <div className="font-semibold truncate">{b.short}</div>
                                    <div className="text-slate-500 truncate">{b.account}</div>
                                  </div>
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </label>

                  {/* COD */}
                  <label className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${provider === 'cod' ? 'border-amz-orange bg-orange-50' : 'border-slate-200 hover:border-slate-300'}`}>
                    <div className="flex items-start gap-3">
                      <RadioGroupItem value="cod" className="mt-1" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <div className="w-10 h-10 rounded bg-slate-700 flex items-center justify-center text-white">
                            <Banknote className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="font-semibold">{t('pay.cod.title')}</div>
                            <div className="text-xs text-slate-500">{t('pay.cod.desc')}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </label>
                </RadioGroup>

                <div className="flex gap-2 mt-6">
                  <Button variant="outline" onClick={() => setStep('address')}>← Back</Button>
                  <Button className="flex-1 amz-bg-yellow hover:bg-[#f7ca00] text-black font-semibold h-12" onClick={handlePay}>
                    {provider === 'cod' ? `Place Order · ${ETB(total)}` : `Pay ${ETB(total)} →`}
                  </Button>
                </div>
              </Card>
            )}
          </div>

          {/* Summary */}
          <div className="lg:col-span-4">
            <Card className="p-4 sticky top-[120px]">
              <h2 className="font-bold mb-3">{t('checkout.orderSummary')}</h2>
              <div className="space-y-2 max-h-60 overflow-y-auto scroll-pretty mb-3">
                {lines.map(l => (
                  <div key={l.productId} className="flex gap-2 text-sm">
                    <div className="w-12 h-12 bg-slate-50 rounded overflow-hidden shrink-0">
                      <img src={l.image} alt="" className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="line-clamp-1 text-xs">{l.name}</div>
                      <div className="text-xs text-slate-500">Qty: {l.qty}</div>
                    </div>
                    <div className="text-xs font-semibold">{ETB(l.price * l.qty)}</div>
                  </div>
                ))}
              </div>
              <div className="space-y-2 text-sm border-t pt-3">
                <div className="flex justify-between"><span className="text-slate-600">{t('checkout.subtotal')}</span><span>{ETB(subtotal)}</span></div>
                <div className="flex justify-between"><span className="text-slate-600">{t('checkout.shipping')}</span><span>{shipping === 0 ? <span className="text-emerald-600">{t('checkout.free')}</span> : ETB(shipping)}</span></div>
                <div className="flex justify-between"><span className="text-slate-600">{t('checkout.tax')}</span><span>{ETB(tax)}</span></div>
                {couponDiscount > 0 && <div className="flex justify-between text-emerald-600"><span>{t('checkout.discount')}</span><span>-{ETB(couponDiscount)}</span></div>}
                <div className="flex justify-between border-t pt-2 font-bold"><span>{t('checkout.total')}</span><span className="text-red-600">{ETB(total)}</span></div>
              </div>
              <div className="mt-3 flex items-center gap-2 text-xs text-slate-500"><ShieldCheck className="w-4 h-4 text-emerald-600" /> Secure SSL encrypted payment</div>
            </Card>
          </div>
        </div>
      </div>
    </StorefrontShell>
  )
}
