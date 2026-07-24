import { useState } from 'react'
import { ArrowLeft, ArrowRight, Check, ChevronDown, Search, MessageCircle } from 'lucide-react'

const steps = ['Date & Court', 'Time', 'Customer', 'Payment', 'Confirm']

const courts = ['Court 1', 'Court 2', 'Court 3', 'Court 4', 'Court 5', 'Court 6']
const timeSlots = ['06:00', '07:00', '07:30', '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00']
const durations = ['30 min', '1 hour', '1.5 hours', '2 hours', '2.5 hours', '3 hours']

const customers = [
  { name: 'Arjun Sharma', phone: '9876543210', visits: 24, lastVisit: '2 days ago' },
  { name: 'Priya Nair', phone: '9123456789', visits: 15, lastVisit: '1 week ago' },
  { name: 'Karthik Rajan', phone: '9988776655', visits: 8, lastVisit: '3 days ago' },
  { name: 'Deepa Menon', phone: '9845612300', visits: 31, lastVisit: 'Yesterday' },
]

interface Props {
  onBack: () => void
  onComplete: () => void
}

export default function NewBookingScreen({ onBack, onComplete }: Props) {
  const [step, setStep] = useState(0)
  const [selectedCourt, setSelectedCourt] = useState('')
  const [selectedTime, setSelectedTime] = useState('')
  const [selectedDuration, setSelectedDuration] = useState('1 hour')
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [selectedCustomer, setSelectedCustomer] = useState<typeof customers[0] | null>(null)
  const [customerSearch, setCustomerSearch] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('cash')
  const [bookingSource, setBookingSource] = useState('offline')
  const [amount, setAmount] = useState('500')
  const [advance, setAdvance] = useState('500')
  const [whatsapp, setWhatsapp] = useState(true)

  const pricePerHour = 500
  const totalPrice = selectedDuration.includes('30') ? 250 : parseInt(selectedDuration) * pricePerHour

  const canNext = () => {
    if (step === 0) return selectedCourt && selectedDate
    if (step === 1) return selectedTime && selectedDuration
    if (step === 2) return selectedCustomer
    return true
  }

  const filteredCustomers = customers.filter(c =>
    !customerSearch || c.name.toLowerCase().includes(customerSearch.toLowerCase()) || c.phone.includes(customerSearch)
  )

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: '#F8FAFC' }}>
      {/* Header */}
      <div style={{ background: '#fff', padding: '0 16px 16px', borderBottom: '1px solid #F1F5F9', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
          <button onClick={onBack} style={{ width: 36, height: 36, borderRadius: 10, background: '#F8FAFC', border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <ArrowLeft size={18} color="#0F172A" />
          </button>
          <div style={{ fontSize: 18, fontWeight: 800, color: '#0F172A', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>New Booking</div>
        </div>

        {/* Progress */}
        <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
          {steps.map((s, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', flex: i < steps.length - 1 ? 1 : 0 }}>
              <div style={{
                width: 28, height: 28, borderRadius: 14, flexShrink: 0,
                background: i < step ? '#16A34A' : i === step ? '#2563EB' : '#E2E8F0',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {i < step ? <Check size={14} color="#fff" /> : <span style={{ fontSize: 11, fontWeight: 700, color: i === step ? '#fff' : '#94A3B8' }}>{i + 1}</span>}
              </div>
              {i < steps.length - 1 && (
                <div style={{ flex: 1, height: 2, background: i < step ? '#16A34A' : '#E2E8F0', marginLeft: 4 }} />
              )}
            </div>
          ))}
        </div>
        <div style={{ fontSize: 12, fontWeight: 600, color: '#64748B', marginTop: 8 }}>Step {step + 1} of {steps.length} · {steps[step]}</div>
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '20px 16px' }} className="scrollbar-hide screen-enter">
        {/* Step 0: Date & Court */}
        {step === 0 && (
          <div>
            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 13, fontWeight: 700, color: '#0F172A', display: 'block', marginBottom: 10 }}>Select Date</label>
              <input
                type="date"
                value={selectedDate}
                onChange={e => setSelectedDate(e.target.value)}
                style={{ width: '100%', padding: '14px 16px', border: '1.5px solid #E2E8F0', borderRadius: 14, fontSize: 15, fontWeight: 600, color: '#0F172A', background: '#fff', outline: 'none', cursor: 'pointer' }}
              />
            </div>
            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 13, fontWeight: 700, color: '#0F172A', display: 'block', marginBottom: 10 }}>Select Court</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                {courts.map(c => (
                  <button
                    key={c}
                    onClick={() => setSelectedCourt(c)}
                    style={{
                      padding: '16px', borderRadius: 14,
                      border: `2px solid ${selectedCourt === c ? '#2563EB' : '#E2E8F0'}`,
                      background: selectedCourt === c ? '#EFF6FF' : '#fff',
                      cursor: 'pointer', textAlign: 'left',
                    }}
                  >
                    <div style={{ fontSize: 14, fontWeight: 700, color: selectedCourt === c ? '#2563EB' : '#0F172A' }}>{c}</div>
                    <div style={{ fontSize: 11, color: '#16A34A', fontWeight: 600, marginTop: 2 }}>Available</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 1: Time */}
        {step === 1 && (
          <div>
            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 13, fontWeight: 700, color: '#0F172A', display: 'block', marginBottom: 10 }}>Start Time</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {timeSlots.map(t => (
                  <button
                    key={t}
                    onClick={() => setSelectedTime(t)}
                    style={{
                      padding: '10px 16px', borderRadius: 10,
                      border: `1.5px solid ${selectedTime === t ? '#2563EB' : '#E2E8F0'}`,
                      background: selectedTime === t ? '#2563EB' : '#fff',
                      color: selectedTime === t ? '#fff' : '#0F172A',
                      fontSize: 13, fontWeight: 600, cursor: 'pointer',
                    }}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label style={{ fontSize: 13, fontWeight: 700, color: '#0F172A', display: 'block', marginBottom: 10 }}>Duration</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {durations.map(d => (
                  <button
                    key={d}
                    onClick={() => setSelectedDuration(d)}
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '14px 16px', borderRadius: 14,
                      border: `1.5px solid ${selectedDuration === d ? '#2563EB' : '#E2E8F0'}`,
                      background: selectedDuration === d ? '#EFF6FF' : '#fff',
                      cursor: 'pointer',
                    }}
                  >
                    <span style={{ fontSize: 14, fontWeight: 600, color: selectedDuration === d ? '#2563EB' : '#0F172A' }}>{d}</span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: '#64748B' }}>₹{d.includes('30') ? 250 : parseInt(d) * 500}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Customer */}
        {step === 2 && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#fff', border: '1.5px solid #E2E8F0', borderRadius: 12, padding: '10px 14px', marginBottom: 16 }}>
              <Search size={16} color="#94A3B8" />
              <input
                type="text"
                placeholder="Search customer name or phone"
                value={customerSearch}
                onChange={e => setCustomerSearch(e.target.value)}
                style={{ flex: 1, border: 'none', background: 'transparent', fontSize: 13, color: '#0F172A', outline: 'none' }}
              />
            </div>

            {selectedCustomer && (
              <div style={{ background: '#EFF6FF', borderRadius: 14, padding: '14px', marginBottom: 16, border: '1.5px solid #93C5FD' }}>
                <div style={{ fontSize: 12, color: '#2563EB', fontWeight: 600, marginBottom: 6 }}>Selected Customer</div>
                <div style={{ fontSize: 15, fontWeight: 700, color: '#0F172A' }}>{selectedCustomer.name}</div>
                <div style={{ fontSize: 12, color: '#64748B' }}>{selectedCustomer.phone} · {selectedCustomer.visits} visits</div>
              </div>
            )}

            <div style={{ fontSize: 12, fontWeight: 700, color: '#64748B', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Recent Customers</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {filteredCustomers.map(c => (
                <button
                  key={c.phone}
                  onClick={() => setSelectedCustomer(c)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 12, padding: '14px', borderRadius: 14,
                    border: `1.5px solid ${selectedCustomer?.phone === c.phone ? '#2563EB' : '#E2E8F0'}`,
                    background: selectedCustomer?.phone === c.phone ? '#EFF6FF' : '#fff',
                    cursor: 'pointer', textAlign: 'left',
                  }}
                >
                  <div style={{ width: 40, height: 40, borderRadius: 12, background: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <span style={{ fontSize: 16, fontWeight: 700, color: '#2563EB' }}>{c.name.charAt(0)}</span>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: '#0F172A' }}>{c.name}</div>
                    <div style={{ fontSize: 12, color: '#64748B' }}>{c.phone} · {c.visits} visits</div>
                  </div>
                  {selectedCustomer?.phone === c.phone && <Check size={18} color="#2563EB" />}
                </button>
              ))}
              <button style={{ width: '100%', padding: '14px', background: 'transparent', border: '1.5px dashed #CBD5E1', borderRadius: 14, color: '#2563EB', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
                + Add New Customer
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Payment */}
        {step === 3 && (
          <div>
            <div style={{ background: '#fff', borderRadius: 18, padding: '16px', marginBottom: 16, border: '1px solid #F1F5F9' }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#64748B', marginBottom: 12 }}>Booking Summary</div>
              {[
                { label: 'Court', value: selectedCourt },
                { label: 'Date', value: selectedDate },
                { label: 'Time', value: selectedTime },
                { label: 'Duration', value: selectedDuration },
                { label: 'Customer', value: selectedCustomer?.name ?? '-' },
              ].map(r => (
                <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #F8FAFC' }}>
                  <span style={{ fontSize: 13, color: '#64748B' }}>{r.label}</span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: '#0F172A' }}>{r.value}</span>
                </div>
              ))}
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0 4px' }}>
                <span style={{ fontSize: 15, fontWeight: 700, color: '#0F172A' }}>Total Amount</span>
                <span style={{ fontSize: 18, fontWeight: 800, color: '#2563EB' }}>₹{amount}</span>
              </div>
            </div>

            <div style={{ background: '#fff', borderRadius: 18, padding: '16px', marginBottom: 16, border: '1px solid #F1F5F9' }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#64748B', marginBottom: 12 }}>Payment Method</div>
              <div style={{ display: 'flex', gap: 8 }}>
                {['cash', 'upi', 'card'].map(m => (
                  <button key={m} onClick={() => setPaymentMethod(m)} style={{ flex: 1, padding: '12px 8px', borderRadius: 12, border: `1.5px solid ${paymentMethod === m ? '#2563EB' : '#E2E8F0'}`, background: paymentMethod === m ? '#EFF6FF' : '#F8FAFC', cursor: 'pointer', fontSize: 13, fontWeight: 600, color: paymentMethod === m ? '#2563EB' : '#64748B', textTransform: 'capitalize' }}>
                    {m === 'upi' ? 'UPI' : m.charAt(0).toUpperCase() + m.slice(1)}
                  </button>
                ))}
              </div>

              <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                {['online', 'offline', 'walk-in', 'membership'].map(s => (
                  <button key={s} onClick={() => setBookingSource(s)} style={{ flex: 1, padding: '8px 4px', borderRadius: 10, border: `1.5px solid ${bookingSource === s ? '#2563EB' : '#E2E8F0'}`, background: bookingSource === s ? '#EFF6FF' : 'transparent', cursor: 'pointer', fontSize: 10, fontWeight: 600, color: bookingSource === s ? '#2563EB' : '#64748B' }}>
                    {s.charAt(0).toUpperCase() + s.slice(1)}
                  </button>
                ))}
              </div>

              <div style={{ marginTop: 16 }}>
                <label style={{ fontSize: 13, fontWeight: 600, color: '#0F172A', display: 'block', marginBottom: 6 }}>Advance Collected</label>
                <div style={{ display: 'flex', alignItems: 'center', background: '#F8FAFC', border: '1.5px solid #E2E8F0', borderRadius: 12, padding: '12px 14px' }}>
                  <span style={{ fontSize: 15, fontWeight: 700, color: '#64748B', marginRight: 6 }}>₹</span>
                  <input
                    type="number"
                    value={advance}
                    onChange={e => setAdvance(e.target.value)}
                    style={{ flex: 1, border: 'none', background: 'transparent', fontSize: 18, fontWeight: 700, color: '#0F172A', outline: 'none' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 16, padding: '14px', background: '#F8FAFC', borderRadius: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <MessageCircle size={16} color="#16A34A" />
                  <span style={{ fontSize: 13, fontWeight: 600, color: '#0F172A' }}>Send WhatsApp confirmation</span>
                </div>
                <div
                  onClick={() => setWhatsapp(!whatsapp)}
                  style={{ width: 44, height: 24, borderRadius: 12, background: whatsapp ? '#16A34A' : '#E2E8F0', cursor: 'pointer', position: 'relative', transition: 'background 0.2s' }}
                >
                  <div style={{ width: 20, height: 20, borderRadius: 10, background: '#fff', position: 'absolute', top: 2, left: whatsapp ? 22 : 2, transition: 'left 0.2s', boxShadow: '0 1px 4px rgba(0,0,0,0.15)' }} />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Confirm */}
        {step === 4 && (
          <div style={{ textAlign: 'center', paddingTop: 20 }}>
            <div style={{ width: 80, height: 80, borderRadius: 24, background: '#F0FDF4', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
              <Check size={40} color="#16A34A" />
            </div>
            <div style={{ fontSize: 22, fontWeight: 800, color: '#0F172A', fontFamily: 'Plus Jakarta Sans, sans-serif', marginBottom: 8 }}>Booking Confirmed!</div>
            <div style={{ fontSize: 14, color: '#64748B', marginBottom: 24 }}>Booking ID: BK{Math.floor(Math.random() * 900 + 100)}</div>
            <div style={{ background: '#fff', borderRadius: 18, padding: '20px', textAlign: 'left', border: '1px solid #F1F5F9', marginBottom: 20 }}>
              {[
                { label: 'Customer', value: selectedCustomer?.name ?? '-' },
                { label: 'Court', value: selectedCourt },
                { label: 'Date', value: selectedDate },
                { label: 'Time', value: selectedTime },
                { label: 'Duration', value: selectedDuration },
                { label: 'Amount', value: `₹${amount}` },
                { label: 'Advance', value: `₹${advance}` },
                { label: 'Pending', value: `₹${parseInt(amount) - parseInt(advance)}` },
                { label: 'Payment', value: paymentMethod.toUpperCase() },
              ].map(r => (
                <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #F8FAFC' }}>
                  <span style={{ fontSize: 13, color: '#64748B' }}>{r.label}</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#0F172A' }}>{r.value}</span>
                </div>
              ))}
            </div>
            {whatsapp && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#F0FDF4', borderRadius: 12, padding: '12px 16px', marginBottom: 16 }}>
                <MessageCircle size={16} color="#16A34A" />
                <span style={{ fontSize: 13, color: '#15803D', fontWeight: 600 }}>WhatsApp confirmation sent to {selectedCustomer?.phone}</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Bottom actions */}
      <div style={{ background: '#fff', padding: '16px', borderTop: '1px solid #F1F5F9', flexShrink: 0 }}>
        {step < 4 ? (
          <div style={{ display: 'flex', gap: 10 }}>
            {step > 0 && (
              <button
                onClick={() => setStep(s => s - 1)}
                style={{ flex: 0, padding: '14px 20px', background: '#F8FAFC', color: '#0F172A', border: '1.5px solid #E2E8F0', borderRadius: 14, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}
              >
                Back
              </button>
            )}
            <button
              onClick={() => setStep(s => s + 1)}
              disabled={!canNext()}
              style={{
                flex: 1, padding: '14px', borderRadius: 14, border: 'none',
                background: canNext() ? '#2563EB' : '#E2E8F0',
                color: canNext() ? '#fff' : '#94A3B8',
                fontSize: 15, fontWeight: 700, cursor: canNext() ? 'pointer' : 'default',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                boxShadow: canNext() ? '0 4px 12px rgba(37,99,235,0.3)' : 'none',
              }}
            >
              {step === 3 ? 'Confirm Booking' : 'Continue'}
              <ArrowRight size={18} />
            </button>
          </div>
        ) : (
          <button
            onClick={onComplete}
            style={{ width: '100%', padding: '14px', background: '#2563EB', color: '#fff', border: 'none', borderRadius: 14, fontSize: 15, fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 12px rgba(37,99,235,0.3)' }}
          >
            Back to Dashboard
          </button>
        )}
      </div>
    </div>
  )
}
