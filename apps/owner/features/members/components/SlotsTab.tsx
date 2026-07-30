import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { Eye, ToggleLeft, ToggleRight, Edit2, Trash2, Plus } from 'lucide-react-native';
import { MembershipSlotWithDetails } from '@vms/shared/services';
import { useDeleteSlot, useToggleOpenSlot } from '../hooks/useMemberships';
import { useVoidPaymentsForSlot } from '../../payments/hooks/usePayments';

import { formatCurrency } from '@vms/shared/utils';

interface SlotsTabProps {
  slots: MembershipSlotWithDetails[];
  onViewMembers: (slot: MembershipSlotWithDetails) => void;
  onEditSlot: (slot: MembershipSlotWithDetails) => void;
  onCreateSlot: () => void;
}

const skillColors: Record<string, { bg: string; text: string }> = {
  beginner: { bg: '#F0FDF4', text: '#16A34A' },
  intermediate: { bg: '#EFF6FF', text: '#2563EB' },
  advanced: { bg: '#F5F3FF', text: '#7C3AED' },
  recreational: { bg: '#FFFBEB', text: '#D97706' },
  Beginner: { bg: '#F0FDF4', text: '#16A34A' },
  Intermediate: { bg: '#EFF6FF', text: '#2563EB' },
  Advanced: { bg: '#F5F3FF', text: '#7C3AED' },
  Recreational: { bg: '#FFFBEB', text: '#D97706' },
};

const dayNames: Record<string, string> = {
  mon: 'Mon',
  tue: 'Tue',
  wed: 'Wed',
  thu: 'Thu',
  fri: 'Fri',
  sat: 'Sat',
  sun: 'Sun',
  monday: 'Mon',
  tuesday: 'Tue',
  wednesday: 'Wed',
  thursday: 'Thu',
  friday: 'Fri',
  saturday: 'Sat',
  sunday: 'Sun',
};

function formatDays(days?: string[]): string {
  if (!days || days.length === 0) return 'No days set';
  if (days.length === 7) return 'Everyday';
  return days.map(d => dayNames[d.toLowerCase()] || d).join(', ');
}

function formatTime(time?: string): string {
  if (!time) return '';
  return time.slice(0, 5);
}

export function SlotsTab({ slots, onViewMembers, onEditSlot, onCreateSlot }: SlotsTabProps) {
  const deleteMutation = useDeleteSlot();
  const toggleMutation = useToggleOpenSlot();
  const voidMutation = useVoidPaymentsForSlot();

  const handleDelete = (slot: MembershipSlotWithDetails) => {
    Alert.alert(
      'Delete Slot',
      `Are you sure you want to delete "${slot.name}"? This cannot be undone.\n\nWhat would you like to do with any unpaid dues from members in this slot?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Keep Dues & Delete',
          style: 'destructive',
          onPress: () => deleteMutation.mutate(slot.id),
        },
        {
          text: 'Void Dues & Delete',
          style: 'destructive',
          onPress: () => {
            voidMutation.mutate(slot.id, {
              onSuccess: () => deleteMutation.mutate(slot.id),
            });
          },
        },
      ]
    );
  };

  const handleToggle = (slot: MembershipSlotWithDetails) => {
    toggleMutation.mutate({ slotId: slot.id, isRecruiting: !slot.is_recruiting });
  };

  if (slots.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyTitle}>No Membership Slots</Text>
        <Text style={styles.emptySub}>Create your first membership batch or training slot to start enrolling members.</Text>
        <TouchableOpacity style={styles.createBtn} onPress={onCreateSlot}>
          <Plus size={16} color="#fff" />
          <Text style={styles.createBtnText}>Create Slot</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {slots.map(s => {
        const sc = skillColors[s.skill_level] ?? { bg: '#F8FAFC', text: '#64748B' };
        const activeCount = s.active_count || 0;
        const vacant = s.capacity - activeCount;
        const isOpen = s.is_recruiting;
        const progressWidth = Math.min((activeCount / Math.max(s.capacity, 1)) * 100, 100);

        return (
          <TouchableOpacity key={s.id} style={styles.card} onPress={() => onViewMembers(s)} activeOpacity={0.7}>
            {/* Top Row */}
            <View style={styles.headerRow}>
              <View style={styles.titleArea}>
                <View style={styles.nameRow}>
                  <Text style={styles.name}>{s.name}</Text>
                  <View style={[styles.statusBadge, { backgroundColor: isOpen ? '#F0FDF4' : '#F1F5F9' }]}>
                    <Text style={[styles.statusText, { color: isOpen ? '#16A34A' : '#94A3B8' }]}>
                      {isOpen ? 'OPEN' : 'CLOSED'}
                    </Text>
                  </View>
                </View>
                <Text style={styles.subText}>
                  {formatDays(s.playing_days)} · {formatTime(s.start_time)} – {formatTime(s.end_time)}
                </Text>
              </View>
              <View style={styles.priceArea}>
                <Text style={styles.fee}>
                  {formatCurrency(s.monthly_fee)}
                  <Text style={styles.mo}>/mo</Text>
                </Text>
                <View style={[styles.skillBadge, { backgroundColor: sc.bg }]}>
                  <Text style={[styles.skillText, { color: sc.text }]}>
                    {s.skill_level ? s.skill_level.charAt(0).toUpperCase() + s.skill_level.slice(1) : 'General'}
                  </Text>
                </View>
              </View>
            </View>

            {/* Capacity bar */}
            <View style={styles.capacitySection}>
              <View style={styles.capacityLabels}>
                <Text style={styles.memberCount}>{activeCount}/{s.capacity} members</Text>
                <Text style={[styles.vacanciesText, { color: vacant > 0 ? '#16A34A' : '#DC2626' }]}>
                  {vacant > 0 ? `${vacant} vacanc${vacant === 1 ? 'y' : 'ies'}` : 'Full'}
                </Text>
              </View>
              <View style={styles.progressBg}>
                <View
                  style={[
                    styles.progressFill,
                    {
                      width: `${progressWidth}%`,
                      backgroundColor: activeCount >= s.capacity ? '#DC2626' : '#2563EB',
                    },
                  ]}
                />
              </View>
            </View>

            {/* Actions */}
            <View style={styles.actionsRow}>
              <TouchableOpacity style={styles.membersBtn} onPress={() => onViewMembers(s)}>
                <Eye size={14} color="#2563EB" />
                <Text style={styles.membersBtnText}>Members ({activeCount})</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionIconBtn, { backgroundColor: isOpen ? '#FEF2F2' : '#F0FDF4', borderColor: isOpen ? '#FECACA' : '#BBF7D0' }]}
                onPress={() => handleToggle(s)}
              >
                {isOpen ? <ToggleRight size={18} color="#DC2626" /> : <ToggleLeft size={18} color="#16A34A" />}
              </TouchableOpacity>

              <TouchableOpacity style={styles.actionIconBtn} onPress={() => onEditSlot(s)}>
                <Edit2 size={15} color="#64748B" />
              </TouchableOpacity>

              <TouchableOpacity style={[styles.actionIconBtn, { backgroundColor: '#FEF2F2', borderColor: '#FECACA' }]} onPress={() => handleDelete(s)}>
                <Trash2 size={15} color="#DC2626" />
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    gap: 12,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    marginBottom: 12,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  titleArea: {
    flex: 1,
    paddingRight: 8,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  name: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 20,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '700',
  },
  subText: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 4,
  },
  priceArea: {
    alignItems: 'flex-end',
  },
  fee: {
    fontSize: 16,
    fontWeight: '800',
    color: '#2563EB',
  },
  mo: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
  },
  skillBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 20,
    marginTop: 4,
  },
  skillText: {
    fontSize: 10,
    fontWeight: '700',
  },
  capacitySection: {
    marginBottom: 14,
  },
  capacityLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  memberCount: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  vacanciesText: {
    fontSize: 12,
    fontWeight: '700',
  },
  progressBg: {
    height: 6,
    backgroundColor: '#F1F5F9',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  membersBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    borderRadius: 10,
  },
  membersBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#2563EB',
  },
  actionIconBtn: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyContainer: {
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 8,
  },
  emptySub: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  createBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#2563EB',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
  },
  createBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
  },
});
