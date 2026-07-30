import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams, Stack } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import { useSlotPayments, useVenuePaymentSummary } from '../../features/payments/hooks/usePayments';
import { useMembershipSlots } from '../../features/members/hooks/useMemberships';
import { useVenueStore } from '../../stores/venueStore';
import { PaymentMemberItem } from '../../features/payments/components/PaymentMemberItem';
import { MarkAsPaidSheet } from '../../features/payments/components/MarkAsPaidSheet';
import { formatCurrency } from '@vms/shared/utils';

const capitalize = (s: string) => s ? s.charAt(0).toUpperCase() + s.slice(1) : '';
const formatDays = (days: string[]) => days ? days.map(d => capitalize(d.slice(0, 3))).join(', ') : '';
const formatTime = (time: string) => time ? time.slice(0, 5) : '';

export default function SlotPaymentsScreen() {
  const { slotId } = useLocalSearchParams<{ slotId: string }>();
  const { data: payments, isLoading, error } = useSlotPayments(slotId);
  
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
    <SafeAreaView style={styles.container} edges={['top']}>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <ChevronLeft size={24} color="#0F172A" />
          </TouchableOpacity>
          <View style={styles.headerTitleRow}>
            <Text style={styles.title}>{slot?.name || 'Slot Payments'}</Text>
            {slot?.skill_level && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{capitalize(slot.skill_level)}</Text>
              </View>
            )}
          </View>
        </View>
        {slot && (
          <Text style={styles.subtitle}>
            {formatDays(slot.playing_days)} · {formatTime(slot.start_time)} – {formatTime(slot.end_time)}
          </Text>
        )}
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statsRow}>
          <View style={[styles.statBox, styles.bgGrey]}>
            <Text style={styles.statNum}>{stats.totalMembers}</Text>
            <Text style={styles.statLabel}>Total Members</Text>
          </View>
          <View style={[styles.statBox, styles.bgGreen]}>
            <Text style={[styles.statNum, styles.textGreen]}>{stats.paidMembers}</Text>
            <Text style={[styles.statLabel, styles.textGreen]}>Paid</Text>
          </View>
          <View style={[styles.statBox, styles.bgYellow]}>
            <Text style={[styles.statNum, styles.textYellow]}>{stats.pendingMembers}</Text>
            <Text style={[styles.statLabel, styles.textYellow]}>Pending</Text>
          </View>
        </View>
        <View style={styles.statsRow}>
          <View style={[styles.statBox, styles.bgGrey]}>
            <Text style={styles.statNum}>{formatCurrency(stats.expectedAmount)}</Text>
            <Text style={styles.statLabel}>Expected</Text>
          </View>
          <View style={[styles.statBox, styles.bgGreen]}>
            <Text style={[styles.statNum, styles.textGreen]}>{formatCurrency(stats.collectedAmount)}</Text>
            <Text style={[styles.statLabel, styles.textGreen]}>Collected</Text>
          </View>
          <View style={[styles.statBox, styles.bgRed]}>
            <Text style={[styles.statNum, styles.textRed]}>{formatCurrency(stats.pendingAmount)}</Text>
            <Text style={[styles.statLabel, styles.textRed]}>Pending</Text>
          </View>
        </View>
      </View>

      <View style={styles.filtersWrapper}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtersRow}
          data={FILTERS}
          keyExtractor={item => item.label}
          renderItem={({ item }) => {
            const isSelected = filter === item.label;
            return (
              <TouchableOpacity
                style={[styles.filterChip, isSelected && styles.filterChipSelected]}
                onPress={() => setFilter(item.label)}
              >
                <Text style={[styles.filterText, isSelected && styles.filterTextSelected]}>
                  {item.label}
                </Text>
                <View style={[styles.countBadge, isSelected && styles.countBadgeSelected]}>
                  <Text style={[styles.countText, isSelected && styles.countTextSelected]}>
                    {item.count}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          }}
        />
      </View>

      {isLoading ? (
        <View style={styles.center}>
          <Text>Loading payments...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredPayments}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <PaymentMemberItem 
              payment={item} 
              slotName={slot?.name}
              slotPrice={slot?.monthly_fee}
              onMarkPaid={() => setSelectedPayment(item)}
            />
          )}
          ListEmptyComponent={() => (
            <View style={styles.center}>
              <Text style={styles.emptyText}>No payments found for this criteria.</Text>
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  backBtn: {
    marginRight: 12,
    padding: 4,
    marginLeft: -4,
  },
  headerTitleRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
  },
  badge: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    color: '#4F46E5',
    fontSize: 11,
    fontWeight: '600',
  },
  subtitle: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '500',
    marginLeft: 40,
  },
  statsContainer: {
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    gap: 8,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  statBox: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bgGrey: { backgroundColor: '#F8FAFC' },
  bgGreen: { backgroundColor: '#F0FDF4' },
  bgYellow: { backgroundColor: '#FFFBEB' },
  bgRed: { backgroundColor: '#FEF2F2' },
  statNum: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
  },
  textGreen: { color: '#16A34A' },
  textYellow: { color: '#D97706' },
  textRed: { color: '#DC2626' },
  filtersWrapper: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  filtersRow: {
    padding: 16,
    gap: 8,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 6,
  },
  filterChipSelected: {
    backgroundColor: '#1E293B',
    borderColor: '#1E293B',
  },
  filterText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
  },
  filterTextSelected: {
    color: '#fff',
  },
  countBadge: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },
  countBadgeSelected: {
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  countText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
  },
  countTextSelected: {
    color: '#fff',
  },
  listContent: {
    padding: 16,
    gap: 12,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    color: '#64748B',
    fontSize: 14,
  },
});
