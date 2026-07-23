import { useState } from 'react'
import { ArrowRight, Shield, Smartphone } from 'lucide-react'

interface Props {
  onLogin: () => void
}

export default function LoginScreen({ onLogin }: Props) {
  const [step, setStep] = useState<'phone' | 'otp'>('phone')
  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState(['', '', '', ''])

  const handleOtpChange = (i: number, val: string) => {
    if (val.length > 1) return
    const next = [...otp]
    next[i] = val
    setOtp(next)
    if (val && i < 3) {
      const el = document.getElementById(`otp-${i + 1}`)
      el?.focus()
    }
  }

  return (
    <div style={{ height: '100%', background: '#fff', display: 'flex', flexDirection: 'column' }}>
      {/* Top brand area */}
      <div style={{ background: 'linear-gradient(160deg, #1E40AF 0%, #2563EB 60%, #3B82F6 100%)', padding: '60px 28px 48px', position: 'relative', overflow: 'hidden' }}>
        {/* Decorative circles */}
        <div style={{ position: 'absolute', top: -40, right: -40, width: 180, height: 180, borderRadius: '50%', background: 'rgba(255,255,255,0.06)' }} />
        <div style={{ position: 'absolute', bottom: -20, left: -20, width: 120, height: 120, borderRadius: '50%', background: 'rgba(255,255,255,0.06)' }} />

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
          <div style={{ width: 48, height: 48, borderRadius: 14, background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: 24 }}>🏸</span>
          </div>
          <div>
            <div style={{ fontSize: 22, fontWeight: 800, color: '#fff', fontFamily: 'Plus Jakarta Sans, sans-serif', letterSpacing: '-0.5px' }}>Venue OS</div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', fontWeight: 500 }}>Badminton Venue Management</div>
          </div>
        </div>

        <div style={{ color: '#fff' }}>
          <div style={{ fontSize: 26, fontWeight: 800, fontFamily: 'Plus Jakarta Sans, sans-serif', lineHeight: 1.2, marginBottom: 8 }}>
            Run your venue<br />smarter
          </div>
          <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.75)', lineHeight: 1.5 }}>
            Complete management system for badminton facility owners
          </div>
        </div>
      </div>

      {/* Form area */}
      <div style={{ flex: 1, padding: '32px 28px', display: 'flex', flexDirection: 'column' }}>
        {step === 'phone' ? (
          <div className="screen-enter">
            <div style={{ marginBottom: 28 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                <Smartphone size={16} color="#2563EB" />
                <span style={{ fontSize: 16, fontWeight: 700, color: '#0F172A' }}>Enter your mobile number</span>
              </div>
              <p style={{ fontSize: 13, color: '#64748B', margin: 0 }}>We'll send you a 4-digit OTP to verify</p>
            </div>

            <div style={{ marginBottom: 20 }}>
              <div style={{ display: 'flex', border: '1.5px solid #E2E8F0', borderRadius: 14, overflow: 'hidden', background: '#F8FAFC' }}>
                <div style={{ padding: '14px 14px', borderRight: '1px solid #E2E8F0', fontSize: 15, fontWeight: 600, color: '#0F172A', background: '#fff', display: 'flex', alignItems: 'center' }}>
                  🇮🇳 +91
                </div>
                <input
                  type="tel"
                  placeholder="98765 43210"
                  value={phone}
                  onChange={e => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  style={{
                    flex: 1,
                    border: 'none',
                    background: 'transparent',
                    padding: '14px 16px',
                    fontSize: 18,
                    fontWeight: 500,
                    color: '#0F172A',
                    letterSpacing: '0.05em',
                    outline: 'none',
                  }}
                />
              </div>
            </div>

            <button
              onClick={() => phone.length === 10 && setStep('otp')}
              style={{
                width: '100%',
                padding: '16px',
                background: phone.length === 10 ? '#2563EB' : '#E2E8F0',
                color: phone.length === 10 ? '#fff' : '#94A3B8',
                border: 'none',
                borderRadius: 14,
                fontSize: 15,
                fontWeight: 700,
                cursor: phone.length === 10 ? 'pointer' : 'default',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                transition: 'all 0.2s',
              }}
            >
              Send OTP
              <ArrowRight size={18} />
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 24, padding: '12px 16px', background: '#F0FDF4', borderRadius: 12 }}>
              <Shield size={14} color="#16A34A" />
              <span style={{ fontSize: 12, color: '#15803D', fontWeight: 500 }}>Your data is encrypted and secure</span>
            </div>
          </div>
        ) : (
          <div className="screen-enter">
            <button
              onClick={() => setStep('phone')}
              style={{ background: 'none', border: 'none', color: '#2563EB', fontSize: 14, fontWeight: 600, cursor: 'pointer', padding: 0, marginBottom: 24, display: 'flex', alignItems: 'center', gap: 6 }}
            >
              ← Change number
            </button>

            <div style={{ marginBottom: 28 }}>
              <div style={{ fontSize: 16, fontWeight: 700, color: '#0F172A', marginBottom: 6 }}>Enter OTP</div>
              <p style={{ fontSize: 13, color: '#64748B', margin: 0 }}>Sent to +91 {phone.slice(0,5)} {phone.slice(5)}</p>
            </div>

            <div style={{ display: 'flex', gap: 12, marginBottom: 28, justifyContent: 'center' }}>
              {otp.map((val, i) => (
                <input
                  key={i}
                  id={`otp-${i}`}
                  type="tel"
                  maxLength={1}
                  value={val}
                  onChange={e => handleOtpChange(i, e.target.value)}
                  style={{
                    width: 64,
                    height: 64,
                    textAlign: 'center',
                    fontSize: 24,
                    fontWeight: 700,
                    border: `2px solid ${val ? '#2563EB' : '#E2E8F0'}`,
                    borderRadius: 14,
                    outline: 'none',
                    color: '#0F172A',
                    background: val ? '#EFF6FF' : '#F8FAFC',
                    transition: 'all 0.15s',
                  }}
                />
              ))}
            </div>

            <button
              onClick={onLogin}
              style={{
                width: '100%',
                padding: '16px',
                background: '#2563EB',
                color: '#fff',
                border: 'none',
                borderRadius: 14,
                fontSize: 15,
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                boxShadow: '0 4px 16px rgba(37,99,235,0.3)',
              }}
            >
              Verify & Sign In
              <ArrowRight size={18} />
            </button>

            <div style={{ textAlign: 'center', marginTop: 20 }}>
              <span style={{ fontSize: 13, color: '#64748B' }}>Didn't receive OTP? </span>
              <button style={{ background: 'none', border: 'none', color: '#2563EB', fontSize: 13, fontWeight: 600, cursor: 'pointer', padding: 0 }}>Resend in 28s</button>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div style={{ padding: '16px 28px 32px', textAlign: 'center' }}>
        <p style={{ fontSize: 11, color: '#94A3B8', margin: 0 }}>
          By signing in, you agree to our <span style={{ color: '#2563EB' }}>Terms</span> & <span style={{ color: '#2563EB' }}>Privacy Policy</span>
        </p>
      </div>
    </div>
  )
}
