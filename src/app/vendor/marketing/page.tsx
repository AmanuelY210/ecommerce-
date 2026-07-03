'use client'
import { Store, Package, ShoppingCart, Wallet, BarChart3, Tag, Settings, AlertTriangle, Plus, Sparkles, Percent, Gift } from 'lucide-react'
import { DashboardShell } from '@/components/layout/dashboard-shell'
import { SectionHeader, EmptyState } from '@/components/dashboard/widgets'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { useState } from 'react'
import { ETB } from '@/lib/helpers'
import { toast } from 'sonner'

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

const COUPONS = [
  { code: 'COFFEE15', type: 'PERCENT', value: 15, used: 6, limit: 200, expiresAt: '2026-09-01' },
  { code: 'WELCOME10', type: 'PERCENT', value: 10, used: 42, limit: 1000, expiresAt: '2026-10-01' },
]

export default function VendorMarketingPage() {
  return <DashboardShell nav={NAV} title="Marketing" role="vendor" requiredRole="VENDOR"><MarketingContent /></DashboardShell>
}

function MarketingContent() {
  const [coupons, setCoupons] = useState(COUPONS)
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({ code: '', type: 'PERCENT', value: '', minOrder: '', limit: '' })

  const create = () => {
    if (!form.code || !form.value) { toast.error('Code and value required'); return }
    const newCoupon = {
      code: form.code.toUpperCase(),
      type: form.type,
      value: Number(form.value),
      used: 0,
      limit: form.limit ? Number(form.limit) : null,
      expiresAt: '2026-12-31',
    }
    setCoupons([...coupons, newCoupon])
    toast.success('Coupon created')
    setOpen(false)
    setForm({ code: '', type: 'PERCENT', value: '', minOrder: '', limit: '' })
  }

  return (
    <div className="space-y-4">
      <SectionHeader title="Marketing Tools" description="Promote your products with coupons and flash sales" action={
        <Button className="amz-bg-yellow hover:bg-[#f7ca00] text-black" onClick={() => setOpen(true)}><Plus className="w-4 h-4 mr-1" /> Create Coupon</Button>
      } />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="p-4 bg-gradient-to-br from-amber-400 to-orange-500 text-white">
          <Gift className="w-8 h-8 mb-2" />
          <div className="font-bold text-lg">Flash Sale</div>
          <p className="text-sm text-white/90 mb-3">Run a 24-hour sale on selected products.</p>
          <Button variant="secondary" size="sm">Start Sale</Button>
        </Card>
        <Card className="p-4 bg-gradient-to-br from-purple-500 to-pink-500 text-white">
          <Sparkles className="w-8 h-8 mb-2" />
          <div className="font-bold text-lg">Featured Product</div>
          <p className="text-sm text-white/90 mb-3">Boost a product on homepage (fees apply).</p>
          <Button variant="secondary" size="sm">Feature Product</Button>
        </Card>
        <Card className="p-4 bg-gradient-to-br from-emerald-500 to-teal-600 text-white">
          <Tag className="w-8 h-8 mb-2" />
          <div className="font-bold text-lg">Free Shipping</div>
          <p className="text-sm text-white/90 mb-3">Offer free shipping on orders above a threshold.</p>
          <Button variant="secondary" size="sm">Configure</Button>
        </Card>
      </div>

      <SectionHeader title="Active Coupons" />
      {coupons.length === 0 ? (
        <EmptyState icon={Tag} title="No coupons" description="Create your first coupon to attract customers." />
      ) : (
        <Card>
          <div className="p-4 space-y-2">
            {coupons.map(c => (
              <div key={c.code} className="flex items-center justify-between border-b last:border-0 pb-3 last:pb-0">
                <div>
                  <div className="font-mono font-bold text-lg">{c.code}</div>
                  <div className="text-xs text-slate-500">
                    {c.type === 'PERCENT' ? `${c.value}% off` : `${ETB(c.value)} off`} · Min order: {ETB(Number(c.minOrder) || 0)} · Expires {c.expiresAt}
                  </div>
                </div>
                <div className="text-right">
                  <Badge variant="outline" className="bg-emerald-50 text-emerald-700">Active</Badge>
                  <div className="text-xs text-slate-500 mt-1">{c.used} / {c.limit || '∞'} used</div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Create Coupon</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Coupon Code</Label>
              <Input value={form.code} onChange={(e) => setForm(s => ({...s, code: e.target.value.toUpperCase()}))} placeholder="SUMMER20" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Type</Label>
                <Select value={form.type} onValueChange={(v) => setForm(s => ({...s, type: v}))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PERCENT"><Percent className="w-3 h-3 inline mr-1" /> Percentage</SelectItem>
                    <SelectItem value="FLAT">Flat Amount</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Value {form.type === 'PERCENT' ? '(%)' : '(ETB)'}</Label>
                <Input type="number" value={form.value} onChange={(e) => setForm(s => ({...s, value: e.target.value}))} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Min Order (ETB)</Label>
                <Input type="number" value={form.minOrder} onChange={(e) => setForm(s => ({...s, minOrder: e.target.value}))} />
              </div>
              <div>
                <Label>Usage Limit</Label>
                <Input type="number" value={form.limit} onChange={(e) => setForm(s => ({...s, limit: e.target.value}))} />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button className="amz-bg-yellow hover:bg-[#f7ca00] text-black" onClick={create}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
