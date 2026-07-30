-- ═══════════════════════════════════════════════════════════════
-- Seed Script: Full DB Wipe and Rich Seed for Milestone 6 Testing
-- 1. Nuke Everything (Explicitly listing all tables for clarity)
TRUNCATE TABLE 
  public.guest_plays,
  public.membership_payments,
  public.membership_applications,
  public.membership_slot_releases,
  public.members,
  public.membership_slots,
  public.bookings,
  public.pricing_blocks,
  public.operating_schedules,
  public.courts,
  public.venues,
  public.customers,
  public.owners 
CASCADE;

DO $$
DECLARE
  v_owner1_id uuid; v_owner2_id uuid; v_owner3_id uuid;
  v_venue1_id uuid; v_venue2_id uuid; v_venue3_id uuid;
  v_court1_ids uuid[] := '{}';
  v_court2_ids uuid[] := '{}';
  v_court3_ids uuid[] := '{}';
  v_cust_ids uuid[] := '{}';
  
  v_temp_id uuid;
  v_sched_id uuid;
  v_slot_id uuid;
  
  i int; j int;
  v_date date;
  v_time time;
  v_status booking_status;
  v_pstatus booking_payment_status;
BEGIN
  -- 1. Fetch User IDs from auth.users (Must match your OTP test numbers)
  SELECT id INTO v_owner1_id FROM auth.users WHERE phone = '911234567890';
  SELECT id INTO v_owner2_id FROM auth.users WHERE phone = '919000000001';
  SELECT id INTO v_owner3_id FROM auth.users WHERE phone = '919000000002';
  
  -- 2. Create Owners
  IF v_owner1_id IS NOT NULL THEN
    INSERT INTO public.owners (id, full_name, phone, business_name, role)
    VALUES (v_owner1_id, 'Rajesh Anna', '911234567890', 'Rajesh Sports Group', 'owner');
  END IF;

  IF v_owner2_id IS NOT NULL THEN
    INSERT INTO public.owners (id, full_name, phone, business_name, role)
    VALUES (v_owner2_id, 'Hari (Chennai Courts)', '919000000001', 'Hari Badminton Club', 'owner');
  END IF;
  
  IF v_owner3_id IS NOT NULL THEN
    INSERT INTO public.owners (id, full_name, phone, business_name, role)
    VALUES (v_owner3_id, 'Empty Owner', '919000000002', 'Future Arena', 'owner');
  END IF;

  -- 3. Create Customers (Using numbers 3 through 30)
  FOR i IN 3..30 LOOP
    v_temp_id := gen_random_uuid();
    v_cust_ids := array_append(v_cust_ids, v_temp_id);
    
    INSERT INTO public.customers (id, owner_id, full_name, phone, total_visits, total_spent)
    VALUES (
      v_temp_id, 
      COALESCE(v_owner1_id, v_owner2_id, v_owner3_id), 
      'Test Player ' || i, 
      '9190000000' || LPAD(i::text, 2, '0'),
      floor(random() * 20),
      floor(random() * 500000)
    );
  END LOOP;

  -- 4. Create Venues in Chennai with Real Coordinates
  IF v_owner1_id IS NOT NULL THEN
    -- Venue 1: Smash Bounce (Anna Nagar)
    v_venue1_id := gen_random_uuid();
    INSERT INTO public.venues (id, owner_id, name, address, city, state, pincode, latitude, longitude, contact_phone, contact_email, court_type, amenities, is_active)
    VALUES (
      v_venue1_id, v_owner1_id, 'Smash Bounce Badminton', 
      'W Block, 3rd Ave, Anna Nagar', 'Chennai', 'Tamil Nadu', '600040',
      13.0827, 80.2116, '919876543210', 'contact@smashbounce.com', 'wooden',
      ARRAY['parking', 'restroom', 'water', 'cafe'], true
    );
    
    -- Courts for Venue 1
    FOR i IN 1..4 LOOP
      v_temp_id := gen_random_uuid();
      v_court1_ids := array_append(v_court1_ids, v_temp_id);
      INSERT INTO public.courts (id, venue_id, name, sort_order) 
      VALUES (v_temp_id, v_venue1_id, 'Court ' || i, i);
    END LOOP;
    
    -- Schedule & Pricing (Venue 1)
    FOR i IN 1..7 LOOP
      v_sched_id := gen_random_uuid();
      INSERT INTO public.operating_schedules (id, venue_id, day_of_week) 
      VALUES (v_sched_id, v_venue1_id, (ARRAY['mon','tue','wed','thu','fri','sat','sun'])[i]::day_of_week);
      
      -- Morning Peak
      INSERT INTO public.pricing_blocks (schedule_id, start_time, end_time, price_per_hour, court_ids)
      VALUES (v_sched_id, '06:00', '10:00', 50000, v_court1_ids);
      -- Non-Peak
      INSERT INTO public.pricing_blocks (schedule_id, start_time, end_time, price_per_hour, court_ids)
      VALUES (v_sched_id, '10:00', '17:00', 35000, v_court1_ids);
      -- Evening Peak
      INSERT INTO public.pricing_blocks (schedule_id, start_time, end_time, price_per_hour, court_ids)
      VALUES (v_sched_id, '17:00', '23:00', 60000, v_court1_ids);
    END LOOP;
  END IF;

  IF v_owner2_id IS NOT NULL THEN
    -- Venue 2: Feathers Badminton (Velachery)
    v_venue2_id := gen_random_uuid();
    INSERT INTO public.venues (id, owner_id, name, address, city, state, pincode, latitude, longitude, court_type, amenities, is_active)
    VALUES (
      v_venue2_id, v_owner2_id, 'Feathers Badminton', 
      '100 Feet Bypass Rd, Velachery', 'Chennai', 'Tamil Nadu', '600042',
      12.9815, 80.2180, 'synthetic',
      ARRAY['parking', 'restroom', 'water'], true
    );
    
    FOR i IN 1..3 LOOP
      v_temp_id := gen_random_uuid();
      v_court2_ids := array_append(v_court2_ids, v_temp_id);
      INSERT INTO public.courts (id, venue_id, name, sort_order) VALUES (v_temp_id, v_venue2_id, 'Court ' || i, i);
    END LOOP;

    -- Venue 3: Court 360 (Sholinganallur)
    v_venue3_id := gen_random_uuid();
    INSERT INTO public.venues (id, owner_id, name, address, city, state, pincode, latitude, longitude, court_type, amenities, is_active)
    VALUES (
      v_venue3_id, v_owner2_id, 'Court 360', 
      'OMR Toll Plaza, Sholinganallur', 'Chennai', 'Tamil Nadu', '600119',
      12.8996, 80.2209, 'wooden',
      ARRAY['parking', 'restroom'], true
    );
    
    FOR i IN 1..2 LOOP
      v_temp_id := gen_random_uuid();
      v_court3_ids := array_append(v_court3_ids, v_temp_id);
      INSERT INTO public.courts (id, venue_id, name, sort_order) VALUES (v_temp_id, v_venue3_id, 'Court Alpha ' || i, i);
    END LOOP;
  END IF;

  -- 5. Massive Booking Generation (100+ random bookings)
  FOR i IN 1..150 LOOP
    v_date := CURRENT_DATE + (random() * 60 - 30)::int; -- From -30 days to +30 days
    v_time := make_time((random() * 15 + 6)::int, CASE WHEN random() > 0.5 THEN 30 ELSE 0 END, 0);
    
    IF v_date < CURRENT_DATE THEN
      v_status := 'completed';
      v_pstatus := CASE WHEN random() > 0.1 THEN 'paid' ELSE 'pending' END;
    ELSIF v_date = CURRENT_DATE THEN
      v_status := 'upcoming';
      v_pstatus := 'pending';
    ELSE
      v_status := CASE WHEN random() > 0.8 THEN 'cancelled' ELSE 'upcoming' END;
      v_pstatus := CASE WHEN random() > 0.5 THEN 'paid' ELSE 'pending' END;
    END IF;
    
    -- Pick a random venue
    IF v_owner1_id IS NOT NULL AND (random() > 0.5 OR v_owner2_id IS NULL) THEN
      INSERT INTO public.bookings (booking_number, venue_id, court_id, customer_id, booked_by, date, start_time, end_time, duration_minutes, base_amount, final_amount, status, payment_status)
      VALUES (
        'BKG-V1-' || LPAD(i::text, 4, '0'), v_venue1_id, 
        v_court1_ids[ceil(random() * array_length(v_court1_ids, 1))], 
        v_cust_ids[ceil(random() * array_length(v_cust_ids, 1))], 
        v_owner1_id, v_date, v_time, v_time + INTERVAL '1 hour', 60, 50000, 50000, v_status, v_pstatus
      );
    ELSIF v_owner2_id IS NOT NULL THEN
      INSERT INTO public.bookings (booking_number, venue_id, court_id, customer_id, booked_by, date, start_time, end_time, duration_minutes, base_amount, final_amount, status, payment_status)
      VALUES (
        'BKG-V2-' || LPAD(i::text, 4, '0'), v_venue2_id, 
        v_court2_ids[ceil(random() * array_length(v_court2_ids, 1))], 
        v_cust_ids[ceil(random() * array_length(v_cust_ids, 1))], 
        v_owner2_id, v_date, v_time, v_time + INTERVAL '90 minutes', 90, 75000, 75000, v_status, v_pstatus
      );
    END IF;
  END LOOP;

  -- 6. Memberships
  IF v_owner1_id IS NOT NULL THEN
    v_slot_id := gen_random_uuid();
    INSERT INTO public.membership_slots (id, venue_id, court_id, name, playing_days, start_time, end_time, monthly_fee, capacity, allow_guest_play, is_published, is_recruiting)
    VALUES (v_slot_id, v_venue1_id, v_court1_ids[1], 'Morning Smashers (MWF)', ARRAY['mon', 'wed', 'fri']::day_of_week[], '06:00', '08:00', 150000, 6, true, true, true);
    
    FOR i IN 1..5 LOOP
      INSERT INTO public.members (slot_id, customer_id, is_active) 
      VALUES (v_slot_id, v_cust_ids[i], true)
      RETURNING id INTO v_temp_id;

      -- Generate past 2 months of PAID payments
      FOR j IN 1..2 LOOP
        INSERT INTO public.membership_payments (member_id, slot_id, amount, billing_period, due_date, status)
        VALUES (
          v_temp_id, v_slot_id, 150000, 
          date_trunc('month', CURRENT_DATE - (j || ' months')::interval)::DATE,
          (date_trunc('month', CURRENT_DATE - (j || ' months')::interval) + INTERVAL '7 days')::DATE,
          'paid'
        );
      END LOOP;

      -- Note: Current month DUE payment is automatically generated by the 007 trigger!
    END LOOP;
  END IF;

  IF v_owner2_id IS NOT NULL THEN
    v_slot_id := gen_random_uuid();
    INSERT INTO public.membership_slots (id, venue_id, court_id, name, playing_days, start_time, end_time, monthly_fee, capacity, allow_guest_play, is_published, is_recruiting)
    VALUES (v_slot_id, v_venue2_id, v_court2_ids[1], 'Velachery Warriors', ARRAY['tue', 'thu', 'sat']::day_of_week[], '19:00', '21:00', 200000, 8, true, true, true);
    
    FOR i IN 6..12 LOOP
      INSERT INTO public.members (slot_id, customer_id, is_active) 
      VALUES (v_slot_id, v_cust_ids[i], CASE WHEN i=12 THEN false ELSE true END)
      RETURNING id INTO v_temp_id;

      -- Generate past 2 months of PAID payments
      FOR j IN 1..2 LOOP
        INSERT INTO public.membership_payments (member_id, slot_id, amount, billing_period, due_date, status)
        VALUES (
          v_temp_id, v_slot_id, 200000, 
          date_trunc('month', CURRENT_DATE - (j || ' months')::interval)::DATE,
          (date_trunc('month', CURRENT_DATE - (j || ' months')::interval) + INTERVAL '7 days')::DATE,
          'paid'
        );
      END LOOP;

      -- Handle current month payment
      IF i = 12 THEN
        -- Overdue for the inactive member (Trigger didn't fire because is_active = false)
        INSERT INTO public.membership_payments (member_id, slot_id, amount, billing_period, due_date, status)
        VALUES (
          v_temp_id, v_slot_id, 200000, 
          date_trunc('month', CURRENT_DATE)::DATE,
          (date_trunc('month', CURRENT_DATE) + INTERVAL '7 days')::DATE,
          'overdue'
        );
      ELSE
        -- Paid for the active members (Trigger already generated it as 'due', so we just update it)
        UPDATE public.membership_payments 
        SET status = 'paid' 
        WHERE member_id = v_temp_id AND billing_period = date_trunc('month', CURRENT_DATE)::DATE;
      END IF;
    END LOOP;
  END IF;

END $$;
