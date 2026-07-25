import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, TouchableOpacity, ActivityIndicator } from 'react-native';
import { PhoneInput } from './PhoneInput';
import { OtpInput } from './OtpInput';
import { COLORS, SPACING, RADIUS } from '@vms/shared/utils';
import { useAuth } from '../hooks/useAuth';
import { Alert } from 'react-native';
import { ArrowRight, ArrowLeft } from 'lucide-react-native';

export function LoginForm() {
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [countdown, setCountdown] = useState(0);
  
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
      style={styles.container}
    >
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Badminton Manager</Text>
          <Text style={styles.subtitle}>
            {step === 'phone' ? 'Enter your phone number to sign in' : 'Enter the OTP sent to your phone'}
          </Text>
        </View>

        {step === 'phone' ? (
          <View style={styles.form}>
            <PhoneInput
              value={phone}
              onChangeText={setPhone}
              placeholder="00000 00000"
              autoFocus
              editable={!loading}
            />
            <TouchableOpacity 
              style={[styles.button, (phone.length !== 10 || loading) && styles.buttonDisabled]} 
              onPress={handleSendOtp}
              disabled={phone.length !== 10 || loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <>
                  <Text style={styles.buttonText}>Continue</Text>
                  <ArrowRight size={20} color="#FFF" />
                </>
              )}
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.form}>
             <View style={styles.phoneDisplay}>
                <Text style={styles.phoneDisplayText}>+91 {phone}</Text>
                <TouchableOpacity onPress={() => setStep('phone')} disabled={loading}>
                  <Text style={styles.editLink}>Edit</Text>
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
              style={[styles.button, (otp.length !== 6 || loading) && styles.buttonDisabled]} 
              onPress={() => handleVerifyOtp()}
              disabled={otp.length !== 6 || loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <Text style={styles.buttonText}>Verify</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.resendButton} 
              onPress={handleSendOtp}
              disabled={countdown > 0 || loading}
            >
              <Text style={[styles.resendText, countdown > 0 && styles.resendDisabled]}>
                {countdown > 0 ? `Resend code in ${countdown}s` : 'Resend code'}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    padding: SPACING.xl,
  },
  header: {
    marginBottom: SPACING.xl * 1.5,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: SPACING.sm,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.7)',
  },
  form: {
    gap: SPACING.md,
  },
  button: {
    backgroundColor: COLORS.primary,
    height: 56,
    borderRadius: RADIUS.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  phoneDisplay: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  phoneDisplayText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
  editLink: {
    color: COLORS.primaryLight,
    fontSize: 14,
    fontWeight: '600',
  },
  resendButton: {
    alignItems: 'center',
    paddingVertical: SPACING.md,
  },
  resendText: {
    color: COLORS.primaryLight,
    fontSize: 14,
    fontWeight: '500',
  },
  resendDisabled: {
    color: 'rgba(255,255,255,0.4)',
  },
});
