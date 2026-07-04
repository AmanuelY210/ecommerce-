// Utility helpers
import { createHash } from 'crypto'

export const ETB = (n: number) => `${Math.round(n).toLocaleString('en-US')} ETB`

export const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

export const hashPassword = (s: string) => createHash('sha256').update(s).digest('hex').slice(0, 32)

export const verifyPassword = (plain: string, hashed: string) => hashPassword(plain) === hashed

export const genOrderNo = (prefix = 'ETM') => {
  const d = new Date()
  return `${prefix}-${d.getFullYear()}${(d.getMonth()+1).toString().padStart(2,'0')}${Math.floor(1000 + Math.random() * 9000)}`
}

export const genOtp = () => String(Math.floor(100000 + Math.random() * 900000))

export const genRef = (prefix = 'REF') => `${prefix}-${Math.random().toString(36).substring(2, 12).toUpperCase()}`

export const timeAgo = (d: Date | string) => {
  const date = typeof d === 'string' ? new Date(d) : d
  const diff = Date.now() - date.getTime()
  const days = Math.floor(diff / 86400000)
  const hours = Math.floor(diff / 3600000)
  const mins = Math.floor(diff / 60000)
  if (days > 0) return `${days}d ago`
  if (hours > 0) return `${hours}h ago`
  if (mins > 0) return `${mins}m ago`
  return 'just now'
}

export const statusColor = (s: string) => {
  const m: Record<string, string> = {
    PENDING: 'bg-amber-100 text-amber-800 border-amber-200',
    CONFIRMED: 'bg-blue-100 text-blue-800 border-blue-200',
    PACKED: 'bg-purple-100 text-purple-800 border-purple-200',
    SHIPPED: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    DELIVERED: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    CANCELLED: 'bg-red-100 text-red-800 border-red-200',
    RETURNED: 'bg-orange-100 text-orange-800 border-orange-200',
    PAID: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    FAILED: 'bg-red-100 text-red-800 border-red-200',
    REFUNDED: 'bg-slate-100 text-slate-800 border-slate-200',
    APPROVED: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    REJECTED: 'bg-red-100 text-red-800 border-red-200',
    SUSPENDED: 'bg-red-100 text-red-800 border-red-200',
    OPEN: 'bg-blue-100 text-blue-800 border-blue-200',
    IN_PROGRESS: 'bg-amber-100 text-amber-800 border-amber-200',
    RESOLVED: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    CLOSED: 'bg-slate-100 text-slate-800 border-slate-200',
    ACTIVE: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    LOW: 'bg-slate-100 text-slate-800 border-slate-200',
    NORMAL: 'bg-blue-100 text-blue-800 border-blue-200',
    HIGH: 'bg-amber-100 text-amber-800 border-amber-200',
    URGENT: 'bg-red-100 text-red-800 border-red-200',
    SUCCESS: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    ASSIGNED: 'bg-blue-100 text-blue-800 border-blue-200',
    IN_TRANSIT: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    FLAGGED: 'bg-red-100 text-red-800 border-red-200',
  }
  return m[s] || 'bg-slate-100 text-slate-800 border-slate-200'
}

export const TR = (status: string) => status // placeholder for i18n status key, used in components

// Ethiopian bank list for payment UI
export const ETHIOPIAN_BANKS = [
  { code: 'cbe', name: 'Commercial Bank of Ethiopia', short: 'CBE', color: '#FFB81C', account: '1000-2034-567890', logo: '🏦' },
  { code: 'dashen', name: 'Dashen Bank', short: 'Dashen', color: '#1B3A6B', account: '5021-4567-8901', logo: '🏛️' },
  { code: 'abyssinia', name: 'Bank of Abyssinia', short: 'Abyssinia', color: '#0066B3', account: '2004-5678-9012', logo: '🏛️' },
  { code: 'awash', name: 'Awash Bank', short: 'Awash', color: '#E2231A', account: '0130-1234-5678', logo: '🏛️' },
  { code: 'cooperative', name: 'Cooperative Bank of Oromia', short: 'Coop', color: '#00A859', account: '1002-3456-7890', logo: '🏛️' },
  { code: 'wegagen', name: 'Wegagen Bank', short: 'Wegagen', color: '#F37021', account: '3008-4567-8901', logo: '🏛️' },
  { code: 'hibret', name: 'Hibret Bank', short: 'Hibret', color: '#7B2D8E', account: '5001-2345-6789', logo: '🏛️' },
  { code: 'zemen', name: 'Zemen Bank', short: 'Zemen', color: '#003D7A', account: '1000-2233-4455', logo: '🏛️' },
  { code: 'bunna', name: 'Bunna Bank', short: 'Bunna', color: '#8B4513', account: '5001-6789-0123', logo: '☕' },
  { code: 'nib', name: 'Nib International Bank', short: 'Nib', color: '#1F4E79', account: '7000-1234-5678', logo: '🏛️' },
  { code: 'abay', name: 'Abay Bank', short: 'Abay', color: '#0066B3', account: '3001-2345-6789', logo: '🏛️' },
  { code: 'addis', name: 'Addis International Bank', short: 'Addis', color: '#0D6E4F', account: '8000-3456-7890', logo: '🏛️' },
  { code: 'enat', name: 'Enat Bank', short: 'Enat', color: '#C2185B', account: '2001-3456-7890', logo: '🏛️' },
  { code: 'berhan', name: 'Berhan Bank', short: 'Berhan', color: '#FFB81C', account: '3001-4567-8901', logo: '🏛️' },
  { code: 'oromia', name: 'Oromia Bank', short: 'Oromia', color: '#00A859', account: '4001-5678-9012', logo: '🏛️' },
  { code: 'tsehay', name: 'Tsehay Bank', short: 'Tsehay', color: '#FFC107', account: '5001-6789-0123', logo: '☀️' },
  { code: 'siinqee', name: 'Siinqee Bank', short: 'Siinqee', color: '#7B2D8E', account: '6001-7890-1234', logo: '🏛️' },
  { code: 'amhara', name: 'Amhara Bank', short: 'Amhara', color: '#D32F2F', account: '7001-8901-2345', logo: '🏛️' },
  { code: 'goh', name: 'Goh Betoch Bank', short: 'Goh', color: '#0288D1', account: '8001-9012-3456', logo: '🏠' },
]

export const CHAPA_METHODS = [
  { code: 'mobile', name: 'Mobile Money', desc: 'Telebirr, CBE Birr, Awash Wallet', icon: 'Smartphone' },
  { code: 'card', name: 'Card Payment', desc: 'Visa, Mastercard, UnionPay', icon: 'CreditCard' },
  { code: 'transfer', name: 'Bank Transfer via Chapa', desc: 'Direct transfer with Chapa verification', icon: 'Building2' },
]
