import { formatPhone } from '@vms/shared/utils';
import React, { useState, useEffect } from 'react';
import { View, Text, Modal, TouchableOpacity, TextInput, Alert, Switch } from 'react-native';
import { X } from 'lucide-react-native';
import { MemberWithDetails } from '@vms/shared/services';
import { useAddMember, useUpdateMember } from '../hooks/useMemberships';
import { useThemeColors } from '../../../hooks/useThemeColors';

interface AddMemberModalProps {
  slotId: string;
  visible: boolean;
  onClose: () => void;
}

export function AddMemberModal({ slotId, visible, onClose }: AddMemberModalProps) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const addMutation = useAddMember();
  const { colors } = useThemeColors();

  useEffect(() => {
    if (visible) {
      setName('');
      setPhone('');
    }
  }, [visible]);

  const handleSubmit = () => {
    if (!name.trim() || !phone.trim()) {
      Alert.alert('Validation', 'Please provide name and phone number.');
      return;
    }
    if (!/^\d{10}$/.test(phone.trim())) {
      Alert.alert('Validation', 'Phone number must be exactly 10 digits.');
      return;
    }

    addMutation.mutate(
      { slotId, customerData: { full_name: name.trim(), phone: phone.trim() } },
      {
        onSuccess: () => {
          Alert.alert('Success', 'Member added successfully.');
          onClose();
        },
        onError: (err: any) => {
          Alert.alert('Error', err.message || 'Failed to add member.');
        },
      }
    );
  };

  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose}>
      <View className="flex-1 bg-black/50 justify-center p-5">
        <View className="bg-card rounded-[20px] overflow-hidden shadow-xl">
          <View className="flex-row justify-between items-center px-5 py-3.5 border-b border-border">
            <Text className="text-base font-extrabold text-foreground">Add Member</Text>
            <TouchableOpacity className="w-8 h-8 rounded-full bg-muted items-center justify-center" onPress={onClose}>
              <X size={16} color={colors.mutedForeground} />
            </TouchableOpacity>
          </View>
          <View className="p-5">
            <Text className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Full Name</Text>
            <TextInput
              className="bg-background border-[1.5px] border-border rounded-xl px-3.5 py-3 text-[15px] font-semibold text-foreground mb-4"
              placeholder="e.g. Arjun Sharma"
              placeholderTextColor={colors.mutedForeground}
              value={name}
              onChangeText={setName}
            />

            <Text className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Mobile Number</Text>
            <TextInput
              className="bg-background border-[1.5px] border-border rounded-xl px-3.5 py-3 text-[15px] font-semibold text-foreground mb-4"
              placeholder="98765 43210"
              placeholderTextColor={colors.mutedForeground}
              keyboardType="phone-pad"
              value={phone}
              onChangeText={setPhone}
            />

            <TouchableOpacity
              className={`py-3.5 rounded-xl items-center ${(!name.trim() || !phone.trim() || addMutation.isPending) ? 'bg-muted' : 'bg-primary'}`}
              onPress={handleSubmit}
              disabled={!name.trim() || !phone.trim() || addMutation.isPending}
            >
              <Text className={`text-[15px] font-bold ${(!name.trim() || !phone.trim() || addMutation.isPending) ? 'text-muted-foreground' : 'text-white'}`}>
                {addMutation.isPending ? 'Adding...' : 'Add Member'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

interface EditMemberModalProps {
  member: MemberWithDetails | null;
  onClose: () => void;
}

export function EditMemberModal({ member, onClose }: EditMemberModalProps) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [isActive, setIsActive] = useState(true);
  const updateMutation = useUpdateMember();
  const { colors } = useThemeColors();

  useEffect(() => {
    if (member) {
      setName(member.customer?.full_name || '');
      setPhone(formatPhone(member.customer?.phone || ''));
      setIsActive(member.is_active);
    }
  }, [member]);

  if (!member) return null;

  const handleSubmit = () => {
    if (!name.trim() || !phone.trim()) {
      Alert.alert('Validation', 'Please provide name and phone number.');
      return;
    }
    if (!/^\d{10}$/.test(phone.trim())) {
      Alert.alert('Validation', 'Phone number must be exactly 10 digits.');
      return;
    }

    updateMutation.mutate(
      {
        memberId: member.id,
        data: {
          full_name: name.trim(),
          phone: phone.trim(),
          is_active: isActive,
        },
      },
      {
        onSuccess: () => {
          Alert.alert('Success', 'Member updated successfully.');
          onClose();
        },
        onError: (err: any) => {
          Alert.alert('Error', err.message || 'Failed to update member.');
        },
      }
    );
  };

  return (
    <Modal visible={!!member} animationType="fade" transparent onRequestClose={onClose}>
      <View className="flex-1 bg-black/50 justify-center p-5">
        <View className="bg-card rounded-[20px] overflow-hidden shadow-xl">
          <View className="flex-row justify-between items-center px-5 py-3.5 border-b border-border">
            <Text className="text-base font-extrabold text-foreground">Edit Member</Text>
            <TouchableOpacity className="w-8 h-8 rounded-full bg-muted items-center justify-center" onPress={onClose}>
              <X size={16} color={colors.mutedForeground} />
            </TouchableOpacity>
          </View>
          <View className="p-5">
            <Text className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Full Name</Text>
            <TextInput
              className="bg-background border-[1.5px] border-border rounded-xl px-3.5 py-3 text-[15px] font-semibold text-foreground mb-4"
              placeholder="e.g. Arjun Sharma"
              placeholderTextColor={colors.mutedForeground}
              value={name}
              onChangeText={setName}
            />

            <Text className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Mobile Number</Text>
            <TextInput
              className="bg-background border-[1.5px] border-border rounded-xl px-3.5 py-3 text-[15px] font-semibold text-foreground mb-4"
              placeholder="98765 43210"
              placeholderTextColor={colors.mutedForeground}
              keyboardType="phone-pad"
              value={phone}
              onChangeText={setPhone}
            />

            <View className="flex-row justify-between items-center p-3.5 bg-background rounded-xl border border-border mb-5">
              <Text className="text-sm font-semibold text-foreground">Active Status</Text>
              <Switch
                value={isActive}
                onValueChange={setIsActive}
                trackColor={{ false: colors.muted, true: '#16A34A' }}
                thumbColor="#fff"
              />
            </View>

            <TouchableOpacity
              className={`py-3.5 rounded-xl items-center ${(!name.trim() || !phone.trim() || updateMutation.isPending) ? 'bg-muted' : 'bg-primary'}`}
              onPress={handleSubmit}
              disabled={!name.trim() || !phone.trim() || updateMutation.isPending}
            >
              <Text className={`text-[15px] font-bold ${(!name.trim() || !phone.trim() || updateMutation.isPending) ? 'text-muted-foreground' : 'text-white'}`}>
                {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
