'use client'
import { useEffect, useState } from 'react'
import { LayoutDashboard, Users, Store, Package, Wallet, Settings, FileText, ShieldCheck, Check, X, Search } from 'lucide-react'
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

export default function AdminProductsPage() {
  return <DashboardShell nav={NAV} title="Products" role="admin" requiredRole="ADMIN"><ProductsContent /></DashboardShell>
}

function ProductsContent() {
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [q, setQ] = useState('')

  useEffect(() => {
    fetch('/api/admin/products').then(r => r.json()).then(d => { setProducts(d); setLoading(false) })
  }, [])

  const update = async (id: string, action: string) => {
    const res = await fetch('/api/admin/products', {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, action }),
    })
    if (res.ok) {
      toast.success(`Product ${action}d`)
      const status = action === 'approve' ? 'APPROVED' : action === 'reject' ? 'REJECTED' : 'SUSPENDED'
      setProducts(products.map(p => p.id === id ? { ...p, status } : p))
    }
  }

  const filtered = products.filter(p =>
    (filter === 'all' || p.status === filter.toUpperCase()) &&
    (!q || p.name.toLowerCase().includes(q.toLowerCase()))
  )

  if (loading) return <div className="space-y-3">{Array.from({length: 5}).map((_, i) => <Skeleton key={i} className="h-12" />)}</div>

  return (
    <div className="space-y-4">
      <SectionHeader title="Product Moderation" description={`${products.length} products`} action={
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <Input placeholder="Search products..." value={q} onChange={(e) => setQ(e.target.value)} className="pl-9 w-64" />
        </div>
      } />

      <Tabs value={filter} onValueChange={setFilter}>
        <TabsList>
          <TabsTrigger value="all">All ({products.length})</TabsTrigger>
          <TabsTrigger value="pending">Pending ({products.filter(p => p.status === 'PENDING').length})</TabsTrigger>
          <TabsTrigger value="approved">Approved ({products.filter(p => p.status === 'APPROVED').length})</TabsTrigger>
          <TabsTrigger value="rejected">Rejected ({products.filter(p => p.status === 'REJECTED').length})</TabsTrigger>
          <TabsTrigger value="suspended">Suspended ({products.filter(p => p.status === 'SUSPENDED').length})</TabsTrigger>
        </TabsList>

        <TabsContent value={filter}>
          {filtered.length === 0 ? (
            <EmptyState icon={Package} title="No products" description="No products match this filter." />
          ) : (
            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Vendor</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Stock</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.slice(0, 100).map(p => (
                    <TableRow key={p.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <img src={p.images?.[0]} alt="" className="w-10 h-10 rounded object-cover" />
                          <div className="min-w-0">
                            <div className="font-medium text-sm line-clamp-1">{p.name}</div>
                            <div className="text-xs text-slate-500">{p.sku || '—'}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">{p.vendor?.storeName || '—'}</TableCell>
                      <TableCell className="text-xs">{p.category?.name || '—'}</TableCell>
                      <TableCell className="font-semibold text-sm">{ETB(p.price)}</TableCell>
                      <TableCell className="text-sm">{p.stock}</TableCell>
                      <TableCell><Badge variant="outline" className={statusColor(p.status)}>{p.status}</Badge></TableCell>
                      <TableCell className="text-xs text-slate-500">{timeAgo(p.createdAt)}</TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          {p.status !== 'APPROVED' && <Button size="sm" className="h-7 amz-bg-yellow hover:bg-[#f7ca00] text-black text-xs" onClick={() => update(p.id, 'approve')}><Check className="w-3 h-3" /></Button>}
                          {p.status !== 'REJECTED' && <Button size="sm" variant="outline" className="h-7 text-red-600 text-xs" onClick={() => update(p.id, 'reject')}><X className="w-3 h-3" /></Button>}
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
