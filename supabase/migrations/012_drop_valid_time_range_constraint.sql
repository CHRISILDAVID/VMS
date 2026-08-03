-- Drop the valid_time_range constraint from pricing_blocks to allow 00:00 end times
ALTER TABLE public.pricing_blocks DROP CONSTRAINT IF EXISTS valid_time_range;
