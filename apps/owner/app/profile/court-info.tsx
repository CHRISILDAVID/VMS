import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Linking, Platform, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ChevronLeft, MapPin, Phone, Mail, Wifi, ParkingSquare, ShowerHead, Coffee, Camera, Check } from 'lucide-react-native';
import { useVenues } from '../../hooks/useVenues';
import { useVenueStore } from '../../stores/venueStore';
import { formatPhone } from '@vms/shared/utils';
import { useThemeColors } from '../../hooks/useThemeColors';

const amenityIcons: Record<string, React.ComponentType<any>> = {
  'Free Wi-Fi': Wifi,
  'Parking': ParkingSquare,
  'Changing Room': ShowerHead,
  'Cafeteria': Coffee,
};

const InfoRow = ({ label, value, Icon }: { label: string; value: string | undefined; Icon?: React.ComponentType<any> }) => {
  const { colors } = useThemeColors();
  return (
    <View className="flex-row items-start py-3 border-b border-border">
      {Icon && (
        <View className="w-8 h-8 rounded-lg bg-primary/10 items-center justify-center mr-3 mt-0.5">
          <Icon size={15} color={colors.primary} />
        </View>
      )}
      <View className="flex-1">
        <Text className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide mb-1">{label}</Text>
        <Text className="text-sm font-semibold text-foreground leading-5">{value || 'Not provided'}</Text>
      </View>
    </View>
  );
};

export default function CourtInformationScreen() {
  const router = useRouter();
  const { data: venues } = useVenues();
  const { selectedVenueId } = useVenueStore();
  const venue = venues?.find(v => v.id === selectedVenueId);
  const { colors } = useThemeColors();

  const handleOpenMaps = () => {
    if (!venue?.latitude || !venue?.longitude) return;
    
    const scheme = Platform.select({ ios: 'maps:0,0?q=', android: 'geo:0,0?q=' });
    const latLng = `${venue.latitude},${venue.longitude}`;
    const label = venue.name;
    const url = Platform.select({
      ios: `${scheme}${label}@${latLng}`,
      android: `${scheme}${latLng}(${label})`
    });
    
    if (url) {
      Linking.openURL(url).catch(err => console.error('An error occurred', err));
    }
  };

  if (!venue) {
    return (
      <SafeAreaView className="flex-1 bg-background justify-center items-center">
        <Text className="text-foreground">Loading venue...</Text>
      </SafeAreaView>
    );
  }

  const fullAddress = [venue.address, venue.city, venue.state, venue.pincode].filter(Boolean).join(', ');

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top', 'bottom']}>
      {/* Header */}
      <View className="flex-row items-center bg-card px-4 py-3.5 border-b border-border">
        <TouchableOpacity onPress={() => router.back()} className="w-9 h-9 rounded-xl bg-muted border border-border items-center justify-center mr-3">
          <ChevronLeft size={20} color={colors.foreground} />
        </TouchableOpacity>
        <Text className="text-lg font-extrabold text-foreground">Court Information</Text>
      </View>

      <ScrollView className="flex-1 p-4" showsVerticalScrollIndicator={false}>
        {/* Photos (Read Only) */}
        <View className="bg-card rounded-2xl p-4 mb-3.5 border border-border">
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row">
            {venue.photos && venue.photos.length > 0 ? (
              venue.photos.map((url, i) => (
                <View key={i} className="w-[200px] h-[130px] bg-muted mr-2 rounded-lg overflow-hidden">
                  <Image source={{ uri: url }} className="w-full h-full" />
                </View>
              ))
            ) : (
              <View className="w-[200px] h-[130px] bg-muted mr-2 rounded-lg overflow-hidden items-center justify-center">
                <Camera size={24} color={colors.mutedForeground} />
                <Text className="text-xs text-muted-foreground font-medium mt-1.5">No photos</Text>
              </View>
            )}
          </ScrollView>
          <View className="flex-row items-center gap-1.5 mt-2.5">
            <Camera size={13} color={colors.mutedForeground} />
            <Text className="text-[11px] text-muted-foreground font-medium">
              {venue.photos?.length || 0} photos · Swipe to view
            </Text>
          </View>
        </View>

        {/* Basic Info (Read Only) */}
        <View className="bg-card rounded-2xl p-4 mb-3.5 border border-border">
          <Text className="text-[11px] font-bold text-muted-foreground uppercase tracking-wide mb-3">BASIC DETAILS</Text>
          <InfoRow label="Court Name" value={venue.name} />
          <InfoRow label="Address" value={fullAddress} Icon={MapPin} />
          <InfoRow label="Phone" value={venue.contact_phone ? formatPhone(venue.contact_phone) : undefined} Icon={Phone} />
          <InfoRow label="Email" value={venue.contact_email || undefined} Icon={Mail} />
          <InfoRow label="Court Type" value={venue.court_type ? venue.court_type.charAt(0).toUpperCase() + venue.court_type.slice(1) : undefined} />
        </View>

        {/* Location / Google Maps */}
        <View className="bg-card rounded-2xl mb-3.5 border border-border overflow-hidden">
          <View className="p-3.5 pb-2.5">
            <Text className="text-[13px] font-bold text-foreground">Location</Text>
          </View>
          <View className="h-[140px] bg-blue-50 dark:bg-blue-900/20 items-center justify-center">
            {/* Simple stylised representation of a map */}
            <View className="bg-background rounded-lg py-1 px-2.5 shadow-sm shadow-black/10">
              <Text className="text-[11px] font-bold text-foreground">{venue.name}</Text>
            </View>
          </View>
          <View className="p-3.5">
            <TouchableOpacity 
              className={`flex-row items-center justify-center gap-1.5 p-2.5 rounded-xl border ${(!venue.latitude || !venue.longitude) ? 'bg-muted border-border' : 'bg-primary/10 border-primary/30'}`} 
              onPress={handleOpenMaps}
              disabled={!venue.latitude || !venue.longitude}
            >
              <MapPin size={13} color={(!venue.latitude || !venue.longitude) ? colors.mutedForeground : colors.primary} />
              <Text className={`text-xs font-semibold ${(!venue.latitude || !venue.longitude) ? 'text-muted-foreground' : 'text-primary'}`}>
                Open in Maps
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Amenities (Read Only) */}
        <View className="bg-card rounded-2xl p-4 mb-10 border border-border">
          <Text className="text-[11px] font-bold text-muted-foreground uppercase tracking-wide mb-3">AMENITIES</Text>
          <View className="flex-row flex-wrap gap-2.5">
            {venue.amenities && venue.amenities.length > 0 ? (
              venue.amenities.map(a => {
                const Icon = amenityIcons[a] || Check;
                return (
                  <View key={a} className="flex-row items-center gap-2 py-2.5 px-3.5 bg-primary/10 border border-primary/30 rounded-xl">
                    <Icon size={16} color={colors.primary} />
                    <Text className="text-xs font-semibold text-primary">{a}</Text>
                  </View>
                );
              })
            ) : (
              <Text className="text-[13px] text-muted-foreground">No amenities listed</Text>
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
