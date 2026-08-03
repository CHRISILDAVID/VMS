Hello! I am continuing the development of my multi-app venue management system (VMS) for badminton court owners. We are building the React Native (Expo) Owner App (`apps/owner/`).

### Current Progress
We have just fully completed **Milestone 3 (Membership Management)**. The database schema, React Native UI, and all CRUD logic (using React Query) for managing membership slots, members, applications, guest plays, and schedule interactions are fully implemented and verified via E2E testing on an Android emulator. We are aware there are some minor slot collisions to handle later, but we are moving on to the next major feature.

### Next Phase
Our next goal is to tackle **Milestone 4 — Membership Payments**. This milestone involves:
- Creating the `membership_payments` table (`supabase/migrations/005_membership_payments.sql`).
- Implementing an Edge Function cron job to auto-generate monthly payment records.
- Building out the Payments screen (dashboard, slot payment cards, member list filter chips, etc.).
- Developing the UI flow to "Mark as Paid".
- Implementing Push Notifications (expo-notifications) and WhatsApp deep link reminders.
- Generating PDF receipts (`expo-print`).

### Mandatory Instructions (Please Read Carefully)
1. **Review All Docs**: Before you start, thoroughly read all documents in the `documents/` folder (especially `10-development-roadmap.md`) to get maximum context on the system architecture and current state of the app.
2. **Review DB Schema**: Review all SQL migrations in `supabase/migrations/` and the generated types in `packages/shared/src/types/database.ts`. It is crucial you understand the full context of the current database before designing the payments schema.
3. **Read the Rules (`AGENTS.md`)**: Read the `AGENTS.md` file located at the root of the workspace. It contains critical instructions about testing and architecture.
4. **Design Consistency**: We have an initial design reference inside the `reference/figma-src/` folder. While you must consult this folder to understand the intended UI/UX, **your top priority is matching the established UI patterns in the codebase**. If the Figma design conflicts with the existing app (e.g., standard header layouts, FABs, paddings, colors), you must follow the codebase's existing pattern to keep the app perfectly consistent.
5. **Two-Phase Execution Strategy**: We must split this task into two separate phases:
   - **Phase 1 (Scaffolding & SQL)**: First, propose a plan and execute all the code scaffolding, frontend changes, and write the SQL migrations. **DO NOT run manual E2E tests yet**. Stop and wait for me to manually execute the SQL migrations in Supabase and confirm they are ready.
   - **Phase 2 (E2E Verification)**: Only after I confirm the database is updated and ready, you will begin the manual E2E verification on the Android Emulator using the `android-cli` tool (via ADB commands). Never assume a bug fix or feature works without explicitly checking the UI dump or screenshot during this second phase.

Please review the docs, schema, and `AGENTS.md`, then briefly survey the `apps/owner/` folder structure. Once you are ready, propose an implementation plan for **Phase 1** of Milestone 4! I will review the plan after which we will start development!
