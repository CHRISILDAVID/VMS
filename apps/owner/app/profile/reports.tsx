import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ChevronLeft, ArrowUpRight, ArrowDownRight, FileText } from 'lucide-react-native';
import { COLORS, formatCurrency } from '@vms/shared/utils';
import { createReportsService } from '@vms/shared/services';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import { useVenueStore } from '../../stores/venueStore';
import { BarChart } from 'react-native-gifted-charts';

type TimeFilter = 'week' | 'month' | 'year';

export default function ReportsScreen() {
  const router = useRouter();
  const { selectedVenueId } = useVenueStore();
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('week');

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

    return (
      <View style={styles.kpiCard}>
        <Text style={styles.kpiTitle}>{title}</Text>
        <Text style={styles.kpiValue}>
          {isCurrency ? formatCurrency(value as number) : value}
        </Text>
        {prevValue !== undefined && (
          <View style={styles.kpiDiffRow}>
            <Icon size={14} color={color} />
            <Text style={[styles.kpiDiffText, { color }]}>
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
    frontColor: COLORS.primary,
    topLabelComponent: () => (
      <Text style={{color: '#64748B', fontSize: 10, marginBottom: 4}}>
        {item.value > 1000 ? `${(item.value/1000).toFixed(1)}k` : item.value}
      </Text>
    )
  })) || [];

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ChevronLeft size={20} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Reports</Text>
        <TouchableOpacity style={styles.exportButton}>
          <FileText size={16} color="#0F172A" />
          <Text style={styles.exportText}>Export</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Segmented Control */}
        <View style={styles.segmentContainer}>
          {(['week', 'month', 'year'] as TimeFilter[]).map((f) => (
            <TouchableOpacity
              key={f}
              style={[styles.segmentBtn, timeFilter === f && styles.segmentBtnActive]}
              onPress={() => setTimeFilter(f)}
            >
              <Text style={[styles.segmentText, timeFilter === f && styles.segmentTextActive]}>
                This {f.charAt(0).toUpperCase() + f.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {isLoading ? (
          <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 40 }} />
        ) : (
          <>
            {/* KPIs */}
            <View style={styles.kpiGrid}>
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
            <View style={styles.chartContainer}>
              <View style={styles.chartHeader}>
                <Text style={styles.chartTitle}>Revenue Trend</Text>
              </View>
              {formattedChartData.length > 0 ? (
                <View style={{marginLeft: -20}}>
                  <BarChart
                    data={formattedChartData}
                    barWidth={32}
                    spacing={24}
                    roundedTop
                    roundedBottom
                    xAxisThickness={0}
                    yAxisThickness={0}
                    yAxisTextStyle={{color: '#94A3B8', fontSize: 11}}
                    noOfSections={4}
                    maxValue={Math.max(...formattedChartData.map(d => d.value), 1000) * 1.2}
                    rulesColor="#F1F5F9"
                    xAxisLabelTextStyle={{color: '#64748B', fontSize: 11}}
                  />
                </View>
              ) : (
                <View style={styles.emptyChart}>
                  <Text style={styles.emptyChartText}>No data available for this period</Text>
                </View>
              )}
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: { 
    backgroundColor: '#fff', 
    paddingHorizontal: 16, 
    paddingVertical: 14, 
    borderBottomWidth: 1, 
    borderBottomColor: '#F1F5F9', 
    flexDirection: 'row', 
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  backButton: { 
    width: 36, height: 36, borderRadius: 10, 
    backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#E2E8F0', 
    alignItems: 'center', justifyContent: 'center' 
  },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#0F172A' },
  exportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6
  },
  exportText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0F172A'
  },
  content: { flex: 1, padding: 16 },
  segmentContainer: {
    flexDirection: 'row',
    backgroundColor: '#E2E8F0',
    borderRadius: 10,
    padding: 4,
    marginBottom: 20
  },
  segmentBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8
  },
  segmentBtnActive: {
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2
  },
  segmentText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B'
  },
  segmentTextActive: {
    color: '#0F172A'
  },
  kpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
    gap: 12
  },
  kpiCard: {
    width: '48%',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9'
  },
  kpiTitle: {
    fontSize: 13,
    color: '#64748B',
    marginBottom: 8,
    fontWeight: '500'
  },
  kpiValue: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 8
  },
  kpiDiffRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4
  },
  kpiDiffText: {
    fontSize: 12,
    fontWeight: '600'
  },
  chartContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    marginBottom: 40
  },
  chartHeader: {
    marginBottom: 20
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A'
  },
  emptyChart: {
    height: 200,
    alignItems: 'center',
    justifyContent: 'center'
  },
  emptyChartText: {
    color: '#94A3B8',
    fontSize: 14
  }
});
