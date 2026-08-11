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

---

# Phase 2 — ShuttleHub Player App Backend Architecture

---

## Phase 2 — 1. New Supabase Edge Functions

| Function | Trigger | Description |
|---|---|---|
| `revoke_expired_organizer_access` | Daily cron (midnight) | Checks `tournament_registrations.access_expires_at < now()` → sets profile card to "Organize Again" state |
| `compute_ranking_points` | HTTP POST (organizer "Finish Tournament") | Reads `tournament_results`, applies ranking formula, updates `ranked_players`, inserts `ranking_points_log`, sends push notifications |
| `issue_player_id` | HTTP POST (player ID registration) | Generates `SH` + 5 random alphanumeric → `players.player_id`, creates `ranked_players` row |
| `process_organizer_refund` | HTTP POST (admin rejection) | Calls Razorpay refund API for `tournament_registrations.payment_reference`, updates `payment_status='refunded'` |
| `process_booking_refund` | HTTP POST (booking cancellation) | Routes to wallet credit OR Razorpay refund based on original payment method |
| `cancel_challenge_on_booking_cancel` | DB Trigger on `bookings.status='cancelled'` | Finds linked challenges → status='cancelled', pushes to all invited players |
| `cancel_hosted_match_on_booking_cancel` | DB Trigger on `bookings.status='cancelled'` | Finds linked hosted matches → status='cancelled', pushes to all joined players |
| `send_fcm_push` | Called internally by other functions | Routes FCM push to player app tokens (separate from owner app token routing) |

---

## Phase 2 — 2. Supabase Realtime

```typescript
// useLiveScoring.ts — Umpire subscribes on match start
const channel = supabase
  .channel(`match:${matchId}`)
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'match_events',
    filter: `match_id=eq.${matchId}`
  }, (payload) => {
    dispatch({ type: payload.new.event_type, payload: payload.new })
  })
  .subscribe()

// Public Tournaments Live tab — players subscribe to all matches of a public tournament
const channel = supabase
  .channel(`tournament:${publicTournamentId}`)
  .on('postgres_changes', {
    event: 'UPDATE',
    schema: 'public',
    table: 'tournament_matches',
    filter: `category_id=in.(${categoryIds.join(',')})`
  }, (payload) => {
    updateMatchScore(payload.new)
  })
  .subscribe()
```

---

## Phase 2 — 3. Payment Flow Architecture

### Court Booking (Player App)

```
Player selects "Wallet" / "Online" / "Pay at Court"

  Wallet:
  → Debit player_wallets.balance
  → Insert player_transactions (debit, reason='court_booking')
  → Insert bookings (source='online', payment_status='wallet')
  → Insert player_booking_payments (method='wallet')

  Online (Razorpay):
  → Open Razorpay checkout (react-native-razorpay)
  → On success: Insert bookings + player_booking_payments (method='online', reference=razorpay_id)
  → Edge Function verifies via Razorpay webhook

  Pay at Court:
  → Insert bookings (source='online', payment_status='pending')
  → Owner marks as paid from Owner App
```

### Tournament Entry (Player App → public_tournament_registrations)

```
Same pattern as court booking:
  Wallet → debit wallet, insert transaction, insert registration (payment_status='paid')
  Online → Razorpay, insert registration on webhook confirmation
```

### Organizer Registration Fee (Player App → Razorpay only)

```
  Online only:
  → Razorpay checkout (₹400 × categories from system_config at time of payment)
  → On success: Insert tournament_registrations (payment_status='paid')
  → Admin reviews → if rejected: process_organizer_refund Edge Function (Razorpay API)
```

### Refund Logic

```
if original_payment_method == 'wallet':
  → INSERT player_transactions (type='credit', reason='refund', amount=original_amount)
  → UPDATE player_wallets.balance += original_amount

if original_payment_method == 'online':
  → Call Razorpay refund API (Edge Function)
  → On webhook confirmation: UPDATE payment_status='refunded'
```

---

## Phase 2 — 4. Player ID Generation

```typescript
// supabase/functions/issue_player_id/index.ts
const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
let playerId: string

do {
  const suffix = Array.from({ length: 5 }, () =>
    chars[Math.floor(Math.random() * chars.length)]
  ).join('')
  playerId = `SH${suffix}`

  // Check uniqueness
  const { data } = await supabase
    .from('players')
    .select('id')
    .eq('player_id', playerId)
    .single()

  if (!data) break // unique — exit loop
} while (true)

await supabase
  .from('players')
  .update({ player_id: playerId, player_id_verified: true, player_id_verified_at: new Date() })
  .eq('id', userId)

await supabase
  .from('ranked_players')
  .insert({ player_id_ref: playerId, skill_level: 'beginner' })
```

---

## Phase 2 — 5. Ranking Computation (Edge Function)

```typescript
// supabase/functions/compute_ranking_points/index.ts
// Called when organizer taps "Finish Tournament"

async function computeRankingPoints(tournamentId: string) {
  const categories = await getCategories(tournamentId)

  for (const category of categories) {
    const results = await getTournamentResults(category.id) // ordered by finish_position
    const totalEntries = results.length
    const participantMultiplier = getParticipantMultiplier(totalEntries)
    const reachMultiplier = getReachMultiplier(category.tournament_reach)

    for (const result of results) {
      const positionPoints = getPositionPoints(result.finish_position, totalEntries)
      const rankingPoints = positionPoints * participantMultiplier * reachMultiplier

      await supabase
        .from('tournament_results')
        .update({ ranking_points: rankingPoints })
        .eq('id', result.id)

      // Only update ranked_players for non-guest entries with Player ID
      if (result.entry.player1_player_ref && !result.entry.is_guest_entry) {
        const { data: rankedPlayer } = await supabase
          .from('ranked_players')
          .select('*')
          .eq('player_id_ref', result.entry.player1_id)
          .single()

        const newPoints = rankedPlayer.total_points + rankingPoints
        const promoted = checkPromotion(rankedPlayer.skill_level, newPoints)

        await supabase
          .from('ranked_players')
          .update({
            total_points: promoted ? 0 : newPoints,
            skill_level: promoted ? getNextLevel(rankedPlayer.skill_level) : rankedPlayer.skill_level,
            wins: rankedPlayer.wins + (result.finish_position === 1 ? 1 : 0),
            tournaments_played: rankedPlayer.tournaments_played + 1,
            titles_won: rankedPlayer.titles_won + (result.finish_position === 1 ? 1 : 0),
            previous_skill_level: promoted ? rankedPlayer.skill_level : rankedPlayer.previous_skill_level,
            promoted_at: promoted ? new Date() : rankedPlayer.promoted_at,
          })
          .eq('id', rankedPlayer.id)

        await supabase
          .from('ranking_points_log')
          .insert({
            ranked_player_id: rankedPlayer.id,
            tournament_result_id: result.id,
            points_awarded: rankingPoints,
            skill_level_at_time: rankedPlayer.skill_level,
          })
      }
    }
  }

  // Send push notifications to all ranked participants
  await notifyRankedParticipants(tournamentId)
}
```

---

## Phase 2 — 6. Admin Fee Rule (Enforced at DB Level)

The admin `admin_fee_override` column does **NOT** exist. The fee is immutable after payment:

```sql
-- tournament_registrations.registration_fee is set at payment time:
-- = (SELECT value FROM system_config WHERE key = 'organizer_fee_per_category')::integer
--    × array_length(categories, 1)
--
-- This is a snapshot at payment time. Admin cannot change it retroactively.
-- Admin changes system_config to affect FUTURE registrations only.
```

---

## Phase 2 — 7. Tournament Format Derivation

Tournament format is derived from questionnaire answers. Never stored as user input — always computed:

```typescript
function deriveTournamentFormat(
  numPools: number | null,
  koStartingRound: string | null
): 'round_robin' | 'direct_knockout' | 'round_robin_knockout' {
  if (numPools === 0 || numPools === null) return 'direct_knockout'
  if (numPools > 0 && !koStartingRound) return 'round_robin'
  return 'round_robin_knockout' // pools > 0 AND ko_starting_round set
}
```

This is stored in `tournament_categories.tournament_format` and used throughout to gate which dashboard tabs/UI components render.

---

## Phase 2 — 8. Caching Strategy (Player App specific)

| Data | React Query staleTime | MMKV offline cache |
|---|---|---|
| Player profile | 5 min | Yes (show stale while offline) |
| Court listings | 2 min | Yes (last known list) |
| Tournament list | 1 min | No (too dynamic) |
| Live match scores | 0 (Realtime) | No |
| Standings | 30 sec (polling fallback if WS drops) | No |
| Rankings leaderboard | 5 min | No |
| Shop products | 10 min | No |
| Wallet balance | 30 sec | No |