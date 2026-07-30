import React, { useMemo } from 'react';
import { View, StyleSheet, ScrollView, Text, TouchableOpacity, Animated } from 'react-native';
import { Court, Booking, MembershipSlot } from '@vms/shared/types';
import { 
  processBookingsToBlocks, 
  HOUR_WIDTH, 
  COURT_LABEL_WIDTH, 
  START_HOUR, 
  END_HOUR,
  HEADER_HEIGHT,
  ROW_HEIGHT,
  slotConfig,
  isHourPast
} from '../utils/scheduleHelpers';

interface TimelineGridProps {
  courts: Court[];
  bookings: Booking[];
  memberships: MembershipSlot[];
  dateStr: string;
  onSlotPress: (slot: any, court: Court) => void;
  onEmptyTap: (court: Court, hour: number) => void;
  conflictCourtId?: string;
  conflictTime?: string;
}

export function TimelineGrid({
  courts,
  bookings,
  memberships,
  dateStr,
  onSlotPress,
  onEmptyTap,
  conflictCourtId,
  conflictTime
}: TimelineGridProps) {
  const blinkAnim = React.useRef(new Animated.Value(1)).current;

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
  const hours = Array.from({ length: END_HOUR - START_HOUR }, (_, i) => START_HOUR + i);

  const blocks = useMemo(() => {
    return courts.flatMap(court => processBookingsToBlocks(court, dateStr, bookings, memberships));
  }, [courts, bookings, memberships, dateStr]);

  const today = new Date();
  const isToday = dateStr === today.toISOString().split('T')[0];
  const currentHour = today.getHours() + today.getMinutes() / 60;
  const currentHourOffset = (currentHour - START_HOUR) * HOUR_WIDTH;
  const showCurrentTime = isToday && currentHour >= START_HOUR && currentHour < END_HOUR;

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.gridWrapper}>
          
          {/* Left Sticky Column */}
          <View style={styles.courtColumn}>
            <View style={styles.cornerCell} />
            {courts.map((court) => (
              <View key={court.id} style={styles.courtLabelCell}>
                <View>
                  <Text style={styles.courtNameText}>{court.name}</Text>
                  <View style={styles.courtStatusDot} />
                </View>
              </View>
            ))}
          </View>

          {/* Right Scrollable Grid */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} bounces={false}>
            <View>
              {/* Time Header */}
              <View style={styles.timeHeaderRow}>
                {hours.map(h => (
                  <View key={h} style={styles.timeHeaderCell}>
                    <Text style={styles.timeText}>
                      {h < 12 ? `${h}AM` : h === 12 ? '12PM' : `${h - 12}PM`}
                    </Text>
                  </View>
                ))}
              </View>

              {/* Grid Area */}
              <View style={styles.gridArea}>
                {courts.map(court => (
                  <View key={court.id} style={styles.gridRow}>
                    {hours.map(h => {
                      const past = isHourPast(h, dateStr);
                      return (
                        <TouchableOpacity 
                          key={h} 
                          style={[styles.gridCell, past && styles.pastGridCell]}
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
                      style={[
                        styles.bookingBlock,
                        {
                          left: (block.startHour - START_HOUR) * HOUR_WIDTH + 2,
                          top: courtIndex * ROW_HEIGHT + 6,
                          width: block.duration * HOUR_WIDTH - 4,
                          backgroundColor: cfg.bg,
                          borderColor: isConflict ? '#EF4444' : cfg.border,
                          borderWidth: isConflict ? 2 : 1,
                          opacity: block.isPast ? 0.6 : 1,
                        }
                      ]}
                    >
                      <Animated.View style={{ flex: 1, opacity: isConflict ? blinkAnim : 1 }}>
                        <Text style={[styles.bookingBlockText, { color: cfg.text }]} numberOfLines={1}>
                          {block.label}
                        </Text>
                      </Animated.View>
                    </TouchableOpacity>
                  );
                })}

                {/* Current Time Indicator */}
                {showCurrentTime && (
                  <View style={[styles.currentTimeLine, { left: currentHourOffset }]}>
                    <View style={styles.currentTimeDot} />
                  </View>
                )}
              </View>
            </View>
          </ScrollView>
        </View>

        {/* Legend */}
        <View style={styles.legendContainer}>
          {Object.entries({ 
            booked: 'Booked', 
            coaching: 'Coaching', 
            tournament: 'Tournament', 
            blocked: 'Blocked',
            membership: 'Member'
          }).map(([k, label]) => (
            <View key={k} style={styles.legendItem}>
              <View style={[
                styles.legendColor, 
                { 
                  backgroundColor: slotConfig[k].bg, 
                  borderColor: slotConfig[k].border 
                }
              ]} />
              <Text style={styles.legendText}>{label}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollContainer: {
    flex: 1,
  },
  gridWrapper: {
    flexDirection: 'row',
  },
  courtColumn: {
    width: COURT_LABEL_WIDTH,
    backgroundColor: '#fff',
    borderRightWidth: 1,
    borderRightColor: '#F1F5F9',
    zIndex: 10,
  },
  cornerCell: {
    height: HEADER_HEIGHT,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  courtLabelCell: {
    height: ROW_HEIGHT,
    justifyContent: 'center',
    paddingLeft: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC',
  },
  courtNameText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0F172A',
  },
  courtStatusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#16A34A',
    marginTop: 3,
  },
  timeHeaderRow: {
    height: HEADER_HEIGHT,
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    backgroundColor: '#fff',
  },
  timeHeaderCell: {
    width: HOUR_WIDTH,
    justifyContent: 'center',
    paddingLeft: 8,
    borderRightWidth: 1,
    borderRightColor: '#F1F5F9',
  },
  timeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#94A3B8',
  },
  gridArea: {
    position: 'relative',
  },
  gridRow: {
    height: ROW_HEIGHT,
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC',
  },
  gridCell: {
    width: HOUR_WIDTH,
    borderRightWidth: 1,
    borderRightColor: '#F1F5F9',
    backgroundColor: '#fff',
  },
  pastGridCell: {
    backgroundColor: '#F1F5F9',
  },
  bookingBlock: {
    position: 'absolute',
    height: 52,
    borderWidth: 1.5,
    borderRadius: 10,
    justifyContent: 'center',
    paddingLeft: 10,
    paddingRight: 10,
    overflow: 'hidden',
  },
  bookingBlockText: {
    fontSize: 11,
    fontWeight: '700',
  },
  currentTimeLine: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 2,
    backgroundColor: '#DC2626',
    zIndex: 8,
  },
  currentTimeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#DC2626',
    marginLeft: -3,
    marginTop: -3,
  },
  legendContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    padding: 12,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    marginTop: 'auto',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 3,
    borderWidth: 1.5,
  },
  legendText: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '500',
  },
});
