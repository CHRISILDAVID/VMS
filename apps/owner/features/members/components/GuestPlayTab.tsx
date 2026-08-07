import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert, Linking } from 'react-native';
import { UserCheck, X, Phone, CheckCircle } from 'lucide-react-native';
import { GuestPlayWithDetails } from '@vms/shared/services';
import { formatCurrency, formatPhone } from '@vms/shared/utils';
import { useGuestPlays, useAcceptGuestAsMember, useUpdateGuestPlayStatus } from '../hooks/useMemberships';
import { useThemeColors } from '../../../hooks/useThemeColors';

export function GuestPlayTab() {
  const { data: guestPlays = [], isLoading } = useGuestPlays();
  const acceptMemberMutation = useAcceptGuestAsMember();
  const updateStatusMutation = useUpdateGuestPlayStatus();
  const { colors } = useThemeColors();

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
    <View className="flex-1 bg-background">
      {/* Segmented control */}
      <View className="flex-row bg-muted rounded-xl p-1 mx-4 mt-3.5 mb-2.5">
        <TouchableOpacity
          className={`flex-1 py-2.5 rounded-lg items-center justify-center ${activeTab === 'upcoming' ? 'bg-card shadow-sm' : 'shadow-none'}`}
          onPress={() => setActiveTab('upcoming')}
        >
          <Text className={`text-[13px] font-semibold ${activeTab === 'upcoming' ? 'text-primary font-bold' : 'text-muted-foreground'}`}>
            Upcoming
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          className={`flex-1 py-2.5 rounded-lg items-center justify-center ${activeTab === 'completed' ? 'bg-card shadow-sm' : 'shadow-none'}`}
          onPress={() => setActiveTab('completed')}
        >
          <Text className={`text-[13px] font-semibold ${activeTab === 'completed' ? 'text-primary font-bold' : 'text-muted-foreground'}`}>
            Completed
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1" contentContainerStyle={{ padding: 16, paddingBottom: 88, gap: 12 }} showsVerticalScrollIndicator={false}>
        {isLoading ? (
          <View className="items-center justify-center py-16 px-8">
            <Text className="text-sm text-muted-foreground">Loading guest play sessions...</Text>
          </View>
        ) : filtered.length === 0 ? (
          <View className="items-center justify-center py-16 px-8">
            <Text className="text-[40px] mb-2.5">🏸</Text>
            <Text className="text-[15px] font-bold text-foreground mb-1 text-center">No {activeTab} guest play sessions</Text>
            <Text className="text-[13px] text-muted-foreground text-center leading-[18px]">
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
              <View key={g.id} className="bg-card rounded-2xl p-4 border border-border">
                <View className="flex-row items-center gap-3 mb-3.5">
                  <View className="w-11 h-11 rounded-xl bg-violet-100 dark:bg-violet-900/40 items-center justify-center">
                    <Text className="text-lg font-extrabold text-violet-600">{initial}</Text>
                  </View>
                  <View className="flex-1">
                    <Text className="text-[15px] font-bold text-foreground">{g.player_name || 'Guest Player'}</Text>
                    <Text className="text-xs text-muted-foreground mt-0.5">
                      {g.slot?.name || 'Slot'} · {g.scheduled_date}
                    </Text>
                    {g.phone ? <Text className="text-[11px] text-muted-foreground mt-0.5">{formatPhone(g.phone)}</Text> : null}
                  </View>
                  <Text className="text-base font-extrabold text-primary">{formatCurrency(fee)}</Text>
                </View>

                {activeTab === 'completed' ? (
                  <View className="flex-row gap-2">
                    <TouchableOpacity
                      className={`flex-1 flex-row items-center justify-center gap-1.5 py-2.5 rounded-xl border-[1.5px] bg-green-50 dark:bg-green-900/30 border-green-200 dark:border-green-800 ${acceptMemberMutation.isPending ? 'opacity-50' : ''}`}
                      onPress={() => handleAcceptMember(g)}
                      disabled={acceptMemberMutation.isPending}
                    >
                      <UserCheck size={15} color="#16A34A" />
                      <Text className="text-xs font-bold text-green-600">Accept as Member</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      className="flex-1 flex-row items-center justify-center gap-1.5 py-2.5 rounded-xl border-[1.5px] bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-800"
                      onPress={() => handleRejectCompleted(g)}
                    >
                      <X size={15} color="#DC2626" />
                      <Text className="text-xs font-bold text-destructive">Reject</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <View className="flex-row gap-2">
                    <TouchableOpacity
                      className="flex-1 flex-row items-center justify-center gap-1.5 py-2.5 rounded-xl border-[1.5px] bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800"
                      onPress={() => handleContact(g.phone)}
                    >
                      <Phone size={14} color="#2563EB" />
                      <Text className="text-xs font-bold text-blue-600">Contact</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      className="flex-1 flex-row items-center justify-center gap-1.5 py-2.5 rounded-xl border-[1.5px] bg-green-50 dark:bg-green-900/30 border-green-200 dark:border-green-800"
                      onPress={() => handleMarkCompleted(g)}
                    >
                      <CheckCircle size={14} color="#16A34A" />
                      <Text className="text-xs font-bold text-green-600">Completed</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      className="flex-1 flex-row items-center justify-center gap-1.5 py-2.5 rounded-xl border-[1.5px] bg-muted border-border"
                      onPress={() => handleCancel(g)}
                    >
                      <X size={14} color={colors.mutedForeground} />
                      <Text className="text-xs font-bold text-muted-foreground">Cancel</Text>
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
