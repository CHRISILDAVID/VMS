import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, Switch } from 'react-native';
import { ChevronLeft, Plus, Edit2, ArrowRightLeft, UserX } from 'lucide-react-native';
import { MembershipSlotWithDetails, MemberWithDetails } from '@vms/shared/services';
import { useMembers, useRemoveMember, useUpdateMember } from '../hooks/useMemberships';
import { AddMemberModal, EditMemberModal } from './MemberSheets';
import { TransferSheet } from './TransferSheet';

interface SlotMembersViewProps {
  slot: MembershipSlotWithDetails;
  allSlots: MembershipSlotWithDetails[];
  onBack: () => void;
}

const payColors: Record<string, string> = { paid: '#16A34A', due: '#D97706', overdue: '#DC2626' };
const payBg: Record<string, string> = { paid: '#F0FDF4', due: '#FFFBEB', overdue: '#FEF2F2' };
const payLabel: Record<string, string> = { paid: 'Paid', due: 'Due Soon', overdue: 'Overdue' };

export function SlotMembersView({ slot, allSlots, onBack }: SlotMembersViewProps) {
  const { data: members = [], isLoading } = useMembers(slot.id);
  const removeMutation = useRemoveMember();
  const updateMutation = useUpdateMember();

  const [showAddModal, setShowAddModal] = useState(false);
  const [memberToEdit, setMemberToEdit] = useState<MemberWithDetails | null>(null);
  const [memberToTransfer, setMemberToTransfer] = useState<MemberWithDetails | null>(null);

  const activeCount = members.filter(m => m.is_active).length;

  const handleToggleActive = (m: MemberWithDetails) => {
    updateMutation.mutate({
      memberId: m.id,
      data: { is_active: !m.is_active },
    });
  };

  const handleRemove = (m: MemberWithDetails) => {
    Alert.alert(
      'Remove Member',
      `Are you sure you want to remove "${m.customer?.full_name}" from this slot?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => removeMutation.mutate(m.id),
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={onBack}>
          <ChevronLeft size={22} color="#0F172A" />
        </TouchableOpacity>
        <View style={styles.headerTitles}>
          <Text style={styles.slotName}>{slot.name}</Text>
          <Text style={styles.slotSub}>
            {slot.playing_days?.join(', ')} · {slot.start_time?.slice(0, 5)}–{slot.end_time?.slice(0, 5)}
          </Text>
        </View>
        <TouchableOpacity style={styles.addBtn} onPress={() => setShowAddModal(true)}>
          <Plus size={16} color="#fff" />
          <Text style={styles.addBtnText}>Add Member</Text>
        </TouchableOpacity>
      </View>

      {/* Stats bar */}
      <View style={styles.statsBar}>
        <Text style={styles.statsText}>
          Active Roster: <Text style={styles.statsBold}>{activeCount}/{slot.capacity}</Text> players
        </Text>
      </View>

      {/* Members list */}
      <ScrollView style={styles.listContent} showsVerticalScrollIndicator={false}>
        {isLoading ? (
          <Text style={styles.emptyText}>Loading members...</Text>
        ) : members.length === 0 ? (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyTitle}>No Members Enrolled</Text>
            <Text style={styles.emptySub}>Tap "Add Member" to enroll players into this training slot.</Text>
          </View>
        ) : (
          members.map(m => {
            const customerName = m.customer?.full_name || 'Unknown Player';
            const phone = m.customer?.phone || '';
            const initial = customerName.charAt(0).toUpperCase();
            const payStatus = m.latest_payment?.status || (m.is_active ? 'paid' : 'due');

            return (
              <View key={m.id} style={[styles.card, !m.is_active && styles.cardInactive]}>
                {/* Top Row */}
                <View style={styles.topRow}>
                  <View style={styles.avatar}>
                    <Text style={styles.avatarText}>{initial}</Text>
                  </View>
                  <View style={styles.info}>
                    <View style={styles.nameRow}>
                      <Text style={styles.name}>{customerName}</Text>
                      {!m.is_active && (
                        <View style={styles.inactiveBadge}>
                          <Text style={styles.inactiveText}>Inactive</Text>
                        </View>
                      )}
                    </View>
                    <Text style={styles.phone}>{phone}</Text>
                  </View>
                  <View style={styles.switchCol}>
                    <Text style={[styles.switchLabel, { color: m.is_active ? '#16A34A' : '#94A3B8' }]}>
                      {m.is_active ? 'Active' : 'Inactive'}
                    </Text>
                    <Switch
                      value={m.is_active}
                      onValueChange={() => handleToggleActive(m)}
                      trackColor={{ false: '#E2E8F0', true: '#16A34A' }}
                    />
                  </View>
                </View>

                {/* Bottom Row */}
                <View style={styles.bottomRow}>
                  <View style={[styles.payBadge, { backgroundColor: payBg[payStatus] || '#F0FDF4' }]}>
                    <Text style={[styles.payText, { color: payColors[payStatus] || '#16A34A' }]}>
                      {payLabel[payStatus] || 'Paid'}
                    </Text>
                  </View>

                  <View style={styles.actions}>
                    <TouchableOpacity style={styles.actionBtn} onPress={() => setMemberToEdit(m)}>
                      <Edit2 size={12} color="#64748B" />
                      <Text style={styles.actionText}>Edit</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.actionBtn, styles.transferBtn]} onPress={() => setMemberToTransfer(m)}>
                      <ArrowRightLeft size={12} color="#2563EB" />
                      <Text style={[styles.actionText, { color: '#2563EB' }]}>Transfer</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.actionBtn, styles.removeBtn]} onPress={() => handleRemove(m)}>
                      <UserX size={12} color="#DC2626" />
                      <Text style={[styles.actionText, { color: '#DC2626' }]}>Remove</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            );
          })
        )}
      </ScrollView>

      {/* Modals */}
      <AddMemberModal slotId={slot.id} visible={showAddModal} onClose={() => setShowAddModal(false)} />
      <EditMemberModal member={memberToEdit} onClose={() => setMemberToEdit(null)} />
      <TransferSheet member={memberToTransfer} slots={allSlots} onClose={() => setMemberToTransfer(null)} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    gap: 12,
  },
  backBtn: {
    padding: 6,
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
  },
  headerTitles: {
    flex: 1,
  },
  slotName: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  slotSub: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#2563EB',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  addBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#fff',
  },
  statsBar: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#EFF6FF',
    borderBottomWidth: 1,
    borderBottomColor: '#DBEAFE',
  },
  statsText: {
    fontSize: 13,
    color: '#1E40AF',
  },
  statsBold: {
    fontWeight: '800',
  },
  listContent: {
    padding: 16,
  },
  emptyText: {
    textAlign: 'center',
    color: '#64748B',
    marginTop: 20,
  },
  emptyBox: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 6,
  },
  emptySub: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 18,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    marginBottom: 10,
  },
  cardInactive: {
    opacity: 0.7,
    backgroundColor: '#F8FAFC',
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 17,
    fontWeight: '800',
    color: '#2563EB',
  },
  info: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  name: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
  },
  inactiveBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
  },
  inactiveText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748B',
  },
  phone: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  switchCol: {
    alignItems: 'center',
  },
  switchLabel: {
    fontSize: 10,
    fontWeight: '600',
    marginBottom: 2,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#F8FAFC',
    paddingTop: 10,
  },
  payBadge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 20,
  },
  payText: {
    fontSize: 11,
    fontWeight: '700',
  },
  actions: {
    flexDirection: 'row',
    gap: 6,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
  },
  actionText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
  },
  transferBtn: {
    backgroundColor: '#EFF6FF',
    borderColor: '#BFDBFE',
  },
  removeBtn: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FCA5A5',
  },
});
