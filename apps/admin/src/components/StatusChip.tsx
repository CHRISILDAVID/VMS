import React from 'react';

interface StatusChipProps {
  status: string;
  size?: 'sm' | 'md';
}

const statusConfig: Record<string, { label: string; bg: string; text: string }> = {
  confirmed: { label: 'Confirmed', bg: '#EFF6FF', text: '#2563EB' },
  pending: { label: 'Pending', bg: '#FFFBEB', text: '#D97706' },
  completed: { label: 'Completed', bg: '#F0FDF4', text: '#16A34A' },
  cancelled: { label: 'Cancelled', bg: '#FEF2F2', text: '#DC2626' },
  paid: { label: 'Paid', bg: '#F0FDF4', text: '#16A34A' },
  unpaid: { label: 'Unpaid', bg: '#FEF2F2', text: '#DC2626' },
  partial: { label: 'Partial', bg: '#FFFBEB', text: '#D97706' },
  available: { label: 'Available', bg: '#F0FDF4', text: '#16A34A' },
  booked: { label: 'Booked', bg: '#EFF6FF', text: '#2563EB' },
  blocked: { label: 'Blocked', bg: '#FEF2F2', text: '#DC2626' },
  coaching: { label: 'Coaching', bg: '#FFFBEB', text: '#D97706' },
  tournament: { label: 'Tournament', bg: '#F5F3FF', text: '#7C3AED' },
  frequent: { label: 'Frequent', bg: '#EFF6FF', text: '#2563EB' },
  recent: { label: 'Recent', bg: '#F0FDF4', text: '#16A34A' },
  outstanding: { label: 'Outstanding', bg: '#FEF2F2', text: '#DC2626' },
};

export default function StatusChip({ status, size = 'md' }: StatusChipProps) {
  const config = statusConfig[status.toLowerCase()] ?? { label: status, bg: '#F1F5F9', text: '#64748B' };
  const padding = size === 'sm' ? '2px 8px' : '4px 10px';
  const fontSize = size === 'sm' ? '10px' : '11px';

  return (
    <span
      style={{
        background: config.bg,
        color: config.text,
        padding,
        borderRadius: 20,
        fontSize,
        fontWeight: 600,
        letterSpacing: '0.02em',
        whiteSpace: 'nowrap',
        display: 'inline-block',
      }}
    >
      {config.label}
    </span>
  );
}
