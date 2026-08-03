import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Alert, Linking, Switch, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, ArrowRight, Check, Search, MessageCircle, AlertTriangle, Plus, Calendar, Clock, MapPin, User as UserIcon, IndianRupee } from 'lucide-react-native';
import { format } from 'date-fns';

import { useCourts } from '../../hooks/useCourts';
import { useVenueStore } from '../../stores/venueStore';
import { useCurrentVenue } from '../../hooks/useVenues';
import { generateTimeSlots, parseTimeToHour } from '../../features/schedule/utils/scheduleHelpers';
import { useCustomers, useCreateOrGetCustomer } from '../../features/customers/hooks/useCustomers';
import { useCreateBooking } from '../../features/bookings/hooks/useBookings';
import { Customer, Court, PaymentMethod, DayOfWeek } from '@vms/shared/types';
import { COLORS, computeDynamicPrice } from '@vms/shared/utils';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import { createScheduleService } from '@vms/shared/services';

const STEPS = ['Date & Court', 'Time', 'Customer', 'Payment', 'Confirm'];

// Removed hardcoded timeSlots

const durationOptions = [
  { label: '30 min', mins: 30, hours: 0.5 },
  { label: '1 hour', mins: 60, hours: 1 },
  { label: '1.5 hours', mins: 90, hours: 1.5 },
  { label: '2 hours', mins: 120, hours: 2 },
  { label: '2.5 hours', mins: 150, hours: 2.5 },
  { label: '3 hours', mins: 180, hours: 3 },
];

export default function NewBookingWizardScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ courtId?: string; date?: string; hour?: string }>();
  const { selectedVenueId } = useVenueStore();

  const currentVenue = useCurrentVenue();
  const { data: courts } = useCourts(selectedVenueId);

  const openHour = currentVenue ? parseTimeToHour(currentVenue.open_time) : 6;
  let closeHour = currentVenue ? parseTimeToHour(currentVenue.close_time) : 22;

  if (closeHour <= openHour) {
    closeHour += 24;
  }

  const timeSlots = useMemo(() => {
    return generateTimeSlots(openHour, closeHour);
  }, [openHour, closeHour]);

  // Wizard state
  const [step, setStep] = useState(0);

  // Step 0: Date & Court
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    return params.date || format(new Date(), 'yyyy-MM-dd');
  });
  const [selectedCourtId, setSelectedCourtId] = useState<string>(() => {
    return params.courtId || '';
  });

  // Step 1: Time
  const [selectedTime, setSelectedTime] = useState<string>(() => {
    if (params.hour) {
      const hStr = parseInt(params.hour, 10).toString().padStart(2, '0');
      return `${hStr}:00:00`;
    }
    const now = new Date();
    const currMin = now.getMinutes() >= 30 ? 30 : 0;
    const currHour = now.getHours();
    return `${currHour.toString().padStart(2, '0')}:${currMin.toString().padStart(2, '0')}:00`;
  });
  const [selectedDurationMins, setSelectedDurationMins] = useState<number>(60);
  const [isBlockSlot, setIsBlockSlot] = useState<boolean>(false);

  // Step 2: Customer
  const [customerSearch, setCustomerSearch] = useState<string>('');
  const { data: customers } = useCustomers(customerSearch);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  // New Customer inline creation
  const [showNewCustForm, setShowNewCustForm] = useState(false);
  const [newCustName, setNewCustName] = useState('');
  const [newCustPhone, setNewCustPhone] = useState('');
  const createCustomerMutation = useCreateOrGetCustomer();

  // Step 3: Payment & Source
  const [paymentMode, setPaymentMode] = useState<PaymentMethod>('cash');
  const [bookingSource, setBookingSource] = useState<string>('offline');
  const [customAmountRs, setCustomAmountRs] = useState<string>(''); // if owner wants to override
  const [advanceRs, setAdvanceRs] = useState<string>('');
  const [sendWhatsapp, setSendWhatsapp] = useState<boolean>(true);

  // Step 4: Confirm result
  const [confirmedBooking, setConfirmedBooking] = useState<any | null>(null);
  const [overlapError, setOverlapError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const createBookingMutation = useCreateBooking();

  // Set default court if courts load and none selected
  React.useEffect(() => {
    if (courts && courts.length > 0 && !selectedCourtId) {
      setSelectedCourtId(courts[0].id);
    }
  }, [courts, selectedCourtId]);

  const scheduleService = useMemo(() => createScheduleService(supabase), []);
  const selectedDay = useMemo(() => {
    return new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'short' }).toLowerCase() as DayOfWeek;
  }, [selectedDate]);

  const { data: schedule } = useQuery({
    queryKey: ['operating_schedule', selectedVenueId, selectedDay],
    queryFn: () => scheduleService.getOperatingSchedule(selectedVenueId!, selectedDay),
    enabled: !!selectedVenueId && !!selectedDay,
  });

  const computedTotalRs = useMemo(() => {
    if (schedule?.pricing_blocks && schedule.pricing_blocks.length > 0) {
      return computeDynamicPrice(selectedTime, selectedDurationMins, schedule.pricing_blocks, 40000);
    }
    const hours = selectedDurationMins / 60;
    return Math.round(hours * 400);
  }, [selectedDurationMins, selectedTime, schedule]);

  const finalTotalRs = useMemo(() => {
    if (customAmountRs && customAmountRs.trim() !== '') {
      const parsed = parseFloat(customAmountRs);
      if (!isNaN(parsed)) return parsed;
    }
    return computedTotalRs;
  }, [customAmountRs, computedTotalRs]);

  // Default advance to full amount when step transitions to 3
  React.useEffect(() => {
    if (step === 3 && advanceRs === '') {
      setAdvanceRs(finalTotalRs.toString());
    }
  }, [step, finalTotalRs]);

  const canNext = () => {
    if (step === 0) return !!selectedDate && !!selectedCourtId;
    if (step === 1) {
      if (!selectedTime || !selectedDurationMins) return false;
      const slotDateTime = new Date(`${selectedDate}T${selectedTime}`);
      const now = new Date();
      const currentBlock = new Date(now);
      currentBlock.setMinutes(now.getMinutes() >= 30 ? 30 : 0, 0, 0);
      if (slotDateTime < currentBlock) return false;
      return true;
    }
    if (step === 2) return !!selectedCustomer;
    return true;
  };

  const computeEndTime = (startStr: string, mins: number) => {
    const [h, m] = startStr.split(':').map(Number);
    const totalM = h * 60 + m + mins;
    const endH = Math.floor(totalM / 60) % 24;
    const endM = totalM % 60;
    return `${endH.toString().padStart(2, '0')}:${endM.toString().padStart(2, '0')}:00`;
  };

  const handleCreateCustomer = async () => {
    if (!newCustName.trim() || !newCustPhone.trim()) {
      Alert.alert('Error', 'Please enter customer name and phone');
      return;
    }
    const cleanPhone = newCustPhone.replace(/\D/g, '');
    if (cleanPhone.length !== 10) {
      Alert.alert('Error', 'Phone number must be exactly 10 digits.');
      return;
    }
    try {
      const created = await createCustomerMutation.mutateAsync({
        full_name: newCustName.trim(),
        phone: `91${cleanPhone}`,
      });
      setSelectedCustomer(created);
      setShowNewCustForm(false);
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to create customer');
    }
  };

  const handleConfirmBooking = async (force = false) => {
    if (!selectedVenueId || !selectedCourtId) return;
    if (!isBlockSlot && !selectedCustomer) return;
    setOverlapError(null);
    setIsSubmitting(true);

    const endTime = computeEndTime(selectedTime, selectedDurationMins);
    const totalPaise = Math.round(finalTotalRs * 100);
    const advPaise = Math.round((parseFloat(advanceRs) || 0) * 100);
    const pendingPaise = Math.max(0, totalPaise - advPaise);

    let paymentStatus = 'pending';
    if (pendingPaise === 0 && totalPaise > 0) paymentStatus = 'paid';
    else if (advPaise > 0) paymentStatus = 'partial';

    const payload = isBlockSlot ? {
      venue_id: selectedVenueId,
      court_id: selectedCourtId,
      customer_id: null,
      date: selectedDate,
      start_time: selectedTime,
      end_time: endTime,
      duration_minutes: selectedDurationMins,
      base_amount: 0,
      discount: 0,
      final_amount: 0,
      pending: 0,
      status: 'upcoming', // blocked slots don't need payment
      payment_status: 'paid',
      payment_mode: null,
      source: 'offline',
      slot_type: 'blocked',
    } : {
      venue_id: selectedVenueId,
      court_id: selectedCourtId,
      customer_id: selectedCustomer?.id,
      date: selectedDate,
      start_time: selectedTime,
      end_time: endTime,
      duration_minutes: selectedDurationMins,
      base_amount: totalPaise,
      discount: 0,
      final_amount: totalPaise,
      advance: advPaise,
      pending: pendingPaise,
      status: 'upcoming',
      payment_status: paymentStatus,
      payment_mode: paymentMode,
      source: bookingSource,
      slot_type: 'booked',
    };

    try {
      const created = (await createBookingMutation.mutateAsync({
        data: payload,
        isForceBooked: force,
      })) as any;
      setConfirmedBooking(created);

      // Trigger WhatsApp if checked and customer has phone
      if (sendWhatsapp && selectedCustomer?.phone) {
        const cleanPhone = selectedCustomer.phone.replace(/\D/g, '');
        const waPhone = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
        const courtName = courts?.find(c => c.id === selectedCourtId)?.name || 'Court';
        const msg = `Hi ${selectedCustomer.full_name}, your booking (${created.booking_number}) is confirmed for ${selectedDate} at ${selectedTime.slice(0, 5)} on ${courtName}. Total: ₹${finalTotalRs}. Thank you!`;
        Linking.openURL(`https://wa.me/${waPhone}?text=${encodeURIComponent(msg)}`).catch(() => {
          console.log('WhatsApp or browser could not be opened on device, skipping auto-launch.');
        });
      }

      setStep(4); // Move to Step 4 (Confirm screen)
    } catch (err: any) {
      if (err.code === 'OVERLAP_DETECTED' || err.message?.includes('OVERLAP_DETECTED')) {
        const conflict = err.conflicts?.[0];
        if (conflict) {
          Alert.alert('Booking Conflict', 'This slot is already booked.');
          const formattedTime = conflict.start_time.substring(0, 5);
          router.navigate({
            pathname: '/(tabs)/schedule',
            params: { conflictCourtId: conflict.court_id, conflictTime: formattedTime }
          });
        } else {
          setOverlapError('Slot Overlap Detected! Another booking or membership exists during this time.');
        }
      } else {
        Alert.alert('Error', err.message || 'Failed to create booking');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedCourtName = courts?.find(c => c.id === selectedCourtId)?.name || 'Court';
  const endTimeStr = computeEndTime(selectedTime, selectedDurationMins);

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity
            style={styles.backIconBtn}
            onPress={() => {
              if (step > 0 && step < 4) setStep(step - 1);
              else router.back();
            }}
          >
            <ArrowLeft size={18} color="#0F172A" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>New Booking</Text>
        </View>

        {/* Progress Bar */}
        <View style={styles.progressRow}>
          {STEPS.map((s, i) => {
            const isCompleted = i < step;
            const isCurrent = i === step;
            return (
              <React.Fragment key={i}>
                <View
                  style={[
                    styles.stepCircle,
                    isCompleted ? styles.stepCompleted : isCurrent ? styles.stepCurrent : null,
                  ]}
                >
                  {isCompleted ? (
                    <Check size={14} color="#fff" />
                  ) : (
                    <Text style={[styles.stepNum, isCurrent && { color: '#fff' }]}>{i + 1}</Text>
                  )}
                </View>
                {i < STEPS.length - 1 && (
                  <View style={[styles.stepLine, isCompleted && styles.stepLineCompleted]} />
                )}
              </React.Fragment>
            );
          })}
        </View>
        <Text style={styles.stepTitleText}>
          Step {step + 1} of {STEPS.length} · {STEPS[step]}
        </Text>
      </View>

      <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
        {/* Step 0: Date & Court */}
        {step === 0 && (
          <View>
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Select Date (YYYY-MM-DD)</Text>
              <View style={styles.dateInputBox}>
                <Calendar size={18} color="#64748B" />
                <TextInput
                  style={styles.dateInput}
                  value={selectedDate}
                  onChangeText={setSelectedDate}
                  placeholder="2026-07-26"
                  placeholderTextColor="#94A3B8"
                />
              </View>
              {/* Quick Date Pills */}
              <View style={styles.quickDatesRow}>
                {[0, 1, 2, 3].map(days => {
                  const d = new Date();
                  d.setDate(d.getDate() + days);
                  const dStr = format(d, 'yyyy-MM-dd');
                  const label = days === 0 ? 'Today' : days === 1 ? 'Tomorrow' : format(d, 'EEE, MMM d');
                  const active = selectedDate === dStr;
                  return (
                    <TouchableOpacity
                      key={dStr}
                      style={[styles.quickDatePill, active && styles.quickDatePillActive]}
                      onPress={() => setSelectedDate(dStr)}
                    >
                      <Text style={[styles.quickDateText, active && styles.quickDateTextActive]}>{label}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Select Court</Text>
              {!courts || courts.length === 0 ? (
                <Text style={styles.noDataText}>No courts found for this venue.</Text>
              ) : (
                <View style={styles.courtsGrid}>
                  {courts.map(c => {
                    const active = selectedCourtId === c.id;
                    return (
                      <TouchableOpacity
                        key={c.id}
                        style={[styles.courtCard, active && styles.courtCardActive]}
                        onPress={() => setSelectedCourtId(c.id)}
                      >
                        <Text style={[styles.courtNameText, active && styles.courtNameTextActive]}>{c.name}</Text>
                        <Text style={styles.courtStatusText}>Available</Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              )}
            </View>
          </View>
        )}

        {/* Step 1: Time & Duration */}
        {step === 1 && (
          <View>
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Start Time</Text>
              <View style={styles.timeGrid}>
                {timeSlots.map(t => {
                  const active = selectedTime === t;
                  const slotDateTime = new Date(`${selectedDate}T${t}`);
                  const now = new Date();
                  const currentBlock = new Date(now);
                  currentBlock.setMinutes(now.getMinutes() >= 30 ? 30 : 0, 0, 0);
                  const isPast = slotDateTime < currentBlock;
                  return (
                    <TouchableOpacity
                      key={t}
                      style={[styles.timeSlotBtn, active && styles.timeSlotBtnActive, isPast && { opacity: 0.5, backgroundColor: '#F1F5F9' }]}
                      onPress={() => {
                        if (isPast) {
                          Alert.alert('Invalid Time', 'Cannot book slots in the past.');
                          return;
                        }
                        setSelectedTime(t);
                      }}
                    >
                      <Text style={[styles.timeSlotText, active && styles.timeSlotTextActive, isPast && { color: '#94A3B8' }]}>
                        {t.slice(0, 5)}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Duration</Text>
              <View style={styles.durationsList}>
                {durationOptions.map(dur => {
                  const active = selectedDurationMins === dur.mins;
                  const price = schedule?.pricing_blocks && schedule.pricing_blocks.length > 0
                    ? computeDynamicPrice(selectedTime, dur.mins, schedule.pricing_blocks, 40000)
                    : Math.round(dur.hours * 400);
                  return (
                    <TouchableOpacity
                      key={dur.mins}
                      style={[styles.durationCard, active && styles.durationCardActive]}
                      onPress={() => setSelectedDurationMins(dur.mins)}
                    >
                      <Text style={[styles.durationLabel, active && styles.durationLabelActive]}>{dur.label}</Text>
                      <Text style={styles.durationPriceText}>₹{price}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Block Court</Text>
              <TouchableOpacity
                style={[styles.durationCard, isBlockSlot && styles.durationCardActive, { marginTop: 8 }]}
                onPress={() => setIsBlockSlot(!isBlockSlot)}
              >
                <View style={{ flex: 1 }}>
                  <Text style={[styles.durationLabel, isBlockSlot && styles.durationLabelActive]}>Block this slot</Text>
                  <Text style={{ fontSize: 13, color: '#64748B', marginTop: 2 }}>No customer required. Court will be marked as blocked.</Text>
                </View>
                {isBlockSlot && <Check size={20} color="#2563EB" />}
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Step 2: Customer */}
        {step === 2 && (
          <View>
            <View style={styles.searchBarBox}>
              <Search size={18} color="#94A3B8" />
              <TextInput
                style={styles.searchInput}
                placeholder="Search customer name or phone..."
                placeholderTextColor="#94A3B8"
                value={customerSearch}
                onChangeText={setCustomerSearch}
              />
            </View>

            {selectedCustomer ? (
              <View style={styles.selectedCustCard}>
                <Text style={styles.selectedCustLabel}>SELECTED CUSTOMER</Text>
                <Text style={styles.selectedCustName}>{selectedCustomer.full_name}</Text>
                <Text style={styles.selectedCustPhone}>
                  {selectedCustomer.phone} · {selectedCustomer.total_visits || 0} visits
                </Text>
              </View>
            ) : null}

            {showNewCustForm ? (
              <View style={styles.newCustFormBox}>
                <Text style={styles.newCustFormTitle}>Add New Customer</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Full Name (e.g. Rahul Varma)"
                  placeholderTextColor="#94A3B8"
                  value={newCustName}
                  onChangeText={setNewCustName}
                />
                <View style={[styles.input, { marginTop: 10, flexDirection: 'row', alignItems: 'center', padding: 0, paddingHorizontal: 12 }]}>
                  <Text style={{ color: '#64748B', fontWeight: '600', marginRight: 4 }}>+91</Text>
                  <TextInput
                    style={{ flex: 1, fontSize: 14, color: '#0F172A', paddingVertical: 12 }}
                    placeholder="9876543210"
                    placeholderTextColor="#94A3B8"
                    value={newCustPhone}
                    onChangeText={(text) => {
                       const num = text.replace(/\D/g, '');
                       if (num.length <= 10) setNewCustPhone(num);
                    }}
                    keyboardType="phone-pad"
                  />
                </View>
                <View style={styles.newCustFormBtns}>
                  <TouchableOpacity style={styles.cancelFormBtn} onPress={() => setShowNewCustForm(false)}>
                    <Text style={styles.cancelFormText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.saveCustBtn} onPress={handleCreateCustomer}>
                    <Text style={styles.saveCustText}>Save & Select</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <TouchableOpacity style={styles.addCustBtn} onPress={() => setShowNewCustForm(true)}>
                <Plus size={16} color="#2563EB" />
                <Text style={styles.addCustText}>Add New Customer</Text>
              </TouchableOpacity>
            )}

            <Text style={styles.sectionSubHeader}>RECENT CUSTOMERS</Text>
            <View style={styles.custsList}>
              {(!customers || customers.length === 0) && !showNewCustForm ? (
                <Text style={styles.noDataText}>No customers found. Click above to add one.</Text>
              ) : (
                (customers || []).map(c => {
                  const active = selectedCustomer?.id === c.id;
                  return (
                    <TouchableOpacity
                      key={c.id}
                      style={[styles.custItemCard, active && styles.custItemCardActive]}
                      onPress={() => setSelectedCustomer(c)}
                    >
                      <View style={styles.custAvatar}>
                        <Text style={styles.custAvatarText}>{c.full_name.charAt(0)}</Text>
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.custItemName}>{c.full_name}</Text>
                        <Text style={styles.custItemPhone}>{c.phone} · {c.total_visits || 0} visits</Text>
                      </View>
                      {active && <Check size={20} color="#2563EB" />}
                    </TouchableOpacity>
                  );
                })
              )}
            </View>
          </View>
        )}

        {/* Step 3: Payment & Summary */}
        {step === 3 && (
          <View>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryTitleText}>BOOKING SUMMARY</Text>
              <View style={styles.sumRow}><Text style={styles.sumLabel}>Court</Text><Text style={styles.sumVal}>{selectedCourtName}</Text></View>
              <View style={styles.sumRow}><Text style={styles.sumLabel}>Date</Text><Text style={styles.sumVal}>{selectedDate}</Text></View>
              <View style={styles.sumRow}><Text style={styles.sumLabel}>Time</Text><Text style={styles.sumVal}>{selectedTime.slice(0, 5)} – {endTimeStr.slice(0, 5)}</Text></View>
              <View style={styles.sumRow}><Text style={styles.sumLabel}>Duration</Text><Text style={styles.sumVal}>{selectedDurationMins / 60}h</Text></View>
              <View style={styles.sumRow}><Text style={styles.sumLabel}>Customer</Text><Text style={styles.sumVal}>{selectedCustomer?.full_name}</Text></View>
              <View style={styles.sumTotalRow}>
                <Text style={styles.sumTotalLabel}>Total Amount</Text>
                <View style={styles.totalInputContainer}>
                  <Text style={styles.totalRsSymbol}>₹</Text>
                  <TextInput
                    style={styles.totalRsInput}
                    value={customAmountRs !== '' ? customAmountRs : computedTotalRs.toString()}
                    onChangeText={setCustomAmountRs}
                    keyboardType="numeric"
                  />
                </View>
              </View>
            </View>

            <View style={styles.summaryCard}>
              <Text style={styles.summaryTitleText}>PAYMENT METHOD</Text>
              <View style={styles.paymentMethodsRow}>
                {(['cash', 'upi', 'card', 'online'] as PaymentMethod[]).map(m => {
                  const active = paymentMode === m;
                  return (
                    <TouchableOpacity
                      key={m}
                      style={[styles.payMethodBtn, active && styles.payMethodBtnActive]}
                      onPress={() => setPaymentMode(m)}
                    >
                      <Text style={[styles.payMethodText, active && styles.payMethodTextActive]}>
                        {m === 'upi' ? 'UPI' : m.charAt(0).toUpperCase() + m.slice(1)}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <Text style={[styles.summaryTitleText, { marginTop: 16 }]}>BOOKING SOURCE</Text>
              <View style={styles.sourcesRow}>
                {['offline', 'online', 'walk_in'].map(src => {
                  const active = bookingSource === src;
                  const label = src === 'walk_in' ? 'Walk-in' : src.charAt(0).toUpperCase() + src.slice(1);
                  return (
                    <TouchableOpacity
                      key={src}
                      style={[styles.sourceBtn, active && styles.sourceBtnActive]}
                      onPress={() => setBookingSource(src)}
                    >
                      <Text style={[styles.sourceText, active && styles.sourceTextActive]}>
                        {label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <View style={{ marginTop: 16 }}>
                <Text style={styles.label}>Advance Collected (₹)</Text>
                <View style={styles.advanceInputBox}>
                  <Text style={styles.advRsSymbol}>₹</Text>
                  <TextInput
                    style={styles.advanceInput}
                    value={advanceRs}
                    onChangeText={setAdvanceRs}
                    keyboardType="numeric"
                  />
                </View>
              </View>

              <View style={styles.whatsappRow}>
                <View style={styles.whatsappLeft}>
                  <MessageCircle size={18} color="#16A34A" />
                  <Text style={styles.whatsappText}>Send WhatsApp confirmation</Text>
                </View>
                <Switch
                  value={sendWhatsapp}
                  onValueChange={setSendWhatsapp}
                  trackColor={{ false: '#CBD5E1', true: '#BBF7D0' }}
                  thumbColor={sendWhatsapp ? '#16A34A' : '#f4f3f4'}
                />
              </View>
            </View>

            {overlapError && (
              <View style={styles.overlapBanner}>
                <AlertTriangle size={20} color="#D97706" />
                <Text style={styles.overlapBannerText}>{overlapError}</Text>
              </View>
            )}
          </View>
        )}

        {/* Step 4: Confirm Success */}
        {step === 4 && (
          <View style={styles.confirmBox}>
            <View style={styles.confirmIconCircle}>
              <Check size={44} color="#16A34A" />
            </View>
            <Text style={styles.confirmTitleText}>Booking Confirmed!</Text>
            <Text style={styles.confirmIdText}>
              Booking ID: {confirmedBooking?.booking_number || 'BK-SUCCESS'}
            </Text>

            <View style={styles.summaryCard}>
              <View style={styles.sumRow}><Text style={styles.sumLabel}>Customer</Text><Text style={styles.sumVal}>{selectedCustomer?.full_name}</Text></View>
              <View style={styles.sumRow}><Text style={styles.sumLabel}>Court</Text><Text style={styles.sumVal}>{selectedCourtName}</Text></View>
              <View style={styles.sumRow}><Text style={styles.sumLabel}>Date</Text><Text style={styles.sumVal}>{selectedDate}</Text></View>
              <View style={styles.sumRow}><Text style={styles.sumLabel}>Time</Text><Text style={styles.sumVal}>{selectedTime.slice(0, 5)} – {endTimeStr.slice(0, 5)}</Text></View>
              <View style={styles.sumRow}><Text style={styles.sumLabel}>Amount</Text><Text style={styles.sumVal}>₹{finalTotalRs}</Text></View>
              <View style={styles.sumRow}><Text style={styles.sumLabel}>Advance</Text><Text style={styles.sumVal}>₹{advanceRs || 0}</Text></View>
              <View style={styles.sumRow}><Text style={styles.sumLabel}>Payment</Text><Text style={styles.sumVal}>{paymentMode.toUpperCase()}</Text></View>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Footer Actions */}
      <View style={styles.footer}>
        {step < 4 ? (
          <View style={styles.footerBtnsRow}>
            {step > 0 && (
              <TouchableOpacity
                style={styles.backStepBtn}
                onPress={() => setStep(step - 1)}
                disabled={isSubmitting}
              >
                <Text style={styles.backStepText}>Back</Text>
              </TouchableOpacity>
            )}

            {step === 3 && overlapError ? (
              <TouchableOpacity
                style={styles.forceBookBtn}
                onPress={() => handleConfirmBooking(true)}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <>
                    <AlertTriangle size={18} color="#fff" />
                    <Text style={styles.nextStepText}>Force Confirm</Text>
                  </>
                )}
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={[styles.nextStepBtn, !canNext() && styles.nextStepBtnDisabled]}
                onPress={() => {
                  if (step === 1 && isBlockSlot) {
                    handleConfirmBooking(false);
                  } else if (step < 3) {
                    setStep(step + 1);
                  } else {
                    handleConfirmBooking(false);
                  }
                }}
                disabled={!canNext() || isSubmitting}
              >
                {isSubmitting ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <>
                    <Text style={[styles.nextStepText, !canNext() && { color: '#94A3B8' }]}>
                      {(step === 3 || (step === 1 && isBlockSlot)) ? (isBlockSlot ? 'Block Court' : 'Confirm Booking') : 'Continue'}
                    </Text>
                    <ArrowRight size={18} color={canNext() ? '#fff' : '#94A3B8'} />
                  </>
                )}
              </TouchableOpacity>
            )}
          </View>
        ) : (
          <TouchableOpacity
            style={styles.finishBtn}
            onPress={() => router.replace('/(tabs)/bookings' as any)}
          >
            <Text style={styles.finishBtnText}>Back to Bookings</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: { backgroundColor: '#fff', paddingHorizontal: 16, paddingTop: 12, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  headerTop: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 },
  backIconBtn: { width: 36, height: 36, borderRadius: 10, backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#E2E8F0', alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#0F172A' },
  progressRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  stepCircle: { width: 26, height: 26, borderRadius: 13, backgroundColor: '#E2E8F0', alignItems: 'center', justifyContent: 'center' },
  stepCompleted: { backgroundColor: '#16A34A' },
  stepCurrent: { backgroundColor: '#2563EB' },
  stepNum: { fontSize: 11, fontWeight: '700', color: '#64748B' },
  stepLine: { flex: 1, height: 2, backgroundColor: '#E2E8F0', marginHorizontal: 4 },
  stepLineCompleted: { backgroundColor: '#16A34A' },
  stepTitleText: { fontSize: 12, fontWeight: '600', color: '#64748B' },
  body: { flex: 1, padding: 16 },
  fieldGroup: { marginBottom: 20 },
  label: { fontSize: 13, fontWeight: '700', color: '#0F172A', marginBottom: 10 },
  dateInputBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderWidth: 1.5, borderColor: '#E2E8F0', borderRadius: 14, paddingHorizontal: 14, height: 48, gap: 10 },
  dateInput: { flex: 1, fontSize: 15, fontWeight: '600', color: '#0F172A' },
  quickDatesRow: { flexDirection: 'row', gap: 8, marginTop: 10 },
  quickDatePill: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, backgroundColor: '#fff', borderWidth: 1, borderColor: '#E2E8F0' },
  quickDatePillActive: { backgroundColor: '#EFF6FF', borderColor: '#2563EB' },
  quickDateText: { fontSize: 12, fontWeight: '600', color: '#64748B' },
  quickDateTextActive: { color: '#2563EB', fontWeight: '700' },
  courtsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  courtCard: { width: '48%', padding: 16, borderRadius: 14, borderWidth: 2, borderColor: '#E2E8F0', backgroundColor: '#fff' },
  courtCardActive: { borderColor: '#2563EB', backgroundColor: '#EFF6FF' },
  courtNameText: { fontSize: 14, fontWeight: '700', color: '#0F172A' },
  courtNameTextActive: { color: '#2563EB' },
  courtStatusText: { fontSize: 11, color: '#16A34A', fontWeight: '600', marginTop: 4 },
  timeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  timeSlotBtn: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 10, borderWidth: 1.5, borderColor: '#E2E8F0', backgroundColor: '#fff' },
  timeSlotBtnActive: { borderColor: '#2563EB', backgroundColor: '#2563EB' },
  timeSlotText: { fontSize: 13, fontWeight: '600', color: '#0F172A' },
  timeSlotTextActive: { color: '#fff' },
  durationsList: { gap: 10 },
  durationCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 14, borderRadius: 14, borderWidth: 1.5, borderColor: '#E2E8F0', backgroundColor: '#fff' },
  durationCardActive: { borderColor: '#2563EB', backgroundColor: '#EFF6FF' },
  durationLabel: { fontSize: 14, fontWeight: '600', color: '#0F172A' },
  durationLabelActive: { color: '#2563EB', fontWeight: '700' },
  durationPriceText: { fontSize: 14, fontWeight: '700', color: '#64748B' },
  searchBarBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderWidth: 1.5, borderColor: '#E2E8F0', borderRadius: 12, paddingHorizontal: 12, height: 46, gap: 8, marginBottom: 16 },
  searchInput: { flex: 1, fontSize: 14, color: '#0F172A' },
  selectedCustCard: { backgroundColor: '#EFF6FF', borderRadius: 14, padding: 14, marginBottom: 16, borderWidth: 1.5, borderColor: '#93C5FD' },
  selectedCustLabel: { fontSize: 11, fontWeight: '700', color: '#2563EB', letterSpacing: 0.5, marginBottom: 4 },
  selectedCustName: { fontSize: 16, fontWeight: '700', color: '#0F172A' },
  selectedCustPhone: { fontSize: 13, color: '#64748B', marginTop: 2 },
  addCustBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, padding: 14, backgroundColor: 'transparent', borderWidth: 1.5, borderColor: '#CBD5E1', borderStyle: 'dashed', borderRadius: 14, marginBottom: 16 },
  addCustText: { fontSize: 14, fontWeight: '700', color: '#2563EB' },
  newCustFormBox: { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: '#E2E8F0' },
  newCustFormTitle: { fontSize: 15, fontWeight: '700', color: '#0F172A', marginBottom: 12 },
  input: { borderWidth: 1, borderColor: '#CBD5E1', borderRadius: 12, padding: 12, fontSize: 14, color: '#0F172A', backgroundColor: '#F8FAFC' },
  newCustFormBtns: { flexDirection: 'row', gap: 10, marginTop: 14 },
  cancelFormBtn: { flex: 1, paddingVertical: 12, borderRadius: 10, backgroundColor: '#F8FAFC', alignItems: 'center', justifyContent: 'center' },
  cancelFormText: { fontWeight: '700', color: '#64748B' },
  saveCustBtn: { flex: 1.5, paddingVertical: 12, borderRadius: 10, backgroundColor: '#2563EB', alignItems: 'center', justifyContent: 'center' },
  saveCustText: { fontWeight: '700', color: '#fff' },
  sectionSubHeader: { fontSize: 11, fontWeight: '700', color: '#64748B', letterSpacing: 0.5, marginBottom: 10 },
  custsList: { gap: 10 },
  custItemCard: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderRadius: 14, borderWidth: 1.5, borderColor: '#E2E8F0', backgroundColor: '#fff' },
  custItemCardActive: { borderColor: '#2563EB', backgroundColor: '#EFF6FF' },
  custAvatar: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#EFF6FF', alignItems: 'center', justifyContent: 'center' },
  custAvatarText: { fontSize: 16, fontWeight: '700', color: '#2563EB' },
  custItemName: { fontSize: 14, fontWeight: '700', color: '#0F172A' },
  custItemPhone: { fontSize: 12, color: '#64748B', marginTop: 2 },
  summaryCard: { backgroundColor: '#fff', borderRadius: 18, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: '#F1F5F9' },
  summaryTitleText: { fontSize: 12, fontWeight: '700', color: '#64748B', letterSpacing: 0.5, marginBottom: 12 },
  sumRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#F8FAFC' },
  sumLabel: { fontSize: 13, color: '#64748B' },
  sumVal: { fontSize: 13, fontWeight: '600', color: '#0F172A' },
  sumTotalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 12, marginTop: 4 },
  sumTotalLabel: { fontSize: 15, fontWeight: '700', color: '#0F172A' },
  totalInputContainer: { flexDirection: 'row', alignItems: 'center' },
  totalRsSymbol: { fontSize: 18, fontWeight: '800', color: '#2563EB', marginRight: 2 },
  totalRsInput: { fontSize: 18, fontWeight: '800', color: '#2563EB', minWidth: 60, textAlign: 'right', padding: 0 },
  paymentMethodsRow: { flexDirection: 'row', gap: 8 },
  payMethodBtn: { flex: 1, paddingVertical: 12, borderRadius: 12, borderWidth: 1.5, borderColor: '#E2E8F0', backgroundColor: '#F8FAFC', alignItems: 'center' },
  payMethodBtnActive: { borderColor: '#2563EB', backgroundColor: '#EFF6FF' },
  payMethodText: { fontSize: 13, fontWeight: '600', color: '#64748B' },
  payMethodTextActive: { color: '#2563EB', fontWeight: '700' },
  sourcesRow: { flexDirection: 'row', gap: 6 },
  sourceBtn: { flex: 1, paddingVertical: 8, borderRadius: 10, borderWidth: 1.5, borderColor: '#E2E8F0', alignItems: 'center' },
  sourceBtnActive: { borderColor: '#2563EB', backgroundColor: '#EFF6FF' },
  sourceText: { fontSize: 11, fontWeight: '600', color: '#64748B' },
  sourceTextActive: { color: '#2563EB', fontWeight: '700' },
  advanceInputBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8FAFC', borderWidth: 1.5, borderColor: '#E2E8F0', borderRadius: 12, paddingHorizontal: 14, height: 46 },
  advRsSymbol: { fontSize: 16, fontWeight: '700', color: '#64748B', marginRight: 6 },
  advanceInput: { flex: 1, fontSize: 16, fontWeight: '700', color: '#0F172A' },
  whatsappRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 16, padding: 14, backgroundColor: '#F8FAFC', borderRadius: 12 },
  whatsappLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  whatsappText: { fontSize: 13, fontWeight: '600', color: '#0F172A' },
  overlapBanner: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#FFFBEB', borderWidth: 1.5, borderColor: '#FDE68A', borderRadius: 14, padding: 14, marginBottom: 16 },
  overlapBannerText: { flex: 1, fontSize: 13, fontWeight: '600', color: '#92400E' },
  confirmBox: { alignItems: 'center', paddingVertical: 20 },
  confirmIconCircle: { width: 80, height: 80, borderRadius: 24, backgroundColor: '#F0FDF4', alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  confirmTitleText: { fontSize: 24, fontWeight: '800', color: '#0F172A', marginBottom: 6 },
  confirmIdText: { fontSize: 14, color: '#64748B', marginBottom: 24 },
  footer: { backgroundColor: '#fff', padding: 16, borderTopWidth: 1, borderTopColor: '#F1F5F9' },
  footerBtnsRow: { flexDirection: 'row', gap: 10 },
  backStepBtn: { paddingHorizontal: 20, paddingVertical: 14, borderRadius: 14, backgroundColor: '#F8FAFC', borderWidth: 1.5, borderColor: '#E2E8F0', alignItems: 'center', justifyContent: 'center' },
  backStepText: { fontSize: 15, fontWeight: '700', color: '#0F172A' },
  nextStepBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 14, borderRadius: 14, backgroundColor: '#2563EB', shadowColor: '#2563EB', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.25, shadowRadius: 8, elevation: 4 },
  nextStepBtnDisabled: { backgroundColor: '#E2E8F0', shadowOpacity: 0, elevation: 0 },
  nextStepText: { fontSize: 15, fontWeight: '700', color: '#fff' },
  forceBookBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 14, borderRadius: 14, backgroundColor: '#D97706' },
  finishBtn: { width: '100%', paddingVertical: 14, borderRadius: 14, backgroundColor: '#2563EB', alignItems: 'center', justifyContent: 'center' },
  finishBtnText: { fontSize: 15, fontWeight: '700', color: '#fff' },
  noDataText: { fontSize: 13, color: '#94A3B8', fontStyle: 'italic' },
});
