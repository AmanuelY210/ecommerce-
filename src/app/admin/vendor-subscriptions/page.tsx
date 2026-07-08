'use client'
import { useEffect, useState } from 'react'
import { LayoutDashboard, Users, Store, Package, Wallet, Settings, FileText, ShieldCheck, Crown, Check, X, Eye, Pause, Play, Clock, RefreshCw, Shield, ExternalLink } from 'lucide-react'
import { DashboardShell } from '@/components/layout/dashboard-shell'
import { SectionHeader, StatCard, EmptyState } from '@/components/dashboard/widgets'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { ETB, statusColor, timeAgo } from '@/lib/helpers'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'

const NAV = [
  { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { label: 'Users', href: '/admin/users', icon: Users },
  { label: 'Vendors', href: '/admin/vendors', icon: Store },
  { label: 'Products', href: '/admin/products', icon: Package },
  { label: 'Vendor Subscriptions', href: '/admin/vendor-subscriptions', icon: Crown },
  { label: 'Packages', href: '/admin/packages', icon: FileText },
  { label: 'Financial', href: '/admin/financial', icon: Wallet },
  { label: 'CMS', href: '/admin/cms', icon: FileText },
  { label: 'Settings', href: '/admin/settings', icon: Settings },
  { label: 'Security', href: '/admin/security', icon: ShieldCheck },
]

interface Sub {
  id: string
  status: string
  billingCycle: string
  amountPaid: number
  paymentRef: string | null
  paymentProvider: string | null
  paymentMethod: string | null
  startedAt: string | null
  expiresAt: string | null
  autoRenew: boolean
  businessInfo: any
  bankInfo: any
  storeInfo: any
  documents: any
  reviewNote: string | null
  reviewedAt: string | null
  createdAt: string
  vendor: { id: string; storeName: string; email: string; name: string }
  package: { id: string; name: string; productLimit: number; commissionRate: number; features: string[] }
}

export default function AdminVendorSubscriptionsPage() {
  return <DashboardShell nav={NAV} title="Vendor Subscriptions" role="admin" requiredRole="ADMIN"><SubsContent /></DashboardShell>
}

function SubsContent() {
  const [subs, setSubs] = useState<Sub[]>([])
  const [loading, setLoading] = useState(true)
  const [viewing, setViewing] = useState<Sub | null>(null)
  const [reviewNote, setReviewNote] = useState('')
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      setLoading(true)
      const res = await fetch('/api/admin/vendor-subscriptions')
      const data = await res.json()
      if (!cancelled) { setSubs(Array.isArray(data) ? data : []); setLoading(false) }
    }
    load()
    return () => { cancelled = true }
  }, [])

  const refresh = async () => {
    setLoading(true)
    const res = await fetch('/api/admin/vendor-subscriptions')
    const data = await res.json()
    setSubs(Array.isArray(data) ? data : [])
    setLoading(false)
  }

  const action = async (id: string, act: string) => {
    const res = await fetch('/api/admin/vendor-subscriptions', {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, action: act, reviewNote }),
    })
    if (res.ok) {
      toast.success(`Subscription ${act}d`)
      setViewing(null)
      setReviewNote('')
      refresh()
    } else {
      const d = await res.json()
      toast.error(d.error || 'Failed')
    }
  }

  const counts = {
    all: subs.length,
    pending: subs.filter(s => s.status === 'PENDING_APPROVAL').length,
    active: subs.filter(s => s.status === 'ACTIVE').length,
    expired: subs.filter(s => s.status === 'EXPIRED' || s.status === 'SUSPENDED').length,
    cancelled: subs.filter(s => s.status === 'CANCELLED').length,
  }

  const filtered = filter === 'all' ? subs : subs.filter(s => s.status === filter.toUpperCase().replace('-', '_'))

  if (loading) return <div className="space-y-3">{Array.from({length: 5}).map((_, i) => <Skeleton key={i} className="h-12" />)}</div>

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <StatCard label="Total" value={counts.all} icon={Crown} color="bg-slate-700" />
        <StatCard label="Pending Review" value={counts.pending} icon={Clock} color="bg-amber-500" />
        <StatCard label="Active" value={counts.active} icon={Check} color="bg-emerald-500" />
        <StatCard label="Expired/Suspended" value={counts.expired} icon={Pause} color="bg-red-500" />
        <StatCard label="Cancelled" value={counts.cancelled} icon={X} color="bg-slate-400" />
      </div>

      <SectionHeader title="Vendor Subscriptions" description="Review and approve vendor applications" />

      <Tabs value={filter} onValueChange={setFilter}>
        <TabsList>
          <TabsTrigger value="all">All ({counts.all})</TabsTrigger>
          <TabsTrigger value="pending-approval">Pending ({counts.pending})</TabsTrigger>
          <TabsTrigger value="active">Active ({counts.active})</TabsTrigger>
          <TabsTrigger value="expired">Expired/Suspended ({counts.expired})</TabsTrigger>
          <TabsTrigger value="cancelled">Cancelled ({counts.cancelled})</TabsTrigger>
        </TabsList>

        <TabsContent value={filter}>
          {filtered.length === 0 ? (
            <EmptyState icon={Crown} title="No subscriptions" description="No subscriptions in this category." />
          ) : (
            <Card>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b bg-slate-50">
                    <tr>
                      <th className="text-left p-3">Vendor</th>
                      <th className="text-left p-3">Package</th>
                      <th className="text-left p-3">Amount</th>
                      <th className="text-left p-3">Status</th>
                      <th className="text-left p-3">Submitted</th>
                      <th className="text-left p-3">Expires</th>
                      <th className="text-left p-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map(s => (
                      <tr key={s.id} className="border-b last:border-0 hover:bg-slate-50">
                        <td className="p-3">
                          <div className="font-medium">{s.vendor?.storeName || 'Unknown'}</div>
                          <div className="text-xs text-slate-500">{s.vendor?.email}</div>
                        </td>
                        <td className="p-3">
                          <div className="font-medium">{s.package?.name}</div>
                          <div className="text-xs text-slate-500">{s.billingCycle}</div>
                        </td>
                        <td className="p-3 font-semibold">{ETB(s.amountPaid)}</td>
                        <td className="p-3"><Badge variant="outline" className={statusColor(s.status)}>{s.status.replace(/_/g, ' ')}</Badge></td>
                        <td className="p-3 text-xs text-slate-500">{timeAgo(s.createdAt)}</td>
                        <td className="p-3 text-xs">{s.expiresAt ? new Date(s.expiresAt).toLocaleDateString() : '—'}</td>
                        <td className="p-3">
                          <div className="flex gap-1">
                            <Button size="sm" variant="outline" onClick={() => { setViewing(s); setReviewNote('') }}><Eye className="w-3 h-3 mr-1" /> Review</Button>
                            {s.status === 'PENDING_APPROVAL' && (
                              <>
                                <Button size="sm" className="h-7 text-xs amz-bg-yellow hover:bg-[#f7ca00] text-black" onClick={() => action(s.id, 'approve')}><Check className="w-3 h-3" /></Button>
                                <Button size="sm" variant="outline" className="h-7 text-red-600 text-xs" onClick={() => action(s.id, 'reject')}><X className="w-3 h-3" /></Button>
                              </>
                            )}
                            {s.status === 'ACTIVE' && (
                              <Button size="sm" variant="outline" className="h-7 text-amber-600 text-xs" onClick={() => action(s.id, 'suspend')}><Pause className="w-3 h-3" /></Button>
                            )}
                            {s.status === 'SUSPENDED' && (
                              <Button size="sm" variant="outline" className="h-7 text-emerald-600 text-xs" onClick={() => action(s.id, 'reactivate')}><Play className="w-3 h-3" /></Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Review dialog */}
      <Dialog open={!!viewing} onOpenChange={(v) => !v && setViewing(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          {viewing && (
            <>
              <DialogHeader>
                <DialogTitle>Review: {viewing.vendor?.storeName}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                {/* Package info */}
                <div className="border rounded p-3">
                  <div className="text-xs text-slate-500 uppercase mb-1">Subscription</div>
                  <div className="font-semibold">{viewing.package?.name} · {viewing.billingCycle}</div>
                  <div className="text-xs text-slate-500">
                    {ETB(viewing.amountPaid)} paid via {viewing.paymentProvider} · Ref: <span className="font-mono">{viewing.paymentRef}</span>
                  </div>
                  <div className="text-xs text-slate-500">
                    Products: {viewing.package?.productLimit === -1 ? 'Unlimited' : viewing.package?.productLimit} · Commission: {viewing.package?.commissionRate}%
                  </div>
                </div>
                {/* Business info */}
                <div className="border rounded p-3">
                  <div className="text-xs text-slate-500 uppercase mb-1">Business Information</div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div><span className="text-slate-500">Name:</span> {viewing.businessInfo?.businessName}</div>
                    <div><span className="text-slate-500">Type:</span> {viewing.businessInfo?.businessType}</div>
                    <div><span className="text-slate-500">License:</span> {viewing.businessInfo?.licenseNumber}</div>
                    <div><span className="text-slate-500">TIN:</span> {viewing.businessInfo?.tinNumber || '—'}</div>
                    <div><span className="text-slate-500">VAT:</span> {viewing.businessInfo?.vatNumber || '—'}</div>
                    <div><span className="text-slate-500">Postal:</span> {viewing.businessInfo?.postalCode || '—'}</div>
                    <div className="col-span-2"><span className="text-slate-500">Address:</span> {viewing.businessInfo?.subCity}, {viewing.businessInfo?.city}, {viewing.businessInfo?.region}</div>
                  </div>
                </div>
                {/* Bank info */}
                <div className="border rounded p-3">
                  <div className="text-xs text-slate-500 uppercase mb-1">Bank Information</div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div><span className="text-slate-500">Bank:</span> {viewing.bankInfo?.bankName}</div>
                    <div><span className="text-slate-500">Holder:</span> {viewing.bankInfo?.accountHolder}</div>
                    <div><span className="text-slate-500">Account:</span> {viewing.bankInfo?.accountNumber}</div>
                    <div><span className="text-slate-500">Chapa:</span> {viewing.bankInfo?.chapaAccount || '—'}</div>
                  </div>
                </div>
                {/* Store info */}
                <div className="border rounded p-3">
                  <div className="text-xs text-slate-500 uppercase mb-1">Store Information</div>
                  <div className="text-sm font-medium">{viewing.storeInfo?.storeName}</div>
                  <div className="text-xs text-slate-600">{viewing.storeInfo?.storeDescription}</div>
                  <div className="text-xs text-slate-500 mt-1">{viewing.storeInfo?.storeAddress} · {viewing.storeInfo?.businessHours}</div>
                </div>
                {/* Documents */}
                <div className="border rounded p-3">
                  <div className="text-xs text-slate-500 uppercase mb-2">Uploaded Documents — Click to view full size</div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {viewing.documents && Object.entries(viewing.documents).filter(([_, v]) => v).map(([k, v]) => {
                      const url = v as string
                      const isPdf = url.toLowerCase().endsWith('.pdf')
                      const labels: Record<string,string> = { nationalId: 'National ID', businessLicense: 'Business License', tinCertificate: 'TIN Certificate', storePhoto: 'Store Photo', selfieVerification: 'Selfie Verification' }
                      return (
                        <a key={k} href={url} target="_blank" rel="noopener noreferrer" className="border rounded overflow-hidden hover:shadow-md transition-shadow group block">
                          <div className="aspect-video bg-slate-100 overflow-hidden relative">
                            {isPdf ? (
                              <div className="w-full h-full flex items-center justify-center"><FileText className="w-10 h-10 text-red-500" /></div>
                            ) : (
                              <img src={url} alt={labels[k] || k} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                            )}
                            <div className="absolute top-1 right-1 bg-black/60 text-white rounded p-1"><ExternalLink className="w-3 h-3" /></div>
                          </div>
                          <div className="text-xs p-1.5 font-medium">{labels[k] || k}</div>
                        </a>
                      )
                    })}
                  </div>
                  {(!viewing.documents || Object.values(viewing.documents).every((v: any) => !v)) && (
                    <p className="text-xs text-slate-400 text-center py-2">No documents uploaded</p>
                  )}
                </div>
                {/* Payment Receipt */}
                <div className="border rounded p-3">
                  <div className="text-xs text-slate-500 uppercase mb-2">Payment Receipt</div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div><span className="text-slate-500">Amount Paid:</span> <span className="font-bold text-emerald-600">{ETB(viewing.amountPaid)}</span></div>
                    <div><span className="text-slate-500">Payment Ref:</span> <span className="font-mono text-xs">{viewing.paymentRef || '—'}</span></div>
                    <div><span className="text-slate-500">Provider:</span> <span className="capitalize">{viewing.paymentProvider || '—'}</span></div>
                    <div><span className="text-slate-500">Method:</span> <span className="capitalize">{viewing.paymentMethod || '—'}</span></div>
                    <div><span className="text-slate-500">Billing Cycle:</span> <span>{viewing.billingCycle || '—'}</span></div>
                    <div><span className="text-slate-500">Auto Renew:</span> <span>{viewing.autoRenew ? 'Yes' : 'No'}</span></div>
                  </div>
                </div>
                {/* Review note */}
                <div>
                  <Label>Review Note (visible to vendor)</Label>
                  <Textarea rows={2} value={reviewNote} onChange={(e) => setReviewNote(e.target.value)} placeholder="e.g., Documents verified. Approved." />
                </div>
              </div>
              <DialogFooter className="gap-2">
                {viewing.status === 'PENDING_APPROVAL' && (
                  <>
                    <Button variant="outline" className="text-red-600" onClick={() => action(viewing.id, 'reject')}><X className="w-4 h-4 mr-1" /> Reject</Button>
                    <Button className="amz-bg-yellow hover:bg-[#f7ca00] text-black" onClick={() => action(viewing.id, 'approve')}><Check className="w-4 h-4 mr-1" /> Approve & Activate</Button>
                  </>
                )}
                {viewing.status === 'ACTIVE' && (
                  <Button variant="outline" className="text-amber-600" onClick={() => action(viewing.id, 'suspend')}><Pause className="w-4 h-4 mr-1" /> Suspend</Button>
                )}
                {viewing.status === 'SUSPENDED' && (
                  <Button className="amz-bg-yellow hover:bg-[#f7ca00] text-black" onClick={() => action(viewing.id, 'reactivate')}><Play className="w-4 h-4 mr-1" /> Reactivate</Button>
                )}
                <Button variant="outline" onClick={() => action(viewing.id, 'extend')}><RefreshCw className="w-4 h-4 mr-1" /> Extend 30 days</Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
