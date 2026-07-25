import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { format, addDays, startOfWeek, isSameDay } from 'date-fns';
import { COLORS } from '@vms/shared/utils';

interface DateSelectorProps {
  selectedDate: string; // 'yyyy-MM-dd'
  onDateChange: (date: string) => void;
}

export function DateSelector({ selectedDate, onDateChange }: DateSelectorProps) {
  const selectedDateObj = new Date(selectedDate);
  const today = new Date();
  
  // Start week from Monday
  const weekStart = startOfWeek(selectedDateObj, { weekStartsOn: 1 });
  
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    return addDays(weekStart, i);
  });

  return (
    <View style={styles.container}>
      {weekDays.map((date, i) => {
        const isSelected = isSameDay(date, selectedDateObj);
        const isToday = isSameDay(date, today);
        
        return (
          <TouchableOpacity
            key={i}
            onPress={() => onDateChange(format(date, 'yyyy-MM-dd'))}
            style={[
              styles.dayButton,
              isSelected && styles.dayButtonSelected,
            ]}
          >
            <Text style={[
              styles.dayName,
              isSelected ? styles.textSelectedLight : styles.textUnselected
            ]}>
              {format(date, 'EEE')}
            </Text>
            
            <Text style={[
              styles.dayNumber,
              isSelected ? styles.textSelected : isToday ? styles.textToday : styles.textPrimary
            ]}>
              {format(date, 'd')}
            </Text>
            
            {isToday && !isSelected && <View style={styles.todayDot} />}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    gap: 4,
  },
  dayButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: 'transparent',
  },
  dayButtonSelected: {
    backgroundColor: '#2563EB',
  },
  dayName: {
    fontSize: 10,
    fontWeight: '600',
  },
  textUnselected: {
    color: '#64748B',
  },
  textSelectedLight: {
    color: 'rgba(255,255,255,0.8)',
  },
  dayNumber: {
    fontSize: 15,
    fontWeight: '700',
    marginTop: 2,
  },
  textPrimary: {
    color: '#0F172A',
  },
  textSelected: {
    color: '#fff',
  },
  textToday: {
    color: '#2563EB',
  },
  todayDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#2563EB',
    marginTop: 2,
  },
});
