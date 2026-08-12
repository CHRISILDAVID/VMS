import React, { useState } from 'react';
import {
  View, Text, Modal, TouchableOpacity,
  ScrollView, ActivityIndicator, Pressable,
} from 'react-native';
import { X, AlertCircle, Plus } from 'lucide-react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format, parseISO } from 'date-fns';
import { Button } from '../../components/ui/Button';
import { SegmentedControl } from '../../components/ui/SegmentedControl';
import { usePlayerThemeColors } from '../../hooks/usePlayerThemeColors';
import { supabase } from '../../lib/supabase';
import { createSocialService, createBookingPlayerService } from '@vms/shared/services';
import type { MatchFormat, SkillLevelFilter } from '@vms/shared/types';
import { router } from 'expo-router';
import { usePlayerStore } from '../../stores/playerStore';

const socialService = createSocialService(supabase);
const bookingService = createBookingPlayerService(supabase);

const FORMAT_OPTIONS: MatchFormat[] = ['singles', 'doubles', 'mixed'];
const FORMAT_LABELS: Record<MatchFormat, string> = {
  singles: 'Singles',
  doubles: 'Doubles',
  mixed:   'Mixed',
};

const SKILL_OPTIONS: SkillLevelFilter[] = ['all', 'beginner', 'intermediate', 'advanced'];

interface HostMatchFlowProps {
  onClose: () => void;
  onPublished: () => void;
}

export function HostMatchFlow({ onClose, onPublished }: HostMatchFlowProps) {
  const { colors } = usePlayerThemeColors();
  const queryClient = useQueryClient();

  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null);
  const [matchFormat, setMatchFormat]             = useState<MatchFormat>('singles');
  const [skillLevel, setSkillLevel]               = useState<SkillLevelFilter>('all');
  const [visibility, setVisibility]               = useState<'public' | 'private'>('public');

  // Fetch upcoming bookings for this player to host on
  const playerId = usePlayerStore((s) => s.playerProfile?.id);
  const { data: myBookings = [], isLoading: bookingsLoading } = useQuery({
    queryKey: ['my-bookings-upcoming-host', playerId],
    queryFn: async () => {
      if (!playerId) return [];

      const { data, error } = await supabase
        .from('bookings')
        .select(`
          id, date, start_time, end_time, status,
          courts(name, venues(name, city))
        `)
        .eq('status', 'upcoming')
        .eq('booked_by', playerId)
        .gte('date', new Date().toISOString().split('T')[0])
        .order('date', { ascending: true })
        .limit(20);
      if (error) throw error;
      return (data ?? []) as any[];
    },
  });

  const publishMutation = useMutation({
    mutationFn: () => {
      const maxPlayers = matchFormat === 'singles' ? 2 : 4;
      return socialService.hostMatch({
        booking_id: selectedBookingId!,
        match_format: matchFormat,
        skill_level: skillLevel,
        max_players: maxPlayers,
        visibility: visibility,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-hosted-matches'] });
      onPublished();
    },
  });

  const selectedBooking = myBookings.find((b: any) => b.id === selectedBookingId);

  return (
    <Modal visible transparent animationType="slide" onRequestClose={onClose}>
      <Pressable
        className="flex-1 justify-end"
        style={{ backgroundColor: 'rgba(0,0,0,0.55)' }}
        onPress={onClose}
      >
        <Pressable onPress={(e) => e.stopPropagation()}>
          <View
            className="bg-card rounded-t-3xl"
            style={{ maxHeight: '90%' }}
          >
            {/* Handle bar */}
            <View className="items-center pt-3 pb-1">
              <View className="w-10 h-1 rounded-full bg-muted" />
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ padding: 20, paddingBottom: 8 }}
            >
              {/* Header */}
              <View className="flex-row items-center justify-between mb-6">
                <Text className="text-foreground font-bold text-xl">Host a Match</Text>
                <TouchableOpacity
                  onPress={onClose}
                  className="w-8 h-8 rounded-full bg-muted items-center justify-center"
                >
                  <X size={16} color={colors.foreground} />
                </TouchableOpacity>
              </View>

              {/* Step 1: Booking */}
              <Text className="text-foreground font-bold mb-3">1. Select Your Booking</Text>
              {bookingsLoading ? (
                <ActivityIndicator color={colors.accent} />
              ) : myBookings.length === 0 ? (
                <View className="bg-warning/10 rounded-2xl p-4 mb-4 flex-row items-start gap-3">
                  <AlertCircle size={20} color={colors.warning} strokeWidth={2} />
                  <View className="flex-1">
                    <Text className="text-foreground font-semibold text-sm mb-1">No upcoming bookings</Text>
                    <Text className="text-muted-foreground text-xs mb-3">
                      You need a confirmed court booking to host a match.
                    </Text>
                    <TouchableOpacity
                      onPress={() => {
                        onClose();
                        router.push({ pathname: '/(tabs)/play', params: { tab: 'courts' } });
                      }}
                      className="bg-primary rounded-xl py-2.5 px-4 self-start"
                    >
                      <Text className="text-primary-foreground font-bold text-sm">Book a Court</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ) : (
                <View className="gap-2 mb-6">
                  {myBookings.map((booking: any) => {
                    const isSelected = selectedBookingId === booking.id;
                    const courtName = booking.courts?.name ?? 'Court';
                    const venueName = booking.courts?.venues?.name ?? 'Venue';
                    const dateLabel = format(parseISO(booking.date), 'EEE, MMM d');
                    const timeLabel = `${booking.start_time?.substring(0, 5)} – ${booking.end_time?.substring(0, 5)}`;

                    return (
                      <TouchableOpacity
                        key={booking.id}
                        onPress={() => setSelectedBookingId(booking.id)}
                        className={`p-3.5 rounded-2xl border ${
                          isSelected
                            ? 'border-accent bg-accent/10'
                            : 'border-border bg-muted/50'
                        }`}
                      >
                        <Text className="text-foreground font-semibold text-sm" numberOfLines={1}>
                          {venueName} — {courtName}
                        </Text>
                        <Text className="text-muted-foreground text-xs mt-0.5">
                          {dateLabel} · {timeLabel}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              )}

              {/* Step 2: Details */}
              <View className="opacity-100" style={{ opacity: selectedBookingId ? 1 : 0.4 }} pointerEvents={selectedBookingId ? 'auto' : 'none'}>
                <Text className="text-foreground font-bold mb-3">2. Match Details</Text>
                
                <Text className="text-muted-foreground text-xs font-semibold mb-2 uppercase">Format</Text>
                <View className="flex-row gap-2 mb-4">
                  {FORMAT_OPTIONS.map((fmt) => (
                    <TouchableOpacity
                      key={fmt}
                      onPress={() => setMatchFormat(fmt)}
                      className={`flex-1 py-2.5 rounded-xl border ${
                        matchFormat === fmt
                          ? 'bg-primary border-primary'
                          : 'bg-transparent border-border'
                      }`}
                    >
                      <Text
                        className={`text-center text-sm font-semibold ${
                          matchFormat === fmt ? 'text-primary-foreground' : 'text-foreground'
                        }`}
                      >
                        {FORMAT_LABELS[fmt]}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <Text className="text-muted-foreground text-xs font-semibold mb-2 uppercase">Skill Level</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4" contentContainerStyle={{ gap: 8 }}>
                  {SKILL_OPTIONS.map((skill) => (
                    <TouchableOpacity
                      key={skill}
                      onPress={() => setSkillLevel(skill)}
                      className={`px-4 py-2 rounded-full border ${
                        skillLevel === skill
                          ? 'bg-accent border-accent'
                          : 'bg-transparent border-border'
                      }`}
                    >
                      <Text
                        className={`text-sm font-semibold capitalize ${
                          skillLevel === skill ? 'text-accent-foreground' : 'text-foreground'
                        }`}
                      >
                        {skill}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>

                <Text className="text-muted-foreground text-xs font-semibold mb-2 uppercase">Visibility</Text>
                <View className="flex-row gap-2 mb-6">
                  {(['public', 'private'] as const).map((vis) => (
                    <TouchableOpacity
                      key={vis}
                      onPress={() => setVisibility(vis)}
                      className={`flex-1 py-2.5 rounded-xl border ${
                        visibility === vis
                          ? 'bg-primary border-primary'
                          : 'bg-transparent border-border'
                      }`}
                    >
                      <Text
                        className={`text-center text-sm font-semibold capitalize ${
                          visibility === vis ? 'text-primary-foreground' : 'text-foreground'
                        }`}
                      >
                        {vis}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

              </View>
            </ScrollView>

            {/* Action */}
            <View className="px-5 pb-6 pt-2">
              <Button
                label={publishMutation.isPending ? 'Publishing...' : 'Publish Match'}
                variant="primary"
                disabled={!selectedBookingId || publishMutation.isPending}
                onPress={() => publishMutation.mutate()}
                leftIcon={!publishMutation.isPending && <Plus size={18} color="#0B1F3A" strokeWidth={2.5} />}
              />
            </View>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
