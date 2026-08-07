import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams, Stack } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import { useSlotPayments, useVenuePaymentSummary } from '../../features/payments/hooks/usePayments';
import { useMembershipSlots } from '../../features/members/hooks/useMemberships';
import { useVenueStore } from '../../stores/venueStore';
import { PaymentMemberItem } from '../../features/payments/components/PaymentMemberItem';
import { MarkAsPaidSheet } from '../../features/payments/components/MarkAsPaidSheet';
import { formatCurrency } from '@vms/shared/utils';
import { useThemeColors } from '../../hooks/useThemeColors';

const capitalize = (s: string) => s ? s.charAt(0).toUpperCase() + s.slice(1) : '';
const formatDays = (days: string[]) => days ? days.map(d => capitalize(d.slice(0, 3))).join(', ') : '';
const formatTime = (time: string) => time ? time.slice(0, 5) : '';

export default function SlotPaymentsScreen() {
  const { slotId } = useLocalSearchParams<{ slotId: string }>();
  const { data: payments, isLoading, error } = useSlotPayments(slotId);
  const { colors } = useThemeColors();
  
  const { selectedVenueId } = useVenueStore();
  const { data: slots } = useMembershipSlots();
  const { data: summary } = useVenuePaymentSummary(selectedVenueId || undefined);

  const slot = slots?.find(s => s.id === slotId);
  const stats = summary?.slotAggregates?.[slotId as string] || {
    expectedAmount: 0,
    collectedAmount: 0,
    pendingAmount: 0,
    totalMembers: 0,
    paidMembers: 0,
    pendingMembers: 0,
  };
  
  const [filter, setFilter] = useState('All');
  const [selectedPayment, setSelectedPayment] = useState<any>(null);

  // Derive counts from actual payments array for filters
  const paidCount = payments?.filter(p => p.status === 'paid').length || 0;
  const dueCount = payments?.filter(p => p.status === 'due').length || 0;
  const overdueCount = payments?.filter(p => p.status === 'overdue').length || 0;
  const pendingCount = dueCount + overdueCount;
  const allCount = payments?.length || 0;

  const FILTERS = [
    { label: 'All', count: allCount },
    { label: 'Paid', count: paidCount },
    { label: 'Pending', count: pendingCount },
    { label: 'Overdue', count: overdueCount },
  ];

  const filteredPayments = payments?.filter(p => {
    if (filter === 'Pending') return p.status !== 'paid';
    if (filter === 'Paid') return p.status === 'paid';
    if (filter === 'Overdue') return p.status === 'overdue';
    return true;
  });

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <Stack.Screen options={{ headerShown: false }} />
      <View className="bg-card px-4 py-3 border-b border-border">
        <View className="flex-row items-center mb-1">
          <TouchableOpacity className="mr-3 p-1 -ml-1" onPress={() => router.back()}>
            <ChevronLeft size={24} color={colors.foreground} />
          </TouchableOpacity>
          <View className="flex-1 flex-row items-center justify-between">
            <Text className="text-xl font-extrabold text-foreground">{slot?.name || 'Slot Payments'}</Text>
            {slot?.skill_level && (
              <View className="bg-indigo-50 dark:bg-indigo-900/30 px-2.5 py-1 rounded-xl">
                <Text className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400">{capitalize(slot.skill_level)}</Text>
              </View>
            )}
          </View>
        </View>
        {slot && (
          <Text className="text-[13px] font-medium text-muted-foreground ml-10">
            {formatDays(slot.playing_days)} · {formatTime(slot.start_time)} – {formatTime(slot.end_time)}
          </Text>
        )}
      </View>

      <View className="bg-card p-4 border-b border-border gap-2">
        <View className="flex-row gap-2">
          <View className="flex-1 py-3 rounded-xl items-center justify-center bg-muted">
            <Text className="text-base font-extrabold text-foreground mb-1">{stats.totalMembers}</Text>
            <Text className="text-[11px] font-semibold text-muted-foreground">Total Members</Text>
          </View>
          <View className="flex-1 py-3 rounded-xl items-center justify-center bg-green-50 dark:bg-green-900/20">
            <Text className="text-base font-extrabold text-green-600 dark:text-green-500 mb-1">{stats.paidMembers}</Text>
            <Text className="text-[11px] font-semibold text-green-600 dark:text-green-500">Paid</Text>
          </View>
          <View className="flex-1 py-3 rounded-xl items-center justify-center bg-amber-50 dark:bg-amber-900/20">
            <Text className="text-base font-extrabold text-amber-600 dark:text-amber-500 mb-1">{stats.pendingMembers}</Text>
            <Text className="text-[11px] font-semibold text-amber-600 dark:text-amber-500">Pending</Text>
          </View>
        </View>
        <View className="flex-row gap-2">
          <View className="flex-1 py-3 rounded-xl items-center justify-center bg-muted">
            <Text className="text-base font-extrabold text-foreground mb-1">{formatCurrency(stats.expectedAmount)}</Text>
            <Text className="text-[11px] font-semibold text-muted-foreground">Expected</Text>
          </View>
          <View className="flex-1 py-3 rounded-xl items-center justify-center bg-green-50 dark:bg-green-900/20">
            <Text className="text-base font-extrabold text-green-600 dark:text-green-500 mb-1">{formatCurrency(stats.collectedAmount)}</Text>
            <Text className="text-[11px] font-semibold text-green-600 dark:text-green-500">Collected</Text>
          </View>
          <View className="flex-1 py-3 rounded-xl items-center justify-center bg-red-50 dark:bg-red-900/20">
            <Text className="text-base font-extrabold text-destructive dark:text-red-500 mb-1">{formatCurrency(stats.pendingAmount)}</Text>
            <Text className="text-[11px] font-semibold text-destructive dark:text-red-500">Pending</Text>
          </View>
        </View>
      </View>

      <View className="bg-card border-b border-border">
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ padding: 16, gap: 8 }}
          data={FILTERS}
          keyExtractor={item => item.label}
          renderItem={({ item }) => {
            const isSelected = filter === item.label;
            return (
              <TouchableOpacity
                className={`flex-row items-center px-3.5 py-2 rounded-full border gap-1.5 ${isSelected ? 'bg-primary border-primary' : 'bg-card border-border'}`}
                onPress={() => setFilter(item.label)}
              >
                <Text className={`text-[13px] font-semibold ${isSelected ? 'text-primary-foreground' : 'text-muted-foreground'}`}>
                  {item.label}
                </Text>
                <View className={`px-1.5 py-0.5 rounded-md ${isSelected ? 'bg-primary-foreground/20' : 'bg-muted'}`}>
                  <Text className={`text-[11px] font-bold ${isSelected ? 'text-primary-foreground' : 'text-muted-foreground'}`}>
                    {item.count}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          }}
        />
      </View>

      {isLoading ? (
        <View className="flex-1 justify-center items-center p-8">
          <Text className="text-muted-foreground">Loading payments...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredPayments}
          keyExtractor={item => item.id}
          contentContainerStyle={{ padding: 16, gap: 12 }}
          renderItem={({ item }) => (
            <PaymentMemberItem 
              payment={item} 
              slotName={slot?.name}
              slotPrice={slot?.monthly_fee}
              onMarkPaid={() => setSelectedPayment(item)}
            />
          )}
          ListEmptyComponent={() => (
            <View className="flex-1 justify-center items-center p-8">
              <Text className="text-sm text-muted-foreground">No payments found for this criteria.</Text>
            </View>
          )}
        />
      )}

      <MarkAsPaidSheet 
        payment={selectedPayment}
        onClose={() => setSelectedPayment(null)}
      />
    </SafeAreaView>
  );
}
