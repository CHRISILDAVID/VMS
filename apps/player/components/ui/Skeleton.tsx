import React, { useEffect, useRef } from 'react';
import { Animated, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { usePlayerThemeColors } from '../../hooks/usePlayerThemeColors';

interface SkeletonProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  className?: string;
}

/**
 * Skeleton — animated shimmer placeholder for loading states.
 * Uses LinearGradient from expo-linear-gradient.
 */
export function Skeleton({
  width = '100%',
  height = 20,
  borderRadius = 8,
  className,
}: SkeletonProps) {
  const { isDark } = usePlayerThemeColors();
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(shimmerAnim, {
        toValue: 1,
        duration: 1200,
        useNativeDriver: false,
      })
    ).start();
  }, []);

  const translateX = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-200, 400],
  });

  const baseColor = isDark ? '#1A3655' : '#EEF1F5';
  const shimmerColors: [string, string, string] = isDark
    ? ['#1A3655', '#203F65', '#1A3655']
    : ['#EEF1F5', '#E0E8F0', '#EEF1F5'];

  return (
    <View
      style={{
        width: width as any,
        height,
        borderRadius,
        backgroundColor: baseColor,
        overflow: 'hidden',
      }}
      className={className}
    >
      <Animated.View
        style={{
          position: 'absolute',
          top: 0,
          bottom: 0,
          width: 200,
          transform: [{ translateX }],
        }}
      >
        <LinearGradient
          colors={shimmerColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={{ flex: 1 }}
        />
      </Animated.View>
    </View>
  );
}

/**
 * SkeletonCard — common card-shaped skeleton for list items.
 */
export function SkeletonCard({ lines = 3 }: { lines?: number }) {
  return (
    <View className="bg-card rounded-2xl p-4 gap-3">
      <Skeleton height={16} width="60%" borderRadius={6} />
      {Array.from({ length: lines - 1 }).map((_, i) => (
        <Skeleton key={i} height={12} width={i === lines - 2 ? '40%' : '80%'} borderRadius={4} />
      ))}
    </View>
  );
}
