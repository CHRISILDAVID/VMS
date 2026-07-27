import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking, Alert } from 'react-native';
import { Phone, MessageCircle, MapPin, Clock, IndianRupee } from 'lucide-react-native';
import { BookingWithDetails } from '@vms/shared/services';
import { StatusChip } from '../../../components/domain/StatusChip';
import { format, parse } from 'date-fns';

interface BookingCardProps {
  booking: BookingWithDetails;
  onPress: () => void;
  onCollectPress?: () => void;
}

const statusStripeColors: Record<string, string> = {
  upcoming: '#2563EB',
  ongoing: '#7C3AED',
  completed: '#16A34A',
  cancelled: '#DC2626',
};

export function BookingCard({ booking, onPress, onCollectPress }: BookingCardProps) {
  const customerName = booking.customer?.full_name || 'Walk-in Guest';
  const phone = booking.customer?.phone || '';
  const initial = customerName.charAt(0).toUpperCase();

  const stripeColor = statusStripeColors[booking.status] || '#CBD5E1';

  // Format time (e.g. 10:00:00 -> 10:00 AM)
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
      const msg = `Hi ${customerName}, regarding your badminton booking ${booking.booking_number} on ${booking.date} at ${formattedStart} at ${booking.court?.name || 'our venue'}.`;
      Linking.openURL(`https://wa.me/${waPhone}?text=${encodeURIComponent(msg)}`).catch(() => {
        Alert.alert('Error', 'Could not open WhatsApp or browser on this device.');
      });
    }
  };

  const pendingAmountRs = (booking.pending || 0) / 100;
  const totalAmountRs = (booking.final_amount || 0) / 100;

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={[styles.stripe, { backgroundColor: stripeColor }]} />

      <View style={styles.content}>
        {/* Top Row: Customer Info & Total/Payment */}
        <View style={styles.topRow}>
          <View style={styles.customerContainer}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{initial}</Text>
            </View>
            <View>
              <Text style={styles.customerName}>{customerName}</Text>
              <Text style={styles.bookingNumber}>{booking.booking_number}</Text>
            </View>
          </View>

          <View style={styles.paymentContainer}>
            <Text style={styles.amountText}>₹{totalAmountRs}</Text>
            <StatusChip status={booking.payment_status} size="sm" />
          </View>
        </View>

        {/* Middle Row: Court, Time, Duration */}
        <View style={styles.metaRow}>
          <View style={styles.metaItem}>
            <MapPin size={12} color="#94A3B8" />
            <Text style={styles.metaText}>{booking.court?.name || 'Court'}</Text>
          </View>
          <View style={styles.dot} />
          <View style={styles.metaItem}>
            <Clock size={12} color="#94A3B8" />
            <Text style={styles.metaText}>
              {formattedStart} – {formattedEnd}
            </Text>
          </View>
          <View style={styles.dot} />
          <Text style={styles.metaText}>{booking.duration_minutes / 60}h</Text>
        </View>

        {/* Bottom Row: Status & Quick Actions */}
        <View style={styles.bottomRow}>
          <View style={styles.statusContainer}>
            <View style={[styles.statusDot, { backgroundColor: stripeColor }]} />
            <StatusChip status={booking.status} size="sm" />
          </View>

          <View style={styles.actionsContainer}>
            {phone ? (
              <>
                <TouchableOpacity
                  style={styles.iconBtn}
                  onPress={handlePhonePress}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Phone size={14} color="#64748B" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.iconBtn, styles.whatsappBtn]}
                  onPress={handleWhatsAppPress}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <MessageCircle size={14} color="#16A34A" />
                </TouchableOpacity>
              </>
            ) : null}

            {pendingAmountRs > 0 && (
              <TouchableOpacity
                style={styles.collectBtn}
                onPress={onCollectPress || onPress}
              >
                <IndianRupee size={12} color="#2563EB" />
                <Text style={styles.collectText}>Collect ₹{pendingAmountRs}</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    marginBottom: 12,
    position: 'relative',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  stripe: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
  },
  content: {
    padding: 16,
    paddingLeft: 20,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  customerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#2563EB',
  },
  customerName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
  },
  bookingNumber: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 2,
  },
  paymentContainer: {
    alignItems: 'flex-end',
    gap: 4,
  },
  amountText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 14,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  dot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: '#CBD5E1',
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 4,
    borderTopWidth: 1,
    borderTopColor: '#F8FAFC',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  actionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
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
  collectBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    gap: 4,
  },
  collectText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#2563EB',
  },
});
