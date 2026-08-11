# ShuttleHub Player App — Phase 2 Implementation Plan

> **Primary Reference for Coding Agents.** Read this entire document before writing any code. Cross-reference with `10-development-roadmap.md` for milestone checklists and `06-database-design.md` for the full schema.

---

## 1. Project Scope & Architecture

### 1.1 What This Phase Builds

Phase 2 delivers the **ShuttleHub Player App** — a single `apps/player/` Expo app that serves three audiences simultaneously, gated by role-based state:

```
Every authenticated user → Player (apps/player/)
    └── If active organizer session → Organizer Workspace (separate navigation stack)
            └── Inside organizer workspace, "Start Match" → Umpire Live Scoring (landscape screen)
```

### 1.2 Technology Stack (same pattern as Owner App)

| Layer | Technology |
|---|---|
| Framework | React Native + Expo SDK 52 |
| Language | TypeScript 5.x |
| Navigation | Expo Router 4.x (file-based) |
| Styling | NativeWind 4.x (Tailwind for RN) |
| State (Server) | TanStack React Query 5.x |
| State (Client) | Zustand 5.x |
| Forms | React Hook Form + Zod |
| Icons | Lucide React Native |
| Backend | Supabase JS 2.x |
| Payment | Razorpay (court bookings, organizer registration, shop, tournament entry) |
| Push | expo-notifications + FCM (separate token from Owner App) |
| Auth Storage | expo-secure-store |
| Theme | NativeWind dark/light/system — **default: system** |

### 1.3 Design System

| Token | Value |
|---|---|
| Primary background | Navy `#0B1F3A` (dark) / White (light) |
| Accent / CTA | Lime `#A7FF3F` |
| App brand name | **ShuttleHub** (all user-facing text) |
| Currency | ₹ (Indian Rupee, paise internally) |
| Phone prefix | +91 |
| Market | India only |
| Theme default | System (follows phone dark/light mode) |

### 1.4 Shared Code

All reusable services, types, and utilities go in `packages/shared/src/`. New player-specific services are added alongside existing owner services — never replacing them.

---

## 2. Identity & Role Architecture

### 2.1 The Multi-Table Identity Model

```
auth.users (Supabase managed — one row per phone number)
    ├── owners table   → Owner App access (existing, unchanged)
    ├── players table  → Player App access (NEW)
    └── customers      → soft-linked by phone (read-only join for history)
```

**Key rule:** A user with the same phone number can have rows in BOTH `owners` AND `players` simultaneously. No role switcher. No enum change. They use two separate apps. The `user_role` enum stays strictly `super_admin | owner`.

### 2.2 Player ID System

- Player ID is **NOT** created at profile registration. It is created when the user navigates to `Rankings > Register Player ID`.
- Format: `SH` + 5 random alphanumeric characters (e.g. `SH7X3K9`). Globally unique.
- Identity verification via third-party doc verification (SheerID or similar). System stores **doc type only** (Aadhaar / Passport / Driving Licence). Never the doc number.
- On Player ID registration → a `ranked_players` row is also created.
- Without a Player ID → user uses 100% of the app EXCEPT Rankings and ranking points.

### 2.3 Ranked Players Logic

```
players table       → all ShuttleHub users (profile, bookings, social)
ranked_players table → created ONLY on Player ID registration (ranking stats)
```

- `ranked_players.skill_level` starts at `'beginner'`.
- On promotion: `skill_level` updated, `total_points` resets to 0, history retained.
- Guest tournament entries (no Player ID) earn zero ranking points.

### 2.4 Customer ↔ Player Soft Link

On player registration:
```sql
SELECT id FROM customers WHERE phone = new_player.phone LIMIT 1
```
If found → `players.linked_customer_id` is set. This is read-only — it surfaces historical court bookings from the owner's system in the player's "Play Activity" screen.

---

## 3. App Navigation Map

### 3.1 Bottom Navigation (5 Tabs)

```
[Home]  [Play]  [Tournaments]  [Rankings]  [Shop]
```
Profile is accessed via a circular avatar icon in the **top-right header** (always visible across all tabs).

### 3.2 Header (all screens)

```
[ShuttleHub logo]  [📍 City Name ▼]  [🗂️ Wallet icon]  [👤 Profile avatar]
[                Search bar ("Search courts, players...")                 ]
[🔔 Alerts badge — top right of search bar]
```

- City selector: location filter, persistent in header
- Wallet icon: read-only balance dropdown on tap
- Alerts bell: count badge; tapping opens notification panel

### 3.3 Full Screen Map

```
HOME TAB
├── Hero Carousel (live tournaments, featured products)
├── Quick Actions: Book Court | Join Game | Tournaments | See Your Rank
├── Nearby Courts (horizontal scroll, "View All" link)
└── Fast Selling Items (horizontal scroll product cards)

PLAY TAB
├── Segmented Control: Book Court | Find Players | Host/Join | Train
│
├── BOOK COURT
│   ├── Court Listing (search, filters: indoor/outdoor, A/C, price range)
│   ├── Court Detail (photos, info, amenities)
│   │   ├── "Book a Slot" → Slot Selection
│   │   └── "Become a Member" → Membership Application
│   ├── Slot Selection
│   │   ├── Court Type toggle (A/C / Non A/C)
│   │   ├── Number of Courts selector (1–4)
│   │   ├── Date picker (5 visible dates, chevron nav)
│   │   ├── Time of Day tabs (Twilight / Morning / Noon / Evening)
│   │   ├── 30-min slot grid (multi-select: Available / Selected / Booked)
│   │   └── Sticky CTA: duration + price + "Continue to Booking Summary"
│   ├── Booking Summary
│   │   ├── Court + slot details
│   │   ├── Payment: [Wallet] [Online - Razorpay] [Pay at Court]
│   │   └── "Confirm Booking"
│   └── Booking Confirmation → WhatsApp notification (owner + player)
│
├── FIND PLAYERS
│   ├── Player Discovery (search by name/Player ID, filters: skill, gender, distance)
│   ├── Public Player Profile
│   └── Challenge Modal
│       ├── Host selects from their upcoming bookings
│       ├── Host invites multiple players (not 1v1 only)
│       └── Challenge expires at host's booking end time
│
├── HOST/JOIN MATCH
│   ├── Discover Matches Near Me (join flow)
│   ├── My Hosted Matches + Hosted Match Detail
│   └── Host a Match (requires confirmed court booking → redirect if none)
│       └── Format, skill level, visibility, max players
│
└── TRAIN
    ├── Coach Cards (admin-created)
    └── Coach Detail (specialty, pricing, contact CTA)

TOURNAMENTS TAB
├── Tournament List (admin-published public listings)
│   ├── Filters: All | 🔴 Live | 🟢 Registration Open | 📅 Upcoming
│   └── Tournament cards (banner, name, venue, date, status, categories, entry fees)
├── Tournament Detail
│   ├── Tab 1: Overview (banner, description, podium placeholder, "Register" CTA)
│   ├── Tab 2: Live (per-court match cards, Supabase Realtime)
│   ├── Tab 3: Matches (grouped by court, search by player name/ID)
│   ├── Tab 4: Standings (expandable pool accordions)
│   └── Tab 5: Draw (knockout bracket, horizontal+vertical scroll, search, round chips)
└── Tournament Registration
    ├── Category selection + partner details (doubles)
    └── Payment (Razorpay / Wallet)

RANKINGS TAB
├── [No Player ID] → Register Player ID prompt → verification flow
├── [Has Player ID] → My Rank Card
└── Leaderboard
    ├── Tabs: Beginner | Intermediate | Open
    └── Tap any player → Public Player Profile

SHOP TAB
├── Product Listing (category filter pills)
├── Product Detail
├── Cart
└── Checkout (Razorpay / Wallet)

PROFILE (top-right avatar)
├── Profile Header (photo, name, Player ID, verified badge, rank, stats row, Edit Profile)
├── Settings-style list:
│   ├── 🪪 Player Identity → detail screen
│   ├── 🏆 Tournament History → expandable cards
│   ├── 🎾 Play Activity → tabs: Bookings | Joined Matches | Hosted
│   ├── 📊 Performance Report → analytics dashboard + achievements
│   ├── 🛍️ Shop Orders → order cards with invoice
│   │
│   ├── [FEATURED CARD — not a list item, state-dependent]:
│   │   - No session → "Become a Tournament Organizer"
│   │   - Active session → "Manage Your Tournament →"
│   │   - Expired / completed → "Organize a Tournament Again"
│   │
│   ├── ⚙️ Settings → mobile, email, notifications, privacy, help, theme toggle
│   └── 🚪 Logout
```

---

## 4. Tournament Organizer Flow

### 4.1 Entry Path

```
Profile → Featured Organizer Card → Pre-Approval Form
├── Organizer Details (name, mobile, email, club)
├── Tournament Details (name, venue, city, dates)
├── Category Selection (multi-select, full list)
├── Add Collaborators (search by phone, add name)
│   └── All collaborators get organizer+umpire access on admin approval
├── Estimated Participants
└── T&C → Payment (₹400 × categories, Razorpay only)
    └── Pending Admin Approval screen
        │
        [Admin approves → ALL collaborators approved simultaneously]
        │
        └── Push notification → Profile card: "Manage Your Tournament →"
```

### 4.2 Organizer Workspace Navigation

A **new navigation stack** opens on top of the player app (modal-style, own header + bottom nav):

```
ORGANIZER WORKSPACE
┌──────────────────────────────────────────────────────┐
│  [← Back to Player App]       [ORGANIZER MODE 🏆]   │
│  Category: Men's Singles ▼  (persistent selector)   │
└──────────────────────────────────────────────────────┘
Organizer Bottom Nav (Navy+Lime): [Dashboard] [Teams] [Matches] [Draw] [Settings]
```

### 4.3 Tournament Format Decision Logic

Derived from two questionnaire answers per category:

| Pools | Knockout Starting Round | Format |
|---|---|---|
| > 0 | None | **Round Robin** |
| 0 | Any round set | **Direct Knockout** |
| > 0 | Any round set | **League + Knockout** |

#### Round Robin Flow
```
→ Read Teams → Read Pools → Create Pools → Distribute Seeded Teams
→ Distribute Remaining → Generate League Fixtures → Generate Standings
→ Generate Schedule → Dashboard: [Pools] [Standings] [Matches]
```

#### Direct Knockout Flow
```
→ Read Teams → Read Seeded Teams → Create Draw → Assign Byes
→ Generate Round 1 Fixtures → Generate Bracket
→ Dashboard: [Draw] [Matches]
```

#### League + Knockout Flow
```
→ Read Teams → Read Pools → Distribute Seeded Teams
→ Generate League → Generate Standings → Top N qualify
→ Generate KO Draw → Generate QF/SF/Final
→ Dashboard: [Pools] [Standings] [Matches] [Draw]
```

### 4.4 Team Entry

```
Teams Screen
├── List of entries (name, Player ID if registered, GUEST / SEED badges)
├── Add Entry: Manual | Search by Player ID | File Import (CSV/Excel/JSON)
│   └── File import: column mapping UI if format varies
└── "Generate Pools / Generate Draw" CTA (enabled when min teams met)
```

Guest entries: name entered manually, no Player ID, participates fully, earns 0 ranking points.

### 4.5 Access Window

- `access_expires_at = access_granted_at + system_config('organizer_access_days')` (default: 2)
- Daily Edge Function `revoke_expired_organizer_access` handles expiry
- After expiry: workspace inaccessible, all data preserved, card → "Organize Again"

---

## 5. Umpire Live Scoring

### 5.1 Entry Point

Any organizer or approved collaborator taps "Start Match" on any match card. No separate Umpire role or login.

### 5.2 Match Setup Screen (pre-scoring)

Pre-filled from organizer data. Umpire can edit:
- Court side assignment, match format (points/game: 15/21/30), best of, deuce, mid-game interval
- Values **copied from `tournament_categories` phase template** (rr_* / ko_* / final_*) into `tournament_matches`. Umpire overrides are stored on `tournament_matches` directly.

### 5.3 Landscape Live Scoring Screen

```
[Court# | Match# | Category | Game# | Timer | 🔴 LIVE]
[G1   G2   G3(●)]     ← Scoreboard header
[21   18   11  ]      ← Team A scores
[17   21   8   ]      ← Team B scores
[Team A name]  ◉ SERVING
       vs
[Team B name]
[  TEAM A POINT  ]    [  TEAM B POINT  ]
Events Panel ▼: [Injury Timeout] [Yellow Card] [Red Card] [Undo] [Pause] ...
Match Timeline (timestamped log)
```

### 5.4 BWF Rotation Logic

| Format | Serving Rule |
|---|---|
| Singles | Standard BWF: server switches on point won by receiver |
| Doubles | Full BWF doubles rotation (app auto-enforces) |
| Mixed Doubles | Same as doubles rotation |

End changes, deuce, mid-game intervals all auto-managed with modal confirmations.

### 5.5 Match Completion

```
Submit Result
→ tournament_matches updated (status=completed, winner, scores)
→ match_events streamed via Supabase Realtime
→ Next match for that court auto-promoted
→ KO: winner auto-seeded into next bracket slot
```

---

## 6. Ranking System

### 6.1 Formula

```
Ranking Points = Position Points × Participant Multiplier × Tournament Reach Multiplier
```

**Participant Multiplier:** ≥8→1.0×, ≥16→1.1×, ≥32→1.2×, ≥64→1.35×, ≥128→1.5×

**Reach Multiplier:** Intra Club→1.0×, Inter Club→1.2×, City Wide→1.5×

Points awarded to top ~50% of participants. Thresholds stored in `system_config`.

### 6.2 Trigger

Organizer taps "Finish Tournament" → Edge Function `compute_ranking_points` → updates `ranked_players`, inserts `ranking_points_log`, checks promotions, pushes notifications.

---

## 7. Payment & Refund Rules

| Context | Methods |
|---|---|
| Court booking | Wallet / Razorpay / Pay at court |
| Organizer registration fee | Razorpay only |
| Tournament entry (participant) | Razorpay / Wallet |
| Shop | Razorpay / Wallet |
| Membership | Razorpay (NOT wallet) / Offline |

**Refund logic:**
- Wallet payment → refund to wallet (credit transaction in `player_transactions`)
- Razorpay payment → Razorpay refund API (Edge Function, confirmed via webhook)

**Admin fee:** Admin CANNOT edit a fee after a user has already paid. Admin only changes `system_config('organizer_fee_per_category')` which affects future registrations.

---

## 8. Admin Panel Extensions

| Section | Functionality |
|---|---|
| **Tournament Listings** | Admin creates/manages public tournament pages (separate from organizer system). Dynamic categories. Status: Draft→Published→Reg Open→Reg Closed→Completed. Preview before publish. |
| **Organizer Approvals** | Approve/reject with notes. Cannot edit paid fee. Approving grants all collaborators access simultaneously. |
| **Player ID Management** | View + delete registered Player IDs. No issuance (auto by system). |
| **Wallet Management** | Search player, view balance + history, credit wallet. |
| **Coach Management** | CRUD coach profiles, assign to venue. |
| **Rankings Override** | Search ranked player, adjust total_points or current_rank with note. |
| **System Config** | Edit: organizer_access_days, organizer_fee_per_category, promotion thresholds. |

---

## 9. Notification Matrix

| Event | Player | Owner |
|---|---|---|
| Court booked online | WhatsApp confirmation | WhatsApp notification |
| Challenge received | Push + in-app bell | — |
| Challenge accepted | Push + in-app bell | — |
| Booking cancelled (host booking for challenge) | Push to all invited players | — |
| Hosted match booking cancelled | Push to all joined players | — |
| Organizer approved | Push to organizer + all collaborators | — |
| Organizer rejected | Push to organizer | — |
| Ranking updated | Push to all ranked participants | — |
| Membership renewal reminder | In-app bell (owner triggers from Owner App) | — |

---

## 10. Key Business Rules & Edge Cases

| Rule | Behavior |
|---|---|
| Dual role (owner + player) | Same phone → separate rows in owners + players. Separate FCM tokens. No conflict. |
| Challenge = multi-player | Host invites multiple players. Only host needs the booking. Host is responsible. |
| Challenge expiry | `expires_at = booking.date + booking.end_time`. Auto-expires via cron/trigger. |
| Booking cancelled → active challenge | Trigger auto-cancels challenge + pushes to all invited players |
| Booking cancelled → hosted match | Trigger auto-cancels match + pushes to all joined players |
| Category display name | Aggregated: category_name + " " + category_type → "Men's Singles", "Mixed Doubles" |
| Match rules inheritance | On fixture generation: copy category template into match. Umpire overrides live on match row. |
| Tournament format | Derived from: pools=0 → Direct KO; pools>0 + ko=None → RR; pools>0 + ko set → League+KO |
| Refund (wallet) | Credit back to wallet (not through Razorpay) |
| Refund (Razorpay) | Razorpay refund API via Edge Function |
| Promoted player | Removed from previous leaderboard immediately. Points reset to 0 in new level. History kept. |
| One active tournament | Per organizer_account, max one non-completed tournament at a time. Same account reused per user. |
| Guest entries | Participate fully. `tournament_results.ranking_points = 0`. `ranked_players` not touched. |
