import React, { forwardRef, useMemo } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import BottomSheet, { BottomSheetBackdrop } from '@gorhom/bottom-sheet';
import { Court } from '@vms/shared/types';
import { Eye, Pencil, CalendarPlus, Ban, Trophy, GraduationCap, X, Users, Unlock } from 'lucide-react-native';
import { isHourPast } from '../utils/scheduleHelpers';
import { useThemeColors } from '../../../hooks/useThemeColors';

interface SlotBottomSheetProps {
  slot: any | null;
  court: Court | null;
  hour: number | null;
  dateStr?: string;
  onClose: () => void;
  onActionPress?: (actionLabel: string, slot: any | null, court: Court, hour: number) => void;
}

export const SlotBottomSheet = forwardRef<BottomSheet, SlotBottomSheetProps>(
  ({ slot, court, hour, dateStr, onClose, onActionPress }, ref) => {
    const snapPoints = useMemo(() => ['50%', '75%'], []);
    const { colors } = useThemeColors();

    const isPast = useMemo(() => {
      if (slot && slot.isPast !== undefined) return slot.isPast;
      if (hour !== null && dateStr) return isHourPast(hour, dateStr);
      return false;
    }, [slot, hour, dateStr]);

    const actions = useMemo(() => {
      if (isPast) {
        if (slot) {
          if (slot.status === 'membership') {
            return [{ icon: Users, label: 'View Membership', color: '#15803D' }];
          }
          return [{ icon: Eye, label: 'View Booking', color: colors.primary }];
        }
        return [];
      }
      if (slot) {
        if (slot.status === 'membership') {
          return [
            { icon: Users, label: 'View Membership', color: '#15803D' },
            { icon: Unlock, label: 'Release Slot', color: '#DC2626' },
          ];
        }
        if (slot.status === 'blocked') {
          return [
            { icon: Unlock, label: 'Unblock Slot', color: '#DC2626' },
          ];
        }
        return [
          { icon: Eye, label: 'View Booking', color: colors.primary },
          { icon: Pencil, label: 'Edit Booking', color: colors.foreground },
          { icon: CalendarPlus, label: 'New Booking', color: '#16A34A' },
          { icon: Ban, label: 'Block Slot', color: '#DC2626' },
          { icon: Trophy, label: 'Tournament', color: '#7C3AED' },
          { icon: GraduationCap, label: 'Coaching', color: '#D97706' },
        ];
      }
      return [
        { icon: CalendarPlus, label: 'New Booking', color: colors.primary },
        { icon: Ban, label: 'Block Slot', color: '#DC2626' },
        { icon: Trophy, label: 'Tournament', color: '#7C3AED' },
        { icon: GraduationCap, label: 'Coaching', color: '#D97706' },
      ];
    }, [slot, isPast, colors]);

    return (
      <BottomSheet
        ref={ref}
        index={-1}
        snapPoints={snapPoints}
        enableDynamicSizing={false}
        enablePanDownToClose
        onClose={onClose}
        backdropComponent={(props) => (
          <BottomSheetBackdrop {...props} appearsOnIndex={0} disappearsOnIndex={-1} />
        )}
        backgroundStyle={{ backgroundColor: colors.card, borderRadius: 24 }}
        handleIndicatorStyle={{ width: 36, height: 4, backgroundColor: colors.border, marginTop: 8 }}
      >
        <View className="flex-1">
          <View className="flex-row items-center justify-between px-6 py-3 border-b border-border">
            <View>
              <Text className="text-base font-bold text-foreground">
                {court ? court.name : 'Select Court'} · {hour !== null ? `${hour}:00` : ''}
              </Text>
              {slot && (
                <Text className="text-[13px] text-muted-foreground mt-0.5">
                  {slot.label} · {slot.duration}h
                </Text>
              )}
            </View>
            <TouchableOpacity onPress={onClose} className="w-8 h-8 rounded-full bg-muted items-center justify-center">
              <X size={16} color={colors.mutedForeground} />
            </TouchableOpacity>
          </View>

          <View className="p-4">
            {actions.length === 0 ? (
              <View className="py-6 items-center justify-center">
                <Text className="text-sm text-muted-foreground text-center">Past time slots cannot be modified or booked.</Text>
              </View>
            ) : (
              actions.map((action, i) => {
                const Icon = action.icon;
                return (
                  <TouchableOpacity 
                    key={i} 
                    className="flex-row items-center gap-3.5 py-2 px-2 rounded-xl mb-1"
                    onPress={() => {
                      onClose();
                      if (court && hour !== null) {
                        onActionPress?.(action.label, slot, court, hour);
                      }
                    }}
                  >
                    <View className="w-10 h-10 rounded-xl bg-muted items-center justify-center">
                      <Icon size={18} color={action.color} />
                    </View>
                    <Text className="text-[15px] font-semibold text-foreground">{action.label}</Text>
                  </TouchableOpacity>
                );
              })
            )}
          </View>
        </View>
      </BottomSheet>
    );
  }
);

SlotBottomSheet.displayName = 'SlotBottomSheet';
