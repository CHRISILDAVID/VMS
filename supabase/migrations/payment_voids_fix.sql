-- payment_voids_fix.sql
-- Run this to add the is_voided column to membership_payments

ALTER TABLE membership_payments 
ADD COLUMN IF NOT EXISTS is_voided BOOLEAN NOT NULL DEFAULT false;

-- Create an index to quickly filter out voided payments
CREATE INDEX IF NOT EXISTS idx_membership_payments_is_voided ON membership_payments(is_voided);
