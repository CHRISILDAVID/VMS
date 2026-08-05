# Badminton Manager — Backend Architecture

## 1. Architecture Overview

Badminton Manager uses **Supabase** as the backend — shared by both the Owner App (React Native) and Admin Panel (React Web). No custom API server is needed.

```
┌───────────────────────┐     ┌───────────────────────┐
│   Owner App (Mobile)  │     │   Admin Panel (Web)   │
│   React Native/Expo   │     │   React + Vite        │
└──────────┬────────────┘     └──────────┬────────────┘
           │                              │
           └──────────┬───────────────────┘
                      │ Supabase JS Client
                      ▼
┌────────────────────────────────────────────────────────┐
│                   Supabase Platform                     │
│  ┌──────────┐  ┌──────────┐  ┌────────────────────┐   │
│  │ Auth     │  │ Database │  │ Storage             │   │
│  │ (OTP +   │  │ (Pg+RLS) │  │ (Photos/Receipts)  │   │
│  │ Email)   │  │          │  │                     │   │
│  └──────────┘  └──────────┘  └────────────────────┘   │
│  ┌──────────┐  ┌──────────┐  ┌────────────────────┐   │
│  │ Realtime │  │ Edge Fn  │  │ Pg Functions        │   │
│  │ (WS)     │  │ (Deno)   │  │ (Business Logic)   │   │
│  └──────────┘  └──────────┘  └────────────────────┘   │
└────────────────────────────────────────────────────────┘
```

---

## 2. Authentication Flows

### Owner App: Phone + OTP

```typescript
// Login
await supabase.auth.signInWithOtp({ phone: '+919876543210' })
// Verify
await supabase.auth.verifyOtp({ phone: '+919876543210', token: '1234', type: 'sms' })
```

- JWT stored in `expo-secure-store` (encrypted)
- Auto-refreshed by Supabase client
- Max 3-4 concurrent sessions

### Admin Panel: Email + Password

```typescript
await supabase.auth.signInWithPassword({ email: 'admin@bm.com', password: '...' })
```

- JWT stored in localStorage

---

## 3. Authorization: Row Level Security (RLS)

**Owner chain:** `auth.uid() → owners.id → venues.owner_id → all downstream tables`

**Super-Admin:** Full access via role check:
```sql
EXISTS (SELECT 1 FROM owners WHERE id = auth.uid() AND role = 'super_admin')
```

---

## 4. Service Layer

Shared service modules in `packages/shared/src/services/`:

| Service | Responsibility |
|---------|---------------|
| `auth.service.ts` | Login, logout, session |
| `bookings.service.ts` | CRUD bookings, status transitions, payment status updates |
| `customers.service.ts` | CRUD customers, search |
| `courts.service.ts` | CRUD courts |
| `venues.service.ts` | CRUD venues |
| `schedule.service.ts` | Operating hours, pricing blocks |
| `memberships.service.ts` | Slots, members, applications, guest play, slot releases |
| `payments.service.ts` | Membership payments, status tracking |
| `reports.service.ts` | Analytics queries, revenue breakdown |
| `storage.service.ts` | File upload/download |

---

## 5. Booking Logic

### Availability Check (PostgreSQL Function)

Checks both regular bookings AND membership slot blocks (respecting releases):

```sql
CREATE FUNCTION check_court_availability(
  p_court_id UUID, p_date DATE, p_start_time TIME, p_end_time TIME
) RETURNS BOOLEAN AS $$
BEGIN
  -- Check regular bookings
  IF EXISTS (
    SELECT 1 FROM bookings
    WHERE court_id = p_court_id AND date = p_date
      AND status NOT IN ('cancelled') AND deleted_at IS NULL
      AND (start_time, end_time) OVERLAPS (p_start_time, p_end_time)
  ) THEN RETURN FALSE; END IF;

  -- Check membership blocks (unless released for this date)
  IF EXISTS (
    SELECT 1 FROM membership_slots ms
    WHERE (ms.court_id = p_court_id OR ms.court_id IS NULL)
      AND ms.deleted_at IS NULL
      AND (ms.start_time, ms.end_time) OVERLAPS (p_start_time, p_end_time)
      AND LOWER(TO_CHAR(p_date, 'Dy'))::day_of_week = ANY(ms.playing_days)
      AND NOT EXISTS (
        SELECT 1 FROM membership_slot_releases msr
        WHERE msr.slot_id = ms.id AND msr.release_date = p_date
      )
  ) THEN RETURN FALSE; END IF;

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### Price Calculation (PostgreSQL Function)

Auto-calculates from pricing blocks. Owner can override in the UI.

---

## 6. Booking Payment Status Updates

| Transition | Scenario |
|-----------|----------|
| `pending → partial` | Player pays advance |
| `partial → paid` | Player pays remaining |
| `paid → refunded` | Player cancels, owner refunds |
| `pending → cancelled` | Booking cancelled before payment |

Simple dropdown on Booking Detail screen + optional note field.

---

## 7. WhatsApp Integration (MVP — Deep Links Only)

```typescript
import { Linking } from 'react-native'

export function openWhatsApp(phone: string, message: string) {
  const encoded = encodeURIComponent(message)
  Linking.openURL(`whatsapp://send?phone=91${phone}&text=${encoded}`)
}
```

Used for booking confirmations and payment reminders. Owner manually sends.

---

## 8. Push Notifications (FCM)

**expo-notifications** + Firebase Cloud Messaging:

| Trigger | Implementation |
|---------|---------------|
| New booking | Edge Function → FCM after insert |
| Payment overdue (3+ days) | Cron Edge Function (daily) → FCM |
| Membership application | Edge Function → FCM after insert |
| Membership expiring (7 days) | Cron Edge Function (daily) → FCM |
| Booking cancellation | Edge Function → FCM after status change |

---

## 9. Edge Functions

| Function | Purpose | Trigger |
|----------|---------|---------|
| `generate-receipt` | PDF receipt generation | After payment marked paid |
| `send-push-notification` | FCM push to owner | Various triggers |
| `generate-membership-payments` | Create monthly payment records | Cron (1st of month) |
| `check-overdue-payments` | Mark overdue + notify | Cron (daily) |

---

## 10. Offline Caching (MMKV)

| Data | Offline Behavior |
|------|-----------------|
| Today's schedule | ✅ Serve from MMKV cache |
| Member list | ✅ Serve from MMKV cache |
| All writes | ❌ Blocked — show "No internet" error |

Show banner: "You're offline — showing cached data"

---

## 11. Caching Strategy (React Query)

| Data | staleTime | Invalidation |
|------|-----------|-------------|
| Venues & Courts | 30 min | On mutation |
| Schedule (today) | 5 min | On booking create/update |
| Bookings list | 2 min | On mutation |
| Membership slots | 10 min | On mutation |
| Payment KPIs | 5 min | On payment change |
| Reports | 15 min | Manual refresh |

---

## Phase 2: ShuttleHub (Player App) — Backend Additions

### 12. Updated Architecture Overview

```
┌───────────────────────┐  ┌───────────────────────┐  ┌───────────────────────┐
│  Owner App (Mobile)   │  │ Player App (Mobile)   │  │  Admin Panel (Web)    │
│  React Native/Expo    │  │ React Native/Expo     │  │  React + Vite         │
└──────────┬────────────┘  └──────────┬────────────┘  └──────────┬────────────┘
           │                          │                          │
           └──────────┬───────────────┼──────────────────────────┘
                      │ Supabase JS Client                │
                      ▼                                   ▼
┌────────────────────────────────────────────────────────────────────────────┐
│                           Supabase Platform                                │
│  ┌──────────┐  ┌──────────┐  ┌────────────────────┐                       │
│  │ Auth     │  │ Database │  │ Storage             │                       │
│  │ (OTP +   │  │ (Pg+RLS) │  │ (Photos/Products/  │                       │
│  │ Email)   │  │          │  │  ID Proofs)         │                       │
│  └──────────┘  └──────────┘  └────────────────────┘                       │
│  ┌──────────┐  ┌──────────┐  ┌────────────────────┐                       │
│  │ Realtime │  │ Edge Fn  │  │ Pg Functions        │                       │
│  │ (WS)     │  │ (Deno)   │  │ (Business Logic)   │                       │
│  └──────────┘  └──────────┘  └────────────────────┘                       │
└────────────────────────────────────────────────────────────────────────────┘
```

### 13. Player App Authentication Flow

```typescript
// Player Login (same OTP flow as Owner App)
await supabase.auth.signInWithOtp({ phone: '+919876543210' })
// Verify
await supabase.auth.verifyOtp({ phone: '+919876543210', token: '1234', type: 'sms' })
```

- JWT stored in `expo-secure-store` (encrypted) — same as Owner App
- On first login: create `players` row, create `player_wallets` with 0 balance
- Auto-link: if `players.phone` matches any `customers.phone`, set `customers.user_id = auth.uid()`
- A user can have rows in BOTH `owners` and `players` tables simultaneously

### 14. Player Authorization (RLS)

**Player chain:** `auth.uid() → players.user_id → player-specific tables`

```sql
-- Helper function to identify player
CREATE FUNCTION is_player() RETURNS BOOLEAN AS $$
  SELECT EXISTS (SELECT 1 FROM players WHERE user_id = auth.uid());
$$ LANGUAGE sql SECURITY DEFINER;
```

**Access levels:**
| Entity | Player READ | Player WRITE | Notes |
|--------|-------------|-------------|-------|
| `venues` (active) | ✅ All | ❌ | Public discovery |
| `courts` (active) | ✅ All | ❌ | Public discovery |
| `pricing_blocks` | ✅ All | ❌ | For slot pricing calc |
| `operating_schedules` | ✅ All | ❌ | For venue hours |
| `membership_slots` (published) | ✅ All | ❌ | For membership browse |
| `bookings` | ✅ Own only | ✅ Create/Cancel own | `source = 'online'` |
| `challenges` | ✅ Sent/Received | ✅ Own | Booking-gated |
| `hosted_matches` | ✅ Public open | ✅ Own hosted | Booking-gated |
| `players` (public fields) | ✅ Active only | ✅ Own profile | Name, skill, city only |
| `notifications` | ✅ Own only | ✅ Mark read | Auto-created by triggers |
| `player_wallets` | ✅ Own only | ❌ | Admin-managed balance |
| `products` (active) | ✅ All | ❌ | Admin/owner managed |
| `cart_items` | ✅ Own only | ✅ Own only | — |
| `orders` | ✅ Own only | ✅ Create own | — |
| `venue_reviews` | ✅ All visible | ✅ Create own | One per booking |
| `coaches` (active) | ✅ All | ❌ | Admin-managed |
| `customers` | ❌ | ❌ | Owner-only data |

### 15. Player Service Layer

New shared service modules in `packages/shared/src/services/`:

| Service | Responsibility |
|---------|---------------|
| `player-auth.service.ts` | Player login, registration, profile CRUD |
| `player-bookings.service.ts` | Create bookings (source=online), cancel, history |
| `venue-discovery.service.ts` | Geo-filtered venue queries, search, details |
| `challenges.service.ts` | Create/accept/decline challenges, booking gate |
| `hosted-matches.service.ts` | Host/join/leave matches, match discovery |
| `player-discovery.service.ts` | Find players by skill, city, name search |
| `notifications.service.ts` | CRUD notifications, mark read, action |
| `products.service.ts` | Product catalog queries, search, filters |
| `cart.service.ts` | Cart CRUD, quantity updates |
| `orders.service.ts` | Create orders, order history, status tracking |
| `venue-reviews.service.ts` | Create reviews, fetch reviews by venue |
| `coaches.service.ts` | Fetch active coaches, filter by city/venue |
| `wallets.service.ts` | Read wallet balance, transaction history |

### 16. Player Booking Logic

#### Available Slots Query (PostgreSQL Function)

Extended from existing `check_court_availability` to support player-facing slot grid:

```sql
CREATE FUNCTION get_available_slots(
  p_venue_id UUID,
  p_date DATE,
  p_court_id UUID DEFAULT NULL  -- NULL = all courts
) RETURNS TABLE (
  court_id UUID,
  court_name TEXT,
  start_time TIME,
  end_time TIME,
  price_per_hour INTEGER,
  is_available BOOLEAN
) AS $$
BEGIN
  -- Generate 30-min slots from operating schedule
  -- Check against existing bookings + membership blocks (with releases)
  -- Respect venue.min_slot_duration for contiguous grouping
  -- Return slot grid with availability + pricing
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

#### Player Booking Flow

1. Player selects slots → client calculates `base_amount` from `pricing_blocks`
2. Client adds `platform_fee` from `venues.platform_fee`
3. INSERT into `bookings` with `source = 'online'`, `booked_by = auth.uid()`
4. Auto-create `customers` record for venue owner (if phone doesn't exist for that owner)
5. Set `customers.user_id = auth.uid()` for linking
6. Booking appears in Owner App via Supabase Realtime

#### Cancellation Logic

```typescript
// Check cancellation policy
const hoursUntilBooking = differenceInHours(booking.start, now())
if (hoursUntilBooking >= venue.cancellation_hours) {
  // Free cancellation → update booking.status = 'cancelled'
} else {
  // Block cancellation → show error
}
```

### 17. Player Push Notifications (FCM)

| Trigger | Target | Implementation |
|---------|--------|---------------|
| Booking confirmed | Player | Edge Function after booking INSERT |
| Booking cancelled (by owner) | Player | Edge Function after status UPDATE |
| Challenge received | Challenged player | Edge Function after challenge INSERT |
| Challenge accepted/declined | Challenger | Edge Function after challenge UPDATE |
| Guest play invitation | Player | Edge Function after guest_play INSERT |
| Membership payment reminder | Player | Owner triggers via "Send Reminder" |
| Match invitation | Player | Edge Function after match_participants INSERT |
| Order status update | Player | Edge Function after order UPDATE |
| Wallet credit | Player | Edge Function after wallet_transaction INSERT |

### 18. Player Edge Functions

| Function | Purpose | Trigger |
|----------|---------|---------| 
| `send-player-notification` | FCM push to player | Various DB triggers |
| `expire-challenges` | Auto-expire pending challenges after 24h | Cron (hourly) |
| `generate-player-id` | Auto-generate SH-XXXXX after admin verification | After player_ids.verification_status = 'verified' |
| `update-venue-rating` | Recalculate average_rating + total_reviews | After venue_reviews INSERT |
| `auto-link-customer` | Link customers.user_id when player registers | After players INSERT |

### 19. Player Caching Strategy (React Query)

| Data | staleTime | Invalidation |
|------|-----------|-------------|
| Venue list (city) | 10 min | On location change |
| Venue details | 15 min | Manual refresh |
| Available slots | 1 min | On booking mutation |
| Own bookings | 2 min | On mutation |
| Challenges | 2 min | On mutation |
| Open matches | 2 min | On mutation |
| Notifications | 30 sec | On read/action |
| Products | 15 min | On cart change |
| Cart | Real-time | On mutation |
| Wallet | 5 min | On transaction |
| Player profile | 30 min | On edit |
