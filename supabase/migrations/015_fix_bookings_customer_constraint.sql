-- ═══════════════════════════════════════════════════════════════
-- Migration 015: Fix Bookings Customer Constraint for Player App
-- Badminton Manager (VMS)
-- ═══════════════════════════════════════════════════════════════

-- The previous constraint required customer_id to be NOT NULL unless the slot was blocked.
-- Since the Player App (online bookings) does not assign a customer_id at booking time (the booker is a player, not a direct customer entry yet),
-- we need to relax this constraint so that online bookings from the player app can pass.

ALTER TABLE bookings DROP CONSTRAINT IF EXISTS bookings_customer_check;

ALTER TABLE bookings ADD CONSTRAINT bookings_customer_check CHECK (
  slot_type = 'blocked' OR source = 'online' OR customer_id IS NOT NULL
);
