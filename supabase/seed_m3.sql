-- ═══════════════════════════════════════════════════════════════
-- Seed M3: Membership Management Sample Data
-- Badminton Manager (VMS)
-- ═══════════════════════════════════════════════════════════════

DO $$ 
DECLARE
  v_owner_id UUID;
  v_venue_id UUID;
  v_court1_id UUID;
  v_court2_id UUID;
  v_cust_rahul UUID;
  v_cust_priya UUID;
  v_cust_amit UUID;
  v_cust_sneha UUID;
  v_cust_vikram UUID;
  v_cust_ananya UUID;
  v_slot_morning UUID;
  v_slot_evening UUID;
  v_slot_weekend UUID;
  v_app_karan UUID;
  v_today DATE := CURRENT_DATE;
  v_tomorrow DATE := CURRENT_DATE + INTERVAL '1 day';
  v_yesterday DATE := CURRENT_DATE - INTERVAL '1 day';
BEGIN
  -- Get existing owner, venue, courts from earlier seeds
  SELECT id INTO v_owner_id FROM owners LIMIT 1;
  SELECT id INTO v_venue_id FROM venues WHERE owner_id = v_owner_id LIMIT 1;
  SELECT id INTO v_court1_id FROM courts WHERE venue_id = v_venue_id ORDER BY sort_order ASC LIMIT 1;
  SELECT id INTO v_court2_id FROM courts WHERE venue_id = v_venue_id ORDER BY sort_order DESC LIMIT 1;

  IF v_owner_id IS NOT NULL AND v_venue_id IS NOT NULL AND v_court1_id IS NOT NULL THEN
    
    -- Get existing customers or create if missing
    SELECT id INTO v_cust_rahul FROM customers WHERE owner_id = v_owner_id AND phone = '9876543210' LIMIT 1;
    SELECT id INTO v_cust_priya FROM customers WHERE owner_id = v_owner_id AND phone = '9876543211' LIMIT 1;
    SELECT id INTO v_cust_amit  FROM customers WHERE owner_id = v_owner_id AND phone = '9876543212' LIMIT 1;
    SELECT id INTO v_cust_sneha FROM customers WHERE owner_id = v_owner_id AND phone = '9876543213' LIMIT 1;

    INSERT INTO customers (owner_id, full_name, phone, email, notes, total_visits, total_spent)
    VALUES (v_owner_id, 'Vikram Singh', '9876543214', 'vikram@example.com', 'Morning member', 10, 300000)
    ON CONFLICT (owner_id, phone) DO UPDATE SET full_name = EXCLUDED.full_name
    RETURNING id INTO v_cust_vikram;

    INSERT INTO customers (owner_id, full_name, phone, email, notes, total_visits, total_spent)
    VALUES (v_owner_id, 'Ananya Desai', '9876543215', 'ananya@example.com', 'Evening member (inactive)', 2, 60000)
    ON CONFLICT (owner_id, phone) DO UPDATE SET full_name = EXCLUDED.full_name
    RETURNING id INTO v_cust_ananya;

    -- 1. Create Membership Slots
    INSERT INTO membership_slots (venue_id, name, playing_days, start_time, end_time, skill_level, monthly_fee, capacity, guest_play_fee, allow_guest_play, billing_day, is_published, is_recruiting, court_id)
    VALUES 
      (v_venue_id, 'Morning Warriors', ARRAY['mon', 'wed', 'fri']::day_of_week[], '06:00:00', '08:00:00', 'intermediate', 150000, 12, 20000, true, 1, true, true, v_court1_id)
    RETURNING id INTO v_slot_morning;

    INSERT INTO membership_slots (venue_id, name, playing_days, start_time, end_time, skill_level, monthly_fee, capacity, guest_play_fee, allow_guest_play, billing_day, is_published, is_recruiting, court_id)
    VALUES 
      (v_venue_id, 'Evening Smashers', ARRAY['tue', 'thu', 'sat']::day_of_week[], '18:00:00', '20:00:00', 'advanced', 200000, 8, 25000, true, 5, true, true, v_court2_id)
    RETURNING id INTO v_slot_evening;

    INSERT INTO membership_slots (venue_id, name, playing_days, start_time, end_time, skill_level, monthly_fee, capacity, guest_play_fee, allow_guest_play, billing_day, is_published, is_recruiting, court_id)
    VALUES 
      (v_venue_id, 'Weekend Club', ARRAY['sat', 'sun']::day_of_week[], '08:00:00', '10:00:00', 'recreational', 100000, 16, 15000, false, 1, false, false, NULL)
    RETURNING id INTO v_slot_weekend;

    -- 2. Insert Members into Slots
    IF v_cust_rahul IS NOT NULL THEN
      INSERT INTO members (slot_id, customer_id, is_active, join_date)
      VALUES (v_slot_morning, v_cust_rahul, true, v_yesterday)
      ON CONFLICT (slot_id, customer_id) DO NOTHING;
    END IF;

    IF v_cust_priya IS NOT NULL THEN
      INSERT INTO members (slot_id, customer_id, is_active, join_date)
      VALUES (v_slot_morning, v_cust_priya, true, v_yesterday)
      ON CONFLICT (slot_id, customer_id) DO NOTHING;
    END IF;

    IF v_cust_amit IS NOT NULL THEN
      INSERT INTO members (slot_id, customer_id, is_active, join_date)
      VALUES (v_slot_morning, v_cust_amit, true, v_yesterday)
      ON CONFLICT (slot_id, customer_id) DO NOTHING;
    END IF;

    IF v_cust_sneha IS NOT NULL THEN
      INSERT INTO members (slot_id, customer_id, is_active, join_date)
      VALUES (v_slot_evening, v_cust_sneha, true, v_yesterday)
      ON CONFLICT (slot_id, customer_id) DO NOTHING;
    END IF;

    IF v_cust_vikram IS NOT NULL THEN
      INSERT INTO members (slot_id, customer_id, is_active, join_date)
      VALUES (v_slot_evening, v_cust_vikram, true, v_yesterday)
      ON CONFLICT (slot_id, customer_id) DO NOTHING;
    END IF;

    IF v_cust_ananya IS NOT NULL THEN
      INSERT INTO members (slot_id, customer_id, is_active, join_date)
      VALUES (v_slot_evening, v_cust_ananya, false, v_yesterday)
      ON CONFLICT (slot_id, customer_id) DO NOTHING;
    END IF;

    -- 3. Insert Membership Applications
    INSERT INTO membership_applications (slot_id, applicant_name, phone, skill_level, experience, preferred_days, status)
    VALUES 
      (v_slot_morning, 'Karan Mehra', '9876543216', 'intermediate', 'Played for 2 years in college club.', ARRAY['mon', 'wed', 'fri']::day_of_week[], 'pending')
    RETURNING id INTO v_app_karan;

    INSERT INTO membership_applications (slot_id, applicant_name, phone, skill_level, experience, preferred_days, status, reviewed_at, reviewed_by)
    VALUES 
      (v_slot_evening, 'Divya Sharma', '9876543219', 'advanced', 'District level badminton player.', ARRAY['tue', 'thu', 'sat']::day_of_week[], 'accepted', NOW(), v_owner_id);

    -- 4. Insert Guest Plays
    INSERT INTO guest_plays (slot_id, application_id, player_name, phone, scheduled_date, status, notes)
    VALUES 
      (v_slot_morning, v_app_karan, 'Karan Mehra', '9876543216', v_tomorrow, 'upcoming', 'Interested in testing court 1 speed.');

    INSERT INTO guest_plays (slot_id, application_id, player_name, phone, scheduled_date, status, notes)
    VALUES 
      (v_slot_evening, NULL, 'Rohan Das', '9876543218', v_yesterday, 'completed', 'Played great match, wants to join.');

    -- 5. Insert Sample Slot Release (Release Morning Warriors for tomorrow so it can be booked)
    INSERT INTO membership_slot_releases (slot_id, release_date, released_by)
    VALUES (v_slot_morning, v_tomorrow, v_owner_id)
    ON CONFLICT (slot_id, release_date) DO NOTHING;

    RAISE NOTICE 'Seed M3 completed successfully!';
  ELSE
    RAISE NOTICE 'Skipping Seed M3: Required seed_m1 / seed_m2 data not found.';
  END IF;
END $$;
