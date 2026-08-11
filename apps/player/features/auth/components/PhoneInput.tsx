import React from 'react';
import { View, Text, TextInput } from 'react-native';

interface PhoneInputProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  autoFocus?: boolean;
  editable?: boolean;
}

export function PhoneInput({
  value,
  onChangeText,
  placeholder = '00000 00000',
  autoFocus = false,
  editable = true,
}: PhoneInputProps) {
  return (
    <View className="flex-row items-center bg-card border border-border rounded-xl overflow-hidden h-14">
      {/* Country code prefix */}
      <View className="px-4 h-full justify-center border-r border-border">
        <Text className="text-foreground text-base font-semibold">+91</Text>
      </View>
      <TextInput
        className="flex-1 px-4 text-foreground text-base"
        value={value}
        onChangeText={(text) => onChangeText(text.replace(/\D/g, '').slice(0, 10))}
        placeholder={placeholder}
        placeholderTextColor="#94A3B8"
        keyboardType="phone-pad"
        maxLength={10}
        autoFocus={autoFocus}
        editable={editable}
        returnKeyType="done"
      />
    </View>
  );
}
