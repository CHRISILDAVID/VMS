Hello! You are a senior React developer stepping in to lead the development of Milestone 7 for "Badminton Manager (VMS)". 

### Project Context
VMS is a multi-app venue management system for badminton court owners built in a `pnpm` monorepo.
- `apps/owner/`: A React Native (Expo) mobile app for venue owners. (Milestones 0-6 are completed).
- `packages/shared/`: A shared library containing our Supabase client, database types (`src/types/database.ts`), and reusable service layers. 
- `supabase/`: Contains all database migrations (`001` through `009`) and seed scripts.
- `apps/admin/`: A Vite + React + TailwindCSS web application. **This is your primary focus.** It is currently just a minimal skeleton.

### Your Goal: Milestone 7 (Admin Panel)
You will be building the Admin Panel for the Super Admins of the platform. We need a desktop-first layout (Sidebar + Content Area). 

Key deliverables include:
1. **Admin Auth:** Email/password login via Supabase.
2. **Venues Management:** Create, edit, and deactivate venues. (Make `owner_id` nullable in DB if necessary so venues can be created before assigning an owner).
3. **Courts Management:** Create and edit courts per venue (including court type metadata).
4. **Owners Management:** View owner accounts and assign them to venues.
5. **Dashboard:** A simple dashboard aggregating total venues, owners, and bookings.
6. **Owner Onboarding Sync:** If necessary, adjust the owner app's onboarding to select pre-created unassigned venues from a dropdown instead of text input.

### Mandatory Rules & Constraints (from AGENTS.md)
Before you write any code, you MUST adhere to the following project rules:
1. **Documents Review:** Fully analyze the `documents/` folder (`10-development-roadmap.md`, `08-frontend-architecture.md`, `06-database-design.md`) to understand the architecture and priorities.
2. **Design Reference:** When designing the frontend, always refer to the `reference/` folder (which contains archived Figma exports). Make sure the UI matches the established intent while maintaining consistency with Tailwind v4. Use rich aesthetics, it shouldn't look like a cheap MVP.
3. **Database Tracking:** Track any database schema changes or new RLS policies (e.g., `super_admin` role policies) with properly numbered migrations in `supabase/migrations/`.
4. **Remote Database Access:** Do NOT use `npx supabase db dump` or other Docker-dependent CLI commands to interact with the database. If you need to run queries or apply migrations directly to the remote Supabase database, create a short Node.js script using the `pg` library in a dedicated `database_temps/` folder and use the direct PostgreSQL connection string. Keep the codebase clean.

Please review the roadmap, spin up `pnpm dev:admin`, and present an `implementation_plan.md` for the Admin Panel layout and Authentication as your first step!
