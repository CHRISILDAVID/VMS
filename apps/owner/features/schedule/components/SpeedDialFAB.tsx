import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Plus, X, CalendarPlus, Ban, Trophy, GraduationCap } from 'lucide-react-native';
import { useThemeColors } from '../../../hooks/useThemeColors';

interface SpeedDialFABProps {
  onPressItem?: (action: string) => void;
}

export function SpeedDialFAB({ onPressItem }: SpeedDialFABProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { colors } = useThemeColors();

  const actions = [
    { id: 'booking', icon: CalendarPlus, label: 'New Booking', color: '#2563EB' },
    { id: 'block', icon: Ban, label: 'Block Slot', color: '#DC2626' },
    { id: 'tournament', icon: Trophy, label: 'Tournament', color: '#7C3AED' },
    { id: 'coaching', icon: GraduationCap, label: 'Coaching', color: '#D97706' },
    { id: 'membership', icon: CalendarPlus, label: 'Membership', color: '#16A34A' },
  ];

  const handlePress = (id: string) => {
    setIsOpen(false);
    onPressItem?.(id);
  };

  return (
    <View className="absolute bottom-6 right-6 z-50 items-end">
      {isOpen && (
        <View className="mb-4 items-end">
          <View className="gap-4 items-end">
            {actions.map((action) => {
              const Icon = action.icon;
              return (
                <View key={action.id} className="flex-row items-center gap-3">
                  <View className="bg-card px-3 py-2 rounded-full shadow-sm">
                    <Text className="text-sm font-semibold text-foreground">{action.label}</Text>
                  </View>
                  <TouchableOpacity
                    style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: action.color, justifyContent: 'center', alignItems: 'center', elevation: 4 }}
                    onPress={() => handlePress(action.id)}
                  >
                    <Icon size={20} color="#fff" />
                  </TouchableOpacity>
                </View>
              );
            })}
          </View>
        </View>
      )}

      <TouchableOpacity
        className={`w-16 h-16 rounded-full justify-center items-center shadow-lg ${isOpen ? 'bg-blue-500' : 'bg-primary'}`}
        onPress={() => setIsOpen(!isOpen)}
        activeOpacity={0.8}
      >
        {isOpen ? (
          <X size={24} color="#fff" />
        ) : (
          <Plus size={24} color="#fff" />
        )}
      </TouchableOpacity>
    </View>
  );
}
