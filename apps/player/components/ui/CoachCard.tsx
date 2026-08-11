import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { Dumbbell, ChevronRight, IndianRupee } from 'lucide-react-native';
import { usePlayerThemeColors } from '../../hooks/usePlayerThemeColors';
import type { Coach } from '@vms/shared/types';

interface CoachCardProps {
  coach: Coach;
  onPress: () => void;
}

/** Formats paise to "₹X/session" */
function formatPrice(paise: number): string {
  return `₹${Math.round(paise / 100)}/session`;
}

/**
 * CoachCard — Grid card for the Train sub-tab coach listing.
 */
export function CoachCard({ coach, onPress }: CoachCardProps) {
  const { colors } = usePlayerThemeColors();
  const initials = coach.full_name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      className="bg-card rounded-2xl overflow-hidden border border-border flex-1 m-1.5"
    >
      {/* Avatar section */}
      <View className="h-32 bg-muted items-center justify-center overflow-hidden">
        {coach.photo_url ? (
          <Image
            source={{ uri: coach.photo_url }}
            className="w-full h-full"
            resizeMode="cover"
          />
        ) : (
          <View className="w-16 h-16 rounded-full bg-primary items-center justify-center">
            <Text className="text-primary-foreground text-2xl font-black">{initials}</Text>
          </View>
        )}
      </View>

      {/* Info section */}
      <View className="p-3 gap-1.5">
        <Text className="text-foreground font-bold text-sm" numberOfLines={1}>
          {coach.full_name}
        </Text>

        {/* Venue */}
        {coach.venue && (
          <Text className="text-muted-foreground text-xs" numberOfLines={1}>
            {coach.venue.name}
          </Text>
        )}

        {/* Specialty pills */}
        {coach.specialty && coach.specialty.length > 0 && (
          <View className="flex-row flex-wrap gap-1 mt-0.5">
            {coach.specialty.slice(0, 2).map((s) => (
              <View key={s} className="bg-muted rounded-full px-2 py-0.5">
                <Text className="text-foreground text-[10px] font-semibold capitalize">{s}</Text>
              </View>
            ))}
            {coach.specialty.length > 2 && (
              <View className="bg-muted rounded-full px-2 py-0.5">
                <Text className="text-muted-foreground text-[10px]">+{coach.specialty.length - 2}</Text>
              </View>
            )}
          </View>
        )}

        {/* Price */}
        <View className="flex-row items-center justify-between mt-1">
          <View className="flex-row items-center gap-0.5">
            <IndianRupee size={11} color={colors.accent} strokeWidth={2.5} />
            <Text className="text-accent text-xs font-bold">
              {Math.round(coach.price_per_session / 100)}/session
            </Text>
          </View>
          <ChevronRight size={14} color={colors.mutedForeground} strokeWidth={2} />
        </View>
      </View>
    </TouchableOpacity>
  );
}
