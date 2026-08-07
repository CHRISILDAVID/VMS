import { formatPhone } from '@vms/shared/utils';
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
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
import { useThemeColors } from '../../../hooks/useThemeColors';

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
  const { colors } = useThemeColors();

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
    setMPhone(formatPhone(initialMembers[idx].phone || ""));
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
      <View className="flex-1 justify-end">
        <TouchableOpacity className="absolute inset-0 bg-black/50" activeOpacity={1} onPress={onClose} />
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} className="max-h-[92%]">
          <View className="bg-card rounded-t-3xl max-h-full">
            <View className="items-center pt-3 pb-1">
              <View className="w-9 h-1 rounded-full bg-muted-foreground/30" />
            </View>
            <View className="flex-row justify-between items-center px-5 py-3 border-b border-border">
              <Text className="text-lg font-extrabold text-foreground">{isEdit ? 'Edit Slot' : 'Create Membership Slot'}</Text>
              <TouchableOpacity className="w-8 h-8 rounded-full bg-muted items-center justify-center" onPress={onClose}>
                <X size={18} color={colors.mutedForeground} />
              </TouchableOpacity>
            </View>

            <ScrollView className="p-5" showsVerticalScrollIndicator={false}>
              <Text className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Slot Name</Text>
              <TextInput
                className="bg-background border-[1.5px] border-border rounded-xl px-3.5 py-3 text-[15px] font-semibold text-foreground mb-4"
                placeholder="e.g. Morning Warriors"
                placeholderTextColor={colors.mutedForeground}
                value={name}
                onChangeText={setName}
              />

              <View className="flex-row gap-3">
                <View className="flex-1">
                  <Text className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Court</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4" contentContainerStyle={{ gap: 8 }}>
                    {courts?.map(c => (
                      <TouchableOpacity
                        key={c.id}
                        className={`px-4 py-2.5 rounded-lg border ${courtId === c.id ? 'bg-primary/10 border-primary' : 'bg-muted border-border'}`}
                        onPress={() => setCourtId(c.id)}
                      >
                        <Text className={`text-sm ${courtId === c.id ? 'text-primary font-bold' : 'text-muted-foreground'}`}>
                          {c.name}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              </View>

              <View className="flex-row gap-3">
                <View className="flex-1">
                  <Text className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Start Time (HH:MM)</Text>
                  <TextInput
                    className="bg-background border-[1.5px] border-border rounded-xl px-3.5 py-3 text-[15px] font-semibold text-foreground mb-4"
                    placeholder="06:00"
                    placeholderTextColor={colors.mutedForeground}
                    value={startTime}
                    onChangeText={setStartTime}
                  />
                </View>
                <View className="flex-1">
                  <Text className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">End Time (HH:MM)</Text>
                  <TextInput
                    className="bg-background border-[1.5px] border-border rounded-xl px-3.5 py-3 text-[15px] font-semibold text-foreground mb-4"
                    placeholder="08:00"
                    placeholderTextColor={colors.mutedForeground}
                    value={endTime}
                    onChangeText={setEndTime}
                  />
                </View>
              </View>

              <View className="flex-row gap-3">
                <View className="flex-1">
                  <Text className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Capacity</Text>
                  <TextInput
                    className="bg-background border-[1.5px] border-border rounded-xl px-3.5 py-3 text-[15px] font-semibold text-foreground mb-4"
                    placeholder="10"
                    placeholderTextColor={colors.mutedForeground}
                    keyboardType="number-pad"
                    value={capacity}
                    onChangeText={setCapacity}
                  />
                </View>
                <View className="flex-1">
                  <Text className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Monthly Fee (₹)</Text>
                  <TextInput
                    className="bg-background border-[1.5px] border-border rounded-xl px-3.5 py-3 text-[15px] font-semibold text-foreground mb-4"
                    placeholder="2500"
                    placeholderTextColor={colors.mutedForeground}
                    keyboardType="number-pad"
                    value={monthlyFee}
                    onChangeText={setMonthlyFee}
                  />
                </View>
              </View>

              <Text className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Skill Level</Text>
              <View className="flex-row flex-wrap gap-2 mb-4">
                {SKILLS.map(s => {
                  const sel = skillLevel === s.value;
                  return (
                    <TouchableOpacity
                      key={s.value}
                      className={`px-3.5 py-2 rounded-[20px] border-[1.5px] ${sel ? 'border-primary bg-primary/10' : 'border-border bg-background'}`}
                      onPress={() => setSkillLevel(s.value)}
                    >
                      <Text className={`text-[13px] font-semibold ${sel ? 'text-primary' : 'text-muted-foreground'}`}>{s.label}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <Text className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Playing Days</Text>
              <View className="flex-row gap-1.5 mb-4">
                {ALL_DAYS.map(d => {
                  const sel = playingDays.includes(d.value);
                  return (
                    <TouchableOpacity
                      key={d.value}
                      className={`flex-1 py-2 rounded-lg border-[1.5px] items-center ${sel ? 'border-primary bg-primary' : 'border-border bg-background'}`}
                      onPress={() => toggleDay(d.value)}
                    >
                      <Text className={`text-[11px] font-bold ${sel ? 'text-white' : 'text-muted-foreground'}`}>{d.label}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <View className="flex-row justify-between items-center p-3.5 bg-background rounded-xl mb-4 border border-border">
                <Text className="text-sm font-semibold text-foreground">Allow Guest Play</Text>
                <Switch
                  value={allowGuestPlay}
                  onValueChange={setAllowGuestPlay}
                  trackColor={{ false: colors.muted, true: colors.primary }}
                  thumbColor="#fff"
                />
              </View>

              {allowGuestPlay && (
                <View className="mb-4">
                  <Text className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Guest Play Fee (₹)</Text>
                  <TextInput
                    className="bg-background border-[1.5px] border-border rounded-xl px-3.5 py-3 text-[15px] font-semibold text-foreground mb-4"
                    placeholder="300"
                    placeholderTextColor={colors.mutedForeground}
                    keyboardType="number-pad"
                    value={guestPlayFee}
                    onChangeText={setGuestPlayFee}
                  />
                </View>
              )}

              {!isEdit && (
                <View className="mb-6">
                  <View className="flex-row justify-between items-center mb-3">
                    <View>
                      <Text className="text-sm font-extrabold text-foreground">Initial Members</Text>
                      <Text className="text-xs text-muted-foreground mt-0.5">
                        {capNumber > 0 ? `${initialMembers.length}/${capNumber} members added` : `${initialMembers.length} added`}
                        <Text className="text-muted-foreground/60"> · optional</Text>
                      </Text>
                    </View>
                    <TouchableOpacity
                      className={`flex-row items-center gap-1 px-3 py-1.5 border rounded-lg ${capNumber > 0 && initialMembers.length >= capNumber ? 'bg-muted border-border' : 'bg-primary/10 border-primary/20'}`}
                      onPress={() => {
                        setMName('');
                        setMPhone('');
                        setEditMemberIdx(null);
                        setShowAddMember(true);
                      }}
                      disabled={capNumber > 0 && initialMembers.length >= capNumber}
                    >
                      <Plus size={14} color={capNumber > 0 && initialMembers.length >= capNumber ? colors.mutedForeground : colors.primary} />
                      <Text className={`text-xs font-bold ${capNumber > 0 && initialMembers.length >= capNumber ? 'text-muted-foreground' : 'text-primary'}`}>
                        Add Member
                      </Text>
                    </TouchableOpacity>
                  </View>

                  {initialMembers.length === 0 ? (
                    <View className="border-[1.5px] border-dashed border-border rounded-xl p-5 items-center">
                      <Text className="text-[13px] font-semibold text-muted-foreground">No members added yet</Text>
                      <Text className="text-xs text-muted-foreground/70 mt-1">You can publish the slot without members</Text>
                    </View>
                  ) : (
                    <View className="gap-2">
                      {initialMembers.map((m, i) => (
                        <View key={i} className="flex-row items-center gap-3 p-3 bg-background rounded-xl border border-border">
                          <View className="w-9 h-9 rounded-lg bg-primary/10 items-center justify-center">
                            <Text className="text-sm font-extrabold text-primary">{m.name.charAt(0).toUpperCase()}</Text>
                          </View>
                          <View className="flex-1">
                            <Text className="text-[13px] font-bold text-foreground">{m.name}</Text>
                            <Text className="text-[11px] text-muted-foreground mt-0.5">{formatPhone(m.phone || "")}</Text>
                          </View>
                          <TouchableOpacity className="w-7 h-7 rounded-lg bg-card border border-border items-center justify-center" onPress={() => openEditMember(i)}>
                            <Edit2 size={13} color={colors.mutedForeground} />
                          </TouchableOpacity>
                          <TouchableOpacity
                            className="w-7 h-7 rounded-lg bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 items-center justify-center"
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
                className={`py-3.5 rounded-xl items-center mb-10 ${isSubmitting ? 'bg-muted' : 'bg-primary'}`}
                onPress={handleSubmit}
                disabled={isSubmitting}
              >
                <Text className={`text-[15px] font-bold ${isSubmitting ? 'text-muted-foreground' : 'text-white'}`}>
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
            <View className="flex-1 bg-black/50 justify-center p-5">
              <View className="bg-card rounded-[20px] overflow-hidden shadow-xl">
                <View className="flex-row justify-between items-center px-5 py-3.5 border-b border-border">
                  <Text className="text-base font-extrabold text-foreground">{editMemberIdx !== null ? 'Edit Member' : 'Add Member'}</Text>
                  <TouchableOpacity className="w-8 h-8 rounded-full bg-muted items-center justify-center" onPress={() => setShowAddMember(false)}>
                    <X size={16} color={colors.mutedForeground} />
                  </TouchableOpacity>
                </View>
                <View className="p-5">
                  <Text className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Full Name</Text>
                  <TextInput
                    className="bg-background border-[1.5px] border-border rounded-xl px-3.5 py-3 text-[15px] font-semibold text-foreground mb-4"
                    placeholder="e.g. Arjun Sharma"
                    placeholderTextColor={colors.mutedForeground}
                    value={mName}
                    onChangeText={setMName}
                  />

                  <Text className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Mobile Number</Text>
                  <TextInput
                    className="bg-background border-[1.5px] border-border rounded-xl px-3.5 py-3 text-[15px] font-semibold text-foreground mb-4"
                    placeholder="98765 43210"
                    placeholderTextColor={colors.mutedForeground}
                    keyboardType="phone-pad"
                    value={mPhone}
                    onChangeText={setMPhone}
                  />

                  <TouchableOpacity
                    className={`py-3.5 rounded-xl items-center ${(!mName.trim() || !mPhone.trim()) ? 'bg-muted' : 'bg-primary'}`}
                    onPress={handleSaveMember}
                    disabled={!mName.trim() || !mPhone.trim()}
                  >
                    <Text className={`text-[15px] font-bold ${(!mName.trim() || !mPhone.trim()) ? 'text-muted-foreground' : 'text-white'}`}>
                      {editMemberIdx !== null ? 'Save Changes' : 'Add Member'}
                    </Text>
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
