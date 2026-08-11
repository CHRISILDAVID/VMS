# Supabase Development Setup (Remote Dev Environment)

This guide outlines how to interact with the **Remote Development** Supabase project. 
(Note: This project does not use a local Docker-based Supabase instance. Both Dev and Prod are remote Supabase projects).

## 1. Link Your Dev Project
Connect your local CLI to your remote **Dev** Supabase project. 
```bash
npx supabase login
npx supabase link --project-ref <your-dev-project-ref>
```

## 2. Configure Environment Variables
Ensure your application environments (`apps/owner/.env`, `apps/player/.env`, `apps/admin/.env`) point to your **Dev** project credentials:
```env
EXPO_PUBLIC_SUPABASE_URL=https://<your-dev-project-ref>.supabase.co
EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_dev_anon_key
```

## 3. Apply Migrations (Push to Dev)
To apply new migrations (like `014_player_core.sql`) to your remote Dev database:
```bash
npx supabase db push
```
This reads `supabase/migrations/` and applies any scripts that haven't been applied yet.

## 4. Seeding Data (Dev Only)
To populate your remote Dev database with dummy testing data, run the seed files manually:
```bash
npx supabase db query -f supabase/seed_m1.sql
npx supabase db query -f supabase/seed_m2.sql
npx supabase db query -f supabase/seed_m3.sql
npx supabase db query -f supabase/seed_m3_fixes.sql
```
*(Never run these on the Prod project!)*

## 5. Edge Functions
To deploy edge functions to your Dev environment:
```bash
npx supabase functions deploy <function-name>
```

---

## ⚠️ Important: Rolling Back a Remote Database

Because we are working with a **remote** database rather than a local Docker instance, you **cannot** simply delete a migration file and run `npx supabase db reset`. 

If you push a migration (like 014) to the remote Dev DB and later decide you want to completely scratch the code and revert the database, you have two options:

**Option A: Manual Cleanup (Recommended for small changes)**
1. Open the Supabase Dashboard for your Dev project in the browser.
2. Go to the SQL Editor.
3. Manually write and execute `DROP TABLE players CASCADE;`, `DROP TABLE system_config;`, etc. to remove the tables created by the migration.
4. Delete the `014_player_core.sql` record from the `supabase_migrations.schema_migrations` table so Supabase forgets it was applied.

**Option B: Full Project Reset (Wipes all Dev data)**
If the database gets too messy, you can reset the entire remote project from the Supabase Dashboard (Project Settings -> Database -> Reset Database). This will wipe **everything**. You would then run `npx supabase db push` to reapply migrations 001-013, and re-run your seed scripts to get your test data back.
