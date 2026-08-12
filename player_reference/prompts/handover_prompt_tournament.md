Hello! You are joining the Badminton Manager (VMS) project to help build a critical new feature: **The Tournament Flow Prototype (Milestone 13)** for the **ShuttleHub Player App**.

We have decided to temporarily defer the Social Features (M12) because there is an actual tournament coming up in 3 days! The founder urgently needs a functional prototype of the Tournament flow built so it can be field-tested immediately.

I will attach any relevant Figma design images for the Tournament features in the prompts. Please refer to these images for design inspiration along with any `figma-src` code in the `player_reference/` folder. However, **always maintain consistency with the current app UI.** If the Figma designs conflict with established UI patterns in the codebase (e.g., standard headers, paddings, colors), follow the existing app patterns instead.

**Before writing any code, you MUST:**

1. Read `AGENTS.md` (located at the root) to understand the strict rules and workflows you must follow. Pay special attention to:
    * **UI Consistency & Theming:** Use the common color schemes and semantic variables established in the Tailwind config. DO NOT hardcode colors or generic Tailwind strings. Always use our NativeWind variable components (`Card`, `Button`, `Badge`, `Input`, etc.) in `src/components/ui/`.
    * **Documentation Tracking:** Do NOT update tracking documents after every single prompt. Only update them at the end of a chat session when I explicitly instruct you that the session is complete.
    * **Mobile App Testing:** Confirm how to verify changes using the Android emulator via ADB commands (do not assume e2e unless asked, always verify visually via UI dumps/screenshots).
    * **Database Tracking:** Track DB changes in `supabase/migrations/` and ask permission before querying the remote DB directly.

2. Since the Tournament feature is a brand new, fast-tracked addition, it is not yet fully detailed in `documents/10-development-roadmap.md` or `06-database-design.md`. Your first step in the execution phase must be to define the database schema (Migration 017) and outline the architecture with me.

**Your Task (Milestone 13 - Tournament Prototype):**

1. **Database & Architecture:**
   - Propose and create Migration 017 to handle Tournaments, Registrations, Categories (e.g. Men's Singles, Mixed Doubles), and Matches/Brackets.
2. **Build the Tournament Discovery Flow (Player App):**
   - A dedicated Tournaments Tab / Screen to list upcoming, ongoing, and past tournaments.
   - A Tournament Detail screen showing dates, venue, entry fee, rules, and available categories.
3. **Build the Registration Flow:**
   - Allow a player to select a category and register.
   - For doubles/mixed, include a flow to invite or specify a partner.
   - Mock a payment/confirmation step (similar to the court booking Razorpay mock).
4. **Build the Brackets/Matches View:**
   - A UI to visualize the tournament bracket or list of matches for a specific category.
   - Allow players to see their upcoming match timings and opponents.

Please formulate an execution plan for the database schema and the initial UI architecture first, and wait for my approval before proceeding with the implementation!
