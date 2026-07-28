import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useVenueStore } from '../../stores/venueStore';
import { useMembershipSlots } from '../../features/members/hooks/useMemberships';
import { VenueSelector } from '../../components/domain/VenueSelector';
import { PaymentsDashboard } from '../../features/payments/components/PaymentsDashboard';
import { SlotPaymentCard } from '../../features/payments/components/SlotPaymentCard';

export default function PaymentsScreen() {
  const { currentVenue } = useVenueStore();
  const { data: slots, isLoading } = useMembershipSlots();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.title}>Payments</Text>
          <VenueSelector />
        </View>
      </View>

      <PaymentsDashboard venueId={currentVenue?.id} />

      <FlatList
        data={slots}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <SlotPaymentCard 
            slot={item} 
            onPress={() => router.push(`/payments/slot-payments?slotId=${item.id}`)} 
          />
        )}
        ListEmptyComponent={() => (
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No membership slots found.</Text>
          </View>
        )}
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
    paddingTop: 12,
    paddingBottom: 12,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0F172A',
  },
  listContent: {
    paddingVertical: 16,
  },
  empty: {
    padding: 32,
    alignItems: 'center',
  },
  emptyText: {
    color: '#64748B',
    fontSize: 14,
  },
});
