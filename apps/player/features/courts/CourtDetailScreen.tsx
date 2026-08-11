import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Linking,
  ActivityIndicator,
  FlatList,
  Dimensions,
  Share,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import {
  ArrowLeft,
  MapPin,
  Phone,
  Navigation,
  ChevronRight,
  Wifi,
  Wind,
  Zap,
  Lightbulb,
  Car,
  Share2,
  Star,
  Clock,
  Crown
} from 'lucide-react-native';
import { useVenueDetail, useVenueCourts, usePricingBlocks } from './useCourts';
import { usePlayerThemeColors } from '../../hooks/usePlayerThemeColors';
import { SkeletonCard } from '../../components/ui/Skeleton';
import { supabase } from '../../lib/supabase';
import { format } from 'date-fns';
import * as Location from 'expo-location';

const AMENITY_ICONS: Record<string, React.ElementType> = {
  wifi: Wifi,
  ac: Wind,
  lighting: Lightbulb,
  parking: Car,
  power: Zap,
};

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371; // km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

export function CourtDetailScreen() {
  const { venueId } = useLocalSearchParams<{ venueId: string }>();
  const { colors } = usePlayerThemeColors();

  const { data: venue, isLoading: venueLoading } = useVenueDetail(venueId);
  const { data: courts = [], isLoading: courtsLoading } = useVenueCourts(venueId);
  
  const todayStr = format(new Date(), 'EEEE').toLowerCase();
  const { data: pricingBlocks = [] } = usePricingBlocks(venueId, todayStr);

  const isLoading = venueLoading || courtsLoading;

  const [activeImage, setActiveImage] = useState(0);
  const [distanceStr, setDistanceStr] = useState<string>('~ km away');

  const SCREEN_WIDTH = Dimensions.get('window').width;

  useEffect(() => {
    if (venue?.latitude && venue?.longitude) {
      (async () => {
        try {
          let loc = await Location.getLastKnownPositionAsync();
          if (!loc) {
            loc = await Promise.race([
              Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced }),
              new Promise<null>((resolve) => setTimeout(() => resolve(null), 5000))
            ]);
          }
          if (loc) {
            const dist = calculateDistance(
              loc.coords.latitude,
              loc.coords.longitude,
              venue.latitude!,
              venue.longitude!
            );
            setDistanceStr(`${dist.toFixed(1)} km away`);
          }
        } catch (e) {
          // ignore
        }
      })();
    }
  }, [venue]);

  const onScroll = (e: any) => {
    const scrollPos = e.nativeEvent.contentOffset.x;
    const width = e.nativeEvent.layoutMeasurement.width;
    const currentIndex = Math.round(scrollPos / width);
    setActiveImage(currentIndex);
  };

  const openDirections = () => {
    if (venue?.latitude && venue?.longitude) {
      const url = `https://maps.google.com/?q=${venue.latitude},${venue.longitude}`;
      Linking.openURL(url);
    } else if (venue?.address) {
      const url = `https://maps.google.com/?q=${encodeURIComponent(
        [venue.address, venue.city].filter(Boolean).join(', ')
      )}`;
      Linking.openURL(url);
    }
  };

  const callVenue = () => {
    if (venue?.contact_phone) {
      Linking.openURL(`tel:${venue.contact_phone}`);
    }
  };

  const shareVenue = async () => {
    if (!venue) return;
    try {
      await Share.share({
        message: `Check out ${venue.name} on ShuttleHub! Book your court now.`,
        title: venue.name
      });
    } catch (error) {
      console.log('Error sharing:', error);
    }
  };

  const rating = venue?.average_rating ? venue.average_rating.toFixed(1) : '--';
  const photos = venue?.photos && venue.photos.length > 0 ? venue.photos : [];

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top', 'bottom']}>
      {/* Header */}
      <View className="flex-row items-center px-4 py-3 gap-3 z-10">
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-10 h-10 rounded-full bg-muted/80 backdrop-blur-md items-center justify-center"
        >
          <ArrowLeft size={20} color={colors.foreground} strokeWidth={2.5} />
        </TouchableOpacity>
        <Text className="text-foreground font-black text-lg flex-1 text-center" numberOfLines={1}>
          {venue?.name ?? 'Court Details'}
        </Text>
        <TouchableOpacity
          onPress={shareVenue}
          className="w-10 h-10 rounded-full bg-muted/80 backdrop-blur-md items-center justify-center"
        >
          <Share2 size={18} color={colors.foreground} strokeWidth={2.5} />
        </TouchableOpacity>
      </View>

      <ScrollView
        className="flex-1 -mt-16" // Pull up to go behind header for sticky effect if we want, but SafeAreaView handles it. Actually let's just keep standard flow.
        style={{ marginTop: 0 }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        {isLoading ? (
          <View className="px-4 gap-3 mt-4">
            <SkeletonCard lines={5} />
            <SkeletonCard lines={4} />
          </View>
        ) : !venue ? (
          <View className="flex-1 items-center justify-center p-8 mt-20">
            <Text className="text-foreground font-bold">Venue not found</Text>
          </View>
        ) : (
          <>
            {/* Image Gallery */}
            <View className="w-full h-72 bg-muted mb-5 relative">
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
                        <View style={{ width: SCREEN_WIDTH, height: '100%' }}>
                          <Image source={{ uri: imageUrl }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
                        </View>
                      );
                    }}
                  />
                  {/* Pagination Dots */}
                  {photos.length > 1 && (
                    <View pointerEvents="none" className="absolute bottom-4 left-0 right-0 flex-row justify-center gap-1.5">
                      {photos.map((_, i) => (
                        <View
                          key={i}
                          className={`h-1.5 rounded-full ${
                            i === activeImage ? 'w-6 bg-white' : 'w-2 bg-white/50'
                          }`}
                        />
                      ))}
                    </View>
                  )}
                </>
              ) : (
                <View className="flex-1 items-center justify-center gap-1">
                  <Text className="text-6xl">🏸</Text>
                  <Text className="text-muted-foreground text-sm font-semibold">{venue.name}</Text>
                </View>
              )}
            </View>

            {/* Title, Rating & Distance */}
            <View className="px-5 mb-6">
              <Text className="text-foreground font-black text-3xl mb-3 leading-tight">{venue.name}</Text>
              
              <View className="flex-row items-center gap-4">
                <View className="flex-row items-center gap-1.5 bg-accent/10 border border-accent/20 px-3 py-1.5 rounded-full">
                  <Star size={14} color={colors.accent} fill={colors.accent} />
                  <Text className="text-accent font-black text-sm">{rating}</Text>
                </View>
                
                <View className="flex-row items-center gap-1.5 bg-muted/50 px-3 py-1.5 rounded-full">
                  <MapPin size={14} color={colors.mutedForeground} strokeWidth={2.5} />
                  <Text className="text-foreground font-bold text-sm">{distanceStr}</Text>
                </View>
              </View>
              
              <Text className="text-muted-foreground font-medium text-sm mt-4 leading-5" numberOfLines={2}>
                {[venue.address, venue.city, venue.state].filter(Boolean).join(', ')}
              </Text>
            </View>

            {/* Styled Info Pills (Action Row) */}
            <View className="px-5 mb-8">
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12 }}>
                {venue.contact_phone && (
                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={callVenue}
                    className="flex-row items-center gap-2 bg-card border border-border px-5 py-3 rounded-2xl shadow-sm"
                  >
                    <Phone size={16} color={colors.foreground} strokeWidth={2.5} />
                    <Text className="text-foreground font-black text-sm">Call Venue</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={openDirections}
                  className="flex-row items-center gap-2 bg-card border border-border px-5 py-3 rounded-2xl shadow-sm"
                >
                  <Navigation size={16} color={colors.foreground} strokeWidth={2.5} />
                  <Text className="text-foreground font-black text-sm">Directions</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={shareVenue}
                  className="flex-row items-center gap-2 bg-card border border-border px-5 py-3 rounded-2xl shadow-sm"
                >
                  <Share2 size={16} color={colors.foreground} strokeWidth={2.5} />
                  <Text className="text-foreground font-black text-sm">Share</Text>
                </TouchableOpacity>
              </ScrollView>
            </View>

            {/* Amenities */}
            {venue.amenities && venue.amenities.length > 0 && (
              <View className="px-5 mb-8">
                <Text className="text-foreground font-black text-xl mb-4">Amenities</Text>
                <View className="flex-row flex-wrap gap-2.5">
                  {venue.amenities.map((amenity) => {
                    const Icon = AMENITY_ICONS[amenity.toLowerCase()] ?? Zap;
                    return (
                      <View
                        key={amenity}
                        className="flex-row items-center gap-2 bg-muted/60 border border-border/50 rounded-xl px-4 py-2.5"
                      >
                        <Icon size={14} color={colors.foreground} strokeWidth={2.5} />
                        <Text className="text-foreground text-sm font-bold capitalize">
                          {amenity}
                        </Text>
                      </View>
                    );
                  })}
                </View>
              </View>
            )}

            {/* Today's Pricing Blocks */}
            <View className="mb-8">
              <View className="px-5 flex-row items-center justify-between mb-4">
                <Text className="text-foreground font-black text-xl">Today's Pricing</Text>
                <View className="bg-primary/10 px-3 py-1 rounded-full">
                  <Text className="text-primary text-xs capitalize font-black">{todayStr}</Text>
                </View>
              </View>
              
              {pricingBlocks.length > 0 ? (
                <ScrollView 
                  horizontal 
                  showsHorizontalScrollIndicator={false} 
                  contentContainerStyle={{ paddingHorizontal: 20, gap: 12 }}
                >
                  {pricingBlocks.map((block) => (
                    <View key={block.id} className="bg-card border border-border rounded-3xl p-5 min-w-[160px] shadow-sm">
                      <View className="flex-row items-center gap-1.5 mb-3 bg-muted/50 self-start px-2.5 py-1 rounded-md">
                        <Clock size={12} color={colors.mutedForeground} strokeWidth={3} />
                        <Text className="text-muted-foreground text-xs font-black">
                          {block.start_time.substring(0, 5)} - {block.end_time.substring(0, 5)}
                        </Text>
                      </View>
                      <Text className="text-foreground font-black text-2xl">
                        ₹{block.price_per_hour / 100}
                        <Text className="text-muted-foreground text-sm font-bold"> /hr</Text>
                      </Text>
                    </View>
                  ))}
                </ScrollView>
              ) : (
                <View className="mx-5 bg-muted/40 border border-border/50 rounded-2xl p-5">
                  <Text className="text-muted-foreground text-sm font-bold text-center">
                    No special pricing blocks set for today.
                  </Text>
                </View>
              )}
            </View>

            {/* Memberships Placeholder */}
            <View className="px-5 mb-8">
              <Text className="text-foreground font-black text-xl mb-4">Memberships</Text>
              <View className="bg-gradient-to-r from-accent/20 to-accent/5 border border-accent/20 rounded-3xl p-6 flex-row items-center justify-between overflow-hidden relative">
                {/* Decorative background element */}
                <View className="absolute -right-6 -top-6 opacity-10">
                  <Crown size={120} color={colors.accent} fill={colors.accent} />
                </View>
                
                <View className="flex-1 mr-4 z-10">
                  <View className="flex-row items-center gap-2 mb-2">
                    <Crown size={20} color={colors.accent} fill={colors.accent} />
                    <Text className="text-foreground font-black text-lg">Pro Member</Text>
                  </View>
                  <Text className="text-muted-foreground text-sm font-semibold leading-5">
                    Unlock exclusive discounts and priority booking. Coming soon in Milestone 12!
                  </Text>
                </View>
                <TouchableOpacity disabled className="bg-background/80 backdrop-blur-md rounded-full px-4 py-2 opacity-60 z-10 border border-border/50">
                  <Text className="text-foreground font-black text-xs tracking-wider">SOON</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Courts */}
            <View className="px-5 mb-4">
              <Text className="text-foreground font-black text-xl mb-4">
                Courts ({courts.length})
              </Text>
              <View className="gap-3">
                {courts.map((court: any) => (
                  <View
                    key={court.id}
                    className="bg-card border border-border rounded-2xl p-5 flex-row items-center justify-between shadow-sm"
                  >
                    <View>
                      <Text className="text-foreground font-black text-base">{court.name}</Text>
                      {court.court_type && (
                        <Text className="text-muted-foreground text-xs capitalize font-bold mt-1">
                          {court.court_type}
                        </Text>
                      )}
                    </View>
                    <View className="flex-row items-center gap-2 bg-success/10 px-3 py-1.5 rounded-full border border-success/20">
                      <View className="w-2 h-2 rounded-full bg-success" />
                      <Text className="text-success font-black text-xs tracking-wide">AVAILABLE</Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          </>
        )}
      </ScrollView>

      {/* Sticky CTA */}
      {venue && courts.length > 0 && (
        <View className="absolute bottom-0 left-0 right-0 bg-background/90 backdrop-blur-md border-t border-border px-5 pt-4 pb-8">
          <TouchableOpacity
            className="bg-primary rounded-2xl py-4 items-center shadow-lg shadow-primary/20"
            activeOpacity={0.85}
            onPress={() =>
              router.push({
                pathname: '/courts/[venueId]/book' as any,
                params: { venueId: venue.id },
              })
            }
          >
            <Text className="text-primary-foreground font-black text-base tracking-wide">
              Book a Slot 🏸
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}
