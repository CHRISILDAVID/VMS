import React, { useState, useMemo, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, TextInput, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ChevronLeft, Plus, Trash2, Copy, Clock, CalendarDays } from 'lucide-react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import { createScheduleService } from '@vms/shared/services';
import { useVenueStore } from '../../stores/venueStore';
import { DayOfWeek } from '@vms/shared/types';
import { COLORS } from '@vms/shared/utils';
import BottomSheet, { BottomSheetModal, BottomSheetModalProvider, BottomSheetBackdrop } from '@gorhom/bottom-sheet';

const scheduleService = createScheduleService(supabase);
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
  
  const [selectedDay, setSelectedDay] = useState<DayOfWeek>('mon');
  const [isCopyMode, setIsCopyMode] = useState(false);
  const [selectedTargetDays, setSelectedTargetDays] = useState<DayOfWeek[]>([]);
  const [editingBlock, setEditingBlock] = useState<any>(null);

  const blockSheetRef = useRef<BottomSheetModal>(null);
  const [formData, setFormData] = useState({ start: '', end: '', price: '' });

  // Queries
  const { data: schedule, isLoading } = useQuery({
    queryKey: ['operating_schedule', selectedVenueId, selectedDay],
    queryFn: () => scheduleService.getOperatingSchedule(selectedVenueId!, selectedDay),
    enabled: !!selectedVenueId,
  });

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
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['operating_schedule', selectedVenueId, selectedDay] })
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
      blockSheetRef.current?.dismiss();
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
      // Auto-initialize the schedule if it doesn't exist
      toggleScheduleMut.mutate({ is_closed: false, is_24h: false }, {
        onSuccess: () => {
          setEditingBlock(null);
          setFormData({ start: '06:00:00', end: '18:00:00', price: '500' });
          blockSheetRef.current?.present();
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
    blockSheetRef.current?.present();
  };

  const renderBackdrop = useMemo(() => (props: any) => (
    <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} opacity={0.4} />
  ), []);

  return (
    <BottomSheetModalProvider>
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ChevronLeft size={20} color="#0F172A" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Schedule & Pricing</Text>
        </View>

        {/* Day Selector */}
        <View style={styles.daysWrapper}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.daysContainer}>
            {DAYS.map(day => {
              const isActive = selectedDay === day.key;
              return (
                <TouchableOpacity
                  key={day.key}
                  style={[styles.dayBadge, isActive && styles.dayBadgeActive]}
                  onPress={() => {
                    setSelectedDay(day.key);
                    setIsCopyMode(false);
                  }}
                >
                  <Text style={[styles.dayText, isActive && styles.dayTextActive]}>{day.label}</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#2563EB" />
          </View>
        ) : (
          <ScrollView style={styles.content} contentContainerStyle={{ paddingBottom: 100 }}>
            <View style={styles.card}>
              <View style={styles.switchRow}>
                <View>
                  <Text style={styles.switchTitle}>Closed on {DAYS.find(d => d.key === selectedDay)?.label}</Text>
                  <Text style={styles.switchSub}>No bookings accepted</Text>
                </View>
                <Switch 
                  value={schedule?.is_closed ?? false} 
                  onValueChange={(val) => toggleScheduleMut.mutate({ is_closed: val })} 
                  disabled={toggleScheduleMut.isPending}
                  trackColor={{ false: '#E2E8F0', true: '#2563EB' }}
                />
              </View>
              <View style={[styles.switchRow, { borderBottomWidth: 0, paddingTop: 16 }]}>
                <View>
                  <Text style={styles.switchTitle}>Open 24 Hours</Text>
                  <Text style={styles.switchSub}>Open all day, default pricing applies</Text>
                </View>
                <Switch 
                  value={schedule?.is_24h ?? false} 
                  onValueChange={(val) => toggleScheduleMut.mutate({ is_24h: val })}
                  disabled={toggleScheduleMut.isPending}
                  trackColor={{ false: '#E2E8F0', true: '#2563EB' }}
                />
              </View>
            </View>

            {!(schedule?.is_closed || schedule?.is_24h) && (
              <View style={styles.blocksSection}>
                <View style={styles.blocksHeaderRow}>
                  <Text style={styles.blocksTitle}>Pricing Blocks</Text>
                  <TouchableOpacity style={styles.addBlockBtn} onPress={() => handleOpenBlockSheet()}>
                    <Plus size={14} color="#2563EB" />
                    <Text style={styles.addBlockText}>Add Block</Text>
                  </TouchableOpacity>
                </View>

                {schedule?.pricing_blocks?.length === 0 ? (
                  <View style={styles.emptyBlocks}>
                    <Clock size={24} color="#94A3B8" />
                    <Text style={styles.emptyBlocksText}>No pricing blocks defined.</Text>
                  </View>
                ) : (
                  schedule?.pricing_blocks?.map(block => (
                    <TouchableOpacity 
                      key={block.id} 
                      style={styles.blockCard}
                      onPress={() => handleOpenBlockSheet(block)}
                    >
                      <View style={styles.blockInfo}>
                        <Text style={styles.blockTime}>{block.start_time.slice(0,5)} - {block.end_time.slice(0,5)}</Text>
                        <Text style={styles.blockPrice}>₹{block.price_per_hour / 100}/hr</Text>
                      </View>
                      <TouchableOpacity 
                        style={styles.delBtn}
                        onPress={() => Alert.alert("Delete", "Remove block?", [
                          { text: "Cancel" }, 
                          { text: "Delete", style: 'destructive', onPress: () => deleteBlockMut.mutate(block.id) }
                        ])}
                      >
                        <Trash2 size={16} color="#DC2626" />
                      </TouchableOpacity>
                    </TouchableOpacity>
                  ))
                )}
              </View>
            )}

            {/* Copy Day Section */}
            {!isCopyMode ? (
              <TouchableOpacity style={styles.copyBtn} onPress={() => setIsCopyMode(true)}>
                <Copy size={16} color="#64748B" />
                <Text style={styles.copyBtnText}>Copy this day's schedule</Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.copyModeContainer}>
                <Text style={styles.copyModeTitle}>Copy {DAYS.find(d => d.key === selectedDay)?.label} schedule to:</Text>
                <View style={styles.copyDaysGrid}>
                  {DAYS.filter(d => d.key !== selectedDay).map(d => {
                    const isSelected = selectedTargetDays.includes(d.key);
                    return (
                      <TouchableOpacity 
                        key={d.key}
                        style={[styles.copyDaySelect, isSelected && styles.copyDaySelectActive]}
                        onPress={() => {
                          if (isSelected) setSelectedTargetDays(prev => prev.filter(k => k !== d.key));
                          else setSelectedTargetDays(prev => [...prev, d.key]);
                        }}
                      >
                        <Text style={[styles.copyDaySelectText, isSelected && styles.copyDaySelectTextActive]}>{d.label}</Text>
                      </TouchableOpacity>
                    )
                  })}
                </View>
                <View style={styles.copyActions}>
                  <TouchableOpacity style={styles.copyCancelBtn} onPress={() => setIsCopyMode(false)}>
                    <Text style={styles.copyCancelText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.copyConfirmBtn, selectedTargetDays.length === 0 && { opacity: 0.5 }]} 
                    disabled={selectedTargetDays.length === 0 || copyDayMut.isPending}
                    onPress={() => copyDayMut.mutate()}
                  >
                    {copyDayMut.isPending ? <ActivityIndicator size="small" color="#fff" /> : <Text style={styles.copyConfirmText}>Apply changes</Text>}
                  </TouchableOpacity>
                </View>
              </View>
            )}

          </ScrollView>
        )}

        {/* Pricing Block Modal */}
        <BottomSheetModal
          ref={blockSheetRef}
          snapPoints={['50%']}
          backdropComponent={renderBackdrop}
        >
          <View style={styles.sheetContent}>
            <Text style={styles.sheetTitle}>{editingBlock ? 'Edit Block' : 'Add Pricing Block'}</Text>
            
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Start Time (HH:MM:SS)</Text>
              <TextInput 
                style={styles.input} 
                value={formData.start} 
                onChangeText={t => setFormData({...formData, start: t})}
                placeholder="06:00:00"
              />
            </View>
            
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>End Time (HH:MM:SS)</Text>
              <TextInput 
                style={styles.input} 
                value={formData.end} 
                onChangeText={t => setFormData({...formData, end: t})}
                placeholder="10:00:00"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Price per Hour (₹)</Text>
              <TextInput 
                style={styles.input} 
                value={formData.price} 
                onChangeText={t => setFormData({...formData, price: t})}
                placeholder="500"
                keyboardType="numeric"
              />
            </View>

            <TouchableOpacity 
              style={styles.saveBtn} 
              onPress={() => saveBlockMut.mutate()}
              disabled={saveBlockMut.isPending}
            >
              {saveBlockMut.isPending ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveBtnText}>Save Block</Text>}
            </TouchableOpacity>
          </View>
        </BottomSheetModal>
      </SafeAreaView>
    </BottomSheetModalProvider>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#0F172A' },
  daysWrapper: { backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  daysContainer: { paddingHorizontal: 16, paddingVertical: 12, gap: 8 },
  dayBadge: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20, backgroundColor: '#F1F5F9' },
  dayBadgeActive: { backgroundColor: '#2563EB' },
  dayText: { fontSize: 13, fontWeight: '600', color: '#64748B' },
  dayTextActive: { color: '#fff' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  content: { flex: 1, padding: 16 },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 20, borderWidth: 1, borderColor: '#F1F5F9' },
  switchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  switchTitle: { fontSize: 15, fontWeight: '600', color: '#0F172A' },
  switchSub: { fontSize: 12, color: '#94A3B8', marginTop: 2 },
  blocksSection: { marginBottom: 24 },
  blocksHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  blocksTitle: { fontSize: 15, fontWeight: '700', color: '#0F172A' },
  addBlockBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#EFF6FF', paddingVertical: 6, paddingHorizontal: 10, borderRadius: 8 },
  addBlockText: { fontSize: 12, fontWeight: '600', color: '#2563EB' },
  emptyBlocks: { alignItems: 'center', justifyContent: 'center', padding: 24, backgroundColor: '#fff', borderRadius: 16, borderWidth: 1, borderColor: '#F1F5F9', borderStyle: 'dashed' },
  emptyBlocksText: { fontSize: 13, color: '#94A3B8', marginTop: 8 },
  blockCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fff', padding: 16, borderRadius: 12, marginBottom: 8, borderWidth: 1, borderColor: '#F1F5F9' },
  blockInfo: {},
  blockTime: { fontSize: 15, fontWeight: '700', color: '#0F172A' },
  blockPrice: { fontSize: 13, color: '#64748B', marginTop: 4 },
  delBtn: { padding: 8 },
  copyBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, padding: 16, backgroundColor: '#F1F5F9', borderRadius: 12 },
  copyBtnText: { fontSize: 14, fontWeight: '600', color: '#64748B' },
  copyModeContainer: { backgroundColor: '#fff', padding: 16, borderRadius: 16, borderWidth: 1, borderColor: '#F1F5F9' },
  copyModeTitle: { fontSize: 14, fontWeight: '600', color: '#0F172A', marginBottom: 12 },
  copyDaysGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  copyDaySelect: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8, backgroundColor: '#F1F5F9', borderWidth: 1, borderColor: '#E2E8F0' },
  copyDaySelectActive: { backgroundColor: '#EFF6FF', borderColor: '#2563EB' },
  copyDaySelectText: { fontSize: 12, fontWeight: '600', color: '#64748B' },
  copyDaySelectTextActive: { color: '#2563EB' },
  copyActions: { flexDirection: 'row', gap: 12 },
  copyCancelBtn: { flex: 1, padding: 12, alignItems: 'center', backgroundColor: '#F1F5F9', borderRadius: 8 },
  copyCancelText: { fontSize: 14, fontWeight: '600', color: '#64748B' },
  copyConfirmBtn: { flex: 2, padding: 12, alignItems: 'center', backgroundColor: '#2563EB', borderRadius: 8 },
  copyConfirmText: { fontSize: 14, fontWeight: '600', color: '#fff' },
  sheetContent: { padding: 20 },
  sheetTitle: { fontSize: 18, fontWeight: '700', color: '#0F172A', marginBottom: 20 },
  formGroup: { marginBottom: 16 },
  formLabel: { fontSize: 12, fontWeight: '600', color: '#64748B', marginBottom: 6 },
  input: { backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#E2E8F0', padding: 12, borderRadius: 8, fontSize: 14, color: '#0F172A' },
  saveBtn: { backgroundColor: '#2563EB', padding: 14, borderRadius: 10, alignItems: 'center', marginTop: 10 },
  saveBtnText: { color: '#fff', fontSize: 14, fontWeight: '600' }
});
