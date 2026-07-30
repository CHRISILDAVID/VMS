-- ═══════════════════════════════════════════════════════════════
-- Seed Extra Venues and Courts for Testing
-- Run this in the Supabase SQL Editor
-- ═══════════════════════════════════════════════════════════════

DO $$ 
DECLARE
  v_owner_id UUID;
  v_venue2_id UUID;
  v_venue3_id UUID;
BEGIN
  -- Get existing owner
  SELECT id INTO v_owner_id FROM owners LIMIT 1;

  IF v_owner_id IS NOT NULL THEN
    
    -- Insert Venue 2
    INSERT INTO venues (owner_id, name, address, city, state, pincode, contact_phone, court_type, amenities, is_active)
    VALUES (
      v_owner_id, 
      'Downtown Badminton Arena', 
      '45 Park Avenue', 
      'Mumbai', 
      'Maharashtra', 
      '400001', 
      '9988776655', 
      'synthetic', 
      ARRAY['parking', 'restroom', 'water', 'pro_shop'], 
      true
    )
    RETURNING id INTO v_venue2_id;

    -- Insert Courts for Venue 2
    INSERT INTO courts (venue_id, name, court_type, sort_order) VALUES (v_venue2_id, 'Court A', 'synthetic', 1);
    INSERT INTO courts (venue_id, name, court_type, sort_order) VALUES (v_venue2_id, 'Court B', 'synthetic', 2);
    INSERT INTO courts (venue_id, name, court_type, sort_order) VALUES (v_venue2_id, 'Court C', 'synthetic', 3);

    -- Insert Venue 3
    INSERT INTO venues (owner_id, name, address, city, state, pincode, contact_phone, court_type, amenities, is_active)
    VALUES (
      v_owner_id, 
      'Skyline Sports Complex', 
      '12th Cross Road, HSR Layout', 
      'Bangalore', 
      'Karnataka', 
      '560102', 
      '9988774433', 
      'wooden', 
      ARRAY['parking', 'restroom', 'water', 'cafe'], 
      true
    )
    RETURNING id INTO v_venue3_id;

    -- Insert Courts for Venue 3
    INSERT INTO courts (venue_id, name, court_type, sort_order) VALUES (v_venue3_id, 'Wooden Court 1', 'wooden', 1);
    INSERT INTO courts (venue_id, name, court_type, sort_order) VALUES (v_venue3_id, 'Wooden Court 2', 'wooden', 2);

    RAISE NOTICE 'Extra venues and courts seeded successfully!';
  ELSE
    RAISE NOTICE 'Owner not found, cannot seed extra venues.';
  END IF;
END $$;
