import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { ChevronRight } from 'lucide-react-native';
import { MembershipSlotWithDetails } from '@vms/shared/services';

interface SlotPaymentCardProps {
  slot: MembershipSlotWithDetails;
  onPress: () => void;
}

export function SlotPaymentCard({ slot, onPress }: SlotPaymentCardProps) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <View style={styles.header}>
        <Text style={styles.name}>{slot.name}</Text>
        <ChevronRight size={20} color="#94A3B8" />
      </View>
      
      <View style={styles.details}>
        <Text style={styles.infoText}>
          {slot.capacity} Capacity • Billing Day {slot.billing_day}
        </Text>
      </View>
      
      {/* Visual progress bar could go here based on payments data */}
      
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  name: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  details: {
    flexDirection: 'row',
  },
  infoText: {
    fontSize: 14,
    color: '#64748B',
  },
});
