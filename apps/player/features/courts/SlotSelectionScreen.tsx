import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, Calendar, ChevronDown, Clock } from 'lucide-react-native';
import { format, addDays, isSameDay, parse } from 'date-fns';
import { SlotGrid } from '../../components/ui/SlotGrid';
import { SegmentedControl } from '../../components/ui/SegmentedControl';
import { SkeletonCard } from '../../components/ui/Skeleton';
import { useVenueDetail, useVenueCourts, useOccupiedSlots, usePricingBlocks } from './useCourts';
import { usePlayerThemeColors } from '../../hooks/usePlayerThemeColors';
import type { OccupiedSlot } from '@vms/shared/types';

type TimeOfDay = 'all' | 'morning' | 'noon' | 'evening';
const TIME_SEGMENTS: TimeOfDay[] = ['all', 'morning', 'noon', 'evening'];
const TIME_SEGMENT_LABELS = ['All', 'Morning', 'Noon', 'Evening'];

/** Slot duration chips */
const SLOT_DURATION_LABELS = ['30 min', '1 hr', '1.5 hr', '2 hr'];
const SLOT_DURATION_MINUTES = [30, 60, 90, 120];

export function SlotSelectionScreen() {
  const { venueId } = useLocalSearchParams<{ venueId: string }>();
  const { colors } = usePlayerThemeColors();

  // State
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedCourtId, setSelectedCourtId] = useState<string | null>(null);
  const [selectedSlots, setSelectedSlots] = useState<string[]>([]);
  const [timeOfDayIdx, setTimeOfDayIdx] = useState(0);

  // Data
  const { data: venue } = useVenueDetail(venueId);
  const { data: courts = [], isLoading: courtsLoading } = useVenueCourts(venueId);

  // Select first court by default
  const activeCourt = selectedCourtId ?? (courts.length > 0 ? (courts[0] as any).id : null);

  const dayOfWeek = format(selectedDate, 'E').toLowerCase() as any;
  const { data: pricingBlocks = [] } = usePricingBlocks(venueId, dayOfWeek);
  const { data: occupiedSlots = [], isLoading: slotsLoading } = useOccupiedSlots(
    activeCourt,
    selectedDate
  );

  const openHour = venue?.open_time != null ? parseInt(venue.open_time.split(':')[0], 10) : NaN;
  const startHour = isNaN(openHour) ? 6 : openHour;

  let closeHour = venue?.close_time != null ? parseInt(venue.close_time.split(':')[0], 10) : NaN;
  let endHour = isNaN(closeHour) || closeHour === 0 ? 24 : closeHour;

  const activeCourtName = courts.find((c: any) => c.id === activeCourt)?.name ?? 'Court';

  // Generate 5-day date strip
  const dates = useMemo(
    () => Array.from({ length: 7 }, (_, i) => addDays(new Date(), i)),
    []
  );

  // Calculate price for selected slots
  const durationMinutes = selectedSlots.length * 30;
  const estimatedPrice = useMemo(() => {
    if (selectedSlots.length === 0 || pricingBlocks.length === 0) return null;
    const firstSlot = selectedSlots[0];
    const block = pricingBlocks.find((b: any) => {
      const blockStart = b.start_time?.slice(0, 5);
      const blockEnd = b.end_time?.slice(0, 5);
      return firstSlot >= blockStart && firstSlot < blockEnd;
    }) as any;

    if (!block) return null;
    const pricePerHour = block.price_per_hour as number;
    return Math.round((pricePerHour * durationMinutes) / 60);
  }, [selectedSlots, pricingBlocks, durationMinutes]);

  const toggleSlot = (slotTime: string) => {
    setSelectedSlots((prev) => {
      if (prev.includes(slotTime)) {
        // Remove and any after it
        const idx = prev.indexOf(slotTime);
        return prev.slice(0, idx);
      }
      // Must be contiguous — add if adjacent to last slot or first slot
      if (prev.length === 0) return [slotTime];

      const sorted = [...prev].sort();
      const lastSlot = sorted[sorted.length - 1];
      const [lh, lm] = lastSlot.split(':').map(Number);
      const lastMinutes = lh * 60 + lm;

      const [nh, nm] = slotTime.split(':').map(Number);
      const newMinutes = nh * 60 + nm;

      if (newMinutes === lastMinutes + 30) {
        return [...prev, slotTime];
      }

      // Not adjacent — start fresh selection
      return [slotTime];
    });
  };

  const formatSlotRange = (slots: string[]) => {
    if (!slots.length) return '';
    const sorted = [...slots].sort();
    const start = sorted[0];
    const end = sorted[sorted.length - 1];
    const endMinutes = parseInt(end.split(':')[0], 10) * 60 + parseInt(end.split(':')[1], 10) + 30;
    const endH = Math.floor(endMinutes / 60);
    const endM = endMinutes % 60;
    const endTime = `${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}`;
    
    const format12 = (timeStr: string) => {
      // Handle "24:00" correctly
      if (timeStr === '24:00') return '12:00 AM';
      return format(parse(timeStr, 'HH:mm', new Date()), 'h:mm a');
    };
    return `${format12(start)} - ${format12(endTime)}`;
  };

  const handleContinue = () => {
    if (selectedSlots.length === 0 || !activeCourt) return;
    const sorted = [...selectedSlots].sort();
    const firstSlot = sorted[0];
    const lastSlot = sorted[sorted.length - 1];
    const [lh, lm] = lastSlot.split(':').map(Number);
    const endMinutes = lh * 60 + lm + 30;
    const endHour = Math.floor(endMinutes / 60);
    const endMin = endMinutes % 60;
    const endTime = `${String(endHour).padStart(2, '0')}:${String(endMin).padStart(2, '0')}`;

    router.push({
      pathname: '/courts/[venueId]/summary' as any,
      params: {
        venueId,
        courtId: activeCourt,
        courtName: (courts.find((c: any) => c.id === activeCourt) as any)?.name ?? '',
        venueName: venue?.name ?? '',
        date: format(selectedDate, 'yyyy-MM-dd'),
        startTime: firstSlot,
        endTime,
        durationMinutes: String(durationMinutes),
        estimatedPrice: String(estimatedPrice ?? 0),
      },
    });
  };

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top', 'bottom']}>
      {/* Header */}
      <View className="flex-row items-center px-4 py-3 gap-3">
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-9 h-9 rounded-full bg-muted items-center justify-center"
        >
          <ArrowLeft size={18} color={colors.foreground} strokeWidth={2} />
        </TouchableOpacity>
        <View className="flex-1">
          <Text className="text-foreground font-black text-base">{venue?.name ?? 'Select Slot'}</Text>
          <Text className="text-muted-foreground text-xs">{courts.length} court(s) available</Text>
        </View>
      </View>

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        {/* Date strip */}
        <View className="px-4 mb-4">
          <Text className="text-muted-foreground text-xs font-bold uppercase tracking-wide mb-2">
            Select Date
          </Text>
          <FlatList
            data={dates}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 8 }}
            keyExtractor={(d) => d.toISOString()}
            renderItem={({ item: d }) => {
              const isSelected = isSameDay(d, selectedDate);
              const isToday = isSameDay(d, new Date());
              return (
                <TouchableOpacity
                  onPress={() => {
                    setSelectedDate(d);
                    setSelectedSlots([]);
                  }}
                  className={`w-14 h-16 rounded-2xl items-center justify-center border ${
                    isSelected
                      ? 'bg-primary border-primary'
                      : 'bg-card border-border'
                  }`}
                  activeOpacity={0.8}
                >
                  <Text
                    className={`text-[10px] font-bold uppercase ${
                      isSelected ? 'text-primary-foreground' : 'text-muted-foreground'
                    }`}
                  >
                    {format(d, 'EEE')}
                  </Text>
                  <Text
                    className={`text-lg font-black ${
                      isSelected ? 'text-primary-foreground' : 'text-foreground'
                    }`}
                  >
                    {format(d, 'd')}
                  </Text>
                  {isToday && (
                    <View className="w-1 h-1 rounded-full bg-accent" />
                  )}
                </TouchableOpacity>
              );
            }}
          />
        </View>

        {/* Court selector (only if multiple) */}
        {courts.length > 1 && (
          <View className="px-4 mb-4">
            <Text className="text-muted-foreground text-xs font-bold uppercase tracking-wide mb-2">
              Select Court
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View className="flex-row gap-2">
                {courts.map((court: any) => {
                  const isActive = activeCourt === court.id;
                  return (
                    <TouchableOpacity
                      key={court.id}
                      onPress={() => {
                        setSelectedCourtId(court.id);
                        setSelectedSlots([]);
                      }}
                      className={`px-4 py-2 rounded-full border ${
                        isActive ? 'bg-primary border-primary' : 'bg-card border-border'
                      }`}
                    >
                      <Text
                        className={`text-xs font-bold ${
                          isActive ? 'text-primary-foreground' : 'text-foreground'
                        }`}
                      >
                        {court.name}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </ScrollView>
          </View>
        )}

        {/* Time of day filter */}
        <View className="px-4 mb-4">
          <SegmentedControl
            segments={TIME_SEGMENT_LABELS}
            selectedIndex={timeOfDayIdx}
            onChange={(idx) => setTimeOfDayIdx(idx)}
            variant="pill"
          />
        </View>

        {/* Slot grid */}
        <View className="px-4 mb-4">
          <View className="flex-row items-center justify-between mb-2">
            <Text className="text-foreground font-bold">Available Slots</Text>
            <View className="flex-row gap-3">
              <View className="flex-row items-center gap-1">
                <View className="w-2 h-2 rounded-full bg-success" />
                <Text className="text-muted-foreground text-[10px]">Free</Text>
              </View>
              <View className="flex-row items-center gap-1">
                <View className="w-2 h-2 rounded-full bg-accent" />
                <Text className="text-muted-foreground text-[10px]">Selected</Text>
              </View>
              <View className="flex-row items-center gap-1">
                <View className="w-2 h-2 rounded-full bg-border" />
                <Text className="text-muted-foreground text-[10px]">Booked</Text>
              </View>
            </View>
          </View>

          {slotsLoading || courtsLoading ? (
            <SkeletonCard lines={6} />
          ) : (
            <SlotGrid
              occupiedSlots={occupiedSlots as OccupiedSlot[]}
              selectedSlots={selectedSlots}
              onSlotToggle={toggleSlot}
              timeOfDay={TIME_SEGMENTS[timeOfDayIdx]}
              startHour={startHour}
              endHour={endHour}
              selectedDate={selectedDate}
            />
          )}
        </View>
      </ScrollView>

      {/* Sticky CTA */}
      <View className="absolute bottom-0 left-0 right-0 bg-background border-t border-border px-4 py-4">
        {selectedSlots.length > 0 && (
          <View className="bg-slate-50 dark:bg-slate-900 border border-border rounded-xl p-3 mb-3 flex-row items-center justify-between">
            <View className="flex-row items-center gap-3">
              <View className="w-8 h-8 rounded-full bg-primary/20 items-center justify-center">
                <Clock size={16} color={colors.primary} />
              </View>
              <View>
                <Text className="text-foreground font-black text-sm">
                  {formatSlotRange(selectedSlots)}
                </Text>
                <Text className="text-muted-foreground text-[10px] font-medium mt-0.5">
                  {selectedSlots.length} slot{selectedSlots.length > 1 ? 's' : ''} • {durationMinutes} min • {activeCourtName}
                </Text>
              </View>
            </View>
            <View className="items-end">
              <Text className="text-foreground font-black text-base">
                ₹{estimatedPrice !== null ? estimatedPrice / 100 : '---'}
              </Text>
            </View>
          </View>
        )}

        <TouchableOpacity
          className={`rounded-2xl py-4 items-center ${
            selectedSlots.length === 0 ? 'bg-muted opacity-50' : 'bg-primary'
          }`}
          onPress={handleContinue}
          disabled={selectedSlots.length === 0}
          activeOpacity={0.85}
        >
          <Text
            className={`font-black text-base ${
              selectedSlots.length === 0 ? 'text-muted-foreground' : 'text-primary-foreground'
            }`}
          >
            {selectedSlots.length === 0 ? 'Select a slot to continue' : 'Continue →'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
