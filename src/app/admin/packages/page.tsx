'use client'
import { useEffect, useState } from 'react'
import { LayoutDashboard, Users, Store, Package, Wallet, Settings, FileText, ShieldCheck, Crown, Plus, Pencil, Trash2, Save, X } from 'lucide-react'
import { DashboardShell } from '@/components/layout/dashboard-shell'
import { SectionHeader, EmptyState } from '@/components/dashboard/widgets'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { ETB } from '@/lib/helpers'
import { toast } from 'sonner'
import { Skeleton } from '@/components/ui/skeleton'

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

interface Pkg {
  id: string; name: string; slug: string; description: string | null;
  priceMonthly: number; priceYearly: number;
  productLimit: number; storageLimitMb: number; imageLimit: number; videoLimit: number;
  staffAccounts: number; warehouses: number; commissionRate: number;
  order: number; active: boolean; popular: boolean; features: string[];
}

const EMPTY_FORM = {
  name: '', slug: '', description: '', priceMonthly: '0', priceYearly: '0',
  productLimit: '50', storageLimitMb: '500', imageLimit: '5', videoLimit: '0',
  staffAccounts: '1', warehouses: '1', commissionRate: '10',
  order: '0', active: true, popular: false, features: '',
}

export default function AdminPackagesPage() {
  return <DashboardShell nav={NAV} title="Vendor Packages" role="admin" requiredRole="ADMIN"><PackagesContent /></DashboardShell>
}

function PackagesContent() {
  const [packages, setPackages] = useState<Pkg[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Pkg | null>(null)
  const [form, setForm] = useState<any>(EMPTY_FORM)

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      setLoading(true)
      const res = await fetch('/api/vendor-packages')
      const data = await res.json()
      if (!cancelled) { setPackages(data); setLoading(false) }
    }
    load()
    return () => { cancelled = true }
  }, [])

  const refresh = async () => {
    setLoading(true)
    const res = await fetch('/api/vendor-packages')
    const data = await res.json()
    setPackages(data)
    setLoading(false)
  }

  const openAdd = () => {
    setEditing(null)
    setForm(EMPTY_FORM)
    setOpen(true)
  }

  const openEdit = (p: Pkg) => {
    setEditing(p)
    setForm({
      name: p.name, slug: p.slug, description: p.description || '',
      priceMonthly: String(p.priceMonthly), priceYearly: String(p.priceYearly),
      productLimit: String(p.productLimit), storageLimitMb: String(p.storageLimitMb),
      imageLimit: String(p.imageLimit), videoLimit: String(p.videoLimit),
      staffAccounts: String(p.staffAccounts), warehouses: String(p.warehouses),
      commissionRate: String(p.commissionRate), order: String(p.order),
      active: p.active, popular: p.popular,
      features: p.features.join(', '),
    })
    setOpen(true)
  }

  const save = async () => {
    if (!form.name) { toast.error('Name required'); return }
    const body = {
      ...form,
      slug: form.slug || form.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      priceMonthly: Number(form.priceMonthly),
      priceYearly: Number(form.priceYearly),
      productLimit: Number(form.productLimit),
      storageLimitMb: Number(form.storageLimitMb),
      imageLimit: Number(form.imageLimit),
      videoLimit: Number(form.videoLimit),
      staffAccounts: Number(form.staffAccounts),
      warehouses: Number(form.warehouses),
      commissionRate: Number(form.commissionRate),
      order: Number(form.order),
      features: form.features ? form.features.split(',').map((s: string) => s.trim()).filter(Boolean) : [],
    }
    const res = await fetch('/api/vendor-packages', {
      method: editing ? 'PATCH' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editing ? { id: editing.id, ...body } : body),
    })
    if (res.ok) {
      toast.success(editing ? 'Package updated' : 'Package created')
      setOpen(false)
      refresh()
    } else {
      const d = await res.json()
      toast.error(d.error || 'Failed')
    }
  }

  const remove = async (id: string) => {
    if (!confirm('Delete this package? Existing subscriptions will be unaffected.')) return
    const res = await fetch(`/api/vendor-packages?id=${id}`, { method: 'DELETE' })
    if (res.ok) { toast.success('Package deleted'); refresh() }
  }

  if (loading) return <div className="space-y-3">{Array.from({length: 5}).map((_, i) => <Skeleton key={i} className="h-12" />)}</div>

  return (
    <div className="space-y-4">
      <SectionHeader title="Vendor Packages" description={`${packages.length} packages configured`} action={
        <Button className="amz-bg-yellow hover:bg-[#f7ca00] text-black" onClick={openAdd}><Plus className="w-4 h-4 mr-1" /> New Package</Button>
      } />

      {/* Package cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
        {packages.map(p => (
          <Card key={p.id} className={`p-4 ${p.popular ? 'border-2 border-amz-orange' : ''}`}>
            <div className="flex items-start justify-between mb-1">
              <div>
                <div className="font-bold">{p.name}</div>
                <div className="text-xs text-slate-500 capitalize">{p.slug}</div>
              </div>
              <div className="flex gap-1">
                {p.popular && <Badge className="bg-amz-orange text-white text-xs">Popular</Badge>}
                {!p.active && <Badge variant="outline" className="text-xs">Inactive</Badge>}
              </div>
            </div>
            <div className="text-2xl font-bold mb-1">{p.priceMonthly === 0 ? 'Custom' : ETB(p.priceMonthly)}<span className="text-xs text-slate-500 font-normal">/mo</span></div>
            <div className="text-xs text-slate-600 space-y-0.5">
              <div>{p.productLimit === -1 ? 'Unlimited' : p.productLimit} products</div>
              <div>{p.imageLimit === -1 ? 'Unlimited' : p.imageLimit} images/product</div>
              <div>{p.staffAccounts === -1 ? 'Unlimited' : p.staffAccounts} staff</div>
              <div>{p.commissionRate}% commission</div>
              {p.priceYearly > 0 && <div>Yearly: {ETB(p.priceYearly)}</div>}
            </div>
            <div className="text-xs text-slate-500 mt-2 line-clamp-2">{p.description}</div>
            <div className="flex gap-1 mt-3">
              <Button size="sm" variant="outline" className="flex-1" onClick={() => openEdit(p)}><Pencil className="w-3 h-3 mr-1" /> Edit</Button>
              <Button size="sm" variant="ghost" className="text-red-500" onClick={() => remove(p.id)}><Trash2 className="w-3 h-3" /></Button>
            </div>
          </Card>
        ))}
      </div>

      {/* Detail table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Package</TableHead>
              <TableHead>Monthly</TableHead>
              <TableHead>Yearly</TableHead>
              <TableHead>Products</TableHead>
              <TableHead>Images</TableHead>
              <TableHead>Staff</TableHead>
              <TableHead>Commission</TableHead>
              <TableHead>Active</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {packages.map(p => (
              <TableRow key={p.id}>
                <TableCell><div className="font-medium">{p.name}</div><div className="text-xs text-slate-500">{p.slug}</div></TableCell>
                <TableCell>{p.priceMonthly === 0 ? 'Custom' : ETB(p.priceMonthly)}</TableCell>
                <TableCell>{p.priceYearly === 0 ? '—' : ETB(p.priceYearly)}</TableCell>
                <TableCell>{p.productLimit === -1 ? '∞' : p.productLimit}</TableCell>
                <TableCell>{p.imageLimit === -1 ? '∞' : p.imageLimit}</TableCell>
                <TableCell>{p.staffAccounts === -1 ? '∞' : p.staffAccounts}</TableCell>
                <TableCell>{p.commissionRate}%</TableCell>
                <TableCell>{p.active ? <Badge className="bg-emerald-100 text-emerald-700">Yes</Badge> : <Badge variant="outline">No</Badge>}</TableCell>
                <TableCell>
                  <Button size="sm" variant="ghost" onClick={() => openEdit(p)}><Pencil className="w-4 h-4" /></Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editing ? 'Edit Package' : 'New Package'}</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Name *</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
            <div><Label>Slug (URL)</Label><Input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder="auto from name" /></div>
            <div className="col-span-2"><Label>Description</Label><Textarea rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
            <div><Label>Monthly Price (ETB)</Label><Input type="number" value={form.priceMonthly} onChange={(e) => setForm({ ...form, priceMonthly: e.target.value })} /></div>
            <div><Label>Yearly Price (ETB)</Label><Input type="number" value={form.priceYearly} onChange={(e) => setForm({ ...form, priceYearly: e.target.value })} /></div>
            <div><Label>Product Limit (-1 = unlimited)</Label><Input type="number" value={form.productLimit} onChange={(e) => setForm({ ...form, productLimit: e.target.value })} /></div>
            <div><Label>Storage Limit (MB)</Label><Input type="number" value={form.storageLimitMb} onChange={(e) => setForm({ ...form, storageLimitMb: e.target.value })} /></div>
            <div><Label>Image Limit per product</Label><Input type="number" value={form.imageLimit} onChange={(e) => setForm({ ...form, imageLimit: e.target.value })} /></div>
            <div><Label>Video Limit</Label><Input type="number" value={form.videoLimit} onChange={(e) => setForm({ ...form, videoLimit: e.target.value })} /></div>
            <div><Label>Staff Accounts</Label><Input type="number" value={form.staffAccounts} onChange={(e) => setForm({ ...form, staffAccounts: e.target.value })} /></div>
            <div><Label>Warehouses</Label><Input type="number" value={form.warehouses} onChange={(e) => setForm({ ...form, warehouses: e.target.value })} /></div>
            <div><Label>Commission Rate (%)</Label><Input type="number" step="0.1" value={form.commissionRate} onChange={(e) => setForm({ ...form, commissionRate: e.target.value })} /></div>
            <div><Label>Display Order</Label><Input type="number" value={form.order} onChange={(e) => setForm({ ...form, order: e.target.value })} /></div>
            <div className="col-span-2"><Label>Features (comma-separated)</Label><Input value={form.features} onChange={(e) => setForm({ ...form, features: e.target.value })} placeholder="basic_dashboard, chapa_payments, ..." /></div>
            <div className="col-span-2 flex gap-4">
              <label className="flex items-center gap-2"><Switch checked={form.active} onCheckedChange={(v) => setForm({ ...form, active: v })} /> Active</label>
              <label className="flex items-center gap-2"><Switch checked={form.popular} onCheckedChange={(v) => setForm({ ...form, popular: v })} /> Popular (highlighted on pricing page)</label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button className="amz-bg-yellow hover:bg-[#f7ca00] text-black" onClick={save}><Save className="w-4 h-4 mr-1" /> {editing ? 'Update' : 'Create'} Package</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
