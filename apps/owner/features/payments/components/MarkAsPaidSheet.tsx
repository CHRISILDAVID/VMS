import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import BottomSheet, { BottomSheetBackdrop, BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { useMarkPaymentAsPaid } from '../hooks/usePayments';
import { PaymentMode } from '@vms/shared/types';

interface MarkAsPaidSheetProps {
  payment: any | null;
  onClose: () => void;
}

const PAYMENT_MODES: { label: string; value: PaymentMode }[] = [
  { label: 'UPI', value: 'upi' },
  { label: 'Cash', value: 'cash' },
  { label: 'Card', value: 'card' },
  { label: 'Bank Transfer', value: 'bank_transfer' },
];

export function MarkAsPaidSheet({ payment, onClose }: MarkAsPaidSheetProps) {
  const snapPoints = useMemo(() => ['50%', '75%'], []);
  const { mutateAsync: markAsPaid, isPending } = useMarkPaymentAsPaid();

  const [mode, setMode] = useState<PaymentMode>('upi');
  const [notes, setNotes] = useState('');

  const handleSave = async () => {
    if (!payment) return;
    try {
      await markAsPaid({
        paymentId: payment.id,
        mode,
        paidOn: new Date().toISOString().split('T')[0],
        notes,
      });
      onClose();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <BottomSheet
      index={payment ? 0 : -1}
      snapPoints={snapPoints}
      enablePanDownToClose
      onClose={onClose}
      backdropComponent={(props) => (
        <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} />
      )}
    >
      <BottomSheetScrollView style={styles.contentContainer} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Mark as Paid</Text>
        <Text style={styles.subtitle}>
          Record payment for {payment?.members?.customers?.full_name}
        </Text>

        <View style={styles.section}>
          <Text style={styles.label}>Payment Mode</Text>
          <View style={styles.modesRow}>
            {PAYMENT_MODES.map((m) => (
              <TouchableOpacity
                key={m.value}
                style={[styles.modeChip, mode === m.value && styles.modeChipSelected]}
                onPress={() => setMode(m.value)}
              >
                <Text style={[styles.modeText, mode === m.value && styles.modeTextSelected]}>
                  {m.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Notes (Optional)</Text>
          <TextInput
            style={styles.input}
            placeholder="Transaction ID or remarks"
            value={notes}
            onChangeText={setNotes}
            multiline
          />
        </View>

        <TouchableOpacity 
          style={[styles.saveBtn, isPending && styles.saveBtnDisabled]} 
          onPress={handleSave}
          disabled={isPending}
        >
          <Text style={styles.saveBtnText}>
            {isPending ? 'Saving...' : 'Confirm Payment'}
          </Text>
        </TouchableOpacity>
      </BottomSheetScrollView>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  contentContainer: {
    padding: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
  },
  subtitle: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 24,
  },
  section: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 12,
  },
  modesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  modeChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  modeChipSelected: {
    backgroundColor: '#EFF6FF',
    borderColor: '#3B82F6',
  },
  modeText: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '600',
  },
  modeTextSelected: {
    color: '#2563EB',
  },
  input: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  saveBtn: {
    backgroundColor: '#2563EB',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 40,
  },
  saveBtnDisabled: {
    opacity: 0.7,
  },
  saveBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});
