import { Booking, MembershipSlot, Court } from '@vms/shared/types';
import { format, parse, isAfter, isBefore, isEqual, addMinutes, startOfDay, isToday } from 'date-fns';

export type SlotStatus = 'available' | 'booked' | 'coaching' | 'tournament' | 'maintenance' | 'blocked' | 'membership';

export interface ProcessedSlot {
  time: string; // HH:mm format
  status: SlotStatus;
  label?: string;
  booking?: Booking;
  membership?: MembershipSlot;
  isPast: boolean;
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
    // The spec says: Green=Available, Blue=Booked, Yellow=Coaching, Purple=Tournament, Grey=Maintenance, Red=Blocked, Teal=Membership
    
    if (booking.notes?.includes('[COACHING]')) status = 'coaching';
    if (booking.notes?.includes('[TOURNAMENT]')) status = 'tournament';
    if (booking.notes?.includes('[MAINTENANCE]')) status = 'maintenance';
    if (booking.notes?.includes('[BLOCKED]')) status = 'blocked';
    
    return { status, label: 'Booked', booking };
  }

  // Check memberships
  const membership = memberships.find(m => {
    if (m.court_id !== courtId) return false;
    const mStart = m.start_time.substring(0, 5);
    const mEnd = m.end_time.substring(0, 5);
    return timeStr >= mStart && timeStr < mEnd;
  });

  if (membership) {
    return { status: 'membership', label: 'Membership', membership };
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
