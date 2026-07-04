'use client'
import { useEffect, useState } from 'react'
import { Store, Package, ShoppingCart, Wallet, BarChart3, Tag, Settings, AlertTriangle, TrendingUp, Star, ShoppingCart as Cart } from 'lucide-react'
import { DashboardShell } from '@/components/layout/dashboard-shell'
import { SectionHeader, StatCard, LineChart, BarChart } from '@/components/dashboard/widgets'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { ETB } from '@/lib/helpers'

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

export default function VendorReportsPage() {
  return <DashboardShell nav={NAV} title="Reports" role="vendor" requiredRole="VENDOR"><ReportsContent /></DashboardShell>
}

function ReportsContent() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/vendor/stats').then(r => r.json()).then(d => { setData(d); setLoading(false) })
  }, [])

  if (loading) return <div className="space-y-3">{Array.from({length: 4}).map((_, i) => <Skeleton key={i} className="h-32" />)}</div>
  if (!data) return null

  const { stats, chart, topProducts, vendor } = data

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard label="Revenue (30d)" value={ETB(stats.revenue30)} icon={TrendingUp} color="bg-emerald-500" />
        <StatCard label="Orders (30d)" value={stats.orders30} icon={Cart} color="bg-blue-500" />
        <StatCard label="Avg Order Value" value={ETB(stats.orders30 ? Math.round(stats.revenue30 / stats.orders30) : 0)} icon={TrendingUp} color="bg-purple-500" />
        <StatCard label="Store Rating" value={`${stats.rating.toFixed(1)} ★`} icon={Star} color="bg-amber-500" />
      </div>

      <Card className="p-4">
        <SectionHeader title="Sales Trend" description="Last 14 days revenue" />
        <LineChart data={chart.map((d: any) => ({ date: d.date, value: d.sales }))} />
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="p-4">
          <SectionHeader title="Top Selling Products" />
          {topProducts.length === 0 ? <p className="text-sm text-slate-500 text-center py-8">No data yet</p> : (
            <BarChart data={topProducts.map((p: any) => ({ name: p.name.slice(0, 25), value: p.revenue }))} />
          )}
        </Card>
        <Card className="p-4">
          <SectionHeader title="Orders by Day" />
          <BarChart data={chart.slice(-7).map((d: any) => ({ name: d.date.slice(5), value: d.orders }))} color="#3b82f6" />
        </Card>
      </div>
    </div>
  )
}
