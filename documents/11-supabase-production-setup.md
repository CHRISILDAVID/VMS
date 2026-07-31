# Supabase Production Setup Guide

This guide outlines the exact steps needed to replicate the entire database schema, edge functions, and authentication settings from the development environment to a fresh Supabase project for production (e.g., the founder's Supabase account).

## Prerequisites
- A fresh Supabase project
- Supabase CLI installed locally (`npm install -g supabase` or via Homebrew/Scoop)
- Twilio account (for OTP SMS)

## Step 1: Link the Local Project to Production

1. Log in to the Supabase CLI with the new account:
   ```bash
   npx supabase login
   ```
2. Link your local directory to the production project (you will need the Project ID from the Supabase dashboard URL):
   ```bash
   npx supabase link --project-ref <production-project-id>
   ```
3. Enter your database password when prompted.

## Step 2: Push Database Migrations

The local `supabase/migrations/` folder contains the entire schema history. You can push it directly to production.

1. Push all migrations:
   ```bash
   npx supabase db push
   ```
   *This creates all tables (`owners`, `venues`, `courts`, `bookings`, etc.), enums, and row-level security (RLS) policies.*

2. Push the remote schema types to verify they match:
   ```bash
   pnpm db:types
   ```

## Step 3: Configure Authentication (Phone OTP)

1. In the Supabase Dashboard, go to **Authentication > Providers**.
2. Enable **Phone** as a provider.
3. Select **Twilio** (or your preferred SMS provider) and enter the required credentials (Account SID, Auth Token, Message Service SID/Sender Phone Number).
4. Save the configuration.

## Step 4: Deploy Edge Functions

We use an edge function (`create-owner-account`) to securely create owner accounts from the Admin Panel.

1. Deploy the edge function to production:
   ```bash
   npx supabase functions deploy create-owner-account
   ```
2. Set any environment variables required by the function (if applicable):
   ```bash
   npx supabase secrets set --env-file ./supabase/.env
   ```

## Step 5: Configure Storage Buckets

Migrations generally do not create storage buckets natively unless specifically scripted via SQL. Ensure the following buckets exist in the Supabase Dashboard under **Storage**:

1. **`receipts`**
   - Public: `true` (if receipts need to be publicly viewable) or configure proper RLS policies for authenticated access.
2. **`venue-photos`**
   - Public: `true` (so the mobile app can load the images directly via URL).
   - *Ensure the RLS policies defined in Migration 010 are applied (these should apply automatically if they were included in the SQL migration).*

## Step 6: Create the Super Admin

Since the Admin Panel is the only way to create venues and owners, you need at least one initial Super Admin account to access it.

1. Create a user manually in the Supabase Dashboard under **Authentication > Users**, or sign up via the app using a phone number.
2. Get the new user's `id` (UUID).
3. Open the **SQL Editor** in the Supabase Dashboard and insert the owner record with the `super_admin` role:
   ```sql
   INSERT INTO public.owners (id, full_name, business_name, phone, role)
   VALUES (
     'the-uuid-from-auth-users',
     'Admin Name',
     'Admin Business',
     '+919876543210', -- Must match the auth.users phone
     'super_admin'
   );
   ```

## Step 7: Update Environment Variables

Finally, update your production environment variables (for Vercel, Expo, etc.) to point to the new Supabase project:
- `VITE_SUPABASE_URL` / `EXPO_PUBLIC_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY` / `EXPO_PUBLIC_SUPABASE_ANON_KEY`
