import type { ScreenProps } from '../App'
import { TEAMS, CAT_COLORS } from '../data'
import CategoryDropdown from '../components/CategoryDropdown'

export default function S2TeamEntry({ nav, category, setCategory }: ScreenProps) {
  const filtered = TEAMS.filter(t => t.category === category)

  return (
    <div className="screen pb-28">
      {/* Header */}
      <div className="header-gradient px-5 pt-12 pb-6">
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 8 }}>
          <div>
            <h1 style={{ fontFamily: 'var(--font-display)', color: 'white', fontSize: 20, fontWeight: 800, margin: 0 }}>
              Team Entry
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12, margin: 0 }}>
              {filtered.length} pairs · {filtered.filter(t => t.seeded).length} seeded
            </p>
          </div>
          <CategoryDropdown value={category} onChange={setCategory} />
        </div>

        {/* Category pills */}
        <div style={{ display: 'flex', gap: 6, marginTop: 12, flexWrap: 'wrap' }}>
          {(["Men's", "Women's", 'Mixed', '50+'] as const).map(cat => (
            <button key={cat} onClick={() => setCategory(cat)} style={{
              background: cat === category ? 'white' : 'rgba(255,255,255,0.15)',
              color: cat === category ? '#1565C0' : 'white',
              borderRadius: 20, padding: '5px 14px', fontSize: 12, fontWeight: 700,
              fontFamily: 'var(--font-display)', cursor: 'pointer', border: 'none'
            }}>
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 pt-4">
        {filtered.length === 0 ? (
          <div style={{
            textAlign: 'center', padding: '48px 24px',
            background: 'white', borderRadius: 20,
            boxShadow: '0 2px 12px rgba(21,101,192,0.08)'
          }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🏸</div>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, color: '#1A237E', fontSize: 18, marginBottom: 8 }}>
              No teams yet
            </div>
            <div style={{ color: '#78909C', fontSize: 14 }}>
              No pairs registered for <strong>{category}</strong> category.
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {filtered.map((team, i) => {
              const catStyle = CAT_COLORS[team.category]
              return (
                <div key={team.id} className="card fade-in-up" style={{
                  animationDelay: `${Math.min(i * 40, 500)}ms`,
                  overflow: 'hidden', position: 'relative'
                }}>
                  {/* Seed top stripe */}
                  {team.seeded && (
                    <div style={{
                      position: 'absolute', top: 0, left: 0, right: 0, height: 3,
                      background: 'linear-gradient(90deg, #F9A825, #F57F17)'
                    }} />
                  )}

                  <div style={{ padding: '14px 16px' }}>
                    {/* Header row */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{
                          background: '#F0F4F8', color: '#78909C',
                          fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 6
                        }}>
                          #{i + 1}
                        </span>
                        <span style={{
                          background: catStyle.bg, color: catStyle.text,
                          fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 6
                        }}>
                          {team.category}
                        </span>
                      </div>
                      {team.seeded && <span className="badge-seed">⭐ SEED {team.seed}</span>}
                    </div>

                    {/* Players side by side */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: 8, alignItems: 'center' }}>
                      {/* Player 1 */}
                      <div style={{
                        background: '#F8FAFF', borderRadius: 12, padding: '12px',
                        border: '1px solid #E3F2FD'
                      }}>
                        <div style={{
                          fontFamily: 'var(--font-display)', fontWeight: 800,
                          color: '#1A237E', fontSize: 15, marginBottom: 4
                        }}>
                          {team.p1}
                        </div>
                        <div style={{
                          display: 'inline-flex', alignItems: 'center', gap: 4,
                          background: '#E3F2FD', borderRadius: 6, padding: '2px 8px'
                        }}>
                          <span style={{ color: '#90A4AE', fontSize: 10 }}>🪪</span>
                          <span style={{
                            fontFamily: 'var(--font-display)', fontWeight: 700,
                            color: '#1565C0', fontSize: 11, letterSpacing: 0.5
                          }}>
                            {team.p1id}
                          </span>
                        </div>
                      </div>

                      {/* Divider */}
                      <div style={{ textAlign: 'center' }}>
                        <div style={{
                          width: 28, height: 28, borderRadius: 8,
                          background: '#F0F4F8',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontFamily: 'var(--font-display)', fontWeight: 900,
                          color: '#90A4AE', fontSize: 10
                        }}>
                          &
                        </div>
                      </div>

                      {/* Player 2 */}
                      <div style={{
                        background: '#F8FBF8', borderRadius: 12, padding: '12px',
                        border: '1px solid #E0F2F1'
                      }}>
                        <div style={{
                          fontFamily: 'var(--font-display)', fontWeight: 800,
                          color: '#1A237E', fontSize: 15, marginBottom: 4
                        }}>
                          {team.p2}
                        </div>
                        <div style={{
                          display: 'inline-flex', alignItems: 'center', gap: 4,
                          background: '#E0F2F1', borderRadius: 6, padding: '2px 8px'
                        }}>
                          <span style={{ color: '#90A4AE', fontSize: 10 }}>🪪</span>
                          <span style={{
                            fontFamily: 'var(--font-display)', fontWeight: 700,
                            color: '#00897B', fontSize: 11, letterSpacing: 0.5
                          }}>
                            {team.p2id}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Bottom bar */}
      <div style={{
        position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)',
        width: '100%', maxWidth: 480,
        background: 'rgba(238,242,248,0.95)',
        backdropFilter: 'blur(12px)', padding: '16px 20px 28px',
        borderTop: '1px solid rgba(21,101,192,0.08)'
      }}>
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12
        }}>
          <span style={{ color: '#78909C', fontSize: 13 }}>
            <strong style={{ color: '#1A237E' }}>{filtered.length}</strong> teams · {category}
          </span>
          <span style={{ color: '#78909C', fontSize: 13 }}>
            <strong style={{ color: '#F9A825' }}>{filtered.filter(t => t.seeded).length}</strong> seeded
          </span>
        </div>
        <button className="btn-primary" onClick={() => nav('pool-generation')}>
          <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            <span>🏊</span> Generate Pools
          </span>
        </button>
      </div>
    </div>
  )
}
