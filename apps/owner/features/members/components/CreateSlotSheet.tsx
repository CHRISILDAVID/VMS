import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Switch,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { X, Plus, Trash2, Edit2 } from 'lucide-react-native';
import { MembershipSlotWithDetails } from '@vms/shared/services';
import { SkillLevel, DayOfWeek } from '@vms/shared/types';
import { useCreateSlot, useUpdateSlot, useMembershipSlots } from '../hooks/useMemberships';
import { useCourts } from '../../../hooks/useCourts';
import { useVenueStore } from '../../../stores/venueStore';
import { useCurrentVenue } from '../../../hooks/useVenues';

interface CreateSlotSheetProps {
  visible: boolean;
  onClose: () => void;
  slotToEdit?: MembershipSlotWithDetails | null;
}

const ALL_DAYS: { label: string; value: DayOfWeek }[] = [
  { label: 'Mon', value: 'mon' },
  { label: 'Tue', value: 'tue' },
  { label: 'Wed', value: 'wed' },
  { label: 'Thu', value: 'thu' },
  { label: 'Fri', value: 'fri' },
  { label: 'Sat', value: 'sat' },
  { label: 'Sun', value: 'sun' },
];

const SKILLS: { label: string; value: SkillLevel }[] = [
  { label: 'Beginner', value: 'beginner' },
  { label: 'Intermediate', value: 'intermediate' },
  { label: 'Advanced', value: 'advanced' },
  { label: 'Recreational', value: 'recreational' },
];

export function CreateSlotSheet({ visible, onClose, slotToEdit }: CreateSlotSheetProps) {
  const isEdit = !!slotToEdit;
  const createMutation = useCreateSlot();
  const updateMutation = useUpdateSlot();
  const { selectedVenueId } = useVenueStore();
  const currentVenue = useCurrentVenue();
  const { data: courts } = useCourts(selectedVenueId);
  const { data: existingSlots } = useMembershipSlots();

  const [name, setName] = useState('');
  const [startTime, setStartTime] = useState('06:00');
  const [endTime, setEndTime] = useState('08:00');
  const [capacity, setCapacity] = useState('10');
  const [monthlyFee, setMonthlyFee] = useState('2500');
  const [guestPlayFee, setGuestPlayFee] = useState('300');
  const [allowGuestPlay, setAllowGuestPlay] = useState(true);
  const [skillLevel, setSkillLevel] = useState<SkillLevel>('intermediate');
  const [playingDays, setPlayingDays] = useState<DayOfWeek[]>(['mon', 'wed', 'fri']);
  const [courtId, setCourtId] = useState<string>('');

  const [initialMembers, setInitialMembers] = useState<{ name: string; phone: string }[]>([]);
  const [showAddMember, setShowAddMember] = useState(false);
  const [editMemberIdx, setEditMemberIdx] = useState<number | null>(null);
  const [mName, setMName] = useState('');
  const [mPhone, setMPhone] = useState('');

  useEffect(() => {
    if (slotToEdit) {
      setName(slotToEdit.name || '');
      setStartTime(slotToEdit.start_time?.slice(0, 5) || currentVenue?.open_time?.slice(0, 5) || '06:00');
      setEndTime(slotToEdit.end_time?.slice(0, 5) || '08:00');
      setCapacity(String(slotToEdit.capacity || 10));
      setMonthlyFee(String((slotToEdit.monthly_fee || 0) / 100));
      setGuestPlayFee(String((slotToEdit.guest_play_fee || 0) / 100));
      setAllowGuestPlay(slotToEdit.allow_guest_play ?? true);
      setSkillLevel(slotToEdit.skill_level || 'intermediate');
      setPlayingDays(slotToEdit.playing_days || []);
      setCourtId(slotToEdit.court_id || '');
    } else {
      setName('');
      setStartTime(currentVenue?.open_time?.slice(0, 5) || '06:00');
      setEndTime('08:00');
      setCapacity('10');
      setMonthlyFee('2500');
      setGuestPlayFee('300');
      setAllowGuestPlay(true);
      setSkillLevel('intermediate');
      setPlayingDays(['mon', 'wed', 'fri']);
      setCourtId('');
      setInitialMembers([]);
    }
  }, [slotToEdit, visible, currentVenue?.open_time]);

  const toggleDay = (day: DayOfWeek) => {
    setPlayingDays(prev =>
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
  };

  const handleSaveMember = () => {
    if (!mName.trim() || !mPhone.trim()) {
      Alert.alert('Validation', 'Name and phone are required.');
      return;
    }
    if (!/^\d{10}$/.test(mPhone.trim())) {
      Alert.alert('Validation', 'Phone number must be exactly 10 digits.');
      return;
    }
    if (editMemberIdx !== null) {
      setInitialMembers(prev =>
        prev.map((m, i) => (i === editMemberIdx ? { name: mName.trim(), phone: mPhone.trim() } : m))
      );
    } else {
      setInitialMembers(prev => [...prev, { name: mName.trim(), phone: mPhone.trim() }]);
    }
    setShowAddMember(false);
    setMName('');
    setMPhone('');
    setEditMemberIdx(null);
  };

  const openEditMember = (idx: number) => {
    setMName(initialMembers[idx].name);
    setMPhone(initialMembers[idx].phone);
    setEditMemberIdx(idx);
    setShowAddMember(true);
  };

  const handleSubmit = () => {
    if (!name.trim()) {
      Alert.alert('Validation', 'Please enter a slot name.');
      return;
    }
    if (playingDays.length === 0) {
      Alert.alert('Validation', 'Please select at least one playing day.');
      return;
    }
    if (!courtId) {
      Alert.alert('Validation', 'Please select a court.');
      return;
    }

    const st = startTime + (startTime.length === 5 ? ':00' : '');
    const et = endTime + (endTime.length === 5 ? ':00' : '');

    if (existingSlots) {
      const isCollision = existingSlots.some(s => {
        if (isEdit && slotToEdit && s.id === slotToEdit.id) return false;
        if (s.court_id !== courtId) return false;
        const daysIntersect = s.playing_days.some(d => playingDays.includes(d));
        if (!daysIntersect) return false;
        return (st < (s.end_time || '') && et > (s.start_time || ''));
      });

      if (isCollision) {
        Alert.alert('Collision', 'Another membership slot is already assigned to this court during the selected timings and days.');
        return;
      }
    }

    const payload = {
      name: name.trim(),
      court_id: courtId,
      start_time: st,
      end_time: et,
      capacity: parseInt(capacity, 10) || 10,
      monthly_fee: Math.round((parseFloat(monthlyFee) || 0) * 100),
      guest_play_fee: Math.round((parseFloat(guestPlayFee) || 0) * 100),
      allow_guest_play: allowGuestPlay,
      skill_level: skillLevel,
      playing_days: playingDays,
      is_recruiting: true,
      is_published: true,
    };

    if (isEdit && slotToEdit) {
      updateMutation.mutate(
        { slotId: slotToEdit.id, data: payload },
        {
          onSuccess: () => {
            Alert.alert('Success', 'Slot updated successfully.');
            onClose();
          },
          onError: (err: any) => {
            Alert.alert('Error', err.message || 'Failed to update slot.');
          },
        }
      );
    } else {
      const formattedMembers = initialMembers.map(m => ({
        full_name: m.name,
        phone: m.phone,
      }));
      createMutation.mutate(
        { data: payload, initialMembers: formattedMembers },
        {
          onSuccess: () => {
            Alert.alert('Success', 'Slot created successfully.');
            onClose();
          },
          onError: (err: any) => {
            Alert.alert('Error', err.message || 'Failed to create slot.');
          },
        }
      );
    }
  };

  const isSubmitting = createMutation.isPending || updateMutation.isPending;
  const capNumber = parseInt(capacity, 10) || 0;

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose} />
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.sheetContainer}>
          <View style={styles.sheet}>
            <View style={styles.handleBar}><View style={styles.handle} /></View>
            <View style={styles.header}>
              <Text style={styles.title}>{isEdit ? 'Edit Slot' : 'Create Membership Slot'}</Text>
              <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
                <X size={18} color="#64748B" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
              <Text style={styles.label}>Slot Name</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. Morning Warriors"
                value={name}
                onChangeText={setName}
              />

              <View style={styles.row}>
                <View style={[styles.col, { flex: 1 }]}>
                  <Text style={styles.label}>Court</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.courtScroll} contentContainerStyle={styles.courtContainer}>
                    {courts?.map(c => (
                      <TouchableOpacity
                        key={c.id}
                        style={[styles.courtBtn, courtId === c.id && styles.courtBtnActive]}
                        onPress={() => setCourtId(c.id)}
                      >
                        <Text style={[styles.courtBtnText, courtId === c.id && styles.courtBtnTextActive]}>
                          {c.name}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              </View>

              <View style={styles.row}>
                <View style={styles.col}>
                  <Text style={styles.label}>Start Time (HH:MM)</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="06:00"
                    value={startTime}
                    onChangeText={setStartTime}
                  />
                </View>
                <View style={styles.col}>
                  <Text style={styles.label}>End Time (HH:MM)</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="08:00"
                    value={endTime}
                    onChangeText={setEndTime}
                  />
                </View>
              </View>

              <View style={styles.row}>
                <View style={styles.col}>
                  <Text style={styles.label}>Capacity</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="10"
                    keyboardType="number-pad"
                    value={capacity}
                    onChangeText={setCapacity}
                  />
                </View>
                <View style={styles.col}>
                  <Text style={styles.label}>Monthly Fee (₹)</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="2500"
                    keyboardType="number-pad"
                    value={monthlyFee}
                    onChangeText={setMonthlyFee}
                  />
                </View>
              </View>

              <Text style={styles.label}>Skill Level</Text>
              <View style={styles.chipsRow}>
                {SKILLS.map(s => {
                  const sel = skillLevel === s.value;
                  return (
                    <TouchableOpacity
                      key={s.value}
                      style={[styles.chip, sel && styles.chipSelected]}
                      onPress={() => setSkillLevel(s.value)}
                    >
                      <Text style={[styles.chipText, sel && styles.chipTextSelected]}>{s.label}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <Text style={styles.label}>Playing Days</Text>
              <View style={styles.daysRow}>
                {ALL_DAYS.map(d => {
                  const sel = playingDays.includes(d.value);
                  return (
                    <TouchableOpacity
                      key={d.value}
                      style={[styles.dayChip, sel && styles.dayChipSelected]}
                      onPress={() => toggleDay(d.value)}
                    >
                      <Text style={[styles.dayText, sel && styles.dayTextSelected]}>{d.label}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <View style={styles.switchRow}>
                <Text style={styles.switchLabel}>Allow Guest Play</Text>
                <Switch
                  value={allowGuestPlay}
                  onValueChange={setAllowGuestPlay}
                  trackColor={{ false: '#E2E8F0', true: '#2563EB' }}
                />
              </View>

              {allowGuestPlay && (
                <View style={{ marginBottom: 16 }}>
                  <Text style={styles.label}>Guest Play Fee (₹)</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="300"
                    keyboardType="number-pad"
                    value={guestPlayFee}
                    onChangeText={setGuestPlayFee}
                  />
                </View>
              )}

              {!isEdit && (
                <View style={styles.initSection}>
                  <View style={styles.initHeader}>
                    <View>
                      <Text style={styles.initTitle}>Initial Members</Text>
                      <Text style={styles.initSub}>
                        {capNumber > 0 ? `${initialMembers.length}/${capNumber} members added` : `${initialMembers.length} added`}
                        <Text style={{ color: '#94A3B8' }}> · optional</Text>
                      </Text>
                    </View>
                    <TouchableOpacity
                      style={[styles.addBtn, capNumber > 0 && initialMembers.length >= capNumber && styles.addBtnDisabled]}
                      onPress={() => {
                        setMName('');
                        setMPhone('');
                        setEditMemberIdx(null);
                        setShowAddMember(true);
                      }}
                      disabled={capNumber > 0 && initialMembers.length >= capNumber}
                    >
                      <Plus size={14} color={capNumber > 0 && initialMembers.length >= capNumber ? '#94A3B8' : '#2563EB'} />
                      <Text style={[styles.addBtnText, capNumber > 0 && initialMembers.length >= capNumber && { color: '#94A3B8' }]}>
                        Add Member
                      </Text>
                    </TouchableOpacity>
                  </View>

                  {initialMembers.length === 0 ? (
                    <View style={styles.emptyBox}>
                      <Text style={styles.emptyBoxTitle}>No members added yet</Text>
                      <Text style={styles.emptyBoxSub}>You can publish the slot without members</Text>
                    </View>
                  ) : (
                    <View style={styles.membersList}>
                      {initialMembers.map((m, i) => (
                        <View key={i} style={styles.memberRow}>
                          <View style={styles.avatar}>
                            <Text style={styles.avatarText}>{m.name.charAt(0).toUpperCase()}</Text>
                          </View>
                          <View style={styles.memberInfo}>
                            <Text style={styles.memberName}>{m.name}</Text>
                            <Text style={styles.memberPhone}>{m.phone}</Text>
                          </View>
                          <TouchableOpacity style={styles.iconAction} onPress={() => openEditMember(i)}>
                            <Edit2 size={13} color="#64748B" />
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={[styles.iconAction, { backgroundColor: '#FEF2F2', borderColor: '#FCA5A5' }]}
                            onPress={() => setInitialMembers(prev => prev.filter((_, j) => j !== i))}
                          >
                            <Trash2 size={13} color="#DC2626" />
                          </TouchableOpacity>
                        </View>
                      ))}
                    </View>
                  )}
                </View>
              )}

              <TouchableOpacity
                style={[styles.submitBtn, isSubmitting && styles.submitBtnDisabled]}
                onPress={handleSubmit}
                disabled={isSubmitting}
              >
                <Text style={styles.submitText}>
                  {isSubmitting
                    ? 'Saving...'
                    : isEdit
                    ? 'Save Changes'
                    : `Publish Slot${initialMembers.length > 0 ? ` with ${initialMembers.length} Member${initialMembers.length > 1 ? 's' : ''}` : ''}`}
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </View>

          <Modal visible={showAddMember} animationType="fade" transparent onRequestClose={() => setShowAddMember(false)}>
            <View style={styles.subOverlay}>
              <View style={styles.subSheet}>
                <View style={styles.header}>
                  <Text style={styles.title}>{editMemberIdx !== null ? 'Edit Member' : 'Add Member'}</Text>
                  <TouchableOpacity style={styles.closeBtn} onPress={() => setShowAddMember(false)}>
                    <X size={16} color="#64748B" />
                  </TouchableOpacity>
                </View>
                <View style={styles.content}>
                  <Text style={styles.label}>Full Name</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="e.g. Arjun Sharma"
                    value={mName}
                    onChangeText={setMName}
                  />

                  <Text style={styles.label}>Mobile Number</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="98765 43210"
                    keyboardType="phone-pad"
                    value={mPhone}
                    onChangeText={setMPhone}
                  />

                  <TouchableOpacity
                    style={[styles.submitBtn, (!mName.trim() || !mPhone.trim()) && styles.submitBtnDisabled]}
                    onPress={handleSaveMember}
                    disabled={!mName.trim() || !mPhone.trim()}
                  >
                    <Text style={styles.submitText}>{editMemberIdx !== null ? 'Save Changes' : 'Add Member'}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  sheetContainer: {
    maxHeight: '92%',
  },
  sheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '100%',
  },
  handleBar: {
    alignItems: 'center',
    paddingTop: 12,
    paddingBottom: 4,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#E2E8F0',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    padding: 20,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    fontWeight: '600',
    color: '#0F172A',
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  col: {
    flex: 1,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    backgroundColor: '#F8FAFC',
  },
  chipSelected: {
    borderColor: '#2563EB',
    backgroundColor: '#EFF6FF',
  },
  courtScroll: {
    marginBottom: 16,
  },
  courtContainer: {
    gap: 8,
  },
  courtBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  courtBtnActive: {
    backgroundColor: '#EEF2FF',
    borderColor: '#4F46E5',
  },
  courtBtnText: {
    fontSize: 14,
    color: '#64748B',
  },
  courtBtnTextActive: {
    color: '#4F46E5',
    fontWeight: '600',
  },
  chipText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
  },
  chipTextSelected: {
    color: '#2563EB',
  },
  daysRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 16,
  },
  dayChip: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
  },
  dayChipSelected: {
    borderColor: '#2563EB',
    backgroundColor: '#2563EB',
  },
  dayText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
  },
  dayTextSelected: {
    color: '#fff',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    marginBottom: 16,
  },
  switchLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0F172A',
  },
  initSection: {
    marginBottom: 24,
  },
  initHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  initTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
  },
  initSub: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    borderRadius: 10,
  },
  addBtnDisabled: {
    backgroundColor: '#F1F5F9',
    borderColor: '#E2E8F0',
  },
  addBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#2563EB',
  },
  emptyBox: {
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderStyle: 'dashed',
    borderRadius: 14,
    padding: 20,
    alignItems: 'center',
  },
  emptyBoxTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#94A3B8',
  },
  emptyBoxSub: {
    fontSize: 12,
    color: '#CBD5E1',
    marginTop: 4,
  },
  membersList: {
    gap: 8,
  },
  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#2563EB',
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  memberPhone: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 1,
  },
  iconAction: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitBtn: {
    backgroundColor: '#2563EB',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    marginBottom: 40,
  },
  submitBtnDisabled: {
    backgroundColor: '#E2E8F0',
  },
  submitText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
  subOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  subSheet: {
    backgroundColor: '#fff',
    borderRadius: 20,
    overflow: 'hidden',
  },
});
