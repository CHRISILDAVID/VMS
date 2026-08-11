import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { PhoneInput } from './PhoneInput';
import { OtpInput } from './OtpInput';
import { useAuth } from '../hooks/useAuth';
import { ArrowRight } from 'lucide-react-native';
import { usePlayerThemeColors } from '../../../hooks/usePlayerThemeColors';

export function LoginForm() {
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [countdown, setCountdown] = useState(0);

  const { colors } = usePlayerThemeColors();
  const { signInWithOtp, verifyOtp, loading, error } = useAuth();

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleSendOtp = async () => {
    if (phone.length < 10) {
      Alert.alert('Invalid Number', 'Please enter a valid 10-digit phone number');
      return;
    }
    try {
      await signInWithOtp(phone);
      setStep('otp');
      setCountdown(30);
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to send OTP. Please try again.');
    }
  };

  const handleVerifyOtp = async (code = otp) => {
    if (code.length !== 6) return;
    try {
      await verifyOtp(phone, code);
      // Navigation is handled by AuthGuard in _layout.tsx
    } catch (err: any) {
      Alert.alert('Invalid OTP', err.message || 'The code is incorrect. Please try again.');
      setOtp('');
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1"
    >
      <View className="flex-1 justify-center px-6 py-8">
        {/* Header */}
        <View className="mb-10">
          <View className="flex-row items-center gap-2 mb-3">
            {/* Lime accent dot */}
            <View className="w-3 h-3 rounded-full bg-accent" />
            <Text className="text-accent text-sm font-semibold tracking-widest uppercase">
              ShuttleHub
            </Text>
          </View>
          <Text className="text-4xl font-extrabold text-foreground mb-2 leading-tight">
            {step === 'phone' ? 'Welcome\nBack 👋' : 'Verify\nYour Number'}
          </Text>
          <Text className="text-muted-foreground text-base">
            {step === 'phone'
              ? 'Enter your phone number to get started'
              : `Code sent to +91 ${phone}`}
          </Text>
        </View>

        {step === 'phone' ? (
          <View className="gap-4">
            <PhoneInput
              value={phone}
              onChangeText={setPhone}
              autoFocus
              editable={!loading}
            />
            <TouchableOpacity
              className={`
                h-14 rounded-xl flex-row items-center justify-center gap-2
                bg-accent
                ${phone.length !== 10 || loading ? 'opacity-50' : 'opacity-100'}
              `}
              onPress={handleSendOtp}
              disabled={phone.length !== 10 || loading}
              activeOpacity={0.85}
            >
              {loading ? (
                <ActivityIndicator color={colors.primary} />
              ) : (
                <>
                  <Text className="text-accent-foreground text-lg font-bold">
                    Continue
                  </Text>
                  <ArrowRight size={20} color={colors.primary} strokeWidth={2.5} />
                </>
              )}
            </TouchableOpacity>
          </View>
        ) : (
          <View className="gap-4">
            {/* Phone display + edit */}
            <View className="flex-row justify-between items-center mb-2">
              <Text className="text-foreground text-base font-medium">+91 {phone}</Text>
              <TouchableOpacity onPress={() => { setStep('phone'); setOtp(''); }} disabled={loading}>
                <Text className="text-accent text-sm font-semibold">Edit</Text>
              </TouchableOpacity>
            </View>

            <OtpInput
              length={6}
              value={otp}
              onChange={(val) => {
                setOtp(val);
                if (val.length === 6) handleVerifyOtp(val);
              }}
              error={!!error}
            />

            <TouchableOpacity
              className={`
                h-14 rounded-xl items-center justify-center bg-accent
                ${otp.length !== 6 || loading ? 'opacity-50' : 'opacity-100'}
              `}
              onPress={() => handleVerifyOtp()}
              disabled={otp.length !== 6 || loading}
              activeOpacity={0.85}
            >
              {loading ? (
                <ActivityIndicator color={colors.primary} />
              ) : (
                <Text className="text-accent-foreground text-lg font-bold">Verify & Login</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              className="items-center py-3"
              onPress={handleSendOtp}
              disabled={countdown > 0 || loading}
            >
              <Text className={`text-sm font-medium ${countdown > 0 ? 'text-muted-foreground/50' : 'text-accent'}`}>
                {countdown > 0 ? `Resend code in ${countdown}s` : 'Resend code'}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}
