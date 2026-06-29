# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
pnpm dev        # start dev server (http://localhost:3000)
pnpm build      # production build (TypeScript errors are suppressed in next.config.mjs)
pnpm start      # serve the production build
```

No test runner or lint script is configured. Type-check manually with:
```bash
pnpm tsc --noEmit
```

## Architecture

This is a **Next.js 16 App Router** frontend-only SAV (After-Sales Service) management app for a Tunisian air-conditioning/pressure-system company. There is no backend — all data lives in module-level arrays in `data/mock-*.ts` and is mutated exclusively via `useState` in page components.

### Path alias
`@/*` resolves to the project root (configured in `tsconfig.json` and used everywhere).

### Key directories

| Directory | Purpose |
|---|---|
| `app/` | Next.js pages (one `page.tsx` per route) |
| `components/ui/` | shadcn/ui primitives (Radix UI wrappers — do not edit) |
| `components/shared/` | Reusable app-level components (dialogs, badges, detail panels, tables) |
| `components/forms/` | Form components built with react-hook-form + Zod |
| `components/layout/` | `AppLayout`, `AppSidebar`, `AppHeader`, `MobileNavDialog`, `navItems` |
| `components/theme/` | `ThemeProvider` (next-themes) and `ThemeToggle` |
| `data/` | Mock data arrays (source of truth for the demo) |
| `lib/` | Business logic (`interventions.ts`), auth helpers (`auth.ts`), table utilities (`table.ts`), display constants (`constants.ts`) |
| `types/index.ts` | All shared TypeScript types |

### State management pattern
Pages own all state via `useState`. They initialize from the mock data arrays, then pass setter callbacks to child `components/shared/` and `components/forms/` components. There is no global store. This means **mutations are lost on page refresh** — this is intentional for the demo.

### Authentication
- `lib/auth.ts` authenticates against `data/mock-users.ts` (admin/technician) and `data/mock-clients.ts` (client).
- Sessions are persisted to `localStorage` under key `sav_session` as an `AuthSession` object.
- `hooks/useAuth.ts` reads the session on mount and exposes `{ user, session, isAuthenticated, role, logout }`.
- `components/layout/AppLayout` wraps every authenticated page; it redirects to `/login` if unauthenticated.
- `components/shared/AdminOnly.tsx` gates admin-only UI sections.

**Demo credentials:**
- Admin: `admin@sav.com` / `admin123`
- Technician: `tech@sav.com` / `tech123`
- Client: email/phone from `data/mock-clients.ts` (password field on each client record)

### Role-based navigation
`components/layout/navItems.tsx` `getNavItems(role)` returns different nav items for `admin`, `technician`, and `client`. All three roles see `/dashboard` and `/profil`; admins see everything; clients see only their own space (pannes, interventions, factures, historique).

### Data model — important nuance
`Equipment` is a **catalog record** (model/brand/serial number). `ClientEquipement` is a **join table** linking an `Equipment` to a specific client installation (with `localisation`, `dateInstallation`, etc.). Contracts and interventions reference `clientEquipementId` (preferred) rather than raw `equipementId`. Legacy fields exist on some types but are deprecated — always use the CE-based approach.

### Business logic (`lib/interventions.ts`)
Contains all domain helpers: contract coverage checks, preventive intervention generation from contract parameters, technician availability, reference number generation, and French date formatting. When adding any of these capabilities, extend this file rather than duplicating logic in page components.

### Sorting, filtering, pagination (`lib/table.ts`)
`sortData`, `paginateData`, `toggleSort`, and `getPaginationInfo` are the standard utilities used by every list page. Use `SortableHeader` and `TablePagination` shared components to maintain consistency.

### UI stack
- **Tailwind CSS v4** with `tw-animate-css`
- **shadcn/ui** components in `components/ui/` — add new ones via `pnpm dlx shadcn@latest add <component>`
- **Recharts** for charts on the dashboard
- **Sonner** for toast notifications (via `useToast` hook in `hooks/useToast.tsx`)
- **lucide-react** for icons

### Localization
All UI text is in **French**. All domain constants (status labels, type labels, city list) are centralized in `lib/constants.ts`. Date formatting uses `fr-FR` locale. Dates in data and forms use ISO `YYYY-MM-DD` strings; always append `T12:00:00` when constructing `Date` objects from these strings to avoid timezone-shift bugs.
