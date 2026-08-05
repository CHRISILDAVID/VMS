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
- [x] Admin auth: email/password (Supabase)
- [x] Admin RLS policies (super_admin role)
- [x] Venues: create, edit, deactivate (and make `owner_id` nullable in DB)
- [x] Courts: create, edit per venue
- [x] Owners: view accounts, assign to venues
- [x] Owner App Onboarding: Deprecated
- [x] Court Information configuration: edit details, court type metadata, map coordinates in admin panel.
- [x] Photo upload (Admin Panel → Supabase Storage)
- [x] Simple dashboard: aggregate stats (total venues, owners, bookings)
- [x] Desktop-first layout: sidebar + content area
- [ ] Deploy to Vercel

### Completion Checklist
- [x] Admin can log in with email/password
- [x] Can create and configure venues + courts
- [x] Can view and manage owner accounts
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

## Phase 2: ShuttleHub (Player App)

> [!NOTE]
> **Brand:** ShuttleHub | **Platform:** React Native + Expo (Mobile) | **Market:** India (₹, +91)
> **Design:** Navy (#0B1F3A) + Lime (#A7FF3F) sporty theme from Figma reference
> **Path:** `apps/player/` in existing monorepo | **Backend:** Shared Supabase instance

---

## Milestone 10 — Player App Foundation + Auth

**Complexity:** ⬛⬛⬛⬜⬜ (Medium) | **Dependencies:** M0-M7 (all completed)

### Objectives
- Set up Player App (Expo) in monorepo
- Design system (navy + lime theme)
- Phone + OTP authentication with optional social login later
- Player profile creation (`players` table — separate from `owners`)
- Location permission + GPS auto-detection
- Auto-link with existing `customers` records by phone number

### Deliverables

**Database:**
- [ ] Migration: `players` table + RLS policies
- [ ] Migration: `player_wallets` table (0 balance on registration)
- [ ] Migration: `notifications` table + RLS policies
- [ ] Migration: `venues` alterations (`min_slot_duration`, `cancellation_hours`, `platform_fee`, `average_rating`, `total_reviews`)
- [ ] New enums: `id_proof_type`, `verification_status`, `notification_type`, `challenge_status`, `hosted_match_status`, `match_format`, `order_status`, `product_listing_source`, `wallet_transaction_type`
- [ ] Auto-link function: match `players.phone` → `customers.phone` → set `customers.user_id`

**Player App (`apps/player/`):**
- [ ] Expo project with Expo Router (file-based navigation)
- [ ] NativeWind 4.x (Tailwind for React Native)
- [ ] Path aliases (`@/`, `@vms/shared`)
- [ ] Design tokens: Navy (#0B1F3A), Lime (#A7FF3F), White, Dark Grey
- [ ] Core UI: Button, Card, Input, Badge, StatusChip, Skeleton, EmptyState, ErrorState
- [ ] Layout: custom TabBar (Home, Play, Search, Tournament, Profile), PageHeader, SafeArea
- [ ] Overlays: @gorhom/bottom-sheet, Dialog
- [ ] Auth screens: Login (Phone + OTP), Figma split-layout
- [ ] Auth guard in root layout
- [ ] Location permission prompt (expo-location) + GPS auto-detection → auto-fill city/state
- [ ] Player profile creation form (Full Name, DOB, Gender, City, Skill Level, Photo)
- [ ] Photo upload (expo-image-picker → Supabase Storage `player-photos` bucket)
- [ ] Bottom navigation skeleton (5 tabs)

**Shared Package:**
- [ ] Player auth service, player profile service, notification service
- [ ] Updated types (regenerate from DB)

**Owner App Changes:**
- [ ] Settings: "Minimum Slot Duration" config (Profile → Court Schedule)
- [ ] Settings: "Cancellation Policy (hours)" config

### Completion Checklist
- [ ] `pnpm dev:player` → Expo starts, viewable on device
- [ ] Player registration + OTP + profile creation works
- [ ] Location auto-detected, `customers` auto-linked
- [ ] Owner App: min slot duration and cancellation hours configurable

---

## Milestone 11 — Home Dashboard + Court Discovery

**Complexity:** ⬛⬛⬛⬜⬜ (Medium) | **Dependencies:** M10

### Deliverables

**Player App:**
- [ ] Home Dashboard: hero carousel, Quick Actions (Book Court, Join Game, Tournaments placeholder, See Your Rank placeholder)
- [ ] Nearby Courts: horizontal scroll cards (geo-based from `venues`)
- [ ] Fast Selling Items: horizontal scroll product cards
- [ ] Top bar: App logo, Notification bell (badge count), Wallet dropdown (display-only balance)
- [ ] Court Listing (Play → Book Court): feed by city/location, search, filters (Indoor/Outdoor)
- [ ] Court cards: image, court type, badges, name, area, distance, rating, A/C tag, court count, starting price/hr
- [ ] Court Details: image carousel, info, amenities, operating hours, reviews, "Become a Member" + "Book Court" CTAs

**Shared Package:**
- [ ] Venue discovery service (geo-filtered queries)
- [ ] Products service (for Fast Selling Items)

### Completion Checklist
- [ ] Home dashboard renders all sections
- [ ] Nearby courts load based on player location
- [ ] Court details page shows all info + reviews
- [ ] Wallet dropdown shows balance

---

## Milestone 12 — Court Booking

**Complexity:** ⬛⬛⬛⬛⬜ (High) | **Dependencies:** M11

### Deliverables

**Database:**
- [ ] RLS: players can INSERT bookings with `source = 'online'`, `booked_by = auth.uid()`
- [ ] Auto-create `customers` record for venue's owner on first player booking
- [ ] DB function: `get_available_slots(venue_id, court_id, date)` (respects `min_slot_duration`)

**Player App:**
- [ ] Slot Selection: court type filter, court count selector, 14-day date picker, time-of-day filter, multi-select slot grid, sticky summary bar
- [ ] Booking Summary: court card, booking details, price breakdown (court fee + platform fee), "Confirm — Pay at Court" CTA
- [ ] Booking Confirmation: success animation, booking ID, post-booking actions (Host Game, Challenge Friend)
- [ ] Booking History (Profile → Play Activity): Upcoming/Completed/Cancelled tabs, cancel action
- [ ] Cancellation: check `venue.cancellation_hours` vs booking start time

**Owner App Impact:**
- [ ] Player bookings appear in schedule real-time (source = "Online")
- [ ] Owner can manage player bookings same as offline bookings

### Completion Checklist
- [ ] Full booking flow works (browse → select → confirm → pay at court)
- [ ] Booking syncs to Owner App immediately
- [ ] Cancellation respects venue policy
- [ ] Platform fee applied correctly

---

## Milestone 13 — Social: Find Players + Challenge + Host/Join

**Complexity:** ⬛⬛⬛⬛⬜ (High) | **Dependencies:** M12

### Deliverables

**Database:**
- [ ] Migration: `challenges`, `hosted_matches`, `match_participants` tables + RLS
- [ ] Challenge auto-expiry (24h) via DB cron or Edge Function

**Player App:**
- [ ] Find Players: search, skill-level chips, player cards (photo, verified badge, Player ID, stats)
- [ ] Public Player Profile (bottom sheet): avatar, stats, achievements, recent matches, Challenge + Invite buttons
- [ ] Challenge system: booking gate → challenge modal (format, message) → notification to challenged player → accept/decline. Player A pays full booking. Supports doubles (multi-challenge)
- [ ] Host Match: booking gate → HOST tab (your booked court card, Host a Match modal: format, skill level, visibility) → Publish
- [ ] Join Match: JOIN tab (available match cards: host, venue, time, format, slots) → Join

**Shared Package:**
- [ ] Challenge, hosted-matches, player-discovery services

### Completion Checklist
- [ ] Can search/filter players, view public profiles
- [ ] Challenge flow works end-to-end with notifications
- [ ] Can host and join matches

---

## Milestone 14 — Membership Discovery + Notifications Center

**Complexity:** ⬛⬛⬛⬜⬜ (Medium) | **Dependencies:** M13

### Deliverables

**Database:**
- [ ] `membership_applications` alteration (add `player_id` FK)
- [ ] `fcm_token` column on `players` table

**Player App:**
- [ ] Court Details → "Become a Member" → Membership Batches screen (published slots, benefits, Apply button)
- [ ] Application confirmation dialog (Application ID, Done/View My Applications)
- [ ] Notification Center (bell icon): cards for booking confirmation, challenge requests (accept/decline), guest play invitations, membership payment reminders
- [ ] Push notifications via FCM (expo-notifications setup, token registration)
- [ ] WhatsApp deep links for payment reminders

**Owner App Impact:**
- [ ] Player applications appear in Members → Applications tab
- [ ] Owner "Send Reminder" creates notification for player

### Completion Checklist
- [ ] Membership browse + apply works
- [ ] Bell icon shows unread count, all notification types display correctly
- [ ] Push notifications delivered via FCM
- [ ] Challenge accept/decline works from notification

---

## Milestone 15 — Shop / E-Commerce

**Complexity:** ⬛⬛⬛⬛⬜ (High) | **Dependencies:** M14

### Deliverables

**Database:**
- [ ] `product_categories`, `products`, `product_variants`, `product_reviews`, `cart_items`, `orders`, `order_items` tables + RLS
- [ ] Supabase Storage: `product-images` bucket

**Player App:**
- [ ] Shop screen: category tabs, search, product grid
- [ ] Product Details: images, price, variants, reviews, "Add to Cart", pickup badge for owner products
- [ ] Cart: items, quantities, totals, "Proceed to Checkout"
- [ ] Checkout: order summary, payment method (Wallet / Pay at Pickup), "Place Order"
- [ ] Order History (Profile → Shop Orders): status tracking

**Admin Panel:**
- [ ] Products management: CRUD products + categories + variants
- [ ] Order management: view all orders (read-only for MVP)

### Completion Checklist
- [ ] Admin can manage product catalog
- [ ] Player can browse, add to cart, checkout
- [ ] Wallet payment works if sufficient balance
- [ ] Owner products show "Pickup from venue" badge

---

## Milestone 16 — Wallet + Coach Directory + Reviews

**Complexity:** ⬛⬛⬛⬜⬜ (Medium) | **Dependencies:** M15

### Deliverables

**Database:**
- [ ] `coaches`, `venue_reviews`, `wallet_transactions` tables + RLS
- [ ] `update_venue_rating()` trigger on review insert

**Player App:**
- [ ] Wallet: balance display, transaction history, usable for bookings/shop
- [ ] Coach Directory (Play → Train): view-only cards with contact info
- [ ] Venue Reviews: post-booking rating prompt, review form, reviews on Court Details

**Admin Panel:**
- [ ] Coach management: CRUD coaches
- [ ] Player accounts listing + wallet management (add credits)
- [ ] Platform analytics: player metrics, booking sources, revenue

### Completion Checklist
- [ ] Wallet balance works as payment method
- [ ] Coach directory displays correctly
- [ ] Venue reviews work end-to-end

---

## Milestone 17 — Player ID + Search + Polish

**Complexity:** ⬛⬛⬛⬜⬜ (Medium) | **Dependencies:** M16

### Deliverables

**Database:**
- [ ] `player_ids` table + RLS
- [ ] `player-id-proofs` storage bucket
- [ ] `generate_player_id()` function → 'SH-XXXXX'

**Player App:**
- [ ] Player ID registration: personal details → ID type → upload proof → enter last 4 digits → submit
- [ ] Search screen: universal search (Courts, Players, Coaches)
- [ ] Tournament tab: "Coming Soon" placeholder
- [ ] Rankings: "Coming Soon" placeholder with Player ID gate
- [ ] Profile: settings-style list (Player Identity, Play Activity, Performance Report placeholder, Shop Orders, Settings, Logout)
- [ ] "Become a Tournament Organizer" → Google Form CTA

**Admin Panel:**
- [ ] Player ID verification review: pending list, view document, verify/reject

**Polish:**
- [ ] Error boundaries, toast notifications, loading skeletons, empty states
- [ ] Deep linking from notifications → relevant screens
- [ ] Performance audit, offline banner

### Completion Checklist
- [ ] Player ID verification works end-to-end
- [ ] Search works across entities
- [ ] All screens polished with proper states
- [ ] Deep linking from notifications works

---

## Timeline Summary

### Phase 1: Owner App + Admin Panel (Completed)

| Milestone | Complexity | Dependencies | Status |
|-----------|------------|-------------|--------|
| M0: Monorepo + Expo Setup | Low | — | ✅ Done |
| M1: Auth + Schedule | Medium | M0 | ✅ Done |
| M2: Bookings | Medium | M1 | ✅ Done |
| M3: Memberships | High | M2 | ✅ Done |
| M4: Payments | Medium | M3 | ✅ Done |
| M5: Analytics & Settings | Medium | M1 | ✅ Done |
| M6: Basic Metrics | Low | M1-M5 | ✅ Done |
| M7: Admin Panel | Low-Medium | M1 | ✅ Done |
| M8: Debug Everything | Medium | M1-M7 | Pending |
| M9: Launch Preparation | Low | All | Pending |

### Phase 2: ShuttleHub (Player App)

| Milestone | Complexity | Dependencies |
|-----------|------------|-------------|
| M10: Player App Foundation + Auth | Medium | M0-M7 |
| M11: Home Dashboard + Court Discovery | Medium | M10 |
| M12: Court Booking | High | M11 |
| M13: Social (Challenge + Host/Join) | High | M12 |
| M14: Membership + Notifications | Medium | M13 |
| M15: Shop / E-Commerce | High | M14 |
| M16: Wallet + Coach + Reviews | Medium | M15 |
| M17: Player ID + Search + Polish | Medium | M16 |

### Deferred (Phase 3+)

| Feature | Status | Notes |
|---------|--------|-------|
| Tournaments | Deferred | May become separate app |
| Rankings + Leaderboard | Deferred | Blocked by tournaments |
| Online Payment Integration | Deferred | MVP uses "Pay at Court" |

> [!IMPORTANT]
> M8 and M9 from Phase 1 can be executed in parallel with Phase 2 milestones as needed.

> [!WARNING]
> **Do not skip M10.** The Player App setup, design system, and auth foundation are critical. Shortcuts compound in later milestones.
