'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Store, Package, ShoppingCart, Wallet, BarChart3, Tag, Settings, Plus, TrendingUp, Star, Truck, AlertTriangle, ArrowUpRight, Banknote, Pencil, Trash2, Eye, CheckCircle2 } from 'lucide-react'
import { DashboardShell } from '@/components/layout/dashboard-shell'
import { StatCard, SectionHeader, LineChart, BarChart, EmptyState } from '@/components/dashboard/widgets'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog'
import { useAuth } from '@/lib/store'
import { ETB, statusColor, timeAgo } from '@/lib/helpers'
import { toast } from 'sonner'
import { Skeleton } from '@/components/ui/skeleton'

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

export default function VendorDashboard() {
  return <DashboardShell nav={NAV} title="Vendor Dashboard" role="vendor" requiredRole="VENDOR"><VendorContent /></DashboardShell>
}

function VendorContent() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const user = useAuth((s) => s.user)

  useEffect(() => {
    fetch('/api/vendor/stats').then(r => r.json()).then(d => {
      setData(d)
      setLoading(false)
    })
  }, [])

  if (loading) return <div className="space-y-4">{Array.from({length: 4}).map((_, i) => <Skeleton key={i} className="h-32 rounded-lg" />)}</div>
  if (!data) return <div>Failed to load</div>

  const { vendor, products, orders, withdrawals, reviews, stats, chart, topProducts } = data

  if (vendor.status === 'PENDING') {
    return (
      <Card className="p-8 text-center">
        <div className="w-16 h-16 mx-auto bg-amber-100 rounded-full flex items-center justify-center mb-4">
          <Store className="w-8 h-8 text-amber-600" />
        </div>
        <h2 className="text-xl font-bold mb-2">Your store is pending approval</h2>
        <p className="text-slate-500 mb-4">Our admin team is reviewing your store. This usually takes 24-48 hours.</p>
        <Badge className="bg-amber-100 text-amber-800">Status: Pending Verification</Badge>
      </Card>
    )
  }
  if (vendor.status === 'REJECTED' || vendor.status === 'SUSPENDED') {
    return (
      <Card className="p-8 text-center">
        <div className="w-16 h-16 mx-auto bg-red-100 rounded-full flex items-center justify-center mb-4">
          <AlertTriangle className="w-8 h-8 text-red-600" />
        </div>
        <h2 className="text-xl font-bold mb-2">Store {vendor.status.toLowerCase()}</h2>
        <p className="text-slate-500">Please contact support@etmarket.et for assistance.</p>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard label="Revenue (30d)" value={ETB(stats.revenue30)} delta={12} icon={TrendingUp} color="bg-emerald-500" sub={`Net: ${ETB(stats.net30)}`} />
        <StatCard label="Orders (30d)" value={stats.orders30} delta={8} icon={ShoppingCart} color="bg-blue-500" sub={`${stats.orders7} this week`} />
        <StatCard label="Available" value={ETB(stats.balance)} icon={Wallet} color="bg-amber-500" sub={`Pending: ${ETB(stats.pending)}`} />
        <StatCard label="Rating" value={`${stats.rating.toFixed(1)} ★`} icon={Star} color="bg-purple-500" sub={`${vendor.reviewCount} reviews`} />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="p-4 lg:col-span-2">
          <SectionHeader title="Sales — Last 14 Days" description={`Total: ${ETB(stats.revenue30)} · ${stats.orders30} orders`} />
          <LineChart data={chart.map((d: any) => ({ date: d.date, value: d.sales }))} />
        </Card>
        <Card className="p-4">
          <SectionHeader title="Top Products" />
          {topProducts.length === 0 ? (
            <p className="text-sm text-slate-500 py-8 text-center">No sales yet</p>
          ) : (
            <div className="space-y-2">
              {topProducts.map((p: any, i: number) => (
                <div key={i} className="flex items-center gap-2 text-sm">
                  <div className="w-6 h-6 rounded bg-amber-100 text-amber-700 font-bold text-xs flex items-center justify-center">{i + 1}</div>
                  <div className="flex-1 min-w-0">
                    <div className="truncate text-xs font-medium">{p.name}</div>
                    <div className="text-xs text-slate-500">{p.qty} sold</div>
                  </div>
                  <div className="text-xs font-bold">{ETB(p.revenue)}</div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Recent orders + low stock */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="p-4">
          <SectionHeader title="Recent Orders" action={<Button size="sm" variant="outline" asChild><a href="/vendor/orders">View all</a></Button>} />
          <div className="space-y-2">
            {orders.slice(0, 5).map((o: any) => (
              <div key={o.id} className="flex items-center justify-between text-sm border-b pb-2">
                <div>
                  <div className="font-medium">{o.orderNumber}</div>
                  <div className="text-xs text-slate-500">{timeAgo(o.createdAt)} · {o.items?.length} items</div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className={statusColor(o.status)}>{o.status}</Badge>
                  <span className="font-bold text-sm">{ETB(o.total)}</span>
                </div>
              </div>
            ))}
            {orders.length === 0 && <p className="text-sm text-slate-500 text-center py-4">No orders yet</p>}
          </div>
        </Card>

        <Card className="p-4">
          <SectionHeader title="Low Stock Alerts" action={<Button size="sm" variant="outline" asChild><a href="/vendor/inventory">Manage</a></Button>} />
          <div className="space-y-2">
            {products.filter((p: any) => p.stock <= p.lowStockAt).slice(0, 5).map((p: any) => (
              <div key={p.id} className="flex items-center justify-between text-sm border-b pb-2">
                <div className="flex items-center gap-2 min-w-0">
                  <img src={p.images?.[0]} alt="" className="w-8 h-8 rounded object-cover" />
                  <span className="truncate text-xs">{p.name}</span>
                </div>
                <Badge variant="outline" className={p.stock === 0 ? 'bg-red-50 text-red-700' : 'bg-amber-50 text-amber-700'}>
                  {p.stock} left
                </Badge>
              </div>
            ))}
            {products.filter((p: any) => p.stock <= p.lowStockAt).length === 0 && (
              <p className="text-sm text-slate-500 text-center py-4">All products well-stocked ✓</p>
            )}
          </div>
        </Card>
      </div>

      {/* Recent reviews */}
      <Card className="p-4">
        <SectionHeader title="Recent Customer Reviews" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {reviews.slice(0, 6).map((r: any) => (
            <div key={r.id} className="border rounded p-3 text-sm">
              <div className="flex items-center gap-2 mb-1">
                <span className="flex">{Array.from({length: 5}).map((_, i) => <Star key={i} className={`w-3 h-3 ${i < r.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`} />)}</span>
                <span className="text-xs text-slate-500">{r.user?.name}</span>
              </div>
              <p className="text-xs text-slate-700 line-clamp-2">{r.comment}</p>
              {r.product && <p className="text-xs amz-link mt-1 truncate">{r.product.name}</p>}
            </div>
          ))}
          {reviews.length === 0 && <p className="text-sm text-slate-500 col-span-full text-center py-4">No reviews yet</p>}
        </div>
      </Card>
    </div>
  )
}
