-- ═══════════════════════════════════════════════════════════════
-- Seed M2: Customers & Bookings Sample Data
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
  v_today DATE := CURRENT_DATE;
  v_tomorrow DATE := CURRENT_DATE + INTERVAL '1 day';
  v_yesterday DATE := CURRENT_DATE - INTERVAL '1 day';
BEGIN
  -- Get existing owner, venue, courts from seed_m1
  SELECT id INTO v_owner_id FROM owners LIMIT 1;
  SELECT id INTO v_venue_id FROM venues WHERE owner_id = v_owner_id LIMIT 1;
  SELECT id INTO v_court1_id FROM courts WHERE venue_id = v_venue_id ORDER BY sort_order ASC LIMIT 1;
  SELECT id INTO v_court2_id FROM courts WHERE venue_id = v_venue_id ORDER BY sort_order DESC LIMIT 1;

  IF v_owner_id IS NOT NULL AND v_venue_id IS NOT NULL AND v_court1_id IS NOT NULL THEN
    
    -- 1. Create Customers
    INSERT INTO customers (owner_id, full_name, phone, email, notes, total_visits, total_spent)
    VALUES 
      (v_owner_id, 'Rahul Sharma', '9876543210', 'rahul@example.com', 'Regular evening player', 5, 200000)
    ON CONFLICT (owner_id, phone) DO UPDATE SET full_name = EXCLUDED.full_name
    RETURNING id INTO v_cust_rahul;

    INSERT INTO customers (owner_id, full_name, phone, email, notes, total_visits, total_spent)
    VALUES 
      (v_owner_id, 'Priya Patel', '9876543211', 'priya@example.com', 'Prefers Court 1 wooden', 3, 120000)
    ON CONFLICT (owner_id, phone) DO UPDATE SET full_name = EXCLUDED.full_name
    RETURNING id INTO v_cust_priya;

    INSERT INTO customers (owner_id, full_name, phone, email, notes, total_visits, total_spent)
    VALUES 
      (v_owner_id, 'Amit Kumar', '9876543212', 'amit@example.com', 'Weekend tournament player', 1, 40000)
    ON CONFLICT (owner_id, phone) DO UPDATE SET full_name = EXCLUDED.full_name
    RETURNING id INTO v_cust_amit;

    INSERT INTO customers (owner_id, full_name, phone, email, notes, total_visits, total_spent)
    VALUES 
      (v_owner_id, 'Sneha Gupta', '9876543213', 'sneha@example.com', null, 2, 80000)
    ON CONFLICT (owner_id, phone) DO UPDATE SET full_name = EXCLUDED.full_name
    RETURNING id INTO v_cust_sneha;

    -- 2. Create Bookings
    -- Booking 1: Upcoming today (10:00 - 11:00 on Court 1 by Rahul) - Paid
    INSERT INTO bookings (
      booking_number, venue_id, court_id, customer_id, booked_by,
      date, start_time, end_time, duration_minutes,
      base_amount, discount, final_amount, advance, pending,
      status, payment_status, payment_mode, source, slot_type
    ) VALUES (
      'BK-' || TO_CHAR(v_today, 'YYYYMMDD') || '-1001',
      v_venue_id, v_court1_id, v_cust_rahul, v_owner_id,
      v_today, '10:00:00', '11:00:00', 60,
      40000, 0, 40000, 40000, 0,
      'upcoming', 'paid', 'upi', 'offline', 'booked'
    ) ON CONFLICT (booking_number) DO NOTHING;

    -- Booking 2: Upcoming today evening (18:00 - 20:00 on Court 2 by Priya) - Partial advance
    INSERT INTO bookings (
      booking_number, venue_id, court_id, customer_id, booked_by,
      date, start_time, end_time, duration_minutes,
      base_amount, discount, final_amount, advance, pending,
      status, payment_status, payment_mode, source, slot_type, notes
    ) VALUES (
      'BK-' || TO_CHAR(v_today, 'YYYYMMDD') || '-1002',
      v_venue_id, v_court2_id, v_cust_priya, v_owner_id,
      v_today, '18:00:00', '20:00:00', 120,
      100000, 10000, 90000, 30000, 60000,
      'upcoming', 'partial', 'google_pay', 'walk_in', 'booked', 'Discount applied for 2 hours'
    ) ON CONFLICT (booking_number) DO NOTHING;

    -- Booking 3: Completed yesterday (16:00 - 17:00 on Court 1 by Amit) - Paid
    INSERT INTO bookings (
      booking_number, venue_id, court_id, customer_id, booked_by,
      date, start_time, end_time, duration_minutes,
      base_amount, discount, final_amount, advance, pending,
      status, payment_status, payment_mode, source, slot_type
    ) VALUES (
      'BK-' || TO_CHAR(v_yesterday, 'YYYYMMDD') || '-0901',
      v_venue_id, v_court1_id, v_cust_amit, v_owner_id,
      v_yesterday, '16:00:00', '17:00:00', 60,
      40000, 0, 40000, 40000, 0,
      'completed', 'paid', 'cash', 'offline', 'booked'
    ) ON CONFLICT (booking_number) DO NOTHING;

    -- Booking 4: Tomorrow (07:00 - 09:00 on Court 1 by Sneha) - Pending payment
    INSERT INTO bookings (
      booking_number, venue_id, court_id, customer_id, booked_by,
      date, start_time, end_time, duration_minutes,
      base_amount, discount, final_amount, advance, pending,
      status, payment_status, payment_mode, source, slot_type
    ) VALUES (
      'BK-' || TO_CHAR(v_tomorrow, 'YYYYMMDD') || '-1101',
      v_venue_id, v_court1_id, v_cust_sneha, v_owner_id,
      v_tomorrow, '07:00:00', '09:00:00', 120,
      80000, 0, 80000, 0, 80000,
      'upcoming', 'pending', null, 'offline', 'booked'
    ) ON CONFLICT (booking_number) DO NOTHING;

  END IF;
END $$;
