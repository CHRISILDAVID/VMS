import React, { useState, useEffect } from 'react';
import { View, Text, KeyboardAvoidingView, Platform, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { PhoneInput } from './PhoneInput';
import { OtpInput } from './OtpInput';
import { useAuth } from '../hooks/useAuth';
import { ArrowRight, ArrowLeft } from 'lucide-react-native';
import { useThemeColors } from '../../../hooks/useThemeColors';

export function LoginForm() {
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [countdown, setCountdown] = useState(0);
  const { colors } = useThemeColors();
  
  const { signInWithOtp, verifyOtp, loading, error } = useAuth();

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(c => c - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleSendOtp = async () => {
    if (phone.length < 10) {
      Alert.alert('Error', 'Enter a valid 10-digit phone number');
      return;
    }

    try {
      await signInWithOtp(phone);
      setStep('otp');
      setCountdown(30);
      Alert.alert('Success', 'OTP sent successfully');
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to send OTP');
    }
  };

  const handleVerifyOtp = async (code = otp) => {
    if (code.length !== 6) return; // Supabase default OTP length is 6
    try {
      await verifyOtp(phone, code);
      // Navigation is handled by AuthGuard in _layout.tsx
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Invalid OTP');
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1"
    >
      <View className="flex-1 justify-center p-6">
        <View className="mb-10">
          <Text className="text-[32px] font-extrabold text-white mb-2">Badminton Manager</Text>
          <Text className="text-base text-white/70">
            {step === 'phone' ? 'Enter your phone number to sign in' : 'Enter the OTP sent to your phone'}
          </Text>
        </View>

        {step === 'phone' ? (
          <View className="gap-4">
            <PhoneInput
              value={phone}
              onChangeText={setPhone}
              placeholder="00000 00000"
              autoFocus
              editable={!loading}
            />
            <TouchableOpacity 
              className={`bg-primary h-14 rounded-xl flex-row items-center justify-center gap-2 ${(phone.length !== 10 || loading) ? 'opacity-60' : ''}`} 
              onPress={handleSendOtp}
              disabled={phone.length !== 10 || loading}
            >
              {loading ? (
                <ActivityIndicator color={colors.primaryForeground} />
              ) : (
                <>
                  <Text className="text-primary-foreground text-lg font-semibold">Continue</Text>
                  <ArrowRight size={20} color={colors.primaryForeground} />
                </>
              )}
            </TouchableOpacity>
          </View>
        ) : (
          <View className="gap-4">
             <View className="flex-row justify-between items-center mb-6">
                <Text className="text-white text-base font-medium">+91 {phone}</Text>
                <TouchableOpacity onPress={() => setStep('phone')} disabled={loading}>
                  <Text className="text-indigo-400 text-sm font-semibold">Edit</Text>
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
              className={`bg-primary h-14 rounded-xl items-center justify-center ${(otp.length !== 6 || loading) ? 'opacity-60' : ''}`} 
              onPress={() => handleVerifyOtp()}
              disabled={otp.length !== 6 || loading}
            >
              {loading ? (
                <ActivityIndicator color={colors.primaryForeground} />
              ) : (
                <Text className="text-primary-foreground text-lg font-semibold">Verify</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity 
              className="items-center py-4" 
              onPress={handleSendOtp}
              disabled={countdown > 0 || loading}
            >
              <Text className={`text-sm font-medium ${countdown > 0 ? 'text-white/40' : 'text-indigo-400'}`}>
                {countdown > 0 ? `Resend code in ${countdown}s` : 'Resend code'}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}
