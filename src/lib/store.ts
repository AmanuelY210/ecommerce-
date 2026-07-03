// Client-side state stores using Zustand
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Lang } from './i18n'

// ─────────── Auth Store ───────────
export type Role = 'CUSTOMER' | 'VENDOR' | 'ADMIN' | 'MODERATOR' | 'SUPPORT'

export interface AuthUser {
  id: string
  email: string
  name: string
  phone?: string
  role: Role
  avatar?: string
  vendorId?: string
}

interface AuthState {
  user: AuthUser | null
  otpPending: { email: string; name: string; phone?: string; role: Role; password: string } | null
  pendingEmail: string | null  // for login flow
  setUser: (u: AuthUser | null) => void
  setOtpPending: (p: AuthState['otpPending']) => void
  setPendingEmail: (e: string | null) => void
  logout: () => void
}

export const useAuth = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      otpPending: null,
      pendingEmail: null,
      setUser: (u) => set({ user: u }),
      setOtpPending: (p) => set({ otpPending: p }),
      setPendingEmail: (e) => set({ pendingEmail: e }),
      logout: () => set({ user: null, otpPending: null, pendingEmail: null }),
    }),
    { name: 'etm-auth' }
  )
)

// ─────────── Cart Store (client-side, synced to backend) ───────────
export interface CartLine {
  productId: string
  name: string
  price: number
  image?: string
  vendorId?: string
  vendorName?: string
  qty: number
  slug: string
}

interface CartState {
  lines: CartLine[]
  couponCode: string | null
  couponDiscount: number
  add: (line: CartLine) => void
  updateQty: (productId: string, qty: number) => void
  remove: (productId: string) => void
  clear: () => void
  applyCoupon: (code: string, discount: number) => void
  removeCoupon: () => void
}

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      lines: [],
      couponCode: null,
      couponDiscount: 0,
      add: (line) => {
        const existing = get().lines.find(l => l.productId === line.productId)
        if (existing) {
          set({ lines: get().lines.map(l => l.productId === line.productId ? { ...l, qty: l.qty + line.qty } : l) })
        } else {
          set({ lines: [...get().lines, line] })
        }
      },
      updateQty: (productId, qty) => set({ lines: get().lines.map(l => l.productId === productId ? { ...l, qty: Math.max(1, qty) } : l) }),
      remove: (productId) => set({ lines: get().lines.filter(l => l.productId !== productId) }),
      clear: () => set({ lines: [], couponCode: null, couponDiscount: 0 }),
      applyCoupon: (code, discount) => set({ couponCode: code, couponDiscount: discount }),
      removeCoupon: () => set({ couponCode: null, couponDiscount: 0 }),
    }),
    { name: 'etm-cart' }
  )
)

// ─────────── Language Store ───────────
interface LangState {
  lang: Lang
  setLang: (l: Lang) => void
}

export const useLang = create<LangState>()(
  persist(
    (set) => ({
      lang: 'en',
      setLang: (l) => set({ lang: l }),
    }),
    { name: 'etm-lang' }
  )
)

// ─────────── UI Store (mobile menu, search dialog) ───────────
interface UIState {
  mobileMenuOpen: boolean
  searchOpen: boolean
  setMobileMenu: (b: boolean) => void
  setSearch: (b: boolean) => void
}

export const useUI = create<UIState>((set) => ({
  mobileMenuOpen: false,
  searchOpen: false,
  setMobileMenu: (b) => set({ mobileMenuOpen: b }),
  setSearch: (b) => set({ searchOpen: b }),
}))
