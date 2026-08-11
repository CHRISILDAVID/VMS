-- ═══════════════════════════════════════════════════════════════
-- Migration 015: Coaches & Player Booking Payments
-- ShuttleHub Player App — M11 additions
-- ═══════════════════════════════════════════════════════════════

-- ─────────────────────────────────────────────────────────────────
-- COACHES: admin-created coach profiles
-- Coaches can be assigned to a venue/academy.
-- Readable by all authenticated users (for the Train sub-tab).
-- ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS coaches (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  venue_id          UUID REFERENCES venues(id) ON DELETE SET NULL,  -- nullable: coach may not be tied to one venue
  full_name         TEXT NOT NULL,
  photo_url         TEXT,
  specialty         TEXT[] DEFAULT '{}',                             -- e.g. ['footwork', 'smash', 'defense']
  bio               TEXT,
  price_per_session INTEGER NOT NULL DEFAULT 0,                     -- paise per session
  is_active         BOOLEAN NOT NULL DEFAULT TRUE,
  created_by        UUID NOT NULL REFERENCES auth.users(id),        -- super_admin who created
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_coaches_venue ON coaches(venue_id);
CREATE INDEX IF NOT EXISTS idx_coaches_active ON coaches(is_active);

CREATE OR REPLACE FUNCTION update_coaches_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER coaches_updated_at
  BEFORE UPDATE ON coaches
  FOR EACH ROW EXECUTE FUNCTION update_coaches_updated_at();

-- ─────────────────────────────────────────────────────────────────
-- PLAYER_BOOKING_PAYMENTS: payment record for online court bookings
-- The booking itself lives in the existing `bookings` table (source='online').
-- This table tracks HOW the player paid.
-- ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS player_booking_payments (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id            UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  player_id             UUID NOT NULL REFERENCES players(id),
  amount                INTEGER NOT NULL,                            -- paise
  payment_method        TEXT NOT NULL CHECK (payment_method IN ('wallet', 'online', 'pay_at_court')),
  payment_status        TEXT NOT NULL DEFAULT 'pending'
                          CHECK (payment_status IN ('pending', 'paid', 'refunded', 'failed')),
  razorpay_order_id     TEXT,                                        -- Razorpay order ID
  razorpay_payment_id   TEXT,                                        -- Razorpay payment ID (after success)
  razorpay_signature    TEXT,                                        -- verified signature
  refund_reference      TEXT,                                        -- Razorpay refund ID
  wallet_transaction_id UUID REFERENCES player_transactions(id),    -- FK to debit transaction if wallet
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pbp_booking ON player_booking_payments(booking_id);
CREATE INDEX IF NOT EXISTS idx_pbp_player ON player_booking_payments(player_id);
CREATE INDEX IF NOT EXISTS idx_pbp_status ON player_booking_payments(payment_status);

CREATE OR REPLACE FUNCTION update_pbp_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER pbp_updated_at
  BEFORE UPDATE ON player_booking_payments
  FOR EACH ROW EXECUTE FUNCTION update_pbp_updated_at();

-- ═══════════════════════════════════════════════════════════════
-- RLS POLICIES
-- ═══════════════════════════════════════════════════════════════

ALTER TABLE coaches ENABLE ROW LEVEL SECURITY;
ALTER TABLE player_booking_payments ENABLE ROW LEVEL SECURITY;

-- ─── coaches ────────────────────────────────────────────────────
-- All authenticated users can read active coaches (needed by player app Train tab)
CREATE POLICY "coaches_select_authenticated"
  ON coaches FOR SELECT
  TO authenticated
  USING (is_active = TRUE);

-- Super admins can do everything (CRUD)
CREATE POLICY "coaches_all_super_admin"
  ON coaches FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM owners
      WHERE owners.id = auth.uid() AND owners.role = 'super_admin'
    )
  );

-- ─── player_booking_payments ─────────────────────────────────────
-- Players can view their own payment records
CREATE POLICY "pbp_select_own"
  ON player_booking_payments FOR SELECT
  USING (player_id = auth.uid());

-- Players can insert their own payment records (wallet/pay_at_court)
CREATE POLICY "pbp_insert_own"
  ON player_booking_payments FOR INSERT
  WITH CHECK (player_id = auth.uid());

-- Players can update their own pending payments
CREATE POLICY "pbp_update_own"
  ON player_booking_payments FOR UPDATE
  USING (player_id = auth.uid())
  WITH CHECK (player_id = auth.uid());

-- Super admins: full access
CREATE POLICY "pbp_all_super_admin"
  ON player_booking_payments FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM owners
      WHERE owners.id = auth.uid() AND owners.role = 'super_admin'
    )
  );
