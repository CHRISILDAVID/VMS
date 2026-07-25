import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Court } from '@vms/shared/types';
import { ProcessedSlot } from '../utils/scheduleHelpers';
import { TimeSlot } from './TimeSlot';
import { COLORS } from '@vms/shared/utils';

interface CourtRowProps {
  court: Court;
  slots: ProcessedSlot[];
  slotWidth: number;
  onSlotPress: (slot: ProcessedSlot, court: Court) => void;
}

export const COURT_LABEL_WIDTH = 80;

export function CourtRow({ court, slots, slotWidth, onSlotPress }: CourtRowProps) {
  return (
    <View style={styles.container}>
      {/* Sticky Court Label */}
      <View style={[styles.courtLabelContainer, { width: COURT_LABEL_WIDTH }]}>
        <Text style={styles.courtName} numberOfLines={2}>
          {court.name}
        </Text>
      </View>
      
      {/* Slots */}
      <View style={styles.slotsContainer}>
        {slots.map((slot, index) => (
          <TimeSlot
            key={`${court.id}-${slot.time}-${index}`}
            slot={slot}
            width={slotWidth}
            onPress={() => onSlotPress(slot, court)}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  courtLabelContainer: {
    justifyContent: 'center',
    paddingHorizontal: 8,
    backgroundColor: COLORS.surface, // To cover slots if it scrolls under (though we'll use sticky headers in grid)
    zIndex: 2,
    borderRightWidth: 1,
    borderRightColor: COLORS.border,
  },
  courtName: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  slotsContainer: {
    flexDirection: 'row',
  },
});
