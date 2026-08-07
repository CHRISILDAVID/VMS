import React, { useState } from 'react';
import { View, Text, Modal, TouchableOpacity, TextInput, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { BookingWithDetails } from '@vms/shared/services';
import { BookingPaymentStatus, PaymentMethod } from '@vms/shared/types';
import { X, IndianRupee, CheckCircle2, CreditCard, Banknote, Smartphone, HelpCircle } from 'lucide-react-native';
import { useThemeColors } from '../../../hooks/useThemeColors';

interface PaymentUpdateModalProps {
  visible: boolean;
  booking: BookingWithDetails | null;
  onClose: () => void;
  onSave: (payload: {
    payment_status: BookingPaymentStatus;
    payment_mode?: PaymentMethod | null;
    advance?: number;
    pending?: number;
    payment_notes?: string | null;
  }) => Promise<any>;
}

const PaymentMethods: { label: string; value: PaymentMethod; icon: any }[] = [
  { label: 'UPI', value: 'upi', icon: Smartphone },
  { label: 'Cash', value: 'cash', icon: Banknote },
  { label: 'Card', value: 'card', icon: CreditCard },
  { label: 'Online', value: 'online', icon: HelpCircle },
];

export function PaymentUpdateModal({ visible, booking, onClose, onSave }: PaymentUpdateModalProps) {
  if (!booking) return null;

  const { colors } = useThemeColors();
  const totalRs = (booking.final_amount || 0) / 100;
  const currentAdvanceRs = (booking.advance || 0) / 100;
  const currentPendingRs = (booking.pending || 0) / 100;

  const [collectAmount, setCollectAmount] = useState<string>(currentPendingRs.toString());
  const [selectedMode, setSelectedMode] = useState<PaymentMethod>(booking.payment_mode || 'upi');
  const [notes, setNotes] = useState<string>(booking.payment_notes || '');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  React.useEffect(() => {
    if (booking) {
      setCollectAmount(((booking.pending || 0) / 100).toString());
      setSelectedMode(booking.payment_mode || 'upi');
      setNotes(booking.payment_notes || '');
      setError(null);
    }
  }, [booking, visible]);

  const handleSave = async () => {
    setError(null);
    const amountToCollectRs = parseFloat(collectAmount) || 0;
    if (amountToCollectRs < 0) {
      setError('Amount cannot be negative');
      return;
    }

    const amountToCollectPaise = Math.round(amountToCollectRs * 100);
    const newAdvance = (booking.advance || 0) + amountToCollectPaise;
    const newPending = Math.max(0, (booking.final_amount || 0) - newAdvance);
    
    let newStatus: BookingPaymentStatus = 'pending';
    if (newPending === 0) {
      newStatus = 'paid';
    } else if (newAdvance > 0) {
      newStatus = 'partial';
    }

    setLoading(true);
    try {
      await onSave({
        payment_status: newStatus,
        payment_mode: selectedMode,
        advance: newAdvance,
        pending: newPending,
        payment_notes: notes.trim() || null,
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to update payment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1 bg-black/50 justify-center items-center p-5"
      >
        <View className="w-full max-h-[90%] bg-card rounded-3xl overflow-hidden shadow-xl">
          <View className="flex-row justify-between items-center px-5 py-4 border-b border-border">
            <Text className="text-lg font-bold text-foreground">Collect Payment</Text>
            <TouchableOpacity onPress={onClose} className="p-1.5 rounded-2xl bg-muted">
              <X size={18} color={colors.mutedForeground} />
            </TouchableOpacity>
          </View>

          <ScrollView className="p-5" showsVerticalScrollIndicator={false}>
            {/* Summary Box */}
            <View className="bg-muted rounded-2xl p-4 mb-5 border border-border">
              <View className="flex-row justify-between mb-2">
                <Text className="text-[13px] text-muted-foreground font-medium">Total Amount:</Text>
                <Text className="text-sm text-foreground font-bold">₹{totalRs}</Text>
              </View>
              <View className="flex-row justify-between mb-2">
                <Text className="text-[13px] text-muted-foreground font-medium">Already Paid:</Text>
                <Text style={{ fontSize: 14, fontWeight: '700', color: '#16A34A' }}>₹{currentAdvanceRs}</Text>
              </View>
              <View className="flex-row justify-between mt-2 pt-2 border-t border-border">
                <Text style={{ fontSize: 14, fontWeight: '700', color: '#DC2626' }}>Pending Amount:</Text>
                <Text style={{ fontSize: 16, fontWeight: '800', color: '#DC2626' }}>₹{currentPendingRs}</Text>
              </View>
            </View>

            {/* Input Amount */}
            <View className="mb-5">
              <Text className="text-sm font-bold text-foreground mb-2">Amount Collecting Now (₹)</Text>
              <View className="flex-row items-center border-[1.5px] border-border rounded-xl px-3 bg-card">
                <IndianRupee size={16} color={colors.mutedForeground} style={{ marginRight: 8 }} />
                <TextInput
                  className="flex-1 py-3 text-base font-bold text-foreground"
                  value={collectAmount}
                  onChangeText={setCollectAmount}
                  keyboardType="numeric"
                  placeholder="0"
                  placeholderTextColor={colors.mutedForeground}
                />
                <TouchableOpacity
                  className="bg-primary/10 px-3 py-1.5 rounded-lg"
                  onPress={() => setCollectAmount(currentPendingRs.toString())}
                >
                  <Text className="text-xs font-bold text-primary">Full</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Payment Mode */}
            <View className="mb-5">
              <Text className="text-sm font-bold text-foreground mb-2">Payment Mode</Text>
              <View className="flex-row gap-2.5">
                {PaymentMethods.map((mode) => {
                  const active = selectedMode === mode.value;
                  const Icon = mode.icon;
                  return (
                    <TouchableOpacity
                      key={mode.value}
                      className={`flex-1 items-center justify-center py-3 rounded-xl border-[1.5px] gap-1.5 ${active ? 'bg-primary/10 border-primary' : 'bg-muted border-border'}`}
                      onPress={() => setSelectedMode(mode.value)}
                    >
                      <Icon size={18} color={active ? colors.primary : colors.mutedForeground} />
                      <Text className={`text-xs font-semibold ${active ? 'text-primary font-bold' : 'text-muted-foreground'}`}>
                        {mode.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Notes */}
            <View className="mb-5">
              <Text className="text-sm font-bold text-foreground mb-2">Payment Notes (Optional)</Text>
              <TextInput
                className="border border-border rounded-xl p-3 text-sm text-foreground h-20"
                style={{ textAlignVertical: 'top' }}
                value={notes}
                onChangeText={setNotes}
                placeholder="e.g. Transaction ID, UPI sender name"
                placeholderTextColor={colors.mutedForeground}
                multiline
              />
            </View>

            {error ? <Text style={{ color: '#DC2626', fontSize: 13, fontWeight: '600', marginBottom: 10 }}>{error}</Text> : null}
          </ScrollView>

          <View className="flex-row gap-3 p-5 border-t border-border">
            <TouchableOpacity className="flex-1 py-3.5 rounded-xl bg-muted items-center justify-center" onPress={onClose} disabled={loading}>
              <Text className="text-[15px] font-bold text-muted-foreground">Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity className="flex-[2] flex-row items-center justify-center gap-2 py-3.5 rounded-xl bg-primary" onPress={handleSave} disabled={loading}>
              {loading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <>
                  <CheckCircle2 size={16} color="#fff" />
                  <Text className="text-[15px] font-bold text-white">Update Payment</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
