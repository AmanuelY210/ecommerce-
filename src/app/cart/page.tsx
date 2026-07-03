'use client'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Trash2, Minus, Plus, ShoppingBag, Tag, X, ArrowRight } from 'lucide-react'
import { useT } from '@/hooks/use-t'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { StorefrontShell } from '@/components/layout/storefront-shell'
import { useCart } from '@/lib/store'
import { ETB } from '@/lib/helpers'
import { useState } from 'react'
import { toast } from 'sonner'

export default function CartPage() {
  const { t } = useT()
  const router = useRouter()
  const lines = useCart((s) => s.lines)
  const updateQty = useCart((s) => s.updateQty)
  const remove = useCart((s) => s.remove)
  const couponCode = useCart((s) => s.couponCode)
  const couponDiscount = useCart((s) => s.couponDiscount)
  const applyCoupon = useCart((s) => s.applyCoupon)
  const removeCoupon = useCart((s) => s.removeCoupon)

  const [couponInput, setCouponInput] = useState('')
  const [applying, setApplying] = useState(false)

  const subtotal = lines.reduce((s, l) => s + l.price * l.qty, 0)
  const shipping = subtotal > 5000 || subtotal === 0 ? 0 : 150
  const tax = Math.round(subtotal * 0.15)
  const total = subtotal + shipping + tax - couponDiscount

  const handleApplyCoupon = async () => {
    if (!couponInput.trim()) return
    setApplying(true)
    try {
      const res = await fetch('/api/coupons/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: couponInput, subtotal }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error || 'Invalid coupon')
      } else {
        applyCoupon(data.code, data.discount)
        toast.success(`Coupon applied: -${ETB(data.discount)}`)
        setCouponInput('')
      }
    } finally {
      setApplying(false)
    }
  }

  if (lines.length === 0) {
    return (
      <StorefrontShell>
        <div className="max-w-[1500px] mx-auto px-4 py-12">
          <Card className="p-12 text-center">
            <ShoppingBag className="w-16 h-16 mx-auto text-slate-300 mb-4" />
            <h2 className="text-2xl font-bold mb-2">{t('cart.empty')}</h2>
            <p className="text-slate-500 mb-6">Browse our catalog and find great deals from Ethiopian vendors.</p>
            <Button asChild className="amz-bg-yellow hover:bg-[#f7ca00] text-black">
              <Link href="/products">{t('cart.empty.cta')} <ArrowRight className="w-4 h-4 ml-2" /></Link>
            </Button>
          </Card>
        </div>
      </StorefrontShell>
    )
  }

  return (
    <StorefrontShell>
      <div className="max-w-[1500px] mx-auto px-2 sm:px-4 py-4 w-full">
        <h1 className="text-2xl font-bold mb-4">{t('cart.title')}</h1>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Items */}
          <div className="lg:col-span-8 space-y-3">
            {lines.map(l => (
              <Card key={l.productId} className="p-4">
                <div className="flex gap-3">
                  <Link href={`/products/${l.productId}`} className="w-20 h-20 sm:w-24 sm:h-24 bg-slate-50 rounded overflow-hidden shrink-0">
                    <img src={l.image} alt={l.name} className="w-full h-full object-cover" />
                  </Link>
                  <div className="flex-1 min-w-0">
                    <Link href={`/products/${l.productId}`} className="font-medium text-sm sm:text-base line-clamp-2 hover:amz-link">{l.name}</Link>
                    {l.vendorName && <div className="text-xs text-slate-500 mt-0.5">Sold by {l.vendorName}</div>}
                    <div className="text-sm text-emerald-600 mt-1">In Stock</div>
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center border border-slate-300 rounded">
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => updateQty(l.productId, l.qty - 1)}><Minus className="w-3 h-3" /></Button>
                        <span className="w-10 text-center text-sm font-semibold">{l.qty}</span>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => updateQty(l.productId, l.qty + 1)}><Plus className="w-3 h-3" /></Button>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-sm sm:text-base">{ETB(l.price * l.qty)}</span>
                        <Button variant="ghost" size="sm" className="h-8 text-red-500 hover:text-red-700 hover:bg-red-50" onClick={() => { remove(l.productId); toast.info('Item removed') }}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
            <Button variant="outline" asChild>
              <Link href="/products">← Continue Shopping</Link>
            </Button>
          </div>

          {/* Summary */}
          <div className="lg:col-span-4">
            <Card className="p-4 sticky top-[120px]">
              <h2 className="font-bold text-lg mb-3">{t('checkout.orderSummary')}</h2>

              {/* Coupon */}
              <div className="mb-4">
                {couponCode ? (
                  <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 rounded p-2 text-sm">
                    <span className="flex items-center gap-1"><Tag className="w-4 h-4 text-emerald-600" /> {couponCode}</span>
                    <button onClick={() => { removeCoupon(); toast.info('Coupon removed') }} className="text-red-500 hover:text-red-700">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <Input placeholder={t('cart.coupon')} value={couponInput} onChange={(e) => setCouponInput(e.target.value)} className="h-9 text-sm" />
                    <Button variant="outline" size="sm" onClick={handleApplyCoupon} disabled={applying}>{t('cart.apply')}</Button>
                  </div>
                )}
                <p className="text-xs text-slate-400 mt-1">Try: WELCOME10 · ADDIS500</p>
              </div>

              <div className="space-y-2 text-sm border-t pt-3">
                <div className="flex justify-between">
                  <span className="text-slate-600">{t('checkout.subtotal')} ({lines.length} {lines.length === 1 ? t('cart.item') : t('cart.items')})</span>
                  <span className="font-medium">{ETB(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">{t('checkout.shipping')}</span>
                  <span className="font-medium">{shipping === 0 ? <span className="text-emerald-600">{t('checkout.free')}</span> : ETB(shipping)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">{t('checkout.tax')}</span>
                  <span className="font-medium">{ETB(tax)}</span>
                </div>
                {couponDiscount > 0 && (
                  <div className="flex justify-between text-emerald-600">
                    <span>{t('checkout.discount')}</span>
                    <span className="font-medium">-{ETB(couponDiscount)}</span>
                  </div>
                )}
                <div className="flex justify-between border-t pt-2 mt-2 text-base font-bold">
                  <span>{t('checkout.total')}</span>
                  <span className="text-red-600">{ETB(total)}</span>
                </div>
              </div>

              <Button className="w-full mt-4 amz-bg-yellow hover:bg-[#f7ca00] text-black font-semibold h-12" onClick={() => router.push('/checkout')}>
                {t('cart.proceedCheckout')} →
              </Button>
              <p className="text-xs text-slate-400 text-center mt-2">Secure checkout · Chapa + 19 banks</p>
            </Card>
          </div>
        </div>
      </div>
    </StorefrontShell>
  )
}
