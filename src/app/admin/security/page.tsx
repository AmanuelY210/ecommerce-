'use client'
import { useEffect, useState } from 'react'
import { LayoutDashboard, Users, Store, Package, Wallet, Settings, FileText, ShieldCheck, Lock, Key, Activity, AlertTriangle, ShieldAlert, Database } from 'lucide-react'
import { DashboardShell } from '@/components/layout/dashboard-shell'
import { SectionHeader, StatCard, EmptyState } from '@/components/dashboard/widgets'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Switch } from '@/components/ui/switch'
import { timeAgo } from '@/lib/helpers'
import { Skeleton } from '@/components/ui/skeleton'

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

const AUDIT_LOGS = [
  { id: 1, user: 'Selam Admin', action: 'VENDOR_APPROVED', target: 'Addis Tech Hub', ip: '196.188.0.1', time: '2h ago' },
  { id: 2, user: 'Dagim Moderator', action: 'PRODUCT_REJECTED', target: 'SKU-00042', ip: '196.188.0.2', time: '5h ago' },
  { id: 3, user: 'Selam Admin', action: 'SETTINGS_UPDATED', target: 'commission_rate', ip: '196.188.0.1', time: '1d ago' },
  { id: 4, user: 'Selam Admin', action: 'USER_SUSPENDED', target: 'suspicious@spam.et', ip: '196.188.0.1', time: '2d ago' },
]

export default function AdminSecurityPage() {
  return <DashboardShell nav={NAV} title="Security" role="admin" requiredRole="ADMIN"><SecurityContent /></DashboardShell>
}

function SecurityContent() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard label="Active Sessions" value="3" icon={Activity} color="bg-blue-500" />
        <StatCard label="2FA Enabled" value="2/5" icon={Lock} color="bg-emerald-500" />
        <StatCard label="Failed Logins (24h)" value="14" icon={AlertTriangle} color="bg-amber-500" />
        <StatCard label="Blocked IPs" value="8" icon={ShieldAlert} color="bg-red-500" />
      </div>

      <Card className="p-4">
        <SectionHeader title="Security Settings" />
        <div className="space-y-3">
          {[
            { label: 'Two-factor authentication (admin)', on: true },
            { label: 'Force 2FA for vendors', on: false },
            { label: 'CAPTCHA on login', on: true },
            { label: 'Rate limiting on API', on: true },
            { label: 'IP whitelist for admin panel', on: false },
            { label: 'Auto-suspend on 5 failed logins', on: true },
            { label: 'Audit logging', on: true },
            { label: 'Daily backups', on: true },
          ].map(s => (
            <div key={s.label} className="flex items-center justify-between border-b last:border-0 pb-2 last:pb-0">
              <span className="text-sm">{s.label}</span>
              <Switch defaultChecked={s.on} />
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-4">
        <SectionHeader title="API Keys" description="Manage API keys for integrations" />
        <div className="space-y-2">
          {[
            { name: 'Chapa Production', key: 'CHA-PROD-***...***-8f2a', created: '2024-01-15' },
            { name: 'CBE Direct API', key: 'CBE-***...***-a1b9', created: '2024-02-20' },
            { name: 'Telebirr Webhook', key: 'TB-***...***-7c3d', created: '2024-03-10' },
          ].map(k => (
            <div key={k.name} className="flex items-center justify-between border-b last:border-0 pb-2 last:pb-0">
              <div>
                <div className="font-medium text-sm">{k.name}</div>
                <div className="text-xs text-slate-500 font-mono">{k.key} · created {k.created}</div>
              </div>
              <Button size="sm" variant="outline">Rotate</Button>
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-4">
        <SectionHeader title="Audit Logs" description="Recent admin actions" />
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Action</TableHead>
              <TableHead>Target</TableHead>
              <TableHead>IP</TableHead>
              <TableHead>Time</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {AUDIT_LOGS.map(log => (
              <TableRow key={log.id}>
                <TableCell className="text-sm font-medium">{log.user}</TableCell>
                <TableCell><Badge variant="outline">{log.action}</Badge></TableCell>
                <TableCell className="text-sm">{log.target}</TableCell>
                <TableCell className="text-xs font-mono">{log.ip}</TableCell>
                <TableCell className="text-xs text-slate-500">{log.time}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      <Card className="p-4">
        <SectionHeader title="Backup & Recovery" />
        <div className="flex items-center justify-between">
          <div>
            <div className="font-medium text-sm">Last backup: 2 hours ago</div>
            <div className="text-xs text-slate-500">Automated daily backups to encrypted storage</div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm"><Database className="w-4 h-4 mr-1" /> Backup Now</Button>
            <Button variant="outline" size="sm">Restore</Button>
          </div>
        </div>
      </Card>
    </div>
  )
}
