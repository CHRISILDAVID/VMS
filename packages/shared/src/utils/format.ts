/**
 * Format amount in paise to INR display string
 * @param paise - Amount in paise (smallest currency unit)
 * @returns Formatted string like "₹1,200"
 */
export function formatCurrency(paise: number): string {
  const rupees = paise / 100
  return `₹${rupees.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`
}

/**
 * Format amount with decimal places
 * @param paise - Amount in paise
 * @returns Formatted string like "₹1,200.50"
 */
export function formatCurrencyDecimal(paise: number): string {
  const rupees = paise / 100
  return `₹${rupees.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

/**
 * Format Indian phone number
 * @param phone - 10-digit phone number
 * @returns Formatted like "+91 98765 43210"
 */
export function formatPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '')
  if (digits.length === 10) {
    return `+91 ${digits.slice(0, 5)} ${digits.slice(5)}`
  }
  if (digits.length === 12 && digits.startsWith('91')) {
    return `+91 ${digits.slice(2, 7)} ${digits.slice(7)}`
  }
  return phone
}

/**
 * Format time string (HH:MM:SS or HH:MM) to 12-hour display
 * @param time - Time string like "18:00" or "18:00:00"
 * @returns Formatted like "6:00 PM"
 */
export function formatTime(time: string): string {
  const [hours, minutes] = time.split(':').map(Number)
  const period = hours >= 12 ? 'PM' : 'AM'
  const displayHours = hours % 12 || 12
  return `${displayHours}:${String(minutes).padStart(2, '0')} ${period}`
}

/**
 * Format duration in minutes to human-readable
 * @param minutes - Duration in minutes
 * @returns Formatted like "1 hr" or "2 hrs"
 */
export function formatDuration(minutes: number): string {
  const hours = minutes / 60
  if (hours === 1) return '1 hr'
  return `${hours} hrs`
}

/**
 * Format date string to display format
 * @param dateStr - ISO date string or YYYY-MM-DD
 * @returns Formatted like "24 Jul 2026"
 */
export function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

/**
 * Format date to short format
 * @param dateStr - ISO date string
 * @returns Formatted like "24 Jul"
 */
export function formatDateShort(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
  })
}
