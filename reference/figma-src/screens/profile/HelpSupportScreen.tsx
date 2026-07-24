import { useState } from 'react'
import { ChevronLeft, ChevronRight, Search, MessageCircle, Mail, Phone, FileText, Shield, Info, X, ChevronDown } from 'lucide-react'

const faqCategories = [
  { label: 'Bookings', emoji: '📅', count: 8 },
  { label: 'Members', emoji: '👥', count: 6 },
  { label: 'Payments', emoji: '💳', count: 5 },
  { label: 'Schedule', emoji: '🗓️', count: 4 },
  { label: 'Account', emoji: '👤', count: 7 },
  { label: 'Technical', emoji: '⚙️', count: 3 },
]

const popularFaqs = [
  {
    q: 'How do I cancel a booking?',
    a: 'Go to Bookings → select the booking → tap Cancel Booking. Cancellations made 2+ hours before the slot are automatically notified to the customer via WhatsApp.',
  },
  {
    q: 'How do I add a new court?',
    a: 'Navigate to Profile → Court Management → tap Add Court. You can set court name, type, pricing, and amenities. Courts appear immediately on your schedule.',
  },
  {
    q: 'How do membership slot applications work?',
    a: 'When a player applies via the Player App, you receive a notification. Go to Members → Applications to Accept, Reject, or invite them for a Guest Play trial session.',
  },
  {
    q: 'Can I set different prices for weekends?',
    a: 'Yes. Go to Profile → Court Schedule & Pricing. Each day has independent time blocks. Create separate pricing blocks for Sat and Sun with your weekend rates.',
  },
  {
    q: 'How do I export payment reports?',
    a: 'Go to Profile → Reports → select your date range and tap Export. Reports are exported as PDF and can be shared via WhatsApp, email or saved to your device.',
  },
]

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #F1F5F9', overflow: 'hidden' }}>
      <button onClick={() => setOpen(!open)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', padding: '14px 16px', background: 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left' }}>
        <span style={{ fontSize: 14, fontWeight: 600, color: '#0F172A', flex: 1, lineHeight: 1.4, paddingRight: 10 }}>{q}</span>
        <ChevronDown size={16} color="#94A3B8" style={{ flexShrink: 0, transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
      </button>
      {open && (
        <div style={{ padding: '0 16px 14px', borderTop: '1px solid #F8FAFC' }} className="fade-in">
          <p style={{ fontSize: 13, color: '#64748B', lineHeight: 1.6, margin: '10px 0 0' }}>{a}</p>
        </div>
      )}
    </div>
  )
}

interface Props { onBack: () => void }

export default function HelpSupportScreen({ onBack }: Props) {
  const [search, setSearch] = useState('')

  const filteredFaqs = popularFaqs.filter(f =>
    !search || f.q.toLowerCase().includes(search.toLowerCase()) || f.a.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: '#F8FAFC' }}>
      {/* Header */}
      <div style={{ background: '#fff', padding: '0 16px 16px', borderBottom: '1px solid #F1F5F9', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
          <button onClick={onBack} style={{ width: 36, height: 36, borderRadius: 10, background: '#F8FAFC', border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <ChevronLeft size={20} color="#0F172A" />
          </button>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 18, fontWeight: 800, color: '#0F172A', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>Help & Support</div>
          </div>
        </div>

        {/* Search */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#F8FAFC', border: '1.5px solid #E2E8F0', borderRadius: 12, padding: '10px 14px' }}>
          <Search size={16} color="#94A3B8" />
          <input type="text" placeholder="Search FAQs…" value={search} onChange={e => setSearch(e.target.value)}
            style={{ flex: 1, border: 'none', background: 'transparent', fontSize: 13, color: '#0F172A', outline: 'none' }} />
          {search && <button onClick={() => setSearch('')} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}><X size={14} color="#94A3B8" /></button>}
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }} className="scrollbar-hide">
        {/* Contact Support */}
        <div style={{ background: '#fff', borderRadius: 18, padding: '16px', marginBottom: 16, border: '1px solid #F1F5F9' }}>
          <div style={{ fontSize: 13, fontWeight: 800, color: '#0F172A', marginBottom: 14 }}>Contact Support</div>
          <div style={{ display: 'flex', gap: 10 }}>
            {[
              { icon: MessageCircle, label: 'Chat', sub: 'Instant', color: '#2563EB', bg: '#EFF6FF', border: '#BFDBFE' },
              { icon: Mail, label: 'Email', sub: '< 2 hours', color: '#7C3AED', bg: '#F5F3FF', border: '#C4B5FD' },
              { icon: Phone, label: 'Call', sub: '9AM–6PM', color: '#16A34A', bg: '#F0FDF4', border: '#BBF7D0' },
            ].map(c => {
              const Icon = c.icon
              return (
                <button key={c.label} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, padding: '14px 8px', background: c.bg, border: `1.5px solid ${c.border}`, borderRadius: 14, cursor: 'pointer' }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon size={17} color={c.color} />
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: c.color }}>{c.label}</div>
                  <div style={{ fontSize: 10, color: c.color, opacity: 0.7 }}>{c.sub}</div>
                </button>
              )
            })}
          </div>
        </div>

        {/* Categories */}
        {!search && (
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 12 }}>Browse Categories</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
              {faqCategories.map(c => (
                <button key={c.label} style={{ background: '#fff', borderRadius: 14, padding: '12px 8px', border: '1px solid #F1F5F9', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontSize: 22 }}>{c.emoji}</span>
                  <span style={{ fontSize: 11, fontWeight: 700, color: '#0F172A' }}>{c.label}</span>
                  <span style={{ fontSize: 10, color: '#94A3B8', fontWeight: 500 }}>{c.count} articles</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* FAQs */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 12 }}>
            {search ? `Results (${filteredFaqs.length})` : 'Popular Questions'}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {filteredFaqs.length > 0 ? filteredFaqs.map((f, i) => (
              <FAQItem key={i} q={f.q} a={f.a} />
            )) : (
              <div style={{ textAlign: 'center', padding: '40px 0', color: '#94A3B8' }}>
                <div style={{ fontSize: 32, marginBottom: 8 }}>🔍</div>
                <div style={{ fontSize: 14, fontWeight: 600 }}>No results found</div>
                <div style={{ fontSize: 12, marginTop: 4 }}>Try a different search or contact support</div>
              </div>
            )}
          </div>
        </div>

        {/* Legal */}
        <div style={{ background: '#fff', borderRadius: 18, overflow: 'hidden', border: '1px solid #F1F5F9', marginBottom: 16 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.07em', padding: '14px 16px 8px' }}>Legal</div>
          {[
            { icon: FileText, label: 'Terms & Conditions', sub: 'Last updated Jun 2026' },
            { icon: Shield, label: 'Privacy Policy', sub: 'Last updated Jun 2026' },
          ].map((item, i) => {
            const Icon = item.icon
            return (
              <button key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%', padding: '13px 16px', background: 'transparent', border: 'none', cursor: 'pointer', borderTop: i > 0 ? '1px solid #F8FAFC' : 'none', textAlign: 'left' }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: '#F8FAFC', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon size={16} color="#64748B" />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: '#0F172A' }}>{item.label}</div>
                  <div style={{ fontSize: 11, color: '#94A3B8', marginTop: 1 }}>{item.sub}</div>
                </div>
                <ChevronRight size={15} color="#CBD5E1" />
              </button>
            )
          })}
        </div>

        {/* App info */}
        <div style={{ background: '#fff', borderRadius: 18, overflow: 'hidden', border: '1px solid #F1F5F9', marginBottom: 88 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.07em', padding: '14px 16px 8px' }}>App Information</div>
          {[
            { icon: Info, label: 'App Version', sub: 'v2.4.1 (build 214)' },
            { icon: Info, label: 'Check for Updates', sub: 'You are on the latest version' },
            { icon: Info, label: 'About Venue OS', sub: 'Built for badminton court owners' },
          ].map((item, i) => {
            const Icon = item.icon
            return (
              <button key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%', padding: '13px 16px', background: 'transparent', border: 'none', cursor: 'pointer', borderTop: i > 0 ? '1px solid #F8FAFC' : 'none', textAlign: 'left' }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: '#F8FAFC', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon size={16} color="#64748B" />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: '#0F172A' }}>{item.label}</div>
                  <div style={{ fontSize: 11, color: '#94A3B8', marginTop: 1 }}>{item.sub}</div>
                </div>
                <ChevronRight size={15} color="#CBD5E1" />
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
