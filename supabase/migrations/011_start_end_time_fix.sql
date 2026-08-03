-- 011_start_end_time_fix.sql
-- Add open_time and close_time to venues to dictate the schedule page bounds

ALTER TABLE public.venues
ADD COLUMN IF NOT EXISTS open_time time without time zone NOT NULL DEFAULT '06:00:00',
ADD COLUMN IF NOT EXISTS close_time time without time zone NOT NULL DEFAULT '22:00:00';
