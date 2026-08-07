import React, { useMemo } from 'react';
import { View, ScrollView, Text, TouchableOpacity, Animated } from 'react-native';
import { Court, Booking, MembershipSlot } from '@vms/shared/types';
import { 
  processBookingsToBlocks, 
  HOUR_WIDTH, 
  COURT_LABEL_WIDTH, 
  HEADER_HEIGHT,
  ROW_HEIGHT,
  slotConfig,
  isHourPast
} from '../utils/scheduleHelpers';
import { useThemeColors } from '../../../hooks/useThemeColors';

interface TimelineGridProps {
  courts: Court[];
  bookings: Booking[];
  memberships: MembershipSlot[];
  dateStr: string;
  onSlotPress: (slot: any, court: Court) => void;
  onEmptyTap: (court: Court, hour: number) => void;
  conflictCourtId?: string;
  conflictTime?: string;
  openHour: number;
  closeHour: number;
}

export function TimelineGrid({
  courts,
  bookings,
  memberships,
  dateStr,
  onSlotPress,
  onEmptyTap,
  conflictCourtId,
  conflictTime,
  openHour,
  closeHour
}: TimelineGridProps) {
  const blinkAnim = React.useRef(new Animated.Value(1)).current;
  const scrollRef = React.useRef<ScrollView>(null);
  const { colors } = useThemeColors();

  React.useEffect(() => {
    if (conflictCourtId && conflictTime) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(blinkAnim, { toValue: 0.2, duration: 400, useNativeDriver: true }),
          Animated.timing(blinkAnim, { toValue: 1, duration: 400, useNativeDriver: true })
        ])
      ).start();
    } else {
      blinkAnim.setValue(1);
    }
  }, [conflictCourtId, conflictTime, blinkAnim]);
  const hours = Array.from({ length: closeHour - openHour }, (_, i) => openHour + i);

  const blocks = useMemo(() => {
    return courts.flatMap(court => processBookingsToBlocks(court, dateStr, bookings, memberships, openHour, closeHour));
  }, [courts, bookings, memberships, dateStr, openHour, closeHour]);

  const today = new Date();
  const isToday = dateStr === today.toISOString().split('T')[0];
  const currentHour = today.getHours() + today.getMinutes() / 60;
  const currentHourOffset = (currentHour - openHour) * HOUR_WIDTH;
  const showCurrentTime = isToday && currentHour >= openHour && currentHour < closeHour;

  React.useEffect(() => {
    if (showCurrentTime && scrollRef.current) {
      setTimeout(() => {
        scrollRef.current?.scrollTo({ x: Math.max(0, currentHourOffset - 40), animated: false });
      }, 100);
    }
  }, [showCurrentTime, currentHourOffset]);

  return (
    <View className="flex-1 bg-background">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View style={{ flexDirection: 'row' }}>
          
          {/* Left Sticky Column */}
          <View style={{ width: COURT_LABEL_WIDTH, backgroundColor: colors.card, borderRightWidth: 1, borderRightColor: colors.border, zIndex: 10 }}>
            <View style={{ height: HEADER_HEIGHT, borderBottomWidth: 1, borderBottomColor: colors.border }} />
            {courts.map((court) => (
              <View key={court.id} style={{ height: ROW_HEIGHT, justifyContent: 'center', paddingLeft: 12, borderBottomWidth: 1, borderBottomColor: colors.background }}>
                <View>
                  <Text style={{ fontSize: 11, fontWeight: '700', color: colors.foreground }}>{court.name}</Text>
                  <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#16A34A', marginTop: 3 }} />
                </View>
              </View>
            ))}
          </View>

          {/* Right Scrollable Grid */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} bounces={false} ref={scrollRef}>
            <View>
              {/* Time Header */}
              <View style={{ height: HEADER_HEIGHT, flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: colors.border, backgroundColor: colors.card }}>
                {hours.map(h => (
                  <View key={h} style={{ width: HOUR_WIDTH, justifyContent: 'center', paddingLeft: 8, borderRightWidth: 1, borderRightColor: colors.border }}>
                    <Text style={{ fontSize: 10, fontWeight: '600', color: colors.mutedForeground }}>
                      {(() => {
                        const displayHour = h % 24;
                        if (displayHour === 0) return '12AM';
                        if (displayHour < 12) return `${displayHour}AM`;
                        if (displayHour === 12) return '12PM';
                        return `${displayHour - 12}PM`;
                      })()}
                    </Text>
                  </View>
                ))}
              </View>

              {/* Grid Area */}
              <View style={{ position: 'relative' }}>
                {courts.map(court => (
                  <View key={court.id} style={{ height: ROW_HEIGHT, flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: colors.background }}>
                    {hours.map(h => {
                      const past = isHourPast(h, dateStr);
                      return (
                        <TouchableOpacity 
                          key={h} 
                          style={{ width: HOUR_WIDTH, borderRightWidth: 1, borderRightColor: colors.border, backgroundColor: past ? colors.muted : colors.card }}
                          onPress={() => {
                            if (!past) onEmptyTap(court, h);
                          }}
                          activeOpacity={past ? 1 : 0.2}
                        />
                      );
                    })}
                  </View>
                ))}

                {/* Booking Blocks */}
                {blocks.map((block, i) => {
                  const cfg = slotConfig[block.status] || slotConfig.booked;
                  const courtIndex = courts.findIndex(c => c.id === block.courtId);
                  
                  const isConflict = block.courtId === conflictCourtId && block.time === conflictTime;
                  
                  return (
                    <TouchableOpacity
                      key={`${block.courtId}-${i}`}
                      onPress={() => {
                        const court = courts.find(c => c.id === block.courtId);
                        if (court) onSlotPress(block, court);
                      }}
                      style={{
                        position: 'absolute',
                        height: 52,
                        borderWidth: isConflict ? 2 : 1.5,
                        borderRadius: 10,
                        justifyContent: 'center',
                        paddingLeft: 10,
                        paddingRight: 10,
                        overflow: 'hidden',
                        left: (block.startHour - openHour) * HOUR_WIDTH + 2,
                        top: courtIndex * ROW_HEIGHT + 6,
                        width: block.duration * HOUR_WIDTH - 4,
                        backgroundColor: cfg.bg,
                        borderColor: isConflict ? '#EF4444' : cfg.border,
                        opacity: block.isPast ? 0.6 : 1,
                      }}
                    >
                      <Animated.View style={{ flex: 1, opacity: isConflict ? blinkAnim : 1 }}>
                        <Text style={{ fontSize: 11, fontWeight: '700', color: cfg.text }} numberOfLines={1}>
                          {block.label}
                        </Text>
                      </Animated.View>
                    </TouchableOpacity>
                  );
                })}

                {/* Current Time Indicator */}
                {showCurrentTime && (
                  <View style={{ position: 'absolute', top: 0, bottom: 0, width: 2, backgroundColor: '#DC2626', zIndex: 8, left: currentHourOffset }}>
                    <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#DC2626', marginLeft: -3, marginTop: -3 }} />
                  </View>
                )}
              </View>
            </View>
          </ScrollView>
        </View>

        {/* Legend */}
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12, padding: 12, paddingHorizontal: 16, backgroundColor: colors.card, borderTopWidth: 1, borderTopColor: colors.border }}>
          {Object.entries({ 
            booked: 'Booked', 
            coaching: 'Coaching', 
            tournament: 'Tournament', 
            blocked: 'Blocked',
            membership: 'Member'
          }).map(([k, label]) => (
            <View key={k} style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <View style={{ 
                width: 12, 
                height: 12, 
                borderRadius: 3, 
                borderWidth: 1.5,
                backgroundColor: slotConfig[k].bg, 
                borderColor: slotConfig[k].border 
              }} />
              <Text style={{ fontSize: 11, color: colors.mutedForeground, fontWeight: '500' }}>{label}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}
