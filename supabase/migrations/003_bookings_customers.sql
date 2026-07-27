-- ═══════════════════════════════════════════════════════════════
-- Migration 003: Customers & Bookings
-- Badminton Manager (VMS)
-- ═══════════════════════════════════════════════════════════════

-- ─── CUSTOMERS ─────────────────────────────────────────────────

CREATE TABLE customers (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id      UUID NOT NULL REFERENCES owners(id) ON DELETE CASCADE,
  user_id       UUID REFERENCES auth.users(id),  -- linked if player has an account (future)
  full_name     TEXT NOT NULL,
  phone         TEXT NOT NULL,
  email         TEXT,
  notes         TEXT,
  total_visits  INTEGER NOT NULL DEFAULT 0,
  total_spent   INTEGER NOT NULL DEFAULT 0,       -- in smallest currency unit (paise)
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at    TIMESTAMPTZ,

  UNIQUE(owner_id, phone)
);

CREATE INDEX idx_customers_owner_phone ON customers(owner_id, phone);
CREATE INDEX idx_customers_name ON customers(full_name);

CREATE TRIGGER set_customers_updated_at
  BEFORE UPDATE ON customers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ─── BOOKINGS ──────────────────────────────────────────────────

CREATE TABLE bookings (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_number  TEXT NOT NULL UNIQUE,           -- human-readable ID (e.g., BK-20260726-1001)
  venue_id        UUID NOT NULL REFERENCES venues(id) ON DELETE CASCADE,
  court_id        UUID NOT NULL REFERENCES courts(id) ON DELETE CASCADE,
  customer_id     UUID NOT NULL REFERENCES customers(id) ON DELETE RESTRICT,
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
  is_force_booked BOOLEAN NOT NULL DEFAULT FALSE, -- owner override on blocked slot
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
CREATE INDEX idx_bookings_payment_status ON bookings(payment_status);
CREATE INDEX idx_bookings_booking_number ON bookings(booking_number);

CREATE TRIGGER set_bookings_updated_at
  BEFORE UPDATE ON bookings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ─── ROW LEVEL SECURITY ──────────────────────────────────────

ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- Super-admin policies
CREATE POLICY "Super-admin full access on customers" ON customers
  FOR ALL USING (is_super_admin());

CREATE POLICY "Super-admin full access on bookings" ON bookings
  FOR ALL USING (is_super_admin());

-- Owner policies for customers
CREATE POLICY "Owners see own customers" ON customers
  FOR SELECT USING (owner_id = auth.uid());

CREATE POLICY "Owners insert own customers" ON customers
  FOR INSERT WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Owners update own customers" ON customers
  FOR UPDATE USING (owner_id = auth.uid());

CREATE POLICY "Owners delete own customers" ON customers
  FOR DELETE USING (owner_id = auth.uid());

-- Owner policies for bookings
CREATE POLICY "Owners see own venue bookings" ON bookings
  FOR SELECT USING (
    venue_id IN (SELECT id FROM venues WHERE owner_id = auth.uid())
    OR booked_by = auth.uid()
  );

CREATE POLICY "Owners insert own venue bookings" ON bookings
  FOR INSERT WITH CHECK (
    venue_id IN (SELECT id FROM venues WHERE owner_id = auth.uid())
    OR booked_by = auth.uid()
  );

CREATE POLICY "Owners update own venue bookings" ON bookings
  FOR UPDATE USING (
    venue_id IN (SELECT id FROM venues WHERE owner_id = auth.uid())
    OR booked_by = auth.uid()
  );

CREATE POLICY "Owners delete own venue bookings" ON bookings
  FOR DELETE USING (
    venue_id IN (SELECT id FROM venues WHERE owner_id = auth.uid())
    OR booked_by = auth.uid()
  );
