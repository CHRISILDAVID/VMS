import React, { useState } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  Modal, Pressable, ActivityIndicator,
} from 'react-native';
import { X, Check, Bell, Swords, UserCheck, ShieldAlert, CalendarX } from 'lucide-react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { formatRelative } from 'date-fns';
import { usePlayerThemeColors } from '../../hooks/usePlayerThemeColors';
import { supabase } from '../../lib/supabase';
import { createSocialService } from '@vms/shared/services';
import type { PlayerNotification, NotificationType } from '@vms/shared/types';
import { router } from 'expo-router';

const socialService = createSocialService(supabase);

interface NotificationsPanelProps {
  visible: boolean;
  onClose: () => void;
}

const ICON_MAP: Record<NotificationType, React.ReactNode> = {
  challenge_received: <Swords size={20} color="#F59E0B" />, // Warning color
  challenge_accepted: <UserCheck size={20} color="#10B981" />, // Success color
  challenge_declined: <ShieldAlert size={20} color="#6B7280" />, // Muted color
  challenge_cancelled: <CalendarX size={20} color="#EF4444" />, // Destructive
  match_joined:       <UserCheck size={20} color="#3B82F6" />, // Info
  match_cancelled:    <ShieldAlert size={20} color="#EF4444" />,
};

export function NotificationsPanel({ visible, onClose }: NotificationsPanelProps) {
  const { colors } = usePlayerThemeColors();
  const queryClient = useQueryClient();

  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ['player-notifications'],
    queryFn: () => socialService.fetchNotifications(),
    enabled: visible,
  });

  const markReadMutation = useMutation({
    mutationFn: (ids: string[]) => socialService.markNotificationsRead(ids),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['player-notifications'] });
      queryClient.invalidateQueries({ queryKey: ['player-unread-count'] });
    },
  });

  const markAllReadMutation = useMutation({
    mutationFn: () => socialService.markAllNotificationsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['player-notifications'] });
      queryClient.invalidateQueries({ queryKey: ['player-unread-count'] });
    },
  });

  const handleNotificationPress = (notif: PlayerNotification) => {
    if (!notif.is_read) {
      markReadMutation.mutate([notif.id]);
    }
    
    // Navigate based on type
    if (notif.type.startsWith('challenge') && notif.data?.challenge_id) {
      // In a real app we might navigate to a challenge details screen.
      // For now, dismiss the panel.
      onClose();
    } else if (notif.type.startsWith('match') && notif.data?.hosted_match_id) {
      onClose();
      router.push(`/social/match/${notif.data.hosted_match_id}` as any);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable
        className="flex-1 justify-end"
        style={{ backgroundColor: 'rgba(0,0,0,0.55)' }}
        onPress={onClose}
      >
        <Pressable onPress={(e) => e.stopPropagation()}>
          <View className="bg-card rounded-t-3xl pt-5 pb-8" style={{ maxHeight: '85%' }}>
            {/* Header */}
            <View className="flex-row items-center justify-between px-5 mb-4">
              <View className="flex-row items-center gap-2">
                <Bell size={20} color={colors.foreground} strokeWidth={2.5} />
                <Text className="text-foreground font-bold text-xl">Notifications</Text>
              </View>
              <View className="flex-row items-center gap-3">
                {notifications.some((n) => !n.is_read) && (
                  <TouchableOpacity
                    onPress={() => markAllReadMutation.mutate()}
                    disabled={markAllReadMutation.isPending}
                  >
                    <Text className="text-accent text-sm font-semibold">Mark all read</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity
                  onPress={onClose}
                  className="w-8 h-8 rounded-full bg-muted items-center justify-center"
                >
                  <X size={16} color={colors.foreground} />
                </TouchableOpacity>
              </View>
            </View>

            {/* List */}
            {isLoading ? (
              <ActivityIndicator color={colors.accent} className="my-10" />
            ) : notifications.length === 0 ? (
              <View className="items-center justify-center py-16 px-6">
                <Bell size={40} color={colors.mutedForeground} className="mb-4 opacity-50" />
                <Text className="text-foreground font-semibold text-base mb-1">All caught up!</Text>
                <Text className="text-muted-foreground text-sm text-center">
                  You don't have any notifications yet.
                </Text>
              </View>
            ) : (
              <FlatList
                data={notifications}
                keyExtractor={(item) => item.id}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: 20 }}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    onPress={() => handleNotificationPress(item)}
                    className={`flex-row gap-4 py-4 border-b border-border/50 ${
                      !item.is_read ? 'bg-accent/5 -mx-5 px-5' : ''
                    }`}
                  >
                    <View className="w-10 h-10 rounded-full bg-background items-center justify-center shadow-sm">
                      {ICON_MAP[item.type] || <Bell size={20} color={colors.foreground} />}
                    </View>
                    <View className="flex-1">
                      <View className="flex-row items-start justify-between gap-2 mb-1">
                        <Text
                          className={`text-sm flex-1 ${
                            !item.is_read ? 'text-foreground font-bold' : 'text-foreground font-semibold'
                          }`}
                        >
                          {item.title}
                        </Text>
                        <Text className="text-muted-foreground text-[10px]">
                          {formatRelative(new Date(item.created_at), new Date())}
                        </Text>
                      </View>
                      <Text
                        className={`text-xs ${
                          !item.is_read ? 'text-foreground' : 'text-muted-foreground'
                        }`}
                        numberOfLines={2}
                      >
                        {item.body}
                      </Text>
                    </View>
                    {!item.is_read && (
                      <View className="w-2 h-2 rounded-full bg-accent mt-2" />
                    )}
                  </TouchableOpacity>
                )}
              />
            )}
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
