# Supabase Development Setup (Local)

This guide outlines how to set up the local Supabase environment for development and testing.

## Prerequisites
- Docker must be installed and running.
- Supabase CLI installed globally (`npm install -g supabase` or run via `npx supabase`).

## 1. Start Local Supabase
Ensure Docker is running, then run:
```bash
npx supabase start
```
This will spin up Postgres, GoTrue (Auth), PostgREST, Realtime, and Storage locally.

## 2. Connect the App
The local `supabase start` command will print out the `API URL` and `anon key`. 
Ensure your `apps/owner/.env` and `apps/admin/.env` are pointing to these local credentials if you want to test locally:
```env
EXPO_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_local_anon_key
```

## 3. Apply Migrations
Supabase CLI automatically applies migrations from `supabase/migrations/` in alphabetical/numerical order when you run `supabase start` or `supabase db reset`.

If you created a new migration and want to apply it manually:
```bash
npx supabase db reset
```

The execution order is always:
1. `001_initial_schema.sql` (Auth triggers, core tables)
2. `002_schedules_pricing.sql` (Courts, Slots)
3. `003_bookings_customers.sql` (Customers, Guests)
4. `004_memberships.sql` (Memberships, Edge functions prep)
5. `005_membership_payments.sql` (Payments, Storage, pg_cron)

## 4. Seeding Data (Local Only)
We use seed files to populate the local database with dummy data for testing.
You can run the seed files manually:
```bash
npx supabase db query -f supabase/seed_m1.sql --local
npx supabase db query -f supabase/seed_m2.sql --local
npx supabase db query -f supabase/seed_m3.sql --local
npx supabase db query -f supabase/seed_m3_fixes.sql --local
```

*(Note: `supabase db reset` automatically runs `supabase/seed.sql` if it exists. We maintain numbered seed scripts for modularity).*

## 5. Edge Functions
To test the monthly payments cron job locally:
```bash
npx supabase functions serve
```
And trigger it using `curl` or Postman.
