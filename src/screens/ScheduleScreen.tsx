import { useState } from 'react'
import { ChevronLeft, ChevronRight, X, CalendarPlus, Ban, Eye, Pencil, Trophy, GraduationCap, Wrench } from 'lucide-react'
import VenueSelector from '../components/VenueSelector'

const HOUR_WIDTH = 80
const COURT_LABEL_WIDTH = 72
const START_HOUR = 6
const END_HOUR = 22

const courts = ['Court 1', 'Court 2', 'Court 3', 'Court 4', 'Court 5', 'Court 6']

const slotConfig: Record<string, { bg: string; border: string; text: string }> = {
  booked: { bg: '#EFF6FF', border: '#93C5FD', text: '#1D4ED8' },
  coaching: { bg: '#FFFBEB', border: '#FCD34D', text: '#92400E' },
  tournament: { bg: '#F5F3FF', border: '#C4B5FD', text: '#5B21B6' },
  maintenance: { bg: '#F8FAFC', border: '#CBD5E1', text: '#475569' },
  blocked: { bg: '#FEF2F2', border: '#FCA5A5', text: '#991B1B' },
}

const bookingSlots = [
  { id: 's1', court: 0, start: 6, duration: 1.5, type: 'booked', label: 'Arjun S.' },
  { id: 's2', court: 0, start: 8, duration: 1, type: 'coaching', label: 'Coaching' },
  { id: 's3', court: 0, start: 10, duration: 2, type: 'booked', label: 'Priya N.' },
  { id: 's4', court: 1, start: 7, duration: 2, type: 'booked', label: 'Karthik' },
  { id: 's5', court: 1, start: 11, duration: 3, type: 'tournament', label: 'Tournament' },
  { id: 's6', court: 2, start: 6, duration: 4, type: 'maintenance', label: 'Maint.' },
  { id: 's7', court: 2, start: 14, duration: 1, type: 'booked', label: 'Deepa M.' },
  { id: 's8', court: 3, start: 9, duration: 1.5, type: 'booked', label: 'Sundar P.' },
  { id: 's9', court: 3, start: 13, duration: 2, type: 'booked', label: 'Ravi K.' },
  { id: 's10', court: 4, start: 8, duration: 1, type: 'blocked', label: 'Blocked' },
  { id: 's11', court: 5, start: 10, duration: 1.5, type: 'booked', label: 'Meera R.' },
  { id: 's12', court: 5, start: 14, duration: 1, type: 'coaching', label: 'Coaching' },
]

const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const hours = Array.from({ length: END_HOUR - START_HOUR }, (_, i) => START_HOUR + i)

interface BottomSheetProps {
  slot: typeof bookingSlots[0] | null
  courtName: string
  hour: number
  onClose: () => void
  onNewBooking: () => void
}

function SlotBottomSheet({ slot, courtName, hour, onClose, onNewBooking }: BottomSheetProps) {
  const actions = slot ? [
    { icon: Eye, label: 'View Booking', color: '#2563EB' },
    { icon: Pencil, label: 'Edit Booking', color: '#0F172A' },
    { icon: CalendarPlus, label: 'New Booking', color: '#16A34A', action: onNewBooking },
    { icon: Ban, label: 'Block Slot', color: '#DC2626' },
    { icon: Trophy, label: 'Tournament', color: '#7C3AED' },
    { icon: GraduationCap, label: 'Coaching', color: '#D97706' },
    { icon: Wrench, label: 'Maintenance', color: '#64748B' },
  ] : [
    { icon: CalendarPlus, label: 'New Booking', color: '#2563EB', action: onNewBooking },
    { icon: Ban, label: 'Block Slot', color: '#DC2626' },
    { icon: Trophy, label: 'Tournament', color: '#7C3AED' },
    { icon: GraduationCap, label: 'Coaching', color: '#D97706' },
    { icon: Wrench, label: 'Maintenance', color: '#64748B' },
  ]

  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 80 }}>
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)' }} onClick={onClose} />
      <div
        style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: '#fff', borderRadius: '24px 24px 0 0', padding: '0 0 32px' }}
        className="bottom-sheet-enter"
      >
        <div style={{ display: 'flex', justifyContent: 'center', padding: '12px 0 4px' }}>
          <div style={{ width: 36, height: 4, borderRadius: 2, background: '#E2E8F0' }} />
        </div>
        <div style={{ padding: '12px 24px 20px', borderBottom: '1px solid #F1F5F9' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: 16, fontWeight: 700, color: '#0F172A' }}>
                {courtName} · {hour}:00
              </div>
              {slot && (
                <div style={{ fontSize: 13, color: '#64748B', marginTop: 2 }}>
                  {slot.label} · {slot.duration}h
                </div>
              )}
            </div>
            <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: 16, background: '#F1F5F9', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <X size={16} color="#64748B" />
            </button>
          </div>
        </div>
        <div style={{ padding: '12px 16px' }}>
          {actions.map((a, i) => {
            const Icon = a.icon
            return (
              <button
                key={i}
                onClick={a.action ?? onClose}
                style={{ display: 'flex', alignItems: 'center', gap: 14, width: '100%', padding: '14px 8px', background: 'none', border: 'none', cursor: 'pointer', borderRadius: 12 }}
              >
                <div style={{ width: 40, height: 40, borderRadius: 12, background: '#F8FAFC', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon size={18} color={a.color} />
                </div>
                <span style={{ fontSize: 15, fontWeight: 600, color: '#0F172A' }}>{a.label}</span>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

interface Props {
  onNavigate: (screen: string) => void
}

export default function ScheduleScreen({ onNavigate }: Props) {
  const [venue, setVenue] = useState('v1')
  const [selectedDay, setSelectedDay] = useState(3)
  const [sheet, setSheet] = useState<{ slot: typeof bookingSlots[0] | null; court: number; hour: number } | null>(null)

  const today = new Date()
  const weekStart = new Date(today)
  weekStart.setDate(today.getDate() - today.getDay() + 1)

  const handleCellTap = (courtIdx: number, hour: number) => {
    const slot = bookingSlots.find(s => s.court === courtIdx && hour >= s.start && hour < s.start + s.duration) ?? null
    setSheet({ slot, court: courtIdx, hour })
  }

  const currentHour = today.getHours()
  const currentHourOffset = (currentHour - START_HOUR) * HOUR_WIDTH

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: '#F8FAFC', position: 'relative' }}>
      {/* Header */}
      <div style={{ background: '#fff', padding: '0 16px 12px', borderBottom: '1px solid #F1F5F9', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <div style={{ fontSize: 18, fontWeight: 800, color: '#0F172A', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>Schedule</div>
          <VenueSelector selectedVenue={venue} onSelect={setVenue} />
        </div>

        {/* Week strip */}
        <div style={{ display: 'flex', gap: 4 }}>
          {weekDays.map((d, i) => {
            const date = new Date(weekStart)
            date.setDate(weekStart.getDate() + i)
            const isSelected = i === selectedDay
            const isToday = date.toDateString() === today.toDateString()
            return (
              <button
                key={i}
                onClick={() => setSelectedDay(i)}
                style={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  padding: '8px 4px',
                  borderRadius: 12,
                  background: isSelected ? '#2563EB' : 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                <span style={{ fontSize: 10, fontWeight: 600, color: isSelected ? 'rgba(255,255,255,0.8)' : '#64748B' }}>{d}</span>
                <span style={{ fontSize: 15, fontWeight: 700, color: isSelected ? '#fff' : isToday ? '#2563EB' : '#0F172A', marginTop: 2 }}>
                  {date.getDate()}
                </span>
                {isToday && !isSelected && <div style={{ width: 4, height: 4, borderRadius: '50%', background: '#2563EB', marginTop: 2 }} />}
              </button>
            )
          })}
        </div>
      </div>

      {/* Timeline */}
      <div style={{ flex: 1, overflow: 'auto' }} className="scrollbar-hide">
        <div style={{ display: 'flex', minWidth: COURT_LABEL_WIDTH + hours.length * HOUR_WIDTH }}>
          {/* Court labels */}
          <div style={{ width: COURT_LABEL_WIDTH, flexShrink: 0, paddingTop: 32, background: '#fff', borderRight: '1px solid #F1F5F9', position: 'sticky', left: 0, zIndex: 10 }}>
            {courts.map((court, i) => (
              <div key={i} style={{ height: 64, display: 'flex', alignItems: 'center', paddingLeft: 12, borderBottom: '1px solid #F8FAFC' }}>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#0F172A' }}>{court}</div>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#16A34A', marginTop: 3 }} />
                </div>
              </div>
            ))}
          </div>

          {/* Grid */}
          <div style={{ flex: 1, position: 'relative' }}>
            {/* Hour labels */}
            <div style={{ display: 'flex', height: 32, borderBottom: '1px solid #F1F5F9', background: '#fff', position: 'sticky', top: 0, zIndex: 9 }}>
              {hours.map(h => (
                <div key={h} style={{ width: HOUR_WIDTH, flexShrink: 0, display: 'flex', alignItems: 'center', paddingLeft: 8, borderRight: '1px solid #F1F5F9' }}>
                  <span style={{ fontSize: 10, fontWeight: 600, color: '#94A3B8' }}>
                    {h < 12 ? `${h}AM` : h === 12 ? '12PM' : `${h - 12}PM`}
                  </span>
                </div>
              ))}
            </div>

            {/* Current time indicator */}
            {selectedDay === 3 && currentHour >= START_HOUR && currentHour < END_HOUR && (
              <div style={{ position: 'absolute', top: 32, left: currentHourOffset, width: 2, height: courts.length * 64, background: '#DC2626', zIndex: 8 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#DC2626', marginLeft: -3, marginTop: -3 }} />
              </div>
            )}

            {/* Court rows */}
            {courts.map((_, courtIdx) => (
              <div key={courtIdx} style={{ display: 'flex', height: 64, borderBottom: '1px solid #F8FAFC', position: 'relative' }}>
                {hours.map(h => (
                  <div
                    key={h}
                    onClick={() => handleCellTap(courtIdx, h)}
                    style={{ width: HOUR_WIDTH, flexShrink: 0, height: '100%', borderRight: '1px solid #F1F5F9', background: '#fff', cursor: 'pointer' }}
                  />
                ))}

                {/* Booking blocks */}
                {bookingSlots
                  .filter(s => s.court === courtIdx)
                  .map(s => {
                    const cfg = slotConfig[s.type]
                    return (
                      <div
                        key={s.id}
                        onClick={() => setSheet({ slot: s, court: courtIdx, hour: s.start })}
                        style={{
                          position: 'absolute',
                          left: (s.start - START_HOUR) * HOUR_WIDTH + 2,
                          top: 6,
                          width: s.duration * HOUR_WIDTH - 4,
                          height: 52,
                          background: cfg.bg,
                          border: `1.5px solid ${cfg.border}`,
                          borderRadius: 10,
                          display: 'flex',
                          alignItems: 'center',
                          paddingLeft: 10,
                          cursor: 'pointer',
                          overflow: 'hidden',
                        }}
                      >
                        <span style={{ fontSize: 11, fontWeight: 700, color: cfg.text, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {s.label}
                        </span>
                      </div>
                    )
                  })}
              </div>
            ))}
          </div>
        </div>

        {/* Legend */}
        <div style={{ display: 'flex', gap: 12, padding: '12px 16px', flexWrap: 'wrap', background: '#fff', borderTop: '1px solid #F1F5F9' }}>
          {Object.entries({ booked: 'Booked', coaching: 'Coaching', tournament: 'Tournament', maintenance: 'Maint.', blocked: 'Blocked' }).map(([k, label]) => (
            <div key={k} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 12, height: 12, borderRadius: 3, background: slotConfig[k].bg, border: `1.5px solid ${slotConfig[k].border}` }} />
              <span style={{ fontSize: 11, color: '#64748B', fontWeight: 500 }}>{label}</span>
            </div>
          ))}
        </div>
      </div>

      {sheet && (
        <SlotBottomSheet
          slot={sheet.slot}
          courtName={courts[sheet.court]}
          hour={sheet.hour}
          onClose={() => setSheet(null)}
          onNewBooking={() => { setSheet(null); onNavigate('new-booking') }}
        />
      )}
    </div>
  )
}
