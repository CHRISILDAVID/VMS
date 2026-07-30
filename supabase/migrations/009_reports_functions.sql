-- Migration 009: Reports Chart Data

CREATE OR REPLACE FUNCTION get_reports_chart_data(p_venue_id UUID, p_time_filter TEXT)
RETURNS JSONB AS $$
DECLARE
  v_current_start DATE;
  v_current_end DATE;
  v_prev_start DATE;
  v_prev_end DATE;
  
  v_curr_rev BIGINT := 0;
  v_prev_rev BIGINT := 0;
  
  v_curr_occ_slots BIGINT := 0;
  v_curr_total_slots BIGINT := 0;
  v_curr_occupancy NUMERIC := 0;
  
  v_prev_occ_slots BIGINT := 0;
  v_prev_total_slots BIGINT := 0;
  v_prev_occupancy NUMERIC := 0;
  
  v_outstanding BIGINT := 0;
  v_pending_count INT := 0;
  
  v_curr_members INT := 0;
  v_prev_members INT := 0;
  
  v_chart_data JSONB := '[]'::JSONB;
  
  v_mem_pending BIGINT := 0;
  v_mem_count INT := 0;
BEGIN
  -- Determine date ranges based on p_time_filter ('week', 'month', 'year')
  IF p_time_filter = 'week' THEN
    v_current_start := date_trunc('week', CURRENT_DATE)::DATE;
    v_current_end := (v_current_start + interval '6 days')::DATE;
    v_prev_start := (v_current_start - interval '1 week')::DATE;
    v_prev_end := (v_current_end - interval '1 week')::DATE;
  ELSIF p_time_filter = 'year' THEN
    v_current_start := date_trunc('year', CURRENT_DATE)::DATE;
    v_current_end := (v_current_start + interval '1 year - 1 day')::DATE;
    v_prev_start := (v_current_start - interval '1 year')::DATE;
    v_prev_end := (v_current_end - interval '1 year')::DATE;
  ELSE -- 'month'
    v_current_start := date_trunc('month', CURRENT_DATE)::DATE;
    v_current_end := (v_current_start + interval '1 month - 1 day')::DATE;
    v_prev_start := (v_current_start - interval '1 month')::DATE;
    v_prev_end := (v_current_end - interval '1 month')::DATE;
  END IF;

  -- 1. Revenue
  SELECT COALESCE(SUM(final_amount) FILTER (WHERE payment_status = 'paid' AND date >= v_current_start AND date <= v_current_end), 0) INTO v_curr_rev
  FROM bookings WHERE venue_id = p_venue_id AND deleted_at IS NULL;
  
  SELECT COALESCE(SUM(final_amount) FILTER (WHERE payment_status = 'paid' AND date >= v_prev_start AND date <= v_prev_end), 0) INTO v_prev_rev
  FROM bookings WHERE venue_id = p_venue_id AND deleted_at IS NULL;
  
  -- Membership revenue (using billing_period)
  v_curr_rev := v_curr_rev + COALESCE((
    SELECT SUM(mp.amount) 
    FROM membership_payments mp 
    JOIN membership_slots ms ON mp.slot_id = ms.id 
    WHERE ms.venue_id = p_venue_id AND mp.status = 'paid' AND mp.is_voided = false 
      AND mp.billing_period >= v_current_start AND mp.billing_period <= v_current_end
  ), 0);
  
  v_prev_rev := v_prev_rev + COALESCE((
    SELECT SUM(mp.amount) 
    FROM membership_payments mp 
    JOIN membership_slots ms ON mp.slot_id = ms.id 
    WHERE ms.venue_id = p_venue_id AND mp.status = 'paid' AND mp.is_voided = false 
      AND mp.billing_period >= v_prev_start AND mp.billing_period <= v_prev_end
  ), 0);

  -- 2. Occupancy (Approximation based on bookings vs total available hours)
  SELECT count(*) INTO v_curr_total_slots FROM courts WHERE venue_id = p_venue_id AND deleted_at IS NULL;
  IF v_curr_total_slots > 0 THEN
      -- Booked duration in minutes for current period
      SELECT COALESCE(SUM(duration_minutes), 0) INTO v_curr_occ_slots 
      FROM bookings 
      WHERE venue_id = p_venue_id AND date >= v_current_start AND date <= v_current_end 
        AND status != 'cancelled' AND deleted_at IS NULL;
      
      -- Booked duration for prev period
      SELECT COALESCE(SUM(duration_minutes), 0) INTO v_prev_occ_slots 
      FROM bookings 
      WHERE venue_id = p_venue_id AND date >= v_prev_start AND date <= v_prev_end 
        AND status != 'cancelled' AND deleted_at IS NULL;
        
      -- Assume 14 hours per day open (840 minutes)
      v_curr_occupancy := ROUND((v_curr_occ_slots::NUMERIC / (v_curr_total_slots * 840 * GREATEST(1, (v_current_end - v_current_start + 1)))) * 100, 1);
      v_prev_occupancy := ROUND((v_prev_occ_slots::NUMERIC / (v_curr_total_slots * 840 * GREATEST(1, (v_prev_end - v_prev_start + 1)))) * 100, 1);
  END IF;

  -- 3. Outstanding (Pending payments total across bookings and memberships)
  SELECT 
    COALESCE(SUM(pending), 0),
    COUNT(*) FILTER (WHERE pending > 0)
  INTO v_outstanding, v_pending_count
  FROM bookings 
  WHERE venue_id = p_venue_id AND payment_status IN ('pending', 'partial') AND deleted_at IS NULL;
  
  -- Add membership outstanding
  SELECT COALESCE(SUM(mp.amount), 0), COUNT(*) 
  INTO v_mem_pending, v_mem_count
  FROM membership_payments mp 
  JOIN membership_slots ms ON mp.slot_id = ms.id 
  WHERE ms.venue_id = p_venue_id AND mp.status IN ('due', 'overdue') AND mp.is_voided = false;
  
  v_outstanding := v_outstanding + v_mem_pending;
  v_pending_count := v_pending_count + v_mem_count;

  -- 4. Membership (Active members now vs previous)
  SELECT count(m.id) INTO v_curr_members
  FROM members m JOIN membership_slots ms ON m.slot_id = ms.id
  WHERE ms.venue_id = p_venue_id AND m.is_active = true AND m.deleted_at IS NULL AND ms.deleted_at IS NULL;
  
  SELECT count(m.id) INTO v_prev_members
  FROM members m JOIN membership_slots ms ON m.slot_id = ms.id
  WHERE ms.venue_id = p_venue_id AND m.is_active = true AND m.created_at <= v_prev_end AND m.deleted_at IS NULL AND ms.deleted_at IS NULL;

  -- 5. Chart Data (Revenue Trend)
  IF p_time_filter = 'week' THEN
    -- Group by day of week
    SELECT jsonb_agg(jsonb_build_object(
      'label', to_char(d, 'Dy'),
      'value', COALESCE((
        SELECT SUM(final_amount) 
        FROM bookings 
        WHERE venue_id = p_venue_id AND date = d AND payment_status = 'paid' AND deleted_at IS NULL
      ), 0) + COALESCE((
        SELECT SUM(mp.amount) 
        FROM membership_payments mp 
        JOIN membership_slots ms ON mp.slot_id = ms.id 
        WHERE ms.venue_id = p_venue_id AND mp.billing_period = d AND mp.status = 'paid' AND mp.is_voided = false
      ), 0)
    )) INTO v_chart_data
    FROM generate_series(v_current_start, v_current_end, '1 day'::interval) d;
  ELSIF p_time_filter = 'year' THEN
    -- Group by month
    SELECT jsonb_agg(jsonb_build_object(
      'label', to_char(d, 'Mon'),
      'value', COALESCE((
        SELECT SUM(final_amount) 
        FROM bookings 
        WHERE venue_id = p_venue_id AND date >= d AND date < (d + interval '1 month') AND payment_status = 'paid' AND deleted_at IS NULL
      ), 0) + COALESCE((
        SELECT SUM(mp.amount) 
        FROM membership_payments mp 
        JOIN membership_slots ms ON mp.slot_id = ms.id 
        WHERE ms.venue_id = p_venue_id AND mp.billing_period >= d AND mp.billing_period < (d + interval '1 month') AND mp.status = 'paid' AND mp.is_voided = false
      ), 0)
    )) INTO v_chart_data
    FROM generate_series(v_current_start, v_current_end, '1 month'::interval) d;
  ELSE 
    -- Month: Group by week
    SELECT jsonb_agg(jsonb_build_object(
      'label', 'W' || ((d::DATE - v_current_start) / 7 + 1)::TEXT,
      'value', COALESCE((
        SELECT SUM(final_amount) 
        FROM bookings 
        WHERE venue_id = p_venue_id AND date >= d::DATE AND date < LEAST(v_current_end + 1, (d + interval '7 days')::date) AND payment_status = 'paid' AND deleted_at IS NULL
      ), 0) + COALESCE((
        SELECT SUM(mp.amount) 
        FROM membership_payments mp 
        JOIN membership_slots ms ON mp.slot_id = ms.id 
        WHERE ms.venue_id = p_venue_id AND mp.billing_period >= d::DATE AND mp.billing_period < LEAST(v_current_end + 1, (d + interval '7 days')::date) AND mp.status = 'paid' AND mp.is_voided = false
      ), 0)
    )) INTO v_chart_data
    FROM generate_series(v_current_start::TIMESTAMP, v_current_end::TIMESTAMP, '7 days'::interval) d;
  END IF;

  RETURN jsonb_build_object(
    'summary', jsonb_build_object(
      'current', jsonb_build_object(
        'revenue', v_curr_rev,
        'occupancy', LEAST(v_curr_occupancy, 100),
        'outstanding', v_outstanding,
        'pending_count', v_pending_count,
        'members', v_curr_members
      ),
      'previous', jsonb_build_object(
        'revenue', v_prev_rev,
        'occupancy', LEAST(v_prev_occupancy, 100),
        'members', v_prev_members
      )
    ),
    'chart', v_chart_data
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
