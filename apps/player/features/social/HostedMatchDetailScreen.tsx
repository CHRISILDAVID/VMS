import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { ArrowLeft, MapPin, Calendar, Clock, Users, ShieldAlert } from 'lucide-react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format, parseISO } from 'date-fns';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Card } from '../../components/ui/Card';
import { usePlayerThemeColors } from '../../hooks/usePlayerThemeColors';
import { supabase } from '../../lib/supabase';
import { createSocialService } from '@vms/shared/services';
import type { HostedMatchWithPlayers } from '@vms/shared/types';

const socialService = createSocialService(supabase);

interface HostedMatchDetailScreenProps {
  matchId: string;
}

export function HostedMatchDetailScreen({ matchId }: HostedMatchDetailScreenProps) {
  const { colors } = usePlayerThemeColors();
  const queryClient = useQueryClient();

  const { data: match, isLoading } = useQuery<HostedMatchWithPlayers>({
    queryKey: ['hosted-match-detail', matchId],
    queryFn: () => socialService.fetchHostedMatchDetail(matchId),
  });

  const cancelMutation = useMutation({
    mutationFn: () => socialService.cancelHostedMatch(matchId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-hosted-matches'] });
      queryClient.invalidateQueries({ queryKey: ['hosted-match-detail', matchId] });
      Alert.alert('Match Cancelled', 'Your match has been cancelled.');
    },
  });

  const closeMutation = useMutation({
    mutationFn: () => socialService.closeMatchRegistration(matchId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-hosted-matches'] });
      queryClient.invalidateQueries({ queryKey: ['hosted-match-detail', matchId] });
    },
  });

  if (isLoading || !match) {
    return (
      <SafeAreaView className="flex-1 bg-background" edges={['top']}>
        <View className="flex-row items-center px-4 py-3 gap-3">
          <TouchableOpacity onPress={() => router.back()} className="w-9 h-9 rounded-full bg-muted items-center justify-center">
            <ArrowLeft size={20} color={colors.foreground} strokeWidth={2} />
          </TouchableOpacity>
        </View>
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color={colors.accent} />
        </View>
      </SafeAreaView>
    );
  }

  const slotsFilled = match.joined_players.length;
  const slotsTotal = match.max_players;
  const isFull = slotsFilled >= slotsTotal || match.status === 'full';

  const dateLabel = match.booking_date ? format(parseISO(match.booking_date), 'EEEE, MMMM do') : '--';
  const startLabel = match.booking_start ? match.booking_start.substring(0, 5) : '--';
  const endLabel = match.booking_end ? match.booking_end.substring(0, 5) : '--';

  const handleCancel = () => {
    Alert.alert(
      'Cancel Match',
      'Are you sure you want to cancel this match? Players will be notified.',
      [
        { text: 'Keep Match', style: 'cancel' },
        { text: 'Cancel Match', style: 'destructive', onPress: () => cancelMutation.mutate() },
      ]
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      {/* Header */}
      <View className="flex-row items-center px-4 py-3 gap-3">
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-9 h-9 rounded-full bg-muted items-center justify-center"
        >
          <ArrowLeft size={20} color={colors.foreground} strokeWidth={2} />
        </TouchableOpacity>
        <Text className="text-foreground font-bold text-lg flex-1">Manage Match</Text>
        <Badge
          label={match.status.charAt(0).toUpperCase() + match.status.slice(1)}
          variant={
            match.status === 'open' ? 'success' :
            match.status === 'full' ? 'warning' :
            match.status === 'cancelled' ? 'destructive' : 'muted'
          }
        />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 16, paddingBottom: 100 }}>
        {/* Match Info Card */}
        <Card className="mb-6">
          <View className="gap-4">
            <View className="flex-row items-center gap-3">
              <View className="w-10 h-10 rounded-full bg-muted items-center justify-center">
                <MapPin size={18} color={colors.foreground} strokeWidth={2} />
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
                <Calendar size={18} color={colors.foreground} strokeWidth={2} />
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
                <Users size={18} color={colors.foreground} strokeWidth={2} />
              </View>
              <View className="flex-1">
                <Text className="text-foreground font-semibold text-sm">
                  {match.match_format} • {match.skill_level}
                </Text>
                <Text className="text-muted-foreground text-xs mt-0.5 capitalize">
                  {match.visibility} Match
                </Text>
              </View>
            </View>
          </View>
        </Card>

        {/* Joined Players */}
        <View className="flex-row items-center justify-between mb-3">
          <Text className="text-foreground font-bold text-lg">Joined Players</Text>
          <Text className="text-muted-foreground font-semibold text-sm">
            {slotsFilled} / {slotsTotal}
          </Text>
        </View>

        {slotsFilled === 0 ? (
          <Card className="items-center py-8 mb-6">
            <Users size={32} color={colors.mutedForeground} strokeWidth={1.5} className="mb-2" />
            <Text className="text-foreground font-semibold">No players yet</Text>
            <Text className="text-muted-foreground text-xs text-center mt-1 px-4">
              When players join your match, they will appear here.
            </Text>
          </Card>
        ) : (
          <View className="gap-3 mb-6">
            {match.joined_players.map((jp) => {
              const p = jp.player;
              const initials = p.full_name.split(' ').map(n=>n[0]).slice(0,2).join('').toUpperCase();
              return (
                <Card key={jp.id} className="flex-row items-center gap-3 py-3">
                  <View className="w-10 h-10 rounded-full bg-accent/20 items-center justify-center">
                    <Text className="text-accent font-bold">{initials}</Text>
                  </View>
                  <View className="flex-1">
                    <Text className="text-foreground font-bold">{p.full_name}</Text>
                    {p.player_id && (
                      <Text className="text-accent text-xs">{p.player_id}</Text>
                    )}
                  </View>
                  <Text className="text-muted-foreground text-[10px]">
                    {format(parseISO(jp.joined_at), 'MMM d, p')}
                  </Text>
                </Card>
              );
            })}
          </View>
        )}

        {/* Actions */}
        {match.status === 'open' || match.status === 'full' ? (
          <View className="gap-3">
            {match.status === 'open' && (
              <Button
                label="Close Registration"
                variant="outline"
                onPress={() => closeMutation.mutate()}
                disabled={closeMutation.isPending}
              />
            )}
            <TouchableOpacity
              onPress={handleCancel}
              disabled={cancelMutation.isPending}
              className="flex-row items-center justify-center gap-2 py-4 rounded-2xl bg-destructive/10 border border-destructive/20"
            >
              <ShieldAlert size={18} color={colors.destructive} />
              <Text className="text-destructive font-bold text-sm">Cancel Match</Text>
            </TouchableOpacity>
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}
