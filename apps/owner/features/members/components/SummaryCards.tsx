import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
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
    { label: 'Total Members', value: totalMembers, icon: Users, color: '#2563EB', bg: '#EFF6FF' },
    { label: 'Active Slots', value: activeSlots, icon: UserCheck, color: '#16A34A', bg: '#F0FDF4' },
    { label: 'Vacancies', value: vacancies, icon: UserX, color: '#D97706', bg: '#FFFBEB' },
    { label: 'Pending Apps', value: pendingAppsCount, icon: Clock, color: '#7C3AED', bg: '#F5F3FF' },
  ];

  return (
    <View style={styles.grid}>
      {stats.map(s => {
        const Icon = s.icon;
        return (
          <View key={s.label} style={styles.card}>
            <View style={[styles.iconBox, { backgroundColor: s.bg }]}>
              <Icon size={18} color={s.color} />
            </View>
            <View style={styles.textBox}>
              <Text style={styles.value}>{s.value}</Text>
              <Text style={styles.label}>{s.label}</Text>
            </View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 4,
  },
  card: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconBox: {
    width: 38,
    height: 38,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textBox: {
    flex: 1,
  },
  value: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
  },
  label: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '500',
    marginTop: 2,
  },
});
