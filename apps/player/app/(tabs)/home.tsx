import React, { useRef, useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  FlatList,
  TouchableOpacity,
  Dimensions,
  Animated,
  Linking,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { AppHeader } from '../../components/layout/AppHeader';
import {
  CalendarCheck,
  Users,
  Trophy,
  Star,
  Wallet,
  ArrowUpRight,
  ArrowDownLeft,
  ChevronRight,
  ShoppingBag,
  Lock,
} from 'lucide-react-native';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { usePlayerStore } from '../../stores/playerStore';
import { useUIStore } from '../../stores/uiStore';
import { useAuthContext } from '../../contexts/AuthContext';
import { usePlayerThemeColors } from '../../hooks/usePlayerThemeColors';
import { VenueCard } from '../../components/ui/VenueCard';
import { SkeletonCard } from '../../components/ui/Skeleton';
import { createBookingPlayerService } from '@vms/shared/services';
import { createPlayersService } from '@vms/shared/services';
import { supabase } from '../../lib/supabase';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CAROUSEL_ITEM_WIDTH = SCREEN_WIDTH - 32;

const bookingService = createBookingPlayerService(supabase);
const playersService = createPlayersService(supabase);

// ─── Carousel Data ──────────────────────────────────────────────────────────

const HERO_CARDS = [
  {
    id: '1',
    title: 'Tournament Season',
    subtitle: 'Register for City Open 2026 — Last chance!',
    gradient: ['#0B1F3A', '#1A3655'] as [string, string],
    emoji: '🏆',
    action: () => router.push('/(tabs)/tournaments'),
    actionLabel: 'View Tournaments',
  },
  {
    id: '2',
    title: 'Book a Court',
    subtitle: 'Premium badminton courts near you from ₹200/hr',
    gradient: ['#0f5132', '#1A3655'] as [string, string],
    emoji: '🏸',
    action: () => router.push('/(tabs)/play'),
    actionLabel: 'Book Now',
  },
  {
    id: '3',
    title: 'ShuttleHub Pro',
    subtitle: 'Upgrade for priority bookings and exclusive discounts',
    gradient: ['#7c3aed', '#1A3655'] as [string, string],
    emoji: '⚡',
    action: () => Alert.alert('Coming Soon', 'ShuttleHub Pro is coming in a future update!'),
    actionLabel: 'Learn More',
  },
];

// ─── Quick Actions ───────────────────────────────────────────────────────────

interface QuickAction {
  id: string;
  label: string;
  icon: React.ElementType;
  color: string;
  onPress: () => void;
}

function getQuickActions(colors: ReturnType<typeof usePlayerThemeColors>['colors']): QuickAction[] {
  return [
    {
      id: 'book',
      label: 'Book Court',
      icon: CalendarCheck,
      color: colors.primary,
      onPress: () => router.push('/(tabs)/play'),
    },
    {
      id: 'game',
      label: 'Join Game',
      icon: Users,
      color: '#7c3aed',
      onPress: () => Alert.alert('Coming in M12', 'Find Players feature is coming soon!'),
    },
    {
      id: 'tournament',
      label: 'Tournaments',
      icon: Trophy,
      color: '#d97706',
      onPress: () => router.push('/(tabs)/tournaments'),
    },
    {
      id: 'rankings',
      label: 'My Rank',
      icon: Star,
      color: colors.success,
      onPress: () => router.push('/(tabs)/rankings'),
    },
  ];
}

// ─── Main Home Screen ────────────────────────────────────────────────────────

export default function HomeScreen() {
  const { playerProfile } = useAuthContext();
  const { walletBalance, setWalletBalance } = usePlayerStore();
  const { isWalletPopoverOpen, setWalletPopoverOpen, cityFilter } = useUIStore();
  const { colors } = usePlayerThemeColors();

  const carouselRef = useRef<FlatList>(null);
  const autoScrollIndex = useRef(0);
  const [activeSlide, setActiveSlide] = useState(0);
  const [walletId, setWalletId] = useState<string | null>(null);

  const quickActions = getQuickActions(colors);

  // ── Fetch wallet ──────────────────────────────────────────────────────────
  const { data: wallet } = useQuery({
    queryKey: ['wallet', playerProfile?.id],
    queryFn: () => playersService.getWallet(playerProfile!.id),
    enabled: !!playerProfile?.id,
  });

  useEffect(() => {
    if (wallet) {
      setWalletBalance(wallet.balance);
      setWalletId(wallet.id);
    }
  }, [wallet]);

  // ── Fetch nearby venues ───────────────────────────────────────────────────
  const { data: venues = [], isLoading: venuesLoading } = useQuery({
    queryKey: ['publicVenues', cityFilter],
    queryFn: () => bookingService.getPublicVenues(cityFilter ?? undefined),
    staleTime: 5 * 60 * 1000,
  });

  // ── Auto-scroll carousel ──────────────────────────────────────────────────
  useEffect(() => {
    const timer = setInterval(() => {
      const nextIndex = (autoScrollIndex.current + 1) % HERO_CARDS.length;
      autoScrollIndex.current = nextIndex;
      setActiveSlide(nextIndex);
      carouselRef.current?.scrollToIndex({ index: nextIndex, animated: true });
    }, 3500);
    return () => clearInterval(timer);
  }, []);

  const onCarouselScroll = (e: any) => {
    const idx = Math.round(e.nativeEvent.contentOffset.x / CAROUSEL_ITEM_WIDTH);
    autoScrollIndex.current = idx;
    setActiveSlide(idx);
  };

  return (
    <View className="flex-1 bg-background">


      <AppHeader hideSearch />

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 24 }}
      >
        {/* ─── Greeting ────────────────────────────────────────────────────── */}
        <View className="px-4 pt-3 pb-2">
          <Text className="text-muted-foreground text-sm">
            {getGreeting()}, {playerProfile?.full_name?.split(' ')[0] ?? 'Player'} 👋
          </Text>
          <Text className="text-foreground text-2xl font-black leading-tight">
            Ready to play?
          </Text>
        </View>

        {/* ─── Hero Carousel ────────────────────────────────────────────────── */}
        <View className="mt-2 mb-4">
          <FlatList
            ref={carouselRef}
            data={HERO_CARDS}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={onCarouselScroll}
            contentContainerStyle={{ paddingHorizontal: 16 }}
            getItemLayout={(_, index) => ({
              length: CAROUSEL_ITEM_WIDTH,
              offset: CAROUSEL_ITEM_WIDTH * index,
              index,
            })}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <LinearGradient
                colors={item.gradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{
                  width: CAROUSEL_ITEM_WIDTH,
                  borderRadius: 20,
                  padding: 20,
                  marginRight: 0,
                  height: 160,
                  justifyContent: 'space-between',
                }}
              >
                <View>
                  <Text style={{ fontSize: 36 }}>{item.emoji}</Text>
                  <Text
                    style={{
                      color: '#A7FF3F',
                      fontWeight: '900',
                      fontSize: 18,
                      marginTop: 8,
                    }}
                  >
                    {item.title}
                  </Text>
                  <Text style={{ color: '#FFFFFF99', fontSize: 12, marginTop: 4 }}>
                    {item.subtitle}
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={item.action}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 4,
                    alignSelf: 'flex-start',
                    backgroundColor: '#A7FF3F',
                    borderRadius: 100,
                    paddingHorizontal: 12,
                    paddingVertical: 6,
                  }}
                >
                  <Text style={{ color: '#0B1F3A', fontWeight: '800', fontSize: 12 }}>
                    {item.actionLabel}
                  </Text>
                  <ChevronRight size={12} color="#0B1F3A" strokeWidth={3} />
                </TouchableOpacity>
              </LinearGradient>
            )}
          />
          {/* Dot indicators */}
          <View className="flex-row justify-center gap-1.5 mt-3">
            {HERO_CARDS.map((_, idx) => (
              <View
                key={idx}
                className={`rounded-full transition-all ${
                  activeSlide === idx
                    ? 'w-4 h-2 bg-accent'
                    : 'w-2 h-2 bg-border'
                }`}
              />
            ))}
          </View>
        </View>

        {/* ─── Quick Actions ────────────────────────────────────────────────── */}
        <View className="px-4 mb-5">
          <Text className="text-foreground text-base font-black mb-3">Quick Actions</Text>
          <View className="flex-row flex-wrap gap-3">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <TouchableOpacity
                  key={action.id}
                  onPress={action.onPress}
                  activeOpacity={0.8}
                  className="flex-1 min-w-[40%] bg-card border border-border rounded-2xl p-4 items-center gap-2"
                  style={{ minWidth: (SCREEN_WIDTH - 56) / 2 }}
                >
                  <View
                    className="w-10 h-10 rounded-full items-center justify-center"
                    style={{ backgroundColor: action.color + '22' }}
                  >
                    <Icon size={20} color={action.color} strokeWidth={2} />
                  </View>
                  <Text className="text-foreground text-xs font-bold text-center">
                    {action.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* ─── Nearby Courts ────────────────────────────────────────────────── */}
        <View className="mb-5">
          <View className="flex-row items-center justify-between px-4 mb-3">
            <Text className="text-foreground text-base font-black">Nearby Courts</Text>
            <TouchableOpacity
              onPress={() => router.push('/(tabs)/play')}
              className="flex-row items-center gap-1"
            >
              <Text className="text-accent text-xs font-bold">See all</Text>
              <ChevronRight size={12} color={colors.accent} strokeWidth={2.5} />
            </TouchableOpacity>
          </View>

          {venuesLoading ? (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="px-4">
              <View className="flex-row gap-3">
                {[1, 2, 3].map((i) => (
                  <View key={i} style={{ width: 220 }}>
                    <SkeletonCard lines={4} />
                  </View>
                ))}
              </View>
            </ScrollView>
          ) : venues.length === 0 ? (
            <View className="mx-4 bg-card rounded-2xl p-6 items-center border border-border">
              <Text className="text-3xl mb-2">🏸</Text>
              <Text className="text-foreground font-bold">No courts yet</Text>
              <Text className="text-muted-foreground text-sm text-center mt-1">
                Courts will appear here once venues are added
              </Text>
            </View>
          ) : (
            <FlatList
              data={venues.slice(0, 6)}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 16 }}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <VenueCard
                  venue={item}
                  onPress={() =>
                    router.push({
                      pathname: '/courts/[venueId]',
                      params: { venueId: item.id },
                    })
                  }
                />
              )}
            />
          )}
        </View>

        {/* ─── Fast Selling Items (M14 placeholder) ────────────────────────── */}
        <View className="px-4">
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-foreground text-base font-black">Shop</Text>
            <View className="bg-muted rounded-full px-2 py-0.5">
              <Text className="text-muted-foreground text-[10px] font-bold uppercase tracking-wide">
                Coming M14
              </Text>
            </View>
          </View>
          <View className="flex-row gap-3">
            {['Badminton Shoes', 'Rackets', 'Shuttlecocks'].map((item) => (
              <View
                key={item}
                className="flex-1 bg-card border border-border rounded-2xl p-3 items-center gap-2 opacity-60"
              >
                <View className="w-10 h-10 rounded-full bg-muted items-center justify-center">
                  <ShoppingBag size={18} color={colors.mutedForeground} strokeWidth={2} />
                  <Lock
                    size={8}
                    color={colors.mutedForeground}
                    style={{ position: 'absolute', bottom: -2, right: -2 }}
                  />
                </View>
                <Text className="text-muted-foreground text-[10px] font-bold text-center">
                  {item}
                </Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}
