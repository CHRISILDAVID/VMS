export * from './database'
import type { Database } from './database'

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type Enums<T extends keyof Database['public']['Enums']> = Database['public']['Enums'][T]

export type Owner = Tables<'owners'>
export type Venue = Tables<'venues'>
export type Court = Tables<'courts'>
export type Booking = Tables<'bookings'>
export type Customer = Tables<'customers'>
export type OperatingSchedule = Tables<'operating_schedules'>
export type PricingBlock = Tables<'pricing_blocks'>
export type Member = Tables<'members'>
export type MembershipSlot = Tables<'membership_slots'>
export type MembershipPayment = Tables<'membership_payments'>
export type CourtType = Enums<'court_type'>
export type PaymentMethod = Enums<'payment_mode'>
export type PaymentStatus = Enums<'booking_payment_status'>
export type MembershipApplication = Tables<'membership_applications'>
export type GuestPlay = Tables<'guest_plays'>
export type MembershipSlotRelease = Tables<'membership_slot_releases'>
export type DayOfWeek = Enums<'day_of_week'>
export type SlotType = Enums<'slot_type'>
export type BookingStatus = Enums<'booking_status'>
export type BookingPaymentStatus = Enums<'booking_payment_status'>
export type MembershipPayStatus = Enums<'membership_pay_status'>
export type ApplicationStatus = Enums<'application_status'>
export type GuestPlayStatus = Enums<'guest_play_status'>
export type SkillLevel = Enums<'skill_level'>

// ─── Phase 2 — Player App Types ───────────────────────────────────────────
// Manually typed until migration 014 is applied and types are regenerated.

export interface Player {
  id: string;
  full_name: string;
  phone: string;
  email: string | null;
  avatar_url: string | null;
  city: string | null;
  date_of_birth: string | null;
  /** 'SH' + 5 alphanumeric chars — only set after Rankings → Register Player ID */
  player_id: string | null;
  player_id_verified: boolean;
  /** 'aadhaar' | 'passport' | 'driving_licence' — name only, never the number */
  player_id_doc_type: string | null;
  player_id_verified_at: string | null;
  linked_customer_id: string | null;
  fcm_token: string | null;
  theme_preference: 'light' | 'dark' | 'system';
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface PlayerWallet {
  id: string;
  player_id: string;
  /** Balance in paise (₹1 = 100 paise) */
  balance: number;
  created_at: string;
  updated_at: string;
}

export interface PlayerTransaction {
  id: string;
  wallet_id: string;
  amount: number;
  type: 'credit' | 'debit';
  reason: string;
  reference_id: string | null;
  reference_table: string | null;
  credited_by: string | null;
  created_at: string;
}

export interface CreatePlayerInput {
  full_name: string;
  phone: string;
  city: string;
  email?: string;
  date_of_birth?: string;
}

export interface UpdatePlayerInput {
  full_name?: string;
  city?: string;
  email?: string;
  avatar_url?: string;
  date_of_birth?: string;
  fcm_token?: string;
  theme_preference?: 'light' | 'dark' | 'system';
}

// ─── Phase 2 M11 Types ─────────────────────────────────────────────────────

export interface Coach {
  id: string;
  venue_id: string | null;
  full_name: string;
  photo_url: string | null;
  specialty: string[];
  bio: string | null;
  /** Price per session in paise */
  price_per_session: number;
  is_active: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
  /** Joined from venues table */
  venue?: {
    id: string;
    name: string;
    city: string | null;
  } | null;
}

export interface PlayerBookingPayment {
  id: string;
  booking_id: string;
  player_id: string;
  amount: number;
  payment_method: 'wallet' | 'online' | 'pay_at_court';
  payment_status: 'pending' | 'paid' | 'refunded' | 'failed';
  razorpay_order_id: string | null;
  razorpay_payment_id: string | null;
  razorpay_signature: string | null;
  refund_reference: string | null;
  wallet_transaction_id: string | null;
  created_at: string;
  updated_at: string;
}

/** A venue enriched with courts and min pricing for the player's court discovery flow */
export interface PublicVenue {
  id: string;
  name: string;
  address: string | null;
  city: string | null;
  state: string | null;
  latitude: number | null;
  longitude: number | null;
  contact_phone: string | null;
  amenities: string[];
  photos: string[];
  is_active: boolean;
  open_time?: string;
  close_time?: string;
  /** Min price per hour across all pricing blocks (paise). Null if no pricing configured. */
  min_price_per_hour: number | null;
  courts: Array<{
    id: string;
    name: string;
    court_type: string | null;
    sort_order: number;
    is_active: boolean;
  }>;
}

export interface OccupiedSlot {
  start_time: string; // "HH:MM:SS"
  end_time: string;   // "HH:MM:SS"
  booking_id: string;
}

export interface OnlineBookingInput {
  venue_id: string;
  court_id: string;
  player_id: string;
  date: string;           // "YYYY-MM-DD"
  start_time: string;     // "HH:MM"
  end_time: string;       // "HH:MM"
  duration_minutes: number;
  base_amount: number;    // paise
  final_amount: number;   // paise
  payment_method: 'wallet' | 'online' | 'pay_at_court';
  razorpay_order_id?: string;
  razorpay_payment_id?: string;
  razorpay_signature?: string;
}

export interface CreateCoachInput {
  full_name: string;
  venue_id?: string | null;
  photo_url?: string | null;
  specialty?: string[];
  bio?: string | null;
  price_per_session: number; // paise
}

export interface UpdateCoachInput {
  full_name?: string;
  venue_id?: string | null;
  photo_url?: string | null;
  specialty?: string[];
  bio?: string | null;
  price_per_session?: number;
  is_active?: boolean;
}
