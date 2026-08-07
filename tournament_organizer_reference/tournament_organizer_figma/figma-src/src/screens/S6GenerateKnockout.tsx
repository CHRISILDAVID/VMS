import { useState } from 'react'
import type { ScreenProps } from '../App'
import CategoryDropdown from '../components/CategoryDropdown'

const QUALIFIED_BY_CAT: Record<string, { pool: string; rank: number; name: string }[]> = {
  "Men's": [
    { pool:'A', rank:1, name:'Rajesh & Hari' },    { pool:'A', rank:2, name:'Jose & Harsha' },
    { pool:'B', rank:1, name:'Vignesh & Manoj' },  { pool:'B', rank:2, name:'Rahul & Vinoth' },
    { pool:'C', rank:1, name:'Suresh & Kiran' },   { pool:'C', rank:2, name:'Thiagu & Muthukumar' },
    { pool:'D', rank:1, name:'Deepak & Anand' },   { pool:'D', rank:2, name:'Aswin & Jeevan' },
  ],
  "Women's": [],
  'Mixed': [
    { pool:'E', rank:1, name:'Ravi & Sathish' },    { pool:'E', rank:2, name:'Nathan & Kavin' },
    { pool:'F', rank:1, name:'Ganesh & Murugan' },  { pool:'F', rank:2, name:'Mani & Shankar' },
  ],
  '50+': [
    { pool:'G', rank:1, name:'Pradeep & Senthil' }, { pool:'G', rank:2, name:'Sriram & Balaji' },
    { pool:'H', rank:1, name:'Arun & Vijay' },      { pool:'H', rank:2, name:'Jeeva & Tamilarasan' },
  ],
}

export default function S6GenerateKnockout({ nav, category, setCategory }: ScreenProps) {
  const [phase, setPhase] = useState<'ready' | 'loading' | 'done'>('ready')
  const [progress, setProgress] = useState(0)
  const qualified = QUALIFIED_BY_CAT[category] || []

  const startGenerate = () => {
    setPhase('loading')
    const interval = setInterval(() => {
      setProgress(p => { if (p >= 100) { clearInterval(interval); return 100 } return p + 4 })
    }, 60)
    setTimeout(() => setPhase('done'), 2000)
    setTimeout(() => nav('review-knockout'), 2800)
  }

  return (
    <div className="screen pb-8">
      <div className="header-gradient px-5 pt-12 pb-6">
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 4 }}>
          <div>
            <h1 style={{ fontFamily: 'var(--font-display)', color: 'white', fontSize: 20, fontWeight: 800, margin: 0 }}>
              Knockout Stage
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12, margin: 0 }}>
              {qualified.length} teams qualified · {category}
            </p>
          </div>
          <CategoryDropdown value={category} onChange={setCategory} />
        </div>
      </div>

      <div className="px-4 pt-4">
        <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: '#1A237E', fontSize: 15, marginBottom: 12 }}>
          Qualified Teams — {category}
        </h2>

        {qualified.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 24px', background: 'white', borderRadius: 20, marginBottom: 24 }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🏸</div>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, color: '#1A237E', fontSize: 18, marginBottom: 8 }}>
              No qualified teams
            </div>
            <div style={{ color: '#78909C', fontSize: 14 }}>Complete league matches to qualify teams.</div>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 24 }}>
            {qualified.map((q, i) => (
              <div key={i} className="card p-3" style={{ borderLeft: `3px solid ${q.rank === 1 ? '#F9A825' : '#78909C'}` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                  <div style={{
                    background: q.rank === 1 ? '#FFF8E1' : '#F0F4F8',
                    borderRadius: 6, padding: '2px 6px', fontSize: 10, fontWeight: 700,
                    color: q.rank === 1 ? '#F57F17' : '#78909C'
                  }}>
                    {q.rank === 1 ? '🥇 1st' : '🥈 2nd'}
                  </div>
                  <div style={{ background: '#E3F2FD', borderRadius: 6, padding: '2px 6px', fontSize: 10, fontWeight: 700, color: '#1565C0' }}>
                    Pool {q.pool}
                  </div>
                </div>
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: '#1A237E', fontSize: 12, lineHeight: 1.3 }}>
                  {q.name}
                </div>
              </div>
            ))}
          </div>
        )}

        {phase === 'ready' && (
          <button className="btn-primary" onClick={startGenerate} style={{ padding: '20px', fontSize: 18 }}>
            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
              <span style={{ fontSize: 24 }}>🏆</span> Generate Knockout Draw
            </span>
          </button>
        )}

        {phase === 'loading' && (
          <div style={{ background: 'linear-gradient(135deg, #0D1B4B, #1565C0)', borderRadius: 20, padding: 28, textAlign: 'center' }}>
            <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, margin: '0 auto 16px' }}>🏆</div>
            <h3 style={{ fontFamily: 'var(--font-display)', color: 'white', fontSize: 18, fontWeight: 800, marginBottom: 8 }}>Drawing the Bracket…</h3>
            <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: 13, marginBottom: 20 }}>Seeding {qualified.length} qualified teams</p>
            <div style={{ background: 'rgba(255,255,255,0.15)', borderRadius: 99, height: 8, overflow: 'hidden' }}>
              <div style={{ height: '100%', borderRadius: 99, background: 'linear-gradient(90deg, #4FC3F7, #00E5FF)', width: `${progress}%`, transition: 'width 0.1s ease' }} />
            </div>
            <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12, marginTop: 8 }}>{progress}%</div>
          </div>
        )}

        {phase === 'done' && (
          <div style={{ background: 'linear-gradient(135deg, #E0F2F1, #B2DFDB)', borderRadius: 20, padding: 28, textAlign: 'center' }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>✅</div>
            <h3 style={{ fontFamily: 'var(--font-display)', color: '#00695C', fontSize: 18, fontWeight: 800 }}>Bracket Ready!</h3>
          </div>
        )}
      </div>
    </div>
  )
}
