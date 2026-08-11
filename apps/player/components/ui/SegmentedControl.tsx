import React, { useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, Animated } from 'react-native';
import { usePlayerThemeColors } from '../../hooks/usePlayerThemeColors';

interface SegmentedControlProps {
  segments: string[];
  selectedIndex: number;
  onChange: (index: number) => void;
  /** Visual variant: 'pill' = sliding background, 'underline' = bottom bar */
  variant?: 'pill' | 'underline';
}

/**
 * SegmentedControl — Animated tab selector styled with Navy+Lime theme.
 * Uses Animated.Value for a smooth sliding indicator.
 */
export function SegmentedControl({
  segments,
  selectedIndex,
  onChange,
  variant = 'pill',
}: SegmentedControlProps) {
  const { colors } = usePlayerThemeColors();
  const animatedIndex = useRef(new Animated.Value(selectedIndex)).current;
  const [containerWidth, setContainerWidth] = React.useState(0);

  useEffect(() => {
    Animated.spring(animatedIndex, {
      toValue: selectedIndex,
      useNativeDriver: false,
      tension: 120,
      friction: 12,
    }).start();
  }, [selectedIndex]);

  const segmentWidth = containerWidth > 0 ? containerWidth / segments.length : 0;
  const indicatorLeft = animatedIndex.interpolate({
    inputRange: segments.map((_, i) => i),
    outputRange: segments.map((_, i) => i * segmentWidth + 3),
  });

  if (variant === 'underline') {
    return (
      <View
        className="flex-row border-b border-border"
        onLayout={(e) => setContainerWidth(e.nativeEvent.layout.width)}
      >
        {segments.map((seg, idx) => (
          <TouchableOpacity
            key={seg}
            className="flex-1 items-center pb-3 pt-2"
            onPress={() => onChange(idx)}
            activeOpacity={0.7}
          >
            <Text
              className={`text-sm font-bold ${
                selectedIndex === idx ? 'text-accent' : 'text-muted-foreground'
              }`}
            >
              {seg}
            </Text>
          </TouchableOpacity>
        ))}
        <Animated.View
          style={{
            position: 'absolute',
            bottom: 0,
            height: 2,
            backgroundColor: colors.accent,
            borderRadius: 9999,
            width: segmentWidth - 16,
            left: indicatorLeft,
            marginHorizontal: 8,
          }}
        />
      </View>
    );
  }

  // Default: pill variant
  return (
    <View
      className="flex-row bg-muted rounded-2xl p-0.5 relative"
      onLayout={(e) => setContainerWidth(e.nativeEvent.layout.width)}
    >
      {/* Animated pill indicator */}
      {segmentWidth > 0 && (
        <Animated.View
          style={{
            position: 'absolute',
            top: 2,
            bottom: 2,
            borderRadius: 12,
            backgroundColor: colors.primary,
            width: segmentWidth - 6,
            left: indicatorLeft,
          }}
        />
      )}
      {segments.map((seg, idx) => {
        const isActive = selectedIndex === idx;
        return (
          <TouchableOpacity
            key={seg}
            className="flex-1 items-center py-2 rounded-xl z-10"
            onPress={() => onChange(idx)}
            activeOpacity={0.7}
          >
            <Text
              className={`text-sm font-bold ${
                isActive ? 'text-primary-foreground' : 'text-muted-foreground'
              }`}
            >
              {seg}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
