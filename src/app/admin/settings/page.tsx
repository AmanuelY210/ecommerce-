'use client'
import { useEffect, useState, useCallback } from 'react'
import { LayoutDashboard, Users, Store, Package, Wallet, Settings, FileText, ShieldCheck, Crown, Save, Globe, Palette, Share2, Search, Phone, CreditCard, ToggleLeft, Truck, Image as ImageIcon, ChevronDown, ChevronUp } from 'lucide-react'
import { DashboardShell } from '@/components/layout/dashboard-shell'
import { SectionHeader } from '@/components/dashboard/widgets'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { FileUpload } from '@/components/shared/file-upload'
import { clearSettingsCache } from '@/hooks/use-settings'
import { SHIPPING_ZONES } from '@/lib/ethiopia-geo'
import { toast } from 'sonner'
import { Skeleton } from '@/components/ui/skeleton'

const NAV = [
  { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { label: 'Users', href: '/admin/users', icon: Users },
  { label: 'Vendors', href: '/admin/vendors', icon: Store },
  { label: 'Products', href: '/admin/products', icon: Package },
  { label: 'Vendor Subscriptions', href: '/admin/vendor-subscriptions', icon: Crown },
  { label: 'Packages', href: '/admin/packages', icon: FileText },
  { label: 'Financial', href: '/admin/financial', icon: Wallet },
  { label: 'CMS', href: '/admin/cms', icon: FileText },
  { label: 'Settings', href: '/admin/settings', icon: Settings },
  { label: 'Security', href: '/admin/security', icon: ShieldCheck },
]

export default function AdminSettingsPage() {
  return <DashboardShell nav={NAV} title="Website Settings" role="admin" requiredRole="ADMIN"><SettingsContent /></DashboardShell>
}

function SettingsContent() {
  const [settings, setSettings] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      const res = await fetch('/api/settings')
      const d = await res.json()
      if (!cancelled) { setSettings(d); setLoading(false) }
    }
    load()
    return () => { cancelled = true }
  }, [])

  const get = (key: string, fallback = '') => settings[key] ?? fallback
  const set = (key: string, value: string) => setSettings(s => ({ ...s, [key]: value }))
  const getBool = (key: string, fallback = false) => { const v = settings[key]; return v === undefined ? fallback : v === 'true' }
  const setBool = (key: string, value: boolean) => setSettings(s => ({ ...s, [key]: String(value) }))

  const save = async () => {
    setSaving(true)
    try {
      const res = await fetch('/api/settings', {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      })
      if (res.ok) {
        toast.success('Settings saved — changes are live!')
        clearSettingsCache()
      } else {
        toast.error('Failed to save settings')
      }
    } finally { setSaving(false) }
  }

  if (loading) return <div className="space-y-3">{Array.from({length: 3}).map((_, i) => <Skeleton key={i} className="h-32" />)}</div>

  return (
    <div className="space-y-4">
      <SectionHeader title="Website Settings" description="Full control over your marketplace — branding, header, footer, appearance, SEO, social, payments, and features" action={
        <Button className="amz-bg-yellow hover:bg-[#f7ca00] text-black" onClick={save} disabled={saving}>
          <Save className="w-4 h-4 mr-1" /> {saving ? 'Saving...' : 'Save All Settings'}
        </Button>
      } />

      <Tabs defaultValue="general">
        <TabsList className="flex-wrap h-auto">
          <TabsTrigger value="general"><Settings className="w-4 h-4 mr-1" /> General</TabsTrigger>
          <TabsTrigger value="branding"><ImageIcon className="w-4 h-4 mr-1" /> Branding</TabsTrigger>
          <TabsTrigger value="header"><Globe className="w-4 h-4 mr-1" /> Header</TabsTrigger>
          <TabsTrigger value="footer"><FileText className="w-4 h-4 mr-1" /> Footer</TabsTrigger>
          <TabsTrigger value="appearance"><Palette className="w-4 h-4 mr-1" /> Appearance</TabsTrigger>
          <TabsTrigger value="social"><Share2 className="w-4 h-4 mr-1" /> Social</TabsTrigger>
          <TabsTrigger value="seo"><Search className="w-4 h-4 mr-1" /> SEO</TabsTrigger>
          <TabsTrigger value="contact"><Phone className="w-4 h-4 mr-1" /> Contact</TabsTrigger>
          <TabsTrigger value="payment"><CreditCard className="w-4 h-4 mr-1" /> Payment</TabsTrigger>
          <TabsTrigger value="features"><ToggleLeft className="w-4 h-4 mr-1" /> Features</TabsTrigger>
          <TabsTrigger value="shipping"><Truck className="w-4 h-4 mr-1" /> Shipping</TabsTrigger>
        </TabsList>

        {/* ─── GENERAL ─── */}
        <TabsContent value="general">
          <Card className="p-4 space-y-3">
            <h3 className="font-bold text-sm">General Marketplace Configuration</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Field label="Site Name" value={get('site_name', 'ETMarket')} onChange={(v) => set('site_name', v)} />
              <Field label="Site Tagline" value={get('site_tagline', "Ethiopia's Marketplace")} onChange={(v) => set('site_tagline', v)} />
              <Field label="Currency" value={get('currency', 'ETB')} onChange={(v) => set('currency', v)} />
              <Field label="Default Commission (%)" type="number" value={get('default_commission', '10')} onChange={(v) => set('default_commission', v)} />
              <Field label="Min Withdrawal (ETB)" type="number" value={get('min_withdrawal', '1000')} onChange={(v) => set('min_withdrawal', v)} />
              <Field label="OTP Message Template" value={get('otp_message', '')} onChange={(v) => set('otp_message', v)} hint="Use {CODE} as placeholder for the OTP code" />
            </div>
            <Toggle label="Maintenance Mode" desc="Blocks customer access to the storefront (admin panel still accessible)" checked={getBool('maintenance_mode')} onChange={(v) => setBool('maintenance_mode', v)} />
          </Card>
        </TabsContent>

        {/* ─── BRANDING ─── */}
        <TabsContent value="branding">
          <Card className="p-4 space-y-3">
            <h3 className="font-bold text-sm">Branding & Identity</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Field label="Logo Text (first part)" value={get('logo_text', 'et')} onChange={(v) => set('logo_text', v)} hint="Shown in white in the header" />
              <Field label="Logo Text (highlight part)" value={get('logo_text_highlight', 'market')} onChange={(v) => set('logo_text_highlight', v)} hint="Shown in orange in the header" />
            </div>
            <div>
              <Label>Logo Image URL (optional — overrides text logo)</Label>
              <FileUpload label="" value={get('logo_url', '')} onChange={(url) => set('logo_url', url)} accept=".jpg,.jpeg,.png,.svg,.ico,.pdf" maxSize={2 * 1024 * 1024} />
              <p className="text-xs text-slate-500 mt-1">If set, this image replaces the text logo in the header. Leave empty to use text logo.</p>
            </div>
            <div>
              <Label>Favicon URL</Label>
              <Input value={get('favicon_url', '/logo.svg')} onChange={(e) => set('favicon_url', e.target.value)} />
            </div>
            <div>
              <Label>Site Description (used in footer and meta)</Label>
              <Textarea rows={3} value={get('site_description', '')} onChange={(e) => set('site_description', e.target.value)} />
            </div>
          </Card>
        </TabsContent>

        {/* ─── HEADER ─── */}
        <TabsContent value="header">
          <Card className="p-4 space-y-3">
            <h3 className="font-bold text-sm">Header Configuration</h3>
            <Toggle label="Announcement Bar" desc="Show a promotional bar at the very top of the page" checked={getBool('announcement_bar_active', true)} onChange={(v) => setBool('announcement_bar_active', v)} />
            <Field label="Announcement Bar Text" value={get('announcement_bar_text', '')} onChange={(v) => set('announcement_bar_text', v)} />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <ColorField label="Announcement Bar Color" value={get('announcement_bar_color', '#232f3e')} onChange={(v) => set('announcement_bar_color', v)} />
              <Field label="Deliver To (location shown in header)" value={get('header_deliver_to', 'Addis Ababa')} onChange={(v) => set('header_deliver_to', v)} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Toggle label="Show Search Bar" checked={getBool('header_show_search', true)} onChange={(v) => setBool('header_show_search', v)} />
              <Toggle label="Show Language Switcher" checked={getBool('header_show_language', true)} onChange={(v) => setBool('header_show_language', v)} />
            </div>
          </Card>
        </TabsContent>

        {/* ─── FOOTER ─── */}
        <TabsContent value="footer">
          <Card className="p-4 space-y-3">
            <h3 className="font-bold text-sm">Footer Configuration</h3>
            <div>
              <Label>Footer About Text</Label>
              <Textarea rows={3} value={get('footer_about', '')} onChange={(e) => set('footer_about', e.target.value)} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Field label="Copyright Text" value={get('footer_copyright', '')} onChange={(v) => set('footer_copyright', v)} />
              <Field label="Made In Text" value={get('footer_made_in', '')} onChange={(v) => set('footer_made_in', v)} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Toggle label="Show About Column" checked={getBool('footer_show_about', true)} onChange={(v) => setBool('footer_show_about', v)} />
              <Toggle label="Show Sell Column" checked={getBool('footer_show_sell', true)} onChange={(v) => setBool('footer_show_sell', v)} />
              <Toggle label="Show Help Column" checked={getBool('footer_show_help', true)} onChange={(v) => setBool('footer_show_help', v)} />
              <Toggle label="Show Payment Methods" checked={getBool('footer_show_payment', true)} onChange={(v) => setBool('footer_show_payment', v)} />
            </div>
          </Card>
        </TabsContent>

        {/* ─── APPEARANCE ─── */}
        <TabsContent value="appearance">
          <Card className="p-4 space-y-3">
            <h3 className="font-bold text-sm">Theme & Appearance</h3>
            <p className="text-xs text-slate-500">Customize the color scheme of your marketplace. Changes apply to the header, buttons, and accents.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <ColorField label="Primary Color (Header Navy)" value={get('theme_primary_color', '#131921')} onChange={(v) => set('theme_primary_color', v)} />
              <ColorField label="Secondary Color (Sub-nav)" value={get('theme_secondary_color', '#232f3e')} onChange={(v) => set('theme_secondary_color', v)} />
              <ColorField label="Accent Color (Orange)" value={get('theme_accent_color', '#ff9900')} onChange={(v) => set('theme_accent_color', v)} />
              <ColorField label="Button Color (Yellow CTA)" value={get('theme_button_color', '#ffd814')} onChange={(v) => set('theme_button_color', v)} />
              <ColorField label="Background Color" value={get('theme_background_color', '#eaeded')} onChange={(v) => set('theme_background_color', v)} />
              <ColorField label="Link Color" value={get('theme_link_color', '#007185')} onChange={(v) => set('theme_link_color', v)} />
              <ColorField label="Star/Rating Color" value={get('theme_star_color', '#ffa41c')} onChange={(v) => set('theme_star_color', v)} />
            </div>
          </Card>
        </TabsContent>

        {/* ─── SOCIAL ─── */}
        <TabsContent value="social">
          <Card className="p-4 space-y-3">
            <h3 className="font-bold text-sm">Social Media Links</h3>
            <p className="text-xs text-slate-500">Leave empty to hide a social media icon from the footer.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Field label="Facebook URL" value={get('social_facebook', '')} onChange={(v) => set('social_facebook', v)} placeholder="https://facebook.com/..." />
              <Field label="Twitter / X URL" value={get('social_twitter', '')} onChange={(v) => set('social_twitter', v)} placeholder="https://twitter.com/..." />
              <Field label="Instagram URL" value={get('social_instagram', '')} onChange={(v) => set('social_instagram', v)} placeholder="https://instagram.com/..." />
              <Field label="Telegram URL" value={get('social_telegram', '')} onChange={(v) => set('social_telegram', v)} placeholder="https://t.me/..." />
              <Field label="YouTube URL" value={get('social_youtube', '')} onChange={(v) => set('social_youtube', v)} placeholder="https://youtube.com/..." />
              <Field label="LinkedIn URL" value={get('social_linkedin', '')} onChange={(v) => set('social_linkedin', v)} placeholder="https://linkedin.com/..." />
            </div>
          </Card>
        </TabsContent>

        {/* ─── SEO ─── */}
        <TabsContent value="seo">
          <Card className="p-4 space-y-3">
            <h3 className="font-bold text-sm">Search Engine Optimization</h3>
            <div>
              <Label>Meta Title (50-60 chars recommended)</Label>
              <Input value={get('seo_meta_title', '')} onChange={(e) => set('seo_meta_title', e.target.value)} />
              <p className="text-xs text-slate-500 mt-0.5">{get('seo_meta_title', '').length} characters</p>
            </div>
            <div>
              <Label>Meta Description (150-160 chars recommended)</Label>
              <Textarea rows={3} value={get('seo_meta_description', '')} onChange={(e) => set('seo_meta_description', e.target.value)} />
              <p className="text-xs text-slate-500 mt-0.5">{get('seo_meta_description', '').length} characters</p>
            </div>
            <Field label="Meta Keywords (comma-separated)" value={get('seo_meta_keywords', '')} onChange={(v) => set('seo_meta_keywords', v)} />
            <Field label="Open Graph Image URL (for social sharing)" value={get('seo_og_image', '')} onChange={(v) => set('seo_og_image', v)} />
          </Card>
        </TabsContent>

        {/* ─── CONTACT ─── */}
        <TabsContent value="contact">
          <Card className="p-4 space-y-3">
            <h3 className="font-bold text-sm">Contact Information</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Field label="Customer Support Email" value={get('support_email', '')} onChange={(v) => set('support_email', v)} />
              <Field label="Customer Support Phone" value={get('support_phone', '')} onChange={(v) => set('support_phone', v)} />
              <Field label="Vendor Support Email" value={get('vendor_email', '')} onChange={(v) => set('vendor_email', v)} />
              <Field label="Business Hours" value={get('business_hours', '')} onChange={(v) => set('business_hours', v)} />
            </div>
            <Field label="Physical Address" value={get('physical_address', '')} onChange={(v) => set('physical_address', v)} />
          </Card>
        </TabsContent>

        {/* ─── PAYMENT ─── */}
        <TabsContent value="payment">
          <Card className="p-4 space-y-3">
            <h3 className="font-bold text-sm">Payment Configuration</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div><Label>Chapa Secret Key</Label><Input type="password" value={get('chapa_secret_key', '')} onChange={(e) => set('chapa_secret_key', e.target.value)} /></div>
              <div><Label>Chapa Public Key</Label><Input value={get('chapa_public_key', '')} onChange={(e) => set('chapa_public_key', e.target.value)} /></div>
            </div>
            <Field label="Chapa Webhook URL" value={get('chapa_webhook_url', '')} onChange={(v) => set('chapa_webhook_url', v)} />
            <div className="grid grid-cols-3 gap-3">
              <Toggle label="Chapa Payments" checked={getBool('payment_chapa_enabled', true)} onChange={(v) => setBool('payment_chapa_enabled', v)} />
              <Toggle label="Bank Transfer" checked={getBool('payment_bank_enabled', true)} onChange={(v) => setBool('payment_bank_enabled', v)} />
              <Toggle label="Cash on Delivery" checked={getBool('payment_cod_enabled', true)} onChange={(v) => setBool('payment_cod_enabled', v)} />
            </div>
            <p className="text-xs text-slate-500">💡 This MVP uses mock payment verification. To enable live Chapa payments, add your API keys.</p>
          </Card>
        </TabsContent>

        {/* ─── FEATURES ─── */}
        <TabsContent value="features">
          <Card className="p-4 space-y-3">
            <h3 className="font-bold text-sm">Feature Toggles</h3>
            <p className="text-xs text-slate-500">Enable or disable marketplace features. Disabled features are hidden from customers and vendors.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Toggle label="Wishlist" desc="Allow customers to save favorite products" checked={getBool('feature_wishlist', true)} onChange={(v) => setBool('feature_wishlist', v)} />
              <Toggle label="Product Reviews" desc="Allow customers to write reviews" checked={getBool('feature_reviews', true)} onChange={(v) => setBool('feature_reviews', v)} />
              <Toggle label="Coupons" desc="Allow coupon codes at checkout" checked={getBool('feature_coupons', true)} onChange={(v) => setBool('feature_coupons', v)} />
              <Toggle label="Flash Deals" desc="Show deals section on homepage" checked={getBool('feature_flash_deals', true)} onChange={(v) => setBool('feature_flash_deals', v)} />
              <Toggle label="Vendor Sign-up" desc="Allow new vendors to register" checked={getBool('feature_vendor_signup', true)} onChange={(v) => setBool('feature_vendor_signup', v)} />
              <Toggle label="Guest Checkout" desc="Allow checkout without account" checked={getBool('feature_guest_checkout', true)} onChange={(v) => setBool('feature_guest_checkout', v)} />
            </div>
          </Card>
        </TabsContent>

        {/* ─── SHIPPING ─── */}
        <TabsContent value="shipping">
          <Card className="p-4 space-y-3">
            <h3 className="font-bold text-sm">Shipping Zones</h3>
            <div className="space-y-2">
              {SHIPPING_ZONES.map(z => (
                <div key={z.name} className="flex items-center justify-between border-b last:border-0 pb-2 last:pb-0">
                  <div className="min-w-0">
                    <div className="text-sm font-medium">{z.name}</div>
                    <div className="text-xs text-slate-500">{z.regions.join(', ')}</div>
                    <div className="text-xs text-slate-500">Delivery: {z.estimatedDays} · {z.baseFee} ETB · Free over {z.freeThreshold.toLocaleString()} ETB</div>
                  </div>
                  <Button size="sm" variant="outline" onClick={() => toast.info('Shipping zone editing coming soon')}>Edit</Button>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end sticky bottom-0 bg-slate-50 py-3">
        <Button className="amz-bg-yellow hover:bg-[#f7ca00] text-black" onClick={save} disabled={saving}>
          <Save className="w-4 h-4 mr-1" /> {saving ? 'Saving...' : 'Save All Settings'}
        </Button>
      </div>
    </div>
  )
}

// ─────────── Helper components ───────────
function Field({ label, value, onChange, type = 'text', placeholder, hint }: { label: string; value: string; onChange: (v: string) => void; type?: string; placeholder?: string; hint?: string }) {
  return (
    <div>
      <Label>{label}</Label>
      <Input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} />
      {hint && <p className="text-xs text-slate-500 mt-0.5">{hint}</p>}
    </div>
  )
}

function ColorField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <Label>{label}</Label>
      <div className="flex gap-2">
        <input type="color" value={value} onChange={(e) => onChange(e.target.value)} className="w-12 h-9 rounded border border-slate-300 cursor-pointer" />
        <Input value={value} onChange={(e) => onChange(e.target.value)} className="flex-1" />
      </div>
    </div>
  )
}

function Toggle({ label, desc, checked, onChange }: { label: string; desc?: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-center gap-3 cursor-pointer p-2 rounded hover:bg-slate-50">
      <Switch checked={checked} onCheckedChange={onChange} />
      <div>
        <div className="text-sm font-medium">{label}</div>
        {desc && <div className="text-xs text-slate-500">{desc}</div>}
      </div>
    </label>
  )
}
