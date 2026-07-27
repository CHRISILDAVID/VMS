import React, { forwardRef, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import BottomSheet, { BottomSheetBackdrop } from '@gorhom/bottom-sheet';
import { Court } from '@vms/shared/types';
import { Eye, Pencil, CalendarPlus, Ban, Trophy, GraduationCap, X, Users, Unlock } from 'lucide-react-native';
import { COLORS } from '@vms/shared/utils';
import { isHourPast } from '../utils/scheduleHelpers';

interface SlotBottomSheetProps {
  slot: any | null;
  court: Court | null;
  hour: number | null;
  dateStr?: string;
  onClose: () => void;
  onActionPress?: (actionLabel: string, slot: any | null, court: Court, hour: number) => void;
}

export const SlotBottomSheet = forwardRef<BottomSheet, SlotBottomSheetProps>(
  ({ slot, court, hour, dateStr, onClose, onActionPress }, ref) => {
    const snapPoints = useMemo(() => ['50%', '75%'], []);

    const isPast = useMemo(() => {
      if (slot && slot.isPast !== undefined) return slot.isPast;
      if (hour !== null && dateStr) return isHourPast(hour, dateStr);
      return false;
    }, [slot, hour, dateStr]);

    const actions = useMemo(() => {
      if (isPast) {
        if (slot) {
          if (slot.status === 'membership') {
            return [{ icon: Users, label: 'View Membership', color: '#15803D' }];
          }
          return [{ icon: Eye, label: 'View Booking', color: '#2563EB' }];
        }
        return [];
      }
      if (slot) {
        if (slot.status === 'membership') {
          return [
            { icon: Users, label: 'View Membership', color: '#15803D' },
            { icon: Unlock, label: 'Release Slot', color: '#DC2626' },
          ];
        }
        return [
          { icon: Eye, label: 'View Booking', color: '#2563EB' },
          { icon: Pencil, label: 'Edit Booking', color: '#0F172A' },
          { icon: CalendarPlus, label: 'New Booking', color: '#16A34A' },
          { icon: Ban, label: 'Block Slot', color: '#DC2626' },
          { icon: Trophy, label: 'Tournament', color: '#7C3AED' },
          { icon: GraduationCap, label: 'Coaching', color: '#D97706' },
        ];
      }
      return [
        { icon: CalendarPlus, label: 'New Booking', color: '#2563EB' },
        { icon: Ban, label: 'Block Slot', color: '#DC2626' },
        { icon: Trophy, label: 'Tournament', color: '#7C3AED' },
        { icon: GraduationCap, label: 'Coaching', color: '#D97706' },
      ];
    }, [slot, isPast]);

    return (
      <BottomSheet
        ref={ref}
        index={-1}
        snapPoints={snapPoints}
        enableDynamicSizing={false}
        enablePanDownToClose
        onClose={onClose}
        backdropComponent={(props) => (
          <BottomSheetBackdrop {...props} appearsOnIndex={0} disappearsOnIndex={-1} />
        )}
        backgroundStyle={styles.bottomSheetBackground}
        handleIndicatorStyle={styles.handleIndicator}
      >
        <View style={styles.content}>
          <View style={styles.header}>
            <View>
              <Text style={styles.titleText}>
                {court ? court.name : 'Select Court'} · {hour !== null ? `${hour}:00` : ''}
              </Text>
              {slot && (
                <Text style={styles.subtitleText}>
                  {slot.label} · {slot.duration}h
                </Text>
              )}
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={16} color="#64748B" />
            </TouchableOpacity>
          </View>

          <View style={styles.actionsList}>
            {actions.length === 0 ? (
              <View style={styles.emptyActionsContainer}>
                <Text style={styles.emptyActionsText}>Past time slots cannot be modified or booked.</Text>
              </View>
            ) : (
              actions.map((action, i) => {
                const Icon = action.icon;
                return (
                  <TouchableOpacity 
                    key={i} 
                    style={styles.actionButton}
                    onPress={() => {
                      onClose();
                      if (court && hour !== null) {
                        onActionPress?.(action.label, slot, court, hour);
                      }
                    }}
                  >
                    <View style={styles.iconContainer}>
                      <Icon size={18} color={action.color} />
                    </View>
                    <Text style={styles.actionLabel}>{action.label}</Text>
                  </TouchableOpacity>
                );
              })
            )}
          </View>
        </View>
      </BottomSheet>
    );
  }
);

SlotBottomSheet.displayName = 'SlotBottomSheet';

const styles = StyleSheet.create({
  bottomSheetBackground: {
    backgroundColor: '#fff',
    borderRadius: 24,
  },
  handleIndicator: {
    width: 36,
    height: 4,
    backgroundColor: '#E2E8F0',
    marginTop: 8,
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  titleText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  subtitleText: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 2,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionsList: {
    padding: 16,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderRadius: 12,
    marginBottom: 4,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0F172A',
  },
  emptyActionsContainer: {
    paddingVertical: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyActionsText: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
  },
});
