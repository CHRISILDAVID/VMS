import React, { useRef } from 'react';
import { View, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { Court, Booking, MembershipSlot } from '@vms/shared/types';
import { TimeHeader } from './TimeHeader';
import { CourtRow, COURT_LABEL_WIDTH } from './CourtRow';
import { generateTimeSlots, mapCourtsToGrid, ProcessedSlot } from '../utils/scheduleHelpers';

interface TimelineGridProps {
  courts: Court[];
  bookings: Booking[];
  memberships: MembershipSlot[];
  dateStr: string;
  onSlotPress: (slot: ProcessedSlot, court: Court) => void;
}

const SLOT_WIDTH = 80;

export function TimelineGrid({ courts, bookings, memberships, dateStr, onSlotPress }: TimelineGridProps) {
  const horizontalScrollRef = useRef<ScrollView>(null);
  
  // 6AM to 10PM
  const timeSlots = generateTimeSlots(6, 22);
  const gridData = mapCourtsToGrid(courts, bookings, memberships, dateStr, timeSlots);

  return (
    <View style={styles.container}>
      <ScrollView horizontal ref={horizontalScrollRef} bounces={false}>
        <View>
          <TimeHeader timeSlots={timeSlots} slotWidth={SLOT_WIDTH} />
          
          <ScrollView bounces={false} style={styles.rowsContainer}>
            {gridData.map(({ court, slots }) => (
              <CourtRow
                key={court.id}
                court={court}
                slots={slots}
                slotWidth={SLOT_WIDTH}
                onSlotPress={onSlotPress}
              />
            ))}
          </ScrollView>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  rowsContainer: {
    flex: 1,
  },
});
