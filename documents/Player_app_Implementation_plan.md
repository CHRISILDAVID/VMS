# ShuttleHub (Player App) — Implementation Plan

> **Brand:** ShuttleHub
> **Platform:** React Native + Expo (Mobile App) — `apps/player/`
> **Market:** India only (₹, +91)
> **Design:** Navy (#0B1F3A) + Lime (#A7FF3F) sporty theme from `player_reference/figma-src/`
> **Backend:** Shared Supabase instance (same as Owner App + Admin Panel)

## Important Design Reference

When developing the Player App, **always refer to `player_reference/figma-src/`** for screen designs and UI patterns. The Figma exports show the intended visual direction for the sporty navy + lime theme.

However, **maintain consistency with established patterns** from the Owner App codebase (especially for component APIs, service patterns, and Expo Router conventions).

## Architecture Overview

| App | Path | Platform | Technology |
|-----|------|----------|-----------|
| **Owner App** | `apps/owner/` | Mobile (Android/iOS) | React Native + Expo |
| **Player App** | `apps/player/` | Mobile (Android/iOS) | React Native + Expo |
| **Admin Panel** | `apps/admin/` | Web (Desktop) | React + Vite + Tailwind |
| **Shared Code** | `packages/shared/` | — | TypeScript |
| **Backend** | `supabase/` | Cloud | Supabase (PostgreSQL) |

## Founder's Key Decisions

### Identity & Auth
- Phone + OTP authentication (same as Owner App)
- Separate `players` table with FK to `auth.users` — **NOT** `player` in `user_role` enum
- A user can be **both** an owner AND a player (same phone, different profile tables)
- On registration: auto-link `customers` records where `customers.phone = player.phone`
- Location permission prompted for GPS auto-detection → auto-fill city/state

### Player ID
- **Not mandatory** for general app usage
- Required only for **tournaments** (deferred) and **rankings** (deferred)
- Real verification flow: document upload, last-4-digits stored, auto-generated ID (SH-XXXXX) after admin verification

### Court Booking
- **"Pay at Court"** for MVP — no online payment integration
- Owner/Admin configures `min_slot_duration` per venue (needs Owner App settings update)
- Free cancellation up to `cancellation_hours` before booking (configurable by owner)
- Player bookings: `source = 'online'`, `booked_by = player's auth.uid()`
- Platform fee added per booking (`venues.platform_fee`)

### Memberships
- **No dedicated membership screen** in Player App
- Browse published membership slots via Court Details → "Become a Member"
- Application is free; guest play is paid and owner-invited only
- Membership payment reminders via notification bell icon

### Social Features
- Full **Find Players** feature: search by name, filter by skill level
- **Challenge system**: booking-gated, challenger pays full booking cost, supports doubles (multi-challenge)
- **Host/Join Match**: host pays full booking, no in-app payment splits
- **Wallet**: No add-money by user, admin-managed balance only. Can be used for bookings, shop, tournaments.

### Shop & E-Commerce
- Full shopping flow: browse → cart → checkout → order history
- Both admin and owners can list products
- Owner products: **pickup from venue only** (no delivery)

### Coaching
- View-only directory, admin-managed coach listings

### Tournaments & Rankings
- **Deferred entirely** — placeholder pages only
- May become a separate app; keep design flexible

### Notifications
- Push (FCM) + In-app bell icon + WhatsApp deep links
- Types: booking confirmation, challenge request, challenge response, guest play invitation, membership payment reminder, order updates, wallet credits

### Revenue Model
- Platform fee per booking
- Commission on shop sales
- Tournament entry commission (future)
- **No subscription for players**

## Milestones

### M10 — Player App Foundation + Auth
Setup Expo project, design system (navy+lime), Phone+OTP auth, players table, location GPS, auto-link customers.

### M11 — Home Dashboard + Court Discovery
Home dashboard with hero carousel, quick actions, nearby courts, court listing + details, wallet dropdown.

### M12 — Court Booking
Slot selection grid, booking summary, "Pay at Court" flow, booking confirmation, booking history, cancellation support.

### M13 — Social: Find Players + Challenge + Host/Join
Find Players with skill filters, challenge system (booking-gated), host/join match, public player profiles.

### M14 — Membership Discovery + Notifications Center
Membership batches via Court Details, application flow, notification center (bell icon), FCM push, WhatsApp deep links.

### M15 — Shop / E-Commerce
Product catalog (admin+owner), product details, cart, checkout, order history. Admin Panel product management.

### M16 — Wallet + Coach Directory + Reviews
Wallet balance + transactions, coach directory (view-only), venue reviews (post-booking), Admin Panel analytics.

### M17 — Player ID + Search + Polish
Player ID registration + verification, universal search, tournament/rankings placeholders, profile page, error boundaries, deep linking.

## Feature Priority Matrix

| Priority | Feature | Milestone |
|----------|---------|-----------|
| 🔴 P0 | Auth + Player Profile + Location | M10 |
| 🔴 P0 | Home Dashboard + Court Discovery | M11 |
| 🔴 P0 | Court Booking (Pay at Court) | M12 |
| 🔴 P0 | Find Players + Challenge + Host/Join | M13 |
| 🟠 P1 | Membership Discovery + Application | M14 |
| 🟠 P1 | Notification Center (Bell + Push + WhatsApp) | M14 |
| 🟡 P2 | Shop / E-Commerce | M15 |
| 🟡 P2 | Wallet (admin-added balance) | M16 |
| 🟡 P2 | Coach Directory | M16 |
| 🟡 P2 | Venue Reviews | M16 |
| 🟢 P3 | Player ID + Verification | M17 |
| 🟢 P3 | Cross-entity Search | M17 |
| 🟢 P3 | Admin Panel Updates | M15-M17 |
| ⚪ Deferred | Tournaments | Future |
| ⚪ Deferred | Rankings + Leaderboard | Future |
| ⚪ Deferred | Online Payment Integration | Future |

## Cross-References

- **Database Schema:** `documents/06-database-design.md` (Phase 2 section)
- **Backend Architecture:** `documents/07-backend-architecture.md` (Phase 2 section)
- **Frontend Architecture:** `documents/08-frontend-architecture.md` (Phase 2 section)
- **Deployment:** `documents/09-mobile-and-deployment.md` (Part E)
- **Roadmap:** `documents/10-development-roadmap.md` (M10-M17)
- **Player Figma Reference:** `player_reference/figma-src/`
- **Owner App Reference:** `apps/owner/` (for component patterns and conventions)
- **Tournament Feature Notes:** `player_reference/prompts/tournament_feature.md`
