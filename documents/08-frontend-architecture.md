# Badminton Manager — Frontend Architecture

## 1. Technology Stack

| Layer | Technology | Version | Purpose |
|-------|-----------|---------|---------|
| Framework | React | 19.x | UI library |
| Language | TypeScript | 5.x | Type safety |
| Build | Vite | 8.x | Build tool + dev server |
| Styling | Tailwind CSS | 4.x | Utility-first CSS |
| Routing | React Router | 7.x | Client-side routing |
| State (Server) | TanStack React Query | 5.x | Data fetching, caching, mutations |
| State (Client) | Zustand | 5.x | Lightweight client state |
| Forms | React Hook Form | 7.x | Form state + validation |
| Validation | Zod | 3.x | Schema validation |
| Icons | Lucide React | (latest) | Icon library |
| Charts | Recharts | 3.x | Data visualization |
| Backend Client | Supabase JS | 2.x | Auth, DB, Storage |
| Date | date-fns | 4.x | Date manipulation |
| Toast | Sonner | (latest) | Toast notifications |

---

## 2. Folder Structure

```
src/
├── app/                              # App shell
│   ├── App.tsx                       # Root component
│   ├── router.tsx                    # Route definitions
│   └── providers.tsx                 # Context providers wrapper
│
├── components/                       # Shared UI components
│   ├── ui/                           # Primitive UI components
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Input.tsx
│   │   ├── Select.tsx
│   │   ├── Badge.tsx
│   │   ├── StatusChip.tsx
│   │   ├── Avatar.tsx
│   │   ├── Skeleton.tsx
│   │   ├── EmptyState.tsx
│   │   ├── ErrorState.tsx
│   │   └── index.ts
│   ├── layout/                       # Layout components
│   │   ├── BottomNav.tsx
│   │   ├── PageHeader.tsx
│   │   ├── PageShell.tsx
│   │   └── index.ts
│   ├── overlays/                     # Overlay components
│   │   ├── BottomSheet.tsx
│   │   ├── Dialog.tsx
│   │   ├── FABMenu.tsx
│   │   └── index.ts
│   ├── forms/                        # Form components
│   │   ├── SearchBar.tsx
│   │   ├── DatePicker.tsx
│   │   ├── TimePicker.tsx
│   │   ├── FilterChips.tsx
│   │   └── index.ts
│   ├── data-display/                 # Data display components
│   │   ├── KPICard.tsx
│   │   ├── DataTable.tsx
│   │   ├── TabBar.tsx
│   │   └── index.ts
│   └── domain/                       # Business-specific shared components
│       ├── VenueSelector.tsx
│       ├── BookingCard.tsx
│       ├── MemberCard.tsx
│       ├── SlotCard.tsx
│       ├── PaymentCard.tsx
│       └── index.ts
│
├── features/                         # Feature modules
│   ├── auth/
│   │   ├── components/
│   │   │   └── LoginForm.tsx
│   │   ├── hooks/
│   │   │   └── useAuth.ts
│   │   ├── pages/
│   │   │   └── LoginPage.tsx
│   │   └── index.ts
│   │
│   ├── schedule/
│   │   ├── components/
│   │   │   ├── Timeline.tsx
│   │   │   ├── CourtRow.tsx
│   │   │   ├── TimeSlot.tsx
│   │   │   ├── SlotBottomSheet.tsx
│   │   │   └── WeekPicker.tsx
│   │   ├── hooks/
│   │   │   └── useSchedule.ts
│   │   ├── pages/
│   │   │   └── SchedulePage.tsx
│   │   └── index.ts
│   │
│   ├── bookings/
│   │   ├── components/
│   │   │   ├── BookingList.tsx
│   │   │   ├── BookingDetail.tsx
│   │   │   ├── BookingWizard.tsx
│   │   │   ├── FilterSheet.tsx
│   │   │   └── BookingTabs.tsx
│   │   ├── hooks/
│   │   │   ├── useBookings.ts
│   │   │   └── useBookingMutation.ts
│   │   ├── pages/
│   │   │   ├── BookingsPage.tsx
│   │   │   ├── BookingDetailPage.tsx
│   │   │   └── NewBookingPage.tsx
│   │   └── index.ts
│   │
│   ├── members/
│   │   ├── components/
│   │   │   ├── SlotsList.tsx
│   │   │   ├── SlotMembersView.tsx
│   │   │   ├── ApplicationsList.tsx
│   │   │   ├── GuestPlayList.tsx
│   │   │   ├── MembersList.tsx
│   │   │   ├── CreateSlotForm.tsx
│   │   │   ├── EditSlotForm.tsx
│   │   │   ├── AddMemberForm.tsx
│   │   │   └── TransferSheet.tsx
│   │   ├── hooks/
│   │   │   ├── useSlots.ts
│   │   │   ├── useMembers.ts
│   │   │   ├── useApplications.ts
│   │   │   └── useGuestPlays.ts
│   │   ├── pages/
│   │   │   └── MembersPage.tsx
│   │   └── index.ts
│   │
│   ├── payments/
│   │   ├── components/
│   │   │   ├── PaymentDashboard.tsx
│   │   │   ├── SlotPaymentCard.tsx
│   │   │   ├── MemberPaymentList.tsx
│   │   │   ├── MarkPaidSheet.tsx
│   │   │   └── PaymentHistory.tsx
│   │   ├── hooks/
│   │   │   └── usePayments.ts
│   │   ├── pages/
│   │   │   ├── PaymentsPage.tsx
│   │   │   └── SlotPaymentsPage.tsx
│   │   └── index.ts
│   │
│   ├── profile/
│   │   ├── components/
│   │   │   ├── ProfileMenu.tsx
│   │   │   └── ReportsPanel.tsx
│   │   ├── pages/
│   │   │   ├── ProfilePage.tsx
│   │   │   ├── CourtInfoPage.tsx
│   │   │   ├── CourtSchedulePage.tsx
│   │   │   ├── GrowBusinessPage.tsx
│   │   │   ├── SubscriptionPage.tsx
│   │   │   └── HelpSupportPage.tsx
│   │   └── index.ts
│   │
│   └── reports/
│       ├── components/
│       │   ├── RevenueChart.tsx
│       │   ├── UtilizationChart.tsx
│       │   └── KPIGrid.tsx
│       └── hooks/
│           └── useReports.ts
│
├── hooks/                            # Global hooks
│   ├── useVenue.ts                   # Selected venue context
│   └── useMediaQuery.ts             # Responsive breakpoints
│
├── lib/                              # Library setup
│   ├── supabase.ts                   # Supabase client initialization
│   └── queryClient.ts               # React Query client
│
├── services/                         # API service layer
│   ├── auth.service.ts
│   ├── bookings.service.ts
│   ├── courts.service.ts
│   ├── customers.service.ts
│   ├── memberships.service.ts
│   ├── payments.service.ts
│   ├── reports.service.ts
│   ├── schedule.service.ts
│   ├── storage.service.ts
│   ├── subscriptions.service.ts
│   └── venues.service.ts
│
├── stores/                           # Zustand stores
│   ├── venueStore.ts                 # Selected venue state
│   └── uiStore.ts                   # UI state (modals, sheets)
│
├── types/                            # TypeScript types
│   ├── database.ts                   # Supabase generated types
│   ├── api.ts                        # API request/response types
│   └── ui.ts                         # UI-specific types
│
├── utils/                            # Utility functions
│   ├── format.ts                     # Currency, date, time formatters
│   ├── validators.ts                 # Shared validation schemas (Zod)
│   └── constants.ts                  # App-wide constants
│
└── styles/
    └── index.css                     # Tailwind imports + design tokens
```

---

## 3. Routing

```typescript
// app/router.tsx
import { createBrowserRouter } from 'react-router-dom'

const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/',
    element: <AuthGuard><AppShell /></AuthGuard>,
    children: [
      { index: true, element: <Navigate to="/schedule" /> },
      { path: 'schedule', element: <SchedulePage /> },
      { path: 'bookings', element: <BookingsPage /> },
      { path: 'bookings/:id', element: <BookingDetailPage /> },
      { path: 'bookings/new', element: <NewBookingPage /> },
      { path: 'members', element: <MembersPage /> },
      { path: 'payments', element: <PaymentsPage /> },
      { path: 'payments/:slotId', element: <SlotPaymentsPage /> },
      { path: 'profile', element: <ProfilePage /> },
      { path: 'profile/court-info', element: <CourtInfoPage /> },
      { path: 'profile/schedule-pricing', element: <CourtSchedulePage /> },
      { path: 'profile/reports', element: <ReportsPage /> },
      { path: 'profile/grow-business', element: <GrowBusinessPage /> },
      { path: 'profile/subscription', element: <SubscriptionPage /> },
      { path: 'profile/help', element: <HelpSupportPage /> },
    ],
  },
])
```

---

## 4. Protected Routes

```typescript
// components/AuthGuard.tsx
function AuthGuard({ children }: { children: React.ReactNode }) {
  const { session, isLoading } = useAuth()

  if (isLoading) return <SplashScreen />
  if (!session) return <Navigate to="/login" replace />

  return <>{children}</>
}
```

---

## 5. State Management Strategy

| State Type | Tool | Example |
|------------|------|---------|
| Server state | React Query | Bookings, members, payments, reports |
| Auth state | Supabase + React Context | Session, user profile |
| UI state | Zustand | Selected venue, open modals, active tabs |
| Form state | React Hook Form + Zod | Booking wizard, slot creation |
| URL state | React Router (search params) | Filters, date selection |

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

## 6. Data Fetching Pattern

```typescript
// features/bookings/hooks/useBookings.ts
export function useBookings(filters: BookingFilters) {
  const venueId = useVenueStore((s) => s.selectedVenueId)

  return useQuery({
    queryKey: ['bookings', venueId, filters],
    queryFn: () => bookingsService.list(venueId, filters),
    staleTime: 2 * 60 * 1000, // 2 minutes
  })
}

// Mutation pattern
export function useCreateBooking() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: bookingsService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] })
      queryClient.invalidateQueries({ queryKey: ['schedule'] })
      toast.success('Booking created!')
    },
  })
}
```

---

## 7. Form Handling

```typescript
// Zod schema
const bookingSchema = z.object({
  courtId: z.string().uuid(),
  date: z.string().date(),
  startTime: z.string(),
  endTime: z.string(),
  customerId: z.string().uuid(),
  amount: z.number().positive(),
  paymentMode: z.enum(['cash', 'upi', 'card']).optional(),
  notes: z.string().max(500).optional(),
})

// React Hook Form usage
const form = useForm<BookingFormData>({
  resolver: zodResolver(bookingSchema),
})
```

---

## 8. Theme System

```css
/* styles/index.css — Tailwind v4 inline theme */
@theme inline {
  --color-primary: #2563EB;
  --color-primary-light: #EFF6FF;
  --color-primary-dark: #1D4ED8;
  --color-success: #16A34A;
  --color-success-light: #F0FDF4;
  --color-warning: #D97706;
  --color-warning-light: #FFFBEB;
  --color-danger: #DC2626;
  --color-danger-light: #FEF2F2;
  --color-purple: #7C3AED;
  --color-purple-light: #F5F3FF;
  --color-surface: #FFFFFF;
  --color-background: #F8FAFC;
  --color-border: #E2E8F0;
  --color-text-primary: #0F172A;
  --color-text-secondary: #64748B;
  --color-text-muted: #94A3B8;
  --font-display: 'Plus Jakarta Sans', sans-serif;
  --font-body: 'Inter', sans-serif;
  --radius-card: 16px;
  --radius-button: 10px;
  --radius-chip: 20px;
}
```

---

## 9. Accessibility

| Concern | Implementation |
|---------|---------------|
| Semantic HTML | Use `<button>`, `<nav>`, `<main>`, `<section>`, `<article>` |
| ARIA labels | All interactive elements labeled |
| Focus management | Bottom sheets trap focus, restore on close |
| Color contrast | WCAG AA minimum on all text |
| Touch targets | Minimum 44×44px for all interactive elements |
| Screen reader | Status announcements for loading/error states |
| Reduced motion | Respect `prefers-reduced-motion` |

---

## 10. Responsive Design

The app is mobile-first (390px base). For tablet/desktop:

| Breakpoint | Layout Change |
|------------|---------------|
| < 640px | Mobile layout (bottom nav, full-width cards) |
| 640–1024px | Tablet (side nav, 2-column grid) |
| > 1024px | Desktop (sidebar + main content area) |

> [!NOTE]
> The current Figma design is mobile-only. Desktop/tablet layouts are future enhancements. The initial build should target mobile web + PWA.
