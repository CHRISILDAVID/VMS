-- Migration 008: KPI Functions for Profile Widget

CREATE OR REPLACE FUNCTION get_venue_kpis(p_venue_id UUID)
RETURNS TABLE (
  active_members BIGINT,
  total_bookings BIGINT,
  booking_revenue BIGINT,
  membership_revenue BIGINT,
  total_revenue BIGINT
) AS $$
DECLARE
  v_start_of_month DATE := date_trunc('month', CURRENT_DATE)::DATE;
  v_end_of_month DATE := (date_trunc('month', CURRENT_DATE) + interval '1 month - 1 day')::DATE;
BEGIN
  RETURN QUERY
  WITH member_stats AS (
    SELECT count(m.id) AS active_members
    FROM members m
    JOIN membership_slots ms ON m.slot_id = ms.id
    WHERE ms.venue_id = p_venue_id 
      AND m.is_active = true 
      AND m.deleted_at IS NULL 
      AND ms.deleted_at IS NULL
  ),
  booking_stats AS (
    SELECT 
      count(b.id) FILTER (WHERE b.status != 'cancelled') AS total_bookings,
      COALESCE(SUM(b.final_amount) FILTER (WHERE b.payment_status = 'paid'), 0) AS booking_revenue
    FROM bookings b
    WHERE b.venue_id = p_venue_id
      AND b.date >= v_start_of_month
      AND b.date <= v_end_of_month
      AND b.deleted_at IS NULL
  ),
  membership_stats AS (
    SELECT COALESCE(SUM(mp.amount), 0) AS membership_revenue
    FROM membership_payments mp
    JOIN membership_slots ms ON mp.slot_id = ms.id
    WHERE ms.venue_id = p_venue_id
      AND mp.billing_period >= v_start_of_month
      AND mp.billing_period <= v_end_of_month
      AND mp.status = 'paid'
      AND mp.is_voided = false
      AND ms.deleted_at IS NULL
  )
  SELECT 
    m.active_members,
    b.total_bookings,
    b.booking_revenue,
    ms.membership_revenue,
    (b.booking_revenue + ms.membership_revenue) AS total_revenue
  FROM member_stats m
  CROSS JOIN booking_stats b
  CROSS JOIN membership_stats ms;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
