# 🇪🇹 ETMarket — Ethiopia's Multi-Vendor Marketplace

Amazon-style multi-vendor marketplace built for Ethiopia with Chapa payment integration, 19 Ethiopian bank transfers, and delivery to all 14 regions.

## ✨ Features

- **25 Categories** — Vehicles, Electronics, Fashion, Home & Furniture, Appliances, Grocery, Real Estate, Services, and more
- **1,100+ Products** from verified Ethiopian vendors
- **Chapa + 19 Ethiopian Banks** — Mobile money, card, bank transfer, and Cash on Delivery
- **4 Vendor Subscription Packages** — Starter (500 ETB/mo), Professional (1,500 ETB/mo), Business (3,000 ETB/mo), Enterprise (custom)
- **Vendor Onboarding** — Package selection → Chapa payment → business info → document upload → admin review → dashboard unlocked
- **4-Language i18n** — English, Amharic (አማርኛ), Afaan Oromo, Tigrinya (ትግርኛ)
- **Real Ethiopia Geography** — 14 regions, cascading city/sub-city selectors, 5 shipping zones
- **Category-Aware Brands** — Only relevant brands shown per category
- **Full CMS** — Banners, pages, blog posts, FAQs (CRUD)
- **5 Dashboards** — Customer storefront, Vendor, Super Admin, Moderator, Customer Support
- **Super Admin Settings** — Site name, logo, favicon, header, footer, appearance, SEO, social media (auto-save)
- **Document Review** — Admin can view vendor uploaded documents (ID, license, TIN, store photo)
- **Public Vendor Directory** — Browse all paid vendors, verified shown first

## 🛠️ Tech Stack

- **Framework**: Next.js 16 (App Router, Turbopack)
- **Language**: TypeScript 5
- **Database**: Prisma ORM + SQLite
- **Styling**: Tailwind CSS 4 + shadcn/ui
- **State**: Zustand (client) + TanStack Query (server)
- **Auth**: Cookie-based session with role-based access control

## 🚀 Quick Start

```bash
# Install dependencies
bun install

# Set up database
bun run db:push
bun run scripts/seed.ts

# Start dev server
bun run dev
```

## 🔑 Demo Accounts

| Role | Email | Password |
|------|-------|----------|
| Super Admin | admin@etmarket.et | demo1234 |
| Vendor | vendor@etmarket.et | demo1234 |
| Customer | customer@etmarket.et | demo1234 |
| Moderator | moderator@etmarket.et | demo1234 |
| Support | support@etmarket.et | demo1234 |

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── (storefront)/       # Customer-facing pages
│   ├── vendor/             # Vendor dashboard + onboarding
│   ├── admin/              # Super Admin panel
│   ├── moderator/          # Moderation queue
│   ├── support/            # Customer support tickets
│   └── api/                # API routes (25+ endpoints)
├── components/             # React components
│   ├── layout/             # Header, Footer, DashboardShell
│   ├── storefront/         # Product cards, filters
│   ├── dashboard/          # Stat cards, charts, widgets
│   └── shared/             # FileUpload, FilterPanel
├── lib/                    # Helpers, i18n, store, session
└── hooks/                  # Custom React hooks
```

## 📄 License

MIT License — Built for Ethiopia 🇪🇹
