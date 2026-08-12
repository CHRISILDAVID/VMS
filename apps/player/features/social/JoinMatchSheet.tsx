import React, { useState } from 'react';
import { View, Text, Modal, Pressable, TouchableOpacity, Image } from 'react-native';
import { X, MapPin, Calendar, Clock, Users, Trophy } from 'lucide-react-native';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { format, parseISO } from 'date-fns';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { usePlayerThemeColors } from '../../hooks/usePlayerThemeColors';
import { supabase } from '../../lib/supabase';
import { createSocialService } from '@vms/shared/services';
import type { HostedMatchDiscovery, MatchFormat } from '@vms/shared/types';

const socialService = createSocialService(supabase);

interface JoinMatchSheetProps {
  match: HostedMatchDiscovery;
  onClose: () => void;
  onJoined: () => void;
}

const FORMAT_LABEL: Record<MatchFormat, string> = {
  singles: 'Singles',
  doubles: 'Doubles',
  mixed: 'Mixed',
};

export function JoinMatchSheet({ match, onClose, onJoined }: JoinMatchSheetProps) {
  const { colors } = usePlayerThemeColors();
  const queryClient = useQueryClient();

  const joinMutation = useMutation({
    mutationFn: () => socialService.joinMatch(match.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-hosted-matches'] });
      queryClient.invalidateQueries({ queryKey: ['open-matches'] });
      onJoined();
    },
  });

  const slotsFilled = Number(match.joined_count);
  const slotsTotal = match.max_players;
  const isFull = slotsFilled >= slotsTotal;

  const dateLabel = match.booking_date
    ? format(parseISO(match.booking_date), 'EEEE, MMMM do')
    : '--';

  const startLabel = match.booking_start ? match.booking_start.substring(0, 5) : '--';
  const endLabel = match.booking_end ? match.booking_end.substring(0, 5) : '--';

  const hostInitials = (match.host_name ?? 'H')
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <Modal visible transparent animationType="slide" onRequestClose={onClose}>
      <Pressable
        className="flex-1 justify-end"
        style={{ backgroundColor: 'rgba(0,0,0,0.55)' }}
        onPress={onClose}
      >
        <Pressable onPress={(e) => e.stopPropagation()}>
          <View className="bg-card rounded-t-3xl p-5 pb-8">
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-foreground font-bold text-xl">Match Details</Text>
              <TouchableOpacity
                onPress={onClose}
                className="w-8 h-8 rounded-full bg-muted items-center justify-center"
              >
                <X size={16} color={colors.foreground} />
              </TouchableOpacity>
            </View>

            {/* Host info */}
            <View className="flex-row items-center gap-3 mb-5 bg-muted/30 p-3 rounded-2xl border border-border">
              {match.host_avatar ? (
                <Image source={{ uri: match.host_avatar }} className="w-12 h-12 rounded-full" />
              ) : (
                <View className="w-12 h-12 rounded-full bg-primary/20 items-center justify-center">
                  <Text className="text-primary font-bold text-lg">{hostInitials}</Text>
                </View>
              )}
              <View className="flex-1">
                <Text className="text-xs text-muted-foreground mb-0.5">Hosted by</Text>
                <Text className="text-foreground font-bold text-base">{match.host_name}</Text>
                {match.host_player_id_str && (
                  <View className="flex-row items-center gap-1 mt-0.5">
                    <Trophy size={11} color={colors.accent} strokeWidth={2.5} />
                    <Text className="text-accent text-xs font-semibold">
                      {match.host_player_id_str}
                    </Text>
                  </View>
                )}
              </View>
            </View>

            {/* Match info */}
            <View className="gap-4 mb-6">
              <View className="flex-row items-center gap-3">
                <View className="w-10 h-10 rounded-full bg-muted items-center justify-center">
                  <MapPin size={20} color={colors.foreground} strokeWidth={2} />
                </View>
                <View className="flex-1">
                  <Text className="text-foreground font-semibold text-sm">
                    {match.venue_name || 'Unknown Venue'}
                  </Text>
                  <Text className="text-muted-foreground text-xs mt-0.5">
                    {match.venue_city || 'City not specified'}
                  </Text>
                </View>
              </View>

              <View className="flex-row items-center gap-3">
                <View className="w-10 h-10 rounded-full bg-muted items-center justify-center">
                  <Calendar size={20} color={colors.foreground} strokeWidth={2} />
                </View>
                <View className="flex-1">
                  <Text className="text-foreground font-semibold text-sm">{dateLabel}</Text>
                  <Text className="text-muted-foreground text-xs mt-0.5">
                    {startLabel} – {endLabel}
                  </Text>
                </View>
              </View>

              <View className="flex-row items-center gap-3">
                <View className="w-10 h-10 rounded-full bg-muted items-center justify-center">
                  <Users size={20} color={colors.foreground} strokeWidth={2} />
                </View>
                <View className="flex-1">
                  <View className="flex-row items-center gap-2">
                    <Text className="text-foreground font-semibold text-sm">
                      {slotsFilled} / {slotsTotal} Players Joined
                    </Text>
                    {isFull && <Badge label="Full" variant="warning" />}
                  </View>
                  <Text className="text-muted-foreground text-xs mt-0.5 capitalize">
                    {FORMAT_LABEL[match.match_format]} • {match.skill_level} Level
                  </Text>
                </View>
              </View>
            </View>

            {/* Action */}
            <Button
              label={
                isFull
                  ? 'Match is Full'
                  : joinMutation.isPending
                  ? 'Joining...'
                  : 'Join Match'
              }
              variant="primary"
              disabled={isFull || joinMutation.isPending}
              onPress={() => joinMutation.mutate()}
            />
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
