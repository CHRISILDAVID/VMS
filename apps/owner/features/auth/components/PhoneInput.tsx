import React, { forwardRef } from 'react';
import { View, Text, TextInput, TextInputProps } from 'react-native';
import { useThemeColors } from '../../../hooks/useThemeColors';

interface PhoneInputProps extends TextInputProps {
  error?: string;
}

export const PhoneInput = forwardRef<TextInput, PhoneInputProps>(
  ({ error, style, ...props }, ref) => {
    const { colors } = useThemeColors();

    return (
      <View className="w-full mb-4">
        <View className={`flex-row items-center bg-white/10 border rounded-xl h-14 overflow-hidden ${error ? 'border-destructive bg-destructive/10' : 'border-white/20'}`}>
          <View className="px-4 justify-center items-center h-full">
            <Text className="text-white text-base font-medium">+91</Text>
          </View>
          <View className="w-px h-6 bg-white/20" />
          <TextInput
            ref={ref}
            className="flex-1 text-white text-base px-4 h-full"
            keyboardType="phone-pad"
            maxLength={10}
            placeholderTextColor="rgba(255,255,255,0.4)"
            {...props}
          />
        </View>
        {error ? <Text className="text-red-400 text-xs mt-1 ml-1">{error}</Text> : null}
      </View>
    );
  }
);

PhoneInput.displayName = 'PhoneInput';
