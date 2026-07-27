import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export interface StatusChipProps {
  status: string;
  size?: 'sm' | 'md';
}

const statusConfig: Record<string, { label: string; bg: string; text: string }> = {
  upcoming: { label: 'Upcoming', bg: '#EFF6FF', text: '#2563EB' },
  ongoing: { label: 'Ongoing', bg: '#F5F3FF', text: '#7C3AED' },
  confirmed: { label: 'Confirmed', bg: '#EFF6FF', text: '#2563EB' },
  pending: { label: 'Pending', bg: '#FFFBEB', text: '#D97706' },
  completed: { label: 'Completed', bg: '#F0FDF4', text: '#16A34A' },
  cancelled: { label: 'Cancelled', bg: '#FEF2F2', text: '#DC2626' },
  paid: { label: 'Paid', bg: '#F0FDF4', text: '#16A34A' },
  unpaid: { label: 'Unpaid', bg: '#FEF2F2', text: '#DC2626' },
  partial: { label: 'Partial', bg: '#FFFBEB', text: '#D97706' },
  refunded: { label: 'Refunded', bg: '#F1F5F9', text: '#64748B' },
  available: { label: 'Available', bg: '#F0FDF4', text: '#16A34A' },
  booked: { label: 'Booked', bg: '#EFF6FF', text: '#2563EB' },
  blocked: { label: 'Blocked', bg: '#FEF2F2', text: '#DC2626' },
  coaching: { label: 'Coaching', bg: '#FFFBEB', text: '#D97706' },
  tournament: { label: 'Tournament', bg: '#F5F3FF', text: '#7C3AED' },
  membership: { label: 'Membership', bg: '#F0FDF4', text: '#16A34A' },
};

export function StatusChip({ status, size = 'md' }: StatusChipProps) {
  const cleanStatus = (status || '').toLowerCase();
  const config = statusConfig[cleanStatus] ?? { 
    label: status ? (status.charAt(0).toUpperCase() + status.slice(1)) : 'Unknown', 
    bg: '#F1F5F9', 
    text: '#64748B' 
  };

  const isSmall = size === 'sm';

  return (
    <View
      style={[
        styles.chip,
        {
          backgroundColor: config.bg,
          paddingVertical: isSmall ? 2 : 4,
          paddingHorizontal: isSmall ? 8 : 10,
        },
      ]}
    >
      <Text
        style={[
          styles.text,
          {
            color: config.text,
            fontSize: isSmall ? 10 : 12,
          },
        ]}
      >
        {config.label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    borderRadius: 20,
    alignSelf: 'flex-start',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontWeight: '600',
    letterSpacing: 0.2,
  },
});
export default StatusChip;
