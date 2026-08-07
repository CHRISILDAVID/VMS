# Handover Prompt: ShuttleHub Player App Development (Phase 2 — M10 onwards)

You are a senior software engineer. You are tasked with the development of the **ShuttleHub Player App** (Phase 2, starting from Milestone 10) for the multi-app Badminton Venue Management System.

## Your Context & Objectives

1. **Review the Core Documents (mandatory before writing any code):**
   - Read `documents/Player_app_Implementation_plan.md` — this is your primary reference for the full scope, architecture decisions, feature specs, and founder's key decisions. Study the **Founder's Key Decisions** section carefully.
   - Read `documents/10-development-roadmap.md` — understand the current project status. Phase 1 (Owner App M0–M6 + Admin Panel M7) is **complete**. You are starting Phase 2 from **M10**.
   - Read `documents/06-database-design.md` — understand the full DB schema, especially the Phase 2 tables (`players`, `player_wallets`, `challenges`, `hosted_matches`, etc.).
   - Read `documents/07-backend-architecture.md` — understand the backend patterns (Supabase, RLS, Edge Functions).
   - Read `documents/08-frontend-architecture.md` — understand shared service patterns and how the Player App should integrate with `packages/shared/`.
   - Read `documents/09-mobile-and-deployment.md` — understand the Expo / EAS / deployment conventions.
   - Read `AGENTS.md` — understand ALL the project-wide rules (styling, testing, DB tracking, design reference rules).

2. **Study the Existing Codebase:**
   - Examine `apps/owner/` thoroughly — the Player App **must follow the same patterns** for Expo Router, NativeWind, React Query, Zustand, React Hook Form, and Zod as established in the Owner App. Do not invent new conventions.
   - Examine `packages/shared/src/` — understand the existing service layer, types, and utilities. You will be extending this, not replacing it.
   - Examine `supabase/migrations/` — understand the existing DB schema before adding new migrations.

3. **Study the Design References:**
   - Read `player_reference/figma-src/` — this contains the Figma exports for the Player App. The theme is **Navy (#0B1F3A) + Lime (#A7FF3F)** sporty aesthetic.
   - Read `player_reference/prompts/v1_all_prompts_and_responses_from_figma_AI.md` and `v2_all_prompts_and_responses_from_figma_AI.md` — these contain rich screen-by-screen descriptions of the original Figma designs, including layout, component behaviour, and copy. This is essential context for building faithful UI.
   - **Design Rule:** Always refer to `player_reference/figma-src/` when building any screen. However, **do not blindly follow the Figma** if it conflicts with established UI patterns from the Owner App. The goal is to match the original intent while maintaining global UI consistency.

4. **Your Current Task:**
   - Start from **Milestone 10 — Player App Foundation + Auth**.
   - **Work in Phases:** The development is broken down into milestones (M10 through M17) in `documents/10-development-roadmap.md`. Tackle these sequentially. You may group one or two tightly coupled milestones into a single session to work efficiently, but always clearly state which milestone(s) you are working on.

## Critical Rules to Remember

- **Player App Path:** `apps/player/` — do NOT put code in `apps/owner/` unless you are making the explicit Owner App impact changes documented in the milestones (e.g., adding min slot duration settings).
- **Shared Code:** All reusable services, types, and utilities go in `packages/shared/src/`. Keep apps thin.
- **Database Migrations:** Every schema change must have a properly numbered migration file in `supabase/migrations/`. Track all changes as per `AGENTS.md`.
- **Remote DB Access:** Never directly run `npx supabase db dump` or similar Docker-dependent commands. Follow the `AGENTS.md` Remote Database Access rule.
- **Design Tokens:** The Player App uses Navy `#0B1F3A`, Lime `#A7FF3F`, White, and Dark Grey. Do not use the Owner App's blue theme in the Player App.
- **Brand:** The app is called **ShuttleHub** — use this name in all user-facing text, not "Player App" or "VMS".
- **Market:** India only — use ₹ for currency, +91 for phone, and Indian city names in seed data.
- **MVP Payment:** "Pay at Court" only — **no online payment integration** for Phase 2.
- **Wallet:** Admin-managed balance only — players cannot add money themselves.
- **Tournaments:** Deferred — show placeholder screens only. Do not implement tournament logic.

## Session Workflow

Make an **Implementation Plan for this specific session** outlining which milestone(s) or phases within a milestone you will tackle. Include:
- Which deliverables from the roadmap you will complete
- The sequence of work (DB migrations → shared services → UI screens)
- Any Owner App changes required

Once I review and approve it, we will start development.

**After completing your session's work:**
- Log your progress by checking off the completed items `[x]` in the corresponding milestone(s) in `documents/10-development-roadmap.md`.
