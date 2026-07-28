import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
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
      <SafeAreaView style={styles.container} edges={['top']}>
        <SlotMembersView
          slot={latestSlot}
          allSlots={slots}
          onBack={() => setViewingSlot(null)}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.title}>Membership</Text>
          <VenueSelector />
        </View>

        {/* Tabs */}
        <View style={styles.tabsRow}>
          {TABS.map(t => {
            const badge = t === 'Applications' ? pendingAppsCount : t === 'Guest Play' ? upcomingGuestCount : 0;
            const isSelected = tab === t;

            return (
              <TouchableOpacity
                key={t}
                style={[styles.tabBtn, isSelected && styles.tabBtnSelected]}
                onPress={() => setTab(t)}
              >
                <View style={styles.tabContent}>
                  <Text style={[styles.tabText, isSelected && styles.tabTextSelected]}>{t}</Text>
                  {badge > 0 && (
                    <View style={styles.badge}>
                      <Text style={styles.badgeText}>{badge}</Text>
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
      <View style={styles.content}>
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
          style={styles.fab}
          onPress={() => setCreateOpen(true)}
        >
          <Plus size={24} color="#fff" />
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0F172A',
  },
  tabsRow: {
    flexDirection: 'row',
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
    marginBottom: -1,
  },
  tabBtnSelected: {
    borderBottomColor: '#2563EB',
  },
  tabContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  tabText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  tabTextSelected: {
    color: '#2563EB',
    fontWeight: '700',
  },
  badge: {
    backgroundColor: '#DC2626',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 10,
    minWidth: 16,
    alignItems: 'center',
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '800',
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#2563EB',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  content: {
    flex: 1,
  },
});
