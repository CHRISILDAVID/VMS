-- ═══════════════════════════════════════════════════════════════
-- Migration 001: Core Schema — Enums, Owners, Venues, Courts
-- Badminton Manager (VMS)
-- ═══════════════════════════════════════════════════════════════

-- ─── ENUMS ────────────────────────────────────────────────────

CREATE TYPE user_role AS ENUM ('super_admin', 'owner');
CREATE TYPE booking_status AS ENUM ('upcoming', 'ongoing', 'completed', 'cancelled');
CREATE TYPE booking_payment_status AS ENUM ('pending', 'partial', 'paid', 'refunded', 'cancelled');
CREATE TYPE slot_type AS ENUM ('available', 'booked', 'coaching', 'tournament', 'blocked', 'membership');
CREATE TYPE booking_source AS ENUM ('online', 'offline', 'walk_in', 'membership');
CREATE TYPE court_type AS ENUM ('wooden', 'synthetic', 'cement', 'mat');
CREATE TYPE membership_pay_status AS ENUM ('paid', 'due', 'overdue');
CREATE TYPE skill_level AS ENUM ('beginner', 'intermediate', 'advanced', 'recreational');
CREATE TYPE application_status AS ENUM ('pending', 'accepted', 'rejected', 'invited_guest');
CREATE TYPE guest_play_status AS ENUM ('upcoming', 'completed', 'accepted_member', 'rejected');
CREATE TYPE payment_mode AS ENUM ('cash', 'upi', 'google_pay', 'phonepe', 'bank_transfer', 'cheque', 'card', 'online');
CREATE TYPE subscription_plan AS ENUM ('free', 'pro', 'enterprise');
CREATE TYPE invoice_status AS ENUM ('paid', 'pending', 'failed', 'refunded');
CREATE TYPE day_of_week AS ENUM ('mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun');

-- ─── OWNERS ───────────────────────────────────────────────────

CREATE TABLE owners (
  id            UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name     TEXT NOT NULL,
  phone         TEXT NOT NULL UNIQUE,
  email         TEXT,
  avatar_url    TEXT,
  business_name TEXT NOT NULL,
  role          user_role NOT NULL DEFAULT 'owner',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at    TIMESTAMPTZ
);

CREATE INDEX idx_owners_phone ON owners(phone);

-- ─── VENUES ───────────────────────────────────────────────────

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
  amenities       TEXT[] DEFAULT '{}',
  photos          TEXT[] DEFAULT '{}',
  gstin           TEXT,
  gst_enabled     BOOLEAN NOT NULL DEFAULT FALSE,
  is_active       BOOLEAN NOT NULL DEFAULT TRUE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at      TIMESTAMPTZ
);

CREATE INDEX idx_venues_owner ON venues(owner_id);

-- ─── COURTS ───────────────────────────────────────────────────

CREATE TABLE courts (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  venue_id    UUID NOT NULL REFERENCES venues(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  court_type  court_type,
  sort_order  INTEGER NOT NULL DEFAULT 0,
  is_active   BOOLEAN NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at  TIMESTAMPTZ
);

CREATE INDEX idx_courts_venue ON courts(venue_id);

-- ─── AUTO-UPDATE TIMESTAMPS ──────────────────────────────────

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_owners_updated_at
  BEFORE UPDATE ON owners
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER set_venues_updated_at
  BEFORE UPDATE ON venues
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER set_courts_updated_at
  BEFORE UPDATE ON courts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ─── ROW LEVEL SECURITY ──────────────────────────────────────

ALTER TABLE owners ENABLE ROW LEVEL SECURITY;
ALTER TABLE venues ENABLE ROW LEVEL SECURITY;
ALTER TABLE courts ENABLE ROW LEVEL SECURITY;

-- Function to check super_admin without recursion
CREATE OR REPLACE FUNCTION is_super_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.owners WHERE id = auth.uid() AND role = 'super_admin'
  );
END;
$$;

-- Super-admin: full access to all tables
CREATE POLICY "Super-admin full access on owners" ON owners
  FOR ALL USING (is_super_admin());

CREATE POLICY "Super-admin full access on venues" ON venues
  FOR ALL USING (is_super_admin());

CREATE POLICY "Super-admin full access on courts" ON courts
  FOR ALL USING (is_super_admin());

-- Owners: see/edit own data
CREATE POLICY "Owners see own record" ON owners
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Owners update own record" ON owners
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Owners insert own record" ON owners
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Owners: see/manage own venues
CREATE POLICY "Owners see own venues" ON venues
  FOR SELECT USING (owner_id = auth.uid());

CREATE POLICY "Owners update own venues" ON venues
  FOR UPDATE USING (owner_id = auth.uid());

-- Owners: see/manage courts in own venues
CREATE POLICY "Owners see own courts" ON courts
  FOR SELECT USING (
    venue_id IN (SELECT id FROM venues WHERE owner_id = auth.uid())
  );

CREATE POLICY "Owners manage own courts" ON courts
  FOR ALL USING (
    venue_id IN (SELECT id FROM venues WHERE owner_id = auth.uid())
  );
