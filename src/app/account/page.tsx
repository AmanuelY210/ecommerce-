'use client'
import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { User, Heart, Package, Bell, Ticket, MapPin, Settings, LogOut } from 'lucide-react'
import { useT } from '@/hooks/use-t'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { StorefrontShell } from '@/components/layout/storefront-shell'
import { useAuth } from '@/lib/store'
import { ETB, statusColor, timeAgo } from '@/lib/helpers'
import { Skeleton } from '@/components/ui/skeleton'

export default function AccountPage() {
  const { t } = useT()
  const router = useRouter()
  const sp = useSearchParams()
  const user = useAuth((s) => s.user)
  const logout = useAuth((s) => s.logout)
  const initialTab = sp.get('tab') || 'profile'

  const [orders, setOrders] = useState<any[]>([])
  const [wishlist, setWishlist] = useState<any[]>([])
  const [notifications, setNotifications] = useState<any[]>([])

  useEffect(() => {
    if (!user) {
      router.push('/login?redirect=/account')
      return
    }
    fetch('/api/orders').then(r => r.json()).then(d => setOrders(Array.isArray(d) ? d.slice(0, 5) : []))
    fetch('/api/wishlist').then(r => r.json()).then(d => setWishlist(Array.isArray(d) ? d : []))
    fetch('/api/notifications').then(r => r.json()).then(d => setNotifications(Array.isArray(d) ? d : []))
  }, [user, router])

  if (!user) return null

  return (
    <StorefrontShell>
      <div className="max-w-5xl mx-auto px-4 py-6 w-full">
        <Card className="p-4 mb-4">
          <div className="flex items-center gap-4">
            <Avatar className="w-16 h-16">
              <AvatarImage src={user.avatar || undefined} />
              <AvatarFallback>{user.name.slice(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-xl font-bold">{user.name}</h1>
              <p className="text-sm text-slate-500">{user.email}</p>
              <Badge variant="outline" className="mt-1">{user.role}</Badge>
            </div>
            <Button variant="outline" size="sm" className="ml-auto" onClick={() => { logout(); router.push('/') }}>
              <LogOut className="w-4 h-4 mr-1" /> Sign Out
            </Button>
          </div>
        </Card>

        <Tabs defaultValue={initialTab}>
          <TabsList className="flex-wrap h-auto">
            <TabsTrigger value="profile"><User className="w-4 h-4 mr-1" /> Profile</TabsTrigger>
            <TabsTrigger value="orders"><Package className="w-4 h-4 mr-1" /> Orders</TabsTrigger>
            <TabsTrigger value="wishlist"><Heart className="w-4 h-4 mr-1" /> Wishlist</TabsTrigger>
            <TabsTrigger value="addresses"><MapPin className="w-4 h-4 mr-1" /> Addresses</TabsTrigger>
            <TabsTrigger value="notifications"><Bell className="w-4 h-4 mr-1" /> Notifications</TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <Card className="p-4">
              <h2 className="font-bold mb-3">Profile Information</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                <div><div className="text-xs text-slate-500">Full Name</div><div className="font-medium">{user.name}</div></div>
                <div><div className="text-xs text-slate-500">Email</div><div className="font-medium">{user.email}</div></div>
                <div><div className="text-xs text-slate-500">Phone</div><div className="font-medium">{user.phone || '—'}</div></div>
                <div><div className="text-xs text-slate-500">Role</div><div className="font-medium">{user.role}</div></div>
              </div>
              <Button variant="outline" size="sm" className="mt-4">Edit Profile</Button>
            </Card>
          </TabsContent>

          <TabsContent value="orders">
            <Card className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-bold">Recent Orders</h2>
                <Button size="sm" variant="outline" asChild><Link href="/orders">View all</Link></Button>
              </div>
              {orders.length === 0 ? <p className="text-sm text-slate-500 py-4">No orders yet.</p> : (
                <div className="space-y-2">
                  {orders.map(o => (
                    <Link key={o.id} href={`/orders/${o.id}`} className="block border rounded p-3 hover:shadow-sm">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium text-sm">{o.orderNumber}</div>
                          <div className="text-xs text-slate-500">{timeAgo(o.createdAt)} · {o.items?.length} items</div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className={statusColor(o.status)}>{o.status}</Badge>
                          <span className="font-bold">{ETB(o.total)}</span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </Card>
          </TabsContent>

          <TabsContent value="wishlist">
            <Card className="p-4">
              <h2 className="font-bold mb-3">Your Wishlist</h2>
              {wishlist.length === 0 ? <p className="text-sm text-slate-500 py-4">No items in wishlist.</p> : (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {wishlist.map(w => (
                    <Link key={w.id} href={`/products/${w.productId}`} className="block border rounded overflow-hidden hover:shadow-sm">
                      <div className="aspect-square bg-slate-50"><img src={w.product?.images?.[0]} alt="" className="w-full h-full object-cover" /></div>
                      <div className="p-2">
                        <div className="text-xs line-clamp-2">{w.product?.name}</div>
                        <div className="font-bold text-sm">{ETB(w.product?.price || 0)}</div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </Card>
          </TabsContent>

          <TabsContent value="addresses">
            <Card className="p-4">
              <h2 className="font-bold mb-3">Saved Addresses</h2>
              <div className="border rounded p-3 mb-2">
                <div className="font-medium text-sm">Home (Default)</div>
                <div className="text-sm text-slate-600">Abel Customer, +251911000004</div>
                <div className="text-sm text-slate-600">Bole, Addis Ababa, Addis Ababa</div>
                <div className="text-sm text-slate-600">House 123</div>
              </div>
              <Button variant="outline" size="sm">+ Add Address</Button>
            </Card>
          </TabsContent>

          <TabsContent value="notifications">
            <Card className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-bold">Notifications</h2>
                <Button size="sm" variant="outline" onClick={async () => {
                  await fetch('/api/notifications', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: 'all', read: true }) })
                  setNotifications(notifications.map(n => ({ ...n, read: true })))
                }}>Mark all read</Button>
              </div>
              <div className="space-y-2">
                {notifications.map(n => (
                  <div key={n.id} className={`border rounded p-3 ${n.read ? 'opacity-60' : 'bg-amber-50 border-amber-200'}`}>
                    <div className="flex items-center justify-between">
                      <div className="font-medium text-sm">{n.title}</div>
                      <span className="text-xs text-slate-400">{timeAgo(n.createdAt)}</span>
                    </div>
                    <p className="text-sm text-slate-600 mt-1">{n.message}</p>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </StorefrontShell>
  )
}
