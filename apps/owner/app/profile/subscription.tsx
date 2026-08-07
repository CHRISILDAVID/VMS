import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ChevronLeft, CreditCard, Check } from 'lucide-react-native';
import { useThemeColors } from '../../hooks/useThemeColors';

export default function SubscriptionScreen() {
  const router = useRouter();
  const { colors } = useThemeColors();

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top', 'bottom']}>
      <View className="flex-row items-center px-4 py-3.5 bg-card border-b border-border">
        <TouchableOpacity onPress={() => router.back()} className="w-9 h-9 rounded-xl bg-muted border border-border items-center justify-center mr-3">
          <ChevronLeft size={20} color={colors.foreground} />
        </TouchableOpacity>
        <Text className="text-lg font-extrabold text-foreground">Subscription</Text>
      </View>
      <ScrollView className="flex-1 p-4">
        <View className="bg-card rounded-[20px] p-5 border border-border mb-5">
          <View className="flex-row justify-between items-start">
            <View>
              <Text className="text-sm font-bold text-muted-foreground uppercase tracking-wide mb-1">Pro Plan</Text>
              <Text className="text-[32px] font-extrabold text-foreground">₹999<Text className="text-sm font-semibold text-muted-foreground"> / month</Text></Text>
            </View>
            <View className="w-11 h-11 rounded-xl bg-primary/10 items-center justify-center">
              <CreditCard size={20} color={colors.primary} />
            </View>
          </View>
          <Text className="text-[13px] text-muted-foreground mt-3">Next billing date: 15 Aug 2026</Text>
          
          <View className="h-px bg-border my-5" />
          
          <Text className="text-sm font-bold text-foreground mb-3">Included Features</Text>
          {['Unlimited courts & bookings', 'Membership management', 'Analytics & reporting', 'Priority support'].map((f, i) => (
            <View key={i} className="flex-row items-center mb-2.5">
              <Check size={16} color={colors.primary} />
              <Text className="text-sm text-foreground ml-2.5">{f}</Text>
            </View>
          ))}
        </View>

        <TouchableOpacity className="bg-card p-4 rounded-xl items-center border border-border">
          <Text className="text-sm font-semibold text-foreground">Manage Billing Details</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
