'use client'
import { useEffect, useState } from 'react'
import { LayoutDashboard, Users, Store, Package, Wallet, Settings, FileText, ShieldCheck, DollarSign, TrendingUp, ShoppingCart, UserCheck, AlertTriangle, ArrowUpRight, Banknote, RefreshCw } from 'lucide-react'
import { DashboardShell } from '@/components/layout/dashboard-shell'
import { StatCard, SectionHeader, LineChart, BarChart } from '@/components/dashboard/widgets'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { ETB, statusColor, timeAgo } from '@/lib/helpers'
import { Skeleton } from '@/components/ui/skeleton'
import Link from 'next/link'

const NAV = [
  { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { label: 'Users', href: '/admin/users', icon: Users },
  { label: 'Vendors', href: '/admin/vendors', icon: Store },
  { label: 'Products', href: '/admin/products', icon: Package },
  { label: 'Financial', href: '/admin/financial', icon: Wallet },
  { label: 'CMS', href: '/admin/cms', icon: FileText },
  { label: 'Settings', href: '/admin/settings', icon: Settings },
  { label: 'Security', href: '/admin/security', icon: ShieldCheck },
]

export default function AdminDashboard() {
  return <DashboardShell nav={NAV} title="Super Admin" role="admin" requiredRole="ADMIN"><AdminContent /></DashboardShell>
}

function AdminContent() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/admin/stats').then(r => r.json()).then(d => { setData(d); setLoading(false) })
  }, [])

  if (loading) return <div className="space-y-3">{Array.from({length: 6}).map((_, i) => <Skeleton key={i} className="h-32" />)}</div>
  if (!data) return <div>Failed to load</div>

  const { counts, chart, topCategories, topVendors, statusCounts } = data

  return (
    <div className="space-y-4">
      {/* Top stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard label="GMV (30d)" value={ETB(counts.gmv)} delta={18} icon={DollarSign} color="bg-emerald-500" sub={`Net: ${ETB(counts.netRevenue)}`} />
        <StatCard label="Commission" value={ETB(counts.commission)} delta={15} icon={TrendingUp} color="bg-amber-500" sub="Marketplace earnings" />
        <StatCard label="Total Orders" value={counts.totalOrders} delta={12} icon={ShoppingCart} color="bg-blue-500" sub={`${counts.recentOrders} in last 30d`} />
        <StatCard label="Active Users" value={counts.totalUsers} delta={8} icon={Users} color="bg-purple-500" sub={`${counts.recentCustomers} new this month`} />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard label="Active Vendors" value={counts.approvedVendors} icon={Store} color="bg-teal-500" sub={`${counts.pendingVendors} pending`} />
        <StatCard label="Products" value={counts.totalProducts} icon={Package} color="bg-indigo-500" sub={`${counts.pendingProducts} pending approval`} />
        <StatCard label="Pending Approvals" value={counts.pendingVendors + counts.pendingProducts} icon={AlertTriangle} color="bg-red-500" sub="Vendors + Products" />
        <StatCard label="Refund Requests" value={counts.refunds} icon={RefreshCw} color="bg-orange-500" sub={`${counts.withdrawals} withdrawals`} />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="p-4 lg:col-span-2">
          <SectionHeader title="Marketplace GMV — Last 30 Days" description={`Total: ${ETB(counts.gmv)}`} />
          <LineChart data={chart.map((d: any) => ({ date: d.date, value: d.gmv }))} />
        </Card>
        <Card className="p-4">
          <SectionHeader title="Top Categories" description="By units sold" />
          <BarChart data={topCategories} />
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Top vendors */}
        <Card className="p-4">
          <SectionHeader title="Top Vendors" description="By total sales" action={<Button size="sm" variant="outline" asChild><Link href="/admin/vendors">View all</Link></Button>} />
          <div className="space-y-2">
            {topVendors.slice(0, 6).map((v: any, i: number) => (
              <div key={v.id} className="flex items-center gap-3 text-sm border-b last:border-0 pb-2 last:pb-0">
                <div className="w-6 h-6 rounded bg-amber-100 text-amber-700 font-bold text-xs flex items-center justify-center">{i + 1}</div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{v.storeName}</div>
                  <div className="text-xs text-slate-500">{v.totalOrders} orders · ⭐ {v.rating.toFixed(1)}</div>
                </div>
                <div className="text-sm font-bold">{ETB(v.totalSales)}</div>
              </div>
            ))}
          </div>
        </Card>

        {/* Order status */}
        <Card className="p-4">
          <SectionHeader title="Order Status Distribution" />
          <div className="space-y-2">
            {Object.entries(statusCounts).map(([status, count]: [string, any]) => (
              <div key={status} className="flex items-center justify-between text-sm border-b last:border-0 pb-2 last:pb-0">
                <Badge variant="outline" className={statusColor(status)}>{status}</Badge>
                <span className="font-semibold">{count} orders</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Pending approvals quick action */}
      <Card className="p-4">
        <SectionHeader title="Action Center" description="Items requiring your attention" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Link href="/admin/vendors" className="border rounded-lg p-3 hover:shadow-md transition-shadow">
            <Store className="w-6 h-6 text-amber-600 mb-2" />
            <div className="text-2xl font-bold">{counts.pendingVendors}</div>
            <div className="text-xs text-slate-500">Vendors to approve</div>
          </Link>
          <Link href="/admin/products" className="border rounded-lg p-3 hover:shadow-md transition-shadow">
            <Package className="w-6 h-6 text-blue-600 mb-2" />
            <div className="text-2xl font-bold">{counts.pendingProducts}</div>
            <div className="text-xs text-slate-500">Products to review</div>
          </Link>
          <Link href="/admin/financial" className="border rounded-lg p-3 hover:shadow-md transition-shadow">
            <Banknote className="w-6 h-6 text-emerald-600 mb-2" />
            <div className="text-2xl font-bold">{counts.withdrawals}</div>
            <div className="text-xs text-slate-500">Withdrawal requests</div>
          </Link>
          <Link href="/admin/financial" className="border rounded-lg p-3 hover:shadow-md transition-shadow">
            <RefreshCw className="w-6 h-6 text-red-600 mb-2" />
            <div className="text-2xl font-bold">{counts.refunds}</div>
            <div className="text-xs text-slate-500">Refund requests</div>
          </Link>
        </div>
      </Card>
    </div>
  )
}
