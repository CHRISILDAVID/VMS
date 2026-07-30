-- ═══════════════════════════════════════════════════════════════
-- Migration 007: Auto-generate Membership Payment on Member Add
-- Badminton Manager (VMS)
-- ═══════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION generate_initial_membership_payment()
RETURNS TRIGGER AS $$
DECLARE
  v_slot_fee INTEGER;
  v_first_day_of_month DATE;
  v_due_date DATE;
  v_payment_exists BOOLEAN;
BEGIN
  -- Only process active members
  IF NEW.is_active = true THEN
    -- Get current month's first day
    v_first_day_of_month := date_trunc('month', CURRENT_DATE)::DATE;
    
    -- Check if a payment already exists for this billing period
    SELECT EXISTS (
      SELECT 1 FROM membership_payments 
      WHERE member_id = NEW.id 
        AND billing_period = v_first_day_of_month
    ) INTO v_payment_exists;

    -- If no payment exists for the current month, create one
    IF NOT v_payment_exists THEN
      -- Get slot monthly fee
      SELECT monthly_fee INTO v_slot_fee 
      FROM membership_slots 
      WHERE id = NEW.slot_id;

      IF v_slot_fee IS NOT NULL THEN
        -- Due date is 7 days after the first of the month
        v_due_date := v_first_day_of_month + INTERVAL '7 days';
        
        INSERT INTO membership_payments (
          member_id,
          slot_id,
          amount,
          billing_period,
          due_date,
          status
        ) VALUES (
          NEW.id,
          NEW.slot_id,
          v_slot_fee,
          v_first_day_of_month,
          v_due_date,
          'due'
        );
      END IF;
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_generate_initial_membership_payment ON members;
CREATE TRIGGER trg_generate_initial_membership_payment
AFTER INSERT OR UPDATE OF is_active
ON members
FOR EACH ROW
EXECUTE FUNCTION generate_initial_membership_payment();

-- Backfill missing payments for the current month for existing active members
DO $$
DECLARE
  v_first_day_of_month DATE := date_trunc('month', CURRENT_DATE)::DATE;
BEGIN
  INSERT INTO membership_payments (
    member_id,
    slot_id,
    amount,
    billing_period,
    due_date,
    status
  )
  SELECT 
    m.id,
    m.slot_id,
    s.monthly_fee,
    v_first_day_of_month,
    v_first_day_of_month + INTERVAL '7 days',
    'due'
  FROM members m
  JOIN membership_slots s ON m.slot_id = s.id
  WHERE m.is_active = true
    AND m.deleted_at IS NULL
    AND NOT EXISTS (
      SELECT 1 FROM membership_payments p 
      WHERE p.member_id = m.id AND p.billing_period = v_first_day_of_month
    );
END $$;
