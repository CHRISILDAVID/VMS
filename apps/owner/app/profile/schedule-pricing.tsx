import React, { useState, useMemo, useRef } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Switch, TextInput, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ChevronLeft, Plus, Trash2, Copy, Clock } from 'lucide-react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import { createScheduleService, createVenuesService } from '@vms/shared/services';
import { useVenueStore } from '../../stores/venueStore';
import { DayOfWeek } from '@vms/shared/types';
import BottomSheet, { BottomSheetBackdrop, BottomSheetTextInput } from '@gorhom/bottom-sheet';
import { useThemeColors } from '../../hooks/useThemeColors';

const scheduleService = createScheduleService(supabase);
const venuesService = createVenuesService(supabase);
const DAYS: { key: DayOfWeek; label: string }[] = [
  { key: 'mon', label: 'Mon' },
  { key: 'tue', label: 'Tue' },
  { key: 'wed', label: 'Wed' },
  { key: 'thu', label: 'Thu' },
  { key: 'fri', label: 'Fri' },
  { key: 'sat', label: 'Sat' },
  { key: 'sun', label: 'Sun' },
];

export default function SchedulePricingScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { selectedVenueId } = useVenueStore();
  const { colors } = useThemeColors();
  
  const [selectedDay, setSelectedDay] = useState<DayOfWeek>('mon');
  const [isCopyMode, setIsCopyMode] = useState(false);
  const [selectedTargetDays, setSelectedTargetDays] = useState<DayOfWeek[]>([]);
  const [editingBlock, setEditingBlock] = useState<any>(null);

  const blockSheetRef = useRef<BottomSheet>(null);
  const [formData, setFormData] = useState({ start: '', end: '', price: '' });

  // Queries
  const { data: schedule, isLoading: scheduleLoading } = useQuery({
    queryKey: ['operating_schedule', selectedVenueId, selectedDay],
    queryFn: () => scheduleService.getOperatingSchedule(selectedVenueId!, selectedDay),
    enabled: !!selectedVenueId,
  });

  const { data: venueData, isLoading: venueLoading } = useQuery({
    queryKey: ['venue', selectedVenueId],
    queryFn: () => venuesService.getVenue(selectedVenueId!),
    enabled: !!selectedVenueId,
  });

  const isLoading = scheduleLoading || venueLoading;

  // Mutations
  const toggleScheduleMut = useMutation({
    mutationFn: (updates: { is_closed?: boolean; is_24h?: boolean }) => {
      const currentId = schedule?.id || undefined;
      return scheduleService.upsertOperatingSchedule({
        id: currentId,
        venue_id: selectedVenueId!,
        day_of_week: selectedDay,
        ...updates
      });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['operating_schedule', selectedVenueId, selectedDay] }),
    onError: (error: any) => Alert.alert('Error updating schedule', error.message || 'Unknown error')
  });

  const saveBlockMut = useMutation({
    mutationFn: () => {
      if (!schedule?.id) throw new Error("Schedule not initialized yet, please try again in a moment.");
      return scheduleService.upsertPricingBlock({
        id: editingBlock?.id,
        schedule_id: schedule.id,
        start_time: formData.start,
        end_time: formData.end,
        price_per_hour: parseFloat(formData.price) * 100, // store in paise
        is_active: true
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['operating_schedule', selectedVenueId, selectedDay] });
      blockSheetRef.current?.close();
      setEditingBlock(null);
    },
    onError: (error: any) => {
      Alert.alert('Error saving block', error.message || 'Unknown error');
    }
  });

  const deleteBlockMut = useMutation({
    mutationFn: (blockId: string) => scheduleService.deletePricingBlock(blockId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['operating_schedule', selectedVenueId, selectedDay] })
  });

  const updateVenueSettingsMut = useMutation({
    mutationFn: (updates: { min_slot_duration?: number; cancellation_hours?: number }) => {
      return venuesService.updateVenue(selectedVenueId!, updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['venue', selectedVenueId] });
      Alert.alert('Success', 'Booking settings updated');
    },
    onError: (error: any) => Alert.alert('Error updating settings', error.message || 'Unknown error')
  });

  const copyDayMut = useMutation({
    mutationFn: () => scheduleService.copyScheduleAndPricingToDays(selectedVenueId!, selectedDay, selectedTargetDays),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['operating_schedule'] });
      setIsCopyMode(false);
      setSelectedTargetDays([]);
      Alert.alert("Success", `Schedule copied to ${selectedTargetDays.length} days`);
    }
  });

  const handleOpenBlockSheet = (block?: any) => {
    if (!schedule?.id) {
      if (toggleScheduleMut.isPending) return;
      // Auto-initialize the schedule if it doesn't exist
      toggleScheduleMut.mutate({ is_closed: false, is_24h: false }, {
        onSuccess: () => {
          setEditingBlock(null);
          setFormData({ start: '06:00:00', end: '18:00:00', price: '500' });
          setTimeout(() => {
            blockSheetRef.current?.expand();
          }, 100);
        }
      });
      return;
    }
    if (block) {
      setEditingBlock(block);
      setFormData({ start: block.start_time, end: block.end_time, price: (block.price_per_hour / 100).toString() });
    } else {
      setEditingBlock(null);
      setFormData({ start: '06:00:00', end: '18:00:00', price: '500' });
    }
    blockSheetRef.current?.expand();
  };

  const renderBackdrop = useMemo(() => (props: any) => (
    <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} opacity={0.4} />
  ), []);

  return (
    <>
      <SafeAreaView className="flex-1 bg-background" edges={['top', 'bottom']}>
        {/* Header */}
        <View className="flex-row items-center px-4 py-3.5 bg-card border-b border-border">
          <TouchableOpacity onPress={() => router.back()} className="w-9 h-9 rounded-xl bg-muted border border-border items-center justify-center mr-3">
            <ChevronLeft size={20} color={colors.foreground} />
          </TouchableOpacity>
          <Text className="text-lg font-extrabold text-foreground">Schedule & Pricing</Text>
        </View>

        {/* Day Selector */}
        <View className="bg-card border-b border-border">
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 12, gap: 8 }}>
            {DAYS.map(day => {
              const isActive = selectedDay === day.key;
              return (
                <TouchableOpacity
                  key={day.key}
                  className={`py-2 px-4 rounded-full ${isActive ? 'bg-primary' : 'bg-muted'}`}
                  onPress={() => {
                    setSelectedDay(day.key);
                    setIsCopyMode(false);
                  }}
                >
                  <Text className={`text-[13px] font-semibold ${isActive ? 'text-primary-foreground' : 'text-muted-foreground'}`}>{day.label}</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {isLoading ? (
          <View className="flex-1 justify-center items-center">
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : (
          <ScrollView className="flex-1 p-4" contentContainerStyle={{ paddingBottom: 100 }}>
            <View className="bg-card rounded-2xl p-4 mb-5 border border-border">
              <View className="flex-row justify-between items-center py-2 border-b border-border">
                <View>
                  <Text className="text-[15px] font-semibold text-foreground">Closed on {DAYS.find(d => d.key === selectedDay)?.label}</Text>
                  <Text className="text-xs text-muted-foreground mt-0.5">No bookings accepted</Text>
                </View>
                <Switch 
                  value={schedule?.is_closed ?? false} 
                  onValueChange={(val) => toggleScheduleMut.mutate({ is_closed: val })} 
                  disabled={toggleScheduleMut.isPending}
                  trackColor={{ false: colors.border, true: colors.primary }}
                />
              </View>
              <View className="flex-row justify-between items-center py-2 pt-4">
                <View>
                  <Text className="text-[15px] font-semibold text-foreground">Open 24 Hours</Text>
                  <Text className="text-xs text-muted-foreground mt-0.5">Open all day, default pricing applies</Text>
                </View>
                <Switch 
                  value={schedule?.is_24h ?? false} 
                  onValueChange={(val) => toggleScheduleMut.mutate({ is_24h: val })}
                  disabled={toggleScheduleMut.isPending}
                  trackColor={{ false: colors.border, true: colors.primary }}
                />
              </View>
            </View>

            {/* Online Booking Settings */}
            <View className="bg-card rounded-2xl p-4 mb-5 border border-border">
              <View className="mb-3">
                <Text className="text-[15px] font-bold text-foreground">Online Booking Settings</Text>
              </View>
              
              <View className="mb-4">
                <Text className="text-xs font-semibold text-muted-foreground mb-1.5">Minimum Slot Duration (Minutes)</Text>
                <View className="flex-row flex-wrap gap-2 mt-2">
                  {[30, 60, 90, 120].map(duration => {
                    const isActive = venueData?.min_slot_duration === duration;
                    return (
                      <TouchableOpacity
                        key={duration}
                        className={`px-3 py-2 rounded-lg border ${isActive ? 'bg-primary/10 border-primary/30' : 'bg-muted border-border'}`}
                        onPress={() => updateVenueSettingsMut.mutate({ min_slot_duration: duration })}
                        disabled={updateVenueSettingsMut.isPending}
                      >
                        <Text className={`text-xs font-semibold ${isActive ? 'text-primary' : 'text-muted-foreground'}`}>
                          {duration} min
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              <View>
                <Text className="text-xs font-semibold text-muted-foreground mb-1.5">Free Cancellation Window (Hours)</Text>
                <View className="flex-row flex-wrap gap-2 mt-2">
                  {[0, 2, 6, 12, 24].map(hours => {
                    const isActive = venueData?.cancellation_hours === hours;
                    return (
                      <TouchableOpacity
                        key={hours}
                        className={`px-3 py-2 rounded-lg border ${isActive ? 'bg-primary/10 border-primary/30' : 'bg-muted border-border'}`}
                        onPress={() => updateVenueSettingsMut.mutate({ cancellation_hours: hours })}
                        disabled={updateVenueSettingsMut.isPending}
                      >
                        <Text className={`text-xs font-semibold ${isActive ? 'text-primary' : 'text-muted-foreground'}`}>
                          {hours === 0 ? 'No Cancel' : `${hours} hrs`}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            </View>

            {!(schedule?.is_closed || schedule?.is_24h) && (
              <View className="mb-6">
                <View className="flex-row justify-between items-center mb-3">
                  <Text className="text-[15px] font-bold text-foreground">Pricing Blocks</Text>
                  <TouchableOpacity 
                    className={`flex-row items-center gap-1 bg-primary/10 py-1.5 px-2.5 rounded-lg ${toggleScheduleMut.isPending ? 'opacity-70' : ''}`} 
                    onPress={() => handleOpenBlockSheet()}
                    disabled={toggleScheduleMut.isPending}
                  >
                    {toggleScheduleMut.isPending ? (
                      <ActivityIndicator size="small" color={colors.primary} />
                    ) : (
                      <>
                        <Plus size={14} color={colors.primary} />
                        <Text className="text-xs font-semibold text-primary">Add Block</Text>
                      </>
                    )}
                  </TouchableOpacity>
                </View>

                {schedule?.pricing_blocks?.length === 0 ? (
                  <View className="items-center justify-center p-6 bg-card rounded-2xl border border-dashed border-border">
                    <Clock size={24} color={colors.mutedForeground} />
                    <Text className="text-[13px] text-muted-foreground mt-2">No pricing blocks defined.</Text>
                  </View>
                ) : (
                  schedule?.pricing_blocks?.map(block => (
                    <TouchableOpacity 
                      key={block.id} 
                      className="flex-row justify-between items-center bg-card p-4 rounded-xl mb-2 border border-border"
                      onPress={() => handleOpenBlockSheet(block)}
                    >
                      <View>
                        <Text className="text-[15px] font-bold text-foreground">{block.start_time.slice(0,5)} - {block.end_time.slice(0,5)}</Text>
                        <Text className="text-[13px] text-muted-foreground mt-1">₹{block.price_per_hour / 100}/hr</Text>
                      </View>
                      <TouchableOpacity 
                        className="p-2"
                        onPress={() => Alert.alert("Delete", "Remove block?", [
                          { text: "Cancel" }, 
                          { text: "Delete", style: 'destructive', onPress: () => deleteBlockMut.mutate(block.id) }
                        ])}
                      >
                        <Trash2 size={16} color={colors.destructive} />
                      </TouchableOpacity>
                    </TouchableOpacity>
                  ))
                )}
              </View>
            )}

            {/* Copy Day Section */}
            {!isCopyMode ? (
              <TouchableOpacity className="flex-row items-center justify-center gap-2 p-4 bg-muted rounded-xl" onPress={() => setIsCopyMode(true)}>
                <Copy size={16} color={colors.mutedForeground} />
                <Text className="text-sm font-semibold text-muted-foreground">Copy this day's schedule</Text>
              </TouchableOpacity>
            ) : (
              <View className="bg-card p-4 rounded-2xl border border-border">
                <Text className="text-sm font-semibold text-foreground mb-3">Copy {DAYS.find(d => d.key === selectedDay)?.label} schedule to:</Text>
                <View className="flex-row flex-wrap gap-2 mb-4">
                  {DAYS.filter(d => d.key !== selectedDay).map(d => {
                    const isSelected = selectedTargetDays.includes(d.key);
                    return (
                      <TouchableOpacity 
                        key={d.key}
                        className={`py-2 px-3 rounded-lg border ${isSelected ? 'bg-primary/10 border-primary' : 'bg-muted border-border'}`}
                        onPress={() => {
                          if (isSelected) setSelectedTargetDays(prev => prev.filter(k => k !== d.key));
                          else setSelectedTargetDays(prev => [...prev, d.key]);
                        }}
                      >
                        <Text className={`text-xs font-semibold ${isSelected ? 'text-primary' : 'text-muted-foreground'}`}>{d.label}</Text>
                      </TouchableOpacity>
                    )
                  })}
                </View>
                <View className="flex-row gap-3">
                  <TouchableOpacity className="flex-1 p-3 items-center bg-muted rounded-lg" onPress={() => setIsCopyMode(false)}>
                    <Text className="text-sm font-semibold text-muted-foreground">Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    className={`flex-[2] p-3 items-center bg-primary rounded-lg ${selectedTargetDays.length === 0 ? 'opacity-50' : ''}`} 
                    disabled={selectedTargetDays.length === 0 || copyDayMut.isPending}
                    onPress={() => copyDayMut.mutate()}
                  >
                    {copyDayMut.isPending ? <ActivityIndicator size="small" color={colors.primaryForeground} /> : <Text className="text-sm font-semibold text-primary-foreground">Apply changes</Text>}
                  </TouchableOpacity>
                </View>
              </View>
            )}

          </ScrollView>
        )}

        {/* Pricing Block Modal */}
        <BottomSheet
          ref={blockSheetRef}
          snapPoints={['50%']}
          backdropComponent={renderBackdrop}
          index={-1}
          enablePanDownToClose={true}
          backgroundStyle={{ backgroundColor: colors.card }}
          handleIndicatorStyle={{ backgroundColor: colors.border }}
        >
          <View className="p-5">
            <Text className="text-lg font-bold text-foreground mb-5">{editingBlock ? 'Edit Block' : 'Add Pricing Block'}</Text>
            
            <View className="mb-4">
              <Text className="text-xs font-semibold text-muted-foreground mb-1.5">Start Time (HH:MM:SS)</Text>
              <BottomSheetTextInput 
                style={{ backgroundColor: colors.background, borderWidth: 1, borderColor: colors.border, padding: 12, borderRadius: 8, fontSize: 14, color: colors.foreground }} 
                value={formData.start} 
                onChangeText={t => setFormData({...formData, start: t})}
                placeholder="06:00:00"
                placeholderTextColor={colors.mutedForeground}
              />
            </View>
            
            <View className="mb-4">
              <Text className="text-xs font-semibold text-muted-foreground mb-1.5">End Time (HH:MM:SS)</Text>
              <BottomSheetTextInput 
                style={{ backgroundColor: colors.background, borderWidth: 1, borderColor: colors.border, padding: 12, borderRadius: 8, fontSize: 14, color: colors.foreground }} 
                value={formData.end} 
                onChangeText={t => setFormData({...formData, end: t})}
                placeholder="10:00:00"
                placeholderTextColor={colors.mutedForeground}
              />
            </View>

            <View className="mb-4">
              <Text className="text-xs font-semibold text-muted-foreground mb-1.5">Price per Hour (₹)</Text>
              <BottomSheetTextInput 
                style={{ backgroundColor: colors.background, borderWidth: 1, borderColor: colors.border, padding: 12, borderRadius: 8, fontSize: 14, color: colors.foreground }} 
                value={formData.price} 
                onChangeText={t => setFormData({...formData, price: t})}
                placeholder="500"
                placeholderTextColor={colors.mutedForeground}
                keyboardType="numeric"
              />
            </View>

            <TouchableOpacity 
              className="bg-primary p-3.5 rounded-lg items-center mt-2.5" 
              onPress={() => saveBlockMut.mutate()}
              disabled={saveBlockMut.isPending}
            >
              {saveBlockMut.isPending ? <ActivityIndicator color={colors.primaryForeground} /> : <Text className="text-sm font-semibold text-primary-foreground">Save Block</Text>}
            </TouchableOpacity>
          </View>
        </BottomSheet>
      </SafeAreaView>
    </>
  );
}
