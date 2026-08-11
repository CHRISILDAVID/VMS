Hello! You are continuing work on the Badminton Manager (VMS) project at Phase 2. We have successfully completed Milestone 11 (Home Dashboard & Court Booking). The Player App now has a fully functional Home Tab and Court Booking flow (including court listing, slot selection, wallet/online payments, and a DEV Razorpay mock for testing). 

Your primary task now is to start building **Milestone 12 — Social Features (Find Players, Host/Join Match, Challenges)** for the **ShuttleHub Player App**.

I will attach the figma design images in the prompt for Milestone 12 features. Please refer to these images for design inspiration and reference along with the `figma-src` code located in the `player_reference/` folder. However, **always maintain consistency with the current app UI.** If the Figma designs conflict with established UI patterns in the codebase (e.g., standard headers, paddings, colors), follow the existing app patterns instead.

**Before writing any code, you MUST:**

1. Read `AGENTS.md` (located at the root) to understand the strict rules and workflows you must follow. Pay special attention to:
    * **UI Consistency & Theming:** Use the common color schemes and semantic variables established in the Tailwind config. DO NOT hardcode colors or generic Tailwind strings. Always use our NativeWind variable components (`Card`, `Button`, `Badge`, `Input`, etc.) in `src/components/ui/`.
    * **Documentation Tracking:** Do NOT update tracking documents after every single prompt. Only update them at the end of a chat session when I (the evaluator) explicitly instruct you that the session is complete.
    * **Mobile App Testing:** Confirm how to verify changes using the Android emulator via ADB commands (do not assume e2e unless asked, always verify visually via UI dumps/screenshots).
    * **Database Tracking:** Track DB changes in `supabase/migrations/` and ask permission before querying remote DB directly.

2. Read `documents/10-development-roadmap.md` to review the specific deliverables and completion checklist for Milestone 12.
3. Read `documents/Player_app_Implementation_plan.md`, which is the comprehensive architectural and functional blueprint brainstormed for Phase 2. This document is your single source of truth for all business logic, navigation flows, and UI mapping.
4. Review the backend and frontend architecture updates in `documents/07-backend-architecture.md` and `documents/08-frontend-architecture.md`.
5. Review the database schema for Phase 2 in `documents/06-database-design.md` (Specifically Migration 016).

**Your Task (Milestone 12):**

1. Ensure the database is prepared with Migration 016 (`hosted_matches`, `hosted_match_players`, `challenges`, `challenge_invitations`).
2. Build the **Find Players sub-tab**:
   - Player discovery list (search by name or Player ID, filters: skill, gender, distance).
   - Public Player Profile screen (stats, rank, play activity).
   - Challenge modal (host selects upcoming booking + invites multiple players).
   - DB trigger for challenge expiration (expires at booking end time).
   - Basic push/in-app notification logic for challenge received/accepted.
3. Build the **Host/Join Match sub-tab**:
   - Discover active hosted matches near user (city-filtered).
   - Join match flow (confirm join, push notification).
   - My Hosted Matches list + Hosted Match Detail.
   - Host a Match screen (requires confirmed booking → redirect to Book Court if none).
   - Setup Match format, skill level, max players, and visibility (public).
4. Implement **Booking Cancellation Triggers** (DB/Edge Functions):
   - If host's booking is cancelled, auto-cancel challenge + notify all invited players.
   - If host's booking is cancelled, auto-cancel hosted match + notify all joined players.

Please formulate an execution plan first and wait for my approval before proceeding with the implementation.
