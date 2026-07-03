'use client'
import { useEffect, useState } from 'react'
import { ShieldCheck, Store, Package, Star, AlertTriangle, ShoppingCart, Check, X, Flag, MessageSquare } from 'lucide-react'
import { DashboardShell } from '@/components/layout/dashboard-shell'
import { SectionHeader, StatCard, EmptyState } from '@/components/dashboard/widgets'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { ETB, statusColor, timeAgo } from '@/lib/helpers'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'

const NAV = [
  { label: 'Dashboard', href: '/moderator', icon: ShieldCheck },
  { label: 'Vendor Approvals', href: '/moderator/vendors', icon: Store },
  { label: 'Product Moderation', href: '/moderator/products', icon: Package },
  { label: 'Review Moderation', href: '/moderator/reviews', icon: Star },
  { label: 'Customer Reports', href: '/moderator/reports', icon: AlertTriangle },
  { label: 'Order Monitoring', href: '/moderator/orders', icon: ShoppingCart },
]

export default function ModeratorDashboard() {
  return <DashboardShell nav={NAV} title="Moderator Panel" role="moderator" requiredRole={['MODERATOR', 'ADMIN']}><ModContent /></DashboardShell>
}

function ModContent() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/moderation/queue').then(r => r.json()).then(d => { setData(d); setLoading(false) })
  }, [])

  const approveVendor = async (id: string, action: string) => {
    const res = await fetch('/api/admin/vendors', {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, action }),
    })
    if (res.ok) {
      toast.success(`Vendor ${action}d`)
      const d = await fetch('/api/moderation/queue').then(r => r.json())
      setData(d)
    }
  }

  const approveProduct = async (id: string, action: string) => {
    const res = await fetch('/api/admin/products', {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, action }),
    })
    if (res.ok) {
      toast.success(`Product ${action}d`)
      const d = await fetch('/api/moderation/queue').then(r => r.json())
      setData(d)
    }
  }

  if (loading) return <div className="space-y-3">{Array.from({length: 4}).map((_, i) => <Skeleton key={i} className="h-32" />)}</div>
  if (!data) return null

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <StatCard label="Vendor Approvals" value={data.counts.vendors} icon={Store} color="bg-amber-500" />
        <StatCard label="Product Reviews" value={data.counts.products} icon={Package} color="bg-blue-500" />
        <StatCard label="Flagged Reviews" value={data.counts.reviews} icon={Star} color="bg-purple-500" />
        <StatCard label="Customer Reports" value={data.counts.tickets} icon={AlertTriangle} color="bg-red-500" />
        <StatCard label="High-Value Orders" value={data.counts.orders} icon={ShoppingCart} color="bg-emerald-500" />
      </div>

      <Tabs defaultValue="vendors">
        <TabsList>
          <TabsTrigger value="vendors">Vendor Approvals ({data.counts.vendors})</TabsTrigger>
          <TabsTrigger value="products">Products ({data.counts.products})</TabsTrigger>
          <TabsTrigger value="reviews">Reviews ({data.counts.reviews})</TabsTrigger>
          <TabsTrigger value="orders">High-Value Orders ({data.counts.orders})</TabsTrigger>
        </TabsList>

        <TabsContent value="vendors">
          {data.vendors.length === 0 ? (
            <EmptyState icon={Store} title="No pending vendors" description="All vendor applications have been reviewed." />
          ) : (
            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Store</TableHead>
                    <TableHead>Owner</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>License</TableHead>
                    <TableHead>TIN</TableHead>
                    <TableHead>Applied</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.vendors.map((v: any) => (
                    <TableRow key={v.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <img src={v.logo || `https://picsum.photos/seed/${v.id}/40/40`} alt="" className="w-8 h-8 rounded-full" />
                          <div>
                            <div className="font-medium text-sm">{v.storeName}</div>
                            <div className="text-xs text-slate-500 line-clamp-1">{v.description}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">{v.user?.name}<div className="text-xs text-slate-500">{v.user?.email}</div></TableCell>
                      <TableCell><Badge variant="outline">{v.businessType}</Badge></TableCell>
                      <TableCell className="text-xs font-mono">{v.licenseNumber || '—'}</TableCell>
                      <TableCell className="text-xs font-mono">{v.taxNumber || '—'}</TableCell>
                      <TableCell className="text-xs text-slate-500">{timeAgo(v.createdAt)}</TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button size="sm" className="h-7 amz-bg-yellow hover:bg-[#f7ca00] text-black text-xs" onClick={() => approveVendor(v.id, 'approve')}><Check className="w-3 h-3" /></Button>
                          <Button size="sm" variant="outline" className="h-7 text-red-600 text-xs" onClick={() => approveVendor(v.id, 'reject')}><X className="w-3 h-3" /></Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="products">
          {data.products.length === 0 ? (
            <EmptyState icon={Package} title="No pending products" description="All products have been reviewed." />
          ) : (
            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Vendor</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Submitted</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.products.map((p: any) => (
                    <TableRow key={p.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <img src={p.images?.[0]} alt="" className="w-10 h-10 rounded object-cover" />
                          <div className="min-w-0">
                            <div className="font-medium text-sm line-clamp-1">{p.name}</div>
                            <div className="text-xs text-slate-500 line-clamp-1">{p.description}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">{p.vendor?.storeName}</TableCell>
                      <TableCell className="text-xs">{p.category?.name}</TableCell>
                      <TableCell className="font-semibold text-sm">{ETB(p.price)}</TableCell>
                      <TableCell className="text-xs text-slate-500">{timeAgo(p.createdAt)}</TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button size="sm" className="h-7 amz-bg-yellow hover:bg-[#f7ca00] text-black text-xs" onClick={() => approveProduct(p.id, 'approve')}><Check className="w-3 h-3" /></Button>
                          <Button size="sm" variant="outline" className="h-7 text-red-600 text-xs" onClick={() => approveProduct(p.id, 'reject')}><X className="w-3 h-3" /></Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="reviews">
          {data.reviews.length === 0 ? (
            <EmptyState icon={Star} title="No flagged reviews" description="Customer reviews look clean." />
          ) : (
            <div className="space-y-2">
              {data.reviews.map((r: any) => (
                <Card key={r.id} className="p-3">
                  <div className="flex items-start gap-3">
                    <img src={r.user?.avatar || `https://picsum.photos/seed/${r.user?.id}/40/40`} alt="" className="w-8 h-8 rounded-full" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm">{r.user?.name}</span>
                        <span className="flex">{Array.from({length: 5}).map((_, i) => <Star key={i} className={`w-3 h-3 ${i < r.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`} />)}</span>
                        <span className="text-xs text-slate-400">{timeAgo(r.createdAt)}</span>
                      </div>
                      <p className="text-sm text-slate-700">{r.comment}</p>
                      {r.product && <p className="text-xs amz-link mt-1">on: {r.product.name}</p>}
                    </div>
                    <div className="flex flex-col gap-1">
                      <Button size="sm" className="h-7 text-xs" onClick={() => toast.success('Review approved')}>Approve</Button>
                      <Button size="sm" variant="outline" className="h-7 text-red-600 text-xs" onClick={() => toast.success('Review removed')}><Flag className="w-3 h-3" /></Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="orders">
          {data.highValueOrders.length === 0 ? (
            <EmptyState icon={ShoppingCart} title="No high-value orders pending" description="Orders above 50,000 ETB will appear here for review." />
          ) : (
            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Vendor</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Review</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.highValueOrders.map((o: any) => (
                    <TableRow key={o.id}>
                      <TableCell className="font-mono text-xs">{o.orderNumber}</TableCell>
                      <TableCell className="text-sm">{o.customer?.name}</TableCell>
                      <TableCell className="text-sm">{o.vendor?.storeName}</TableCell>
                      <TableCell className="font-bold">{ETB(o.total)}</TableCell>
                      <TableCell className="text-xs text-slate-500">{timeAgo(o.createdAt)}</TableCell>
                      <TableCell><Button size="sm" variant="outline" className="h-7 text-xs"><MessageSquare className="w-3 h-3 mr-1" /> Inspect</Button></TableCell>
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
