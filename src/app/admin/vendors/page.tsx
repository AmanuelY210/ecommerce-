'use client'
import { useEffect, useState } from 'react'
import { LayoutDashboard, Users, Store, Package, Wallet, Settings, FileText, ShieldCheck, Crown, Check, X, Pause, Play, Eye, Search, Building2, CreditCard, FileCheck, ExternalLink, Phone, MapPin, Mail, Calendar, DollarSign, Star, TrendingUp, AlertTriangle } from 'lucide-react'
import { DashboardShell } from '@/components/layout/dashboard-shell'
import { SectionHeader, EmptyState, StatCard } from '@/components/dashboard/widgets'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
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

interface Vendor {
  id: string
  storeName: string
  slug: string
  logo: string | null
  banner: string | null
  description: string | null
  businessType: string
  licenseNumber: string | null
  taxNumber: string | null
  verified: boolean
  status: string
  commissionRate: number
  rating: number
  reviewCount: number
  totalSales: number
  totalOrders: number
  balance: number
  pendingBalance: number
  createdAt: string
  user: { id: string; name: string; email: string; phone: string | null; avatar: string | null; createdAt: string; lastLoginAt: string | null }
  subscription: any | null
}

export default function AdminVendorsPage() {
  return <DashboardShell nav={NAV} title="Vendor Management" role="admin" requiredRole="ADMIN"><VendorsContent /></DashboardShell>
}

function VendorsContent() {
  const [vendors, setVendors] = useState<Vendor[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [viewing, setViewing] = useState<Vendor | null>(null)
  const [reviewNote, setReviewNote] = useState('')

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      setLoading(true)
      const res = await fetch('/api/admin/vendors?withSubscription=1')
      const data = await res.json()
      if (!cancelled) { setVendors(data); setLoading(false) }
    }
    load()
    return () => { cancelled = true }
  }, [])

  const refresh = async () => {
    const res = await fetch('/api/admin/vendors?withSubscription=1')
    const data = await res.json()
    setVendors(data)
  }

  const update = async (id: string, action: string, note?: string) => {
    const res = await fetch('/api/admin/vendors', {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, action, reviewNote: note }),
    })
    if (res.ok) {
      toast.success(`Vendor ${action}d`)
      setViewing(null)
      setReviewNote('')
      refresh()
    } else {
      toast.error('Failed')
    }
  }

  const filtered = vendors.filter(v => {
    const matchesFilter = filter === 'all' || v.status === filter.toUpperCase()
    const q = search.toLowerCase()
    const matchesSearch = !q || v.storeName.toLowerCase().includes(q) || v.user?.email.toLowerCase().includes(q) || v.user?.name.toLowerCase().includes(q) || (v.licenseNumber || '').toLowerCase().includes(q)
    return matchesFilter && matchesSearch
  })

  const counts = {
    all: vendors.length,
    pending: vendors.filter(v => v.status === 'PENDING').length,
    approved: vendors.filter(v => v.status === 'APPROVED').length,
    suspended: vendors.filter(v => v.status === 'SUSPENDED').length,
    rejected: vendors.filter(v => v.status === 'REJECTED').length,
  }

  if (loading) return <div className="space-y-3">{Array.from({length: 5}).map((_, i) => <Skeleton key={i} className="h-12" />)}</div>

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <StatCard label="Total Vendors" value={counts.all} icon={Store} color="bg-slate-700" />
        <StatCard label="Pending Review" value={counts.pending} icon={AlertTriangle} color="bg-amber-500" />
        <StatCard label="Approved" value={counts.approved} icon={Check} color="bg-emerald-500" />
        <StatCard label="Suspended" value={counts.suspended} icon={Pause} color="bg-red-500" />
        <StatCard label="Rejected" value={counts.rejected} icon={X} color="bg-slate-400" />
      </div>

      <SectionHeader title="Vendor Management" description="Review vendor applications, view documents, and manage vendor accounts" action={
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <Input placeholder="Search by store, owner, email, license..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 w-64" />
        </div>
      } />

      <Tabs value={filter} onValueChange={setFilter}>
        <TabsList>
          <TabsTrigger value="all">All ({counts.all})</TabsTrigger>
          <TabsTrigger value="pending">Pending ({counts.pending})</TabsTrigger>
          <TabsTrigger value="approved">Approved ({counts.approved})</TabsTrigger>
          <TabsTrigger value="suspended">Suspended ({counts.suspended})</TabsTrigger>
          <TabsTrigger value="rejected">Rejected ({counts.rejected})</TabsTrigger>
        </TabsList>

        <TabsContent value={filter}>
          {filtered.length === 0 ? (
            <EmptyState icon={Store} title="No vendors found" description="No vendors match your filters." />
          ) : (
            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Store</TableHead>
                    <TableHead>Owner</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Package</TableHead>
                    <TableHead>Sales</TableHead>
                    <TableHead>Rating</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map(v => (
                    <TableRow key={v.id} className="cursor-pointer hover:bg-slate-50" onClick={() => { setViewing(v); setReviewNote('') }}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <img src={v.logo || `https://picsum.photos/seed/${v.id}/40/40`} alt="" className="w-8 h-8 rounded-full object-cover" />
                          <div className="min-w-0">
                            <div className="font-medium text-sm line-clamp-1">{v.storeName}</div>
                            <div className="text-xs text-slate-500 line-clamp-1">{v.description || '—'}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">{v.user?.name}<div className="text-xs text-slate-500">{v.user?.email}</div></TableCell>
                      <TableCell><Badge variant="outline">{v.businessType}</Badge></TableCell>
                      <TableCell className="text-xs">
                        {v.subscription?.package ? (
                          <div>
                            <div className="font-medium">{v.subscription.package.name}</div>
                            <div className="text-slate-500">{ETB(v.subscription.amountPaid)} · {v.subscription.billingCycle}</div>
                          </div>
                        ) : <span className="text-slate-400">No subscription</span>}
                      </TableCell>
                      <TableCell className="text-sm"><div className="font-semibold">{ETB(v.totalSales)}</div><div className="text-xs text-slate-500">{v.totalOrders} orders</div></TableCell>
                      <TableCell className="text-sm">⭐ {v.rating.toFixed(1)}</TableCell>
                      <TableCell><Badge variant="outline" className={statusColor(v.status)}>{v.status}{v.verified && ' ✓'}</Badge></TableCell>
                      <TableCell className="text-xs text-slate-500">{timeAgo(v.createdAt)}</TableCell>
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <div className="flex gap-1 flex-wrap">
                          <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => { setViewing(v); setReviewNote('') }}><Eye className="w-3 h-3 mr-1" /> View</Button>
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

      {/* Vendor Details Dialog */}
      <Dialog open={!!viewing} onOpenChange={(v) => !v && setViewing(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {viewing && <VendorDetail vendor={viewing} reviewNote={reviewNote} setReviewNote={setReviewNote} onAction={update} />}
        </DialogContent>
      </Dialog>
    </div>
  )
}

function VendorDetail({ vendor, reviewNote, setReviewNote, onAction }: {
  vendor: Vendor
  reviewNote: string
  setReviewNote: (s: string) => void
  onAction: (id: string, action: string, note?: string) => void
}) {
  const sub = vendor.subscription
  const business = sub?.businessInfo
  const bank = sub?.bankInfo
  const store = sub?.storeInfo
  const docs = sub?.documents
  const pkg = sub?.package

  const docLabels: Record<string, { label: string; required: boolean }> = {
    nationalId: { label: 'National ID / Passport', required: true },
    businessLicense: { label: 'Business License', required: true },
    tinCertificate: { label: 'TIN Certificate', required: true },
    storePhoto: { label: 'Store Photo', required: false },
    selfieVerification: { label: 'Selfie Verification', required: false },
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2 pr-8">
          <img src={vendor.logo || `https://picsum.photos/seed/${vendor.id}/40/40`} alt="" className="w-8 h-8 rounded-full object-cover" />
          {vendor.storeName}
          <Badge variant="outline" className={statusColor(vendor.status)}>{vendor.status}{vendor.verified && ' ✓'}</Badge>
        </DialogTitle>
      </DialogHeader>

      <div className="space-y-4">
        {/* Top stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <div className="bg-slate-50 rounded p-2 text-center">
            <div className="text-xs text-slate-500">Total Sales</div>
            <div className="font-bold text-sm">{ETB(vendor.totalSales)}</div>
          </div>
          <div className="bg-slate-50 rounded p-2 text-center">
            <div className="text-xs text-slate-500">Orders</div>
            <div className="font-bold text-sm">{vendor.totalOrders}</div>
          </div>
          <div className="bg-slate-50 rounded p-2 text-center">
            <div className="text-xs text-slate-500">Rating</div>
            <div className="font-bold text-sm">⭐ {vendor.rating.toFixed(1)}</div>
          </div>
          <div className="bg-slate-50 rounded p-2 text-center">
            <div className="text-xs text-slate-500">Commission</div>
            <div className="font-bold text-sm">{vendor.commissionRate}%</div>
          </div>
        </div>

        {/* Owner / Account info */}
        <Section icon={Users} title="Account Owner">
          <div className="grid grid-cols-2 gap-2 text-sm">
            <Info icon={Users} label="Name" value={vendor.user?.name} />
            <Info icon={Mail} label="Email" value={vendor.user?.email} />
            <Info icon={Phone} label="Phone" value={vendor.user?.phone || '—'} />
            <Info icon={Calendar} label="Joined" value={new Date(vendor.user?.createdAt || vendor.createdAt).toLocaleDateString()} />
            <Info icon={Calendar} label="Last Login" value={vendor.user?.lastLoginAt ? timeAgo(vendor.user.lastLoginAt) : 'Never'} />
            <Info icon={Star} label="Reviews" value={`${vendor.reviewCount} reviews`} />
          </div>
        </Section>

        {/* Subscription / Package */}
        {pkg ? (
          <Section icon={Crown} title="Subscription">
            <div className="grid grid-cols-2 gap-2 text-sm">
              <Info icon={Crown} label="Package" value={pkg.name} />
              <Info icon={DollarSign} label="Amount Paid" value={ETB(sub.amountPaid)} />
              <Info icon={Calendar} label="Billing Cycle" value={sub.billingCycle} />
              <Info icon={Calendar} label="Started" value={sub.startedAt ? new Date(sub.startedAt).toLocaleDateString() : '—'} />
              <Info icon={Calendar} label="Expires" value={sub.expiresAt ? new Date(sub.expiresAt).toLocaleDateString() : '—'} />
              <Info icon={DollarSign} label="Commission Rate" value={`${pkg.commissionRate}%`} />
              <Info icon={Package} label="Product Limit" value={pkg.productLimit === -1 ? 'Unlimited' : String(pkg.productLimit)} />
              <Info icon={CreditCard} label="Payment Ref" value={sub.paymentRef || '—'} />
            </div>
            {pkg.features && pkg.features.length > 0 && (
              <div className="mt-2">
                <div className="text-xs text-slate-500 mb-1">Features</div>
                <div className="flex flex-wrap gap-1">
                  {pkg.features.map((f: string) => <Badge key={f} variant="outline" className="text-xs">{f.replace(/_/g, ' ')}</Badge>)}
                </div>
              </div>
            )}
          </Section>
        ) : (
          <Section icon={Crown} title="Subscription">
            <p className="text-sm text-slate-500">No active subscription. Vendor needs to purchase a package.</p>
          </Section>
        )}

        {/* Business info */}
        <Section icon={Building2} title="Business Information">
          {business ? (
            <div className="grid grid-cols-2 gap-2 text-sm">
              <Info icon={Building2} label="Business Name" value={business.businessName || vendor.storeName} />
              <Info icon={Building2} label="Business Type" value={business.businessType || vendor.businessType} />
              <Info icon={FileText} label="License Number" value={business.licenseNumber || vendor.licenseNumber || '—'} />
              <Info icon={FileText} label="TIN Number" value={business.tinNumber || vendor.taxNumber || '—'} />
              <Info icon={FileText} label="VAT Number" value={business.vatNumber || '—'} />
              <Info icon={MapPin} label="Postal Code" value={business.postalCode || '—'} />
              <Info icon={MapPin} label="Region" value={business.region || '—'} />
              <Info icon={MapPin} label="City" value={business.city || '—'} />
              <Info icon={MapPin} label="Sub-City" value={business.subCity || '—'} />
              <Info icon={MapPin} label="Woreda" value={business.woreda || '—'} />
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2 text-sm">
              <Info icon={Building2} label="Business Type" value={vendor.businessType} />
              <Info icon={FileText} label="License Number" value={vendor.licenseNumber || '—'} />
              <Info icon={FileText} label="TIN Number" value={vendor.taxNumber || '—'} />
            </div>
          )}
        </Section>

        {/* Bank info */}
        {bank && (
          <Section icon={CreditCard} title="Bank Information">
            <div className="grid grid-cols-2 gap-2 text-sm">
              <Info icon={CreditCard} label="Bank Name" value={bank.bankName || '—'} />
              <Info icon={Users} label="Account Holder" value={bank.accountHolder || '—'} />
              <Info icon={CreditCard} label="Account Number" value={bank.accountNumber || '—'} />
              <Info icon={Mail} label="Chapa Account" value={bank.chapaAccount || '—'} />
            </div>
          </Section>
        )}

        {/* Store info */}
        {store && (
          <Section icon={Store} title="Store Information">
            <div className="grid grid-cols-2 gap-2 text-sm">
              <Info icon={Store} label="Store Name" value={store.storeName || vendor.storeName} />
              <Info icon={Calendar} label="Business Hours" value={store.businessHours || '—'} />
              <Info icon={MapPin} label="Store Address" value={store.storeAddress || '—'} />
            </div>
            {store.storeDescription && (
              <div className="mt-2">
                <div className="text-xs text-slate-500 mb-1">Description</div>
                <p className="text-sm text-slate-700">{store.storeDescription}</p>
              </div>
            )}
            {vendor.banner && (
              <div className="mt-3">
                <div className="text-xs text-slate-500 mb-1">Store Banner</div>
                <img src={vendor.banner} alt="Store banner" className="w-full h-32 object-cover rounded" />
              </div>
            )}
          </Section>
        )}

        {/* Documents */}
        <Section icon={FileCheck} title="Uploaded Documents">
          {docs && Object.values(docs).some((v: any) => v) ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {Object.entries(docs).filter(([_, v]) => v).map(([key, url]) => {
                const meta = docLabels[key] || { label: key, required: false }
                const u = url as string
                const isPdf = u.toLowerCase().endsWith('.pdf')
                return (
                  <a key={key} href={u} target="_blank" rel="noopener noreferrer" className="border rounded overflow-hidden hover:shadow-md transition-shadow group">
                    <div className="aspect-video bg-slate-100 overflow-hidden relative">
                      {isPdf ? (
                        <div className="w-full h-full flex items-center justify-center">
                          <FileText className="w-12 h-12 text-red-500" />
                        </div>
                      ) : (
                        <img src={u} alt={meta.label} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                      )}
                      <div className="absolute top-1 right-1 bg-black/60 text-white rounded p-1">
                        <ExternalLink className="w-3 h-3" />
                      </div>
                    </div>
                    <div className="p-2">
                      <div className="text-xs font-medium flex items-center gap-1">{meta.label} {meta.required && <span className="text-red-500">*</span>}</div>
                      <div className="text-[10px] text-slate-500">{isPdf ? 'PDF document' : 'Image'} · Click to view full</div>
                    </div>
                  </a>
                )
              })}
            </div>
          ) : (
            <p className="text-sm text-slate-500">No documents uploaded.</p>
          )}
        </Section>

        {/* Review note + actions */}
        <div className="border-t pt-4">
          <Label>Review Note (visible to vendor)</Label>
          <Textarea rows={2} value={reviewNote} onChange={(e) => setReviewNote(e.target.value)} placeholder="e.g., Documents verified. Approved." className="mb-3" />
          <div className="flex gap-2 flex-wrap justify-end">
            {vendor.status === 'PENDING' && (
              <>
                <Button variant="outline" className="text-red-600" onClick={() => onAction(vendor.id, 'reject', reviewNote)}><X className="w-4 h-4 mr-1" /> Reject</Button>
                <Button className="amz-bg-yellow hover:bg-[#f7ca00] text-black" onClick={() => onAction(vendor.id, 'approve', reviewNote)}><Check className="w-4 h-4 mr-1" /> Approve Vendor</Button>
              </>
            )}
            {vendor.status === 'APPROVED' && (
              <Button variant="outline" className="text-amber-600" onClick={() => onAction(vendor.id, 'suspend', reviewNote)}><Pause className="w-4 h-4 mr-1" /> Suspend</Button>
            )}
            {vendor.status === 'SUSPENDED' && (
              <Button className="amz-bg-yellow hover:bg-[#f7ca00] text-black" onClick={() => onAction(vendor.id, 'reinstate', reviewNote)}><Play className="w-4 h-4 mr-1" /> Reinstate</Button>
            )}
            {vendor.status === 'REJECTED' && (
              <Button className="amz-bg-yellow hover:bg-[#f7ca00] text-black" onClick={() => onAction(vendor.id, 'approve', reviewNote)}><Check className="w-4 h-4 mr-1" /> Approve</Button>
            )}
          </div>
        </div>
      </div>
    </>
  )
}

function Section({ icon: Icon, title, children }: { icon: any; title: string; children: React.ReactNode }) {
  return (
    <div className="border rounded-lg p-3">
      <div className="flex items-center gap-2 mb-2">
        <Icon className="w-4 h-4 text-slate-500" />
        <h3 className="font-semibold text-sm">{title}</h3>
      </div>
      {children}
    </div>
  )
}

function Info({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="flex items-start gap-2">
      <Icon className="w-3.5 h-3.5 text-slate-400 mt-0.5 shrink-0" />
      <div className="min-w-0">
        <div className="text-xs text-slate-500">{label}</div>
        <div className="text-sm font-medium truncate">{value}</div>
      </div>
    </div>
  )
}
