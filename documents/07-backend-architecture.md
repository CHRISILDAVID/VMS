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