import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ChevronLeft, Phone, Mail, Globe, MessageCircleQuestion } from 'lucide-react-native';
import { useThemeColors } from '../../hooks/useThemeColors';

export default function HelpScreen() {
  const router = useRouter();
  const { colors } = useThemeColors();

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top', 'bottom']}>
      <View className="flex-row items-center px-4 py-3.5 bg-card border-b border-border">
        <TouchableOpacity onPress={() => router.back()} className="w-9 h-9 rounded-xl bg-muted border border-border items-center justify-center mr-3">
          <ChevronLeft size={20} color={colors.foreground} />
        </TouchableOpacity>
        <Text className="text-lg font-extrabold text-foreground">Help & Support</Text>
      </View>
      <ScrollView className="flex-1 p-4">
        
        <View className="mb-6">
          <Text className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-3 ml-1">Contact Us</Text>
          <View className="bg-card rounded-2xl border border-border overflow-hidden">
            <TouchableOpacity className="flex-row items-center p-4 border-b border-border">
              <View className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/30 items-center justify-center mr-3.5">
                <Phone size={18} color="#2563EB" />
              </View>
              <View className="flex-1">
                <Text className="text-[15px] font-semibold text-foreground">Call Support</Text>
                <Text className="text-[13px] text-muted-foreground mt-0.5">+91 98765 43210</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity className="flex-row items-center p-4">
              <View className="w-10 h-10 rounded-xl bg-green-50 dark:bg-green-900/30 items-center justify-center mr-3.5">
                <Mail size={18} color="#16A34A" />
              </View>
              <View className="flex-1">
                <Text className="text-[15px] font-semibold text-foreground">Email Us</Text>
                <Text className="text-[13px] text-muted-foreground mt-0.5">support@badmintonapp.com</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        <View className="mb-6">
          <Text className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-3 ml-1">Resources</Text>
          <View className="bg-card rounded-2xl border border-border overflow-hidden">
            <TouchableOpacity className="flex-row items-center p-4 border-b border-border">
              <View className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-900/30 items-center justify-center mr-3.5">
                <MessageCircleQuestion size={18} color="#7C3AED" />
              </View>
              <View className="flex-1">
                <Text className="text-[15px] font-semibold text-foreground">FAQ</Text>
                <Text className="text-[13px] text-muted-foreground mt-0.5">Frequently asked questions</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity className="flex-row items-center p-4">
              <View className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-900/30 items-center justify-center mr-3.5">
                <Globe size={18} color="#D97706" />
              </View>
              <View className="flex-1">
                <Text className="text-[15px] font-semibold text-foreground">Website</Text>
                <Text className="text-[13px] text-muted-foreground mt-0.5">Visit our help center</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
