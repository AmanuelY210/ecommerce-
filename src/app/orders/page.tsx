'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Package, ChevronRight, Loader2 } from 'lucide-react'
import { useT } from '@/hooks/use-t'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { StorefrontShell } from '@/components/layout/storefront-shell'
import { useAuth } from '@/lib/store'
import { ETB, statusColor, timeAgo } from '@/lib/helpers'

export default function OrdersPage() {
  const { t } = useT()
  const router = useRouter()
  const user = useAuth((s) => s.user)
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      router.push('/login?redirect=/orders')
      return
    }
    fetch('/api/orders').then(r => r.json()).then(d => {
      setOrders(Array.isArray(d) ? d : [])
      setLoading(false)
    })
  }, [user, router])

  if (!user) return null

  return (
    <StorefrontShell>
      <div className="max-w-4xl mx-auto px-4 py-6 w-full">
        <h1 className="text-2xl font-bold mb-4">{t('orders.title')}</h1>
        {loading ? (
          <div className="space-y-3">{Array.from({length: 3}).map((_, i) => <Skeleton key={i} className="h-32 rounded-lg" />)}</div>
        ) : orders.length === 0 ? (
          <Card className="p-12 text-center">
            <Package className="w-16 h-16 mx-auto text-slate-300 mb-4" />
            <p className="text-slate-500 mb-4">{t('orders.empty')}</p>
            <Button asChild className="amz-bg-yellow hover:bg-[#f7ca00] text-black"><Link href="/products">Start Shopping</Link></Button>
          </Card>
        ) : (
          <div className="space-y-3">
            {orders.map(o => <OrderRow key={o.id} order={o} t={t} />)}
          </div>
        )}
      </div>
    </StorefrontShell>
  )
}

function OrderRow({ order, t }: { order: any; t: any }) {
  return (
    <Card className="p-4 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
        <div>
          <div className="font-bold text-sm">{t('orders.orderNo')}<Link href={`/orders/${order.id}`} className="amz-link hover:underline ml-1">{order.orderNumber}</Link></div>
          <div className="text-xs text-slate-500">{t('orders.date')}: {new Date(order.createdAt).toLocaleDateString()} · {timeAgo(order.createdAt)}</div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className={statusColor(order.status)}>{t(`order.status.${order.status}`)}</Badge>
          <Badge variant="outline" className={statusColor(order.paymentStatus)}>{t(`order.payment.${order.paymentStatus}`)}</Badge>
          <span className="font-bold">{ETB(order.total)}</span>
        </div>
      </div>
      <div className="flex gap-2 overflow-x-auto scroll-hidden">
        {order.items?.map((it: any) => (
          <Link href={`/products/${it.productId}`} key={it.id} className="flex items-center gap-2 shrink-0 bg-slate-50 rounded p-2 min-w-[200px]">
            <div className="w-12 h-12 bg-white rounded overflow-hidden shrink-0">
              {it.image && <img src={it.image} alt="" className="w-full h-full object-cover" />}
            </div>
            <div className="min-w-0">
              <div className="text-xs line-clamp-1">{it.name}</div>
              <div className="text-xs text-slate-500">Qty: {it.quantity} · {ETB(it.total)}</div>
            </div>
          </Link>
        ))}
      </div>
      <div className="flex justify-end mt-3">
        <Button asChild size="sm" variant="outline">
          <Link href={`/orders/${order.id}`}>{t('orders.viewDetails')} <ChevronRight className="w-3 h-3 ml-1" /></Link>
        </Button>
      </div>
    </Card>
  )
}
