import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Search, SlidersHorizontal, MapPin, X, Star } from 'lucide-react-native';
import { VenueCard } from '../../components/ui/VenueCard';
import { SkeletonCard } from '../../components/ui/Skeleton';
import { usePublicVenues } from './useCourts';
import { useUIStore } from '../../stores/uiStore';
import { usePlayerThemeColors } from '../../hooks/usePlayerThemeColors';
import type { PublicVenue } from '@vms/shared/types';
import { supabase } from '../../lib/supabase';
import { calculateDistanceKm } from '../../lib/geo';

export function CourtListScreen() {
  const { cityFilter, userCoords } = useUIStore();
  const { colors } = usePlayerThemeColors();
  const [searchText, setSearchText] = useState('');

  const { data: allVenues = [], isLoading, refetch, isRefetching } = usePublicVenues(cityFilter);

  const venues = useMemo(() => {
    let filtered = allVenues.filter(
      (v) =>
        v.name.toLowerCase().includes(searchText.toLowerCase()) ||
        v.city?.toLowerCase().includes(searchText.toLowerCase())
    );

    if (userCoords) {
      filtered.sort((a, b) => {
        const distA = calculateDistanceKm(userCoords.latitude, userCoords.longitude, a.latitude, a.longitude);
        const distB = calculateDistanceKm(userCoords.latitude, userCoords.longitude, b.latitude, b.longitude);
        return distA - distB;
      });
    }

    return filtered;
  }, [allVenues, searchText, userCoords]);

  return (
    <View className="flex-1 bg-background">
      {/* Search bar */}
      <View className="px-4 pb-3">
        <View className="flex-row items-center bg-muted rounded-2xl px-3 gap-2">
          <Search size={16} color={colors.mutedForeground} strokeWidth={2} />
          <TextInput
            className="flex-1 py-3 text-foreground text-sm"
            placeholder="Search venues or city..."
            placeholderTextColor={colors.mutedForeground}
            value={searchText}
            onChangeText={setSearchText}
          />
          {searchText.length > 0 && (
            <TouchableOpacity onPress={() => setSearchText('')}>
              <X size={16} color={colors.mutedForeground} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <FlatList
        data={venues}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          isLoading ? (
            <View className="gap-4">
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
            </View>
          ) : (
            <View className="flex-1 items-center justify-center py-20">
              <Text className="text-4xl mb-4">🏟️</Text>
              <Text className="text-foreground font-bold text-lg">No courts found</Text>
              <Text className="text-muted-foreground text-center mt-2">
                Try searching for a different city or venue name
              </Text>
            </View>
          )
        }
        renderItem={({ item }) => (
          <VenueListCard
            venue={item as any}
            userCoords={userCoords}
            onPress={() => router.push(`/courts/${item.id}` as any)}
          />
        )}
      />
    </View>
  );
}

/** Full-width vertical card for the list view (different from horizontal VenueCard) */
function VenueListCard({
  venue,
  userCoords,
  onPress,
}: {
  venue: PublicVenue & { average_rating?: number | null };
  userCoords?: { latitude: number; longitude: number } | null;
  onPress: () => void;
}) {
  const { colors } = usePlayerThemeColors();
  const [activeImage, setActiveImage] = useState(0);
  const CARD_WIDTH = Dimensions.get('window').width - 32;

  const priceLabel = venue.min_price_per_hour
    ? `₹${Math.round(venue.min_price_per_hour / 100)} /hr`
    : '-- /hr';

  const photos = venue.photos && venue.photos.length > 0 ? venue.photos : [];
  const rating = venue.average_rating ? venue.average_rating.toFixed(1) : '--';

  const distanceLabel = useMemo(() => {
    if (userCoords && venue.latitude && venue.longitude) {
      const d = calculateDistanceKm(userCoords.latitude, userCoords.longitude, venue.latitude, venue.longitude);
      return `${d.toFixed(1)} km away`;
    }
    return null;
  }, [userCoords, venue.latitude, venue.longitude]);

  const onScroll = (e: any) => {
    const scrollPos = e.nativeEvent.contentOffset.x;
    const width = e.nativeEvent.layoutMeasurement.width;
    const currentIndex = Math.round(scrollPos / width);
    setActiveImage(currentIndex);
  };

  return (
    <View className="mb-4">
      {/* Image Gallery */}
      <View className="w-full h-48 rounded-2xl overflow-hidden bg-muted mb-3 relative">
        {photos.length > 0 ? (
          <>
            <FlatList
              data={photos}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onMomentumScrollEnd={onScroll}
              keyExtractor={(item) => item}
              renderItem={({ item }) => {
                const imageUrl = item.startsWith('http')
                  ? item
                  : supabase.storage.from('venue-photos').getPublicUrl(item).data.publicUrl;
                
                return (
                  <TouchableOpacity activeOpacity={0.9} onPress={onPress} style={{ width: CARD_WIDTH, height: '100%' }}>
                    <Image source={{ uri: imageUrl }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
                  </TouchableOpacity>
                );
              }}
            />
            {/* Pagination Dots */}
            {photos.length > 1 && (
              <View pointerEvents="none" className="absolute bottom-2 left-0 right-0 flex-row justify-center gap-1.5">
                {photos.map((_, i) => (
                  <View
                    key={i}
                    className={`h-1.5 rounded-full ${
                      i === activeImage ? 'w-4 bg-white' : 'w-1.5 bg-white/50'
                    }`}
                  />
                ))}
              </View>
            )}
          </>
        ) : (
          <TouchableOpacity activeOpacity={0.9} onPress={onPress} className="flex-1 items-center justify-center">
            <Text className="text-4xl mb-1">🏸</Text>
            <Text className="text-muted-foreground text-xs">No photos</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Details Section */}
      <TouchableOpacity activeOpacity={0.7} onPress={onPress} className="px-1 gap-2">
        {/* Title and Rating */}
        <View className="flex-row items-start justify-between">
          <Text className="text-foreground font-black text-lg flex-1 mr-3" numberOfLines={1}>
            {venue.name}
          </Text>
          <View className="flex-row items-center gap-1 mt-0.5">
            <Star size={14} color={colors.foreground} fill={colors.foreground} />
            <Text className="text-foreground font-bold text-sm">{rating}</Text>
          </View>
        </View>

        {/* Location & Price */}
        <Text className="text-muted-foreground text-sm font-medium">
          {venue.city || 'Unknown'}{distanceLabel ? ` • ${distanceLabel}` : ''} • {priceLabel}
        </Text>

        {/* Amenities */}
        {venue.amenities && venue.amenities.length > 0 && (
          <View className="flex-row gap-2 mt-1">
            {venue.amenities.slice(0, 3).map((a) => (
              <View key={a} className="bg-muted/60 rounded-full px-3 py-1.5 border border-border/50">
                <Text className="text-foreground text-xs font-semibold capitalize">{a}</Text>
              </View>
            ))}
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
}

