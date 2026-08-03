I already have the **Schedule** screen designed for my badminton court owner app. **Do not modify, redesign, or change the Schedule page in any way.** Use it as the design reference for all new screens.

Additionally, remove the unwanted floating duplicate navigation/icons that appear across the middle of the screen during preview. These elements are not part of the UI. Keep only the actual bottom navigation fixed at the bottom of the screen and remove every duplicate/floating navigation element from the center.

Maintain the exact same:

- Visual style
- Typography
- Color palette
- Component library
- Buttons
- Cards
- Border radius
- Shadows
- Icons
- Spacing
- Mobile-first layout

The bottom navigation should contain exactly **5 tabs**:

- Schedule (Existing - Keep exactly as is)
- Bookings
- Members
- Payments
- Profile

Reports should NOT have a separate bottom navigation item. Reports must be included inside the Profile page.

Every new screen should follow the same design system as the existing Schedule screen.

--------------------------------------------------
1. BOOKINGS
--------------------------------------------------

This page manages ONLY regular hourly court bookings.

Include:

- Search
- Date Filter
- Court Filter
- Upcoming Bookings
- Ongoing Bookings
- Completed Bookings
- Cancelled Bookings

Each booking card should display:

- Player Name
- Court
- Date
- Time
- Duration
- Booking Amount
- Payment Status
- Booking Status

Booking Details should include:

- Customer Information
- Booking Details
- Payment Information
- Notes

Actions:

- Edit Booking
- Cancel Booking
- Move Booking
- Contact Customer

Do NOT include memberships anywhere on this page.

--------------------------------------------------
2. MEMBERS
--------------------------------------------------

This page manages the complete membership system.

At the top show dashboard cards:

- Total Members
- Active Members
- Vacant Slots
- Pending Applications
- Guest Play Requests

Use a tab layout inside this page instead of a long scrolling screen.

Tabs:

1. Membership Slots
2. Applications
3. Guest Play
4. Members

--------------------------------------------------
TAB 1 : Membership Slots
--------------------------------------------------

Display every membership slot as a card showing:

- Slot Name
- Playing Days
- Start Time
- End Time
- Skill Level
- Monthly Fee
- Capacity
- Current Members
- Vacancies

Actions:

- View Members
- Edit Slot
- Open / Close Recruitment
- Delete Slot

Include a Create Membership Slot screen.

Fields:

- Slot Name
- Playing Days
- Start Time
- End Time
- Skill Level
- Maximum Players
- Monthly Fee
- Billing Date
- Guest Play Fee
- Allow Guest Play
- Publish Slot

Publishing should make the slot available in the Player App under "Become a Member."

--------------------------------------------------
TAB 2 : Applications
--------------------------------------------------

Display incoming applications.

Each card:

- Player Photo
- Name
- Skill Level
- Experience
- Preferred Days
- Applied Slot

Actions:

- Accept
- Reject
- Invite for Guest Play

--------------------------------------------------
TAB 3 : Guest Play
--------------------------------------------------

Display:

Upcoming Guest Plays

Completed Guest Plays

After guest play:

- Accept as Member
- Reject Player

--------------------------------------------------
TAB 4 : Members
--------------------------------------------------

Member Profile should include:

- Personal Details
- Membership Slot
- Join Date
- Membership Type
- Monthly Fee
- Attendance
- Payment Status
- Payment History

Actions:

- Edit
- Pause Membership
- Resume Membership
- Transfer Slot
- Remove Member

--------------------------------------------------
3. PAYMENTS
--------------------------------------------------

This page manages ONLY membership payments.

Top Dashboard Cards:

- Total Collection
- Pending Collection
- Paid Members
- Pending Members
- Overdue Members
- Today's Collection
- Monthly Collection

Pending Payment List

Each payment card:

- Member Name
- Membership Slot
- Amount
- Due Date
- Status

Status Chips:

- Paid
- Due Soon
- Pending
- Overdue

Actions:

- Send Reminder
- View Payment History
- Mark as Paid
- Download Receipt

Offline Payment Entry should support:

- Cash
- Google Pay
- PhonePe
- Bank Transfer
- Cheque

Payment History screen should show:

- Date
- Amount
- Mode
- Receipt
- Status

--------------------------------------------------
4. PROFILE
--------------------------------------------------

Combine all owner settings and reports into this page.

Court Information

- Court Name
- Address
- Contact Details
- Operating Hours

Court Management

- Court List
- Court Status
- Court Names
- Amenities
- Pricing

Reports

Display premium dashboard cards and charts for:

- Daily Revenue
- Weekly Revenue
- Monthly Revenue
- Court Utilization
- Membership Growth
- Booking Trends
- Online Payments
- Offline Payments
- Pending Payments
- Overdue Payments

Notifications

Settings for:

- Booking Notifications
- Membership Applications
- Guest Play Requests
- Payment Reminder Settings

Staff Management

- Staff List
- Roles
- Permissions

Account

- Subscription Plan
- Billing
- Help & Support
- Logout

--------------------------------------------------
DESIGN GUIDELINES
--------------------------------------------------

- Do NOT redesign or modify the existing Schedule screen.
- Remove any floating duplicate navigation/icons that appear in the middle of the screen during preview. Keep only one bottom navigation fixed at the bottom.
- Reuse the existing design system.
- Maintain identical spacing, typography, colors, shadows, and component styling.
- Use Auto Layout throughout.
- Create reusable components and variants.
- Design realistic empty states, loading states, and error states.
- Connect all screens with logical navigation.
- Generate high-fidelity mobile UI ready for development.
- The experience should feel like a premium SaaS product built specifically for badminton court owners, focused on speed, simplicity, and daily operations.