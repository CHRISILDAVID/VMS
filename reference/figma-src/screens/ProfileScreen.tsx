import { useState } from 'react'
import {
  ChevronRight, Building2, Zap, BarChart2, TrendingUp,
  CreditCard, HelpCircle, LogOut,
} from 'lucide-react'

// Sub-screens
import CourtInformationScreen from './profile/CourtInformationScreen'
import CourtScheduleScreen from './profile/CourtScheduleScreen'
import GrowBusinessScreen from './profile/GrowBusinessScreen'
import SubscriptionBillingScreen from './profile/SubscriptionBillingScreen'
import HelpSupportScreen from './profile/HelpSupportScreen'

// Reports (reuse the existing panel from before, inlined here)
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell,
} from 'recharts'
import { Download, TrendingUp as TrendUp, TrendingDown } from 'lucide-react'
import { ChevronLeft } from 'lucide-react'

const weeklyData  = [
  { day: 'Mon', revenue: 6200 }, { day: 'Tue', revenue: 8400 },
  { day: 'Wed', revenue: 7100 }, { day: 'Thu', revenue: 9200 },
  { day: 'Fri', revenue: 11000 }, { day: 'Sat', revenue: 14500 },
  { day: 'Sun', revenue: 12800 },
]
const monthlyData = [
  { month: 'Jan', revenue: 180000 }, { month: 'Feb', revenue: 195000 },
  { month: 'Mar', revenue: 220000 }, { month: 'Apr', revenue: 210000 },
  { month: 'May', revenue: 245000 }, { month: 'Jun', revenue: 268000 },
  { month: 'Jul', revenue: 292000 },
]
const courtUtilData = [
  { name: 'Court 1', value: 89 }, { name: 'Court 2', value: 76 },
  { name: 'Court 3', value: 92 }, { name: 'Court 4', value: 65 },
  { name: 'Court 5', value: 84 }, { name: 'Court 6', value: 71 },
]
const paymentSplit = [
  { name: 'Online', value: 52, color: '#2563EB' },
  { name: 'Cash',   value: 28, color: '#7C3AED' },
  { name: 'UPI',    value: 20, color: '#16A34A' },
]

function KPICard({ label, value, sub, trend }: { label: string; value: string; sub: string; trend?: 'up' | 'down' }) {
  return (
    <div style={{ background: '#fff', borderRadius: 14, padding: '14px', border: '1px solid #F1F5F9' }}>
      <div style={{ fontSize: 11, color: '#64748B', fontWeight: 500, marginBottom: 6 }}>{label}</div>
      <div style={{ fontSize: 20, fontWeight: 800, color: '#0F172A', fontFamily: 'Plus Jakarta Sans, sans-serif', letterSpacing: '-0.3px' }}>{value}</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 4 }}>
        {trend === 'up' ? <TrendUp size={11} color="#16A34A" /> : trend === 'down' ? <TrendingDown size={11} color="#DC2626" /> : null}
        <span style={{ fontSize: 11, fontWeight: 600, color: trend === 'up' ? '#16A34A' : trend === 'down' ? '#DC2626' : '#64748B' }}>{sub}</span>
      </div>
    </div>
  )
}

function ReportsScreen({ onBack }: { onBack: () => void }) {
  const [period, setPeriod] = useState('Month')
  const periods = ['Week', 'Month', 'Year']
  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: '#F8FAFC' }}>
      <div style={{ background: '#fff', padding: '0 16px 14px', borderBottom: '1px solid #F1F5F9', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
          <button onClick={onBack} style={{ width: 36, height: 36, borderRadius: 10, background: '#F8FAFC', border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <ChevronLeft size={20} color="#0F172A" />
          </button>
          <div style={{ flex: 1, fontSize: 18, fontWeight: 800, color: '#0F172A', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>Reports</div>
          <button style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: 10, padding: '7px 12px', cursor: 'pointer' }}>
            <Download size={14} color="#2563EB" />
            <span style={{ fontSize: 12, fontWeight: 700, color: '#2563EB' }}>Export</span>
          </button>
        </div>
        <div style={{ display: 'flex', background: '#F8FAFC', borderRadius: 12, padding: 3, gap: 2 }}>
          {periods.map(p => (
            <button key={p} onClick={() => setPeriod(p)} style={{ flex: 1, padding: '7px 4px', borderRadius: 10, border: 'none', background: period === p ? '#fff' : 'transparent', color: period === p ? '#2563EB' : '#64748B', fontSize: 13, fontWeight: period === p ? 700 : 500, cursor: 'pointer', boxShadow: period === p ? '0 1px 4px rgba(0,0,0,0.08)' : 'none' }}>{p}</button>
          ))}
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '14px 16px 88px' }} className="scrollbar-hide">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
          <KPICard label="This Month" value="₹2.92L" sub="+18% vs last" trend="up" />
          <KPICard label="Occupancy" value="78.4%" sub="+5.2% this week" trend="up" />
          <KPICard label="Outstanding" value="₹12,400" sub="8 pending" trend="down" />
          <KPICard label="Membership" value="35 members" sub="+4 this month" trend="up" />
        </div>

        {/* Revenue chart */}
        <div style={{ background: '#fff', borderRadius: 18, padding: '16px', marginBottom: 14, border: '1px solid #F1F5F9' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#0F172A' }}>Revenue Trend</div>
            <span style={{ fontSize: 12, color: '#64748B' }}>{period}ly</span>
          </div>
          <ResponsiveContainer width="100%" height={150}>
            {period === 'Week' ? (
              <BarChart data={weeklyData} barSize={18}>
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                <YAxis hide />
                <Tooltip contentStyle={{ background: '#0F172A', border: 'none', borderRadius: 10, color: '#fff', fontSize: 12 }} formatter={(v: number) => [`₹${v.toLocaleString()}`, 'Revenue']} />
                <Bar dataKey="revenue" fill="#2563EB" radius={[6, 6, 0, 0]} />
              </BarChart>
            ) : (
              <LineChart data={monthlyData}>
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                <YAxis hide />
                <Tooltip contentStyle={{ background: '#0F172A', border: 'none', borderRadius: 10, color: '#fff', fontSize: 12 }} formatter={(v: number) => [`₹${(v / 1000).toFixed(0)}K`, 'Revenue']} />
                <Line type="monotone" dataKey="revenue" stroke="#2563EB" strokeWidth={3} dot={{ fill: '#2563EB', r: 4 }} />
              </LineChart>
            )}
          </ResponsiveContainer>
        </div>

        {/* Court utilization */}
        <div style={{ background: '#fff', borderRadius: 18, padding: '16px', marginBottom: 14, border: '1px solid #F1F5F9' }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#0F172A', marginBottom: 12 }}>Court Utilization</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {courtUtilData.map(c => (
              <div key={c.name}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: '#0F172A' }}>{c.name}</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: '#2563EB' }}>{c.value}%</span>
                </div>
                <div style={{ height: 7, background: '#F1F5F9', borderRadius: 4 }}>
                  <div style={{ height: '100%', width: `${c.value}%`, background: c.value >= 85 ? '#16A34A' : c.value >= 70 ? '#2563EB' : '#D97706', borderRadius: 4 }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Payment split */}
        <div style={{ background: '#fff', borderRadius: 18, padding: '16px', border: '1px solid #F1F5F9' }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#0F172A', marginBottom: 14 }}>Online vs Offline</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <ResponsiveContainer width={110} height={110}>
              <PieChart>
                <Pie data={paymentSplit} cx="50%" cy="50%" innerRadius={32} outerRadius={52} dataKey="value" strokeWidth={0}>
                  {paymentSplit.map((e, i) => <Cell key={i} fill={e.color} />)}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div style={{ flex: 1 }}>
              {paymentSplit.map(s => (
                <div key={s.name} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <div style={{ width: 10, height: 10, borderRadius: '50%', background: s.color, flexShrink: 0 }} />
                  <span style={{ flex: 1, fontSize: 12, fontWeight: 600, color: '#0F172A' }}>{s.name}</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#0F172A' }}>{s.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Menu Definition ───────────────────────────────────────────────────────────
type SubScreen = 'court-info' | 'schedule-pricing' | 'reports' | 'grow' | 'subscription' | 'help'

const menuGroups = [
  {
    title: 'Court',
    items: [
      { id: 'court-info' as SubScreen, icon: Building2, label: 'Court Information', color: '#2563EB', bg: '#EFF6FF', sub: 'Elite Arena Badminton' },
      { id: 'schedule-pricing' as SubScreen, icon: Zap, label: 'Court Schedule & Pricing', color: '#D97706', bg: '#FFFBEB', sub: 'Operating hours & pricing blocks' },
    ],
  },
  {
    title: 'Analytics',
    items: [
      { id: 'reports' as SubScreen, icon: BarChart2, label: 'Reports', color: '#7C3AED', bg: '#F5F3FF', sub: 'Revenue, utilization & bookings' },
    ],
  },
  {
    title: 'Business',
    items: [
      { id: 'grow' as SubScreen, icon: TrendingUp, label: 'Grow Your Business', color: '#16A34A', bg: '#F0FDF4', sub: 'Tournaments, coaching, shop & events' },
    ],
  },
  {
    title: 'Account',
    items: [
      { id: 'subscription' as SubScreen, icon: CreditCard, label: 'Subscription & Billing', color: '#2563EB', bg: '#EFF6FF', sub: 'Pro Plan · Renews Aug 2026' },
    ],
  },
  {
    title: 'Support',
    items: [
      { id: 'help' as SubScreen, icon: HelpCircle, label: 'Help & Support', color: '#64748B', bg: '#F8FAFC', sub: 'FAQs, contact & legal' },
    ],
  },
]

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function ProfileScreen() {
  const [subScreen, setSubScreen] = useState<SubScreen | null>(null)

  // Sub-screen routing
  if (subScreen === 'court-info')      return <CourtInformationScreen onBack={() => setSubScreen(null)} />
  if (subScreen === 'schedule-pricing') return <CourtScheduleScreen onBack={() => setSubScreen(null)} />
  if (subScreen === 'reports')         return <ReportsScreen onBack={() => setSubScreen(null)} />
  if (subScreen === 'grow')            return <GrowBusinessScreen onBack={() => setSubScreen(null)} />
  if (subScreen === 'subscription')    return <SubscriptionBillingScreen onBack={() => setSubScreen(null)} />
  if (subScreen === 'help')            return <HelpSupportScreen onBack={() => setSubScreen(null)} />

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: '#F8FAFC' }}>
      {/* Header banner */}
      <div style={{ background: 'linear-gradient(160deg, #1E40AF 0%, #2563EB 100%)', padding: '0 20px 24px', flexShrink: 0 }}>
        <div style={{ fontSize: 20, fontWeight: 800, color: '#fff', fontFamily: 'Plus Jakarta Sans, sans-serif', marginBottom: 18 }}>Profile</div>

        <div style={{ background: 'rgba(255,255,255,0.12)', borderRadius: 18, padding: '16px', backdropFilter: 'blur(10px)' }}>
          <div style={{ display: 'flex', gap: 14, alignItems: 'center', marginBottom: 14 }}>
            <div style={{ width: 54, height: 54, borderRadius: 15, background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid rgba(255,255,255,0.3)', flexShrink: 0 }}>
              <span style={{ fontSize: 22, fontWeight: 800, color: '#fff' }}>R</span>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 16, fontWeight: 800, color: '#fff' }}>Rajesh Kumar</div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', marginTop: 2 }}>+91 98765 43210</div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)' }}>rajesh@elitearena.in</div>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.2)', borderRadius: 10, padding: '5px 12px' }}>
              <div style={{ fontSize: 11, color: '#fff', fontWeight: 700 }}>Owner</div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 0, borderTop: '1px solid rgba(255,255,255,0.15)', paddingTop: 14 }}>
            {[{ label: 'Courts', value: '6' }, { label: 'Members', value: '35' }, { label: 'Staff', value: '4' }].map((s, i) => (
              <div key={s.label} style={{ flex: 1, textAlign: 'center', borderRight: i < 2 ? '1px solid rgba(255,255,255,0.15)' : 'none' }}>
                <div style={{ fontSize: 18, fontWeight: 800, color: '#fff' }}>{s.value}</div>
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.65)', fontWeight: 500 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Menu */}
      <div style={{ flex: 1, overflowY: 'auto' }} className="scrollbar-hide">
        <div style={{ padding: '16px 16px 0' }}>
          {menuGroups.map(group => (
            <div key={group.title} style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8, paddingLeft: 4 }}>{group.title}</div>
              <div style={{ background: '#fff', borderRadius: 18, overflow: 'hidden', border: '1px solid #F1F5F9' }}>
                {group.items.map((item, i) => {
                  const Icon = item.icon
                  return (
                    <button
                      key={item.id}
                      onClick={() => setSubScreen(item.id)}
                      style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%', padding: '14px 16px', background: 'transparent', border: 'none', cursor: 'pointer', borderBottom: i < group.items.length - 1 ? '1px solid #F8FAFC' : 'none', textAlign: 'left' }}
                    >
                      <div style={{ width: 38, height: 38, borderRadius: 11, background: item.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <Icon size={17} color={item.color} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 14, fontWeight: 600, color: '#0F172A' }}>{item.label}</div>
                        <div style={{ fontSize: 11, color: '#94A3B8', marginTop: 1 }}>{item.sub}</div>
                      </div>
                      <ChevronRight size={16} color="#CBD5E1" />
                    </button>
                  )
                })}
              </div>
            </div>
          ))}

          {/* Logout */}
          <button style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%', padding: '16px', background: '#FEF2F2', border: '1px solid #FCA5A5', borderRadius: 18, cursor: 'pointer', marginBottom: 88 }}>
            <LogOut size={18} color="#DC2626" />
            <span style={{ fontSize: 14, fontWeight: 700, color: '#DC2626' }}>Sign Out</span>
          </button>
        </div>
      </div>
    </div>
  )
}
