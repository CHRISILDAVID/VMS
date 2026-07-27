import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, TextInput, Alert, Switch } from 'react-native';
import { X } from 'lucide-react-native';
import { MemberWithDetails } from '@vms/shared/services';
import { useAddMember, useUpdateMember } from '../hooks/useMemberships';

interface AddMemberModalProps {
  slotId: string;
  visible: boolean;
  onClose: () => void;
}

export function AddMemberModal({ slotId, visible, onClose }: AddMemberModalProps) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const addMutation = useAddMember();

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
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <View style={styles.header}>
            <Text style={styles.title}>Add Member</Text>
            <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
              <X size={16} color="#64748B" />
            </TouchableOpacity>
          </View>
          <View style={styles.content}>
            <Text style={styles.label}>Full Name</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Arjun Sharma"
              value={name}
              onChangeText={setName}
            />

            <Text style={styles.label}>Mobile Number</Text>
            <TextInput
              style={styles.input}
              placeholder="98765 43210"
              keyboardType="phone-pad"
              value={phone}
              onChangeText={setPhone}
            />

            <TouchableOpacity
              style={[styles.submitBtn, (!name.trim() || !phone.trim() || addMutation.isPending) && styles.submitBtnDisabled]}
              onPress={handleSubmit}
              disabled={!name.trim() || !phone.trim() || addMutation.isPending}
            >
              <Text style={styles.submitText}>{addMutation.isPending ? 'Adding...' : 'Add Member'}</Text>
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

  useEffect(() => {
    if (member) {
      setName(member.customer?.full_name || '');
      setPhone(member.customer?.phone || '');
      setIsActive(member.is_active);
    }
  }, [member]);

  if (!member) return null;

  const handleSubmit = () => {
    if (!name.trim() || !phone.trim()) {
      Alert.alert('Validation', 'Please provide name and phone number.');
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
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <View style={styles.header}>
            <Text style={styles.title}>Edit Member</Text>
            <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
              <X size={16} color="#64748B" />
            </TouchableOpacity>
          </View>
          <View style={styles.content}>
            <Text style={styles.label}>Full Name</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Arjun Sharma"
              value={name}
              onChangeText={setName}
            />

            <Text style={styles.label}>Mobile Number</Text>
            <TextInput
              style={styles.input}
              placeholder="98765 43210"
              keyboardType="phone-pad"
              value={phone}
              onChangeText={setPhone}
            />

            <View style={styles.switchRow}>
              <Text style={styles.switchLabel}>Active Status</Text>
              <Switch
                value={isActive}
                onValueChange={setIsActive}
                trackColor={{ false: '#E2E8F0', true: '#16A34A' }}
              />
            </View>

            <TouchableOpacity
              style={[styles.submitBtn, (!name.trim() || !phone.trim() || updateMutation.isPending) && styles.submitBtnDisabled]}
              onPress={handleSubmit}
              disabled={!name.trim() || !phone.trim() || updateMutation.isPending}
            >
              <Text style={styles.submitText}>{updateMutation.isPending ? 'Saving...' : 'Save Changes'}</Text>
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
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  sheet: {
    backgroundColor: '#fff',
    borderRadius: 20,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  title: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  closeBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    padding: 20,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    fontWeight: '600',
    color: '#0F172A',
    marginBottom: 16,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    marginBottom: 20,
  },
  switchLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0F172A',
  },
  submitBtn: {
    backgroundColor: '#2563EB',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
  },
  submitBtnDisabled: {
    backgroundColor: '#E2E8F0',
  },
  submitText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
});
