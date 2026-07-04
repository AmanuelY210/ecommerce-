'use client'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { Search, ShoppingCart, MapPin, ChevronDown, Menu, Globe, User, Heart, Package, LayoutDashboard, ShieldCheck, Headphones, Store } from 'lucide-react'
import { useT } from '@/hooks/use-t'
import { useSettings } from '@/hooks/use-settings'
import { useAuth, useCart, useLang, useUI } from '@/lib/store'
import { LANGUAGES } from '@/lib/i18n'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useState, useEffect } from 'react'
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetHeader } from '@/components/ui/sheet'

export function Header() {
  const { t, lang } = useT()
  const { get, getBool } = useSettings()
  const router = useRouter()
  const pathname = usePathname()
  const user = useAuth((s) => s.user)
  const logout = useAuth((s) => s.logout)
  const setLang = useLang((s) => s.setLang)
  const cartLines = useCart((s) => s.lines)
  const cartCount = cartLines.reduce((s, l) => s + l.qty, 0)
  const setMobileMenu = useUI((s) => s.setMobileMenu)
  const mobileMenuOpen = useUI((s) => s.mobileMenuOpen)
  const [search, setSearch] = useState('')

  const onSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (search.trim()) router.push(`/products?q=${encodeURIComponent(search.trim())}`)
  }

  const roleDashboards: { role: string; label: string; href: string; icon: any }[] = [
    { role: 'VENDOR', label: t('nav.vendor'), href: '/vendor', icon: Store },
    { role: 'ADMIN', label: t('nav.admin'), href: '/admin', icon: LayoutDashboard },
    { role: 'MODERATOR', label: t('nav.moderator'), href: '/moderator', icon: ShieldCheck },
    { role: 'SUPPORT', label: t('nav.support'), href: '/support', icon: Headphones },
  ]

  const dashboardsForUser = user ? roleDashboards.filter(d => d.role === user.role) : []

  return (
    <header className="amz-navy text-white sticky top-0 z-50 shadow-md">
      {/* Announcement bar */}
      {getBool('announcement_bar_active', true) && get('announcement_bar_text') && (
        <div className="text-center text-xs py-1.5 px-4 text-white/90" style={{ backgroundColor: get('announcement_bar_color', '#232f3e') }}>
          {get('announcement_bar_text')}
        </div>
      )}
      {/* Top bar */}
      <div className="max-w-[1500px] mx-auto px-2 sm:px-4 flex items-center gap-2 h-[60px]">
        {/* Mobile menu */}
        <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenu}>
          <SheetTrigger asChild>
            <button className="lg:hidden p-2 hover:bg-white/10 rounded" aria-label="Menu">
              <Menu className="w-6 h-6" />
            </button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[300px] amz-navy2 text-white border-0 overflow-y-auto">
            <SheetHeader>
              <SheetTitle className="text-white">ETMarket Menu</SheetTitle>
            </SheetHeader>
            <div className="mt-6 space-y-1">
              <MobileLink href="/" label={t('nav.home')} onClick={() => setMobileMenu(false)} />
              <MobileLink href="/products" label={t('nav.products')} onClick={() => setMobileMenu(false)} />
              <MobileLink href="/products?deals=1" label={t('nav.deals')} onClick={() => setMobileMenu(false)} />
              <MobileLink href="/orders" label={t('nav.orders')} onClick={() => setMobileMenu(false)} />
              <MobileLink href="/account" label={t('nav.account')} onClick={() => setMobileMenu(false)} />
              {user && dashboardsForUser.map(d => (
                <MobileLink key={d.href} href={d.href} label={d.label} onClick={() => setMobileMenu(false)} />
              ))}
              <div className="pt-4 mt-4 border-t border-white/20">
                <div className="px-3 py-1 text-xs text-white/60 uppercase">Language</div>
                {LANGUAGES.map(l => (
                  <button key={l.code} onClick={() => { setLang(l.code); setMobileMenu(false) }} className={`block w-full text-left px-3 py-2 hover:bg-white/10 ${lang === l.code ? 'text-amz-yellow font-semibold' : ''}`}>
                    {l.native}
                  </button>
                ))}
              </div>
            </div>
          </SheetContent>
        </Sheet>

        {/* Logo */}
        <Link href="/" className="flex items-center gap-1 px-2 hover:border border-transparent hover:border-white rounded shrink-0">
          {get('logo_url') ? (
            <img src={get('logo_url')} alt={get('site_name', 'ETMarket')} className="h-8" />
          ) : (
            <span className="text-2xl font-bold tracking-tight">{get('logo_text', 'et')}<span className="amz-text-yellow">{get('logo_text_highlight', 'market')}</span></span>
          )}
          <span className="text-[10px] text-white/70 hidden sm:inline -mt-3">.et</span>
        </Link>

        {/* Deliver to */}
        <div className="hidden lg:flex items-center gap-1 px-2 py-1.5 hover:border border-transparent hover:border-white rounded cursor-pointer">
          <MapPin className="w-4 h-4 text-white/70" />
          <div className="leading-tight">
            <div className="text-[11px] text-white/70 -mb-0.5">Deliver to</div>
            <div className="text-sm font-semibold">{get('header_deliver_to', 'Addis Ababa')}</div>
          </div>
        </div>

        {/* Search */}
        {getBool('header_show_search', true) && (
        <form onSubmit={onSearch} className="flex-1 flex max-w-3xl mx-2 sm:mx-4 h-10 rounded-md overflow-hidden">
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('search.placeholder')}
            className="flex-1 bg-white text-black border-0 rounded-none focus-visible:ring-0 focus-visible:ring-offset-0 h-full text-sm sm:text-base"
          />
          <button type="submit" className="amz-bg-yellow px-3 sm:px-5 hover:bg-[#f7ca00] flex items-center justify-center" aria-label={t('search.button')}>
            <Search className="w-5 h-5 text-black" />
          </button>
        </form>
        )}

        {/* Language */}
        {getBool('header_show_language', true) && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="hidden md:flex items-center gap-1 px-2 py-1.5 hover:border border-transparent hover:border-white rounded text-sm">
              <Globe className="w-4 h-4" />
              <span className="font-semibold uppercase">{lang}</span>
              <ChevronDown className="w-3 h-3" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel>Select Language</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {LANGUAGES.map(l => (
              <DropdownMenuItem key={l.code} onClick={() => setLang(l.code)} className={`cursor-pointer ${lang === l.code ? 'bg-muted' : ''}`}>
                <span className="flex-1">{l.native}</span>
                <span className="text-xs text-muted-foreground uppercase">{l.code}</span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
        )}

        {/* Account */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="hidden md:block px-2 py-1.5 hover:border border-transparent hover:border-white rounded text-left">
              <div className="text-[11px] text-white/80 leading-none">{user ? user.name.split(' ')[0] : t('nav.signin')}</div>
              <div className="text-sm font-semibold flex items-center gap-0.5">{user ? 'Account' : 'Sign In'} <ChevronDown className="w-3 h-3" /></div>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-60">
            {!user ? (
              <>
                <DropdownMenuItem className="cursor-pointer" onClick={() => router.push('/login')}>
                  <User className="w-4 h-4 mr-2" /> {t('nav.signin')}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">New Customer?</div>
                <DropdownMenuItem className="cursor-pointer" onClick={() => router.push('/register')}>
                  {t('auth.signup.title')}
                </DropdownMenuItem>
              </>
            ) : (
              <>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col">
                    <span className="text-xs text-muted-foreground">Signed in as</span>
                    <span className="font-semibold text-sm">{user.name}</span>
                    <span className="text-xs text-muted-foreground">{user.email}</span>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="cursor-pointer" onClick={() => router.push('/account')}>
                  <User className="w-4 h-4 mr-2" /> {t('nav.account')}
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer" onClick={() => router.push('/orders')}>
                  <Package className="w-4 h-4 mr-2" /> {t('nav.orders')}
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer" onClick={() => router.push('/account?tab=wishlist')}>
                  <Heart className="w-4 h-4 mr-2" /> {t('nav.wishlist')}
                </DropdownMenuItem>
                {dashboardsForUser.map(d => (
                  <DropdownMenuItem key={d.href} className="cursor-pointer" onClick={() => router.push(d.href)}>
                    <d.icon className="w-4 h-4 mr-2" /> {d.label}
                  </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator />
                <DropdownMenuItem className="cursor-pointer text-red-600" onClick={() => { logout(); router.push('/') }}>
                  {t('nav.signout')}
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Orders */}
        <Link href="/orders" className="hidden md:block px-2 py-1.5 hover:border border-transparent hover:border-white rounded text-sm">
          <div className="text-[11px] text-white/80 leading-none">Returns</div>
          <div className="font-semibold">& {t('nav.orders')}</div>
        </Link>

        {/* Cart */}
        <Link href="/cart" className="flex items-end gap-1 px-2 py-1.5 hover:border border-transparent hover:border-white rounded relative">
          <div className="relative">
            <ShoppingCart className="w-7 h-7" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 amz-text-yellow font-bold text-sm min-w-[18px] text-center">{cartCount}</span>
            )}
          </div>
          <span className="font-semibold text-sm hidden sm:inline mb-0.5">Cart</span>
        </Link>
      </div>

      {/* Sub-nav */}
      <div className="amz-navy2 text-white">
        <div className="max-w-[1500px] mx-auto px-2 sm:px-4 flex items-center gap-1 h-[40px] text-sm overflow-x-auto scroll-hidden">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-1 px-2 py-1 hover:border border-transparent hover:border-white rounded font-semibold whitespace-nowrap">
                <Menu className="w-4 h-4" /> All
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-64 max-h-[70vh] overflow-y-auto" align="start">
              <DropdownMenuLabel>{t('categories.title')}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="cursor-pointer" onClick={() => router.push('/products')}>{t('common.all')}</DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer" onClick={() => router.push('/products?cat=vehicles')}>Vehicles</DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer" onClick={() => router.push('/products?cat=electronics')}>Electronics</DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer" onClick={() => router.push('/products?cat=fashion')}>Fashion</DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer" onClick={() => router.push('/products?cat=home-furniture')}>Home & Furniture</DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer" onClick={() => router.push('/products?cat=appliances')}>Appliances</DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer" onClick={() => router.push('/products?cat=grocery')}>Grocery</DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer" onClick={() => router.push('/products?cat=health-beauty')}>Health & Beauty</DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer" onClick={() => router.push('/products?cat=sports-outdoors')}>Sports & Outdoors</DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer" onClick={() => router.push('/products?cat=books')}>Books</DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer" onClick={() => router.push('/products?cat=office-supplies')}>Office Supplies</DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer" onClick={() => router.push('/products?cat=toys-games')}>Toys & Games</DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer" onClick={() => router.push('/products?cat=baby-products')}>Baby Products</DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer" onClick={() => router.push('/products?cat=pet-supplies')}>Pet Supplies</DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer" onClick={() => router.push('/products?cat=agriculture')}>Agriculture</DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer" onClick={() => router.push('/products?cat=industrial-construction')}>Industrial & Construction</DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer" onClick={() => router.push('/products?cat=jewelry-watches')}>Jewelry & Watches</DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer" onClick={() => router.push('/products?cat=music-instruments')}>Music & Instruments</DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer" onClick={() => router.push('/products?cat=arts-crafts')}>Arts & Crafts</DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer" onClick={() => router.push('/products?cat=real-estate')}>Real Estate</DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer" onClick={() => router.push('/products?cat=services')}>Services</DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer" onClick={() => router.push('/products?cat=digital-products')}>Digital Products</DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer" onClick={() => router.push('/products?cat=gift-shop')}>Gift Shop</DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer" onClick={() => router.push('/products?cat=wholesale-bulk')}>Wholesale & Bulk</DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer" onClick={() => router.push('/products?cat=handmade-local-products')}>Handmade & Local Products</DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer" onClick={() => router.push('/products?cat=marketplace-deals')}>Marketplace Deals</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <NavLink href="/products?deals=1" label={t('nav.deals')} active={pathname === '/products'} />
          <NavLink href="/products?cat=electronics" label="Electronics" />
          <NavLink href="/products?cat=fashion" label="Fashion" />
          <NavLink href="/products?cat=vehicles" label="Vehicles" />
          <NavLink href="/products?cat=grocery" label="Grocery" />
          <NavLink href="/products?cat=appliances" label="Appliances" />
          <NavLink href="/products?cat=handmade-local-products" label="Made in Ethiopia" />
          <NavLink href="/products?cat=marketplace-deals" label="Deals" />
          <NavLink href="/vendors" label="Vendors" />
          <NavLink href="/vendor/pricing" label={t('nav.sell')} />
          <NavLink href="/support" label={t('nav.customer')} />
          <div className="ml-auto flex items-center gap-1 pr-2 text-xs text-white/80 hidden md:flex">
            <Globe className="w-3 h-3" /> Ships to Ethiopia
          </div>
        </div>
      </div>
    </header>
  )
}

function NavLink({ href, label, active }: { href: string; label: string; active?: boolean }) {
  return (
    <Link href={href} className={`px-2 py-1 hover:border border-transparent hover:border-white rounded whitespace-nowrap ${active ? 'border-b-2 border-amz-orange' : ''}`}>
      {label}
    </Link>
  )
}

function MobileLink({ href, label, onClick }: { href: string; label: string; onClick: () => void }) {
  return (
    <Link href={href} onClick={onClick} className="block px-3 py-2.5 hover:bg-white/10 rounded text-sm">
      {label}
    </Link>
  )
}
