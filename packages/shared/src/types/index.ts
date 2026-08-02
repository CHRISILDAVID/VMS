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
