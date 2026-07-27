-- ═══════════════════════════════════════════════════════════════
-- Migration 004: Membership Management
-- Badminton Manager (VMS)
-- ═══════════════════════════════════════════════════════════════

-- ─── 1. MEMBERSHIP SLOTS ───────────────────────────────────────

CREATE TABLE membership_slots (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  venue_id        UUID NOT NULL REFERENCES venues(id) ON DELETE CASCADE,
  name            TEXT NOT NULL,
  playing_days    day_of_week[] NOT NULL,
  start_time      TIME NOT NULL,
  end_time        TIME NOT NULL,
  skill_level     skill_level NOT NULL DEFAULT 'intermediate',
  monthly_fee     INTEGER NOT NULL,               -- in smallest currency unit (paise)
  capacity        INTEGER NOT NULL,
  guest_play_fee  INTEGER NOT NULL DEFAULT 0,     -- in smallest currency unit (paise)
  allow_guest_play BOOLEAN NOT NULL DEFAULT FALSE,
  billing_day     INTEGER NOT NULL DEFAULT 1,     -- day of month (1-28)
  is_published    BOOLEAN NOT NULL DEFAULT FALSE,
  is_recruiting   BOOLEAN NOT NULL DEFAULT TRUE,
  court_id        UUID REFERENCES courts(id) ON DELETE SET NULL, -- NULL = any court at venue
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at      TIMESTAMPTZ,

  CONSTRAINT valid_membership_time CHECK (end_time > start_time),
  CONSTRAINT valid_capacity CHECK (capacity > 0)
);

CREATE INDEX idx_membership_slots_venue ON membership_slots(venue_id);
CREATE INDEX idx_membership_slots_court ON membership_slots(court_id);
CREATE INDEX idx_membership_slots_active ON membership_slots(venue_id) WHERE deleted_at IS NULL;

CREATE TRIGGER set_membership_slots_updated_at
  BEFORE UPDATE ON membership_slots
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ─── 2. MEMBERSHIP SLOT RELEASES ───────────────────────────────
-- Tracks when an owner releases a membership slot for a specific date, making it available for regular bookings.

CREATE TABLE membership_slot_releases (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slot_id         UUID NOT NULL REFERENCES membership_slots(id) ON DELETE CASCADE,
  release_date    DATE NOT NULL,
  released_by     UUID NOT NULL REFERENCES auth.users(id),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE(slot_id, release_date)
);

CREATE INDEX idx_membership_slot_releases_slot_date ON membership_slot_releases(slot_id, release_date);

-- ─── 3. MEMBERS ────────────────────────────────────────────────
-- Join table connecting customers to membership slots.

CREATE TABLE members (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slot_id         UUID NOT NULL REFERENCES membership_slots(id) ON DELETE CASCADE,
  customer_id     UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  is_active       BOOLEAN NOT NULL DEFAULT TRUE,
  join_date       DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at      TIMESTAMPTZ,

  UNIQUE(slot_id, customer_id)
);

CREATE INDEX idx_members_slot ON members(slot_id);
CREATE INDEX idx_members_customer ON members(customer_id);

CREATE TRIGGER set_members_updated_at
  BEFORE UPDATE ON members
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ─── 4. MEMBERSHIP APPLICATIONS ────────────────────────────────

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

CREATE TRIGGER set_membership_applications_updated_at
  BEFORE UPDATE ON membership_applications
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ─── 5. GUEST PLAYS ────────────────────────────────────────────

CREATE TABLE guest_plays (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slot_id         UUID NOT NULL REFERENCES membership_slots(id) ON DELETE CASCADE,
  application_id  UUID REFERENCES membership_applications(id) ON DELETE SET NULL,
  player_name     TEXT NOT NULL,
  phone           TEXT NOT NULL,
  scheduled_date  DATE NOT NULL,
  status          guest_play_status NOT NULL DEFAULT 'upcoming',
  notes           TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_guest_plays_slot ON guest_plays(slot_id);
CREATE INDEX idx_guest_plays_date ON guest_plays(scheduled_date);
CREATE INDEX idx_guest_plays_status ON guest_plays(status);

CREATE TRIGGER set_guest_plays_updated_at
  BEFORE UPDATE ON guest_plays
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ─── 6. CAPACITY ENFORCEMENT TRIGGER ───────────────────────────
-- Prevents adding or activating a member if the slot has reached its capacity limit.

CREATE OR REPLACE FUNCTION check_membership_capacity()
RETURNS TRIGGER AS $$
DECLARE
  slot_capacity INTEGER;
  active_count INTEGER;
BEGIN
  -- Only check if member is active and not soft-deleted
  IF NEW.is_active = true AND NEW.deleted_at IS NULL THEN
    SELECT capacity INTO slot_capacity
    FROM membership_slots
    WHERE id = NEW.slot_id;

    IF slot_capacity IS NOT NULL THEN
      SELECT COUNT(*) INTO active_count
      FROM members
      WHERE slot_id = NEW.slot_id
        AND is_active = true
        AND deleted_at IS NULL
        AND id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::uuid);

      IF active_count >= slot_capacity THEN
        RAISE EXCEPTION 'Slot capacity exceeded (limit: %)', slot_capacity;
      END IF;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER enforce_membership_capacity
  BEFORE INSERT OR UPDATE OF is_active, slot_id, deleted_at ON members
  FOR EACH ROW EXECUTE FUNCTION check_membership_capacity();

-- ─── 7. ROW LEVEL SECURITY (RLS) ───────────────────────────────

ALTER TABLE membership_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE membership_slot_releases ENABLE ROW LEVEL SECURITY;
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
ALTER TABLE membership_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE guest_plays ENABLE ROW LEVEL SECURITY;

-- ── Super-admin policies ──
CREATE POLICY "Super-admin full access on membership_slots" ON membership_slots
  FOR ALL USING (is_super_admin());

CREATE POLICY "Super-admin full access on membership_slot_releases" ON membership_slot_releases
  FOR ALL USING (is_super_admin());

CREATE POLICY "Super-admin full access on members" ON members
  FOR ALL USING (is_super_admin());

CREATE POLICY "Super-admin full access on membership_applications" ON membership_applications
  FOR ALL USING (is_super_admin());

CREATE POLICY "Super-admin full access on guest_plays" ON guest_plays
  FOR ALL USING (is_super_admin());

-- ── Owner policies for membership_slots ──
CREATE POLICY "Owners see own venue membership_slots" ON membership_slots
  FOR SELECT USING (
    venue_id IN (SELECT id FROM venues WHERE owner_id = auth.uid())
  );

CREATE POLICY "Owners insert own venue membership_slots" ON membership_slots
  FOR INSERT WITH CHECK (
    venue_id IN (SELECT id FROM venues WHERE owner_id = auth.uid())
  );

CREATE POLICY "Owners update own venue membership_slots" ON membership_slots
  FOR UPDATE USING (
    venue_id IN (SELECT id FROM venues WHERE owner_id = auth.uid())
  );

CREATE POLICY "Owners delete own venue membership_slots" ON membership_slots
  FOR DELETE USING (
    venue_id IN (SELECT id FROM venues WHERE owner_id = auth.uid())
  );

-- ── Owner policies for membership_slot_releases ──
CREATE POLICY "Owners see own venue slot releases" ON membership_slot_releases
  FOR SELECT USING (
    slot_id IN (
      SELECT ms.id FROM membership_slots ms 
      JOIN venues v ON ms.venue_id = v.id 
      WHERE v.owner_id = auth.uid()
    )
  );

CREATE POLICY "Owners insert own venue slot releases" ON membership_slot_releases
  FOR INSERT WITH CHECK (
    slot_id IN (
      SELECT ms.id FROM membership_slots ms 
      JOIN venues v ON ms.venue_id = v.id 
      WHERE v.owner_id = auth.uid()
    )
  );

CREATE POLICY "Owners delete own venue slot releases" ON membership_slot_releases
  FOR DELETE USING (
    slot_id IN (
      SELECT ms.id FROM membership_slots ms 
      JOIN venues v ON ms.venue_id = v.id 
      WHERE v.owner_id = auth.uid()
    )
  );

-- ── Owner policies for members ──
CREATE POLICY "Owners see own venue members" ON members
  FOR SELECT USING (
    slot_id IN (
      SELECT ms.id FROM membership_slots ms 
      JOIN venues v ON ms.venue_id = v.id 
      WHERE v.owner_id = auth.uid()
    )
  );

CREATE POLICY "Owners insert own venue members" ON members
  FOR INSERT WITH CHECK (
    slot_id IN (
      SELECT ms.id FROM membership_slots ms 
      JOIN venues v ON ms.venue_id = v.id 
      WHERE v.owner_id = auth.uid()
    )
  );

CREATE POLICY "Owners update own venue members" ON members
  FOR UPDATE USING (
    slot_id IN (
      SELECT ms.id FROM membership_slots ms 
      JOIN venues v ON ms.venue_id = v.id 
      WHERE v.owner_id = auth.uid()
    )
  );

CREATE POLICY "Owners delete own venue members" ON members
  FOR DELETE USING (
    slot_id IN (
      SELECT ms.id FROM membership_slots ms 
      JOIN venues v ON ms.venue_id = v.id 
      WHERE v.owner_id = auth.uid()
    )
  );

-- ── Owner policies for membership_applications ──
CREATE POLICY "Owners see own venue applications" ON membership_applications
  FOR SELECT USING (
    slot_id IN (
      SELECT ms.id FROM membership_slots ms 
      JOIN venues v ON ms.venue_id = v.id 
      WHERE v.owner_id = auth.uid()
    )
  );

CREATE POLICY "Owners update own venue applications" ON membership_applications
  FOR UPDATE USING (
    slot_id IN (
      SELECT ms.id FROM membership_slots ms 
      JOIN venues v ON ms.venue_id = v.id 
      WHERE v.owner_id = auth.uid()
    )
  );

CREATE POLICY "Owners delete own venue applications" ON membership_applications
  FOR DELETE USING (
    slot_id IN (
      SELECT ms.id FROM membership_slots ms 
      JOIN venues v ON ms.venue_id = v.id 
      WHERE v.owner_id = auth.uid()
    )
  );

CREATE POLICY "Owners insert own venue applications" ON membership_applications
  FOR INSERT WITH CHECK (
    slot_id IN (
      SELECT ms.id FROM membership_slots ms 
      JOIN venues v ON ms.venue_id = v.id 
      WHERE v.owner_id = auth.uid()
    )
  );

-- ── Owner policies for guest_plays ──
CREATE POLICY "Owners see own venue guest plays" ON guest_plays
  FOR SELECT USING (
    slot_id IN (
      SELECT ms.id FROM membership_slots ms 
      JOIN venues v ON ms.venue_id = v.id 
      WHERE v.owner_id = auth.uid()
    )
  );

CREATE POLICY "Owners insert own venue guest plays" ON guest_plays
  FOR INSERT WITH CHECK (
    slot_id IN (
      SELECT ms.id FROM membership_slots ms 
      JOIN venues v ON ms.venue_id = v.id 
      WHERE v.owner_id = auth.uid()
    )
  );

CREATE POLICY "Owners update own venue guest plays" ON guest_plays
  FOR UPDATE USING (
    slot_id IN (
      SELECT ms.id FROM membership_slots ms 
      JOIN venues v ON ms.venue_id = v.id 
      WHERE v.owner_id = auth.uid()
    )
  );

CREATE POLICY "Owners delete own venue guest plays" ON guest_plays
  FOR DELETE USING (
    slot_id IN (
      SELECT ms.id FROM membership_slots ms 
      JOIN venues v ON ms.venue_id = v.id 
      WHERE v.owner_id = auth.uid()
    )
  );
