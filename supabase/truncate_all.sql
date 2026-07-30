-- Run this in the Supabase SQL Editor to clear all operational data while preserving your schema.
-- This will CASCADE delete records starting from venues, which removes everything underneath.
-- If you ONLY want to clear operational data (bookings, memberships, payments) but keep Venues and Customers, run the second block instead.

-- OPTION 1: Nuke EVERYTHING (Venues, Courts, Customers, Bookings, Memberships, Payments)
TRUNCATE TABLE venues CASCADE;
TRUNCATE TABLE customers CASCADE;
TRUNCATE TABLE owners CASCADE;
TRUNCATE TABLE courts CASCADE;


-- OPTION 2: Keep Venues/Courts and Customers, but clear all Bookings, Memberships, and Payments.
TRUNCATE TABLE membership_payments CASCADE;
TRUNCATE TABLE membership_applications CASCADE;
TRUNCATE TABLE members CASCADE;
TRUNCATE TABLE membership_slots CASCADE;
TRUNCATE TABLE bookings CASCADE;

-- Reset sequences if you have any serial columns (UUIDs don't need this).
