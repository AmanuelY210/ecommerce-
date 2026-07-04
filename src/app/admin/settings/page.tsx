'use client'
import { useEffect, useState } from 'react'
import { LayoutDashboard, Users, Store, Package, Wallet, Settings, FileText, ShieldCheck, Save, Database, Globe, Percent } from 'lucide-react'
import { DashboardShell } from '@/components/layout/dashboard-shell'
import { SectionHeader } from '@/components/dashboard/widgets'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { toast } from 'sonner'
import { Skeleton } from '@/components/ui/skeleton'
import { SHIPPING_ZONES } from '@/lib/ethiopia-geo'

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

export default function AdminSettingsPage() {
  return <DashboardShell nav={NAV} title="Marketplace Settings" role="admin" requiredRole="ADMIN"><SettingsContent /></DashboardShell>
}

function SettingsContent() {
  const [settings, setSettings] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState<any>({})

  useEffect(() => {
    fetch('/api/settings').then(r => r.json()).then(d => {
      setSettings(d)
      setForm({
        site_name: d.site_name || 'ETMarket',
        currency: d.currency || 'ETB',
        default_commission: d.default_commission || '10',
        min_withdrawal: d.min_withdrawal || '1000',
        support_email: d.support_email || '',
        support_phone: d.support_phone || '',
        maintenance_mode: d.maintenance_mode === 'true',
      })
      setLoading(false)
    })
  }, [])

  const save = async () => {
    const res = await fetch('/api/settings', {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, maintenance_mode: String(form.maintenance_mode) }),
    })
    if (res.ok) toast.success('Settings saved')
  }

  if (loading) return <Skeleton className="h-96" />

  return (
    <div className="space-y-4">
      <Card className="p-4">
        <SectionHeader title="General" description="Marketplace-wide configuration" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div><Label>Site Name</Label><Input value={form.site_name || ''} onChange={(e) => setForm({ ...form, site_name: e.target.value })} /></div>
          <div><Label>Currency</Label><Input value={form.currency || ''} onChange={(e) => setForm({ ...form, currency: e.target.value })} /></div>
          <div><Label>Default Commission (%)</Label><Input type="number" value={form.default_commission || ''} onChange={(e) => setForm({ ...form, default_commission: e.target.value })} /></div>
          <div><Label>Min Withdrawal (ETB)</Label><Input type="number" value={form.min_withdrawal || ''} onChange={(e) => setForm({ ...form, min_withdrawal: e.target.value })} /></div>
          <div><Label>Support Email</Label><Input value={form.support_email || ''} onChange={(e) => setForm({ ...form, support_email: e.target.value })} /></div>
          <div><Label>Support Phone</Label><Input value={form.support_phone || ''} onChange={(e) => setForm({ ...form, support_phone: e.target.value })} /></div>
        </div>
        <div className="mt-3 flex items-center gap-2">
          <Switch checked={form.maintenance_mode} onCheckedChange={(v) => setForm({ ...form, maintenance_mode: v })} />
          <Label>Maintenance Mode (blocks customer access)</Label>
        </div>
      </Card>

      <Card className="p-4">
        <SectionHeader title="Payment Configuration" description="Chapa and bank integration settings" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div><Label>Chapa Secret Key</Label><Input type="password" defaultValue="CHASECK_TEST_xxxxx" /></div>
          <div><Label>Chapa Public Key</Label><Input defaultValue="CHAPUBK_TEST_xxxxx" /></div>
          <div className="col-span-2"><Label>Webhook URL</Label><Input defaultValue="https://etmarket.et/api/payment/webhook" readOnly /></div>
        </div>
        <p className="text-xs text-slate-500 mt-2">💡 This MVP uses mock payment verification. To enable live Chapa payments, add your API keys.</p>
      </Card>

      <Card className="p-4">
        <SectionHeader title="Shipping Zones" />
        <div className="space-y-2">
          {SHIPPING_ZONES.map(z => (
            <div key={z.name} className="flex items-center justify-between border-b last:border-0 pb-2 last:pb-0">
              <div className="min-w-0">
                <div className="text-sm font-medium">{z.name}</div>
                <div className="text-xs text-slate-500">{z.regions.join(', ')}</div>
                <div className="text-xs text-slate-500">Delivery: {z.estimatedDays} · {z.baseFee} ETB · Free over {z.freeThreshold.toLocaleString()} ETB</div>
              </div>
              <Button size="sm" variant="outline">Edit</Button>
            </div>
          ))}
        </div>
      </Card>

      <div className="flex justify-end">
        <Button className="amz-bg-yellow hover:bg-[#f7ca00] text-black" onClick={save}><Save className="w-4 h-4 mr-1" /> Save Settings</Button>
      </div>
    </div>
  )
}
