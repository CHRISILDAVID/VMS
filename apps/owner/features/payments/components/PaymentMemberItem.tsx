import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { formatCurrency, formatDate } from '@vms/shared/utils';
import { CheckCircle2, Clock, CreditCard, Download, History, MessageCircle } from 'lucide-react-native';
import { useThemeColors } from '../../../hooks/useThemeColors';

interface PaymentMemberItemProps {
  payment: any;
  slotName?: string;
  slotPrice?: number;
  onMarkPaid: () => void;
}

export function PaymentMemberItem({ payment, slotName, slotPrice, onMarkPaid }: PaymentMemberItemProps) {
  const isPaid = payment.status === 'paid';
  const isOverdue = payment.status === 'overdue';
  const { colors } = useThemeColors();

  // Status classes
  const borderColorClass = isPaid ? 'border-l-green-600 dark:border-l-green-500' : isOverdue ? 'border-l-destructive dark:border-l-red-500' : 'border-l-amber-500 dark:border-l-amber-500';
  const statusColorClass = isPaid ? 'text-green-600 dark:text-green-500' : isOverdue ? 'text-destructive dark:text-red-500' : 'text-amber-600 dark:text-amber-500';

  return (
    <View className={`bg-card p-4 rounded-xl border border-border border-l-4 shadow-sm ${borderColorClass}`}>
      <View className="flex-row justify-between items-center mb-1">
        <Text className="text-base font-extrabold text-foreground">{payment.members?.customers?.full_name}</Text>
        <Text className="text-base font-extrabold text-foreground">{formatCurrency(payment.amount || slotPrice || 0)}</Text>
      </View>
      
      <View className="flex-row justify-between items-center mb-3">
        <Text className="text-[13px] text-muted-foreground font-medium">{slotName || 'Membership'}</Text>
        <Text className={`text-xs font-bold ${statusColorClass}`}>
          {isPaid ? 'Paid' : isOverdue ? 'Overdue' : 'Due Soon'}
        </Text>
      </View>

      <View className="flex-row gap-2 mb-4">
        {isPaid ? (
          <>
            <View className="flex-row items-center px-2 py-1 bg-green-50 dark:bg-green-900/20 rounded-md gap-1">
              <CheckCircle2 size={12} color="#16A34A" />
              <Text className="text-[11px] font-semibold text-green-600 dark:text-green-500">
                Paid {payment.paid_on ? formatDate(payment.paid_on) : ''}
              </Text>
            </View>
            {payment.payment_mode && (
              <View className="flex-row items-center px-2 py-1 bg-muted rounded-md gap-1">
                <CreditCard size={12} color={colors.mutedForeground} />
                <Text className="text-[11px] font-semibold text-muted-foreground">
                  {payment.payment_mode.toUpperCase()}
                </Text>
              </View>
            )}
          </>
        ) : (
          <View className={`flex-row items-center px-2 py-1 rounded-md gap-1 ${isOverdue ? 'bg-red-50 dark:bg-red-900/20' : 'bg-amber-50 dark:bg-amber-900/20'}`}>
            <Clock size={12} color={isOverdue ? '#DC2626' : '#D97706'} />
            <Text className={`text-[11px] font-semibold ${isOverdue ? 'text-destructive dark:text-red-500' : 'text-amber-600 dark:text-amber-500'}`}>
              Due {payment.due_date ? formatDate(payment.due_date) : ''}
            </Text>
          </View>
        )}
      </View>

      <View className="flex-row gap-2">
        {isPaid ? (
          <>
            <TouchableOpacity className="flex-1 flex-row items-center justify-center py-2 border border-border rounded-lg gap-1.5">
              <History size={14} color={colors.mutedForeground} />
              <Text className="text-xs font-bold text-muted-foreground">History</Text>
            </TouchableOpacity>
            <TouchableOpacity className="flex-1 flex-row items-center justify-center py-2 border border-border rounded-lg gap-1.5">
              <Download size={14} color={colors.mutedForeground} />
              <Text className="text-xs font-bold text-muted-foreground">Receipt</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <TouchableOpacity className="flex-1 flex-row items-center justify-center py-2 border border-green-200 dark:border-green-800 rounded-lg gap-1.5 bg-green-50/50 dark:bg-green-900/10" onPress={onMarkPaid}>
              <CheckCircle2 size={14} color="#16A34A" />
              <Text className="text-xs font-bold text-green-600 dark:text-green-500">Mark Paid</Text>
            </TouchableOpacity>
            <TouchableOpacity className="flex-1 flex-row items-center justify-center py-2 border border-blue-200 dark:border-blue-800 rounded-lg gap-1.5 bg-blue-50/50 dark:bg-blue-900/10">
              <MessageCircle size={14} color="#2563EB" />
              <Text className="text-xs font-bold text-blue-600 dark:text-blue-500">Remind</Text>
            </TouchableOpacity>
            <TouchableOpacity className="flex-1 flex-row items-center justify-center py-2 border border-border rounded-lg gap-1.5">
              <History size={14} color={colors.mutedForeground} />
              <Text className="text-xs font-bold text-muted-foreground">History</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  );
}
