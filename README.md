# Nanzy Clothes — Marketplace Platform

Professional multi-sided fashion marketplace (buyer · seller · admin) built with **Next.js App Router**, **TypeScript**, and a **local demo database** (Then **Supabase** for production).

[![TypeScript]](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-16-black)](https://nextjs.org/)

## Frontend job skills showcase

| Skill | Where |
|-------|--------|
| Free REST API fetch | `/explore` → Fake Store API (no key) |
| AbortController + timeout | `src/lib/api/http.ts` |
| loading / error / retry | `useAsyncResource` + DataTable |
| URL state tables | `/explore`, `/admin/sellers` |
| Design system | `src/components/ui/*` |
| TypeScript domain models | `src/types/*` |
| Unit tests | `__tests__/table-state.test.ts` |
| Auth/cart/checkout UX | storefront routes |
| Multi-role admin/seller | `/admin`, `/seller` |

## Features

| Area | Capability |
|------|------------|
| **Storefront** | Products, cart, checkout, reviews |
| **Seller** | Register, **subscription plans**, products, reply to feedback |
| **Admin** | KPIs, sellers data-table, orders, reviews, activity log |
| **Design system** | Button, Input, Select, Modal, Tabs, Toast, DataTable |
| **Data table** | Search, filters, sort, pagination, **URL state**, loading / empty / error / retry, detail drawer, row actions, keyboard access |
| **Database** | `data/demo-db.json` (local) or Supabase Postgres |
| **Tests** | Core table + subscription behaviour (`vitest`) |

## Quick start (local demo — no cloud keys)

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

- Bottom-left **persona switcher**: visitor · buyer · seller · admin  
- Database file: [`data/demo-db.json`](./data/demo-db.json)  

```bash
npm run test        # unit tests (install vitest if needed: npm i -D vitest)
npm run typecheck
npm run build
```

## Seller subscription

| Plan | Price (demo) | Notes |
|------|----------------|-------|
| Basic | ₦5,000/mo | 20 products, trial friendly |
| Pro | ₦15,000/mo | Unlimited, priority (default highlight) |
| Enterprise | ₦40,000/mo | API + SLA |

Flow:

1. `/seller/register` — create store (trial)  
2. `/seller/subscribe` — choose plan → **Activate (demo free)**  
3. Admin **Approves** store on `/admin/sellers`  
4. Rules live in `src/types/subscription.ts` + `src/lib/subscription/plans.ts` (tested)

Production can swap activation to Paystack subscription without changing the UI contract.

## Admin sellers table (standard patterns)

- **Search** (`q`) · **filters** (subscription, approved) · **sort** · **pagination**  
- State synced to **URL query string** (shareable)  
- **Loading / empty / error + retry**  
- **Row click** → detail **Modal** (drawer-style)  
- **Row actions** Approve / View  
- Keyboard: sort headers, row Enter/Space, modal Escape  

## Project structure

```
src/
  app/           # routes (admin, seller, storefront)
  components/
    ui/          # design system primitives
    data-table/  # DataTable
    dashboard/   # StatCard, nav
  hooks/         # useTableState
  lib/
    db/          # local-store + Supabase adapters
    subscription/
  types/         # TypeScript domain models
data/
  demo-db.json   # owned demo database
__tests__/       # vitest
supabase/        # SQL for production Postgres
```

## Production (Supabase)

1. Run `supabase/schema.sql` → `seed.sql` → `marketplace-schema.sql`  
2. Set env from `.env.example`  
3. Promote admin:

```sql
UPDATE public.profiles SET role = 'admin' WHERE email = 'you@example.com';
```

See `DEPLOY.md` for Vercel.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm run test` | Unit tests |
| `npm run typecheck` | TypeScript check |

## License

This can be used use for demos, portfolios, and commercial adaptation.
