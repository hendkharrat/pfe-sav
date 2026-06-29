# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
pnpm dev        # start dev server (http://localhost:3000)
pnpm build      # production build (TypeScript errors are suppressed in next.config.mjs)
pnpm start      # serve the production build
pnpm tsc --noEmit  # type-check (no test runner configured)
```

Prisma commands — **always use `pnpm exec prisma`, never `pnpm dlx prisma`**:
```bash
pnpm exec prisma generate                    # regenerate Prisma client after schema change
pnpm exec prisma db push                     # push schema to DB without a migration file
pnpm exec prisma db push --force-reset       # DESTRUCTIVE — drop and recreate all tables, then push
pnpm exec prisma db seed                     # run prisma/seed.ts
pnpm exec prisma studio                      # open Prisma Studio GUI
pnpm exec prisma migrate dev --name <name>   # create and apply a named migration
```

### Verification checklist
After any schema, type, or dependency change, all three must pass:
```bash
pnpm exec prisma generate
pnpm tsc --noEmit
pnpm build
```

### Demo DB reset
```bash
pnpm exec prisma db push --force-reset   # drops all data — destructive
pnpm exec prisma db seed
```

## Architecture

**Next.js 16 App Router** full-stack SAV (After-Sales Service) management app for a Tunisian air-conditioning/pressure-system company. Database: MySQL (`sav_manager`), ORM: Prisma 5.22.0.

Three layers:
- **Presentation** — `app/` pages and `components/` (React, Tailwind, shadcn/ui)
- **API** — `app/api/` Next.js route handlers, active and used by the frontend pages
- **Data access** — `lib/prisma.ts` PrismaClient singleton → MySQL

`data/mock-*.ts` files remain in the repo as fallback/demo reference values used by some helpers and form defaults. They are **not** the runtime source of truth — all real data is persisted in MySQL and fetched through the API routes.

### Path alias
`@/*` resolves to the project root (configured in `tsconfig.json` and used everywhere).

### Key directories

| Directory | Purpose |
|---|---|
| `app/` | Next.js pages (`page.tsx` per route) and active API routes (`app/api/`) |
| `components/ui/` | shadcn/ui primitives (Radix UI wrappers — do not edit) |
| `components/shared/` | Reusable app-level components (dialogs, badges, detail panels, tables, planning calendar) |
| `components/forms/` | Form components built with react-hook-form + Zod |
| `components/layout/` | `AppLayout`, `AppSidebar`, `AppHeader`, `MobileNavDialog`, `navItems` |
| `data/` | Fallback/demo reference data only — not used as runtime source of truth |
| `lib/` | Business logic, auth helpers, table utilities, display constants, Prisma client |
| `prisma/` | `schema.prisma`, migrations, `seed.ts` |
| `types/index.ts` | All shared TypeScript types |

### State management pattern
Pages fetch data from API routes on mount and hold it in React state. CRUD writes go through API routes and persist to MySQL. Some forms and shared components use mock arrays only as fallback default values. There is no global store.

### Authentication

`lib/auth.ts` is exclusively a localStorage session helper — it reads, writes, and clears the `AuthSession` object under key `sav_session`. It does not authenticate credentials.

`hooks/useAuth.ts` reads the stored session and exposes `{ user, session, isAuthenticated, role, logout }`. It synthesizes the current user from session fields; it does not import mock data.

Actual credential verification is in `POST /api/auth/login`: queries `User` or `Client` via Prisma and validates `passwordHash` with bcrypt. On success, returns an `AuthSession`-shaped JSON the frontend stores in localStorage. No JWT or HttpOnly cookie auth yet.

`components/layout/AppLayout` redirects to `/login` if unauthenticated. `components/shared/AdminOnly.tsx` gates admin-only UI sections.

**Important:** If a stale session causes unexpected auth state after a DB reset or migration, clear `sav_session` from `localStorage` in the browser DevTools.

**Demo credentials** (seeded into MySQL — login accepts email or 8-digit phone number):
- Admin: `admin@sav.com` / `admin123`
- Technician: `tech@sav.com` / `tech123`
- Client (individual): `ahmed.bensalah@mail.tn` / `ahmed123`
- Client (company): `contact@edi-solutions.tn` / `edi123`
- Client (company): `maintenance@ibnsina.tn` / `ibnsina123`

### Role-based navigation
`components/layout/navItems.tsx` `getNavItems(role)` returns different nav items for `admin`, `technician`, and `client`. Admins see all routes; technicians see their own interventions and planning; clients see only their own pannes, interventions, factures, and historique.

### Data model — important nuances

- `Equipment` — global catalog record (brand/model/serial). Not client-specific.
- `ClientEquipement` — join record linking `Equipment` to a specific `Client` installation (`localisation`, `dateInstallation`). Always use `clientEquipementId` on interventions and pannes; legacy `equipementId`-only fields are deprecated.
- `ContractEquipement` — explicit Prisma join table between `Contract` and `ClientEquipement` (replaces the `clientEquipementIds` array field from the mock layer).
- `Client.nombreEquipements` is **not** stored in the DB — derive with `_count.clientEquipements` in Prisma queries.
- `Facture.tva` stores the TVA **amount in TND**, not the rate.
- `User.role` Prisma enum: `ADMIN | TECHNICIAN`. Clients are in the separate `Client` table and never appear in `User`.
- All technical IDs are `Int @id @default(autoincrement())`. Business reference strings (`CTR-001`, `INT-2026-001`, `PAN-2026-001`, `FAC-2026-001`, `EQ-001`) are separate `String @unique` fields.
- Dynamic API route params are parsed as positive integers; body/query IDs are coerced safely to numbers.

### Business logic (`lib/interventions.ts`)
All domain helpers: contract coverage checks, preventive intervention generation from contract parameters, technician availability, reference number generation, CE resolution helpers, and French date formatting (`formatDateFr`, `formatMonthYearFr`, etc.). Some helpers accept optional mock arrays as fallback defaults — at runtime the caller should pass the data fetched from the API. Extend this file rather than duplicating logic in page components. IDs passed to helpers are numeric.

### API routes (`app/api/`)
Active routes used by frontend pages. Full CRUD for: `users`, `clients`, `equipements`, `client-equipements`, `contracts`, `interventions` (+ `assign`, `status`, `close` sub-routes), `pannes` (+ `convert`), `factures` (+ `pay`), `dashboard`, `historique`. Each route maps Prisma records to frontend TypeScript types before returning JSON.

### Sorting, filtering, pagination (`lib/table.ts`)
`sortData`, `paginateData`, `toggleSort`, and `getPaginationInfo` are used by every list page. Use `SortableHeader` and `TablePagination` shared components to keep list pages consistent. Comparisons use `fr` locale.

### UI stack
- **Tailwind CSS v4** with `tw-animate-css`
- **shadcn/ui** in `components/ui/` — add new ones via `pnpm dlx shadcn@latest add <component>`
- **Recharts** for charts on the dashboard
- **Sonner** for toasts — use `useToast()` from `hooks/useToast.tsx` (`showSuccess`, `showError`, `showInfo`)
- **lucide-react** for icons

### Utility helpers (`lib/utils.ts`)
- `cn(...)` — Tailwind class merge (clsx + tailwind-merge)
- `getClientDisplayName(client)` — company name for `SOCIETE`, full name for `PERSONNE_PHYSIQUE`
- `formatDate(dateStr)` — ISO string → `dd/mm/yyyy` in `fr-FR`

### Localization
All UI text is in **French**. Domain constants (status labels, type labels, city list) are centralized in `lib/constants.ts`. Dates in data and forms use ISO `YYYY-MM-DD` strings; always append `T12:00:00` when constructing `Date` objects from these strings to avoid timezone-shift bugs.
