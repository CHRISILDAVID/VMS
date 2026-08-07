import React from 'react';
import { View, Text, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { Eye, ToggleLeft, ToggleRight, Edit2, Trash2, Plus } from 'lucide-react-native';
import { MembershipSlotWithDetails } from '@vms/shared/services';
import { useDeleteSlot, useToggleOpenSlot } from '../hooks/useMemberships';
import { useVoidPaymentsForSlot } from '../../payments/hooks/usePayments';
import { useThemeColors } from '../../../hooks/useThemeColors';

import { formatCurrency } from '@vms/shared/utils';

interface SlotsTabProps {
  slots: MembershipSlotWithDetails[];
  onViewMembers: (slot: MembershipSlotWithDetails) => void;
  onEditSlot: (slot: MembershipSlotWithDetails) => void;
  onCreateSlot: () => void;
}

const skillClasses: Record<string, { bgClass: string; textClass: string; textColor: string }> = {
  beginner: { bgClass: 'bg-green-100 dark:bg-green-900/40', textClass: 'text-green-600', textColor: '#16A34A' },
  intermediate: { bgClass: 'bg-blue-100 dark:bg-blue-900/40', textClass: 'text-blue-600', textColor: '#2563EB' },
  advanced: { bgClass: 'bg-violet-100 dark:bg-violet-900/40', textClass: 'text-violet-600', textColor: '#7C3AED' },
  recreational: { bgClass: 'bg-amber-100 dark:bg-amber-900/40', textClass: 'text-amber-600', textColor: '#D97706' },
  Beginner: { bgClass: 'bg-green-100 dark:bg-green-900/40', textClass: 'text-green-600', textColor: '#16A34A' },
  Intermediate: { bgClass: 'bg-blue-100 dark:bg-blue-900/40', textClass: 'text-blue-600', textColor: '#2563EB' },
  Advanced: { bgClass: 'bg-violet-100 dark:bg-violet-900/40', textClass: 'text-violet-600', textColor: '#7C3AED' },
  Recreational: { bgClass: 'bg-amber-100 dark:bg-amber-900/40', textClass: 'text-amber-600', textColor: '#D97706' },
};

const dayNames: Record<string, string> = {
  mon: 'Mon',
  tue: 'Tue',
  wed: 'Wed',
  thu: 'Thu',
  fri: 'Fri',
  sat: 'Sat',
  sun: 'Sun',
  monday: 'Mon',
  tuesday: 'Tue',
  wednesday: 'Wed',
  thursday: 'Thu',
  friday: 'Fri',
  saturday: 'Sat',
  sunday: 'Sun',
};

function formatDays(days?: string[]): string {
  if (!days || days.length === 0) return 'No days set';
  if (days.length === 7) return 'Everyday';
  return days.map(d => dayNames[d.toLowerCase()] || d).join(', ');
}

function formatTime(time?: string): string {
  if (!time) return '';
  return time.slice(0, 5);
}

export function SlotsTab({ slots, onViewMembers, onEditSlot, onCreateSlot }: SlotsTabProps) {
  const deleteMutation = useDeleteSlot();
  const toggleMutation = useToggleOpenSlot();
  const voidMutation = useVoidPaymentsForSlot();
  const { colors } = useThemeColors();

  const handleDelete = (slot: MembershipSlotWithDetails) => {
    Alert.alert(
      'Delete Slot',
      `Are you sure you want to delete "${slot.name}"? This cannot be undone.\n\nWhat would you like to do with any unpaid dues from members in this slot?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Keep Dues & Delete',
          style: 'destructive',
          onPress: () => deleteMutation.mutate(slot.id),
        },
        {
          text: 'Void Dues & Delete',
          style: 'destructive',
          onPress: () => {
            voidMutation.mutate(slot.id, {
              onSuccess: () => deleteMutation.mutate(slot.id),
            });
          },
        },
      ]
    );
  };

  const handleToggle = (slot: MembershipSlotWithDetails) => {
    toggleMutation.mutate({ slotId: slot.id, isRecruiting: !slot.is_recruiting });
  };

  if (slots.length === 0) {
    return (
      <View className="p-8 items-center justify-center">
        <Text className="text-lg font-bold text-foreground mb-2">No Membership Slots</Text>
        <Text className="text-sm text-muted-foreground text-center mb-5 leading-5">Create your first membership batch or training slot to start enrolling members.</Text>
        <TouchableOpacity className="flex-row items-center gap-1.5 bg-primary px-5 py-3 rounded-xl" onPress={onCreateSlot}>
          <Plus size={16} color="#fff" />
          <Text className="text-sm font-bold text-white">Create Slot</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={{ padding: 16, gap: 12 }}>
      {slots.map(s => {
        const sc = skillClasses[s.skill_level] ?? { bgClass: 'bg-muted', textClass: 'text-muted-foreground', textColor: '#64748B' };
        const activeCount = s.active_count || 0;
        const vacant = s.capacity - activeCount;
        const isOpen = s.is_recruiting;
        const progressWidth = Math.min((activeCount / Math.max(s.capacity, 1)) * 100, 100);

        return (
          <TouchableOpacity key={s.id} className="bg-card rounded-2xl p-4 border border-border mb-3" onPress={() => onViewMembers(s)} activeOpacity={0.7}>
            {/* Top Row */}
            <View className="flex-row justify-between items-start mb-3">
              <View className="flex-1 pr-2">
                <View className="flex-row items-center gap-2">
                  <Text className="text-base font-extrabold text-foreground">{s.name}</Text>
                  <View className={`px-2 py-0.5 rounded-full ${isOpen ? 'bg-green-100 dark:bg-green-900/40' : 'bg-muted'}`}>
                    <Text className={`text-[10px] font-bold ${isOpen ? 'text-green-600' : 'text-muted-foreground'}`}>
                      {isOpen ? 'OPEN' : 'CLOSED'}
                    </Text>
                  </View>
                </View>
                <Text className="text-xs text-muted-foreground mt-1">
                  {formatDays(s.playing_days)} · {formatTime(s.start_time)} – {formatTime(s.end_time)}
                </Text>
              </View>
              <View className="items-end">
                <Text className="text-base font-extrabold text-primary">
                  {formatCurrency(s.monthly_fee)}
                  <Text className="text-[11px] font-semibold text-muted-foreground">/mo</Text>
                </Text>
                <View className={`px-2 py-0.5 rounded-full mt-1 ${sc.bgClass}`}>
                  <Text className={`text-[10px] font-bold ${sc.textClass}`}>
                    {s.skill_level ? s.skill_level.charAt(0).toUpperCase() + s.skill_level.slice(1) : 'General'}
                  </Text>
                </View>
              </View>
            </View>

            {/* Capacity bar */}
            <View className="mb-3.5">
              <View className="flex-row justify-between mb-1.5">
                <Text className="text-xs font-semibold text-muted-foreground">{activeCount}/{s.capacity} members</Text>
                <Text className={`text-xs font-bold ${vacant > 0 ? 'text-green-600' : 'text-destructive'}`}>
                  {vacant > 0 ? `${vacant} vacanc${vacant === 1 ? 'y' : 'ies'}` : 'Full'}
                </Text>
              </View>
              <View className="h-1.5 bg-muted rounded-full overflow-hidden">
                <View
                  style={{
                    height: '100%',
                    borderRadius: 3,
                    width: `${progressWidth}%`,
                    backgroundColor: activeCount >= s.capacity ? colors.destructive : colors.primary,
                  }}
                />
              </View>
            </View>

            {/* Actions */}
            <View className="flex-row gap-2 items-center">
              <TouchableOpacity className="flex-1 flex-row items-center justify-center gap-1.5 py-2.5 bg-primary/10 border border-primary/20 rounded-xl" onPress={() => onViewMembers(s)}>
                <Eye size={14} color={colors.primary} />
                <Text className="text-[13px] font-bold text-primary">Members ({activeCount})</Text>
              </TouchableOpacity>

              <TouchableOpacity
                className={`w-[38px] h-[38px] rounded-xl border items-center justify-center ${isOpen ? 'bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-800' : 'bg-green-50 dark:bg-green-900/30 border-green-200 dark:border-green-800'}`}
                onPress={() => handleToggle(s)}
              >
                {isOpen ? <ToggleRight size={18} color="#DC2626" /> : <ToggleLeft size={18} color="#16A34A" />}
              </TouchableOpacity>

              <TouchableOpacity className="w-[38px] h-[38px] rounded-xl bg-muted border border-border items-center justify-center" onPress={() => onEditSlot(s)}>
                <Edit2 size={15} color={colors.mutedForeground} />
              </TouchableOpacity>

              <TouchableOpacity className="w-[38px] h-[38px] rounded-xl bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 items-center justify-center" onPress={() => handleDelete(s)}>
                <Trash2 size={15} color="#DC2626" />
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}
