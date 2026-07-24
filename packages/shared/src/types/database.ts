// ═══════════════════════════════════════════════════════════════
// Database types — placeholder until generated from Supabase
// Run `pnpm db:types` to regenerate from live schema
// ═══════════════════════════════════════════════════════════════

// --- Enums ---

export type UserRole = 'super_admin' | 'owner'

export type BookingStatus = 'upcoming' | 'ongoing' | 'completed' | 'cancelled'

export type BookingPaymentStatus = 'pending' | 'partial' | 'paid' | 'refunded' | 'cancelled'

export type SlotType = 'available' | 'booked' | 'coaching' | 'tournament' | 'maintenance' | 'blocked' | 'membership'

export type BookingSource = 'online' | 'offline' | 'walk_in' | 'membership'

export type CourtType = 'wooden' | 'synthetic' | 'cement' | 'mat'

export type MembershipPayStatus = 'paid' | 'due' | 'overdue'

export type SkillLevel = 'beginner' | 'intermediate' | 'advanced' | 'recreational'

export type ApplicationStatus = 'pending' | 'accepted' | 'rejected' | 'invited_guest'

export type GuestPlayStatus = 'upcoming' | 'completed' | 'accepted_member' | 'rejected'

export type PaymentMode = 'cash' | 'upi' | 'google_pay' | 'phonepe' | 'bank_transfer' | 'cheque' | 'card' | 'online'

export type SubscriptionPlan = 'free' | 'pro' | 'enterprise'

export type DayOfWeek = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun'

// --- Base types ---

export interface BaseEntity {
  id: string
  created_at: string
  updated_at: string
  deleted_at: string | null
}

// --- Core entities ---

export interface Owner extends BaseEntity {
  full_name: string
  phone: string
  email: string | null
  avatar_url: string | null
  business_name: string
  role: UserRole
}

export interface Venue extends BaseEntity {
  owner_id: string
  name: string
  address: string | null
  city: string | null
  state: string | null
  pincode: string | null
  latitude: number | null
  longitude: number | null
  contact_phone: string | null
  contact_email: string | null
  court_type: CourtType | null
  amenities: string[]
  photos: string[]
  gstin: string | null
  gst_enabled: boolean
  is_active: boolean
}

export interface Court extends BaseEntity {
  venue_id: string
  name: string
  court_type: CourtType | null
  sort_order: number
  is_active: boolean
}

// --- Bookings ---

export interface Customer extends BaseEntity {
  owner_id: string
  user_id: string | null
  full_name: string
  phone: string
  email: string | null
  notes: string | null
  total_visits: number
  total_spent: number
}

export interface Booking extends BaseEntity {
  booking_number: string
  venue_id: string
  court_id: string
  customer_id: string
  booked_by: string
  date: string
  start_time: string
  end_time: string
  duration_minutes: number
  base_amount: number
  discount: number
  final_amount: number
  advance: number
  pending: number
  status: BookingStatus
  payment_status: BookingPaymentStatus
  payment_mode: PaymentMode | null
  source: BookingSource
  slot_type: SlotType
  is_force_booked: boolean
  notes: string | null
  payment_notes: string | null
  whatsapp_sent: boolean
}

// --- Memberships ---

export interface MembershipSlot extends BaseEntity {
  venue_id: string
  name: string
  playing_days: DayOfWeek[]
  start_time: string
  end_time: string
  skill_level: SkillLevel
  monthly_fee: number
  capacity: number
  guest_play_fee: number
  allow_guest_play: boolean
  billing_day: number
  is_published: boolean
  is_recruiting: boolean
  court_id: string | null
}

export interface Member extends BaseEntity {
  slot_id: string
  customer_id: string
  is_active: boolean
  join_date: string
}

export interface MembershipPayment {
  id: string
  member_id: string
  slot_id: string
  amount: number
  billing_period: string
  due_date: string
  status: MembershipPayStatus
  payment_mode: PaymentMode | null
  paid_on: string | null
  receipt_url: string | null
  notes: string | null
  recorded_by: string | null
  created_at: string
  updated_at: string
}
