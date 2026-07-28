import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import { useSlotPayments } from '../../features/payments/hooks/usePayments';
import { PaymentMemberItem } from '../../features/payments/components/PaymentMemberItem';
import { MarkAsPaidSheet } from '../../features/payments/components/MarkAsPaidSheet';

const FILTERS = ['All', 'Due', 'Paid'];

export default function SlotPaymentsScreen() {
  const { slotId } = useLocalSearchParams<{ slotId: string }>();
  const { data: payments, isLoading, error } = useSlotPayments(slotId);
  console.log('SLOT PAYMENTS DATA:', payments?.length, 'ERROR:', error);
  
  const [filter, setFilter] = useState('All');
  const [selectedPayment, setSelectedPayment] = useState<any>(null);

  const filteredPayments = payments?.filter(p => {
    if (filter === 'Due') return p.status !== 'paid';
    if (filter === 'Paid') return p.status === 'paid';
    return true;
  });

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <ChevronLeft size={24} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.title}>Slot Payments</Text>
      </View>

      <View style={styles.filtersRow}>
        {FILTERS.map(f => (
          <TouchableOpacity
            key={f}
            style={[styles.filterChip, filter === f && styles.filterChipSelected]}
            onPress={() => setFilter(f)}
          >
            <Text style={[styles.filterText, filter === f && styles.filterTextSelected]}>
              {f}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {isLoading ? (
        <View style={styles.center}>
          <Text>Loading payments...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredPayments}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <PaymentMemberItem 
              payment={item} 
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
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  backBtn: {
    marginRight: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0F172A',
  },
  filtersRow: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#fff',
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
  },
  filterChipSelected: {
    backgroundColor: '#1E293B',
  },
  filterText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
  },
  filterTextSelected: {
    color: '#fff',
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
