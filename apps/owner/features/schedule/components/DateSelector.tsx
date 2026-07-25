import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { format, addDays, startOfWeek, isSameDay } from 'date-fns';
import { COLORS, SPACING, RADIUS } from '@vms/shared/utils';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';

interface DateSelectorProps {
  selectedDate: string; // yyyy-MM-dd
  onDateChange: (date: string) => void;
}

export function DateSelector({ selectedDate, onDateChange }: DateSelectorProps) {
  const [currentWeekStart, setCurrentWeekStart] = useState(() => 
    startOfWeek(new Date(selectedDate), { weekStartsOn: 1 }) // Monday start
  );

  const selectedDateObj = new Date(selectedDate);
  const today = new Date();

  const handlePrevWeek = () => setCurrentWeekStart(addDays(currentWeekStart, -7));
  const handleNextWeek = () => setCurrentWeekStart(addDays(currentWeekStart, 7));

  const weekDays = Array.from({ length: 7 }).map((_, i) => addDays(currentWeekStart, i));

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handlePrevWeek} style={styles.navButton}>
          <ChevronLeft size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.monthLabel}>
          {format(currentWeekStart, 'MMMM yyyy')}
        </Text>
        <TouchableOpacity onPress={handleNextWeek} style={styles.navButton}>
          <ChevronRight size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
      </View>

      <View style={styles.daysContainer}>
        {weekDays.map((date) => {
          const isSelected = isSameDay(date, selectedDateObj);
          const isCurrentToday = isSameDay(date, today);

          return (
            <TouchableOpacity
              key={date.toISOString()}
              style={[
                styles.dayButton,
                isSelected && styles.dayButtonSelected,
              ]}
              onPress={() => onDateChange(format(date, 'yyyy-MM-dd'))}
            >
              <Text style={[
                styles.dayName,
                isSelected && styles.textSelected,
              ]}>
                {format(date, 'EEE')}
              </Text>
              <View style={[
                styles.dateCircle,
                isCurrentToday && !isSelected && styles.dateCircleToday,
              ]}>
                <Text style={[
                  styles.dayNumber,
                  isSelected && styles.textSelected,
                  isCurrentToday && !isSelected && styles.textToday,
                ]}>
                  {format(date, 'd')}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.surface,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
  },
  navButton: {
    padding: SPACING.xs,
  },
  monthLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  daysContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
  },
  dayButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.sm,
    width: 44,
    borderRadius: RADIUS.lg,
  },
  dayButtonSelected: {
    backgroundColor: COLORS.primary,
  },
  dayName: {
    fontSize: 12,
    fontWeight: '400',
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  dateCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateCircleToday: {
    backgroundColor: 'rgba(239,68,68,0.1)', // Light red
  },
  dayNumber: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  textSelected: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  textToday: {
    color: COLORS.danger,
    fontWeight: '700',
  },
});
