import React, { useState, useRef } from 'react';
import {
  View, Text, Modal, TouchableOpacity, FlatList,
  TextInput, ScrollView, ActivityIndicator, Pressable,
  Image,
} from 'react-native';
import { X, Calendar, Clock, MapPin, Users, Swords, AlertCircle, Search } from 'lucide-react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format, parseISO } from 'date-fns';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { usePlayerThemeColors } from '../../hooks/usePlayerThemeColors';
import { supabase } from '../../lib/supabase';
import { createSocialService } from '@vms/shared/services';
import { createBookingPlayerService } from '@vms/shared/services';
import { usePlayerStore } from '../../stores/playerStore';
import type { PlayerDiscovery, MatchFormat } from '@vms/shared/types';

const socialService = createSocialService(supabase);
const bookingService = createBookingPlayerService(supabase);

type MatchFormatOption = MatchFormat;
const FORMAT_OPTIONS: MatchFormatOption[] = ['singles', 'doubles', 'mixed'];
const FORMAT_LABELS: Record<MatchFormat, string> = {
  singles: 'Singles',
  doubles: 'Doubles',
  mixed:   'Mixed',
};

interface ChallengeModalProps {
  targetPlayer: PlayerDiscovery;
  onClose: () => void;
  onSwitchToCourts: () => void;
}

/**
 * ChallengeModal
 *
 * Bottom-sheet modal for sending a challenge to one (or more) players.
 * Step 1: Pick a booking from the host's confirmed upcoming bookings.
 * Step 2: Choose match format and optionally add more players + description.
 */
export function ChallengeModal({ targetPlayer, onClose, onSwitchToCourts }: ChallengeModalProps) {
  const { colors } = usePlayerThemeColors();
  const queryClient = useQueryClient();
  const playerProfile = usePlayerStore((s) => s.playerProfile);

  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null);
  const [matchFormat, setMatchFormat]             = useState<MatchFormat>('singles');
  const [description, setDescription]             = useState('');
  const [additionalSearch, setAdditionalSearch]   = useState('');
  const [additionalPlayers, setAdditionalPlayers] = useState<PlayerDiscovery[]>([]);

  const targetInitials = targetPlayer.full_name
    .split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase();

  // Fetch the current player's upcoming bookings
  const playerId = usePlayerStore((s) => s.playerProfile?.id);
  const { data: myBookings = [], isLoading: bookingsLoading } = useQuery({
    queryKey: ['my-bookings-upcoming', playerId],
    queryFn: async () => {
      if (!playerId) return [];

      const { data, error } = await supabase
        .from('bookings')
        .select(`
          id, date, start_time, end_time, status,
          courts(name, venues(name))
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

  // Search for additional players
  const { data: searchResults = [], isLoading: searchLoading } = useQuery({
    queryKey: ['search-players-for-challenge', additionalSearch],
    queryFn: () => socialService.fetchPlayers({ search: additionalSearch }),
    enabled: additionalSearch.trim().length >= 2,
    staleTime: 30_000,
  });

  const sendMutation = useMutation({
    mutationFn: () =>
      socialService.sendChallenge({
        booking_id: selectedBookingId!,
        match_format: matchFormat,
        description: description || undefined,
        invited_player_ids: [
          targetPlayer.id,
          ...additionalPlayers.map((p) => p.id),
        ],
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-challenges-sent'] });
      onClose();
    },
  });

  const selectedBooking = myBookings.find((b: any) => b.id === selectedBookingId);

  const expiryLabel = selectedBooking
    ? `${selectedBooking.end_time?.substring(0, 5)} on ${format(parseISO(selectedBooking.date), 'MMM d')}`
    : null;

  const addPlayer = (player: PlayerDiscovery) => {
    if (!additionalPlayers.find((p) => p.id === player.id) && player.id !== targetPlayer.id) {
      setAdditionalPlayers((prev) => [...prev, player]);
    }
    setAdditionalSearch('');
  };

  const removeAdditional = (id: string) => {
    setAdditionalPlayers((prev) => prev.filter((p) => p.id !== id));
  };

  return (
    <Modal visible transparent animationType="slide" onRequestClose={onClose}>
      <Pressable
        className="flex-1 justify-end"
        style={{ backgroundColor: 'rgba(0,0,0,0.55)' }}
        onPress={onClose}
      >
        <Pressable onPress={(e) => e.stopPropagation()}>
          <View
            className="rounded-t-3xl border-t border-border shadow-lg"
            style={{ maxHeight: '90%', backgroundColor: colors.background }}
          >
            {/* Handle bar */}
            <View className="items-center pt-3 pb-1">
              <View className="w-10 h-1 rounded-full bg-muted" />
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ padding: 20, paddingBottom: 8 }}
              keyboardShouldPersistTaps="handled"
            >
              {/* Header */}
              <View className="flex-row items-center justify-between mb-5">
                <View className="flex-row items-center gap-3">
                  {targetPlayer.avatar_url ? (
                    <Image source={{ uri: targetPlayer.avatar_url }} className="w-10 h-10 rounded-full" />
                  ) : (
                    <View className="w-10 h-10 rounded-full bg-accent/20 items-center justify-center">
                      <Text className="text-accent font-bold">{targetInitials}</Text>
                    </View>
                  )}
                  <View>
                    <Text className="text-foreground font-bold text-base">
                      Challenge {targetPlayer.full_name.split(' ')[0]}
                    </Text>
                    {targetPlayer.player_id && (
                      <Text className="text-accent text-xs font-semibold">{targetPlayer.player_id}</Text>
                    )}
                  </View>
                </View>
                <TouchableOpacity
                  onPress={onClose}
                  className="w-8 h-8 rounded-full bg-muted items-center justify-center"
                >
                  <X size={16} color={colors.foreground} />
                </TouchableOpacity>
              </View>

              {/* Step 1: Select booking */}
              <Text className="text-foreground font-bold mb-3">Select Your Booking</Text>

              {bookingsLoading ? (
                <ActivityIndicator color={colors.accent} />
              ) : myBookings.length === 0 ? (
                <View className="bg-warning/10 rounded-2xl p-4 mb-4 flex-row items-start gap-3">
                  <AlertCircle size={20} color={colors.warning} strokeWidth={2} />
                  <View className="flex-1">
                    <Text className="text-foreground font-semibold text-sm mb-1">No upcoming bookings</Text>
                    <Text className="text-muted-foreground text-xs mb-3">
                      You need a confirmed court booking to send a challenge.
                    </Text>
                    <TouchableOpacity
                      onPress={onSwitchToCourts}
                      className="bg-primary rounded-xl py-2.5 px-4 self-start"
                    >
                      <Text className="text-primary-foreground font-bold text-sm">Book a Court</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ) : (
                <View className="gap-2 mb-4">
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

              {/* Step 2: Match format */}
              <Text className="text-foreground font-bold mb-3">Match Format</Text>
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

              {/* Add more players */}
              <Text className="text-foreground font-bold mb-2">Add More Players (optional)</Text>
              <View className="flex-row items-center bg-muted rounded-xl px-3 gap-2 mb-2">
                <Search size={14} color={colors.mutedForeground} />
                <TextInput
                  className="flex-1 py-2.5 text-foreground text-sm"
                  placeholder="Search players..."
                  placeholderTextColor={colors.mutedForeground}
                  value={additionalSearch}
                  onChangeText={setAdditionalSearch}
                />
              </View>

              {/* Search results dropdown */}
              {additionalSearch.trim().length >= 2 && (
                <Card noPadding className="mb-3 max-h-32 overflow-hidden">
                  {searchLoading ? (
                    <ActivityIndicator color={colors.accent} className="py-3" />
                  ) : (
                    <FlatList
                      data={searchResults.filter(
                        (r) => r.id !== targetPlayer.id && !additionalPlayers.find((p) => p.id === r.id)
                      ).slice(0, 5)}
                      keyExtractor={(r) => r.id}
                      scrollEnabled={false}
                      renderItem={({ item }) => (
                        <TouchableOpacity
                          onPress={() => addPlayer(item)}
                          className="flex-row items-center gap-2.5 px-3 py-2.5 border-b border-border/50"
                        >
                          <View className="w-7 h-7 rounded-full bg-muted items-center justify-center">
                            <Text className="text-foreground text-xs font-bold">
                              {item.full_name[0]}
                            </Text>
                          </View>
                          <Text className="text-foreground text-sm flex-1">{item.full_name}</Text>
                          {item.player_id && (
                            <Text className="text-accent text-xs">{item.player_id}</Text>
                          )}
                        </TouchableOpacity>
                      )}
                    />
                  )}
                </Card>
              )}

              {/* Added players chips */}
              {additionalPlayers.length > 0 && (
                <View className="flex-row flex-wrap gap-2 mb-3">
                  {additionalPlayers.map((p) => (
                    <TouchableOpacity
                      key={p.id}
                      onPress={() => removeAdditional(p.id)}
                      className="flex-row items-center gap-1.5 bg-accent/15 rounded-full px-3 py-1"
                    >
                      <Text className="text-accent text-xs font-semibold">{p.full_name.split(' ')[0]}</Text>
                      <X size={12} color={colors.accent} />
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              {/* Description */}
              <Text className="text-foreground font-bold mb-2">Message (optional)</Text>
              <TextInput
                className="bg-muted rounded-xl px-3 py-3 text-foreground text-sm mb-4"
                placeholder="Add a message to your challenge..."
                placeholderTextColor={colors.mutedForeground}
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={3}
              />

              {/* Expiry note */}
              {expiryLabel && (
                <Text className="text-muted-foreground text-xs text-center mb-4">
                  ⏱ This challenge expires at {expiryLabel}
                </Text>
              )}
            </ScrollView>

            {/* Send button */}
            <View className="px-5 pb-6 pt-2">
              <Button
                label={sendMutation.isPending ? 'Sending...' : 'Send Challenge'}
                variant="primary"
                onPress={() => sendMutation.mutate()}
                disabled={!selectedBookingId || sendMutation.isPending}
                leftIcon={<Swords size={18} color="#0B1F3A" strokeWidth={2.5} />}
              />
            </View>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
