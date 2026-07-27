import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import BottomSheet from '@gorhom/bottom-sheet';
import { Search, SlidersHorizontal, X, Plus, Calendar } from 'lucide-react-native';

import { VenueSelector } from '../../components/domain/VenueSelector';
import { BookingCard } from '../../features/bookings/components/BookingCard';
import { FilterSheet } from '../../features/bookings/components/FilterSheet';
import { PaymentUpdateModal } from '../../features/bookings/components/PaymentUpdateModal';
import { useBookings, useUpdatePaymentStatus } from '../../features/bookings/hooks/useBookings';
import { useCourts } from '../../hooks/useCourts';
import { useVenueStore } from '../../stores/venueStore';
import { BookingStatus } from '@vms/shared/types';
import { BookingWithDetails } from '@vms/shared/services';
import { COLORS } from '@vms/shared/utils';

const TABS: { label: string; value: BookingStatus }[] = [
  { label: 'Upcoming', value: 'upcoming' },
  { label: 'Ongoing', value: 'ongoing' },
  { label: 'Completed', value: 'completed' },
  { label: 'Cancelled', value: 'cancelled' },
];

export default function BookingsScreen() {
  const router = useRouter();
  const { selectedVenueId } = useVenueStore();
  const [activeTab, setActiveTab] = useState<BookingStatus>('upcoming');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Filters
  const [filterCourtId, setFilterCourtId] = useState<string | undefined>(undefined);
  const [filterDate, setFilterDate] = useState<string | undefined>(undefined);

  const filterSheetRef = useRef<BottomSheet>(null);
  const [paymentModalBooking, setPaymentModalBooking] = useState<BookingWithDetails | null>(null);

  const { data: courts } = useCourts(selectedVenueId);
  const { data: bookings, isLoading } = useBookings({
    statusTab: activeTab,
    search: searchQuery,
    courtId: filterCourtId,
    date: filterDate,
  });

  const updatePaymentMutation = useUpdatePaymentStatus();

  const hasFilters = !!filterCourtId || !!filterDate;

  const handleCardPress = (booking: BookingWithDetails) => {
    router.push(`/booking/${booking.id}` as any);
  };

  const handleCollectPress = (booking: BookingWithDetails) => {
    setPaymentModalBooking(booking);
  };

  const handleSavePayment = async (payload: any) => {
    if (!paymentModalBooking) return;
    await updatePaymentMutation.mutateAsync({
      id: paymentModalBooking.id,
      ...payload,
    });
  };

  const renderEmpty = () => {
    if (isLoading) {
      return (
        <View style={styles.centerBox}>
          <ActivityIndicator size="large" color="#2563EB" />
        </View>
      );
    }
    return (
      <View style={styles.centerBox}>
        <View style={styles.emptyIconBox}>
          <Calendar size={32} color="#CBD5E1" />
        </View>
        <Text style={styles.emptyTitle}>No {activeTab} bookings</Text>
        <Text style={styles.emptySubtitle}>
          {searchQuery || hasFilters
            ? 'Try adjusting your search or filters'
            : 'Bookings will appear here'}
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.title}>Bookings</Text>
          <VenueSelector />
        </View>

        {/* New Booking Button Row (right below venue filter) */}
        <View style={styles.newBtnRow}>
          <TouchableOpacity
            style={styles.newBtn}
            onPress={() => router.push('/booking/new' as any)}
          >
            <Plus size={18} color="#fff" />
            <Text style={styles.newBtnText}>New</Text>
          </TouchableOpacity>
        </View>

        {/* Search Bar & Filter Button */}
        <View style={styles.searchRow}>
          <View style={styles.searchBar}>
            <Search size={16} color="#94A3B8" />
            <TextInput
              style={styles.searchInput}
              placeholder="Player name, phone or ID..."
              placeholderTextColor="#94A3B8"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery ? (
              <TouchableOpacity onPress={() => setSearchQuery('')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <X size={16} color="#94A3B8" />
              </TouchableOpacity>
            ) : null}
          </View>

          <TouchableOpacity
            style={[styles.filterBtn, hasFilters && styles.filterBtnActive]}
            onPress={() => filterSheetRef.current?.expand()}
          >
            <SlidersHorizontal size={16} color={hasFilters ? '#2563EB' : '#64748B'} />
            {hasFilters && <View style={styles.filterDot} />}
          </TouchableOpacity>
        </View>

        {/* Tabs */}
        <View style={styles.tabsContainer}>
          {TABS.map((tab) => {
            const active = activeTab === tab.value;
            return (
              <TouchableOpacity
                key={tab.value}
                style={[styles.tabBtn, active && styles.tabBtnActive]}
                onPress={() => setActiveTab(tab.value)}
              >
                <Text style={[styles.tabText, active && styles.tabTextActive]}>
                  {tab.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* List */}
      <FlatList
        data={bookings || []}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <BookingCard
            booking={item}
            onPress={() => handleCardPress(item)}
            onCollectPress={() => handleCollectPress(item)}
          />
        )}
        contentContainerStyle={[
          styles.listContent,
          (!bookings || bookings.length === 0) && { flex: 1 },
        ]}
        ListEmptyComponent={renderEmpty}
        showsVerticalScrollIndicator={false}
      />

      {/* Filter Sheet */}
      <FilterSheet
        ref={filterSheetRef}
        courts={courts || []}
        selectedCourtId={filterCourtId}
        selectedDate={filterDate}
        onApplyFilters={({ courtId, date }) => {
          setFilterCourtId(courtId);
          setFilterDate(date);
        }}
        onResetFilters={() => {
          setFilterCourtId(undefined);
          setFilterDate(undefined);
        }}
      />

      {/* Payment Update Modal */}
      <PaymentUpdateModal
        visible={!!paymentModalBooking}
        booking={paymentModalBooking}
        onClose={() => setPaymentModalBooking(null)}
        onSave={handleSavePayment}
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
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0F172A',
  },
  newBtnRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 12,
  },
  newBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2563EB',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 4,
  },
  newBtnText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
  },
  searchRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 42,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#0F172A',
  },
  filterBtn: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  filterBtnActive: {
    backgroundColor: '#EFF6FF',
    borderColor: '#2563EB',
  },
  filterDot: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#2563EB',
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 3,
    gap: 2,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabBtnActive: {
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  tabText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  tabTextActive: {
    color: '#2563EB',
    fontWeight: '700',
  },
  listContent: {
    padding: 16,
  },
  centerBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  emptyIconBox: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#64748B',
    marginBottom: 4,
  },
  emptySubtitle: {
    fontSize: 13,
    color: '#94A3B8',
    textAlign: 'center',
  },
});
