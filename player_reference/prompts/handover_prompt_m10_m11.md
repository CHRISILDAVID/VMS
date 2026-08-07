# Handover Prompt: ShuttleHub Player App Development (Phase 2 — M11 onwards)

You are a senior software engineer. You are tasked with the development of the **ShuttleHub Player App** (Phase 2, starting from Milestone 11) for the multi-app Badminton Venue Management System.

## Your Context & Objectives

1. **Review the Core Documents (mandatory before writing any code):**
   - Read `documents/Player_app_Implementation_plan.md` — this is your primary reference for the full scope, architecture decisions, feature specs, and founder's key decisions. Study the **Founder's Key Decisions** section carefully.
   - Read `documents/10-development-roadmap.md` — understand the current project status. Phase 1 (Owner App + Admin Panel) and Phase 2 - Milestone 10 (Player App Foundation & Auth) are **100% complete**. You are starting strictly from **M11**.
   - Read `documents/06-database-design.md` — understand the full DB schema, especially the Phase 2 tables (`players`, `player_wallets`, `challenges`, `hosted_matches`, etc.).
   - Read `documents/07-backend-architecture.md` — understand the backend patterns (Supabase, RLS, Edge Functions).
   - Read `documents/08-frontend-architecture.md` — understand shared service patterns and how the Player App should integrate with `packages/shared/`.
   - Read `documents/09-mobile-and-deployment.md` — understand the Expo / EAS / deployment conventions.
   - Read `AGENTS.md` — understand ALL the project-wide rules (styling, testing, DB tracking, design reference rules, **and theme toggling requirements**).

2. **Study the Existing Codebase (What was built in M10):**
   - Examine `apps/player/` — The foundational scaffolding, React Navigation (5 tabs), Auth flow (OTP + Profile creation), and `TopBar` are already built and functioning.
   - The UI correctly accounts for system Safe Areas (Notches/Home indicators). The overarching theme uses `PLAYER_COLORS` (Navy `#0B1F3A` background) defined in `packages/shared/src/utils/player-constants.ts`.
   - Examine `packages/shared/src/` — understand the existing service layer, types, and utilities. You will be extending this, not replacing it.
   - Examine `supabase/migrations/` — Migrations up to `018` have been created and applied.

3. **Study the Design References:**
   - Read `player_reference/figma-src/` — this contains the Figma exports for the Player App. The theme is **Navy (#0B1F3A) + Lime (#A7FF3F)** sporty aesthetic.
   - Read `player_reference/prompts/v1_all_prompts_and_responses_from_figma_AI.md` and `v2_all_prompts_and_responses_from_figma_AI.md` — these contain rich screen-by-screen descriptions of the original Figma designs, including layout, component behavior, and copy.
   - **Design Rule:** Always refer to `player_reference/figma-src/` when building any screen. However, **do not blindly follow the Figma** if it conflicts with established UI patterns. The goal is to match the original intent while maintaining global UI consistency.

4. **Your Current Task:**
   - Start strictly from **Milestone 11 — Home Dashboard + Court Discovery**.
   - **Work in Phases:** The development is broken down into milestones in `documents/10-development-roadmap.md`. Tackle these sequentially. Always clearly state which milestone(s) you are working on.

## Critical Rules to Remember

- **Theme Toggling:** Design all pages dynamically so they natively support a settings toggle for **Dark mode / Light mode / System default**.
- **Player App Path:** `apps/player/` — do NOT put code in `apps/owner/` unless making an explicit cross-app change.
- **Shared Code:** All reusable services, types, and utilities go in `packages/shared/src/`. Keep apps thin.
- **Database Migrations:** Every schema change must have a properly numbered migration file in `supabase/migrations/`.
- **Remote DB Access:** Never directly run `npx supabase db dump` or similar Docker-dependent commands. Follow the `AGENTS.md` Remote Database Access rule.
- **Design Tokens:** The Player App uses Navy `#0B1F3A`, Lime `#A7FF3F`, White, and Dark Grey. Do not use the Owner App's blue theme.
- **Brand:** The app is called **ShuttleHub** — use this name in all user-facing text.
- **Market:** India only — use ₹ for currency, +91 for phone, and Indian city names in seed data.
- **MVP Payment:** "Pay at Court" only — **no online payment integration** for Phase 2.

## Session Workflow

Make an **Implementation Plan for this specific session** outlining which milestone(s) or phases within a milestone you will tackle. Include:
- Which deliverables from the roadmap you will complete (e.g., Home Dashboard UI, Court Discovery services, Court Listing).
- The sequence of work (DB migrations → shared services → UI screens).
- Any open questions or clarifications needed.

Once I review and approve it, we will start development. Dont start coding until I give you a go.

**After completing your session's work:**
- Log your progress by checking off the completed items `[x]` in the corresponding milestone(s) in `documents/10-development-roadmap.md`.
