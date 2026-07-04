'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Star, Search, ShieldCheck, Package, TrendingUp, Store, ChevronRight, MapPin } from 'lucide-react'
import { useT } from '@/hooks/use-t'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { StorefrontShell } from '@/components/layout/storefront-shell'
import { ETB } from '@/lib/helpers'

interface Vendor {
  id: string; storeName: string; slug: string; logo: string | null; banner: string | null;
  description: string | null; businessType: string; verified: boolean;
  rating: number; reviewCount: number; totalSales: number; totalOrders: number;
  packageName: string | null; packageSlug: string | null;
  productCount: number; sampleProducts: any[];
}

export default function VendorsPage() {
  const { t } = useT()
  const [vendors, setVendors] = useState<Vendor[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState('sales')
  const [filter, setFilter] = useState('all') // all | verified | unverified

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      setLoading(true)
      const params = new URLSearchParams()
      if (search) params.set('q', search)
      params.set('limit', '100')
      const res = await fetch(`/api/vendors?${params}`)
      const d = await res.json()
      if (!cancelled) { setVendors(d); setLoading(false) }
    }
    load()
    return () => { cancelled = true }
  }, [search])

  // Filter by verification status
  const filtered = vendors.filter(v => {
    if (filter === 'verified') return v.verified
    if (filter === 'unverified') return !v.verified
    return true
  })

  // Sort: verified vendors always first, then by the requested sort order
  const sorted = [...filtered].sort((a, b) => {
    // Verified vendors always come first
    if (a.verified !== b.verified) return a.verified ? -1 : 1
    // Then sort by the selected criteria
    if (sort === 'sales') return b.totalSales - a.totalSales
    if (sort === 'rating') return b.rating - a.rating
    if (sort === 'orders') return b.totalOrders - a.totalOrders
    if (sort === 'name') return a.storeName.localeCompare(b.storeName)
    if (sort === 'products') return b.productCount - a.productCount
    return 0
  })

  const verifiedCount = vendors.filter(v => v.verified).length
  const unverifiedCount = vendors.filter(v => !v.verified).length

  const packageBadge: Record<string, { label: string; color: string }> = {
    starter: { label: 'Starter', color: 'bg-blue-50 text-blue-700' },
    professional: { label: 'Professional', color: 'bg-purple-50 text-purple-700' },
    business: { label: 'Business', color: 'bg-emerald-50 text-emerald-700' },
    enterprise: { label: 'Enterprise', color: 'bg-amber-50 text-amber-700' },
  }

  return (
    <StorefrontShell>
      <div className="max-w-[1500px] mx-auto px-2 sm:px-4 py-6 w-full">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold mb-1">All Vendors</h1>
          <p className="text-sm text-slate-500">Browse all paid vendors across Ethiopia. Verified vendors are shown first with a blue badge.</p>
        </div>

        {/* Search + Sort + Filter */}
        <div className="flex gap-2 mb-4 flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input placeholder="Search vendors by name or description..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
          </div>
          <Select value={sort} onValueChange={setSort}>
            <SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="sales">Sort: Top Sales</SelectItem>
              <SelectItem value="rating">Sort: Highest Rated</SelectItem>
              <SelectItem value="orders">Sort: Most Orders</SelectItem>
              <SelectItem value="products">Sort: Most Products</SelectItem>
              <SelectItem value="name">Sort: Name A-Z</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Verification filter tabs */}
        <div className="flex gap-2 mb-4">
          <Button size="sm" variant={filter === 'all' ? 'default' : 'outline'} onClick={() => setFilter('all')} className="text-xs">
            All ({vendors.length})
          </Button>
          <Button size="sm" variant={filter === 'verified' ? 'default' : 'outline'} onClick={() => setFilter('verified')} className="text-xs">
            <ShieldCheck className="w-3.5 h-3.5 mr-1 text-blue-500" /> Verified ({verifiedCount})
          </Button>
          <Button size="sm" variant={filter === 'unverified' ? 'default' : 'outline'} onClick={() => setFilter('unverified')} className="text-xs">
            Unverified ({unverifiedCount})
          </Button>
        </div>

        {/* Vendor count */}
        <p className="text-xs text-slate-500 mb-4">{loading ? 'Loading...' : `${sorted.length} vendors found`}</p>

        {/* Vendor grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({length: 6}).map((_, i) => <Skeleton key={i} className="h-64 rounded-lg" />)}
          </div>
        ) : sorted.length === 0 ? (
          <Card className="p-12 text-center">
            <Store className="w-16 h-16 mx-auto text-slate-300 mb-4" />
            <p className="text-slate-500 mb-4">No vendors found matching your search.</p>
            <Button variant="outline" onClick={() => setSearch('')}>Clear search</Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {sorted.map(v => {
              const pkg = v.packageSlug ? packageBadge[v.packageSlug] : null
              return (
                <Link key={v.id} href={`/vendors/${v.slug}`}>
                  <Card className={`overflow-hidden hover:shadow-lg transition-all group h-full ${v.verified ? 'border-blue-200' : ''}`}>
                    {/* Banner */}
                    <div className="h-24 bg-slate-200 relative overflow-hidden">
                      {v.banner && <img src={v.banner} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />}
                      {/* Logo overlapping */}
                      <div className="absolute -bottom-6 left-4">
                        <img src={v.logo || `https://picsum.photos/seed/${v.id}/80/80`} alt={v.storeName} className="w-12 h-12 rounded-full border-2 border-white object-cover" />
                      </div>
                      {/* Badges */}
                      <div className="absolute top-2 right-2 flex gap-1">
                        {v.verified && <Badge className="bg-blue-500 hover:bg-blue-500 text-white text-xs"><ShieldCheck className="w-3 h-3 mr-0.5" /> Verified</Badge>}
                        {pkg && <Badge className={pkg.color}>{pkg.label}</Badge>}
                      </div>
                    </div>
                    {/* Body */}
                    <div className="p-4 pt-8">
                      <div className="flex items-center gap-1 mb-1">
                        <h3 className="font-bold text-sm line-clamp-1 flex-1">{v.storeName}</h3>
                        {!v.verified && <Badge variant="outline" className="text-xs text-slate-500">Unverified</Badge>}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-500 mb-2">
                        <span className="flex items-center gap-0.5"><Star className="w-3 h-3 fill-amber-400 text-amber-400" /> {v.rating.toFixed(1)} ({v.reviewCount})</span>
                        <span>·</span>
                        <span className="flex items-center gap-0.5"><Package className="w-3 h-3" /> {v.productCount} products</span>
                        <span>·</span>
                        <span className="flex items-center gap-0.5"><TrendingUp className="w-3 h-3" /> {v.totalOrders} orders</span>
                      </div>
                      <p className="text-xs text-slate-600 line-clamp-2 mb-3">{v.description || 'No description available'}</p>
                      {/* Sample products */}
                      {v.sampleProducts.length > 0 && (
                        <div className="flex gap-1 mb-3">
                          {v.sampleProducts.slice(0, 4).map(p => (
                            <div key={p.id} className="w-12 h-12 rounded bg-slate-100 overflow-hidden shrink-0">
                              <img src={p.images?.[0]} alt={p.name} className="w-full h-full object-cover" />
                            </div>
                          ))}
                        </div>
                      )}
                      <Button size="sm" variant="outline" className="w-full text-xs">Visit Store <ChevronRight className="w-3 h-3 ml-1" /></Button>
                    </div>
                  </Card>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </StorefrontShell>
  )
}
