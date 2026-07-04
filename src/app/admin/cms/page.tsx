'use client'
import { useEffect, useState } from 'react'
import { LayoutDashboard, Users, Store, Package, Wallet, Settings, FileText, ShieldCheck, Crown, Save, Image as ImageIcon, FileCode, Plus, Pencil, Trash2, ExternalLink, Eye, EyeOff, Calendar, Tag, FileText as PostIcon } from 'lucide-react'
import { DashboardShell } from '@/components/layout/dashboard-shell'
import { SectionHeader, EmptyState } from '@/components/dashboard/widgets'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { FileUpload } from '@/components/shared/file-upload'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'

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

export default function AdminCmsPage() {
  return <DashboardShell nav={NAV} title="Content Management" role="admin" requiredRole="ADMIN"><CmsContent /></DashboardShell>
}

function CmsContent() {
  return (
    <div className="space-y-4">
      <SectionHeader title="Content Management" description="Manage banners, pages, blog posts, and FAQs — add, edit, and delete" />
      <Tabs defaultValue="banners">
        <TabsList>
          <TabsTrigger value="banners">Banners</TabsTrigger>
          <TabsTrigger value="pages">Pages</TabsTrigger>
          <TabsTrigger value="blog">Blog</TabsTrigger>
          <TabsTrigger value="faq">FAQs</TabsTrigger>
        </TabsList>
        <TabsContent value="banners"><BannersTab /></TabsContent>
        <TabsContent value="pages"><PagesTab /></TabsContent>
        <TabsContent value="blog"><BlogTab /></TabsContent>
        <TabsContent value="faq"><FaqsTab /></TabsContent>
      </Tabs>
    </div>
  )
}

// ───────────────────────── Banners ─────────────────────────
interface Banner { id: string; title: string; image: string; link: string | null; position: string; active: boolean; order: number; startAt: string | null; endAt: string | null }

function BannersTab() {
  const [items, setItems] = useState<Banner[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Banner | null>(null)
  const [form, setForm] = useState<any>({ title: '', image: '', link: '', position: 'HOME_HERO', active: true, order: 0 })

  const refresh = async () => { setLoading(true); const res = await fetch('/api/admin/banners'); setItems(await res.json()); setLoading(false) }
  useEffect(() => {
    let cancelled = false
    const load = async () => { setLoading(true); const res = await fetch('/api/admin/banners'); const d = await res.json(); if (!cancelled) { setItems(d); setLoading(false) } }
    load()
    return () => { cancelled = true }
  }, [])

  const openAdd = () => { setEditing(null); setForm({ title: '', image: '', link: '', position: 'HOME_HERO', active: true, order: items.length }); setOpen(true) }
  const openEdit = (b: Banner) => { setEditing(b); setForm({ ...b }); setOpen(true) }

  const save = async () => {
    if (!form.title || !form.image) { toast.error('Title and image required'); return }
    const res = await fetch('/api/admin/banners', {
      method: editing ? 'PATCH' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editing ? { id: editing.id, ...form } : form),
    })
    if (res.ok) { toast.success(editing ? 'Banner updated' : 'Banner created'); setOpen(false); refresh() }
    else { const d = await res.json(); toast.error(d.error || 'Failed') }
  }

  const remove = async (id: string) => {
    if (!confirm('Delete this banner?')) return
    const res = await fetch(`/api/admin/banners/${id}`, { method: 'DELETE' })
    if (res.ok) { toast.success('Banner deleted'); refresh() }
  }

  if (loading) return <div className="space-y-3">{Array.from({length: 3}).map((_, i) => <Skeleton key={i} className="h-32" />)}</div>

  return (
    <div className="space-y-3">
      <div className="flex justify-end">
        <Button className="amz-bg-yellow hover:bg-[#f7ca00] text-black" onClick={openAdd}><Plus className="w-4 h-4 mr-1" /> Add Banner</Button>
      </div>
      {items.length === 0 ? (
        <EmptyState icon={ImageIcon} title="No banners" description="Add your first homepage banner." action={<Button className="amz-bg-yellow hover:bg-[#f7ca00] text-black" onClick={openAdd}><Plus className="w-4 h-4 mr-1" /> Add Banner</Button>} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {items.map(b => (
            <Card key={b.id} className={`p-3 ${!b.active ? 'opacity-60' : ''}`}>
              <img src={b.image} alt={b.title} className="w-full h-32 object-cover rounded mb-2" />
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <div className="font-medium text-sm line-clamp-1">{b.title}</div>
                  <div className="text-xs text-slate-500 truncate">{b.link || 'No link'}</div>
                  <div className="flex items-center gap-1 mt-1">
                    <Badge variant="outline" className="text-xs">{b.position}</Badge>
                    <Badge variant="outline" className={b.active ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-50'}>{b.active ? 'Active' : 'Inactive'}</Badge>
                    <span className="text-xs text-slate-400">#{b.order}</span>
                  </div>
                </div>
                <div className="flex flex-col gap-1 shrink-0">
                  <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => openEdit(b)}><Pencil className="w-3.5 h-3.5" /></Button>
                  <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-red-500" onClick={() => remove(b.id)}><Trash2 className="w-3.5 h-3.5" /></Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editing ? 'Edit Banner' : 'Add Banner'}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>Title *</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
            <div>
              <Label>Image *</Label>
              <FileUpload label="" value={form.image} onChange={(url) => setForm({ ...form, image: url })} accept=".jpg,.jpeg,.png,.pdf" maxSize={5 * 1024 * 1024} />
            </div>
            <div><Label>Link (URL)</Label><Input value={form.link} onChange={(e) => setForm({ ...form, link: e.target.value })} placeholder="/products?cat=electronics" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Position</Label>
                <Select value={form.position} onValueChange={(v) => setForm({ ...form, position: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="HOME_HERO">Home Hero</SelectItem>
                    <SelectItem value="HOME_STRIP">Home Strip</SelectItem>
                    <SelectItem value="CATEGORY">Category</SelectItem>
                    <SelectItem value="SIDEBAR">Sidebar</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div><Label>Order</Label><Input type="number" value={form.order} onChange={(e) => setForm({ ...form, order: Number(e.target.value) })} /></div>
            </div>
            <label className="flex items-center gap-2"><Switch checked={form.active} onCheckedChange={(v) => setForm({ ...form, active: v })} /> Active (visible on site)</label>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button className="amz-bg-yellow hover:bg-[#f7ca00] text-black" onClick={save}><Save className="w-4 h-4 mr-1" /> {editing ? 'Update' : 'Create'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// ───────────────────────── Pages ─────────────────────────
interface Page { id: string; title: string; slug: string; content: string; status: string; order: number; showInFooter: boolean; updatedAt: string }

function PagesTab() {
  const [items, setItems] = useState<Page[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Page | null>(null)
  const [form, setForm] = useState<any>({ title: '', slug: '', content: '', status: 'PUBLISHED', order: 0, showInFooter: true })

  const refresh = async () => { setLoading(true); const res = await fetch('/api/admin/pages'); setItems(await res.json()); setLoading(false) }
  useEffect(() => {
    let cancelled = false
    const load = async () => { setLoading(true); const res = await fetch('/api/admin/pages'); const d = await res.json(); if (!cancelled) { setItems(d); setLoading(false) } }
    load()
    return () => { cancelled = true }
  }, [])

  const openAdd = () => { setEditing(null); setForm({ title: '', slug: '', content: '', status: 'PUBLISHED', order: items.length, showInFooter: true }); setOpen(true) }
  const openEdit = (p: Page) => { setEditing(p); setForm({ ...p }); setOpen(true) }

  const save = async () => {
    if (!form.title) { toast.error('Title required'); return }
    const res = await fetch('/api/admin/pages', {
      method: editing ? 'PATCH' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editing ? { id: editing.id, ...form } : form),
    })
    if (res.ok) { toast.success(editing ? 'Page updated' : 'Page created'); setOpen(false); refresh() }
    else { const d = await res.json(); toast.error(d.error || 'Failed') }
  }

  const remove = async (id: string) => { if (!confirm('Delete this page?')) return; const res = await fetch(`/api/admin/pages/${id}`, { method: 'DELETE' }); if (res.ok) { toast.success('Page deleted'); refresh() } }

  if (loading) return <div className="space-y-3">{Array.from({length: 3}).map((_, i) => <Skeleton key={i} className="h-12" />)}</div>

  return (
    <div className="space-y-3">
      <div className="flex justify-end"><Button className="amz-bg-yellow hover:bg-[#f7ca00] text-black" onClick={openAdd}><Plus className="w-4 h-4 mr-1" /> Add Page</Button></div>
      {items.length === 0 ? (
        <EmptyState icon={FileCode} title="No pages" description="Create your first page." action={<Button className="amz-bg-yellow hover:bg-[#f7ca00] text-black" onClick={openAdd}><Plus className="w-4 h-4 mr-1" /> Add Page</Button>} />
      ) : (
        <div className="space-y-2">
          {items.map(p => (
            <Card key={p.id} className="p-3 flex items-center justify-between">
              <div className="flex items-center gap-3 min-w-0">
                <FileCode className="w-4 h-4 text-slate-400 shrink-0" />
                <div className="min-w-0">
                  <div className="font-medium text-sm flex items-center gap-2">{p.title} <Badge variant="outline" className={p.status === 'PUBLISHED' ? 'bg-emerald-50 text-emerald-700' : ''}>{p.status}</Badge>{p.showInFooter && <Badge variant="outline" className="text-xs">Footer</Badge>}</div>
                  <div className="text-xs text-slate-500">/{p.slug} · Updated {new Date(p.updatedAt).toLocaleDateString()}</div>
                </div>
              </div>
              <div className="flex gap-1 shrink-0">
                <Button size="sm" variant="ghost" onClick={() => openEdit(p)}><Pencil className="w-4 h-4" /></Button>
                <Button size="sm" variant="ghost" className="text-red-500" onClick={() => remove(p.id)}><Trash2 className="w-4 h-4" /></Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editing ? 'Edit Page' : 'Add Page'}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Title *</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value, slug: form.slug || e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-') })} /></div>
              <div><Label>Slug (URL)</Label><Input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder="about-us" /></div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label>Status</Label>
                <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="PUBLISHED">Published</SelectItem><SelectItem value="DRAFT">Draft</SelectItem></SelectContent>
                </Select>
              </div>
              <div><Label>Order</Label><Input type="number" value={form.order} onChange={(e) => setForm({ ...form, order: Number(e.target.value) })} /></div>
              <label className="flex items-end gap-2 pb-2"><Switch checked={form.showInFooter} onCheckedChange={(v) => setForm({ ...form, showInFooter: v })} /> Show in footer</label>
            </div>
            <div>
              <Label>Content (Markdown supported)</Label>
              <Textarea rows={14} value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} className="font-mono text-xs" placeholder="# Page Title&#10;&#10;Write your content here..." />
              <p className="text-xs text-slate-500 mt-1">Supports Markdown: # headings, **bold**, *italic*, - lists, [links](url)</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button className="amz-bg-yellow hover:bg-[#f7ca00] text-black" onClick={save}><Save className="w-4 h-4 mr-1" /> {editing ? 'Update' : 'Create'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// ───────────────────────── Blog ─────────────────────────
interface Post { id: string; title: string; slug: string; excerpt: string | null; content: string; coverImage: string | null; author: string | null; tags: string[]; status: string; publishedAt: string | null; updatedAt: string }

function BlogTab() {
  const [items, setItems] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Post | null>(null)
  const [form, setForm] = useState<any>({ title: '', slug: '', excerpt: '', content: '', coverImage: '', author: 'ETMarket Team', tags: '', status: 'PUBLISHED' })

  const refresh = async () => { setLoading(true); const res = await fetch('/api/admin/blog'); setItems(await res.json()); setLoading(false) }
  useEffect(() => {
    let cancelled = false
    const load = async () => { setLoading(true); const res = await fetch('/api/admin/blog'); const d = await res.json(); if (!cancelled) { setItems(d); setLoading(false) } }
    load()
    return () => { cancelled = true }
  }, [])

  const openAdd = () => { setEditing(null); setForm({ title: '', slug: '', excerpt: '', content: '', coverImage: '', author: 'ETMarket Team', tags: '', status: 'PUBLISHED' }); setOpen(true) }
  const openEdit = (p: Post) => { setEditing(p); setForm({ ...p, tags: (p.tags || []).join(', ') }); setOpen(true) }

  const save = async () => {
    if (!form.title) { toast.error('Title required'); return }
    const body = { ...form, tags: form.tags ? form.tags.split(',').map((s: string) => s.trim()).filter(Boolean) : [] }
    const res = await fetch('/api/admin/blog', {
      method: editing ? 'PATCH' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editing ? { id: editing.id, ...body } : body),
    })
    if (res.ok) { toast.success(editing ? 'Post updated' : 'Post created'); setOpen(false); refresh() }
    else { const d = await res.json(); toast.error(d.error || 'Failed') }
  }

  const remove = async (id: string) => { if (!confirm('Delete this blog post?')) return; const res = await fetch(`/api/admin/blog/${id}`, { method: 'DELETE' }); if (res.ok) { toast.success('Post deleted'); refresh() } }

  if (loading) return <div className="space-y-3">{Array.from({length: 3}).map((_, i) => <Skeleton key={i} className="h-20" />)}</div>

  return (
    <div className="space-y-3">
      <div className="flex justify-end"><Button className="amz-bg-yellow hover:bg-[#f7ca00] text-black" onClick={openAdd}><Plus className="w-4 h-4 mr-1" /> New Post</Button></div>
      {items.length === 0 ? (
        <EmptyState icon={PostIcon} title="No blog posts" description="Create your first blog post." action={<Button className="amz-bg-yellow hover:bg-[#f7ca00] text-black" onClick={openAdd}><Plus className="w-4 h-4 mr-1" /> New Post</Button>} />
      ) : (
        <div className="space-y-2">
          {items.map(p => (
            <Card key={p.id} className="p-3 flex items-start gap-3">
              {p.coverImage && <img src={p.coverImage} alt="" className="w-20 h-20 rounded object-cover shrink-0" />}
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm flex items-center gap-2 flex-wrap">{p.title} <Badge variant="outline" className={p.status === 'PUBLISHED' ? 'bg-emerald-50 text-emerald-700' : ''}>{p.status}</Badge></div>
                <div className="text-xs text-slate-500 line-clamp-1">{p.excerpt || 'No excerpt'}</div>
                <div className="text-xs text-slate-400 mt-1 flex items-center gap-2 flex-wrap">
                  <span className="flex items-center gap-1"><Tag className="w-3 h-3" />{p.author || 'Unknown'}</span>
                  {p.publishedAt && <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{new Date(p.publishedAt).toLocaleDateString()}</span>}
                  {(p.tags || []).map((t: string) => <Badge key={t} variant="outline" className="text-xs">{t}</Badge>)}
                </div>
              </div>
              <div className="flex flex-col gap-1 shrink-0">
                <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => openEdit(p)}><Pencil className="w-3.5 h-3.5" /></Button>
                <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-red-500" onClick={() => remove(p.id)}><Trash2 className="w-3.5 h-3.5" /></Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editing ? 'Edit Post' : 'New Blog Post'}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Title *</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value, slug: form.slug || e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-') })} /></div>
              <div><Label>Slug (URL)</Label><Input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} /></div>
            </div>
            <div><Label>Excerpt (short summary)</Label><Input value={form.excerpt} onChange={(e) => setForm({ ...form, excerpt: e.target.value })} placeholder="A brief summary shown in post listings" /></div>
            <div><Label>Cover Image</Label><FileUpload label="" value={form.coverImage} onChange={(url) => setForm({ ...form, coverImage: url })} accept=".jpg,.jpeg,.png,.pdf" maxSize={5 * 1024 * 1024} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Author</Label><Input value={form.author} onChange={(e) => setForm({ ...form, author: e.target.value })} /></div>
              <div><Label>Tags (comma-separated)</Label><Input value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} placeholder="coffee, ethiopia, deals" /></div>
            </div>
            <div>
              <Label>Status</Label>
              <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="PUBLISHED">Published</SelectItem><SelectItem value="DRAFT">Draft</SelectItem></SelectContent>
              </Select>
            </div>
            <div>
              <Label>Content (Markdown supported)</Label>
              <Textarea rows={14} value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} className="font-mono text-xs" placeholder="# Post Title&#10;&#10;Write your post here..." />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button className="amz-bg-yellow hover:bg-[#f7ca00] text-black" onClick={save}><Save className="w-4 h-4 mr-1" /> {editing ? 'Update' : 'Publish'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// ───────────────────────── FAQs ─────────────────────────
interface Faq { id: string; question: string; answer: string; category: string; order: number; active: boolean }

function FaqsTab() {
  const [items, setItems] = useState<Faq[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Faq | null>(null)
  const [form, setForm] = useState<any>({ question: '', answer: '', category: 'GENERAL', order: 0, active: true })

  const refresh = async () => { setLoading(true); const res = await fetch('/api/admin/faqs'); setItems(await res.json()); setLoading(false) }
  useEffect(() => {
    let cancelled = false
    const load = async () => { setLoading(true); const res = await fetch('/api/admin/faqs'); const d = await res.json(); if (!cancelled) { setItems(d); setLoading(false) } }
    load()
    return () => { cancelled = true }
  }, [])

  const openAdd = () => { setEditing(null); setForm({ question: '', answer: '', category: 'GENERAL', order: items.length, active: true }); setOpen(true) }
  const openEdit = (f: Faq) => { setEditing(f); setForm({ ...f }); setOpen(true) }

  const save = async () => {
    if (!form.question || !form.answer) { toast.error('Question and answer required'); return }
    const res = await fetch('/api/admin/faqs', {
      method: editing ? 'PATCH' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editing ? { id: editing.id, ...form } : form),
    })
    if (res.ok) { toast.success(editing ? 'FAQ updated' : 'FAQ created'); setOpen(false); refresh() }
    else { const d = await res.json(); toast.error(d.error || 'Failed') }
  }

  const remove = async (id: string) => { if (!confirm('Delete this FAQ?')) return; const res = await fetch(`/api/admin/faqs/${id}`, { method: 'DELETE' }); if (res.ok) { toast.success('FAQ deleted'); refresh() } }

  if (loading) return <div className="space-y-3">{Array.from({length: 3}).map((_, i) => <Skeleton key={i} className="h-16" />)}</div>

  return (
    <div className="space-y-3">
      <div className="flex justify-end"><Button className="amz-bg-yellow hover:bg-[#f7ca00] text-black" onClick={openAdd}><Plus className="w-4 h-4 mr-1" /> Add FAQ</Button></div>
      {items.length === 0 ? (
        <EmptyState icon={FileText} title="No FAQs" description="Add your first FAQ." action={<Button className="amz-bg-yellow hover:bg-[#f7ca00] text-black" onClick={openAdd}><Plus className="w-4 h-4 mr-1" /> Add FAQ</Button>} />
      ) : (
        <Card className="p-4 space-y-2">
          {items.map(f => (
            <div key={f.id} className={`border rounded p-3 ${!f.active ? 'opacity-60' : ''}`}>
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="outline" className="text-xs">{f.category}</Badge>
                    {!f.active && <Badge variant="outline" className="text-xs">Inactive</Badge>}
                  </div>
                  <div className="font-medium text-sm">{f.question}</div>
                  <p className="text-xs text-slate-600 mt-1">{f.answer}</p>
                </div>
                <div className="flex gap-1 shrink-0">
                  <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => openEdit(f)}><Pencil className="w-3.5 h-3.5" /></Button>
                  <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-red-500" onClick={() => remove(f.id)}><Trash2 className="w-3.5 h-3.5" /></Button>
                </div>
              </div>
            </div>
          ))}
        </Card>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editing ? 'Edit FAQ' : 'Add FAQ'}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>Question *</Label><Input value={form.question} onChange={(e) => setForm({ ...form, question: e.target.value })} /></div>
            <div><Label>Answer *</Label><Textarea rows={4} value={form.answer} onChange={(e) => setForm({ ...form, answer: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Category</Label>
                <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="GENERAL">General</SelectItem>
                    <SelectItem value="ORDERS">Orders</SelectItem>
                    <SelectItem value="PAYMENTS">Payments</SelectItem>
                    <SelectItem value="SHIPPING">Shipping</SelectItem>
                    <SelectItem value="RETURNS">Returns</SelectItem>
                    <SelectItem value="ACCOUNT">Account</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div><Label>Order</Label><Input type="number" value={form.order} onChange={(e) => setForm({ ...form, order: Number(e.target.value) })} /></div>
            </div>
            <label className="flex items-center gap-2"><Switch checked={form.active} onCheckedChange={(v) => setForm({ ...form, active: v })} /> Active (visible on site)</label>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button className="amz-bg-yellow hover:bg-[#f7ca00] text-black" onClick={save}><Save className="w-4 h-4 mr-1" /> {editing ? 'Update' : 'Create'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
