-- ═══════════════════════════════════════════════════════════════
-- Migration 005: Membership Payments
-- Badminton Manager (VMS)
-- ═══════════════════════════════════════════════════════════════

-- ─── 1. MEMBERSHIP PAYMENTS TABLE ───────────────────────────────

CREATE TABLE membership_payments (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id       UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  slot_id         UUID NOT NULL REFERENCES membership_slots(id) ON DELETE CASCADE,
  amount          INTEGER NOT NULL,               -- in smallest currency unit (paise)
  billing_period  DATE NOT NULL,                  -- first day of the billing month
  due_date        DATE NOT NULL,
  status          membership_pay_status NOT NULL DEFAULT 'due',
  payment_mode    payment_mode,
  paid_on         DATE,
  receipt_url     TEXT,
  notes           TEXT,
  recorded_by     UUID REFERENCES auth.users(id),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  is_voided       BOOLEAN NOT NULL DEFAULT false,

  UNIQUE(member_id, billing_period)
);

CREATE INDEX idx_membership_payments_member ON membership_payments(member_id);
CREATE INDEX idx_membership_payments_slot ON membership_payments(slot_id);
CREATE INDEX idx_membership_payments_status ON membership_payments(status);
CREATE INDEX idx_membership_payments_due ON membership_payments(due_date);

CREATE TRIGGER set_membership_payments_updated_at
  BEFORE UPDATE ON membership_payments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ─── 2. ROW LEVEL SECURITY (RLS) ───────────────────────────────

ALTER TABLE membership_payments ENABLE ROW LEVEL SECURITY;

-- ── Super-admin policies ──
CREATE POLICY "Super-admin full access on membership_payments" ON membership_payments
  FOR ALL USING (is_super_admin());

-- ── Owner policies ──
CREATE POLICY "Owners see own venue membership_payments" ON membership_payments
  FOR SELECT USING (
    slot_id IN (
      SELECT ms.id FROM membership_slots ms 
      JOIN venues v ON ms.venue_id = v.id 
      WHERE v.owner_id = auth.uid()
    )
  );

CREATE POLICY "Owners insert own venue membership_payments" ON membership_payments
  FOR INSERT WITH CHECK (
    slot_id IN (
      SELECT ms.id FROM membership_slots ms 
      JOIN venues v ON ms.venue_id = v.id 
      WHERE v.owner_id = auth.uid()
    )
  );

CREATE POLICY "Owners update own venue membership_payments" ON membership_payments
  FOR UPDATE USING (
    slot_id IN (
      SELECT ms.id FROM membership_slots ms 
      JOIN venues v ON ms.venue_id = v.id 
      WHERE v.owner_id = auth.uid()
    )
  );

CREATE POLICY "Owners delete own venue membership_payments" ON membership_payments
  FOR DELETE USING (
    slot_id IN (
      SELECT ms.id FROM membership_slots ms 
      JOIN venues v ON ms.venue_id = v.id 
      WHERE v.owner_id = auth.uid()
    )
  );

-- ─── 3. STORAGE BUCKET FOR RECEIPTS ────────────────────────────

INSERT INTO storage.buckets (id, name, public) 
VALUES ('receipts', 'receipts', false)
ON CONFLICT (id) DO NOTHING;

-- RLS for receipts bucket
CREATE POLICY "Authenticated users can upload receipts"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'receipts' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can view receipts"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'receipts' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update receipts"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'receipts' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete receipts"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'receipts' AND auth.role() = 'authenticated');

-- ─── 4. CRON JOB SCHEDULE (pg_cron) ────────────────────────────

-- Enable extensions if not already enabled (requires superuser, usually enabled in Supabase)
-- CREATE EXTENSION IF NOT EXISTS pg_cron;
-- CREATE EXTENSION IF NOT EXISTS pg_net;

-- Schedule the edge function to run every day at 1:00 AM to generate payments
-- Note: Replace '<YOUR_SUPABASE_URL>' and '<YOUR_SERVICE_ROLE_KEY>' in production via env vars or vault.
-- In local dev, you would use your local edge function endpoint.
-- 
-- SELECT cron.schedule(
--   'generate-monthly-payments',
--   '0 1 * * *', -- Every day at 1:00 AM
--   $$
--   SELECT net.http_post(
--       url:='http://supabase_kong_vms:8000/functions/v1/generate-membership-payments',
--       headers:='{"Content-Type": "application/json", "Authorization": "Bearer YOUR_SERVICE_ROLE_KEY"}'::jsonb
--   );
--   $$
-- );
