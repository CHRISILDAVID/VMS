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

---

# Phase 2 — ShuttleHub Player App Frontend Architecture

---

## 12. Player App Technology Stack

Same as Owner App with the following additions:

| Addition | Purpose |
|---|---|
| `expo-screen-orientation` | Force landscape for Umpire Live Scoring screen |
| `react-native-svg` | SVG knockout bracket connector lines |
| `react-native-razorpay` | In-app Razorpay checkout |
| `expo-document-picker` | CSV/Excel/JSON team import |
| `react-native-reanimated` | Tournament bracket scroll animations |

---

## 13. Player App Folder Structure

```
apps/player/
├── app/                              # Expo Router (file-based)
│   ├── _layout.tsx                   # Root layout (auth guard, providers, theme)
│   ├── (auth)/
│   │   ├── _layout.tsx
│   │   └── login.tsx                 # Phone OTP login
│   ├── (tabs)/
│   │   ├── _layout.tsx               # 5-tab bar layout
│   │   ├── home/
│   │   │   └── index.tsx             # Home dashboard
│   │   ├── play/
│   │   │   ├── _layout.tsx           # Segmented control tabs
│   │   │   ├── book-court/
│   │   │   │   ├── index.tsx         # Court listing
│   │   │   │   ├── [venueId].tsx     # Court detail
│   │   │   │   ├── slots.tsx         # Slot selection
│   │   │   │   └── summary.tsx       # Booking summary
│   │   │   ├── find-players/
│   │   │   │   ├── index.tsx         # Player discovery
│   │   │   │   └── [playerId].tsx    # Public player profile
│   │   │   ├── host-match/
│   │   │   │   ├── index.tsx         # Hosted match list + join
│   │   │   │   ├── host.tsx          # Create hosted match
│   │   │   │   └── [matchId].tsx     # Hosted match detail
│   │   │   └── train/
│   │   │       ├── index.tsx         # Coach cards
│   │   │       └── [coachId].tsx     # Coach detail
│   │   ├── tournaments/
│   │   │   ├── index.tsx             # Tournament list (public listings)
│   │   │   ├── [tournamentId]/
│   │   │   │   ├── index.tsx         # Tournament detail (tabs)
│   │   │   │   └── register.tsx      # Registration + payment
│   │   ├── rankings/
│   │   │   ├── index.tsx             # Leaderboard / My Rank Card
│   │   │   └── register-id.tsx       # Player ID registration
│   │   └── shop/
│   │       ├── index.tsx             # Product listing
│   │       ├── [productId].tsx       # Product detail
│   │       ├── cart.tsx              # Cart
│   │       └── checkout.tsx          # Checkout
│   ├── profile/
│   │   ├── index.tsx                 # Profile menu
│   │   ├── identity.tsx              # Player Identity detail
│   │   ├── tournament-history.tsx    # Tournament history
│   │   ├── play-activity.tsx         # Booking / Hosted / Joined tabs
│   │   ├── performance.tsx           # Performance report
│   │   └── orders.tsx                # Shop orders
│   └── organizer/                    # Organizer Workspace (separate nav stack)
│       ├── _layout.tsx               # Organizer workspace layout (own header + bottom nav)
│       ├── setup.tsx                 # Post-approval questionnaire
│       ├── dashboard/
│       │   └── index.tsx             # Dashboard (Pools / Standings / Matches / Draw)
│       ├── teams/
│       │   └── index.tsx             # Team entry + import
│       ├── matches/
│       │   └── index.tsx             # Matches list with Start Match
│       ├── draw/
│       │   └── index.tsx             # Knockout bracket view
│       ├── umpire/
│       │   └── [matchId].tsx         # Live scoring (forced landscape)
│       └── champion/
│           └── index.tsx             # Champion/podium screen
├── components/
│   ├── ui/                           # Button, Card, Input, Badge, Chip, Modal
│   ├── layout/                       # TabBar, PageHeader, SafeArea
│   ├── overlays/                     # BottomSheet, Dialog
│   ├── forms/                        # SearchBar, DatePicker, CityPicker, SlotGrid
│   ├── data-display/                 # TournamentCard, PlayerCard, CoachCard, RankRow
│   └── domain/                       # UmpireScoreboard, KnockoutBracket, StandingsTable
├── features/
│   ├── auth/
│   ├── home/
│   ├── booking/
│   ├── play/                         # social features
│   ├── tournaments/                  # public listings
│   ├── rankings/
│   ├── shop/
│   ├── profile/
│   └── organizer/                    # organizer + umpire logic
│       ├── hooks/
│       │   ├── useTournament.ts
│       │   ├── useCategories.ts
│       │   ├── useMatches.ts
│       │   └── useLiveScoring.ts     # Supabase Realtime subscription
│       └── services/
│           ├── pool-generator.ts     # Pool/fixture generation logic
│           ├── bracket-generator.ts  # Knockout bracket + bye logic
│           └── ranking-service.ts    # Points computation (Edge Function call)
├── hooks/
├── stores/
│   ├── playerStore.ts                # Auth player, Player ID, wallet balance
│   ├── organizerStore.ts             # Active organizer session, active category
│   └── uiStore.ts
├── constants/
│   └── player-theme.ts              # PLAYER_COLORS: Navy + Lime + semantic tokens
├── assets/
├── app.json
├── tsconfig.json
└── package.json
```

---

## 14. Player App Routing

```
(auth)/login                    → LoginScreen
(tabs)/home                     → HomeScreen
(tabs)/play/book-court          → CourtListingScreen
(tabs)/play/book-court/[id]     → CourtDetailScreen
(tabs)/play/book-court/slots    → SlotSelectionScreen
(tabs)/play/book-court/summary  → BookingSummaryScreen
(tabs)/play/find-players        → PlayerDiscoveryScreen
(tabs)/play/find-players/[id]   → PublicPlayerProfileScreen
(tabs)/play/host-match          → HostMatchListScreen
(tabs)/play/host-match/host     → CreateHostedMatchScreen
(tabs)/play/host-match/[id]     → HostedMatchDetailScreen
(tabs)/play/train               → CoachListScreen
(tabs)/play/train/[id]          → CoachDetailScreen
(tabs)/tournaments              → TournamentListScreen
(tabs)/tournaments/[id]         → TournamentDetailScreen (5 tabs)
(tabs)/tournaments/[id]/register → TournamentRegistrationScreen
(tabs)/rankings                 → RankingsScreen
(tabs)/rankings/register-id     → PlayerIDRegistrationScreen
(tabs)/shop                     → ProductListScreen
(tabs)/shop/[id]                → ProductDetailScreen
(tabs)/shop/cart                → CartScreen
(tabs)/shop/checkout            → CheckoutScreen
profile                         → ProfileScreen
profile/identity                → PlayerIdentityScreen
profile/tournament-history      → TournamentHistoryScreen
profile/play-activity           → PlayActivityScreen
profile/performance             → PerformanceReportScreen
profile/orders                  → ShopOrdersScreen

organizer                       → OrganizerWorkspace (modal stack)
organizer/setup                 → PostApprovalQuestionnaireScreen
organizer/dashboard             → OrganizerDashboardScreen
organizer/teams                 → TeamEntryScreen
organizer/matches               → MatchListScreen
organizer/draw                  → KnockoutBracketScreen
organizer/umpire/[matchId]      → LiveScoringScreen (landscape forced)
organizer/champion              → ChampionScreen
```

---

## 15. Player App State Management

| State | Tool | Example |
|---|---|---|
| Player profile / session | Supabase + Zustand `playerStore` | Player ID, wallet balance |
| Organizer session | Zustand `organizerStore` | Active category, workspace open |
| Tournament format | Derived in `organizerStore` from questionnaire answers | 'round_robin' / 'direct_knockout' / 'round_robin_knockout' |
| Live scores | Supabase Realtime + local reducer | Scores, serving position, game number |
| BWF rotation state | Local reducer in `useLiveScoring` | Server, receiver, positions (doubles) |
| Server state | React Query | Tournaments, matches, pools, standings |
| Form state | React Hook Form + Zod | Booking wizard, organizer questionnaire |
| URL state | Expo Router params | tournamentId, matchId, categoryId |

---

## 16. Admin Panel Phase 2 Additions

New routes added to the admin panel:

```
/tournaments                    → PublicTournamentListPage (All/Published/Reg Open/etc.)
/tournaments/new                → CreateTournamentListingPage
/tournaments/:id                → TournamentListingDetailPage (edit + status management)
/tournaments/:id/preview        → TournamentPreviewPage (player-facing view)
/organizer-approvals            → OrganizerApprovalListPage
/organizer-approvals/:id        → ApprovalDetailPage
/players                        → PlayerListPage
/players/:id                    → PlayerDetailPage (Player ID info, wallet, rankings)
/wallet                         → WalletManagementPage
/coaches                        → CoachListPage
/coaches/new                    → CreateCoachPage
/rankings-override              → RankingsOverridePage
/system-config                  → SystemConfigPage
```

New sidebar groups in the admin panel navigation:

```
Phase 1 (existing):           Phase 2 (new):
- Dashboard                   - Tournament Listings
- Venues                      - Organizer Approvals
- Courts                      - Player Management
- Owners                         └── Player IDs
                              - Wallet Management
                              - Coaches
                              - Rankings Override
                              - System Config
```