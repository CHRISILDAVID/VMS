import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import {
  ArrowLeft,
  Wallet,
  CreditCard,
  Clock,
  Calendar,
  MapPin,
  CheckCircle,
} from 'lucide-react-native';
import RazorpayCheckout from 'react-native-razorpay';
import Constants from 'expo-constants';
import { format, parse } from 'date-fns';
import { useCreateBooking, useVenueDetail } from './useCourts';
import { usePlayerStore } from '../../stores/playerStore';
import { useAuthContext } from '../../contexts/AuthContext';
import { usePlayerThemeColors } from '../../hooks/usePlayerThemeColors';
import { createPlayersService } from '@vms/shared/services';
import { supabase } from '../../lib/supabase';

const playersService = createPlayersService(supabase);

const RAZORPAY_KEY_ID = process.env.EXPO_PUBLIC_RAZORPAY_KEY_ID ?? '';

type PaymentMethod = 'wallet' | 'online' | 'pay_at_court';

const PAYMENT_METHODS: Array<{
  id: PaymentMethod;
  label: string;
  subtitle: string;
  icon: React.ElementType;
}> = [
  { id: 'wallet', label: 'ShuttleHub Wallet', subtitle: 'Instant deduction', icon: Wallet },
  { id: 'online', label: 'Online (Razorpay)', subtitle: 'UPI, cards, net banking', icon: CreditCard },
];

export function BookingSummaryScreen() {
  const params = useLocalSearchParams<{
    venueId: string;
    courtId: string;
    courtName: string;
    venueName: string;
    date: string;
    startTime: string;
    endTime: string;
    durationMinutes: string;
    estimatedPrice: string;
  }>();

  const { colors } = usePlayerThemeColors();
  const { user } = useAuthContext();
  const { walletBalance } = usePlayerStore();
  const { mutateAsync: createBooking, isPending } = useCreateBooking();
  const { data: venue } = useVenueDetail(params.venueId);

  const [selectedPayment, setSelectedPayment] = useState<PaymentMethod>('wallet');

  const durationMins = parseInt(params.durationMinutes ?? '60');
  const pricePaise = parseInt(params.estimatedPrice ?? '0');
  const priceRupees = pricePaise / 100;

  const formattedDate = params.date
    ? format(parse(params.date, 'yyyy-MM-dd', new Date()), 'EEE, d MMM yyyy')
    : '';

  const walletBalanceRupees = walletBalance !== null ? walletBalance / 100 : 0;
  const walletSufficient = walletBalance !== null && walletBalance >= pricePaise;

  const handleConfirm = async () => {
    if (!user?.id) return;

    try {
      if (selectedPayment === 'wallet') {
        if (!walletSufficient) {
          Alert.alert('Insufficient Balance', 'Your wallet balance is too low for this booking.');
          return;
        }

        const result = await createBooking({
          venue_id: params.venueId,
          court_id: params.courtId,
          player_id: user.id,
          date: params.date,
          start_time: params.startTime + ':00',
          end_time: params.endTime + ':00',
          duration_minutes: durationMins,
          base_amount: pricePaise,
          final_amount: pricePaise,
          payment_method: 'wallet',
        });

        router.replace({
          pathname: '/courts/[venueId]/confirmation' as any,
          params: {
            venueId: params.venueId,
            bookingNumber: result.booking_number,
            venueName: params.venueName,
            date: formattedDate,
            startTime: params.startTime,
            endTime: params.endTime,
            paymentMethod: 'wallet',
          },
        });
      } else if (selectedPayment === 'pay_at_court') {
        const result = await createBooking({
          venue_id: params.venueId,
          court_id: params.courtId,
          player_id: user.id,
          date: params.date,
          start_time: params.startTime + ':00',
          end_time: params.endTime + ':00',
          duration_minutes: durationMins,
          base_amount: pricePaise,
          final_amount: pricePaise,
          payment_method: 'pay_at_court',
        });

        router.replace({
          pathname: '/courts/[venueId]/confirmation' as any,
          params: {
            venueId: params.venueId,
            bookingNumber: result.booking_number,
            venueName: params.venueName,
            date: formattedDate,
            startTime: params.startTime,
            endTime: params.endTime,
            paymentMethod: 'pay_at_court',
          },
        });
      } else if (selectedPayment === 'online') {
        // 1. Create Razorpay order via Edge Function
        const { data: orderData, error: orderError } = await supabase.functions.invoke(
          'create-razorpay-order',
          {
            body: {
              amount: pricePaise,
              currency: 'INR',
              receipt: `bk_${params.courtId}_${Date.now()}`,
              notes: {
                venue: params.venueName,
                court: params.courtName,
                date: params.date,
              },
            },
          }
        );

        if (orderError || !orderData?.id) {
          Alert.alert('Payment Error', 'Failed to create payment order. Please try again.');
          return;
        }

        // 2. Open Razorpay checkout
        const razorpayOptions = {
          description: `Court Booking — ${params.venueName}`,
          image: 'https://raw.githubusercontent.com/razorpay/razorpay-demo/main/icon.png',
          currency: 'INR',
          key: RAZORPAY_KEY_ID,
          amount: String(pricePaise),
          name: 'ShuttleHub',
          order_id: orderData.id,
          prefill: {
            email: user.email ?? '',
            contact: user.phone ?? '',
          },
          theme: { color: '#0B1F3A' },
        };

        let payment: any = null;
        try {
          const isExpoGo = Constants.executionEnvironment === 'storeClient';
          
          if (__DEV__ && isExpoGo) {
            console.log("Mocking Razorpay in DEV mode (Expo Go)");
            await new Promise(resolve => setTimeout(resolve, 1000));
            payment = {
              razorpay_order_id: orderData.id,
              razorpay_payment_id: `pay_mock_${Date.now()}`,
              razorpay_signature: `sign_mock_${Date.now()}`
            };
          } else {
            payment = await RazorpayCheckout.open(razorpayOptions);
          }
        } catch (razorpayErr: any) {
          if (__DEV__) {
            console.log("Razorpay checkout failed in DEV, probably missing native module:", razorpayErr);
            Alert.alert('Payment Error', 'Razorpay native module is missing. Please use EAS Build.');
            return;
          } else if (razorpayErr?.code !== 0) {
            Alert.alert('Payment Cancelled', 'Your payment was not completed.');
            return;
          }
          return;
        }

        try {
          // 3. Verify signature (Skip in DEV mock)
          const isExpoGo = Constants.executionEnvironment === 'storeClient';
          if (!(__DEV__ && isExpoGo)) {
            const { data: verifyData } = await supabase.functions.invoke(
              'verify-razorpay-payment',
              {
                body: {
                  razorpay_order_id: payment.razorpay_order_id,
                  razorpay_payment_id: payment.razorpay_payment_id,
                  razorpay_signature: payment.razorpay_signature,
                },
              }
            );

            if (!verifyData?.verified) {
              Alert.alert('Payment Failed', 'Payment verification failed. Contact support.');
              return;
            }
          }

          // 4. Create booking with Razorpay IDs
          const result = await createBooking({
            venue_id: params.venueId,
            court_id: params.courtId,
            player_id: user.id,
            date: params.date,
            start_time: params.startTime + ':00',
            end_time: params.endTime + ':00',
            duration_minutes: durationMins,
            base_amount: pricePaise,
            final_amount: pricePaise,
            payment_method: 'online',
            razorpay_order_id: payment.razorpay_order_id,
            razorpay_payment_id: payment.razorpay_payment_id,
            razorpay_signature: payment.razorpay_signature,
          });

          router.replace({
            pathname: '/courts/[venueId]/confirmation' as any,
            params: {
              venueId: params.venueId,
              bookingNumber: result.booking_number,
              venueName: params.venueName,
              date: formattedDate,
              startTime: params.startTime,
              endTime: params.endTime,
              paymentMethod: 'online',
            },
          });
        } catch (err: any) {
          Alert.alert('Booking Error', err.message || 'Failed to complete booking. Please try again.');
        }
      }
    } catch (err: any) {
      Alert.alert('Booking Error', err.message || 'Failed to create booking. Please try again.');
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top', 'bottom']}>
      {/* Header */}
      <View className="flex-row items-center px-4 py-3 gap-3">
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-9 h-9 rounded-full bg-muted items-center justify-center"
        >
          <ArrowLeft size={18} color={colors.foreground} strokeWidth={2} />
        </TouchableOpacity>
        <Text className="text-foreground font-black text-lg">Booking Summary</Text>
      </View>

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 20, gap: 24, paddingBottom: 120 }}
      >
        {/* Booking Details Card */}
        <View className="gap-4">
          <Text className="text-foreground font-black text-xl">Booking Summary</Text>
          
          <View className="bg-card rounded-3xl border border-border p-5 shadow-sm">
            {/* Venue Info with Thumbnail */}
            <View className="flex-row items-center gap-4 mb-5 pb-5 border-b border-border">
              <View className="w-16 h-16 rounded-2xl bg-muted overflow-hidden">
                {venue?.photos && venue.photos.length > 0 ? (
                  <Image 
                    source={{ uri: venue.photos[0].startsWith('http') ? venue.photos[0] : supabase.storage.from('venue-photos').getPublicUrl(venue.photos[0]).data.publicUrl }} 
                    className="w-full h-full"
                    resizeMode="cover"
                  />
                ) : (
                  <View className="flex-1 items-center justify-center bg-accent/20">
                    <MapPin size={24} color={colors.accent} />
                  </View>
                )}
              </View>
              <View className="flex-1">
                <Text className="text-foreground font-black text-lg mb-1" numberOfLines={1}>{params.venueName}</Text>
                <Text className="text-muted-foreground font-semibold text-xs">{params.courtName}</Text>
              </View>
            </View>

            <View className="gap-3">
              <DetailRow icon={Calendar} label="Date" value={formattedDate} />
              <DetailRow
                icon={Clock}
                label="Time"
                value={`${params.startTime} – ${params.endTime}`}
              />
              <DetailRow
                icon={Clock}
                label="Duration"
                value={
                  durationMins < 60
                    ? `${durationMins} min`
                    : `${durationMins / 60} hr${durationMins > 60 ? 's' : ''}`
                }
              />
            </View>

            {pricePaise > 0 && (
              <View className="border-t border-border mt-5 pt-5 flex-row justify-between items-center bg-muted/30 -mx-5 px-5 -mb-5 pb-5 rounded-b-3xl">
                <Text className="text-muted-foreground font-bold">Total Amount</Text>
                <Text className="text-foreground font-black text-2xl">₹{priceRupees}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Payment Method */}
        <View className="gap-3">
          <Text className="text-foreground font-bold text-base">Payment Method</Text>
          {PAYMENT_METHODS.map((method) => {
            const Icon = method.icon;
            const isSelected = selectedPayment === method.id;
            const isWalletDisabled = method.id === 'wallet' && !walletSufficient;

            return (
              <TouchableOpacity
                key={method.id}
                onPress={() => !isWalletDisabled && setSelectedPayment(method.id)}
                activeOpacity={0.85}
                className={`flex-row items-center p-4 rounded-3xl border ${
                  isSelected
                    ? 'bg-primary/10 border-primary shadow-sm shadow-primary/20'
                    : isWalletDisabled
                    ? 'bg-card border-border opacity-50'
                    : 'bg-card border-border shadow-sm'
                }`}
              >
                <View
                  className={`w-12 h-12 rounded-2xl items-center justify-center mr-4 ${
                    isSelected ? 'bg-primary' : 'bg-muted'
                  }`}
                >
                  <Icon
                    size={20}
                    color={isSelected ? colors.primaryForeground : colors.mutedForeground}
                    strokeWidth={2.5}
                  />
                </View>
                <View className="flex-1">
                  <Text className={`font-bold ${isSelected ? 'text-primary' : 'text-foreground'}`}>
                    {method.label}
                  </Text>
                  <Text className="text-muted-foreground text-xs">{method.subtitle}</Text>
                  {method.id === 'wallet' && (
                    <Text
                      className={`text-xs font-bold mt-0.5 ${
                        walletSufficient ? 'text-success' : 'text-destructive'
                      }`}
                    >
                      Balance: ₹{walletBalanceRupees}
                      {!walletSufficient && ' (Insufficient)'}
                    </Text>
                  )}
                </View>
                <View
                  className={`w-5 h-5 rounded-full border-2 items-center justify-center ${
                    isSelected ? 'border-primary bg-primary' : 'border-border'
                  }`}
                >
                  {isSelected && <View className="w-2 h-2 rounded-full bg-primary-foreground" />}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      {/* Sticky Confirm Button */}
      <View className="absolute bottom-0 left-0 right-0 bg-background/90 backdrop-blur-md border-t border-border px-5 pt-4 pb-8">
        <TouchableOpacity
          className={`rounded-full py-4 items-center flex-row justify-center gap-2 shadow-lg shadow-primary/20 ${
            isPending ? 'bg-muted' : 'bg-primary'
          }`}
          onPress={handleConfirm}
          disabled={isPending}
          activeOpacity={0.85}
        >
          {isPending ? (
            <ActivityIndicator size="small" color={colors.mutedForeground} />
          ) : (
            <>
              <CheckCircle size={18} color={colors.primaryForeground} strokeWidth={2.5} />
              <Text className="text-primary-foreground font-black text-base">
                Confirm Booking
                {pricePaise > 0 ? ` — ₹${priceRupees}` : ''}
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

function DetailRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
}) {
  const { colors } = usePlayerThemeColors();
  return (
    <View className="flex-row items-center gap-3">
      <View className="w-8 h-8 rounded-full bg-muted/50 items-center justify-center">
        <Icon size={14} color={colors.mutedForeground} strokeWidth={2.5} />
      </View>
      <Text className="text-muted-foreground font-bold text-sm w-20">{label}</Text>
      <Text className="text-foreground text-sm font-black flex-1 text-right" numberOfLines={1}>
        {value}
      </Text>
    </View>
  );
}
