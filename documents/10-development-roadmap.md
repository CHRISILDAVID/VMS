# Badminton Manager — Development Roadmap

## Architecture

| App | Platform | Technology |
|-----|----------|-----------|
| **Owner App** | Mobile (Android/iOS) | React Native + Expo |
| **Admin Panel** | Web (Desktop) | React + Vite + Tailwind |
| **Backend** | Cloud | Supabase (shared) |

## Milestone Overview

> [!NOTE]
> **M7 (Admin Panel) can start in parallel with M3** since it only depends on core tables from M0-M1.

---

## Milestone 0 — Monorepo + Expo Setup

**Complexity:** ⬛⬛⬜⬜⬜ (Low)

### Objectives
- Set up pnpm monorepo with all apps and packages
- Initialize Expo project for Owner App
- Configure Supabase and create initial schema
- Build core UI component library
- Archive Figma export code

### Deliverables

**Monorepo:**
- [x] pnpm workspace (`apps/owner/`, `apps/admin/`, `packages/shared/`)
- [x] Root `package.json`, `pnpm-workspace.yaml`, `tsconfig.base.json`
- [x] Updated `.gitignore`, `AGENTS.md`
- [x] Archive Figma code to `reference/figma-src/` and `reference/prompts/`
- [x] Remove empty `Owner app/` dir, `CLAUDE.md`, stale lockfiles

**Owner App (`apps/owner/`):**
- [x] Expo project with Expo Router
- [x] NativeWind (Tailwind for React Native)
- [x] Path aliases (`@/`, `@vms/shared`)
- [x] Install: React Query, Zustand, React Hook Form, Zod, date-fns
- [x] Design tokens (colors, fonts, spacing from Figma reference)
- [x] Core UI: Button, Card, Input, Badge, StatusChip, Skeleton, EmptyState, ErrorState
- [x] Layout: custom TabBar, PageHeader, SafeArea wrapper
- [x] Overlays: @gorhom/bottom-sheet, Dialog, FABMenu
- [x] Auth guard in root layout
- [x] Verify on physical device (Expo Go)

**Shared Package (`packages/shared/`):**
- [x] TypeScript package with barrel exports
- [x] Supabase client init (env-aware: SecureStore vs localStorage)
- [x] Placeholder types, utils, constants
- [x] Utility functions: `formatCurrency()`, `formatDate()`, `formatPhone()`

**Supabase:**
- [x] Install Supabase CLI
- [x] Link to existing project
- [x] Migration 001: enums, owners, venues, courts
- [x] Basic RLS policies
- [x] Generate TypeScript types

**Admin Stub (`apps/admin/`):**
- [x] Minimal Vite + React + Tailwind skeleton

### Completion Checklist
- [x] `pnpm dev:owner` → Expo starts, viewable on device
- [x] `pnpm build:admin` → Vite produces build
- [x] Owner app imports from `@vms/shared` work
- [x] Supabase connection verified
- [x] All core UI components render

---

## Milestone 1 — Authentication + Schedule

**Complexity:** ⬛⬛⬛⬜⬜ (Medium)

### Deliverables
- [x] Login screen: phone input + OTP (Supabase Auth)
- [x] Token storage: expo-secure-store
- [x] Session persistence + auto-refresh + logout
- [x] Owner profile creation on first login (Onboarding screen)
- [x] Venues + courts DB schema + seed data (CRUD deferred to M7)
- [x] Venue selector (Zustand global state, persistent)
- [x] Schedule screen: horizontal timeline grid (Figma-aligned absolute positioned layout)
- [x] Court rows × time columns
- [x] Color-coded block rendering based on slot type (Figma slotConfig mapping)
- [x] Speed Dial FAB (New Booking) and Slot tap → Bottom sheet
- [x] Week-view date selector (Figma strip)
- [x] Operating schedules + pricing blocks (migration 002 & seed data only, CRUD deferred to M5)
- [x] RLS policies for all M1 tables

### Completion Checklist
- [x] New user can register and land on Schedule
- [x] Returning user auto-authenticated
- [x] Venue selector shows all owner venues, switching refreshes data
- [x] Schedule displays courts × time grid correctly
- [x] Tapping slot opens bottom sheet

---

## Milestone 2 — Bookings

**Complexity:** ⬛⬛⬛⬜⬜ (Medium)

### Deliverables
- [x] Customers table + search + create (migration 003)
- [x] Bookings table with constraints (start :00/:30, whole-hour duration)
- [x] Bookings list: tabs (Upcoming/Ongoing/Completed/Cancelled)
- [x] Search by name, phone, booking ID
- [x] Filter by court, date
- [x] BookingCard component
- [x] Booking detail screen
- [x] Payment status update: dropdown (Pending→Partial→Paid→Refunded→Cancelled) + note
- [x] 5-step booking wizard with price auto-calc + override + flat discount
- [x] Status transitions (upcoming → ongoing → completed)
- [x] Cancel with confirmation
- [x] Move booking (change time/court)
- [x] Hard-block overlapping bookings + owner force-book override
- [x] Schedule → New Booking + FAB → New Booking
- [x] Booking source: Offline/Walk-in (immutable)
- [x] WhatsApp deep link for confirmation
- [x] RLS policies

### Completion Checklist
- [x] Can create booking from schedule or FAB
- [x] Booking appears on schedule grid
- [x] Can search, filter, complete, cancel, edit bookings
- [x] Price calculated correctly, owner can override
- [x] Payment status changeable post-creation
- [x] Double-booking prevented

---

## Milestone 3 — Membership Management

**Complexity:** ⬛⬛⬛⬛⬜ (High)

### Deliverables
- [x] Membership slots CRUD (migration 004)
- [x] Members add/edit/remove
- [x] Members screen: 4 tabs (Slots, Applications, Guest Play, Members)
- [x] Summary KPI cards
- [x] Slots tab: cards with capacity bar, open/close toggle
- [x] Create/edit slot forms with initial members
- [x] Slot members view with active/inactive toggle
- [x] Member transfer between slots
- [x] Membership applications: accept/reject/invite-to-guest-play
- [x] Guest play: upcoming/completed, accept-as-member
- [x] Capacity enforcement
- [x] Membership slots pre-block on schedule
- [x] Release slot for specific date (membership_slot_releases table)
- [x] RLS policies

### Completion Checklist
- [x] Can create slot with all fields + initial members
- [x] Can manage members (add/edit/transfer/remove/toggle)
- [x] Membership blocks appear on schedule
- [x] Can release slot for specific date
- [x] Capacity limits enforced

---

## Milestone 4 — Membership Payments

**Complexity:** ⬛⬛⬛⬜⬜ (Medium)

### Deliverables
- [x] Membership payments table (migration 005)
- [x] Auto-generate monthly payments (Edge Function cron)
- [x] Payments screen: KPI dashboard
- [x] Slot payment cards with collection progress
- [x] Slot payments detail: member list with filter chips
- [x] Mark as Paid bottom sheet (mode + date)
- [x] Payment history per member
- [x] WhatsApp deep link reminder
- [x] Inactive member payment suppression
- [x] RLS policies

### Completion Checklist
- [x] Monthly payments auto-generated for active members
- [x] Can mark payments as paid with mode
- [x] Dashboard KPIs update correctly
- [x] WhatsApp reminder works (Deep link)

---

## Milestone 5 — Analytics & Settings (Owner)

**Complexity:** ⬛⬛⬜⬜⬜ (Low)

### Deliverables
- [x] Profile Tab UI: Basic owner details
- [x] Operating Schedules & Pricing Blocks CRUD (Deferred from M1)
- [x] Court Information: View-only map launch (React Native Linking API using lat/lon)
- [x] Court Schedule & Pricing: weekly calendar, pricing blocks CRUD, copy day, close/24h
- [x] Grow Your Business: 4 placeholder CTA pages
- [x] Subscription & Billing: static mock from design
- [x] Help & Support: FAQ accordion, contact, legal
- [x] Account recovery: optional email backup
- [x] Logout with confirmation

### Completion Checklist
- [x] All profile menu items navigable
- [x] Court info viewable
- [x] Pricing blocks CRUD works
- [x] Schedule copy-to-days works

---

## Milestone 6 — Basic Metrics

**Complexity:** ⬛⬛⬜⬜⬜ (Low)

### Deliverables
- [x] Basic KPI Widget (Profile tab) & Reports Screen: showing Revenue, Occupancy, Outstanding, Active Members with trend charts.
- [x] DB views/functions for the KPI widget aggregation and charting.
- [x] Loading skeletons on major screens
- [x] Empty states on all lists
- [x] Form validation messages (Zod + React Hook Form)

### Completion Checklist
- [x] KPI widget renders current month's data correctly on Profile
- [x] Loading/empty states implemented for major data views

---

## Milestone 7 — Admin Panel

**Complexity:** ⬛⬛⬜⬜⬜ (Low-Medium)

> [!NOTE]
> Can start **in parallel with M3** (after M2 complete). Depends only on core tables from M0-M1.

### Deliverables
- [ ] Admin auth: email/password (Supabase)
- [ ] Admin RLS policies (super_admin role)
- [ ] Venues: create, edit, deactivate (and make `owner_id` nullable in DB)
- [ ] Courts: create, edit per venue
- [ ] Owners: view accounts, assign to venues
- [ ] Owner App Onboarding: Change text input to a dropdown for selecting pre-created unassigned venues
- [ ] Court Information configuration: edit details, court type metadata, map coordinates
- [ ] Photo upload (Admin Panel → Supabase Storage)
- [ ] Simple dashboard: aggregate stats (total venues, owners, bookings)
- [ ] Desktop-first layout: sidebar + content area
- [ ] Deploy to Vercel

### Completion Checklist
- [ ] Admin can log in with email/password
- [ ] Can create and configure venues + courts
- [ ] Can view and manage owner accounts
- [ ] Deployed to Vercel

---

## Milestone 8 — Debug Everything Phase & Polish

**Complexity:** ⬛⬛⬛⬜⬜ (Medium)

### Deliverables
- [ ] CSV report export (expo-sharing) via a simple button in the Profile tab.
- [ ] Payment PDF receipt (expo-print) for individual bookings/payments.
- [ ] Error boundaries with retry
- [ ] Toast notifications for all actions
- [ ] Offline: read-only MMKV cache for schedule + members
- [ ] Offline banner: "You're offline — showing cached data"
- [ ] Push notifications: FCM setup for all triggers (bookings, payments, memberships)
- [ ] Performance audit
- [ ] E2E Bug bash and edge-case resolution

### Completion Checklist
- [ ] Offline mode works (read-only cache + banner)
- [ ] Push notifications delivered correctly
- [ ] CSV export works
- [ ] PDF receipt generates and can be shared
- [ ] App is stable and crash-free

---

## Milestone 9 — Launch Preparation

**Complexity:** ⬛⬛⬜⬜⬜ (Low)

### Deliverables
- [ ] Production Supabase: all migrations applied
- [ ] Production env variables configured
- [ ] Sentry error tracking (both apps)
- [ ] EAS Build config (Android APK/AAB, iOS IPA)
- [ ] Internal distribution testing (EAS)
- [ ] Admin panel: custom domain + SSL on Vercel
- [ ] Data seed script for demo/onboarding
- [ ] Final security audit (RLS, API keys)
- [ ] Performance testing with realistic data volume
- [ ] Supabase backup configuration
- [ ] Delete `reference/` directory (no longer needed)

### Completion Checklist
- [ ] Owner app installable on Android device
- [ ] Admin panel live at custom domain
- [ ] Error tracking receiving events
- [ ] Security audit passed
- [ ] Backups configured

---

## Timeline Summary

| Milestone | Duration | Complexity | Dependencies |
|-----------|----------|------------|-------------|
| M0: Setup | 1 week | Low | — |
| M1: Auth + Schedule | 2 weeks | Medium | M0 |
| M2: Bookings | 2 weeks | Medium | M1 |
| M3: Memberships | 2.5 weeks | High | M2 |
| M4: Payments | 1.5 weeks | Medium | M3 |
| M5: Profile | 1.5 weeks | Medium | M1 |
| M6: Reports | 1 week | Low | M1-M5 |
| M7: Admin Panel | 1.5 weeks | Low-Medium | M1 (parallel with M3+) |
| M8: Debug Everything | 1.5 weeks | Medium | M1-M7 |
| M9: Launch | 1 week | Low | All |

> [!IMPORTANT]
> These estimates assume a **single developer** working full-time. M5 (Profile) can also start alongside M3 since it only depends on M1 data.

> [!WARNING]
> **Do not skip M0.** The monorepo setup, shared package, and Supabase schema are the foundation. Shortcuts here create integration debt that compounds in every later milestone.