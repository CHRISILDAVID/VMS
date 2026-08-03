import { useState } from 'react'
import {
  Search, SlidersHorizontal, Phone, MessageCircle, Pencil,
  CheckCircle2, XCircle, MoveRight, ChevronDown, ChevronRight,
  Clock, MapPin, IndianRupee, Calendar, X,
} from 'lucide-react'
import StatusChip from '../components/StatusChip'

import { allBookings } from '../data/bookings'

const TAB_FILTERS: Record<string, string[]> = {
  Upcoming: ['upcoming'],
  Ongoing: ['ongoing'],
  Completed: ['completed'],
  Cancelled: ['cancelled'],
}

const courts = ['All Courts', 'Court 1', 'Court 2', 'Court 3', 'Court 4', 'Court 5', 'Court 6']

const statusDot: Record<string, string> = {
  upcoming: '#2563EB',
  ongoing: '#16A34A',
  completed: '#64748B',
  cancelled: '#DC2626',
}

// ─── Filter Drawer ──────────────────────────────────────────────────────────
function FilterSheet({ open, onClose, court, onCourt, date, onDate }: {
  open: boolean; onClose: () => void
  court: string; onCourt: (c: string) => void
  date: string; onDate: (d: string) => void
}) {
  if (!open) return null
  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 80 }}>
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)' }} onClick={onClose} />
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: '#fff', borderRadius: '24px 24px 0 0', padding: '0 0 40px' }} className="bottom-sheet-enter">
        <div style={{ display: 'flex', justifyContent: 'center', padding: '12px 0 4px' }}>
          <div style={{ width: 36, height: 4, borderRadius: 2, background: '#E2E8F0' }} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 20px 16px', borderBottom: '1px solid #F1F5F9' }}>
          <span style={{ fontSize: 16, fontWeight: 700, color: '#0F172A' }}>Filter Bookings</span>
          <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: 16, background: '#F1F5F9', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <X size={16} color="#64748B" />
          </button>
        </div>
        <div style={{ padding: '20px' }}>
          <div style={{ marginBottom: 20 }}>
            <label style={{ fontSize: 12, fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: 10 }}>Date</label>
            <input type="date" value={date} onChange={e => onDate(e.target.value)} style={{ width: '100%', padding: '12px 14px', border: '1.5px solid #E2E8F0', borderRadius: 12, fontSize: 14, fontWeight: 600, color: '#0F172A', background: '#F8FAFC', outline: 'none' }} />
          </div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: 10 }}>Court</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {courts.map(c => (
                <button key={c} onClick={() => onCourt(c)} style={{ padding: '8px 14px', borderRadius: 20, border: `1.5px solid ${court === c ? '#2563EB' : '#E2E8F0'}`, background: court === c ? '#2563EB' : '#F8FAFC', color: court === c ? '#fff' : '#64748B', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>{c}</button>
              ))}
            </div>
          </div>
        </div>
        <div style={{ padding: '0 20px' }}>
          <button onClick={onClose} style={{ width: '100%', padding: '14px', background: '#2563EB', color: '#fff', border: 'none', borderRadius: 14, fontSize: 15, fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 12px rgba(37,99,235,0.3)' }}>Apply Filters</button>
        </div>
      </div>
    </div>
  )
}

// ─── Booking Detail Sheet ───────────────────────────────────────────────────
function BookingDetailSheet({ booking, onClose }: { booking: typeof allBookings[0]; onClose: () => void }) {
  const Row = ({ label, value }: { label: string; value: string }) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '11px 0', borderBottom: '1px solid #F8FAFC' }}>
      <span style={{ fontSize: 13, color: '#64748B', fontWeight: 500 }}>{label}</span>
      <span style={{ fontSize: 13, fontWeight: 600, color: '#0F172A' }}>{value}</span>
    </div>
  )
  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 80 }}>
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)' }} onClick={onClose} />
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: '#fff', borderRadius: '24px 24px 0 0', maxHeight: '90%', display: 'flex', flexDirection: 'column' }} className="bottom-sheet-enter">
        <div style={{ display: 'flex', justifyContent: 'center', padding: '12px 0 4px', flexShrink: 0 }}>
          <div style={{ width: 36, height: 4, borderRadius: 2, background: '#E2E8F0' }} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 20px 14px', borderBottom: '1px solid #F1F5F9', flexShrink: 0 }}>
          <div>
            <div style={{ fontSize: 16, fontWeight: 800, color: '#0F172A' }}>{booking.customer}</div>
            <div style={{ fontSize: 12, color: '#64748B', marginTop: 2 }}>{booking.id}</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <StatusChip status={booking.status} />
            <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: 16, background: '#F1F5F9', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <X size={16} color="#64748B" />
            </button>
          </div>
        </div>

        <div style={{ overflowY: 'auto', padding: '16px 20px 20px' }} className="scrollbar-hide">
          {/* Customer */}
          <div style={{ background: '#F8FAFC', borderRadius: 14, padding: '14px', marginBottom: 14 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>Customer</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 40, height: 40, borderRadius: 12, background: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: 16, fontWeight: 800, color: '#2563EB' }}>{booking.customer.charAt(0)}</span>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#0F172A' }}>{booking.customer}</div>
                <div style={{ fontSize: 12, color: '#64748B' }}>+91 {booking.phone}</div>
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                <button style={{ width: 34, height: 34, borderRadius: 10, background: '#fff', border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                  <Phone size={14} color="#64748B" />
                </button>
                <button style={{ width: 34, height: 34, borderRadius: 10, background: '#F0FDF4', border: '1px solid #BBF7D0', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                  <MessageCircle size={14} color="#16A34A" />
                </button>
              </div>
            </div>
          </div>

          {/* Booking details */}
          <div style={{ background: '#F8FAFC', borderRadius: 14, padding: '14px', marginBottom: 14 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>Booking Details</div>
            <Row label="Court" value={booking.court} />
            <Row label="Date" value={booking.date} />
            <Row label="Time" value={`${booking.time} – ${booking.endTime}`} />
            <Row label="Duration" value={booking.duration} />
            <Row label="Source" value={booking.source.charAt(0).toUpperCase() + booking.source.slice(1)} />
          </div>

          {/* Payment */}
          <div style={{ background: '#F8FAFC', borderRadius: 14, padding: '14px', marginBottom: 14 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>Payment</div>
            <Row label="Total" value={`₹${booking.amount}`} />
            <Row label="Advance Paid" value={`₹${booking.advance}`} />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '11px 0', borderBottom: '1px solid #F8FAFC' }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: booking.pending > 0 ? '#DC2626' : '#16A34A' }}>Pending</span>
              <span style={{ fontSize: 14, fontWeight: 800, color: booking.pending > 0 ? '#DC2626' : '#16A34A' }}>₹{booking.pending}</span>
            </div>
            <div style={{ paddingTop: 10 }}><StatusChip status={booking.payment} /></div>
          </div>

          {/* Notes */}
          {booking.notes && (
            <div style={{ background: '#FFFBEB', borderRadius: 14, padding: '14px', marginBottom: 14, border: '1px solid #FDE68A' }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#92400E', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>Notes</div>
              <div style={{ fontSize: 13, color: '#78350F', lineHeight: 1.5 }}>{booking.notes}</div>
            </div>
          )}

          {/* Actions */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {booking.pending > 0 && (
              <button style={{ width: '100%', padding: '13px', background: '#2563EB', color: '#fff', border: 'none', borderRadius: 14, fontSize: 14, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, boxShadow: '0 4px 12px rgba(37,99,235,0.25)' }}>
                <IndianRupee size={16} /> Collect ₹{booking.pending}
              </button>
            )}
            <div style={{ display: 'flex', gap: 8 }}>
              <button style={{ flex: 1, padding: '11px', background: '#F8FAFC', color: '#0F172A', border: '1.5px solid #E2E8F0', borderRadius: 12, fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                <Pencil size={14} /> Edit
              </button>
              <button style={{ flex: 1, padding: '11px', background: '#EFF6FF', color: '#2563EB', border: '1.5px solid #BFDBFE', borderRadius: 12, fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                <MoveRight size={14} /> Move
              </button>
              {booking.status !== 'cancelled' && (
                <button style={{ flex: 1, padding: '11px', background: '#FEF2F2', color: '#DC2626', border: '1.5px solid #FCA5A5', borderRadius: 12, fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                  <XCircle size={14} /> Cancel
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Booking Card ────────────────────────────────────────────────────────────
function BookingCard({ b, onTap }: { b: typeof allBookings[0]; onTap: () => void }) {
  return (
    <div onClick={onTap} style={{ background: '#fff', borderRadius: 18, padding: '16px', border: '1px solid #F1F5F9', cursor: 'pointer', position: 'relative', overflow: 'hidden' }}>
      {/* Status stripe */}
      <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 4, background: statusDot[b.status] ?? '#E2E8F0', borderRadius: '18px 0 0 18px' }} />

      <div style={{ paddingLeft: 8 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 38, height: 38, borderRadius: 11, background: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <span style={{ fontSize: 15, fontWeight: 800, color: '#2563EB' }}>{b.customer.charAt(0)}</span>
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#0F172A' }}>{b.customer}</div>
              <div style={{ fontSize: 11, color: '#94A3B8', marginTop: 1 }}>{b.id}</div>
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 16, fontWeight: 800, color: '#0F172A' }}>₹{b.amount}</div>
            <StatusChip status={b.payment} size="sm" />
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <MapPin size={11} color="#94A3B8" />
            <span style={{ fontSize: 12, fontWeight: 600, color: '#64748B' }}>{b.court}</span>
          </div>
          <div style={{ width: 3, height: 3, borderRadius: '50%', background: '#CBD5E1', alignSelf: 'center' }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <Clock size={11} color="#94A3B8" />
            <span style={{ fontSize: 12, fontWeight: 600, color: '#64748B' }}>{b.time} – {b.endTime}</span>
          </div>
          <div style={{ width: 3, height: 3, borderRadius: '50%', background: '#CBD5E1', alignSelf: 'center' }} />
          <span style={{ fontSize: 12, fontWeight: 600, color: '#64748B' }}>{b.duration}</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: statusDot[b.status] }} />
            <StatusChip status={b.status} size="sm" />
          </div>
          <div style={{ display: 'flex', gap: 6 }} onClick={e => e.stopPropagation()}>
            <button style={{ width: 30, height: 30, borderRadius: 8, background: '#F8FAFC', border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
              <Phone size={13} color="#64748B" />
            </button>
            <button style={{ width: 30, height: 30, borderRadius: 8, background: '#F0FDF4', border: '1px solid #BBF7D0', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
              <MessageCircle size={13} color="#16A34A" />
            </button>
            {b.pending > 0 && (
              <button style={{ padding: '0 10px', height: 30, borderRadius: 8, background: '#EFF6FF', border: '1px solid #BFDBFE', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: 11, fontWeight: 700, color: '#2563EB', gap: 4 }}>
                <IndianRupee size={11} /> Collect
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Main Screen ─────────────────────────────────────────────────────────────
interface Props {
  onBookingSelect: (id: string) => void
  onNewBooking: () => void
}

export default function BookingsScreen({ onBookingSelect, onNewBooking }: Props) {
  const [tab, setTab] = useState('Upcoming')
  const [search, setSearch] = useState('')
  const [filterOpen, setFilterOpen] = useState(false)
  const [filterCourt, setFilterCourt] = useState('All Courts')
  const [filterDate, setFilterDate] = useState('')
  const [activeBooking, setActiveBooking] = useState<typeof allBookings[0] | null>(null)

  const statuses = TAB_FILTERS[tab] ?? []
  const filtered = allBookings.filter(b => {
    const matchTab = statuses.includes(b.status)
    const matchSearch = !search || b.customer.toLowerCase().includes(search.toLowerCase()) || b.phone.includes(search) || b.id.toLowerCase().includes(search.toLowerCase())
    const matchCourt = filterCourt === 'All Courts' || b.court === filterCourt
    const matchDate = !filterDate || b.dateRaw === filterDate
    return matchTab && matchSearch && matchCourt && matchDate
  })

  const tabs = ['Upcoming', 'Ongoing', 'Completed', 'Cancelled']
  const counts: Record<string, number> = {}
  tabs.forEach(t => { counts[t] = allBookings.filter(b => TAB_FILTERS[t].includes(b.status)).length })

  const hasFilters = filterCourt !== 'All Courts' || filterDate !== ''

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: '#F8FAFC', position: 'relative' }}>
      {/* Header */}
      <div style={{ background: '#fff', padding: '0 16px 12px', borderBottom: '1px solid #F1F5F9', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <div>
            <div style={{ fontSize: 20, fontWeight: 800, color: '#0F172A', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>Bookings</div>
            <div style={{ fontSize: 12, color: '#64748B', fontWeight: 500, marginTop: 1 }}>Tue, 8 Jul 2026</div>
          </div>
          <button
            onClick={() => setFilterOpen(true)}
            style={{ display: 'flex', alignItems: 'center', gap: 6, background: hasFilters ? '#EFF6FF' : '#F8FAFC', border: `1.5px solid ${hasFilters ? '#93C5FD' : '#E2E8F0'}`, borderRadius: 12, padding: '8px 14px', cursor: 'pointer' }}
          >
            <SlidersHorizontal size={15} color={hasFilters ? '#2563EB' : '#64748B'} />
            <span style={{ fontSize: 13, fontWeight: 600, color: hasFilters ? '#2563EB' : '#64748B' }}>Filter{hasFilters ? ' •' : ''}</span>
          </button>
        </div>

        {/* Search */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#F8FAFC', border: '1.5px solid #E2E8F0', borderRadius: 12, padding: '10px 14px', marginBottom: 14 }}>
          <Search size={16} color="#94A3B8" />
          <input
            type="text"
            placeholder="Player name, phone or booking ID…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ flex: 1, border: 'none', background: 'transparent', fontSize: 13, color: '#0F172A', outline: 'none' }}
          />
          {search && (
            <button onClick={() => setSearch('')} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
              <X size={15} color="#94A3B8" />
            </button>
          )}
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', background: '#F8FAFC', borderRadius: 12, padding: 3, gap: 2 }}>
          {tabs.map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              style={{
                flex: 1, padding: '7px 2px', borderRadius: 10, border: 'none',
                background: tab === t ? '#fff' : 'transparent',
                color: tab === t ? '#2563EB' : '#64748B',
                fontSize: 11, fontWeight: tab === t ? 700 : 500, cursor: 'pointer',
                boxShadow: tab === t ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
                transition: 'all 0.15s',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1,
              }}
            >
              <span>{t}</span>
              {counts[t] > 0 && (
                <span style={{ fontSize: 10, fontWeight: 700, color: tab === t ? '#2563EB' : '#94A3B8' }}>{counts[t]}</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '12px 16px 88px' }} className="scrollbar-hide">
        {filtered.length === 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60%', gap: 12 }}>
            <div style={{ width: 64, height: 64, borderRadius: 20, background: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Calendar size={28} color="#CBD5E1" />
            </div>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#64748B' }}>No {tab.toLowerCase()} bookings</div>
            <div style={{ fontSize: 13, color: '#94A3B8' }}>
              {search || hasFilters ? 'Try adjusting your filters' : 'Bookings will appear here'}
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {filtered.map(b => (
              <BookingCard key={b.id} b={b} onTap={() => setActiveBooking(b)} />
            ))}
          </div>
        )}
      </div>

      {/* Filter sheet */}
      <FilterSheet
        open={filterOpen}
        onClose={() => setFilterOpen(false)}
        court={filterCourt}
        onCourt={setFilterCourt}
        date={filterDate}
        onDate={setFilterDate}
      />

      {/* Booking detail sheet */}
      {activeBooking && (
        <BookingDetailSheet booking={activeBooking} onClose={() => setActiveBooking(null)} />
      )}
    </div>
  )
}
