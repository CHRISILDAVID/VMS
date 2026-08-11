import React from 'react';
import { View, Text } from 'react-native';

type BadgeVariant = 'accent' | 'success' | 'warning' | 'destructive' | 'muted' | 'outline';

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
  className?: string;
}

const variantConfig: Record<BadgeVariant, { bg: string; text: string }> = {
  accent: { bg: 'bg-accent', text: 'text-accent-foreground' },
  success: { bg: 'bg-success/20', text: 'text-success' },
  warning: { bg: 'bg-warning/20', text: 'text-warning' },
  destructive: { bg: 'bg-destructive/20', text: 'text-destructive' },
  muted: { bg: 'bg-muted', text: 'text-muted-foreground' },
  outline: { bg: 'bg-transparent border border-border', text: 'text-foreground' },
};

/**
 * Reusable Badge/pill component.
 * Uses semantic tokens — no hardcoded hex.
 *
 * @example
 * <Badge label="Live" variant="accent" />
 * <Badge label="Registration Open" variant="success" />
 */
export function Badge({ label, variant = 'muted', className }: BadgeProps) {
  const { bg, text } = variantConfig[variant];

  return (
    <View className={`self-start rounded-full px-2.5 py-0.5 ${bg} ${className ?? ''}`}>
      <Text className={`text-xs font-semibold ${text}`}>{label}</Text>
    </View>
  );
}
