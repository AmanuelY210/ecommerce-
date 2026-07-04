'use client'
import { useEffect, useState } from 'react'
import { Store, Package, ShoppingCart, Wallet, BarChart3, Tag, Settings, Plus, Pencil, Trash2, AlertTriangle } from 'lucide-react'
import { DashboardShell } from '@/components/layout/dashboard-shell'
import { SectionHeader, EmptyState } from '@/components/dashboard/widgets'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { ETB, statusColor } from '@/lib/helpers'
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

interface Product { id: string; name: string; price: number; comparePrice?: number | null; stock: number; lowStockAt: number; status: string; rating: number; sold: number; images: string[]; sku?: string | null; barcode?: string | null; categoryId: string; brandId?: string | null; description: string }
interface Category { id: string; name: string }
interface Brand { id: string; name: string }

export default function VendorProductsPage() {
  return <DashboardShell nav={NAV} title="Products" role="vendor" requiredRole="VENDOR"><ProductsContent /></DashboardShell>
}

function ProductsContent() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [brands, setBrands] = useState<Brand[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Product | null>(null)
  const [subscription, setSubscription] = useState<any>(null)
  const [form, setForm] = useState({
    name: '', description: '', price: '', comparePrice: '', stock: '', categoryId: '', brandId: '', sku: '', barcode: '', lowStockAt: '5',
  })

  useEffect(() => {
    fetch('/api/vendor/products').then(r => r.json()).then(d => { setProducts(d); setLoading(false) })
    fetch('/api/categories').then(r => r.json()).then(setCategories)
    fetch('/api/vendor/subscriptions').then(r => r.json()).then(setSubscription)
  }, [])

  // Fetch brands filtered by selected category in the product form
  useEffect(() => {
    let cancelled = false
    const catId = form.categoryId
    if (!catId) {
      // Defer to avoid cascading renders; only update if state has actually drifted
      Promise.resolve().then(() => {
        if (cancelled) return
        setBrands([])
        setForm(s => s.brandId ? { ...s, brandId: '' } : s)
      })
      return () => { cancelled = true }
    }
    fetch(`/api/brands?categoryId=${catId}`).then(r => r.json()).then(d => {
      if (cancelled) return
      setBrands(d)
      // Reset brand if it's not in the new list
      if (form.brandId && !d.some((b: Brand) => b.id === form.brandId)) {
        setForm(s => ({ ...s, brandId: '' }))
      }
    })
    return () => { cancelled = true }
  }, [form.categoryId])

  const atLimit = subscription && subscription.package.productLimit !== -1 && products.length >= subscription.package.productLimit

  const openAdd = () => {
    if (atLimit) {
      toast.error(`You've reached your package limit of ${subscription.package.productLimit} products. Upgrade your plan to add more.`)
      return
    }
    setEditing(null)
    setForm({ name: '', description: '', price: '', comparePrice: '', stock: '', categoryId: categories[0]?.id || '', brandId: '', sku: '', barcode: '', lowStockAt: '5' })
    setOpen(true)
  }

  const openEdit = (p: Product) => {
    setEditing(p)
    setForm({
      name: p.name, description: p.description, price: String(p.price), comparePrice: p.comparePrice ? String(p.comparePrice) : '',
      stock: String(p.stock), categoryId: p.categoryId, brandId: p.brandId || '', sku: p.sku || '', barcode: p.barcode || '', lowStockAt: String(p.lowStockAt),
    })
    setOpen(true)
  }

  const save = async () => {
    if (!form.name || !form.price || !form.categoryId) {
      toast.error('Name, price, and category are required')
      return
    }
    const body = {
      ...form,
      price: Number(form.price),
      comparePrice: form.comparePrice ? Number(form.comparePrice) : null,
      stock: Number(form.stock) || 0,
      lowStockAt: Number(form.lowStockAt) || 5,
      images: [`https://picsum.photos/seed/${encodeURIComponent(form.name)}${Date.now()}/600/600`, `https://picsum.photos/seed/${encodeURIComponent(form.name)}2/600/600`],
    }

    const res = await fetch('/api/vendor/products', {
      method: editing ? 'PATCH' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editing ? { id: editing.id, ...body } : body),
    })
    if (res.ok) {
      toast.success(editing ? 'Product updated' : 'Product added (pending approval)')
      setOpen(false)
      const updated = await fetch('/api/vendor/products').then(r => r.json())
      setProducts(updated)
    } else {
      const d = await res.json()
      toast.error(d.error || 'Failed')
    }
  }

  const remove = async (id: string) => {
    if (!confirm('Delete this product?')) return
    const res = await fetch(`/api/vendor/products?id=${id}`, { method: 'DELETE' })
    if (res.ok) {
      toast.success('Product deleted')
      setProducts(products.filter(p => p.id !== id))
    }
  }

  if (loading) return <div className="space-y-3">{Array.from({length: 5}).map((_, i) => <Skeleton key={i} className="h-12" />)}</div>

  return (
    <div className="space-y-4">
      <SectionHeader title="My Products" description={`${products.length}${subscription?.package?.productLimit !== -1 ? ` / ${subscription.package.productLimit}` : ''} products listed`} action={
        <div className="flex items-center gap-2">
          {atLimit && (
            <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">Limit reached — <a href="/vendor/pricing" className="underline ml-1">Upgrade</a></Badge>
          )}
          <Button className="amz-bg-yellow hover:bg-[#f7ca00] text-black" onClick={openAdd} disabled={atLimit}><Plus className="w-4 h-4 mr-1" /> Add Product</Button>
        </div>
      } />

      {products.length === 0 ? (
        <EmptyState icon={Package} title="No products yet" description="Add your first product to start selling." action={<Button className="amz-bg-yellow hover:bg-[#f7ca00] text-black" onClick={openAdd}><Plus className="w-4 h-4 mr-1" /> Add Product</Button>} />
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Sold</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map(p => (
                <TableRow key={p.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <img src={p.images?.[0]} alt="" className="w-10 h-10 rounded object-cover" />
                      <div className="min-w-0">
                        <div className="text-sm font-medium line-clamp-1">{p.name}</div>
                        <div className="text-xs text-slate-500">{p.sku || '—'}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell><div className="font-semibold text-sm">{ETB(p.price)}</div>{p.comparePrice && <div className="text-xs text-slate-400 line-through">{ETB(p.comparePrice)}</div>}</TableCell>
                  <TableCell><span className={p.stock <= p.lowStockAt ? 'text-red-600 font-semibold' : ''}>{p.stock}</span></TableCell>
                  <TableCell>{p.sold}</TableCell>
                  <TableCell><Badge variant="outline" className={statusColor(p.status)}>{p.status}</Badge></TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button size="sm" variant="ghost" onClick={() => openEdit(p)}><Pencil className="w-4 h-4" /></Button>
                      <Button size="sm" variant="ghost" className="text-red-500" onClick={() => remove(p.id)}><Trash2 className="w-4 h-4" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editing ? 'Edit Product' : 'Add Product'}</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <Label>Product Name *</Label>
              <Input value={form.name} onChange={(e) => setForm(s => ({...s, name: e.target.value}))} />
            </div>
            <div className="col-span-2">
              <Label>Description</Label>
              <Textarea rows={3} value={form.description} onChange={(e) => setForm(s => ({...s, description: e.target.value}))} />
            </div>
            <div>
              <Label>Price (ETB) *</Label>
              <Input type="number" value={form.price} onChange={(e) => setForm(s => ({...s, price: e.target.value}))} />
            </div>
            <div>
              <Label>Compare Price (optional)</Label>
              <Input type="number" value={form.comparePrice} onChange={(e) => setForm(s => ({...s, comparePrice: e.target.value}))} />
            </div>
            <div>
              <Label>Stock *</Label>
              <Input type="number" value={form.stock} onChange={(e) => setForm(s => ({...s, stock: e.target.value}))} />
            </div>
            <div>
              <Label>Low Stock Alert At</Label>
              <Input type="number" value={form.lowStockAt} onChange={(e) => setForm(s => ({...s, lowStockAt: e.target.value}))} />
            </div>
            <div>
              <Label>Category *</Label>
              <Select value={form.categoryId} onValueChange={(v) => setForm(s => ({...s, categoryId: v}))}>
                <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                <SelectContent>{categories.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label>Brand {form.categoryId ? `(${brands.length} available)` : '(select category first)'}</Label>
              <Select value={form.brandId} onValueChange={(v) => setForm(s => ({...s, brandId: v}))} disabled={!form.categoryId || brands.length === 0}>
                <SelectTrigger><SelectValue placeholder={form.categoryId ? (brands.length ? 'Select brand' : 'No brands for this category') : 'Select category first'} /></SelectTrigger>
                <SelectContent>{brands.map(b => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label>SKU</Label>
              <Input value={form.sku} onChange={(e) => setForm(s => ({...s, sku: e.target.value}))} />
            </div>
            <div>
              <Label>Barcode</Label>
              <Input value={form.barcode} onChange={(e) => setForm(s => ({...s, barcode: e.target.value}))} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button className="amz-bg-yellow hover:bg-[#f7ca00] text-black" onClick={save}>{editing ? 'Update' : 'Add'} Product</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
