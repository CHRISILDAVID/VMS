-- ═══════════════════════════════════════════════════════════════
-- Seed Script: Dummy Players for Social Features Testing
-- ═══════════════════════════════════════════════════════════════

DO $$
DECLARE
  v_player1_id UUID := gen_random_uuid();
  v_player2_id UUID := gen_random_uuid();
  v_player3_id UUID := gen_random_uuid();
BEGIN
  -- 1. Insert dummy auth users
  INSERT INTO auth.users (id, email, phone, encrypted_password, email_confirmed_at)
  VALUES 
    (v_player1_id, 'dummy1@shuttlehub.com', '919000000010', 'dummy', NOW()),
    (v_player2_id, 'dummy2@shuttlehub.com', '919000000011', 'dummy', NOW()),
    (v_player3_id, 'dummy3@shuttlehub.com', '919000000012', 'dummy', NOW());

  -- 2. Insert players referencing the auth users
  INSERT INTO public.players (
    id, full_name, phone, city, gender, player_id, player_id_verified, latitude, longitude, location_updated_at
  ) VALUES 
    (v_player1_id, 'Aarav Sharma', '919000000010', 'Chennai', 'male', 'SH1A2B', true, 12.9716, 77.5946, NOW()),
    (v_player2_id, 'Priya Patel', '919000000011', 'Bengaluru', 'female', 'SH3C4D', false, 13.0827, 80.2707, NOW()),
    (v_player3_id, 'Rohan Kumar', '919000000012', 'Delhi', 'male', null, false, 28.7041, 77.1025, NOW());

  RAISE NOTICE 'Seed players inserted successfully.';
END $$;
