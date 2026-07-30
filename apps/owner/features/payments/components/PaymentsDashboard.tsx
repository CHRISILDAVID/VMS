import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { formatCurrency } from '@vms/shared/utils';
import { useVenuePaymentSummary } from '../hooks/usePayments';
import { TrendingUp, Clock } from 'lucide-react-native';

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
  const pendingAmount = summary?.pendingAmount || 0;
  const paidMembersCount = summary?.paidMembersCount || 0;
  const dueMembersCount = summary?.dueMembersCount || 0;
  const overdueMembersCount = summary?.overdueMembersCount || 0;
  const totalMembersCount = summary?.totalMembersCount || 0;

  const monthName = new Date().toLocaleString('default', { month: 'long' }).toUpperCase();

  return (
    <View style={styles.container}>
      {/* Top Green Card */}
      <View style={styles.collectedCard}>
        <View style={styles.collectedHeader}>
          <View style={styles.iconContainer}>
            <TrendingUp size={24} color="#16A34A" />
          </View>
          <View>
            <Text style={styles.collectedLabel}>TOTAL COLLECTED · {monthName}</Text>
            <Text style={styles.collectedAmount}>{formatCurrency(totalCollected)}</Text>
            <Text style={styles.collectedSubtext}>{paidMembersCount} of {totalMembersCount} members paid</Text>
          </View>
        </View>
      </View>

      <View style={styles.row}>
        {/* Pending Card */}
        <View style={styles.pendingCard}>
          <View style={styles.pendingHeader}>
            <Clock size={16} color="#F59E0B" />
            <Text style={styles.pendingLabel}>PENDING</Text>
          </View>
          <Text style={styles.pendingAmount}>{formatCurrency(pendingAmount)}</Text>
          <Text style={styles.pendingSubtext}>{dueMembersCount} due · {overdueMembersCount} overdue</Text>
        </View>

        {/* Member Status Card */}
        <View style={styles.statusCard}>
          <Text style={styles.statusTitle}>Member Status</Text>
          <View style={styles.statusRow}>
            <View style={[styles.statusBlock, styles.bgGreen]}>
              <Text style={[styles.statusNum, styles.textGreen]}>{paidMembersCount}</Text>
              <Text style={[styles.statusLabel, styles.textGreen]}>Paid</Text>
            </View>
            <View style={[styles.statusBlock, styles.bgYellow]}>
              <Text style={[styles.statusNum, styles.textYellow]}>{dueMembersCount}</Text>
              <Text style={[styles.statusLabel, styles.textYellow]}>Due</Text>
            </View>
            <View style={[styles.statusBlock, styles.bgRed]}>
              <Text style={[styles.statusNum, styles.textRed]}>{overdueMembersCount}</Text>
              <Text style={[styles.statusLabel, styles.textRed]}>Late</Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  collectedCard: {
    backgroundColor: '#16A34A', // Green background
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  collectedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  iconContainer: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  collectedLabel: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  collectedAmount: {
    color: '#fff',
    fontSize: 32,
    fontWeight: '800',
    marginBottom: 4,
  },
  collectedSubtext: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 13,
    fontWeight: '500',
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  pendingCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  pendingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
  },
  pendingLabel: {
    color: '#F59E0B',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  pendingAmount: {
    color: '#0F172A',
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 8,
  },
  pendingSubtext: {
    color: '#64748B',
    fontSize: 12,
    fontWeight: '500',
  },
  statusCard: {
    flex: 1.2,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statusTitle: {
    color: '#475569',
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 12,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  statusBlock: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  statusNum: {
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 2,
  },
  statusLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
  bgGreen: { backgroundColor: '#F0FDF4' },
  textGreen: { color: '#16A34A' },
  bgYellow: { backgroundColor: '#FFFBEB' },
  textYellow: { color: '#D97706' },
  bgRed: { backgroundColor: '#FEF2F2' },
  textRed: { color: '#DC2626' },
});
