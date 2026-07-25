import React, { forwardRef, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import BottomSheet, { BottomSheetBackdrop } from '@gorhom/bottom-sheet';
import { Court } from '@vms/shared/types';
import { X, Calendar, MapPin } from 'lucide-react-native';

interface FilterSheetProps {
  courts: Court[];
  selectedCourtId?: string;
  selectedDate?: string;
  onApplyFilters: (filters: { courtId?: string; date?: string }) => void;
  onResetFilters: () => void;
}

export const FilterSheet = forwardRef<BottomSheet, FilterSheetProps>(
  ({ courts, selectedCourtId, selectedDate, onApplyFilters, onResetFilters }, ref) => {
    const snapPoints = useMemo(() => ['45%', '60%'], []);
    const [tempCourtId, setTempCourtId] = React.useState<string | undefined>(selectedCourtId);
    const [tempDate, setTempDate] = React.useState<string | undefined>(selectedDate);

    React.useEffect(() => {
      setTempCourtId(selectedCourtId);
      setTempDate(selectedDate);
    }, [selectedCourtId, selectedDate]);

    const todayStr = new Date().toISOString().split('T')[0];
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    const dateOptions = [
      { label: 'All Dates', value: undefined },
      { label: 'Yesterday', value: yesterdayStr },
      { label: 'Today', value: todayStr },
      { label: 'Tomorrow', value: tomorrowStr },
    ];

    return (
      <BottomSheet
        ref={ref}
        index={-1}
        snapPoints={snapPoints}
        enablePanDownToClose
        backdropComponent={(props) => (
          <BottomSheetBackdrop {...props} appearsOnIndex={0} disappearsOnIndex={-1} />
        )}
        backgroundStyle={styles.bottomSheetBackground}
        handleIndicatorStyle={styles.handleIndicator}
      >
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.titleText}>Filter Bookings</Text>
            <TouchableOpacity onPress={() => (ref as any)?.current?.close()} style={styles.closeBtn}>
              <X size={18} color="#64748B" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.scrollBody} showsVerticalScrollIndicator={false}>
            {/* Court Filter */}
            <View style={styles.section}>
              <View style={styles.sectionTitleRow}>
                <MapPin size={16} color="#475569" />
                <Text style={styles.sectionTitle}>Court</Text>
              </View>
              <View style={styles.pillsContainer}>
                <TouchableOpacity
                  style={[styles.pill, !tempCourtId && styles.pillActive]}
                  onPress={() => setTempCourtId(undefined)}
                >
                  <Text style={[styles.pillText, !tempCourtId && styles.pillTextActive]}>
                    All Courts
                  </Text>
                </TouchableOpacity>
                {courts.map((court) => {
                  const active = tempCourtId === court.id;
                  return (
                    <TouchableOpacity
                      key={court.id}
                      style={[styles.pill, active && styles.pillActive]}
                      onPress={() => setTempCourtId(court.id)}
                    >
                      <Text style={[styles.pillText, active && styles.pillTextActive]}>
                        {court.name}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Date Filter */}
            <View style={styles.section}>
              <View style={styles.sectionTitleRow}>
                <Calendar size={16} color="#475569" />
                <Text style={styles.sectionTitle}>Date</Text>
              </View>
              <View style={styles.pillsContainer}>
                {dateOptions.map((opt) => {
                  const active = tempDate === opt.value;
                  return (
                    <TouchableOpacity
                      key={opt.label}
                      style={[styles.pill, active && styles.pillActive]}
                      onPress={() => setTempDate(opt.value)}
                    >
                      <Text style={[styles.pillText, active && styles.pillTextActive]}>
                        {opt.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          </ScrollView>

          {/* Footer Actions */}
          <View style={styles.footer}>
            <TouchableOpacity
              style={styles.resetBtn}
              onPress={() => {
                setTempCourtId(undefined);
                setTempDate(undefined);
                onResetFilters();
                (ref as any)?.current?.close();
              }}
            >
              <Text style={styles.resetText}>Reset</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.applyBtn}
              onPress={() => {
                onApplyFilters({ courtId: tempCourtId, date: tempDate });
                (ref as any)?.current?.close();
              }}
            >
              <Text style={styles.applyText}>Apply Filters</Text>
            </TouchableOpacity>
          </View>
        </View>
      </BottomSheet>
    );
  }
);

FilterSheet.displayName = 'FilterSheet';

const styles = StyleSheet.create({
  bottomSheetBackground: {
    backgroundColor: '#fff',
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 8,
  },
  handleIndicator: {
    backgroundColor: '#CBD5E1',
    width: 40,
    height: 4,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  titleText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
  },
  closeBtn: {
    padding: 6,
    borderRadius: 16,
    backgroundColor: '#F8FAFC',
  },
  scrollBody: {
    flex: 1,
    paddingVertical: 16,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#334155',
  },
  pillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  pill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  pillActive: {
    backgroundColor: '#EFF6FF',
    borderColor: '#2563EB',
  },
  pillText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
  },
  pillTextActive: {
    color: '#2563EB',
    fontWeight: '700',
  },
  footer: {
    flexDirection: 'row',
    gap: 12,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  resetBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  resetText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#64748B',
  },
  applyBtn: {
    flex: 2,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: '#2563EB',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  applyText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#fff',
  },
});
