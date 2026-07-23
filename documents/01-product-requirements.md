# Badminton Manager — Product Requirements Document (PRD)

## 1. Executive Summary

**Product Name:** Badminton Manager
**Product Type:** Mobile-first SaaS application for badminton court/venue management
**Target Platform:** Android (primary), iOS (secondary), Web (admin dashboard — future)
**Frame Reference:** 390 × 844 (mobile portrait)

Badminton Manager is a comprehensive venue management system designed specifically for badminton facility owners. It replaces ad-hoc management tools (spreadsheets, WhatsApp groups, pen-and-paper) with a single, premium mobile application covering daily operations: scheduling, bookings, membership management, payments, and business reporting.

The product aims to be more intuitive than existing competitors (TurfTown, Playo) by prioritizing **operational efficiency** — enabling venue owners to manage their business with the fewest possible taps.

---

## 2. Target Users

### Primary User: Venue/Court Owner
- Owns one or more badminton facilities
- Manages 2–30+ courts across venues
- Handles daily operations: bookings, memberships, payments
- Needs at-a-glance business overview
- May delegate to staff but retains full control

### Secondary Users

| User | Description |
|------|-------------|
| **Staff** | Employees with limited permissions (e.g., booking-only, front-desk) |
| **Players** (future) | End-users who book courts, apply for memberships, and make payments through a separate Player App |
| **Coaches** (future) | Coaching professionals listed by venues |
| **Organizers** (future) | Tournament hosts using venue facilities |

---

## 3. User Roles & Permissions

| Role | Access Scope |
|------|-------------|
| **Owner** | Full access to all venues, courts, members, payments, reports, settings |
| **Staff** (designed but not fully specified) | Configurable permissions per role (roles and permissions UI exists in Profile) |
| **Admin** (implied) | Platform-level admin who creates courts — mentioned in v3 prompt ("the court is already created by the Admin") |

> [!IMPORTANT]
> **Open Question:** The relationship between "Owner" and "Admin" is unclear. The v3 prompt states "The court is already created by the Admin" — does this mean there is a super-admin who onboards venues? Or is this self-service?

---

## 4. Business Structure

```
Owner
 └── Venue(s)
      └── Court(s)
           ├── Time Slots → Bookings → Customers → Payments
           └── Membership Slots → Members → Membership Payments
```

The system must support:
- Single venue with 2 courts
- Single venue with 12 courts
- Multiple venues with 30+ courts
- Future franchise model

---

## 5. Primary Workflows

### Flow 1 — New Booking (Core)
```
Schedule → Tap Empty Slot → New Booking Wizard
  Step 1: Select Date & Court
  Step 2: Select Time & Duration
  Step 3: Search/Create Customer
  Step 4: Payment Details
  Step 5: Booking Confirmation
→ Return to Schedule
```

### Flow 2 — Collect Payment
```
Bookings → Tap Booking Card → Booking Details → Collect Payment → Complete Booking
```

### Flow 3 — Membership Management
```
Members → Slots Tab → Create Slot → Add Initial Members → Publish
Members → Slot Card → View Members → Add/Edit/Transfer/Remove Members
```

### Flow 4 — Membership Payment Collection
```
Payments → Membership Slots List → View Payments → Filter by Status → Mark as Paid
```

### Flow 5 — View Reports
```
Profile → Reports → Select Period → View Revenue/Utilization/Growth Charts
```

### Flow 6 — Court Configuration
```
Profile → Court Information → Edit Details
Profile → Court Schedule & Pricing → Manage Time Blocks & Pricing
```

---

## 6. Feature List

### 6.1 Authentication
| Feature | Status |
|---------|--------|
| Phone number input | Designed |
| OTP verification (4-digit) | Designed |
| Auto-login / session persistence | Not designed |
| Logout | Designed |
| Multi-device login | Not specified |
| Account recovery | Not specified |

### 6.2 Schedule (Heart of the App)
| Feature | Status |
|---------|--------|
| Google Calendar-style horizontal timeline | Designed |
| Court rows with hourly slots (6AM–10PM default) | Designed |
| Color-coded slot types (Available/Booked/Coaching/Tournament/Maintenance/Blocked) | Designed |
| Week-view date selector | Designed |
| Venue selector | Designed |
| Tap slot → Bottom Sheet with actions | Designed |
| Unlimited vertical scrolling for many courts | Designed |

### 6.3 Bookings (Regular Court Bookings Only)
| Feature | Status |
|---------|--------|
| Search by name, phone, booking ID | Designed |
| Filter by court and date | Designed |
| Tab categories: Upcoming/Ongoing/Completed/Cancelled | Designed |
| Booking card with player, court, time, duration, amount, status | Designed |
| Booking detail bottom sheet | Designed |
| Actions: Edit, Cancel, Move, Contact Customer | Designed |
| New Booking wizard (5 steps) | Designed |

### 6.4 Membership System
| Feature | Status |
|---------|--------|
| Membership Slots (recurring time-based groups) | Designed |
| Create slot with: name, days, time, skill, capacity, fee, guest play | Designed |
| Initial members during slot creation | Designed |
| View/Add/Edit/Remove members per slot | Designed |
| Member active/inactive toggle | Designed |
| Transfer member between slots | Designed |
| Open/Close recruitment toggle | Designed |
| Membership applications (player submissions) | Designed |
| Guest Play management (trial sessions) | Designed |
| Accept guest player as member | Designed |

### 6.5 Payments (Membership Payments Only)
| Feature | Status |
|---------|--------|
| Dashboard KPIs (Total/Pending/Paid/Overdue) | Designed |
| Navigate: Slots → Slot Payments → Member Payments | Designed |
| Filter chips: All/Paid/Pending/Overdue | Designed |
| Mark as Paid (with payment mode) | Designed |
| Send reminder | Designed |
| View payment history | Designed |
| Download receipt | Designed |
| Offline payment modes: Cash, Google Pay, PhonePe, Bank Transfer, Cheque | Designed |

### 6.6 Profile & Settings
| Feature | Status |
|---------|--------|
| Court Information (name, photos, address, maps, amenities) | Designed |
| Court Schedule & Pricing (weekly calendar, time blocks, pricing tiers) | Designed |
| Reports (Revenue, Utilization, Growth, Payment Split) | Designed |
| Grow Your Business (4 promotional pages) | Designed |
| Subscription & Billing (Free/Pro/Enterprise plans) | Designed |
| Help & Support (FAQs, contact, legal) | Designed |
| Logout | Designed |

### 6.7 Future Modules (Designed as Placeholders)
| Module | Status |
|--------|--------|
| Tournament Hosting | Promo page only |
| Coaching Programs | Promo page only |
| Sports Equipment Shop | Promo page only |
| Event Promotion | Promo page only |
| Academy Management | Reserved |
| Equipment Rental | Reserved |
| Café / POS | Reserved |
| Inventory Management | Reserved |
| Wallet / Loyalty | Reserved |
| Staff Attendance | Reserved |
| QR Check-in | Reserved |
| Dynamic Pricing | Reserved |
| Franchise Management | Reserved |

---

## 7. Navigation Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Bottom Navigation                     │
├───────────┬───────────┬──────────┬──────────┬───────────┤
│ Schedule  │ Bookings  │ Members  │ Payments │ Profile   │
├───────────┴───────────┴──────────┴──────────┴───────────┤
│                                                          │
│  Schedule ─────── Slot Bottom Sheet                      │
│  │                 ├── View Booking                      │
│  │                 ├── New Booking → 5-step wizard       │
│  │                 ├── Block Slot                        │
│  │                 ├── Tournament                        │
│  │                 ├── Coaching                          │
│  │                 └── Maintenance                       │
│                                                          │
│  Bookings ─────── Booking Detail Bottom Sheet            │
│  │                 ├── Edit                              │
│  │                 ├── Cancel                            │
│  │                 ├── Move                              │
│  │                 └── Contact                           │
│                                                          │
│  Members ──────── [Tabs: Slots | Applications |          │
│  │                       Guest Play | Members]           │
│  ├── Slot Members View                                   │
│  ├── Create Slot Sheet                                   │
│  └── Edit Slot Sheet                                     │
│                                                          │
│  Payments ─────── Slot Cards                             │
│  │                 └── Slot Payments                     │
│  │                      └── Mark Paid / History          │
│                                                          │
│  Profile ──────── Court Information                      │
│  │                Court Schedule & Pricing               │
│  │                Reports                                │
│  │                Grow Your Business                     │
│  │                 ├── Become an Organizer               │
│  │                 ├── Add Coaches                       │
│  │                 ├── Sell Sports Items                 │
│  │                 └── Promote Events                    │
│  │                Subscription & Billing                 │
│  │                Help & Support                         │
│  └── Logout                                              │
│                                                          │
│  FAB (on Schedule & Bookings) ──────                     │
│   ├── New Booking                                        │
│   ├── Block Slot                                         │
│   ├── Tournament                                         │
│   ├── Coaching                                           │
│   ├── Maintenance                                        │
│   └── Membership                                         │
└──────────────────────────────────────────────────────────┘
```

---

## 8. Business Rules (Extracted / Inferred)

| # | Rule | Source | Confidence |
|---|------|--------|------------|
| BR-1 | Every booking belongs to exactly one Venue and one Court | v1 prompt | ✅ Explicit |
| BR-2 | Booking payments can be: Paid, Partial, or Unpaid | Mock data | ✅ Explicit |
| BR-3 | Booking sources: Online, Offline, Walk-in, Membership | v1 prompt | ✅ Explicit |
| BR-4 | Payment supports: Cash, UPI, Card (bookings); Cash, GPay, PhonePe, Bank Transfer, Cheque (membership) | v1, v2 prompts | ✅ Explicit |
| BR-5 | Membership slots are time-based recurring groups (e.g., Mon/Wed/Fri 6-8AM) | v2 prompt | ✅ Explicit |
| BR-6 | A membership slot has a skill level and capacity limit | v2 prompt | ✅ Explicit |
| BR-7 | Members can be paused (inactive) — stops payment requests until reactivated | v5 prompt | ✅ Explicit |
| BR-8 | Members can transfer between slots | v5 prompt | ✅ Explicit |
| BR-9 | Published slots appear in the Player App under "Become a Member" | v2 prompt | ✅ Explicit |
| BR-10 | Payments page manages ONLY membership payments, NOT booking payments | v2, v5 prompts | ✅ Explicit |
| BR-11 | Booking payments are handled within the booking flow itself | v1 prompt | ⚠️ Inferred |
| BR-12 | Pricing blocks support weekday/weekend/peak/off-peak/per-court differentiation | v3 prompt | ✅ Explicit |
| BR-13 | Time blocks cannot overlap within the same court/day | v3 prompt | ✅ Explicit |
| BR-14 | Venue switching refreshes all data globally | v1 prompt | ✅ Explicit |
| BR-15 | Subscription model: Free / Pro / Enterprise tiers | v3 prompt | ✅ Explicit |

---

## 9. Non-Functional Requirements

| Category | Requirement |
|----------|-------------|
| **Performance** | Dashboard content understandable within 10 seconds |
| **Usability** | One-handed usage, portrait orientation, fast daily operations |
| **Design** | Material Design 3 patterns, 8pt grid, 16-20px border radius |
| **Scalability** | Support 2 courts → 30+ courts without redesign |
| **Multi-venue** | All screens must support venue-level data isolation |
| **Offline** | Not specified (Open Question) |
| **Localization** | Indian market (₹ currency, Indian phone numbers, Indian payment methods) |
| **Accessibility** | Not specified (Open Question) |

