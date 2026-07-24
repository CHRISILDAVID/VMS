import { useState } from 'react'
import { ChevronLeft, Plus, X, Copy, Check, Edit2, Trash2, ChevronDown } from 'lucide-react'

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

type Block = { id: string; start: string; end: string; price: number; courts: string; active: boolean }
type DaySchedule = { closed: boolean; allDay: boolean; blocks: Block[] }
type Schedule = Record<string, DaySchedule>

const defaultBlocks = (): Block[] => [
  { id: 'b1', start: '06:00', end: '16:00', price: 350, courts: 'All Courts', active: true },
  { id: 'b2', start: '16:00', end: '22:00', price: 550, courts: 'All Courts', active: true },
]

const initSchedule = (): Schedule => {
  const s: Schedule = {}
  DAYS.forEach(d => {
    s[d] = {
      closed: d === 'Sun',
      allDay: false,
      blocks: d === 'Sun' ? [] : defaultBlocks().map(b => ({ ...b, id: `${d}-${b.id}` })),
    }
  })
  s['Sat'].blocks = [{ id: 'Sat-b1', start: '06:00', end: '22:00', price: 700, courts: 'All Courts', active: true }]
  return s
}

const blockColor = (price: number) => {
  if (price >= 600) return { bg: '#F5F3FF', border: '#C4B5FD', text: '#5B21B6' }
  if (price >= 500) return { bg: '#FFFBEB', border: '#FCD34D', text: '#92400E' }
  return { bg: '#EFF6FF', border: '#93C5FD', text: '#1D4ED8' }
}

// ─── Edit Block Sheet ─────────────────────────────────────────────────────────
function EditBlockSheet({ block, day, onSave, onDelete, onClose }: {
  block: Block | null; day: string
  onSave: (b: Block) => void
  onDelete?: () => void
  onClose: () => void
}) {
  const isNew = !block
  const [start, setStart]   = useState(block?.start ?? '06:00')
  const [end, setEnd]       = useState(block?.end ?? '08:00')
  const [price, setPrice]   = useState(String(block?.price ?? 400))
  const [courts, setCourts] = useState(block?.courts ?? 'All Courts')
  const [active, setActive] = useState(block?.active ?? true)
  const courtsOptions = ['All Courts', 'Court 1', 'Court 2', 'Court 3', 'Court 4', 'Court 5', 'Court 6']

  const handleSave = () => {
    onSave({ id: block?.id ?? `${day}-${Date.now()}`, start, end, price: parseInt(price) || 0, courts, active })
    onClose()
  }

  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 80 }}>
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)' }} onClick={onClose} />
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: '#fff', borderRadius: '24px 24px 0 0', maxHeight: '90%', display: 'flex', flexDirection: 'column' }} className="bottom-sheet-enter">
        <div style={{ display: 'flex', justifyContent: 'center', padding: '12px 0 4px', flexShrink: 0 }}>
          <div style={{ width: 36, height: 4, borderRadius: 2, background: '#E2E8F0' }} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 20px 14px', borderBottom: '1px solid #F1F5F9', flexShrink: 0 }}>
          <div style={{ fontSize: 16, fontWeight: 800, color: '#0F172A' }}>{isNew ? 'Add Time Block' : 'Edit Time Block'}</div>
          <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: 16, background: '#F1F5F9', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <X size={16} color="#64748B" />
          </button>
        </div>
        <div style={{ overflowY: 'auto', padding: '20px' }} className="scrollbar-hide">
          {/* Day label */}
          <div style={{ background: '#EFF6FF', borderRadius: 10, padding: '8px 14px', marginBottom: 20, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: '#2563EB' }}>{day}</span>
          </div>

          {/* Time row */}
          <div style={{ display: 'flex', gap: 12, marginBottom: 18 }}>
            {[{ label: 'Start Time', val: start, set: setStart }, { label: 'End Time', val: end, set: setEnd }].map(f => (
              <div key={f.label} style={{ flex: 1 }}>
                <label style={{ fontSize: 11, fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: 8 }}>{f.label}</label>
                <input type="time" value={f.val} onChange={e => f.set(e.target.value)}
                  style={{ width: '100%', padding: '12px', border: '1.5px solid #E2E8F0', borderRadius: 12, fontSize: 16, fontWeight: 700, color: '#0F172A', background: '#F8FAFC', outline: 'none', boxSizing: 'border-box' }} />
              </div>
            ))}
          </div>

          {/* Price */}
          <div style={{ marginBottom: 18 }}>
            <label style={{ fontSize: 11, fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: 8 }}>Price per Hour (₹)</label>
            <div style={{ display: 'flex', alignItems: 'center', background: '#F8FAFC', border: '1.5px solid #E2E8F0', borderRadius: 12, padding: '12px 14px' }}>
              <span style={{ fontSize: 18, fontWeight: 700, color: '#64748B', marginRight: 6 }}>₹</span>
              <input type="number" value={price} onChange={e => setPrice(e.target.value)}
                style={{ flex: 1, border: 'none', background: 'transparent', fontSize: 22, fontWeight: 800, color: '#0F172A', outline: 'none' }} />
              <span style={{ fontSize: 13, color: '#94A3B8', fontWeight: 500 }}>/hr</span>
            </div>
          </div>

          {/* Courts */}
          <div style={{ marginBottom: 18 }}>
            <label style={{ fontSize: 11, fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: 8 }}>Applicable Courts</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {courtsOptions.map(c => (
                <button key={c} onClick={() => setCourts(c)} style={{ padding: '8px 14px', borderRadius: 20, border: `1.5px solid ${courts === c ? '#2563EB' : '#E2E8F0'}`, background: courts === c ? '#EFF6FF' : '#F8FAFC', color: courts === c ? '#2563EB' : '#64748B', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>{c}</button>
              ))}
            </div>
          </div>

          {/* Active toggle */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px', background: '#F8FAFC', borderRadius: 12, marginBottom: 24 }}>
            <span style={{ fontSize: 14, fontWeight: 600, color: '#0F172A' }}>Active</span>
            <div onClick={() => setActive(!active)} style={{ width: 44, height: 24, borderRadius: 12, background: active ? '#2563EB' : '#E2E8F0', cursor: 'pointer', position: 'relative', transition: 'background 0.2s' }}>
              <div style={{ width: 20, height: 20, borderRadius: 10, background: '#fff', position: 'absolute', top: 2, left: active ? 22 : 2, transition: 'left 0.2s', boxShadow: '0 1px 4px rgba(0,0,0,0.15)' }} />
            </div>
          </div>

          {/* CTA row */}
          <div style={{ display: 'flex', gap: 10 }}>
            {!isNew && onDelete && (
              <button onClick={() => { onDelete(); onClose() }} style={{ width: 44, height: 44, borderRadius: 12, background: '#FEF2F2', border: '1.5px solid #FCA5A5', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                <Trash2 size={17} color="#DC2626" />
              </button>
            )}
            <button onClick={handleSave} style={{ flex: 1, padding: '13px', background: '#2563EB', color: '#fff', border: 'none', borderRadius: 12, fontSize: 15, fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 12px rgba(37,99,235,0.3)' }}>
              {isNew ? 'Add Block' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Copy Day Sheet ───────────────────────────────────────────────────────────
function CopyDaySheet({ fromDay, onCopy, onClose }: { fromDay: string; onCopy: (days: string[]) => void; onClose: () => void }) {
  const [selected, setSelected] = useState<string[]>([])
  const toggle = (d: string) => setSelected(prev => prev.includes(d) ? prev.filter(x => x !== d) : [...prev, d])
  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 80 }}>
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)' }} onClick={onClose} />
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: '#fff', borderRadius: '24px 24px 0 0', padding: '0 0 32px' }} className="bottom-sheet-enter">
        <div style={{ display: 'flex', justifyContent: 'center', padding: '12px 0 4px' }}><div style={{ width: 36, height: 4, borderRadius: 2, background: '#E2E8F0' }} /></div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 20px 16px', borderBottom: '1px solid #F1F5F9' }}>
          <div style={{ fontSize: 15, fontWeight: 800, color: '#0F172A' }}>Copy {fromDay}'s schedule to…</div>
          <button onClick={onClose} style={{ width: 30, height: 30, borderRadius: 15, background: '#F1F5F9', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><X size={14} color="#64748B" /></button>
        </div>
        <div style={{ padding: '20px', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {DAYS.filter(d => d !== fromDay).map(d => {
            const sel = selected.includes(d)
            return (
              <button key={d} onClick={() => toggle(d)} style={{ padding: '10px 16px', borderRadius: 12, border: `1.5px solid ${sel ? '#2563EB' : '#E2E8F0'}`, background: sel ? '#EFF6FF' : '#F8FAFC', color: sel ? '#2563EB' : '#64748B', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                {d} {sel && '✓'}
              </button>
            )
          })}
        </div>
        <div style={{ padding: '0 20px', display: 'flex', gap: 10 }}>
          <button onClick={() => setSelected(DAYS.filter(d => d !== fromDay))} style={{ flex: 1, padding: '12px', background: '#F8FAFC', border: '1.5px solid #E2E8F0', borderRadius: 12, fontSize: 13, fontWeight: 600, color: '#64748B', cursor: 'pointer' }}>Select All</button>
          <button onClick={() => { onCopy(selected); onClose() }} disabled={selected.length === 0} style={{ flex: 2, padding: '12px', background: selected.length > 0 ? '#2563EB' : '#E2E8F0', color: selected.length > 0 ? '#fff' : '#94A3B8', border: 'none', borderRadius: 12, fontSize: 14, fontWeight: 700, cursor: selected.length > 0 ? 'pointer' : 'default', boxShadow: selected.length > 0 ? '0 4px 12px rgba(37,99,235,0.25)' : 'none' }}>
            Copy Schedule
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Week Preview ─────────────────────────────────────────────────────────────
function WeekPreview({ schedule }: { schedule: Schedule }) {
  const hours = [6, 8, 10, 12, 14, 16, 18, 20, 22]
  const totalH = 16 // 6am–10pm
  const COL_W = 40

  return (
    <div style={{ background: '#fff', borderRadius: 16, padding: '14px', border: '1px solid #F1F5F9', marginBottom: 14 }}>
      <div style={{ fontSize: 13, fontWeight: 700, color: '#0F172A', marginBottom: 12 }}>Weekly Preview</div>
      <div style={{ overflowX: 'auto' }} className="scrollbar-hide">
        <div style={{ minWidth: DAYS.length * COL_W + 30 }}>
          {/* Day headers */}
          <div style={{ display: 'flex', marginLeft: 30, marginBottom: 6 }}>
            {DAYS.map(d => (
              <div key={d} style={{ width: COL_W, textAlign: 'center', fontSize: 10, fontWeight: 700, color: '#64748B' }}>{d}</div>
            ))}
          </div>
          {/* Grid */}
          <div style={{ position: 'relative', height: 120 }}>
            {/* Hour lines */}
            {hours.map((h, i) => (
              <div key={h} style={{ position: 'absolute', top: `${(i / (hours.length - 1)) * 100}%`, left: 0, right: 0, display: 'flex', alignItems: 'center' }}>
                <span style={{ fontSize: 8, color: '#94A3B8', width: 28, textAlign: 'right', paddingRight: 2 }}>{h > 12 ? `${h - 12}p` : `${h}a`}</span>
                <div style={{ flex: 1, height: 1, background: '#F1F5F9' }} />
              </div>
            ))}
            {/* Blocks per day */}
            <div style={{ position: 'absolute', top: 0, bottom: 0, left: 30, display: 'flex' }}>
              {DAYS.map(d => {
                const ds = schedule[d]
                return (
                  <div key={d} style={{ width: COL_W, position: 'relative', padding: '0 2px' }}>
                    {ds.closed ? (
                      <div style={{ position: 'absolute', inset: '0 2px', background: '#F1F5F9', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <span style={{ fontSize: 8, color: '#94A3B8', fontWeight: 600 }}>Closed</span>
                      </div>
                    ) : ds.blocks.map(b => {
                      const sh = parseInt(b.start.split(':')[0]) + parseInt(b.start.split(':')[1]) / 60
                      const eh = parseInt(b.end.split(':')[0]) + parseInt(b.end.split(':')[1]) / 60
                      const top = ((sh - 6) / totalH) * 100
                      const height = ((eh - sh) / totalH) * 100
                      const c = blockColor(b.price)
                      return (
                        <div key={b.id} style={{ position: 'absolute', left: 2, right: 2, top: `${top}%`, height: `${height}%`, background: c.bg, border: `1px solid ${c.border}`, borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                          <span style={{ fontSize: 7, fontWeight: 700, color: c.text, writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}>₹{b.price}</span>
                        </div>
                      )
                    })}
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
      {/* Legend */}
      <div style={{ display: 'flex', gap: 10, marginTop: 10, flexWrap: 'wrap' }}>
        {[{ label: 'Off-Peak (< ₹500)', ...blockColor(350) }, { label: 'Peak (₹500–₹599)', ...blockColor(550) }, { label: 'Premium (₹600+)', ...blockColor(700) }].map(l => (
          <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <div style={{ width: 10, height: 10, borderRadius: 3, background: l.bg, border: `1px solid ${l.border}` }} />
            <span style={{ fontSize: 10, color: '#64748B', fontWeight: 500 }}>{l.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Day Card ─────────────────────────────────────────────────────────────────
function DayCard({ day, ds, onUpdate, onCopy }: { day: string; ds: DaySchedule; onUpdate: (ds: DaySchedule) => void; onCopy: () => void }) {
  const [editBlock, setEditBlock] = useState<Block | null | 'new'>(null)

  const toggleClosed = () => onUpdate({ ...ds, closed: !ds.closed, blocks: ds.closed ? defaultBlocks().map(b => ({ ...b, id: `${day}-${b.id}-${Date.now()}` })) : [] })
  const toggleAllDay = () => onUpdate({ ...ds, allDay: !ds.allDay })

  const saveBlock = (b: Block) => {
    const existing = ds.blocks.findIndex(x => x.id === b.id)
    if (existing >= 0) {
      const next = [...ds.blocks]; next[existing] = b
      onUpdate({ ...ds, blocks: next })
    } else {
      onUpdate({ ...ds, blocks: [...ds.blocks, b] })
    }
  }
  const deleteBlock = (id: string) => onUpdate({ ...ds, blocks: ds.blocks.filter(b => b.id !== id) })

  return (
    <>
      <div style={{ background: '#fff', borderRadius: 18, padding: '16px', marginBottom: 10, border: '1px solid #F1F5F9' }}>
        {/* Day header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: ds.closed ? 0 : 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 15, fontWeight: 800, color: '#0F172A', fontFamily: 'Plus Jakarta Sans, sans-serif', minWidth: 36 }}>{day}</span>
            {ds.closed && <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20, background: '#FEF2F2', color: '#DC2626' }}>Closed</span>}
            {ds.allDay && !ds.closed && <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20, background: '#F0FDF4', color: '#16A34A' }}>24 Hours</span>}
          </div>
          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            <button onClick={onCopy} title="Copy to days" style={{ width: 30, height: 30, borderRadius: 8, background: '#EFF6FF', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
              <Copy size={13} color="#2563EB" />
            </button>
            <button onClick={toggleAllDay} disabled={ds.closed} style={{ fontSize: 10, fontWeight: 700, padding: '4px 10px', borderRadius: 8, border: `1px solid ${ds.allDay ? '#16A34A' : '#E2E8F0'}`, background: ds.allDay ? '#F0FDF4' : '#F8FAFC', color: ds.allDay ? '#16A34A' : '#64748B', cursor: ds.closed ? 'default' : 'pointer' }}>24h</button>
            <button onClick={toggleClosed} style={{ fontSize: 10, fontWeight: 700, padding: '4px 10px', borderRadius: 8, border: `1px solid ${ds.closed ? '#DC2626' : '#E2E8F0'}`, background: ds.closed ? '#FEF2F2' : '#F8FAFC', color: ds.closed ? '#DC2626' : '#64748B', cursor: 'pointer' }}>
              {ds.closed ? 'Reopen' : 'Close'}
            </button>
          </div>
        </div>

        {/* Blocks */}
        {!ds.closed && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {ds.blocks.map(b => {
              const c = blockColor(b.price)
              return (
                <div key={b.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', background: c.bg, borderRadius: 12, border: `1.5px solid ${c.border}`, opacity: b.active ? 1 : 0.5 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: c.text }}>{b.start} – {b.end}</div>
                    <div style={{ fontSize: 11, color: c.text, opacity: 0.8, marginTop: 2 }}>{b.courts}</div>
                  </div>
                  <div style={{ fontSize: 15, fontWeight: 800, color: c.text }}>₹{b.price}<span style={{ fontSize: 10, fontWeight: 500 }}>/hr</span></div>
                  <button onClick={() => setEditBlock(b)} style={{ width: 28, height: 28, borderRadius: 8, background: 'rgba(255,255,255,0.7)', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                    <Edit2 size={13} color={c.text} />
                  </button>
                  <button onClick={() => deleteBlock(b.id)} style={{ width: 28, height: 28, borderRadius: 8, background: 'rgba(255,255,255,0.7)', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                    <X size={13} color="#DC2626" />
                  </button>
                </div>
              )
            })}
            {!ds.allDay && (
              <button onClick={() => setEditBlock('new')} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 12px', background: 'transparent', border: '1.5px dashed #CBD5E1', borderRadius: 12, cursor: 'pointer', fontSize: 13, fontWeight: 600, color: '#2563EB' }}>
                <Plus size={15} /> Add Time Block
              </button>
            )}
          </div>
        )}
      </div>

      {editBlock !== null && (
        <EditBlockSheet
          block={editBlock === 'new' ? null : editBlock}
          day={day}
          onSave={saveBlock}
          onDelete={editBlock !== 'new' ? () => deleteBlock((editBlock as Block).id) : undefined}
          onClose={() => setEditBlock(null)}
        />
      )}
    </>
  )
}

// ─── Main Screen ──────────────────────────────────────────────────────────────
interface Props { onBack: () => void }

export default function CourtScheduleScreen({ onBack }: Props) {
  const [schedule, setSchedule] = useState<Schedule>(initSchedule)
  const [copyFromDay, setCopyFromDay] = useState<string | null>(null)

  const updateDay = (day: string, ds: DaySchedule) => setSchedule(prev => ({ ...prev, [day]: ds }))

  const copySchedule = (fromDay: string, toDays: string[]) => {
    const src = schedule[fromDay]
    setSchedule(prev => {
      const next = { ...prev }
      toDays.forEach(d => {
        next[d] = { ...src, blocks: src.blocks.map(b => ({ ...b, id: `${d}-${b.id}-${Date.now()}` })) }
      })
      return next
    })
  }

  const applyAll = () => {
    const src = schedule['Mon']
    setSchedule(prev => {
      const next = { ...prev }
      DAYS.forEach(d => {
        next[d] = { ...src, blocks: src.blocks.map(b => ({ ...b, id: `${d}-${b.id}-${Date.now()}` })) }
      })
      return next
    })
  }

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: '#F8FAFC', position: 'relative' }}>
      {/* Header */}
      <div style={{ background: '#fff', padding: '0 16px 14px', borderBottom: '1px solid #F1F5F9', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
          <button onClick={onBack} style={{ width: 36, height: 36, borderRadius: 10, background: '#F8FAFC', border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <ChevronLeft size={20} color="#0F172A" />
          </button>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 18, fontWeight: 800, color: '#0F172A', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>Schedule & Pricing</div>
            <div style={{ fontSize: 11, color: '#64748B', fontWeight: 500, marginTop: 1 }}>Manage operating hours and court pricing</div>
          </div>
        </div>
        {/* Apply all button */}
        <button onClick={applyAll} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 10, background: '#EFF6FF', border: '1px solid #BFDBFE', cursor: 'pointer' }}>
          <Copy size={13} color="#2563EB" />
          <span style={{ fontSize: 12, fontWeight: 700, color: '#2563EB' }}>Apply Monday's schedule to all days</span>
        </button>
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '14px 16px 88px' }} className="scrollbar-hide">
        <WeekPreview schedule={schedule} />

        {DAYS.map(d => (
          <DayCard key={d} day={d} ds={schedule[d]} onUpdate={ds => updateDay(d, ds)} onCopy={() => setCopyFromDay(d)} />
        ))}
      </div>

      {copyFromDay && (
        <CopyDaySheet fromDay={copyFromDay} onCopy={days => copySchedule(copyFromDay, days)} onClose={() => setCopyFromDay(null)} />
      )}
    </div>
  )
}
