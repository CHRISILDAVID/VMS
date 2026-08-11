import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, Linking, Animated, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { CheckCircle, MessageCircle, ArrowLeft, Calendar, Clock, MapPin, Swords, Users, Share2 } from 'lucide-react-native';
import { usePlayerThemeColors } from '../../hooks/usePlayerThemeColors';
import { useAuthContext } from '../../contexts/AuthContext';

export function BookingConfirmationScreen() {
  const params = useLocalSearchParams<{
    bookingNumber: string;
    venueName: string;
    date: string;
    startTime: string;
    endTime: string;
    paymentMethod: string;
  }>();

  const { colors } = usePlayerThemeColors();
  const { playerProfile } = useAuthContext();

  const scaleAnim = React.useRef(new Animated.Value(0)).current;
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 60,
        friction: 6,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const isPaid = params.paymentMethod === 'wallet' || params.paymentMethod === 'online';
  
  const paymentLabel = isPaid ? 'PAID' : 'PAY AT COURT';
  const paymentSub = params.paymentMethod === 'wallet' 
    ? 'via Wallet' 
    : params.paymentMethod === 'online' 
    ? 'via Online' 
    : 'on Arrival';

  const openWhatsApp = () => {
    const message = encodeURIComponent(
      `Hi! I have a booking at ${params.venueName}.\nBooking: ${params.bookingNumber}\nDate: ${params.date}\nTime: ${params.startTime} - ${params.endTime}`
    );
    Linking.openURL(`https://wa.me/?text=${message}`);
  };

  const shareBooking = async () => {
    // Optional fallback share functionality if we needed standard share
  };

  const handleBackHome = () => {
    // Ensure we go all the way back to the main tabs instead of just popping back to summary
    router.replace('/(tabs)/home' as any);
  };

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top', 'bottom']}>
      {/* Consistent Header with single back arrow to home */}
      <View className="flex-row items-center px-5 py-4 gap-3 z-10">
        <TouchableOpacity
          onPress={handleBackHome}
          className="w-10 h-10 rounded-full bg-muted/80 items-center justify-center"
        >
          <ArrowLeft size={20} color={colors.foreground} strokeWidth={2.5} />
        </TouchableOpacity>
        <Text className="text-foreground font-black text-lg flex-1 text-center pr-10" numberOfLines={1}>
          Booking Status
        </Text>
      </View>

      <ScrollView 
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        <View className="items-center px-6 pt-6 pb-4">
          {/* Animated success icon */}
          <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
            <View className="w-24 h-24 rounded-full bg-success/10 border border-success/20 items-center justify-center mb-5">
              <CheckCircle size={48} color={colors.success} strokeWidth={2} />
            </View>
          </Animated.View>

          <Animated.View style={{ opacity: fadeAnim }}>
            <View className="items-center gap-2 mb-8">
              <Text className="text-accent text-sm font-black uppercase tracking-widest">
                Booking Confirmed!
              </Text>
              <Text className="text-foreground text-3xl font-black text-center leading-tight">
                You're all set 🏸
              </Text>
            </View>
          </Animated.View>

          {/* Booking ID Card with Paid Pill */}
          <Animated.View style={{ opacity: fadeAnim, width: '100%' }}>
            <View className="w-full bg-card rounded-3xl border border-border p-5 mb-5 shadow-sm">
              
              <View className="flex-row justify-between items-start mb-6 border-b border-border pb-5">
                <View>
                  <Text className="text-muted-foreground text-xs font-black uppercase tracking-wider mb-1">
                    Booking ID
                  </Text>
                  <Text className="text-foreground font-black text-lg tracking-widest">
                    #{params.bookingNumber?.toUpperCase().substring(0, 8) || '----'}
                  </Text>
                </View>

                <View className={`px-4 py-2 rounded-xl border ${isPaid ? 'bg-success/10 border-success/20' : 'bg-destructive/10 border-destructive/20'} items-center`}>
                  <Text className={`${isPaid ? 'text-success' : 'text-destructive'} font-black text-xs uppercase tracking-wider`}>
                    {paymentLabel}
                  </Text>
                  <Text className={`${isPaid ? 'text-success' : 'text-destructive'} font-bold text-[10px]`}>
                    {paymentSub}
                  </Text>
                </View>
              </View>

              {/* Venue Details Layout */}
              <View className="gap-4">
                <View className="flex-row items-center gap-3">
                  <View className="w-8 h-8 rounded-full bg-muted/50 items-center justify-center">
                    <MapPin size={14} color={colors.mutedForeground} strokeWidth={2.5} />
                  </View>
                  <View className="flex-1">
                    <Text className="text-muted-foreground font-bold text-[10px] uppercase">Venue</Text>
                    <Text className="text-foreground font-black text-sm">{params.venueName}</Text>
                  </View>
                </View>

                <View className="flex-row items-center gap-3">
                  <View className="w-8 h-8 rounded-full bg-muted/50 items-center justify-center">
                    <Calendar size={14} color={colors.mutedForeground} strokeWidth={2.5} />
                  </View>
                  <View className="flex-1">
                    <Text className="text-muted-foreground font-bold text-[10px] uppercase">Date</Text>
                    <Text className="text-foreground font-black text-sm">{params.date}</Text>
                  </View>
                </View>

                <View className="flex-row items-center gap-3">
                  <View className="w-8 h-8 rounded-full bg-muted/50 items-center justify-center">
                    <Clock size={14} color={colors.mutedForeground} strokeWidth={2.5} />
                  </View>
                  <View className="flex-1">
                    <Text className="text-muted-foreground font-bold text-[10px] uppercase">Time</Text>
                    <Text className="text-foreground font-black text-sm">{params.startTime} - {params.endTime}</Text>
                  </View>
                </View>
              </View>
            </View>
          </Animated.View>

          {/* Action Buttons & Social (Milestone 12 placeholders) */}
          <Animated.View style={{ opacity: fadeAnim, width: '100%' }}>
            <View className="w-full gap-3 mt-2">
              <Text className="text-foreground font-black text-lg mb-1">Next Steps</Text>
              
              <TouchableOpacity
                disabled
                className="flex-row items-center justify-between bg-card border border-border rounded-2xl p-4 opacity-70"
                activeOpacity={0.85}
              >
                <View className="flex-row items-center gap-3">
                  <View className="w-10 h-10 rounded-full bg-accent/20 items-center justify-center">
                    <Swords size={18} color={colors.accent} strokeWidth={2.5} />
                  </View>
                  <View>
                    <Text className="text-foreground font-black text-sm">Challenge Players</Text>
                    <Text className="text-muted-foreground text-xs font-semibold">Invite rivals to your slot</Text>
                  </View>
                </View>
                <View className="bg-muted px-2 py-1 rounded">
                  <Text className="text-muted-foreground font-bold text-[10px] uppercase">Soon</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                disabled
                className="flex-row items-center justify-between bg-card border border-border rounded-2xl p-4 opacity-70"
                activeOpacity={0.85}
              >
                <View className="flex-row items-center gap-3">
                  <View className="w-10 h-10 rounded-full bg-primary/20 items-center justify-center">
                    <Users size={18} color={colors.primary} strokeWidth={2.5} />
                  </View>
                  <View>
                    <Text className="text-foreground font-black text-sm">Host a Match</Text>
                    <Text className="text-muted-foreground text-xs font-semibold">Open slot to public players</Text>
                  </View>
                </View>
                <View className="bg-muted px-2 py-1 rounded">
                  <Text className="text-muted-foreground font-bold text-[10px] uppercase">Soon</Text>
                </View>
              </TouchableOpacity>

              {/* WhatsApp Share */}
              <TouchableOpacity
                onPress={openWhatsApp}
                className="flex-row items-center justify-center gap-2 bg-[#25D366] rounded-2xl py-4 mt-4 shadow-sm shadow-[#25D366]/30"
                activeOpacity={0.85}
              >
                <MessageCircle size={20} color="#FFFFFF" strokeWidth={2.5} />
                <Text className="text-white font-black text-base">Share via WhatsApp</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
