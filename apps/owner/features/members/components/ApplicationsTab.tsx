import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Modal, TextInput, Alert } from 'react-native';
import { Check, Dumbbell, Star, Calendar, UserCheck, UserPlus, X } from 'lucide-react-native';
import { MembershipApplicationWithDetails } from '@vms/shared/services';
import { useApplications, useAcceptApplication, useRejectApplication, useInviteToGuestPlay } from '../hooks/useMemberships';
import { useThemeColors } from '../../../hooks/useThemeColors';

export function ApplicationsTab() {
  const { data: applications = [], isLoading } = useApplications();
  const acceptMutation = useAcceptApplication();
  const rejectMutation = useRejectApplication();
  const inviteMutation = useInviteToGuestPlay();
  const { colors } = useThemeColors();

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
      <View className="flex-1 items-center justify-center p-10 bg-background">
        <Text className="text-sm text-muted-foreground">Loading applications...</Text>
      </View>
    );
  }

  if (visibleApps.length === 0) {
    return (
      <View className="flex-1 items-center justify-center p-10 bg-background">
        <View className="w-[60px] h-[60px] rounded-[18px] bg-muted items-center justify-center mb-3">
          <Check size={28} color={colors.mutedForeground} />
        </View>
        <Text className="text-base font-bold text-muted-foreground">All caught up!</Text>
        <Text className="text-[13px] text-muted-foreground mt-1">No pending applications</Text>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-background" contentContainerStyle={{ padding: 16, paddingBottom: 88, gap: 12 }} showsVerticalScrollIndicator={false}>
      {visibleApps.map(a => {
        const photoInitial = a.applicant_name ? a.applicant_name.charAt(0).toUpperCase() : '?';
        const isReview = a.status === 'invited_guest';

        return (
          <View key={a.id} className="bg-card rounded-2xl p-4 border border-border">
            <View className="flex-row items-center gap-3 mb-3.5">
              <View className="w-[46px] h-[46px] rounded-2xl bg-primary/10 items-center justify-center">
                <Text className="text-lg font-extrabold text-primary">{photoInitial}</Text>
              </View>
              <View className="flex-1">
                <Text className="text-base font-bold text-foreground">{a.applicant_name || 'Applicant'}</Text>
                <Text className="text-xs text-muted-foreground mt-0.5">
                  Applied for: <Text className="font-bold text-primary">{a.slot?.name || 'Badminton Slot'}</Text>
                </Text>
              </View>
              <View className={`px-2.5 py-1 rounded-full ${isReview ? 'bg-amber-50 dark:bg-amber-900/30' : 'bg-green-50 dark:bg-green-900/30'}`}>
                <Text className={`text-[11px] font-bold ${isReview ? 'text-amber-600' : 'text-green-600'}`}>
                  {isReview ? 'Invited' : 'New'}
                </Text>
              </View>
            </View>

            {/* Tags row */}
            <View className="flex-row flex-wrap gap-2 mb-3.5">
              {a.skill_level && (
                <View className="flex-row items-center gap-1.5 bg-muted rounded-lg px-2.5 py-1.5">
                  <Dumbbell size={12} color={colors.mutedForeground} />
                  <Text className="text-xs font-semibold text-muted-foreground capitalize">{a.skill_level}</Text>
                </View>
              )}
              {a.experience && (
                <View className="flex-row items-center gap-1.5 bg-muted rounded-lg px-2.5 py-1.5">
                  <Star size={12} color={colors.mutedForeground} />
                  <Text className="text-xs font-semibold text-muted-foreground capitalize">{a.experience}</Text>
                </View>
              )}
              {a.preferred_days && a.preferred_days.length > 0 && (
                <View className="flex-row items-center gap-1.5 bg-muted rounded-lg px-2.5 py-1.5">
                  <Calendar size={12} color={colors.mutedForeground} />
                  <Text className="text-xs font-semibold text-muted-foreground capitalize">{a.preferred_days.join(', ')}</Text>
                </View>
              )}
            </View>

            {/* Actions row */}
            <View className="flex-row gap-2">
              <TouchableOpacity
                className={`flex-1 flex-row items-center justify-center gap-1.5 py-3 rounded-xl border-[1.5px] bg-green-50 dark:bg-green-900/30 border-green-200 dark:border-green-800 ${acceptMutation.isPending ? 'opacity-50' : ''}`}
                onPress={() => handleAccept(a)}
                disabled={acceptMutation.isPending}
              >
                <UserCheck size={15} color="#16A34A" />
                <Text className="text-[13px] font-bold text-green-600">Accept</Text>
              </TouchableOpacity>

              <TouchableOpacity
                className="flex-1 flex-row items-center justify-center gap-1.5 py-3 rounded-xl border-[1.5px] bg-primary/10 border-primary/30"
                onPress={() => {
                  setInviteApp(a);
                  setScheduledDate(new Date(Date.now() + 86400000).toISOString().split('T')[0]);
                }}
              >
                <UserPlus size={15} color={colors.primary} />
                <Text className="text-[13px] font-bold text-primary">Guest Play</Text>
              </TouchableOpacity>

              <TouchableOpacity
                className={`flex-1 flex-row items-center justify-center gap-1.5 py-3 rounded-xl border-[1.5px] bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-800 ${rejectMutation.isPending ? 'opacity-50' : ''}`}
                onPress={() => handleReject(a)}
                disabled={rejectMutation.isPending}
              >
                <X size={15} color="#DC2626" />
                <Text className="text-[13px] font-bold text-destructive">Reject</Text>
              </TouchableOpacity>
            </View>
          </View>
        );
      })}

      {/* Invite to Guest Play Modal */}
      <Modal visible={!!inviteApp} animationType="fade" transparent onRequestClose={() => setInviteApp(null)}>
        <View className="flex-1 bg-black/50 justify-center p-5">
          <View className="bg-card rounded-[20px] overflow-hidden shadow-xl">
            <View className="flex-row justify-between items-center px-5 py-3.5 border-b border-border">
              <Text className="text-base font-extrabold text-foreground">Invite to Guest Play</Text>
              <TouchableOpacity className="w-[30px] h-[30px] rounded-full bg-muted items-center justify-center" onPress={() => setInviteApp(null)}>
                <X size={16} color={colors.mutedForeground} />
              </TouchableOpacity>
            </View>
            <View className="p-5">
              <Text className="text-[13px] text-muted-foreground leading-5 mb-4">
                Scheduling a trial session for <Text className="font-bold text-foreground">{inviteApp?.applicant_name}</Text> in <Text className="font-bold text-primary">{inviteApp?.slot?.name || 'slot'}</Text>.
              </Text>

              <Text className="text-[12px] font-bold text-muted-foreground uppercase tracking-wider mb-2">Scheduled Date (YYYY-MM-DD)</Text>
              <TextInput
                className="bg-card border-[1.5px] border-border rounded-xl px-3.5 py-3 text-[15px] font-semibold text-foreground mb-3"
                value={scheduledDate}
                onChangeText={setScheduledDate}
                placeholder="2026-07-28"
                placeholderTextColor={colors.mutedForeground}
              />

              <View className="flex-row gap-2 mb-5">
                <TouchableOpacity
                  className="flex-1 py-2 bg-card border border-border rounded-lg items-center"
                  onPress={() => setScheduledDate(new Date().toISOString().split('T')[0])}
                >
                  <Text className="text-xs font-semibold text-muted-foreground">Today</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  className="flex-1 py-2 bg-card border border-border rounded-lg items-center"
                  onPress={() => setScheduledDate(new Date(Date.now() + 86400000).toISOString().split('T')[0])}
                >
                  <Text className="text-xs font-semibold text-muted-foreground">Tomorrow</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  className="flex-1 py-2 bg-card border border-border rounded-lg items-center"
                  onPress={() => setScheduledDate(new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0])}
                >
                  <Text className="text-xs font-semibold text-muted-foreground">Day After</Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                className={`bg-primary py-3.5 rounded-xl items-center ${(!scheduledDate.trim() || inviteMutation.isPending) ? 'opacity-50' : ''}`}
                onPress={handleConfirmInvite}
                disabled={!scheduledDate.trim() || inviteMutation.isPending}
              >
                <Text className="text-white text-[15px] font-bold">
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
