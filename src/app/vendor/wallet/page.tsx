'use client'
import { useEffect, useState } from 'react'
import { Store, Package, ShoppingCart, Wallet, BarChart3, Tag, Settings, AlertTriangle, Banknote, ArrowUpRight, TrendingUp } from 'lucide-react'
import { DashboardShell } from '@/components/layout/dashboard-shell'
import { SectionHeader, StatCard, EmptyState } from '@/components/dashboard/widgets'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from '@/components/ui/dialog'
import { ETB, statusColor, ETHIOPIAN_BANKS, timeAgo } from '@/lib/helpers'
import { toast } from 'sonner'
import { Skeleton } from '@/components/ui/skeleton'

const NAV = [
  { label: 'Dashboard', href: '/vendor', icon: Store },
  { label: 'Products', href: '/vendor/products', icon: Package },
  { label: 'Orders', href: '/vendor/orders', icon: ShoppingCart },
  { label: 'Inventory', href: '/vendor/inventory', icon: AlertTriangle },
  { label: 'Wallet', href: '/vendor/wallet', icon: Wallet },
  { label: 'Reports', href: '/vendor/reports', icon: BarChart3 },
  { label: 'Marketing', href: '/vendor/marketing', icon: Tag },
  { label: 'Store Settings', href: '/vendor/settings', icon: Settings },
]

export default function VendorWalletPage() {
  return <DashboardShell nav={NAV} title="Wallet" role="vendor" requiredRole="VENDOR"><WalletContent /></DashboardShell>
}

function WalletContent() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({ amount: '', bankName: ETHIOPIAN_BANKS[0].name, accountNo: '' })

  useEffect(() => {
    fetch('/api/vendor/stats').then(r => r.json()).then(d => { setData(d); setLoading(false) })
  }, [])

  const requestWithdrawal = async () => {
    if (!form.amount || !form.bankName || !form.accountNo) {
      toast.error('Fill all fields')
      return
    }
    const res = await fetch('/api/vendor/withdrawals', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    const d = await res.json()
    if (res.ok) {
      toast.success('Withdrawal requested')
      setOpen(false)
      setForm({ amount: '', bankName: ETHIOPIAN_BANKS[0].name, accountNo: '' })
      // Refetch
      const updated = await fetch('/api/vendor/stats').then(r => r.json())
      setData(updated)
    } else {
      toast.error(d.error || 'Failed')
    }
  }

  if (loading) return <div className="space-y-3">{Array.from({length: 3}).map((_, i) => <Skeleton key={i} className="h-32" />)}</div>
  if (!data) return null

  const { vendor, withdrawals, stats } = data

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <StatCard label="Available Balance" value={ETB(stats.balance)} icon={Wallet} color="bg-emerald-500" sub="Ready to withdraw" />
        <StatCard label="Pending" value={ETB(stats.pending)} icon={TrendingUp} color="bg-amber-500" sub="In transit orders" />
        <StatCard label="Total Earned" value={ETB(vendor.totalSales)} icon={Banknote} color="bg-blue-500" sub={`${vendor.totalOrders} orders`} />
      </div>

      <Card className="p-6 bg-gradient-to-br from-emerald-600 to-teal-700 text-white">
        <div className="flex items-start justify-between">
          <div>
            <div className="text-sm text-white/80">Available for Withdrawal</div>
            <div className="text-4xl font-bold mt-1">{ETB(stats.balance)}</div>
            <div className="text-xs text-white/70 mt-2">Withdrawals processed within 1-2 business days</div>
          </div>
          <Button className="bg-white text-emerald-700 hover:bg-white/90 font-semibold" onClick={() => setOpen(true)}>
            <ArrowUpRight className="w-4 h-4 mr-1" /> Withdraw
          </Button>
        </div>
      </Card>

      <SectionHeader title="Withdrawal History" />
      {withdrawals.length === 0 ? (
        <EmptyState icon={Banknote} title="No withdrawals yet" description="Your withdrawal history will appear here." />
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Bank</TableHead>
                <TableHead>Account</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Reference</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {withdrawals.map((w: any) => (
                <TableRow key={w.id}>
                  <TableCell className="text-xs">{timeAgo(w.createdAt)}</TableCell>
                  <TableCell className="font-semibold">{ETB(w.amount)}</TableCell>
                  <TableCell className="text-sm">{w.bankName}</TableCell>
                  <TableCell className="text-xs font-mono">{w.accountNo}</TableCell>
                  <TableCell><Badge variant="outline" className={statusColor(w.status)}>{w.status}</Badge></TableCell>
                  <TableCell className="text-xs font-mono">{w.reference || '—'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Request Withdrawal</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Amount (ETB) — Available: {ETB(stats.balance)}</Label>
              <Input type="number" value={form.amount} onChange={(e) => setForm(s => ({...s, amount: e.target.value}))} />
            </div>
            <div>
              <Label>Bank</Label>
              <Select value={form.bankName} onValueChange={(v) => setForm(s => ({...s, bankName: v}))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{ETHIOPIAN_BANKS.map(b => <SelectItem key={b.code} value={b.name}>{b.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label>Account Number</Label>
              <Input value={form.accountNo} onChange={(e) => setForm(s => ({...s, accountNo: e.target.value}))} placeholder="1234-5678-9012" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button className="amz-bg-yellow hover:bg-[#f7ca00] text-black" onClick={requestWithdrawal}>Request Withdrawal</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
