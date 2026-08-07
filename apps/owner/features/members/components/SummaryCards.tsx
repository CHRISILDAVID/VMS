import React from 'react';
import { View, Text } from 'react-native';
import { Users, UserCheck, UserX, Clock } from 'lucide-react-native';
import { MembershipSlotWithDetails } from '@vms/shared/services';

interface SummaryCardsProps {
  slots: MembershipSlotWithDetails[];
  pendingAppsCount: number;
}

export function SummaryCards({ slots, pendingAppsCount }: SummaryCardsProps) {
  const totalMembers = slots.reduce((a, s) => a + (s.active_count || 0), 0);
  const activeSlots = slots.filter(s => s.is_recruiting).length;
  const vacancies = slots.reduce((a, s) => a + Math.max(0, s.capacity - (s.active_count || 0)), 0);

  const stats = [
    { label: 'Total Members', value: totalMembers, icon: Users, color: '#2563EB', bgClass: 'bg-blue-100 dark:bg-blue-900/40' },
    { label: 'Active Slots', value: activeSlots, icon: UserCheck, color: '#16A34A', bgClass: 'bg-green-100 dark:bg-green-900/40' },
    { label: 'Vacancies', value: vacancies, icon: UserX, color: '#D97706', bgClass: 'bg-amber-100 dark:bg-amber-900/40' },
    { label: 'Pending Apps', value: pendingAppsCount, icon: Clock, color: '#7C3AED', bgClass: 'bg-violet-100 dark:bg-violet-900/40' },
  ];

  return (
    <View className="flex-row flex-wrap gap-2.5 px-4 pt-3.5 pb-1">
      {stats.map(s => {
        const Icon = s.icon;
        return (
          <View key={s.label} className="w-[48%] bg-card rounded-2xl p-3.5 border border-border flex-row items-center gap-2.5">
            <View className={`w-[38px] h-[38px] rounded-xl items-center justify-center ${s.bgClass}`}>
              <Icon size={18} color={s.color} />
            </View>
            <View className="flex-1">
              <Text className="text-xl font-extrabold text-foreground">{s.value}</Text>
              <Text className="text-[11px] text-muted-foreground font-medium mt-0.5">{s.label}</Text>
            </View>
          </View>
        );
      })}
    </View>
  );
}
