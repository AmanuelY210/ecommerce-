'use client'
import { Star } from 'lucide-react'
import { useT } from '@/hooks/use-t'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'

interface Category { id: string; name: string; slug: string }
interface Brand { id: string; name: string; slug: string }

export function FilterPanel({
  categories, brands, cat, brand, minPrice, maxPrice, minRating,
  updateParam, clearFilters,
}: {
  categories: Category[]
  brands: Brand[]
  cat: string
  brand: string
  minPrice: string
  maxPrice: string
  minRating: string
  updateParam: (k: string, v: string) => void
  clearFilters: () => void
}) {
  const { t } = useT()
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-sm">{t('product.filter.title')}</h3>
        <button onClick={clearFilters} className="text-xs amz-link hover:underline">Clear all</button>
      </div>
      <div>
        <Label className="text-xs font-semibold uppercase text-slate-500 mb-2 block">{t('product.filter.category')}</Label>
        <div className="space-y-2 max-h-48 overflow-y-auto scroll-pretty">
          {categories.map(c => (
            <label key={c.id} className="flex items-center gap-2 cursor-pointer text-sm">
              <Checkbox checked={cat === c.slug} onCheckedChange={() => updateParam('cat', cat === c.slug ? '' : c.slug)} />
              <span className="hover:amz-link">{c.name}</span>
            </label>
          ))}
        </div>
      </div>
      <div>
        <Label className="text-xs font-semibold uppercase text-slate-500 mb-2 block">{t('product.filter.price')} (ETB)</Label>
        <div className="grid grid-cols-2 gap-2">
          <Input placeholder="Min" type="number" value={minPrice} onChange={(e) => updateParam('minPrice', e.target.value)} className="h-8 text-sm" />
          <Input placeholder="Max" type="number" value={maxPrice} onChange={(e) => updateParam('maxPrice', e.target.value)} className="h-8 text-sm" />
        </div>
        <div className="grid grid-cols-2 gap-1 mt-2">
          {[[0, 1000], [1000, 5000], [5000, 15000], [15000, 0]].map(([min, max]) => (
            <button key={`${min}-${max}`} onClick={() => { updateParam('minPrice', String(min)); updateParam('maxPrice', max ? String(max) : '') }} className="text-xs px-2 py-1 border border-slate-200 rounded hover:bg-slate-50">
              {max ? `${min}-${max}` : `${min}+`}
            </button>
          ))}
        </div>
      </div>
      <div>
        <Label className="text-xs font-semibold uppercase text-slate-500 mb-2 block">{t('product.filter.rating')}</Label>
        <div className="space-y-1">
          {[4, 3, 2, 1].map(r => (
            <label key={r} className="flex items-center gap-2 cursor-pointer text-sm">
              <Checkbox checked={minRating === String(r)} onCheckedChange={() => updateParam('minRating', minRating === String(r) ? '' : String(r))} />
              <span className="flex items-center gap-0.5">
                {Array.from({length: 5}).map((_, i) => <Star key={i} className={`w-3 h-3 ${i < r ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`} />)}
                <span className="ml-1 text-xs">& up</span>
              </span>
            </label>
          ))}
        </div>
      </div>
      {brands.length > 0 && (
        <div>
          <Label className="text-xs font-semibold uppercase text-slate-500 mb-2 block">{t('product.filter.brand')}</Label>
          <div className="space-y-2 max-h-48 overflow-y-auto scroll-pretty">
            {brands.slice(0, 30).map(b => (
              <label key={b.id} className="flex items-center gap-2 cursor-pointer text-sm">
                <Checkbox checked={brand === b.slug} onCheckedChange={() => updateParam('brand', brand === b.slug ? '' : b.slug)} />
                <span className="hover:amz-link">{b.name}</span>
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
