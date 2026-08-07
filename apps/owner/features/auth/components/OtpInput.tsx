import React, { useRef, useState, useEffect } from 'react';
import { View, TextInput } from 'react-native';
import { useThemeColors } from '../../../hooks/useThemeColors';

interface OtpInputProps {
  length?: number;
  value: string;
  onChange: (value: string) => void;
  error?: boolean;
}

export function OtpInput({ length = 6, value, onChange, error }: OtpInputProps) {
  const inputsRef = useRef<Array<TextInput | null>>([]);
  const [focusedIndex, setFocusedIndex] = useState<number>(0);
  const { colors } = useThemeColors();

  useEffect(() => {
    // Auto focus first input on mount
    if (inputsRef.current[0]) {
      inputsRef.current[0].focus();
    }
  }, []);

  const handleChangeText = (text: string, index: number) => {
    const numericValue = text.replace(/[^0-9]/g, '');
    
    // Handle paste of full OTP
    if (numericValue.length > 1) {
      const pastedOtp = numericValue.slice(0, length);
      onChange(pastedOtp);
      // Focus last filled input or next empty one
      const nextIndex = Math.min(pastedOtp.length, length - 1);
      inputsRef.current[nextIndex]?.focus();
      return;
    }

    const newValue = value.split('');
    newValue[index] = numericValue;
    const newOtp = newValue.join('');
    onChange(newOtp);

    // Auto advance
    if (numericValue && index < length - 1) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !value[index] && index > 0) {
      // Focus previous input on backspace if current is empty
      inputsRef.current[index - 1]?.focus();
      
      // Also clear the previous input's value
      const newValue = value.split('');
      newValue[index - 1] = '';
      onChange(newValue.join(''));
    }
  };

  return (
    <View className="flex-row justify-between w-full mb-6">
      {Array(length)
        .fill(0)
        .map((_, index) => {
          let baseClass = "w-12 h-14 bg-white/10 border rounded-xl text-white text-2xl font-semibold text-center";
          let borderClass = "border-white/20";
          if (error) {
            borderClass = "border-destructive text-destructive";
          } else if (focusedIndex === index) {
            borderClass = "border-white bg-white/15";
          }

          return (
            <TextInput
              key={index}
              ref={(ref: any) => (inputsRef.current[index] = ref)}
              className={`${baseClass} ${borderClass}`}
              keyboardType="number-pad"
              maxLength={1}
              value={value[index] || ''}
              onChangeText={(text) => handleChangeText(text, index)}
              onKeyPress={(e) => handleKeyPress(e, index)}
              onFocus={() => setFocusedIndex(index)}
              onBlur={() => setFocusedIndex(-1)}
              selectTextOnFocus
            />
          );
        })}
    </View>
  );
}
