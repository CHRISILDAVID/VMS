import { useState } from 'react'
import type { ScreenProps } from '../App'
import { POOLS, TEAMS, POOL_COLORS, CAT_POOLS } from '../data'
import CategoryDropdown from '../components/CategoryDropdown'

function teamName(id: number) {
  const t = TEAMS.find(t => t.id === id)
  return t ? `${t.p1} & ${t.p2}` : '—'
}

function isSeeded(id: number) {
  return TEAMS.find(t => t.id === id)?.seeded ?? false
}

export default function S4ReviewPools({ nav, category, setCategory }: ScreenProps) {
  const [shuffleKey, setShuffleKey] = useState(0)
  const catPoolIds = CAT_POOLS[category] || []
  const visiblePools = POOLS.filter(p => catPoolIds.includes(p.id))

  return (
    <div className="screen pb-28">
      <div className="header-gradient px-5 pt-12 pb-6">
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 4 }}>
          <div>
            <h1 style={{ fontFamily: 'var(--font-display)', color: 'white', fontSize: 20, fontWeight: 800, margin: 0 }}>
              Review Pools
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12, margin: 0 }}>
              {visiblePools.length} pools · {category}
            </p>
          </div>
          <CategoryDropdown value={category} onChange={setCategory} />
        </div>
        <div style={{ display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
          {visiblePools.map(p => (
            <div key={p.id} style={{
              background: 'rgba(255,255,255,0.15)', borderRadius: 20,
              padding: '4px 12px', fontSize: 12, fontWeight: 700, color: 'white',
              fontFamily: 'var(--font-display)'
            }}>
              {p.label}
            </div>
          ))}
        </div>
      </div>

      <div className="px-4 pt-4">
        {visiblePools.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px 24px', background: 'white', borderRadius: 20 }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🏊</div>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, color: '#1A237E', fontSize: 18, marginBottom: 8 }}>
              No pools for {category}
            </div>
            <div style={{ color: '#78909C', fontSize: 14 }}>Switch category or add teams first.</div>
          </div>
        ) : (
          <>
            <div style={{
              background: '#FFF3E0', borderRadius: 12, padding: '10px 14px',
              marginBottom: 16, display: 'flex', alignItems: 'center', gap: 10
            }}>
              <span style={{ fontSize: 18 }}>ℹ️</span>
              <span style={{ color: '#E65100', fontSize: 12, fontWeight: 500 }}>
                Pools are auto-generated. Manual editing is not allowed to ensure fair play.
              </span>
            </div>

            <div key={shuffleKey} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {visiblePools.map((pool, pi) => {
                const color = POOL_COLORS[pool.id] || '#1565C0'
                return (
                  <div key={pool.id} className="card overflow-hidden fade-in-up" style={{ animationDelay: `${pi * 60}ms` }}>
                    <div style={{ background: color, padding: '10px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{
                          width: 32, height: 32, borderRadius: 10,
                          background: 'rgba(255,255,255,0.2)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontFamily: 'var(--font-display)', fontWeight: 900, color: 'white', fontSize: 16
                        }}>
                          {pool.id}
                        </div>
                        <div>
                          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, color: 'white', fontSize: 15 }}>
                            {pool.label}
                          </div>
                          <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 11 }}>{pool.teams.length} teams</div>
                        </div>
                      </div>
                      <div style={{ background: 'rgba(255,255,255,0.2)', borderRadius: 20, padding: '4px 10px', fontSize: 11, color: 'white', fontWeight: 600 }}>
                        League Round
                      </div>
                    </div>
                    <div style={{ padding: '8px 0' }}>
                      {pool.teams.map((tid, ti) => {
                        const seeded = isSeeded(tid)
                        const t = TEAMS.find(x => x.id === tid)
                        return (
                          <div key={tid} style={{
                            display: 'flex', alignItems: 'center', gap: 10, padding: '10px 16px',
                            borderBottom: ti < pool.teams.length - 1 ? '1px solid #F0F4F8' : 'none',
                            background: seeded ? 'rgba(249,168,37,0.04)' : 'transparent'
                          }}>
                            <div style={{
                              width: 26, height: 26, borderRadius: 8,
                              background: seeded ? 'rgba(249,168,37,0.15)' : '#F0F4F8',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              fontSize: 11, fontWeight: 700,
                              color: seeded ? '#F57F17' : '#90A4AE'
                            }}>
                              {ti + 1}
                            </div>
                            <div style={{ flex: 1 }}>
                              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, color: '#1A237E', fontSize: 13 }}>
                                {teamName(tid)}
                              </div>
                              {t && (
                                <div style={{ color: '#90A4AE', fontSize: 11 }}>{t.p1id} · {t.p2id}</div>
                              )}
                            </div>
                            {seeded && (
                              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                <span style={{ fontSize: 12 }}>⭐</span>
                                <span className="badge-seed">SEED {TEAMS.find(t => t.id === tid)?.seed}</span>
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )
              })}
            </div>
          </>
        )}
      </div>

      <div style={{
        position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)',
        width: '100%', maxWidth: 480,
        background: 'rgba(238,242,248,0.95)',
        backdropFilter: 'blur(12px)', padding: '16px 20px 28px',
        borderTop: '1px solid rgba(21,101,192,0.08)'
      }}>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn-secondary" style={{ flex: 1 }} onClick={() => setShuffleKey(k => k + 1)}>
            🔀 Shuffle
          </button>
          <button className="btn-primary" style={{ flex: 2 }} onClick={() => nav('league')}>
            ✓ Confirm Pools
          </button>
        </div>
      </div>
    </div>
  )
}
