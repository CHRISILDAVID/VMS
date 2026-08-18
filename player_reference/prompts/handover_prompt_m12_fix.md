# Handover Prompt: Milestone 12 (Social Features) Fixes & Refactoring

Hello! You are picking up work on the **Badminton VMS** project (specifically the Player App). The development team has completed the initial scaffolding of Milestone 12 (Social Features like Challenges and Hosting Matches), but there are multiple critical bugs and UX sync issues.

Please treat these bugs with high priority, verify your fixes by directly checking the database or emulator, and follow the `player_reference/` theming guidelines when redesigning UI.

I will attach the figma design images in the prompt for Milestone 12 features. Please refer to these images for design inspiration and reference along with the `figma-src` code located in the `player_reference/` folder. However, **always maintain consistency with the current app UI.** If the Figma designs conflict with established UI patterns in the codebase (e.g., standard headers, paddings, colors), follow the existing app patterns instead.

## Before writing any code, you MUST:

1. Read `AGENTS.md` (located at the root) to understand the strict rules and workflows you must follow. Pay special attention to:
    * **UI Consistency & Theming:** Use the common color schemes and semantic variables established in the Tailwind config. DO NOT hardcode colors or generic Tailwind strings. Always use our NativeWind variable components (`Card`, `Button`, `Badge`, `Input`, etc.) in `src/components/ui/`.
    * **Documentation Tracking:** Do NOT update tracking documents after every single prompt. Only update them at the end of a chat session when I (the evaluator) explicitly instruct you that the session is complete.
    * **Mobile App Testing:** Confirm how to verify changes using the Android emulator via ADB commands (do not assume e2e unless asked, always verify visually via UI dumps/screenshots).
    * **Database Tracking:** Track DB changes in `supabase/migrations/` and ask permission before querying remote DB directly.

2. Read `documents/10-development-roadmap.md` to review the specific deliverables and completion checklist for Milestone 12.
3. Read `documents/Player_app_Implementation_plan.md`, which is the comprehensive architectural and functional blueprint brainstormed for Phase 2. This document is your single source of truth for all business logic, navigation flows, and UI mapping.
4. Review the backend and frontend architecture updates in `documents/07-backend-architecture.md` and `documents/08-frontend-architecture.md`.
5. Review the database schema for Phase 2 in `documents/06-database-design.md` (Specifically Migration 016).

## Context

- **Stack**: React Native (Expo) + NativeWind (Tailwind), React Query, Supabase.
- **Relevant Files**:
  - `packages/shared/src/services/social.service.ts` (Backend API calls)
  - `apps/player/features/social/ChallengeModal.tsx`
  - `apps/player/features/social/HostMatchFlow.tsx`
  - `apps/player/features/social/FindPlayersScreen.tsx`
  - `apps/player/stores/playerStore.ts`
  - `supabase/migrations/016_social_features.sql`

---

## The Issues to Fix

### 1. Data Sync Delay (DB updates but UI is slow)
**User Complaint:** "Some features are loading up in DB but gets delayed to reflect in the app..."
**Context / Hints:**
- The app uses React Query for fetching. When a mutation happens (e.g., sending a challenge, creating a hosted match), the `onSuccess` block is likely missing a `queryClient.invalidateQueries(...)` call for the relevant query keys, or the invalidation keys don't match the query keys exactly (remember we recently added `playerId` to some query keys like `['my-bookings-upcoming', playerId]`).
- **Action:** Ensure every mutation in the social components properly invalidates its parent queries so the UI updates instantly. Consider optimistic UI updates for accepting/declining challenges.

### 2. Location Filter Not Applied to Social Features
**User Complaint:** "The location filter in the header only acts filters venues and not the players and all other records."
**Context / Hints:**
- The `AppHeader.tsx` successfully saves the user's current city/coordinates into the Supabase `players` table and likely the `playerStore`.
- However, the `fetchPlayers` and `fetchOpenMatches` queries (which call RPCs `get_players_with_distance` and `get_open_matches_with_distance`) might not be passing the user's `latitude` and `longitude` from the `playerStore`, causing distance sorting to fail.
- **Action:** Read the user's coordinates from `playerStore.getState().playerProfile` (or `usePlayerStore`) and pass them to the social service fetch calls in `FindPlayersScreen` and `PlayScreen` (or wherever matches/players are fetched).

### 3. Duplicate Challenges (No uniqueness constraint in UI)
**User Complaint:** "I am able to challenge the same player. I mean wtf i going on!!!"
**Context / Hints:**
- A host can repeatedly send a challenge to the exact same player for the same booking.
- The `challenge_invitations` table has a `UNIQUE (challenge_id, invited_player_id)` constraint, but a single booking can have multiple `challenges` created by the host.
- **Action:** In `ChallengeModal.tsx` and `social.service.ts`, before sending a challenge, check if there is already an active `open` challenge for this `booking_id` involving this `targetPlayer`. Disable the challenge button or show an error if they are already challenged for that booking.

### 4. Hosting Feature is Broken
**User Complaint:** "The Hosting feature wont work."
**Context / Hints:**
- This is a known backend payload issue! The `hosted_matches` table has a `NOT NULL` constraint on `host_player_id`, and a Row Level Security policy checking `host_player_id = auth.uid()`.
- However, in `social.service.ts` -> `createHostedMatch()`, the `host_player_id` is completely omitted from the `.insert()` payload, causing it to fail silently at the DB level.
- **Action:** Fix `createHostedMatch` in `social.service.ts` to fetch `auth.getUser()` and include `host_player_id: me.user.id` in the insert statement. (Look at how `sendChallenge` was recently fixed as a reference).

### 5. Delayed Booking Conflicts
**User Complaint:** "Sometimes the booking conflict issue only pops up after I book a court from other user."
**Context / Hints:**
- The DB has a strict trigger (`check_booking_conflict_trigger`) that prevents overlapping bookings, which is great.
- However, the UI court grid doesn't update in real-time. If User A is looking at 2:00 PM, and User B books it, User A still sees it as available until they try to pay, at which point the DB throws an error.
- **Action:** You may need to implement a Realtime Supabase subscription on the `bookings` table inside the court selection screen to instantly grey out slots that get booked by others, OR implement a pre-booking "lock" before sending them to the payment screen.

---

### Redesign & UX Notes
The user also mentioned earlier that some of the social modals looked "like ass, Transparent and all". I fixed the `ChallengeModal` by applying solid theme backgrounds (`colors.background`), a top border, and shadows. 
Please ensure that `HostMatchFlow.tsx` and any other bottom-sheet modals receive the same UI treatment. Keep it sporty (Navy + Lime) and premium, using NativeWind with our theme tokens!
