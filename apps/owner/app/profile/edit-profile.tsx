import React, { useState } from 'react';
import { View, Text, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, Alert, TextInput, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, Save } from 'lucide-react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuthContext } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { formatPhone } from '@vms/shared/utils';
import { useThemeColors } from '../../hooks/useThemeColors';

const schema = z.object({
  full_name: z.string().min(2, 'Name is too short').max(50, 'Name is too long'),
  email: z.string().email('Invalid email address').or(z.literal('')),
  avatar_url: z.string().url('Invalid URL').or(z.literal('')),
});

type FormData = z.infer<typeof schema>;

export default function EditProfileScreen() {
  const router = useRouter();
  const { ownerProfile, user, refreshOwnerProfile } = useAuthContext();
  const [isSaving, setIsSaving] = useState(false);
  const { colors } = useThemeColors();

  const { control, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      full_name: ownerProfile?.full_name || '',
      email: ownerProfile?.email || '',
      avatar_url: ownerProfile?.avatar_url || '',
    },
  });

  const onSubmit = async (data: FormData) => {
    if (!user) return;
    
    try {
      setIsSaving(true);
      const { error } = await supabase
        .from('owners')
        .update({
          full_name: data.full_name,
          email: data.email || null,
          avatar_url: data.avatar_url || null,
        })
        .eq('id', user.id);

      if (error) throw error;
      
      await refreshOwnerProfile();
      router.back();
    } catch (err: any) {
      console.error('Error updating profile:', err);
      Alert.alert('Error', err.message || 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <KeyboardAvoidingView 
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View className="flex-row items-center justify-between px-5 py-4 bg-card border-b border-border">
          <TouchableOpacity className="w-10 h-10 items-center justify-center rounded-full bg-muted" onPress={() => router.back()}>
            <ArrowLeft size={24} color={colors.foreground} />
          </TouchableOpacity>
          <Text className="text-lg font-bold text-foreground">Edit Profile</Text>
          <View className="w-10" />
        </View>

        <ScrollView contentContainerStyle={{ padding: 20 }}>
          <View className="p-5 bg-card rounded-2xl border border-border">
            <View className="items-center mb-6">
              <View className="w-20 h-20 rounded-3xl bg-primary/10 items-center justify-center border-2 border-primary/20">
                <Text className="text-[32px] font-extrabold text-primary">
                  {ownerProfile?.full_name ? ownerProfile.full_name.charAt(0).toUpperCase() : 'O'}
                </Text>
              </View>
            </View>

            <View className="mb-4 gap-1.5">
              <Text className="text-sm font-semibold text-foreground ml-1">Full Name</Text>
              <Controller
                control={control}
                name="full_name"
                render={({ field: { onChange, onBlur, value } }) => (
                  <View>
                    <TextInput
                      className={`bg-background border border-border rounded-xl h-14 px-4 text-[15px] text-foreground ${errors.full_name ? 'border-destructive' : ''}`}
                      placeholder="John Doe"
                      placeholderTextColor={colors.mutedForeground}
                      onBlur={onBlur}
                      onChangeText={onChange}
                      value={value}
                    />
                    {errors.full_name && <Text className="text-xs text-destructive mt-1 ml-1">{errors.full_name.message}</Text>}
                  </View>
                )}
              />
            </View>

            <View className="mb-4 gap-1.5">
              <Text className="text-sm font-semibold text-foreground ml-1">Phone Number</Text>
              <TextInput
                className="bg-muted border border-border rounded-xl h-14 px-4 text-[15px] text-muted-foreground"
                value={ownerProfile?.phone 
                  ? formatPhone(ownerProfile.phone)
                  : ''}
                editable={false}
              />
              <Text className="text-xs text-muted-foreground mt-1 ml-1">Phone number cannot be changed</Text>
            </View>

            <View className="mb-4 gap-1.5">
              <Text className="text-sm font-semibold text-foreground ml-1">Email Address</Text>
              <Controller
                control={control}
                name="email"
                render={({ field: { onChange, onBlur, value } }) => (
                  <View>
                    <TextInput
                      className={`bg-background border border-border rounded-xl h-14 px-4 text-[15px] text-foreground ${errors.email ? 'border-destructive' : ''}`}
                      placeholder="john@example.com"
                      placeholderTextColor={colors.mutedForeground}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      onBlur={onBlur}
                      onChangeText={onChange}
                      value={value}
                    />
                    {errors.email && <Text className="text-xs text-destructive mt-1 ml-1">{errors.email.message}</Text>}
                  </View>
                )}
              />
            </View>

          </View>
        </ScrollView>

        <View className="p-5 bg-card border-t border-border">
          <TouchableOpacity 
            className={`bg-primary h-14 rounded-2xl items-center justify-center w-full ${isSaving ? 'opacity-70' : ''}`}
            onPress={handleSubmit(onSubmit)}
            disabled={isSaving}
          >
            {isSaving ? (
              <ActivityIndicator color={colors.primaryForeground} />
            ) : (
              <Text className="text-base font-bold text-primary-foreground">Save Changes</Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
