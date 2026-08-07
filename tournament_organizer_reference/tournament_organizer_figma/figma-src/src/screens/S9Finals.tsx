import { useState } from 'react'
import type { ScreenProps } from '../App'
import CategoryDropdown from '../components/CategoryDropdown'

interface SetScore { t1: number; t2: number }

export default function S9Finals({ nav, category, setCategory }: ScreenProps) {
  const [sets, setSets] = useState<SetScore[]>([{ t1: 0, t2: 0 }])
  const [currentSet, setCurrentSet] = useState(0)
  const [matchOver, setMatchOver] = useState(false)

  const t1Name = 'Rajesh & Hari'
  const t2Name = 'Jose & Harsha'

  const t1SetsWon = sets.filter(s => s.t1 >= 21 && s.t1 - s.t2 >= 2).length
  const t2SetsWon = sets.filter(s => s.t2 >= 21 && s.t2 - s.t1 >= 2).length

  const addPoint = (team: 1 | 2) => {
    if (matchOver) return
    const newSets = sets.map((s, i) => i === currentSet ? { ...s } : s)
    const cur = { ...newSets[currentSet] }
    if (team === 1) cur.t1++; else cur.t2++
    newSets[currentSet] = cur

    const won = (s: SetScore) => (s.t1 >= 21 && s.t1 - s.t2 >= 2) || (s.t2 >= 21 && s.t2 - s.t1 >= 2)

    if (won(cur)) {
      const t1w = newSets.filter(s => s.t1 >= 21 && s.t1 - s.t2 >= 2).length
      const t2w = newSets.filter(s => s.t2 >= 21 && s.t2 - s.t1 >= 2).length
      if (t1w >= 2 || t2w >= 2) { setSets(newSets); setMatchOver(true); return }
      if (currentSet < 2) { newSets.push({ t1: 0, t2: 0 }); setCurrentSet(currentSet + 1) }
    }
    setSets(newSets)
  }

  const cur = sets[currentSet]
  const winner = t1SetsWon >= 2 ? t1Name : t2SetsWon >= 2 ? t2Name : null

  return (
    <div className="screen" style={{ background: 'linear-gradient(160deg, #0D1B4B 0%, #1565C0 100%)', minHeight: '100dvh' }}>
      {/* Category dropdown */}
      <div style={{ position: 'absolute', top: 48, right: 24, zIndex: 10 }}>
        <CategoryDropdown value={category} onChange={setCategory} />
      </div>

      <div style={{ padding: '48px 24px 24px', textAlign: 'center' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.12)', borderRadius: 20, padding: '6px 16px', marginBottom: 12 }}>
          <span style={{ color: '#F44336', fontSize: 12 }}>●</span>
          <span style={{ color: 'white', fontSize: 13, fontWeight: 700, letterSpacing: 0.5 }}>FINAL · {category} · LIVE</span>
        </div>
        <h1 style={{ fontFamily: 'var(--font-display)', color: 'white', fontSize: 18, fontWeight: 800, marginBottom: 4 }}>
          {matchOver ? '🏆 Match Complete!' : `Set ${currentSet + 1} of 3`}
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13 }}>Best of 3 · 21 Points</p>
      </div>

      {/* Set score pills */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 24 }}>
        {[0, 1, 2].map(i => {
          const t1w = sets[i] ? (sets[i].t1 >= 21 && sets[i].t1 - sets[i].t2 >= 2) : false
          const t2w = sets[i] ? (sets[i].t2 >= 21 && sets[i].t2 - sets[i].t1 >= 2) : false
          return (
            <div key={i} style={{
              background: i === currentSet && !matchOver ? 'rgba(255,255,255,0.25)' : sets[i] ? (t1w ? '#4FC3F7' : t2w ? '#EF9A9A' : 'rgba(255,255,255,0.1)') : 'rgba(255,255,255,0.07)',
              borderRadius: 8, padding: '6px 14px', fontSize: 12, color: 'white', fontWeight: 700, minWidth: 80, textAlign: 'center',
              border: i === currentSet && !matchOver ? '1px solid rgba(255,255,255,0.4)' : '1px solid transparent'
            }}>
              {sets[i] ? `${sets[i].t1} – ${sets[i].t2}` : `Set ${i + 1}`}
            </div>
          )
        })}
      </div>

      {/* Scoreboard */}
      <div style={{ margin: '0 20px 24px', background: 'rgba(255,255,255,0.07)', borderRadius: 24, padding: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ flex: 1, textAlign: 'center' }}>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, color: 'white', fontSize: 15, lineHeight: 1.3, marginBottom: 8 }}>{t1Name}</div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 4, marginBottom: 8 }}>
              {[0, 1].map(i => <div key={i} style={{ width: 16, height: 16, borderRadius: '50%', background: t1SetsWon > i ? '#4FC3F7' : 'rgba(255,255,255,0.2)' }} />)}
            </div>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 900, color: t1SetsWon > t2SetsWon ? '#4FC3F7' : 'white', fontSize: 72, lineHeight: 1 }}>
              {cur.t1}
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 2, height: 60, background: 'rgba(255,255,255,0.15)', borderRadius: 2 }} />
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 900, color: 'rgba(255,255,255,0.4)', fontSize: 16 }}>VS</div>
            <div style={{ width: 2, height: 60, background: 'rgba(255,255,255,0.15)', borderRadius: 2 }} />
          </div>
          <div style={{ flex: 1, textAlign: 'center' }}>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, color: 'white', fontSize: 15, lineHeight: 1.3, marginBottom: 8 }}>{t2Name}</div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 4, marginBottom: 8 }}>
              {[0, 1].map(i => <div key={i} style={{ width: 16, height: 16, borderRadius: '50%', background: t2SetsWon > i ? '#EF9A9A' : 'rgba(255,255,255,0.2)' }} />)}
            </div>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 900, color: t2SetsWon > t1SetsWon ? '#EF9A9A' : 'white', fontSize: 72, lineHeight: 1 }}>
              {cur.t2}
            </div>
          </div>
        </div>
      </div>

      {/* Score buttons */}
      {!matchOver ? (
        <div style={{ padding: '0 24px' }}>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginBottom: 16 }}>
            <button className="score-btn" style={{ background: 'linear-gradient(135deg, #1976D2, #42A5F5)', color: 'white', fontFamily: 'var(--font-display)' }} onClick={() => addPoint(1)}>
              +1
            </button>
            <div style={{ width: 48, height: 72, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.3)', fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 18 }}>|</div>
            <button className="score-btn" style={{ background: 'linear-gradient(135deg, #C62828, #EF5350)', color: 'white', fontFamily: 'var(--font-display)' }} onClick={() => addPoint(2)}>
              +1
            </button>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-around', marginBottom: 16 }}>
            <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12, textAlign: 'center', width: 80 }}>{t1Name.split(' & ')[0]}</span>
            <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12, textAlign: 'center', width: 80 }}>{t2Name.split(' & ')[0]}</span>
          </div>
          <div style={{ textAlign: 'center' }}>
            <button style={{ background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: 10, color: 'rgba(255,255,255,0.6)', padding: '8px 20px', cursor: 'pointer', fontSize: 13, fontFamily: 'var(--font-display)' }}>
              ↩ Undo Last Point
            </button>
          </div>
        </div>
      ) : (
        <div style={{ padding: '0 24px', textAlign: 'center' }}>
          <div style={{ background: 'rgba(255,255,255,0.1)', borderRadius: 20, padding: 24, marginBottom: 16 }}>
            <div style={{ fontSize: 40, marginBottom: 8 }}>🏆</div>
            <div style={{ fontFamily: 'var(--font-display)', color: '#FFD700', fontSize: 22, fontWeight: 900, marginBottom: 4 }}>{winner}</div>
            <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 14 }}>wins the {category} Final!</div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 12 }}>
              {sets.filter(s => s.t1 > 0 || s.t2 > 0).map((s, i) => (
                <span key={i} style={{ background: 'rgba(255,255,255,0.1)', borderRadius: 8, padding: '4px 12px', color: 'white', fontSize: 14, fontWeight: 700 }}>
                  {s.t1}–{s.t2}
                </span>
              ))}
            </div>
          </div>
          <button className="btn-primary" onClick={() => nav('champion')} style={{ background: 'linear-gradient(135deg, #F9A825, #FF8F00)', boxShadow: '0 4px 20px rgba(249,168,37,0.5)' }}>
            🏆 See Champion →
          </button>
        </div>
      )}
    </div>
  )
}
