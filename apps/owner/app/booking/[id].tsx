import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Linking, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, Phone, MessageCircle, MapPin, Clock, Calendar, IndianRupee, Pencil, MoveRight, XCircle, PlayCircle, CheckCircle2 } from 'lucide-react-native';
import { format, parse } from 'date-fns';

import { StatusChip } from '../../components/domain/StatusChip';
import { PaymentUpdateModal } from '../../features/bookings/components/PaymentUpdateModal';
import { CancelConfirmModal } from '../../features/bookings/components/CancelConfirmModal';
import { MoveBookingModal } from '../../features/bookings/components/MoveBookingModal';
import {
  useBookingDetail,
  useUpdatePaymentStatus,
  useCancelBooking,
  useMoveBooking,
  useUpdateBookingStatus,
} from '../../features/bookings/hooks/useBookings';
import { useCourts } from '../../hooks/useCourts';
import { formatPhone } from '@vms/shared/utils';
import { useThemeColors } from '../../hooks/useThemeColors';

export default function BookingDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { colors } = useThemeColors();

  const { data: booking, isLoading, error } = useBookingDetail(id);
  const { data: courts } = useCourts(booking?.venue_id || null);

  const [paymentModalVisible, setPaymentModalVisible] = useState(false);
  const [cancelModalVisible, setCancelModalVisible] = useState(false);
  const [moveModalVisible, setMoveModalVisible] = useState(false);

  const updatePaymentMutation = useUpdatePaymentStatus();
  const cancelBookingMutation = useCancelBooking();
  const moveBookingMutation = useMoveBooking();
  const updateStatusMutation = useUpdateBookingStatus();

  const handleStatusChange = async (newStatus: any) => {
    try {
      await updateStatusMutation.mutateAsync({
        id: booking!.id,
        status: newStatus,
      });
    } catch (err) {
      Alert.alert('Error', 'Failed to update booking status.');
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center p-5 bg-background">
        <ActivityIndicator size="large" color={colors.primary} />
      </SafeAreaView>
    );
  }

  if (error || !booking) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center p-5 bg-background">
        <Text className="text-base text-destructive mb-4">Failed to load booking details</Text>
        <TouchableOpacity className="px-5 py-2.5 bg-primary rounded-xl" onPress={() => router.back()}>
          <Text className="text-primary-foreground font-bold">Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const customerName = booking.customer?.full_name || 'Walk-in Guest';
  const phone = formatPhone(booking.customer?.phone || '');
  const initial = customerName.charAt(0).toUpperCase();

  const formatTimeStr = (timeStr: string) => {
    try {
      const d = parse(timeStr, 'HH:mm:ss', new Date());
      return format(d, 'h:mm a');
    } catch {
      return timeStr.slice(0, 5);
    }
  };

  const formattedStart = formatTimeStr(booking.start_time);
  const formattedEnd = formatTimeStr(booking.end_time);

  const totalRs = (booking.final_amount || 0) / 100;
  const advanceRs = (booking.advance || 0) / 100;
  const pendingRs = (booking.pending || 0) / 100;

  const handlePhonePress = () => {
    if (phone) {
      Linking.openURL(`tel:${phone}`).catch(() => {
        Alert.alert('Error', 'Could not open phone dialer.');
      });
    }
  };

  const handleWhatsAppPress = () => {
    if (phone) {
      const cleanPhone = phone.replace(/\D/g, '');
      const waPhone = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
      const msg = `Hi ${customerName}, regarding your badminton booking ${booking.booking_number} on ${booking.date} at ${formattedStart}.`;
      Linking.openURL(`https://wa.me/${waPhone}?text=${encodeURIComponent(msg)}`).catch(() => {
        Alert.alert('Error', 'Could not open WhatsApp or browser on this device.');
      });
    }
  };

  const handleSavePayment = async (payload: any) => {
    await updatePaymentMutation.mutateAsync({
      id: booking.id,
      ...payload,
    });
  };

  const handleConfirmCancel = async (reason?: string) => {
    await cancelBookingMutation.mutateAsync({
      id: booking.id,
      reason,
    });
  };

  const handleConfirmMove = async (updates: any, isForceBooked?: boolean) => {
    await moveBookingMutation.mutateAsync({
      id: booking.id,
      updates,
      isForceBooked,
    });
  };

  const RowItem = ({ label, value, valueColorClass }: { label: string; value: string; valueColorClass?: string }) => (
    <View className="flex-row justify-between items-center py-2.5 border-b border-border/50">
      <Text className="text-[13px] font-medium text-muted-foreground">{label}</Text>
      <Text className={`text-[13px] font-semibold ${valueColorClass || 'text-foreground'}`}>{value}</Text>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top', 'bottom']}>
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-3 bg-card border-b border-border">
        <TouchableOpacity className="w-9 h-9 rounded-xl bg-muted items-center justify-center" onPress={() => router.back()}>
          <ArrowLeft size={20} color={colors.foreground} />
        </TouchableOpacity>
        <View className="flex-1 mx-3">
          <Text className="text-base font-extrabold text-foreground" numberOfLines={1}>
            {customerName}
          </Text>
          <Text className="text-xs text-muted-foreground mt-0.5">{booking.booking_number}</Text>
        </View>
        <StatusChip status={booking.status} />
      </View>

      <ScrollView className="flex-1 p-4" showsVerticalScrollIndicator={false}>
        {/* Customer Section */}
        <View className="bg-card rounded-2xl p-4 mb-3.5 border border-border/50 shadow-sm">
          <Text className="text-[11px] font-bold text-muted-foreground tracking-wide mb-3">CUSTOMER</Text>
          <View className="flex-row items-center gap-3">
            <View className="w-11 h-11 rounded-xl bg-primary/10 items-center justify-center">
              <Text className="text-lg font-extrabold text-primary">{initial}</Text>
            </View>
            <View className="flex-1">
              <Text className="text-[15px] font-bold text-foreground">{customerName}</Text>
              <Text className="text-[13px] text-muted-foreground mt-0.5">{phone || 'No phone'}</Text>
            </View>
            {phone ? (
              <View className="flex-row gap-2">
                <TouchableOpacity className="w-9 h-9 rounded-xl bg-muted border border-border items-center justify-center" onPress={handlePhonePress}>
                  <Phone size={16} color={colors.mutedForeground} />
                </TouchableOpacity>
                <TouchableOpacity className="w-9 h-9 rounded-xl bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 items-center justify-center" onPress={handleWhatsAppPress}>
                  <MessageCircle size={16} color="#16A34A" />
                </TouchableOpacity>
              </View>
            ) : null}
          </View>
        </View>

        {/* Booking Details Section */}
        <View className="bg-card rounded-2xl p-4 mb-3.5 border border-border/50 shadow-sm">
          <Text className="text-[11px] font-bold text-muted-foreground tracking-wide mb-3">BOOKING DETAILS</Text>
          <RowItem label="Court" value={booking.court?.name || 'Court'} />
          <RowItem label="Date" value={booking.date} />
          <RowItem label="Time" value={`${formattedStart} – ${formattedEnd}`} />
          <RowItem label="Duration" value={`${booking.duration_minutes / 60}h (${booking.duration_minutes} mins)`} />
          <RowItem label="Source" value={booking.source ? booking.source.charAt(0).toUpperCase() + booking.source.slice(1) : 'Owner'} />
        </View>

        {/* Payment Section */}
        <TouchableOpacity 
          activeOpacity={0.7} 
          className="bg-card rounded-2xl p-4 mb-3.5 border border-border/50 shadow-sm"
          onPress={() => {
            if (booking.status !== 'cancelled') setPaymentModalVisible(true);
          }}
        >
          <Text className="text-[11px] font-bold text-muted-foreground tracking-wide mb-3">PAYMENT</Text>
          <RowItem label="Total" value={`₹${totalRs}`} />
          <RowItem label="Advance Paid" value={`₹${advanceRs}`} />
          <View className="flex-row justify-between items-center py-3 border-b border-border/50">
            <Text className={`text-sm font-bold ${pendingRs > 0 ? 'text-destructive dark:text-red-500' : 'text-green-600 dark:text-green-500'}`}>Pending</Text>
            <Text className={`text-base font-extrabold ${pendingRs > 0 ? 'text-destructive dark:text-red-500' : 'text-green-600 dark:text-green-500'}`}>₹{pendingRs}</Text>
          </View>
          <View className="pt-3 items-start">
            <StatusChip status={booking.payment_status} />
          </View>
        </TouchableOpacity>

        {/* Notes Section */}
        {booking.notes ? (
          <View className="bg-amber-50 dark:bg-amber-900/30 rounded-2xl p-4 mb-3.5 border border-amber-200 dark:border-amber-800 shadow-sm">
            <Text className="text-[11px] font-bold text-amber-800 dark:text-amber-600 tracking-wide mb-1.5">NOTES</Text>
            <Text className="text-[13px] text-amber-900 dark:text-amber-500 leading-tight">{booking.notes}</Text>
          </View>
        ) : null}
      </ScrollView>

      {/* Footer Actions */}
      <View className="bg-card px-4 py-3 border-t border-border gap-2.5">
        {pendingRs > 0 && booking.status !== 'cancelled' && (
          <TouchableOpacity
            className="flex-row items-center justify-center gap-2 bg-primary py-3.5 rounded-2xl shadow-sm"
            onPress={() => setPaymentModalVisible(true)}
          >
            <IndianRupee size={18} color={colors.primaryForeground} />
            <Text className="text-[15px] font-bold text-primary-foreground">Collect ₹{pendingRs}</Text>
          </TouchableOpacity>
        )}

        {booking.status !== 'cancelled' && (
          <View className="flex-row gap-2.5">
            <TouchableOpacity
              className="flex-1 flex-row items-center justify-center gap-1.5 py-3 rounded-xl border-[1.5px] border-primary/30 bg-primary/10"
              onPress={() => setMoveModalVisible(true)}
            >
              <MoveRight size={16} color={colors.primary} />
              <Text className="text-[13px] font-bold text-primary">Move Slot</Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="flex-1 flex-row items-center justify-center gap-1.5 py-3 rounded-xl border-[1.5px] border-destructive/30 bg-destructive/10"
              onPress={() => setCancelModalVisible(true)}
            >
              <XCircle size={16} color={colors.destructive} />
              <Text className="text-[13px] font-bold text-destructive">Cancel</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Modals */}
      <PaymentUpdateModal
        visible={paymentModalVisible}
        booking={booking}
        onClose={() => setPaymentModalVisible(false)}
        onSave={handleSavePayment}
      />
      <CancelConfirmModal
        visible={cancelModalVisible}
        booking={booking}
        onClose={() => setCancelModalVisible(false)}
        onConfirm={handleConfirmCancel}
      />
      <MoveBookingModal
        visible={moveModalVisible}
        booking={booking}
        courts={courts || []}
        onClose={() => setMoveModalVisible(false)}
        onMove={handleConfirmMove}
      />
    </SafeAreaView>
  );
}
