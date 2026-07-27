import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Modal, TextInput, Alert } from 'react-native';
import { Check, Dumbbell, Star, Calendar, UserCheck, UserPlus, X } from 'lucide-react-native';
import { MembershipApplicationWithDetails } from '@vms/shared/services';
import { useApplications, useAcceptApplication, useRejectApplication, useInviteToGuestPlay } from '../hooks/useMemberships';

export function ApplicationsTab() {
  const { data: applications = [], isLoading } = useApplications();
  const acceptMutation = useAcceptApplication();
  const rejectMutation = useRejectApplication();
  const inviteMutation = useInviteToGuestPlay();

  const [dismissed, setDismissed] = useState<string[]>([]);
  const [inviteApp, setInviteApp] = useState<MembershipApplicationWithDetails | null>(null);
  const [scheduledDate, setScheduledDate] = useState(new Date(Date.now() + 86400000).toISOString().split('T')[0]);

  const visibleApps = applications.filter(a => !dismissed.includes(a.id) && (a.status === 'pending' || a.status === 'invited_guest' || !a.status));

  const handleAccept = (app: MembershipApplicationWithDetails) => {
    acceptMutation.mutate(app.id, {
      onSuccess: () => {
        setDismissed(prev => [...prev, app.id]);
        Alert.alert('Success', `${app.applicant_name} accepted as member!`);
      },
      onError: (err: any) => {
        Alert.alert('Error', err.message || 'Failed to accept application.');
      },
    });
  };

  const handleReject = (app: MembershipApplicationWithDetails) => {
    rejectMutation.mutate(app.id, {
      onSuccess: () => {
        setDismissed(prev => [...prev, app.id]);
      },
      onError: (err: any) => {
        Alert.alert('Error', err.message || 'Failed to reject application.');
      },
    });
  };

  const handleConfirmInvite = () => {
    if (!inviteApp || !scheduledDate.trim()) return;
    inviteMutation.mutate(
      { applicationId: inviteApp.id, scheduledDate: scheduledDate.trim() },
      {
        onSuccess: () => {
          setDismissed(prev => [...prev, inviteApp.id]);
          setInviteApp(null);
          Alert.alert('Success', `Invited ${inviteApp.applicant_name} to guest play on ${scheduledDate}!`);
        },
        onError: (err: any) => {
          Alert.alert('Error', err.message || 'Failed to send invite.');
        },
      }
    );
  };

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.loadingText}>Loading applications...</Text>
      </View>
    );
  }

  if (visibleApps.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <View style={styles.iconCircle}>
          <Check size={28} color="#CBD5E1" />
        </View>
        <Text style={styles.emptyTitle}>All caught up!</Text>
        <Text style={styles.emptySub}>No pending applications</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      {visibleApps.map(a => {
        const photoInitial = a.applicant_name ? a.applicant_name.charAt(0).toUpperCase() : '?';
        const isReview = a.status === 'invited_guest';

        return (
          <View key={a.id} style={styles.card}>
            <View style={styles.topRow}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{photoInitial}</Text>
              </View>
              <View style={styles.info}>
                <Text style={styles.name}>{a.applicant_name || 'Applicant'}</Text>
                <Text style={styles.subText}>
                  Applied for: <Text style={styles.slotHighlight}>{a.slot?.name || 'Badminton Slot'}</Text>
                </Text>
              </View>
              <View style={[styles.statusBadge, isReview && styles.statusBadgeReview]}>
                <Text style={[styles.statusText, isReview && styles.statusTextReview]}>
                  {isReview ? 'Invited' : 'New'}
                </Text>
              </View>
            </View>

            {/* Tags row */}
            <View style={styles.tagsRow}>
              {a.skill_level && (
                <View style={styles.tag}>
                  <Dumbbell size={12} color="#94A3B8" />
                  <Text style={styles.tagText}>{a.skill_level}</Text>
                </View>
              )}
              {a.experience && (
                <View style={styles.tag}>
                  <Star size={12} color="#94A3B8" />
                  <Text style={styles.tagText}>{a.experience}</Text>
                </View>
              )}
              {a.preferred_days && a.preferred_days.length > 0 && (
                <View style={styles.tag}>
                  <Calendar size={12} color="#94A3B8" />
                  <Text style={styles.tagText}>{a.preferred_days.join(', ')}</Text>
                </View>
              )}
            </View>

            {/* Actions row */}
            <View style={styles.actionsRow}>
              <TouchableOpacity
                style={[styles.actionBtn, styles.acceptBtn, acceptMutation.isPending && styles.btnDisabled]}
                onPress={() => handleAccept(a)}
                disabled={acceptMutation.isPending}
              >
                <UserCheck size={15} color="#16A34A" />
                <Text style={[styles.actionText, { color: '#16A34A' }]}>Accept</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionBtn, styles.guestBtn]}
                onPress={() => {
                  setInviteApp(a);
                  setScheduledDate(new Date(Date.now() + 86400000).toISOString().split('T')[0]);
                }}
              >
                <UserPlus size={15} color="#2563EB" />
                <Text style={[styles.actionText, { color: '#2563EB' }]}>Guest Play</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionBtn, styles.rejectBtn, rejectMutation.isPending && styles.btnDisabled]}
                onPress={() => handleReject(a)}
                disabled={rejectMutation.isPending}
              >
                <X size={15} color="#DC2626" />
                <Text style={[styles.actionText, { color: '#DC2626' }]}>Reject</Text>
              </TouchableOpacity>
            </View>
          </View>
        );
      })}

      {/* Invite to Guest Play Modal */}
      <Modal visible={!!inviteApp} animationType="fade" transparent onRequestClose={() => setInviteApp(null)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Invite to Guest Play</Text>
              <TouchableOpacity style={styles.closeBtn} onPress={() => setInviteApp(null)}>
                <X size={16} color="#64748B" />
              </TouchableOpacity>
            </View>
            <View style={styles.modalContent}>
              <Text style={styles.modalSub}>
                Scheduling a trial session for <Text style={{ fontWeight: '700', color: '#0F172A' }}>{inviteApp?.applicant_name}</Text> in <Text style={{ fontWeight: '700', color: '#2563EB' }}>{inviteApp?.slot?.name || 'slot'}</Text>.
              </Text>

              <Text style={styles.label}>Scheduled Date (YYYY-MM-DD)</Text>
              <TextInput
                style={styles.input}
                value={scheduledDate}
                onChangeText={setScheduledDate}
                placeholder="2026-07-28"
              />

              <View style={styles.quickDates}>
                <TouchableOpacity
                  style={styles.quickDateBtn}
                  onPress={() => setScheduledDate(new Date().toISOString().split('T')[0])}
                >
                  <Text style={styles.quickDateText}>Today</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.quickDateBtn}
                  onPress={() => setScheduledDate(new Date(Date.now() + 86400000).toISOString().split('T')[0])}
                >
                  <Text style={styles.quickDateText}>Tomorrow</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.quickDateBtn}
                  onPress={() => setScheduledDate(new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0])}
                >
                  <Text style={styles.quickDateText}>Day After</Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={[styles.confirmBtn, (!scheduledDate.trim() || inviteMutation.isPending) && styles.btnDisabled]}
                onPress={handleConfirmInvite}
                disabled={!scheduledDate.trim() || inviteMutation.isPending}
              >
                <Text style={styles.confirmText}>
                  {inviteMutation.isPending ? 'Sending Invite...' : 'Confirm Invitation'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  content: {
    padding: 16,
    paddingBottom: 88,
    gap: 12,
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    backgroundColor: '#F8FAFC',
  },
  loadingText: {
    fontSize: 14,
    color: '#64748B',
  },
  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: 18,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#64748B',
  },
  emptySub: {
    fontSize: 13,
    color: '#94A3B8',
    marginTop: 4,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 18,
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
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#2563EB',
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  subText: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  slotHighlight: {
    fontWeight: '700',
    color: '#2563EB',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    backgroundColor: '#F0FDF4',
  },
  statusBadgeReview: {
    backgroundColor: '#FFFBEB',
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#16A34A',
  },
  statusTextReview: {
    color: '#D97706',
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 14,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  tagText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
    textTransform: 'capitalize',
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
    gap: 6,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1.5,
  },
  acceptBtn: {
    backgroundColor: '#F0FDF4',
    borderColor: '#BBF7D0',
  },
  guestBtn: {
    backgroundColor: '#EFF6FF',
    borderColor: '#BFDBFE',
  },
  rejectBtn: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FCA5A5',
  },
  actionText: {
    fontSize: 13,
    fontWeight: '700',
  },
  btnDisabled: {
    opacity: 0.5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  modalSheet: {
    backgroundColor: '#fff',
    borderRadius: 20,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  modalTitle: {
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
  modalContent: {
    padding: 20,
  },
  modalSub: {
    fontSize: 13,
    color: '#64748B',
    lineHeight: 18,
    marginBottom: 16,
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
    marginBottom: 12,
  },
  quickDates: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
  },
  quickDateBtn: {
    flex: 1,
    paddingVertical: 8,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    alignItems: 'center',
  },
  quickDateText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  confirmBtn: {
    backgroundColor: '#2563EB',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
  },
  confirmText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
});
