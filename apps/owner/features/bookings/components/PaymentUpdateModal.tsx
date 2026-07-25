import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, TextInput, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { BookingWithDetails } from '@vms/shared/services';
import { BookingPaymentStatus, PaymentMode } from '@vms/shared/types';
import { X, IndianRupee, CheckCircle2, CreditCard, Banknote, Smartphone, HelpCircle } from 'lucide-react-native';

interface PaymentUpdateModalProps {
  visible: boolean;
  booking: BookingWithDetails | null;
  onClose: () => void;
  onSave: (payload: {
    payment_status: BookingPaymentStatus;
    payment_mode?: PaymentMode | null;
    advance?: number;
    pending?: number;
    payment_notes?: string | null;
  }) => Promise<any>;
}

const paymentModes: { label: string; value: PaymentMode; icon: any }[] = [
  { label: 'UPI', value: 'upi', icon: Smartphone },
  { label: 'Cash', value: 'cash', icon: Banknote },
  { label: 'Card', value: 'card', icon: CreditCard },
  { label: 'Online', value: 'online', icon: HelpCircle },
];

export function PaymentUpdateModal({ visible, booking, onClose, onSave }: PaymentUpdateModalProps) {
  if (!booking) return null;

  const totalRs = (booking.final_amount || 0) / 100;
  const currentAdvanceRs = (booking.advance || 0) / 100;
  const currentPendingRs = (booking.pending || 0) / 100;

  const [collectAmount, setCollectAmount] = useState<string>(currentPendingRs.toString());
  const [selectedMode, setSelectedMode] = useState<PaymentMode>(booking.payment_mode || 'upi');
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
        style={styles.overlay}
      >
        <View style={styles.modalContainer}>
          <View style={styles.header}>
            <Text style={styles.title}>Collect Payment</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <X size={18} color="#64748B" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
            {/* Summary Box */}
            <View style={styles.summaryBox}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Total Amount:</Text>
                <Text style={styles.summaryValue}>₹{totalRs}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Already Paid:</Text>
                <Text style={[styles.summaryValue, { color: '#16A34A' }]}>₹{currentAdvanceRs}</Text>
              </View>
              <View style={[styles.summaryRow, styles.summaryTotalRow]}>
                <Text style={styles.summaryPendingLabel}>Pending Amount:</Text>
                <Text style={styles.summaryPendingValue}>₹{currentPendingRs}</Text>
              </View>
            </View>

            {/* Input Amount */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Amount Collecting Now (₹)</Text>
              <View style={styles.inputContainer}>
                <IndianRupee size={16} color="#64748B" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  value={collectAmount}
                  onChangeText={setCollectAmount}
                  keyboardType="numeric"
                  placeholder="0"
                  placeholderTextColor="#94A3B8"
                />
                <TouchableOpacity
                  style={styles.quickFullBtn}
                  onPress={() => setCollectAmount(currentPendingRs.toString())}
                >
                  <Text style={styles.quickFullText}>Full</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Payment Mode */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Payment Mode</Text>
              <View style={styles.modesGrid}>
                {paymentModes.map((mode) => {
                  const active = selectedMode === mode.value;
                  const Icon = mode.icon;
                  return (
                    <TouchableOpacity
                      key={mode.value}
                      style={[styles.modeCard, active && styles.modeCardActive]}
                      onPress={() => setSelectedMode(mode.value)}
                    >
                      <Icon size={18} color={active ? '#2563EB' : '#64748B'} />
                      <Text style={[styles.modeText, active && styles.modeTextActive]}>
                        {mode.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Notes */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Payment Notes (Optional)</Text>
              <TextInput
                style={styles.notesInput}
                value={notes}
                onChangeText={setNotes}
                placeholder="e.g. Transaction ID, UPI sender name"
                placeholderTextColor="#94A3B8"
                multiline
              />
            </View>

            {error ? <Text style={styles.errorText}>{error}</Text> : null}
          </ScrollView>

          <View style={styles.footer}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose} disabled={loading}>
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={loading}>
              {loading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <>
                  <CheckCircle2 size={16} color="#fff" />
                  <Text style={styles.saveBtnText}>Update Payment</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    width: '100%',
    maxHeight: '90%',
    backgroundColor: '#fff',
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
  },
  closeBtn: {
    padding: 6,
    borderRadius: 16,
    backgroundColor: '#F8FAFC',
  },
  body: {
    padding: 20,
  },
  summaryBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '500',
  },
  summaryValue: {
    fontSize: 14,
    color: '#0F172A',
    fontWeight: '700',
  },
  summaryTotalRow: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    marginBottom: 0,
  },
  summaryPendingLabel: {
    fontSize: 14,
    color: '#DC2626',
    fontWeight: '700',
  },
  summaryPendingValue: {
    fontSize: 16,
    color: '#DC2626',
    fontWeight: '800',
  },
  fieldGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    borderRadius: 14,
    paddingHorizontal: 12,
    backgroundColor: '#fff',
  },
  inputIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  quickFullBtn: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  quickFullText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#2563EB',
  },
  modesGrid: {
    flexDirection: 'row',
    gap: 10,
  },
  modeCard: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    gap: 6,
  },
  modeCardActive: {
    backgroundColor: '#EFF6FF',
    borderColor: '#2563EB',
  },
  modeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  modeTextActive: {
    color: '#2563EB',
    fontWeight: '700',
  },
  notesInput: {
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 14,
    padding: 12,
    fontSize: 14,
    color: '#0F172A',
    height: 80,
    textAlignVertical: 'top',
  },
  errorText: {
    color: '#DC2626',
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 10,
  },
  footer: {
    flexDirection: 'row',
    gap: 12,
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#64748B',
  },
  saveBtn: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: '#2563EB',
  },
  saveBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#fff',
  },
});
