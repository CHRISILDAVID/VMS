# Badminton Manager — Resolved Decisions & Glossary

> [!NOTE]
> All questions have been resolved with the client/ideator. This document serves as the **definitive reference** for all design and business decisions.

---

## 🟢 Critical — Resolved

### Q1: Admin vs Owner Relationship ✅

**Decision:** A **super-admin** exists who onboards venues via a **separate admin panel** (simple web app).

- The **Admin Panel** is a desktop-first React web app, deployed separately
- Admin creates venue listings, configures courts, assigns owners
- **Owner** manages day-to-day operations (bookings, members, payments)
- Owner has admin permissions ONLY for: Court Information (name, photos, address, maps, amenities) in the Profile section
- Initial court info must be fed into the DB from the admin panel

### Q2: Dashboard Screen — Removed ✅

**Decision:** Dashboard is **removed**. The current 5-tab bottom navigation is final.

- `DashboardScreen.tsx`, `CustomersScreen.tsx`, `ReportsScreen.tsx` are orphaned Figma artifacts
- Bottom nav: Schedule | Bookings | Members | Payments | Profile
- The current UI/UX flow is approved by the ideator

### Q3: Booking Payments vs Membership Payments ✅

**Decision:** Keep them **separated**. This is correct domain modeling.

- **Booking payments** are transactional — captured at creation time in the wizard. This is the primary entry point.
- **Membership payments** are recurring/subscription-based — tracked on the Payments page.
- **Aggregate revenue** lives in **Reports** — the only place where both streams merge.
  - Add a revenue breakdown card: `Booking Revenue | Membership Revenue | Total`

**Booking payment status CAN change after creation:**
- Player books, pays ₹500 advance, pays ₹500 at court → `Partial → Paid`
- Player cancels → `Paid → Refunded`
- Owner gives credit → `Pending → Credit`

**Implementation:** Add a payment status update action on the Booking Detail screen — a simple dropdown (`Pending → Partial → Paid → Refunded → Cancelled`) with an optional note field.

### Q4: Multi-Venue Data Architecture ✅

**Decision:** The venue selector must be **global**, and **ALL data must be venue-scoped.**

- Global venue selector in the app header/top bar, persistent across all screens
- When venue changes, the entire data context refreshes (bookings, members, payments, courts, reports — everything)
- Store `currentVenueId` in global state (Zustand)
- Every API call includes `venueId` as a required parameter
- Memberships and payments are absolutely venue-scoped
- A player can be a member at Venue A but not Venue B — separate membership records

### Q5: Player App ✅

**Decision:** The Player App is a **separate project. Deferred entirely.**

- For MVP, the Player App is out of scope
- The owner app alone delivers immediate value
- "Published membership slots" can be shared via WhatsApp links or a simple public booking page (web URL)
- When built later: Phone + OTP auth, browse courts, book & pay, view/apply memberships

### Q6: WhatsApp Integration ✅

**Decision:** Start with **deep links**. Graduate to WhatsApp Business API later.

| Phase | Implementation | Effort |
|-------|---------------|--------|
| **MVP** | `whatsapp://send?phone=91XXXXXXXXXX&text=...` deep links | 1 day |
| **V2** | WhatsApp Business API via Gupshup/Wati/Interakt | 1-2 weeks |
| **V3** | Template messages for automated reminders | Ongoing |

- WhatsApp IS the primary communication channel (India market)
- Booking confirmation: pre-formatted message, owner hits send manually
- Payment reminders: "Send Reminder" button opens WhatsApp with pre-filled message

### Q7: Notifications System ✅

**Decision:** MVP: **Push notifications to the owner only** via Firebase Cloud Messaging (FCM).

| Trigger | Channel | Recipient |
|---------|---------|-----------|
| New booking created | Push | Owner |
| Payment overdue (3+ days) | Push + in-app badge | Owner |
| Membership application received | Push | Owner |
| Membership expiring (7 days) | Push | Owner |
| Booking cancellation | Push | Owner |

- Skip SMS, email, and player notifications for MVP
- Player-facing notifications only when Player App exists

### Q8: Staff & Roles ✅

**Decision:** **Owner-only for MVP.** No staff roles needed.

| Role | Permissions |
|------|------------|
| **Owner** | Full access. Everything. |

- 3-4 device login is sufficient for managing all courts and venues
- No need to drill down roles — most venues don't have many organizers

### Q9: Offline Capability ✅

**Decision:** Read-only cache for critical data. No offline writes.

| Feature | Offline Support |
|---------|----------------|
| View today's schedule | ✅ Cache locally (MMKV) |
| View member list | ✅ Cache locally (MMKV) |
| Create bookings | ❌ Requires internet |
| Record payments | ❌ Requires internet |
| Reports | ❌ Not available offline |

- Show "You're offline — showing cached data" banner
- Cache last-fetched data in MMKV

### Q10: Receipt & Invoice Generation ✅

**Decision:** PDF. Keep it simple.

- **Booking receipt:** PDF with venue name, booking details, amount, payment mode, date
- **Membership receipt:** Same format, with membership plan details
- **No GST for MVP** (most small venues aren't GST registered)
- **GST:** Add as optional toggle in venue settings. When enabled, add GSTIN and tax breakdown
- **Required fields:** Venue name, address, phone, receipt number (auto-generated), date, player name, amount, payment mode
- **Technology:** `expo-print` for React Native PDF generation

### Q11: Booking Conflict Rules ✅

**Decision:** Hard block overlapping bookings. No exceptions in the system.

- If Court 1 is booked 6-7 PM, that slot is unavailable. Period.
- **Owner force-book:** Allowed with confirmation dialog: _"This slot is marked as Maintenance. Book anyway?"_ Logged as override.
- **Membership vs regular:** Membership slots are **pre-blocked** when created. Appear as "Membership" blocks on calendar. Regular bookings cannot overlap unless owner explicitly releases the slot.
- **Release slot:** If a membership player doesn't show, owner can release that specific date's slot for walk-ins.

### Q12: Pricing Engine ✅

**Decision:** Auto-calculate. Allow override.

- When owner selects court + time slot, price auto-fills from pricing rules
- Price field is **editable** — owner can override (discounts, regulars, group bookings)
- **Discounts:** Simple flat discount field (₹ amount or %). Show: `Base Price: ₹800 | Discount: ₹100 | Total: ₹700`
- Store both calculated price and final price for reporting accuracy
- No complex discount engine (coupons, promo codes) — that's Player App territory

---

## 🟢 Secondary — Resolved

### Q13: Subscription Business Model ✅

**Decision:** Ignore for now. Copy the same mock from the Figma design as a static placeholder.

### Q14: "Grow Your Business" Modules ✅

**Decision:** Not MVP. Not even V2. These are V4+ features.

Keep the CTA pages as aspirational placeholders — they serve as a product roadmap teaser.

### Q15: Report Export ✅

**Decision:** CSV for MVP. PDF for V2.

- CSV is trivial and covers 90% of use cases (owners open in Excel/Google Sheets)
- Include: Date, Booking ID, Court, Player, Amount, Payment Status, Source

### Q16: Booking Sources ✅

**Decision:**

| Source | Meaning |
|--------|---------|
| **Online** | Booked via Player App or public booking page (future) |
| **Offline** | Owner created on behalf of player (phone call, WhatsApp) |
| **Walk-in** | Player showed up without prior booking |
| **Membership** | Auto-generated from active membership schedule |

- For MVP: only **Offline** and **Walk-in** (no Player App)
- Default to "Offline", let owner change it
- **Booking source is immutable after creation** — it's an audit field

### Q17: Court Types ✅

**Decision:** Include court type as metadata. No pricing impact.

Common types in India:
- Wooden (most premium)
- Synthetic/PVC (most common)
- Cement
- Mat

Court type is for display purposes. Pricing is per court + time block.

### Q18: Currency & Localization ✅

**Decision:**
- All pricing uses ₹ (Indian Rupees)
- No multi-currency
- No multi-language

---

## Additional Resolved Decisions

### Booking Slot Time Rules
- **Start times** can begin every **30 minutes** (`:00` or `:30`)
- **Booking duration** must be in **whole-hour increments only** (1hr, 2hr, 3hr, etc.)

### Multi-Device Login
- Allow concurrent sessions (max 3-4 devices)
- Sufficient for managing courts — no need for separate staff roles

### Account Recovery
- Optional feature in profile settings
- Verified backup email for automated recovery
- Manual support fallback using booking history verification

### Payment Reminders
- **Push notification** (MVP, via FCM)
- WhatsApp deep link as secondary option

### Platform
- **Owner App:** React Native (Expo) — full native mobile app (Android primary, iOS secondary)
- **Admin Panel:** React web app (Vite + Tailwind) — desktop browser only
- **Backend:** Supabase (shared by all apps)

---

## Glossary

| Term | Definition |
|------|-----------|
| **Venue** | A physical badminton facility (e.g., "Elite Arena OMR"). An owner can have multiple venues. |
| **Court** | A single badminton court within a venue. Courts have names (Court 1, Court 2, etc.) |
| **Time Slot** | A specific hour-long (or custom duration) period on a court. The fundamental booking unit. Start times at :00 or :30 only, whole-hour durations. |
| **Booking** | A one-time court reservation by a customer for a specific date/time/court. |
| **Membership Slot** | A recurring group of players who play at fixed times on fixed days (e.g., "Morning Warriors: Mon/Wed/Fri 6-8AM"). |
| **Member** | A player who belongs to a membership slot and pays a monthly fee. |
| **Guest Play** | A trial session where a non-member plays with a membership group before being accepted or rejected. |
| **Application** | A player's request to join a membership slot, submitted through the Player App (future). |
| **Pricing Block** | A time range on a specific day(s) with a defined hourly rate, applied to one or more courts. |
| **Peak Hours** | Higher-priced time blocks (typically evenings/weekends). |
| **Off-Peak** | Lower-priced time blocks (typically mornings/weekdays). |
| **FAB** | Floating Action Button — the "+" button that opens quick action options. |
| **Bottom Sheet** | A panel that slides up from the bottom of the screen to show details or forms. |
| **KPI Card** | Key Performance Indicator card — small stat widget showing a metric value with label. |
| **Badminton Manager** | The product name — the app being built. |
| **Player App** | A separate consumer-facing app (deferred). Players book courts, apply for memberships, make payments. |
| **Admin Panel** | A desktop web app for the super-admin to onboard venues, create courts, manage owners. |
| **Super-Admin** | Platform-level administrator who creates and configures venues in the system. |
| **RLS** | Row-Level Security — PostgreSQL feature that restricts data access per user. |
| **Deep Link** | A URL that opens a specific app (e.g., WhatsApp) with pre-filled content. |
| **FCM** | Firebase Cloud Messaging — free push notification service for mobile apps. |
| **MMKV** | Fast key-value storage library for React Native, used for offline caching. |
