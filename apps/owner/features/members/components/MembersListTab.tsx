import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput } from 'react-native';
import { ChevronRight, Search } from 'lucide-react-native';
import { MembershipSlotWithDetails } from '@vms/shared/services';
import { useMembers } from '../hooks/useMemberships';

interface MembersListTabProps {
  slots: MembershipSlotWithDetails[];
  onViewSlotMembers: (slot: MembershipSlotWithDetails) => void;
}

const payColors: Record<string, string> = { paid: '#16A34A', due: '#D97706', overdue: '#DC2626' };
const payBg: Record<string, string> = { paid: '#F0FDF4', due: '#FFFBEB', overdue: '#FEF2F2' };
const payLabel: Record<string, string> = { paid: 'Paid', due: 'Due Soon', overdue: 'Overdue' };

export function MembersListTab({ slots, onViewSlotMembers }: MembersListTabProps) {
  const { data: allMembers = [], isLoading } = useMembers();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredMembers = allMembers.filter(m => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const name = m.customer?.full_name?.toLowerCase() || '';
    const phone = m.customer?.phone?.toLowerCase() || '';
    const slotName = m.slot?.name?.toLowerCase() || '';
    return name.includes(q) || phone.includes(q) || slotName.includes(q);
  });

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchBar}>
        <Search size={18} color="#94A3B8" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by name, phone, or slot..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          clearButtonMode="while-editing"
        />
      </View>

      <ScrollView style={styles.listContainer} contentContainerStyle={styles.listContent} showsVerticalScrollIndicator={false}>
        {isLoading ? (
          <View style={styles.centerBox}>
            <Text style={styles.loadingText}>Loading all venue members...</Text>
          </View>
        ) : filteredMembers.length === 0 ? (
          <View style={styles.centerBox}>
            <Text style={styles.emptyTitle}>{searchQuery ? 'No matching members found' : 'No members found'}</Text>
            <Text style={styles.emptySub}>
              {searchQuery ? 'Try adjusting your search terms.' : 'Members added to any training slot will appear here.'}
            </Text>
          </View>
        ) : (
          filteredMembers.map(m => {
            const customerName = m.customer?.full_name || 'Unknown Player';
            const phone = m.customer?.phone || '';
            const slotName = m.slot?.name || 'Assigned Slot';
            const initial = customerName.charAt(0).toUpperCase();
            const payStatus = m.latest_payment?.status || (m.is_active ? 'paid' : 'due');

            const parentSlot = slots.find(s => s.id === m.slot_id) || m.slot;

            return (
              <TouchableOpacity
                key={m.id}
                style={[styles.card, !m.is_active && styles.cardInactive]}
                onPress={() => {
                  if (parentSlot) {
                    onViewSlotMembers(parentSlot as MembershipSlotWithDetails);
                  }
                }}
              >
                <View style={styles.row}>
                  <View style={styles.avatar}>
                    <Text style={styles.avatarText}>{initial}</Text>
                  </View>
                  <View style={styles.info}>
                    <View style={styles.nameRow}>
                      <Text style={styles.name}>{customerName}</Text>
                      {!m.is_active && (
                        <View style={styles.inactiveBadge}>
                          <Text style={styles.inactiveText}>Inactive</Text>
                        </View>
                      )}
                      <View style={[styles.payBadge, { backgroundColor: payBg[payStatus] || '#F0FDF4' }]}>
                        <Text style={[styles.payText, { color: payColors[payStatus] || '#16A34A' }]}>
                          {payLabel[payStatus] || 'Paid'}
                        </Text>
                      </View>
                    </View>
                    <Text style={styles.subText}>{slotName} · {phone}</Text>
                  </View>
                  <ChevronRight size={18} color="#CBD5E1" />
                </View>
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    paddingHorizontal: 14,
    marginHorizontal: 16,
    marginTop: 14,
    marginBottom: 4,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 14,
    fontWeight: '600',
    color: '#0F172A',
  },
  listContainer: {
    flex: 1,
  },
  listContent: {
    padding: 16,
    paddingBottom: 88,
    gap: 10,
  },
  centerBox: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 30,
  },
  loadingText: {
    fontSize: 14,
    color: '#64748B',
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 4,
  },
  emptySub: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  cardInactive: {
    opacity: 0.7,
    backgroundColor: '#F8FAFC',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#2563EB',
  },
  info: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 2,
  },
  name: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
  },
  inactiveBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
  },
  inactiveText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748B',
  },
  payBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 20,
  },
  payText: {
    fontSize: 10,
    fontWeight: '700',
  },
  subText: {
    fontSize: 12,
    color: '#64748B',
  },
});
