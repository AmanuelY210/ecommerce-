'use client'
import { Card } from '@/components/ui/card'
import { TrendingUp, TrendingDown, type LucideIcon } from 'lucide-react'
import { ReactNode } from 'react'

export function StatCard({ label, value, delta, icon: Icon, color = 'bg-blue-500', sub }: {
  label: string; value: string | number; delta?: number; icon: LucideIcon; color?: string; sub?: string
}) {
  return (
    <Card className="p-4">
      <div className="flex items-start justify-between">
        <div className="min-w-0">
          <p className="text-xs text-slate-500 uppercase tracking-wide font-medium">{label}</p>
          <p className="text-2xl font-bold mt-1 truncate">{value}</p>
          {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
          {delta !== undefined && (
            <div className={`text-xs mt-1 flex items-center gap-1 ${delta >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
              {delta >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              {Math.abs(delta)}% vs last period
            </div>
          )}
        </div>
        <div className={`w-10 h-10 ${color} rounded-lg flex items-center justify-center text-white shrink-0`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </Card>
  )
}

export function EmptyState({ icon: Icon, title, description, action }: {
  icon: LucideIcon; title: string; description: string; action?: ReactNode
}) {
  return (
    <Card className="p-12 text-center">
      <Icon className="w-16 h-16 mx-auto text-slate-300 mb-3" />
      <h3 className="font-semibold mb-1">{title}</h3>
      <p className="text-sm text-slate-500 mb-4">{description}</p>
      {action}
    </Card>
  )
}

export function SectionHeader({ title, description, action }: {
  title: string; description?: string; action?: ReactNode
}) {
  return (
    <div className="flex items-start justify-between mb-4 gap-2 flex-wrap">
      <div>
        <h2 className="text-lg font-bold">{title}</h2>
        {description && <p className="text-sm text-slate-500">{description}</p>}
      </div>
      {action}
    </div>
  )
}

// Simple SVG line chart
export function LineChart({ data, height = 200, color = '#ff9900' }: {
  data: { date: string; value: number }[]; height?: number; color?: string
}) {
  const max = Math.max(...data.map(d => d.value), 1)
  const w = 600
  const h = height
  const padding = { top: 10, right: 10, bottom: 30, left: 50 }
  const innerW = w - padding.left - padding.right
  const innerH = h - padding.top - padding.bottom
  const xStep = innerW / Math.max(data.length - 1, 1)
  const yScale = (v: number) => padding.top + innerH - (v / max) * innerH

  const points = data.map((d, i) => `${padding.left + i * xStep},${yScale(d.value)}`).join(' ')
  const areaPath = `M ${padding.left},${padding.top + innerH} L ${data.map((d, i) => `${padding.left + i * xStep},${yScale(d.value)}`).join(' L ')} L ${padding.left + (data.length - 1) * xStep},${padding.top + innerH} Z`

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full" style={{ height }}>
      <defs>
        <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      {[0, 0.25, 0.5, 0.75, 1].map(p => (
        <g key={p}>
          <line x1={padding.left} y1={padding.top + innerH * p} x2={padding.left + innerW} y2={padding.top + innerH * p} stroke="#e2e8f0" strokeWidth="1" />
          <text x={padding.left - 5} y={padding.top + innerH * p + 4} textAnchor="end" className="fill-slate-400 text-[10px]">
            {Math.round(max * (1 - p))}
          </text>
        </g>
      ))}
      <path d={areaPath} fill="url(#chartGrad)" />
      <polyline fill="none" stroke={color} strokeWidth="2" points={points} />
      {data.map((d, i) => (
        <g key={i}>
          <circle cx={padding.left + i * xStep} cy={yScale(d.value)} r="3" fill={color} />
          {i % Math.ceil(data.length / 6) === 0 && (
            <text x={padding.left + i * xStep} y={padding.top + innerH + 18} textAnchor="middle" className="fill-slate-400 text-[10px]">
              {d.date.slice(5)}
            </text>
          )}
        </g>
      ))}
    </svg>
  )
}

// Bar chart
export function BarChart({ data, height = 200, color = '#ff9900' }: {
  data: { name: string; value: number }[]; height?: number; color?: string
}) {
  const max = Math.max(...data.map(d => d.value), 1)
  return (
    <div className="space-y-2" style={{ minHeight: height }}>
      {data.map((d, i) => (
        <div key={i} className="flex items-center gap-2">
          <div className="text-xs text-slate-600 w-28 truncate text-right">{d.name}</div>
          <div className="flex-1 bg-slate-100 rounded h-6 relative overflow-hidden">
            <div className="h-full rounded transition-all" style={{ width: `${(d.value / max) * 100}%`, backgroundColor: color }} />
            <span className="absolute inset-0 flex items-center px-2 text-xs text-white font-medium">{d.value.toLocaleString()}</span>
          </div>
        </div>
      ))}
    </div>
  )
}
