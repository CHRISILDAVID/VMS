import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ChevronLeft, TrendingUp, Users, ShoppingBag, Trophy } from 'lucide-react-native';
import { useThemeColors } from '../../hooks/useThemeColors';

const features = [
  { icon: Trophy, title: 'Tournaments', desc: 'Host and manage local badminton tournaments.', comingSoon: true },
  { icon: Users, title: 'Coaching', desc: 'Offer coaching sessions and track progress.', comingSoon: true },
  { icon: ShoppingBag, title: 'Pro Shop', desc: 'Sell gear and equipment at your venue.', comingSoon: true },
];

export default function GrowBusinessScreen() {
  const router = useRouter();
  const { colors } = useThemeColors();

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top', 'bottom']}>
      <View className="flex-row items-center px-4 py-3.5 bg-card border-b border-border">
        <TouchableOpacity onPress={() => router.back()} className="w-9 h-9 rounded-xl bg-muted border border-border items-center justify-center mr-3">
          <ChevronLeft size={20} color={colors.foreground} />
        </TouchableOpacity>
        <Text className="text-lg font-extrabold text-foreground">Grow Your Business</Text>
      </View>
      <ScrollView className="flex-1 p-4">
        <View className="items-center p-6 mb-5">
          <View className="w-16 h-16 rounded-[20px] bg-green-50 dark:bg-green-900/30 items-center justify-center mb-4">
            <TrendingUp size={32} color="#16A34A" />
          </View>
          <Text className="text-xl font-extrabold text-foreground mb-2">Unlock New Revenue</Text>
          <Text className="text-sm text-muted-foreground text-center leading-[22px]">Expand your offerings beyond just court bookings. More features coming soon!</Text>
        </View>
        
        {features.map((f, i) => {
          const Icon = f.icon;
          return (
            <View key={i} className="flex-row items-center bg-card p-4 rounded-2xl mb-3 border border-border">
              <View className="w-11 h-11 rounded-xl bg-green-50 dark:bg-green-900/20 items-center justify-center mr-3.5">
                <Icon size={20} color="#16A34A" />
              </View>
              <View className="flex-1">
                <Text className="text-[15px] font-bold text-foreground">{f.title}</Text>
                <Text className="text-[13px] text-muted-foreground mt-0.5">{f.desc}</Text>
              </View>
              {f.comingSoon && (
                <View className="bg-muted px-2.5 py-1 rounded-lg">
                  <Text className="text-[11px] font-bold text-muted-foreground">Soon</Text>
                </View>
              )}
            </View>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}
