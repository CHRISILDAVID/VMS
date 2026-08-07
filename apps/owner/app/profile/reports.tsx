import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ChevronLeft, ArrowUpRight, ArrowDownRight, FileText } from 'lucide-react-native';
import { formatCurrency } from '@vms/shared/utils';
import { createReportsService } from '@vms/shared/services';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import { useVenueStore } from '../../stores/venueStore';
import { BarChart } from 'react-native-gifted-charts';
import { useThemeColors } from '../../hooks/useThemeColors';

type TimeFilter = 'week' | 'month' | 'year';

export default function ReportsScreen() {
  const router = useRouter();
  const { selectedVenueId } = useVenueStore();
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('week');
  const { colors } = useThemeColors();

  const { data: chartData, isLoading } = useQuery({
    queryKey: ['reportsChartData', selectedVenueId, timeFilter],
    queryFn: async () => {
      if (!selectedVenueId || selectedVenueId === 'all') return null;
      return createReportsService(supabase).getReportsChartData(selectedVenueId, timeFilter);
    },
    enabled: !!selectedVenueId && selectedVenueId !== 'all'
  });

  const renderKPI = (title: string, value: string | number, prevValue?: number, isCurrency = false) => {
    let diffPercent = 0;
    if (prevValue && prevValue > 0 && typeof value === 'number') {
      diffPercent = ((value - prevValue) / prevValue) * 100;
    } else if (prevValue && prevValue > 0 && typeof value === 'string' && value.endsWith('%')) {
      const numVal = parseFloat(value);
      diffPercent = ((numVal - prevValue) / prevValue) * 100;
    }
    
    const isPositive = diffPercent >= 0;
    const Icon = isPositive ? ArrowUpRight : ArrowDownRight;
    const color = isPositive ? '#16A34A' : '#DC2626';
    const colorClass = isPositive ? 'text-green-600 dark:text-green-500' : 'text-destructive dark:text-red-500';

    return (
      <View className="w-[48%] bg-card p-4 rounded-2xl border border-border">
        <Text className="text-[13px] text-muted-foreground font-medium mb-2">{title}</Text>
        <Text className="text-xl font-extrabold text-foreground mb-2">
          {isCurrency ? formatCurrency(value as number) : value}
        </Text>
        {prevValue !== undefined && (
          <View className="flex-row items-center gap-1">
            <Icon size={14} color={isPositive ? '#16A34A' : '#DC2626'} />
            <Text className={`text-xs font-semibold ${colorClass}`}>
              {Math.abs(diffPercent).toFixed(1)}% vs last {timeFilter}
            </Text>
          </View>
        )}
      </View>
    );
  };

  const formattedChartData = chartData?.chart.map(item => ({
    value: item.value,
    label: item.label,
    frontColor: colors.primary,
    topLabelComponent: () => (
      <Text className="text-[10px] text-muted-foreground mb-1">
        {item.value > 1000 ? `${(item.value/1000).toFixed(1)}k` : item.value}
      </Text>
    )
  })) || [];

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top', 'bottom']}>
      <View className="flex-row items-center justify-between px-4 py-3.5 bg-card border-b border-border">
        <TouchableOpacity onPress={() => router.back()} className="w-9 h-9 rounded-xl bg-muted border border-border items-center justify-center">
          <ChevronLeft size={20} color={colors.foreground} />
        </TouchableOpacity>
        <Text className="text-lg font-extrabold text-foreground">Reports</Text>
        <TouchableOpacity className="flex-row items-center bg-muted border border-border px-3 py-2 rounded-lg gap-1.5">
          <FileText size={16} color={colors.foreground} />
          <Text className="text-[13px] font-semibold text-foreground">Export</Text>
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1 p-4" showsVerticalScrollIndicator={false}>
        {/* Segmented Control */}
        <View className="flex-row bg-muted rounded-xl p-1 mb-5">
          {(['week', 'month', 'year'] as TimeFilter[]).map((f) => (
            <TouchableOpacity
              key={f}
              className={`flex-1 py-2 items-center rounded-lg ${timeFilter === f ? 'bg-card shadow-sm shadow-black/10' : 'shadow-none'}`}
              onPress={() => setTimeFilter(f)}
            >
              <Text className={`text-[13px] ${timeFilter === f ? 'font-semibold text-foreground' : 'font-semibold text-muted-foreground'}`}>
                This {f.charAt(0).toUpperCase() + f.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {isLoading ? (
          <ActivityIndicator size="large" color={colors.primary} className="mt-10" />
        ) : (
          <>
            {/* KPIs */}
            <View className="flex-row flex-wrap justify-between gap-3 mb-6">
              {renderKPI(
                'This ' + timeFilter.charAt(0).toUpperCase() + timeFilter.slice(1), 
                chartData?.summary.current.revenue || 0, 
                chartData?.summary.previous.revenue, 
                true
              )}
              {renderKPI(
                'Occupancy', 
                (chartData?.summary.current.occupancy || 0) + '%', 
                chartData?.summary.previous.occupancy
              )}
              {renderKPI(
                'Outstanding', 
                chartData?.summary.current.outstanding || 0, 
                undefined, 
                true
              )}
              {renderKPI(
                'Active Members', 
                chartData?.summary.current.members || 0, 
                chartData?.summary.previous.members
              )}
            </View>

            {/* Revenue Trend Chart */}
            <View className="bg-card rounded-2xl p-5 border border-border mb-10">
              <View className="mb-5">
                <Text className="text-base font-extrabold text-foreground">Revenue Trend</Text>
              </View>
              {formattedChartData.length > 0 ? (
                <View className="-ml-5">
                  <BarChart
                    data={formattedChartData}
                    barWidth={32}
                    spacing={24}
                    roundedTop
                    roundedBottom
                    xAxisThickness={0}
                    yAxisThickness={0}
                    yAxisTextStyle={{color: colors.mutedForeground, fontSize: 11}}
                    noOfSections={4}
                    maxValue={Math.max(...formattedChartData.map(d => d.value), 1000) * 1.2}
                    rulesColor={colors.border}
                    xAxisLabelTextStyle={{color: colors.mutedForeground, fontSize: 11}}
                  />
                </View>
              ) : (
                <View className="h-[200px] items-center justify-center">
                  <Text className="text-sm text-muted-foreground">No data available for this period</Text>
                </View>
              )}
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
