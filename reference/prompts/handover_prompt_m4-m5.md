Hello! You are stepping in to continue development on **Badminton Manager (VMS)**, a multi-app venue management system for badminton court owners.

### 📍 Current Project State
We are working in a `pnpm` monorepo with the following structure:
- `apps/owner/` (React Native + Expo + NativeWind) — *The primary mobile app we are currently building.*
- `apps/admin/` (React + Vite + Tailwind) — *A desktop web app stub (deferred to later).*
- `packages/shared/` (TypeScript) — *Shared services, utility functions (e.g., `formatCurrency`), and Supabase client.*
- `supabase/` — *Contains all database migrations, seed data scripts, and Edge Functions.*
- `documents/` — *Contains our roadmap and architectural planning docs.*

### ✅ What is Completed (Milestones 0 - 4)
We have fully completed Milestones 0 through 4. The `owner` app currently supports:
1. **Auth & Setup:** OTP/Password auth via Supabase, venue switching.
2. **Schedule & Bookings:** A visual timeline grid for court bookings. Owners can create, edit, move, and cancel bookings.
3. **Memberships:** Owners can create membership slots, assign members to slots, and manage guest plays.
4. **Payments:** An automated PostgreSQL cron job (via Edge Function) generates monthly payments. The UI displays payments and allows the owner to mark them as paid via cash/UPI. 

*(Note: All monetary values in the database like `total_spent`, `final_amount`, `monthly_fee`, and `amount` are stored in **paise** (1/100th of a Rupee) and formatted in the UI using the shared `formatCurrency` utility).*

### 🚀 Your Mission (Milestone 5)
Your task is to start **Milestone 5 — Analytics & Settings (Owner)**. 
Please read `documents/10-development-roadmap.md` to see exactly what deliverables are expected for Milestone 5. This will involve building out the Profile tab, court settings, pricing block CRUD, and static pages like Help & Support.

### 🛑 CRITICAL RULES (MUST FOLLOW)
Before you write any code, you MUST read the `AGENTS.md` file in the root directory. It contains mandatory rules for this repository. In particular:
1. **Design Reference:** ALWAYS refer to the `reference/` folder (Figma exports) when designing frontend pages. Do not invent random UI designs; match the established UI patterns in the codebase and Figma.
2. **Mobile App Testing:** When developing `apps/owner/`, ALWAYS actively interact with and test your changes using the Android Emulator via `adb` commands (e.g., `adb shell input tap`, `adb exec-out screencap -p`). Never assume a UI bug fix is complete without E2E verification via screenshot.
3. **Database Tracking:** Any database schema changes must be tracked with proper numbered migrations in `supabase/migrations/` and numbered seed query files. Do not modify existing past migrations.

Please begin by reviewing `documents/10-development-roadmap.md` for Milestone 5, and then outline your plan for the first deliverable!

You can also review the current state of the app by accessing the android emulator running.