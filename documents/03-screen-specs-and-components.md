# Badminton Manager — Screen Specifications & Component Inventory

## Part A: Screen Specifications

### Screen 1: Login
- **File:** `src/screens/LoginScreen.tsx` (197 lines)
- **Pattern:** Full-screen, no bottom nav
- **Background:** Dark gradient (brand)
- **Flow:** Phone input → Send OTP → 4-digit OTP entry → Verify → Schedule
- **Components:** Phone input with country code, OTP 4-digit inputs, brand logo/text, CTA button
- **State:** `step` (phone|otp), `phone`, `otp` array

### Screen 2: Dashboard
- **File:** `src/screens/DashboardScreen.tsx` (235 lines)
- **Purpose:** At-a-glance business overview
- **Sections:**
  - Greeting + notification bell
  - Venue selector
  - KPI cards (Revenue, Bookings, Courts occupied/available)
  - Live Court Grid (6 courts with status dots)
  - Quick Actions (6 icons: New Booking, Block Slot, Tournament, Coaching, Maintenance, Membership)
  - Upcoming Bookings list
  - Pending Payments
- **Note:** Dashboard referenced in v1 prompt but removed from bottom nav in v2. Only the Screen exists but is not navigable from bottom nav.

> [!WARNING]
> **Dashboard is orphaned in the current design.** It was part of v1's bottom nav but was replaced by the 5-tab layout in v2 (Schedule, Bookings, Members, Payments, Profile). The DashboardScreen still exists in code but is never rendered.

### Screen 3: Schedule
- **File:** `src/screens/ScheduleScreen.tsx` (281 lines)
- **Purpose:** Heart of the app — visual court timeline
- **Components:**
  - VenueSelector
  - Week date picker (Mon-Sun with ChevronLeft/Right)
  - Horizontal scrollable timeline grid (HOUR_WIDTH = 80px)
  - Court rows × Hour columns
  - Color-coded booking slots
  - SlotBottomSheet (appears on tap)
- **Constants:** START_HOUR=6, END_HOUR=22, courts array, bookingSlots array
- **State:** `selectedDate`, `venue`, `sheetSlot`

### Screen 4: New Booking
- **File:** `src/screens/NewBookingScreen.tsx` (363 lines)
- **Purpose:** 5-step wizard for creating bookings
- **Steps:** Date & Court → Time → Customer → Payment → Confirm
- **Data:** 6 courts, 12 time slots, mock customers
- **State:** `step`, `court`, `date`, `time`, `duration`, `customer`, `payMethod`, `whatsapp`, etc.

### Screen 5: Bookings
- **File:** `src/screens/BookingsScreen.tsx` (366 lines)
- **Purpose:** View and manage all regular bookings
- **Sub-components:** FilterSheet, BookingDetailSheet, BookingCard
- **Data source:** `src/data/bookings.ts` (8 mock bookings)
- **Tabs:** Upcoming, Ongoing, Completed, Cancelled
- **State:** `tab`, `search`, `filterOpen`, `selectedCourt`, `filterDate`, `detailBooking`

### Screen 6: Booking Details
- **File:** `src/screens/BookingDetailsScreen.tsx` (separated from BookingsScreen)
- **Purpose:** Full booking detail with actions
- **Standalone screen:** Navigated from Bookings or Dashboard

### Screen 7: Customers
- **File:** `src/screens/CustomersScreen.tsx` (9,674 bytes)
- **Purpose:** Customer management
- **Note:** Referenced in v1 prompt but not in bottom nav. May be orphaned like Dashboard.

### Screen 8: Members
- **File:** `src/screens/MembersScreen.tsx` (933 lines — largest screen)
- **Purpose:** Complete membership management
- **Sub-components (14 total):**
  - SummaryCards, AddMemberSheet, EditMemberSheet, TransferSheet
  - SlotMembersView, EditSlotSheet, CreateSlotSheet
  - SlotsTab, ApplicationsTab, GuestPlayTab, MembersListTab
- **Tabs:** Slots, Applications, Guest Play, Members
- **Data:** 4 seed membership slots, applications array, guest play data
- **State:** Complex — `tab`, `slots`, `showCreate`, `viewMembersSlot`

### Screen 9: Payments
- **File:** `src/screens/PaymentsScreen.tsx` (466 lines)
- **Purpose:** Membership payment tracking and collection
- **Sub-components:** MarkPaidSheet, HistorySheet, PaymentCard, SlotPaymentsScreen
- **Flow:** Main dashboard → Slot cards → Slot payment details
- **Data:** 11 mock payments, 4 slot definitions
- **State:** `selectedSlot`, `markPaidPayment`, `historyPayment`

### Screen 10: Profile
- **File:** `src/screens/ProfileScreen.tsx` (279 lines)
- **Purpose:** Settings hub and reports container
- **Sub-screens (separate files in `screens/profile/`):**
  - CourtInformationScreen (11,800 bytes)
  - CourtScheduleScreen (23,719 bytes)
  - GrowBusinessScreen (14,130 bytes)
  - SubscriptionBillingScreen (12,975 bytes)
  - HelpSupportScreen (11,205 bytes)
- **Inline:** Reports panel (KPIs + charts using recharts)
- **State:** `subScreen` for routing to sub-screens

### Screen 11: Reports (inline within Profile)
- **File:** `src/screens/ReportsScreen.tsx` (10,487 bytes)
- **Purpose:** Additional standalone reports screen (orphaned — unused in current routing)

---

## Part B: Component Inventory

### Shared/Reusable Components (current)

| Component | File | Props | Purpose |
|-----------|------|-------|---------|
| **BottomNav** | `components/BottomNav.tsx` | `active, onNavigate` | 5-tab bottom navigation |
| **FABMenu** | `components/FABMenu.tsx` | `onAction` | Floating Action Button with 6-action radial menu |
| **VenueSelector** | `components/VenueSelector.tsx` | `selectedVenue, onSelect` | Dropdown venue picker with 3 mock venues |
| **StatusChip** | `components/StatusChip.tsx` | `status, size` | Colored status pill (13 status variants) |

### Implicit/Repeated Components (candidates for extraction)

| Component Pattern | Used In | Should Extract? |
|-------------------|---------|-----------------|
| **KPI Card** | Dashboard, Payments, Members, Reports | ✅ Yes |
| **Booking Card** | BookingsScreen, DashboardScreen | ✅ Yes |
| **Bottom Sheet (generic)** | Schedule, Bookings, Members, Payments | ✅ Yes |
| **Search Bar** | Bookings, Members | ✅ Yes |
| **Tab Bar** | Bookings, Members | ✅ Yes |
| **Filter Sheet** | Bookings | ✅ Yes (generalizable) |
| **Payment Card** | Payments | ✅ Yes |
| **Member Card** | Members (SlotMembersView) | ✅ Yes |
| **Slot Card** | Members (SlotsTab), Payments | ✅ Yes |
| **Application Card** | Members (ApplicationsTab) | ✅ Yes |
| **Page Header** | All screens (inline) | ✅ Yes |
| **Empty State** | Mentioned in prompts, not implemented | ✅ Yes (new) |
| **Loading State** | Mentioned in prompts, not implemented | ✅ Yes (new) |
| **Error State** | Mentioned in prompts, not implemented | ✅ Yes (new) |
| **Confirmation Dialog** | Various actions | ✅ Yes (new) |
| **Date Picker** | Bookings, Schedule, New Booking | ✅ Yes |
| **Time Picker** | New Booking, Court Schedule | ✅ Yes |

---

## Part C: Design System

### Color Palette

| Token | Value | Usage |
|-------|-------|-------|
| Primary | `#2563EB` | Buttons, links, active states, brand |
| Primary Light | `#EFF6FF` | Active backgrounds, chips |
| Primary Dark | `#1D4ED8` | Hover states |
| Success | `#16A34A` | Available, Paid, Completed |
| Success Light | `#F0FDF4` | Success backgrounds |
| Warning | `#D97706` | Due Soon, Coaching, Pending |
| Warning Light | `#FFFBEB` | Warning backgrounds |
| Danger | `#DC2626` | Cancelled, Overdue, Blocked |
| Danger Light | `#FEF2F2` | Danger backgrounds |
| Purple | `#7C3AED` | Tournament, Advanced |
| Purple Light | `#F5F3FF` | Purple backgrounds |
| Surface | `#FFFFFF` | Cards, sheets |
| Background | `#F8FAFC` | Page backgrounds |
| Border | `#E2E8F0` | Borders, dividers |
| Text Primary | `#0F172A` | Headings, labels |
| Text Secondary | `#64748B` | Subtext, descriptions |
| Text Muted | `#94A3B8` | Placeholders |

### Typography

| Token | Font Family | Weights Used |
|-------|------------|--------------|
| Display | Plus Jakarta Sans | 400, 500, 600, 700, 800 |
| Body | Inter | 300, 400, 500, 600, 700, 800 |

### Spacing & Layout

| Property | Value |
|----------|-------|
| Grid | 8pt base system |
| Card border radius | 16–20px |
| Button border radius | 10–12px |
| Chip border radius | 20px (full pill) |
| Bottom nav height | 72px |
| Status bar height | 44px |
| FAB size | 56×56px |
| FAB action buttons | 44×44px |
| Phone frame | 390×844px |

### Animations

| Animation | Duration | Easing |
|-----------|----------|--------|
| `screen-enter` (slideUp) | 0.25s | cubic-bezier(0.4, 0, 0.2, 1) |
| `fadeIn` | 0.2s | ease |
| `slideInUp` (bottom sheets) | 0.3s | cubic-bezier(0.4, 0, 0.2, 1) |
| `scaleIn` (dropdowns) | 0.2s | cubic-bezier(0.4, 0, 0.2, 1) |

### Icons
- **Library:** lucide-react
- **Default size:** 20-22px for navigation, 14-16px for inline
- **Stroke width:** 2.5 (active), 1.8 (inactive)

### Slot Type Color Coding

| Type | Background | Border | Text |
|------|-----------|--------|------|
| Available | `#F0FDF4` | `#86EFAC` | `#166534` |
| Booked | `#EFF6FF` | `#93C5FD` | `#1E40AF` |
| Coaching | `#FFFBEB` | `#FCD34D` | `#92400E` |
| Tournament | `#F5F3FF` | `#C4B5FD` | `#5B21B6` |
| Maintenance | `#F8FAFC` | `#CBD5E1` | `#475569` |
| Blocked | `#FEF2F2` | `#FCA5A5` | `#991B1B` |
