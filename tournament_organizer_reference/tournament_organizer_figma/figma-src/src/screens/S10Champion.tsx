import { useEffect, useState } from 'react'
import type { ScreenProps } from '../App'
import CategoryDropdown from '../components/CategoryDropdown'

const STATS = [
  { label: 'Matches Played', value: '47',    icon: '🏸' },
  { label: 'Total Points',   value: '2,184', icon: '📊' },
  { label: 'Longest Match',  value: '78 min', icon: '⏱️' },
  { label: 'Fastest Match',  value: '19 min', icon: '⚡' },
]

function Confetti() {
  const [dots] = useState(() =>
    Array.from({ length: 30 }, (_, i) => ({
      id: i, x: Math.random() * 100, delay: Math.random() * 3,
      size: 6 + Math.random() * 8,
      color: ['#F9A825','#1565C0','#00897B','#F44336','#7B1FA2','#FF6D00'][Math.floor(Math.random() * 6)],
      duration: 3 + Math.random() * 3,
    }))
  )
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
      {dots.map(d => (
        <div key={d.id} style={{
          position: 'absolute', left: `${d.x}%`, top: -20,
          width: d.size, height: d.size, borderRadius: '50%', background: d.color,
          animation: `fall ${d.duration}s ${d.delay}s linear infinite`, opacity: 0.85
        }} />
      ))}
      <style>{`@keyframes fall { 0%{transform:translateY(-20px) rotate(0deg);opacity:.8} 100%{transform:translateY(110vh) rotate(360deg);opacity:0} }`}</style>
    </div>
  )
}

export default function S10Champion({ nav, category, setCategory }: ScreenProps) {
  const [visible, setVisible] = useState(false)
  useEffect(() => { setTimeout(() => setVisible(true), 100) }, [])

  return (
    <div style={{ minHeight: '100dvh', position: 'relative', overflow: 'hidden', background: 'linear-gradient(160deg, #0D1B4B 0%, #1565C0 50%, #00695C 100%)' }}>
      <Confetti />
      {/* Category dropdown */}
      <div style={{ position: 'absolute', top: 48, right: 24, zIndex: 10 }}>
        <CategoryDropdown value={category} onChange={setCategory} />
      </div>

      <div className="screen" style={{ background: 'transparent', position: 'relative', zIndex: 1, paddingBottom: 48 }}>
        {/* Champion section */}
        <div style={{ textAlign: 'center', paddingTop: 60, paddingBottom: 32, opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(30px)', transition: 'all 0.8s cubic-bezier(0.34,1.56,0.64,1)' }}>
          <div style={{ position: 'relative', display: 'inline-block', marginBottom: 16 }}>
            <div style={{ width: 120, height: 120, borderRadius: '50%', background: 'rgba(249,168,37,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 60px rgba(249,168,37,0.4)', fontSize: 64 }}>
              🏆
            </div>
          </div>
          <div style={{ fontFamily: 'var(--font-display)', color: '#FFD700', fontSize: 13, fontWeight: 800, letterSpacing: 3, textTransform: 'uppercase', marginBottom: 8 }}>
            ✦ Champion ✦
          </div>
          <div style={{ fontFamily: 'var(--font-display)', color: 'white', fontSize: 28, fontWeight: 900, lineHeight: 1.2, marginBottom: 4 }}>
            Rajesh & Hari
          </div>
          <div style={{ color: 'rgba(255,255,255,0.65)', fontSize: 14, marginBottom: 6 }}>
            {category} · Kavins Intra Club Tournament 2025
          </div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(249,168,37,0.15)', borderRadius: 20, padding: '6px 16px', border: '1px solid rgba(249,168,37,0.3)' }}>
            <span style={{ fontSize: 14 }}>🥇</span>
            <span style={{ color: '#FFD700', fontSize: 12, fontWeight: 700 }}>Gold · 11 July 2025</span>
          </div>
        </div>

        {/* Runner-up */}
        <div style={{ margin: '0 20px 24px', background: 'rgba(255,255,255,0.07)', borderRadius: 20, padding: 20, opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(20px)', transition: 'all 0.8s 0.2s cubic-bezier(0.34,1.56,0.64,1)', display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ width: 52, height: 52, borderRadius: 16, background: 'rgba(144,164,174,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28 }}>🥈</div>
          <div>
            <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11, fontWeight: 700, letterSpacing: 1 }}>RUNNER-UP</div>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, color: '#B0BEC5', fontSize: 18 }}>Jose & Harsha</div>
            <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: 12 }}>Final Score: 21–18, 17–21, 19–21</div>
          </div>
        </div>

        {/* Stats */}
        <div style={{ padding: '0 20px', marginBottom: 24, opacity: visible ? 1 : 0, transition: 'all 0.8s 0.35s ease' }}>
          <div style={{ fontFamily: 'var(--font-display)', color: 'rgba(255,255,255,0.6)', fontSize: 12, fontWeight: 700, letterSpacing: 1.5, textAlign: 'center', marginBottom: 14 }}>
            TOURNAMENT STATISTICS
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {STATS.map(s => (
              <div key={s.label} style={{ background: 'rgba(255,255,255,0.08)', borderRadius: 16, padding: '16px 12px', textAlign: 'center', border: '1px solid rgba(255,255,255,0.08)' }}>
                <div style={{ fontSize: 24, marginBottom: 6 }}>{s.icon}</div>
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 900, color: 'white', fontSize: 20, lineHeight: 1 }}>{s.value}</div>
                <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11, marginTop: 4 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Podium */}
        <div style={{ margin: '0 20px 28px', background: 'rgba(255,255,255,0.06)', borderRadius: 20, padding: 20, opacity: visible ? 1 : 0, transition: 'all 0.8s 0.5s ease' }}>
          <div style={{ fontFamily: 'var(--font-display)', color: 'rgba(255,255,255,0.6)', fontSize: 12, fontWeight: 700, letterSpacing: 1.5, textAlign: 'center', marginBottom: 16 }}>
            FINAL RESULTS · {category}
          </div>
          {[
            { pos:1, team:'Rajesh & Hari',    medal:'🥇', color:'#FFD700' },
            { pos:2, team:'Jose & Harsha',     medal:'🥈', color:'#90A4AE' },
            { pos:3, team:'Ravi & Sathish',    medal:'🥉', color:'#CD7F32' },
            { pos:3, team:'Pradeep & Senthil', medal:'🥉', color:'#CD7F32' },
          ].map((r, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: i < 3 ? '1px solid rgba(255,255,255,0.08)' : 'none' }}>
              <span style={{ fontSize: 22, width: 30, textAlign: 'center' }}>{r.medal}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: r.color, fontSize: 14 }}>{r.team}</div>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.08)', borderRadius: 8, padding: '3px 10px', color: 'rgba(255,255,255,0.5)', fontSize: 11, fontWeight: 600 }}>
                {r.pos === 1 ? '1st Place' : r.pos === 2 ? '2nd Place' : '3rd Place'}
              </div>
            </div>
          ))}
        </div>

        {/* Action buttons */}
        <div style={{ padding: '0 20px', display: 'flex', flexDirection: 'column', gap: 10, opacity: visible ? 1 : 0, transition: 'all 0.8s 0.6s ease' }}>
          <button className="btn-primary" style={{ background: 'linear-gradient(135deg, #F9A825, #FF8F00)', boxShadow: '0 4px 20px rgba(249,168,37,0.4)' }}>
            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}><span>⬇️</span> Download Results</span>
          </button>
          <button className="btn-primary" style={{ background: 'linear-gradient(135deg, #00897B, #00695C)', boxShadow: '0 4px 20px rgba(0,137,123,0.4)' }}>
            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}><span>📤</span> Share Tournament</span>
          </button>
          <button className="btn-secondary" style={{ background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.7)', borderColor: 'rgba(255,255,255,0.2)' }} onClick={() => nav('dashboard')}>
            🏁 Finish Tournament
          </button>
        </div>
      </div>
    </div>
  )
}
