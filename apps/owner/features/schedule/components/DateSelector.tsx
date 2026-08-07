import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { format, addDays, startOfWeek, isSameDay } from 'date-fns';
import { useThemeColors } from '../../../hooks/useThemeColors';

interface DateSelectorProps {
  selectedDate: string; // 'yyyy-MM-dd'
  onDateChange: (date: string) => void;
}

export function DateSelector({ selectedDate, onDateChange }: DateSelectorProps) {
  const selectedDateObj = new Date(selectedDate);
  const today = new Date();
  const { colors } = useThemeColors();
  
  // Start week from Monday
  const weekStart = startOfWeek(selectedDateObj, { weekStartsOn: 1 });
  
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    return addDays(weekStart, i);
  });

  return (
    <View className="flex-row px-4 pb-3 bg-card border-b border-border gap-1">
      {weekDays.map((date, i) => {
        const isSelected = isSameDay(date, selectedDateObj);
        const isToday = isSameDay(date, today);
        
        return (
          <TouchableOpacity
            key={i}
            onPress={() => onDateChange(format(date, 'yyyy-MM-dd'))}
            className={`flex-1 items-center py-2 rounded-xl ${isSelected ? 'bg-primary' : 'bg-transparent'}`}
          >
            <Text
              className={`text-[10px] font-semibold ${isSelected ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}
            >
              {format(date, 'EEE')}
            </Text>
            
            <Text
              style={{
                fontSize: 15,
                fontWeight: '700',
                marginTop: 2,
                color: isSelected ? '#fff' : isToday ? colors.primary : colors.foreground,
              }}
            >
              {format(date, 'd')}
            </Text>
            
            {isToday && !isSelected && <View className="w-1 h-1 rounded-full bg-primary mt-0.5" />}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
