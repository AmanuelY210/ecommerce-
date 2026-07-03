'use client'
import { useEffect, useState } from 'react'
import { Store, Package, ShoppingCart, Wallet, BarChart3, Tag, Settings, AlertTriangle, CheckCircle2, Truck, X } from 'lucide-react'
import { DashboardShell } from '@/components/layout/dashboard-shell'
import { SectionHeader, EmptyState } from '@/components/dashboard/widgets'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { ETB, statusColor, timeAgo } from '@/lib/helpers'
import { toast } from 'sonner'
import { Skeleton } from '@/components/ui/skeleton'
import { useAuth } from '@/lib/store'

const NAV = [
  { label: 'Dashboard', href: '/vendor', icon: Store },
  { label: 'Products', href: '/vendor/products', icon: Package },
  { label: 'Orders', href: '/vendor/orders', icon: ShoppingCart },
  { label: 'Inventory', href: '/vendor/inventory', icon: AlertTriangle },
  { label: 'Wallet', href: '/vendor/wallet', icon: Wallet },
  { label: 'Reports', href: '/vendor/reports', icon: BarChart3 },
  { label: 'Marketing', href: '/vendor/marketing', icon: Tag },
  { label: 'Store Settings', href: '/vendor/settings', icon: Settings },
]

export default function VendorOrdersPage() {
  return <DashboardShell nav={NAV} title="Orders" role="vendor" requiredRole="VENDOR"><OrdersContent /></DashboardShell>
}

function OrdersContent() {
  const user = useAuth((s) => s.user)
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    fetch('/api/orders').then(r => r.json()).then(d => {
      setOrders(Array.isArray(d) ? d : [])
      setLoading(false)
    })
  }, [])

  const updateStatus = async (id: string, action: string) => {
    const res = await fetch(`/api/orders/${id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action }),
    })
    if (res.ok) {
      toast.success(`Order ${action}ed`)
      setOrders(orders.map(o => o.id === id ? { ...o, status: action === 'confirm' ? 'CONFIRMED' : action === 'pack' ? 'PACKED' : action === 'ship' ? 'SHIPPED' : action === 'deliver' ? 'DELIVERED' : 'CANCELLED' } : o))
    } else {
      toast.error('Failed')
    }
  }

  const filtered = filter === 'all' ? orders : orders.filter(o => o.status === filter)

  if (loading) return <div className="space-y-3">{Array.from({length: 5}).map((_, i) => <Skeleton key={i} className="h-12" />)}</div>

  return (
    <div className="space-y-4">
      <SectionHeader title="Orders" description={`${orders.length} total orders`} action={
        <div className="flex gap-1">
          {['all', 'PENDING', 'CONFIRMED', 'PACKED', 'SHIPPED', 'DELIVERED', 'CANCELLED'].map(s => (
            <Button key={s} size="sm" variant={filter === s ? 'default' : 'outline'} onClick={() => setFilter(s)} className="text-xs">
              {s === 'all' ? 'All' : s.charAt(0) + s.slice(1).toLowerCase()}
            </Button>
          ))}
        </div>
      } />

      {filtered.length === 0 ? (
        <EmptyState icon={ShoppingCart} title="No orders found" description="Orders matching this filter will appear here." />
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(o => (
                <TableRow key={o.id}>
                  <TableCell className="font-mono text-xs font-semibold">{o.orderNumber}</TableCell>
                  <TableCell><div className="text-sm">{o.customer?.name}</div><div className="text-xs text-slate-500">{o.customer?.phone || o.customer?.email}</div></TableCell>
                  <TableCell className="text-sm">{o.items?.length} item(s)</TableCell>
                  <TableCell className="font-semibold">{ETB(o.total)}</TableCell>
                  <TableCell><Badge variant="outline" className={statusColor(o.status)}>{o.status}</Badge></TableCell>
                  <TableCell className="text-xs text-slate-500">{timeAgo(o.createdAt)}</TableCell>
                  <TableCell>
                    <div className="flex gap-1 flex-wrap">
                      {o.status === 'PENDING' && (
                        <>
                          <Button size="sm" className="h-7 amz-bg-yellow hover:bg-[#f7ca00] text-black text-xs" onClick={() => updateStatus(o.id, 'confirm')}><CheckCircle2 className="w-3 h-3 mr-1" /> Accept</Button>
                          <Button size="sm" variant="outline" className="h-7 text-red-600 text-xs" onClick={() => updateStatus(o.id, 'cancel')}><X className="w-3 h-3" /></Button>
                        </>
                      )}
                      {o.status === 'CONFIRMED' && <Button size="sm" className="h-7 text-xs" onClick={() => updateStatus(o.id, 'pack')}>Pack</Button>}
                      {o.status === 'PACKED' && <Button size="sm" className="h-7 text-xs" onClick={() => updateStatus(o.id, 'ship')}><Truck className="w-3 h-3 mr-1" /> Ship</Button>}
                      {o.status === 'SHIPPED' && <Button size="sm" className="h-7 text-xs" onClick={() => updateStatus(o.id, 'deliver')}>Deliver</Button>}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  )
}
