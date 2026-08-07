import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { ChevronRight, Users, ArrowRight } from 'lucide-react-native';
import { MembershipSlotWithDetails } from '@vms/shared/services';
import { formatCurrency } from '@vms/shared/utils';
import { useThemeColors } from '../../../hooks/useThemeColors';

export interface SlotStats {
  expectedAmount: number;
  collectedAmount: number;
  pendingAmount: number;
  totalMembers: number;
  paidMembers: number;
  pendingMembers: number;
}

interface SlotPaymentCardProps {
  slot: MembershipSlotWithDetails;
  stats?: SlotStats;
  onPress: () => void;
}

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
const formatDays = (days: string[]) => days.map(d => capitalize(d.slice(0, 3))).join(', ');
const formatTime = (time: string) => time.slice(0, 5); // "06:00:00" -> "06:00"

export function SlotPaymentCard({ slot, stats, onPress }: SlotPaymentCardProps) {
  const safeStats = stats || {
    expectedAmount: 0,
    collectedAmount: 0,
    pendingAmount: 0,
    totalMembers: 0,
    paidMembers: 0,
    pendingMembers: 0,
  };
  const { colors } = useThemeColors();

  const progressPercent = safeStats.expectedAmount > 0 
    ? (safeStats.collectedAmount / safeStats.expectedAmount) * 100 
    : 0;

  return (
    <View className="bg-card rounded-2xl p-4 mx-4 mb-4 border border-border shadow-sm">
      <View className="flex-row justify-between items-center mb-1">
        <Text className="text-base font-extrabold text-foreground">{slot.name}</Text>
        <View className="bg-primary/10 px-2.5 py-1 rounded-xl">
          <Text className="text-primary text-[11px] font-semibold">{capitalize(slot.skill_level)}</Text>
        </View>
      </View>
      
      <View className="flex-row justify-between items-center mb-4">
        <Text className="text-[13px] text-muted-foreground font-medium">
          {formatDays(slot.playing_days)} · {formatTime(slot.start_time)} – {formatTime(slot.end_time)}
        </Text>
        <Text className="text-xs text-muted-foreground font-medium">
          <Text className="text-[15px] font-extrabold text-blue-500">{formatCurrency(slot.monthly_fee)}</Text>
          /mo
        </Text>
      </View>

      <View className="flex-row gap-2 mb-4">
        <View className="flex-1 py-2 rounded-lg items-center bg-muted">
          <View className="flex-row items-center gap-1 mb-1">
            <Users size={14} color={colors.mutedForeground} />
            <Text className="text-sm font-extrabold text-foreground">{safeStats.totalMembers}</Text>
          </View>
          <Text className="text-[11px] font-semibold text-muted-foreground">Total</Text>
        </View>
        <View className="flex-1 py-2 rounded-lg items-center bg-green-50 dark:bg-green-900/20">
          <View className="flex-row items-center gap-1 mb-1">
            <Users size={14} color="#16A34A" />
            <Text className="text-sm font-extrabold text-green-600 dark:text-green-500">{safeStats.paidMembers}</Text>
          </View>
          <Text className="text-[11px] font-semibold text-green-600 dark:text-green-500">Paid</Text>
        </View>
        <View className="flex-1 py-2 rounded-lg items-center bg-red-50 dark:bg-red-900/20">
          <View className="flex-row items-center gap-1 mb-1">
            <Users size={14} color="#DC2626" />
            <Text className="text-sm font-extrabold text-destructive dark:text-red-500">{safeStats.pendingMembers}</Text>
          </View>
          <Text className="text-[11px] font-semibold text-destructive dark:text-red-500">Pending</Text>
        </View>
      </View>

      <View className="flex-row items-center justify-between mb-3">
        <View className="items-center">
          <Text className="text-[11px] text-muted-foreground font-semibold mb-1">Expected</Text>
          <Text className="text-[15px] font-extrabold text-foreground">{formatCurrency(safeStats.expectedAmount)}</Text>
        </View>
        <ArrowRight size={14} color={colors.mutedForeground} />
        <View className="items-center">
          <Text className="text-[11px] text-muted-foreground font-semibold mb-1">Collected</Text>
          <Text className="text-[15px] font-extrabold text-green-600 dark:text-green-500">{formatCurrency(safeStats.collectedAmount)}</Text>
        </View>
        <ArrowRight size={14} color={colors.mutedForeground} />
        <View className="items-center">
          <Text className="text-[11px] text-muted-foreground font-semibold mb-1">Pending</Text>
          <Text className="text-[15px] font-extrabold text-destructive dark:text-red-500">{formatCurrency(safeStats.pendingAmount)}</Text>
        </View>
      </View>

      <View className="mb-4">
        <View className="h-1.5 bg-muted rounded-full mb-1.5 overflow-hidden">
          <View className="h-full bg-primary rounded-full" style={{ width: `${progressPercent}%` }} />
        </View>
        <Text className="text-[11px] text-muted-foreground text-right font-medium">{Math.round(progressPercent)}% collected</Text>
      </View>

      <TouchableOpacity className="flex-row justify-center items-center py-3 border border-primary/20 rounded-lg bg-primary/10 gap-1" onPress={onPress}>
        <Text className="text-primary text-sm font-bold">View Payments</Text>
        <ChevronRight size={16} color={colors.primary} />
      </TouchableOpacity>
    </View>
  );
}
