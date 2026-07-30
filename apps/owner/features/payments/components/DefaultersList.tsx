import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Alert } from 'react-native';
import { useDefaulters, useVoidPayment } from '../hooks/usePayments';
import { formatCurrency } from '@vms/shared/utils';
import { Check, X, AlertCircle } from 'lucide-react-native';

interface DefaultersListProps {
  venueId?: string;
}

export function DefaultersList({ venueId }: DefaultersListProps) {
  const { data: defaulters, isLoading } = useDefaulters(venueId);
  const voidMutation = useVoidPayment();

  const handleVoid = (paymentId: string, memberName: string) => {
    Alert.alert(
      'Void Payment',
      `Are you sure you want to void the pending payment for ${memberName}? This will remove it from the defaulters list and the total pending amount.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Void', 
          style: 'destructive', 
          onPress: () => voidMutation.mutate(paymentId) 
        }
      ]
    );
  };

  if (isLoading) {
    return (
      <View style={styles.center}>
        <Text style={styles.emptyText}>Loading defaulters...</Text>
      </View>
    );
  }

  if (!defaulters || defaulters.length === 0) {
    return (
      <View style={styles.emptyBox}>
        <Check size={32} color="#16A34A" style={styles.emptyIcon} />
        <Text style={styles.emptyTitle}>All Clear!</Text>
        <Text style={styles.emptyText}>There are no pending payments for this venue.</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={defaulters}
      keyExtractor={item => item.id}
      contentContainerStyle={styles.listContent}
      renderItem={({ item }) => {
        const anyItem = item as any;
        const memberName = anyItem.members?.customer?.full_name || 'Unknown Member';
        const phone = anyItem.members?.customer?.phone || '';
        const slotName = anyItem.membership_slots?.name || 'Unknown Slot';
        const isDeleted = anyItem.membership_slots?.deleted_at != null;
        
        return (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View>
                <Text style={styles.memberName}>{memberName}</Text>
                <Text style={styles.phoneText}>{phone}</Text>
              </View>
              <Text style={styles.amountText}>{formatCurrency(item.amount)}</Text>
            </View>

            <View style={styles.detailsRow}>
              <View style={styles.slotInfo}>
                <Text style={styles.slotName}>{slotName}</Text>
                {isDeleted && (
                  <View style={styles.deletedBadge}>
                    <Text style={styles.deletedText}>Deleted Slot</Text>
                  </View>
                )}
              </View>
              <Text style={styles.periodText}>Period: {item.billing_period}</Text>
            </View>

            <View style={styles.actionsRow}>
              <TouchableOpacity 
                style={styles.voidBtn} 
                onPress={() => handleVoid(item.id, memberName)}
                disabled={voidMutation.isPending}
              >
                <X size={16} color="#DC2626" />
                <Text style={styles.voidBtnText}>Void</Text>
              </TouchableOpacity>
              
              <View style={styles.statusBadge}>
                <AlertCircle size={14} color="#D97706" />
                <Text style={styles.statusText}>{item.status === 'overdue' ? 'Overdue' : 'Due'}</Text>
              </View>
            </View>
          </View>
        );
      }}
    />
  );
}

const styles = StyleSheet.create({
  center: {
    padding: 32,
    alignItems: 'center',
  },
  emptyBox: {
    padding: 32,
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    margin: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#DCFCE7',
  },
  emptyIcon: {
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#166534',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#15803D',
    textAlign: 'center',
  },
  listContent: {
    padding: 16,
    gap: 12,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  memberName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0F172A',
  },
  phoneText: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 2,
  },
  amountText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#DC2626',
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  slotInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  slotName: {
    fontSize: 14,
    color: '#475569',
    fontWeight: '500',
  },
  deletedBadge: {
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  deletedText: {
    fontSize: 11,
    color: '#DC2626',
    fontWeight: '600',
  },
  periodText: {
    fontSize: 13,
    color: '#94A3B8',
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  voidBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: '#FEF2F2',
    borderRadius: 6,
  },
  voidBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#DC2626',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFFBEB',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 16,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#D97706',
  },
});
