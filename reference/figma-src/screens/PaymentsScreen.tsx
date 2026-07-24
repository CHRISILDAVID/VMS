import { useState } from 'react'
import {
  CreditCard, TrendingUp, Clock, AlertTriangle,
  ChevronRight, ChevronLeft, Filter,
  CheckCircle2, X, MessageCircle, Download, History,
  Users, ArrowRight,
} from 'lucide-react'

// ─── Types ─────────────────────────────────────────────────────────────────────
type PayStatus = 'paid' | 'due' | 'overdue'
type Payment = {
  id: string; member: string; slot: string; amount: number
  dueDate: string; status: PayStatus; mode: string | null; paidOn: string | null
}

// ─── Data ──────────────────────────────────────────────────────────────────────
const payments: Payment[] = [
  { id: 'P001', member: 'Arjun Sharma',  slot: 'Morning Warriors',  amount: 2500, dueDate: '1 Jul', status: 'paid',    mode: 'UPI',  paidOn: '28 Jun' },
  { id: 'P002', member: 'Priya Nair',    slot: 'Morning Warriors',  amount: 2500, dueDate: '1 Jul', status: 'due',     mode: null,   paidOn: null },
  { id: 'P003', member: 'Karthik Rajan', slot: 'Evening Smashers',  amount: 3000, dueDate: '15 Jun', status: 'overdue', mode: null,  paidOn: null },
  { id: 'P004', member: 'Deepa Menon',   slot: 'Evening Smashers',  amount: 3000, dueDate: '1 Jul', status: 'paid',    mode: 'Cash', paidOn: '30 Jun' },
  { id: 'P005', member: 'Sundar Pichai', slot: 'Corporate League',  amount: 2000, dueDate: '5 Jul', status: 'due',     mode: null,   paidOn: null },
  { id: 'P006', member: 'Meera Raj',     slot: 'Morning Warriors',  amount: 2500, dueDate: '1 Jul', status: 'paid',    mode: 'NEFT', paidOn: '29 Jun' },
  { id: 'P007', member: 'Vikram Anand',  slot: 'Morning Warriors',  amount: 2500, dueDate: '1 Jul', status: 'overdue', mode: null,   paidOn: null },
  { id: 'P008', member: 'Nisha Kumar',   slot: 'Evening Smashers',  amount: 3000, dueDate: '15 Jun', status: 'due',   mode: null,   paidOn: null },
  { id: 'P009', member: 'Ravi Kumar',    slot: 'Weekend Warriors',  amount: 1800, dueDate: '1 Jul', status: 'paid',    mode: 'UPI',  paidOn: '30 Jun' },
  { id: 'P010', member: 'Anita Sharma',  slot: 'Weekend Warriors',  amount: 1800, dueDate: '1 Jul', status: 'due',     mode: null,   paidOn: null },
  { id: 'P011', member: 'Ramesh Iyer',   slot: 'Corporate League',  amount: 2000, dueDate: '5 Jul', status: 'paid',    mode: 'Cash', paidOn: '3 Jul' },
]

type SlotDef = { id: string; name: string; days: string; time: string; skill: string; fee: number; capacity: number }
const slotDefs: SlotDef[] = [
  { id: 'S1', name: 'Morning Warriors',  days: 'Mon, Wed, Fri', time: '06:00 – 08:00', skill: 'Intermediate', fee: 2500, capacity: 8 },
  { id: 'S2', name: 'Evening Smashers',  days: 'Tue, Thu, Sat', time: '18:00 – 20:00', skill: 'Advanced',     fee: 3000, capacity: 6 },
  { id: 'S3', name: 'Weekend Warriors',  days: 'Sat, Sun',      time: '07:00 – 09:00', skill: 'Beginner',     fee: 1800, capacity: 10 },
  { id: 'S4', name: 'Corporate League',  days: 'Mon–Fri',       time: '07:00 – 08:00', skill: 'Recreational', fee: 2000, capacity: 12 },
]

// ─── Helpers ───────────────────────────────────────────────────────────────────
const statusColor:  Record<PayStatus, string> = { paid: '#16A34A', due: '#D97706', overdue: '#DC2626' }
const statusBg:     Record<PayStatus, string> = { paid: '#F0FDF4', due: '#FFFBEB', overdue: '#FEF2F2' }
const statusLabel:  Record<PayStatus, string> = { paid: 'Paid', due: 'Due Soon', overdue: 'Overdue' }
const statusStripe: Record<PayStatus, string> = { paid: '#22C55E', due: '#F59E0B', overdue: '#EF4444' }

const skillColors: Record<string, { bg: string; text: string }> = {
  Beginner:     { bg: '#F0FDF4', text: '#16A34A' },
  Intermediate: { bg: '#EFF6FF', text: '#2563EB' },
  Advanced:     { bg: '#F5F3FF', text: '#7C3AED' },
  Recreational: { bg: '#FFFBEB', text: '#D97706' },
}

// ─── Mark Paid Sheet ───────────────────────────────────────────────────────────
function MarkPaidSheet({ payment, onClose }: { payment: Payment; onClose: () => void }) {
  const [mode, setMode] = useState('UPI')
  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 80 }}>
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)' }} onClick={onClose} />
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: '#fff', borderRadius: '24px 24px 0 0', padding: '0 0 32px' }} className="bottom-sheet-enter">
        <div style={{ display: 'flex', justifyContent: 'center', padding: '12px 0 4px' }}><div style={{ width: 36, height: 4, borderRadius: 2, background: '#E2E8F0' }} /></div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 20px 16px', borderBottom: '1px solid #F1F5F9' }}>
          <div style={{ fontSize: 16, fontWeight: 800, color: '#0F172A' }}>Mark as Paid</div>
          <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: 16, background: '#F1F5F9', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><X size={16} color="#64748B" /></button>
        </div>
        <div style={{ padding: '20px' }}>
          <div style={{ background: '#F8FAFC', borderRadius: 14, padding: '14px', marginBottom: 20 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#0F172A', marginBottom: 4 }}>{payment.member}</div>
            <div style={{ fontSize: 12, color: '#64748B' }}>{payment.slot} · Due {payment.dueDate}</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: '#16A34A', marginTop: 8 }}>₹{payment.amount.toLocaleString()}</div>
          </div>
          <label style={{ fontSize: 12, fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: 10 }}>Payment Mode</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 20 }}>
            {['UPI', 'Cash', 'Card', 'NEFT', 'Cheque'].map(m => (
              <button key={m} onClick={() => setMode(m)} style={{ padding: '8px 16px', borderRadius: 20, border: `1.5px solid ${mode === m ? '#2563EB' : '#E2E8F0'}`, background: mode === m ? '#EFF6FF' : '#F8FAFC', color: mode === m ? '#2563EB' : '#64748B', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>{m}</button>
            ))}
          </div>
          <button onClick={onClose} style={{ width: '100%', padding: '14px', background: '#16A34A', color: '#fff', border: 'none', borderRadius: 14, fontSize: 15, fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 12px rgba(22,163,74,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            <CheckCircle2 size={18} /> Confirm Payment via {mode}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── History Sheet ─────────────────────────────────────────────────────────────
function HistorySheet({ payment, onClose }: { payment: Payment; onClose: () => void }) {
  const history = [
    { date: 'Jun 1, 2026', amount: payment.amount, mode: 'UPI' },
    { date: 'May 1, 2026', amount: payment.amount, mode: 'Cash' },
    { date: 'Apr 1, 2026', amount: payment.amount, mode: 'UPI' },
  ]
  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 80 }}>
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)' }} onClick={onClose} />
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: '#fff', borderRadius: '24px 24px 0 0', padding: '0 0 32px' }} className="bottom-sheet-enter">
        <div style={{ display: 'flex', justifyContent: 'center', padding: '12px 0 4px' }}><div style={{ width: 36, height: 4, borderRadius: 2, background: '#E2E8F0' }} /></div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 20px 16px', borderBottom: '1px solid #F1F5F9' }}>
          <div>
            <div style={{ fontSize: 16, fontWeight: 800, color: '#0F172A' }}>Payment History</div>
            <div style={{ fontSize: 12, color: '#64748B', marginTop: 2 }}>{payment.member}</div>
          </div>
          <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: 16, background: '#F1F5F9', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><X size={16} color="#64748B" /></button>
        </div>
        <div style={{ padding: '16px 20px' }}>
          {history.map((h, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0', borderBottom: i < history.length - 1 ? '1px solid #F8FAFC' : 'none' }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#16A34A', flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#0F172A' }}>{h.date}</div>
                <div style={{ fontSize: 12, color: '#64748B', marginTop: 1 }}>{h.mode}</div>
              </div>
              <div style={{ fontSize: 14, fontWeight: 800, color: '#16A34A' }}>₹{h.amount.toLocaleString()}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Payment Card ──────────────────────────────────────────────────────────────
function PaymentCard({ payment, onMarkPaid, onViewHistory }: {
  payment: Payment
  onMarkPaid: (p: Payment) => void
  onViewHistory: (p: Payment) => void
}) {
  const sc = statusColor[payment.status]
  const sb = statusBg[payment.status]
  const sl = statusLabel[payment.status]
  const stripe = statusStripe[payment.status]

  return (
    <div style={{ background: '#fff', borderRadius: 16, overflow: 'hidden', border: '1px solid #F1F5F9', display: 'flex' }}>
      <div style={{ width: 4, background: stripe, flexShrink: 0 }} />
      <div style={{ flex: 1, padding: '14px 14px 12px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 10 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#0F172A', marginBottom: 2 }}>{payment.member}</div>
            <div style={{ fontSize: 11, color: '#64748B' }}>{payment.slot}</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 16, fontWeight: 800, color: '#0F172A' }}>₹{payment.amount.toLocaleString()}</div>
            <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 20, background: sb, color: sc }}>{sl}</span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 6, marginBottom: 10, flexWrap: 'wrap' }}>
          {payment.status === 'paid' && payment.paidOn && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, background: '#F8FAFC', borderRadius: 8, padding: '4px 9px' }}>
              <CheckCircle2 size={11} color="#16A34A" />
              <span style={{ fontSize: 11, fontWeight: 600, color: '#64748B' }}>Paid {payment.paidOn}</span>
            </div>
          )}
          {payment.status === 'paid' && payment.mode && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, background: '#F8FAFC', borderRadius: 8, padding: '4px 9px' }}>
              <CreditCard size={11} color="#94A3B8" />
              <span style={{ fontSize: 11, fontWeight: 600, color: '#64748B' }}>{payment.mode}</span>
            </div>
          )}
          {payment.status !== 'paid' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, background: '#FEF2F2', borderRadius: 8, padding: '4px 9px' }}>
              <Clock size={11} color="#DC2626" />
              <span style={{ fontSize: 11, fontWeight: 600, color: '#DC2626' }}>Due {payment.dueDate}</span>
            </div>
          )}
        </div>

        <div style={{ display: 'flex', gap: 6 }}>
          {payment.status !== 'paid' && (
            <button onClick={() => onMarkPaid(payment)} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, padding: '8px', background: '#F0FDF4', border: '1.5px solid #BBF7D0', borderRadius: 10, cursor: 'pointer', fontSize: 11, fontWeight: 700, color: '#16A34A' }}>
              <CheckCircle2 size={12} /> Mark Paid
            </button>
          )}
          {payment.status !== 'paid' && (
            <button style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, padding: '8px', background: '#EFF6FF', border: '1.5px solid #BFDBFE', borderRadius: 10, cursor: 'pointer', fontSize: 11, fontWeight: 700, color: '#2563EB' }}>
              <MessageCircle size={12} /> Remind
            </button>
          )}
          <button onClick={() => onViewHistory(payment)} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, padding: '8px', background: '#F8FAFC', border: '1.5px solid #E2E8F0', borderRadius: 10, cursor: 'pointer', fontSize: 11, fontWeight: 600, color: '#64748B' }}>
            <History size={12} /> History
          </button>
          {payment.status === 'paid' && (
            <button style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, padding: '8px', background: '#F8FAFC', border: '1.5px solid #E2E8F0', borderRadius: 10, cursor: 'pointer', fontSize: 11, fontWeight: 600, color: '#64748B' }}>
              <Download size={12} /> Receipt
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Slot Payments Screen ──────────────────────────────────────────────────────
type FilterChip = 'all' | PayStatus
function SlotPaymentsScreen({ slot, allPayments, onBack }: {
  slot: SlotDef; allPayments: Payment[]; onBack: () => void
}) {
  const [filter, setFilter]       = useState<FilterChip>('all')
  const [markPaidP, setMarkPaidP] = useState<Payment | null>(null)
  const [historyP, setHistoryP]   = useState<Payment | null>(null)

  const slotPayments  = allPayments.filter(p => p.slot === slot.name)
  const filtered      = filter === 'all' ? slotPayments : slotPayments.filter(p => p.status === filter)

  const total      = slotPayments.length
  const paid       = slotPayments.filter(p => p.status === 'paid').length
  const pending    = slotPayments.filter(p => p.status === 'due').length
  const overdue    = slotPayments.filter(p => p.status === 'overdue').length
  const expected   = slotPayments.reduce((a, p) => a + p.amount, 0)
  const collected  = slotPayments.filter(p => p.status === 'paid').reduce((a, p) => a + p.amount, 0)
  const pendingAmt = expected - collected

  const sc = skillColors[slot.skill] ?? { bg: '#F8FAFC', text: '#64748B' }

  const chips: { label: string; value: FilterChip; count: number; color: string; bg: string }[] = [
    { label: 'All',     value: 'all',     count: total,   color: '#0F172A', bg: '#F1F5F9' },
    { label: 'Paid',    value: 'paid',    count: paid,    color: '#16A34A', bg: '#F0FDF4' },
    { label: 'Pending', value: 'due',     count: pending, color: '#D97706', bg: '#FFFBEB' },
    { label: 'Overdue', value: 'overdue', count: overdue, color: '#DC2626', bg: '#FEF2F2' },
  ]

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: '#F8FAFC', position: 'relative' }}>
      {/* Header */}
      <div style={{ background: '#fff', padding: '0 16px 14px', borderBottom: '1px solid #F1F5F9', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
          <button onClick={onBack} style={{ width: 36, height: 36, borderRadius: 10, background: '#F8FAFC', border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <ChevronLeft size={20} color="#0F172A" />
          </button>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 17, fontWeight: 800, color: '#0F172A', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>{slot.name}</div>
            <div style={{ fontSize: 12, color: '#64748B', marginTop: 2 }}>{slot.days} · {slot.time}</div>
          </div>
          <span style={{ fontSize: 10, fontWeight: 700, padding: '3px 10px', borderRadius: 20, background: sc.bg, color: sc.text }}>{slot.skill}</span>
        </div>

        {/* KPI rows */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 10 }}>
          {[
            { label: 'Total Members', value: total,   color: '#0F172A', bg: '#F8FAFC' },
            { label: 'Paid',          value: paid,    color: '#16A34A', bg: '#F0FDF4' },
            { label: 'Pending',       value: pending, color: '#D97706', bg: '#FFFBEB' },
          ].map(s => (
            <div key={s.label} style={{ background: s.bg, borderRadius: 12, padding: '10px 8px', textAlign: 'center' }}>
              <div style={{ fontSize: 18, fontWeight: 800, color: s.color, fontFamily: 'Plus Jakarta Sans, sans-serif' }}>{s.value}</div>
              <div style={{ fontSize: 10, color: '#64748B', fontWeight: 500, marginTop: 2 }}>{s.label}</div>
            </div>
          ))}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 14 }}>
          {[
            { label: 'Expected',  value: `₹${(expected/1000).toFixed(1)}k`,   color: '#0F172A', bg: '#F8FAFC' },
            { label: 'Collected', value: `₹${(collected/1000).toFixed(1)}k`,  color: '#16A34A', bg: '#F0FDF4' },
            { label: 'Pending',   value: `₹${(pendingAmt/1000).toFixed(1)}k`, color: '#DC2626', bg: '#FEF2F2' },
          ].map(s => (
            <div key={s.label} style={{ background: s.bg, borderRadius: 12, padding: '10px 8px', textAlign: 'center' }}>
              <div style={{ fontSize: 15, fontWeight: 800, color: s.color, fontFamily: 'Plus Jakarta Sans, sans-serif' }}>{s.value}</div>
              <div style={{ fontSize: 10, color: '#64748B', fontWeight: 500, marginTop: 2 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Filter chips */}
        <div style={{ display: 'flex', gap: 6 }}>
          {chips.map(c => (
            <button key={c.value} onClick={() => setFilter(c.value)}
              style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 12px', borderRadius: 20, border: `1.5px solid ${filter === c.value ? c.color : '#E2E8F0'}`, background: filter === c.value ? c.bg : '#F8FAFC', cursor: 'pointer', fontSize: 12, fontWeight: filter === c.value ? 700 : 500, color: filter === c.value ? c.color : '#64748B', flexShrink: 0 }}>
              {c.label}
              {c.count > 0 && <span style={{ width: 16, height: 16, borderRadius: 8, background: filter === c.value ? c.color : '#E2E8F0', color: filter === c.value ? '#fff' : '#64748B', fontSize: 9, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{c.count}</span>}
            </button>
          ))}
        </div>
      </div>

      {/* Member payment list */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '14px 16px 80px' }} className="scrollbar-hide">
        {filtered.length === 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 200, gap: 10 }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: '#94A3B8' }}>No payments match this filter</div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {filtered.map(p => (
              <PaymentCard key={p.id} payment={p} onMarkPaid={setMarkPaidP} onViewHistory={setHistoryP} />
            ))}
          </div>
        )}
      </div>

      {markPaidP && <MarkPaidSheet payment={markPaidP} onClose={() => setMarkPaidP(null)} />}
      {historyP  && <HistorySheet  payment={historyP}  onClose={() => setHistoryP(null)} />}
    </div>
  )
}

// ─── Main Payments Screen ──────────────────────────────────────────────────────
export default function PaymentsScreen() {
  const [activeSlot, setActiveSlot] = useState<SlotDef | null>(null)
  const [markPaidP, setMarkPaidP]   = useState<Payment | null>(null)
  const [historyP, setHistoryP]     = useState<Payment | null>(null)

  if (activeSlot) {
    return (
      <SlotPaymentsScreen
        slot={activeSlot}
        allPayments={payments}
        onBack={() => setActiveSlot(null)}
      />
    )
  }

  const totalCollected = payments.filter(p => p.status === 'paid').reduce((a, p) => a + p.amount, 0)
  const totalPending   = payments.filter(p => p.status !== 'paid').reduce((a, p) => a + p.amount, 0)
  const paidCount      = payments.filter(p => p.status === 'paid').length
  const dueCount       = payments.filter(p => p.status === 'due').length
  const overdueCount   = payments.filter(p => p.status === 'overdue').length

  const slotSummaries = slotDefs.map(s => {
    const sp         = payments.filter(p => p.slot === s.name)
    const total      = sp.length
    const paid       = sp.filter(p => p.status === 'paid').length
    const pending    = sp.filter(p => p.status !== 'paid').length
    const expected   = sp.reduce((a, p) => a + p.amount, 0)
    const collected  = sp.filter(p => p.status === 'paid').reduce((a, p) => a + p.amount, 0)
    const pendingAmt = expected - collected
    return { ...s, total, paid, pending, expected, collected, pendingAmt }
  }).filter(s => s.total > 0)

  const sc = (skill: string) => skillColors[skill] ?? { bg: '#F8FAFC', text: '#64748B' }

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: '#F8FAFC', position: 'relative' }}>
      {/* Header */}
      <div style={{ background: '#fff', padding: '0 16px 14px', borderBottom: '1px solid #F1F5F9', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: 20, fontWeight: 800, color: '#0F172A', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>Payments</div>
            <div style={{ fontSize: 12, color: '#64748B', fontWeight: 500, marginTop: 1 }}>Monthly membership payments</div>
          </div>
          <button style={{ width: 36, height: 36, borderRadius: 10, background: '#F8FAFC', border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <Filter size={16} color="#64748B" />
          </button>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto' }} className="scrollbar-hide">
        {/* ── Dashboard KPI cards ── */}
        <div style={{ padding: '14px 16px 0' }}>
          <div style={{ background: 'linear-gradient(135deg, #16A34A 0%, #059669 100%)', borderRadius: 18, padding: '16px', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 46, height: 46, borderRadius: 14, background: 'rgba(255,255,255,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <TrendingUp size={22} color="#fff" />
            </div>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.75)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 2 }}>Total Collected · July</div>
              <div style={{ fontSize: 26, fontWeight: 900, color: '#fff', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>₹{totalCollected.toLocaleString()}</div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)', marginTop: 2 }}>{paidCount} of {payments.length} members paid</div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 4 }}>
            <div style={{ background: '#fff', borderRadius: 16, padding: '14px', border: '1px solid #F1F5F9' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                <Clock size={15} color="#D97706" />
                <span style={{ fontSize: 11, fontWeight: 700, color: '#D97706', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Pending</span>
              </div>
              <div style={{ fontSize: 20, fontWeight: 800, color: '#0F172A', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>₹{totalPending.toLocaleString()}</div>
              <div style={{ fontSize: 11, color: '#64748B', marginTop: 2 }}>{dueCount} due · {overdueCount} overdue</div>
            </div>
            <div style={{ background: '#fff', borderRadius: 16, padding: '14px', border: '1px solid #F1F5F9' }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#64748B', marginBottom: 10 }}>Member Status</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 4 }}>
                {[
                  { label: 'Paid',    value: paidCount,    color: '#16A34A', bg: '#F0FDF4' },
                  { label: 'Due',     value: dueCount,     color: '#D97706', bg: '#FFFBEB' },
                  { label: 'Late',    value: overdueCount, color: '#DC2626', bg: '#FEF2F2' },
                ].map(s => (
                  <div key={s.label} style={{ background: s.bg, borderRadius: 8, padding: '7px 4px', textAlign: 'center' }}>
                    <div style={{ fontSize: 15, fontWeight: 800, color: s.color }}>{s.value}</div>
                    <div style={{ fontSize: 9, color: '#64748B', fontWeight: 600, marginTop: 1 }}>{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── Slot cards ── */}
        <div style={{ padding: '14px 16px 80px' }}>
          <div style={{ fontSize: 13, fontWeight: 800, color: '#0F172A', marginBottom: 12 }}>Membership Slots</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {slotSummaries.map(s => {
              const colors = sc(s.skill)
              const pct    = s.expected > 0 ? Math.round((s.collected / s.expected) * 100) : 0
              return (
                <div key={s.id} style={{ background: '#fff', borderRadius: 18, padding: '16px', border: '1px solid #F1F5F9' }}>
                  {/* Slot header */}
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 15, fontWeight: 800, color: '#0F172A', fontFamily: 'Plus Jakarta Sans, sans-serif', marginBottom: 3 }}>{s.name}</div>
                      <div style={{ fontSize: 12, color: '#64748B' }}>{s.days} · {s.time}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontSize: 10, fontWeight: 700, padding: '3px 10px', borderRadius: 20, background: colors.bg, color: colors.text }}>{s.skill}</span>
                      <div style={{ fontSize: 13, fontWeight: 800, color: '#2563EB', marginTop: 4 }}>₹{s.fee.toLocaleString()}<span style={{ fontSize: 10, fontWeight: 500, color: '#64748B' }}>/mo</span></div>
                    </div>
                  </div>

                  {/* Member counts */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6, marginBottom: 12 }}>
                    {[
                      { label: 'Total',   value: s.total,   color: '#0F172A', bg: '#F8FAFC' },
                      { label: 'Paid',    value: s.paid,    color: '#16A34A', bg: '#F0FDF4' },
                      { label: 'Pending', value: s.pending, color: '#DC2626', bg: '#FEF2F2' },
                    ].map(m => (
                      <div key={m.label} style={{ background: m.bg, borderRadius: 10, padding: '8px 6px', textAlign: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 3 }}>
                          <Users size={10} color={m.color} />
                          <span style={{ fontSize: 15, fontWeight: 800, color: m.color }}>{m.value}</span>
                        </div>
                        <div style={{ fontSize: 9, color: '#64748B', fontWeight: 600, marginTop: 1 }}>{m.label}</div>
                      </div>
                    ))}
                  </div>

                  {/* Amount summary */}
                  <div style={{ background: '#F8FAFC', borderRadius: 12, padding: '12px 14px', marginBottom: 12 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                      <div>
                        <div style={{ fontSize: 10, color: '#64748B', fontWeight: 500 }}>Expected</div>
                        <div style={{ fontSize: 14, fontWeight: 800, color: '#0F172A' }}>₹{s.expected.toLocaleString()}</div>
                      </div>
                      <ArrowRight size={13} color="#CBD5E1" />
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: 10, color: '#64748B', fontWeight: 500 }}>Collected</div>
                        <div style={{ fontSize: 14, fontWeight: 800, color: '#16A34A' }}>₹{s.collected.toLocaleString()}</div>
                      </div>
                      <ArrowRight size={13} color="#CBD5E1" />
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: 10, color: '#64748B', fontWeight: 500 }}>Pending</div>
                        <div style={{ fontSize: 14, fontWeight: 800, color: s.pendingAmt > 0 ? '#DC2626' : '#16A34A' }}>₹{s.pendingAmt.toLocaleString()}</div>
                      </div>
                    </div>
                    <div style={{ height: 5, background: '#E2E8F0', borderRadius: 3, marginBottom: 4 }}>
                      <div style={{ height: '100%', width: `${pct}%`, background: pct === 100 ? '#16A34A' : '#2563EB', borderRadius: 3 }} />
                    </div>
                    <div style={{ fontSize: 10, color: '#64748B', fontWeight: 600, textAlign: 'right' }}>{pct}% collected</div>
                  </div>

                  <button onClick={() => setActiveSlot(s)}
                    style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '11px', background: '#EFF6FF', border: '1.5px solid #BFDBFE', borderRadius: 12, cursor: 'pointer', fontSize: 13, fontWeight: 700, color: '#2563EB' }}>
                    View Payments
                    <ChevronRight size={15} />
                  </button>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {markPaidP && <MarkPaidSheet payment={markPaidP} onClose={() => setMarkPaidP(null)} />}
      {historyP  && <HistorySheet  payment={historyP}  onClose={() => setHistoryP(null)} />}
    </div>
  )
}
