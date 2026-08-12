import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { MapPin, Calendar, Clock, Users } from 'lucide-react-native';
import { Card } from './Card';
import { Badge } from './Badge';
import { usePlayerThemeColors } from '../../hooks/usePlayerThemeColors';
import { format, parseISO } from 'date-fns';
import type { HostedMatchDiscovery, MatchFormat } from '@vms/shared/types';

interface MatchCardProps {
  match: HostedMatchDiscovery;
  onPress: () => void;
}

const FORMAT_LABEL: Record<MatchFormat, string> = {
  singles: 'Singles',
  doubles: 'Doubles',
  mixed:   'Mixed',
};

const STATUS_VARIANT: Record<string, 'success' | 'warning' | 'muted' | 'destructive'> = {
  open:      'success',
  full:      'warning',
  cancelled: 'destructive',
  completed: 'muted',
};

/**
 * MatchCard
 *
 * Reusable card for hosted match discovery list.
 * Shows host info, venue, date/time, slots progress, distance, format badge.
 */
export function MatchCard({ match, onPress }: MatchCardProps) {
  const { colors } = usePlayerThemeColors();

  const slotsFilled = Number(match.joined_count);
  const slotsTotal  = match.max_players;
  const fillPercent = Math.min((slotsFilled / slotsTotal) * 100, 100);

  const dateLabel = match.booking_date
    ? format(parseISO(match.booking_date), 'EEE, MMM d')
    : '--';

  const startLabel = match.booking_start
    ? match.booking_start.substring(0, 5)
    : '--';
  const endLabel = match.booking_end
    ? match.booking_end.substring(0, 5)
    : '--';

  const distanceLabel = match.distance_km !== null
    ? match.distance_km < 1
      ? `${Math.round(match.distance_km * 1000)} m`
      : `${match.distance_km.toFixed(1)} km`
    : match.venue_city ?? '';

  const hostInitials = (match.host_name ?? 'H')
    .split(' ')
    .map((n: string) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <Card noPadding className="mb-3 overflow-hidden">
      <TouchableOpacity activeOpacity={0.8} onPress={onPress}>
        <View className="p-4 gap-3">
          {/* Top row: host + format badge + status */}
          <View className="flex-row items-center gap-2.5">
            {match.host_avatar ? (
              <Image source={{ uri: match.host_avatar }} className="w-10 h-10 rounded-full" />
            ) : (
              <View className="w-10 h-10 rounded-full bg-primary/20 items-center justify-center">
                <Text className="text-primary font-bold">{hostInitials}</Text>
              </View>
            )}
            <View className="flex-1">
              <Text className="text-foreground font-bold text-sm" numberOfLines={1}>
                {match.host_name ?? 'Unknown Host'}
              </Text>
              {match.host_player_id_str && (
                <Text className="text-accent text-xs font-semibold">{match.host_player_id_str}</Text>
              )}
            </View>
            <Badge
              label={FORMAT_LABEL[match.match_format] ?? match.match_format}
              variant="outline"
            />
            <Badge
              label={match.status.charAt(0).toUpperCase() + match.status.slice(1)}
              variant={STATUS_VARIANT[match.status] ?? 'muted'}
            />
          </View>

          {/* Venue */}
          {match.venue_name && (
            <View className="flex-row items-center gap-1.5">
              <MapPin size={13} color={colors.mutedForeground} strokeWidth={2} />
              <Text className="text-muted-foreground text-sm flex-1" numberOfLines={1}>
                {match.venue_name}
                {distanceLabel ? ` • ${distanceLabel}` : ''}
              </Text>
            </View>
          )}

          {/* Date + Time */}
          <View className="flex-row items-center gap-4">
            <View className="flex-row items-center gap-1.5">
              <Calendar size={13} color={colors.mutedForeground} strokeWidth={2} />
              <Text className="text-muted-foreground text-sm">{dateLabel}</Text>
            </View>
            <View className="flex-row items-center gap-1.5">
              <Clock size={13} color={colors.mutedForeground} strokeWidth={2} />
              <Text className="text-muted-foreground text-sm">{startLabel} – {endLabel}</Text>
            </View>
          </View>

          {/* Slots progress */}
          <View className="gap-1.5">
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center gap-1.5">
                <Users size={13} color={colors.mutedForeground} strokeWidth={2} />
                <Text className="text-muted-foreground text-xs">
                  {slotsFilled}/{slotsTotal} joined
                </Text>
              </View>
              {match.skill_level !== 'all' && (
                <Text className="text-muted-foreground text-xs capitalize">{match.skill_level}</Text>
              )}
            </View>
            {/* Progress bar */}
            <View className="h-1.5 rounded-full bg-muted overflow-hidden">
              <View
                className="h-full rounded-full bg-accent"
                style={{ width: `${fillPercent}%` }}
              />
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </Card>
  );
}
