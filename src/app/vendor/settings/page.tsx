'use client'
import { useEffect, useState } from 'react'
import { Store, Package, ShoppingCart, Wallet, BarChart3, Tag, Settings, AlertTriangle, Save, ShieldCheck } from 'lucide-react'
import { DashboardShell } from '@/components/layout/dashboard-shell'
import { SectionHeader } from '@/components/dashboard/widgets'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
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

export default function VendorSettingsPage() {
  return <DashboardShell nav={NAV} title="Store Settings" role="vendor" requiredRole="VENDOR"><SettingsContent /></DashboardShell>
}

function SettingsContent() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState<any>({})

  useEffect(() => {
    fetch('/api/vendor/stats').then(r => r.json()).then(d => {
      setData(d)
      setForm({
        storeName: d.vendor.storeName,
        description: d.vendor.description || '',
        logo: d.vendor.logo || '',
        banner: d.vendor.banner || '',
        businessType: d.vendor.businessType,
        licenseNumber: d.vendor.licenseNumber || '',
        taxNumber: d.vendor.taxNumber || '',
      })
      setLoading(false)
    })
  }, [])

  const save = () => {
    toast.success('Settings saved (demo)')
  }

  if (loading) return <Skeleton className="h-96" />

  const { vendor } = data

  return (
    <div className="space-y-4">
      <Card className="p-4">
        <div className="flex items-center gap-4">
          <img src={vendor.logo || `https://picsum.photos/seed/${vendor.id}/120/120`} alt="" className="w-20 h-20 rounded-full object-cover" />
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold">{vendor.storeName}</h2>
              {vendor.verified && <Badge className="bg-blue-500"><ShieldCheck className="w-3 h-3 mr-1" /> Verified</Badge>}
            </div>
            <p className="text-sm text-slate-500">Status: <Badge variant="outline" className="ml-1">{vendor.status}</Badge></p>
            <p className="text-xs text-slate-500 mt-1">Commission rate: {vendor.commissionRate}% · Rating: {vendor.rating.toFixed(1)}★</p>
          </div>
        </div>
      </Card>

      <Card className="p-4">
        <SectionHeader title="Store Profile" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <Label>Store Name</Label>
            <Input value={form.storeName || ''} onChange={(e) => setForm({ ...form, storeName: e.target.value })} />
          </div>
          <div>
            <Label>Business Type</Label>
            <Input value={form.businessType || ''} disabled />
          </div>
          <div className="col-span-2">
            <Label>Store Description</Label>
            <Textarea rows={3} value={form.description || ''} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
          <div>
            <Label>Logo URL</Label>
            <Input value={form.logo || ''} onChange={(e) => setForm({ ...form, logo: e.target.value })} />
          </div>
          <div>
            <Label>Banner URL</Label>
            <Input value={form.banner || ''} onChange={(e) => setForm({ ...form, banner: e.target.value })} />
          </div>
        </div>
      </Card>

      <Card className="p-4">
        <SectionHeader title="Business Verification" description="Tax and license information" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <Label>Business License Number</Label>
            <Input value={form.licenseNumber || ''} onChange={(e) => setForm({ ...form, licenseNumber: e.target.value })} disabled={vendor.verified} />
          </div>
          <div>
            <Label>Tax Identification Number (TIN)</Label>
            <Input value={form.taxNumber || ''} onChange={(e) => setForm({ ...form, taxNumber: e.target.value })} disabled={vendor.verified} />
          </div>
        </div>
        {!vendor.verified && (
          <div className="mt-3 p-3 bg-amber-50 rounded text-sm text-amber-800">
            <ShieldCheck className="w-4 h-4 inline mr-1" />
            Update your business documents to apply for verification badge.
          </div>
        )}
      </Card>

      <div className="flex justify-end">
        <Button className="amz-bg-yellow hover:bg-[#f7ca00] text-black" onClick={save}><Save className="w-4 h-4 mr-1" /> Save Changes</Button>
      </div>
    </div>
  )
}
