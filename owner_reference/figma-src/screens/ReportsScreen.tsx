import { useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts'
import { TrendingUp, TrendingDown, Download, ChevronRight } from 'lucide-react'
import VenueSelector from '../components/VenueSelector'

const weeklyData = [
  { day: 'Mon', revenue: 6200 },
  { day: 'Tue', revenue: 8400 },
  { day: 'Wed', revenue: 7100 },
  { day: 'Thu', revenue: 9200 },
  { day: 'Fri', revenue: 11000 },
  { day: 'Sat', revenue: 14500 },
  { day: 'Sun', revenue: 12800 },
]

const monthlyData = [
  { month: 'Jan', revenue: 180000 },
  { month: 'Feb', revenue: 195000 },
  { month: 'Mar', revenue: 220000 },
  { month: 'Apr', revenue: 210000 },
  { month: 'May', revenue: 245000 },
  { month: 'Jun', revenue: 268000 },
  { month: 'Jul', revenue: 292000 },
]

const courtData = [
  { name: 'Court 1', value: 89 },
  { name: 'Court 2', value: 76 },
  { name: 'Court 3', value: 92 },
  { name: 'Court 4', value: 65 },
  { name: 'Court 5', value: 84 },
  { name: 'Court 6', value: 71 },
]

const sourceData = [
  { name: 'Online', value: 52, color: '#2563EB' },
  { name: 'Offline', value: 28, color: '#7C3AED' },
  { name: 'Walk-in', value: 12, color: '#16A34A' },
  { name: 'Membership', value: 8, color: '#D97706' },
]

const periods = ['Week', 'Month', 'Year']

const KPICard = ({ label, value, sub, trend }: { label: string; value: string; sub: string; trend?: 'up' | 'down' }) => (
  <div style={{ background: '#fff', borderRadius: 16, padding: '14px', border: '1px solid #F1F5F9' }}>
    <div style={{ fontSize: 11, color: '#64748B', fontWeight: 500, marginBottom: 6 }}>{label}</div>
    <div style={{ fontSize: 20, fontWeight: 800, color: '#0F172A', fontFamily: 'Plus Jakarta Sans, sans-serif', letterSpacing: '-0.5px' }}>{value}</div>
    <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 4 }}>
      {trend === 'up' ? <TrendingUp size={12} color="#16A34A" /> : trend === 'down' ? <TrendingDown size={12} color="#DC2626" /> : null}
      <span style={{ fontSize: 11, color: trend === 'up' ? '#16A34A' : trend === 'down' ? '#DC2626' : '#64748B', fontWeight: 600 }}>{sub}</span>
    </div>
  </div>
)

export default function ReportsScreen() {
  const [venue, setVenue] = useState('all')
  const [period, setPeriod] = useState('Month')

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: '#F8FAFC' }}>
      {/* Header */}
      <div style={{ background: '#fff', padding: '0 16px 14px', borderBottom: '1px solid #F1F5F9', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <div style={{ fontSize: 18, fontWeight: 800, color: '#0F172A', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>Reports</div>
          <button style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: 10, padding: '7px 12px', cursor: 'pointer' }}>
            <Download size={14} color="#2563EB" />
            <span style={{ fontSize: 12, fontWeight: 700, color: '#2563EB' }}>Export</span>
          </button>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <VenueSelector selectedVenue={venue} onSelect={setVenue} />
          <div style={{ display: 'flex', background: '#F8FAFC', borderRadius: 10, padding: 3, gap: 2 }}>
            {periods.map(p => (
              <button key={p} onClick={() => setPeriod(p)} style={{ padding: '5px 12px', borderRadius: 8, border: 'none', background: period === p ? '#fff' : 'transparent', color: period === p ? '#2563EB' : '#64748B', fontSize: 12, fontWeight: period === p ? 700 : 500, cursor: 'pointer', boxShadow: period === p ? '0 1px 4px rgba(0,0,0,0.08)' : 'none' }}>
                {p}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }} className="scrollbar-hide">
        {/* KPI grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
          <KPICard label="This Month" value="₹2.92L" sub="+18% vs last month" trend="up" />
          <KPICard label="Today's Revenue" value="₹8,450" sub="+12% vs yesterday" trend="up" />
          <KPICard label="Occupancy Rate" value="78.4%" sub="+5.2% this week" trend="up" />
          <KPICard label="Outstanding" value="₹12,400" sub="8 bookings pending" trend="down" />
        </div>

        {/* Revenue chart */}
        <div style={{ background: '#fff', borderRadius: 18, padding: '16px', marginBottom: 16, border: '1px solid #F1F5F9' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#0F172A' }}>Revenue Trend</div>
            <span style={{ fontSize: 12, color: '#64748B' }}>{period}ly</span>
          </div>
          <ResponsiveContainer width="100%" height={160}>
            {period === 'Week' ? (
              <BarChart data={weeklyData} barSize={20}>
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                <YAxis hide />
                <Tooltip
                  contentStyle={{ background: '#0F172A', border: 'none', borderRadius: 10, color: '#fff', fontSize: 12 }}
                  formatter={(v: number) => [`₹${v.toLocaleString()}`, 'Revenue']}
                />
                <Bar dataKey="revenue" fill="#2563EB" radius={[6, 6, 0, 0]} />
              </BarChart>
            ) : (
              <LineChart data={monthlyData}>
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                <YAxis hide />
                <Tooltip
                  contentStyle={{ background: '#0F172A', border: 'none', borderRadius: 10, color: '#fff', fontSize: 12 }}
                  formatter={(v: number) => [`₹${(v / 1000).toFixed(0)}K`, 'Revenue']}
                />
                <Line type="monotone" dataKey="revenue" stroke="#2563EB" strokeWidth={3} dot={{ fill: '#2563EB', r: 4 }} />
              </LineChart>
            )}
          </ResponsiveContainer>
        </div>

        {/* Court occupancy */}
        <div style={{ background: '#fff', borderRadius: 18, padding: '16px', marginBottom: 16, border: '1px solid #F1F5F9' }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#0F172A', marginBottom: 14 }}>Court Occupancy</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {courtData.map(c => (
              <div key={c.name}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: '#0F172A' }}>{c.name}</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: '#2563EB' }}>{c.value}%</span>
                </div>
                <div style={{ height: 8, background: '#F1F5F9', borderRadius: 4, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${c.value}%`, background: c.value >= 85 ? '#16A34A' : c.value >= 70 ? '#2563EB' : '#D97706', borderRadius: 4, transition: 'width 0.5s' }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Booking source */}
        <div style={{ background: '#fff', borderRadius: 18, padding: '16px', marginBottom: 16, border: '1px solid #F1F5F9' }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#0F172A', marginBottom: 14 }}>Booking Source</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <ResponsiveContainer width={120} height={120}>
              <PieChart>
                <Pie data={sourceData} cx="50%" cy="50%" innerRadius={35} outerRadius={55} dataKey="value" strokeWidth={0}>
                  {sourceData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div style={{ flex: 1 }}>
              {sourceData.map(s => (
                <div key={s.name} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <div style={{ width: 10, height: 10, borderRadius: '50%', background: s.color, flexShrink: 0 }} />
                  <span style={{ flex: 1, fontSize: 12, fontWeight: 600, color: '#0F172A' }}>{s.name}</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#0F172A' }}>{s.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Venue comparison */}
        <div style={{ background: '#fff', borderRadius: 18, padding: '16px', marginBottom: 100, border: '1px solid #F1F5F9' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#0F172A' }}>Venue Revenue</div>
            <button style={{ background: 'none', border: 'none', color: '#2563EB', fontSize: 12, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 2 }}>
              Details <ChevronRight size={14} />
            </button>
          </div>
          {[
            { name: 'Elite Arena OMR', revenue: '₹1.42L', pct: 49, courts: 6 },
            { name: 'Elite Arena Velachery', revenue: '₹92K', pct: 32, courts: 4 },
            { name: 'Elite Arena Anna Nagar', revenue: '₹56K', pct: 19, courts: 3 },
          ].map(v => (
            <div key={v.name} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '1px solid #F8FAFC' }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#0F172A' }}>{v.name}</div>
                <div style={{ fontSize: 11, color: '#64748B' }}>{v.courts} courts</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 14, fontWeight: 800, color: '#0F172A' }}>{v.revenue}</div>
                <div style={{ fontSize: 11, color: '#64748B' }}>{v.pct}%</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
