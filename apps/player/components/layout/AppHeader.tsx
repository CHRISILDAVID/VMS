import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MapPin, Wallet, Bell, UserCircle, ChevronDown, Search, X, Navigation } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import * as Location from 'expo-location';
import { usePlayerThemeColors } from '../../hooks/usePlayerThemeColors';
import { usePlayerStore } from '../../stores/playerStore';
import { useUIStore } from '../../stores/uiStore';
import { WalletDropdown } from './WalletDropdown';

interface AppHeaderProps {
  /** Custom search placeholder — defaults to "Search courts, players..." */
  searchPlaceholder?: string;
  /** Hides the search bar on some screens */
  hideSearch?: boolean;
}

const COMMON_CITIES = ['Kuala Lumpur', 'Chennai', 'Bengaluru', 'Mumbai', 'Delhi'];

export function AppHeader({ searchPlaceholder = 'Search courts, players...', hideSearch = false }: AppHeaderProps) {
  const router = useRouter();
  const { colors, isDark } = usePlayerThemeColors();
  const { playerProfile, alertsCount } = usePlayerStore();
  const { cityFilter, setCityFilter, isWalletPopoverOpen, setWalletPopoverOpen } = useUIStore();
  const [cityModalVisible, setCityModalVisible] = useState(false);
  const [isLocating, setIsLocating] = useState(false);

  const requestLocation = async (force = false) => {
    if (!force && cityFilter) return;
    try {
      setIsLocating(true);
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setIsLocating(false);
        return;
      }

      let location = await Location.getLastKnownPositionAsync();
      
      if (!location) {
        // Use a Promise.race to prevent hanging indefinitely on emulators without GPS lock
        location = await Promise.race([
          Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced }),
          new Promise<null>((resolve) => setTimeout(() => resolve(null), 5000))
        ]);
      }

      if (location) {
        const [geocode] = await Location.reverseGeocodeAsync({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        });

        if (geocode?.city) {
          setCityFilter(geocode.city);
        } else if (geocode?.subregion) {
          setCityFilter(geocode.subregion);
        }
      }
    } catch (e) {
      console.warn('Auto-location failed', e);
    } finally {
      setIsLocating(false);
      setCityModalVisible(false);
    }
  };

  useEffect(() => {
    requestLocation();
  }, []);

  const displayCity = cityFilter || 'Select City';
  const initials = playerProfile?.full_name
    ?.split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase() ?? '?';

  return (
    <SafeAreaView
      edges={['top']}
      style={{ backgroundColor: colors.background }}
    >
      <View className="px-4 pb-3 pt-1 gap-3">
        {/* Row 1: Brand + City + Actions */}
        <View className="flex-row items-center">
          {/* Brand name */}
          <Text className="text-foreground text-xl font-black tracking-tight flex-1">
            Shuttle<Text className="text-accent">Hub</Text>
          </Text>

          {/* City picker */}
          <TouchableOpacity
            className="flex-row items-center gap-1 bg-muted rounded-full px-3 py-1.5 mr-3"
            onPress={() => setCityModalVisible(true)}
            activeOpacity={0.7}
          >
            <MapPin size={12} color={colors.accent} strokeWidth={2.5} />
            <Text className="text-foreground text-xs font-semibold" numberOfLines={1}>
              {displayCity}
            </Text>
            <ChevronDown size={12} color={colors.mutedForeground} strokeWidth={2.5} />
          </TouchableOpacity>

          {/* Wallet icon */}
          <TouchableOpacity
            className="w-9 h-9 rounded-full bg-muted items-center justify-center mr-2"
            onPress={() => setWalletPopoverOpen(!isWalletPopoverOpen)}
            activeOpacity={0.7}
          >
            <Wallet size={18} color={colors.foreground} strokeWidth={2} />
          </TouchableOpacity>

          {/* Profile icon */}
          <TouchableOpacity
            className="w-9 h-9 rounded-full bg-accent items-center justify-center"
            onPress={() => router.push('/(tabs)/profile' as any)}
            activeOpacity={0.7}
          >
            {playerProfile?.full_name ? (
              <Text className="text-accent-foreground text-xs font-black">{initials}</Text>
            ) : (
              <UserCircle size={20} color={colors.accentForeground} strokeWidth={2} />
            )}
          </TouchableOpacity>
        </View>

        {/* Row 2: Search */}
        {!hideSearch && (
          <View className="flex-row items-center gap-2">
            <View className="flex-1 flex-row items-center bg-muted rounded-xl px-3 h-10 gap-2">
              <Search size={16} color={colors.mutedForeground} strokeWidth={2} />
              <TextInput
                placeholder={searchPlaceholder}
                placeholderTextColor={colors.mutedForeground}
                className="flex-1 text-foreground text-sm"
                returnKeyType="search"
              />
            </View>
            <TouchableOpacity className="w-10 h-10 rounded-xl bg-muted items-center justify-center">
              <Bell size={18} color={colors.foreground} strokeWidth={2} />
              {alertsCount > 0 && (
                <View className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-destructive items-center justify-center">
                  <Text className="text-white text-[9px] font-black">
                    {alertsCount > 9 ? '9+' : alertsCount}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        )}
      </View>
      <WalletDropdown />

      {/* City Picker Modal */}
      <Modal visible={cityModalVisible} transparent animationType="slide">
        <View className="flex-1 justify-end bg-black/50">
          <View className="bg-card rounded-t-3xl p-5 pb-8 min-h-[300px]">
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-foreground text-lg font-bold">Select Location</Text>
              <TouchableOpacity onPress={() => setCityModalVisible(false)} className="p-2 -mr-2">
                <X size={20} color={colors.mutedForeground} />
              </TouchableOpacity>
            </View>
            
            <TouchableOpacity 
              className="flex-row items-center gap-3 bg-accent/10 p-4 rounded-xl border border-accent/20 mb-4"
              onPress={() => requestLocation(true)}
            >
              <Navigation size={18} color={colors.accent} />
              <Text className="text-accent font-semibold text-base">
                {isLocating ? 'Locating...' : 'Use Current Location'}
              </Text>
            </TouchableOpacity>

            <Text className="text-muted-foreground text-sm font-semibold mb-2 ml-1">POPULAR CITIES</Text>
            <View className="flex-row flex-wrap gap-2 mb-4">
              {COMMON_CITIES.map(city => (
                <TouchableOpacity
                  key={city}
                  onPress={() => {
                    setCityFilter(city);
                    setCityModalVisible(false);
                  }}
                  className={`px-4 py-2 rounded-full border ${cityFilter === city ? 'bg-primary border-primary' : 'bg-background border-border'}`}
                >
                  <Text className={cityFilter === city ? 'text-primary-foreground font-bold' : 'text-foreground font-medium'}>
                    {city}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {cityFilter && (
              <TouchableOpacity 
                className="items-center py-3 mt-2"
                onPress={() => {
                  setCityFilter(null);
                  setCityModalVisible(false);
                }}
              >
                <Text className="text-destructive font-bold">Clear Filter</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
