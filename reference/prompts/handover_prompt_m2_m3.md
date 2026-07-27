# 🚀 Handover Assignment: Start Milestone 3 (Membership Management) — Badminton Manager (VMS)

Hello! You are taking over the development of the **Badminton Manager (VMS)** project. 
We have successfully completed and E2E verified **Milestone 0 (Setup)**, **Milestone 1 (Authentication + Schedule)**, and **Milestone 2 (Bookings & Customers)**. 

You are now tasked with starting and delivering **Milestone 3 (Membership Management)**.

---

## 🏛️ Project Architecture & Tech Stack
- **Owner App (`apps/owner/`)**: Mobile (Android/iOS) built with React Native (Expo Router) + NativeWind (Tailwind CSS for React Native) + Zustand + TanStack Query.
- **Admin Panel (`apps/admin/`)**: Web (Desktop) built with React + Vite + Tailwind CSS v4.
- **Shared Code (`packages/shared/`)**: TypeScript monorepo package containing shared database types, API services (`supabaseClient`, `bookings.service`, `customers.service`, `schedule.service`), and helper utilities.
- **Backend (`supabase/`)**: Cloud Supabase (PostgreSQL) with RLS policies and database triggers.

---

## ✅ Current State of the Codebase (End of Milestone 2)
- **Database Migrations (`supabase/migrations/`)**:
  - `001_initial_schema.sql`: Core enums (`slot_type`, `booking_status`, etc.), venues, courts, and owners. *(Note: As per founder guidance, `'maintenance'` was removed from `slot_type`—block slots are abstract and used instead).*
  - `002_schedules_pricing.sql`: Operating hours, pricing blocks, and peak hours.
  - `003_bookings_customers.sql`: `customers` and `bookings` tables with automatic triggers for booking number generation (`BK-YYYYMMDD-XXXX`), customer visit/spend statistics tracking, and RLS policies.
- **Seed Data**: `seed_m1.sql` and `seed_m2.sql` are available and populated in the database.
- **Schedule Grid (`apps/owner/features/schedule/`)**: Fully functioning Google Calendar-style timeline grid. Supports color-coded slot rendering, dimmed/disabled past time slots, bottom sheet quick actions, and conflict detection.
- **Bookings & Customers**: Complete 5-step booking wizard with auto-calculated rates (defaulting to ₹400/hr), inline customer creation, advance payment recording, status transitions (`upcoming` → `ongoing` → `completed`), rescheduling (Move Slot), and owner force-booking overrides on conflicting/blocked slots.

---

## 🎯 Your Scope: Milestone 3 (Membership Management)
Please refer to `documents/10-development-roadmap.md` under **Milestone 3 — Membership Management** (Complexity: High).

### Key Deliverables to Implement:
1. **Database Migration (`004_memberships.sql`)**:
   - Implement `membership_slots`, `slot_members`, `membership_applications`, `guest_play_schedules`, and `membership_slot_releases` tables as specified in `documents/06-database-design.md`.
   - Add RLS policies and necessary triggers for capacity enforcement.
   - Create a corresponding seed script (`seed_m3.sql`) for testing.
2. **Shared Service Layer (`packages/shared/src/services/`)**:
   - Create `memberships.service.ts` to handle CRUD operations for membership slots, member roster management (add/remove/transfer/active toggle), application processing (accept/reject/invite), guest play tracking, and date-specific slot releases.
3. **Owner App Members Screen (`apps/owner/app/(tabs)/members.tsx` & features)**:
   - Build out the 4 main tabs: **Slots**, **Applications**, **Guest Play**, and **Members** directory.
   - Implement summary KPI cards, slot capacity progress bars, open/close vacancy toggles, and slot creation/editing forms.
4. **Schedule Grid Integration**:
   - Ensure recurring membership slots pre-block the timeline grid in teal/green (`membership` slot type) and allow releasing a slot for a specific date (which makes that hour available for regular bookings).

---

## Your Task: Milestone 3
1. Use `view_file` to read **`documents/10-development-roadmap.md`** (Milestone 3 section) and **`documents/06-database-design.md`** (search for membership table specifications).
2. Review **`packages/shared/src/types/database.ts`** and existing service files in **`packages/shared/src/services/`** to understand our API and typing patterns.
3. Formulate an implementation plan for Migration `004` and share it with me before executing!

---

## 🛑 MANDATORY RULES (From `AGENTS.md`)
Before taking any action or writing code, you MUST adhere to the following rules defined in `AGENTS.md`:

1. **Design Reference Rule (Figma Intent):**
   When designing or modifying frontend pages (especially in the Owner App `apps/owner/` or Admin Panel `apps/admin/`), **always refer to the `reference/` folder** (which contains the initial Figma exports and design prompts from the founder). Do not invent random UI designs or layouts without consulting this reference. Your goal is to match the original design intent.
2. **Mobile App Testing Rule (Android Emulator E2E):**
   When developing or fixing features in mobile applications (`apps/owner/`):
   - **Always verify changes on the Android Emulator.** Use ADB commands (e.g., `adb shell input tap`, `adb shell uiautomator dump`, `adb exec-out screencap -p`) to actively interact with and test the app just like you use a browser for testing web apps.
   - **Never assume a bug fix or feature is complete without E2E verification.** After modifying mobile code, navigate to the affected screen on the emulator, trigger the user flow, and confirm via screenshot or UI dump that the feature works as intended.
3. **Database**: Track any database schema changes with proper numbered migrations in `supabase/migrations/`.

Good luck! Start by checking out the roadmap and formulating an Implementation Plan for Milestone 3, I will review the plan after which we will start development!