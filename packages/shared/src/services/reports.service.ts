import type { SupabaseClient } from '@supabase/supabase-js'

export interface VenueKPIs {
  active_members: number
  total_bookings: number
  booking_revenue: number
  membership_revenue: number
  total_revenue: number
}

export interface ReportsChartData {
  summary: {
    current: {
      revenue: number
      occupancy: number
      outstanding: number
      pending_count: number
      members: number
    }
    previous: {
      revenue: number
      occupancy: number
      members: number
    }
  }
  chart: {
    label: string
    value: number
  }[]
}

export const createReportsService = (supabase: SupabaseClient) => ({
  /**
   * Fetch abstract KPI data for a specific venue for the current month
   */
  async getVenueKPIs(venueId: string): Promise<VenueKPIs> {
    try {
      const { data, error } = await supabase
        .rpc('get_venue_kpis', { p_venue_id: venueId })
        .single() as { data: any, error: any }

      if (error) throw error

      return {
        active_members: Number(data.active_members || 0),
        total_bookings: Number(data.total_bookings || 0),
        booking_revenue: Number(data.booking_revenue || 0),
        membership_revenue: Number(data.membership_revenue || 0),
        total_revenue: Number(data.total_revenue || 0),
      }
    } catch (error: any) {
      console.error('Error fetching venue KPIs:', error)
      throw new Error(error.message || 'Error fetching venue KPIs')
    }
  },

  /**
   * Fetch structured chart data for a specific time filter
   */
  async getReportsChartData(venueId: string, timeFilter: 'week' | 'month' | 'year'): Promise<ReportsChartData> {
    try {
      const { data, error } = await supabase
        .rpc('get_reports_chart_data', { p_venue_id: venueId, p_time_filter: timeFilter })
        .single() as { data: ReportsChartData, error: any }

      if (error) throw error

      return data
    } catch (error: any) {
      console.error('Error fetching reports chart data:', error)
      throw new Error(error.message || 'Error fetching reports chart data')
    }
  }
})

