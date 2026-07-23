import { ArrowLeft, Phone, MessageCircle, Pencil, CheckCircle2, XCircle, IndianRupee, MapPin, Clock, Calendar, Hash } from 'lucide-react'
import StatusChip from '../components/StatusChip'
import { allBookings } from '../data/bookings'

interface Props {
  bookingId: string
  onBack: () => void
}

export default function BookingDetailsScreen({ bookingId, onBack }: Props) {
  const b = allBookings.find(x => x.id === bookingId) ?? allBookings[0]

  const Row = ({ label, value, highlight }: { label: string; value: string | React.ReactNode; highlight?: boolean }) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '13px 0', borderBottom: '1px solid #F1F5F9' }}>
      <span style={{ fontSize: 13, color: '#64748B', fontWeight: 500 }}>{label}</span>
      <span style={{ fontSize: 13, fontWeight: highlight ? 700 : 600, color: highlight ? '#2563EB' : '#0F172A' }}>{value}</span>
    </div>
  )

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: '#F8FAFC' }}>
      {/* Header */}
      <div style={{ background: '#fff', padding: '0 16px 16px', borderBottom: '1px solid #F1F5F9', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
          <button onClick={onBack} style={{ width: 36, height: 36, borderRadius: 10, background: '#F8FAFC', border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <ArrowLeft size={18} color="#0F172A" />
          </button>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 18, fontWeight: 800, color: '#0F172A', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>Booking Details</div>
            <div style={{ fontSize: 12, color: '#64748B', fontWeight: 500 }}>#{b.id}</div>
          </div>
          <StatusChip status={b.status} />
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }} className="scrollbar-hide">
        {/* Customer card */}
        <div style={{ background: '#fff', borderRadius: 18, padding: '16px', marginBottom: 12, border: '1px solid #F1F5F9' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
            <div style={{ width: 48, height: 48, borderRadius: 14, background: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: 20, fontWeight: 800, color: '#2563EB' }}>{b.customer.charAt(0)}</span>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 16, fontWeight: 700, color: '#0F172A' }}>{b.customer}</div>
              <div style={{ fontSize: 13, color: '#64748B' }}>+91 {b.phone.slice(0,5)} {b.phone.slice(5)}</div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button style={{ width: 36, height: 36, borderRadius: 10, background: '#F8FAFC', border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                <Phone size={15} color="#64748B" />
              </button>
              <button style={{ width: 36, height: 36, borderRadius: 10, background: '#F0FDF4', border: '1px solid #BBF7D0', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                <MessageCircle size={15} color="#16A34A" />
              </button>
            </div>
          </div>

          <Row label="Booking ID" value={<span style={{ fontFamily: 'monospace', fontSize: 13 }}>{b.id}</span>} />
          <Row label="Venue" value={b.venue} />
          <Row label="Court" value={b.court} />
          <Row label="Date" value={b.date} />
          <Row label="Time" value={b.time} />
          <Row label="Duration" value={b.duration} />
          <Row label="Booking Source" value={b.source.charAt(0).toUpperCase() + b.source.slice(1)} />
        </div>

        {/* Payment card */}
        <div style={{ background: '#fff', borderRadius: 18, padding: '16px', marginBottom: 12, border: '1px solid #F1F5F9' }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#0F172A', marginBottom: 4 }}>Payment</div>
          <Row label="Total Amount" value={`₹${b.amount}`} />
          <Row label="Advance Paid" value={`₹${b.advance}`} />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '13px 0' }}>
            <span style={{ fontSize: 13, color: b.pending > 0 ? '#DC2626' : '#16A34A', fontWeight: 700 }}>Pending Amount</span>
            <span style={{ fontSize: 15, fontWeight: 800, color: b.pending > 0 ? '#DC2626' : '#16A34A' }}>₹{b.pending}</span>
          </div>
          <div style={{ paddingTop: 4 }}>
            <StatusChip status={b.payment} />
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
          {b.pending > 0 && (
            <button style={{ width: '100%', padding: '14px', background: '#2563EB', color: '#fff', border: 'none', borderRadius: 14, fontSize: 15, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, boxShadow: '0 4px 12px rgba(37,99,235,0.3)' }}>
              <IndianRupee size={18} />
              Collect ₹{b.pending}
            </button>
          )}
          {b.status === 'confirmed' && (
            <button style={{ width: '100%', padding: '14px', background: '#F0FDF4', color: '#16A34A', border: '1.5px solid #BBF7D0', borderRadius: 14, fontSize: 15, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              <CheckCircle2 size={18} />
              Mark Complete
            </button>
          )}
          <div style={{ display: 'flex', gap: 10 }}>
            <button style={{ flex: 1, padding: '14px', background: '#F8FAFC', color: '#0F172A', border: '1.5px solid #E2E8F0', borderRadius: 14, fontSize: 14, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              <Pencil size={16} /> Edit
            </button>
            {b.status !== 'cancelled' && (
              <button style={{ flex: 1, padding: '14px', background: '#FEF2F2', color: '#DC2626', border: '1.5px solid #FCA5A5', borderRadius: 14, fontSize: 14, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                <XCircle size={16} /> Cancel
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
