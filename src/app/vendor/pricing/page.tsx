'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Check, X, Star, Zap, Crown, Rocket, Building2, ArrowRight, Shield, TrendingUp, Sparkles } from 'lucide-react'
import { useT } from '@/hooks/use-t'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { StorefrontShell } from '@/components/layout/storefront-shell'
import { useAuth } from '@/lib/store'
import { ETB } from '@/lib/helpers'

interface Pkg {
  id: string; name: string; slug: string; description: string | null;
  priceMonthly: number; priceYearly: number;
  productLimit: number; imageLimit: number; videoLimit: number;
  staffAccounts: number; warehouses: number; commissionRate: number;
  popular: boolean; features: string[];
}

const FEATURE_LABELS: Record<string, string> = {
  basic_dashboard: 'Basic Dashboard',
  basic_analytics: 'Basic Analytics',
  advanced_analytics: 'Advanced Analytics',
  premium_analytics: 'Premium Analytics',
  chapa_payments: 'Chapa Payments',
  email_support: 'Email Support',
  priority_support: 'Priority Support',
  vip_support: 'VIP Support',
  standard_commission: 'Standard Commission (10%)',
  lower_commission: 'Lower Commission (8%)',
  lowest_commission: 'Lowest Commission (5%)',
  custom_commission: 'Custom Commission',
  promotions: 'Promotions',
  coupons: 'Coupons',
  store_banner: 'Store Banner',
  priority_approval: 'Priority Approval',
  featured_products: 'Featured Products',
  featured_store: 'Featured Store',
  unlimited_products: 'Unlimited Products',
  unlimited_categories: 'Unlimited Categories',
  unlimited_everything: 'Unlimited Everything',
  api_access: 'API Access',
  bulk_upload: 'Bulk Upload',
  advanced_reports: 'Advanced Reports',
  store_verification_badge: 'Store Verification Badge',
  multiple_store_managers: 'Multiple Store Managers',
  multiple_warehouses: 'Multiple Warehouses',
  dedicated_account_manager: 'Dedicated Account Manager',
  custom_integrations: 'Custom Integrations',
  erp_integration: 'ERP Integration',
  highest_search_ranking: 'Highest Search Ranking',
}

const PKG_ICONS: Record<string, any> = {
  starter: Rocket, professional: Zap, business: Crown, enterprise: Building2,
}

export default function VendorPricingPage() {
  const { t } = useT()
  const router = useRouter()
  const user = useAuth((s) => s.user)
  const [packages, setPackages] = useState<Pkg[]>([])
  const [loading, setLoading] = useState(true)
  const [billingCycle, setBillingCycle] = useState<'MONTHLY' | 'YEARLY'>('MONTHLY')

  useEffect(() => {
    fetch('/api/vendor-packages').then(r => r.json()).then(d => {
      setPackages(Array.isArray(d) ? d : [])
      setLoading(false)
    })
  }, [])

  const handleChoose = (pkg: Pkg) => {
    if (!user) {
      router.push(`/register?role=VENDOR&package=${pkg.slug}`)
    } else if (user.role === 'VENDOR') {
      router.push(`/vendor/register?package=${pkg.slug}`)
    } else {
      router.push(`/register?role=VENDOR&package=${pkg.slug}`)
    }
  }

  return (
    <StorefrontShell>
      <div className="max-w-[1400px] mx-auto px-4 py-8 w-full">
        {/* Hero */}
        <div className="text-center mb-10">
          <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100 mb-3">Sell to all of Ethiopia</Badge>
          <h1 className="text-3xl sm:text-5xl font-bold mb-3">Become a Vendor on ETMarket</h1>
          <p className="text-slate-600 text-lg max-w-2xl mx-auto">
            Choose a subscription package that fits your business. Pay monthly or yearly via Chapa or Ethiopian bank.
            Get verified and start selling to millions of customers.
          </p>
          {/* Billing toggle */}
          <div className="inline-flex items-center gap-2 mt-6 bg-slate-100 rounded-full p-1">
            <button
              onClick={() => setBillingCycle('MONTHLY')}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-colors ${billingCycle === 'MONTHLY' ? 'bg-white shadow text-slate-900' : 'text-slate-600'}`}
            >Monthly</button>
            <button
              onClick={() => setBillingCycle('YEARLY')}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-colors ${billingCycle === 'YEARLY' ? 'bg-white shadow text-slate-900' : 'text-slate-600'}`}
            >Yearly <span className="text-emerald-600 ml-1">Save 2 months</span></button>
          </div>
        </div>

        {/* Package grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {Array.from({length: 4}).map((_, i) => <Skeleton key={i} className="h-[600px] rounded-lg" />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {packages.map(pkg => {
              const Icon = PKG_ICONS[pkg.slug] || Sparkles
              const isCustom = pkg.slug === 'enterprise' || pkg.priceMonthly === 0
              const price = billingCycle === 'YEARLY' ? pkg.priceYearly : pkg.priceMonthly
              return (
                <Card key={pkg.id} className={`p-5 flex flex-col relative ${pkg.popular ? 'border-2 border-amz-orange shadow-lg' : 'border'}`}>
                  {pkg.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <Badge className="bg-amz-orange hover:bg-amz-orange text-white">★ Most Popular</Badge>
                    </div>
                  )}
                  <div className="flex items-center gap-2 mb-2">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${pkg.popular ? 'bg-amber-100' : 'bg-slate-100'}`}>
                      <Icon className={`w-5 h-5 ${pkg.popular ? 'text-amz-orange' : 'text-slate-600'}`} />
                    </div>
                    <h3 className="text-xl font-bold">{pkg.name}</h3>
                  </div>
                  <p className="text-sm text-slate-500 mb-3 min-h-[60px]">{pkg.description}</p>
                  <div className="mb-3">
                    {isCustom ? (
                      <div className="text-3xl font-bold">Custom</div>
                    ) : (
                      <>
                        <div className="flex items-baseline gap-1">
                          <span className="text-3xl font-bold">{ETB(price)}</span>
                          <span className="text-sm text-slate-500">/{billingCycle === 'YEARLY' ? 'year' : 'month'}</span>
                        </div>
                        {billingCycle === 'YEARLY' && pkg.priceMonthly > 0 && (
                          <div className="text-xs text-emerald-600 mt-1">Save {ETB(pkg.priceMonthly * 12 - pkg.priceYearly)} per year</div>
                        )}
                      </>
                    )}
                  </div>
                  <Button
                    className={`w-full mb-4 ${pkg.popular ? 'amz-bg-yellow hover:bg-[#f7ca00] text-black' : ''}`}
                    variant={pkg.popular ? 'default' : 'outline'}
                    onClick={() => handleChoose(pkg)}
                  >
                    {isCustom ? 'Contact Sales' : 'Choose ' + pkg.name} <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                  {/* Highlights */}
                  <div className="space-y-1 text-sm text-slate-700 mb-3 border-y py-3">
                    <div className="flex justify-between"><span>Products</span><span className="font-semibold">{pkg.productLimit === -1 ? 'Unlimited' : pkg.productLimit}</span></div>
                    <div className="flex justify-between"><span>Images per product</span><span className="font-semibold">{pkg.imageLimit === -1 ? 'Unlimited' : pkg.imageLimit}</span></div>
                    <div className="flex justify-between"><span>Staff accounts</span><span className="font-semibold">{pkg.staffAccounts === -1 ? 'Unlimited' : pkg.staffAccounts}</span></div>
                    <div className="flex justify-between"><span>Warehouses</span><span className="font-semibold">{pkg.warehouses === -1 ? 'Unlimited' : pkg.warehouses}</span></div>
                    <div className="flex justify-between"><span>Commission</span><span className="font-semibold text-amz-orange">{pkg.commissionRate}%</span></div>
                  </div>
                  {/* Features list */}
                  <ul className="space-y-1.5 text-xs flex-1">
                    {pkg.features.map(f => (
                      <li key={f} className="flex items-start gap-1.5">
                        <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                        <span>{FEATURE_LABELS[f] || f.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}</span>
                      </li>
                    ))}
                  </ul>
                </Card>
              )
            })}
          </div>
        )}

        {/* How it works */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-center mb-8">How Vendor Onboarding Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {[
              { icon: Shield, step: 1, title: 'Choose Package', desc: 'Pick the subscription that fits your business size.' },
              { icon: Zap, step: 2, title: 'Pay via Chapa', desc: 'Pay securely with Chapa mobile money, card, or Ethiopian bank transfer.' },
              { icon: Building2, step: 3, title: 'Submit Profile', desc: 'Fill in business info, bank details, and upload verification documents.' },
              { icon: TrendingUp, step: 4, title: 'Admin Review', desc: 'Our team reviews your application within 24-48 hours.' },
              { icon: Rocket, step: 5, title: 'Start Selling', desc: 'Once approved, your dashboard is unlocked. Add products and start selling.' },
            ].map(s => (
              <Card key={s.step} className="p-4 text-center">
                <div className="w-12 h-12 rounded-full bg-amber-100 mx-auto flex items-center justify-center mb-2">
                  <s.icon className="w-6 h-6 text-amz-orange" />
                </div>
                <div className="text-xs text-slate-400 mb-1">STEP {s.step}</div>
                <div className="font-semibold text-sm mb-1">{s.title}</div>
                <div className="text-xs text-slate-500">{s.desc}</div>
              </Card>
            ))}
          </div>
        </div>

        {/* FAQ / contact */}
        <Card className="mt-12 p-6 text-center bg-gradient-to-r from-[#131921] to-[#232f3e] text-white">
          <h2 className="text-2xl font-bold mb-2">Questions about which package is right for you?</h2>
          <p className="text-white/80 mb-4">Our vendor success team is ready to help. Contact us 24/7.</p>
          <div className="flex gap-3 justify-center flex-wrap">
            <Button asChild className="amz-bg-yellow hover:bg-[#f7ca00] text-black">
              <Link href="/support">Contact Sales</Link>
            </Button>
            <Button variant="outline" className="text-white border-white/30" asChild>
              <Link href="/support">View FAQ</Link>
            </Button>
          </div>
        </Card>
      </div>
    </StorefrontShell>
  )
}
