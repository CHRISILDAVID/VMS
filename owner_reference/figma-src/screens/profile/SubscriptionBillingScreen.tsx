import { useState } from 'react'
import { ChevronLeft, Check, Crown, Download, Plus, CreditCard, X, Star } from 'lucide-react'

const plans = [
  {
    id: 'free', label: 'Free', price: '₹0', period: '/month',
    color: '#64748B', bg: '#F8FAFC', border: '#E2E8F0',
    benefits: ['Up to 2 courts', 'Basic bookings', 'Schedule view', '7-day history'],
  },
  {
    id: 'pro', label: 'Pro', price: '₹999', period: '/month',
    color: '#2563EB', bg: '#EFF6FF', border: '#93C5FD',
    badge: 'Current Plan',
    benefits: ['Up to 12 courts', 'Members module', 'Payments & reports', 'WhatsApp confirmations', 'Unlimited history', 'Priority support'],
  },
  {
    id: 'enterprise', label: 'Enterprise', price: '₹2,499', period: '/month',
    color: '#7C3AED', bg: '#F5F3FF', border: '#C4B5FD',
    badge: 'Best Value',
    benefits: ['Unlimited courts & venues', 'Multi-venue dashboard', 'Franchise management', 'Advanced analytics', 'API access', 'Dedicated account manager'],
  },
]

const billingHistory = [
  { invoice: 'INV-2026-07', date: 'Jul 1, 2026', amount: '₹999', status: 'paid' },
  { invoice: 'INV-2026-06', date: 'Jun 1, 2026', amount: '₹999', status: 'paid' },
  { invoice: 'INV-2026-05', date: 'May 1, 2026', amount: '₹999', status: 'paid' },
  { invoice: 'INV-2026-04', date: 'Apr 1, 2026', amount: '₹999', status: 'paid' },
]

const paymentMethods = [
  { id: 'pm1', type: 'Visa', last4: '4521', expiry: '08/28', isDefault: true },
  { id: 'pm2', type: 'UPI', last4: 'rajesh@okaxis', expiry: '', isDefault: false },
]

interface Props { onBack: () => void }

export default function SubscriptionBillingScreen({ onBack }: Props) {
  const [currentPlan] = useState('pro')
  const [tab, setTab] = useState<'plan' | 'billing' | 'payment'>('plan')

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: '#F8FAFC' }}>
      {/* Header */}
      <div style={{ background: '#fff', padding: '0 16px 12px', borderBottom: '1px solid #F1F5F9', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
          <button onClick={onBack} style={{ width: 36, height: 36, borderRadius: 10, background: '#F8FAFC', border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <ChevronLeft size={20} color="#0F172A" />
          </button>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 18, fontWeight: 800, color: '#0F172A', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>Subscription & Billing</div>
          </div>
        </div>
        <div style={{ display: 'flex', background: '#F8FAFC', borderRadius: 12, padding: 3, gap: 2 }}>
          {(['plan', 'billing', 'payment'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)} style={{ flex: 1, padding: '7px 4px', borderRadius: 10, border: 'none', background: tab === t ? '#fff' : 'transparent', color: tab === t ? '#2563EB' : '#64748B', fontSize: 12, fontWeight: tab === t ? 700 : 500, cursor: 'pointer', boxShadow: tab === t ? '0 1px 4px rgba(0,0,0,0.08)' : 'none', textTransform: 'capitalize' }}>{t === 'plan' ? 'My Plan' : t === 'billing' ? 'Billing' : 'Payment'}</button>
          ))}
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }} className="scrollbar-hide">
        {/* ── Plan Tab ── */}
        {tab === 'plan' && (
          <>
            {/* Active plan card */}
            <div style={{ background: 'linear-gradient(135deg, #1D4ED8 0%, #2563EB 100%)', borderRadius: 20, padding: '20px', marginBottom: 20, position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: -40, right: -40, width: 150, height: 150, borderRadius: '50%', background: 'rgba(255,255,255,0.07)' }} />
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14 }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <Crown size={16} color="#FCD34D" fill="#FCD34D" />
                    <span style={{ fontSize: 12, fontWeight: 700, color: '#FCD34D' }}>Pro Plan</span>
                  </div>
                  <div style={{ fontSize: 28, fontWeight: 900, color: '#fff', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>₹999<span style={{ fontSize: 14, fontWeight: 500, opacity: 0.8 }}>/mo</span></div>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.15)', borderRadius: 10, padding: '6px 12px' }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#fff' }}>Active</div>
                </div>
              </div>
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.8)', marginBottom: 14 }}>Renews on August 1, 2026</div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button style={{ flex: 1, padding: '10px', background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)', borderRadius: 12, color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>Manage</button>
                <button style={{ flex: 1, padding: '10px', background: '#fff', border: 'none', borderRadius: 12, color: '#2563EB', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>Upgrade</button>
              </div>
            </div>

            {/* Plan comparison */}
            <div style={{ marginBottom: 88 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12 }}>All Plans</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {plans.map(p => (
                  <div key={p.id} style={{ background: '#fff', borderRadius: 18, padding: '18px', border: `2px solid ${p.id === currentPlan ? p.color : '#F1F5F9'}` }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14 }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                          <span style={{ fontSize: 16, fontWeight: 800, color: '#0F172A', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>{p.label}</span>
                          {p.badge && (
                            <span style={{ fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 20, background: p.bg, color: p.color, border: `1px solid ${p.border}` }}>{p.badge}</span>
                          )}
                        </div>
                        <div style={{ fontSize: 22, fontWeight: 900, color: p.color, fontFamily: 'Plus Jakarta Sans, sans-serif' }}>{p.price}<span style={{ fontSize: 12, fontWeight: 500, color: '#64748B' }}>{p.period}</span></div>
                      </div>
                      {p.id === currentPlan && <div style={{ width: 28, height: 28, borderRadius: '50%', background: p.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Check size={14} color="#fff" /></div>}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: p.id !== currentPlan ? 14 : 0 }}>
                      {p.benefits.map(b => (
                        <div key={b} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div style={{ width: 18, height: 18, borderRadius: '50%', background: p.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <Check size={10} color={p.color} />
                          </div>
                          <span style={{ fontSize: 13, color: '#0F172A', fontWeight: 500 }}>{b}</span>
                        </div>
                      ))}
                    </div>
                    {p.id !== currentPlan && (
                      <button style={{ width: '100%', padding: '12px', background: p.id === 'enterprise' ? p.bg : '#F8FAFC', border: `1.5px solid ${p.border}`, borderRadius: 12, color: p.color, fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
                        {p.id === 'free' ? 'Downgrade' : 'Upgrade to ' + p.label}
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* ── Billing Tab ── */}
        {tab === 'billing' && (
          <div style={{ marginBottom: 88 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12 }}>Billing History</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {billingHistory.map(h => (
                <div key={h.invoice} style={{ background: '#fff', borderRadius: 16, padding: '14px 16px', border: '1px solid #F1F5F9', display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 12, background: '#F0FDF4', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <CreditCard size={18} color="#16A34A" />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#0F172A' }}>{h.invoice}</div>
                    <div style={{ fontSize: 12, color: '#64748B', marginTop: 2 }}>{h.date}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 15, fontWeight: 800, color: '#0F172A' }}>{h.amount}</div>
                    <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 20, background: '#F0FDF4', color: '#16A34A' }}>Paid</span>
                  </div>
                  <button style={{ width: 32, height: 32, borderRadius: 9, background: '#F8FAFC', border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                    <Download size={14} color="#64748B" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Payment Tab ── */}
        {tab === 'payment' && (
          <div style={{ marginBottom: 88 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12 }}>Payment Methods</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 14 }}>
              {paymentMethods.map(pm => (
                <div key={pm.id} style={{ background: '#fff', borderRadius: 16, padding: '14px 16px', border: `1.5px solid ${pm.isDefault ? '#2563EB' : '#F1F5F9'}` }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 44, height: 30, borderRadius: 6, background: pm.type === 'Visa' ? '#EFF6FF' : '#F5F3FF', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <span style={{ fontSize: 11, fontWeight: 800, color: pm.type === 'Visa' ? '#2563EB' : '#7C3AED' }}>{pm.type}</span>
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: '#0F172A' }}>
                        {pm.type === 'Visa' ? `•••• •••• •••• ${pm.last4}` : pm.last4}
                      </div>
                      {pm.expiry && <div style={{ fontSize: 11, color: '#64748B', marginTop: 1 }}>Expires {pm.expiry}</div>}
                    </div>
                    <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                      {pm.isDefault && (
                        <span style={{ fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 20, background: '#EFF6FF', color: '#2563EB' }}>Default</span>
                      )}
                      <button style={{ width: 28, height: 28, borderRadius: 8, background: '#F8FAFC', border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                        <X size={13} color="#DC2626" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <button style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px 16px', width: '100%', background: 'transparent', border: '1.5px dashed #CBD5E1', borderRadius: 16, cursor: 'pointer', fontSize: 14, fontWeight: 700, color: '#2563EB' }}>
              <Plus size={18} /> Add Payment Method
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
