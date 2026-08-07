import React from 'react';
import { View, Text } from 'react-native';

export interface StatusChipProps {
  status: string;
  size?: 'sm' | 'md';
}

const statusConfig: Record<string, { label: string; bgClass: string; textColor: string }> = {
  upcoming: { label: 'Upcoming', bgClass: 'bg-blue-100 dark:bg-blue-900/40', textColor: '#2563EB' },
  ongoing: { label: 'Ongoing', bgClass: 'bg-violet-100 dark:bg-violet-900/40', textColor: '#7C3AED' },
  confirmed: { label: 'Confirmed', bgClass: 'bg-blue-100 dark:bg-blue-900/40', textColor: '#2563EB' },
  pending: { label: 'Pending', bgClass: 'bg-amber-100 dark:bg-amber-900/40', textColor: '#D97706' },
  completed: { label: 'Completed', bgClass: 'bg-green-100 dark:bg-green-900/40', textColor: '#16A34A' },
  cancelled: { label: 'Cancelled', bgClass: 'bg-red-100 dark:bg-red-900/40', textColor: '#DC2626' },
  paid: { label: 'Paid', bgClass: 'bg-green-100 dark:bg-green-900/40', textColor: '#16A34A' },
  unpaid: { label: 'Unpaid', bgClass: 'bg-red-100 dark:bg-red-900/40', textColor: '#DC2626' },
  partial: { label: 'Partial', bgClass: 'bg-amber-100 dark:bg-amber-900/40', textColor: '#D97706' },
  refunded: { label: 'Refunded', bgClass: 'bg-muted', textColor: '#64748B' },
  available: { label: 'Available', bgClass: 'bg-green-100 dark:bg-green-900/40', textColor: '#16A34A' },
  booked: { label: 'Booked', bgClass: 'bg-blue-100 dark:bg-blue-900/40', textColor: '#2563EB' },
  blocked: { label: 'Blocked', bgClass: 'bg-red-100 dark:bg-red-900/40', textColor: '#DC2626' },
  coaching: { label: 'Coaching', bgClass: 'bg-amber-100 dark:bg-amber-900/40', textColor: '#D97706' },
  tournament: { label: 'Tournament', bgClass: 'bg-violet-100 dark:bg-violet-900/40', textColor: '#7C3AED' },
  membership: { label: 'Membership', bgClass: 'bg-green-100 dark:bg-green-900/40', textColor: '#16A34A' },
};

export function StatusChip({ status, size = 'md' }: StatusChipProps) {
  const cleanStatus = (status || '').toLowerCase();
  const config = statusConfig[cleanStatus] ?? { 
    label: status ? (status.charAt(0).toUpperCase() + status.slice(1)) : 'Unknown', 
    bgClass: 'bg-muted', 
    textColor: '#64748B',
  };

  const isSmall = size === 'sm';

  return (
    <View
      className={`rounded-full self-start items-center justify-center ${config.bgClass} ${isSmall ? 'py-0.5 px-2' : 'py-1 px-2.5'}`}
    >
      <Text
        style={{ color: config.textColor, fontSize: isSmall ? 10 : 12, fontWeight: '600', letterSpacing: 0.2 }}
      >
        {config.label}
      </Text>
    </View>
  );
}
export default StatusChip;
