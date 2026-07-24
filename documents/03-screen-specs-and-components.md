# Badminton Manager — Screen Specifications & Component Inventory

## Part A: Screen Specifications

> [!NOTE]
> These specifications are derived from the Figma design export (archived in `reference/figma-src/`). The production app will be built in React Native (Expo) using these as visual reference.

### Screen 1: Login
- **Pattern:** Full-screen, no bottom tab nav
- **Background:** Dark gradient (brand)
- **Flow:** Phone input → Send OTP → 4-digit OTP entry → Verify → Schedule
- **Components:** Phone input with country code (+91), OTP 4-digit inputs, brand logo/text, CTA button
- **State:** `step` (phone|otp), `phone`, `otp` array
- **Auth:** Supabase Auth (Phone + OTP), tokens stored in expo-secure-store

### Screen 2: Schedule (Heart of the App)
- **Purpose:** Visual court timeline — the primary daily operations screen
- **Components:**
  - Global VenueSelector (Zustand state)
  - Week date picker (Mon-Sun with ChevronLeft/Right)
  - Horizontal scrollable timeline grid
  - Court rows × Time columns (:00 and :30 intervals)
  - Color-coded booking/membership/maintenance slots
  - SlotBottomSheet (appears on tap)
- **Constants:** START_HOUR=6, END_HOUR=22
- **State:** `selectedDate`, `selectedVenue` (global), `sheetSlot`

### Screen 3: New Booking (5-Step Wizard)
- **Purpose:** Create bookings with guided flow
- **Steps:** Date & Court → Time & Duration → Customer → Payment → Confirm
- **Constraints:** Start times :00/:30, durations in whole hours
- **Features:** Price auto-calculation, owner override, flat discount, WhatsApp toggle
- **State:** `step`, `court`, `date`, `time`, `duration`, `customer`, `payMethod`, `discount`, `whatsapp`

### Screen 4: Bookings
- **Purpose:** View and manage all regular bookings
- **Sub-components:** FilterSheet, BookingDetailSheet, BookingCard
- **Tabs:** Upcoming, Ongoing, Completed, Cancelled
- **State:** `tab`, `search`, `filterOpen`, `selectedCourt`, `filterDate`, `detailBooking`

### Screen 5: Booking Details
- **Purpose:** Full booking detail with actions
- **Key Feature:** Payment status update dropdown (Pending → Partial → Paid → Refunded → Cancelled) + optional note
- **Actions:** Edit, Cancel, Move, Contact (Call / WhatsApp deep link)

### Screen 6: Members
- **Purpose:** Complete membership management (largest screen)
- **Sub-components:**
  - SummaryCards, AddMemberSheet, EditMemberSheet, TransferSheet
  - SlotMembersView, EditSlotSheet, CreateSlotSheet
  - SlotsTab, ApplicationsTab, GuestPlayTab, MembersListTab
- **Tabs:** Slots, Applications, Guest Play, Members
- **State:** Complex — `tab`, `slots`, `showCreate`, `viewMembersSlot`

### Screen 7: Payments
- **Purpose:** Membership payment tracking and collection
- **Sub-components:** MarkPaidSheet, HistorySheet, PaymentCard, SlotPaymentsScreen
- **Flow:** Main dashboard → Slot cards → Slot payment details
- **State:** `selectedSlot`, `markPaidPayment`, `historyPayment`

### Screen 8: Profile
- **Purpose:** Settings hub and navigation to sub-screens
- **Sub-screens:**
  - Court Information (view + edit, owner admin permission)
  - Court Schedule & Pricing
  - Reports (with revenue breakdown card)
  - Grow Your Business (4 placeholder pages)
  - Subscription & Billing (static mock)
  - Help & Support
  - Account Recovery (optional email)
  - Logout

---

## Part B: Component Inventory

### Shared/Reusable Components (Production)

| Component | Purpose |
|-----------|---------|
| **BottomTabBar** | 5-tab navigation (Schedule, Bookings, Members, Payments, Profile) |
| **FABMenu** | Floating Action Button with 6-action radial menu |
| **VenueSelector** | Global dropdown venue picker (Zustand state) |
| **StatusChip** | Colored status pill (13+ status variants) |
| **BottomSheet** | @gorhom/bottom-sheet for details/forms |
| **KPICard** | Metric value card with label and trend indicator |
| **BookingCard** | Booking summary card (player, court, time, status) |
| **MemberCard** | Member info card with active toggle |
| **SlotCard** | Membership slot summary with capacity bar |
| **PaymentCard** | Payment status card per member |
| **SearchBar** | Search input with icon |
| **TabBar** | Horizontal tab selector with counts |
| **FilterChips** | Horizontal scrolling filter pills |
| **DatePicker** | Date selection (week view or calendar) |
| **TimePicker** | Time selection (:00/:30 intervals) |
| **PageHeader** | Screen title with back button and optional actions |
| **EmptyState** | Illustration + message for empty lists |
| **ErrorState** | Error message with retry button |
| **Skeleton** | Loading placeholder animations |
| **Button** | Primary/secondary/ghost variants |
| **Card** | Content container with shadow and radius |
| **Input** | Text input with label, error, and icon support |
| **Select** | Dropdown/picker component |
| **Badge** | Count indicator (notification badges) |
| **Avatar** | User/venue photo with fallback |
| **Dialog** | Confirmation modal |

---

## Part C: Design System

### Color Palette

| Token | Value | Usage |
|-------|-------|-------|
| Primary | `#2563EB` | Buttons, links, active states, brand |
| Primary Light | `#EFF6FF` | Active backgrounds, chips |
| Primary Dark | `#1D4ED8` | Hover/press states |
| Success | `#16A34A` | Available, Paid, Completed |
| Success Light | `#F0FDF4` | Success backgrounds |
| Warning | `#D97706` | Due Soon, Coaching, Pending |
| Warning Light | `#FFFBEB` | Warning backgrounds |
| Danger | `#DC2626` | Cancelled, Overdue, Blocked |
| Danger Light | `#FEF2F2` | Danger backgrounds |
| Purple | `#7C3AED` | Tournament, Advanced |
| Purple Light | `#F5F3FF` | Purple backgrounds |
| Teal | `#0D9488` | Membership blocks |
| Teal Light | `#F0FDFA` | Membership backgrounds |
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
| Bottom tab height | 72px |
| FAB size | 56×56px |
| FAB action buttons | 44×44px |
| Minimum touch target | 44×44px |

### Animations

| Animation | Duration | Easing |
|-----------|----------|--------|
| Screen transitions | 250ms | cubic-bezier(0.4, 0, 0.2, 1) |
| Fade in | 200ms | ease |
| Bottom sheet slide | 300ms | cubic-bezier(0.4, 0, 0.2, 1) |
| Dropdown scale | 200ms | cubic-bezier(0.4, 0, 0.2, 1) |

### Icons
- **Library:** Lucide React Native
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
| Membership | `#F0FDFA` | `#5EEAD4` | `#115E59` |
