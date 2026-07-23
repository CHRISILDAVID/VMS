# Badminton Manager — Existing Code Analysis

## 1. What We're Working With

The exported project from Figma Make is a **React + Vite + Tailwind CSS v4** application wrapped in a 390×844 phone frame simulator. It was designed as a prototype/preview tool, not a production application.

### Technology Stack (Current)

| Layer | Technology | Version |
|-------|-----------|---------|
| Framework | React | 19.0.0 |
| Build Tool | Vite | 8.0.0 |
| Language | TypeScript | 5.7.0 |
| Styling | Tailwind CSS v4 | 4.0.0 |
| Icons | lucide-react | 1.23.0 |
| Charts | recharts | 3.9.2 |
| Formatter | oxfmt | 0.2.0 |

### Figma-Specific Artifacts (Must Remove in Production)

| Artifact | Location | Action |
|----------|----------|--------|
| Figma HTML comments | `index.html` | Remove `<!-- figma:* -->` placeholders |
| Phone frame wrapper | `App.tsx` (lines 80-148) | Remove 390×844 frame, dynamic island, status bar |
| `figma-make-app` name | `package.json` | Rename |
| `.figma/` directory references | `AGENTS.md` | Remove |
| External screen picker | Removed in v2 | Already cleaned up |

---

## 2. Folder Structure

```
E:\VMS\
├── src/
│   ├── App.tsx                          # Root component + phone frame + routing
│   ├── main.tsx                         # React entry point
│   ├── index.css                        # Design tokens + animations
│   ├── vite-env.d.ts                    # Vite type declarations
│   ├── components/                      # Shared components
│   │   ├── BottomNav.tsx                # 5-tab navigation
│   │   ├── FABMenu.tsx                  # Floating Action Button with 6 actions
│   │   ├── VenueSelector.tsx            # Venue dropdown picker
│   │   └── StatusChip.tsx               # Status pill component (13 variants)
│   ├── screens/                         # All screen-level components
│   │   ├── LoginScreen.tsx              # OTP login flow
│   │   ├── DashboardScreen.tsx          # Business overview (ORPHANED)
│   │   ├── ScheduleScreen.tsx           # Court timeline view
│   │   ├── BookingsScreen.tsx           # Booking management
│   │   ├── BookingDetailsScreen.tsx     # Booking detail view
│   │   ├── NewBookingScreen.tsx         # 5-step booking wizard
│   │   ├── CustomersScreen.tsx          # Customer management (ORPHANED)
│   │   ├── MembersScreen.tsx            # Membership management (933 lines)
│   │   ├── PaymentsScreen.tsx           # Membership payments
│   │   ├── ProfileScreen.tsx            # Settings hub
│   │   ├── ReportsScreen.tsx            # Standalone reports (ORPHANED)
│   │   └── profile/                     # Profile sub-screens
│   │       ├── CourtInformationScreen.tsx
│   │       ├── CourtScheduleScreen.tsx
│   │       ├── GrowBusinessScreen.tsx
│   │       ├── SubscriptionBillingScreen.tsx
│   │       └── HelpSupportScreen.tsx
│   ├── data/
│   │   └── bookings.ts                  # Mock booking data (8 records)
│   └── imports/
│       └── pasted_text/
│           └── bookings-page.md         # Original prompt text pasted as reference
├── prompts/                             # All 5 Figma AI prompt versions
│   ├── v1.md                            # Initial full app design prompt
│   ├── v2.md                            # Bottom nav change + Bookings/Members/Payments
│   ├── v3.md                            # Profile section redesign
│   ├── v4.md                            # Auto-fix (no intentional change)
│   └── v5.md                            # Members/Payments flow refinement
├── index.html                           # Entry HTML (Figma placeholders)
├── package.json
├── vite.config.ts
├── tsconfig.json
├── AGENTS.md                            # Figma Make agent instructions
└── CLAUDE.md                            # Empty/minimal
```

---

## 3. Routing Approach

**Current:** No routing library. Uses `useState<Screen>` in `App.tsx` with conditional rendering.

```typescript
type Screen = 'login' | 'schedule' | 'bookings' | 'booking-details' |
              'new-booking' | 'members' | 'payments' | 'profile'
```

**Navigation methods:**
- `BottomNav.onNavigate(screenId)` → `setScreen()`
- `FABMenu.onAction('booking')` → `setScreen('new-booking')`
- In-screen back buttons → `navigate(parentScreen)`
- Profile sub-screens → internal `subScreen` state in ProfileScreen

**Problems:**
- No URL routing (no deep linking)
- No browser history management
- No route guards / protected routes
- Profile sub-routing is a local concern
- Screen transitions are basic CSS animations only

---

## 4. State Management

**Current:** Local `useState` only. No global state.

| Concern | Current Approach | Problem |
|---------|-----------------|---------|
| Auth state | `loggedIn: boolean` in App.tsx | No persistence, no token management |
| Selected venue | Local state in each screen | Not shared — each screen manages independently |
| Booking data | Hardcoded array in `data/bookings.ts` | No API integration |
| Membership data | Hardcoded inside `MembersScreen.tsx` | 65KB single file with embedded data |
| Payment data | Hardcoded inside `PaymentsScreen.tsx` | Duplicates membership slot definitions |
| Schedule data | Hardcoded inside `ScheduleScreen.tsx` | Static mock slots |
| Current screen | `screen: Screen` in App.tsx | No route persistence |

**Data Duplication Issue:** Membership slot definitions exist in **both** `MembersScreen.tsx` (full seedSlots) and `PaymentsScreen.tsx` (slotDefs). These should be a single source of truth.

---

## 5. What's Reusable vs. Must Rewrite

### ✅ Reusable (Design Reference)

| Item | Value For |
|------|-----------|
| Color palette & tokens | Production design system |
| Typography choices (Inter, Plus Jakarta Sans) | Font stack |
| Spacing/radius conventions | Design system variables |
| Icon selection (lucide-react) | Icon library choice |
| Screen layouts & hierarchy | UI wireframe reference |
| Component visual patterns (cards, chips, sheets) | Component styling |
| Navigation flow (tabs, sub-screens, FAB) | UX architecture |
| recharts chart types | Visualization approach |

### ❌ Must Rewrite

| Item | Reason |
|------|--------|
| App.tsx phone frame wrapper | Figma preview artifact |
| useState-based routing | Need react-router-dom |
| All hardcoded mock data | Need Supabase integration |
| Inline styles (majority of styling) | Move to Tailwind classes |
| MembersScreen.tsx (933 lines) | Needs decomposition |
| Local state management | Need global state (Zustand/React Query) |
| No form validation | Need Zod/React Hook Form |
| No error handling | Need error boundaries |
| No loading states | Need skeleton/spinners |
| No authentication | Need Supabase Auth |
| No API layer | Need Supabase client |
| No protected routes | Need route guards |
| No TypeScript type system for API | Need typed Supabase |
