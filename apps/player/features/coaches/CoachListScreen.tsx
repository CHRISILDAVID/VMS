import React, { useState } from 'react';
import { View, Text, FlatList, TextInput, TouchableOpacity } from 'react-native';
import { Search, X } from 'lucide-react-native';
import { router } from 'expo-router';
import { useCoaches } from './useCoaches';
import { CoachCard } from '../../components/ui/CoachCard';
import { SkeletonCard } from '../../components/ui/Skeleton';
import { usePlayerThemeColors } from '../../hooks/usePlayerThemeColors';
import type { Coach } from '@vms/shared/types';

export function CoachListScreen() {
  const { colors } = usePlayerThemeColors();
  const [searchText, setSearchText] = useState('');
  
  const { data: allCoaches = [], isLoading, refetch, isRefetching } = useCoaches();

  const coaches: Coach[] = searchText.trim()
    ? allCoaches.filter((c) =>
        c.full_name.toLowerCase().includes(searchText.toLowerCase()) ||
        c.specialty?.some((s) => s.toLowerCase().includes(searchText.toLowerCase())) ||
        (c.venue && c.venue.name.toLowerCase().includes(searchText.toLowerCase()))
      )
    : allCoaches;

  return (
    <View className="flex-1 bg-background">
      {/* Search bar */}
      <View className="px-4 pb-3">
        <View className="flex-row items-center bg-muted rounded-2xl px-3 gap-2">
          <Search size={16} color={colors.mutedForeground} strokeWidth={2} />
          <TextInput
            className="flex-1 py-3 text-foreground text-sm"
            placeholder="Search coaches, specialties, or venues..."
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

      {/* Results */}
      {isLoading ? (
        <View className="px-4 flex-row flex-wrap">
          {[1, 2, 3, 4].map((i) => (
            <View key={i} style={{ width: '50%', padding: 4 }}>
              <SkeletonCard lines={4} />
            </View>
          ))}
        </View>
      ) : coaches.length === 0 ? (
        <View className="flex-1 items-center justify-center px-8">
          <Text className="text-4xl mb-3">🎓</Text>
          <Text className="text-foreground font-bold text-lg">No coaches found</Text>
          <Text className="text-muted-foreground text-sm text-center mt-2">
            {searchText
              ? `No coaches matching "${searchText}"`
              : 'No coaches are currently available'}
          </Text>
          {searchText && (
            <TouchableOpacity
              className="mt-4 bg-accent px-4 py-2 rounded-full"
              onPress={() => setSearchText('')}
            >
              <Text className="text-accent-foreground font-bold text-sm">Clear search</Text>
            </TouchableOpacity>
          )}
        </View>
      ) : (
        <FlatList
          data={coaches}
          numColumns={2}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingHorizontal: 12, paddingBottom: 16 }}
          refreshing={isRefetching}
          onRefresh={refetch}
          renderItem={({ item }) => (
            <CoachCard
              coach={item}
              onPress={() =>
                router.push({
                  pathname: '/coaches/[coachId]' as any,
                  params: { coachId: item.id },
                })
              }
            />
          )}
        />
      )}
    </View>
  );
}
