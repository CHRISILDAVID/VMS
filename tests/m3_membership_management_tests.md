# Milestone 3 (Membership Management) — Verification Test Suite

This test suite is designed for structured, manual verification of all **Milestone 3** features in Badminton Manager (VMS). Once you have executed `supabase/migrations/004_memberships.sql` and `supabase/seed_m3.sql` in your Supabase project, follow this checklist to verify E2E functionality across the Owner App and database.

---

## 🛠️ Pre-Requisites & Environment Setup

1. **Database Execution**:
   - [ ] Execute `supabase/migrations/004_memberships.sql` in Supabase SQL Editor. Confirm all tables (`membership_slots`, `members`, `membership_applications`, `guest_plays`, `membership_slot_releases`) and triggers (`enforce_membership_capacity`) are created without errors.
   - [ ] Execute `supabase/seed_m3.sql` in Supabase SQL Editor. Confirm test venue slots ("Morning Warriors", "Evening Champions", "Weekend Smashers"), sample members, pending applications, and guest plays are inserted.
2. **Owner App Launch**:
   - [ ] Ensure `pnpm dev:owner` is running and connect via Android Emulator or physical device.
   - [ ] Log in with the venue owner account associated with the seed venue.

---

## 📊 Test Suite 1: Dashboard & Summary Cards

| Test ID | Scenario | Steps | Expected Result | Status |
|:---|:---|:---|:---|:---|
| **M3-TC-1.1** | View KPI Dashboard | 1. Open Owner App and tap **Members** tab.<br>2. Inspect the top summary cards. | KPI cards display:<br>• **Total Members**: Matches total active members in seed data.<br>• **Active Slots**: Count of published/active training slots.<br>• **Avg Utilization %**: Calculated capacity percentage across slots.<br>• **Pending Apps Badge**: Correct count of pending applications. | `[ ]` |
| **M3-TC-1.2** | Tab Navigation & Badges | 1. Observe tab bar (`Slots`, `Applications`, `Guest Play`, `Members`).<br>2. Check numeric badge on `Applications` and `Guest Play`. | Badges dynamically reflect pending application count and upcoming guest trial session count. | `[ ]` |

---

## 🏸 Test Suite 2: Membership Slots CRUD (`SlotsTab`)

| Test ID | Scenario | Steps | Expected Result | Status |
|:---|:---|:---|:---|:---|
| **M3-TC-2.1** | View Slots Directory | 1. On **Members** screen, select **Slots** tab.<br>2. Scroll through available training slots. | Each card displays Slot Name, Playing Days (e.g., Mon, Wed, Fri), Time (e.g., 06:00 - 08:00), Skill Level badge (Beginner/Intermediate/Advanced/Recreational), Fee structure, and capacity progress bar (e.g., 8/10). | `[ ]` |
| **M3-TC-2.2** | Create New Slot | 1. Tap **+ New Slot** button in header.<br>2. Fill out form:<br>  • Name: `Afternoon Smashers`<br>  • Time: `14:00` to `16:00`<br>  • Capacity: `12`<br>  • Monthly Fee: `3000`<br>  • Days: Select `Tue`, `Thu`<br>  • Skill Level: `Recreational`<br>3. Tap **Create Slot**. | Form modal closes. Alert confirms success. The new slot immediately appears in the Slots list with capacity `0/12` and correct tags. Verify row is created in `membership_slots` table in Supabase. | `[ ]` |
| **M3-TC-2.3** | Edit Existing Slot | 1. On any slot card, tap the **Edit** (pencil/options) icon.<br>2. Change Monthly Fee to `3500` and Capacity to `15`.<br>3. Tap **Save Changes**. | Modal closes. Slot card immediately reflects the updated fee (`₹3,500`) and capacity bar (`X/15`). DB record updates. | `[ ]` |

---

## 👥 Test Suite 3: Roster Administration (`SlotMembersView`)

| Test ID | Scenario | Steps | Expected Result | Status |
|:---|:---|:---|:---|:---|
| **M3-TC-3.1** | View Slot Roster | 1. On **Slots** tab, tap any slot card (e.g., `Morning Warriors`). | Roster sub-view opens showing all active members enrolled in this slot, their phone numbers, joining dates, and payment status badges (`Paid`, `Due`, `Overdue`). | `[ ]` |
| **M3-TC-3.2** | Add Member to Slot | 1. Inside Roster view, tap **+ Add Member**.<br>2. Enter Name: `Rahul Sharma`, Phone: `9876543210`.<br>3. Tap **Add Member**. | Modal closes. Rahul Sharma appears in the slot roster. Slot capacity increments by +1 (e.g., from 8/10 to 9/10). DB `members` table has new entry. | `[ ]` |
| **M3-TC-3.3** | Capacity Trigger Enforcement | 1. Find or edit a slot to have Capacity = `1` and add 1 member (Capacity now `1/1`).<br>2. Attempt to add a 2nd member via **+ Add Member**. | Supabase database trigger `enforce_membership_capacity()` rejects the insert. App displays an error alert: *"Slot capacity exceeded"*. Roster remains at 1/1. | `[ ]` |
| **M3-TC-3.4** | Transfer Member Between Slots | 1. In Roster view, tap the **Transfer** (swap) icon on an existing member.<br>2. In the Transfer modal, select a different target slot (e.g., `Evening Champions`).<br>3. Confirm transfer. | Member disappears from current slot roster (source capacity -1). Navigating to target slot roster shows the member enrolled there (target capacity +1). | `[ ]` |
| **M3-TC-3.5** | Remove Member | 1. In Roster view, tap the **Remove** (trash/delete) icon on a test member.<br>2. Confirm deletion in alert dialog. | Member is removed from roster list. Slot capacity decrements by -1. DB record deleted/deactivated. | `[ ]` |

---

## 📝 Test Suite 4: Applications Workflow (`ApplicationsTab`)

| Test ID | Scenario | Steps | Expected Result | Status |
|:---|:---|:---|:---|:---|
| **M3-TC-4.1** | View Applications | 1. On **Members** screen, select **Applications** tab. | List displays pending applications from players with applicant name, requested slot name, applied date, and status badge (`New` / `Invited`). | `[ ]` |
| **M3-TC-4.2** | Accept Application | 1. Tap **Accept** on a pending application (e.g., `Amit Kumar`). | Alert confirms acceptance: *"Amit Kumar accepted as member!"*. Application card is dismissed from active view. Navigating to the requested slot's roster confirms Amit Kumar is now an active member (+1 capacity). | `[ ]` |
| **M3-TC-4.3** | Reject Application | 1. Tap **Reject** on a pending application. | Application is dismissed from active list without enrolling the user into the slot roster. DB status updates to `rejected`. | `[ ]` |
| **M3-TC-4.4** | Invite to Guest Play | 1. Tap **Invite to Guest Play** (or Trial) on a pending application.<br>2. In date picker modal, select tomorrow's date.<br>3. Tap **Confirm Invite**. | Alert confirms: *"Invited to guest play!"*. Application status badge updates to `Invited`. A corresponding trial session record is automatically created in the **Guest Play** tab. | `[ ]` |

---

## 🎾 Test Suite 5: Guest Trial Play (`GuestPlayTab`)

| Test ID | Scenario | Steps | Expected Result | Status |
|:---|:---|:---|:---|:---|
| **M3-TC-5.1** | Track Guest Plays | 1. On **Members** screen, select **Guest Play** tab.<br>2. Toggle between **Upcoming** and **Past** filter tabs. | Displays scheduled trial sessions with player name, target slot, scheduled date, and guest fee amount. | `[ ]` |
| **M3-TC-5.2** | Update Status | 1. On an upcoming guest play card, tap status action buttons (e.g., mark as `Completed` or `No Show`). | Card updates status badge immediately. If marked completed, it moves appropriately between filters. | `[ ]` |
| **M3-TC-5.3** | Convert to Member | 1. Find a `Completed` guest play card.<br>2. Tap **Convert to Member**. | Alert confirms successful conversion. Player is automatically enrolled into the target slot roster (capacity +1). Guest play status is finalized. | `[ ]` |

---

## 🔍 Test Suite 6: Global Member Directory (`MembersListTab`)

| Test ID | Scenario | Steps | Expected Result | Status |
|:---|:---|:---|:---|:---|
| **M3-TC-6.1** | Cross-Slot Search | 1. On **Members** screen, select **Members** tab.<br>2. Type a partial name or phone number in search bar (e.g., `Sharma` or `9876`). | List filters in real time across all venue slots, displaying matching members, their assigned training slot name, and contact details. | `[ ]` |
| **M3-TC-6.2** | Navigate to Member's Slot | 1. In global directory, tap on any member card or slot badge. | App navigates directly to that specific slot's roster view (`SlotMembersView`), allowing instant administrative access. | `[ ]` |

---

## 📅 Test Suite 7: Schedule Grid Integration (`schedule.tsx`)

| Test ID | Scenario | Steps | Expected Result | Status |
|:---|:---|:---|:---|:---|
| **M3-TC-7.1** | Grid Visual Display | 1. Navigate to **Schedule** tab in Owner App.<br>2. Select a date matching a training slot's playing day (e.g., a Monday or Wednesday for `Morning Warriors`). | Membership blocks appear on the timeline grid with **Teal** background/border styling.<br>• Block label reads: `Morning Warriors (Membership)`.<br>• If `court_id` is NULL in DB, the block appears across **all courts** at the venue. | `[ ]` |
| **M3-TC-7.2** | View Membership Action | 1. On the Schedule grid, tap a teal Membership block.<br>2. In the `SlotBottomSheet` that opens, tap **View Membership**. | Bottom sheet closes and app navigates directly to `/members?slotId=...`, opening the exact roster view for that membership slot. | `[ ]` |
| **M3-TC-7.3** | Release Slot for Walk-Ins | 1. On the Schedule grid, tap a teal Membership block.<br>2. In `SlotBottomSheet`, tap **Release Slot**.<br>3. Confirm release in the alert dialog (*"Are you sure you want to release this membership slot for walk-in bookings on [Date]?"*). | Alert confirms success. The teal membership block disappears from the schedule grid for **that specific date only** (creating a row in `membership_slot_releases`). The time slot is now available (`Green`) for regular walk-in or online bookings on that day! | `[ ]` |
| **M3-TC-7.4** | Release Scope Verification | 1. After releasing a slot in **TC-7.3**, change the Date Selector in Schedule tab to the **next week's matching day** (e.g., next Monday). | The membership block is **still active and present** on next week's schedule grid, proving that slot release is cleanly scoped to the specific release date. | `[ ]` |
