-- ═══════════════════════════════════════════════════════════════
-- Migration 006: Bookings Improvements (Duration and Blocked Sessions)
-- Badminton Manager (VMS)
-- ═══════════════════════════════════════════════════════════════

-- 1. Modify valid_duration constraint to allow 30-min increments
ALTER TABLE bookings DROP CONSTRAINT valid_duration;
ALTER TABLE bookings ADD CONSTRAINT valid_duration CHECK (
  duration_minutes > 0 AND duration_minutes % 30 = 0
);

-- 2. Make customer_id optional for blocked slots
ALTER TABLE bookings ALTER COLUMN customer_id DROP NOT NULL;
ALTER TABLE bookings ADD CONSTRAINT bookings_customer_check CHECK (
  slot_type = 'blocked' OR customer_id IS NOT NULL
);
