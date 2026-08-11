-- ═══════════════════════════════════════════════════════════════
-- Migration 014: Phase 2 — Core Player Tables
-- ShuttleHub Player App foundation schema
-- ═══════════════════════════════════════════════════════════════

-- ─────────────────────────────────────────────────────────────────
-- PLAYERS: all ShuttleHub Player App users
-- Extends auth.users (same Supabase project, separate from owners)
-- ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS players (
  id                    UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name             TEXT NOT NULL,
  phone                 TEXT NOT NULL UNIQUE,
  email                 TEXT,
  avatar_url            TEXT,
  city                  TEXT,
  date_of_birth         DATE,
  -- Player ID (registered separately via Rankings tab → Register Player ID)
  player_id             TEXT UNIQUE,                    -- 'SH' + 5 alphanumeric, e.g. 'SH7X3K9'
  player_id_verified    BOOLEAN NOT NULL DEFAULT FALSE,
  player_id_doc_type    TEXT,                           -- 'aadhaar' | 'passport' | 'driving_licence' (name only)
  player_id_verified_at TIMESTAMPTZ,
  -- Customer soft-link (matched by phone at registration, read-only)
  linked_customer_id    UUID REFERENCES customers(id),
  -- App preferences
  fcm_token             TEXT,                           -- Player app FCM token (separate from owner app)
  theme_preference      TEXT NOT NULL DEFAULT 'system', -- 'light' | 'dark' | 'system'
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at            TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_players_phone ON players(phone);
CREATE INDEX IF NOT EXISTS idx_players_player_id ON players(player_id);

-- Auto-update updated_at on players
CREATE OR REPLACE FUNCTION update_players_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER players_updated_at
  BEFORE UPDATE ON players
  FOR EACH ROW EXECUTE FUNCTION update_players_updated_at();

-- ─────────────────────────────────────────────────────────────────
-- SYSTEM_CONFIG: admin-configurable key-value settings
-- ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS system_config (
  key        TEXT PRIMARY KEY,
  value      TEXT NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Seed default system config values
INSERT INTO system_config (key, value) VALUES
  ('organizer_access_days', '2'),
  ('organizer_fee_per_category', '40000'),             -- paise (₹400)
  ('ranking_promotion_beginner_threshold', '1000'),
  ('ranking_promotion_intermediate_threshold', '3000')
ON CONFLICT (key) DO NOTHING;

-- ─────────────────────────────────────────────────────────────────
-- PLAYER_WALLETS: one wallet per player (auto-created on registration)
-- balance stored in paise (₹1 = 100 paise)
-- ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS player_wallets (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id  UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  balance    INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(player_id)
);

-- ─────────────────────────────────────────────────────────────────
-- PLAYER_TRANSACTIONS: wallet credit/debit ledger
-- ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS player_transactions (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_id         UUID NOT NULL REFERENCES player_wallets(id),
  amount            INTEGER NOT NULL,              -- positive=credit, negative=debit (paise)
  type              TEXT NOT NULL CHECK (type IN ('credit', 'debit')),
  reason            TEXT NOT NULL,
  -- 'admin_topup' | 'court_booking' | 'tournament_entry' | 'shop_purchase' | 'refund'
  reference_id      UUID,                          -- FK to relevant entity (bookings, shop_orders, etc.)
  reference_table   TEXT,                          -- 'bookings' | 'public_tournament_registrations' | 'shop_orders'
  credited_by       UUID REFERENCES auth.users(id), -- admin who topped up (null for auto debits)
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_player_transactions_wallet ON player_transactions(wallet_id);
CREATE INDEX IF NOT EXISTS idx_player_transactions_created_at ON player_transactions(created_at DESC);

-- ═══════════════════════════════════════════════════════════════
-- RLS POLICIES
-- ═══════════════════════════════════════════════════════════════

-- Enable RLS on all Phase 2 tables
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE player_wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE player_transactions ENABLE ROW LEVEL SECURITY;

-- ─── players ───────────────────────────────────────────────────
-- Players can only read/write their own profile
CREATE POLICY "players_select_own"
  ON players FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "players_insert_own"
  ON players FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "players_update_own"
  ON players FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Super admins can read all players
CREATE POLICY "players_select_super_admin"
  ON players FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM owners
      WHERE owners.id = auth.uid() AND owners.role = 'super_admin'
    )
  );

-- ─── system_config ─────────────────────────────────────────────
-- Readable by all authenticated users (needed by player app at payment time)
CREATE POLICY "system_config_select_authenticated"
  ON system_config FOR SELECT
  TO authenticated
  USING (true);

-- Only super admins can modify system_config
CREATE POLICY "system_config_modify_super_admin"
  ON system_config FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM owners
      WHERE owners.id = auth.uid() AND owners.role = 'super_admin'
    )
  );

-- ─── player_wallets ────────────────────────────────────────────
-- Players can only view their own wallet balance
CREATE POLICY "player_wallets_select_own"
  ON player_wallets FOR SELECT
  USING (
    player_id = auth.uid()
  );

-- Super admins can read and credit wallets
CREATE POLICY "player_wallets_all_super_admin"
  ON player_wallets FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM owners
      WHERE owners.id = auth.uid() AND owners.role = 'super_admin'
    )
  );

-- Internal: allow insert of wallet on player creation (via service role)
CREATE POLICY "player_wallets_insert_own"
  ON player_wallets FOR INSERT
  WITH CHECK (player_id = auth.uid());

-- ─── player_transactions ───────────────────────────────────────
-- Players can view their own transaction history
CREATE POLICY "player_transactions_select_own"
  ON player_transactions FOR SELECT
  USING (
    wallet_id IN (
      SELECT id FROM player_wallets WHERE player_id = auth.uid()
    )
  );

-- Super admins can read all transactions
CREATE POLICY "player_transactions_select_super_admin"
  ON player_transactions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM owners
      WHERE owners.id = auth.uid() AND owners.role = 'super_admin'
    )
  );

-- Allow insert (debit/credit) by the player themselves or by admin
CREATE POLICY "player_transactions_insert_own_or_admin"
  ON player_transactions FOR INSERT
  WITH CHECK (
    wallet_id IN (SELECT id FROM player_wallets WHERE player_id = auth.uid())
    OR EXISTS (
      SELECT 1 FROM owners
      WHERE owners.id = auth.uid() AND owners.role = 'super_admin'
    )
  );
