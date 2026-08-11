import React from 'react';
import { View, Text, ScrollView, Alert, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'expo-router';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import { useAuthContext } from '../../../contexts/AuthContext';
import { createPlayersService } from '@vms/shared/services';
import { supabase } from '../../../lib/supabase';

const profileSchema = z.object({
  full_name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(60, 'Name is too long'),
  city: z
    .string()
    .min(2, 'City is required')
    .max(50, 'City name is too long'),
  date_of_birth: z.string().optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

const playersService = createPlayersService(supabase);

export function CreateProfileForm() {
  const router = useRouter();
  const { user, refreshPlayerProfile } = useAuthContext();

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: { full_name: '', city: '' },
  });

  const onSubmit = async (data: ProfileFormData) => {
    if (!user) return;

    try {
      await playersService.createPlayer(user.id, {
        full_name: data.full_name.trim(),
        phone: user.phone ?? '',
        city: data.city.trim(),
        date_of_birth: data.date_of_birth || undefined,
      });

      await refreshPlayerProfile();
      // AuthGuard will redirect to tabs once playerProfile is set
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to create profile. Please try again.');
    }
  };

  return (
    <ScrollView
      className="flex-1 px-6"
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      <View className="py-8">
        {/* Header */}
        <View className="mb-8">
          <View className="flex-row items-center gap-2 mb-3">
            <View className="w-3 h-3 rounded-full bg-accent" />
            <Text className="text-accent text-sm font-semibold tracking-widest uppercase">
              ShuttleHub
            </Text>
          </View>
          <Text className="text-3xl font-extrabold text-foreground mb-2 leading-tight">
            Set Up Your{'\n'}Profile 🏸
          </Text>
          <Text className="text-muted-foreground text-base">
            Tell us a bit about yourself to get started
          </Text>
        </View>

        {/* Form */}
        <View className="gap-4">
          <Controller
            control={control}
            name="full_name"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="Full Name"
                placeholder="e.g. Ravi Kumar"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.full_name?.message}
                autoCapitalize="words"
                returnKeyType="next"
              />
            )}
          />

          <Controller
            control={control}
            name="city"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="City"
                placeholder="e.g. Chennai"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.city?.message}
                autoCapitalize="words"
                returnKeyType="done"
              />
            )}
          />
        </View>

        {/* CTA */}
        <View className="mt-8">
          <Button
            label={isSubmitting ? 'Creating Profile...' : 'Get Started →'}
            onPress={handleSubmit(onSubmit)}
            disabled={isSubmitting}
            isLoading={isSubmitting}
            variant="primary"
            size="lg"
          />
        </View>

        <Text className="text-muted-foreground text-xs text-center mt-4">
          By continuing, you agree to ShuttleHub's Terms of Service
        </Text>
      </View>
    </ScrollView>
  );
}
