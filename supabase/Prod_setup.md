# Supabase Production Setup (Remote)

This guide outlines how to deploy the database schema and edge functions to your live Supabase project.

## 1. Link Your Project
Connect your local CLI to your remote Supabase project. Find your project reference ID in the Supabase Dashboard URL.
```bash
npx supabase login
npx supabase link --project-ref <your-project-ref>
```

## 2. Configure Environment Variables
Update your application environments (`apps/owner/.env` etc.) with your **remote** project details:
```env
EXPO_PUBLIC_SUPABASE_URL=https://<your-project-ref>.supabase.co
EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_remote_anon_key
```

## 3. Push Migrations
Deploy your database schema to production. This will run all scripts in `supabase/migrations/` sequentially on the remote database.
```bash
npx supabase db push
```
**Important:** Do NOT run the seed queries (`seed_m1.sql`, etc.) on production. They contain dummy testing data (like "Test Brother" and fake phone numbers) that you do not want in your live environment!

## 4. Deploy Edge Functions
Deploy the `generate-membership-payments` function to the cloud:
```bash
npx supabase functions deploy generate-membership-payments
```

## 5. Set up Secrets for Edge Functions
The pg_cron job in the database calls the edge function. If you implement the cron job using a service role key, you need to store it securely in Supabase Vault or pass it securely.

*Note: For the current implementation, the Cron Job is left commented out in `005_membership_payments.sql` for safety until you are ready to insert your live endpoint URL and Service Role Key.*

## 6. Type Generation
After pushing any new migrations to production, always update your TypeScript types locally:
```bash
pnpm db:types
```
This ensures your React/React Native apps are aware of any database schema changes.
