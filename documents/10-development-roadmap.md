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

---

---

# Phase 2 — ShuttleHub Player App

> **Status:** In Progress — M10 Completed, moving to M11.
> **Reference:** `documents/Player_app_Implementation_plan.md` is the primary spec for all Phase 2 agents.
> **App path:** `apps/player/` — do NOT put code in `apps/owner/`.

---

## Milestone 10 — Player App Foundation & Auth

**Complexity:** ⬛⬛⬜⬜⬜ (Medium)

### Deliverables
- [x] Expo app scaffold under `apps/player/` with correct package name
- [x] Supabase client configured for player app (separate from owner)
- [x] Phone OTP authentication flow (same Supabase project, different table)
- [x] Player profile creation screen (name, city)
- [x] 5-tab bottom navigation skeleton: Home · Play · Tournaments · Rankings · Shop
- [x] Top bar with profile avatar (top-right), location, wallet, alerts bell
- [x] `PLAYER_COLORS` design tokens (Navy `#0B1F3A`, Lime `#A7FF3F`)
- [x] NativeWind theme setup with dark/light/system support
- [x] Safe area handling (notch, home indicator)
- [x] Placeholder UI for all 5 tab screens and the standalone Profile screen to unblock M11+ agents

### Completion Checklist
- [x] Player can log in with OTP
- [x] Player profile is created and stored in `players` table
- [x] 5 tabs visible and navigable

---

## Milestone 11 — Home Dashboard & Court Booking

**Complexity:** ⬛⬛⬛⬜⬜ (Medium)

### DB Migrations Required
- Migration 014: `players`, `player_wallets`, `player_transactions`, `system_config`
- Migration 015: `coaches`, `player_booking_payments`

### Deliverables
- [x] **Home Tab:**
  - Header: logo, city dropdown, wallet icon (read-only balance popover), profile avatar
  - Search bar: "Search courts, players..." (contextual per tab)
  - Alerts bell with notification panel (challenge requests, guest play invites, membership renewals)
  - Hero carousel (live tournaments + featured products)
  - Quick Actions: Book Court | Join Game | Tournaments | See Your Rank
  - Nearby Courts (horizontal scroll cards with distance, availability badge, rating, price)
  - Fast Selling Items (horizontal scroll product cards)
- [x] **Play Tab → Book Court sub-tab:**
  - Court listing (filter: indoor/outdoor, A/C, price range, city)
  - Court detail (photos, amenities, map pin, ratings, dynamic UI enhancements)
  - Slot selection (30-min grid, multi-select, date picker, time-of-day tabs, auto-scroll to current time)
  - Booking summary (wallet / Razorpay)
  - Booking confirmation + Manual WhatsApp Share
  - Booking creates record in existing `bookings` table with `source='online'`
- [x] **Play Tab → Train sub-tab:**
  - Coach cards (admin-created: name, photo, specialty, price/session)
  - Coach detail screen
- [x] **Admin Panel — Wallet Management:**
  - Search player by name/phone
  - View balance + transaction history
  - Credit wallet (insert into `player_wallets` + `player_transactions`)
- [x] **Admin Panel — Coach Management:**
  - Create, edit, deactivate coaches
  - Assign to venue/academy
- [x] Customer-Player soft link on registration (match by phone → `players.linked_customer_id`)
- [x] **Admin Panel — Enhanced Map Features (Newly Added):**
  - Interactive Map Pin Dropper with reverse geocoding via OpenStreetMap (Leaflet).
  - Auto-fills address, city, state, and pincode in Venue form.
- [x] **Player App — DEV Mocking (Newly Added):**
  - Simulated Razorpay payment flow in Expo Go development mode to allow testing end-to-end booking.

### Completion Checklist
- [x] Player can browse courts and book a slot
- [x] Booking appears in owner's Schedule as 'online' source
- [x] WhatsApp notification via manual share button (Skipped automated API to owner due to no 3rd party messaging service like Twilio/WATI setup yet)
- [x] Wallet balance readable in header popover
- [x] Admin can credit wallet and manage coaches

---

## Milestone 12 — Social Features (Find Players, Host/Join Match, Challenges)

**Complexity:** ⬛⬛⬛⬜⬜ (Medium)

### DB Migrations Required
- Migration 016: `hosted_matches`, `hosted_match_players`, `challenges`, `challenge_invitations`

### Deliverables
- [ ] **Find Players sub-tab:**
  - Player discovery list (search by name or Player ID, filters: skill, gender, distance)
  - Public Player Profile screen (stats, rank, play activity)
  - Challenge modal: host selects upcoming booking + invites multiple players
  - Challenge expires automatically at booking end time (DB trigger)
  - Push + in-app notification on challenge received/accepted
- [ ] **Host/Join Match sub-tab:**
  - Discover active hosted matches near user (city-filtered)
  - Join match flow (confirm join, push notification)
  - My Hosted Matches list + Hosted Match Detail (joined players, actions)
  - Host a Match screen (requires confirmed booking → redirect to Book Court if none)
  - Match format, skill level, max players, visibility (public)
- [ ] **Booking cancellation triggers:**
  - If host's booking cancelled → auto-cancel challenge + notify all invited players
  - If host's booking cancelled → auto-cancel hosted match + notify all joined players

### Completion Checklist
- [ ] Player can challenge multiple players using an upcoming booking
- [ ] Challenge expires at booking end time
- [ ] Host a Match requires a confirmed booking
- [ ] All joined players notified when hosted match booking is cancelled

---

## Milestone 13 — Player Identity, Rankings & Profile

**Complexity:** ⬛⬛⬛⬜⬜ (Medium)

### DB Migrations Required
- Migration 017: `ranked_players`, `ranking_points_log` tables

### Deliverables
- [ ] **Rankings Tab:**
  - [No Player ID] state: prompt with "Register Your Player ID" CTA
  - Player ID registration flow (doc type selection, third-party verification stub)
  - On success: `players.player_id = 'SH*****'` (SH + 5 random alphanumeric), create `ranked_players` row
  - My Rank Card (rank, skill level, total points, tournaments played)
  - Leaderboard tabs: Beginner | Intermediate | Open
  - Tap any row → Public Player Profile
- [ ] **Full Profile Screen:**
  - Profile header (photo, name, Player ID, verified badge, rank pill, stats row)
  - Settings-style list (Player Identity | Tournament History | Play Activity | Performance Report | Shop Orders)
  - Featured Organizer Card (state-dependent: Become | Manage | Organize Again)
  - Settings (theme toggle: Light / Dark / System)
  - Logout
- [ ] **Admin Panel — Player ID Management:**
  - View all Player IDs with details
  - Delete a Player ID
- [ ] **Admin Panel — Rankings Override:**
  - Search ranked player, manually adjust points/rank with admin note

### Completion Checklist
- [ ] Player can register a Player ID
- [ ] `ranked_players` row created on Player ID registration
- [ ] Leaderboard renders correctly per skill level
- [ ] Profile screen navigates to all detail sub-screens

---

## Milestone 14 — Shop

**Complexity:** ⬛⬛⬛⬜⬜ (Medium)

### DB Migrations Required
- Migration 018: `products`, `product_categories`, `cart_items`, `shop_orders`, `shop_order_items`

### Deliverables
- [ ] **Admin Panel — Product Management:**
  - Create / edit / deactivate products (name, description, images, price, stock, category)
  - Product category management
- [ ] **Shop Tab (player app):**
  - Product listing with category filter pills and search
  - Product detail (photos carousel, description, rating, price)
  - Cart (add/remove items, quantity)
  - Checkout: Razorpay or Wallet
  - Order confirmation
- [ ] **Profile → Shop Orders:**
  - Order history cards (product, date, amount, status: Processing / Delivered / Cancelled)
  - Invoice button per order

### Completion Checklist
- [ ] Admin can create products visible in the shop
- [ ] Player can add to cart and checkout
- [ ] Wallet deduction works for shop purchases
- [ ] Order appears in Profile → Shop Orders

---

## Milestone 15 — Tournament Listings (Public Discovery + Registration)

**Complexity:** ⬛⬛⬛⬜⬜ (Medium)

### DB Migrations Required
- Migration 019: `public_tournaments`, `public_tournament_categories`, `public_tournament_registrations`

### Deliverables
- [ ] **Admin Panel — Tournament Listings:**
  - Create tournament listing (name, description, organizer, venue, dates, banner, logo)
  - Dynamic categories: Add Category (name, type: Singles/Doubles, entry fee, registration limit)
  - Unlimited categories, edit/delete before publishing
  - Status flow: Draft → Published → Registration Open → Registration Closed → Completed → (Cancelled)
  - Preview mode (exact player view before publishing)
  - Confirmation dialogs for publish / unpublish / close registration / cancel
  - Sidebar sections: All | Published | Registration Open | Registration Closed | Completed
- [ ] **Tournaments Tab (player app):**
  - Tournament list with filter chips: All | 🔴 Live | 🟢 Registration Open | 📅 Upcoming
  - Tournament card: banner, name, venue, date, status badge, category pills, entry fees
  - Tournament Detail:
    - Overview tab: banner, description, dates, organizer, categories, "Register" CTA
    - Live tab: per-court live match cards (Supabase Realtime, updates from Milestone 17)
    - Matches tab: grouped by court, search by player name/ID
    - Standings tab: expandable pool accordions
    - Draw tab: horizontal-scroll knockout bracket, round selector, search
  - Tournament Registration: select category (+ partner for doubles), pay (Razorpay / Wallet)
  - Podium placeholder on Overview: fills as tournament progresses (from organizer system)

### Completion Checklist
- [ ] Admin can create and publish a tournament listing
- [ ] Players can browse and filter tournaments
- [ ] Player can register for a tournament category and pay entry fee
- [ ] Registered badge shows on tournament card

---

## Milestone 16 — Tournament Organizer Flow

**Complexity:** ⬛⬛⬛⬛⬜ (High)

### DB Migrations Required
- Migration 020: `tournament_organizer_accounts`, `tournament_registrations`, `tournament_collaborators`
- Migration 021: `tournaments`, `tournament_categories`, `tournament_entries`, `tournament_pools`, `tournament_matches`
- Migration 022: All Phase 2 RLS policies

### Deliverables
- [ ] **Pre-Approval Questionnaire (player app):**
  - Step 1 of 2 form: organizer details, tournament details, category selection, add collaborators, estimated participants, T&C
  - Razorpay payment integration (₹400 × categories from system_config)
  - Pending approval screen
- [ ] **Admin Panel — Organizer Approvals:**
  - Approval card with full details (organizer, club, tournament, venue, categories, fee paid)
  - Approve → grants access to organizer + ALL collaborators simultaneously
  - Reject with admin note (stored in `tournament_registrations.admin_notes`)
  - Cannot edit registration fee (already paid)
- [ ] **Organizer Workspace (separate nav stack):**
  - "Manage Your Tournament →" card in profile → opens workspace
  - Header: back arrow, "ORGANIZER MODE 🏆" badge, persistent category dropdown
  - Bottom nav: Dashboard | Teams | Matches | Draw | Settings
- [ ] **Post-Approval Questionnaire (per category):**
  - Tournament format selection: Round Robin | Direct Knockout | League + Knockout
  - Format-specific config (pools, courts, seeding, qualifying teams, starting round)
  - Match rules per phase (best of, points per game, deuce, mid-game interval)
- [ ] **Team Entry Screen:**
  - Manual entry, search by Player ID, file import (CSV/Excel/JSON with column mapping)
  - Guest entry flag (no Player ID)
  - Seeded team assignment
- [ ] **Pool Generation (Round Robin / League+KO):**
  - Auto-generate pools (balanced distribution, seeded teams separated)
  - Pool review screen → confirm
- [ ] **League Dashboard:**
  - Pools tab (pool cards), Standings tab (live rank table), Matches tab (grouped by court, search)
  - Match display settings toggle (show time / court / order of play)
  - Each match card: "Start Match" button → Umpire screen (M17)
- [ ] **Knockout Draw:**
  - Auto-generate bracket (byes for non-power-of-2)
  - Bracket review → lock draw
  - Horizontal-scroll bracket view with SVG connector lines
- [ ] **Champion Screen:**
  - Podium (1st, 2nd, 3rd) per category
  - "Finish Tournament" → triggers ranking computation (M17)
- [ ] **Access expiry:**
  - Daily Edge Function `revoke_expired_organizer_access` (checks `access_expires_at`)
  - Profile card reverts to "Organize a Tournament Again" after expiry

### Completion Checklist
- [ ] Organizer can submit registration form and pay
- [ ] Admin can approve, organizer and collaborators get access
- [ ] Post-approval questionnaire correctly determines tournament format
- [ ] Team entry (manual + search + file import) works
- [ ] Pool generation and fixture creation work
- [ ] Knockout bracket generates correctly with byes
- [ ] League and knockout dashboards render correctly

---

## Milestone 17 — Umpire Live Scoring + Ranking Computation

**Complexity:** ⬛⬛⬛⬛⬛ (Very High)

### DB Migrations Required
- Migration 023: `match_events`, `tournament_results`

### Deliverables
- [ ] **Match Setup Screen (landscape):**
  - Pre-filled from organizer data (teams, category, court, match#)
  - Umpire edits: court side assignment, points/game (15/21/30), best of, deuce, mid-game interval
  - Values copied from `tournament_categories` phase template (rr_* / ko_* / final_*)
- [ ] **Live Scoring Screen (landscape, full-screen):**
  - Giant scoreboard: current game scores, game history column headers
  - Serving indicator on active server
  - [TEAM A POINT] / [TEAM B POINT] large tap targets
  - BWF rotation auto-logic:
    - Singles: standard service alternation
    - Doubles: full BWF doubles rotation (player positions auto-tracked)
    - Mixed: same as doubles
  - End change at halfway point (modal confirmation)
  - Deuce handling (auto-detect, cap at points+1)
  - Mid-game interval modal at 11 points (games 1 and 2)
  - Game banners: 11-point interval, Game Point, Match Point, Game Won
- [ ] **Events Panel:**
  - Injury Timeout, Yellow Card, Red Card (+ player + reason), Official Note
  - Pause / Resume
  - Undo Last Point (last action only)
  - Match Timeline (scrollable timestamped log)
  - All events → `match_events` table
- [ ] **Supabase Realtime (wss):**
  - `match_events` INSERT subscription → organizer dashboard live update
  - `tournament_matches` UPDATE subscription → public Tournaments tab Live tab update
- [ ] **Match Completion:**
  - Submit Result modal → `tournament_matches` status='completed', winner, scores stored
  - Next scheduled match for that court auto-promoted (status displayed)
  - KO matches: winner auto-seeded into next bracket slot
- [ ] **Ranking Computation Edge Function (`compute_ranking_points`):**
  - Triggered by "Finish Tournament" on Champion screen
  - Computes points per `ranking_system.md` formula for all non-guest entries
  - Updates `ranked_players` (total_points, wins, losses, tournaments_played, titles_won)
  - Checks promotion thresholds → updates skill_level if crossed
  - Inserts `ranking_points_log` records
  - Sends push notification to all ranked participants
- [ ] **Organizer rejection refund:**
  - Edge Function: when admin rejects, Razorpay refund API called for the organizer fee

### Completion Checklist
- [ ] Umpire can score a full singles and doubles match with correct BWF rotation
- [ ] End change, deuce, mid-game interval work correctly
- [ ] Match events stream to organizer dashboard in realtime
- [ ] Match completion updates bracket/standings
- [ ] Ranking points computed correctly on "Finish Tournament"
- [ ] Promoted players removed from old leaderboard

---

## Milestone 18 — Admin Panel Phase 2 Consolidation

**Complexity:** ⬛⬛⬛⬜⬜ (Medium)

### Deliverables
- [ ] Verify and connect all new admin sections built during M11–M17
- [ ] **System Config page:**
  - Edit `organizer_access_days`, `organizer_fee_per_category`, promotion thresholds
  - Only affects future registrations (not retroactive)
- [ ] **Admin Panel navigation update:**
  - New sidebar sections: Tournament Listings | Organizer Approvals | Player IDs | Wallet Management | Coach Management | Rankings Override | System Config
- [ ] Push notification infrastructure (FCM for player app, separate from owner app)
- [ ] **Automated WhatsApp Integration:** (Skipped from M11) Setup Twilio/WATI API for automated booking confirmations to owner and player.

### Completion Checklist
- [ ] All admin sections navigable and functional
- [ ] System config values respected throughout the system
- [ ] Push notifications delivered correctly
- [ ] Automated WhatsApp booking notifications work

---

## Milestone 19 — Phase 2 Polish & Launch Prep

**Complexity:** ⬛⬛⬜⬜⬜ (Low)

### Deliverables
- [ ] Error boundaries + retry on all major screens
- [ ] Empty states for all lists
- [ ] Offline: show "No internet" error for all writes; schedule/coach data cached in MMKV
- [ ] Offline banner: "You're offline — showing cached data"
- [ ] Toast notifications for all actions (success, error, info)
- [ ] Performance audit (React Query staleTime tuning, list virtualization)
- [ ] E2E bug bash
- [ ] EAS Build config for player app (development, preview, production)
- [ ] Production Supabase: all Phase 2 migrations applied
- [ ] Sentry error tracking for player app
- [ ] App icons, splash screen, app name "ShuttleHub" in app.json

### Completion Checklist
- [ ] Player app installable on Android device
- [ ] All Phase 2 migrations applied to production
- [ ] Error tracking receiving events
- [ ] App stable and crash-free

---

## Phase 2 Timeline Summary

| Milestone | Feature Area | Complexity |
|-----------|-------------|------------|
| M10 | Player App Foundation + Auth | Medium |
| M11 | Home Dashboard + Court Booking | Medium |
| M12 | Social Features (Challenges, Host/Join) | Medium |
| M13 | Player Identity + Rankings + Profile | Medium |
| M14 | Shop | Medium |
| M15 | Tournament Listings (Public) | Medium |
| M16 | Tournament Organizer Flow | High |
| M17 | Umpire Live Scoring + Ranking Computation | Very High |
| M18 | Admin Panel Phase 2 Consolidation | Medium |
| M19 | Phase 2 Polish + Launch Prep | Low |

> [!IMPORTANT]
> M16 and M17 are tightly coupled. Start M16 first and complete pool generation + fixture creation before starting M17 (umpire scoring). Both depend on `tournament_matches` being fully populated.

> [!NOTE]
> M11 (Court Booking) and M15 (Tournament Listings) can be built in parallel by different agents once M10 migrations are applied. M12 (Social) and M14 (Shop) can also run in parallel after M11's player booking infrastructure is in place.