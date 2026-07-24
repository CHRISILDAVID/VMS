# Badminton Manager — Existing Code Analysis

## 1. What We're Working With

The project originated from a **Figma Make export** — a React + Vite + Tailwind CSS v4 prototype wrapped in a 390×844 phone frame simulator. This code is **not production code** — it serves as a **visual design reference only**.

The production Owner App will be built from scratch using **React Native (Expo)**, not React web.

### Original Technology Stack (Figma Export)

| Layer | Technology | Version |
|-------|-----------|---------| 
| Framework | React | 19.0.0 |
| Build Tool | Vite | 8.0.0 |
| Language | TypeScript | 5.7.0 |
| Styling | Tailwind CSS v4 | 4.0.0 |
| Icons | lucide-react | 1.23.0 |
| Charts | recharts | 3.9.2 |
| Formatter | oxfmt | 0.2.0 |

### Figma Artifacts (Archived in `reference/`)

| Artifact | Original Location | Status |
|----------|-------------------|--------|
| Phone frame wrapper | `App.tsx` (lines 80-148) | Archived — not used in RN |
| Dynamic island, StatusBar | `App.tsx` | Archived |
| `figma-make-app` name | `package.json` | Will be renamed |
| Figma HTML comments | `index.html` | Archived |
| `.figma/` directory references | `AGENTS.md` | Replaced |
| Figma prompts | `prompts/v1-v5.md` | Archived as `reference/prompts/` |
| Pasted text imports | `src/imports/pasted_text/` | Archived |

---

## 2. Archived Folder Structure

The original Figma export has been moved to `reference/figma-src/`:

```
reference/
├── figma-src/                          # Original Figma export (design reference)
│   ├── App.tsx                         # Phone frame wrapper + state routing
│   ├── main.tsx                        # React entry point
│   ├── index.css                       # Design tokens + animations
│   ├── components/
│   │   ├── BottomNav.tsx               # 5-tab navigation
│   │   ├── FABMenu.tsx                 # Floating Action Button
│   │   ├── VenueSelector.tsx           # Venue dropdown
│   │   └── StatusChip.tsx              # Status pill (13 variants)
│   ├── screens/
│   │   ├── LoginScreen.tsx             # OTP login flow
│   │   ├── DashboardScreen.tsx         # REMOVED — not in production
│   │   ├── ScheduleScreen.tsx          # Court timeline view
│   │   ├── BookingsScreen.tsx          # Booking management
│   │   ├── BookingDetailsScreen.tsx    # Booking detail view
│   │   ├── NewBookingScreen.tsx        # 5-step booking wizard
│   │   ├── CustomersScreen.tsx         # REMOVED — not in production
│   │   ├── MembersScreen.tsx           # Membership management (933 lines)
│   │   ├── PaymentsScreen.tsx          # Membership payments
│   │   ├── ProfileScreen.tsx           # Settings hub
│   │   ├── ReportsScreen.tsx           # REMOVED — reports inline in profile
│   │   └── profile/                    # Profile sub-screens
│   ├── data/
│   │   └── bookings.ts                 # Mock booking data
│   └── imports/
│       └── pasted_text/                # Figma paste artifacts
└── prompts/                            # Original AI prompt versions (v1-v5)
```

---

## 3. What's Reusable as Design Reference

### ✅ Reusable (Visual Patterns — Reference Only)

| Item | Value For |
|------|-----------| 
| Color palette & tokens | Production design system (ported to RN constants) |
| Typography choices (Inter, Plus Jakarta Sans) | Font stack |
| Spacing/radius conventions | Design system variables |
| Icon selection (Lucide) | Icon library (lucide-react-native) |
| Screen layouts & hierarchy | UI wireframe reference |
| Component visual patterns (cards, chips, sheets) | Component styling |
| Navigation flow (tabs, sub-screens, FAB) | UX architecture |
| Chart types (recharts) | Visualization approach (Victory Native / chart-kit) |

### ❌ Not Reusable (Must Build from Scratch in React Native)

| Item | Reason |
|------|--------|
| All React web components | React Native uses View/Text, not div/span |
| HTML/CSS styling | RN uses StyleSheet or NativeWind |
| useState-based routing | Expo Router (file-based) |
| All hardcoded mock data | Need Supabase integration |
| Phone frame wrapper | Figma preview artifact |
| MembersScreen.tsx (933 lines) | Must decompose for RN |
| recharts usage | Need RN-compatible charting |

---

## 4. Current State Management (Reference)

| Concern | Figma Approach | Production Approach |
|---------|---------------|-------------------|
| Auth state | `loggedIn: boolean` in App.tsx | Supabase Auth + expo-secure-store |
| Selected venue | Local state in each screen | Zustand global store |
| Booking data | Hardcoded array | Supabase + React Query |
| Membership data | Hardcoded inside MembersScreen | Supabase + React Query |
| Payment data | Hardcoded inside PaymentsScreen | Supabase + React Query |
| Schedule data | Hardcoded inside ScheduleScreen | Supabase + React Query |
| Current screen | `screen: Screen` in App.tsx | Expo Router (URL-based) |
| Form state | Unmanaged | React Hook Form + Zod |

---

## 5. Key Design Decisions from Figma Reference

These visual/UX decisions from the Figma export are **confirmed for production:**

1. **5-tab bottom navigation:** Schedule | Bookings | Members | Payments | Profile
2. **Schedule as home screen** — the first screen after login
3. **FAB on Schedule and Bookings** screens for quick actions
4. **Bottom sheets** for slot actions, booking details, payment recording
5. **4-tab Members screen:** Slots | Applications | Guest Play | Members
6. **Payments page** manages membership payments ONLY
7. **Profile** contains Court Info, Schedule & Pricing, Reports, Grow Business, Subscription, Help
8. **Color-coded slots** on the schedule timeline

These are **removed from production:**
1. ~~Dashboard screen~~ (orphaned in Figma, confirmed removed)
2. ~~Customers screen~~ (orphaned, customer management is inline in booking wizard)
3. ~~Standalone Reports screen~~ (reports are inline within Profile)
