import React, { useMemo, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { format, parse, addMinutes, isSameDay } from 'date-fns';
import type { OccupiedSlot } from '@vms/shared/types';

interface SlotGridProps {
  /** Occupied bookings from DB */
  occupiedSlots: OccupiedSlot[];
  /** Currently selected slot start times e.g. ["09:00", "09:30"] */
  selectedSlots: string[];
  /** Called when a slot is tapped */
  onSlotToggle: (slotTime: string) => void;
  /** Time of day filter */
  timeOfDay?: 'all' | 'morning' | 'noon' | 'evening';
  /** Operating window */
  startHour?: number;
  endHour?: number;
  /** Currently selected date */
  selectedDate: Date;
}

const TIME_OF_DAY_RANGES = {
  all: { start: 0, end: 24 },
  morning: { start: 6, end: 12 },
  noon: { start: 12, end: 17 },
  evening: { start: 17, end: 24 },
};

function generateSlots(startHour: number, endHour: number): string[] {
  const slots: string[] = [];
  let current = new Date(2000, 0, 1, startHour, 0);
  const end = new Date(2000, 0, 1, endHour, 0);
  while (current < end) {
    slots.push(format(current, 'HH:mm'));
    current = addMinutes(current, 30);
  }
  return slots;
}

function isOccupied(slotTime: string, occupiedSlots: OccupiedSlot[], selectedDate: Date): boolean {
  const slotStart = parse(slotTime, 'HH:mm', new Date());
  const slotEnd = addMinutes(slotStart, 30);
  
  // Past time check
  const now = new Date();
  if (isSameDay(selectedDate, now)) {
    const [h, m] = slotTime.split(':').map(Number);
    const slotDate = new Date();
    slotDate.setHours(h, m, 0, 0);
    if (slotDate < now) {
      return true; // Mark past slots as occupied/disabled
    }
  }

  return occupiedSlots.some((occ) => {
    const occStart = parse(occ.start_time.slice(0, 5), 'HH:mm', new Date());
    const occEnd = parse(occ.end_time.slice(0, 5), 'HH:mm', new Date());
    return slotStart < occEnd && slotEnd > occStart;
  });
}

export function SlotGrid({
  occupiedSlots,
  selectedSlots,
  onSlotToggle,
  timeOfDay = 'all',
  startHour = 6,
  endHour = 24,
  selectedDate,
}: SlotGridProps) {
  const range = TIME_OF_DAY_RANGES[timeOfDay];
  const effectiveStart = Math.max(startHour, range.start);
  const effectiveEnd = Math.min(endHour, range.end);

  const slots = useMemo(
    () => generateSlots(effectiveStart, effectiveEnd),
    [effectiveStart, effectiveEnd]
  );

  // Group slots into columns of 2 for a horizontal 2-row layout
  const columns = useMemo(() => {
    const cols: string[][] = [];
    for (let i = 0; i < slots.length; i += 2) {
      cols.push(slots.slice(i, i + 2));
    }
    return cols;
  }, [slots]);

  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    if (!isSameDay(selectedDate, new Date())) {
      scrollViewRef.current?.scrollTo({ x: 0, animated: true });
      return;
    }

    const now = new Date();
    let currentH = now.getHours();
    let currentM = now.getMinutes() >= 30 ? 30 : 0;
    
    // Find the slot string that represents the current time bracket
    const currentTimeStr = `${String(currentH).padStart(2, '0')}:${String(currentM).padStart(2, '0')}`;
    
    const colIdx = columns.findIndex(col => col.includes(currentTimeStr));
    
    if (colIdx !== -1 && scrollViewRef.current) {
      // w-24 is 96, gap-2 is 8, so column width is roughly 104.
      const COL_WIDTH = 104; 
      const SCREEN_WIDTH = Dimensions.get('window').width;
      
      // We want to center it. 
      // X = (colIdx * COL_WIDTH) - (SCREEN_WIDTH / 2) + (COL_WIDTH / 2)
      let targetX = (colIdx * COL_WIDTH) - (SCREEN_WIDTH / 2) + (COL_WIDTH / 2);
      if (targetX < 0) targetX = 0;
      
      // Delay slightly to ensure layout has occurred
      setTimeout(() => {
        scrollViewRef.current?.scrollTo({ x: targetX, animated: true });
      }, 100);
    }
  }, [selectedDate, columns]);

  if (slots.length === 0) {
    return (
      <View className="items-center py-8">
        <Text className="text-muted-foreground text-sm">No slots in this time period</Text>
      </View>
    );
  }

  return (
    <ScrollView 
      horizontal 
      showsHorizontalScrollIndicator={false}
      ref={scrollViewRef}
    >
      <View className="flex-row gap-2 px-1 pb-2">
        {columns.map((col, colIdx) => (
          <View key={colIdx} className="gap-2">
            {col.map((slotTime) => {
              const booked = isOccupied(slotTime, occupiedSlots, selectedDate);
              const selected = selectedSlots.includes(slotTime);

              let containerClass = '';
              let textClass = '';

              if (booked) {
                containerClass = 'bg-slate-200 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 opacity-50 border-dashed';
                textClass = 'text-muted-foreground line-through';
              } else if (selected) {
                containerClass = 'bg-slate-900 dark:bg-white border border-slate-900 dark:border-white';
                textClass = 'text-white dark:text-slate-900 font-bold';
              } else {
                containerClass = 'bg-card border border-border';
                textClass = 'text-foreground font-medium';
              }

              return (
                <TouchableOpacity
                  key={slotTime}
                  className={`w-24 h-12 rounded-xl items-center justify-center ${containerClass}`}
                  onPress={() => !booked && onSlotToggle(slotTime)}
                  activeOpacity={booked ? 1 : 0.75}
                  disabled={booked}
                >
                  <Text className={`text-[13px] ${textClass}`}>{slotTime}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        ))}
      </View>
    </ScrollView>
  );
}
