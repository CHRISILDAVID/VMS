# Admin Panel — Complete Implementation Plan (M7)

## 1. Context & Current State

### What Exists Today

**Admin Panel (`apps/admin/`)** — A minimal scaffold with:
- ✅ Email/password login (`useAdminAuth` + `LoginScreen`)
- ✅ Venue dropdown selector (pulls all venues via super-admin RLS)
- ✅ Bookings table (read-only, filterable by venue)
- ✅ Customers table (read-only, filterable)
- ✅ Top-nav bar with two tabs (Bookings / Customers)
- ❌ No sidebar layout
- ❌ No venue/court CRUD
- ❌ No owner management
- ❌ No dashboard
- ❌ No photo upload
- ❌ No proper routing (React Router) — single-page state toggle

**Database (Post-M6)** — 10 migrations applied:
| Migration | Tables |
|-----------|--------|
| `001_initial_schema` | `owners`, `venues`, `courts` + enums + `is_super_admin()` helper |
| `002_schedules_pricing` | `operating_schedules`, `pricing_blocks` |
| `003_bookings_customers` | `customers`, `bookings` |
| `004_memberships` | `membership_slots`, `membership_slot_releases`, `members`, `membership_applications`, `guest_plays` |
| `005_membership_payments` | `membership_payments` + `receipts` bucket |
| `006_bookings_improvements` | Duration + blocked slot fixes |
| `007_auto_generate_payment` | Auto-payment trigger on member add |
| `008_kpi_functions` | `get_venue_kpis()` |
| `009_reports_functions` | `get_reports_chart_data()` |
| `payment_voids_fix` | `is_voided` column on `membership_payments` |

**Key DB Constraints (Affecting Admin Panel Design):**
- `venues.owner_id` is `NOT NULL` — **requires a migration to make it nullable** for "unassigned" venues
- `owners.full_name` and `owners.business_name` are `NOT NULL` — admin must supply these during owner creation
- `owners.id` is a UUID FK to `auth.users(id)` — owner creation requires an auth.users entry first (phone-based)
- Super-admin RLS policies exist on **all tables** via `is_super_admin()` function
- `venue-photos` storage bucket is documented but **not yet created**

**Owner App Onboarding Flow (Current):**
1. Login screen → Phone + OTP
2. If `ownerProfile === null` → Onboarding screen (Full Name + Business Name text inputs)
3. `createOwner()` called → Owner record inserted
4. Auth guard redirects to Schedule

**User's Requested Change:** Since the admin will pre-create owner profiles (full_name, business_name, venue assignment), the onboarding screen's manual text inputs become unnecessary. Instead, after OTP, the owner should simply see their pre-assigned venues.

---

## 2. Proposed Admin Panel Architecture

### 2.1 Navigation Structure

```
/login                          → Admin email/password login
/                               → Dashboard (aggregate KPIs)
/owners                         → Owners list + CRUD
/owners/:id                     → Owner detail (profile + assigned venues)
/venues                         → Venues list + CRUD
/venues/new                     → Create venue form
/venues/:id                     → Venue detail + courts management
/venues/:id/courts              → Courts CRUD for a venue
/venues/:id/schedule            → Operating schedules + pricing blocks config
/bookings                       → Bookings table (existing, enhanced)
/customers                      → Customers table (existing, enhanced)
/memberships                    → Membership slots overview (read-only)
/payments                       → Membership payments overview (read-only)
```

### 2.2 Layout

Desktop-first sidebar + content layout:
```
┌──────────────────────────────────────────────────────┐
│  Header: Logo + Admin name + Logout + Theme Toggle   │
├──────────┬───────────────────────────────────────────┤
│          │                                           │
│ Sidebar  │  Content Area                             │
│          │                                           │
│ Dashboard│  (Routed pages)                           │
│ Owners   │                                           │
│ Venues   │                                           │
│ Bookings │                                           │
│ Customers│                                           │
│ Members  │                                           │
│ Payments │                                           │
│          │                                           │
│          │                                           │
│ ──────── │                                           │
│ Settings │                                           │
│          │                                           │
└──────────┴───────────────────────────────────────────┘
```
**Theme Support:** The Admin panel must support Dark, Light, and System Default modes.

---

## 3. Feature Breakdown

### Feature 1: Dashboard (`/`)

**Purpose:** At-a-glance platform health for the super-admin.

**KPI Cards:**
| KPI | Source |
|-----|--------|
| Total Venues | `count(venues)` where `deleted_at IS NULL` |
| Active Venues | `count(venues)` where `is_active = true AND deleted_at IS NULL` |
| Total Owners | `count(owners)` where `deleted_at IS NULL` |
| Total Courts | `count(courts)` where `deleted_at IS NULL` |
| Unassigned Venues | `count(venues)` where `owner_id IS NULL AND deleted_at IS NULL` |
| Total Bookings (This Month) | `count(bookings)` for current month |
| Total Revenue (This Month) | `sum(final_amount)` where `payment_status = 'paid'` + membership paid |
| Active Members (Platform-wide) | `count(members)` where `is_active = true AND deleted_at IS NULL` |

**Secondary:** A small "Recent Activity" feed showing last 10 bookings across all venues.

**Edge Cases:**
- Dashboard must work with zero venues/owners (fresh platform)
- All numbers link to their respective list pages

---

### Feature 2: Owner Management (`/owners`)

**Purpose:** Admin creates and manages venue owner accounts. Owners only use phone-based auth on the mobile app.

#### 2.1 Owners List Page

**Table columns:** Full Name | Business Name | Phone | Email | Venues Count | Created | Actions

**Filters:** Search (name/phone)

**Actions per row:** View Details, Edit, Deactivate (soft delete)

#### 2.2 Create Owner Flow

> **⚠️ CRITICAL:** This is the most critical and complex admin feature. The admin creates owner accounts so that when the owner opens the mobile app and verifies their phone, they land directly on the Schedule — no manual onboarding needed.

**Admin-side steps:**
1. Admin fills form: **Full Name**, **Business Name**, **Phone Number** (required), Email (optional)
2. System calls `supabase.auth.admin.createUser({ phone, phone_confirm: true })` via a Supabase Edge Function (admin API requires the service_role key, which must NOT be exposed to the browser)
3. Edge Function returns the new `auth.users.id`
4. System inserts into `owners` table: `{ id, full_name, phone, business_name, email, role: 'owner' }`
5. Admin can optionally assign venues to this owner immediately (or do it later)

**Why Edge Function is needed:**
- `supabase.auth.admin.createUser()` requires the **service_role** key
- The browser client only has the **anon** key
- The Edge Function acts as a secure proxy

**Edge Cases:**
- **Duplicate phone number:** `owners.phone` has a UNIQUE constraint. Must show "Phone number already registered" error.
- **Phone format validation:** Must be a valid Indian mobile number (+91XXXXXXXXXX)
- **Owner already exists in auth.users but not in owners table:** Handle gracefully — link the existing auth user
- **Cannot delete owner with active venues:** Must reassign or deactivate venues first

#### 2.3 Edit Owner

- Can update: full_name, business_name, email, avatar_url
- **Cannot update phone** (phone is the auth identity — changing it is a separate flow)
- Deactivate: set `deleted_at = NOW()` (soft delete)

#### 2.4 Owner Detail Page (`/owners/:id`)

Shows:
- Owner profile card (name, business, phone, email, created date)
- List of assigned venues with quick links
- Action: Assign additional venue, Remove venue assignment

---

### Feature 3: Venue Management (`/venues`)

**Purpose:** Admin creates and fully configures venues before assigning them to owners.

#### 3.1 Venues List Page

**Table columns:** Venue Name | City | Owner | Courts Count | Status | Created | Actions

**Filters:** Search (name/city), Owner (dropdown), Status (Active/Inactive/Unassigned)

#### 3.2 Create Venue Form (`/venues/new`)

**Fields:**

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| Name | Text | ✅ | e.g., "Feathers Badminton" |
| Owner | Dropdown | ❌ | Select from existing owners, or leave unassigned |
| Address | Text | ❌ | Full address |
| Map Link | Text | ❌ | Google Maps or other map link |
| City | Text | ❌ | |
| State | Text | ❌ | |
| Pincode | Text | ❌ | |
| Latitude | Number | ❌ | For map coordinates |
| Longitude | Number | ❌ | For map coordinates |
| Contact Phone | Text | ❌ | Venue contact number |
| Contact Email | Email | ❌ | |
| Amenities | Multi-select tags | ❌ | e.g., Parking, Washroom, Cafeteria, Wi-Fi |
| GSTIN | Text | ❌ | GST number |
| GST Enabled | Toggle | ❌ | Default: false |
| Photos | File upload (multiple) | ❌ | Upload to Supabase Storage `venue-photos` bucket |

*(Note: `Court Type` is intentionally omitted from the Venue level because venues can have multiple court types (e.g. 6 synthetic, 3 wooden). Court types will be defined individually when creating Courts.)*

**After venue creation,** auto-navigate to venue detail page to add courts.

#### 3.3 Venue Detail Page (`/venues/:id`)

**Sections:**
1. **Venue Info Card** — Editable form with all fields from above
2. **Courts Section** — CRUD courts for this venue (see Feature 4)
3. **Schedule & Pricing** — Operating schedule + pricing blocks config (see Feature 5)
4. **Owner Assignment** — Current owner display + reassign button
5. **Stats Summary** — Total bookings, revenue, active members for this venue

**Edge Cases:**
- **Unassigned venue:** Allow creation without owner. Shows "Unassigned" badge.
- **Venue deactivation:** Soft delete (`deleted_at = NOW()`). Must handle cascading visibility — owner app should stop showing deactivated venues.
- **Reassign venue to different owner:** Update `owner_id`. All downstream data (bookings, memberships) stays with the venue, not the old owner. This is correct because bookings belong to venues, not owners directly.
- **Deleting last venue for an owner:** Show warning — owner will have an empty venue list.

---

### Feature 4: Courts Management (`/venues/:id/courts`)

**Purpose:** Admin creates and configures courts within a venue. This is part of the Venue Detail page.

#### 4.1 Courts List (within Venue Detail)

**Table/Card layout:** Court Name | Type | Sort Order | Status | Actions

#### 4.2 Create/Edit Court

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| Name | Text | ✅ | e.g., "Court 1", "Court 2" |
| Court Type | Dropdown | ❌ | wooden / synthetic / cement / mat |
| Sort Order | Number | ❌ | Display order on schedule |
| Is Active | Toggle | ✅ | Default: true |

**Batch creation option:** "Add N courts" — auto-names them "Court 1" through "Court N".

**Edge Cases:**
- **Deactivating a court with future bookings:** Show warning listing affected bookings count.
- **Minimum courts:** A venue should have at least 1 court to be operational. Show warning if venue has 0 active courts.
- **Reordering:** Drag-and-drop or manual sort_order field.

---

### Feature 5: Schedule & Pricing Configuration (`/venues/:id/schedule`)

**Purpose:** Admin sets up default operating hours and pricing blocks for a venue, so the owner doesn't have to configure everything from scratch.

#### 5.1 Operating Schedules

Weekly calendar showing 7 days. For each day:
- **Is Closed** toggle — marks the day as closed
- **Is 24H** toggle — marks as 24-hour operation
- If neither closed nor 24h, pricing blocks define the operating windows

#### 5.2 Pricing Blocks

Per-day pricing blocks defining time ranges and rates:

| Field | Type | Notes |
|-------|------|-------|
| Start Time | Time picker | |
| End Time | Time picker | Must be after start |
| Price Per Hour | Number (₹) | In rupees, stored as paise |
| Court IDs | Multi-select | Empty = applies to all courts |

**Edge Cases:**
- **Overlapping blocks:** Validate no time overlap within the same day.
- **No pricing blocks + not closed + not 24h:** Venue effectively has no operating hours. Show warning.
- **Owner can later modify:** These are defaults. Owner has full Schedule & Pricing CRUD in the mobile app (M5).

---

### Feature 6: Photo Upload

**Purpose:** Admin uploads venue and court photos for the public listing.

**Implementation:**
1. Create `venue-photos` Supabase Storage bucket (public read, authenticated write)
2. Admin uploads via drag-and-drop or file picker
3. Files stored at path: `venue-photos/{venue_id}/{filename}`
4. URLs stored in `venues.photos` array
5. Multi-file upload with progress indicators
6. Image preview with delete option

**Edge Cases:**
- **File size limit:** Max 5MB per image
- **File types:** jpg, png, webp only
- **Max photos per venue:** 10

---

### Feature 7: Bookings Overview (`/bookings`) — Enhancement

**Current state:** Existing `BookingsTable.tsx` with venue-scoped view.

**Enhancements:**
- **Cross-venue view:** Remove venue filter requirement — show all bookings platform-wide by default
- **Venue column:** Add venue name column
- **Owner column:** Add owner name column
- **Date range filter:** Allow filtering by date range
- **Export to CSV:** Download button for filtered results
- **Read-only:** Admin can view but NOT create/edit/cancel bookings (that's the owner's job)

---

### Feature 8: Customers Overview (`/customers`) — Enhancement

**Current state:** Existing `CustomersTable.tsx`.

**Enhancements:**
- **Cross-venue view:** Show all customers platform-wide
- **Owner column:** Show which owner this customer belongs to
- **Read-only:** Admin can view but not modify customer data

---

### Feature 9: Memberships Overview (`/memberships`)

**Purpose:** Admin can view membership slots and their status across all venues.

**Table columns:** Slot Name | Venue | Days | Time | Fee | Capacity | Active Members | Status

**Read-only.** Admin does NOT manage memberships — that's the owner's domain.

---

### Feature 10: Payments Overview (`/payments`)

**Purpose:** Admin can view membership payment collection status across all venues.

**KPI Cards:**
- Total Collected (platform-wide, this month)
- Total Due (platform-wide)
- Total Overdue (platform-wide)

**Table columns:** Member Name | Slot | Venue | Amount | Status | Due Date | Paid On

**Read-only.** Admin does NOT process payments.

---

## 4. Database Changes Required

### Migration 010: Admin Panel Schema Changes

```sql
-- 1. Make owner_id nullable on venues (for unassigned venues)
ALTER TABLE venues ALTER COLUMN owner_id DROP NOT NULL;

-- 2. Create venue-photos storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('venue-photos', 'venue-photos', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for venue-photos
CREATE POLICY "Public read for venue photos"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'venue-photos');

CREATE POLICY "Authenticated upload for venue photos"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'venue-photos' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated delete for venue photos"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'venue-photos' AND auth.role() = 'authenticated');

-- 3. Update venue RLS to allow super-admin to create venues without owner
-- (Already covered by existing "Super-admin full access on venues" policy)

-- 4. Allow super-admin to insert owners (for admin-created owner profiles)
-- (Already covered by existing "Super-admin full access on owners" policy)
```

> **Note:** Making `owner_id` nullable on `venues` affects the Owner App's venue fetching. The query in `venues.service.ts` uses `.eq('owner_id', ownerId)` which will still work — it simply won't return unassigned venues. No owner app code change needed for this.

---

## 5. Edge Function: Create Owner Account

**File:** `supabase/functions/create-owner-account/index.ts`

**Purpose:** Secure proxy for `supabase.auth.admin.createUser()` which requires the service_role key.

**Flow:**
1. Admin panel sends POST with `{ phone, full_name, business_name, email? }`
2. Edge Function validates the caller is a super_admin (by checking their JWT)
3. Calls `supabase.auth.admin.createUser({ phone, phone_confirm: true })`
4. Inserts into `owners` table with the returned `auth.users.id`
5. Returns the new owner record

**Edge Cases:**
- Phone already exists in auth.users → Return existing user ID + create owner record if missing
- Phone already exists in owners → Return error "Owner already exists"
- Invalid phone format → Return 400 with validation error
- Caller is not super_admin → Return 403

---

## 6. Owner App Onboarding Change

### Current Flow
```
Phone → OTP → No owner profile? → Onboarding (Full Name + Business Name) → Schedule
```

### New Flow
```
Phone → OTP → No owner profile? → ERROR: "Contact admin for account setup" → Stay on error screen
          → Owner profile exists? → Schedule (directly)
```

**Reasoning:** Since admin creates the owner profile with full_name and business_name, there's no need for the onboarding form. If a phone number authenticates but has no matching owner record, it means the admin hasn't set them up yet.

**Changes to `apps/owner/`:**
1. **`app/_layout.tsx` (AuthGuard):** Change the `session && !ownerProfile` branch from redirecting to onboarding to showing an "Account Not Configured" screen
2. **`app/(auth)/onboarding.tsx`:** Replace with a static "Account Not Configured" screen showing:
   - "Your account hasn't been set up yet"
   - "Please contact the administrator to configure your account"
   - "Logout" button
3. **Remove** the Name/Business Name form entirely

> **⚠️ BREAKING CHANGE:** After this change, owners can ONLY be created through the admin panel. Self-registration is no longer possible. This is the user's explicit requirement.

---

## 7. Shared Service Layer Changes

### `packages/shared/src/services/owners.service.ts` — Extend

```typescript
// New methods needed for admin:
listAllOwners()           // SELECT * FROM owners (super-admin RLS handles access)
getOwnerWithVenues(id)    // Join owners + venues
```

### `packages/shared/src/services/venues.service.ts` — Extend

```typescript
// New methods needed for admin:
listAllVenues()           // SELECT * FROM venues (super-admin RLS handles access)
createVenue(data)         // INSERT into venues
updateVenue(id, data)     // UPDATE venues
deactivateVenue(id)       // SET deleted_at = NOW()
reassignVenue(venueId, newOwnerId)  // UPDATE owner_id
```

### `packages/shared/src/services/courts.service.ts` — Extend

```typescript
// New methods needed for admin:
createCourt(data)         // INSERT into courts
updateCourt(id, data)     // UPDATE courts
deleteCourt(id)           // SET deleted_at = NOW()
reorderCourts(venueId, orderedIds)  // Batch UPDATE sort_order
```

---

## 8. Tech Stack for Admin Panel

| Layer | Technology | Notes |
|-------|-----------|-------|
| Framework | React 19 | Already in scaffold |
| Build | Vite 8 | Already configured |
| Styling | Tailwind CSS v4 | Already configured |
| Routing | React Router 7 | **NEW** — replace state-based nav |
| State (Server) | TanStack React Query 5 | Already configured |
| Forms | React Hook Form + Zod | **NEW** — for venue/owner/court forms |
| Icons | Lucide React | Already used |
| File Upload | Native + Supabase Storage SDK | **NEW** |
| Tables | Custom or TanStack Table | **NEW** — for data-heavy views |
| Backend | Supabase JS 2 | Already configured |
| Deploy | Vercel | As per roadmap |

---

## 9. Implementation Phases

### Phase 0: Database & Backend Pre-requisites
- [x] Create and run migration 010 (owner_id nullable + venue-photos bucket)
- [x] Create and deploy the `create-owner-account` Edge Function
- [x] Regenerate Supabase database types (`pnpm db:types`)

### Phase 1: Foundation (Infrastructure)
- [x] Install React Router, React Hook Form, Zod
- [x] Set up sidebar + content layout with React Router (including Theme Support)
- [x] Create reusable UI components: Table, Form, Modal, PageHeader, StatusBadge
- [x] Migrate existing BookingsTable and CustomersTable into the new routed layout
- [x] Create the Dashboard page with platform-wide KPIs
- [x] Add "Recent Activity" feed (last 10 bookings) to the Dashboard
- [x] Implement empty state ("Get Started" CTA) for Dashboard when 0 venues/owners
- [x] Convert Admin Login from Mobile/OTP to Email/Password (`LoginScreen` & `useAdminAuth`)
- [x] Extend Shared Service Layer (`owners.service.ts`, `venues.service.ts`, `courts.service.ts`)

### Phase 2: Owner Management (Core)
- [x] Build Owners list page (`/owners`)
- [x] Build Create Owner form (integrating with Edge Function)
- [x] Build Owner detail page (`/owners/:id`)
- [x] Build Edit Owner form
- [x] Implement owner deactivation
- [x] Implement validation preventing deactivation of owners with active venues

### Phase 3: Venue & Court Management (Core)
- [x] Build Venues list page (`/venues`)
- [x] Build Create Venue form (`/venues/new`)
- [x] Build Venue detail page (`/venues/:id`)
- [x] Add Stats Summary (bookings, revenue, members) to Venue detail page
- [x] Build Courts CRUD within venue detail
- [x] Implement batch court creation ("Add N courts" feature)
- [x] Implement venue deactivation with warning for future bookings
- [x] Implement court deletion warning for active bookings
- [x] Add warning indicator for venues with 0 active courts
- [x] Build venue reassignment (owner dropdown)
- [x] Implement photo upload to Supabase Storage
- [x] **[Extra]** Inline Confirmation State (removed browser alerts for batch adds)
- [x] **[Extra]** Owner Searchable Select (Combobox with pagination/limit for owner assignment)
- [x] **[Extra]** Clone Court Feature (copy configurations automatically)
- [x] **[Extra]** Direct Supabase Storage Photo Management (upload/delete sync with bucket)
- [x] **[Extra]** Fix nested relational aggregate counts for soft-deleted entities

### Phase 4: Schedule & Pricing Configuration
- [x] Build Schedule & Pricing page within venue detail (`/venues/:id/schedule`)
- [x] Operating schedules weekly calendar UI
- [x] Pricing blocks CRUD per day

### Phase 5: Overview Pages (Read-Only)
- [x] Enhance Bookings table (cross-venue, date range, export)
- [x] Enhance Customers table (cross-venue)
- [x] Build Memberships overview page
- [x] Build Payments overview page

### Phase 6: Owner App Onboarding Change & UI Polish
- [x] Modify `_layout.tsx` AuthGuard to handle "no profile" case
- [x] Replace onboarding screen with "Account Not Configured" screen
- [x] Test full flow: Admin creates owner → Owner logs in → Lands on Schedule
- [x] Applied dark mode theme to admin overview cards (Bookings, Customers, Memberships, Payments)

### Phase 7: Polish & Deploy
- [ ] Responsive design (mobile fallback) 
- [ ] Error handling and toast notifications
- [ ] Loading skeletons on all pages
- [ ] Vercel deployment configuration
- [ ] Final testing across all flows

---

## 10. Edge Cases Summary

| Scenario | Handling |
|----------|----------|
| Admin creates owner with phone that already exists in auth.users | Link existing auth user, create owner record if missing |
| Admin creates owner with phone that already has an owner record | Show error "Owner already exists" |
| Admin creates venue without assigning an owner | Allowed — venue stays "Unassigned" |
| Admin reassigns venue from Owner A to Owner B | Update `owner_id`. All bookings/memberships stay with the venue. Owner A loses access, Owner B gains access via RLS. |
| Admin deactivates owner who has active venues | Must deactivate or reassign all venues first |
| Admin deactivates venue with future bookings | Show warning with affected bookings count. Allow proceeding. |
| Owner logs in before admin creates their profile | Shows "Account Not Configured" screen with logout option |
| Admin deletes a court that has active bookings | Prevented by CASCADE behavior. Show warning. |
| Two admins editing the same venue simultaneously | Last-write-wins (standard Supabase behavior). Consider `updated_at` check for conflict detection in future. |
| Admin uploads photo > 5MB | Client-side validation rejects |
| Venue with 0 courts | Show "Add courts to make this venue operational" warning |
| Platform has 0 venues and 0 owners | Dashboard shows all zeros with "Get Started" call-to-action |

---

## 11. Security Considerations

| Area | Implementation |
|------|---------------|
| Admin Authentication | Email/password via Supabase Auth. Only pre-created admin accounts. |
| Admin Authorization | All admin data access governed by `is_super_admin()` RLS check |
| Owner Account Creation | Via Edge Function using service_role key (never exposed to browser) |
| Service Role Key | Only in Edge Function environment, never in client code |
| Storage Access | venue-photos: public read, authenticated write |
| Session Management | JWT in localStorage with auto-refresh |
| CORS | Edge Function should only accept requests from admin panel domain |

---

## 12. Resolved Questions (From Brainstorming)

> **Q1: Should the admin be able to create bookings on behalf of an owner?**
> **Answer:** Not for the MVP.

> **Q2: Should there be multiple super-admin accounts or just one?**
> **Answer:** Maximum of 3 super_admin accounts (as backups).

> **Q3: The owner's venues are currently seeded via SQL. After this change, should the existing seed data be migrated or is starting fresh acceptable?**
> **Answer:** The admin panel should be the ONLY way to create venues in production. We will truncate everything for production, though we will maintain dummy seed data scripts for local development/testing of the user app.

> **Q4: Should the admin panel have the ability to impersonate an owner (view their schedule as they would see it)?**
> **Answer:** Not for the MVP.

> **Q5: When creating an owner, should we send them an SMS notification that their account is ready?**
> **Answer:** No need for now to save on costs. Will consider for the future.
