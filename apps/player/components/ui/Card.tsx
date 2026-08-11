import React from 'react';
import { View, type ViewProps } from 'react-native';

interface CardProps extends ViewProps {
  /** Remove default padding */
  noPadding?: boolean;
  /** Remove shadow */
  flat?: boolean;
}

/**
 * Reusable Card surface component.
 * Uses bg-card token — automatically switches in dark/light mode.
 *
 * @example
 * <Card className="mb-4">
 *   <Text>Card content</Text>
 * </Card>
 */
export function Card({ children, noPadding = false, flat = false, className, ...rest }: CardProps) {
  return (
    <View
      className={`
        bg-card border border-border rounded-2xl
        ${noPadding ? '' : 'p-4'}
        ${flat ? '' : 'shadow-sm'}
        ${className ?? ''}
      `}
      {...rest}
    >
      {children}
    </View>
  );
}
