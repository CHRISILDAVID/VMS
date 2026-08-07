import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Alert, Linking, Switch, KeyboardAvoidingView, Platform } from 'react-native';
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
import {  computeDynamicPrice , formatPhone } from '@vms/shared/utils';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import { createScheduleService } from '@vms/shared/services';
import { useThemeColors } from '../../hooks/useThemeColors';

const STEPS = ['Date & Court', 'Time', 'Customer', 'Payment', 'Confirm'];

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
  const { colors } = useThemeColors();

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
    <SafeAreaView className="flex-1 bg-background" edges={['top', 'bottom']}>
      {/* Header */}
      <View className="bg-card px-4 pt-3 pb-4 border-b border-border">
        <View className="flex-row items-center gap-3 mb-4">
          <TouchableOpacity
            className="w-9 h-9 rounded-xl bg-muted border border-border items-center justify-center"
            onPress={() => {
              if (step > 0 && step < 4) setStep(step - 1);
              else router.back();
            }}
          >
            <ArrowLeft size={18} color={colors.foreground} />
          </TouchableOpacity>
          <Text className="text-lg font-extrabold text-foreground">New Booking</Text>
        </View>

        {/* Progress Bar */}
        <View className="flex-row items-center mb-2">
          {STEPS.map((s, i) => {
            const isCompleted = i < step;
            const isCurrent = i === step;
            return (
              <React.Fragment key={i}>
                <View
                  className={`w-[26px] h-[26px] rounded-full items-center justify-center ${isCompleted ? 'bg-green-600 dark:bg-green-500' : isCurrent ? 'bg-primary' : 'bg-muted border border-border'}`}
                >
                  {isCompleted ? (
                    <Check size={14} color="#fff" />
                  ) : (
                    <Text className={`text-[11px] font-bold ${isCurrent ? 'text-primary-foreground' : 'text-muted-foreground'}`}>{i + 1}</Text>
                  )}
                </View>
                {i < STEPS.length - 1 && (
                  <View className={`flex-1 h-0.5 mx-1 ${isCompleted ? 'bg-green-600 dark:bg-green-500' : 'bg-muted'}`} />
                )}
              </React.Fragment>
            );
          })}
        </View>
        <Text className="text-xs font-semibold text-muted-foreground">
          Step {step + 1} of {STEPS.length} · {STEPS[step]}
        </Text>
      </View>

      <ScrollView className="flex-1 p-4" showsVerticalScrollIndicator={false}>
        {/* Step 0: Date & Court */}
        {step === 0 && (
          <View>
            <View className="mb-5">
              <Text className="text-[13px] font-bold text-foreground mb-2.5">Select Date (YYYY-MM-DD)</Text>
              <View className="flex-row items-center bg-card border-[1.5px] border-border rounded-xl px-3.5 h-12 gap-2.5">
                <Calendar size={18} color={colors.mutedForeground} />
                <TextInput
                  className="flex-1 text-[15px] font-semibold text-foreground"
                  value={selectedDate}
                  onChangeText={setSelectedDate}
                  placeholder="2026-07-26"
                  placeholderTextColor={colors.mutedForeground}
                />
              </View>
              {/* Quick Date Pills */}
              <View className="flex-row gap-2 mt-2.5">
                {[0, 1, 2, 3].map(days => {
                  const d = new Date();
                  d.setDate(d.getDate() + days);
                  const dStr = format(d, 'yyyy-MM-dd');
                  const label = days === 0 ? 'Today' : days === 1 ? 'Tomorrow' : format(d, 'EEE, MMM d');
                  const active = selectedDate === dStr;
                  return (
                    <TouchableOpacity
                      key={dStr}
                      className={`px-3 py-1.5 rounded-full border ${active ? 'bg-primary/10 border-primary' : 'bg-card border-border'}`}
                      onPress={() => setSelectedDate(dStr)}
                    >
                      <Text className={`text-xs ${active ? 'font-bold text-primary' : 'font-semibold text-muted-foreground'}`}>{label}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            <View className="mb-5">
              <Text className="text-[13px] font-bold text-foreground mb-2.5">Select Court</Text>
              {!courts || courts.length === 0 ? (
                <Text className="text-[13px] text-muted-foreground italic">No courts found for this venue.</Text>
              ) : (
                <View className="flex-row flex-wrap gap-2.5">
                  {courts.map(c => {
                    const active = selectedCourtId === c.id;
                    return (
                      <TouchableOpacity
                        key={c.id}
                        className={`w-[48%] p-4 rounded-xl border-2 ${active ? 'border-primary bg-primary/10' : 'border-border bg-card'}`}
                        onPress={() => setSelectedCourtId(c.id)}
                      >
                        <Text className={`text-sm font-bold ${active ? 'text-primary' : 'text-foreground'}`}>{c.name}</Text>
                        <Text className="text-[11px] text-green-600 dark:text-green-500 font-semibold mt-1">Available</Text>
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
            <View className="mb-5">
              <Text className="text-[13px] font-bold text-foreground mb-2.5">Start Time</Text>
              <View className="flex-row flex-wrap gap-2">
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
                      className={`px-3.5 py-2.5 rounded-xl border-[1.5px] ${active ? 'border-primary bg-primary' : isPast ? 'border-transparent bg-muted opacity-50' : 'border-border bg-card'}`}
                      onPress={() => {
                        if (isPast) {
                          Alert.alert('Invalid Time', 'Cannot book slots in the past.');
                          return;
                        }
                        setSelectedTime(t);
                      }}
                    >
                      <Text className={`text-[13px] font-semibold ${active ? 'text-primary-foreground' : isPast ? 'text-muted-foreground' : 'text-foreground'}`}>
                        {t.slice(0, 5)}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            <View className="mb-5">
              <Text className="text-[13px] font-bold text-foreground mb-2.5">Duration</Text>
              <View className="gap-2.5">
                {durationOptions.map(dur => {
                  const active = selectedDurationMins === dur.mins;
                  const price = schedule?.pricing_blocks && schedule.pricing_blocks.length > 0
                    ? computeDynamicPrice(selectedTime, dur.mins, schedule.pricing_blocks, 40000)
                    : Math.round(dur.hours * 400);
                  return (
                    <TouchableOpacity
                      key={dur.mins}
                      className={`flex-row justify-between items-center p-3.5 rounded-xl border-[1.5px] ${active ? 'border-primary bg-primary/10' : 'border-border bg-card'}`}
                      onPress={() => setSelectedDurationMins(dur.mins)}
                    >
                      <Text className={`text-sm font-semibold ${active ? 'text-primary font-bold' : 'text-foreground'}`}>{dur.label}</Text>
                      <Text className="text-sm font-bold text-muted-foreground">₹{price}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
            <View className="mb-5">
              <Text className="text-[13px] font-bold text-foreground mb-2.5">Block Court</Text>
              <TouchableOpacity
                className={`flex-row justify-between items-center p-3.5 rounded-xl border-[1.5px] mt-2 ${isBlockSlot ? 'border-primary bg-primary/10' : 'border-border bg-card'}`}
                onPress={() => setIsBlockSlot(!isBlockSlot)}
              >
                <View className="flex-1">
                  <Text className={`text-sm font-semibold ${isBlockSlot ? 'text-primary font-bold' : 'text-foreground'}`}>Block this slot</Text>
                  <Text className="text-[13px] text-muted-foreground mt-0.5">No customer required. Court will be marked as blocked.</Text>
                </View>
                {isBlockSlot && <Check size={20} color={colors.primary} />}
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Step 2: Customer */}
        {step === 2 && (
          <View>
            <View className="flex-row items-center bg-card border-[1.5px] border-border rounded-xl px-3 h-11 gap-2 mb-4">
              <Search size={18} color={colors.mutedForeground} />
              <TextInput
                className="flex-1 text-sm text-foreground"
                placeholder="Search customer name or phone..."
                placeholderTextColor={colors.mutedForeground}
                value={customerSearch}
                onChangeText={setCustomerSearch}
              />
            </View>

            {selectedCustomer ? (
              <View className="bg-primary/10 rounded-xl p-3.5 mb-4 border-[1.5px] border-primary/30">
                <Text className="text-[11px] font-bold text-primary tracking-wide mb-1">SELECTED CUSTOMER</Text>
                <Text className="text-base font-bold text-foreground">{selectedCustomer.full_name}</Text>
                <Text className="text-[13px] text-muted-foreground mt-0.5">
                  {formatPhone(selectedCustomer.phone || "")} · {selectedCustomer.total_visits || 0} visits
                </Text>
              </View>
            ) : null}

            {showNewCustForm ? (
              <View className="bg-card rounded-2xl p-4 mb-4 border border-border">
                <Text className="text-[15px] font-bold text-foreground mb-3">Add New Customer</Text>
                <TextInput
                  className="border border-muted-foreground/30 rounded-xl p-3 text-sm text-foreground bg-background mb-2.5"
                  placeholder="Full Name (e.g. Rahul Varma)"
                  placeholderTextColor={colors.mutedForeground}
                  value={newCustName}
                  onChangeText={setNewCustName}
                />
                <View className="border border-muted-foreground/30 rounded-xl bg-background flex-row items-center px-3">
                  <Text className="text-muted-foreground font-semibold mr-1">+91</Text>
                  <TextInput
                    className="flex-1 text-sm text-foreground py-3"
                    placeholder="9876543210"
                    placeholderTextColor={colors.mutedForeground}
                    value={newCustPhone}
                    onChangeText={(text) => {
                       const num = text.replace(/\D/g, '');
                       if (num.length <= 10) setNewCustPhone(num);
                    }}
                    keyboardType="phone-pad"
                  />
                </View>
                <View className="flex-row gap-2.5 mt-3.5">
                  <TouchableOpacity className="flex-1 py-3 rounded-xl bg-muted items-center justify-center" onPress={() => setShowNewCustForm(false)}>
                    <Text className="font-bold text-muted-foreground">Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity className="flex-[1.5] py-3 rounded-xl bg-primary items-center justify-center" onPress={handleCreateCustomer}>
                    <Text className="font-bold text-primary-foreground">Save & Select</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <TouchableOpacity className="flex-row items-center justify-center gap-2 p-3.5 bg-transparent border-[1.5px] border-muted-foreground/40 border-dashed rounded-xl mb-4" onPress={() => setShowNewCustForm(true)}>
                <Plus size={16} color={colors.primary} />
                <Text className="text-sm font-bold text-primary">Add New Customer</Text>
              </TouchableOpacity>
            )}

            <Text className="text-[11px] font-bold text-muted-foreground tracking-wide mb-2.5">RECENT CUSTOMERS</Text>
            <View className="gap-2.5 mb-10">
              {(!customers || customers.length === 0) && !showNewCustForm ? (
                <Text className="text-[13px] text-muted-foreground italic">No customers found. Click above to add one.</Text>
              ) : (
                (customers || []).map(c => {
                  const active = selectedCustomer?.id === c.id;
                  return (
                    <TouchableOpacity
                      key={c.id}
                      className={`flex-row items-center gap-3 p-3.5 rounded-xl border-[1.5px] ${active ? 'border-primary bg-primary/10' : 'border-border bg-card'}`}
                      onPress={() => setSelectedCustomer(c)}
                    >
                      <View className="w-10 h-10 rounded-xl bg-primary/10 items-center justify-center">
                        <Text className="text-base font-bold text-primary">{c.full_name.charAt(0)}</Text>
                      </View>
                      <View className="flex-1">
                        <Text className="text-sm font-bold text-foreground">{c.full_name}</Text>
                        <Text className="text-xs text-muted-foreground mt-0.5">{formatPhone(c.phone || "")} · {c.total_visits || 0} visits</Text>
                      </View>
                      {active && <Check size={20} color={colors.primary} />}
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
            <View className="bg-card rounded-[18px] p-4 mb-4 border border-border">
              <Text className="text-xs font-bold text-muted-foreground tracking-wide mb-3">BOOKING SUMMARY</Text>
              <View className="flex-row justify-between py-2 border-b border-border/50"><Text className="text-[13px] text-muted-foreground">Court</Text><Text className="text-[13px] font-semibold text-foreground">{selectedCourtName}</Text></View>
              <View className="flex-row justify-between py-2 border-b border-border/50"><Text className="text-[13px] text-muted-foreground">Date</Text><Text className="text-[13px] font-semibold text-foreground">{selectedDate}</Text></View>
              <View className="flex-row justify-between py-2 border-b border-border/50"><Text className="text-[13px] text-muted-foreground">Time</Text><Text className="text-[13px] font-semibold text-foreground">{selectedTime.slice(0, 5)} – {endTimeStr.slice(0, 5)}</Text></View>
              <View className="flex-row justify-between py-2 border-b border-border/50"><Text className="text-[13px] text-muted-foreground">Duration</Text><Text className="text-[13px] font-semibold text-foreground">{selectedDurationMins / 60}h</Text></View>
              <View className="flex-row justify-between py-2 border-b border-border/50"><Text className="text-[13px] text-muted-foreground">Customer</Text><Text className="text-[13px] font-semibold text-foreground">{selectedCustomer?.full_name}</Text></View>
              <View className="flex-row justify-between items-center pt-3 mt-1">
                <Text className="text-[15px] font-bold text-foreground">Total Amount</Text>
                <View className="flex-row items-center">
                  <Text className="text-lg font-extrabold text-primary mr-0.5">₹</Text>
                  <TextInput
                    className="text-lg font-extrabold text-primary min-w-[60px] text-right p-0"
                    value={customAmountRs !== '' ? customAmountRs : computedTotalRs.toString()}
                    onChangeText={setCustomAmountRs}
                    keyboardType="numeric"
                  />
                </View>
              </View>
            </View>

            <View className="bg-card rounded-[18px] p-4 mb-4 border border-border">
              <Text className="text-xs font-bold text-muted-foreground tracking-wide mb-3">PAYMENT METHOD</Text>
              <View className="flex-row gap-2 mb-4">
                {(['cash', 'upi', 'card', 'online'] as PaymentMethod[]).map(m => {
                  const active = paymentMode === m;
                  return (
                    <TouchableOpacity
                      key={m}
                      className={`flex-1 py-3 rounded-xl border-[1.5px] items-center ${active ? 'border-primary bg-primary/10' : 'border-border bg-muted'}`}
                      onPress={() => setPaymentMode(m)}
                    >
                      <Text className={`text-[13px] ${active ? 'text-primary font-bold' : 'text-muted-foreground font-semibold'}`}>
                        {m === 'upi' ? 'UPI' : m.charAt(0).toUpperCase() + m.slice(1)}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <Text className="text-xs font-bold text-muted-foreground tracking-wide mb-3 mt-2">BOOKING SOURCE</Text>
              <View className="flex-row gap-1.5 mb-4">
                {['offline', 'online', 'walk_in'].map(src => {
                  const active = bookingSource === src;
                  const label = src === 'walk_in' ? 'Walk-in' : src.charAt(0).toUpperCase() + src.slice(1);
                  return (
                    <TouchableOpacity
                      key={src}
                      className={`flex-1 py-2 rounded-lg border-[1.5px] items-center ${active ? 'border-primary bg-primary/10' : 'border-border bg-card'}`}
                      onPress={() => setBookingSource(src)}
                    >
                      <Text className={`text-[11px] ${active ? 'text-primary font-bold' : 'text-muted-foreground font-semibold'}`}>
                        {label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <View className="mt-2">
                <Text className="text-[13px] font-bold text-foreground mb-2.5">Advance Collected (₹)</Text>
                <View className="flex-row items-center bg-muted border-[1.5px] border-border rounded-xl px-3.5 h-12">
                  <Text className="text-base font-bold text-muted-foreground mr-1.5">₹</Text>
                  <TextInput
                    className="flex-1 text-base font-bold text-foreground"
                    value={advanceRs}
                    onChangeText={setAdvanceRs}
                    keyboardType="numeric"
                  />
                </View>
              </View>

              <View className="flex-row items-center justify-between mt-4 p-3.5 bg-muted rounded-xl">
                <View className="flex-row items-center gap-2">
                  <MessageCircle size={18} color="#16A34A" />
                  <Text className="text-[13px] font-semibold text-foreground">Send WhatsApp confirmation</Text>
                </View>
                <Switch
                  value={sendWhatsapp}
                  onValueChange={setSendWhatsapp}
                  trackColor={{ false: colors.border, true: '#BBF7D0' }}
                  thumbColor={sendWhatsapp ? '#16A34A' : '#f4f3f4'}
                />
              </View>
            </View>

            {overlapError && (
              <View className="flex-row items-center gap-2.5 bg-amber-50 dark:bg-amber-900/30 border-[1.5px] border-amber-200 dark:border-amber-800 rounded-xl p-3.5 mb-4">
                <AlertTriangle size={20} color="#D97706" />
                <Text className="flex-1 text-[13px] font-semibold text-amber-800 dark:text-amber-500">{overlapError}</Text>
              </View>
            )}
          </View>
        )}

        {/* Step 4: Confirm Success */}
        {step === 4 && (
          <View className="items-center py-5">
            <View className="w-20 h-20 rounded-3xl bg-green-50 dark:bg-green-900/30 items-center justify-center mb-4">
              <Check size={44} color="#16A34A" />
            </View>
            <Text className="text-2xl font-extrabold text-foreground mb-1.5">Booking Confirmed!</Text>
            <Text className="text-sm text-muted-foreground mb-6">
              Booking ID: {confirmedBooking?.booking_number || 'BK-SUCCESS'}
            </Text>

            <View className="bg-card rounded-[18px] p-4 mb-4 border border-border w-full">
              <View className="flex-row justify-between py-2 border-b border-border/50"><Text className="text-[13px] text-muted-foreground">Customer</Text><Text className="text-[13px] font-semibold text-foreground">{selectedCustomer?.full_name}</Text></View>
              <View className="flex-row justify-between py-2 border-b border-border/50"><Text className="text-[13px] text-muted-foreground">Court</Text><Text className="text-[13px] font-semibold text-foreground">{selectedCourtName}</Text></View>
              <View className="flex-row justify-between py-2 border-b border-border/50"><Text className="text-[13px] text-muted-foreground">Date</Text><Text className="text-[13px] font-semibold text-foreground">{selectedDate}</Text></View>
              <View className="flex-row justify-between py-2 border-b border-border/50"><Text className="text-[13px] text-muted-foreground">Time</Text><Text className="text-[13px] font-semibold text-foreground">{selectedTime.slice(0, 5)} – {endTimeStr.slice(0, 5)}</Text></View>
              <View className="flex-row justify-between py-2 border-b border-border/50"><Text className="text-[13px] text-muted-foreground">Amount</Text><Text className="text-[13px] font-semibold text-foreground">₹{finalTotalRs}</Text></View>
              <View className="flex-row justify-between py-2 border-b border-border/50"><Text className="text-[13px] text-muted-foreground">Advance</Text><Text className="text-[13px] font-semibold text-foreground">₹{advanceRs || 0}</Text></View>
              <View className="flex-row justify-between py-2 border-b border-border/50"><Text className="text-[13px] text-muted-foreground">Payment</Text><Text className="text-[13px] font-semibold text-foreground">{paymentMode.toUpperCase()}</Text></View>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Footer Actions */}
      <View className="bg-card p-4 border-t border-border">
        {step < 4 ? (
          <View className="flex-row gap-2.5">
            {step > 0 && (
              <TouchableOpacity
                className="px-5 py-3.5 rounded-xl bg-muted border-[1.5px] border-border items-center justify-center"
                onPress={() => setStep(step - 1)}
                disabled={isSubmitting}
              >
                <Text className="text-[15px] font-bold text-foreground">Back</Text>
              </TouchableOpacity>
            )}

            {step === 3 && overlapError ? (
              <TouchableOpacity
                className="flex-1 flex-row items-center justify-center gap-2 py-3.5 rounded-xl bg-amber-600"
                onPress={() => handleConfirmBooking(true)}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <>
                    <AlertTriangle size={18} color="#fff" />
                    <Text className="text-[15px] font-bold text-white">Force Confirm</Text>
                  </>
                )}
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                className={`flex-1 flex-row items-center justify-center gap-2 py-3.5 rounded-xl ${!canNext() || isSubmitting ? 'bg-muted' : 'bg-primary'}`}
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
                    <Text className={`text-[15px] font-bold ${!canNext() ? 'text-muted-foreground' : 'text-primary-foreground'}`}>
                      {(step === 3 || (step === 1 && isBlockSlot)) ? (isBlockSlot ? 'Block Court' : 'Confirm Booking') : 'Continue'}
                    </Text>
                    <ArrowRight size={18} color={canNext() ? '#fff' : colors.mutedForeground} />
                  </>
                )}
              </TouchableOpacity>
            )}
          </View>
        ) : (
          <TouchableOpacity
            className="w-full py-3.5 rounded-xl bg-primary items-center justify-center"
            onPress={() => router.replace('/(tabs)/bookings' as any)}
          >
            <Text className="text-[15px] font-bold text-primary-foreground">Back to Bookings</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}
