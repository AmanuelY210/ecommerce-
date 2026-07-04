'use client'
import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Star, SlidersHorizontal, X } from 'lucide-react'
import { useT } from '@/hooks/use-t'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetHeader } from '@/components/ui/sheet'
import { StorefrontShell } from '@/components/layout/storefront-shell'
import { FilterPanel } from '@/components/storefront/filter-panel'
import { useCart } from '@/lib/store'
import { ETB } from '@/lib/helpers'
import { toast } from 'sonner'

interface Product { id: string; name: string; slug: string; price: number; comparePrice?: number | null; images: string[]; rating: number; reviewCount: number; sold: number; stock: number; vendor?: { id: string; storeName: string; verified: boolean } | null; brand?: { name: string } | null }
interface Category { id: string; name: string; slug: string }
interface Brand { id: string; name: string; slug: string }

function ProductsInner() {
  const { t } = useT()
  const router = useRouter()
  const sp = useSearchParams()
  const addToCart = useCart((s) => s.add)
  const [loading, setLoading] = useState(true)
  const [products, setProducts] = useState<Product[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [pages, setPages] = useState(1)
  const [categories, setCategories] = useState<Category[]>([])
  const [brands, setBrands] = useState<Brand[]>([])

  const q = sp.get('q') || ''
  const cat = sp.get('cat') || ''
  const brand = sp.get('brand') || ''
  const minPrice = sp.get('minPrice') || ''
  const maxPrice = sp.get('maxPrice') || ''
  const minRating = sp.get('minRating') || ''
  const sort = sp.get('sort') || 'relevance'
  const deals = sp.get('deals') === '1'
  const featured = sp.get('featured') === '1'

  // Fetch categories once
  useEffect(() => {
    fetch('/api/categories').then(r => r.json()).then(setCategories)
  }, [])

  // Fetch brands whenever the selected category changes (category-aware brand filter)
  useEffect(() => {
    const params = new URLSearchParams()
    if (cat) {
      // Find the category ID from slug
      const catRecord = categories.find(c => c.slug === cat || c.slug.startsWith(cat))
      if (catRecord) params.set('categoryId', catRecord.id)
    }
    fetch(`/api/brands?${params}`).then(r => r.json()).then(d => {
      setBrands(d)
      // If currently selected brand is not in the new list, clear it
      if (brand) {
        const stillExists = d.some((b: Brand) => b.slug === brand)
        if (!stillExists) {
          const next = new URLSearchParams(sp.toString())
          next.delete('brand')
          router.replace(`/products?${next.toString()}`)
        }
      }
    })
  }, [cat, categories])

  useEffect(() => {
    let cancelled = false
    const params = new URLSearchParams()
    if (q) params.set('q', q)
    if (cat) params.set('cat', cat)
    if (brand) params.set('brand', brand)
    if (minPrice) params.set('minPrice', minPrice)
    if (maxPrice) params.set('maxPrice', maxPrice)
    if (minRating) params.set('minRating', minRating)
    if (sort) params.set('sort', sort)
    if (deals) params.set('deals', '1')
    if (featured) params.set('featured', '1')
    if (page > 1) params.set('page', String(page))
    fetch(`/api/products?${params}`).then(r => r.json()).then(d => {
      if (cancelled) return
      setProducts(d.products || [])
      setTotal(d.total || 0)
      setPages(d.pages || 1)
      setLoading(false)
    })
    return () => { cancelled = true }
  }, [q, cat, brand, minPrice, maxPrice, minRating, sort, deals, featured, page])

  const updateParam = (key: string, value: string) => {
    const next = new URLSearchParams(sp.toString())
    if (value) next.set(key, value)
    else next.delete(key)
    setPage(1)
    router.push(`/products?${next.toString()}`)
  }

  const clearFilters = () => {
    router.push('/products')
    setPage(1)
  }

  const handleAddToCart = (p: Product) => {
    addToCart({
      productId: p.id, name: p.name, price: p.price,
      image: p.images?.[0], vendorId: p.vendor?.id,
      vendorName: p.vendor?.storeName, qty: 1, slug: p.slug,
    })
    toast.success(`${p.name} added to cart`)
  }

  const filterProps = { categories, brands, cat, brand, minPrice, maxPrice, minRating, updateParam, clearFilters }

  return (
    <StorefrontShell>
      <div className="max-w-[1500px] mx-auto px-2 sm:px-4 py-4 w-full">
        <div className="text-xs text-slate-500 mb-3 flex items-center gap-1">
          <Link href="/" className="hover:underline">Home</Link>
          <span>/</span>
          <span className="text-slate-700">Products</span>
          {cat && (<><span>/</span><span className="text-slate-700 capitalize">{cat.replace(/-/g, ' ')}</span></>)}
          {q && (<><span>/</span><span className="text-slate-700">"{q}"</span></>)}
        </div>
        <div className="flex gap-4">
          <aside className="hidden lg:block w-64 shrink-0">
            <Card className="p-4 sticky top-[120px]">
              <FilterPanel {...filterProps} />
            </Card>
          </aside>
          <main className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-4 gap-2">
              <div className="min-w-0">
                <h1 className="text-lg sm:text-xl font-bold">
                  {q ? `Results for "${q}"` : deals ? t('deals.title') : featured ? t('featured.title') : cat ? cat.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) : 'All Products'}
                </h1>
                <p className="text-xs text-slate-500">{loading ? 'Loading...' : `${total} results`}</p>
              </div>
              <div className="flex items-center gap-2">
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="outline" size="sm" className="lg:hidden">
                      <SlidersHorizontal className="w-4 h-4 mr-1" /> Filters
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="w-[300px] overflow-y-auto">
                    <SheetHeader><SheetTitle>Filters</SheetTitle></SheetHeader>
                    <div className="mt-4"><FilterPanel {...filterProps} /></div>
                  </SheetContent>
                </Sheet>
                <Select value={sort} onValueChange={(v) => updateParam('sort', v)}>
                  <SelectTrigger className="w-[180px] h-9 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="relevance">{t('product.sort.relevance')}</SelectItem>
                    <SelectItem value="priceLow">{t('product.sort.priceLow')}</SelectItem>
                    <SelectItem value="priceHigh">{t('product.sort.priceHigh')}</SelectItem>
                    <SelectItem value="newest">{t('product.sort.newest')}</SelectItem>
                    <SelectItem value="rating">{t('product.sort.rating')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            {(cat || brand || minPrice || maxPrice || minRating || deals || featured) && (
              <div className="flex flex-wrap gap-2 mb-3">
                {cat && <Badge variant="secondary" className="cursor-pointer" onClick={() => updateParam('cat', '')}>{cat.replace(/-/g, ' ')} <X className="w-3 h-3 ml-1" /></Badge>}
                {brand && <Badge variant="secondary" className="cursor-pointer" onClick={() => updateParam('brand', '')}>{brand} <X className="w-3 h-3 ml-1" /></Badge>}
                {minPrice && <Badge variant="secondary" className="cursor-pointer" onClick={() => updateParam('minPrice', '')}>Min: {minPrice} ETB <X className="w-3 h-3 ml-1" /></Badge>}
                {maxPrice && <Badge variant="secondary" className="cursor-pointer" onClick={() => updateParam('maxPrice', '')}>Max: {maxPrice} ETB <X className="w-3 h-3 ml-1" /></Badge>}
                {minRating && <Badge variant="secondary" className="cursor-pointer" onClick={() => updateParam('minRating', '')}>{minRating}★ & up <X className="w-3 h-3 ml-1" /></Badge>}
                {deals && <Badge variant="secondary" className="cursor-pointer" onClick={() => updateParam('deals', '')}>Deals <X className="w-3 h-3 ml-1" /></Badge>}
                {featured && <Badge variant="secondary" className="cursor-pointer" onClick={() => updateParam('featured', '')}>Featured <X className="w-3 h-3 ml-1" /></Badge>}
              </div>
            )}
            {loading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-3">
                {Array.from({length: 15}).map((_, i) => <Skeleton key={i} className="aspect-[3/4] rounded-lg" />)}
              </div>
            ) : products.length === 0 ? (
              <Card className="p-12 text-center">
                <p className="text-slate-500">No products found matching your filters.</p>
                <Button variant="outline" className="mt-4" onClick={clearFilters}>Clear filters</Button>
              </Card>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-3">
                {products.map(p => <ProductRow key={p.id} product={p} onAdd={() => handleAddToCart(p)} />)}
              </div>
            )}
            {pages > 1 && !loading && (
              <div className="flex justify-center gap-1 mt-6">
                {Array.from({length: Math.min(pages, 10)}).map((_, i) => (
                  <Button key={i} variant={page === i + 1 ? 'default' : 'outline'} size="sm" onClick={() => { setPage(i + 1); window.scrollTo({top: 0, behavior: 'smooth'}) }}>
                    {i + 1}
                  </Button>
                ))}
              </div>
            )}
          </main>
        </div>
      </div>
    </StorefrontShell>
  )
}

function ProductRow({ product, onAdd }: { product: Product; onAdd: () => void }) {
  const discount = product.comparePrice && product.comparePrice > product.price
    ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)
    : 0
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow border-slate-200 group p-0">
      <Link href={`/products/${product.id}`} className="block">
        <div className="aspect-square bg-slate-50 overflow-hidden relative">
          <img src={product.images?.[0]} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
          {discount > 0 && <span className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded">-{discount}%</span>}
          {product.stock === 0 && <span className="absolute inset-0 bg-black/40 flex items-center justify-center text-white text-sm font-semibold">Out of Stock</span>}
        </div>
      </Link>
      <div className="p-2 sm:p-3">
        <Link href={`/products/${product.id}`} className="block">
          <h3 className="text-xs sm:text-sm font-medium line-clamp-2 mb-1 hover:amz-link min-h-[2.5rem]">{product.name}</h3>
        </Link>
        <div className="flex items-center gap-1 mb-1 text-xs">
          <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
          <span className="text-slate-600">{product.rating.toFixed(1)}</span>
          <span className="text-slate-400">({product.reviewCount})</span>
        </div>
        <div className="flex items-baseline gap-1 mb-1">
          <span className="text-sm sm:text-base font-bold text-slate-900">{ETB(product.price)}</span>
          {product.comparePrice && product.comparePrice > product.price && (
            <span className="text-xs text-slate-400 line-through">{ETB(product.comparePrice)}</span>
          )}
        </div>
        {product.vendor && (
          <div className="text-xs text-slate-500 mb-2 truncate">{product.vendor.storeName}{product.vendor.verified && ' ✓'}</div>
        )}
        <Button size="sm" className="w-full amz-bg-yellow hover:bg-[#f7ca00] text-black text-xs h-7" onClick={onAdd} disabled={product.stock === 0}>
          {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
        </Button>
      </div>
    </Card>
  )
}

export default function ProductsPage() {
  return <Suspense fallback={<div className="min-h-screen" />}><ProductsInner /></Suspense>
}
