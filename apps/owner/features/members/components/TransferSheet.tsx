import React, { useState } from 'react';
import { View, Text, Modal, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { X, Check } from 'lucide-react-native';
import { MemberWithDetails, MembershipSlotWithDetails } from '@vms/shared/services';
import { useTransferMember } from '../hooks/useMemberships';
import { useThemeColors } from '../../../hooks/useThemeColors';

interface TransferSheetProps {
  member: MemberWithDetails | null;
  slots: MembershipSlotWithDetails[];
  onClose: () => void;
}

export function TransferSheet({ member, slots, onClose }: TransferSheetProps) {
  const [selectedSlotId, setSelectedSlotId] = useState<string>('');
  const transferMutation = useTransferMember();
  const { colors } = useThemeColors();

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
      <View className="flex-1 justify-end">
        <TouchableOpacity className="absolute inset-0 bg-black/50" activeOpacity={1} onPress={onClose} />
        <View className="bg-card rounded-t-3xl max-h-[80%]">
          <View className="items-center pt-3 pb-1">
            <View className="w-9 h-1 rounded-full bg-muted-foreground/30" />
          </View>
          <View className="flex-row justify-between items-center px-5 py-3 border-b border-border">
            <View>
              <Text className="text-lg font-extrabold text-foreground">Transfer Member</Text>
              <Text className="text-xs text-muted-foreground mt-0.5">Moving {member.customer?.full_name || 'Member'}</Text>
            </View>
            <TouchableOpacity className="w-8 h-8 rounded-full bg-muted items-center justify-center" onPress={onClose}>
              <X size={18} color={colors.mutedForeground} />
            </TouchableOpacity>
          </View>

          <ScrollView className="p-5" showsVerticalScrollIndicator={false}>
            <Text className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">Select Target Slot</Text>
            {availableSlots.length === 0 ? (
              <Text className="text-sm text-muted-foreground text-center my-5">No other open slots available for transfer.</Text>
            ) : (
              availableSlots.map(s => {
                const activeCount = s.active_count || 0;
                const vacant = s.capacity - activeCount;
                const isSelected = selectedSlotId === s.id;

                return (
                  <TouchableOpacity
                    key={s.id}
                    className={`flex-row justify-between items-center p-3.5 rounded-xl border-[1.5px] mb-2.5 ${isSelected ? 'border-primary bg-primary/10' : 'border-border bg-background'}`}
                    onPress={() => setSelectedSlotId(s.id)}
                  >
                    <View className="flex-1">
                      <Text className={`text-[15px] font-bold ${isSelected ? 'text-primary' : 'text-foreground'}`}>{s.name}</Text>
                      <Text className="text-xs text-muted-foreground mt-0.5">
                        {s.playing_days?.join(', ') || 'No days'} · {s.start_time?.slice(0, 5)}–{s.end_time?.slice(0, 5)}
                      </Text>
                    </View>
                    <View className="flex-row items-center gap-2">
                      <Text className={`text-xs font-semibold ${vacant > 0 ? 'text-green-600' : 'text-destructive'}`}>
                        {vacant > 0 ? `${vacant} vacant` : 'Full'}
                      </Text>
                      {isSelected && <Check size={18} color={colors.primary} />}
                    </View>
                  </TouchableOpacity>
                );
              })
            )}

            <TouchableOpacity
              className={`py-3.5 rounded-xl items-center mt-2.5 mb-8 ${(!selectedSlotId || transferMutation.isPending) ? 'bg-muted' : 'bg-primary'}`}
              onPress={handleTransfer}
              disabled={!selectedSlotId || transferMutation.isPending}
            >
              <Text className={`text-[15px] font-bold ${(!selectedSlotId || transferMutation.isPending) ? 'text-muted-foreground' : 'text-white'}`}>
                {transferMutation.isPending ? 'Transferring...' : 'Confirm Transfer'}
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}
