import { useState } from 'react'
import { Search, ChevronRight, Phone, MessageCircle, TrendingUp, Star } from 'lucide-react'
import StatusChip from '../components/StatusChip'

const customers = [
  { id: 'C001', name: 'Deepa Menon', phone: '9845612300', visits: 31, spend: 15500, lastVisit: 'Yesterday', outstanding: 0, tag: 'frequent' },
  { id: 'C002', name: 'Arjun Sharma', phone: '9876543210', visits: 24, spend: 12000, lastVisit: '2 days ago', outstanding: 0, tag: 'frequent' },
  { id: 'C003', name: 'Vikram Anand', phone: '9500067890', visits: 18, spend: 9000, lastVisit: '1 week ago', outstanding: 1200, tag: 'outstanding' },
  { id: 'C004', name: 'Priya Nair', phone: '9123456789', visits: 15, spend: 7500, lastVisit: '1 week ago', outstanding: 250, tag: 'outstanding' },
  { id: 'C005', name: 'Karthik Rajan', phone: '9988776655', visits: 8, spend: 4000, lastVisit: '3 days ago', outstanding: 750, tag: 'outstanding' },
  { id: 'C006', name: 'Sundar Pichai', phone: '9700012345', visits: 5, spend: 2500, lastVisit: '2 weeks ago', outstanding: 0, tag: 'recent' },
  { id: 'C007', name: 'Meera Raj', phone: '9600045678', visits: 3, spend: 1350, lastVisit: '3 days ago', outstanding: 0, tag: 'recent' },
  { id: 'C008', name: 'Nisha Kumar', phone: '9400089012', visits: 2, spend: 1000, lastVisit: '5 days ago', outstanding: 0, tag: 'recent' },
]

const tabs = ['All', 'Frequent', 'Outstanding']

interface Props {
  onNavigate?: (screen: string) => void
}

export default function CustomersScreen({ onNavigate }: Props) {
  const [tab, setTab] = useState('All')
  const [search, setSearch] = useState('')
  const [expanded, setExpanded] = useState<string | null>(null)

  const filtered = customers.filter(c => {
    const matchTab = tab === 'All' ? true : tab === 'Frequent' ? c.tag === 'frequent' : c.outstanding > 0
    const matchSearch = !search || c.name.toLowerCase().includes(search.toLowerCase()) || c.phone.includes(search)
    return matchTab && matchSearch
  })

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: '#F8FAFC' }}>
      {/* Header */}
      <div style={{ background: '#fff', padding: '0 16px 12px', borderBottom: '1px solid #F1F5F9', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <div style={{ fontSize: 18, fontWeight: 800, color: '#0F172A', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>Customers</div>
          <button style={{ fontSize: 13, fontWeight: 700, color: '#fff', background: '#2563EB', border: 'none', borderRadius: 10, padding: '7px 14px', cursor: 'pointer' }}>+ Add</button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#F8FAFC', border: '1.5px solid #E2E8F0', borderRadius: 12, padding: '10px 14px', marginBottom: 12 }}>
          <Search size={16} color="#94A3B8" />
          <input
            type="text"
            placeholder="Search by name or phone"
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ flex: 1, border: 'none', background: 'transparent', fontSize: 13, color: '#0F172A', outline: 'none' }}
          />
        </div>

        <div style={{ display: 'flex', background: '#F8FAFC', borderRadius: 12, padding: 3, gap: 2 }}>
          {tabs.map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              style={{
                flex: 1, padding: '7px 4px', borderRadius: 10, border: 'none',
                background: tab === t ? '#fff' : 'transparent',
                color: tab === t ? '#2563EB' : '#64748B',
                fontSize: 12, fontWeight: tab === t ? 700 : 500, cursor: 'pointer',
                boxShadow: tab === t ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
              }}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Stats row */}
      <div style={{ padding: '12px 16px 0', flexShrink: 0 }}>
        <div style={{ display: 'flex', gap: 10 }}>
          {[
            { label: 'Total Customers', value: '247', icon: '👥' },
            { label: 'Outstanding', value: '₹2,200', icon: '⚠️' },
            { label: 'Avg Visits', value: '8.4', icon: '📊' },
          ].map(s => (
            <div key={s.label} style={{ flex: 1, background: '#fff', borderRadius: 14, padding: '12px', border: '1px solid #F1F5F9', textAlign: 'center' }}>
              <div style={{ fontSize: 18 }}>{s.icon}</div>
              <div style={{ fontSize: 15, fontWeight: 800, color: '#0F172A', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>{s.value}</div>
              <div style={{ fontSize: 10, color: '#64748B', fontWeight: 500, marginTop: 2 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* List */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '12px 16px 90px' }} className="scrollbar-hide">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {filtered.map(c => (
            <div key={c.id} style={{ background: '#fff', borderRadius: 18, border: '1px solid #F1F5F9', overflow: 'hidden' }}>
              <div
                onClick={() => setExpanded(expanded === c.id ? null : c.id)}
                style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '16px', cursor: 'pointer' }}
              >
                <div style={{ width: 44, height: 44, borderRadius: 13, background: c.tag === 'frequent' ? '#EFF6FF' : c.outstanding > 0 ? '#FFFBEB' : '#F0FDF4', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <span style={{ fontSize: 18, fontWeight: 800, color: c.tag === 'frequent' ? '#2563EB' : c.outstanding > 0 ? '#D97706' : '#16A34A' }}>{c.name.charAt(0)}</span>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontSize: 14, fontWeight: 700, color: '#0F172A' }}>{c.name}</span>
                    {c.tag === 'frequent' && <Star size={12} color="#D97706" fill="#D97706" />}
                  </div>
                  <div style={{ fontSize: 12, color: '#64748B', marginTop: 2 }}>{c.phone} · Last: {c.lastVisit}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#0F172A' }}>₹{c.spend.toLocaleString()}</div>
                  <div style={{ fontSize: 11, color: '#64748B' }}>{c.visits} visits</div>
                </div>
                <ChevronRight size={16} color="#94A3B8" style={{ transform: expanded === c.id ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s' }} />
              </div>

              {expanded === c.id && (
                <div style={{ padding: '0 16px 16px', borderTop: '1px solid #F8FAFC' }} className="fade-in">
                  <div style={{ display: 'flex', gap: 8, marginTop: 12, marginBottom: 12 }}>
                    {[
                      { label: 'Total Visits', value: c.visits },
                      { label: 'Lifetime Spend', value: `₹${c.spend.toLocaleString()}` },
                      { label: 'Outstanding', value: c.outstanding > 0 ? `₹${c.outstanding}` : 'Nil' },
                    ].map(s => (
                      <div key={s.label} style={{ flex: 1, background: '#F8FAFC', borderRadius: 10, padding: '10px 8px', textAlign: 'center' }}>
                        <div style={{ fontSize: 14, fontWeight: 800, color: s.label === 'Outstanding' && c.outstanding > 0 ? '#DC2626' : '#0F172A' }}>{s.value}</div>
                        <div style={{ fontSize: 10, color: '#64748B', marginTop: 2 }}>{s.label}</div>
                      </div>
                    ))}
                  </div>

                  {c.outstanding > 0 && (
                    <div style={{ background: '#FFFBEB', borderRadius: 10, padding: '10px 12px', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 12, fontWeight: 700, color: '#92400E' }}>⚠️ Outstanding: ₹{c.outstanding}</span>
                      <button style={{ marginLeft: 'auto', fontSize: 12, fontWeight: 700, color: '#fff', background: '#D97706', border: 'none', borderRadius: 8, padding: '4px 12px', cursor: 'pointer' }}>Collect</button>
                    </div>
                  )}

                  <div style={{ display: 'flex', gap: 8 }}>
                    <button style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '10px', background: '#EFF6FF', border: 'none', borderRadius: 10, cursor: 'pointer', fontSize: 13, fontWeight: 600, color: '#2563EB' }}>
                      <TrendingUp size={14} /> History
                    </button>
                    <button style={{ width: 40, height: 40, borderRadius: 10, background: '#F8FAFC', border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                      <Phone size={15} color="#64748B" />
                    </button>
                    <button style={{ width: 40, height: 40, borderRadius: 10, background: '#F0FDF4', border: '1px solid #BBF7D0', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                      <MessageCircle size={15} color="#16A34A" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
