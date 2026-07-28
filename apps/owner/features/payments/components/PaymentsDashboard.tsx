import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { formatCurrency, COLORS } from '@vms/shared/utils';
import { useVenuePaymentSummary } from '../hooks/usePayments';

interface PaymentsDashboardProps {
  venueId?: string;
}

export function PaymentsDashboard({ venueId }: PaymentsDashboardProps) {
  const { data: summary, isLoading } = useVenuePaymentSummary(venueId);

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Text>Loading dashboard...</Text>
      </View>
    );
  }

  const totalCollected = summary?.totalCollected || 0;
  const totalOutstanding = summary?.totalOutstanding || 0;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>This Month's Collections</Text>
      
      <View style={styles.cardsRow}>
        <View style={[styles.card, styles.collectedCard]}>
          <Text style={styles.cardLabel}>Collected</Text>
          <Text style={styles.cardValueCollected}>{formatCurrency(totalCollected)}</Text>
        </View>

        <View style={[styles.card, styles.outstandingCard]}>
          <Text style={styles.cardLabel}>Outstanding</Text>
          <Text style={styles.cardValueOutstanding}>{formatCurrency(totalOutstanding)}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 12,
  },
  cardsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  card: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  collectedCard: {
    backgroundColor: '#F0FDF4',
    borderColor: '#BBF7D0',
  },
  outstandingCard: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
  },
  cardLabel: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '600',
    marginBottom: 8,
  },
  cardValueCollected: {
    fontSize: 20,
    fontWeight: '800',
    color: '#16A34A',
  },
  cardValueOutstanding: {
    fontSize: 20,
    fontWeight: '800',
    color: '#DC2626',
  },
});
