import React from 'react';
import { View, Text, TouchableOpacity, FlatList, Alert } from 'react-native';
import { useDefaulters, useVoidPayment } from '../hooks/usePayments';
import {  formatCurrency , formatPhone } from '@vms/shared/utils';
import { Check, X, AlertCircle } from 'lucide-react-native';
import { useThemeColors } from '../../../hooks/useThemeColors';

interface DefaultersListProps {
  venueId?: string;
}

export function DefaultersList({ venueId }: DefaultersListProps) {
  const { data: defaulters, isLoading } = useDefaulters(venueId);
  const voidMutation = useVoidPayment();
  const { colors } = useThemeColors();

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
      <View className="p-8 items-center bg-background">
        <Text className="text-sm text-muted-foreground text-center">Loading defaulters...</Text>
      </View>
    );
  }

  if (!defaulters || defaulters.length === 0) {
    return (
      <View className="p-8 items-center bg-green-50 dark:bg-green-900/20 m-4 rounded-xl border border-green-100 dark:border-green-900">
        <Check size={32} color="#16A34A" className="mb-3" />
        <Text className="text-lg font-bold text-green-800 dark:text-green-400 mb-2">All Clear!</Text>
        <Text className="text-sm text-green-700 dark:text-green-500 text-center">There are no pending payments for this venue.</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={defaulters}
      keyExtractor={item => item.id}
      contentContainerStyle={{ padding: 16, gap: 12 }}
      className="bg-background"
      renderItem={({ item }) => {
        const anyItem = item as any;
        const memberName = anyItem.members?.customer?.full_name || 'Unknown Member';
        const phone = formatPhone(anyItem.members?.customer?.phone || '');
        const slotName = anyItem.membership_slots?.name || 'Unknown Slot';
        const isDeleted = anyItem.membership_slots?.deleted_at != null;
        
        return (
          <View className="bg-card rounded-xl p-4 border border-border">
            <View className="flex-row justify-between items-start mb-3">
              <View>
                <Text className="text-base font-semibold text-foreground">{memberName}</Text>
                <Text className="text-[13px] text-muted-foreground mt-0.5">{phone}</Text>
              </View>
              <Text className="text-lg font-bold text-destructive">{formatCurrency(item.amount)}</Text>
            </View>

            <View className="flex-row justify-between items-center mb-4 pb-4 border-b border-border">
              <View className="flex-row items-center gap-2">
                <Text className="text-sm text-muted-foreground font-medium">{slotName}</Text>
                {isDeleted && (
                  <View className="bg-red-50 dark:bg-red-900/20 px-1.5 py-0.5 rounded">
                    <Text className="text-[11px] font-semibold text-destructive">Deleted Slot</Text>
                  </View>
                )}
              </View>
              <Text className="text-[13px] text-muted-foreground">Period: {item.billing_period}</Text>
            </View>

            <View className="flex-row justify-between items-center">
              <TouchableOpacity 
                className="flex-row items-center gap-1.5 py-1.5 px-3 bg-red-50 dark:bg-red-900/20 rounded-md" 
                onPress={() => handleVoid(item.id, memberName)}
                disabled={voidMutation.isPending}
              >
                <X size={16} color="#DC2626" />
                <Text className="text-sm font-semibold text-destructive">Void</Text>
              </TouchableOpacity>
              
              <View className="flex-row items-center gap-1 bg-amber-50 dark:bg-amber-900/20 px-2 py-1 rounded-full">
                <AlertCircle size={14} color="#D97706" />
                <Text className="text-xs font-semibold text-amber-600 dark:text-amber-500">{item.status === 'overdue' ? 'Overdue' : 'Due'}</Text>
              </View>
            </View>
          </View>
        );
      }}
    />
  );
}
