import { formatPhone } from '@vms/shared/utils';
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert, Switch } from 'react-native';
import { ChevronLeft, Plus, Edit2, ArrowRightLeft, UserX } from 'lucide-react-native';
import { MembershipSlotWithDetails, MemberWithDetails } from '@vms/shared/services';
import { useMembers, useRemoveMember, useUpdateMember } from '../hooks/useMemberships';
import { useVoidPaymentsForMember } from '../../payments/hooks/usePayments';
import { AddMemberModal, EditMemberModal } from './MemberSheets';
import { TransferSheet } from './TransferSheet';
import { useThemeColors } from '../../../hooks/useThemeColors';

interface SlotMembersViewProps {
  slot: MembershipSlotWithDetails;
  allSlots: MembershipSlotWithDetails[];
  onBack: () => void;
}

const payClasses: Record<string, { bgClass: string; textClass: string }> = { 
  paid: { bgClass: 'bg-green-100 dark:bg-green-900/40', textClass: 'text-green-600' },
  due: { bgClass: 'bg-amber-100 dark:bg-amber-900/40', textClass: 'text-amber-600' },
  overdue: { bgClass: 'bg-red-100 dark:bg-red-900/40', textClass: 'text-destructive' }
};
const payLabel: Record<string, string> = { paid: 'Paid', due: 'Due Soon', overdue: 'Overdue' };

export function SlotMembersView({ slot, allSlots, onBack }: SlotMembersViewProps) {
  const { data: members = [], isLoading } = useMembers(slot.id);
  const removeMutation = useRemoveMember();
  const updateMutation = useUpdateMember();
  const voidMutation = useVoidPaymentsForMember();
  const { colors } = useThemeColors();

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
      `Are you sure you want to remove "${m.customer?.full_name}" from this slot?\n\nWhat would you like to do with their unpaid dues?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Keep Dues & Remove',
          style: 'destructive',
          onPress: () => removeMutation.mutate(m.id),
        },
        {
          text: 'Void Dues & Remove',
          style: 'destructive',
          onPress: () => {
            voidMutation.mutate(m.id, {
              onSuccess: () => removeMutation.mutate(m.id),
            });
          },
        },
      ]
    );
  };

  return (
    <View className="flex-1 bg-background">
      {/* Header */}
      <View className="flex-row items-center px-4 py-3 bg-card border-b border-border gap-3">
        <TouchableOpacity className="p-1.5 rounded-lg bg-muted" onPress={onBack}>
          <ChevronLeft size={22} color={colors.foreground} />
        </TouchableOpacity>
        <View className="flex-1">
          <Text className="text-lg font-extrabold text-foreground">{slot.name}</Text>
          <Text className="text-xs text-muted-foreground mt-0.5">
            {slot.playing_days?.join(', ')} · {slot.start_time?.slice(0, 5)}–{slot.end_time?.slice(0, 5)}
          </Text>
        </View>
        <TouchableOpacity className="flex-row items-center gap-1.5 bg-primary px-3 py-2 rounded-lg" onPress={() => setShowAddModal(true)}>
          <Plus size={16} color="#fff" />
          <Text className="text-[13px] font-bold text-white">Add Member</Text>
        </TouchableOpacity>
      </View>

      {/* Stats bar */}
      <View className="px-4 py-2.5 bg-primary/10 border-b border-primary/20">
        <Text className="text-[13px] text-primary">
          Active Roster: <Text className="font-extrabold">{activeCount}/{slot.capacity}</Text> players
        </Text>
      </View>

      {/* Members list */}
      <ScrollView className="px-4 pt-4 pb-20" showsVerticalScrollIndicator={false}>
        {isLoading ? (
          <Text className="text-center text-muted-foreground mt-5">Loading members...</Text>
        ) : members.length === 0 ? (
          <View className="p-10 items-center justify-center">
            <Text className="text-base font-bold text-foreground mb-1.5">No Members Enrolled</Text>
            <Text className="text-[13px] text-muted-foreground text-center leading-[18px]">Tap "Add Member" to enroll players into this training slot.</Text>
          </View>
        ) : (
          members.map(m => {
            const customerName = m.customer?.full_name || 'Unknown Player';
            const phone = formatPhone(m.customer?.phone || '');
            const initial = customerName.charAt(0).toUpperCase();
            const payStatus = m.latest_payment?.status || (m.is_active ? 'paid' : 'due');
            const payTheme = payClasses[payStatus] || payClasses.paid;

            return (
              <View key={m.id} className={`bg-card rounded-2xl p-3.5 border border-border mb-2.5 ${!m.is_active ? 'opacity-70 bg-muted' : ''}`}>
                {/* Top Row */}
                <View className="flex-row items-center gap-3 mb-3">
                  <View className="w-[42px] h-[42px] rounded-xl bg-primary/10 items-center justify-center">
                    <Text className="text-[17px] font-extrabold text-primary">{initial}</Text>
                  </View>
                  <View className="flex-1">
                    <View className="flex-row items-center gap-1.5 mb-0.5">
                      <Text className="text-[15px] font-bold text-foreground">{customerName}</Text>
                      {!m.is_active && (
                        <View className="px-1.5 py-0.5 rounded-md bg-muted border border-border">
                          <Text className="text-[10px] font-bold text-muted-foreground">Inactive</Text>
                        </View>
                      )}
                    </View>
                    <Text className="text-xs text-muted-foreground">{phone}</Text>
                  </View>
                  <View className="items-center">
                    <Text className={`text-[10px] font-semibold mb-0.5 ${m.is_active ? 'text-green-600' : 'text-muted-foreground'}`}>
                      {m.is_active ? 'Active' : 'Inactive'}
                    </Text>
                    <Switch
                      value={m.is_active}
                      onValueChange={() => handleToggleActive(m)}
                      trackColor={{ false: colors.muted, true: '#16A34A' }}
                      thumbColor="#fff"
                    />
                  </View>
                </View>

                {/* Bottom Row */}
                <View className="flex-row items-center justify-between border-t border-border pt-2.5">
                  <View className={`px-2.5 py-1 rounded-full ${payTheme.bgClass}`}>
                    <Text className={`text-[11px] font-bold ${payTheme.textClass}`}>
                      {payLabel[payStatus] || 'Paid'}
                    </Text>
                  </View>

                  <View className="flex-row gap-1.5">
                    <TouchableOpacity className="flex-row items-center gap-1 px-2.5 py-1.5 bg-muted border border-border rounded-lg" onPress={() => setMemberToEdit(m)}>
                      <Edit2 size={12} color={colors.mutedForeground} />
                      <Text className="text-[11px] font-semibold text-muted-foreground">Edit</Text>
                    </TouchableOpacity>
                    <TouchableOpacity className="flex-row items-center gap-1 px-2.5 py-1.5 bg-primary/10 border border-primary/20 rounded-lg" onPress={() => setMemberToTransfer(m)}>
                      <ArrowRightLeft size={12} color={colors.primary} />
                      <Text className="text-[11px] font-semibold text-primary">Transfer</Text>
                    </TouchableOpacity>
                    <TouchableOpacity className="flex-row items-center gap-1 px-2.5 py-1.5 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg" onPress={() => handleRemove(m)}>
                      <UserX size={12} color="#DC2626" />
                      <Text className="text-[11px] font-semibold text-destructive">Remove</Text>
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
