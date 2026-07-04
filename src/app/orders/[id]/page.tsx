'use client'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle2, Package, Truck, Home, MapPin, Phone, CreditCard, ShieldCheck, Loader2, X, RotateCcw } from 'lucide-react'
import { useT } from '@/hooks/use-t'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { StorefrontShell } from '@/components/layout/storefront-shell'
import { useAuth } from '@/lib/store'
import { ETB, statusColor, ETHIOPIAN_BANKS } from '@/lib/helpers'
import { toast } from 'sonner'

const STEPS = [
  { key: 'PENDING', label: 'Order Placed', icon: Package },
  { key: 'CONFIRMED', label: 'Confirmed', icon: CheckCircle2 },
  { key: 'PACKED', label: 'Packed', icon: Package },
  { key: 'SHIPPED', label: 'Shipped', icon: Truck },
  { key: 'DELIVERED', label: 'Delivered', icon: Home },
]

export default function OrderDetailPage() {
  const { t } = useT()
  const router = useRouter()
  const params = useParams<{ id: string }>()
  const user = useAuth((s) => s.user)
  const [order, setOrder] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)

  useEffect(() => {
    if (!user) {
      router.push('/login?redirect=/orders')
      return
    }
    if (!params?.id) return
    fetch(`/api/orders/${params.id}`).then(r => r.json()).then(d => {
      setOrder(d)
      setLoading(false)
    })
  }, [user, router, params?.id])

  const handleAction = async (action: string, extra?: any) => {
    setActionLoading(true)
    try {
      const res = await fetch(`/api/orders/${order.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, ...extra }),
      })
      const data = await res.json()
      if (res.ok) {
        toast.success(`Order ${action}d`)
        setOrder(data.order || data)
      } else {
        toast.error(data.error || 'Action failed')
      }
    } finally {
      setActionLoading(false)
    }
  }

  if (!user) return null
  if (loading) return <StorefrontShell><div className="max-w-4xl mx-auto p-4"><Skeleton className="h-96 rounded-lg" /></div></StorefrontShell>
  if (!order) return <StorefrontShell><div className="max-w-4xl mx-auto p-12 text-center"><p>Order not found.</p><Button asChild><Link href="/orders">Back to orders</Link></Button></div></StorefrontShell>

  const currentStep = STEPS.findIndex(s => s.key === order.status)
  const cancelled = order.status === 'CANCELLED'
  const returned = order.status === 'RETURNED'
  const shippingAddr = order.shippingAddress

  return (
    <StorefrontShell>
      <div className="max-w-4xl mx-auto px-4 py-6 w-full">
        <div className="text-xs text-slate-500 mb-3 flex items-center gap-1">
          <Link href="/orders" className="hover:underline">Orders</Link>
          <span>/</span>
          <span className="text-slate-700">{order.orderNumber}</span>
        </div>

        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <div>
            <h1 className="text-2xl font-bold">Order {order.orderNumber}</h1>
            <p className="text-sm text-slate-500">Placed on {new Date(order.createdAt).toLocaleString()}</p>
          </div>
          <div className="flex gap-2">
            <Badge variant="outline" className={statusColor(order.status)}>{t(`order.status.${order.status}`)}</Badge>
            <Badge variant="outline" className={statusColor(order.paymentStatus)}>{t(`order.payment.${order.paymentStatus}`)}</Badge>
          </div>
        </div>

        {/* Tracking */}
        {!cancelled && !returned && (
          <Card className="p-6 mb-4">
            <h2 className="font-bold mb-4">{t('order.tracking.title')}</h2>
            <div className="relative">
              <div className="flex justify-between">
                {STEPS.map((s, i) => {
                  const done = i <= currentStep
                  const Icon = s.icon
                  return (
                    <div key={s.key} className="flex flex-col items-center relative z-10 flex-1">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${done ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-400'}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className={`text-xs mt-2 text-center ${done ? 'font-semibold text-slate-900' : 'text-slate-400'}`}>{s.label}</div>
                    </div>
                  )
                })}
              </div>
              <div className="absolute top-6 left-[10%] right-[10%] h-1 bg-slate-200 -z-0">
                <div className="h-full bg-emerald-500 transition-all" style={{ width: `${(currentStep / (STEPS.length - 1)) * 100}%` }} />
              </div>
            </div>
            {order.trackingNumber && (
              <div className="mt-4 p-3 bg-blue-50 rounded text-sm">
                <span className="text-slate-600">Tracking Number:</span> <span className="font-mono font-bold">{order.trackingNumber}</span>
              </div>
            )}
            {order.delivery?.otp && order.status === 'SHIPPED' && (
              <div className="mt-3 p-3 bg-amber-50 rounded text-sm">
                <ShieldCheck className="w-4 h-4 inline text-amber-600 mr-1" />
                Delivery OTP: <span className="font-mono font-bold text-lg">{order.delivery.otp}</span> — share this with the delivery partner to confirm receipt.
              </div>
            )}
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Items */}
          <div className="lg:col-span-2 space-y-3">
            <Card className="p-4">
              <h2 className="font-bold mb-3">Items in this order</h2>
              <div className="space-y-3">
                {order.items?.map((it: any) => (
                  <div key={it.id} className="flex gap-3">
                    <Link href={`/products/${it.productId}`} className="w-16 h-16 bg-slate-50 rounded overflow-hidden shrink-0">
                      {it.image && <img src={it.image} alt="" className="w-full h-full object-cover" />}
                    </Link>
                    <div className="flex-1 min-w-0">
                      <Link href={`/products/${it.productId}`} className="text-sm font-medium hover:amz-link line-clamp-2">{it.name}</Link>
                      <div className="text-xs text-slate-500">Qty: {it.quantity} · {ETB(it.price)} each</div>
                    </div>
                    <div className="font-bold text-sm">{ETB(it.total)}</div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Payment info */}
            <Card className="p-4">
              <h2 className="font-bold mb-3 flex items-center gap-2"><CreditCard className="w-4 h-4" /> Payment</h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-slate-600">Method</span><span className="font-medium capitalize">
                  {order.paymentProvider === 'chapa' ? 'Chapa' : order.paymentProvider === 'bank' ? (ETHIOPIAN_BANKS.find(b => b.code === order.paymentMethod)?.name || 'Bank Transfer') : 'Cash on Delivery'}
                </span></div>
                {order.paymentRef && <div className="flex justify-between"><span className="text-slate-600">Reference</span><span className="font-mono text-xs">{order.paymentRef}</span></div>}
                {order.payments?.[0] && <div className="flex justify-between"><span className="text-slate-600">Transaction ID</span><span className="font-mono text-xs">{order.payments[0].txnId}</span></div>}
                <div className="border-t pt-2 mt-2 space-y-1">
                  <div className="flex justify-between"><span className="text-slate-600">Subtotal</span><span>{ETB(order.subtotal)}</span></div>
                  <div className="flex justify-between"><span className="text-slate-600">Shipping</span><span>{order.shipping === 0 ? 'FREE' : ETB(order.shipping)}</span></div>
                  <div className="flex justify-between"><span className="text-slate-600">VAT (15%)</span><span>{ETB(order.tax)}</span></div>
                  {order.discount > 0 && <div className="flex justify-between text-emerald-600"><span>Discount</span><span>-{ETB(order.discount)}</span></div>}
                  <div className="flex justify-between font-bold border-t pt-2 mt-2"><span>Total</span><span className="text-red-600">{ETB(order.total)}</span></div>
                </div>
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-3">
            <Card className="p-4">
              <h2 className="font-bold mb-3 flex items-center gap-2"><MapPin className="w-4 h-4" /> Delivery Address</h2>
              {shippingAddr && (
                <div className="text-sm space-y-1">
                  <div className="font-semibold">{shippingAddr.fullName}</div>
                  <div className="flex items-center gap-1 text-slate-600"><Phone className="w-3 h-3" /> {shippingAddr.phone}</div>
                  <div className="text-slate-600">{shippingAddr.subCity}{shippingAddr.subCity && shippingAddr.city ? ', ' : ''}{shippingAddr.city}</div>
                  <div className="text-slate-600">{shippingAddr.region}, Ethiopia</div>
                  <div className="text-slate-600">{shippingAddr.detail}</div>
                </div>
              )}
            </Card>

            {order.vendor && (
              <Card className="p-4">
                <h2 className="font-bold mb-2">Sold by</h2>
                <Link href={`/products?vendor=${order.vendor.id}`} className="flex items-center gap-2">
                  <img src={order.vendor.logo || `https://picsum.photos/seed/${order.vendor.id}/40/40`} alt="" className="w-10 h-10 rounded-full" />
                  <div>
                    <div className="font-semibold text-sm">{order.vendor.storeName}</div>
                    <div className="text-xs text-slate-500">{order.vendor.verified ? 'Verified Vendor' : 'Vendor'}</div>
                  </div>
                </Link>
              </Card>
            )}

            {/* Actions */}
            <Card className="p-4 space-y-2">
              {order.status === 'PENDING' && order.customerId === user?.id && (
                <Button variant="outline" className="w-full text-red-600 hover:text-red-700" onClick={() => handleAction('cancel')} disabled={actionLoading}>
                  <X className="w-4 h-4 mr-2" /> {t('orders.cancel')}
                </Button>
              )}
              {order.status === 'DELIVERED' && order.customerId === user?.id && (
                <Button variant="outline" className="w-full" onClick={() => handleAction('return', { reason: 'Customer return request' })} disabled={actionLoading}>
                  <RotateCcw className="w-4 h-4 mr-2" /> {t('orders.return')}
                </Button>
              )}
              {/* Vendor actions */}
              {user?.role === 'VENDOR' && order.vendorId === user.vendorId && (
                <>
                  {order.status === 'PENDING' && <Button className="w-full amz-bg-yellow hover:bg-[#f7ca00] text-black" onClick={() => handleAction('confirm')} disabled={actionLoading}>Accept Order</Button>}
                  {order.status === 'CONFIRMED' && <Button className="w-full amz-bg-yellow hover:bg-[#f7ca00] text-black" onClick={() => handleAction('pack')} disabled={actionLoading}>Mark as Packed</Button>}
                  {order.status === 'PACKED' && <Button className="w-full amz-bg-yellow hover:bg-[#f7ca00] text-black" onClick={() => handleAction('ship')} disabled={actionLoading}>Ship Order</Button>}
                  {order.status === 'SHIPPED' && <Button className="w-full amz-bg-yellow hover:bg-[#f7ca00] text-black" onClick={() => handleAction('deliver')} disabled={actionLoading}>Mark Delivered</Button>}
                  {order.status === 'PENDING' && <Button variant="outline" className="w-full text-red-600" onClick={() => handleAction('cancel')} disabled={actionLoading}>Reject</Button>}
                </>
              )}
              <Button variant="outline" className="w-full" onClick={() => toast.info('Invoice download coming soon')}>{t('orders.invoice')}</Button>
            </Card>
          </div>
        </div>
      </div>
    </StorefrontShell>
  )
}
