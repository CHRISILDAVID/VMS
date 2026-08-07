import React from 'react';
import { View, Text } from 'react-native';
import { formatCurrency } from '@vms/shared/utils';
import { useVenuePaymentSummary } from '../hooks/usePayments';
import { TrendingUp, Clock } from 'lucide-react-native';
import { useThemeColors } from '../../../hooks/useThemeColors';

interface PaymentsDashboardProps {
  venueId?: string;
}

export function PaymentsDashboard({ venueId }: PaymentsDashboardProps) {
  const { data: summary, isLoading } = useVenuePaymentSummary(venueId);
  const { colors } = useThemeColors();

  if (isLoading) {
    return (
      <View className="px-4 py-3">
        <Text className="text-muted-foreground">Loading dashboard...</Text>
      </View>
    );
  }

  const totalCollected = summary?.totalCollected || 0;
  const pendingAmount = summary?.pendingAmount || 0;
  const paidMembersCount = summary?.paidMembersCount || 0;
  const dueMembersCount = summary?.dueMembersCount || 0;
  const overdueMembersCount = summary?.overdueMembersCount || 0;
  const totalMembersCount = summary?.totalMembersCount || 0;

  const monthName = new Date().toLocaleString('default', { month: 'long' }).toUpperCase();

  return (
    <View className="px-4 py-3 bg-background">
      {/* Top Green Card */}
      <View className="bg-green-600 dark:bg-green-700 rounded-2xl p-5 mb-4">
        <View className="flex-row items-center gap-4">
          <View className="bg-white/20 w-12 h-12 rounded-xl justify-center items-center">
            <TrendingUp size={24} color="#ffffff" />
          </View>
          <View>
            <Text className="text-white/80 text-xs font-bold tracking-wide mb-1">TOTAL COLLECTED · {monthName}</Text>
            <Text className="text-white text-[32px] font-extrabold mb-1">{formatCurrency(totalCollected)}</Text>
            <Text className="text-white/90 text-[13px] font-medium">{paidMembersCount} of {totalMembersCount} members paid</Text>
          </View>
        </View>
      </View>

      <View className="flex-row gap-3">
        {/* Pending Card */}
        <View className="flex-1 bg-card rounded-2xl p-4 border border-border shadow-sm">
          <View className="flex-row items-center gap-1.5 mb-3">
            <Clock size={16} color="#F59E0B" />
            <Text className="text-amber-500 text-xs font-bold tracking-wide">PENDING</Text>
          </View>
          <Text className="text-foreground text-2xl font-extrabold mb-2">{formatCurrency(pendingAmount)}</Text>
          <Text className="text-muted-foreground text-xs font-medium">{dueMembersCount} due · {overdueMembersCount} overdue</Text>
        </View>

        {/* Member Status Card */}
        <View className="flex-[1.2] bg-card rounded-2xl p-4 border border-border shadow-sm">
          <Text className="text-muted-foreground text-[13px] font-bold mb-3">Member Status</Text>
          <View className="flex-row justify-between gap-2">
            <View className="flex-1 py-2 rounded-lg items-center bg-green-100 dark:bg-green-900/40">
              <Text className="text-base font-extrabold mb-0.5 text-green-600 dark:text-green-500">{paidMembersCount}</Text>
              <Text className="text-[11px] font-semibold text-green-600 dark:text-green-500">Paid</Text>
            </View>
            <View className="flex-1 py-2 rounded-lg items-center bg-amber-100 dark:bg-amber-900/40">
              <Text className="text-base font-extrabold mb-0.5 text-amber-600 dark:text-amber-500">{dueMembersCount}</Text>
              <Text className="text-[11px] font-semibold text-amber-600 dark:text-amber-500">Due</Text>
            </View>
            <View className="flex-1 py-2 rounded-lg items-center bg-red-100 dark:bg-red-900/40">
              <Text className="text-base font-extrabold mb-0.5 text-destructive dark:text-red-500">{overdueMembersCount}</Text>
              <Text className="text-[11px] font-semibold text-destructive dark:text-red-500">Late</Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}
