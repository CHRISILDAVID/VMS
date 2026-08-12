import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { MapPin, Trophy, Swords } from 'lucide-react-native';
import { Card } from './Card';
import { Badge } from './Badge';
import { Button } from './Button';
import { usePlayerThemeColors } from '../../hooks/usePlayerThemeColors';
import type { PlayerDiscovery } from '@vms/shared/types';

interface PlayerCardProps {
  player: PlayerDiscovery;
  onPress: () => void;
  onChallenge: () => void;
}

/**
 * PlayerCard
 *
 * Reusable card for the Find Players discovery list.
 * Shows avatar, name, Player ID badge, city, distance, and a Challenge button.
 */
export function PlayerCard({ player, onPress, onChallenge }: PlayerCardProps) {
  const { colors } = usePlayerThemeColors();

  const distanceLabel = player.distance_km !== null
    ? player.distance_km < 1
      ? `${Math.round(player.distance_km * 1000)} m away`
      : `${player.distance_km.toFixed(1)} km away`
    : player.city ?? 'Location unknown';

  const initials = player.full_name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <Card noPadding className="mb-3 overflow-hidden">
      <TouchableOpacity activeOpacity={0.8} onPress={onPress}>
        <View className="flex-row items-center p-4 gap-3">
          {/* Avatar */}
          <View className="relative">
            {player.avatar_url ? (
              <Image
                source={{ uri: player.avatar_url }}
                className="w-14 h-14 rounded-full"
              />
            ) : (
              <View className="w-14 h-14 rounded-full bg-accent/20 items-center justify-center">
                <Text className="text-accent font-bold text-xl">{initials}</Text>
              </View>
            )}
            {/* Online dot — shown if location was updated in the last 30 min */}
            {player.location_updated_at &&
              new Date().getTime() - new Date(player.location_updated_at).getTime() < 30 * 60 * 1000 && (
                <View className="absolute bottom-0.5 right-0.5 w-3 h-3 rounded-full bg-success border-2 border-card" />
              )}
          </View>

          {/* Info */}
          <View className="flex-1">
            <Text className="text-foreground font-bold text-base" numberOfLines={1}>
              {player.full_name}
            </Text>

            {player.player_id && (
              <View className="flex-row items-center gap-1 mt-0.5">
                <Trophy size={11} color={colors.accent} strokeWidth={2.5} />
                <Text className="text-accent text-xs font-semibold">{player.player_id}</Text>
              </View>
            )}

            <View className="flex-row items-center gap-1 mt-1">
              <MapPin size={11} color={colors.mutedForeground} strokeWidth={2} />
              <Text className="text-muted-foreground text-xs">{distanceLabel}</Text>
            </View>
          </View>

          {/* Challenge button */}
          <TouchableOpacity
            onPress={(e) => {
              e.stopPropagation();
              onChallenge();
            }}
            activeOpacity={0.75}
            className="bg-accent/15 rounded-xl px-3 py-2 flex-row items-center gap-1.5"
          >
            <Swords size={14} color={colors.accent} strokeWidth={2.5} />
            <Text className="text-accent text-xs font-bold">Challenge</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Card>
  );
}
