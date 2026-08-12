-- ═══════════════════════════════════════════════════════════════
-- Migration 016: Phase 2 — Social Features
-- Find Players, Host/Join Match, Challenges, In-app Notifications
-- Geolocation infrastructure (Haversine, player coords, RPC fns)
-- ═══════════════════════════════════════════════════════════════

-- ─────────────────────────────────────────────────────────────────
-- PART A: Extend players table with geolocation + gender
-- ─────────────────────────────────────────────────────────────────
ALTER TABLE players
  ADD COLUMN IF NOT EXISTS latitude            DECIMAL(9,6),
  ADD COLUMN IF NOT EXISTS longitude           DECIMAL(9,6),
  ADD COLUMN IF NOT EXISTS location_updated_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS gender              TEXT
    CONSTRAINT players_gender_check CHECK (gender IN ('male', 'female', 'other'));

-- Partial index: only index players who have a known location
CREATE INDEX IF NOT EXISTS idx_players_location
  ON players (latitude, longitude)
  WHERE latitude IS NOT NULL AND longitude IS NOT NULL;

-- ─────────────────────────────────────────────────────────────────
-- PART B: Haversine distance function (pure SQL, no PostGIS)
-- Returns distance in kilometres between two lat/lon points.
-- ─────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION haversine_km(
  lat1 FLOAT,
  lon1 FLOAT,
  lat2 FLOAT,
  lon2 FLOAT
)
RETURNS FLOAT
LANGUAGE sql
IMMUTABLE
PARALLEL SAFE
AS $$
  SELECT
    2.0 * 6371.0 * asin(
      sqrt(
        power(sin(radians((lat2 - lat1) / 2.0)), 2) +
        cos(radians(lat1)) *
        cos(radians(lat2)) *
        power(sin(radians((lon2 - lon1) / 2.0)), 2)
      )
    );
$$;

-- ─────────────────────────────────────────────────────────────────
-- PART C: RPC — Distance-aware player discovery
-- Returns players sorted by distance from the caller's coordinates.
-- Players with no location are returned last (distance_km = NULL).
-- ─────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION get_players_with_distance(
  user_lat       FLOAT    DEFAULT NULL,
  user_lon       FLOAT    DEFAULT NULL,
  search_text    TEXT     DEFAULT NULL,
  skill_filter   TEXT     DEFAULT NULL,
  gender_filter  TEXT     DEFAULT NULL,
  radius_km      FLOAT    DEFAULT 50.0
)
RETURNS TABLE (
  id                    UUID,
  full_name             TEXT,
  avatar_url            TEXT,
  city                  TEXT,
  player_id             TEXT,
  player_id_verified    BOOLEAN,
  gender                TEXT,
  latitude              DECIMAL,
  longitude             DECIMAL,
  location_updated_at   TIMESTAMPTZ,
  distance_km           FLOAT
)
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT
    p.id,
    p.full_name,
    p.avatar_url,
    p.city,
    p.player_id,
    p.player_id_verified,
    p.gender,
    p.latitude,
    p.longitude,
    p.location_updated_at,
    CASE
      WHEN user_lat IS NOT NULL AND user_lon IS NOT NULL
           AND p.latitude IS NOT NULL AND p.longitude IS NOT NULL
        THEN haversine_km(user_lat, user_lon, p.latitude::FLOAT, p.longitude::FLOAT)
      ELSE NULL
    END AS distance_km
  FROM players p
  WHERE
    p.deleted_at IS NULL
    AND p.id <> auth.uid()
    AND (
      search_text IS NULL
      OR p.full_name ILIKE '%' || search_text || '%'
      OR p.player_id ILIKE '%' || search_text || '%'
    )
    AND (gender_filter IS NULL OR p.gender = gender_filter)
    AND (
      user_lat IS NULL OR user_lon IS NULL
      OR p.latitude IS NULL OR p.longitude IS NULL
      OR haversine_km(user_lat, user_lon, p.latitude::FLOAT, p.longitude::FLOAT) <= radius_km
    )
  ORDER BY distance_km ASC NULLS LAST, p.full_name ASC
  LIMIT 100;
$$;

-- ─────────────────────────────────────────────────────────────────
-- PART E: Social tables
-- ─────────────────────────────────────────────────────────────────

-- In-app notification log
CREATE TABLE IF NOT EXISTS player_notifications (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id   UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  type        TEXT NOT NULL,
  title       TEXT NOT NULL,
  body        TEXT NOT NULL,
  data        JSONB,
  is_read     BOOLEAN NOT NULL DEFAULT FALSE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_player_notifications_player
  ON player_notifications (player_id, is_read, created_at DESC);

-- Hosted matches
CREATE TABLE IF NOT EXISTS hosted_matches (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  host_player_id UUID NOT NULL REFERENCES players(id),
  booking_id     UUID NOT NULL REFERENCES bookings(id),
  match_format   TEXT NOT NULL
    CONSTRAINT hosted_matches_format_check CHECK (match_format IN ('singles', 'doubles', 'mixed')),
  skill_level    TEXT NOT NULL DEFAULT 'all'
    CONSTRAINT hosted_matches_skill_check CHECK (skill_level IN ('all', 'beginner', 'intermediate', 'advanced')),
  city           TEXT,
  visibility     TEXT NOT NULL DEFAULT 'public'
    CONSTRAINT hosted_matches_visibility_check CHECK (visibility IN ('public', 'private')),
  max_players    INTEGER NOT NULL DEFAULT 4
    CONSTRAINT hosted_matches_max_players_check CHECK (max_players BETWEEN 2 AND 6),
  status         TEXT NOT NULL DEFAULT 'open'
    CONSTRAINT hosted_matches_status_check CHECK (status IN ('open', 'full', 'cancelled', 'completed')),
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_hosted_matches_open   ON hosted_matches (status) WHERE status = 'open';
CREATE INDEX IF NOT EXISTS idx_hosted_matches_host   ON hosted_matches (host_player_id);
CREATE INDEX IF NOT EXISTS idx_hosted_matches_booking ON hosted_matches (booking_id);

CREATE OR REPLACE FUNCTION update_hosted_matches_updated_at()
RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = NOW(); RETURN NEW; END; $$ LANGUAGE plpgsql;
CREATE TRIGGER hosted_matches_updated_at
  BEFORE UPDATE ON hosted_matches FOR EACH ROW
  EXECUTE FUNCTION update_hosted_matches_updated_at();

-- Hosted match joined players
CREATE TABLE IF NOT EXISTS hosted_match_players (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hosted_match_id UUID NOT NULL REFERENCES hosted_matches(id) ON DELETE CASCADE,
  player_id       UUID NOT NULL REFERENCES players(id),
  joined_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (hosted_match_id, player_id)
);
CREATE INDEX IF NOT EXISTS idx_hosted_match_players_match  ON hosted_match_players (hosted_match_id);
CREATE INDEX IF NOT EXISTS idx_hosted_match_players_player ON hosted_match_players (player_id);

-- Challenges
CREATE TABLE IF NOT EXISTS challenges (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  host_player_id UUID NOT NULL REFERENCES players(id),
  booking_id     UUID NOT NULL REFERENCES bookings(id),
  match_format   TEXT NOT NULL
    CONSTRAINT challenges_format_check CHECK (match_format IN ('singles', 'doubles', 'mixed')),
  description    TEXT,
  status         TEXT NOT NULL DEFAULT 'open'
    CONSTRAINT challenges_status_check CHECK (status IN ('open', 'cancelled', 'expired')),
  expires_at     TIMESTAMPTZ NOT NULL,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_challenges_host    ON challenges (host_player_id);
CREATE INDEX IF NOT EXISTS idx_challenges_booking ON challenges (booking_id);
CREATE INDEX IF NOT EXISTS idx_challenges_expires ON challenges (expires_at, status) WHERE status = 'open';

CREATE OR REPLACE FUNCTION update_challenges_updated_at()
RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = NOW(); RETURN NEW; END; $$ LANGUAGE plpgsql;
CREATE TRIGGER challenges_updated_at
  BEFORE UPDATE ON challenges FOR EACH ROW
  EXECUTE FUNCTION update_challenges_updated_at();

-- Challenge invitations
CREATE TABLE IF NOT EXISTS challenge_invitations (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_id      UUID NOT NULL REFERENCES challenges(id) ON DELETE CASCADE,
  invited_player_id UUID NOT NULL REFERENCES players(id),
  status            TEXT NOT NULL DEFAULT 'pending'
    CONSTRAINT challenge_invitations_status_check CHECK (status IN ('pending', 'accepted', 'declined')),
  responded_at      TIMESTAMPTZ,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (challenge_id, invited_player_id)
);
CREATE INDEX IF NOT EXISTS idx_challenge_invitations_challenge ON challenge_invitations (challenge_id);
CREATE INDEX IF NOT EXISTS idx_challenge_invitations_player    ON challenge_invitations (invited_player_id, status);

-- ─────────────────────────────────────────────────────────────────
-- PART D: RPC — Distance-aware open hosted matches discovery
-- ─────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION get_open_matches_with_distance(
  user_lat       FLOAT    DEFAULT NULL,
  user_lon       FLOAT    DEFAULT NULL,
  format_filter  TEXT     DEFAULT NULL
)
RETURNS TABLE (
  id                  UUID,
  host_player_id      UUID,
  host_name           TEXT,
  host_avatar         TEXT,
  host_player_id_str  TEXT,
  booking_id          UUID,
  match_format        TEXT,
  skill_level         TEXT,
  visibility          TEXT,
  max_players         INTEGER,
  status              TEXT,
  joined_count        BIGINT,
  venue_name          TEXT,
  venue_city          TEXT,
  booking_date        DATE,
  booking_start       TIME,
  booking_end         TIME,
  created_at          TIMESTAMPTZ,
  distance_km         FLOAT
)
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT
    hm.id,
    hm.host_player_id,
    p.full_name                                           AS host_name,
    p.avatar_url                                          AS host_avatar,
    p.player_id                                           AS host_player_id_str,
    hm.booking_id,
    hm.match_format,
    hm.skill_level,
    hm.visibility,
    hm.max_players,
    hm.status,
    COUNT(hmp.id)                                         AS joined_count,
    v.name                                                AS venue_name,
    v.city                                                AS venue_city,
    b.date                                                AS booking_date,
    b.start_time                                          AS booking_start,
    b.end_time                                            AS booking_end,
    hm.created_at,
    CASE
      WHEN user_lat IS NOT NULL AND user_lon IS NOT NULL
           AND v.latitude IS NOT NULL AND v.longitude IS NOT NULL
        THEN haversine_km(user_lat, user_lon, v.latitude::FLOAT, v.longitude::FLOAT)
      ELSE NULL
    END AS distance_km
  FROM hosted_matches hm
  JOIN players p      ON p.id = hm.host_player_id
  JOIN bookings b     ON b.id = hm.booking_id
  LEFT JOIN courts c  ON c.id = b.court_id
  LEFT JOIN venues v  ON v.id = c.venue_id
  LEFT JOIN hosted_match_players hmp ON hmp.hosted_match_id = hm.id
  WHERE
    hm.status = 'open'
    AND b.status = 'upcoming'
    AND hm.visibility = 'public'
    AND (format_filter IS NULL OR hm.match_format = format_filter)
  GROUP BY
    hm.id, p.full_name, p.avatar_url, p.player_id,
    v.name, v.city, v.latitude, v.longitude,
    b.date, b.start_time, b.end_time
  ORDER BY distance_km ASC NULLS LAST, hm.created_at DESC
  LIMIT 50;
$$;

-- ─────────────────────────────────────────────────────────────────
-- PART F: Booking Cancellation Cascade Trigger
-- ─────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION handle_booking_cancelled()
RETURNS TRIGGER AS $$
DECLARE
  v_match     RECORD;
  v_player    RECORD;
  v_challenge RECORD;
  v_invite    RECORD;
  v_host_name  TEXT;
  v_venue_name TEXT;
BEGIN
  IF NEW.status <> 'cancelled' OR OLD.status = 'cancelled' THEN
    RETURN NEW;
  END IF;

  SELECT v.name INTO v_venue_name
  FROM courts c JOIN venues v ON v.id = c.venue_id
  WHERE c.id = NEW.court_id LIMIT 1;

  -- Cancel open hosted matches + notify joined players
  FOR v_match IN
    SELECT id, host_player_id FROM hosted_matches
    WHERE booking_id = NEW.id AND status = 'open'
  LOOP
    UPDATE hosted_matches SET status = 'cancelled', updated_at = NOW() WHERE id = v_match.id;
    SELECT full_name INTO v_host_name FROM players WHERE id = v_match.host_player_id;
    FOR v_player IN
      SELECT player_id FROM hosted_match_players WHERE hosted_match_id = v_match.id
    LOOP
      INSERT INTO player_notifications (player_id, type, title, body, data)
      VALUES (
        v_player.player_id, 'match_cancelled', 'Match Cancelled',
        COALESCE(v_host_name, 'Host') || '''s match at ' || COALESCE(v_venue_name, 'the court') || ' was cancelled.',
        jsonb_build_object('hosted_match_id', v_match.id, 'booking_id', NEW.id)
      );
    END LOOP;
  END LOOP;

  -- Cancel open challenges + notify invited players
  FOR v_challenge IN
    SELECT id, host_player_id FROM challenges
    WHERE booking_id = NEW.id AND status = 'open'
  LOOP
    UPDATE challenges SET status = 'cancelled', updated_at = NOW() WHERE id = v_challenge.id;
    SELECT full_name INTO v_host_name FROM players WHERE id = v_challenge.host_player_id;
    FOR v_invite IN
      SELECT invited_player_id FROM challenge_invitations WHERE challenge_id = v_challenge.id
    LOOP
      INSERT INTO player_notifications (player_id, type, title, body, data)
      VALUES (
        v_invite.invited_player_id, 'challenge_cancelled', 'Challenge Cancelled',
        COALESCE(v_host_name, 'Host') || '''s challenge at ' || COALESCE(v_venue_name, 'the court') || ' was cancelled.',
        jsonb_build_object('challenge_id', v_challenge.id, 'booking_id', NEW.id)
      );
    END LOOP;
  END LOOP;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_booking_cancelled ON bookings;
CREATE TRIGGER on_booking_cancelled
  AFTER UPDATE OF status ON bookings
  FOR EACH ROW EXECUTE FUNCTION handle_booking_cancelled();

-- ─────────────────────────────────────────────────────────────────
-- PART G: RLS Policies
-- ─────────────────────────────────────────────────────────────────
ALTER TABLE player_notifications  ENABLE ROW LEVEL SECURITY;
ALTER TABLE hosted_matches        ENABLE ROW LEVEL SECURITY;
ALTER TABLE hosted_match_players  ENABLE ROW LEVEL SECURITY;
ALTER TABLE challenges            ENABLE ROW LEVEL SECURITY;
ALTER TABLE challenge_invitations ENABLE ROW LEVEL SECURITY;

-- player_notifications
CREATE POLICY "Player reads own notifications"    ON player_notifications FOR SELECT USING (player_id = auth.uid());
CREATE POLICY "Player marks notifications read"   ON player_notifications FOR UPDATE USING (player_id = auth.uid()) WITH CHECK (player_id = auth.uid());

-- hosted_matches
CREATE POLICY "View public or own matches"        ON hosted_matches FOR SELECT TO authenticated USING (visibility = 'public' OR host_player_id = auth.uid());
CREATE POLICY "Player hosts a match"              ON hosted_matches FOR INSERT TO authenticated WITH CHECK (host_player_id = auth.uid());
CREATE POLICY "Host manages own match"            ON hosted_matches FOR UPDATE TO authenticated USING (host_player_id = auth.uid()) WITH CHECK (host_player_id = auth.uid());

-- hosted_match_players
CREATE POLICY "View joined players"               ON hosted_match_players FOR SELECT TO authenticated USING (TRUE);
CREATE POLICY "Player joins a match"              ON hosted_match_players FOR INSERT TO authenticated WITH CHECK (player_id = auth.uid());
CREATE POLICY "Player or host removes join"       ON hosted_match_players FOR DELETE TO authenticated USING (player_id = auth.uid() OR EXISTS (SELECT 1 FROM hosted_matches WHERE id = hosted_match_id AND host_player_id = auth.uid()));

-- challenges
CREATE POLICY "View all challenges"               ON challenges FOR SELECT TO authenticated USING (TRUE);
CREATE POLICY "Player sends challenge"            ON challenges FOR INSERT TO authenticated WITH CHECK (host_player_id = auth.uid());
CREATE POLICY "Host manages challenge"            ON challenges FOR UPDATE TO authenticated USING (host_player_id = auth.uid()) WITH CHECK (host_player_id = auth.uid());

-- challenge_invitations
CREATE POLICY "Invited or host reads invitation"  ON challenge_invitations FOR SELECT TO authenticated USING (invited_player_id = auth.uid() OR EXISTS (SELECT 1 FROM challenges WHERE id = challenge_id AND host_player_id = auth.uid()));
CREATE POLICY "Host inserts invitations"          ON challenge_invitations FOR INSERT TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM challenges WHERE id = challenge_id AND host_player_id = auth.uid()));
CREATE POLICY "Invited player responds"           ON challenge_invitations FOR UPDATE TO authenticated USING (invited_player_id = auth.uid()) WITH CHECK (invited_player_id = auth.uid());

-- ─────────────────────────────────────────────────────────────────
-- PART H: Grant RPC access to authenticated users
-- ─────────────────────────────────────────────────────────────────
GRANT EXECUTE ON FUNCTION haversine_km(FLOAT, FLOAT, FLOAT, FLOAT)                                TO authenticated;
GRANT EXECUTE ON FUNCTION get_players_with_distance(FLOAT, FLOAT, TEXT, TEXT, TEXT, FLOAT)        TO authenticated;
GRANT EXECUTE ON FUNCTION get_open_matches_with_distance(FLOAT, FLOAT, TEXT)                      TO authenticated;

-- ─────────────────────────────────────────────────────────────────
-- PART I: Fix is_super_admin and clarify bookings policy
-- ─────────────────────────────────────────────────────────────────

-- 1. Restore is_super_admin function to its original secure definition
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

-- 2. Rename the bookings select policy to reflect its true behavior
ALTER POLICY "Owners see own venue bookings" ON bookings RENAME TO "Users can see their own bookings and owners can see venue bookings";
