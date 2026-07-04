'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Star, Truck, ShieldCheck, CreditCard, Headphones, ChevronRight, TrendingUp, Sparkles, Award, Zap } from 'lucide-react'
import { useT } from '@/hooks/use-t'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { StorefrontShell } from '@/components/layout/storefront-shell'
import { useCart } from '@/lib/store'
import { ETB } from '@/lib/helpers'
import { toast } from 'sonner'

interface Product { id: string; name: string; slug: string; price: number; comparePrice?: number | null; images: string[]; rating: number; reviewCount: number; sold: number; vendor?: { storeName: string; verified: boolean } | null }
interface Category { id: string; name: string; slug: string; icon?: string | null; image?: string | null }
interface Vendor { id: string; storeName: string; slug: string; logo?: string | null; verified: boolean; rating: number; reviewCount: number; totalOrders: number }
interface Banner { id: string; title: string; image: string; link?: string | null }

const CAT_ICONS: Record<string, any> = {
  Vehicles: '🚗', Electronics: '📱', Fashion: '👗', 'Home & Furniture': '🛋️',
  Appliances: '🌀', Grocery: '🛒', 'Health & Beauty': '💄', 'Sports & Outdoors': '⚽',
  Books: '📚', 'Office Supplies': '📎', 'Toys & Games': '🎮', 'Baby Products': '🍼',
  'Pet Supplies': '🐾', Agriculture: '🌾', 'Industrial & Construction': '🏗️',
  'Jewelry & Watches': '💎', 'Music & Instruments': '🎸', 'Arts & Crafts': '🎨',
  'Real Estate': '🏠', Services: '🛠️', 'Digital Products': '💾', 'Gift Shop': '🎁',
  'Wholesale & Bulk': '📦', 'Handmade & Local Products': '🤲', 'Marketplace Deals': '🏷️',
}

export default function HomePage() {
  const { t } = useT()
  const router = useRouter()
  const addToCart = useCart((s) => s.add)
  const [loading, setLoading] = useState(true)
  const [banners, setBanners] = useState<Banner[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [deals, setDeals] = useState<Product[]>([])
  const [featured, setFeatured] = useState<Product[]>([])
  const [newArrivals, setNewArrivals] = useState<Product[]>([])
  const [vendors, setVendors] = useState<Vendor[]>([])
  const [bannerIdx, setBannerIdx] = useState(0)

  useEffect(() => {
    Promise.all([
      fetch('/api/banners').then(r => r.json()),
      fetch('/api/categories').then(r => r.json()),
      fetch('/api/products?deals=1&limit=12').then(r => r.json()),
      fetch('/api/products?featured=1&limit=12').then(r => r.json()),
      fetch('/api/products?sort=newest&limit=12').then(r => r.json()),
      fetch('/api/vendors?top=1&limit=8').then(r => r.json()),
    ]).then(([b, c, d, f, n, v]) => {
      setBanners(b); setCategories(c); setDeals(d.products || []); setFeatured(f.products || []); setNewArrivals(n.products || []); setVendors(v)
      setLoading(false)
    })
  }, [])

  useEffect(() => {
    if (banners.length <= 1) return
    const id = setInterval(() => setBannerIdx(i => (i + 1) % banners.length), 5000)
    return () => clearInterval(id)
  }, [banners.length])

  const handleAddToCart = (p: Product) => {
    addToCart({
      productId: p.id, name: p.name, price: p.price,
      image: p.images?.[0], vendorId: p.vendor ? (p.vendor as any).id : undefined,
      vendorName: p.vendor?.storeName, qty: 1, slug: p.slug,
    })
    toast.success(`${p.name} added to cart`)
  }

  return (
    <StorefrontShell>
      {/* Hero Banner */}
      {banners.length > 0 && (
        <section className="bg-gradient-to-b from-[#232f3e] to-[#eaeded]">
          <div className="max-w-[1500px] mx-auto px-2 sm:px-4 pt-2">
            <div className="relative h-[260px] sm:h-[400px] rounded-lg overflow-hidden bg-slate-200">
              {banners.map((b, i) => (
                <Link
                  key={b.id}
                  href={b.link || '#'}
                  className={`absolute inset-0 transition-opacity duration-700 ${i === bannerIdx ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                >
                  <img src={b.image} alt={b.title} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent flex items-center">
                    <div className="px-6 sm:px-12 max-w-md text-white">
                      <h2 className="text-2xl sm:text-4xl font-bold mb-2 sm:mb-3">{b.title}</h2>
                      <p className="text-sm sm:text-base text-white/90 mb-4 hidden sm:block">{t('hero.subtitle')}</p>
                      <Button className="amz-bg-yellow hover:bg-[#f7ca00] text-black font-semibold">{t('hero.cta')} <ChevronRight className="w-4 h-4 ml-1" /></Button>
                    </div>
                  </div>
                </Link>
              ))}
              {banners.length > 1 && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                  {banners.map((_, i) => (
                    <button key={i} onClick={() => setBannerIdx(i)} className={`w-2 h-2 rounded-full transition-all ${i === bannerIdx ? 'bg-white w-6' : 'bg-white/50'}`} aria-label={`Slide ${i + 1}`} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      <div className="max-w-[1500px] mx-auto px-2 sm:px-4 py-4 sm:py-6 w-full">
        {/* Trust badges */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <TrustBadge icon={Truck} title="Fast Delivery" subtitle="Same-day in Addis Ababa" />
          <TrustBadge icon={ShieldCheck} title="Verified Vendors" subtitle="KYC-checked sellers" />
          <TrustBadge icon={CreditCard} title="Chapa + 19 Banks" subtitle="Pay your way" />
          <TrustBadge icon={Headphones} title="24/7 Support" subtitle="Amharic & English" />
        </div>

        {/* Categories */}
        <section className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Sparkles className="w-5 h-5 amz-text-yellow" /> {t('categories.title')}
            </h2>
            <Link href="/products" className="amz-link text-sm hover:underline">{t('categories.seeAll')} →</Link>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-9 gap-3">
            {loading ? (
              Array.from({length: 25}).map((_, i) => <Skeleton key={i} className="aspect-square rounded-lg" />)
            ) : (
              categories.map((c) => (
                <Link key={c.id} href={`/products?cat=${c.slug}`} className="bg-white border border-slate-200 rounded-lg p-3 hover:shadow-md hover:border-amz-orange transition-all flex flex-col items-center text-center group">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-slate-100 flex items-center justify-center text-2xl sm:text-3xl mb-2 group-hover:bg-amber-50">
                    {CAT_ICONS[c.name] || '📦'}
                  </div>
                  <div className="text-xs sm:text-sm font-medium line-clamp-2">{c.name}</div>
                </Link>
              ))
            )}
          </div>
        </section>

        {/* Today's Deals */}
        <section className="mb-8">
          <div className="bg-gradient-to-r from-red-50 to-amber-50 rounded-lg border border-red-100 p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
                  <Zap className="w-6 h-6 text-red-500" /> {t('deals.title')}
                </h2>
                <p className="text-xs text-slate-500 mt-1">Limited time offers — up to 40% off</p>
              </div>
              <Badge className="bg-red-500 hover:bg-red-500"><TrendingUp className="w-3 h-3 mr-1" /> Live</Badge>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {loading ? (
                Array.from({length: 6}).map((_, i) => <Skeleton key={i} className="aspect-[3/4] rounded-lg" />)
              ) : (
                deals.slice(0, 6).map((p) => (
                  <ProductCard key={p.id} product={p} onAdd={() => handleAddToCart(p)} />
                ))
              )}
            </div>
          </div>
        </section>

        {/* Featured */}
        <section className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Award className="w-5 h-5 amz-text-yellow" /> {t('featured.title')}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">{t('featured.subtitle')}</p>
            </div>
            <Link href="/products?featured=1" className="amz-link text-sm hover:underline">See more →</Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {loading ? (
              Array.from({length: 12}).map((_, i) => <Skeleton key={i} className="aspect-[3/4] rounded-lg" />)
            ) : (
              featured.slice(0, 12).map((p) => (
                <ProductCard key={p.id} product={p} onAdd={() => handleAddToCart(p)} />
              ))
            )}
          </div>
        </section>

        {/* Top Vendors */}
        <section className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Storefront2Icon /> {t('vendors.title')}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">{t('vendors.subtitle')}</p>
            </div>
            <Link href="/products" className="amz-link text-sm hover:underline">All vendors →</Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {loading ? (
              Array.from({length: 8}).map((_, i) => <Skeleton key={i} className="h-32 rounded-lg" />)
            ) : (
              vendors.slice(0, 8).map((v) => (
                <Link href={`/products?vendor=${v.id}`} key={v.id} className="bg-white border border-slate-200 rounded-lg p-4 hover:shadow-md hover:border-amz-orange transition-all">
                  <div className="flex items-center gap-3 mb-2">
                    <img src={v.logo || `https://picsum.photos/seed/${v.id}/80/80`} alt={v.storeName} className="w-12 h-12 rounded-full object-cover" />
                    <div className="min-w-0 flex-1">
                      <div className="font-semibold text-sm line-clamp-1 flex items-center gap-1">
                        {v.storeName}
                        {v.verified && <ShieldCheck className="w-3.5 h-3.5 text-blue-500 shrink-0" />}
                      </div>
                      <div className="text-xs text-slate-500 flex items-center gap-1">
                        <Star className="w-3 h-3 fill-amber-400 text-amber-400" /> {v.rating.toFixed(1)} · {v.totalOrders} orders
                      </div>
                    </div>
                  </div>
                  <div className="text-xs text-slate-600 line-clamp-2">{v.totalOrders}+ successful orders delivered across Ethiopia</div>
                </Link>
              ))
            )}
          </div>
        </section>

        {/* New Arrivals */}
        <section className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-xl font-bold">{t('new.title')}</h2>
              <p className="text-xs text-slate-500 mt-0.5">{t('new.subtitle')}</p>
            </div>
            <Link href="/products?sort=newest" className="amz-link text-sm hover:underline">See more →</Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {loading ? (
              Array.from({length: 12}).map((_, i) => <Skeleton key={i} className="aspect-[3/4] rounded-lg" />)
            ) : (
              newArrivals.slice(0, 12).map((p) => (
                <ProductCard key={p.id} product={p} onAdd={() => handleAddToCart(p)} />
              ))
            )}
          </div>
        </section>

        {/* Become a seller CTA */}
        <section className="mb-4">
          <div className="bg-gradient-to-r from-[#131921] to-[#232f3e] text-white rounded-lg p-6 sm:p-10 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex-1">
              <h2 className="text-2xl sm:text-3xl font-bold mb-2">Sell to all of Ethiopia</h2>
              <p className="text-white/80 text-sm sm:text-base mb-4">Reach millions of customers. Pay only 8-12% commission. Withdraw to any Ethiopian bank.</p>
              <div className="flex flex-wrap gap-4 text-xs text-white/70">
                <span>✓ Free store setup</span>
                <span>✓ Chapa & bank withdrawals</span>
                <span>✓ Vendor dashboard & analytics</span>
              </div>
            </div>
            <Button size="lg" className="amz-bg-yellow hover:bg-[#f7ca00] text-black font-bold" onClick={() => router.push('/vendor/pricing')}>
              {t('hero.cta2')} →
            </Button>
          </div>
        </section>
      </div>
    </StorefrontShell>
  )
}

function TrustBadge({ icon: Icon, title, subtitle }: { icon: any; title: string; subtitle: string }) {
  return (
    <div className="bg-white border border-slate-200 rounded-lg p-3 flex items-center gap-3">
      <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center shrink-0">
        <Icon className="w-5 h-5 text-amber-600" />
      </div>
      <div className="min-w-0">
        <div className="font-semibold text-sm">{title}</div>
        <div className="text-xs text-slate-500 truncate">{subtitle}</div>
      </div>
    </div>
  )
}

function ProductCard({ product, onAdd }: { product: Product; onAdd: () => void }) {
  const discount = product.comparePrice && product.comparePrice > product.price
    ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)
    : 0
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow border-slate-200 group cursor-pointer p-0">
      <Link href={`/products/${product.id}`} className="block">
        <div className="aspect-square bg-slate-50 overflow-hidden relative">
          <img src={product.images?.[0]} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
          {discount > 0 && (
            <span className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded">-{discount}%</span>
          )}
        </div>
      </Link>
      <div className="p-2 sm:p-3">
        <Link href={`/products/${product.id}`} className="block">
          <h3 className="text-xs sm:text-sm font-medium line-clamp-2 mb-1 hover:amz-link">{product.name}</h3>
        </Link>
        <div className="flex items-center gap-1 mb-1">
          <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
          <span className="text-xs text-slate-600">{product.rating.toFixed(1)}</span>
          <span className="text-xs text-slate-400">({product.reviewCount})</span>
        </div>
        <div className="flex items-baseline gap-1 mb-2">
          <span className="text-sm sm:text-base font-bold text-slate-900">{ETB(product.price)}</span>
          {product.comparePrice && product.comparePrice > product.price && (
            <span className="text-xs text-slate-400 line-through">{ETB(product.comparePrice)}</span>
          )}
        </div>
        <Button size="sm" className="w-full amz-bg-yellow hover:bg-[#f7ca00] text-black text-xs h-7" onClick={onAdd}>
          Add to Cart
        </Button>
      </div>
    </Card>
  )
}

function Storefront2Icon() {
  return <span className="text-lg">🏪</span>
}
