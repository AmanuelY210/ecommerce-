'use client'
import { LayoutDashboard, Users, Store, Package, Wallet, Settings, FileText, ShieldCheck, Save, Image as ImageIcon, FileCode } from 'lucide-react'
import { DashboardShell } from '@/components/layout/dashboard-shell'
import { SectionHeader, EmptyState } from '@/components/dashboard/widgets'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from 'sonner'

const NAV = [
  { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { label: 'Users', href: '/admin/users', icon: Users },
  { label: 'Vendors', href: '/admin/vendors', icon: Store },
  { label: 'Products', href: '/admin/products', icon: Package },
  { label: 'Financial', href: '/admin/financial', icon: Wallet },
  { label: 'CMS', href: '/admin/cms', icon: FileText },
  { label: 'Settings', href: '/admin/settings', icon: Settings },
  { label: 'Security', href: '/admin/security', icon: ShieldCheck },
]

export default function AdminCmsPage() {
  return <DashboardShell nav={NAV} title="CMS" role="admin" requiredRole="ADMIN"><CmsContent /></DashboardShell>
}

function CmsContent() {
  return (
    <div className="space-y-4">
      <SectionHeader title="Content Management" description="Manage banners, pages, and promotions" />

      <Tabs defaultValue="banners">
        <TabsList>
          <TabsTrigger value="banners">Banners</TabsTrigger>
          <TabsTrigger value="pages">Pages</TabsTrigger>
          <TabsTrigger value="blog">Blog</TabsTrigger>
          <TabsTrigger value="faq">FAQs</TabsTrigger>
        </TabsList>

        <TabsContent value="banners">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { title: 'Ethiopian Coffee Festival', image: 'https://picsum.photos/seed/banner-coffee/400/150', link: '/products?cat=groceries', active: true },
              { title: 'Tech Deals Week', image: 'https://picsum.photos/seed/banner-tech/400/150', link: '/products?cat=electronics', active: true },
              { title: 'Made in Ethiopia', image: 'https://picsum.photos/seed/banner-ethio/400/150', link: '/products?cat=made-in-ethiopia', active: true },
            ].map(b => (
              <Card key={b.title} className="p-3">
                <img src={b.image} alt={b.title} className="w-full h-32 object-cover rounded mb-2" />
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-sm">{b.title}</div>
                    <div className="text-xs text-slate-500">{b.link}</div>
                  </div>
                  <Button size="sm" variant="outline">Edit</Button>
                </div>
              </Card>
            ))}
            <Card className="p-3 border-dashed flex items-center justify-center min-h-[180px]">
              <Button variant="ghost" onClick={() => toast.info('Banner upload coming soon')}><ImageIcon className="w-6 h-6 mr-2" /> Add Banner</Button>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="pages">
          <div className="space-y-2">
            {['About Us', 'Privacy Policy', 'Terms & Conditions', 'Contact Us', 'Shipping Policy', 'Return Policy'].map(p => (
              <Card key={p} className="p-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileCode className="w-4 h-4 text-slate-400" />
                  <span className="font-medium text-sm">{p}</span>
                </div>
                <Button size="sm" variant="outline" onClick={() => toast.info('Page editor coming soon')}>Edit</Button>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="blog">
          <EmptyState icon={FileText} title="No blog posts" description="Create your first blog post." action={<Button className="amz-bg-yellow hover:bg-[#f7ca00] text-black" onClick={() => toast.info('Blog editor coming soon')}>New Post</Button>} />
        </TabsContent>

        <TabsContent value="faq">
          <Card className="p-4 space-y-2">
            {['How do I track my order?', 'What payment methods are supported?', 'How long does delivery take?', 'How do I return a product?'].map(q => (
              <details key={q} className="border-b pb-2 last:border-0">
                <summary className="cursor-pointer font-medium text-sm py-2">{q}</summary>
                <p className="text-sm text-slate-600 pb-2">Answer content goes here. This is editable in the admin panel.</p>
              </details>
            ))}
            <Button variant="outline" size="sm" onClick={() => toast.info('FAQ editor coming soon')}>Add FAQ</Button>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
