import { useState } from 'react'
import type { ScreenProps } from '../App'
import CategoryDropdown from '../components/CategoryDropdown'

const INITIAL_R16 = [
  'Rajesh & Hari',     'Prabu & Velu',
  'Vignesh & Manoj',   'Aswin & Jeevan',
  'Suresh & Kiran',    'Saravanan & Ponraj',
  'Deepak & Anand',    'Vinay & Mohan',
  'Ravi & Sathish',    'Mani & Shankar',
  'Ganesh & Murugan',  'Nathan & Kavin',
  'Pradeep & Senthil', 'Rahul & Vinoth',
  'Arun & Vijay',      'Jose & Harsha',
]

export default function S7ReviewKnockout({ nav, category, setCategory }: ScreenProps) {
  const [slots, setSlots] = useState([...INITIAL_R16])
  const [selected, setSelected] = useState<number | null>(null)
  const [locked, setLocked] = useState(false)

  const handleSlotClick = (i: number) => {
    if (locked) return
    if (selected === null) { setSelected(i) }
    else {
      if (selected !== i) {
        const next = [...slots];
        [next[selected], next[i]] = [next[i], next[selected]]
        setSlots(next)
      }
      setSelected(null)
    }
  }

  const reset = () => { setSlots([...INITIAL_R16]); setSelected(null) }

  const matches = Array.from({ length: 8 }, (_, i) => ({
    top: slots[i * 2], bot: slots[i * 2 + 1],
    topIdx: i * 2,     botIdx: i * 2 + 1,
  }))
  const qfWinners = matches.map(m => m.top)
  const sfWinners = [qfWinners[0], qfWinners[2], qfWinners[4], qfWinners[6]]
  const finalists = [sfWinners[0], sfWinners[2]]

  const SlotBox = ({ name, idx, borderColor }: { name: string; idx: number; borderColor: string }) => (
    <div
      onClick={() => handleSlotClick(idx)}
      style={{
        background: selected === idx ? '#E3F2FD' : selected !== null ? '#F0FBF9' : 'white',
        border: `2px solid ${selected === idx ? '#1565C0' : selected !== null ? '#00897B' : borderColor}`,
        borderRadius: 10, padding: '10px 12px', cursor: locked ? 'default' : 'pointer',
        transition: 'all 0.15s ease', marginBottom: 2, minWidth: 120
      }}
    >
      <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: '#1A237E', fontSize: 11, lineHeight: 1.3 }}>
        {name}
      </div>
    </div>
  )

  const PlaceholderBox = ({ name, color, borderColor }: { name: string; color: string; borderColor: string }) => (
    <div style={{ background: `${color}08`, border: `1px dashed ${borderColor}`, borderRadius: 10, padding: '10px 12px', marginBottom: 2, minWidth: 120 }}>
      <div style={{ color, fontSize: 11, fontWeight: 700, fontFamily: 'var(--font-display)' }}>{name}</div>
    </div>
  )

  return (
    <div className="screen pb-28">
      <div className="header-gradient px-5 pt-12 pb-6">
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 4 }}>
          <div>
            <h1 style={{ fontFamily: 'var(--font-display)', color: 'white', fontSize: 20, fontWeight: 800, margin: 0 }}>
              Knockout Draw
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12, margin: 0 }}>
              {category} · Tap teams to swap
            </p>
          </div>
          <CategoryDropdown value={category} onChange={setCategory} />
        </div>
        {!locked ? (
          <div style={{ marginTop: 12, background: 'rgba(255,255,255,0.12)', borderRadius: 10, padding: '8px 14px' }}>
            <span style={{ color: 'rgba(255,255,255,0.85)', fontSize: 12 }}>
              {selected !== null ? `Selected: ${slots[selected]} — tap another to swap` : '👆 Tap a team to select, then tap another to swap'}
            </span>
          </div>
        ) : (
          <div style={{ marginTop: 12, background: 'rgba(0,230,118,0.2)', borderRadius: 10, padding: '8px 14px' }}>
            <span style={{ color: '#00E676', fontSize: 12, fontWeight: 700 }}>🔒 Draw Locked — ready to play!</span>
          </div>
        )}
      </div>

      <div className="px-4 pt-4" style={{ overflowX: 'auto' }}>
        <div style={{ display: 'flex', gap: 10, minWidth: 520, paddingBottom: 8 }}>
          {/* R16 */}
          <div style={{ flexShrink: 0, width: 136 }}>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, color: '#1565C0', fontSize: 11, letterSpacing: 1, textAlign: 'center', marginBottom: 10, padding: '6px', background: '#E3F2FD', borderRadius: 8 }}>
              ROUND OF 16
            </div>
            {matches.map((m, mi) => (
              <div key={mi} style={{ marginBottom: 10 }}>
                <SlotBox name={m.top} idx={m.topIdx} borderColor="#BBDEFB" />
                <div style={{ textAlign: 'center', fontSize: 9, color: '#90A4AE', fontWeight: 700, margin: '1px 0' }}>vs</div>
                <SlotBox name={m.bot} idx={m.botIdx} borderColor="#BBDEFB" />
                <div style={{ height: 1, background: '#E3F2FD', margin: '4px 0' }} />
              </div>
            ))}
          </div>

          {/* QF */}
          <div style={{ flexShrink: 0, width: 136 }}>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, color: '#7B1FA2', fontSize: 11, letterSpacing: 1, textAlign: 'center', marginBottom: 10, padding: '6px', background: '#F3E5F5', borderRadius: 8 }}>
              QTR FINALS
            </div>
            {matches.map((m, mi) => (
              <div key={mi} style={{ marginBottom: 10 }}>
                <PlaceholderBox name={m.top} color="#7B1FA2" borderColor="#CE93D8" />
                <div style={{ textAlign: 'center', fontSize: 9, color: '#CE93D8', fontWeight: 700, margin: '1px 0' }}>vs</div>
                <PlaceholderBox name={m.bot} color="#7B1FA2" borderColor="#CE93D8" />
                <div style={{ height: 1, background: '#F3E5F5', margin: '4px 0' }} />
              </div>
            ))}
          </div>

          {/* SF */}
          <div style={{ flexShrink: 0, width: 136 }}>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, color: '#00695C', fontSize: 11, letterSpacing: 1, textAlign: 'center', marginBottom: 10, padding: '6px', background: '#E0F2F1', borderRadius: 8 }}>
              SEMI FINALS
            </div>
            {sfWinners.map((name, i) => (
              <div key={i} style={{ marginBottom: 24 }}>
                <PlaceholderBox name={name} color="#00695C" borderColor="#80CBC4" />
                <div style={{ textAlign: 'center', fontSize: 9, color: '#80CBC4', fontWeight: 700, margin: '1px 0' }}>vs</div>
                <PlaceholderBox name="TBD" color="#90A4AE" borderColor="#CFD8DC" />
              </div>
            ))}
          </div>

          {/* Final */}
          <div style={{ flexShrink: 0, width: 136 }}>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, color: '#E65100', fontSize: 11, letterSpacing: 1, textAlign: 'center', marginBottom: 10, padding: '6px', background: '#FFF3E0', borderRadius: 8 }}>
              FINAL
            </div>
            <div style={{ marginTop: 40 }}>
              {finalists.map((name, i) => (
                <div key={i}>
                  <div style={{ background: 'linear-gradient(135deg, #FFF8E1, #FFECB3)', border: '2px solid #F9A825', borderRadius: 10, padding: '12px', marginBottom: i === 0 ? 4 : 0 }}>
                    <div style={{ fontSize: 14, textAlign: 'center', marginBottom: 4 }}>🏆</div>
                    <div style={{ color: '#E65100', fontSize: 11, fontWeight: 800, fontFamily: 'var(--font-display)', textAlign: 'center' }}>{name}</div>
                  </div>
                  {i === 0 && <div style={{ textAlign: 'center', fontSize: 11, color: '#F9A825', fontWeight: 800, margin: '4px 0' }}>vs</div>}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div style={{
        position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)',
        width: '100%', maxWidth: 480,
        background: 'rgba(238,242,248,0.95)',
        backdropFilter: 'blur(12px)', padding: '16px 20px 28px',
        borderTop: '1px solid rgba(21,101,192,0.08)'
      }}>
        {!locked ? (
          <div style={{ display: 'flex', gap: 10 }}>
            <button className="btn-secondary" style={{ flex: 1 }} onClick={reset}>🔄 Reset</button>
            <button className="btn-primary" style={{ flex: 2 }} onClick={() => setLocked(true)}>🔒 Lock Draw</button>
          </div>
        ) : (
          <button className="btn-primary" onClick={() => nav('knockout-dashboard')}>🏸 Start Knockout Matches →</button>
        )}
      </div>
    </div>
  )
}
