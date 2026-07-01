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
| `components/forms/` | Form components built with `useState` and manual validation (no react-hook-form/Zod) |
| `components/layout/` | `AppLayout`, `AppSidebar`, `AppHeader`, `MobileNavDialog`, `navItems` |
| `data/` | Fallback/demo reference data only — not used as runtime source of truth |
| `lib/` | Business logic, auth helpers, table utilities, display constants, Prisma client |
| `prisma/` | `schema.prisma`, migrations, `seed.ts` |
| `types/index.ts` | All shared TypeScript types |

### State management pattern
Pages fetch data from API routes on mount and hold it in React state. CRUD writes go through API routes and persist to MySQL. Some forms and shared components use mock arrays only as fallback default values. There is no global store.

### Edit dialog hydration
Edit dialogs (`ClientForm`, `UserForm`, `EquipmentForm`, `ContractForm`, `ClientEquipementAssignForm`, `AssignTechnicianDialog`, `ChangeStatusDialog`, `InterventionForm`) stay mounted across opens — the parent page never unmounts them and never passes a `key` prop tied to the entity id. Because of this, a form's local `formData` must **not** rely solely on `useState(initialFromProps)`, since that initializer only runs on the very first mount and won't pick up a different selected entity on a later "Modifier" click. Every edit-capable form/dialog rehydrates `formData` via `useEffect(() => { if (open) { setFormData(...); setErrors({}); } }, [open, entity, ...])`, re-deriving the same field shape the initial `useState` used. When `entity` is `undefined`/`null`, the effect resets to the same blank/default values as create mode (so create mode is preserved). `UserForm` always resets `password` to `''` in this effect regardless of edit/create mode. `InterventionForm` was the original reference implementation of this pattern.

### Authentication

`lib/auth.ts` is exclusively a localStorage session helper — it reads, writes, and clears the `AuthSession` object under key `sav_session`. It does not authenticate credentials.

`hooks/useAuth.ts` reads the stored session and exposes `{ user, session, isAuthenticated, role, logout }`. It synthesizes the current user from session fields; it does not import mock data.

Actual credential verification is in `POST /api/auth/login`: queries `User` or `Client` via Prisma and validates `passwordHash` with bcrypt. On success, returns an `AuthSession`-shaped JSON the frontend stores in localStorage. No JWT or HttpOnly cookie auth yet.

`components/layout/AppLayout` redirects to `/login` if unauthenticated. `components/shared/AdminOnly.tsx` gates admin-only UI sections.

**Important:** If a stale session causes unexpected auth state after a DB reset or migration, clear `sav_session` from `localStorage` in the browser DevTools.

**Demo credentials** (seeded into MySQL — login accepts email or 8-digit phone number):
- Admin: `admin@sav.com` / `admin123` (phone `71100200`)
- Technician 1: `tech@sav.com` / `tech123` (phone `98200300`)
- Technician 2: `tech2@sav.com` / `tech123` (phone `98200301`)
- Technician 3: `tech3@sav.com` / `tech123` (phone `98200302`)
- Client — EDI Solutions Démo (société, main demo client): `contact@edi-demo.tn` / `demo123` (phone `71345678`)
- Client — Clinique El Amel (société): `contact@clinique-demo.tn` / `demo123` (phone `71345679`)
- Client — Sara Mejri (personne physique): `sara.mejri@demo.tn` / `demo123` (phone `55667788`)

The login page's demo-accounts card (`app/login/page.tsx`) intentionally shows only 4 quick accounts, in this order: admin, technician (`tech@sav.com`), EDI Solutions Démo (client société), Sara Mejri (client particulier).

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
- `ClientEquipement.dateInstallation` must be equal to or later than `dateAchat`. Validated both client-side in `components/forms/ClientEquipementAssignForm.tsx` (live on change + on submit) and server-side in `app/api/client-equipements/route.ts` (POST) and `app/api/client-equipements/[id]/route.ts` (PATCH, comparing the effective merged date pair against the existing record).
- `PieceJointe.url` is `String @db.LongText` because image attachments are stored as base64 data URLs for demo preview (a `VARCHAR(191)` truncated/rejected them). Non-image panne attachments may use `url: ''` and should not be filtered out if they have a filename — this is a demo/simulated upload approach, not production file storage.
- Contract references are auto-generated server-side in `POST /api/contracts` (max-scan of the `CTR-` prefix → `CTR-XXX`, consistent with the seeded `CTR-001..003` style). The `ContractForm.tsx` reference field is read-only/disabled in both create and edit mode — do not make it a required, user-typed input again.
- Preventive intervention technician assignment flows as `preventiveInterventions` from `ContractForm.tsx` (per-row `technicienId` in the preview table) → `app/contrats/page.tsx` `handleAddContract` → `POST /api/contracts`. The route matches client-sent rows to server-generated rows by `clientEquipementId` + calendar date, validates that selected technicians exist and have role `TECHNICIAN`, and rejects the whole request (before creating anything) if a technician would be double-booked on the same date — either against existing DB interventions or within the same generated batch.
- `GET /api/interventions` default order is `orderBy: { id: 'desc' }` so the most recently created intervention appears first; manual column sorting on the interventions page remains independent of this default via `lib/table.ts`.

### Business logic (`lib/interventions.ts`)
All domain helpers: contract coverage checks, preventive intervention generation from contract parameters, technician availability, reference number generation, CE resolution helpers, and French date formatting (`formatDateFr`, `formatMonthYearFr`, etc.). Some helpers accept optional mock arrays as fallback defaults — at runtime the caller should pass the data fetched from the API. Extend this file rather than duplicating logic in page components. IDs passed to helpers are numeric.

### API routes (`app/api/`)
Active routes used by frontend pages. Full CRUD for: `users`, `clients`, `equipements`, `client-equipements`, `contracts`, `interventions` (+ `assign`, `status`, `close` sub-routes), `pannes` (+ `convert`), `factures` (+ `pay`), `dashboard`, `historique`. Each route maps Prisma records to frontend TypeScript types before returning JSON.

`PATCH /api/interventions/[id]/close` accepts an optional `dateRealisation` (ISO `YYYY-MM-DD` string). Both `CloseInterventionDialog.tsx` (client-side, via `min`/`validate()` using `getTodayDateInputValue()`) and the route itself enforce `dateRealisation >= today`; the route parses date-only strings with the project's `T12:00:00` convention and falls back to `intervention.dateRealisation ?? new Date()` when the field is absent. Cancelling an intervention (`statut: 'ANNULEE'`) goes through the separate `PATCH /api/interventions/[id]/status` route and is not subject to this date check.

### Sorting, filtering, pagination (`lib/table.ts`)
`sortData`, `paginateData`, `toggleSort`, and `getPaginationInfo` are used by every list page. Use `SortableHeader` and `TablePagination` shared components to keep list pages consistent. Comparisons use `fr` locale.

### UI stack
- **Tailwind CSS v4** with `tw-animate-css`
- **shadcn/ui** in `components/ui/` — add new ones via `pnpm dlx shadcn@latest add <component>`
- Dashboards display KPIs via `components/dashboard/StatCard` cards, not charts. **Recharts** is a dependency (used only by the unused `components/ui/chart.tsx` scaffold) — no dashboard page renders an actual chart with it.
- **Sonner** for toasts — use `useToast()` from `hooks/useToast.tsx` (`showSuccess`, `showError`, `showInfo`)
- **lucide-react** for icons
- Business-form dialogs must avoid horizontal overflow — prefer responsive width (`max-w-[95vw]` alongside a `sm:max-w-*` cap), `overflow-x-hidden` on `DialogContent`, and wrapping table cells (`table-fixed w-full`, `whitespace-normal break-words` on the widest column) over fixed pixel widths. `GenerateInvoiceDialog` is the reference implementation. Fix these in the business component's own classes rather than editing `components/ui/dialog.tsx` or `components/ui/table.tsx`.

### Utility helpers (`lib/utils.ts`)
- `cn(...)` — Tailwind class merge (clsx + tailwind-merge)
- `getClientDisplayName(client)` — company name for `SOCIETE`, full name for `PERSONNE_PHYSIQUE`
- `formatDate(dateStr)` — ISO string → `dd/mm/yyyy` in `fr-FR`

### Localization
All UI text is in **French**. Domain constants (status labels, type labels, city list) are centralized in `lib/constants.ts`. Dates in data and forms use ISO `YYYY-MM-DD` strings; always append `T12:00:00` when constructing `Date` objects from these strings to avoid timezone-shift bugs.

### Demo seed (`prisma/seed.ts`)
The seed is a **minimal, company-focused demo** for the PFE soutenance, built around one main client, **EDI Solutions Démo** (`clientId: 1`):
- **CTR-001** (ACTIF), **CTR-002** (BIENTOT_EXPIRE), **CTR-003** (EXPIRE) exist specifically to exercise the contract status filters.
- EDI Solutions Démo's `ClientEquipement` installations: CE-1/EQ-001 and CE-2/EQ-002 are covered by CTR-001; **CE-3/EQ-003 is deliberately left hors contrat** to drive the panne → curative → facture demo path.
- **INT-2026-003** (curative, REALISEE, hors contrat, no facture) stays facture-eligible — it's the intervention `GenerateInvoiceDialog` should pick up live during the demo.
- **FAC-2026-001** is pre-seeded (linked to INT-2026-004) and visible in the factures list; the next generated facture will be `FAC-2026-002`.
- **PAN-2026-001** (EN_ATTENTE) is the live-demo panne — walk through prise en charge → conversion during the soutenance.
- Technician `tech@sav.com` (Mohamed Trabelsi, `userId: 2`) is unavailable on `2026-07-02` because of INT-2026-001 — used to demo the technician-availability conflict check in the convert-panne dialog.
- Re-seeding is idempotent: `pnpm exec prisma db push --force-reset && pnpm exec prisma db seed`. If Prisma commands hang on Windows, stop the dev server first (it can hold a lock on the generated client), then retry.
