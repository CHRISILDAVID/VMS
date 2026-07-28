import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { formatCurrency, formatDate } from '@vms/shared/utils';

interface PaymentMemberItemProps {
  payment: any;
  onMarkPaid: () => void;
}

export function PaymentMemberItem({ payment, onMarkPaid }: PaymentMemberItemProps) {
  const isPaid = payment.status === 'paid';
  const isOverdue = payment.status === 'overdue';

  return (
    <View style={styles.container}>
      <View style={styles.info}>
        <Text style={styles.name}>{payment.members?.customers?.full_name}</Text>
        <Text style={styles.phone}>{payment.members?.customers?.phone}</Text>
        <View style={styles.metaRow}>
          <Text style={styles.amount}>{formatCurrency(payment.amount)}</Text>
          <View style={[styles.statusBadge, isPaid ? styles.paidBadge : isOverdue ? styles.overdueBadge : styles.dueBadge]}>
            <Text style={[styles.statusText, isPaid ? styles.paidText : isOverdue ? styles.overdueText : styles.dueText]}>
              {payment.status.toUpperCase()}
            </Text>
          </View>
        </View>
      </View>
      
      {!isPaid && (
        <TouchableOpacity style={styles.payBtn} onPress={onMarkPaid}>
          <Text style={styles.payBtnText}>Mark Paid</Text>
        </TouchableOpacity>
      )}
      {isPaid && (
        <View style={styles.paidInfo}>
          <Text style={styles.paidDate}>Paid on {formatDate(payment.paid_on)}</Text>
          <Text style={styles.paymentMode}>{payment.payment_mode}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0F172A',
  },
  phone: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 2,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 12,
  },
  amount: {
    fontSize: 15,
    fontWeight: '700',
    color: '#334155',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  dueBadge: { backgroundColor: '#FEF3C7' },
  dueText: { color: '#D97706', fontSize: 10, fontWeight: '700' },
  paidBadge: { backgroundColor: '#DCFCE7' },
  paidText: { color: '#16A34A', fontSize: 10, fontWeight: '700' },
  overdueBadge: { backgroundColor: '#FEE2E2' },
  overdueText: { color: '#DC2626', fontSize: 10, fontWeight: '700' },
  payBtn: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  payBtnText: {
    color: '#2563EB',
    fontWeight: '700',
    fontSize: 13,
  },
  paidInfo: {
    alignItems: 'flex-end',
  },
  paidDate: {
    fontSize: 12,
    color: '#64748B',
  },
  paymentMode: {
    fontSize: 12,
    fontWeight: '600',
    color: '#334155',
    marginTop: 4,
  },
});
