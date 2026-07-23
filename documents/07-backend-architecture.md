# Badminton Manager — Backend Architecture

## 1. Architecture Overview

Badminton Manager uses **Supabase** as the backend, eliminating the need for a custom API server. The architecture follows a **service-layer pattern** where the React frontend communicates directly with Supabase through typed client libraries.

```
┌────────────────────────────────────────────────────────┐
│                    Frontend (React)                     │
│  ┌──────────┐  ┌──────────┐  ┌──────────────────────┐ │
│  │ React    │  │ Supabase │  │ React Query           │ │
│  │ Query    │←─│ Client   │──│ (Caching + Mutations) │ │
│  └──────────┘  └──────────┘  └──────────────────────┘ │
└────────────────────────────────────────────────────────┘
          │              │              │
          ▼              ▼              ▼
┌────────────────────────────────────────────────────────┐
│                   Supabase Platform                     │
│  ┌──────────┐  ┌──────────┐  ┌────────────────────┐   │
│  │ Auth     │  │ Database │  │ Storage             │   │
│  │ (OTP)    │  │ (Pg+RLS) │  │ (Photos/Receipts)  │   │
│  └──────────┘  └──────────┘  └────────────────────┘   │
│  ┌──────────┐  ┌──────────┐  ┌────────────────────┐   │
│  │ Realtime │  │ Edge Fn  │  │ Pg Functions        │   │
│  │ (WS)     │  │ (Deno)   │  │ (Business Logic)   │   │
│  └──────────┘  └──────────┘  └────────────────────┘   │
└────────────────────────────────────────────────────────┘
```

---

## 2. Authentication Flow

### Phone + OTP (Supabase Auth)

```
User enters phone → Supabase Auth sends OTP via SMS
User enters OTP → Supabase verifies → JWT issued
JWT stored in client → Auto-refreshed by Supabase client
```

**Implementation:**
```typescript
// Login
const { data, error } = await supabase.auth.signInWithOtp({
  phone: '+919876543210'
})

// Verify OTP
const { data, error } = await supabase.auth.verifyOtp({
  phone: '+919876543210',
  token: '1234',
  type: 'sms'
})
```

**Session Management:**
- Supabase client handles JWT refresh automatically
- Session persisted in localStorage / SecureStorage (mobile)
- Protected routes check `supabase.auth.getSession()` on mount

---

## 3. Authorization Strategy

### Row Level Security (RLS)

Every database operation is filtered by the authenticated user's ownership chain:

```
auth.uid() → owners.id → venues.owner_id → courts.venue_id → bookings.venue_id
                                          → membership_slots.venue_id
                                          → customers.owner_id
```

### Staff Authorization

Staff members have a `permissions` array. Authorization is enforced at:
1. **RLS level** — staff can only access venues they're assigned to
2. **Application level** — UI hides features based on permissions
3. **Edge Function level** — for sensitive operations (payments, deletions)

---

## 4. Service Layer (Supabase Client Functions)

Instead of REST endpoints, create typed service modules:

```
src/services/
├── auth.service.ts         # Login, logout, session
├── venues.service.ts       # CRUD venues
├── courts.service.ts       # CRUD courts
├── bookings.service.ts     # CRUD bookings, status transitions
├── customers.service.ts    # CRUD customers, search
├── schedule.service.ts     # Operating hours, pricing blocks
├── memberships.service.ts  # Slots, members, applications, guest play
├── payments.service.ts     # Membership payments, status tracking
├── reports.service.ts      # Analytics queries
├── storage.service.ts      # File upload/download
└── subscriptions.service.ts # Plan management
```

### Example Service Pattern

```typescript
// services/bookings.service.ts
import { supabase } from '@/lib/supabase'
import type { Database } from '@/types/database'

type Booking = Database['public']['Tables']['bookings']['Row']
type BookingInsert = Database['public']['Tables']['bookings']['Insert']

export const bookingsService = {
  async list(venueId: string, filters?: BookingFilters) {
    let query = supabase
      .from('bookings')
      .select('*, customers(full_name, phone), courts(name)')
      .eq('venue_id', venueId)
      .is('deleted_at', null)
      .order('date', { ascending: true })

    if (filters?.status) query = query.eq('status', filters.status)
    if (filters?.date) query = query.eq('date', filters.date)
    if (filters?.courtId) query = query.eq('court_id', filters.courtId)

    return query
  },

  async create(booking: BookingInsert) {
    return supabase.from('bookings').insert(booking).select().single()
  },

  async updateStatus(id: string, status: BookingStatus) {
    return supabase.from('bookings').update({ status, updated_at: new Date().toISOString() }).eq('id', id)
  },
}
```

---

## 5. Booking Logic

### Availability Check
```sql
-- PostgreSQL function to check slot availability
CREATE FUNCTION check_court_availability(
  p_court_id UUID,
  p_date DATE,
  p_start_time TIME,
  p_end_time TIME
) RETURNS BOOLEAN AS $$
BEGIN
  RETURN NOT EXISTS (
    SELECT 1 FROM bookings
    WHERE court_id = p_court_id
      AND date = p_date
      AND status NOT IN ('cancelled')
      AND deleted_at IS NULL
      AND (start_time, end_time) OVERLAPS (p_start_time, p_end_time)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### Price Calculation
```sql
CREATE FUNCTION calculate_booking_price(
  p_venue_id UUID,
  p_date DATE,
  p_start_time TIME,
  p_end_time TIME,
  p_court_id UUID DEFAULT NULL
) RETURNS INTEGER AS $$
DECLARE
  v_day day_of_week;
  v_total INTEGER := 0;
BEGIN
  v_day := LOWER(TO_CHAR(p_date, 'Dy'))::day_of_week;

  SELECT COALESCE(
    (SELECT pb.price_per_hour
     FROM operating_schedules os
     JOIN pricing_blocks pb ON pb.schedule_id = os.id
     WHERE os.venue_id = p_venue_id
       AND os.day_of_week = v_day
       AND pb.is_active = true
       AND p_start_time >= pb.start_time
       AND p_start_time < pb.end_time
       AND (pb.court_ids = '{}' OR p_court_id = ANY(pb.court_ids))
     ORDER BY array_length(pb.court_ids, 1) DESC NULLS LAST
     LIMIT 1),
    0
  ) INTO v_total;

  -- Calculate based on duration
  v_total := v_total * EXTRACT(EPOCH FROM (p_end_time - p_start_time)) / 3600;

  RETURN v_total;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

---

## 6. Edge Functions (Only Where Necessary)

| Function | Purpose | Trigger |
|----------|---------|---------|
| `generate-receipt` | Generate payment receipt PDF | After marking payment as paid |
| `send-reminder` | Send WhatsApp/SMS payment reminder | Manual trigger from Payments page |
| `whatsapp-booking-confirmation` | Send booking confirmation via WhatsApp | After booking creation |
| `generate-membership-payments` | Create monthly payment records for all active members | Cron (1st of each month) |
| `generate-invoice` | Create subscription invoice | Cron (monthly) |

---

## 7. Realtime (Optional — Phase 2)

| Channel | Use Case |
|---------|----------|
| `bookings:venue_id=eq.{id}` | Live schedule updates when staff creates bookings |
| `membership_payments:slot_id=eq.{id}` | Live payment status in Payments view |

---

## 8. Error Handling

```typescript
// Standardized error handling
class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public status: number = 400
  ) {
    super(message)
  }
}

// Service-level error mapping
function handleSupabaseError(error: PostgrestError): never {
  if (error.code === '23505') throw new AppError('Duplicate entry', 'DUPLICATE', 409)
  if (error.code === '23503') throw new AppError('Referenced record not found', 'NOT_FOUND', 404)
  if (error.code === '42501') throw new AppError('Permission denied', 'FORBIDDEN', 403)
  throw new AppError(error.message, 'UNKNOWN', 500)
}
```

---

## 9. Caching Strategy

| Data | Cache Duration | Invalidation |
|------|---------------|-------------|
| Venues & Courts | 30 minutes | On mutation |
| Schedule (today) | 5 minutes | On booking create/update |
| Bookings list | 2 minutes | On mutation |
| Membership slots | 10 minutes | On mutation |
| Payment dashboard KPIs | 5 minutes | On payment status change |
| Reports | 15 minutes | Manual refresh |
| Customer search | No cache (real-time) | N/A |

Implemented via **React Query** (`@tanstack/react-query`) with `staleTime` and `gcTime` configuration.
