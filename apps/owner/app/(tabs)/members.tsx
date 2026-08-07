import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Plus } from 'lucide-react-native';
import { useLocalSearchParams } from 'expo-router';
import { MembershipSlotWithDetails } from '@vms/shared/services';
import { useMembershipSlots, useApplications, useGuestPlays } from '../../features/members/hooks/useMemberships';
import { SummaryCards } from '../../features/members/components/SummaryCards';
import { SlotsTab } from '../../features/members/components/SlotsTab';
import { ApplicationsTab } from '../../features/members/components/ApplicationsTab';
import { GuestPlayTab } from '../../features/members/components/GuestPlayTab';
import { MembersListTab } from '../../features/members/components/MembersListTab';
import { SlotMembersView } from '../../features/members/components/SlotMembersView';
import { CreateSlotSheet } from '../../features/members/components/CreateSlotSheet';
import { VenueSelector } from '../../components/domain/VenueSelector';

const TABS = ['Slots', 'Applications', 'Guest Play', 'Members'] as const;
type Tab = typeof TABS[number];

export default function MembersScreen() {
  const [tab, setTab] = useState<Tab>('Slots');
  const [createOpen, setCreateOpen] = useState(false);
  const [editingSlot, setEditingSlot] = useState<MembershipSlotWithDetails | null>(null);
  const [viewingSlot, setViewingSlot] = useState<MembershipSlotWithDetails | null>(null);

  const { data: slots = [] } = useMembershipSlots();
  const { data: applications = [] } = useApplications();
  const { data: upcomingGuestPlays = [] } = useGuestPlays('upcoming');

  const params = useLocalSearchParams<{ slotId?: string }>();
  const [handledParamId, setHandledParamId] = useState<string | null>(null);

  useEffect(() => {
    if (params.slotId && params.slotId !== handledParamId && slots.length > 0) {
      const found = slots.find(s => s.id === params.slotId);
      if (found) {
        setViewingSlot(found);
        setHandledParamId(params.slotId);
      }
    }
  }, [params.slotId, handledParamId, slots]);

  const pendingAppsCount = applications.filter(a => a.status === 'pending' || a.status === 'invited_guest' || !a.status).length;
  const upcomingGuestCount = upcomingGuestPlays.length;

  if (viewingSlot) {
    const latestSlot = slots.find(s => s.id === viewingSlot.id) || viewingSlot;
    return (
      <SafeAreaView className="flex-1 bg-background" edges={['top']}>
        <SlotMembersView
          slot={latestSlot}
          allSlots={slots}
          onBack={() => setViewingSlot(null)}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      {/* Header */}
      <View className="bg-card px-4 pt-3 pb-3 border-b border-border">
        <View className="flex-row justify-between items-center mb-3">
          <Text className="text-2xl font-extrabold text-foreground">Membership</Text>
          <VenueSelector />
        </View>

        {/* Tabs */}
        <View className="flex-row">
          {TABS.map(t => {
            const badge = t === 'Applications' ? pendingAppsCount : t === 'Guest Play' ? upcomingGuestCount : 0;
            const isSelected = tab === t;

            return (
              <TouchableOpacity
                key={t}
                className={`flex-1 py-3 items-center border-b-2 -mb-[1px] ${isSelected ? 'border-primary' : 'border-transparent'}`}
                onPress={() => setTab(t)}
              >
                <View className="flex-row items-center gap-1">
                  <Text className={`text-xs ${isSelected ? 'text-primary font-bold' : 'text-muted-foreground font-semibold'}`}>{t}</Text>
                  {badge > 0 && (
                    <View className="bg-destructive px-1.5 py-0.5 rounded-full min-w-[16px] items-center">
                      <Text className="text-white text-[10px] font-extrabold">{badge}</Text>
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Summary cards */}
      <SummaryCards slots={slots} pendingAppsCount={pendingAppsCount} />

      {/* Tab content */}
      <View className="flex-1">
        {tab === 'Slots' && (
          <SlotsTab
            slots={slots}
            onCreateSlot={() => setCreateOpen(true)}
            onEditSlot={s => setEditingSlot(s)}
            onViewMembers={s => setViewingSlot(s)}
          />
        )}
        {tab === 'Applications' && <ApplicationsTab />}
        {tab === 'Guest Play' && <GuestPlayTab />}
        {tab === 'Members' && <MembersListTab slots={slots} onViewSlotMembers={s => setViewingSlot(s)} />}
      </View>

      {/* Create Slot Modal */}
      <CreateSlotSheet
        visible={createOpen || !!editingSlot}
        onClose={() => {
          setCreateOpen(false);
          setEditingSlot(null);
        }}
        slotToEdit={editingSlot}
      />

      {tab === 'Slots' && (
        <TouchableOpacity
          className="absolute bottom-6 right-6 w-16 h-16 rounded-full bg-primary justify-center items-center shadow-lg"
          onPress={() => setCreateOpen(true)}
        >
          <Plus size={24} color="#ffffff" />
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
}
