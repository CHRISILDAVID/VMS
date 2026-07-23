# Badminton Manager — Open Questions & Missing Requirements

> [!IMPORTANT]
> These questions MUST be clarified with the ideator/client before implementation begins. Each item represents a gap in the design or business logic that cannot be safely assumed.

---

## 🔴 Critical — Blocks Core Features

### Q1: Admin vs Owner Relationship
The v3 prompt states: *"The court is already created by the Admin."*
- **Who is the Admin?** Is there a super-admin who onboards venues, or do owners onboard themselves?
- Is there a separate Admin panel?
- Does the Admin create the court listing, and the owner only manages it?
- If owner self-service, who creates the initial venue/court in the system?

### Q2: Dashboard Screen — Included or Removed?
- v1 included Dashboard as a bottom nav tab. v2 explicitly changed the bottom nav to 5 tabs without Dashboard.
- DashboardScreen.tsx still exists in code but is **never rendered**.
- **Should the Dashboard be kept as a home screen?** If so, how does the user navigate to it?
- The `CustomersScreen.tsx` and `ReportsScreen.tsx` are also orphaned.

### Q3: Booking Payments vs Membership Payments
- The design explicitly separates: **Bookings page = booking payments**, **Payments page = membership payments only**.
- **Where does the owner track aggregate revenue?** Reports combines both, but individual collection is split.
- When a booking is created, payment is captured in the wizard. Is that the only place to manage booking payments?
- **Can booking payment status change after creation?** (e.g., partial → paid)

### Q4: Multi-Venue Data Architecture
- The v1 prompt requires multi-venue support with venue switching refreshing all data.
- **Is the venue selector global or per-screen?** Currently it's present on Schedule and Dashboard (orphaned), but NOT on Bookings, Members, or Payments.
- Should memberships and payments be venue-scoped?

### Q5: Player App
- The v2 prompt references a "Player App" where published membership slots appear under "Become a Member."
- **Is the Player App part of this project?** Or is it a separate application?
- What does the Player App do? (Book courts? Apply for memberships? Make payments?)
- How do players create accounts?

---

## 🟡 Important — Affects UX & Functionality

### Q6: WhatsApp Integration
- The booking flow includes a "WhatsApp Confirmation Toggle."
- Payment reminders mention "Send Reminder" with no channel specified.
- **What is the WhatsApp integration scope?** Template messages? WhatsApp Business API? Simple deep links?
- Is WhatsApp the primary communication channel with customers?

### Q7: Notifications System
- Profile mentions notification settings for: Booking, Membership, Guest Play, Payment Reminders.
- **What triggers notifications?** New booking? Payment due? Application received?
- **What channels?** Push notification? SMS? WhatsApp? Email?
- **Who receives notifications?** Owner only? Staff? Players?

### Q8: Staff & Roles
- Profile mentions Staff List, Roles, Permissions.
- **What roles exist?** (e.g., Manager, Front Desk, Coaching Staff)
- **What permissions are configurable?** (e.g., can create bookings, cannot modify pricing)
- When does staff management become a priority?

### Q9: Offline Capability
- The app is designed for venue owners who are on-ground during operations.
- **Is offline support required?** (e.g., record bookings when internet is down, sync later)
- Indian market context: intermittent connectivity is common.

### Q10: Receipt & Invoice Generation
- Payments has "Download Receipt" actions.
- Subscription & Billing has "Download Invoice".
- **What format?** PDF? Simple text? Branded template?
- **What information must be on the receipt?** (GST? Business details?)

### Q11: Booking Conflict Rules
- What happens when two bookings overlap for the same court?
- Can the owner force-book a slot that appears blocked or maintenance?
- How are membership slots and regular bookings reconciled on the same court?

### Q12: Pricing Engine
- Court Schedule & Pricing defines time blocks with pricing.
- **Does pricing auto-calculate in the booking wizard?** Based on time block rules?
- Can the owner override the calculated price during booking?
- Are discounts supported? (The v1 booking summary mentions "Discount")

---

## 🟢 Secondary — Can Be Deferred

### Q13: Subscription Business Model
- Free / Pro / Enterprise tiers are designed.
- **What are the actual feature limits per tier?**
- How many venues/courts per tier?
- Is payment processing (Stripe/Razorpay) needed for subscriptions?

### Q14: "Grow Your Business" Modules
- 4 promotional pages (Organizer, Coaches, Sports Items, Events) exist as CTA-only.
- **When will these features be implemented?**
- Are they even part of MVP scope?

### Q15: Report Export
- v1 mentions "Export Report."
- **What format?** CSV? PDF? Excel?
- **What data should be included per export?**

### Q16: Booking Sources
- v1 defines: Online, Offline, Walk-in, Membership.
- **What is "Online"?** — booked through the Player App?
- **What is "Offline"?** — phone call?
- **What is "Walk-in"?** — physically at the venue?
- Can booking source change after creation?

### Q17: Court Types
- Court Information mentions "Court Type."
- **What types?** (Wooden, Synthetic, Cement, Acrylic?)
- Does court type affect pricing?

### Q18: Currency & Localization
- All pricing uses ₹ (Indian Rupees).
- **Is multi-currency needed?**
- **Is multi-language needed?** (Hindi, Tamil, etc.)

---

## Glossary

| Term | Definition |
|------|-----------|
| **Venue** | A physical badminton facility (e.g., "Elite Arena OMR"). An owner can have multiple venues. |
| **Court** | A single badminton court within a venue. Courts have names (Court 1, Court 2, etc.) |
| **Time Slot** | A specific hour-long (or custom duration) period on a court. The fundamental booking unit. |
| **Booking** | A one-time court reservation by a customer for a specific date/time/court. |
| **Membership Slot** | A recurring group of players who play at fixed times on fixed days (e.g., "Morning Warriors: Mon/Wed/Fri 6-8AM"). |
| **Member** | A player who belongs to a membership slot and pays a monthly fee. |
| **Guest Play** | A trial session where a non-member plays with a membership group before being accepted or rejected. |
| **Application** | A player's request to join a membership slot, submitted through the Player App. |
| **Pricing Block** | A time range on a specific day(s) with a defined hourly rate, applied to one or more courts. |
| **Peak Hours** | Higher-priced time blocks (typically evenings/weekends). |
| **Off-Peak** | Lower-priced time blocks (typically mornings/weekdays). |
| **FAB** | Floating Action Button — the blue "+" button that opens quick action options. |
| **Bottom Sheet** | A panel that slides up from the bottom of the screen to show details or forms. |
| **KPI Card** | Key Performance Indicator card — small stat widget showing a metric value with label. |
| **Badminton Manager** | The product name — the app being built. |
| **Player App** | A separate consumer-facing app referenced in prompts where players book courts, apply for memberships, etc. |
