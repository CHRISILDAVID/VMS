import { Booking, MembershipSlot, Court } from '@vms/shared/types';
import { format, parse, isAfter, isBefore, isEqual, addMinutes, startOfDay, isToday, differenceInMinutes, parseISO } from 'date-fns';

export const HOUR_WIDTH = 80;
export const COURT_LABEL_WIDTH = 72;
export const START_HOUR = 6;
export const END_HOUR = 23;
export const HEADER_HEIGHT = 32;
export const ROW_HEIGHT = 64;

export const slotConfig: Record<string, { bg: string; border: string; text: string }> = {
  booked: { bg: '#EFF6FF', border: '#93C5FD', text: '#1D4ED8' },
  coaching: { bg: '#FFFBEB', border: '#FCD34D', text: '#92400E' },
  tournament: { bg: '#F5F3FF', border: '#C4B5FD', text: '#5B21B6' },
  blocked: { bg: '#FEF2F2', border: '#FCA5A5', text: '#991B1B' },
  membership: { bg: '#F0FDF4', border: '#86EFAC', text: '#15803D' },
};

export type SlotStatus = 'available' | 'booked' | 'coaching' | 'tournament' | 'blocked' | 'membership';

export interface ProcessedSlot {
  time: string; // HH:mm format
  status: SlotStatus;
  label?: string;
  booking?: Booking;
  membership?: MembershipSlot;
  isPast: boolean;
}

// Updated mapping to match Figma's absolute positioned blocks
export function processBookingsToBlocks(
  court: Court,
  dateStr: string,
  bookings: Booking[],
  memberships: MembershipSlot[]
): (ProcessedSlot & { startHour: number; duration: number; label: string; endTime: string; courtId: string })[] {
  const blocks: any[] = [];

  const courtBookings = bookings.filter((b) => b.court_id === court.id);
  const courtMemberships = memberships.filter((m) => !m.court_id || m.court_id === court.id);

  const addBlock = (startTime: string, endTime: string, status: SlotStatus, label: string, data?: any) => {
    // Parse time strings (e.g. "06:00:00")
    const startObj = parse(startTime, 'HH:mm:ss', new Date());
    const endObj = parse(endTime, 'HH:mm:ss', new Date());
    
    const startHour = startObj.getHours() + startObj.getMinutes() / 60;
    const endHour = endObj.getHours() + endObj.getMinutes() / 60;
    
    // Skip if outside our display range
    if (endHour <= START_HOUR || startHour >= END_HOUR) return;
    
    // Clamp to boundaries
    const clampedStart = Math.max(startHour, START_HOUR);
    const clampedEnd = Math.min(endHour, END_HOUR);
    const duration = clampedEnd - clampedStart;

    blocks.push({
      courtId: court.id,
      time: startTime,
      endTime: endTime,
      status,
      isPast: isSlotPast(endTime.substring(0, 5), dateStr),
      booking: status === 'membership' ? undefined : data,
      membership: status === 'membership' ? data : undefined,
      // Pass these directly for UI rendering
      startHour: clampedStart,
      duration,
      label
    });
  };

  courtBookings.forEach((b) => {
    let status: SlotStatus = 'booked';
    if (b.notes?.includes('[COACHING]')) status = 'coaching';
    if (b.notes?.includes('[TOURNAMENT]')) status = 'tournament';
    if (b.notes?.includes('[BLOCKED]')) status = 'blocked';
    
    // For M1, we don't have joined customer info in the booking type yet.
    const label = (b as any).customer_name || 'Booked';
    addBlock(b.start_time, b.end_time, status, label, b);
  });

  courtMemberships.forEach((m) => {
    addBlock(m.start_time, m.end_time, 'membership', m.name || 'Membership', m);
  });

  return blocks;
}

// Generate time slots from 6 AM to 10 PM in 30-min increments
export function generateTimeSlots(startHour = 6, endHour = 22): string[] {
  const slots: string[] = [];
  let current = startOfDay(new Date());
  current.setHours(startHour, 0, 0, 0);
  
  const end = startOfDay(new Date());
  end.setHours(endHour, 0, 0, 0);

  while (isBefore(current, end) || isEqual(current, end)) {
    slots.push(format(current, 'HH:mm'));
    current = addMinutes(current, 30);
  }
  
  return slots;
}

export function getSlotStatus(
  timeStr: string,
  courtId: string,
  bookings: Booking[],
  memberships: MembershipSlot[],
  dateStr: string
): { status: SlotStatus; label?: string; booking?: Booking; membership?: MembershipSlot } {
  // Check bookings
  const booking = bookings.find(b => {
    // Basic check: is the court included and does the time fall within the booking range?
    if (b.court_id !== courtId) return false;
    
    // Booking start_time is like "09:00:00"
    const bStart = b.start_time.substring(0, 5);
    const bEnd = b.end_time.substring(0, 5);
    
    return timeStr >= bStart && timeStr < bEnd;
  });

  if (booking) {
    let status: SlotStatus = 'booked';
    // M0 schema status enum includes: pending, confirmed, cancelled, completed
    // We could map these or just use 'booked' for the UI and handle colors based on booking type
    
    // Actually the status coloring usually depends on the booking "source" or specific flags
    // The spec says: Green=Available, Blue=Booked, Yellow=Coaching, Purple=Tournament, Red=Blocked, Teal=Membership
    
    if (booking.notes?.includes('[COACHING]')) status = 'coaching';
    if (booking.notes?.includes('[TOURNAMENT]')) status = 'tournament';
    if (booking.notes?.includes('[BLOCKED]')) status = 'blocked';
    
    return { status, label: 'Booked', booking };
  }

  // Check memberships
  const membership = memberships.find(m => {
    if (m.court_id && m.court_id !== courtId) return false;
    const mStart = m.start_time.substring(0, 5);
    const mEnd = m.end_time.substring(0, 5);
    return timeStr >= mStart && timeStr < mEnd;
  });

  if (membership) {
    return { status: 'membership', label: membership.name || 'Membership', membership };
  }

  return { status: 'available' };
}

export function isSlotPast(timeStr: string, dateStr: string): boolean {
  const date = parse(dateStr, 'yyyy-MM-dd', new Date());
  if (!isToday(date)) {
    return isBefore(date, startOfDay(new Date()));
  }
  
  const [hours, minutes] = timeStr.split(':').map(Number);
  const slotTime = new Date();
  slotTime.setHours(hours, minutes, 0, 0);
  
  return isBefore(slotTime, new Date());
}

export function isHourPast(hour: number, dateStr: string): boolean {
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];
  if (dateStr < todayStr) return true;
  if (dateStr > todayStr) return false;
  return hour < today.getHours();
}

export function mapCourtsToGrid(
  courts: Court[],
  bookings: Booking[],
  memberships: MembershipSlot[],
  dateStr: string,
  timeSlots: string[]
) {
  return courts.map(court => {
    const slots = timeSlots.map(time => {
      const { status, label, booking, membership } = getSlotStatus(time, court.id, bookings, memberships, dateStr);
      return {
        time,
        status,
        label,
        booking,
        membership,
        isPast: isSlotPast(time, dateStr)
      } as ProcessedSlot;
    });
    
    return {
      court,
      slots
    };
  });
}
