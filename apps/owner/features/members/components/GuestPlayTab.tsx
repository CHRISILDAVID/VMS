import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, Linking } from 'react-native';
import { UserCheck, X, Phone, CheckCircle } from 'lucide-react-native';
import { GuestPlayWithDetails } from '@vms/shared/services';
import {  formatCurrency , formatPhone } from '@vms/shared/utils';
import { useGuestPlays, useAcceptGuestAsMember, useUpdateGuestPlayStatus } from '../hooks/useMemberships';

export function GuestPlayTab() {
  const { data: guestPlays = [], isLoading } = useGuestPlays();
  const acceptMemberMutation = useAcceptGuestAsMember();
  const updateStatusMutation = useUpdateGuestPlayStatus();

  const [activeTab, setActiveTab] = useState<'upcoming' | 'completed'>('upcoming');

  const filtered = guestPlays.filter(g => g.status === activeTab);

  const handleContact = (phone?: string) => {
    if (!phone) {
      Alert.alert('No Phone', 'No contact number available for this player.');
      return;
    }
    Linking.openURL(`tel:${phone}`).catch(() => {
      Alert.alert('Error', 'Unable to make phone call.');
    });
  };

  const handleMarkCompleted = (g: GuestPlayWithDetails) => {
    updateStatusMutation.mutate({ guestPlayId: g.id, status: 'completed' });
  };

  const handleCancel = (g: GuestPlayWithDetails) => {
    Alert.alert(
      'Cancel Guest Play',
      `Are you sure you want to cancel the guest session for ${g.player_name}?`,
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: () => updateStatusMutation.mutate({ guestPlayId: g.id, status: 'rejected' }),
        },
      ]
    );
  };

  const handleAcceptMember = (g: GuestPlayWithDetails) => {
    acceptMemberMutation.mutate(g.id, {
      onSuccess: () => {
        Alert.alert('Success', `${g.player_name} has been enrolled as a full member!`);
      },
      onError: (err: any) => {
        Alert.alert('Error', err.message || 'Failed to enroll member.');
      },
    });
  };

  const handleRejectCompleted = (g: GuestPlayWithDetails) => {
    updateStatusMutation.mutate({ guestPlayId: g.id, status: 'rejected' });
  };

  return (
    <View style={styles.container}>
      {/* Segmented control */}
      <View style={styles.segmentBar}>
        <TouchableOpacity
          style={[styles.segmentBtn, activeTab === 'upcoming' && styles.segmentBtnActive]}
          onPress={() => setActiveTab('upcoming')}
        >
          <Text style={[styles.segmentText, activeTab === 'upcoming' && styles.segmentTextActive]}>
            Upcoming
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.segmentBtn, activeTab === 'completed' && styles.segmentBtnActive]}
          onPress={() => setActiveTab('completed')}
        >
          <Text style={[styles.segmentText, activeTab === 'completed' && styles.segmentTextActive]}>
            Completed
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.listContainer} contentContainerStyle={styles.listContent} showsVerticalScrollIndicator={false}>
        {isLoading ? (
          <View style={styles.centerBox}>
            <Text style={styles.loadingText}>Loading guest play sessions...</Text>
          </View>
        ) : filtered.length === 0 ? (
          <View style={styles.centerBox}>
            <Text style={styles.emojiText}>🏸</Text>
            <Text style={styles.emptyTitle}>No {activeTab} guest play sessions</Text>
            <Text style={styles.emptySub}>
              {activeTab === 'upcoming'
                ? 'When players are invited to trial a session, they will appear here.'
                : 'Completed trial sessions waiting for membership decision will appear here.'}
            </Text>
          </View>
        ) : (
          filtered.map(g => {
            const initial = g.player_name ? g.player_name.charAt(0).toUpperCase() : 'G';
            const fee = g.slot?.guest_play_fee || 30000;

            return (
              <View key={g.id} style={styles.card}>
                <View style={styles.topRow}>
                  <View style={styles.avatar}>
                    <Text style={styles.avatarText}>{initial}</Text>
                  </View>
                  <View style={styles.info}>
                    <Text style={styles.name}>{g.player_name || 'Guest Player'}</Text>
                    <Text style={styles.subText}>
                      {g.slot?.name || 'Slot'} · {g.scheduled_date}
                    </Text>
                    {g.phone ? <Text style={styles.phoneText}>{formatPhone(g.phone)}</Text> : null}
                  </View>
                  <Text style={styles.feeText}>{formatCurrency(fee)}</Text>
                </View>

                {activeTab === 'completed' ? (
                  <View style={styles.actionsRow}>
                    <TouchableOpacity
                      style={[styles.actionBtn, styles.acceptBtn, acceptMemberMutation.isPending && styles.btnDisabled]}
                      onPress={() => handleAcceptMember(g)}
                      disabled={acceptMemberMutation.isPending}
                    >
                      <UserCheck size={15} color="#16A34A" />
                      <Text style={[styles.actionText, { color: '#16A34A' }]}>Accept as Member</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.actionBtn, styles.rejectBtn]}
                      onPress={() => handleRejectCompleted(g)}
                    >
                      <X size={15} color="#DC2626" />
                      <Text style={[styles.actionText, { color: '#DC2626' }]}>Reject</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <View style={styles.actionsRow}>
                    <TouchableOpacity
                      style={[styles.actionBtn, styles.contactBtn]}
                      onPress={() => handleContact(g.phone)}
                    >
                      <Phone size={14} color="#2563EB" />
                      <Text style={[styles.actionText, { color: '#2563EB' }]}>Contact</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.actionBtn, styles.completeBtn]}
                      onPress={() => handleMarkCompleted(g)}
                    >
                      <CheckCircle size={14} color="#16A34A" />
                      <Text style={[styles.actionText, { color: '#16A34A' }]}>Completed</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.actionBtn, styles.cancelBtn]}
                      onPress={() => handleCancel(g)}
                    >
                      <X size={14} color="#64748B" />
                      <Text style={[styles.actionText, { color: '#64748B' }]}>Cancel</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            );
          })
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  segmentBar: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    padding: 3,
    marginHorizontal: 16,
    marginTop: 14,
    marginBottom: 10,
  },
  segmentBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  segmentBtnActive: {
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  segmentText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
  },
  segmentTextActive: {
    color: '#2563EB',
    fontWeight: '700',
  },
  listContainer: {
    flex: 1,
  },
  listContent: {
    padding: 16,
    paddingBottom: 88,
    gap: 12,
  },
  centerBox: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 30,
  },
  loadingText: {
    fontSize: 14,
    color: '#64748B',
  },
  emojiText: {
    fontSize: 40,
    marginBottom: 10,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 4,
    textAlign: 'center',
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
    padding: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 14,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#F5F3FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#7C3AED',
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
  },
  subText: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  phoneText: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 2,
  },
  feeText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#2563EB',
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1.5,
  },
  acceptBtn: {
    backgroundColor: '#F0FDF4',
    borderColor: '#BBF7D0',
  },
  rejectBtn: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FCA5A5',
  },
  contactBtn: {
    backgroundColor: '#EFF6FF',
    borderColor: '#BFDBFE',
  },
  completeBtn: {
    backgroundColor: '#F0FDF4',
    borderColor: '#BBF7D0',
  },
  cancelBtn: {
    backgroundColor: '#F8FAFC',
    borderColor: '#E2E8F0',
  },
  actionText: {
    fontSize: 12,
    fontWeight: '700',
  },
  btnDisabled: {
    opacity: 0.5,
  },
});
