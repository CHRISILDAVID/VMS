import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Linking, Alert } from 'react-native';
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

export default function BookingDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

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
      <SafeAreaView style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#2563EB" />
      </SafeAreaView>
    );
  }

  if (error || !booking) {
    return (
      <SafeAreaView style={styles.centerContainer}>
        <Text style={styles.errorText}>Failed to load booking details</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const customerName = booking.customer?.full_name || 'Walk-in Guest';
  const phone = booking.customer?.phone || '';
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
      const msg = `Hi ${customerName}, regarding your badminton booking ${booking.booking_number} on ${booking.date} at ${formattedStart}.`;
      Linking.openURL(`whatsapp://send?phone=${phone}&text=${encodeURIComponent(msg)}`).catch(() => {
        Alert.alert('WhatsApp Not Installed', 'Could not open WhatsApp on this device.');
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

  const RowItem = ({ label, value, valueColor }: { label: string; value: string; valueColor?: string }) => (
    <View style={styles.rowItem}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={[styles.rowValue, valueColor ? { color: valueColor } : null]}>{value}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.iconBtn} onPress={() => router.back()}>
          <ArrowLeft size={20} color="#0F172A" />
        </TouchableOpacity>
        <View style={styles.headerTitleBox}>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {customerName}
          </Text>
          <Text style={styles.headerSubtitle}>{booking.booking_number}</Text>
        </View>
        <StatusChip status={booking.status} />
      </View>

      <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
        {/* Customer Section */}
        <View style={styles.card}>
          <Text style={styles.cardHeader}>CUSTOMER</Text>
          <View style={styles.customerRow}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{initial}</Text>
            </View>
            <View style={styles.customerInfo}>
              <Text style={styles.customerNameText}>{customerName}</Text>
              <Text style={styles.customerPhoneText}>{phone ? `+91 ${phone}` : 'No phone'}</Text>
            </View>
            {phone ? (
              <View style={styles.customerActions}>
                <TouchableOpacity style={styles.actionIconBtn} onPress={handlePhonePress}>
                  <Phone size={16} color="#64748B" />
                </TouchableOpacity>
                <TouchableOpacity style={[styles.actionIconBtn, styles.whatsappBtn]} onPress={handleWhatsAppPress}>
                  <MessageCircle size={16} color="#16A34A" />
                </TouchableOpacity>
              </View>
            ) : null}
          </View>
        </View>

        {/* Booking Details Section */}
        <View style={styles.card}>
          <Text style={styles.cardHeader}>BOOKING DETAILS</Text>
          <RowItem label="Court" value={booking.court?.name || 'Court'} />
          <RowItem label="Date" value={booking.date} />
          <RowItem label="Time" value={`${formattedStart} – ${formattedEnd}`} />
          <RowItem label="Duration" value={`${booking.duration_minutes / 60}h (${booking.duration_minutes} mins)`} />
          <RowItem label="Source" value={booking.source ? booking.source.charAt(0).toUpperCase() + booking.source.slice(1) : 'Owner'} />
        </View>

        {/* Payment Section */}
        <TouchableOpacity 
          activeOpacity={0.7} 
          style={styles.card}
          onPress={() => {
            if (booking.status !== 'cancelled') setPaymentModalVisible(true);
          }}
        >
          <Text style={styles.cardHeader}>PAYMENT</Text>
          <RowItem label="Total" value={`₹${totalRs}`} />
          <RowItem label="Advance Paid" value={`₹${advanceRs}`} />
          <View style={styles.pendingRow}>
            <Text style={[styles.pendingLabel, { color: pendingRs > 0 ? '#DC2626' : '#16A34A' }]}>Pending</Text>
            <Text style={[styles.pendingValue, { color: pendingRs > 0 ? '#DC2626' : '#16A34A' }]}>₹{pendingRs}</Text>
          </View>
          <View style={styles.paymentStatusRow}>
            <StatusChip status={booking.payment_status} />
          </View>
        </TouchableOpacity>

        {/* Notes Section */}
        {booking.notes ? (
          <View style={[styles.card, styles.notesCard]}>
            <Text style={styles.notesHeader}>NOTES</Text>
            <Text style={styles.notesText}>{booking.notes}</Text>
          </View>
        ) : null}
      </ScrollView>

      {/* Footer Actions */}
      <View style={styles.footer}>
        {pendingRs > 0 && booking.status !== 'cancelled' && (
          <TouchableOpacity
            style={styles.collectBtn}
            onPress={() => setPaymentModalVisible(true)}
          >
            <IndianRupee size={18} color="#fff" />
            <Text style={styles.collectBtnText}>Collect ₹{pendingRs}</Text>
          </TouchableOpacity>
        )}

        {booking.status === 'upcoming' && (
          <TouchableOpacity
            style={[styles.collectBtn, { backgroundColor: '#7C3AED', marginBottom: 10 }]}
            onPress={() => handleStatusChange('ongoing')}
          >
            <PlayCircle size={18} color="#fff" />
            <Text style={styles.collectBtnText}>Mark as Ongoing</Text>
          </TouchableOpacity>
        )}

        {booking.status === 'ongoing' && (
          <TouchableOpacity
            style={[styles.collectBtn, { backgroundColor: '#16A34A', marginBottom: 10 }]}
            onPress={() => handleStatusChange('completed')}
          >
            <CheckCircle2 size={18} color="#fff" />
            <Text style={styles.collectBtnText}>Complete Booking</Text>
          </TouchableOpacity>
        )}

        {booking.status !== 'cancelled' && (
          <View style={styles.actionButtonsRow}>
            <TouchableOpacity
              style={[styles.actionBtn, styles.moveBtn]}
              onPress={() => setMoveModalVisible(true)}
            >
              <MoveRight size={16} color="#2563EB" />
              <Text style={styles.moveBtnText}>Move Slot</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionBtn, styles.cancelBtn]}
              onPress={() => setCancelModalVisible(true)}
            >
              <XCircle size={16} color="#DC2626" />
              <Text style={styles.cancelBtnText}>Cancel</Text>
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#F8FAFC',
  },
  errorText: {
    fontSize: 16,
    color: '#DC2626',
    marginBottom: 16,
  },
  backButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#2563EB',
    borderRadius: 12,
  },
  backButtonText: {
    color: '#fff',
    fontWeight: '700',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  iconBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitleBox: {
    flex: 1,
    marginHorizontal: 12,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  body: {
    flex: 1,
    padding: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  cardHeader: {
    fontSize: 11,
    fontWeight: '700',
    color: '#94A3B8',
    letterSpacing: 0.6,
    marginBottom: 12,
  },
  customerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#2563EB',
  },
  customerInfo: {
    flex: 1,
  },
  customerNameText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
  },
  customerPhoneText: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 2,
  },
  customerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionIconBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  whatsappBtn: {
    backgroundColor: '#F0FDF4',
    borderColor: '#BBF7D0',
  },
  rowItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC',
  },
  rowLabel: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '500',
  },
  rowValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0F172A',
  },
  pendingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC',
  },
  pendingLabel: {
    fontSize: 14,
    fontWeight: '700',
  },
  pendingValue: {
    fontSize: 16,
    fontWeight: '800',
  },
  paymentStatusRow: {
    paddingTop: 12,
    alignItems: 'flex-start',
  },
  notesCard: {
    backgroundColor: '#FFFBEB',
    borderColor: '#FDE68A',
  },
  notesHeader: {
    fontSize: 11,
    fontWeight: '700',
    color: '#92400E',
    letterSpacing: 0.6,
    marginBottom: 6,
  },
  notesText: {
    fontSize: 13,
    color: '#78350F',
    lineHeight: 18,
  },
  footer: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    gap: 10,
  },
  collectBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#2563EB',
    paddingVertical: 14,
    borderRadius: 14,
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  collectBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#fff',
  },
  actionButtonsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1.5,
  },
  moveBtn: {
    backgroundColor: '#EFF6FF',
    borderColor: '#BFDBFE',
  },
  moveBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#2563EB',
  },
  cancelBtn: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FCA5A5',
  },
  cancelBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#DC2626',
  },
});
