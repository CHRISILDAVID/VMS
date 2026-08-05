# Badminton Manager — Frontend Architecture

## 1. Overview

Two separate frontend apps sharing a common code package:

| App | Platform | Tech | Purpose |
|-----|----------|------|---------|
| **Owner App** | Mobile (Android/iOS) | React Native + Expo | Daily venue operations |
| **Admin Panel** | Web (Desktop) | React + Vite + Tailwind | Super-admin venue management |

---

## 2. Owner App Technology Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Framework | React Native + Expo SDK 52 | Native mobile |
| Language | TypeScript 5.x | Type safety |
| Navigation | Expo Router 4.x | File-based routing |
| Styling | NativeWind 4.x | Tailwind for React Native |
| State (Server) | TanStack React Query 5.x | Data fetching, caching |
| State (Client) | Zustand 5.x | Client state (venue, UI) |
| Forms | React Hook Form 7.x | Form management |
| Validation | Zod 3.x | Schema validation |
| Icons | Lucide React Native | Icons |
| Charts | Victory Native or react-native-chart-kit | Visualization |
| Backend | Supabase JS 2.x | Auth, DB, Storage |
| Date | date-fns 4.x | Date manipulation |
| Toast | Burnt or react-native-toast-message | Notifications |
| Auth Storage | expo-secure-store | Encrypted token storage |
| Offline Cache | react-native-mmkv | Fast KV storage |
| Camera | expo-image-picker | Photo capture |
| Push | expo-notifications + FCM | Push notifications |
| PDF | expo-print | Receipt generation |
| Sharing | expo-sharing | WhatsApp sharing |
| Bottom Sheet | @gorhom/bottom-sheet | Native bottom sheets |

---

## 3. Owner App Folder Structure

```
apps/owner/
├── app/                              # Expo Router (file-based)
│   ├── _layout.tsx                   # Root layout (auth guard, providers)
│   ├── (auth)/
│   │   ├── _layout.tsx
│   │   └── login.tsx                 # Phone + OTP login
│   └── (tabs)/
│       ├── _layout.tsx               # Tab bar layout
│       ├── schedule/
│       │   └── index.tsx
│       ├── bookings/
│       │   ├── index.tsx             # Bookings list
│       │   ├── [id].tsx              # Booking detail
│       │   └── new.tsx               # 5-step wizard
│       ├── members/
│       │   └── index.tsx
│       ├── payments/
│       │   ├── index.tsx
│       │   └── [slotId].tsx
│       └── profile/
│           ├── index.tsx
│           ├── court-info.tsx
│           ├── schedule-pricing.tsx
│           ├── reports.tsx
│           ├── grow-business.tsx
│           ├── subscription.tsx
│           └── help.tsx
├── components/
│   ├── ui/                           # Button, Card, Input, Badge, etc.
│   ├── layout/                       # TabBar, PageHeader, SafeArea
│   ├── overlays/                     # BottomSheet, Dialog, FABMenu
│   ├── forms/                        # SearchBar, DatePicker, TimePicker
│   ├── data-display/                 # KPICard, TabBar, ChartCard
│   └── domain/                       # VenueSelector, BookingCard, etc.
├── features/
│   ├── auth/
│   │   ├── components/LoginForm.tsx
│   │   └── hooks/useAuth.ts
│   ├── schedule/
│   │   ├── components/               # Timeline, CourtRow, TimeSlot, etc.
│   │   └── hooks/useSchedule.ts
│   ├── bookings/
│   │   ├── components/               # BookingList, BookingWizard, etc.
│   │   └── hooks/                    # useBookings, useBookingMutation
│   ├── members/
│   │   ├── components/               # SlotsList, MembersList, etc.
│   │   └── hooks/                    # useSlots, useMembers, etc.
│   ├── payments/
│   │   ├── components/               # PaymentDashboard, MarkPaidSheet
│   │   └── hooks/usePayments.ts
│   ├── profile/
│   │   └── components/               # ProfileMenu, ReportsPanel
│   └── reports/
│       ├── components/               # RevenueChart, UtilizationChart
│       └── hooks/useReports.ts
├── hooks/                            # Global hooks (useVenue, useNetwork)
├── stores/                           # Zustand (venueStore, uiStore)
├── constants/                        # Colors, spacing, theme tokens
├── assets/                           # Fonts, images
├── app.json
├── tsconfig.json
└── package.json
```

---

## 4. Admin Panel Technology Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Framework | React 19.x | Web UI |
| Build | Vite 8.x | Build tool |
| Styling | Tailwind CSS 4.x | Utility CSS |
| Routing | React Router 7.x | Client-side routing |
| State | TanStack React Query 5.x | Data fetching |
| Forms | React Hook Form + Zod | Form handling |
| Backend | Supabase JS 2.x | Auth, DB |
| Deploy | Vercel | Hosting |

---

## 5. Admin Panel Folder Structure

```
apps/admin/
├── src/
│   ├── app/
│   │   ├── App.tsx
│   │   ├── router.tsx
│   │   └── providers.tsx
│   ├── components/
│   │   ├── ui/                       # Button, Card, Input, Table
│   │   └── layout/                   # Sidebar, Header, PageShell
│   ├── features/
│   │   ├── auth/                     # Email/password login
│   │   ├── venues/                   # Create/manage venues
│   │   ├── owners/                   # Manage owner accounts
│   │   └── courts/                   # Create/configure courts
│   ├── hooks/
│   ├── stores/
│   └── styles/
│       └── index.css
├── index.html
├── vite.config.ts
├── tsconfig.json
└── package.json
```

---

## 6. Routing

### Owner App (Expo Router — File-Based)

```
(auth)/login        → LoginScreen
(tabs)/schedule     → ScheduleScreen (home)
(tabs)/bookings     → BookingsListScreen
(tabs)/bookings/new → NewBookingWizard
(tabs)/bookings/[id]→ BookingDetailScreen
(tabs)/members      → MembersScreen (4 tabs)
(tabs)/payments     → PaymentsDashboard
(tabs)/payments/[id]→ SlotPaymentsScreen
(tabs)/profile      → ProfileMenu
(tabs)/profile/*    → Sub-screens
```

### Admin Panel (React Router)

```
/login              → AdminLoginPage
/                   → DashboardPage
/venues             → VenuesListPage
/venues/new         → CreateVenuePage
/venues/:id         → VenueDetailPage
/owners             → OwnersListPage
/courts/:venueId    → CourtsManagePage
```

---

## 7. State Management

| State Type | Tool | Example |
|------------|------|---------|
| Server state | React Query | Bookings, members, payments, reports |
| Auth state | Supabase + Context | Session, user profile |
| UI state | Zustand | Selected venue, open modals, active tabs |
| Form state | React Hook Form + Zod | Booking wizard, slot creation |
| URL state | Expo Router (params) | Booking ID, slot ID |
| Offline cache | MMKV | Today's schedule, member list |

### Venue Store (Zustand)

```typescript
interface VenueState {
  selectedVenueId: string | 'all'
  venues: Venue[]
  setSelectedVenue: (id: string) => void
  loadVenues: () => Promise<void>
}
```

---

## 8. Data Fetching Pattern

```typescript
// features/bookings/hooks/useBookings.ts
export function useBookings(filters: BookingFilters) {
  const venueId = useVenueStore((s) => s.selectedVenueId)

  return useQuery({
    queryKey: ['bookings', venueId, filters],
    queryFn: () => bookingsService.list(venueId, filters),
    staleTime: 2 * 60 * 1000,
  })
}

// Mutation pattern
export function useUpdatePaymentStatus() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, status, notes }: UpdatePaymentArgs) =>
      bookingsService.updatePaymentStatus(id, status, notes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] })
      queryClient.invalidateQueries({ queryKey: ['schedule'] })
      Toast.show({ type: 'success', text1: 'Payment updated' })
    },
  })
}
```

---

## 9. Design System (Shared Constants)

```typescript
// constants/theme.ts
export const colors = {
  primary: '#2563EB',
  primaryLight: '#EFF6FF',
  primaryDark: '#1D4ED8',
  success: '#16A34A',
  successLight: '#F0FDF4',
  warning: '#D97706',
  warningLight: '#FFFBEB',
  danger: '#DC2626',
  dangerLight: '#FEF2F2',
  purple: '#7C3AED',
  purpleLight: '#F5F3FF',
  teal: '#0D9488',
  tealLight: '#F0FDFA',
  surface: '#FFFFFF',
  background: '#F8FAFC',
  border: '#E2E8F0',
  textPrimary: '#0F172A',
  textSecondary: '#64748B',
  textMuted: '#94A3B8',
}

export const spacing = { xs: 4, sm: 8, md: 16, lg: 24, xl: 32 }
export const radius = { card: 16, button: 10, chip: 20, full: 9999 }
export const fonts = { display: 'PlusJakartaSans', body: 'Inter' }
```

---

## 10. Accessibility

| Concern | Implementation |
|---------|---------------|
| Semantic elements | React Native `accessible`, `accessibilityLabel` |
| Screen reader | VoiceOver (iOS), TalkBack (Android) support |
| Touch targets | Minimum 44×44px |
| Color contrast | WCAG AA minimum |
| Focus management | Bottom sheets trap focus |
| Reduced motion | Respect system animation settings |

---

## 11. Responsive Design

The Owner App is **mobile-only** (React Native). No responsive breakpoints needed.

The Admin Panel is **desktop-first** with a simple responsive layout:

| Breakpoint | Layout |
|------------|--------|
| < 768px | Stacked (mobile fallback) |
| ≥ 768px | Sidebar + content area |

---

## Phase 2: ShuttleHub (Player App) — Frontend Architecture

### 12. Player App Overview

| App | Platform | Tech | Purpose |
|-----|----------|------|---------|
| **Player App** | Mobile (Android/iOS) | React Native + Expo | Court booking, social play, shop |

### 13. Player App Technology Stack

Same technology choices as Owner App for consistency and code sharing:

| Layer | Technology | Purpose |
|-------|-----------|---------| 
| Framework | React Native + Expo SDK 52 | Native mobile |
| Language | TypeScript 5.x | Type safety |
| Navigation | Expo Router 4.x | File-based routing |
| Styling | NativeWind 4.x | Tailwind for React Native |
| State (Server) | TanStack React Query 5.x | Data fetching, caching |
| State (Client) | Zustand 5.x | Client state (location, UI) |
| Forms | React Hook Form 7.x | Form management |
| Validation | Zod 3.x | Schema validation |
| Icons | Lucide React Native | Icons |
| Backend | Supabase JS 2.x | Auth, DB, Storage |
| Date | date-fns 4.x | Date manipulation |
| Toast | Burnt or react-native-toast-message | Notifications |
| Auth Storage | expo-secure-store | Encrypted token storage |
| Offline Cache | react-native-mmkv | Fast KV storage |
| Camera | expo-image-picker | Photo capture (profile, ID proof) |
| Push | expo-notifications + FCM | Push notifications |
| Location | expo-location | GPS auto-detection |
| Bottom Sheet | @gorhom/bottom-sheet | Native bottom sheets |

### 14. Player App Folder Structure

```
apps/player/
├── app/                              # Expo Router (file-based)
│   ├── _layout.tsx                   # Root layout (auth guard, providers)
│   ├── (auth)/
│   │   ├── _layout.tsx
│   │   ├── login.tsx                 # Phone + OTP login
│   │   └── onboarding.tsx            # Player profile creation
│   └── (tabs)/
│       ├── _layout.tsx               # 5-tab bar layout
│       ├── home/
│       │   └── index.tsx             # Dashboard
│       ├── play/
│       │   ├── index.tsx             # Play hub (Book Court, Find Players, Host/Join)
│       │   ├── courts/
│       │   │   ├── index.tsx         # Court listing
│       │   │   └── [id].tsx          # Court details
│       │   ├── booking/
│       │   │   ├── slots.tsx         # Slot selection
│       │   │   ├── summary.tsx       # Booking summary
│       │   │   └── confirmation.tsx  # Booking confirmation
│       │   ├── find-players/
│       │   │   └── index.tsx         # Find players + challenge
│       │   ├── host-join/
│       │   │   └── index.tsx         # Host/Join matches
│       │   ├── memberships/
│       │   │   └── [venueId].tsx     # Membership batches
│       │   └── train/
│       │       └── index.tsx         # Coach directory
│       ├── search/
│       │   └── index.tsx             # Universal search
│       ├── tournament/
│       │   └── index.tsx             # Coming Soon placeholder
│       ├── profile/
│       │   ├── index.tsx             # Profile menu
│       │   ├── player-id.tsx         # Player ID registration
│       │   ├── play-activity.tsx     # Booking history
│       │   ├── shop-orders.tsx       # Order history
│       │   ├── wallet.tsx            # Wallet details
│       │   └── settings.tsx          # App settings
│       └── shop/
│           ├── index.tsx             # Product listing
│           ├── [id].tsx              # Product details
│           ├── cart.tsx              # Cart
│           └── checkout.tsx          # Checkout
├── components/
│   ├── ui/                           # Button, Card, Input, Badge, etc. (navy+lime themed)
│   ├── layout/                       # TabBar, PageHeader, SafeArea
│   ├── overlays/                     # BottomSheet, Dialog
│   ├── forms/                        # SearchBar, DatePicker, TimePicker
│   ├── data-display/                 # KPICard, ChartCard
│   └── domain/                       # CourtCard, PlayerCard, BookingCard, ProductCard, etc.
├── features/
│   ├── auth/
│   │   ├── components/               # LoginForm, OnboardingForm
│   │   └── hooks/usePlayerAuth.ts
│   ├── home/
│   │   ├── components/               # HeroCarousel, QuickActions, NearbyCourts
│   │   └── hooks/useDashboard.ts
│   ├── courts/
│   │   ├── components/               # CourtList, CourtDetail, SlotGrid
│   │   └── hooks/                    # useCourts, useSlots, useVenueDiscovery
│   ├── booking/
│   │   ├── components/               # SlotSelector, BookingSummary, Confirmation
│   │   └── hooks/                    # usePlayerBookings, useBookingMutation
│   ├── social/
│   │   ├── components/               # PlayerCard, ChallengeModal, HostMatchModal
│   │   └── hooks/                    # usePlayers, useChallenges, useHostedMatches
│   ├── membership/
│   │   ├── components/               # MembershipSlotCard, ApplicationForm
│   │   └── hooks/useMembershipApplication.ts
│   ├── notifications/
│   │   ├── components/               # NotificationCenter, NotificationCard
│   │   └── hooks/useNotifications.ts
│   ├── shop/
│   │   ├── components/               # ProductGrid, ProductDetail, Cart, Checkout
│   │   └── hooks/                    # useProducts, useCart, useOrders
│   ├── wallet/
│   │   ├── components/               # WalletDropdown, TransactionList
│   │   └── hooks/useWallet.ts
│   ├── coach/
│   │   ├── components/               # CoachCard, CoachList
│   │   └── hooks/useCoaches.ts
│   ├── reviews/
│   │   ├── components/               # ReviewForm, ReviewList
│   │   └── hooks/useReviews.ts
│   └── profile/
│       ├── components/               # ProfileMenu, PlayerIdForm, PlayActivity
│       └── hooks/                    # useProfile, usePlayerIdVerification
├── hooks/                            # Global hooks (useLocation, useNetwork)
├── stores/                           # Zustand (locationStore, uiStore)
├── constants/                        # Colors, spacing, theme tokens
├── assets/                           # Fonts, images
├── app.json
├── tsconfig.json
└── package.json
```

### 15. Player App Routing (Expo Router)

```
(auth)/login           → LoginScreen
(auth)/onboarding      → ProfileCreationScreen
(tabs)/home            → HomeDashboard
(tabs)/play            → PlayHub (Book Court, Find Players, Host/Join, Train)
(tabs)/play/courts     → CourtListingScreen
(tabs)/play/courts/[id]→ CourtDetailScreen
(tabs)/play/booking/*  → SlotSelection → Summary → Confirmation
(tabs)/play/find-players → FindPlayersScreen
(tabs)/play/host-join  → HostJoinScreen
(tabs)/play/memberships/[venueId] → MembershipBatchesScreen
(tabs)/play/train      → CoachDirectoryScreen
(tabs)/search          → UniversalSearchScreen
(tabs)/tournament      → ComingSoonPlaceholder
(tabs)/profile         → ProfileMenu
(tabs)/profile/*       → Sub-screens (Player ID, Play Activity, etc.)
(tabs)/shop            → ShopScreen
(tabs)/shop/[id]       → ProductDetailScreen
(tabs)/shop/cart       → CartScreen
(tabs)/shop/checkout   → CheckoutScreen
```

### 16. Player App Design System

```typescript
// constants/theme.ts (Player App — ShuttleHub)
export const playerColors = {
  // Primary palette (Navy + Lime)
  navy: '#0B1F3A',
  navyLight: '#132D4F',
  navyDark: '#071627',
  lime: '#A7FF3F',
  limeLight: '#C4FF7A',
  limeDark: '#8CD932',

  // Semantic
  success: '#10B981',
  successLight: '#D1FAE5',
  warning: '#F59E0B',
  warningLight: '#FEF3C7',
  danger: '#EF4444',
  dangerLight: '#FEE2E2',

  // Neutrals
  white: '#FFFFFF',
  surface: '#F8FAFC',
  border: '#E2E8F0',
  textPrimary: '#0F172A',
  textSecondary: '#64748B',
  textMuted: '#94A3B8',
  textOnDark: '#FFFFFF',
  textOnLime: '#0B1F3A',
}

export const spacing = { xs: 4, sm: 8, md: 16, lg: 24, xl: 32 }
export const radius = { card: 16, button: 12, chip: 20, full: 9999 }
export const fonts = { display: 'PlusJakartaSans', body: 'Inter' }
```

> [!NOTE]
> The Player App has a **distinct sporty theme** (Navy + Lime) compared to the Owner App's professional blue theme. Both apps use the same tech stack and component patterns but different design tokens.

### 17. Updated State Management (Player App)

| State Type | Tool | Example |
|------------|------|---------| 
| Server state | React Query | Courts, bookings, challenges, products, notifications |
| Auth state | Supabase + Context | Session, player profile |
| UI state | Zustand | Active tab, open modals, search filters |
| Location state | Zustand | Player GPS coordinates, selected city |
| Form state | React Hook Form + Zod | Booking, profile creation, challenge |
| URL state | Expo Router (params) | Court ID, booking step, product ID |
| Offline cache | MMKV | Venue list, own bookings |

#### Location Store (Zustand)

```typescript
interface LocationState {
  latitude: number | null
  longitude: number | null
  city: string | null
  state: string | null
  isPermissionGranted: boolean
  setLocation: (lat: number, lon: number, city: string, state: string) => void
  requestPermission: () => Promise<void>
}
```

### 18. Updated Admin Panel Routes (Phase 2 additions)

```
/players            → PlayersListPage
/players/:id        → PlayerDetailPage
/player-verifications → PlayerIdVerificationPage
/products           → ProductsCatalogPage
/products/new       → CreateProductPage
/products/:id       → EditProductPage
/categories         → ProductCategoriesPage
/orders             → OrdersListPage
/coaches            → CoachesListPage
/coaches/new        → CreateCoachPage
/coaches/:id        → EditCoachPage
/analytics          → PlatformAnalyticsPage
```
