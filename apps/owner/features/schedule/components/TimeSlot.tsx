import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { ProcessedSlot } from '../utils/scheduleHelpers';
import { COLORS } from '@vms/shared/utils';

interface TimeSlotProps {
  slot: ProcessedSlot;
  onPress: () => void;
  width: number;
}

export function TimeSlot({ slot, onPress, width }: TimeSlotProps) {
  const getSlotColor = () => {
    switch (slot.status) {
      case 'available': return COLORS.success; // Green
      case 'booked': return COLORS.primary; // Blue
      case 'coaching': return COLORS.warning; // Yellow
      case 'tournament': return '#9333ea'; // Purple
      case 'maintenance': return COLORS.textMuted; // Grey
      case 'blocked': return COLORS.danger; // Red
      case 'membership': return '#0d9488'; // Teal
      default: return COLORS.border;
    }
  };

  const getSlotLabel = () => {
    if (slot.status === 'booked') {
      return 'Booked';
    }
    return slot.label || '';
  };

  return (
    <TouchableOpacity 
      style={[
        styles.container, 
        { width, backgroundColor: getSlotColor() },
        slot.isPast && styles.pastSlot
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {slot.status !== 'available' && (
        <Text style={styles.label} numberOfLines={1}>
          {getSlotLabel()}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 64,
    justifyContent: 'center',
    paddingHorizontal: 4,
    borderRightWidth: 1,
    borderRightColor: COLORS.border,
  },
  pastSlot: {
    opacity: 0.5,
  },
  label: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '600',
    textAlign: 'center',
  },
});
