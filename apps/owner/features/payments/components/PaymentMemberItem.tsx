import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { formatCurrency, formatDate } from '@vms/shared/utils';
import { CheckCircle2, Clock, CreditCard, Download, History, MessageCircle } from 'lucide-react-native';

interface PaymentMemberItemProps {
  payment: any;
  slotName?: string;
  slotPrice?: number;
  onMarkPaid: () => void;
}

export function PaymentMemberItem({ payment, slotName, slotPrice, onMarkPaid }: PaymentMemberItemProps) {
  const isPaid = payment.status === 'paid';
  const isOverdue = payment.status === 'overdue';
  
  // Choose colors based on status
  const borderColor = isPaid ? '#16A34A' : isOverdue ? '#DC2626' : '#F59E0B';
  const statusColor = isPaid ? '#16A34A' : isOverdue ? '#DC2626' : '#D97706';

  return (
    <View style={[styles.container, { borderLeftColor: borderColor }]}>
      <View style={styles.topRow}>
        <Text style={styles.name}>{payment.members?.customers?.full_name}</Text>
        <Text style={styles.amount}>{formatCurrency(payment.amount || slotPrice || 0)}</Text>
      </View>
      
      <View style={styles.middleRow}>
        <Text style={styles.slotName}>{slotName || 'Membership'}</Text>
        <Text style={[styles.statusText, { color: statusColor }]}>
          {isPaid ? 'Paid' : isOverdue ? 'Overdue' : 'Due Soon'}
        </Text>
      </View>

      <View style={styles.badgesRow}>
        {isPaid ? (
          <>
            <View style={[styles.badge, styles.bgGreenBadge]}>
              <CheckCircle2 size={12} color="#16A34A" />
              <Text style={[styles.badgeText, styles.textGreen]}>
                Paid {payment.paid_on ? formatDate(payment.paid_on) : ''}
              </Text>
            </View>
            {payment.payment_mode && (
              <View style={[styles.badge, styles.bgGreyBadge]}>
                <CreditCard size={12} color="#64748B" />
                <Text style={[styles.badgeText, styles.textGrey]}>
                  {payment.payment_mode.toUpperCase()}
                </Text>
              </View>
            )}
          </>
        ) : (
          <View style={[styles.badge, isOverdue ? styles.bgRedBadge : styles.bgYellowBadge]}>
            <Clock size={12} color={isOverdue ? '#DC2626' : '#D97706'} />
            <Text style={[styles.badgeText, isOverdue ? styles.textRed : styles.textYellow]}>
              Due {payment.due_date ? formatDate(payment.due_date) : ''}
            </Text>
          </View>
        )}
      </View>

      <View style={styles.actionsRow}>
        {isPaid ? (
          <>
            <TouchableOpacity style={styles.actionBtn}>
              <History size={14} color="#64748B" />
              <Text style={styles.actionBtnText}>History</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionBtn}>
              <Download size={14} color="#64748B" />
              <Text style={styles.actionBtnText}>Receipt</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <TouchableOpacity style={[styles.actionBtn, styles.borderGreen]} onPress={onMarkPaid}>
              <CheckCircle2 size={14} color="#16A34A" />
              <Text style={[styles.actionBtnText, styles.textGreen]}>Mark Paid</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.actionBtn, styles.borderBlue]}>
              <MessageCircle size={14} color="#2563EB" />
              <Text style={[styles.actionBtnText, styles.textBlue]}>Remind</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionBtn}>
              <History size={14} color="#64748B" />
              <Text style={styles.actionBtnText}>History</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  name: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  amount: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  middleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  slotName: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '500',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
  },
  badgesRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 4,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  bgGreenBadge: { backgroundColor: '#F0FDF4' },
  bgGreyBadge: { backgroundColor: '#F1F5F9' },
  bgYellowBadge: { backgroundColor: '#FFFBEB' },
  bgRedBadge: { backgroundColor: '#FEF2F2' },
  textGreen: { color: '#16A34A' },
  textGrey: { color: '#64748B' },
  textYellow: { color: '#D97706' },
  textRed: { color: '#DC2626' },
  textBlue: { color: '#2563EB' },
  actionsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    gap: 6,
  },
  actionBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
  },
  borderGreen: { borderColor: '#BBF7D0' },
  borderBlue: { borderColor: '#BFDBFE' },
});
