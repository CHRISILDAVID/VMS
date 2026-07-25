-- ═══════════════════════════════════════════════════════════════
-- Migration 002: Operating Schedules & Pricing Blocks
-- Badminton Manager (VMS)
-- ═══════════════════════════════════════════════════════════════

-- ─── OPERATING SCHEDULES ───────────────────────────────────────

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

CREATE TRIGGER set_schedules_updated_at
  BEFORE UPDATE ON operating_schedules
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ─── PRICING BLOCKS ────────────────────────────────────────────

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

CREATE TRIGGER set_pricing_updated_at
  BEFORE UPDATE ON pricing_blocks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ─── ROW LEVEL SECURITY ──────────────────────────────────────

ALTER TABLE operating_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE pricing_blocks ENABLE ROW LEVEL SECURITY;

-- Super-admin policies
CREATE POLICY "Super-admin full access on operating_schedules" ON operating_schedules
  FOR ALL USING (
    EXISTS (SELECT 1 FROM owners o WHERE o.id = auth.uid() AND o.role = 'super_admin')
  );

CREATE POLICY "Super-admin full access on pricing_blocks" ON pricing_blocks
  FOR ALL USING (
    EXISTS (SELECT 1 FROM owners o WHERE o.id = auth.uid() AND o.role = 'super_admin')
  );

-- Owner policies
CREATE POLICY "Owners manage own venue schedules" ON operating_schedules
  FOR ALL USING (
    venue_id IN (SELECT id FROM venues WHERE owner_id = auth.uid())
  );

CREATE POLICY "Owners manage own venue pricing" ON pricing_blocks
  FOR ALL USING (
    schedule_id IN (
      SELECT id FROM operating_schedules WHERE venue_id IN (
        SELECT id FROM venues WHERE owner_id = auth.uid()
      )
    )
  );
