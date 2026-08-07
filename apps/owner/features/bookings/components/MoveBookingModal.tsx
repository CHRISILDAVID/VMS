import React, { useState } from 'react';
import { View, Text, Modal, TouchableOpacity, ActivityIndicator, ScrollView } from 'react-native';
import { BookingWithDetails } from '@vms/shared/services';
import { Court } from '@vms/shared/types';
import { X, Calendar, Clock, MapPin, AlertTriangle, CheckCircle2 } from 'lucide-react-native';
import { useCurrentVenue } from '../../../hooks/useVenues';
import { generateTimeSlots, parseTimeToHour } from '../../schedule/utils/scheduleHelpers';
import { computeDynamicPrice } from '@vms/shared/utils';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../../lib/supabase';
import { createScheduleService } from '@vms/shared/services';
import { DayOfWeek } from '@vms/shared/types';
import { useThemeColors } from '../../../hooks/useThemeColors';

interface MoveBookingModalProps {
  visible: boolean;
  booking: BookingWithDetails | null;
  courts: Court[];
  onClose: () => void;
  onMove: (
    updates: {
      date: string;
      start_time: string;
      end_time: string;
      duration_minutes: number;
      court_id: string;
      venue_id: string;
      base_amount?: number;
      final_amount?: number;
      pending?: number;
    },
    isForceBooked?: boolean
  ) => Promise<any>;
}

export function MoveBookingModal({ visible, booking, courts, onClose, onMove }: MoveBookingModalProps) {
  if (!booking) return null;

  const { colors } = useThemeColors();
  const [selectedCourtId, setSelectedCourtId] = useState<string>(booking.court_id);
  const [selectedDate, setSelectedDate] = useState<string>(booking.date);
  const [selectedStartTime, setSelectedStartTime] = useState<string>(booking.start_time);
  const [durationHours, setDurationHours] = useState<number>((booking.duration_minutes || 60) / 60);

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [overlapDetected, setOverlapDetected] = useState<boolean>(false);

  const currentVenue = useCurrentVenue();
  const openHour = currentVenue ? parseTimeToHour(currentVenue.open_time) : 6;
  let closeHour = currentVenue ? parseTimeToHour(currentVenue.close_time) : 22;
  
  if (closeHour <= openHour) {
    closeHour += 24;
  }

  const timeSlots = React.useMemo(() => {
    return generateTimeSlots(openHour, closeHour);
  }, [openHour, closeHour]);

  React.useEffect(() => {
    if (booking) {
      setSelectedCourtId(booking.court_id);
      setSelectedDate(booking.date);
      setSelectedStartTime(booking.start_time);
      setDurationHours((booking.duration_minutes || 60) / 60);
      setError(null);
      setOverlapDetected(false);
    }
  }, [booking, visible]);

  const dateOptions = React.useMemo(() => {
    const list = [];
    const today = new Date();
    for (let i = 0; i < 7; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      const str = d.toISOString().split('T')[0];
      const label = i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
      list.push({ label, value: str });
    }
    return list;
  }, []);

  const scheduleService = React.useMemo(() => createScheduleService(supabase), []);
  const selectedDayOfWeek = React.useMemo(() => {
    return new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'short' }).toLowerCase() as DayOfWeek;
  }, [selectedDate]);

  const { data: schedule } = useQuery({
    queryKey: ['operating_schedule', booking?.venue_id, selectedDayOfWeek],
    queryFn: () => scheduleService.getOperatingSchedule(booking!.venue_id, selectedDayOfWeek),
    enabled: !!booking?.venue_id && !!selectedDayOfWeek,
  });

  const computeEndTime = (startStr: string, durHours: number) => {
    const [hours, mins] = startStr.split(':').map(Number);
    const endH = hours + durHours;
    return `${endH.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:00`;
  };

  const handleAttemptMove = async (force = false) => {
    setError(null);
    setOverlapDetected(false);
    setLoading(true);

    const endTime = computeEndTime(selectedStartTime, durationHours);
    const durationMinutes = durationHours * 60;

    let base_amount = booking.base_amount || 0;
    let final_amount = booking.final_amount || 0;
    let pending = booking.pending || 0;

    if (schedule?.pricing_blocks && schedule.pricing_blocks.length > 0) {
      const newBaseRs = computeDynamicPrice(selectedStartTime, durationMinutes, schedule.pricing_blocks, 40000);
      const newBasePaise = Math.round(newBaseRs * 100);
      
      const originalBasePaise = booking.base_amount || 0;
      const originalFinalPaise = booking.final_amount || 0;
      const discountPaise = Math.max(0, originalBasePaise - originalFinalPaise);
      
      base_amount = newBasePaise;
      final_amount = Math.max(0, newBasePaise - discountPaise);
      
      const advancePaise = (booking.final_amount || 0) - (booking.pending || 0);
      pending = Math.max(0, final_amount - advancePaise);
    }

    try {
      await onMove(
        {
          date: selectedDate,
          start_time: selectedStartTime,
          end_time: endTime,
          duration_minutes: durationMinutes,
          court_id: selectedCourtId,
          venue_id: booking.venue_id,
          base_amount,
          final_amount,
          pending,
        },
        force
      );
      onClose();
    } catch (err: any) {
      if (err.code === 'OVERLAP_DETECTED' || err.message?.includes('OVERLAP_DETECTED')) {
        setOverlapDetected(true);
        setError('Slot Overlap Detected! Another booking or membership exists during this time.');
      } else {
        setError(err.message || 'Failed to move booking');
      }
    } finally {
      setLoading(false);
    }
  };

  const renderPill = (label: string, active: boolean, onPress: () => void, key: string) => (
    <TouchableOpacity
      key={key}
      className={`px-3.5 py-2 rounded-full border ${active ? 'bg-primary/10 border-primary' : 'bg-muted border-border'}`}
      onPress={onPress}
    >
      <Text className={`text-[13px] font-semibold ${active ? 'text-primary font-bold' : 'text-muted-foreground'}`}>{label}</Text>
    </TouchableOpacity>
  );

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View className="flex-1 bg-black/50 justify-center items-center p-5">
        <View className="w-full max-h-[90%] bg-card rounded-3xl overflow-hidden shadow-xl">
          <View className="flex-row justify-between items-center px-5 py-4 border-b border-border">
            <Text className="text-lg font-bold text-foreground">Move Booking</Text>
            <TouchableOpacity onPress={onClose} className="p-1.5 rounded-2xl bg-muted">
              <X size={18} color={colors.mutedForeground} />
            </TouchableOpacity>
          </View>

          <ScrollView className="p-5" showsVerticalScrollIndicator={false}>
            <Text className="text-sm text-muted-foreground mb-4">
              Moving <Text className="font-bold text-foreground">{booking.booking_number}</Text> ({booking.customer?.full_name || 'Guest'})
            </Text>

            {/* Select Court */}
            <View className="mb-5">
              <View className="flex-row items-center gap-2 mb-2.5">
                <MapPin size={16} color={colors.foreground} />
                <Text className="text-sm font-bold text-foreground">Select Court</Text>
              </View>
              <View className="flex-row flex-wrap gap-2">
                {courts.map((c) => renderPill(c.name, selectedCourtId === c.id, () => { setSelectedCourtId(c.id); setOverlapDetected(false); }, c.id))}
              </View>
            </View>

            {/* Select Date */}
            <View className="mb-5">
              <View className="flex-row items-center gap-2 mb-2.5">
                <Calendar size={16} color={colors.foreground} />
                <Text className="text-sm font-bold text-foreground">Select Date</Text>
              </View>
              <View className="flex-row flex-wrap gap-2">
                {dateOptions.map((d) => renderPill(d.label, selectedDate === d.value, () => { setSelectedDate(d.value); setOverlapDetected(false); }, d.value))}
              </View>
            </View>

            {/* Select Start Time */}
            <View className="mb-5">
              <View className="flex-row items-center gap-2 mb-2.5">
                <Clock size={16} color={colors.foreground} />
                <Text className="text-sm font-bold text-foreground">Start Time</Text>
              </View>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
                {timeSlots.map((t) => renderPill(t.slice(0, 5), selectedStartTime === t, () => { setSelectedStartTime(t); setOverlapDetected(false); }, t))}
              </ScrollView>
            </View>

            {/* Select Duration */}
            <View className="mb-5">
              <Text className="text-sm font-bold text-foreground mb-2.5">Duration</Text>
              <View className="flex-row flex-wrap gap-2">
                {[0.5, 1, 1.5, 2, 2.5, 3].map((h) => renderPill(`${h} Hour${h > 1 ? 's' : ''}`, durationHours === h, () => { setDurationHours(h); setOverlapDetected(false); }, h.toString()))}
              </View>
            </View>

            {error ? (
              <View className={`flex-row items-center gap-2 rounded-xl p-3 mt-2 border ${overlapDetected ? 'bg-amber-50 dark:bg-amber-900/30 border-amber-200 dark:border-amber-800' : 'bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-800'}`}>
                {overlapDetected && <AlertTriangle size={18} color="#D97706" />}
                <Text style={{ flex: 1, color: overlapDetected ? '#92400E' : '#DC2626', fontSize: 13, fontWeight: '600' }}>{error}</Text>
              </View>
            ) : null}
          </ScrollView>

          <View className="flex-row gap-3 p-5 border-t border-border">
            <TouchableOpacity className="flex-1 py-3.5 rounded-xl bg-muted items-center justify-center" onPress={onClose} disabled={loading}>
              <Text className="text-[15px] font-bold text-muted-foreground">Cancel</Text>
            </TouchableOpacity>

            {overlapDetected ? (
              <TouchableOpacity
                className="flex-[2] flex-row items-center justify-center gap-2 py-3.5 rounded-xl"
                style={{ backgroundColor: '#D97706' }}
                onPress={() => handleAttemptMove(true)}
                disabled={loading}
              >
                {loading ? <ActivityIndicator size="small" color="#fff" /> : (
                  <>
                    <AlertTriangle size={16} color="#fff" />
                    <Text className="text-[15px] font-bold text-white">Force Move</Text>
                  </>
                )}
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                className="flex-[2] flex-row items-center justify-center gap-2 py-3.5 rounded-xl bg-primary"
                onPress={() => handleAttemptMove(false)}
                disabled={loading}
              >
                {loading ? <ActivityIndicator size="small" color="#fff" /> : (
                  <>
                    <CheckCircle2 size={16} color="#fff" />
                    <Text className="text-[15px] font-bold text-white">Move Booking</Text>
                  </>
                )}
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
}
