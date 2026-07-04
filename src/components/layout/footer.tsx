'use client'
import Link from 'next/link'
import { useT } from '@/hooks/use-t'
import { useSettings } from '@/hooks/use-settings'
import { Globe, Facebook, Twitter, Instagram, Youtube, Linkedin, Send } from 'lucide-react'
import { useLang } from '@/lib/store'
import { LANGUAGES } from '@/lib/i18n'
import { Button } from '@/components/ui/button'

export function Footer() {
  const { t } = useT()
  const { get, getBool } = useSettings()
  const setLang = useLang((s) => s.setLang)
  const lang = useLang((s) => s.lang)

  const socials = [
    { key: 'social_facebook', icon: Facebook, label: 'Facebook' },
    { key: 'social_twitter', icon: Twitter, label: 'Twitter' },
    { key: 'social_instagram', icon: Instagram, label: 'Instagram' },
    { key: 'social_telegram', icon: Send, label: 'Telegram' },
    { key: 'social_youtube', icon: Youtube, label: 'YouTube' },
    { key: 'social_linkedin', icon: Linkedin, label: 'LinkedIn' },
  ].filter(s => get(s.key))

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
          {getBool('footer_show_about', true) && (
            <div>
              <h3 className="font-bold mb-3 text-sm">{t('footer.about')}</h3>
              <div className="flex items-center gap-2 mb-3">
                {get('logo_url') ? (
                  <img src={get('logo_url')} alt={get('site_name', 'ETMarket')} className="h-8" />
                ) : (
                  <span className="text-2xl font-bold">{get('logo_text', 'et')}<span className="amz-text-yellow">{get('logo_text_highlight', 'market')}</span></span>
                )}
              </div>
              <p className="text-sm text-white/70 leading-relaxed mb-3">{get('footer_about', '')}</p>
              {/* Social links */}
              {socials.length > 0 && (
                <div className="flex gap-2">
                  {socials.map(s => {
                    const Icon = s.icon
                    return (
                      <a key={s.key} href={get(s.key)} target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors" aria-label={s.label}>
                        <Icon className="w-4 h-4" />
                      </a>
                    )
                  })}
                </div>
              )}
            </div>
          )}
          {getBool('footer_show_sell', true) && (
            <div>
              <h3 className="font-bold mb-3 text-sm">{t('nav.sell')}</h3>
              <ul className="space-y-2 text-sm text-white/70">
                <li><Link href="/vendor/pricing" className="hover:underline hover:text-white">{t('nav.sell')}</Link></li>
                <li><Link href="/vendor/register" className="hover:underline hover:text-white">Become a Vendor</Link></li>
                <li><Link href="/vendor/pricing" className="hover:underline hover:text-white">Vendor Packages & Fees</Link></li>
                <li><Link href="/vendor" className="hover:underline hover:text-white">Vendor Help Center</Link></li>
              </ul>
            </div>
          )}
          {getBool('footer_show_help', true) && (
            <div>
              <h3 className="font-bold mb-3 text-sm">{t('footer.help')}</h3>
              <ul className="space-y-2 text-sm text-white/70">
                <li><Link href="/support" className="hover:underline hover:text-white">{t('footer.help')}</Link></li>
                <li><Link href="/products" className="hover:underline hover:text-white">{t('footer.shipping')}</Link></li>
                <li><Link href="/products" className="hover:underline hover:text-white">{t('footer.returns')}</Link></li>
                <li><Link href="/orders" className="hover:underline hover:text-white">Track Your Order</Link></li>
                <li><Link href="/admin/cms/pages" className="hover:underline hover:text-white">View All Pages</Link></li>
              </ul>
            </div>
          )}
          {getBool('footer_show_payment', true) && (
            <div>
              <h3 className="font-bold mb-3 text-sm">{t('footer.payment')}</h3>
              <ul className="space-y-2 text-sm text-white/70">
                <li><Link href="/vendor/pricing" className="hover:underline hover:text-white">Chapa</Link></li>
                <li><Link href="/vendor/pricing" className="hover:underline hover:text-white">Ethiopian Banks (19)</Link></li>
                <li><Link href="/vendor/pricing" className="hover:underline hover:text-white">Cash on Delivery</Link></li>
                <li><Link href="/vendor/pricing" className="hover:underline hover:text-white">{t('footer.payment')}</Link></li>
              </ul>
            </div>
          )}
        </div>

        {/* Languages */}
        <div className="border-t border-white/10">
          <div className="max-w-[1500px] mx-auto px-4 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              {get('logo_url') ? (
                <img src={get('logo_url')} alt={get('site_name', 'ETMarket')} className="h-7" />
              ) : (
                <span className="text-2xl font-bold">{get('logo_text', 'et')}<span className="amz-text-yellow">{get('logo_text_highlight', 'market')}</span></span>
              )}
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
        {getBool('footer_show_payment', true) && (
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
        )}

        {/* Copyright */}
        <div className="border-t border-white/10 text-center text-xs text-white/50 py-4">
          {get('footer_copyright', '© 2026 ETMarket Ethiopia. All rights reserved.')} · {get('footer_made_in', 'Made in Ethiopia with ❤️')}
        </div>
      </div>
    </footer>
  )
}
