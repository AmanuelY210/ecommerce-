'use client'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Star, ShoppingCart, Heart, Truck, ShieldCheck, RotateCcw, MapPin, Store, ChevronRight, Minus, Plus, Check, ThumbsUp } from 'lucide-react'
import { useT } from '@/hooks/use-t'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { StorefrontShell } from '@/components/layout/storefront-shell'
import { useCart, useAuth } from '@/lib/store'
import { ETB } from '@/lib/helpers'
import { toast } from 'sonner'

interface Review { id: string; rating: number; title?: string | null; comment: string; helpful: number; createdAt: string; user?: { name: string; avatar?: string | null } | null }
interface Product {
  id: string; name: string; slug: string; description: string;
  price: number; comparePrice?: number | null; stock: number; lowStockAt: number;
  images: string[]; rating: number; reviewCount: number; sold: number; sku?: string | null; barcode?: string | null;
  vendor?: any; category?: any; brand?: any; reviews: Review[]; related: any[];
}

export default function ProductDetailPage() {
  const { t } = useT()
  const router = useRouter()
  const params = useParams<{ id: string }>()
  const addToCart = useCart((s) => s.add)
  const user = useAuth((s) => s.user)
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [qty, setQty] = useState(1)
  const [activeImage, setActiveImage] = useState(0)
  const [newReview, setNewReview] = useState({ rating: 5, comment: '' })

  useEffect(() => {
    if (!params?.id) return
    fetch(`/api/products/${params.id}`).then(r => r.json()).then(d => {
      setProduct(d)
      setLoading(false)
    })
  }, [params?.id])

  const handleAddToCart = (buyNow = false) => {
    if (!product) return
    addToCart({
      productId: product.id, name: product.name, price: product.price,
      image: product.images?.[0], vendorId: product.vendor?.id,
      vendorName: product.vendor?.storeName, qty, slug: product.slug,
    })
    if (buyNow) {
      router.push('/checkout')
    } else {
      toast.success(`${product.name} added to cart`)
    }
  }

  const submitReview = async () => {
    if (!user) {
      toast.error('Please sign in to leave a review')
      router.push('/login?redirect=' + encodeURIComponent(`/products/${params.id}`))
      return
    }
    if (!newReview.comment.trim()) {
      toast.error('Please write a comment')
      return
    }
    const res = await fetch('/api/reviews', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId: product?.id, rating: newReview.rating, comment: newReview.comment }),
    })
    if (res.ok) {
      toast.success('Review submitted!')
      setNewReview({ rating: 5, comment: '' })
      // Refetch product to show new review
      const updated = await fetch(`/api/products/${params.id}`).then(r => r.json())
      setProduct(updated)
    } else {
      toast.error('Failed to submit review')
    }
  }

  if (loading) {
    return <StorefrontShell><div className="max-w-[1500px] mx-auto p-4"><Skeleton className="h-96 rounded-lg" /></div></StorefrontShell>
  }

  if (!product) {
    return <StorefrontShell><div className="max-w-[1500px] mx-auto p-12 text-center"><p>Product not found.</p><Button asChild><Link href="/products">Back to products</Link></Button></div></StorefrontShell>
  }

  const discount = product.comparePrice && product.comparePrice > product.price
    ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)
    : 0

  return (
    <StorefrontShell>
      <div className="max-w-[1500px] mx-auto px-2 sm:px-4 py-4 w-full">
        {/* Breadcrumb */}
        <div className="text-xs text-slate-500 mb-3 flex items-center gap-1 flex-wrap">
          <Link href="/" className="hover:underline">Home</Link><span>/</span>
          <Link href="/products" className="hover:underline">Products</Link><span>/</span>
          {product.category && (<><Link href={`/products?cat=${product.category.slug}`} className="hover:underline capitalize">{product.category.name}</Link><span>/</span></>)}
          <span className="text-slate-700 line-clamp-1">{product.name}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Images */}
          <div className="lg:col-span-5">
            <Card className="overflow-hidden p-0">
              <div className="aspect-square bg-slate-50">
                <img src={product.images[activeImage]} alt={product.name} className="w-full h-full object-cover" />
              </div>
            </Card>
            <div className="flex gap-2 mt-2 overflow-x-auto scroll-hidden">
              {product.images.map((img, i) => (
                <button key={i} onClick={() => setActiveImage(i)} className={`w-16 h-16 rounded border-2 overflow-hidden shrink-0 ${activeImage === i ? 'border-amz-orange' : 'border-slate-200'}`}>
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Buy box */}
          <div className="lg:col-span-4">
            <h1 className="text-lg sm:text-2xl font-medium mb-2">{product.name}</h1>
            <div className="flex items-center gap-3 mb-3 text-sm">
              <span className="flex items-center gap-1">
                <span className="flex">
                  {Array.from({length: 5}).map((_, i) => (
                    <Star key={i} className={`w-4 h-4 ${i < Math.round(product.rating) ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`} />
                  ))}
                </span>
                <span className="amz-link hover:underline">{product.rating.toFixed(1)} · {product.reviewCount} {t('product.reviews')}</span>
              </span>
              <span className="text-slate-400">|</span>
              <span className="text-slate-600">{product.sold}+ sold</span>
            </div>

            <hr className="my-3" />

            {/* Price */}
            <div className="mb-3">
              {discount > 0 && (
                <div className="flex items-center gap-2 mb-1">
                  <Badge className="bg-red-500 hover:bg-red-500">-{discount}%</Badge>
                  <span className="text-sm text-slate-500 line-through">{ETB(product.comparePrice!)}</span>
                </div>
              )}
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-bold text-red-600">{ETB(product.price)}</span>
              </div>
              <p className="text-xs text-slate-500 mt-1">VAT included (15%) · Free shipping over 5,000 ETB</p>
            </div>

            <hr className="my-3" />

            {/* Stock */}
            <div className="mb-3 text-sm">
              {product.stock > 0 ? (
                product.stock <= product.lowStockAt ? (
                  <span className="text-red-600 font-semibold">⚠ Only {product.stock} left in stock — order soon</span>
                ) : (
                  <span className="text-emerald-600 font-semibold flex items-center gap-1"><Check className="w-4 h-4" /> {t('product.inStock')}</span>
                )
              ) : (
                <span className="text-red-600 font-semibold">{t('product.outOfStock')}</span>
              )}
            </div>

            {/* Qty */}
            <div className="flex items-center gap-3 mb-4">
              <span className="text-sm font-medium">Quantity:</span>
              <div className="flex items-center border border-slate-300 rounded">
                <Button variant="ghost" size="sm" className="h-9 w-9 p-0" onClick={() => setQty(q => Math.max(1, q - 1))}><Minus className="w-3 h-3" /></Button>
                <span className="w-12 text-center font-semibold">{qty}</span>
                <Button variant="ghost" size="sm" className="h-9 w-9 p-0" onClick={() => setQty(q => Math.min(product.stock, q + 1))}><Plus className="w-3 h-3" /></Button>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-2">
              <Button className="w-full amz-bg-yellow hover:bg-[#f7ca00] text-black font-semibold h-12" onClick={() => handleAddToCart(false)} disabled={product.stock === 0}>
                <ShoppingCart className="w-5 h-5 mr-2" /> {t('product.addToCart')}
              </Button>
              <Button className="w-full amz-bg-orange hover:bg-[#e88a00] text-white font-semibold h-12" onClick={() => handleAddToCart(true)} disabled={product.stock === 0}>
                {t('product.buyNow')}
              </Button>
              <Button variant="outline" className="w-full h-10" onClick={() => toast.info('Added to wishlist')}>
                <Heart className="w-4 h-4 mr-2" /> {t('nav.wishlist')}
              </Button>
            </div>

            {/* Trust */}
            <div className="mt-4 space-y-2 text-sm">
              <div className="flex items-center gap-2 text-slate-600"><Truck className="w-4 h-4 text-emerald-600" /> Free delivery in Addis Ababa for orders over 5,000 ETB</div>
              <div className="flex items-center gap-2 text-slate-600"><RotateCcw className="w-4 h-4 text-blue-600" /> 7-day return policy</div>
              <div className="flex items-center gap-2 text-slate-600"><ShieldCheck className="w-4 h-4 text-purple-600" /> Genuine product · Vendor verified</div>
            </div>
          </div>

          {/* Vendor card */}
          <div className="lg:col-span-3">
            <Card className="p-4">
              <div className="text-xs text-slate-500 mb-2">{t('product.soldBy')}</div>
              {product.vendor && (
                <>
                  <Link href={`/products?vendor=${product.vendor.id}`} className="flex items-center gap-3 mb-3">
                    <img src={product.vendor.logo || `https://picsum.photos/seed/${product.vendor.id}/80/80`} alt="" className="w-12 h-12 rounded-full object-cover" />
                    <div className="min-w-0">
                      <div className="font-semibold text-sm flex items-center gap-1 line-clamp-1">
                        {product.vendor.storeName}
                        {product.vendor.verified && <ShieldCheck className="w-3.5 h-3.5 text-blue-500 shrink-0" />}
                      </div>
                      <div className="text-xs text-slate-500 flex items-center gap-1">
                        <Star className="w-3 h-3 fill-amber-400 text-amber-400" /> {product.vendor.rating.toFixed(1)} ({product.vendor.reviewCount})
                      </div>
                    </div>
                  </Link>
                  <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                    <div className="bg-slate-50 p-2 rounded">
                      <div className="text-slate-500">Total Sales</div>
                      <div className="font-semibold">{product.vendor.totalOrders}+ orders</div>
                    </div>
                    <div className="bg-slate-50 p-2 rounded">
                      <div className="text-slate-500">Joined</div>
                      <div className="font-semibold">2024</div>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="w-full" asChild>
                    <Link href={`/products?vendor=${product.vendor.id}`}><Store className="w-3 h-3 mr-1" /> {t('product.visitStore')}</Link>
                  </Button>
                </>
              )}
            </Card>

            <Card className="p-4 mt-3">
              <div className="text-xs font-semibold mb-2">Delivery</div>
              <div className="flex items-center gap-2 text-sm text-slate-600 mb-2">
                <MapPin className="w-4 h-4 text-slate-400" /> Addis Ababa
              </div>
              <p className="text-xs text-slate-500">Same-day delivery for orders before 2 PM in Addis Ababa. 2-4 days for regional delivery.</p>
            </Card>
          </div>
        </div>

        {/* Details tabs */}
        <div className="mt-8">
          <Tabs defaultValue="description">
            <TabsList>
              <TabsTrigger value="description">{t('product.description')}</TabsTrigger>
              <TabsTrigger value="specs">{t('product.specifications')}</TabsTrigger>
              <TabsTrigger value="reviews">Reviews ({product.reviewCount})</TabsTrigger>
            </TabsList>
            <TabsContent value="description">
              <Card className="p-6">
                <p className="text-sm text-slate-700 leading-relaxed">{product.description}</p>
              </Card>
            </TabsContent>
            <TabsContent value="specs">
              <Card className="p-6">
                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                  <div className="flex justify-between py-2 border-b"><dt className="text-slate-500">SKU</dt><dd className="font-medium">{product.sku || '—'}</dd></div>
                  <div className="flex justify-between py-2 border-b"><dt className="text-slate-500">Barcode</dt><dd className="font-medium">{product.barcode || '—'}</dd></div>
                  <div className="flex justify-between py-2 border-b"><dt className="text-slate-500">Brand</dt><dd className="font-medium">{product.brand?.name || '—'}</dd></div>
                  <div className="flex justify-between py-2 border-b"><dt className="text-slate-500">Category</dt><dd className="font-medium">{product.category?.name || '—'}</dd></div>
                  <div className="flex justify-between py-2 border-b"><dt className="text-slate-500">Stock</dt><dd className="font-medium">{product.stock} units</dd></div>
                  <div className="flex justify-between py-2 border-b"><dt className="text-slate-500">Sold</dt><dd className="font-medium">{product.sold}+ units</dd></div>
                </dl>
              </Card>
            </TabsContent>
            <TabsContent value="reviews">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="lg:col-span-2 space-y-3">
                  {product.reviews.length === 0 ? (
                    <Card className="p-6 text-center text-slate-500">No reviews yet. Be the first to review!</Card>
                  ) : (
                    product.reviews.map(r => (
                      <Card key={r.id} className="p-4">
                        <div className="flex items-start gap-3">
                          <img src={r.user?.avatar || `https://picsum.photos/seed/${r.user?.name || 'a'}/40/40`} alt="" className="w-9 h-9 rounded-full" />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-semibold text-sm">{r.user?.name || 'Anonymous'}</span>
                              <span className="flex">
                                {Array.from({length: 5}).map((_, i) => <Star key={i} className={`w-3 h-3 ${i < r.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`} />)}
                              </span>
                              <span className="text-xs text-slate-400 ml-auto">{new Date(r.createdAt).toLocaleDateString()}</span>
                            </div>
                            {r.title && <h4 className="font-medium text-sm mb-1">{r.title}</h4>}
                            <p className="text-sm text-slate-700">{r.comment}</p>
                            <button className="text-xs amz-link mt-2 flex items-center gap-1 hover:underline"><ThumbsUp className="w-3 h-3" /> Helpful ({r.helpful})</button>
                          </div>
                        </div>
                      </Card>
                    ))
                  )}
                </div>
                <Card className="p-4 h-fit">
                  <h3 className="font-semibold mb-3">Write a Review</h3>
                  <div className="mb-3">
                    <label className="text-xs text-slate-500 mb-1 block">Your Rating</label>
                    <div className="flex gap-1">
                      {[1,2,3,4,5].map(r => (
                        <button key={r} onClick={() => setNewReview(s => ({...s, rating: r}))}>
                          <Star className={`w-6 h-6 ${r <= newReview.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`} />
                        </button>
                      ))}
                    </div>
                  </div>
                  <Textarea
                    placeholder="Share your experience with this product..."
                    value={newReview.comment}
                    onChange={(e) => setNewReview(s => ({...s, comment: e.target.value}))}
                    className="mb-3"
                    rows={4}
                  />
                  <Button className="w-full amz-bg-yellow hover:bg-[#f7ca00] text-black" onClick={submitReview}>Submit Review</Button>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Related */}
        {product.related.length > 0 && (
          <div className="mt-8">
            <h2 className="text-lg font-bold mb-3">{t('product.relatedProducts')}</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
              {product.related.slice(0, 8).map(p => (
                <Link key={p.id} href={`/products/${p.id}`} className="block group">
                  <Card className="overflow-hidden p-0 hover:shadow-md transition-shadow">
                    <div className="aspect-square bg-slate-50 overflow-hidden">
                      <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                    </div>
                    <div className="p-2">
                      <h3 className="text-xs line-clamp-2 mb-1">{p.name}</h3>
                      <div className="text-sm font-bold text-slate-900">{ETB(p.price)}</div>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </StorefrontShell>
  )
}
