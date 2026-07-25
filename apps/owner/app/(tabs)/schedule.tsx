import React, { useState, useRef, useCallback } from 'react';
import { View, StyleSheet, ActivityIndicator, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { format } from 'date-fns';
import BottomSheet from '@gorhom/bottom-sheet';

import { VenueSelector } from '../../components/domain/VenueSelector';
import { DateSelector } from '../../features/schedule/components/DateSelector';
import { TimelineGrid } from '../../features/schedule/components/TimelineGrid';
import { SlotBottomSheet } from '../../features/schedule/components/SlotBottomSheet';
import { SpeedDialFAB } from '../../features/schedule/components/SpeedDialFAB';
import { useSchedule } from '../../features/schedule/hooks/useSchedule';
import { useCourts } from '../../hooks/useCourts';
import { useVenueStore } from '../../stores/venueStore';
import { ProcessedSlot } from '../../features/schedule/utils/scheduleHelpers';
import { Court } from '@vms/shared/types';
import { COLORS, SPACING } from '@vms/shared/utils';

export default function ScheduleScreen() {
  const { selectedVenueId } = useVenueStore();
  
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
    setSelectedSlot(slot);
    setSelectedCourt(court);
    setSelectedHour(slot.startHour);
    bottomSheetRef.current?.expand();
  }, []);

  const handleEmptyTap = useCallback((court: Court, hour: number) => {
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
          />
        )}
      </View>

      <SpeedDialFAB />

      <SlotBottomSheet
        ref={bottomSheetRef}
        slot={selectedSlot}
        court={selectedCourt}
        hour={selectedHour}
        onClose={handleCloseBottomSheet}
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
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.surface,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
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
