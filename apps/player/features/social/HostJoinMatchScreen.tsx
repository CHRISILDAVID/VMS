import React, { useState } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, ActivityIndicator,
} from 'react-native';
import { Plus } from 'lucide-react-native';
import { useQuery } from '@tanstack/react-query';
import { MatchCard } from '../../components/ui/MatchCard';
import { SkeletonCard } from '../../components/ui/Skeleton';
import { SegmentedControl } from '../../components/ui/SegmentedControl';
import { JoinMatchSheet } from './JoinMatchSheet';
import { HostMatchFlow } from './HostMatchFlow';
import { useUIStore } from '../../stores/uiStore';
import { usePlayerThemeColors } from '../../hooks/usePlayerThemeColors';
import { supabase } from '../../lib/supabase';
import { createSocialService } from '@vms/shared/services';
import { router } from 'expo-router';
import type { HostedMatchDiscovery, MatchFormat } from '@vms/shared/types';

const socialService = createSocialService(supabase);

const FORMAT_OPTIONS: Array<{ label: string; value: MatchFormat | 'all' }> = [
  { label: 'All', value: 'all' },
  { label: 'Singles', value: 'singles' },
  { label: 'Doubles', value: 'doubles' },
  { label: 'Mixed', value: 'mixed' },
];

/**
 * HostJoinMatchScreen
 *
 * "Matches" sub-tab in the Play tab.
 * - Discover: lists open hosted matches sorted by GPS distance
 * - My Matches: lists the current player's hosted matches
 * - FAB: Host a Match flow
 */
export function HostJoinMatchScreen() {
  const { colors } = usePlayerThemeColors();
  const { userCoords } = useUIStore();

  const [viewIndex, setViewIndex]       = useState(0); // 0=Discover 1=My Matches
  const [formatFilter, setFormatFilter] = useState<MatchFormat | 'all'>('all');
  const [selectedMatch, setSelectedMatch] = useState<HostedMatchDiscovery | null>(null);
  const [showHostFlow, setShowHostFlow]   = useState(false);

  // Discover — open matches sorted by distance
  const {
    data: openMatches = [],
    isLoading: openLoading,
    refetch: refetchOpen,
    isRefetching: openRefetching,
  } = useQuery({
    queryKey: ['open-matches', formatFilter, userCoords?.latitude, userCoords?.longitude],
    queryFn: () =>
      socialService.fetchOpenMatches(
        userCoords?.latitude ?? null,
        userCoords?.longitude ?? null,
        formatFilter === 'all' ? null : formatFilter,
      ),
    staleTime: 30_000,
    enabled: viewIndex === 0,
  });

  // My Matches
  const {
    data: myMatches = [],
    isLoading: myLoading,
    refetch: refetchMy,
    isRefetching: myRefetching,
  } = useQuery({
    queryKey: ['my-hosted-matches'],
    queryFn: () => socialService.fetchMyHostedMatches(),
    staleTime: 30_000,
    enabled: viewIndex === 1,
  });

  const isLoading   = viewIndex === 0 ? openLoading   : myLoading;
  const isRefreshing = viewIndex === 0 ? openRefetching : myRefetching;
  const matches      = viewIndex === 0 ? openMatches  : myMatches;
  const onRefresh    = viewIndex === 0 ? refetchOpen  : refetchMy;

  return (
    <View className="flex-1 bg-background">
      {/* Internal view selector */}
      <View className="px-4 pb-3 gap-3">
        <SegmentedControl
          segments={['Discover', 'My Matches']}
          selectedIndex={viewIndex}
          onChange={setViewIndex}
          variant="underline"
        />

        {/* Format filter chips (only for Discover) */}
        {viewIndex === 0 && (
          <View className="flex-row gap-2">
            {FORMAT_OPTIONS.map((opt) => (
              <TouchableOpacity
                key={opt.value}
                onPress={() => setFormatFilter(opt.value)}
                className={`px-3 py-1.5 rounded-full border ${
                  formatFilter === opt.value
                    ? 'bg-accent border-accent'
                    : 'bg-transparent border-border'
                }`}
              >
                <Text
                  className={`text-xs font-semibold ${
                    formatFilter === opt.value ? 'text-accent-foreground' : 'text-muted-foreground'
                  }`}
                >
                  {opt.label}
                </Text>
              </TouchableOpacity>
            ))}
            {userCoords && (
              <View className="flex-row items-center gap-1 ml-auto">
                <View className="w-1.5 h-1.5 rounded-full bg-success" />
                <Text className="text-muted-foreground text-xs">Nearby first</Text>
              </View>
            )}
          </View>
        )}
      </View>

      {/* Match list */}
      <FlatList
        data={matches}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
        onRefresh={onRefresh}
        refreshing={isRefreshing}
        ListEmptyComponent={
          isLoading ? (
            <View className="gap-3">
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
            </View>
          ) : (
            <View className="flex-1 items-center justify-center py-20">
              <Text className="text-4xl mb-4">🏸</Text>
              <Text className="text-foreground font-bold text-lg">
                {viewIndex === 0 ? 'No open matches' : 'No matches hosted yet'}
              </Text>
              <Text className="text-muted-foreground text-center mt-2 text-sm">
                {viewIndex === 0
                  ? 'Be the first! Tap + to host a match.'
                  : 'Host your first match by tapping the + button.'}
              </Text>
            </View>
          )
        }
        renderItem={({ item }) => (
          <MatchCard
            match={item}
            onPress={() => {
              if (viewIndex === 1) {
                // My match — go to detail screen
                router.push(`/social/match/${item.id}` as any);
              } else {
                // Discover — open join sheet
                setSelectedMatch(item);
              }
            }}
          />
        )}
      />

      {/* Host a Match FAB */}
      <TouchableOpacity
        onPress={() => setShowHostFlow(true)}
        className="absolute bottom-6 right-4 w-14 h-14 rounded-full bg-accent items-center justify-center shadow-lg"
        activeOpacity={0.85}
      >
        <Plus size={28} color="#0B1F3A" strokeWidth={2.5} />
      </TouchableOpacity>

      {/* Join match sheet */}
      {selectedMatch && (
        <JoinMatchSheet
          match={selectedMatch}
          onClose={() => setSelectedMatch(null)}
          onJoined={() => {
            setSelectedMatch(null);
            refetchOpen();
          }}
        />
      )}

      {/* Host match flow */}
      {showHostFlow && (
        <HostMatchFlow
          onClose={() => setShowHostFlow(false)}
          onPublished={() => {
            setShowHostFlow(false);
            setViewIndex(1);
            refetchMy();
          }}
        />
      )}
    </View>
  );
}
