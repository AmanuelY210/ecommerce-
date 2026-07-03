'use client'
import Link from 'next/link'
import { useT } from '@/hooks/use-t'
import { Globe } from 'lucide-react'
import { useLang } from '@/lib/store'
import { LANGUAGES } from '@/lib/i18n'
import { Button } from '@/components/ui/button'

export function Footer() {
  const { t } = useT()
  const setLang = useLang((s) => s.setLang)
  const lang = useLang((s) => s.lang)

  return (
    <footer className="mt-auto">
      {/* Back to top */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className="w-full amz-navy2 hover:bg-[#2a3b50] text-white text-sm py-3 text-center transition-colors"
      >
        Back to top
      </button>

      {/* Main footer */}
      <div className="amz-navy text-white">
        <div className="max-w-[1500px] mx-auto px-4 py-10 grid grid-cols-2 md:grid-cols-4 gap-8">
          <FooterCol title={t('footer.about')}>
            <FooterLink href="/about">{t('footer.about')}</FooterLink>
            <FooterLink href="/careers">Careers</FooterLink>
            <FooterLink href="/press">Press Releases</FooterLink>
            <FooterLink href="/sustainability">Sustainability</FooterLink>
          </FooterCol>
          <FooterCol title={t('nav.sell')}>
            <FooterLink href="/vendor">{t('nav.sell')}</FooterLink>
            <FooterLink href="/vendor/register">Become a Vendor</FooterLink>
            <FooterLink href="/vendor/fees">Vendor Fees & Commission</FooterLink>
            <FooterLink href="/vendor/help">Vendor Help Center</FooterLink>
          </FooterCol>
          <FooterCol title={t('footer.help')}>
            <FooterLink href="/support">{t('footer.help')}</FooterLink>
            <FooterLink href="/shipping">{t('footer.shipping')}</FooterLink>
            <FooterLink href="/returns">{t('footer.returns')}</FooterLink>
            <FooterLink href="/track">Track Your Order</FooterLink>
          </FooterCol>
          <FooterCol title={t('footer.payment')}>
            <FooterLink href="/payment-methods">Chapa</FooterLink>
            <FooterLink href="/payment-methods">Ethiopian Banks (19)</FooterLink>
            <FooterLink href="/payment-methods">Cash on Delivery</FooterLink>
            <FooterLink href="/payment-methods">{t('footer.payment')}</FooterLink>
          </FooterCol>
        </div>

        {/* Languages */}
        <div className="border-t border-white/10">
          <div className="max-w-[1500px] mx-auto px-4 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold">et<span className="amz-text-yellow">market</span></span>
              <span className="text-white/40 text-sm">.et</span>
            </div>
            <div className="flex items-center gap-2 flex-wrap justify-center">
              <Globe className="w-4 h-4 text-white/60" />
              {LANGUAGES.map(l => (
                <Button
                  key={l.code}
                  variant="ghost"
                  size="sm"
                  onClick={() => setLang(l.code)}
                  className={`text-white/80 hover:text-white hover:bg-white/10 h-8 ${lang === l.code ? 'bg-white/10 amz-text-yellow' : ''}`}
                >
                  {l.native}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Banks logo strip */}
        <div className="border-t border-white/10">
          <div className="max-w-[1500px] mx-auto px-4 py-4">
            <div className="text-center text-xs text-white/50 mb-2">We accept all major Ethiopian payment methods</div>
            <div className="flex flex-wrap items-center justify-center gap-2 text-xs">
              {['Chapa', 'CBE', 'Dashen', 'Abyssinia', 'Awash', 'Coop Bank', 'Wegagen', 'Hibret', 'Telebirr', 'Visa', 'Mastercard'].map(b => (
                <span key={b} className="px-2 py-1 bg-white/10 rounded text-white/80">{b}</span>
              ))}
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-white/10 text-center text-xs text-white/50 py-4">
          {t('footer.rights')} · {t('footer.madeIn')} ❤️
        </div>
      </div>
    </footer>
  )
}

function FooterCol({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="font-bold mb-3 text-sm">{title}</h3>
      <ul className="space-y-2 text-sm text-white/70">{children}</ul>
    </div>
  )
}

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <li>
      <Link href={href} className="hover:underline hover:text-white">{children}</Link>
    </li>
  )
}
