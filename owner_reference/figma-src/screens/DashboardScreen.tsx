import { useState } from 'react'
import { Bell, TrendingUp, Users, Zap, ChevronRight, Clock, IndianRupee, CheckCircle2, AlertCircle, CalendarPlus, Ban, Trophy, GraduationCap, Wrench, CreditCard } from 'lucide-react'
import VenueSelector from '../components/VenueSelector'
import StatusChip from '../components/StatusChip'

const bookings = [
  { id: 'BK001', customer: 'Arjun Sharma', court: 'Court 2', time: '09:00 – 10:30', amount: 750, status: 'confirmed', payment: 'paid' },
  { id: 'BK002', customer: 'Priya Nair', court: 'Court 4', time: '10:00 – 11:00', amount: 500, status: 'confirmed', payment: 'partial' },
  { id: 'BK003', customer: 'Karthik Rajan', court: 'Court 1', time: '11:00 – 12:30', amount: 750, status: 'pending', payment: 'unpaid' },
  { id: 'BK004', customer: 'Deepa Menon', court: 'Court 3', time: '14:00 – 15:00', amount: 500, status: 'confirmed', payment: 'paid' },
]

const courts = [
  { id: 1, name: 'Court 1', status: 'booked', customer: 'Karthik', until: '12:30' },
  { id: 2, name: 'Court 2', status: 'booked', customer: 'Arjun', until: '10:30' },
  { id: 3, name: 'Court 3', status: 'available', customer: null, until: null },
  { id: 4, name: 'Court 4', status: 'booked', customer: 'Priya', until: '11:00' },
  { id: 5, name: 'Court 5', status: 'maintenance', customer: null, until: '13:00' },
  { id: 6, name: 'Court 6', status: 'available', customer: null, until: null },
]

const quickActions = [
  { id: 'booking', label: 'New Booking', icon: CalendarPlus, color: '#2563EB', bg: '#EFF6FF' },
  { id: 'block', label: 'Block Slot', icon: Ban, color: '#DC2626', bg: '#FEF2F2' },
  { id: 'tournament', label: 'Tournament', icon: Trophy, color: '#7C3AED', bg: '#F5F3FF' },
  { id: 'coaching', label: 'Coaching', icon: GraduationCap, color: '#D97706', bg: '#FFFBEB' },
  { id: 'maintenance', label: 'Maintenance', icon: Wrench, color: '#64748B', bg: '#F8FAFC' },
  { id: 'membership', label: 'Membership', icon: CreditCard, color: '#16A34A', bg: '#F0FDF4' },
]

const courtStatusColor: Record<string, string> = {
  booked: '#2563EB',
  available: '#16A34A',
  maintenance: '#64748B',
  blocked: '#DC2626',
}

interface Props {
  onNavigate: (screen: string) => void
  onBookingSelect: (id: string) => void
}

export default function DashboardScreen({ onNavigate, onBookingSelect }: Props) {
  const [venue, setVenue] = useState('v1')

  return (
    <div style={{ height: '100%', overflowY: 'auto', background: '#F8FAFC' }} className="scrollbar-hide">
      {/* Header */}
      <div style={{ background: '#fff', padding: '0 20px 16px', borderBottom: '1px solid #F1F5F9' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <div>
            <div style={{ fontSize: 12, color: '#64748B', fontWeight: 500 }}>Good morning 👋</div>
            <div style={{ fontSize: 18, fontWeight: 800, color: '#0F172A', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>Rajesh Kumar</div>
          </div>
          <button style={{ width: 40, height: 40, borderRadius: 12, background: '#F8FAFC', border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', position: 'relative' }}>
            <Bell size={18} color="#64748B" />
            <span style={{ position: 'absolute', top: 8, right: 8, width: 8, height: 8, background: '#DC2626', borderRadius: '50%', border: '1.5px solid #fff' }} />
          </button>
        </div>
        <VenueSelector selectedVenue={venue} onSelect={setVenue} />
      </div>

      <div style={{ padding: '16px 16px 0' }}>
        {/* Stats row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
          <div style={{ background: 'linear-gradient(135deg, #2563EB 0%, #3B82F6 100%)', borderRadius: 18, padding: '16px', color: '#fff' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
              <IndianRupee size={14} color="rgba(255,255,255,0.8)" />
              <span style={{ fontSize: 11, fontWeight: 600, opacity: 0.8 }}>Today's Revenue</span>
            </div>
            <div style={{ fontSize: 26, fontWeight: 800, fontFamily: 'Plus Jakarta Sans, sans-serif', letterSpacing: '-0.5px' }}>₹8,450</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 4 }}>
              <TrendingUp size={12} color="rgba(255,255,255,0.8)" />
              <span style={{ fontSize: 11, opacity: 0.8 }}>+12% vs yesterday</span>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ background: '#fff', borderRadius: 14, padding: '12px 14px', flex: 1, border: '1px solid #F1F5F9' }}>
              <div style={{ fontSize: 11, color: '#64748B', fontWeight: 500, marginBottom: 4 }}>Bookings Today</div>
              <div style={{ fontSize: 22, fontWeight: 800, color: '#0F172A', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>14</div>
              <div style={{ fontSize: 11, color: '#16A34A', fontWeight: 600 }}>2 upcoming</div>
            </div>
            <div style={{ background: '#fff', borderRadius: 14, padding: '12px 14px', flex: 1, border: '1px solid #F1F5F9', display: 'flex', gap: 12 }}>
              <div>
                <div style={{ fontSize: 10, color: '#64748B', fontWeight: 500 }}>Occupied</div>
                <div style={{ fontSize: 18, fontWeight: 800, color: '#2563EB', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>4</div>
              </div>
              <div style={{ width: 1, background: '#F1F5F9' }} />
              <div>
                <div style={{ fontSize: 10, color: '#64748B', fontWeight: 500 }}>Available</div>
                <div style={{ fontSize: 18, fontWeight: 800, color: '#16A34A', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>2</div>
              </div>
            </div>
          </div>
        </div>

        {/* Live courts */}
        <div style={{ background: '#fff', borderRadius: 18, padding: '16px', marginBottom: 16, border: '1px solid #F1F5F9' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#16A34A', boxShadow: '0 0 0 3px rgba(22,163,74,0.2)' }} />
              <span style={{ fontSize: 14, fontWeight: 700, color: '#0F172A' }}>Live Courts</span>
            </div>
            <button onClick={() => onNavigate('schedule')} style={{ background: 'none', border: 'none', color: '#2563EB', fontSize: 12, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 2 }}>
              Schedule <ChevronRight size={14} />
            </button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {courts.map(court => (
              <div key={court.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', background: '#F8FAFC', borderRadius: 12 }}>
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: courtStatusColor[court.status] ?? '#94A3B8', flexShrink: 0 }} />
                <span style={{ fontSize: 13, fontWeight: 600, color: '#0F172A', flex: 1 }}>{court.name}</span>
                {court.customer ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontSize: 12, color: '#64748B' }}>{court.customer}</span>
                    <span style={{ fontSize: 11, color: '#2563EB', fontWeight: 600 }}>till {court.until}</span>
                  </div>
                ) : (
                  <StatusChip status={court.status} size="sm" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Pending payments */}
        <div style={{ background: '#FFFBEB', borderRadius: 16, padding: '14px 16px', marginBottom: 16, border: '1px solid #FDE68A' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <AlertCircle size={16} color="#D97706" />
            <span style={{ fontSize: 13, fontWeight: 700, color: '#92400E' }}>₹1,250 pending payment</span>
            <button onClick={() => onNavigate('bookings')} style={{ background: 'none', border: 'none', color: '#D97706', fontSize: 12, fontWeight: 600, cursor: 'pointer', marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 2 }}>
              View <ChevronRight size={13} />
            </button>
          </div>
        </div>

        {/* Quick Actions */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#0F172A', marginBottom: 12 }}>Quick Actions</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
            {quickActions.map(action => {
              const Icon = action.icon
              return (
                <button
                  key={action.id}
                  onClick={() => action.id === 'booking' && onNavigate('new-booking')}
                  style={{
                    background: '#fff',
                    border: '1px solid #F1F5F9',
                    borderRadius: 14,
                    padding: '14px 8px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 8,
                    cursor: 'pointer',
                  }}
                >
                  <div style={{ width: 40, height: 40, borderRadius: 12, background: action.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon size={18} color={action.color} />
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 600, color: '#0F172A', textAlign: 'center' }}>{action.label}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Recent Bookings */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#0F172A' }}>Recent Bookings</div>
            <button onClick={() => onNavigate('bookings')} style={{ background: 'none', border: 'none', color: '#2563EB', fontSize: 12, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 2 }}>
              View all <ChevronRight size={14} />
            </button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {bookings.map(b => (
              <div
                key={b.id}
                onClick={() => onBookingSelect(b.id)}
                style={{ background: '#fff', borderRadius: 16, padding: '14px 16px', border: '1px solid #F1F5F9', cursor: 'pointer' }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 8 }}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: '#0F172A' }}>{b.customer}</div>
                    <div style={{ fontSize: 12, color: '#64748B', marginTop: 2 }}>{b.court} · {b.time}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 15, fontWeight: 700, color: '#0F172A' }}>₹{b.amount}</div>
                    <StatusChip status={b.payment} size="sm" />
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <StatusChip status={b.status} size="sm" />
                  <span style={{ fontSize: 11, color: '#94A3B8' }}>{b.id}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming */}
        <div style={{ background: '#fff', borderRadius: 16, padding: '14px 16px', marginBottom: 100, border: '1px solid #F1F5F9' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <Clock size={15} color="#2563EB" />
            <span style={{ fontSize: 14, fontWeight: 700, color: '#0F172A' }}>Next Booking</span>
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Zap size={20} color="#2563EB" />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#0F172A' }}>Sundar Pichai</div>
              <div style={{ fontSize: 12, color: '#64748B', marginTop: 2 }}>Court 3 · 14:00 – 15:30 · ₹750</div>
              <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                <button style={{ fontSize: 12, fontWeight: 600, color: '#2563EB', background: '#EFF6FF', border: 'none', borderRadius: 8, padding: '4px 12px', cursor: 'pointer' }}>View</button>
                <button style={{ fontSize: 12, fontWeight: 600, color: '#fff', background: '#2563EB', border: 'none', borderRadius: 8, padding: '4px 12px', cursor: 'pointer' }}>
                  <CheckCircle2 size={12} style={{ marginRight: 4 }} />
                  Confirm
                </button>
              </div>
            </div>
            <div style={{ flexShrink: 0 }}>
              <div style={{ fontSize: 11, color: '#64748B' }}>in</div>
              <div style={{ fontSize: 20, fontWeight: 800, color: '#2563EB', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>2h</div>
              <div style={{ fontSize: 11, color: '#64748B' }}>15m</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
