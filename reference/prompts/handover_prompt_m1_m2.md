# Project Handover Context: Badminton Manager (VMS)

Hello! You are taking over the development of the Badminton Manager (VMS) project. We have successfully completed **Milestone 0 (Setup)** and **Milestone 1 (Authentication + Schedule)**.

You are now tasked with starting **Milestone 2 (Bookings)**.

## Project Context
- **Product:** A multi-app venue management system for badminton court owners.
- **Tech Stack:** 
  - Owner App: React Native (Expo) + NativeWind
  - Admin Panel: React (Vite) + Tailwind CSS v4
  - Backend: Supabase (PostgreSQL)
  - Shared: TypeScript Monorepo (`packages/shared/`)

## Current State (End of M1)
- The Owner App has a working phone auth flow (Supabase + Twilio), The .env files in both admin and owner has the supabase secrets.
- Session state is managed via Zustand + Expo Secure Store.
- The Schedule screen (Timeline Grid) is fully implemented and visually matches the Figma design.
- The database schema is set up with migrations `001` and `002`. Seed data (`seed_m1.sql`) is available to populate venues and courts.
- Note: We deferred some M1 CRUD operations (Venues, Operating Schedules, Multi-device limits) to later milestones (`M5`, `M6`, `M7`) to focus on the core flow.

## Your Task: Milestone 2
Please review `documents/10-development-roadmap.md` to see the exact deliverables for Milestone 2. 
You will be building out the **Bookings** infrastructure and UI for the Owner App, including creating new customers, managing bookings, and building the Bookings List screen.

### ⚠️ CRITICAL RULES ⚠️
1. **Follow `AGENTS.md`**: You MUST read and follow the rules laid out in `.agents/AGENTS.md` (or the root `AGENTS.md`). 
2. **Design Reference**: When building or modifying ANY frontend pages, you MUST consult the `reference/figma-src/` directory. The founder has provided strict Figma exports. Do NOT invent your own UI layouts or designs without perfectly matching the intent of the reference files!
3. **Database**: Track any database schema changes with proper numbered migrations in `supabase/migrations/`.

Good luck! Start by checking out the roadmap and formulating an Implementation Plan for Milestone 2, I will review the plan after which we will start development!
