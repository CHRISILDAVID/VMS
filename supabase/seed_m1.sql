-- Helper block to safely seed data without conflicts if it already exists
DO $$ 
DECLARE
  v_owner_id UUID;
  v_venue_id UUID;
  v_court1_id UUID;
  v_court2_id UUID;
  v_schedule_mon UUID;
  v_schedule_tue UUID;
BEGIN
  -- We assume you log in via auth to create your user first.
  -- This script should be run AFTER you create your user via the app OR we can insert a dummy owner.
  -- For now, let's just create a dummy owner if one doesn't exist, to ensure seed data has a valid owner_id.
  -- In a real scenario, link this to your auth.users ID.
  
  -- Check if any owner exists
  SELECT id INTO v_owner_id FROM owners LIMIT 1;
  
  -- If no owner exists, we need an auth user first. This is complex in pure SQL without auth.users.
  -- Assuming you have signed up via phone + OTP in the app, and completed onboarding.
  -- IF YOU HAVEN'T, this seed script might fail if no owners exist.
  IF v_owner_id IS NOT NULL THEN
  
    -- 1. Create a test venue
    INSERT INTO venues (owner_id, name, address, city, state, contact_phone, is_active)
    VALUES (v_owner_id, 'Smashers Arena (Test)', '123 Main St', 'Bangalore', 'Karnataka', '9876543210', true)
    RETURNING id INTO v_venue_id;

    -- 2. Create courts
    INSERT INTO courts (venue_id, name, court_type, sort_order, is_active)
    VALUES (v_venue_id, 'Court 1', 'wooden', 1, true)
    RETURNING id INTO v_court1_id;

    INSERT INTO courts (venue_id, name, court_type, sort_order, is_active)
    VALUES (v_venue_id, 'Court 2', 'synthetic', 2, true)
    RETURNING id INTO v_court2_id;

    -- 3. Create Operating Schedules (Mon & Tue only for brevity, you can add more)
    INSERT INTO operating_schedules (venue_id, day_of_week, is_closed)
    VALUES (v_venue_id, 'mon', false)
    RETURNING id INTO v_schedule_mon;
    
    INSERT INTO operating_schedules (venue_id, day_of_week, is_closed)
    VALUES (v_venue_id, 'tue', false)
    RETURNING id INTO v_schedule_tue;

    -- 4. Create Pricing Blocks (Morning / Evening)
    INSERT INTO pricing_blocks (schedule_id, start_time, end_time, price_per_hour, is_active)
    VALUES
      -- Monday prices
      (v_schedule_mon, '06:00:00', '16:00:00', 30000, true), -- ₹300.00
      (v_schedule_mon, '16:00:00', '22:00:00', 50000, true), -- ₹500.00
      -- Tuesday prices
      (v_schedule_tue, '06:00:00', '16:00:00', 30000, true),
      (v_schedule_tue, '16:00:00', '22:00:00', 50000, true);

  END IF;
END $$;
