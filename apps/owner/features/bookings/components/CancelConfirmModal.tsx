import React, { useState } from 'react';
import { View, Text, Modal, TouchableOpacity, TextInput, ActivityIndicator } from 'react-native';
import { BookingWithDetails } from '@vms/shared/services';
import { X, AlertTriangle } from 'lucide-react-native';
import { useThemeColors } from '../../../hooks/useThemeColors';

interface CancelConfirmModalProps {
  visible: boolean;
  booking: BookingWithDetails | null;
  onClose: () => void;
  onConfirm: (reason?: string) => Promise<any>;
}

const commonReasons = [
  'Customer requested cancellation',
  'Court blocked / unavailable',
  'No-show',
  'Payment not received',
];

export function CancelConfirmModal({ visible, booking, onClose, onConfirm }: CancelConfirmModalProps) {
  if (!booking) return null;

  const { colors } = useThemeColors();
  const advanceRs = (booking.advance || 0) / 100;
  const [selectedReason, setSelectedReason] = useState<string>(commonReasons[0]);
  const [customReason, setCustomReason] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleConfirm = async () => {
    setError(null);
    const finalReason = selectedReason === 'Other' ? customReason.trim() : selectedReason;

    setLoading(true);
    try {
      await onConfirm(finalReason || undefined);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to cancel booking');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View className="flex-1 bg-black/50 justify-center items-center p-5">
        <View className="w-full bg-card rounded-3xl overflow-hidden shadow-xl">
          <View className="flex-row justify-between items-center px-5 pt-5 pb-4 border-b border-border">
            <View className="flex-row items-center gap-3">
              <View className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-900/40 items-center justify-center">
                <AlertTriangle size={20} color="#DC2626" />
              </View>
              <Text className="text-lg font-bold text-foreground">Cancel Booking?</Text>
            </View>
            <TouchableOpacity onPress={onClose} className="p-1.5 rounded-2xl bg-muted">
              <X size={18} color={colors.mutedForeground} />
            </TouchableOpacity>
          </View>

          <View className="p-5">
            <Text className="text-sm text-muted-foreground leading-5 mb-4">
              Are you sure you want to cancel booking <Text className="font-bold text-foreground">{booking.booking_number}</Text> for <Text className="font-bold text-foreground">{booking.customer?.full_name || 'Walk-in Guest'}</Text>?
            </Text>

            {advanceRs > 0 && (
              <View className="bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800 rounded-xl p-3 mb-4">
                <Text style={{ fontSize: 13, color: '#92400E', lineHeight: 18 }}>
                  ⚠️ Note: An advance of <Text style={{ fontWeight: '700' }}>₹{advanceRs}</Text> was paid. Please handle any refund directly with the customer.
                </Text>
              </View>
            )}

            <Text className="text-sm font-bold text-foreground mb-2.5">Reason for Cancellation</Text>
            <View className="flex-row flex-wrap gap-2 mb-3">
              {[...commonReasons, 'Other'].map((reason) => {
                const active = selectedReason === reason;
                return (
                  <TouchableOpacity
                    key={reason}
                    className={`px-3.5 py-2 rounded-full border ${active ? 'bg-red-50 dark:bg-red-900/30 border-destructive' : 'bg-muted border-border'}`}
                    onPress={() => setSelectedReason(reason)}
                  >
                    <Text className={`text-[13px] font-semibold ${active ? 'text-destructive font-bold' : 'text-muted-foreground'}`}>
                      {reason}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {selectedReason === 'Other' && (
              <TextInput
                className="border border-border rounded-xl p-3 text-sm text-foreground mt-1"
                value={customReason}
                onChangeText={setCustomReason}
                placeholder="Enter custom cancellation reason..."
                placeholderTextColor={colors.mutedForeground}
              />
            )}

            {error ? <Text style={{ color: '#DC2626', fontSize: 13, fontWeight: '600', marginTop: 10 }}>{error}</Text> : null}
          </View>

          <View className="flex-row gap-3 p-5 border-t border-border">
            <TouchableOpacity className="flex-1 py-3.5 rounded-xl bg-muted items-center justify-center" onPress={onClose} disabled={loading}>
              <Text className="text-[15px] font-bold text-muted-foreground">Keep Booking</Text>
            </TouchableOpacity>
            <TouchableOpacity className="flex-[1.5] py-3.5 rounded-xl bg-destructive items-center justify-center" onPress={handleConfirm} disabled={loading}>
              {loading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text className="text-[15px] font-bold text-white">Yes, Cancel Booking</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
