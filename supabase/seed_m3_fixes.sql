DO $$ 
DECLARE
  v_owner_id uuid;
  v_venue_id uuid;
  v_slot_morning uuid;
  v_slot_evening uuid;
  v_app_karan uuid;
  v_tomorrow date := CURRENT_DATE + interval '1 day';
  v_yesterday date := CURRENT_DATE - interval '1 day';
BEGIN
  -- Get Owner and Venue
  SELECT id INTO v_owner_id FROM auth.users WHERE email = 'owner@example.com' LIMIT 1;
  SELECT id INTO v_venue_id FROM venues WHERE owner_id = v_owner_id LIMIT 1;

  -- Get Slots
  SELECT id INTO v_slot_morning FROM membership_slots WHERE name = 'Morning Warriors' AND venue_id = v_venue_id LIMIT 1;
  SELECT id INTO v_slot_evening FROM membership_slots WHERE name = 'Evening Smashers' AND venue_id = v_venue_id LIMIT 1;

  IF v_slot_morning IS NOT NULL AND v_slot_evening IS NOT NULL THEN
    -- Clear existing pending apps/guest plays to avoid duplicates
    DELETE FROM guest_plays WHERE slot_id IN (v_slot_morning, v_slot_evening);
    DELETE FROM membership_applications WHERE slot_id IN (v_slot_morning, v_slot_evening);

    -- Insert Membership Applications
    INSERT INTO membership_applications (slot_id, applicant_name, phone, skill_level, experience, preferred_days, status)
    VALUES 
      (v_slot_morning, 'Karan Mehra', '9876543216', 'intermediate', 'Played for 2 years in college club.', ARRAY['mon', 'wed', 'fri']::day_of_week[], 'pending')
    RETURNING id INTO v_app_karan;

    INSERT INTO membership_applications (slot_id, applicant_name, phone, skill_level, experience, preferred_days, status, reviewed_at, reviewed_by)
    VALUES 
      (v_slot_evening, 'Divya Sharma', '9876543219', 'advanced', 'District level badminton player.', ARRAY['tue', 'thu', 'sat']::day_of_week[], 'accepted', NOW(), v_owner_id);

    -- Insert Guest Plays
    INSERT INTO guest_plays (slot_id, application_id, player_name, phone, scheduled_date, status, notes)
    VALUES 
      (v_slot_morning, v_app_karan, 'Karan Mehra', '9876543216', v_tomorrow, 'upcoming', 'Interested in testing court 1 speed.');

    INSERT INTO guest_plays (slot_id, application_id, player_name, phone, scheduled_date, status, notes)
    VALUES 
      (v_slot_evening, NULL, 'Rohan Das', '9876543218', v_yesterday, 'completed', 'Played great match, wants to join.');

    RAISE NOTICE 'Seed M3 Fixes completed successfully!';
  ELSE
    RAISE NOTICE 'Skipping Seed M3 Fixes: Membership slots not found.';
  END IF;
END $$;
