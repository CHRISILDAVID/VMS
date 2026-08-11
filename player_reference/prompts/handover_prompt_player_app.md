Hello! You are joining the Badminton Manager (VMS) project at Phase 2. We have successfully built the Owner App and Admin Panel (Milestones 0–7)/ M8 and M9 is for later during publishing. Your primary task now is to start building the **ShuttleHub Player App**, specifically focusing on **Milestone 10 — Player App Foundation & Auth**.

**Before writing any code, you MUST:**

1. Read `AGENTS.md` (located at the root) to understand the strict rules and workflows you must follow. Pay special attention to:
    * **UI Consistency & Theming:** You must create and reuse common color schemes and semantic variables in the Tailwind config. DO NOT hardcode colors or generic Tailwind strings across screens. Build reusable components (like `Card`, `Button`, `Input`) in `src/components/ui/` and reuse them everywhere as variable components.
    * **Documentation Tracking:** Do NOT update tracking documents after every single prompt. Only update them at the end of a chat session when I (the evaluator) explicitly instruct you that the session is complete.
    * **Mobile App Testing:** Confirm how to verify changes using the emulator or Expo Go.

2. Read `documents/10-development-roadmap.md` to review the specific deliverables and completion checklist for Milestone 10.
3. Read `documents/Player_app_Implementation_plan.md`, which is the comprehensive architectural and functional blueprint brainstormed for Phase 2. This document is your single source of truth for all business logic, navigation flows, and UI mapping.
4. Review the backend and frontend architecture updates in `documents/07-backend-architecture.md` and `documents/08-frontend-architecture.md`.
5. Review the database schema for Phase 2 in `documents/06-database-design.md` (Migrations 014+).

**Your Task (Milestone 10):**

1. Set up the Expo scaffold under `apps/player/` with the correct package name.
2. Set up the Supabase client for the player app.
3. Implement the Phone OTP authentication flow (connecting to the Phase 2 `players` table).
4. Create the initial Player profile creation screen.
5. Set up the 5-tab bottom navigation skeleton (Home, Play, Tournaments, Rankings, Shop) and the top bar UI.
6. Configure the `PLAYER_COLORS` design tokens (Navy `#0B1F3A`, Lime `#A7FF3F`) and NativeWind theme support as reusable variables.

Please formulate an execution plan first and wait for my approval before proceeding with the implementation.