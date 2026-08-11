# Badminton Manager — Database Design (Supabase / PostgreSQL)

## 1. Design Principles

- Every table includes `id` (UUID, PK), `created_at`, `updated_at` audit fields
- Soft deletes via `deleted_at` timestamp (nullable)
- All foreign keys enforce referential integrity
- Row Level Security (RLS) on every table
- ENUMs for status fields to enforce valid states
- Indexes on frequently queried/filtered columns
- Multi-venue support baked into schema (every entity scoped to venue)
- Booking time constraints: start at :00 or :30, whole-hour durations

---

## 2. Enums

```sql
-- Authentication & Roles
CREATE TYPE user_role AS ENUM ('super_admin', 'owner');

-- Booking & Court
CREATE TYPE booking_status AS ENUM ('upcoming', 'ongoing', 'completed', 'cancelled');
CREATE TYPE booking_payment_status AS ENUM ('pending', 'partial', 'paid', 'refunded', 'cancelled');
CREATE TYPE slot_type AS ENUM ('available', 'booked', 'coaching', 'tournament', 'maintenance', 'blocked', 'membership');
CREATE TYPE booking_source AS ENUM ('online', 'offline', 'walk_in', 'membership');
CREATE TYPE court_type AS ENUM ('wooden', 'synthetic', 'cement', 'mat');

-- Membership
CREATE TYPE membership_pay_status AS ENUM ('paid', 'due', 'overdue');
CREATE TYPE skill_level AS ENUM ('beginner', 'intermediate', 'advanced', 'recreational');
CREATE TYPE application_status AS ENUM ('pending', 'accepted', 'rejected', 'invited_guest');
CREATE TYPE guest_play_status AS ENUM ('upcoming', 'completed', 'accepted_member', 'rejected');

-- Payments
CREATE TYPE payment_mode AS ENUM ('cash', 'upi', 'google_pay', 'phonepe', 'bank_transfer', 'cheque', 'card', 'online');

-- Subscription (mock for MVP)
CREATE TYPE subscription_plan AS ENUM ('free', 'pro', 'enterprise');
CREATE TYPE invoice_status AS ENUM ('paid', 'pending', 'failed', 'refunded');

-- Days
CREATE TYPE day_of_week AS ENUM ('mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun');
```

> [!NOTE]
> **Changes from original design:**
> - Removed `staff_permission` enum (no staff roles in MVP)
> - Removed `player` from `user_role` (Player App is deferred)
> - Renamed `payment_status` to `booking_payment_status` to avoid ambiguity
> - Added `refunded` and `cancelled` to `booking_payment_status`
> - Added `membership` to `slot_type` for pre-blocked membership schedule blocks
> - Added `super_admin` to `user_role` for admin panel

---

## 3. Tables

### 3.1 Core Entity Tables

```sql
-- ═══════════════════════════════════════════════════════════════
-- OWNERS (extends Supabase auth.users)
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE owners (
  id            UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name     TEXT NOT NULL,
  phone         TEXT NOT NULL UNIQUE,
  email         TEXT,                              -- optional, for account recovery
  avatar_url    TEXT,
  business_name TEXT NOT NULL,
  role          user_role NOT NULL DEFAULT 'owner',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at    TIMESTAMPTZ
);

CREATE INDEX idx_owners_phone ON owners(phone);

-- ═══════════════════════════════════════════════════════════════
-- VENUES
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE venues (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id        UUID NOT NULL REFERENCES owners(id) ON DELETE CASCADE,
  name            TEXT NOT NULL,
  address         TEXT,
  city            TEXT,
  state           TEXT,
  pincode         TEXT,
  latitude        DECIMAL(9,6),
  longitude       DECIMAL(9,6),
  contact_phone   TEXT,
  contact_email   TEXT,
  court_type      court_type,
  amenities       TEXT[] DEFAULT '{}',           -- Array of amenity names
  photos          TEXT[] DEFAULT '{}',           -- Array of storage URLs
  gstin           TEXT,                           -- Optional GST number
  gst_enabled     BOOLEAN NOT NULL DEFAULT FALSE, -- Toggle for GST on receipts
  is_active       BOOLEAN NOT NULL DEFAULT TRUE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at      TIMESTAMPTZ
);

CREATE INDEX idx_venues_owner ON venues(owner_id);

-- ═══════════════════════════════════════════════════════════════
-- COURTS
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE courts (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  venue_id    UUID NOT NULL REFERENCES venues(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,                     -- e.g., "Court 1"
  court_type  court_type,                        -- Wooden, Synthetic, Cement, Mat (metadata only)
  sort_order  INTEGER NOT NULL DEFAULT 0,
  is_active   BOOLEAN NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at  TIMESTAMPTZ
);

CREATE INDEX idx_courts_venue ON courts(venue_id);
```

> [!NOTE]
> **Staff table removed for MVP.** Owner-only access. The 3-4 device login limit is sufficient. Staff roles may be added in a future version.

### 3.2 Schedule & Pricing

```sql
-- ═══════════════════════════════════════════════════════════════
-- OPERATING SCHEDULES (per venue per day)
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE operating_schedules (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  venue_id    UUID NOT NULL REFERENCES venues(id) ON DELETE CASCADE,
  day_of_week day_of_week NOT NULL,
  is_closed   BOOLEAN NOT NULL DEFAULT FALSE,
  is_24h      BOOLEAN NOT NULL DEFAULT FALSE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE(venue_id, day_of_week)
);

-- ═══════════════════════════════════════════════════════════════
-- PRICING BLOCKS (time-based pricing within a day)
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE pricing_blocks (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  schedule_id     UUID NOT NULL REFERENCES operating_schedules(id) ON DELETE CASCADE,
  start_time      TIME NOT NULL,
  end_time        TIME NOT NULL,
  price_per_hour  INTEGER NOT NULL,              -- in smallest currency unit (paise)
  court_ids       UUID[] DEFAULT '{}',           -- empty = all courts in venue
  is_active       BOOLEAN NOT NULL DEFAULT TRUE,
  sort_order      INTEGER NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT valid_time_range CHECK (end_time > start_time)
);

CREATE INDEX idx_pricing_schedule ON pricing_blocks(schedule_id);
```

### 3.3 Bookings & Customers

```sql
-- ═══════════════════════════════════════════════════════════════
-- CUSTOMERS
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE customers (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id      UUID NOT NULL REFERENCES owners(id) ON DELETE CASCADE,
  user_id       UUID REFERENCES auth.users(id),  -- linked if player has an account (future)
  full_name     TEXT NOT NULL,
  phone         TEXT NOT NULL,
  email         TEXT,
  notes         TEXT,
  total_visits  INTEGER NOT NULL DEFAULT 0,
  total_spent   INTEGER NOT NULL DEFAULT 0,       -- paise
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at    TIMESTAMPTZ,

  UNIQUE(owner_id, phone)
);

CREATE INDEX idx_customers_owner ON customers(owner_id);
CREATE INDEX idx_customers_phone ON customers(phone);

-- ═══════════════════════════════════════════════════════════════
-- BOOKINGS
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE bookings (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_number  TEXT NOT NULL UNIQUE,           -- human-readable ID (e.g., BK001)
  venue_id        UUID NOT NULL REFERENCES venues(id),
  court_id        UUID NOT NULL REFERENCES courts(id),
  customer_id     UUID REFERENCES customers(id),  -- nullable for blocking the slots
  booked_by       UUID NOT NULL REFERENCES auth.users(id), -- owner who created
  date            DATE NOT NULL,
  start_time      TIME NOT NULL,
  end_time        TIME NOT NULL,
  duration_minutes INTEGER NOT NULL,
  base_amount     INTEGER NOT NULL,               -- auto-calculated price (paise)
  discount        INTEGER NOT NULL DEFAULT 0,     -- discount amount (paise)
  final_amount    INTEGER NOT NULL,               -- final price after discount (paise)
  advance         INTEGER NOT NULL DEFAULT 0,     -- advance paid (paise)
  pending         INTEGER NOT NULL DEFAULT 0,     -- remaining (paise)
  status          booking_status NOT NULL DEFAULT 'upcoming',
  payment_status  booking_payment_status NOT NULL DEFAULT 'pending',
  payment_mode    payment_mode,
  source          booking_source NOT NULL DEFAULT 'offline',
  slot_type       slot_type NOT NULL DEFAULT 'booked',
  is_force_booked BOOLEAN NOT NULL DEFAULT FALSE, -- owner override on blocked/maintenance slot
  notes           TEXT,
  payment_notes   TEXT,                            -- notes when payment status changes
  whatsapp_sent   BOOLEAN NOT NULL DEFAULT FALSE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at      TIMESTAMPTZ,

  -- Start time must be on :00 or :30
  CONSTRAINT valid_start_time CHECK (
    EXTRACT(MINUTE FROM start_time) IN (0, 30)
  ),
  -- Duration must be in whole-hour increments (60, 120, 180, ...)
  CONSTRAINT valid_duration CHECK (
    duration_minutes > 0 AND duration_minutes % 60 = 0
  ),
  CONSTRAINT valid_booking_time CHECK (end_time > start_time)
);

CREATE INDEX idx_bookings_venue_date ON bookings(venue_id, date);
CREATE INDEX idx_bookings_court_date ON bookings(court_id, date);
CREATE INDEX idx_bookings_customer ON bookings(customer_id);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_bookings_payment ON bookings(payment_status);
```

> [!NOTE]
> **Changes from original design:**
> - Added `base_amount` and `final_amount` (store both for reporting accuracy)
> - Added `payment_notes` field for notes when payment status changes
> - Added `is_force_booked` flag for owner override on blocked/maintenance slots
> - Added `valid_start_time` constraint (must be :00 or :30)
> - Added `valid_duration` constraint (must be whole-hour multiples of 60)
> - `booking_payment_status` now includes `refunded` and `cancelled`

### 3.4 Membership System

```sql
-- ═══════════════════════════════════════════════════════════════
-- MEMBERSHIP SLOTS
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE membership_slots (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  venue_id        UUID NOT NULL REFERENCES venues(id) ON DELETE CASCADE,
  name            TEXT NOT NULL,
  playing_days    day_of_week[] NOT NULL,
  start_time      TIME NOT NULL,
  end_time        TIME NOT NULL,
  skill_level     skill_level NOT NULL DEFAULT 'intermediate',
  monthly_fee     INTEGER NOT NULL,               -- paise
  capacity        INTEGER NOT NULL,
  guest_play_fee  INTEGER NOT NULL DEFAULT 0,     -- paise
  allow_guest_play BOOLEAN NOT NULL DEFAULT FALSE,
  billing_day     INTEGER NOT NULL DEFAULT 1,     -- day of month
  is_published    BOOLEAN NOT NULL DEFAULT FALSE,
  is_recruiting   BOOLEAN NOT NULL DEFAULT TRUE,
  court_id        UUID REFERENCES courts(id),     -- NULL = any court at venue
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at      TIMESTAMPTZ
);

CREATE INDEX idx_membership_slots_venue ON membership_slots(venue_id);

-- ═══════════════════════════════════════════════════════════════
-- MEMBERSHIP SLOT RELEASES (per-date slot release for walk-ins)
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE membership_slot_releases (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slot_id         UUID NOT NULL REFERENCES membership_slots(id) ON DELETE CASCADE,
  release_date    DATE NOT NULL,
  released_by     UUID NOT NULL REFERENCES auth.users(id),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE(slot_id, release_date)
);

-- ═══════════════════════════════════════════════════════════════
-- MEMBERS (join table: customer ↔ membership_slot)
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE members (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slot_id         UUID NOT NULL REFERENCES membership_slots(id) ON DELETE CASCADE,
  customer_id     UUID NOT NULL REFERENCES customers(id),
  is_active       BOOLEAN NOT NULL DEFAULT TRUE,
  join_date       DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at      TIMESTAMPTZ,

  UNIQUE(slot_id, customer_id)
);

CREATE INDEX idx_members_slot ON members(slot_id);
CREATE INDEX idx_members_customer ON members(customer_id);

-- ═══════════════════════════════════════════════════════════════
-- MEMBERSHIP APPLICATIONS (future — from Player App)
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE membership_applications (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slot_id         UUID NOT NULL REFERENCES membership_slots(id) ON DELETE CASCADE,
  applicant_name  TEXT NOT NULL,
  phone           TEXT NOT NULL,
  photo_url       TEXT,
  skill_level     skill_level,
  experience      TEXT,
  preferred_days  day_of_week[],
  status          application_status NOT NULL DEFAULT 'pending',
  reviewed_at     TIMESTAMPTZ,
  reviewed_by     UUID REFERENCES auth.users(id),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_applications_slot ON membership_applications(slot_id);
CREATE INDEX idx_applications_status ON membership_applications(status);

-- ═══════════════════════════════════════════════════════════════
-- GUEST PLAYS
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE guest_plays (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slot_id         UUID NOT NULL REFERENCES membership_slots(id) ON DELETE CASCADE,
  application_id  UUID REFERENCES membership_applications(id),
  player_name     TEXT NOT NULL,
  phone           TEXT NOT NULL,
  scheduled_date  DATE NOT NULL,
  status          guest_play_status NOT NULL DEFAULT 'upcoming',
  notes           TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_guest_plays_slot ON guest_plays(slot_id);
```

> [!NOTE]
> **Added `membership_slot_releases` table** — tracks when an owner releases a membership slot for a specific date, making it available for walk-in bookings.

### 3.5 Membership Payments

```sql
-- ═══════════════════════════════════════════════════════════════
-- MEMBERSHIP PAYMENTS
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE membership_payments (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id       UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  slot_id         UUID NOT NULL REFERENCES membership_slots(id),
  amount          INTEGER NOT NULL,               -- paise
  billing_period  DATE NOT NULL,                  -- first day of the billing month
  due_date        DATE NOT NULL,
  status          membership_pay_status NOT NULL DEFAULT 'due',
  payment_mode    payment_mode,
  paid_on         DATE,
  receipt_url     TEXT,
  notes           TEXT,
  recorded_by     UUID REFERENCES auth.users(id),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  is_voided       BOOLEAN NOT NULL DEFAULT FALSE, -- Incase member is removed mid-month and owner ignores due

  UNIQUE(member_id, billing_period)
);

CREATE INDEX idx_membership_payments_member ON membership_payments(member_id);
CREATE INDEX idx_membership_payments_slot ON membership_payments(slot_id);
CREATE INDEX idx_membership_payments_status ON membership_payments(status);
CREATE INDEX idx_membership_payments_due ON membership_payments(due_date);
```

### 3.6 Subscription & Billing (Mock for MVP)

```sql
-- ═══════════════════════════════════════════════════════════════
-- SUBSCRIPTIONS (SaaS billing for venue owners — static mock for MVP)
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE subscriptions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id        UUID NOT NULL REFERENCES owners(id) ON DELETE CASCADE,
  plan            subscription_plan NOT NULL DEFAULT 'free',
  started_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at      TIMESTAMPTZ,
  is_active       BOOLEAN NOT NULL DEFAULT TRUE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE invoices (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id        UUID NOT NULL REFERENCES owners(id) ON DELETE CASCADE,
  subscription_id UUID REFERENCES subscriptions(id),
  invoice_number  TEXT NOT NULL UNIQUE,
  amount          INTEGER NOT NULL,               -- paise
  status          invoice_status NOT NULL DEFAULT 'pending',
  paid_at         TIMESTAMPTZ,
  pdf_url         TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE payment_methods (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id        UUID NOT NULL REFERENCES owners(id) ON DELETE CASCADE,
  type            TEXT NOT NULL,                   -- 'card', 'upi', 'bank_account'
  last_four       TEXT,
  brand           TEXT,
  is_default      BOOLEAN NOT NULL DEFAULT FALSE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at      TIMESTAMPTZ
);
```

---

## 4. Row Level Security (RLS) Strategy

```sql
-- Enable RLS on all tables
ALTER TABLE owners ENABLE ROW LEVEL SECURITY;
ALTER TABLE venues ENABLE ROW LEVEL SECURITY;
ALTER TABLE courts ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE membership_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
ALTER TABLE membership_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE guest_plays ENABLE ROW LEVEL SECURITY;
ALTER TABLE membership_payments ENABLE ROW LEVEL SECURITY;
-- ... (all tables)

-- SUPER-ADMIN: can see ALL data
CREATE POLICY "Super-admin full access" ON venues
  FOR ALL USING (
    EXISTS (SELECT 1 FROM owners WHERE id = auth.uid() AND role = 'super_admin')
  );

-- OWNERS: can only see their own record
CREATE POLICY "Owners see own data" ON owners
  FOR ALL USING (auth.uid() = id);

-- VENUES: owner sees their venues
CREATE POLICY "Owner sees own venues" ON venues
  FOR ALL USING (owner_id = auth.uid());

-- COURTS: owner sees courts in their venues
CREATE POLICY "Owner sees own courts" ON courts
  FOR ALL USING (
    venue_id IN (SELECT id FROM venues WHERE owner_id = auth.uid())
  );

-- BOOKINGS: owner sees bookings at their venues
CREATE POLICY "Owner sees own bookings" ON bookings
  FOR ALL USING (
    venue_id IN (SELECT id FROM venues WHERE owner_id = auth.uid())
  );

-- Pattern: All downstream tables follow the same venue-ownership chain
-- Super-admin policies added to every table for admin panel access
```

---

## 5. Storage Requirements (Supabase Storage)

| Bucket | Content | Access |
|--------|---------|--------|
| `venue-photos` | Venue/court images | Public read, authenticated write |
| `member-photos` | Application profile photos | Authenticated read/write |
| `receipts` | Payment receipt PDFs | Authenticated read, server write |
| `invoices` | Subscription invoice PDFs | Authenticated read, server write |

---

## 6. Entity Relationship Diagram

```mermaid
erDiagram
    owners ||--o{ venues : owns
    owners ||--o{ customers : manages
    owners ||--o{ subscriptions : subscribes
    owners ||--o{ invoices : billed
    owners ||--o{ payment_methods : stores

    venues ||--o{ courts : contains
    venues ||--o{ operating_schedules : has
    venues ||--o{ membership_slots : offers

    operating_schedules ||--o{ pricing_blocks : defines

    courts ||--o{ bookings : hosts

    customers ||--o{ bookings : makes
    customers ||--o{ members : joins

    membership_slots ||--o{ members : includes
    membership_slots ||--o{ membership_applications : receives
    membership_slots ||--o{ guest_plays : hosts
    membership_slots ||--o{ membership_payments : generates
    membership_slots ||--o{ membership_slot_releases : releases

    members ||--o{ membership_payments : owes

    bookings {
        uuid id PK
        text booking_number
        uuid venue_id FK
        uuid court_id FK
        uuid customer_id FK
        date date
        time start_time
        time end_time
        int base_amount
        int final_amount
        booking_status status
        booking_payment_status payment_status
        booking_source source
    }

    membership_slots {
        uuid id PK
        uuid venue_id FK
        text name
        day_of_week[] playing_days
        time start_time
        time end_time
        int monthly_fee
        int capacity
    }
```

---

## 7. Report Views (for Revenue Breakdown)

```sql
-- Revenue breakdown: Booking Revenue vs Membership Revenue
CREATE VIEW revenue_summary AS
SELECT
  v.id AS venue_id,
  v.name AS venue_name,
  COALESCE(SUM(b.final_amount) FILTER (WHERE b.payment_status = 'paid'), 0) AS booking_revenue,
  COALESCE(SUM(mp.amount) FILTER (WHERE mp.status = 'paid'), 0) AS membership_revenue,
  COALESCE(SUM(b.final_amount) FILTER (WHERE b.payment_status = 'paid'), 0) +
  COALESCE(SUM(mp.amount) FILTER (WHERE mp.status = 'paid'), 0) AS total_revenue
FROM venues v
LEFT JOIN bookings b ON b.venue_id = v.id AND b.deleted_at IS NULL
LEFT JOIN membership_slots ms ON ms.venue_id = v.id AND ms.deleted_at IS NULL
LEFT JOIN membership_payments mp ON mp.slot_id = ms.id
GROUP BY v.id, v.name;
```

---

---

# Phase 2 — ShuttleHub Player App Database Schema

> All Phase 2 tables use sequential migrations starting from 014. RLS policies for all Phase 2 tables are in Migration 022. The existing `user_role` enum (`super_admin | owner`) is NOT changed — player identity uses a separate `players` table.

---

## Phase 2 — 1. Core Player Tables (Migration 014)

```sql
-- ─────────────────────────────────────────────────────────────────
-- players: all ShuttleHub Player App users
-- ─────────────────────────────────────────────────────────────────
CREATE TABLE players (
  id                    UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name             TEXT NOT NULL,
  phone                 TEXT NOT NULL UNIQUE,
  email                 TEXT,
  avatar_url            TEXT,
  city                  TEXT,
  date_of_birth         DATE,
  -- Player ID (registered separately after profile creation)
  player_id             TEXT UNIQUE,                    -- 'SH' + 5 alphanumeric, e.g. 'SH7X3K9'
  player_id_verified    BOOLEAN NOT NULL DEFAULT FALSE,
  player_id_doc_type    TEXT,                           -- 'aadhaar' | 'passport' | 'driving_licence' (name only)
  player_id_verified_at TIMESTAMPTZ,
  -- Customer soft-link (matched by phone at registration)
  linked_customer_id    UUID REFERENCES customers(id),  -- read-only historical link
  -- App preferences
  fcm_token             TEXT,                           -- player app FCM token (separate from owner app)
  theme_preference      TEXT NOT NULL DEFAULT 'system', -- 'light' | 'dark' | 'system'
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at            TIMESTAMPTZ
);

CREATE INDEX idx_players_phone ON players(phone);
CREATE INDEX idx_players_player_id ON players(player_id);

-- ─────────────────────────────────────────────────────────────────
-- system_config: admin-configurable key-value settings
-- ─────────────────────────────────────────────────────────────────
CREATE TABLE system_config (
  key        TEXT PRIMARY KEY,
  value      TEXT NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO system_config (key, value) VALUES
  ('organizer_access_days', '2'),
  ('organizer_fee_per_category', '40000'),       -- paise (₹400)
  ('ranking_promotion_beginner_threshold', '1000'),
  ('ranking_promotion_intermediate_threshold', '3000');

-- ─────────────────────────────────────────────────────────────────
-- player_wallets + player_transactions
-- ─────────────────────────────────────────────────────────────────
CREATE TABLE player_wallets (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id  UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  balance    INTEGER NOT NULL DEFAULT 0,          -- paise (₹1 = 100 paise)
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(player_id)
);

CREATE TABLE player_transactions (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_id         UUID NOT NULL REFERENCES player_wallets(id),
  amount            INTEGER NOT NULL,              -- positive=credit, negative=debit (paise)
  type              TEXT NOT NULL,                 -- 'credit' | 'debit'
  reason            TEXT NOT NULL,
  -- 'admin_topup' | 'court_booking' | 'tournament_entry' | 'shop_purchase' | 'refund'
  reference_id      UUID,                          -- FK to relevant entity
  reference_table   TEXT,                          -- 'bookings' | 'public_tournament_registrations' | 'shop_orders'
  credited_by       UUID REFERENCES auth.users(id), -- admin who topped up (null for auto debits)
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_player_transactions_wallet ON player_transactions(wallet_id);
```

---

## Phase 2 — 2. Coaches (Migration 015)

```sql
CREATE TABLE coaches (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  venue_id          UUID REFERENCES venues(id),     -- academy/venue they belong to
  full_name         TEXT NOT NULL,
  photo_url         TEXT,
  specialty         TEXT[],                          -- e.g. ['footwork', 'smash', 'defense']
  bio               TEXT,
  price_per_session INTEGER NOT NULL,               -- paise per session
  is_active         BOOLEAN NOT NULL DEFAULT TRUE,
  created_by        UUID NOT NULL REFERENCES auth.users(id), -- admin who created
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

---

## Phase 2 — 3. Player Booking Payments (Migration 015)

```sql
-- Tracks online/wallet payments made when player books a court through the app
-- The booking itself lives in the existing 'bookings' table (source='online')
CREATE TABLE player_booking_payments (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id            UUID NOT NULL REFERENCES bookings(id),
  player_id             UUID NOT NULL REFERENCES players(id),
  amount                INTEGER NOT NULL,            -- paise
  payment_method        TEXT NOT NULL,               -- 'wallet' | 'online' | 'pay_at_court'
  payment_status        TEXT NOT NULL DEFAULT 'pending', -- 'pending' | 'paid' | 'refunded'
  payment_reference     TEXT,                        -- Razorpay payment ID
  refund_reference      TEXT,                        -- Razorpay refund ID
  wallet_transaction_id UUID REFERENCES player_transactions(id),
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

---

## Phase 2 — 4. Social Features (Migration 016)

```sql
-- ─────────────────────────────────────────────────────────────────
-- hosted_matches: player hosts a match on a booked court
-- ─────────────────────────────────────────────────────────────────
CREATE TABLE hosted_matches (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  host_player_id UUID NOT NULL REFERENCES players(id),
  booking_id     UUID NOT NULL REFERENCES bookings(id), -- host must have a confirmed booking
  match_format   TEXT NOT NULL,                        -- 'singles' | 'doubles' | 'mixed'
  skill_level    TEXT NOT NULL,                        -- 'beginner' | 'intermediate' | 'advanced'
  city           TEXT,                                 -- for proximity discovery
  visibility     TEXT NOT NULL DEFAULT 'public',       -- 'public' | 'private'
  max_players    INTEGER NOT NULL DEFAULT 4,
  status         TEXT NOT NULL DEFAULT 'open',
  -- 'open' | 'full' | 'cancelled' | 'completed'
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE hosted_match_players (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hosted_match_id UUID NOT NULL REFERENCES hosted_matches(id) ON DELETE CASCADE,
  player_id       UUID NOT NULL REFERENCES players(id),
  joined_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(hosted_match_id, player_id)
);

CREATE INDEX idx_hosted_matches_city ON hosted_matches(city);
CREATE INDEX idx_hosted_matches_status ON hosted_matches(status);

-- ─────────────────────────────────────────────────────────────────
-- challenges: host invites multiple players for a challenge match
-- Host must have a booking. Host is solely responsible for the booking.
-- Challenge expires automatically when booking end time passes.
-- ─────────────────────────────────────────────────────────────────
CREATE TABLE challenges (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  host_player_id UUID NOT NULL REFERENCES players(id),
  booking_id     UUID NOT NULL REFERENCES bookings(id), -- host's booking
  match_format   TEXT NOT NULL,                        -- 'singles' | 'doubles' | 'mixed'
  description    TEXT,
  status         TEXT NOT NULL DEFAULT 'open',
  -- 'open' | 'cancelled' | 'expired'
  expires_at     TIMESTAMPTZ NOT NULL,                 -- = booking.date + booking.end_time
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE challenge_invitations (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_id        UUID NOT NULL REFERENCES challenges(id) ON DELETE CASCADE,
  invited_player_id   UUID NOT NULL REFERENCES players(id),
  status              TEXT NOT NULL DEFAULT 'pending',
  -- 'pending' | 'accepted' | 'declined'
  responded_at        TIMESTAMPTZ,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(challenge_id, invited_player_id)
);
```

---

## Phase 2 — 5. Rankings (Migration 017)

```sql
-- ─────────────────────────────────────────────────────────────────
-- ranked_players: created ONLY when a player registers a Player ID
-- Stores ranking statistics per skill level
-- ─────────────────────────────────────────────────────────────────
CREATE TABLE ranked_players (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id_ref        TEXT NOT NULL REFERENCES players(player_id), -- links to players.player_id
  skill_level          TEXT NOT NULL DEFAULT 'beginner',
  -- 'beginner' | 'intermediate' | 'open'
  total_points         NUMERIC(10,2) NOT NULL DEFAULT 0,
  current_rank         INTEGER,                         -- computed periodically
  highest_rank         INTEGER,
  titles_won           INTEGER NOT NULL DEFAULT 0,
  tournaments_played   INTEGER NOT NULL DEFAULT 0,
  wins                 INTEGER NOT NULL DEFAULT 0,
  losses               INTEGER NOT NULL DEFAULT 0,
  promoted_at          TIMESTAMPTZ,                     -- when they last crossed promotion threshold
  previous_skill_level TEXT,                            -- kept for display in history
  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(player_id_ref)
);

CREATE TABLE ranking_points_log (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ranked_player_id     UUID NOT NULL REFERENCES ranked_players(id),
  tournament_result_id UUID NOT NULL,                  -- references tournament_results.id (set in M23)
  points_awarded       NUMERIC(10,2) NOT NULL,
  skill_level_at_time  TEXT NOT NULL,                  -- skill level when points were awarded
  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

---

## Phase 2 — 6. Shop (Migration 018)

```sql
CREATE TABLE product_categories (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name       TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE products (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID REFERENCES product_categories(id),
  name        TEXT NOT NULL,
  description TEXT,
  images      TEXT[],                              -- Supabase Storage URLs
  price       INTEGER NOT NULL,                   -- paise
  stock       INTEGER NOT NULL DEFAULT 0,
  rating      NUMERIC(3,2),
  is_active   BOOLEAN NOT NULL DEFAULT TRUE,
  created_by  UUID NOT NULL REFERENCES auth.users(id),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE cart_items (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id  UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  quantity   INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(player_id, product_id)
);

CREATE TABLE shop_orders (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id         UUID NOT NULL REFERENCES players(id),
  total_amount      INTEGER NOT NULL,              -- paise
  payment_method    TEXT NOT NULL,                 -- 'wallet' | 'online'
  payment_status    TEXT NOT NULL DEFAULT 'pending',
  payment_reference TEXT,
  wallet_transaction_id UUID REFERENCES player_transactions(id),
  status            TEXT NOT NULL DEFAULT 'processing',
  -- 'processing' | 'delivered' | 'cancelled'
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE shop_order_items (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id   UUID NOT NULL REFERENCES shop_orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id),
  quantity   INTEGER NOT NULL,
  unit_price INTEGER NOT NULL,                     -- paise at time of purchase
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

---

## Phase 2 — 7. Public Tournament Listings (Migration 019)

```sql
-- Admin-created public tournament pages for discovery and player registration.
-- SEPARATE from the organizer dashboard system.
CREATE TABLE public_tournaments (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name                    TEXT NOT NULL,
  description             TEXT,
  organizer_name          TEXT NOT NULL,
  organizer_contact       TEXT NOT NULL,
  venue_name              TEXT NOT NULL,
  venue_location          TEXT NOT NULL,
  city                    TEXT,
  start_date              DATE NOT NULL,
  end_date                DATE NOT NULL,
  start_time              TIME,
  end_time                TIME,
  banner_url              TEXT,
  logo_url                TEXT,
  registration_open_date  DATE,
  registration_close_date DATE,
  estimated_teams         INTEGER,
  max_teams               INTEGER,
  status                  TEXT NOT NULL DEFAULT 'draft',
  -- 'draft' | 'published' | 'registration_open' | 'registration_closed' | 'completed' | 'cancelled'
  -- Optional link to organizer dashboard tournament (if organizer is also running it)
  linked_tournament_id    UUID,                    -- references tournaments.id when available
  created_by              UUID NOT NULL REFERENCES auth.users(id),
  created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_public_tournaments_status ON public_tournaments(status);
CREATE INDEX idx_public_tournaments_city ON public_tournaments(city);

CREATE TABLE public_tournament_categories (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  public_tournament_id UUID NOT NULL REFERENCES public_tournaments(id) ON DELETE CASCADE,
  category_name        TEXT NOT NULL,              -- 'Mens' | 'Womens' | 'Mixed' | 'Boys U15' | '40+' | 'Open' | 'Others'
  category_type        TEXT NOT NULL,              -- 'singles' | 'doubles'
  -- Display: category_name + " " + category_type = "Men's Singles", "Mixed Doubles"
  entry_fee            INTEGER NOT NULL,           -- paise per player (singles) or per team (doubles)
  registration_limit   INTEGER NOT NULL,
  registered_count     INTEGER NOT NULL DEFAULT 0,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public_tournament_registrations (
  id                        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  public_tournament_id      UUID NOT NULL REFERENCES public_tournaments(id),
  category_id               UUID NOT NULL REFERENCES public_tournament_categories(id),
  player_id                 UUID NOT NULL REFERENCES players(id),
  -- Doubles partner (optional)
  partner_name              TEXT,
  partner_player_id_ref     UUID REFERENCES players(id),
  -- Payment
  amount_paid               INTEGER NOT NULL,      -- paise
  payment_method            TEXT NOT NULL,         -- 'wallet' | 'online'
  payment_status            TEXT NOT NULL DEFAULT 'pending', -- 'pending' | 'paid' | 'refunded'
  payment_reference         TEXT,                  -- Razorpay payment ID
  refund_reference          TEXT,
  wallet_transaction_id     UUID REFERENCES player_transactions(id),
  status                    TEXT NOT NULL DEFAULT 'registered', -- 'registered' | 'cancelled'
  created_at                TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_public_tournament_registrations_player ON public_tournament_registrations(player_id);
```

---

## Phase 2 — 8. Tournament Organizer System (Migrations 020–021)

```sql
-- ─────────────────────────────────────────────────────────────────
-- tournament_organizer_accounts: persistent account per user
-- One account per user, reused for all their tournaments
-- ─────────────────────────────────────────────────────────────────
CREATE TABLE tournament_organizer_accounts (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id  UUID NOT NULL REFERENCES players(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(player_id)
);

-- ─────────────────────────────────────────────────────────────────
-- tournament_registrations: one per tournament application
-- Includes the pre-approval form, payment, and admin decision
-- ─────────────────────────────────────────────────────────────────
CREATE TABLE tournament_registrations (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organizer_account_id UUID NOT NULL REFERENCES tournament_organizer_accounts(id),
  -- Pre-approval form fields
  organizer_name       TEXT NOT NULL,
  mobile_number        TEXT NOT NULL,
  email                TEXT,
  organization_name    TEXT NOT NULL,
  tournament_name      TEXT NOT NULL,
  venue_name           TEXT NOT NULL,
  city                 TEXT NOT NULL,
  start_date           DATE NOT NULL,
  end_date             DATE NOT NULL,
  categories           TEXT[] NOT NULL,           -- e.g. ['mens_singles', 'mixed_doubles']
  estimated_participants TEXT,                    -- '1-25' | '26-50' | '51-100' | '100+'
  -- Payment
  registration_fee     INTEGER NOT NULL,          -- paise (₹400 × categories.length at time of payment)
  payment_status       TEXT NOT NULL DEFAULT 'pending', -- 'pending' | 'paid' | 'refunded'
  payment_reference    TEXT,                      -- Razorpay payment ID
  refund_reference     TEXT,
  -- Admin decision
  admin_status         TEXT NOT NULL DEFAULT 'pending', -- 'pending' | 'approved' | 'rejected'
  admin_notes          TEXT,                      -- rejection reason (admin-only visible)
  reviewed_by          UUID REFERENCES auth.users(id),
  reviewed_at          TIMESTAMPTZ,
  -- Access window (set on approval)
  access_granted_at    TIMESTAMPTZ,
  access_expires_at    TIMESTAMPTZ,               -- granted_at + system_config('organizer_access_days')
  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─────────────────────────────────────────────────────────────────
-- tournament_collaborators: added by organizer during registration
-- All get organizer+umpire access on admin approval (same approval event)
-- ─────────────────────────────────────────────────────────────────
CREATE TABLE tournament_collaborators (
  id                         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_registration_id UUID NOT NULL REFERENCES tournament_registrations(id) ON DELETE CASCADE,
  phone_number               TEXT NOT NULL,
  player_ref                 UUID REFERENCES players(id), -- resolved if they have an account
  name                       TEXT NOT NULL,
  status                     TEXT NOT NULL DEFAULT 'pending', -- 'pending' | 'approved' | 'rejected'
  approved_at                TIMESTAMPTZ,
  created_at                 TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─────────────────────────────────────────────────────────────────
-- tournaments: created after admin approval
-- The full tournament lifecycle lives here
-- ─────────────────────────────────────────────────────────────────
CREATE TABLE tournaments (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  registration_id      UUID NOT NULL REFERENCES tournament_registrations(id),
  organizer_account_id UUID NOT NULL REFERENCES tournament_organizer_accounts(id),
  name                 TEXT NOT NULL,
  venue_name           TEXT NOT NULL,
  venue_id             UUID REFERENCES venues(id),  -- linked if venue is in our system
  city                 TEXT NOT NULL,
  organizer_name       TEXT NOT NULL,
  organizer_contact    TEXT NOT NULL,
  start_date           DATE NOT NULL,
  end_date             DATE NOT NULL,
  start_time           TIME,
  end_time             TIME,
  tournament_reach     TEXT NOT NULL DEFAULT 'intra_club',
  -- 'intra_club' | 'inter_club' | 'city_wide'
  status               TEXT NOT NULL DEFAULT 'setup',
  -- 'setup' | 'registration_open' | 'live' | 'completed'
  is_public            BOOLEAN NOT NULL DEFAULT TRUE,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─────────────────────────────────────────────────────────────────
-- tournament_categories: one row per category within a tournament
-- Each category is configured independently (format, courts, rules)
-- ─────────────────────────────────────────────────────────────────
CREATE TABLE tournament_categories (
  id                        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id             UUID NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
  category_name             TEXT NOT NULL,    -- 'Mens' | 'Womens' | 'Mixed' | 'Boys U15' | '40+' | 'Open' | 'Others'
  category_type             TEXT NOT NULL,    -- 'singles' | 'doubles'
  -- Display: category_name + " " + category_type = "Men's Singles", "Mixed Doubles"
  -- Format (derived from pools + ko_starting_round answers in questionnaire)
  -- pools=0 → Direct KO; pools>0 + ko_starting_round=null → Round Robin; both set → League+KO
  tournament_format         TEXT NOT NULL,    -- 'round_robin' | 'direct_knockout' | 'round_robin_knockout'
  num_courts                INTEGER NOT NULL DEFAULT 1,
  num_teams                 INTEGER,
  num_seeded_teams          INTEGER DEFAULT 0,
  -- Round Robin config
  num_pools                 INTEGER,          -- null if Direct Knockout
  auto_generate_pools       BOOLEAN DEFAULT TRUE,
  teams_qualifying_per_pool INTEGER,
  -- Knockout config
  ko_starting_round         TEXT,             -- null if pure Round Robin
  -- 'prelim' | 'r128' | 'r64' | 'r32' | 'r16' | 'qf' | 'sf' | 'final'
  -- Match rules — TEMPLATE values copied into tournament_matches on fixture generation
  -- Round Robin phase rules
  rr_best_of                INTEGER DEFAULT 1,
  rr_points_per_game        INTEGER DEFAULT 21,
  rr_deuce                  BOOLEAN DEFAULT FALSE,
  rr_mid_game_interval      BOOLEAN DEFAULT FALSE,
  -- Knockout phase rules
  ko_best_of                INTEGER DEFAULT 1,
  ko_points_per_game        INTEGER DEFAULT 21,
  ko_deuce                  BOOLEAN DEFAULT FALSE,
  ko_mid_game_interval      BOOLEAN DEFAULT FALSE,
  -- Final rules
  final_best_of             INTEGER DEFAULT 1,
  final_points_per_game     INTEGER DEFAULT 21,
  final_deuce               BOOLEAN DEFAULT FALSE,
  final_mid_game_interval   BOOLEAN DEFAULT FALSE,
  -- Classification
  skill_level               TEXT NOT NULL DEFAULT 'open', -- 'beginner' | 'intermediate' | 'open'
  tournament_reach          TEXT NOT NULL DEFAULT 'intra_club',
  -- Status
  status                    TEXT NOT NULL DEFAULT 'setup',
  -- 'setup' | 'entry' | 'pools_generated' | 'league' | 'knockout' | 'completed'
  created_at                TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at                TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─────────────────────────────────────────────────────────────────
-- tournament_entries: player/team registrations per category
-- ─────────────────────────────────────────────────────────────────
CREATE TABLE tournament_entries (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id         UUID NOT NULL REFERENCES tournament_categories(id) ON DELETE CASCADE,
  -- Player 1
  player1_name        TEXT NOT NULL,
  player1_id          TEXT,                       -- ShuttleHub Player ID (null for guests)
  player1_player_ref  UUID REFERENCES players(id),
  -- Player 2 (doubles only)
  player2_name        TEXT,
  player2_id          TEXT,
  player2_player_ref  UUID REFERENCES players(id),
  -- Entry metadata
  is_guest_entry      BOOLEAN NOT NULL DEFAULT FALSE, -- true if no ShuttleHub account
  is_seeded           BOOLEAN NOT NULL DEFAULT FALSE,
  seed_number         INTEGER,
  entry_source        TEXT NOT NULL DEFAULT 'manual', -- 'manual' | 'player_id_search' | 'file_import'
  pool_id             UUID,                       -- references tournament_pools.id (set on pool generation)
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_tournament_entries_category ON tournament_entries(category_id);
CREATE INDEX idx_tournament_entries_player1_id ON tournament_entries(player1_id);

-- ─────────────────────────────────────────────────────────────────
-- tournament_pools: pool groups within a category (Round Robin / League)
-- ─────────────────────────────────────────────────────────────────
CREATE TABLE tournament_pools (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id  UUID NOT NULL REFERENCES tournament_categories(id) ON DELETE CASCADE,
  pool_name    TEXT NOT NULL,                     -- 'Pool A', 'Pool B', etc.
  pool_order   INTEGER NOT NULL DEFAULT 0,
  is_complete  BOOLEAN NOT NULL DEFAULT FALSE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─────────────────────────────────────────────────────────────────
-- tournament_matches: all matches (league + knockout)
-- Match rules here are EFFECTIVE values (copied from category template + umpire overrides)
-- ─────────────────────────────────────────────────────────────────
CREATE TABLE tournament_matches (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id     UUID NOT NULL REFERENCES tournament_categories(id) ON DELETE CASCADE,
  pool_id         UUID REFERENCES tournament_pools(id), -- null for knockout matches
  match_number    TEXT NOT NULL,                   -- 'M1', 'M42', etc.
  round_name      TEXT NOT NULL,
  -- 'league' | 'prelim' | 'r128' | 'r64' | 'r32' | 'r16' | 'qf' | 'sf' | 'final'
  court_number    INTEGER,
  -- Teams
  entry_a_id      UUID REFERENCES tournament_entries(id),
  entry_b_id      UUID REFERENCES tournament_entries(id),
  -- Schedule
  scheduled_time  TIME,
  scheduled_date  DATE,
  order_of_play   INTEGER,
  -- Effective match rules (copied from category template, umpire-editable)
  best_of         INTEGER NOT NULL DEFAULT 1,
  points_per_game INTEGER NOT NULL DEFAULT 21,
  deuce           BOOLEAN NOT NULL DEFAULT FALSE,
  mid_game_interval BOOLEAN NOT NULL DEFAULT FALSE,
  -- Result
  winner_entry_id UUID REFERENCES tournament_entries(id),
  scores          JSONB,                           -- [{"a":21,"b":17},{"a":18,"b":21},{"a":21,"b":14}]
  match_duration_mins INTEGER,
  -- Status
  status          TEXT NOT NULL DEFAULT 'scheduled',
  -- 'scheduled' | 'live' | 'completed'
  -- Umpire tracking
  umpire_player_id UUID REFERENCES players(id),   -- collaborator who ran this match
  -- Display settings (organizer-controlled)
  show_match_time     BOOLEAN NOT NULL DEFAULT TRUE,
  show_court_number   BOOLEAN NOT NULL DEFAULT TRUE,
  show_order_of_play  BOOLEAN NOT NULL DEFAULT TRUE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_tournament_matches_category ON tournament_matches(category_id);
CREATE INDEX idx_tournament_matches_status ON tournament_matches(status);
```

---

## Phase 2 — 9. Umpire & Results (Migration 023)

```sql
-- ─────────────────────────────────────────────────────────────────
-- match_events: full point-by-point event log for live scoring
-- Streamed via Supabase Realtime (wss) to organizer dashboard + public Live tab
-- ─────────────────────────────────────────────────────────────────
CREATE TABLE match_events (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id        UUID NOT NULL REFERENCES tournament_matches(id) ON DELETE CASCADE,
  event_type      TEXT NOT NULL,
  -- 'point_a' | 'point_b' | 'undo' | 'timeout_injury'
  -- | 'card_yellow' | 'card_red' | 'pause' | 'resume'
  -- | 'game_complete' | 'match_complete' | 'end_change' | 'note'
  game_number     INTEGER,
  score_a         INTEGER,                        -- score after this event
  score_b         INTEGER,
  server_player   TEXT,                           -- player name (for display)
  receiver_player TEXT,
  note            TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_match_events_match ON match_events(match_id);

-- ─────────────────────────────────────────────────────────────────
-- tournament_results: final standings per category
-- Populated when organizer taps "Finish Tournament"
-- ─────────────────────────────────────────────────────────────────
CREATE TABLE tournament_results (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id      UUID NOT NULL REFERENCES tournament_categories(id),
  entry_id         UUID NOT NULL REFERENCES tournament_entries(id),
  finish_position  INTEGER NOT NULL,              -- 1=champion, 2=runner-up, 3=SF, etc.
  ranking_points   NUMERIC(10,2) NOT NULL DEFAULT 0, -- computed by Edge Function
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(category_id, entry_id)
);
```

---

## Phase 2 — 10. Storage Buckets (Phase 2 additions)

| Bucket | Content | Access |
|---|---|---|
| `player-photos` | Player profile photos | Authenticated read/write |
| `tournament-banners` | Admin-uploaded tournament banners/logos | Public read, authenticated write |
| `coach-photos` | Coach profile photos | Public read, authenticated write |
| `product-images` | Shop product images | Public read, authenticated write |
| `tournament-imports` | Temp storage for CSV/Excel/JSON team imports | Authenticated only, auto-deleted after processing |

---

## Phase 2 — RLS Policies (Migration 022)

```sql
-- Players: each player sees only their own row; public data readable by all players
CREATE POLICY "Players can read own data" ON players FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Players can update own data" ON players FOR UPDATE USING (auth.uid() = id);

-- Super admin has full access to all Phase 2 tables (standard super_admin policy pattern)

-- player_wallets: player reads own; admin writes
CREATE POLICY "Players read own wallet" ON player_wallets FOR SELECT USING (
  player_id = auth.uid() OR
  EXISTS (SELECT 1 FROM owners WHERE id = auth.uid() AND role = 'super_admin')
);

-- tournament_matches + match_events: publicly readable (for Live tab), writes by organizer/collaborator
CREATE POLICY "Public can read matches" ON tournament_matches FOR SELECT USING (true);
CREATE POLICY "Public can read events" ON match_events FOR SELECT USING (true);

-- public_tournaments: published tournaments readable by all
CREATE POLICY "Published tournaments are public" ON public_tournaments
  FOR SELECT USING (status NOT IN ('draft', 'cancelled'));
```

---

## Phase 2 — Migration Plan Summary

| Migration | Contents |
|---|---|
| 014 | `players`, `player_wallets`, `player_transactions`, `system_config` |
| 015 | `coaches`, `player_booking_payments` |
| 016 | `hosted_matches`, `hosted_match_players`, `challenges`, `challenge_invitations` |
| 017 | `ranked_players`, `ranking_points_log` |
| 018 | `product_categories`, `products`, `cart_items`, `shop_orders`, `shop_order_items` |
| 019 | `public_tournaments`, `public_tournament_categories`, `public_tournament_registrations` |
| 020 | `tournament_organizer_accounts`, `tournament_registrations`, `tournament_collaborators` |
| 021 | `tournaments`, `tournament_categories`, `tournament_entries`, `tournament_pools`, `tournament_matches` |
| 022 | All Phase 2 RLS policies |
| 023 | `match_events`, `tournament_results` |