'use client'
import { useEffect, useState } from 'react'
import { LayoutDashboard, Users, Store, Package, Wallet, Settings, FileText, ShieldCheck, Check, X, Pause, Play, ShieldCheck as Verify } from 'lucide-react'
import { DashboardShell } from '@/components/layout/dashboard-shell'
import { SectionHeader, EmptyState } from '@/components/dashboard/widgets'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ETB, statusColor, timeAgo } from '@/lib/helpers'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'

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

export default function AdminVendorsPage() {
  return <DashboardShell nav={NAV} title="Vendors" role="admin" requiredRole="ADMIN"><VendorsContent /></DashboardShell>
}

function VendorsContent() {
  const [vendors, setVendors] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    fetch('/api/admin/vendors').then(r => r.json()).then(d => { setVendors(d); setLoading(false) })
  }, [])

  const update = async (id: string, action: string) => {
    const res = await fetch('/api/admin/vendors', {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, action }),
    })
    if (res.ok) {
      toast.success(`Vendor ${action}d`)
      const status = action === 'approve' ? 'APPROVED' : action === 'reject' ? 'REJECTED' : action === 'suspend' ? 'SUSPENDED' : 'APPROVED'
      setVendors(vendors.map(v => v.id === id ? { ...v, status, verified: action === 'approve' || action === 'reinstate' } : v))
    }
  }

  const filtered = filter === 'all' ? vendors : vendors.filter(v => v.status === filter.toUpperCase())

  if (loading) return <div className="space-y-3">{Array.from({length: 5}).map((_, i) => <Skeleton key={i} className="h-12" />)}</div>

  return (
    <div className="space-y-4">
      <SectionHeader title="Vendor Management" description={`${vendors.length} vendors`} />

      <Tabs value={filter} onValueChange={setFilter}>
        <TabsList>
          <TabsTrigger value="all">All ({vendors.length})</TabsTrigger>
          <TabsTrigger value="pending">Pending ({vendors.filter(v => v.status === 'PENDING').length})</TabsTrigger>
          <TabsTrigger value="approved">Approved ({vendors.filter(v => v.status === 'APPROVED').length})</TabsTrigger>
          <TabsTrigger value="suspended">Suspended ({vendors.filter(v => v.status === 'SUSPENDED').length})</TabsTrigger>
          <TabsTrigger value="rejected">Rejected ({vendors.filter(v => v.status === 'REJECTED').length})</TabsTrigger>
        </TabsList>

        <TabsContent value={filter}>
          {filtered.length === 0 ? (
            <EmptyState icon={Store} title="No vendors" description="No vendors in this category." />
          ) : (
            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Store</TableHead>
                    <TableHead>Owner</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Sales</TableHead>
                    <TableHead>Rating</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map(v => (
                    <TableRow key={v.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <img src={v.logo || `https://picsum.photos/seed/${v.id}/40/40`} alt="" className="w-8 h-8 rounded-full" />
                          <div className="min-w-0">
                            <div className="font-medium text-sm line-clamp-1">{v.storeName}</div>
                            <div className="text-xs text-slate-500 line-clamp-1">{v.description || '—'}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">{v.user?.name}<div className="text-xs text-slate-500">{v.user?.email}</div></TableCell>
                      <TableCell><Badge variant="outline">{v.businessType}</Badge></TableCell>
                      <TableCell className="text-sm"><div className="font-semibold">{ETB(v.totalSales)}</div><div className="text-xs text-slate-500">{v.totalOrders} orders</div></TableCell>
                      <TableCell className="text-sm">⭐ {v.rating.toFixed(1)}</TableCell>
                      <TableCell><Badge variant="outline" className={statusColor(v.status)}>{v.status}{v.verified && ' ✓'}</Badge></TableCell>
                      <TableCell className="text-xs text-slate-500">{timeAgo(v.createdAt)}</TableCell>
                      <TableCell>
                        <div className="flex gap-1 flex-wrap">
                          {v.status === 'PENDING' && (
                            <>
                              <Button size="sm" className="h-7 amz-bg-yellow hover:bg-[#f7ca00] text-black text-xs" onClick={() => update(v.id, 'approve')}><Check className="w-3 h-3" /></Button>
                              <Button size="sm" variant="outline" className="h-7 text-red-600 text-xs" onClick={() => update(v.id, 'reject')}><X className="w-3 h-3" /></Button>
                            </>
                          )}
                          {v.status === 'APPROVED' && <Button size="sm" variant="outline" className="h-7 text-amber-600 text-xs" onClick={() => update(v.id, 'suspend')}><Pause className="w-3 h-3" /></Button>}
                          {v.status === 'SUSPENDED' && <Button size="sm" variant="outline" className="h-7 text-emerald-600 text-xs" onClick={() => update(v.id, 'reinstate')}><Play className="w-3 h-3" /></Button>}
                          {v.status === 'REJECTED' && <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => update(v.id, 'approve')}><Play className="w-3 h-3" /></Button>}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
