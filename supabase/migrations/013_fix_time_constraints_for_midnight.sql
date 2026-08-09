-- Fix time constraints for midnight bookings
-- Drop existing constraints
ALTER TABLE public.bookings DROP CONSTRAINT IF EXISTS valid_booking_time;
ALTER TABLE public.membership_slots DROP CONSTRAINT IF EXISTS valid_membership_time;

-- Add updated constraints that allow end_time = 00:00:00
ALTER TABLE public.bookings ADD CONSTRAINT valid_booking_time 
  CHECK (end_time > start_time OR end_time = '00:00:00'::time);

ALTER TABLE public.membership_slots ADD CONSTRAINT valid_membership_time 
  CHECK (end_time > start_time OR end_time = '00:00:00'::time);
