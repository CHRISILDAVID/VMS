import { formatPhone } from '@vms/shared/utils';
import React from 'react';
import { View, Text, TouchableOpacity, Linking, Alert } from 'react-native';
import { Phone, MessageCircle, MapPin, Clock, IndianRupee } from 'lucide-react-native';
import { BookingWithDetails } from '@vms/shared/services';
import { StatusChip } from '../../../components/domain/StatusChip';
import { format, parse } from 'date-fns';
import { useThemeColors } from '../../../hooks/useThemeColors';

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
  const phone = formatPhone(booking.customer?.phone || '');
  const initial = customerName.charAt(0).toUpperCase();
  const { colors } = useThemeColors();

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
      className="bg-card rounded-2xl border border-border mb-3 relative overflow-hidden shadow-sm"
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 4, backgroundColor: stripeColor }} />

      <View className="p-4 pl-5">
        {/* Top Row: Customer Info & Total/Payment */}
        <View className="flex-row justify-between items-start mb-3">
          <View className="flex-row items-center gap-3">
            <View className="w-10 h-10 rounded-xl bg-primary/10 items-center justify-center">
              <Text className="text-base font-extrabold text-primary">{initial}</Text>
            </View>
            <View>
              <Text className="text-[15px] font-bold text-foreground">{customerName}</Text>
              <Text className="text-xs text-muted-foreground mt-0.5">{booking.booking_number}</Text>
            </View>
          </View>

          <View className="items-end gap-1">
            <Text className="text-base font-extrabold text-foreground">₹{totalAmountRs}</Text>
            <StatusChip status={booking.payment_status} size="sm" />
          </View>
        </View>

        {/* Middle Row: Court, Time, Duration */}
        <View className="flex-row items-center flex-wrap gap-2 mb-3.5">
          <View className="flex-row items-center gap-1">
            <MapPin size={12} color={colors.mutedForeground} />
            <Text className="text-xs font-semibold text-muted-foreground">{booking.court?.name || 'Court'}</Text>
          </View>
          <View className="w-[3px] h-[3px] rounded-full bg-border" />
          <View className="flex-row items-center gap-1">
            <Clock size={12} color={colors.mutedForeground} />
            <Text className="text-xs font-semibold text-muted-foreground">
              {formattedStart} – {formattedEnd}
            </Text>
          </View>
          <View className="w-[3px] h-[3px] rounded-full bg-border" />
          <Text className="text-xs font-semibold text-muted-foreground">{booking.duration_minutes / 60}h</Text>
        </View>

        {/* Bottom Row: Status & Quick Actions */}
        <View className="flex-row items-center justify-between pt-1 border-t border-border/50">
          <View className="flex-row items-center gap-1.5">
            <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: stripeColor }} />
            <StatusChip status={booking.status} size="sm" />
          </View>

          <View className="flex-row items-center gap-2">
            {phone ? (
              <>
                <TouchableOpacity
                  className="w-8 h-8 rounded-lg bg-muted border border-border items-center justify-center"
                  onPress={handlePhonePress}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Phone size={14} color={colors.mutedForeground} />
                </TouchableOpacity>
                <TouchableOpacity
                  className="w-8 h-8 rounded-lg bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 items-center justify-center"
                  onPress={handleWhatsAppPress}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <MessageCircle size={14} color="#16A34A" />
                </TouchableOpacity>
              </>
            ) : null}

            {pendingAmountRs > 0 && (
              <TouchableOpacity
                className="flex-row items-center px-2.5 h-8 rounded-lg bg-primary/10 border border-primary/20 gap-1"
                onPress={onCollectPress || onPress}
              >
                <IndianRupee size={12} color={colors.primary} />
                <Text className="text-xs font-bold text-primary">Collect ₹{pendingAmountRs}</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}
