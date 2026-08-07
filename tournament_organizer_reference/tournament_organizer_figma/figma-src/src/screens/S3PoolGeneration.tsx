import { useEffect, useState } from 'react'
import type { ScreenProps } from '../App'
import CategoryDropdown from '../components/CategoryDropdown'

const STEPS = [
  { label: 'Validating Teams',           detail: '42 doubles pairs confirmed' },
  { label: 'Assigning Seeds',            detail: '8 seeded pairs positioned' },
  { label: 'Creating Pools',             detail: 'Distributing into 8 pools' },
  { label: 'Generating League Fixtures', detail: 'Round-robin schedules ready' },
]

export default function S3PoolGeneration({ nav, category, setCategory }: ScreenProps) {
  const [step, setStep] = useState(0)
  const [done, setDone] = useState(false)

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = []
    STEPS.forEach((_, i) => {
      timers.push(setTimeout(() => setStep(i + 1), (i + 1) * 900))
    })
    timers.push(setTimeout(() => setDone(true), STEPS.length * 900 + 400))
    timers.push(setTimeout(() => nav('review-pools'), STEPS.length * 900 + 1200))
    return () => timers.forEach(clearTimeout)
  }, [nav])

  const pct = Math.round((step / STEPS.length) * 100)

  return (
    <div className="screen" style={{
      background: 'linear-gradient(160deg, #0D1B4B 0%, #1565C0 60%, #00897B 100%)',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', minHeight: '100dvh', padding: 32
    }}>
      {/* Category dropdown - top right */}
      <div style={{ position: 'absolute', top: 48, right: 24 }}>
        <CategoryDropdown value={category} onChange={setCategory} />
      </div>

      <div style={{ position: 'relative', marginBottom: 40 }}>
        <div style={{
          width: 100, height: 100, borderRadius: '50%',
          background: 'rgba(255,255,255,0.08)',
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <div style={{
            width: 72, height: 72, borderRadius: '50%',
            background: 'rgba(255,255,255,0.12)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32
          }}>
            🏸
          </div>
        </div>
        <div style={{
          position: 'absolute', inset: -8, borderRadius: '50%',
          border: '3px solid transparent',
          borderTopColor: 'rgba(255,255,255,0.6)',
          borderRightColor: 'rgba(255,255,255,0.2)',
          animation: 'spin-slow 1s linear infinite'
        }} />
      </div>

      <h1 style={{ fontFamily: 'var(--font-display)', color: 'white', fontSize: 22, fontWeight: 800, textAlign: 'center', marginBottom: 4 }}>
        Generating Pools
      </h1>
      <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: 14, textAlign: 'center', marginBottom: 12 }}>
        Category: <strong style={{ color: 'white' }}>{category}</strong>
      </p>
      <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: 13, textAlign: 'center', marginBottom: 36 }}>
        Setting up Kavins Intra Club Tournament
      </p>

      <div style={{ width: '100%', maxWidth: 320, marginBottom: 32 }}>
        <div style={{ background: 'rgba(255,255,255,0.15)', borderRadius: 99, height: 8, overflow: 'hidden' }}>
          <div style={{
            height: '100%', borderRadius: 99,
            background: 'linear-gradient(90deg, #4FC3F7, #00E5FF)',
            width: `${pct}%`,
            transition: 'width 0.6s cubic-bezier(0.4,0,0.2,1)',
            boxShadow: '0 0 12px rgba(79,195,247,0.6)'
          }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
          <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12 }}>Progress</span>
          <span style={{ color: 'white', fontSize: 12, fontWeight: 700 }}>{pct}%</span>
        </div>
      </div>

      <div style={{ width: '100%', maxWidth: 320 }}>
        {STEPS.map((s, i) => {
          const isActive = i === step - 1 && !done
          const isDone = i < step
          return (
            <div key={s.label} className="progress-step" style={{ opacity: i > step ? 0.35 : 1, transition: 'opacity 0.4s ease' }}>
              <div className="progress-dot" style={{
                background: isDone ? '#00E676' : isActive ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.2)',
                color: isDone ? '#1B5E20' : isActive ? '#1565C0' : 'rgba(255,255,255,0.5)',
              }}>
                {isDone ? '✓' : isActive ? (
                  <div style={{ width: 10, height: 10, borderRadius: '50%', border: '2px solid #1565C0', borderTopColor: 'transparent', animation: 'spin-slow 0.6s linear infinite' }} />
                ) : (i + 1)}
              </div>
              <div>
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: isDone || isActive ? 'white' : 'rgba(255,255,255,0.45)', fontSize: 14 }}>
                  {s.label}
                </div>
                {(isDone || isActive) && (
                  <div style={{ color: 'rgba(255,255,255,0.55)', fontSize: 12, marginTop: 2 }}>{s.detail}</div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {done && (
        <div style={{ marginTop: 32, background: 'rgba(0,230,118,0.15)', borderRadius: 14, padding: '12px 24px', border: '1px solid rgba(0,230,118,0.3)' }}>
          <span style={{ color: '#00E676', fontWeight: 700, fontSize: 14, fontFamily: 'var(--font-display)' }}>
            ✓ Pools Generated Successfully!
          </span>
        </div>
      )}
    </div>
  )
}
