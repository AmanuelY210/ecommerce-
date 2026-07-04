'use client'
import { useEffect, useState } from 'react'
import { Store, Package, ShoppingCart, Wallet, BarChart3, Tag, Settings, AlertTriangle, Plus, Minus, Save } from 'lucide-react'
import { DashboardShell } from '@/components/layout/dashboard-shell'
import { SectionHeader, EmptyState } from '@/components/dashboard/widgets'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { ETB } from '@/lib/helpers'
import { toast } from 'sonner'
import { Skeleton } from '@/components/ui/skeleton'

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

export default function VendorInventoryPage() {
  return <DashboardShell nav={NAV} title="Inventory" role="vendor" requiredRole="VENDOR"><InventoryContent /></DashboardShell>
}

function InventoryContent() {
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [edits, setEdits] = useState<Record<string, number>>({})

  useEffect(() => {
    fetch('/api/vendor/products').then(r => r.json()).then(d => { setProducts(d); setLoading(false) })
  }, [])

  const save = async (p: any) => {
    const newStock = edits[p.id] !== undefined ? edits[p.id] : p.stock
    const res = await fetch('/api/vendor/products', {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: p.id, stock: newStock }),
    })
    if (res.ok) {
      toast.success('Stock updated')
      setProducts(products.map(x => x.id === p.id ? { ...x, stock: newStock } : x))
      setEdits(s => { const n = { ...s }; delete n[p.id]; return n })
    }
  }

  const lowStock = products.filter(p => p.stock <= p.lowStockAt)
  const outOfStock = products.filter(p => p.stock === 0)

  if (loading) return <div className="space-y-3">{Array.from({length: 5}).map((_, i) => <Skeleton key={i} className="h-12" />)}</div>

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        <Card className="p-4">
          <div className="text-xs text-slate-500 uppercase">Total SKUs</div>
          <div className="text-2xl font-bold">{products.length}</div>
        </Card>
        <Card className="p-4">
          <div className="text-xs text-amber-600 uppercase">Low Stock</div>
          <div className="text-2xl font-bold text-amber-600">{lowStock.length}</div>
        </Card>
        <Card className="p-4">
          <div className="text-xs text-red-600 uppercase">Out of Stock</div>
          <div className="text-2xl font-bold text-red-600">{outOfStock.length}</div>
        </Card>
      </div>

      <SectionHeader title="Inventory Management" description="Adjust stock levels for your products" />

      {products.length === 0 ? (
        <EmptyState icon={Package} title="No products" description="Add products to manage inventory." />
      ) : (
        <Card className="p-4">
          <div className="space-y-2">
            {products.map(p => {
              const stock = edits[p.id] !== undefined ? edits[p.id] : p.stock
              const low = stock <= p.lowStockAt
              const out = stock === 0
              return (
                <div key={p.id} className="flex items-center gap-3 py-2 border-b last:border-0">
                  <img src={p.images?.[0]} alt="" className="w-12 h-12 rounded object-cover" />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm line-clamp-1">{p.name}</div>
                    <div className="text-xs text-slate-500">SKU: {p.sku || '—'} · Alert at: {p.lowStockAt}</div>
                  </div>
                  <Badge variant="outline" className={out ? 'bg-red-50 text-red-700' : low ? 'bg-amber-50 text-amber-700' : 'bg-emerald-50 text-emerald-700'}>
                    {out ? 'Out' : low ? 'Low' : 'OK'}
                  </Badge>
                  <div className="flex items-center border rounded">
                    <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={() => setEdits(s => ({...s, [p.id]: Math.max(0, stock - 1)}))}><Minus className="w-3 h-3" /></Button>
                    <Input className="w-16 h-8 text-center border-0 focus-visible:ring-0" type="number" value={stock} onChange={(e) => setEdits(s => ({...s, [p.id]: Number(e.target.value)}))} />
                    <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={() => setEdits(s => ({...s, [p.id]: stock + 1}))}><Plus className="w-3 h-3" /></Button>
                  </div>
                  {edits[p.id] !== undefined && (
                    <Button size="sm" className="h-8 amz-bg-yellow hover:bg-[#f7ca00] text-black" onClick={() => save(p)}><Save className="w-3 h-3" /></Button>
                  )}
                </div>
              )
            })}
          </div>
        </Card>
      )}
    </div>
  )
}
