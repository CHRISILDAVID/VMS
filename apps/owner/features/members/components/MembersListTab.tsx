import { formatPhone } from '@vms/shared/utils';
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput } from 'react-native';
import { ChevronRight, Search } from 'lucide-react-native';
import { MembershipSlotWithDetails } from '@vms/shared/services';
import { useMembers } from '../hooks/useMemberships';
import { useThemeColors } from '../../../hooks/useThemeColors';

interface MembersListTabProps {
  slots: MembershipSlotWithDetails[];
  onViewSlotMembers: (slot: MembershipSlotWithDetails) => void;
}

const payClasses: Record<string, { bgClass: string; textClass: string }> = { 
  paid: { bgClass: 'bg-green-100 dark:bg-green-900/40', textClass: 'text-green-600' },
  due: { bgClass: 'bg-amber-100 dark:bg-amber-900/40', textClass: 'text-amber-600' },
  overdue: { bgClass: 'bg-red-100 dark:bg-red-900/40', textClass: 'text-destructive' }
};
const payLabel: Record<string, string> = { paid: 'Paid', due: 'Due Soon', overdue: 'Overdue' };

export function MembersListTab({ slots, onViewSlotMembers }: MembersListTabProps) {
  const { data: allMembers = [], isLoading } = useMembers();
  const [searchQuery, setSearchQuery] = useState('');
  const { colors } = useThemeColors();

  const filteredMembers = allMembers.filter(m => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const name = m.customer?.full_name?.toLowerCase() || '';
    const phone = formatPhone(m.customer?.phone || '').toLowerCase();
    const slotName = m.slot?.name?.toLowerCase() || '';
    return name.includes(q) || phone.includes(q) || slotName.includes(q);
  });

  return (
    <View className="flex-1 bg-background">
      {/* Search Bar */}
      <View className="flex-row items-center bg-card rounded-2xl border-[1.5px] border-border px-3.5 mx-4 mt-3.5 mb-1 gap-2.5">
        <Search size={18} color={colors.mutedForeground} />
        <TextInput
          className="flex-1 py-3 text-sm font-semibold text-foreground"
          placeholder="Search by name, phone, or slot..."
          placeholderTextColor={colors.mutedForeground}
          value={searchQuery}
          onChangeText={setSearchQuery}
          clearButtonMode="while-editing"
        />
      </View>

      <ScrollView className="flex-1" contentContainerStyle={{ padding: 16, paddingBottom: 88, gap: 10 }} showsVerticalScrollIndicator={false}>
        {isLoading ? (
          <View className="items-center justify-center py-16 px-8">
            <Text className="text-sm text-muted-foreground">Loading all venue members...</Text>
          </View>
        ) : filteredMembers.length === 0 ? (
          <View className="items-center justify-center py-16 px-8">
            <Text className="text-[15px] font-bold text-foreground mb-1">{searchQuery ? 'No matching members found' : 'No members found'}</Text>
            <Text className="text-[13px] text-muted-foreground text-center">
              {searchQuery ? 'Try adjusting your search terms.' : 'Members added to any training slot will appear here.'}
            </Text>
          </View>
        ) : (
          filteredMembers.map(m => {
            const customerName = m.customer?.full_name || 'Unknown Player';
            const phone = formatPhone(m.customer?.phone || '');
            const slotName = m.slot?.name || 'Assigned Slot';
            const initial = customerName.charAt(0).toUpperCase();
            const payStatus = m.latest_payment?.status || (m.is_active ? 'paid' : 'due');

            const parentSlot = slots.find(s => s.id === m.slot_id) || m.slot;
            const payTheme = payClasses[payStatus] || payClasses.paid;

            return (
              <TouchableOpacity
                key={m.id}
                className={`bg-card rounded-2xl p-3.5 border border-border ${!m.is_active ? 'opacity-70 bg-muted' : ''}`}
                onPress={() => {
                  if (parentSlot) {
                    onViewSlotMembers(parentSlot as MembershipSlotWithDetails);
                  }
                }}
              >
                <View className="flex-row items-center gap-3">
                  <View className="w-11 h-11 rounded-xl bg-primary/10 items-center justify-center">
                    <Text className="text-lg font-extrabold text-primary">{initial}</Text>
                  </View>
                  <View className="flex-1">
                    <View className="flex-row items-center flex-wrap gap-1.5 mb-0.5">
                      <Text className="text-[15px] font-bold text-foreground">{customerName}</Text>
                      {!m.is_active && (
                        <View className="px-1.5 py-0.5 rounded-md bg-muted">
                          <Text className="text-[10px] font-bold text-muted-foreground">Inactive</Text>
                        </View>
                      )}
                      <View className={`px-2 py-0.5 rounded-full ${payTheme.bgClass}`}>
                        <Text className={`text-[10px] font-bold ${payTheme.textClass}`}>
                          {payLabel[payStatus] || 'Paid'}
                        </Text>
                      </View>
                    </View>
                    <Text className="text-xs text-muted-foreground">{slotName} · {phone}</Text>
                  </View>
                  <ChevronRight size={18} color={colors.mutedForeground} />
                </View>
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>
    </View>
  );
}
