import React, { useMemo, useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, TextInput, Keyboard } from 'react-native';
import BottomSheet, { BottomSheetBackdrop, BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { useMarkPaymentAsPaid } from '../hooks/usePayments';
import { PaymentMethod } from '@vms/shared/types';
import { useThemeColors } from '../../../hooks/useThemeColors';

interface MarkAsPaidSheetProps {
  payment: any | null;
  onClose: () => void;
}

const PAYMENT_MODES: { label: string; value: PaymentMethod }[] = [
  { label: 'UPI', value: 'upi' },
  { label: 'Cash', value: 'cash' },
  { label: 'Card', value: 'card' },
  { label: 'Bank Transfer', value: 'bank_transfer' },
];

export function MarkAsPaidSheet({ payment, onClose }: MarkAsPaidSheetProps) {
  const snapPoints = useMemo(() => ['50%', '75%'], []);
  const { mutateAsync: markAsPaid, isPending } = useMarkPaymentAsPaid();
  const { colors } = useThemeColors();

  const [mode, setMode] = useState<PaymentMethod>('upi');
  const [notes, setNotes] = useState('');
  
  const bottomSheetRef = useRef<BottomSheet>(null);

  useEffect(() => {
    if (payment) {
      Keyboard.dismiss();
      bottomSheetRef.current?.snapToIndex(0);
    } else {
      Keyboard.dismiss();
      bottomSheetRef.current?.close();
    }
  }, [payment]);

  const handleSave = async () => {
    if (!payment) return;
    try {
      await markAsPaid({
        paymentId: payment.id,
        mode,
        paidOn: new Date().toISOString().split('T')[0],
        notes,
      });
    } catch (err) {
      console.error(err);
    } finally {
      Keyboard.dismiss();
      bottomSheetRef.current?.close();
      onClose();
    }
  };

  return (
    <BottomSheet
      ref={bottomSheetRef}
      index={payment ? 0 : -1}
      snapPoints={snapPoints}
      enablePanDownToClose
      backgroundStyle={{ backgroundColor: colors.card }}
      handleIndicatorStyle={{ backgroundColor: colors.mutedForeground }}
      onChange={(idx) => {
        if (idx === -1 && payment) {
          onClose();
        }
      }}
      backdropComponent={(props) => (
        <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} />
      )}
    >
      <BottomSheetScrollView className="px-6 py-2" keyboardShouldPersistTaps="handled">
        <Text className="text-xl font-extrabold text-foreground mb-1">Mark as Paid</Text>
        <Text className="text-sm text-muted-foreground mb-6">
          Record payment for {payment?.members?.customers?.full_name}
        </Text>

        <View className="mb-6">
          <Text className="text-sm font-semibold text-foreground mb-3">Payment Mode</Text>
          <View className="flex-row flex-wrap gap-3">
            {PAYMENT_MODES.map((m) => (
              <TouchableOpacity
                key={m.value}
                className={`px-4 py-2.5 rounded-full border ${mode === m.value ? 'bg-primary/10 border-primary' : 'bg-muted border-border'}`}
                onPress={() => setMode(m.value)}
              >
                <Text className={`text-sm font-semibold ${mode === m.value ? 'text-primary' : 'text-muted-foreground'}`}>
                  {m.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View className="mb-6">
          <Text className="text-sm font-semibold text-foreground mb-3">Notes (Optional)</Text>
          <TextInput
            className="border border-border rounded-lg p-3 text-base text-foreground min-h-[80px]"
            style={{ textAlignVertical: 'top' }}
            placeholder="Transaction ID or remarks"
            placeholderTextColor={colors.mutedForeground}
            value={notes}
            onChangeText={setNotes}
            multiline
          />
        </View>

        <TouchableOpacity 
          className={`p-4 rounded-xl items-center mt-3 mb-10 ${isPending ? 'bg-muted' : 'bg-primary'}`}
          onPress={handleSave}
          disabled={isPending}
        >
          <Text className={`text-base font-bold ${isPending ? 'text-muted-foreground' : 'text-primary-foreground'}`}>
            {isPending ? 'Saving...' : 'Confirm Payment'}
          </Text>
        </TouchableOpacity>
      </BottomSheetScrollView>
    </BottomSheet>
  );
}
