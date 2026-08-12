import React, { useState, useCallback } from 'react';
import {
  View, Text, FlatList, TextInput,
  TouchableOpacity, ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { Search, X, SlidersHorizontal, Users } from 'lucide-react-native';
import { useQuery } from '@tanstack/react-query';
import { PlayerCard } from '../../components/ui/PlayerCard';
import { SkeletonCard } from '../../components/ui/Skeleton';
import { Badge } from '../../components/ui/Badge';
import { ChallengeModal } from './ChallengeModal';
import { useRouter } from 'expo-router';
import { useUIStore } from '../../stores/uiStore';
import { usePlayerThemeColors } from '../../hooks/usePlayerThemeColors';
import { supabase } from '../../lib/supabase';
import { createSocialService } from '@vms/shared/services';
import type { PlayerDiscovery } from '@vms/shared/types';

const socialService = createSocialService(supabase);

type GenderFilter = 'all' | 'male' | 'female' | 'other';

const GENDER_OPTIONS: { label: string; value: GenderFilter }[] = [
  { label: 'All', value: 'all' },
  { label: 'Male', value: 'male' },
  { label: 'Female', value: 'female' },
  { label: 'Other', value: 'other' },
];

/**
 * FindPlayersScreen
 *
 * Player discovery list sub-tab (Play → Players).
 * Players are fetched via the get_players_with_distance RPC and sorted by GPS distance.
 */
export function FindPlayersScreen() {
  const router = useRouter();
  const { colors, isDark } = usePlayerThemeColors();
  const { userCoords } = useUIStore();

  const [search, setSearch]           = useState('');
  const [genderFilter, setGenderFilter] = useState<GenderFilter>('all');
  const [challengeTarget, setChallengeTarget] = useState<PlayerDiscovery | null>(null);

  // Debounced search — React Query will re-fetch when the key changes
  const queryKey = ['players', search, genderFilter, userCoords?.latitude, userCoords?.longitude];

  const { data: players = [], isLoading, refetch, isRefetching } = useQuery({
    queryKey,
    queryFn: () =>
      socialService.fetchPlayers(
        {
          search:    search || undefined,
          gender:    genderFilter === 'all' ? undefined : genderFilter,
          radiusKm:  50,
        },
        userCoords?.latitude ?? null,
        userCoords?.longitude ?? null,
      ),
    staleTime: 60_000,
  });

  const handlePlayerPress = useCallback((player: PlayerDiscovery) => {
    router.push(`/social/player/${player.id}` as any);
  }, []);

  const handleChallengePress = useCallback((player: PlayerDiscovery) => {
    setChallengeTarget(player);
  }, []);

  return (
    <View className="flex-1 bg-background">
      {/* Search bar */}
      <View className="px-4 pb-3 gap-3">
        <View className="flex-row items-center bg-muted rounded-2xl px-3 gap-2">
          <Search size={16} color={colors.mutedForeground} strokeWidth={2} />
          <TextInput
            className="flex-1 py-3 text-foreground text-sm"
            placeholder="Search by name or Player ID..."
            placeholderTextColor={colors.mutedForeground}
            value={search}
            onChangeText={setSearch}
            returnKeyType="search"
            autoCorrect={false}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <X size={16} color={colors.mutedForeground} />
            </TouchableOpacity>
          )}
        </View>

        {/* Gender filter chips */}
        <View className="flex-row gap-2">
          {GENDER_OPTIONS.map((opt) => (
            <TouchableOpacity
              key={opt.value}
              onPress={() => setGenderFilter(opt.value)}
              className={`px-3 py-1.5 rounded-full border ${
                genderFilter === opt.value
                  ? 'bg-accent border-accent'
                  : 'bg-transparent border-border'
              }`}
            >
              <Text
                className={`text-xs font-semibold ${
                  genderFilter === opt.value ? 'text-accent-foreground' : 'text-muted-foreground'
                }`}
              >
                {opt.label}
              </Text>
            </TouchableOpacity>
          ))}
          {userCoords && (
            <View className="flex-row items-center gap-1 ml-auto">
              <View className="w-1.5 h-1.5 rounded-full bg-success" />
              <Text className="text-muted-foreground text-xs">GPS active</Text>
            </View>
          )}
        </View>
      </View>

      <FlatList
        data={players}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        onRefresh={refetch}
        refreshing={isRefetching}
        ListEmptyComponent={
          isLoading ? (
            <View className="gap-3">
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
            </View>
          ) : (
            <View className="flex-1 items-center justify-center py-20">
              <Text className="text-4xl mb-4">🏸</Text>
              <Text className="text-foreground font-bold text-lg">No players found</Text>
              <Text className="text-muted-foreground text-center mt-2 text-sm">
                {search
                  ? 'Try a different name or Player ID'
                  : 'No players nearby yet. Try increasing your search radius.'}
              </Text>
            </View>
          )
        }
        renderItem={({ item }) => (
          <PlayerCard
            player={item}
            onPress={() => handlePlayerPress(item)}
            onChallenge={() => handleChallengePress(item)}
          />
        )}
      />

      {/* Challenge modal (bottom sheet) */}
      {challengeTarget && (
        <ChallengeModal
          targetPlayer={challengeTarget}
          onClose={() => setChallengeTarget(null)}
          onSwitchToCourts={() => {
            setChallengeTarget(null);
            router.push({ pathname: '/(tabs)/play', params: { tab: 'courts' } });
          }}
        />
      )}
    </View>
  );
}
