import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { MapPin, ChevronRight, Zap } from 'lucide-react-native';
import { usePlayerThemeColors } from '../../hooks/usePlayerThemeColors';
import type { PublicVenue } from '@vms/shared/types';

interface VenueCardProps {
  venue: PublicVenue;
  onPress: () => void;
  /** Width of the card — for horizontal scroll use fixed width */
  width?: number;
}

/** Formats paise to "₹X/hr" string */
function formatPrice(paise: number | null): string | null {
  if (paise === null) return null;
  return `₹${Math.round(paise / 100)}/hr`;
}

/**
 * VenueCard — Card for the Home tab Nearby Courts horizontal scroll
 * and the Play tab Court Listing.
 */
export function VenueCard({ venue, onPress, width = 220 }: VenueCardProps) {
  const { colors } = usePlayerThemeColors();
  const priceLabel = formatPrice(venue.min_price_per_hour);
  const courtCount = venue.courts.length;

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      style={{ width }}
      className="bg-card rounded-2xl overflow-hidden border border-border mr-3"
    >
      {/* Venue photo / placeholder banner */}
      <View className="h-28 bg-muted items-center justify-center overflow-hidden">
        {venue.photos && venue.photos.length > 0 ? (
          <Image
            source={{ uri: venue.photos[0] }}
            className="w-full h-full"
            resizeMode="cover"
          />
        ) : (
          <View className="items-center gap-1">
            <Text className="text-4xl">🏸</Text>
            <Text className="text-muted-foreground text-xs">{venue.name}</Text>
          </View>
        )}
      </View>

      {/* Info section */}
      <View className="p-3 gap-1.5">
        <Text className="text-foreground font-bold text-sm" numberOfLines={1}>
          {venue.name}
        </Text>

        <View className="flex-row items-center gap-1">
          <MapPin size={11} color={colors.mutedForeground} strokeWidth={2} />
          <Text className="text-muted-foreground text-xs" numberOfLines={1}>
            {venue.city ?? 'Unknown city'}
          </Text>
        </View>

        <View className="flex-row items-center justify-between mt-1">
          <View className="flex-row gap-1.5">
            {/* Court count badge */}
            <View className="bg-muted rounded-full px-2 py-0.5">
              <Text className="text-foreground text-xs font-semibold">
                {courtCount} {courtCount === 1 ? 'court' : 'courts'}
              </Text>
            </View>
            {/* Price badge */}
            {priceLabel && (
              <View className="bg-accent/20 border border-accent/30 rounded-full px-2 py-0.5 flex-row items-center gap-0.5">
                <Zap size={9} color={colors.accent} strokeWidth={2.5} />
                <Text className="text-accent text-xs font-bold">{priceLabel}</Text>
              </View>
            )}
          </View>

          <View className="bg-primary rounded-full w-6 h-6 items-center justify-center">
            <ChevronRight size={12} color={colors.primaryForeground} strokeWidth={2.5} />
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}
