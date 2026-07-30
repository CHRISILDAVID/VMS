import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useVenueStore } from '../../stores/venueStore';
import { useMembershipSlots } from '../../features/members/hooks/useMemberships';
import { useVenuePaymentSummary } from '../../features/payments/hooks/usePayments';
import { VenueSelector } from '../../components/domain/VenueSelector';
import { PaymentsDashboard } from '../../features/payments/components/PaymentsDashboard';
import { SlotPaymentCard } from '../../features/payments/components/SlotPaymentCard';
import { DefaultersList } from '../../features/payments/components/DefaultersList';

export default function PaymentsScreen() {
  const [activeTab, setActiveTab] = React.useState<'dashboard' | 'defaulters'>('dashboard');
  const { selectedVenueId } = useVenueStore();
  const { data: slots, isLoading } = useMembershipSlots();
  const { data: summary } = useVenuePaymentSummary(selectedVenueId || undefined);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.title}>Payments</Text>
          <VenueSelector />
        </View>
        <Text style={styles.subtitle}>Monthly membership payments</Text>
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity 
          style={[styles.tabBtn, activeTab === 'dashboard' && styles.tabBtnActive]} 
          onPress={() => setActiveTab('dashboard')}
        >
          <Text style={[styles.tabText, activeTab === 'dashboard' && styles.tabTextActive]}>Dashboard</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tabBtn, activeTab === 'defaulters' && styles.tabBtnActive]} 
          onPress={() => setActiveTab('defaulters')}
        >
          <Text style={[styles.tabText, activeTab === 'defaulters' && styles.tabTextActive]}>Defaulters</Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'dashboard' ? (
        <FlatList
          ListHeaderComponent={() => (
            <View>
              <PaymentsDashboard venueId={selectedVenueId || undefined} />
              <Text style={styles.sectionTitle}>Membership Slots</Text>
            </View>
          )}
          data={slots}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <SlotPaymentCard 
              slot={item} 
              stats={summary?.slotAggregates?.[item.id]}
              onPress={() => router.push(`/payments/slot-payments?slotId=${item.id}`)} 
            />
          )}
          ListEmptyComponent={() => (
            <View style={styles.empty}>
              <Text style={styles.emptyText}>No membership slots found.</Text>
            </View>
          )}
        />
      ) : (
        <DefaultersList venueId={selectedVenueId || undefined} />
      )}
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
  subtitle: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
    paddingHorizontal: 16,
    marginTop: 8,
    marginBottom: 8,
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
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  tabBtn: {
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#F8FAFC',
  },
  tabBtnActive: {
    backgroundColor: '#E0E7FF',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
  },
  tabTextActive: {
    color: '#4338CA',
  },
});

