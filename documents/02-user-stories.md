# Badminton Manager — User Stories & Acceptance Criteria

## Epic 1: Authentication

### US-1.1: Owner Login via OTP
**As a** venue owner,
**I want to** log in using my phone number and an OTP,
**So that** I can securely access my venue management app.

**Acceptance Criteria:**
- [ ] Phone number input accepts Indian mobile numbers (10 digits)
- [ ] Country code defaults to +91
- [ ] OTP is 4 digits
- [ ] OTP auto-advances focus to next input on entry
- [ ] Invalid OTP shows error message
- [ ] Successful verification redirects to Schedule screen
- [ ] Session persists across app restarts (expo-secure-store)
- [ ] Supports up to 3-4 concurrent device sessions

### US-1.2: Logout
**As a** venue owner,
**I want to** log out of the application,
**So that** my data is secure when I'm not using the app.

**Acceptance Criteria:**
- [ ] Logout option available in Profile
- [ ] Confirmation dialog before logout
- [ ] Clears session and redirects to Login screen
- [ ] Clears offline cache (MMKV)

### US-1.3: Account Recovery
**As a** venue owner,
**I want to** recover my account if I lose access,
**So that** I don't lose my business data.

**Acceptance Criteria:**
- [ ] Optional email backup field in Profile settings
- [ ] Automated recovery via verified backup email
- [ ] Manual support fallback using booking history verification
- [ ] Feature is optional — not required during registration

---

## Epic 2: Schedule Management

### US-2.1: View Court Schedule
**As a** venue owner,
**I want to** see a calendar-style timeline of all courts for a given day,
**So that** I can quickly understand court availability and occupancy.

**Acceptance Criteria:**
- [ ] Horizontal timeline with columns at :00 and :30 intervals (6AM–10PM)
- [ ] Each court is a separate row
- [ ] Slots are color-coded: Green=Available, Blue=Booked, Yellow=Coaching, Purple=Tournament, Grey=Maintenance, Red=Blocked, Teal=Membership
- [ ] Week-view date selector at top
- [ ] Global venue selector present (persistent across all screens)
- [ ] Supports vertical scrolling for many courts
- [ ] Membership slots appear as pre-blocked "Membership" blocks

### US-2.2: Interact with Schedule Slot
**As a** venue owner,
**I want to** tap any slot on the schedule,
**So that** I can perform actions (view, book, block, etc.) on that time slot.

**Acceptance Criteria:**
- [ ] Tapping a slot opens a bottom sheet
- [ ] Bottom sheet shows: View Booking, New Booking, Edit Booking, Block Slot, Tournament, Coaching, Maintenance
- [ ] Available action options vary based on slot status
- [ ] Selecting "New Booking" navigates to booking wizard
- [ ] Owner can force-book a Maintenance/Blocked slot with confirmation dialog

### US-2.3: Release Membership Slot
**As a** venue owner,
**I want to** release a membership slot for a specific date,
**So that** walk-in players can book it when the member doesn't show.

**Acceptance Criteria:**
- [ ] Membership blocks show a "Release for Today" action
- [ ] Released slot becomes available for regular bookings
- [ ] Release is date-specific — doesn't affect future scheduled sessions
- [ ] Released slot shows distinct visual indicator

---

## Epic 3: Bookings

### US-3.1: Create New Booking
**As a** venue owner,
**I want to** create a new booking through a step-by-step wizard,
**So that** I can accurately record customer bookings with all details.

**Acceptance Criteria:**
- [ ] Step 1: Select date and court
- [ ] Step 2: Select start time (:00 or :30 only) and duration (whole hours only: 1hr, 2hr, 3hr)
- [ ] Step 3: Search existing customer or create new (name + phone)
- [ ] Step 4: Payment entry — auto-calculated price from pricing blocks, editable override, flat discount (₹ or %), payment method, advance/pending
- [ ] Step 5: Confirmation with WhatsApp deep link toggle
- [ ] Booking summary shows all details before confirmation
- [ ] Existing customers auto-fill from search
- [ ] Booking source defaults to "Offline" (changeable to "Walk-in")
- [ ] Booking source is immutable after creation
- [ ] Overlapping bookings are hard-blocked (slot not shown as available)
- [ ] Shows both base price and final price: `Base: ₹800 | Discount: ₹100 | Total: ₹700`

### US-3.2: View & Filter Bookings
**As a** venue owner,
**I want to** view all bookings with filters and search,
**So that** I can quickly find specific bookings.

**Acceptance Criteria:**
- [ ] Tabs: Upcoming, Ongoing, Completed, Cancelled (with counts)
- [ ] Search by customer name, phone, or booking ID
- [ ] Filter by court and date
- [ ] Each card shows: player, court, time, duration, amount, payment status, booking status

### US-3.3: Manage Individual Booking
**As a** venue owner,
**I want to** view details and take actions on a booking,
**So that** I can edit, cancel, move, or collect payment.

**Acceptance Criteria:**
- [ ] Full booking detail view with customer info, booking details, payment info, notes
- [ ] Actions: Edit, Cancel, Move, Contact Customer (call/WhatsApp deep link)
- [ ] **Payment status update:** Dropdown (Pending → Partial → Paid → Refunded → Cancelled) with optional note field
- [ ] Cancel booking shows confirmation dialog
- [ ] Collect payment action with payment method selection

---

## Epic 4: Membership Management

### US-4.1: Create Membership Slot
**As a** venue owner,
**I want to** create a recurring membership slot,
**So that** I can organize regular playing groups.

**Acceptance Criteria:**
- [ ] Fields: Slot Name, Playing Days (multi-select), Start/End Time, Skill Level, Capacity, Monthly Fee, Billing Date, Guest Play Fee, Allow Guest Play toggle, Publish toggle
- [ ] Can add initial members during creation (Name + Phone)
- [ ] Can publish slot (future: appears in Player App)
- [ ] Can publish with or without members
- [ ] Created slot pre-blocks corresponding time blocks on the schedule

### US-4.2: Manage Slot Members
**As a** venue owner,
**I want to** view and manage members within a slot,
**So that** I can add, edit, transfer, or remove members.

**Acceptance Criteria:**
- [ ] Member card shows: Name, Mobile, Payment Status, Active toggle
- [ ] Active/Inactive toggle stops payment requests for inactive members
- [ ] Actions: Edit, Transfer to another slot, Remove
- [ ] FAB button to add new member (Name + Phone only)
- [ ] Capacity enforcement (cannot exceed slot capacity)

### US-4.3: Process Membership Applications
**As a** venue owner,
**I want to** review and act on player applications,
**So that** I can accept or reject potential members.

**Acceptance Criteria:**
- [ ] Application card: Photo, Name, Skill Level, Experience, Preferred Days, Applied Slot
- [ ] Actions: Accept, Reject, Invite for Guest Play

> [!NOTE]
> Applications come from the Player App (future). For MVP, members are added manually by the owner.

### US-4.4: Manage Guest Play
**As a** venue owner,
**I want to** track guest play sessions,
**So that** I can evaluate players before accepting as members.

**Acceptance Criteria:**
- [ ] View: Upcoming and Completed guest plays
- [ ] Post-guest-play actions: Accept as Member, Reject

---

## Epic 5: Membership Payments

### US-5.1: View Payment Dashboard
**As a** venue owner,
**I want to** see an overview of membership payment status,
**So that** I can track collections and outstanding payments.

**Acceptance Criteria:**
- [ ] KPI cards: Total Collection, Pending, Paid Members, Pending Members, Overdue Members
- [ ] Slot-level payment cards with Expected/Collected/Pending amounts
- [ ] Navigation: Slots → View Payments → Member Payments

### US-5.2: Record Payment
**As a** venue owner,
**I want to** mark a membership payment as paid,
**So that** I can track who has paid their monthly fees.

**Acceptance Criteria:**
- [ ] Payment mode selection: Cash, Google Pay, PhonePe, Bank Transfer, Cheque
- [ ] Payment date selection
- [ ] Status updates from Pending/Overdue to Paid
- [ ] Payment appears in history

### US-5.3: Send Payment Reminder
**As a** venue owner,
**I want to** send reminders to members with pending payments,
**So that** I can prompt timely collections.

**Acceptance Criteria:**
- [ ] One-tap send reminder per member
- [ ] **Push notification** sent to owner as confirmation (via FCM)
- [ ] **WhatsApp deep link** opens WhatsApp with pre-filled reminder message for the player
- [ ] Reminder includes: player name, slot name, amount due, due date

---

## Epic 6: Profile & Settings

### US-6.1: Manage Court Information
**As a** venue owner,
**I want to** view and edit my court details,
**So that** accurate information is displayed.

**Acceptance Criteria:**
- [ ] View: Name, Photos (horizontal scroll), Address, Google Maps link, Contact, Amenities, Court Count, Court Type (Wooden/Synthetic/Cement/Mat)
- [ ] Edit mode with inline field editing (owner has admin permission for this section)
- [ ] Photo gallery with "Add Photo" in edit mode (expo-image-picker)
- [ ] Court type is metadata only — does not affect pricing

### US-6.2: Configure Schedule & Pricing
**As a** venue owner,
**I want to** set operating hours and pricing for my courts,
**So that** the booking engine applies correct rules and rates.

**Acceptance Criteria:**
- [ ] Weekly calendar preview with color-coded pricing blocks
- [ ] Per-day time blocks with pricing (off-peak/peak/premium)
- [ ] Actions: Add/Edit/Delete blocks, Copy day's schedule, Apply to all days
- [ ] Mark day as Closed or 24 Hours
- [ ] Support per-court pricing
- [ ] Prevent overlapping time blocks

### US-6.3: View Reports
**As a** venue owner,
**I want to** view business analytics,
**So that** I can make informed decisions.

**Acceptance Criteria:**
- [ ] Period selector: Week/Month/Year
- [ ] **Revenue breakdown card:** Booking Revenue | Membership Revenue | Total
- [ ] Report types: Revenue, Court Utilization, Membership Growth, Payments
- [ ] Charts: Bar, Line, Pie
- [ ] KPI cards with trend indicators
- [ ] **CSV export** for MVP

### US-6.4: Manage Subscription
**As a** venue owner,
**I want to** view and manage my subscription plan,
**So that** I can upgrade or review billing.

**Acceptance Criteria:**
- [ ] Current plan display with benefits (static mock for MVP)
- [ ] Plan comparison (Free/Pro/Enterprise) — informational only
- [ ] Billing history with invoice download (future)
- [ ] Payment method management (future)

---

## Epic 7: Multi-Venue Support

### US-7.1: Switch Between Venues
**As a** venue owner managing multiple locations,
**I want to** switch between venues from any screen,
**So that** I can manage each location independently.

**Acceptance Criteria:**
- [ ] Global venue selector in app header, persistent across ALL screens
- [ ] Switching venue refreshes ALL data (bookings, members, payments, courts, reports)
- [ ] "All Venues" option for aggregated view
- [ ] Selected venue persists during navigation
- [ ] `currentVenueId` stored in Zustand global state
- [ ] Every API call includes `venueId` as required parameter

---

## Epic 8: Notifications (MVP)

### US-8.1: Receive Push Notifications
**As a** venue owner,
**I want to** receive push notifications for important events,
**So that** I stay informed about my business in real-time.

**Acceptance Criteria:**
- [ ] Push notification via FCM on: new booking, payment overdue (3+ days), membership application, membership expiring (7 days), booking cancellation
- [ ] Notifications delivered to owner only
- [ ] Tapping notification navigates to relevant screen
- [ ] Notification settings configurable in Profile
