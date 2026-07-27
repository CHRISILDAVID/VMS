import type { SlotType, BookingStatus, BookingPaymentStatus, MembershipPayStatus } from '../types'

// ═══════════════════════════════════════════════════════════════
// Slot type colors (for schedule timeline)
// ═══════════════════════════════════════════════════════════════

export const SLOT_COLORS: Record<SlotType, { bg: string; border: string; text: string }> = {
  available:   { bg: '#F0FDF4', border: '#86EFAC', text: '#166534' },
  booked:      { bg: '#EFF6FF', border: '#93C5FD', text: '#1E40AF' },
  coaching:    { bg: '#FFFBEB', border: '#FCD34D', text: '#92400E' },
  tournament:  { bg: '#F5F3FF', border: '#C4B5FD', text: '#5B21B6' },
  blocked:     { bg: '#FEF2F2', border: '#FCA5A5', text: '#991B1B' },
  membership:  { bg: '#F0FDFA', border: '#5EEAD4', text: '#115E59' },
}

// ═══════════════════════════════════════════════════════════════
// Status colors
// ═══════════════════════════════════════════════════════════════

export const BOOKING_STATUS_COLORS: Record<BookingStatus, { bg: string; text: string }> = {
  upcoming:  { bg: '#EFF6FF', text: '#2563EB' },
  ongoing:   { bg: '#FFFBEB', text: '#D97706' },
  completed: { bg: '#F0FDF4', text: '#16A34A' },
  cancelled: { bg: '#FEF2F2', text: '#DC2626' },
}

export const PAYMENT_STATUS_COLORS: Record<BookingPaymentStatus, { bg: string; text: string }> = {
  pending:   { bg: '#FFFBEB', text: '#D97706' },
  partial:   { bg: '#FFF7ED', text: '#EA580C' },
  paid:      { bg: '#F0FDF4', text: '#16A34A' },
  refunded:  { bg: '#F5F3FF', text: '#7C3AED' },
  cancelled: { bg: '#FEF2F2', text: '#DC2626' },
}

export const MEMBERSHIP_PAY_COLORS: Record<MembershipPayStatus, { bg: string; text: string }> = {
  paid:    { bg: '#F0FDF4', text: '#16A34A' },
  due:     { bg: '#FFFBEB', text: '#D97706' },
  overdue: { bg: '#FEF2F2', text: '#DC2626' },
}

// ═══════════════════════════════════════════════════════════════
// Schedule constants
// ═══════════════════════════════════════════════════════════════

export const SCHEDULE_START_HOUR = 6
export const SCHEDULE_END_HOUR = 22
export const SLOT_INTERVAL_MINUTES = 30
export const MIN_BOOKING_DURATION_MINUTES = 60

// ═══════════════════════════════════════════════════════════════
// Design tokens
// ═══════════════════════════════════════════════════════════════

export const COLORS = {
  primary:       '#2563EB',
  primaryLight:  '#EFF6FF',
  primaryDark:   '#1D4ED8',
  success:       '#16A34A',
  successLight:  '#F0FDF4',
  warning:       '#D97706',
  warningLight:  '#FFFBEB',
  danger:        '#DC2626',
  dangerLight:   '#FEF2F2',
  purple:        '#7C3AED',
  purpleLight:   '#F5F3FF',
  teal:          '#0D9488',
  tealLight:     '#F0FDFA',
  surface:       '#FFFFFF',
  background:    '#F8FAFC',
  border:        '#E2E8F0',
  textPrimary:   '#0F172A',
  textSecondary: '#64748B',
  textMuted:     '#94A3B8',
} as const

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
} as const

export const RADIUS = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  full: 9999,
} as const

// ═══════════════════════════════════════════════════════════════
// Display labels
// ═══════════════════════════════════════════════════════════════

export const COURT_TYPE_LABELS: Record<string, string> = {
  wooden: 'Wooden',
  synthetic: 'Synthetic / PVC',
  cement: 'Cement',
  mat: 'Mat',
}

export const SKILL_LEVEL_LABELS: Record<string, string> = {
  beginner: 'Beginner',
  intermediate: 'Intermediate',
  advanced: 'Advanced',
  recreational: 'Recreational',
}

export const PAYMENT_MODE_LABELS: Record<string, string> = {
  cash: 'Cash',
  upi: 'UPI',
  google_pay: 'Google Pay',
  phonepe: 'PhonePe',
  bank_transfer: 'Bank Transfer',
  cheque: 'Cheque',
  card: 'Card',
  online: 'Online',
}

export const DAY_LABELS: Record<string, string> = {
  mon: 'Monday',
  tue: 'Tuesday',
  wed: 'Wednesday',
  thu: 'Thursday',
  fri: 'Friday',
  sat: 'Saturday',
  sun: 'Sunday',
}

export const DAY_SHORT_LABELS: Record<string, string> = {
  mon: 'Mon',
  tue: 'Tue',
  wed: 'Wed',
  thu: 'Thu',
  fri: 'Fri',
  sat: 'Sat',
  sun: 'Sun',
}
