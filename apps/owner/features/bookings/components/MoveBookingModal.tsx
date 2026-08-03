import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ActivityIndicator, ScrollView, Platform } from 'react-native';
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

// Removed hardcoded timeSlots

export function MoveBookingModal({ visible, booking, courts, onClose, onMove }: MoveBookingModalProps) {
  if (!booking) return null;

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

  // Generate date options (today + 6 days)
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
      
      // We assume advance payments haven't changed, just pending balance
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

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <View style={styles.header}>
            <Text style={styles.title}>Move Booking</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <X size={18} color="#64748B" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
            <Text style={styles.subtitle}>
              Moving <Text style={styles.boldText}>{booking.booking_number}</Text> ({booking.customer?.full_name || 'Guest'})
            </Text>

            {/* Select Court */}
            <View style={styles.section}>
              <View style={styles.sectionTitleRow}>
                <MapPin size={16} color="#475569" />
                <Text style={styles.sectionTitle}>Select Court</Text>
              </View>
              <View style={styles.pillsContainer}>
                {courts.map((c) => {
                  const active = selectedCourtId === c.id;
                  return (
                    <TouchableOpacity
                      key={c.id}
                      style={[styles.pill, active && styles.pillActive]}
                      onPress={() => {
                        setSelectedCourtId(c.id);
                        setOverlapDetected(false);
                      }}
                    >
                      <Text style={[styles.pillText, active && styles.pillTextActive]}>{c.name}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Select Date */}
            <View style={styles.section}>
              <View style={styles.sectionTitleRow}>
                <Calendar size={16} color="#475569" />
                <Text style={styles.sectionTitle}>Select Date</Text>
              </View>
              <View style={styles.pillsContainer}>
                {dateOptions.map((d) => {
                  const active = selectedDate === d.value;
                  return (
                    <TouchableOpacity
                      key={d.value}
                      style={[styles.pill, active && styles.pillActive]}
                      onPress={() => {
                        setSelectedDate(d.value);
                        setOverlapDetected(false);
                      }}
                    >
                      <Text style={[styles.pillText, active && styles.pillTextActive]}>{d.label}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Select Start Time */}
            <View style={styles.section}>
              <View style={styles.sectionTitleRow}>
                <Clock size={16} color="#475569" />
                <Text style={styles.sectionTitle}>Start Time</Text>
              </View>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.timeScroll}>
                {timeSlots.map((t) => {
                  const active = selectedStartTime === t;
                  const label = t.slice(0, 5);
                  return (
                    <TouchableOpacity
                      key={t}
                      style={[styles.timePill, active && styles.timePillActive]}
                      onPress={() => {
                        setSelectedStartTime(t);
                        setOverlapDetected(false);
                      }}
                    >
                      <Text style={[styles.timeText, active && styles.timeTextActive]}>{label}</Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>

            {/* Select Duration */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Duration</Text>
              <View style={styles.pillsContainer}>
                {[0.5, 1, 1.5, 2, 2.5, 3].map((h) => {
                  const active = durationHours === h;
                  return (
                    <TouchableOpacity
                      key={h}
                      style={[styles.pill, active && styles.pillActive]}
                      onPress={() => {
                        setDurationHours(h);
                        setOverlapDetected(false);
                      }}
                    >
                      <Text style={[styles.pillText, active && styles.pillTextActive]}>{h} Hour{h > 1 ? 's' : ''}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {error ? (
              <View style={[styles.errorBox, overlapDetected && styles.overlapBox]}>
                {overlapDetected && <AlertTriangle size={18} color="#D97706" />}
                <Text style={[styles.errorText, overlapDetected && styles.overlapText]}>{error}</Text>
              </View>
            ) : null}
          </ScrollView>

          <View style={styles.footer}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose} disabled={loading}>
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>

            {overlapDetected ? (
              <TouchableOpacity
                style={styles.forceBtn}
                onPress={() => handleAttemptMove(true)}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <>
                    <AlertTriangle size={16} color="#fff" />
                    <Text style={styles.forceBtnText}>Force Move</Text>
                  </>
                )}
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={styles.saveBtn}
                onPress={() => handleAttemptMove(false)}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <>
                    <CheckCircle2 size={16} color="#fff" />
                    <Text style={styles.saveBtnText}>Move Booking</Text>
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

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    width: '100%',
    maxHeight: '90%',
    backgroundColor: '#fff',
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
  },
  closeBtn: {
    padding: 6,
    borderRadius: 16,
    backgroundColor: '#F8FAFC',
  },
  body: {
    padding: 20,
  },
  subtitle: {
    fontSize: 14,
    color: '#475569',
    marginBottom: 16,
  },
  boldText: {
    fontWeight: '700',
    color: '#0F172A',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#334155',
  },
  pillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  pill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  pillActive: {
    backgroundColor: '#EFF6FF',
    borderColor: '#2563EB',
  },
  pillText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
  },
  pillTextActive: {
    color: '#2563EB',
    fontWeight: '700',
  },
  timeScroll: {
    gap: 8,
  },
  timePill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  timePillActive: {
    backgroundColor: '#EFF6FF',
    borderColor: '#2563EB',
  },
  timeText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
  },
  timeTextActive: {
    color: '#2563EB',
    fontWeight: '700',
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: 12,
    padding: 12,
    marginTop: 8,
  },
  overlapBox: {
    backgroundColor: '#FFFBEB',
    borderColor: '#FDE68A',
  },
  errorText: {
    flex: 1,
    color: '#DC2626',
    fontSize: 13,
    fontWeight: '600',
  },
  overlapText: {
    color: '#92400E',
  },
  footer: {
    flexDirection: 'row',
    gap: 12,
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#64748B',
  },
  saveBtn: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: '#2563EB',
  },
  saveBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#fff',
  },
  forceBtn: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: '#D97706',
  },
  forceBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#fff',
  },
});
