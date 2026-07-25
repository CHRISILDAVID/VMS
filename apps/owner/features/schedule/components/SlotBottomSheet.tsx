import React, { forwardRef, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import BottomSheet, { BottomSheetBackdrop } from '@gorhom/bottom-sheet';
import { Court } from '@vms/shared/types';
import { ProcessedSlot } from '../utils/scheduleHelpers';
import { COLORS, SPACING, RADIUS } from '@vms/shared/utils';

interface SlotBottomSheetProps {
  slot: ProcessedSlot | null;
  court: Court | null;
  onClose: () => void;
}

export const SlotBottomSheet = forwardRef<BottomSheet, SlotBottomSheetProps>(
  ({ slot, court, onClose }, ref) => {
    const snapPoints = useMemo(() => ['40%', '50%'], []);

    if (!slot || !court) return null;

    return (
      <BottomSheet
        ref={ref}
        index={-1}
        snapPoints={snapPoints}
        enablePanDownToClose
        onClose={onClose}
        backdropComponent={(props) => (
          <BottomSheetBackdrop {...props} appearsOnIndex={0} disappearsOnIndex={-1} />
        )}
        backgroundStyle={styles.bottomSheetBackground}
      >
        <View style={styles.contentContainer}>
          <Text style={styles.title}>{court.name}</Text>
          <Text style={styles.time}>{slot.time}</Text>
          
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(slot.status) }]}>
            <Text style={styles.statusText}>{slot.status.toUpperCase()}</Text>
          </View>

          <View style={styles.actionsContainer}>
            {slot.status === 'available' && (
              <>
                <TouchableOpacity style={[styles.button, styles.primaryButton]}>
                  <Text style={styles.buttonText}>New Booking</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.button, styles.secondaryButton]}>
                  <Text style={styles.secondaryButtonText}>Block Slot</Text>
                </TouchableOpacity>
              </>
            )}

            {slot.status === 'booked' && (
              <>
                <TouchableOpacity style={[styles.button, styles.primaryButton]}>
                  <Text style={styles.buttonText}>View Booking</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.button, styles.secondaryButton]}>
                  <Text style={styles.secondaryButtonText}>Cancel Booking</Text>
                </TouchableOpacity>
              </>
            )}

            {slot.status === 'membership' && (
              <TouchableOpacity style={[styles.button, styles.secondaryButton]}>
                <Text style={styles.secondaryButtonText}>Release for Today</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </BottomSheet>
    );
  }
);

SlotBottomSheet.displayName = 'SlotBottomSheet';

function getStatusColor(status: string) {
  switch (status) {
    case 'available': return COLORS.success;
    case 'booked': return COLORS.primary;
    case 'coaching': return COLORS.warning;
    case 'tournament': return '#9333ea';
    case 'membership': return '#0d9488';
    case 'blocked': return COLORS.danger;
    default: return COLORS.textMuted;
  }
}

const styles = StyleSheet.create({
  bottomSheetBackground: {
    backgroundColor: COLORS.surface,
  },
  contentContainer: {
    flex: 1,
    padding: SPACING.lg,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  time: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: SPACING.md,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: RADIUS.full,
    marginBottom: SPACING.xl,
  },
  statusText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 12,
  },
  actionsContainer: {
    gap: SPACING.md,
  },
  button: {
    height: 48,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButton: {
    backgroundColor: COLORS.primary,
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },
  secondaryButtonText: {
    color: COLORS.textPrimary,
    fontWeight: '600',
    fontSize: 16,
  },
});
