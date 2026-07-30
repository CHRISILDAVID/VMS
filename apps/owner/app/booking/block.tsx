import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, Check, Ban } from 'lucide-react-native';
import { format, parse } from 'date-fns';

import { useCourts } from '../../hooks/useCourts';
import { useVenueStore } from '../../stores/venueStore';
import { useBlockSlot } from '../../features/bookings/hooks/useBookings';
import { useAuthContext } from '../../contexts/AuthContext';
import { COLORS } from '@vms/shared/utils';

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
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity style={styles.backIconBtn} onPress={() => router.back()}>
            <ArrowLeft size={20} color="#0F172A" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Block Slot</Text>
        </View>
      </View>

      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView style={styles.body} keyboardShouldPersistTaps="handled">
          
          <View style={styles.infoBox}>
            <Ban size={24} color="#DC2626" style={{ marginBottom: 8 }} />
            <Text style={styles.infoTitle}>Block Court Availability</Text>
            <Text style={styles.infoDesc}>
              Blocking this court prevents anyone from booking it. Useful for maintenance, cleaning, or other manual overrides.
            </Text>
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Details</Text>
            <View style={styles.detailsBox}>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Court</Text>
                <Text style={styles.detailValue}>{court?.name || 'Unknown'}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Date</Text>
                <Text style={styles.detailValue}>{dateStr}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Start Time</Text>
                <Text style={styles.detailValue}>{startTimeStr.substring(0, 5)}</Text>
              </View>
            </View>
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Duration</Text>
            <View style={styles.durationsList}>
              {durationOptions.map((opt) => {
                const isActive = selectedDuration === opt.mins;
                return (
                  <TouchableOpacity
                    key={opt.mins}
                    style={[styles.durationCard, isActive && styles.durationCardActive]}
                    onPress={() => setSelectedDuration(opt.mins)}
                  >
                    <Text style={[styles.durationLabel, isActive && styles.durationLabelActive]}>
                      {opt.label}
                    </Text>
                    {isActive && <Check size={20} color="#DC2626" />}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Reason / Notes (Optional)</Text>
            <TextInput
              style={styles.notesInput}
              placeholder="e.g. Court cleaning, lights repair..."
              placeholderTextColor="#94A3B8"
              value={notes}
              onChangeText={setNotes}
              multiline
            />
          </View>
          
          <View style={{ height: 40 }} />
        </ScrollView>
      </KeyboardAvoidingView>

      <View style={styles.footer}>
        <TouchableOpacity 
          style={styles.primaryBtn} 
          onPress={handleBlock}
          disabled={blockSlotMutation.isPending}
        >
          {blockSlotMutation.isPending ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Ban size={20} color="#fff" />
              <Text style={styles.primaryBtnText}>Confirm Block</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: { 
    backgroundColor: '#fff', 
    paddingHorizontal: 16, 
    paddingTop: 12, 
    paddingBottom: 16, 
    borderBottomWidth: 1, 
    borderBottomColor: '#F1F5F9' 
  },
  headerTop: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  backIconBtn: { 
    width: 36, height: 36, 
    borderRadius: 10, 
    backgroundColor: '#F8FAFC', 
    borderWidth: 1, borderColor: '#E2E8F0', 
    alignItems: 'center', justifyContent: 'center' 
  },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#0F172A' },
  body: { flex: 1, padding: 16 },
  
  infoBox: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FCA5A5',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    alignItems: 'center',
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#991B1B',
    marginBottom: 6,
  },
  infoDesc: {
    fontSize: 13,
    color: '#991B1B',
    textAlign: 'center',
    lineHeight: 18,
  },

  fieldGroup: { marginBottom: 20 },
  label: { fontSize: 13, fontWeight: '700', color: '#0F172A', marginBottom: 10 },
  
  detailsBox: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 16,
    gap: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  detailLabel: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 14,
    color: '#0F172A',
    fontWeight: '600',
  },

  durationsList: { gap: 10 },
  durationCard: { 
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', 
    padding: 14, borderRadius: 14, borderWidth: 1.5, borderColor: '#E2E8F0', backgroundColor: '#fff' 
  },
  durationCardActive: { borderColor: '#DC2626', backgroundColor: '#FEF2F2' },
  durationLabel: { fontSize: 14, fontWeight: '600', color: '#0F172A' },
  durationLabelActive: { color: '#DC2626', fontWeight: '700' },
  
  notesInput: {
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    padding: 14,
    minHeight: 100,
    fontSize: 15,
    color: '#0F172A',
    textAlignVertical: 'top'
  },
  
  footer: { 
    padding: 16, 
    backgroundColor: '#fff', 
    borderTopWidth: 1, 
    borderTopColor: '#F1F5F9' 
  },
  primaryBtn: { 
    backgroundColor: '#DC2626', 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center', 
    height: 56, 
    borderRadius: 16, 
    gap: 10 
  },
  primaryBtnText: { fontSize: 16, fontWeight: '700', color: '#fff' },
});
