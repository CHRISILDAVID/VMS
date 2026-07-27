import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, TextInput, ActivityIndicator } from 'react-native';
import { BookingWithDetails } from '@vms/shared/services';
import { X, AlertTriangle } from 'lucide-react-native';

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
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <View style={styles.header}>
            <View style={styles.headerTitleRow}>
              <View style={styles.iconBox}>
                <AlertTriangle size={20} color="#DC2626" />
              </View>
              <Text style={styles.title}>Cancel Booking?</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <X size={18} color="#64748B" />
            </TouchableOpacity>
          </View>

          <View style={styles.body}>
            <Text style={styles.subtitle}>
              Are you sure you want to cancel booking <Text style={styles.boldText}>{booking.booking_number}</Text> for <Text style={styles.boldText}>{booking.customer?.full_name || 'Walk-in Guest'}</Text>?
            </Text>

            {advanceRs > 0 && (
              <View style={styles.alertBox}>
                <Text style={styles.alertText}>
                  ⚠️ Note: An advance of <Text style={styles.alertBold}>₹{advanceRs}</Text> was paid. Please handle any refund directly with the customer.
                </Text>
              </View>
            )}

            <Text style={styles.label}>Reason for Cancellation</Text>
            <View style={styles.reasonsList}>
              {[...commonReasons, 'Other'].map((reason) => {
                const active = selectedReason === reason;
                return (
                  <TouchableOpacity
                    key={reason}
                    style={[styles.reasonPill, active && styles.reasonPillActive]}
                    onPress={() => setSelectedReason(reason)}
                  >
                    <Text style={[styles.reasonText, active && styles.reasonTextActive]}>
                      {reason}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {selectedReason === 'Other' && (
              <TextInput
                style={styles.input}
                value={customReason}
                onChangeText={setCustomReason}
                placeholder="Enter custom cancellation reason..."
                placeholderTextColor="#94A3B8"
              />
            )}

            {error ? <Text style={styles.errorText}>{error}</Text> : null}
          </View>

          <View style={styles.footer}>
            <TouchableOpacity style={styles.backBtn} onPress={onClose} disabled={loading}>
              <Text style={styles.backBtnText}>Keep Booking</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelActionBtn} onPress={handleConfirm} disabled={loading}>
              {loading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.cancelActionText}>Yes, Cancel Booking</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
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
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#FEF2F2',
    alignItems: 'center',
    justifyContent: 'center',
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
  subtitle: {
    fontSize: 14,
    color: '#475569',
    lineHeight: 20,
    marginBottom: 16,
  },
  boldText: {
    fontWeight: '700',
    color: '#0F172A',
  },
  alertBox: {
    backgroundColor: '#FFFBEB',
    borderWidth: 1,
    borderColor: '#FDE68A',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  alertText: {
    fontSize: 13,
    color: '#92400E',
    lineHeight: 18,
  },
  alertBold: {
    fontWeight: '700',
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 10,
  },
  reasonsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  reasonPill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  reasonPillActive: {
    backgroundColor: '#FEF2F2',
    borderColor: '#DC2626',
  },
  reasonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
  },
  reasonTextActive: {
    color: '#DC2626',
    fontWeight: '700',
  },
  input: {
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 12,
    padding: 12,
    fontSize: 14,
    color: '#0F172A',
    marginTop: 4,
  },
  errorText: {
    color: '#DC2626',
    fontSize: 13,
    fontWeight: '600',
    marginTop: 10,
  },
  footer: {
    flexDirection: 'row',
    gap: 12,
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  backBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#64748B',
  },
  cancelActionBtn: {
    flex: 1.5,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: '#DC2626',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelActionText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#fff',
  },
});
