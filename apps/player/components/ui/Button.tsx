import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, type TouchableOpacityProps } from 'react-native';
import { usePlayerThemeColors } from '../../hooks/usePlayerThemeColors';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends TouchableOpacityProps {
  label: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  disabled?: boolean;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary: 'bg-primary',
  secondary: 'bg-muted',
  outline: 'bg-transparent border border-border',
  ghost: 'bg-transparent',
  destructive: 'bg-destructive',
};

const labelClasses: Record<ButtonVariant, string> = {
  primary: 'text-primary-foreground',
  secondary: 'text-foreground',
  outline: 'text-foreground',
  ghost: 'text-foreground',
  destructive: 'text-white',
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'h-9 px-4 rounded-lg',
  md: 'h-12 px-5 rounded-xl',
  lg: 'h-14 px-6 rounded-xl',
};

const labelSizeClasses: Record<ButtonSize, string> = {
  sm: 'text-sm font-semibold',
  md: 'text-base font-semibold',
  lg: 'text-lg font-bold',
};

/**
 * Reusable Button component for the ShuttleHub Player App.
 *
 * Uses NativeWind className with semantic tokens from tailwind.config.js —
 * no hardcoded hex colors. Theme switching is automatic via CSS variables.
 *
 * @example
 * <Button label="Book Court" onPress={...} variant="primary" size="lg" />
 * <Button label="Cancel" onPress={...} variant="outline" />
 */
export function Button({
  label,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  className,
  ...rest
}: ButtonProps) {
  const { colors } = usePlayerThemeColors();
  const isDisabled = disabled || isLoading;

  return (
    <TouchableOpacity
      className={`
        flex-row items-center justify-center gap-2
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${isDisabled ? 'opacity-50' : 'opacity-100'}
        ${className ?? ''}
      `}
      disabled={isDisabled}
      activeOpacity={0.85}
      {...rest}
    >
      {isLoading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'primary' ? colors.primaryForeground : colors.foreground}
        />
      ) : (
        <Text className={`${labelClasses[variant]} ${labelSizeClasses[size]}`}>
          {label}
        </Text>
      )}
    </TouchableOpacity>
  );
}
