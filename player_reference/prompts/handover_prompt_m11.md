Hello! You are continuing work on the Badminton Manager (VMS) project at Phase 2. We have successfully completed Milestone 10 (Player App Foundation & Auth). The `apps/player/` Expo scaffold is set up, the OTP authentication flow is working, and the base 5-tab UI skeleton (with themes and colors) is in place.

Your primary task now is to start building **Milestone 11 — Home Dashboard & Court Booking** for the **ShuttleHub Player App**.

**Before writing any code, you MUST:**

1. Read `AGENTS.md` (located at the root) to understand the strict rules and workflows you must follow. Pay special attention to:
    * **UI Consistency & Theming:** Use the common color schemes and semantic variables established in the Tailwind config. DO NOT hardcode colors or generic Tailwind strings. Always use our NativeWind variable components (`Card`, `Button`, `Badge`, `Input`, etc.) in `src/components/ui/`.
    * **Documentation Tracking:** Do NOT update tracking documents after every single prompt. Only update them at the end of a chat session when I (the evaluator) explicitly instruct you that the session is complete.
    * **Mobile App Testing:** Confirm how to verify changes using the Android emulator via ADB commands (do not assume e2e unless asked, always verify visually via UI dumps/screenshots).
    * **Database Tracking:** Track DB changes in `supabase/migrations/` and ask permission before querying remote DB directly.

2. Read `documents/10-development-roadmap.md` to review the specific deliverables and completion checklist for Milestone 11.
3. Read `documents/Player_app_Implementation_plan.md`, which is the comprehensive architectural and functional blueprint brainstormed for Phase 2. This document is your single source of truth for all business logic, navigation flows, and UI mapping.
4. Review the backend and frontend architecture updates in `documents/07-backend-architecture.md` and `documents/08-frontend-architecture.md`.
5. Review the database schema for Phase 2 in `documents/06-database-design.md` (Specifically Migrations 014 and 015).

**Your Task (Milestone 11):**

1. Ensure the database is prepared with Migration 014 (`players`, `player_wallets`, `player_transactions`, `system_config`) and Migration 015 (`coaches`, `player_booking_payments`).
2. Build the **Home Tab**:
   - Header components: search bar, read-only wallet popover, alerts bell.
   - Sections: Hero carousel, Quick Actions, Nearby Courts (horizontal scroll), and Fast Selling Items placeholder.
3. Build the **Play Tab (Book Court)**:
   - Court listing (with filters).
   - Court detail screen and Slot selection (30-min grid).
   - Booking summary (wallet/Razorpay/pay at court) and create the booking in the DB (`source='online'`).
4. Build the **Play Tab (Train)**:
   - Coach cards and Coach detail screen.
5. Add the **Admin Panel extensions**:
   - Wallet Management (search player, view balance, credit wallet).
   - Coach Management (CRUD coaches, assign to venue).
6. Implement the **Customer-Player soft link** on registration (matching by phone → `players.linked_customer_id`).

Please formulate an execution plan first and wait for my approval before proceeding with the implementation.
