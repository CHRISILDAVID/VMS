import React, { useState, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
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
        <View className="flex-1 items-center justify-center px-10">
          <ActivityIndicator size="large" color="#3B82F6" />
        </View>
      );
    }
    return (
      <View className="flex-1 items-center justify-center px-10">
        <View className="w-16 h-16 rounded-2xl bg-muted items-center justify-center mb-3">
          <Calendar size={32} color="#94A3B8" />
        </View>
        <Text className="text-base font-bold text-muted-foreground mb-1">No {activeTab} bookings</Text>
        <Text className="text-sm text-muted-foreground text-center">
          {searchQuery || hasFilters
            ? 'Try adjusting your search or filters'
            : 'Bookings will appear here'}
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      {/* Header */}
      <View className="bg-card px-4 pt-3 pb-3 border-b border-border">
        <View className="flex-row justify-between items-center mb-3">
          <Text className="text-2xl font-extrabold text-foreground">Bookings</Text>
          <VenueSelector />
        </View>

        {/* Search Bar & Filter Button */}
        <View className="flex-row gap-2 mb-3">
          <View className="flex-1 flex-row items-center bg-muted border border-border rounded-xl px-3 h-[42px] gap-2">
            <Search size={16} color="#94A3B8" />
            <TextInput
              className="flex-1 text-sm text-foreground"
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
            className={`w-[42px] h-[42px] rounded-xl border items-center justify-center relative ${hasFilters ? 'bg-primary/10 border-primary' : 'bg-muted border-border'}`}
            onPress={() => filterSheetRef.current?.expand()}
          >
            <SlidersHorizontal size={16} color={hasFilters ? '#3B82F6' : '#64748B'} />
            {hasFilters && <View className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-primary" />}
          </TouchableOpacity>
        </View>

        {/* Tabs */}
        <View className="flex-row bg-muted rounded-xl p-1 gap-1">
          {TABS.map((tab) => {
            const active = activeTab === tab.value;
            return (
              <TouchableOpacity
                key={tab.value}
                className={`flex-1 py-2 rounded-lg items-center justify-center ${active ? 'bg-card shadow-sm' : 'shadow-none'}`}
                onPress={() => setActiveTab(tab.value)}
              >
                <Text className={`text-xs ${active ? 'text-primary font-bold' : 'text-muted-foreground font-semibold'}`}>
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
        contentContainerClassName="p-4"
        contentContainerStyle={(!bookings || bookings.length === 0) && { flex: 1 }}
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

      <TouchableOpacity
        className="absolute bottom-6 right-6 w-16 h-16 rounded-full bg-primary justify-center items-center shadow-lg"
        onPress={() => router.push('/booking/new' as any)}
      >
        <Plus size={24} color="#ffffff" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}
