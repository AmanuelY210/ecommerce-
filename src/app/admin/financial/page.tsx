'use client'
import { useEffect, useState } from 'react'
import { LayoutDashboard, Users, Store, Package, Wallet, Settings, FileText, ShieldCheck, Banknote, Check, X, TrendingUp, DollarSign } from 'lucide-react'
import { DashboardShell } from '@/components/layout/dashboard-shell'
import { SectionHeader, StatCard, EmptyState } from '@/components/dashboard/widgets'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ETB, statusColor, timeAgo } from '@/lib/helpers'
import { Skeleton } from '@/components/ui/skeleton'
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

export default function AdminFinancialPage() {
  return <DashboardShell nav={NAV} title="Financial" role="admin" requiredRole="ADMIN"><FinancialContent /></DashboardShell>
}

function FinancialContent() {
  const [stats, setStats] = useState<any>(null)
  const [withdrawals, setWithdrawals] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch('/api/admin/stats').then(r => r.json()),
      fetch('/api/admin/withdrawals').then(r => r.json()),
    ]).then(([s, w]) => {
      setStats(s)
      setWithdrawals(Array.isArray(w) ? w : [])
      setLoading(false)
    })
  }, [])

  const update = async (id: string, action: string) => {
    const res = await fetch('/api/admin/withdrawals', {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, action }),
    })
    if (res.ok) {
      toast.success(`Withdrawal ${action}d`)
      const status = action === 'approve' ? 'APPROVED' : action === 'pay' ? 'PAID' : 'REJECTED'
      setWithdrawals(withdrawals.map(w => w.id === id ? { ...w, status } : w))
    }
  }

  if (loading) return <div className="space-y-3">{Array.from({length: 3}).map((_, i) => <Skeleton key={i} className="h-32" />)}</div>

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard label="GMV (30d)" value={ETB(stats?.counts?.gmv || 0)} icon={DollarSign} color="bg-emerald-500" />
        <StatCard label="Commission" value={ETB(stats?.counts?.commission || 0)} icon={TrendingUp} color="bg-amber-500" />
        <StatCard label="Pending Withdrawals" value={withdrawals.filter(w => w.status === 'PENDING').length} icon={Banknote} color="bg-blue-500" />
        <StatCard label="Paid Out" value={ETB(withdrawals.filter(w => w.status === 'PAID').reduce((s, w) => s + w.amount, 0))} icon={Wallet} color="bg-purple-500" />
      </div>

      <SectionHeader title="Withdrawal Requests" description="Approve vendor withdrawal requests" />

      {withdrawals.length === 0 ? (
        <EmptyState icon={Banknote} title="No withdrawals" description="Vendor withdrawal requests will appear here." />
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Vendor</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Bank</TableHead>
                <TableHead>Account</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {withdrawals.map(w => (
                <TableRow key={w.id}>
                  <TableCell className="text-xs">{timeAgo(w.createdAt)}</TableCell>
                  <TableCell className="text-sm font-medium">{w.vendor?.storeName}</TableCell>
                  <TableCell className="font-bold">{ETB(w.amount)}</TableCell>
                  <TableCell className="text-sm">{w.bankName}</TableCell>
                  <TableCell className="text-xs font-mono">{w.accountNo}</TableCell>
                  <TableCell><Badge variant="outline" className={statusColor(w.status)}>{w.status}</Badge></TableCell>
                  <TableCell>
                    {w.status === 'PENDING' && (
                      <div className="flex gap-1">
                        <Button size="sm" className="h-7 amz-bg-yellow hover:bg-[#f7ca00] text-black text-xs" onClick={() => update(w.id, 'approve')}><Check className="w-3 h-3" /></Button>
                        <Button size="sm" variant="outline" className="h-7 text-red-600 text-xs" onClick={() => update(w.id, 'reject')}><X className="w-3 h-3" /></Button>
                      </div>
                    )}
                    {w.status === 'APPROVED' && (
                      <Button size="sm" className="h-7 text-xs" onClick={() => update(w.id, 'pay')}>Mark Paid</Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  )
}
