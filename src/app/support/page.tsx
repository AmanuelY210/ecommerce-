'use client'
import { useEffect, useState } from 'react'
import { Headphones, MessageSquare, RefreshCw, AlertTriangle, Send, CheckCircle2, Clock, User, ArrowUpCircle } from 'lucide-react'
import { DashboardShell } from '@/components/layout/dashboard-shell'
import { SectionHeader, StatCard, EmptyState } from '@/components/dashboard/widgets'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { statusColor, timeAgo } from '@/lib/helpers'
import { Skeleton } from '@/components/ui/skeleton'
import { useAuth } from '@/lib/store'
import { toast } from 'sonner'

const NAV = [
  { label: 'Dashboard', href: '/support', icon: Headphones },
  { label: 'Tickets', href: '/support/tickets', icon: MessageSquare },
  { label: 'Live Chat', href: '/support/chat', icon: MessageSquare },
  { label: 'Refund Requests', href: '/support/refunds', icon: RefreshCw },
  { label: 'Escalations', href: '/support/escalations', icon: ArrowUpCircle },
]

export default function SupportDashboard() {
  return <DashboardShell nav={NAV} title="Customer Support" role="support" requiredRole={['SUPPORT', 'ADMIN']}><SupportContent /></DashboardShell>
}

function SupportContent() {
  const user = useAuth((s) => s.user)
  const [tickets, setTickets] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<string | null>(null)
  const [reply, setReply] = useState('')

  useEffect(() => {
    fetch('/api/support/tickets').then(r => r.json()).then(d => {
      setTickets(Array.isArray(d) ? d : [])
      setLoading(false)
      if (d.length > 0 && !selected) setSelected(d[0].id)
    })
  }, [])

  const sendReply = async () => {
    if (!reply.trim() || !selected) return
    const res = await fetch(`/api/support/tickets/${selected}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'message', message: reply }),
    })
    if (res.ok) {
      setReply('')
      toast.success('Reply sent')
      // Refetch
      const updated = await fetch('/api/support/tickets').then(r => r.json())
      setTickets(updated)
    }
  }

  const updateStatus = async (id: string, status: string) => {
    const res = await fetch(`/api/support/tickets/${id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    if (res.ok) {
      toast.success(`Ticket ${status.toLowerCase()}`)
      setTickets(tickets.map(t => t.id === id ? { ...t, status } : t))
    }
  }

  if (loading) return <div className="space-y-3">{Array.from({length: 4}).map((_, i) => <Skeleton key={i} className="h-32" />)}</div>

  const open = tickets.filter(t => t.status === 'OPEN').length
  const inProgress = tickets.filter(t => t.status === 'IN_PROGRESS').length
  const resolved = tickets.filter(t => t.status === 'RESOLVED').length
  const high = tickets.filter(t => t.priority === 'HIGH' || t.priority === 'URGENT').length

  const selectedTicket = tickets.find(t => t.id === selected)

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard label="Open Tickets" value={open} icon={Clock} color="bg-blue-500" />
        <StatCard label="In Progress" value={inProgress} icon={MessageSquare} color="bg-amber-500" />
        <StatCard label="High Priority" value={high} icon={AlertTriangle} color="bg-red-500" />
        <StatCard label="Resolved (7d)" value={resolved} icon={CheckCircle2} color="bg-emerald-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Ticket list */}
        <Card className="lg:col-span-1 p-2 max-h-[70vh] overflow-y-auto">
          <div className="p-2 border-b sticky top-0 bg-white">
            <h3 className="font-semibold text-sm">Tickets ({tickets.length})</h3>
          </div>
          {tickets.length === 0 ? (
            <p className="text-sm text-slate-500 text-center py-8">No tickets</p>
          ) : (
            <div className="space-y-1">
              {tickets.map(t => (
                <button
                  key={t.id}
                  onClick={() => setSelected(t.id)}
                  className={`w-full text-left p-2 rounded transition-colors ${selected === t.id ? 'bg-amber-50 border border-amber-200' : 'hover:bg-slate-50'}`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-mono">{t.ticketNo}</span>
                    <Badge variant="outline" className={`text-xs ${statusColor(t.status)}`}>{t.status}</Badge>
                  </div>
                  <div className="text-sm font-medium line-clamp-1">{t.subject}</div>
                  <div className="text-xs text-slate-500 mt-1">
                    {t.customer?.name} · {timeAgo(t.createdAt)}
                    {t.priority === 'URGENT' && <Badge variant="outline" className="ml-1 bg-red-50 text-red-700 text-xs">{t.priority}</Badge>}
                  </div>
                </button>
              ))}
            </div>
          )}
        </Card>

        {/* Conversation */}
        <Card className="lg:col-span-2 flex flex-col max-h-[70vh]">
          {selectedTicket ? (
            <>
              <div className="p-4 border-b">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="text-xs font-mono text-slate-500">{selectedTicket.ticketNo}</div>
                    <h3 className="font-bold">{selectedTicket.subject}</h3>
                    <div className="text-xs text-slate-500 mt-1">
                      From: {selectedTicket.customer?.name} ({selectedTicket.customer?.email}) · {timeAgo(selectedTicket.createdAt)}
                    </div>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <Select value={selectedTicket.status} onValueChange={(v) => updateStatus(selectedTicket.id, v)}>
                      <SelectTrigger className="h-8 w-32 text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="OPEN">Open</SelectItem>
                        <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                        <SelectItem value="RESOLVED">Resolved</SelectItem>
                        <SelectItem value="CLOSED">Closed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-3 scroll-pretty">
                {selectedTicket.messages?.map((m: any) => (
                  <div key={m.id} className={`flex gap-2 ${m.isStaff ? 'flex-row-reverse' : ''}`}>
                    <Avatar className="w-8 h-8 shrink-0">
                      <AvatarImage src={m.sender?.avatar || undefined} />
                      <AvatarFallback>{(m.sender?.name || '?').slice(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className={`max-w-[75%] ${m.isStaff ? 'bg-blue-50' : 'bg-slate-50'} rounded-lg p-3`}>
                      <div className="text-xs text-slate-500 mb-1">{m.sender?.name} {m.isStaff && <Badge variant="outline" className="ml-1 text-xs">Staff</Badge>}</div>
                      <p className="text-sm">{m.message}</p>
                      <div className="text-xs text-slate-400 mt-1">{timeAgo(m.createdAt)}</div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-3 border-t flex gap-2">
                <Textarea
                  placeholder="Type your reply..."
                  value={reply}
                  onChange={(e) => setReply(e.target.value)}
                  className="text-sm"
                  rows={2}
                  onKeyDown={(e) => { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) sendReply() }}
                />
                <Button className="amz-bg-yellow hover:bg-[#f7ca00] text-black self-end" onClick={sendReply}><Send className="w-4 h-4" /></Button>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-slate-400">
              <div className="text-center">
                <MessageSquare className="w-12 h-12 mx-auto mb-2" />
                <p>Select a ticket to view conversation</p>
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* Quick stats */}
      <Card className="p-4">
        <SectionHeader title="Performance" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
          <div><div className="text-2xl font-bold">94%</div><div className="text-xs text-slate-500">CSAT Score</div></div>
          <div><div className="text-2xl font-bold">2h 14m</div><div className="text-xs text-slate-500">Avg Response Time</div></div>
          <div><div className="text-2xl font-bold">6h 32m</div><div className="text-xs text-slate-500">Avg Resolution Time</div></div>
          <div><div className="text-2xl font-bold">{resolved}</div><div className="text-xs text-slate-500">Resolved This Week</div></div>
        </div>
      </Card>
    </div>
  )
}
