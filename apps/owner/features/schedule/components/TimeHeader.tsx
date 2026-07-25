import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '@vms/shared/utils';
import { COURT_LABEL_WIDTH } from './CourtRow';

interface TimeHeaderProps {
  timeSlots: string[];
  slotWidth: number;
}

export function TimeHeader({ timeSlots, slotWidth }: TimeHeaderProps) {
  return (
    <View style={styles.container}>
      {/* Empty corner for court label column */}
      <View style={[styles.corner, { width: COURT_LABEL_WIDTH }]} />
      
      {/* Time labels */}
      <View style={styles.timesContainer}>
        {timeSlots.map((time, index) => {
          // Only show label on the hour (e.g. 06:00, not 06:30) to save space, or show all if slot is wide enough
          const isHour = time.endsWith(':00');
          const formattedTime = time.startsWith('0') ? time.substring(1) : time; // 06:00 -> 6:00
          
          return (
            <View 
              key={time} 
              style={[
                styles.timeHeaderCell, 
                { width: slotWidth }
              ]}
            >
              {isHour && (
                <Text style={styles.timeText}>{formattedTime}</Text>
              )}
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    height: 36,
  },
  corner: {
    borderRightWidth: 1,
    borderRightColor: COLORS.border,
    backgroundColor: COLORS.surface,
    zIndex: 3,
  },
  timesContainer: {
    flexDirection: 'row',
  },
  timeHeaderCell: {
    height: '100%',
    justifyContent: 'flex-end',
    borderLeftWidth: 1,
    borderLeftColor: COLORS.border,
  },
  timeText: {
    fontSize: 12,
    fontWeight: '400',
    color: COLORS.textSecondary,
    position: 'absolute',
    left: 4,
    bottom: 4,
  },
});
