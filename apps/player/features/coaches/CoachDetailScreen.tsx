import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, MessageCircle, MapPin, IndianRupee } from 'lucide-react-native';
import { useCoachDetail } from './useCoaches';
import { usePlayerThemeColors } from '../../hooks/usePlayerThemeColors';
import { SkeletonCard } from '../../components/ui/Skeleton';

export function CoachDetailScreen() {
  const { coachId } = useLocalSearchParams<{ coachId: string }>();
  const { colors } = usePlayerThemeColors();

  const { data: coach, isLoading } = useCoachDetail(coachId);

  const openWhatsApp = () => {
    // In a real app, the coach phone number would be part of the coach record or venue contact.
    // For now we'll just link to a generic placeholder.
    const message = encodeURIComponent(`Hi ${coach?.full_name}, I'm interested in booking a training session with you!`);
    Linking.openURL(`https://wa.me/?text=${message}`);
  };

  const initials = coach?.full_name
    ?.split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['bottom']}>
      {/* Header */}
      <View className="flex-row items-center px-4 py-3 gap-3">
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-9 h-9 rounded-full bg-muted items-center justify-center"
        >
          <ArrowLeft size={18} color={colors.foreground} strokeWidth={2} />
        </TouchableOpacity>
        <Text className="text-foreground font-black text-lg flex-1" numberOfLines={1}>
          Coach Profile
        </Text>
      </View>

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {isLoading ? (
          <View className="px-4 gap-3 mt-2">
            <SkeletonCard lines={6} />
          </View>
        ) : !coach ? (
          <View className="flex-1 items-center justify-center p-8">
            <Text className="text-foreground font-bold">Coach not found</Text>
          </View>
        ) : (
          <>
            {/* Header / Avatar info */}
            <View className="items-center px-4 py-6">
              <View className="w-28 h-28 rounded-full overflow-hidden mb-4 bg-muted items-center justify-center border-4 border-card shadow-sm">
                {coach.photo_url ? (
                  <Image source={{ uri: coach.photo_url }} className="w-full h-full" resizeMode="cover" />
                ) : (
                  <Text className="text-muted-foreground text-4xl font-black">{initials}</Text>
                )}
              </View>
              <Text className="text-foreground text-2xl font-black text-center">{coach.full_name}</Text>
              
              {coach.venue && (
                <View className="flex-row items-center gap-1.5 mt-2">
                  <MapPin size={14} color={colors.mutedForeground} strokeWidth={2} />
                  <Text className="text-muted-foreground text-sm font-semibold">{coach.venue.name}</Text>
                </View>
              )}
            </View>

            {/* Price Badge */}
            <View className="px-4 mb-6 flex-row justify-center">
              <View className="bg-accent/20 border border-accent/30 rounded-full px-4 py-2 flex-row items-center gap-1">
                <IndianRupee size={14} color={colors.accent} strokeWidth={2.5} />
                <Text className="text-accent font-black text-sm">
                  {Math.round(coach.price_per_session / 100)} / session
                </Text>
              </View>
            </View>

            {/* Specialties */}
            {coach.specialty && coach.specialty.length > 0 && (
              <View className="px-4 mb-6">
                <Text className="text-foreground font-bold mb-3">Specialties</Text>
                <View className="flex-row flex-wrap gap-2">
                  {coach.specialty.map((s) => (
                    <View key={s} className="bg-muted rounded-full px-3 py-1.5 border border-border">
                      <Text className="text-foreground text-xs font-semibold capitalize">{s}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* Bio */}
            {coach.bio && (
              <View className="px-4 mb-6">
                <Text className="text-foreground font-bold mb-3">About</Text>
                <Text className="text-muted-foreground text-sm leading-relaxed">{coach.bio}</Text>
              </View>
            )}
          </>
        )}
      </ScrollView>

      {/* Sticky CTA */}
      {coach && (
        <View className="absolute bottom-0 left-0 right-0 bg-background border-t border-border px-4 py-4">
          <TouchableOpacity
            className="bg-[#25D366] rounded-2xl py-4 items-center flex-row justify-center gap-2"
            activeOpacity={0.85}
            onPress={openWhatsApp}
          >
            <MessageCircle size={20} color="#FFFFFF" strokeWidth={2} />
            <Text className="text-white font-black text-base">Contact on WhatsApp</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}
