import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { ChevronRight, Users, ArrowRight } from 'lucide-react-native';
import { MembershipSlotWithDetails } from '@vms/shared/services';
import { formatCurrency } from '@vms/shared/utils';

export interface SlotStats {
  expectedAmount: number;
  collectedAmount: number;
  pendingAmount: number;
  totalMembers: number;
  paidMembers: number;
  pendingMembers: number;
}

interface SlotPaymentCardProps {
  slot: MembershipSlotWithDetails;
  stats?: SlotStats;
  onPress: () => void;
}

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
const formatDays = (days: string[]) => days.map(d => capitalize(d.slice(0, 3))).join(', ');
const formatTime = (time: string) => time.slice(0, 5); // "06:00:00" -> "06:00"

export function SlotPaymentCard({ slot, stats, onPress }: SlotPaymentCardProps) {
  const safeStats = stats || {
    expectedAmount: 0,
    collectedAmount: 0,
    pendingAmount: 0,
    totalMembers: 0,
    paidMembers: 0,
    pendingMembers: 0,
  };

  const progressPercent = safeStats.expectedAmount > 0 
    ? (safeStats.collectedAmount / safeStats.expectedAmount) * 100 
    : 0;

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.name}>{slot.name}</Text>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{capitalize(slot.skill_level)}</Text>
        </View>
      </View>
      
      <View style={styles.detailsRow}>
        <Text style={styles.infoText}>
          {formatDays(slot.playing_days)} · {formatTime(slot.start_time)} – {formatTime(slot.end_time)}
        </Text>
        <Text style={styles.priceText}>
          <Text style={styles.priceAmount}>{formatCurrency(slot.monthly_fee)}</Text>
          /mo
        </Text>
      </View>

      <View style={styles.membersRow}>
        <View style={[styles.memberBlock, styles.bgGrey]}>
          <View style={styles.iconRow}>
            <Users size={14} color="#64748B" />
            <Text style={styles.memberNum}>{safeStats.totalMembers}</Text>
          </View>
          <Text style={styles.memberLabel}>Total</Text>
        </View>
        <View style={[styles.memberBlock, styles.bgGreen]}>
          <View style={styles.iconRow}>
            <Users size={14} color="#16A34A" />
            <Text style={[styles.memberNum, styles.textGreen]}>{safeStats.paidMembers}</Text>
          </View>
          <Text style={[styles.memberLabel, styles.textGreen]}>Paid</Text>
        </View>
        <View style={[styles.memberBlock, styles.bgRed]}>
          <View style={styles.iconRow}>
            <Users size={14} color="#DC2626" />
            <Text style={[styles.memberNum, styles.textRed]}>{safeStats.pendingMembers}</Text>
          </View>
          <Text style={[styles.memberLabel, styles.textRed]}>Pending</Text>
        </View>
      </View>

      <View style={styles.amountsRow}>
        <View style={styles.amountCol}>
          <Text style={styles.amountLabel}>Expected</Text>
          <Text style={styles.amountValBlack}>{formatCurrency(safeStats.expectedAmount)}</Text>
        </View>
        <ArrowRight size={14} color="#CBD5E1" />
        <View style={styles.amountCol}>
          <Text style={styles.amountLabel}>Collected</Text>
          <Text style={styles.amountValGreen}>{formatCurrency(safeStats.collectedAmount)}</Text>
        </View>
        <ArrowRight size={14} color="#CBD5E1" />
        <View style={styles.amountCol}>
          <Text style={styles.amountLabel}>Pending</Text>
          <Text style={styles.amountValRed}>{formatCurrency(safeStats.pendingAmount)}</Text>
        </View>
      </View>

      <View style={styles.progressContainer}>
        <View style={styles.progressBarBg}>
          <View style={[styles.progressBarFill, { width: `${progressPercent}%` }]} />
        </View>
        <Text style={styles.progressText}>{Math.round(progressPercent)}% collected</Text>
      </View>

      <TouchableOpacity style={styles.viewBtn} onPress={onPress}>
        <Text style={styles.viewBtnText}>View Payments</Text>
        <ChevronRight size={16} color="#2563EB" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  header: {
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
  badge: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    color: '#4F46E5',
    fontSize: 11,
    fontWeight: '600',
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  infoText: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '500',
  },
  priceText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
  },
  priceAmount: {
    fontSize: 15,
    fontWeight: '800',
    color: '#3B82F6',
  },
  membersRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  memberBlock: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  bgGrey: { backgroundColor: '#F8FAFC' },
  bgGreen: { backgroundColor: '#F0FDF4' },
  bgRed: { backgroundColor: '#FEF2F2' },
  iconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  memberNum: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
  },
  memberLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
  },
  textGreen: { color: '#16A34A' },
  textRed: { color: '#DC2626' },
  amountsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  amountCol: {
    alignItems: 'center',
  },
  amountLabel: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
    marginBottom: 4,
  },
  amountValBlack: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },
  amountValGreen: {
    fontSize: 15,
    fontWeight: '800',
    color: '#16A34A',
  },
  amountValRed: {
    fontSize: 15,
    fontWeight: '800',
    color: '#DC2626',
  },
  progressContainer: {
    marginBottom: 16,
  },
  progressBarBg: {
    height: 6,
    backgroundColor: '#E2E8F0',
    borderRadius: 3,
    marginBottom: 6,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#2563EB',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 11,
    color: '#64748B',
    textAlign: 'right',
    fontWeight: '500',
  },
  viewBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#BFDBFE',
    borderRadius: 8,
    backgroundColor: '#EFF6FF',
    gap: 4,
  },
  viewBtnText: {
    color: '#2563EB',
    fontSize: 14,
    fontWeight: '700',
  },
});
