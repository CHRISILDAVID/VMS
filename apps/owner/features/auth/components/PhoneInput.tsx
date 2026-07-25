import React, { forwardRef } from 'react';
import { View, Text, TextInput, StyleSheet, TextInputProps } from 'react-native';
import { COLORS } from '@vms/shared/utils';

interface PhoneInputProps extends TextInputProps {
  error?: string;
}

export const PhoneInput = forwardRef<TextInput, PhoneInputProps>(
  ({ error, style, ...props }, ref) => {
    return (
      <View style={styles.container}>
        <View style={[styles.inputContainer, error && styles.inputError]}>
          <View style={styles.prefixContainer}>
            <Text style={styles.prefixText}>+91</Text>
          </View>
          <View style={styles.divider} />
          <TextInput
            ref={ref}
            style={[styles.input, style]}
            keyboardType="phone-pad"
            maxLength={10}
            placeholderTextColor={COLORS.textMuted}
            {...props}
          />
        </View>
        {error ? <Text style={styles.errorText}>{error}</Text> : null}
      </View>
    );
  }
);

PhoneInput.displayName = 'PhoneInput';

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginBottom: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    borderRadius: 12,
    height: 56,
    overflow: 'hidden',
  },
  inputError: {
    borderColor: COLORS.danger,
    backgroundColor: 'rgba(220,38,38,0.1)',
  },
  prefixContainer: {
    paddingHorizontal: 16,
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
  },
  prefixText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
  divider: {
    width: 1,
    height: 24,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  input: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 16,
    paddingHorizontal: 16,
    height: '100%',
  },
  errorText: {
    color: COLORS.dangerLight,
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
});
