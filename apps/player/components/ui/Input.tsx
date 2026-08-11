import React from 'react';
import { View, Text, TextInput, type TextInputProps } from 'react-native';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  hint?: string;
}

/**
 * Reusable Input component for ShuttleHub.
 * Supports optional label, error message, and hint text.
 * Uses semantic NativeWind tokens — no hardcoded hex.
 *
 * @example
 * <Input label="Full Name" error={errors.name?.message} value={...} onChangeText={...} />
 */
export function Input({ label, error, hint, className, ...rest }: InputProps) {
  const hasError = !!error;

  return (
    <View className="gap-1.5">
      {label && (
        <Text className="text-sm font-semibold text-foreground">{label}</Text>
      )}
      <TextInput
        className={`
          h-14 px-4 rounded-xl
          bg-card border text-foreground text-base
          ${hasError ? 'border-destructive' : 'border-border'}
          ${className ?? ''}
        `}
        placeholderTextColor="#94A3B8"
        {...rest}
      />
      {hasError && (
        <Text className="text-destructive text-xs font-medium">{error}</Text>
      )}
      {hint && !hasError && (
        <Text className="text-muted-foreground text-xs">{hint}</Text>
      )}
    </View>
  );
}
