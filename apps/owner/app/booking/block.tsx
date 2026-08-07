import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, Check, Ban } from 'lucide-react-native';
import { format, parse } from 'date-fns';

import { useCourts } from '../../hooks/useCourts';
import { useVenueStore } from '../../stores/venueStore';
import { useBlockSlot } from '../../features/bookings/hooks/useBookings';
import { useAuthContext } from '../../contexts/AuthContext';
import { useThemeColors } from '../../hooks/useThemeColors';

const durationOptions = [
  { label: '30 min', mins: 30 },
  { label: '1 hour', mins: 60 },
  { label: '1.5 hours', mins: 90 },
  { label: '2 hours', mins: 120 },
  { label: '2.5 hours', mins: 150 },
  { label: '3 hours', mins: 180 },
  { label: 'Half Day (6 hours)', mins: 360 },
  { label: 'Full Day (12 hours)', mins: 720 },
];

export default function BlockSlotScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ courtId?: string; date?: string; hour?: string }>();
  const { selectedVenueId } = useVenueStore();
  const { ownerProfile } = useAuthContext();
  const { colors } = useThemeColors();
  
  const { data: courts } = useCourts(selectedVenueId);
  const blockSlotMutation = useBlockSlot();

  const [selectedDuration, setSelectedDuration] = useState(60);
  const [notes, setNotes] = useState('');

  const courtId = params.courtId || '';
  const dateStr = params.date || format(new Date(), 'yyyy-MM-dd');
  const startHourStr = params.hour ? parseInt(params.hour, 10).toString().padStart(2, '0') : '07';
  const startTimeStr = `${startHourStr}:00:00`;
  
  const court = courts?.find(c => c.id === courtId);

  const handleBlock = () => {
    if (!selectedVenueId || !courtId || !ownerProfile?.id) {
      Alert.alert('Error', 'Missing required data (venue, court, or user context).');
      return;
    }

    // Calculate end time
    const startObj = parse(startTimeStr, 'HH:mm:ss', new Date());
    const endObj = new Date(startObj.getTime() + selectedDuration * 60000);
    const endTimeStr = format(endObj, 'HH:mm:ss');

    blockSlotMutation.mutate(
      {
        venue_id: selectedVenueId,
        court_id: courtId,
        date: dateStr,
        start_time: startTimeStr,
        end_time: endTimeStr,
        duration_minutes: selectedDuration,
        notes: notes.trim() || 'Blocked by owner',
        booked_by: ownerProfile.id,
      },
      {
        onSuccess: () => {
          Alert.alert('Success', 'Court has been blocked.');
          router.back();
        },
        onError: (err: any) => {
          if (err.code === 'OVERLAP_DETECTED' || err.message?.includes('OVERLAP_DETECTED')) {
            const conflict = err.conflicts?.[0];
            if (conflict) {
              Alert.alert('Booking Conflict', 'This slot is already booked.');
              const formattedTime = conflict.start_time.substring(0, 5);
              router.navigate({
                pathname: '/(tabs)/schedule',
                params: { conflictCourtId: conflict.court_id, conflictTime: formattedTime }
              });
            } else {
              Alert.alert('Error', 'Slot Overlap Detected! Another booking or membership exists during this time.');
            }
          } else {
            Alert.alert('Error', err.message || 'Failed to block slot.');
          }
        },
      }
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      {/* Header */}
      <View className="flex-row items-center gap-3 bg-card px-4 pt-3 pb-4 border-b border-border">
        <TouchableOpacity className="w-9 h-9 rounded-xl bg-muted border border-border items-center justify-center" onPress={() => router.back()}>
          <ArrowLeft size={20} color={colors.foreground} />
        </TouchableOpacity>
        <Text className="text-lg font-extrabold text-foreground">Block Slot</Text>
      </View>

      <KeyboardAvoidingView 
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView className="flex-1 p-4" keyboardShouldPersistTaps="handled">
          
          <View className="bg-red-50 dark:bg-red-900/30 border border-red-300 dark:border-red-800 rounded-xl p-4 mb-5 items-center">
            <Ban size={24} color="#DC2626" className="mb-2" />
            <Text className="text-base font-bold text-red-800 dark:text-red-500 mb-1.5">Block Court Availability</Text>
            <Text className="text-[13px] text-red-800 dark:text-red-400 text-center leading-5">
              Blocking this court prevents anyone from booking it. Useful for maintenance, cleaning, or other manual overrides.
            </Text>
          </View>

          <View className="mb-5">
            <Text className="text-[13px] font-bold text-foreground mb-2.5">Details</Text>
            <View className="bg-card rounded-xl border border-border p-4 gap-3">
              <View className="flex-row justify-between">
                <Text className="text-sm font-medium text-muted-foreground">Court</Text>
                <Text className="text-sm font-semibold text-foreground">{court?.name || 'Unknown'}</Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-sm font-medium text-muted-foreground">Date</Text>
                <Text className="text-sm font-semibold text-foreground">{dateStr}</Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-sm font-medium text-muted-foreground">Start Time</Text>
                <Text className="text-sm font-semibold text-foreground">{startTimeStr.substring(0, 5)}</Text>
              </View>
            </View>
          </View>

          <View className="mb-5">
            <Text className="text-[13px] font-bold text-foreground mb-2.5">Duration</Text>
            <View className="gap-2.5">
              {durationOptions.map((opt) => {
                const isActive = selectedDuration === opt.mins;
                return (
                  <TouchableOpacity
                    key={opt.mins}
                    className={`flex-row justify-between items-center p-3.5 rounded-xl border-[1.5px] ${isActive ? 'border-destructive bg-destructive/10' : 'border-border bg-card'}`}
                    onPress={() => setSelectedDuration(opt.mins)}
                  >
                    <Text className={`text-sm ${isActive ? 'font-bold text-destructive dark:text-red-500' : 'font-semibold text-foreground'}`}>
                      {opt.label}
                    </Text>
                    {isActive && <Check size={20} color="#DC2626" />}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          <View className="mb-5">
            <Text className="text-[13px] font-bold text-foreground mb-2.5">Reason / Notes (Optional)</Text>
            <TextInput
              className="bg-card border-[1.5px] border-border rounded-xl p-3.5 min-h-[100px] text-[15px] text-foreground"
              style={{ textAlignVertical: 'top' }}
              placeholder="e.g. Court cleaning, lights repair..."
              placeholderTextColor={colors.mutedForeground}
              value={notes}
              onChangeText={setNotes}
              multiline
            />
          </View>
          
          <View className="h-10" />
        </ScrollView>
      </KeyboardAvoidingView>

      <View className="p-4 bg-card border-t border-border">
        <TouchableOpacity 
          className="bg-destructive flex-row items-center justify-center h-14 rounded-2xl gap-2.5 shadow-sm"
          onPress={handleBlock}
          disabled={blockSlotMutation.isPending}
        >
          {blockSlotMutation.isPending ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <>
              <Ban size={20} color="#FFFFFF" />
              <Text className="text-base font-bold text-destructive-foreground">Confirm Block</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
