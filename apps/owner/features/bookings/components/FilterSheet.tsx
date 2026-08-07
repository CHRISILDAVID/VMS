import React, { forwardRef, useMemo } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import BottomSheet, { BottomSheetBackdrop } from '@gorhom/bottom-sheet';
import { Court } from '@vms/shared/types';
import { X, Calendar, MapPin } from 'lucide-react-native';
import { useThemeColors } from '../../../hooks/useThemeColors';

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
    const { colors } = useThemeColors();
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
        enableDynamicSizing={false}
        enablePanDownToClose
        backdropComponent={(props) => (
          <BottomSheetBackdrop {...props} appearsOnIndex={0} disappearsOnIndex={-1} />
        )}
        backgroundStyle={{ backgroundColor: colors.card, borderRadius: 24 }}
        handleIndicatorStyle={{ backgroundColor: colors.border, width: 40, height: 4 }}
      >
        <View className="flex-1 px-5 pb-6">
          <View className="flex-row justify-between items-center py-3 border-b border-border">
            <Text className="text-lg font-bold text-foreground">Filter Bookings</Text>
            <TouchableOpacity onPress={() => (ref as any)?.current?.close()} className="p-1.5 rounded-2xl bg-muted">
              <X size={18} color={colors.mutedForeground} />
            </TouchableOpacity>
          </View>

          <ScrollView className="flex-1 py-4" showsVerticalScrollIndicator={false}>
            {/* Court Filter */}
            <View className="mb-5">
              <View className="flex-row items-center gap-2 mb-2.5">
                <MapPin size={16} color={colors.foreground} />
                <Text className="text-sm font-bold text-foreground">Court</Text>
              </View>
              <View className="flex-row flex-wrap gap-2">
                <TouchableOpacity
                  className={`px-4 py-2 rounded-full border ${!tempCourtId ? 'bg-primary/10 border-primary' : 'bg-muted border-border'}`}
                  onPress={() => setTempCourtId(undefined)}
                >
                  <Text className={`text-[13px] font-semibold ${!tempCourtId ? 'text-primary font-bold' : 'text-muted-foreground'}`}>
                    All Courts
                  </Text>
                </TouchableOpacity>
                {courts.map((court) => {
                  const active = tempCourtId === court.id;
                  return (
                    <TouchableOpacity
                      key={court.id}
                      className={`px-4 py-2 rounded-full border ${active ? 'bg-primary/10 border-primary' : 'bg-muted border-border'}`}
                      onPress={() => setTempCourtId(court.id)}
                    >
                      <Text className={`text-[13px] font-semibold ${active ? 'text-primary font-bold' : 'text-muted-foreground'}`}>
                        {court.name}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Date Filter */}
            <View className="mb-5">
              <View className="flex-row items-center gap-2 mb-2.5">
                <Calendar size={16} color={colors.foreground} />
                <Text className="text-sm font-bold text-foreground">Date</Text>
              </View>
              <View className="flex-row flex-wrap gap-2">
                {dateOptions.map((opt) => {
                  const active = tempDate === opt.value;
                  return (
                    <TouchableOpacity
                      key={opt.label}
                      className={`px-4 py-2 rounded-full border ${active ? 'bg-primary/10 border-primary' : 'bg-muted border-border'}`}
                      onPress={() => setTempDate(opt.value)}
                    >
                      <Text className={`text-[13px] font-semibold ${active ? 'text-primary font-bold' : 'text-muted-foreground'}`}>
                        {opt.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          </ScrollView>

          {/* Footer Actions */}
          <View className="flex-row gap-3 pt-4 border-t border-border">
            <TouchableOpacity
              className="flex-1 py-3.5 rounded-xl bg-muted border border-border items-center justify-center"
              onPress={() => {
                setTempCourtId(undefined);
                setTempDate(undefined);
                onResetFilters();
                (ref as any)?.current?.close();
              }}
            >
              <Text className="text-[15px] font-bold text-muted-foreground">Reset</Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="flex-[2] py-3.5 rounded-xl bg-primary items-center justify-center shadow-md"
              onPress={() => {
                onApplyFilters({ courtId: tempCourtId, date: tempDate });
                (ref as any)?.current?.close();
              }}
            >
              <Text className="text-[15px] font-bold text-white">Apply Filters</Text>
            </TouchableOpacity>
          </View>
        </View>
      </BottomSheet>
    );
  }
);

FilterSheet.displayName = 'FilterSheet';
