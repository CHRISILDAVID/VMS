import React, { useState, useRef, useCallback, useEffect } from 'react';
import { View, StyleSheet, ActivityIndicator, Text, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { format } from 'date-fns';
import BottomSheet from '@gorhom/bottom-sheet';
import { useRouter, useLocalSearchParams } from 'expo-router';

import { VenueSelector } from '../../components/domain/VenueSelector';
import { DateSelector } from '../../features/schedule/components/DateSelector';
import { TimelineGrid } from '../../features/schedule/components/TimelineGrid';
import { SlotBottomSheet } from '../../features/schedule/components/SlotBottomSheet';
import { SpeedDialFAB } from '../../features/schedule/components/SpeedDialFAB';
import { useSchedule } from '../../features/schedule/hooks/useSchedule';
import { useCourts } from '../../hooks/useCourts';
import { useVenueStore } from '../../stores/venueStore';
import { ProcessedSlot } from '../../features/schedule/utils/scheduleHelpers';
import { useReleaseSlot } from '../../features/members/hooks/useMemberships';
import { Court } from '@vms/shared/types';
import { COLORS, SPACING } from '@vms/shared/utils';

export default function ScheduleScreen() {
  const router = useRouter();
  const { selectedVenueId } = useVenueStore();
  const releaseSlotMutation = useReleaseSlot();
  const { conflictCourtId, conflictTime } = useLocalSearchParams<{ conflictCourtId?: string; conflictTime?: string }>();
  
  const [selectedDateStr, setSelectedDateStr] = useState(() => 
    format(new Date(), 'yyyy-MM-dd')
  );
  
  const [selectedSlot, setSelectedSlot] = useState<any | null>(null);
  const [selectedCourt, setSelectedCourt] = useState<Court | null>(null);
  const [selectedHour, setSelectedHour] = useState<number | null>(null);
  const bottomSheetRef = useRef<BottomSheet>(null);

  const { data: scheduleData, isLoading: isLoadingSchedule } = useSchedule(selectedDateStr);
  const { data: courts, isLoading: isLoadingCourts } = useCourts(selectedVenueId);

  const handleSlotPress = useCallback((slot: any, court: Court) => {
    console.log('handleSlotPress tapped:', slot?.label, court.name);
    setSelectedSlot(slot);
    setSelectedCourt(court);
    setSelectedHour(slot.startHour);
    bottomSheetRef.current?.expand();
  }, []);

  const handleEmptyTap = useCallback((court: Court, hour: number) => {
    console.log('handleEmptyTap tapped:', court.name, hour);
    setSelectedSlot(null);
    setSelectedCourt(court);
    setSelectedHour(hour);
    bottomSheetRef.current?.expand();
  }, []);

  const handleCloseBottomSheet = useCallback(() => {
    setSelectedSlot(null);
    setSelectedCourt(null);
    setSelectedHour(null);
    bottomSheetRef.current?.close();
  }, []);

  const handleFABPress = useCallback((actionId: string) => {
    if (actionId === 'booking') {
      router.push(`/booking/new?date=${selectedDateStr}` as any);
    }
  }, [router, selectedDateStr]);

  const handleSlotActionPress = useCallback((actionLabel: string, slot: any | null, court: Court, hour: number) => {
    if (actionLabel === 'View Booking' || actionLabel === 'Edit Booking') {
      if (slot?.booking?.id) {
        router.push(`/booking/${slot.booking.id}` as any);
      }
    } else if (actionLabel === 'New Booking') {
      router.push(`/booking/new?courtId=${court.id}&hour=${hour}&date=${selectedDateStr}` as any);
    } else if (actionLabel === 'View Membership') {
      if (slot?.membership?.id) {
        router.push(`/members?slotId=${slot.membership.id}` as any);
      } else {
        router.push('/members' as any);
      }
    } else if (actionLabel === 'Release Slot') {
      if (slot?.membership?.id) {
        Alert.alert(
          'Release Slot',
          `Are you sure you want to release this membership slot for walk-in bookings on ${selectedDateStr}?`,
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Release',
              style: 'destructive',
              onPress: () => {
                releaseSlotMutation.mutate(
                  { slotId: slot.membership.id, releaseDate: selectedDateStr },
                  {
                    onSuccess: () => {
                      Alert.alert('Success', 'Slot released for this date.');
                    },
                    onError: (err: any) => {
                      Alert.alert('Error', err.message || 'Failed to release slot.');
                    },
                  }
                );
              },
            },
          ]
        );
      }
    }
  }, [router, selectedDateStr, releaseSlotMutation]);

  const isLoading = isLoadingSchedule || isLoadingCourts;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Schedule</Text>
        <VenueSelector />
      </View>

      {/* Date Selector */}
      <DateSelector 
        selectedDate={selectedDateStr} 
        onDateChange={setSelectedDateStr} 
      />

      {/* Grid */}
      <View style={styles.content}>
        {!selectedVenueId ? (
          <View style={styles.centerContainer}>
            <Text style={styles.messageText}>Please select a venue first.</Text>
          </View>
        ) : isLoading ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color={COLORS.primary} />
          </View>
        ) : (!courts || courts.length === 0) ? (
          <View style={styles.centerContainer}>
            <Text style={styles.messageText}>No courts found for this venue.</Text>
          </View>
        ) : (
          <TimelineGrid
            courts={courts}
            bookings={scheduleData?.bookings || []}
            memberships={scheduleData?.membershipBlocks || []}
            dateStr={selectedDateStr}
            onSlotPress={handleSlotPress}
            onEmptyTap={handleEmptyTap}
            conflictCourtId={conflictCourtId}
            conflictTime={conflictTime}
          />
        )}
      </View>

      <SpeedDialFAB onPressItem={handleFABPress} />

      <SlotBottomSheet
        ref={bottomSheetRef}
        slot={selectedSlot}
        court={selectedCourt}
        hour={selectedHour}
        dateStr={selectedDateStr}
        onClose={handleCloseBottomSheet}
        onActionPress={handleSlotActionPress}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    backgroundColor: COLORS.surface,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  content: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  messageText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
});
