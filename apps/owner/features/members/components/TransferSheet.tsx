import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { X, Check } from 'lucide-react-native';
import { MemberWithDetails, MembershipSlotWithDetails } from '@vms/shared/services';
import { useTransferMember } from '../hooks/useMemberships';

interface TransferSheetProps {
  member: MemberWithDetails | null;
  slots: MembershipSlotWithDetails[];
  onClose: () => void;
}

export function TransferSheet({ member, slots, onClose }: TransferSheetProps) {
  const [selectedSlotId, setSelectedSlotId] = useState<string>('');
  const transferMutation = useTransferMember();

  if (!member) return null;

  const availableSlots = slots.filter(s => s.id !== member.slot_id && s.is_recruiting);

  const handleTransfer = () => {
    if (!selectedSlotId) return;
    transferMutation.mutate(
      { memberId: member.id, toSlotId: selectedSlotId },
      {
        onSuccess: () => {
          Alert.alert('Success', 'Member transferred successfully.');
          onClose();
        },
        onError: (err: any) => {
          Alert.alert('Error', err.message || 'Failed to transfer member.');
        },
      }
    );
  };

  return (
    <Modal visible={!!member} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose} />
        <View style={styles.sheet}>
          <View style={styles.handleBar}><View style={styles.handle} /></View>
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>Transfer Member</Text>
              <Text style={styles.subTitle}>Moving {member.customer?.full_name || 'Member'}</Text>
            </View>
            <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
              <X size={18} color="#64748B" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content}>
            <Text style={styles.sectionLabel}>Select Target Slot</Text>
            {availableSlots.length === 0 ? (
              <Text style={styles.emptyText}>No other open slots available for transfer.</Text>
            ) : (
              availableSlots.map(s => {
                const activeCount = s.active_count || 0;
                const vacant = s.capacity - activeCount;
                const isSelected = selectedSlotId === s.id;

                return (
                  <TouchableOpacity
                    key={s.id}
                    style={[styles.slotCard, isSelected && styles.slotCardSelected]}
                    onPress={() => setSelectedSlotId(s.id)}
                  >
                    <View style={styles.slotInfo}>
                      <Text style={[styles.slotName, isSelected && { color: '#2563EB' }]}>{s.name}</Text>
                      <Text style={styles.slotSub}>
                        {s.playing_days?.join(', ') || 'No days'} · {s.start_time?.slice(0, 5)}–{s.end_time?.slice(0, 5)}
                      </Text>
                    </View>
                    <View style={styles.slotRight}>
                      <Text style={[styles.vacantText, { color: vacant > 0 ? '#16A34A' : '#DC2626' }]}>
                        {vacant > 0 ? `${vacant} vacant` : 'Full'}
                      </Text>
                      {isSelected && <Check size={18} color="#2563EB" />}
                    </View>
                  </TouchableOpacity>
                );
              })
            )}

            <TouchableOpacity
              style={[styles.confirmBtn, (!selectedSlotId || transferMutation.isPending) && styles.confirmBtnDisabled]}
              onPress={handleTransfer}
              disabled={!selectedSlotId || transferMutation.isPending}
            >
              <Text style={[styles.confirmText, (!selectedSlotId || transferMutation.isPending) && { color: '#94A3B8' }]}>
                {transferMutation.isPending ? 'Transferring...' : 'Confirm Transfer'}
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  sheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '80%',
  },
  handleBar: {
    alignItems: 'center',
    paddingTop: 12,
    paddingBottom: 4,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#E2E8F0',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  subTitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    padding: 20,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 14,
    color: '#94A3B8',
    textAlign: 'center',
    marginVertical: 20,
  },
  slotCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    backgroundColor: '#F8FAFC',
    marginBottom: 10,
  },
  slotCardSelected: {
    borderColor: '#2563EB',
    backgroundColor: '#EFF6FF',
  },
  slotInfo: {
    flex: 1,
  },
  slotName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
  },
  slotSub: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  slotRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  vacantText: {
    fontSize: 12,
    fontWeight: '600',
  },
  confirmBtn: {
    backgroundColor: '#2563EB',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 30,
  },
  confirmBtnDisabled: {
    backgroundColor: '#E2E8F0',
  },
  confirmText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
});
