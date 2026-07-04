'use client'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Star, ShieldCheck, Package, TrendingUp, MapPin, Clock, Store, ChevronRight, Award, ShoppingBag } from 'lucide-react'
import { useT } from '@/hooks/use-t'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { StorefrontShell } from '@/components/layout/storefront-shell'
import { useCart } from '@/lib/store'
import { ETB } from '@/lib/helpers'
import { toast } from 'sonner'

export default function VendorProfilePage() {
  const { t } = useT()
  const router = useRouter()
  const params = useParams<{ id: string }>()
  const addToCart = useCart((s) => s.add)
  const [vendor, setVendor] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!params?.id) return
    fetch(`/api/vendors/${params.id}`).then(r => {
      if (!r.ok) { router.push('/vendors'); return null }
      return r.json()
    }).then(d => {
      if (d) { setVendor(d); setLoading(false) }
    })
  }, [params?.id, router])

  const handleAddToCart = (p: any) => {
    addToCart({
      productId: p.id, name: p.name, price: p.price,
      image: p.images?.[0], vendorId: vendor?.id,
      vendorName: vendor?.storeName, qty: 1, slug: p.slug,
    })
    toast.success(`${p.name} added to cart`)
  }

  if (loading) {
    return <StorefrontShell><div className="max-w-[1200px] mx-auto p-4"><Skeleton className="h-64 rounded-lg mb-4" /><Skeleton className="h-96 rounded-lg" /></div></StorefrontShell>
  }

  if (!vendor) {
    return <StorefrontShell><div className="max-w-md mx-auto p-12 text-center"><p>Vendor not found.</p><Button asChild><Link href="/vendors">Browse Vendors</Link></Button></div></StorefrontShell>
  }

  const packageBadge: Record<string, { label: string; color: string }> = {
    starter: { label: 'Starter Plan', color: 'bg-blue-50 text-blue-700 border-blue-200' },
    professional: { label: 'Professional Plan', color: 'bg-purple-50 text-purple-700 border-purple-200' },
    business: { label: 'Business Plan', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    enterprise: { label: 'Enterprise Plan', color: 'bg-amber-50 text-amber-700 border-amber-200' },
  }
  const pkg = vendor.package?.slug ? packageBadge[vendor.package.slug] : null

  return (
    <StorefrontShell>
      <div className="max-w-[1200px] mx-auto px-2 sm:px-4 py-4 w-full">
        {/* Breadcrumb */}
        <div className="text-xs text-slate-500 mb-3 flex items-center gap-1">
          <Link href="/" className="hover:underline">Home</Link><span>/</span>
          <Link href="/vendors" className="hover:underline">Vendors</Link><span>/</span>
          <span className="text-slate-700">{vendor.storeName}</span>
        </div>

        {/* Banner + Logo */}
        <Card className="overflow-hidden p-0 mb-4">
          <div className="h-40 sm:h-56 bg-slate-200 relative">
            {vendor.banner && <img src={vendor.banner} alt="" className="w-full h-full object-cover" />}
          </div>
          <div className="px-4 sm:px-6 pb-4">
            <div className="flex items-end gap-4 -mt-12 mb-3">
              <img src={vendor.logo || `https://picsum.photos/seed/${vendor.id}/120/120`} alt={vendor.storeName} className="w-20 h-20 sm:w-24 sm:h-24 rounded-full border-4 border-white object-cover shadow-lg shrink-0" />
              <div className="flex-1 min-w-0 pb-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-xl sm:text-2xl font-bold">{vendor.storeName}</h1>
                  {vendor.verified && <Badge className="bg-blue-500 hover:bg-blue-500"><ShieldCheck className="w-3 h-3 mr-1" /> Verified</Badge>}
                  {pkg && <Badge variant="outline" className={pkg.color}><Award className="w-3 h-3 mr-1" /> {pkg.label}</Badge>}
                </div>
                <div className="flex items-center gap-3 text-sm text-slate-600 mt-1 flex-wrap">
                  <span className="flex items-center gap-1"><Star className="w-4 h-4 fill-amber-400 text-amber-400" /> {vendor.rating.toFixed(1)} · {vendor.reviewCount} reviews</span>
                  <span className="flex items-center gap-1"><TrendingUp className="w-4 h-4" /> {vendor.totalOrders} orders</span>
                  <span className="flex items-center gap-1"><Package className="w-4 h-4" /> {vendor.products.length} products</span>
                </div>
              </div>
            </div>

            {/* Description + Store info */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-2">
              <div className="lg:col-span-2">
                <h3 className="font-semibold text-sm mb-1">About this store</h3>
                <p className="text-sm text-slate-600 leading-relaxed">{vendor.description || 'No description available.'}</p>
                <div className="flex items-center gap-4 mt-3 text-xs text-slate-500 flex-wrap">
                  {vendor.storeAddress && <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {vendor.storeAddress}</span>}
                  {vendor.businessHours && <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {vendor.businessHours}</span>}
                  <span className="flex items-center gap-1"><Store className="w-3.5 h-3.5" /> Member since {new Date(vendor.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
              <div className="bg-slate-50 rounded-lg p-3 text-center">
                <div className="text-xs text-slate-500 uppercase mb-1">Total Sales</div>
                <div className="text-2xl font-bold">{ETB(vendor.totalSales)}</div>
                <div className="text-xs text-slate-500 mt-2 mb-1">Business Type</div>
                <Badge variant="outline">{vendor.businessType}</Badge>
              </div>
            </div>
          </div>
        </Card>

        {/* Products */}
        <div className="mb-4">
          <h2 className="text-lg font-bold mb-3 flex items-center gap-2"><ShoppingBag className="w-5 h-5" /> Products from {vendor.storeName}</h2>
          {vendor.products.length === 0 ? (
            <Card className="p-8 text-center text-slate-500">This vendor hasn't listed any products yet.</Card>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {vendor.products.map((p: any) => {
                const discount = p.comparePrice && p.comparePrice > p.price ? Math.round(((p.comparePrice - p.price) / p.comparePrice) * 100) : 0
                return (
                  <Card key={p.id} className="overflow-hidden hover:shadow-lg transition-shadow group p-0">
                    <Link href={`/products/${p.id}`} className="block">
                      <div className="aspect-square bg-slate-50 overflow-hidden relative">
                        <img src={p.images?.[0]} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                        {discount > 0 && <span className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded">-{discount}%</span>}
                        {p.stock === 0 && <span className="absolute inset-0 bg-black/40 flex items-center justify-center text-white text-sm font-semibold">Out of Stock</span>}
                      </div>
                    </Link>
                    <div className="p-2 sm:p-3">
                      <Link href={`/products/${p.id}`}><h3 className="text-xs sm:text-sm font-medium line-clamp-2 mb-1 hover:amz-link min-h-[2.5rem]">{p.name}</h3></Link>
                      <div className="flex items-center gap-1 mb-1 text-xs">
                        <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                        <span className="text-slate-600">{p.rating?.toFixed(1) || '0.0'}</span>
                      </div>
                      <div className="flex items-baseline gap-1 mb-2">
                        <span className="text-sm font-bold">{ETB(p.price)}</span>
                        {p.comparePrice && p.comparePrice > p.price && <span className="text-xs text-slate-400 line-through">{ETB(p.comparePrice)}</span>}
                      </div>
                      <Button size="sm" className="w-full amz-bg-yellow hover:bg-[#f7ca00] text-black text-xs h-7" onClick={() => handleAddToCart(p)} disabled={p.stock === 0}>
                        {p.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                      </Button>
                    </div>
                  </Card>
                )
              })}
            </div>
          )}
        </div>

        {/* Customer Reviews */}
        {vendor.reviews && vendor.reviews.length > 0 && (
          <div className="mb-4">
            <h2 className="text-lg font-bold mb-3 flex items-center gap-2"><Star className="w-5 h-5" /> Customer Reviews</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {vendor.reviews.map((r: any) => (
                <Card key={r.id} className="p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <img src={r.user?.avatar || `https://picsum.photos/seed/${r.user?.name || 'a'}/40/40`} alt="" className="w-8 h-8 rounded-full" />
                    <div>
                      <div className="font-medium text-xs">{r.user?.name || 'Anonymous'}</div>
                      <div className="flex">{Array.from({length: 5}).map((_, i) => <Star key={i} className={`w-3 h-3 ${i < r.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`} />)}</div>
                    </div>
                    <span className="text-xs text-slate-400 ml-auto">{new Date(r.createdAt).toLocaleDateString()}</span>
                  </div>
                  <p className="text-xs text-slate-600">{r.comment}</p>
                  {r.product && <p className="text-xs amz-link mt-1">on: {r.product.name}</p>}
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </StorefrontShell>
  )
}
