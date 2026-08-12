import React, { useState } from 'react';
import {
  View, Text, ScrollView, Image, TouchableOpacity,
  ActivityIndicator, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { ArrowLeft, MapPin, Trophy, Swords, UserCheck } from 'lucide-react-native';
import { useQuery } from '@tanstack/react-query';
import { LinearGradient } from 'expo-linear-gradient';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Card } from '../../components/ui/Card';
import { SkeletonCard } from '../../components/ui/Skeleton';
import { ChallengeModal } from './ChallengeModal';
import { usePlayerThemeColors } from '../../hooks/usePlayerThemeColors';
import { supabase } from '../../lib/supabase';
import { createSocialService } from '@vms/shared/services';
import type { PlayerDiscovery } from '@vms/shared/types';

const socialService = createSocialService(supabase);

interface PublicPlayerProfileScreenProps {
  playerId: string;
}

/**
 * PublicPlayerProfileScreen
 *
 * Shows another player's public profile: avatar, Player ID,
 * city, verified badge, and a Challenge CTA.
 * Accessed via /social/player/[playerId].
 */
export function PublicPlayerProfileScreen({ playerId }: PublicPlayerProfileScreenProps) {
  const { colors, isDark } = usePlayerThemeColors();
  const [showChallenge, setShowChallenge] = useState(false);

  const { data: player, isLoading } = useQuery<PlayerDiscovery>({
    queryKey: ['player-profile', playerId],
    queryFn: () => socialService.fetchPublicPlayerProfile(playerId),
  });

  const initials = player?.full_name
    ? player.full_name
        .split(' ')
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : '?';

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
        <Text className="text-foreground font-bold text-lg flex-1">Player Profile</Text>
      </View>

      {isLoading ? (
        <View className="px-4 gap-4">
          <SkeletonCard />
          <SkeletonCard />
        </View>
      ) : !player ? (
        <View className="flex-1 items-center justify-center">
          <Text className="text-muted-foreground">Player not found</Text>
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
          {/* Hero banner */}
          <LinearGradient
            colors={isDark ? ['#0B1F3A', '#0B1F3A'] : ['#0B1F3A', '#153559']}
            className="mx-4 rounded-3xl overflow-hidden p-6 mb-4"
          >
            <View className="items-center gap-3">
              {/* Avatar */}
              {player.avatar_url ? (
                <Image
                  source={{ uri: player.avatar_url }}
                  className="w-24 h-24 rounded-full border-4 border-accent"
                />
              ) : (
                <View className="w-24 h-24 rounded-full bg-accent/20 border-4 border-accent items-center justify-center">
                  <Text className="text-accent font-black text-3xl">{initials}</Text>
                </View>
              )}

              {/* Name */}
              <View className="items-center gap-1">
                <View className="flex-row items-center gap-2">
                  <Text style={{ color: '#FFFFFF', fontWeight: '800', fontSize: 22 }}>
                    {player.full_name}
                  </Text>
                  {player.player_id_verified && (
                    <UserCheck size={18} color="#A7FF3F" strokeWidth={2.5} />
                  )}
                </View>

                {player.player_id ? (
                  <View className="flex-row items-center gap-1.5 bg-white/10 rounded-full px-3 py-1">
                    <Trophy size={12} color="#A7FF3F" strokeWidth={2.5} />
                    <Text style={{ color: '#A7FF3F', fontWeight: '700', fontSize: 13 }}>
                      {player.player_id}
                    </Text>
                  </View>
                ) : (
                  <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12 }}>
                    Not ranked yet
                  </Text>
                )}
              </View>

              {/* City */}
              {player.city && (
                <View className="flex-row items-center gap-1">
                  <MapPin size={13} color="rgba(255,255,255,0.6)" strokeWidth={2} />
                  <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13 }}>
                    {player.city}
                  </Text>
                </View>
              )}
            </View>
          </LinearGradient>

          {/* Info cards */}
          <View className="px-4 gap-3">
            {/* Gender */}
            {player.gender && (
              <Card>
                <View className="flex-row items-center justify-between">
                  <Text className="text-muted-foreground text-sm">Gender</Text>
                  <Badge
                    label={player.gender.charAt(0).toUpperCase() + player.gender.slice(1)}
                    variant="muted"
                  />
                </View>
              </Card>
            )}

            {/* Ranked status */}
            <Card>
              <View className="flex-row items-center justify-between">
                <Text className="text-muted-foreground text-sm">Player ID Status</Text>
                <Badge
                  label={player.player_id_verified ? 'Verified' : player.player_id ? 'Pending' : 'Unregistered'}
                  variant={player.player_id_verified ? 'success' : player.player_id ? 'warning' : 'muted'}
                />
              </View>
            </Card>

            {/* Last seen */}
            {player.location_updated_at && (
              <Card>
                <View className="flex-row items-center justify-between">
                  <Text className="text-muted-foreground text-sm">Last Active</Text>
                  <Text className="text-foreground text-sm font-medium">
                    {formatRelativeTime(player.location_updated_at)}
                  </Text>
                </View>
              </Card>
            )}
          </View>
        </ScrollView>
      )}

      {/* Challenge CTA */}
      {player && (
        <View className="absolute bottom-6 left-4 right-4">
          <Button
            label={`Challenge ${player.full_name.split(' ')[0]}`}
            variant="primary"
            onPress={() => setShowChallenge(true)}
            leftIcon={<Swords size={18} color="#0B1F3A" strokeWidth={2.5} />}
          />
        </View>
      )}

      {/* Challenge modal */}
      {showChallenge && player && (
        <ChallengeModal
          targetPlayer={player}
          onClose={() => setShowChallenge(false)}
          onSwitchToCourts={() => {
            setShowChallenge(false);
            router.push({ pathname: '/(tabs)/play', params: { tab: 'courts' } });
          }}
        />
      )}
    </SafeAreaView>
  );
}

function formatRelativeTime(isoString: string): string {
  const diff = Date.now() - new Date(isoString).getTime();
  const minutes = Math.floor(diff / 60_000);
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}
