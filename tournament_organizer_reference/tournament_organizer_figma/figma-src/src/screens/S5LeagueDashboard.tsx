import { useState, useMemo } from 'react'
import type { ScreenProps } from '../App'
import {
  POOLS, TEAMS, LEAGUE_MATCHES, POOL_COLORS, CAT_POOLS,
  buildStandings, teamLabel, type Match, type Pool, type Team, type Category
} from '../data'
import CategoryDropdown from '../components/CategoryDropdown'

// ─── Add Pair Modal ──────────────────────────────────────────────────────────

interface AddPairModalProps {
  category: Category
  pools: Pool[]
  onClose: () => void
  onAdd: (team: Team, mode: 'existing' | 'new', poolId: string) => void
}

function AddPairModal({ category, pools, onClose, onAdd }: AddPairModalProps) {
  const [p1, setP1] = useState('')
  const [p1id, setP1id] = useState('')
  const [p2, setP2] = useState('')
  const [p2id, setP2id] = useState('')
  const [mode, setMode] = useState<'existing' | 'new'>('existing')
  const [selectedPool, setSelectedPool] = useState(pools[0]?.id || 'A')
  const [newPoolName, setNewPoolName] = useState(`Pool ${String.fromCharCode(65 + pools.length)}`)
  const [cat, setCat] = useState<Category>(category)

  const canSubmit = p1.trim() && p1id.trim() && p2.trim() && p2id.trim()

  const handle = () => {
    if (!canSubmit) return
    const newTeam: Team = {
      id: Date.now(), p1: p1.trim(), p1id: p1id.trim(),
      p2: p2.trim(), p2id: p2id.trim(), seeded: false, category: cat
    }
    onAdd(newTeam, mode, mode === 'existing' ? selectedPool : newPoolName.replace('Pool ', ''))
    onClose()
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 200,
      background: 'rgba(13,27,75,0.55)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'flex-end'
    }} onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div style={{
        width: '100%', maxWidth: 480, margin: '0 auto',
        background: 'white', borderRadius: '24px 24px 0 0',
        padding: '0 0 40px', maxHeight: '92dvh', overflowY: 'auto',
        animation: 'fadeInUp 0.25s ease'
      }}>
        {/* Handle */}
        <div style={{ padding: '12px', textAlign: 'center' }}>
          <div style={{ width: 40, height: 4, borderRadius: 2, background: '#DDE3EC', margin: '0 auto' }} />
        </div>

        {/* Title */}
        <div style={{ padding: '0 20px 20px', borderBottom: '1px solid #F0F4F8' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, color: '#1A237E', fontSize: 20, margin: 0 }}>
            Add Pair
          </h2>
          <p style={{ color: '#78909C', fontSize: 13, margin: '4px 0 0' }}>Register a new doubles pair</p>
        </div>

        <div style={{ padding: '20px' }}>
          {/* Player 1 */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: '#1A237E', fontSize: 13, display: 'block', marginBottom: 8 }}>
              Player 1
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              <input value={p1} onChange={e => setP1(e.target.value)}
                placeholder="Player Name" style={inputStyle} />
              <input value={p1id} onChange={e => setP1id(e.target.value)}
                placeholder="BD ID e.g. BD10400" style={inputStyle} />
            </div>
          </div>

          {/* Player 2 */}
          <div style={{ marginBottom: 20 }}>
            <label style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: '#1A237E', fontSize: 13, display: 'block', marginBottom: 8 }}>
              Player 2
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              <input value={p2} onChange={e => setP2(e.target.value)}
                placeholder="Player Name" style={inputStyle} />
              <input value={p2id} onChange={e => setP2id(e.target.value)}
                placeholder="BD ID e.g. BD10401" style={inputStyle} />
            </div>
          </div>

          {/* Category */}
          <div style={{ marginBottom: 20 }}>
            <label style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: '#1A237E', fontSize: 13, display: 'block', marginBottom: 8 }}>
              Category
            </label>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {(["Men's", "Women's", "Mixed", "50+"] as Category[]).map(c => (
                <button key={c} onClick={() => setCat(c)} style={{
                  padding: '7px 14px', borderRadius: 20, border: 'none', cursor: 'pointer',
                  fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 12,
                  background: cat === c ? '#1565C0' : '#F0F4F8',
                  color: cat === c ? 'white' : '#78909C',
                  transition: 'all 0.15s'
                }}>
                  {c}
                </button>
              ))}
            </div>
          </div>

          {/* Pool assignment */}
          <div style={{ marginBottom: 24 }}>
            <label style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: '#1A237E', fontSize: 13, display: 'block', marginBottom: 12 }}>
              Pool Assignment
            </label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {/* Existing pool option */}
              <label style={{
                display: 'flex', gap: 12, alignItems: 'flex-start',
                background: mode === 'existing' ? '#F0F7FF' : '#FAFAFA',
                border: `2px solid ${mode === 'existing' ? '#1565C0' : '#F0F4F8'}`,
                borderRadius: 12, padding: '12px 14px', cursor: 'pointer',
                transition: 'all 0.15s'
              }}>
                <input type="radio" checked={mode === 'existing'} onChange={() => setMode('existing')}
                  style={{ marginTop: 2, accentColor: '#1565C0' }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: '#1A237E', fontSize: 13, marginBottom: 8 }}>
                    Add to Existing Pool
                  </div>
                  {mode === 'existing' && (
                    <select value={selectedPool} onChange={e => setSelectedPool(e.target.value)}
                      style={{ ...inputStyle, marginBottom: 0 }}>
                      {pools.map(p => (
                        <option key={p.id} value={p.id}>{p.label} ({p.teams.length} teams)</option>
                      ))}
                    </select>
                  )}
                </div>
              </label>

              {/* New pool option */}
              <label style={{
                display: 'flex', gap: 12, alignItems: 'flex-start',
                background: mode === 'new' ? '#F0FBF9' : '#FAFAFA',
                border: `2px solid ${mode === 'new' ? '#00897B' : '#F0F4F8'}`,
                borderRadius: 12, padding: '12px 14px', cursor: 'pointer',
                transition: 'all 0.15s'
              }}>
                <input type="radio" checked={mode === 'new'} onChange={() => setMode('new')}
                  style={{ marginTop: 2, accentColor: '#00897B' }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: '#1A237E', fontSize: 13, marginBottom: 8 }}>
                    Create New Pool
                  </div>
                  {mode === 'new' && (
                    <input value={newPoolName} onChange={e => setNewPoolName(e.target.value)}
                      placeholder="Pool Name" style={{ ...inputStyle, marginBottom: 0 }} />
                  )}
                </div>
              </label>
            </div>
          </div>

          {/* Buttons */}
          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={onClose} className="btn-secondary" style={{ flex: 1 }}>Cancel</button>
            <button onClick={handle} className="btn-primary" style={{ flex: 2, opacity: canSubmit ? 1 : 0.5 }}
              disabled={!canSubmit}>
              + Add Pair
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '10px 12px', borderRadius: 10,
  border: '1.5px solid #E0E8F0', fontSize: 13,
  fontFamily: 'var(--font-body)', color: '#1A237E',
  background: '#FAFCFF', outline: 'none',
  boxSizing: 'border-box', marginBottom: 0,
}

// ─── Edit Match Modal ─────────────────────────────────────────────────────────

interface EditMatchModalProps {
  match: Match
  onClose: () => void
  onSave: (id: string, time: string, court: number, order: number) => void
}

function EditMatchModal({ match, onClose, onSave }: EditMatchModalProps) {
  const [time, setTime] = useState(match.time || '')
  const [court, setCourt] = useState(String(match.court))
  const [order, setOrder] = useState(String(match.orderOfPlay || ''))

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 200,
      background: 'rgba(13,27,75,0.55)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20
    }} onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div style={{
        width: '100%', maxWidth: 380, background: 'white',
        borderRadius: 20, overflow: 'hidden',
        boxShadow: '0 24px 64px rgba(13,27,75,0.25)',
        animation: 'fadeInUp 0.2s ease'
      }}>
        <div style={{
          background: 'linear-gradient(135deg, #1565C0, #1976D2)',
          padding: '16px 20px'
        }}>
          <h3 style={{ fontFamily: 'var(--font-display)', color: 'white', fontWeight: 800, fontSize: 16, margin: 0 }}>
            Edit Match {match.id}
          </h3>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12, margin: '4px 0 0' }}>
            {teamLabel(match.t1)} vs {teamLabel(match.t2)}
          </p>
        </div>
        <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: '#546E7A', fontSize: 12, display: 'block', marginBottom: 6 }}>
              ⏰ Match Time
            </label>
            <input type="time" value={time} onChange={e => setTime(e.target.value)} style={inputStyle} />
          </div>
          <div>
            <label style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: '#546E7A', fontSize: 12, display: 'block', marginBottom: 6 }}>
              🏟️ Court Number
            </label>
            <div style={{ display: 'flex', gap: 8 }}>
              {[1, 2, 3].map(c => (
                <button key={c} onClick={() => setCourt(String(c))} style={{
                  flex: 1, padding: '10px', borderRadius: 10, border: 'none',
                  fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16,
                  cursor: 'pointer', transition: 'all 0.15s',
                  background: court === String(c) ? '#1565C0' : '#F0F4F8',
                  color: court === String(c) ? 'white' : '#78909C',
                }}>
                  {c}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: '#546E7A', fontSize: 12, display: 'block', marginBottom: 6 }}>
              🔢 Order of Play
            </label>
            <input type="number" value={order} onChange={e => setOrder(e.target.value)}
              placeholder="e.g. 5" min="1" style={inputStyle} />
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
            <button onClick={onClose} className="btn-secondary" style={{ flex: 1, padding: '12px' }}>Cancel</button>
            <button onClick={() => { onSave(match.id, time, Number(court), Number(order)); onClose() }}
              className="btn-primary" style={{ flex: 2, padding: '12px' }}>
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Display Settings Panel ───────────────────────────────────────────────────

interface DisplaySettings { showTime: boolean; showCourt: boolean; showOrder: boolean }

interface SettingsPanelProps {
  settings: DisplaySettings
  onChange: (s: DisplaySettings) => void
  onClose: () => void
}

function SettingsPanel({ settings, onChange, onClose }: SettingsPanelProps) {
  const items: { key: keyof DisplaySettings; label: string; icon: string }[] = [
    { key: 'showTime', label: 'Match Time', icon: '⏰' },
    { key: 'showCourt', label: 'Court Number', icon: '🏟️' },
    { key: 'showOrder', label: 'Order of Play', icon: '🔢' },
  ]
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 200,
      background: 'rgba(13,27,75,0.5)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'flex-end'
    }} onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div style={{
        width: '100%', maxWidth: 480, margin: '0 auto',
        background: 'white', borderRadius: '24px 24px 0 0',
        padding: '20px 20px 40px', animation: 'fadeInUp 0.2s ease'
      }}>
        <div style={{ textAlign: 'center', marginBottom: 16 }}>
          <div style={{ width: 40, height: 4, borderRadius: 2, background: '#DDE3EC', margin: '0 auto 16px' }} />
          <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, color: '#1A237E', fontSize: 18, margin: 0 }}>
            Match Display Settings
          </h3>
          <p style={{ color: '#78909C', fontSize: 13, margin: '4px 0 0' }}>
            Control which fields are visible on match cards
          </p>
        </div>
        {items.map(item => (
          <div key={item.key} style={{
            display: 'flex', alignItems: 'center', gap: 14,
            padding: '14px 0', borderBottom: '1px solid #F0F4F8'
          }}>
            <div style={{
              width: 40, height: 40, borderRadius: 12,
              background: settings[item.key] ? '#E3F2FD' : '#F0F4F8',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20
            }}>
              {item.icon}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: '#1A237E', fontSize: 14 }}>
                {item.label}
              </div>
              <div style={{ color: '#90A4AE', fontSize: 12 }}>
                {settings[item.key] ? 'Visible on match cards' : 'Hidden from match cards'}
              </div>
            </div>
            {/* Toggle */}
            <button onClick={() => onChange({ ...settings, [item.key]: !settings[item.key] })}
              style={{
                width: 50, height: 28, borderRadius: 14, border: 'none',
                background: settings[item.key] ? '#1565C0' : '#CFD8DC',
                cursor: 'pointer', position: 'relative', transition: 'background 0.2s ease',
                flexShrink: 0
              }}>
              <div style={{
                width: 22, height: 22, borderRadius: '50%', background: 'white',
                position: 'absolute', top: 3,
                left: settings[item.key] ? 25 : 3,
                transition: 'left 0.2s ease',
                boxShadow: '0 2px 4px rgba(0,0,0,0.15)'
              }} />
            </button>
          </div>
        ))}
        <button className="btn-primary" style={{ marginTop: 20 }} onClick={onClose}>Done</button>
      </div>
    </div>
  )
}

// ─── Main League Dashboard ────────────────────────────────────────────────────

export default function S5LeagueDashboard({ nav, category, setCategory }: ScreenProps) {
  const [tab, setTab] = useState<'pools' | 'standings' | 'matches'>('pools')
  const [extraPools, setExtraPools] = useState<Pool[]>([])
  const [extraTeams, setExtraTeams] = useState<Team[]>([])
  const [extraMatches, setExtraMatches] = useState<Match[]>([])
  const [showAddPair, setShowAddPair] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [editMatch, setEditMatch] = useState<Match | null>(null)
  const [matchEdits, setMatchEdits] = useState<Record<string, Partial<Match>>>({})
  const [searchQ, setSearchQ] = useState('')
  const [displaySettings, setDisplaySettings] = useState<DisplaySettings>({
    showTime: true, showCourt: true, showOrder: true
  })

  const allTeams = [...TEAMS, ...extraTeams]
  const allPools = [...POOLS, ...extraPools]
  const allMatches = [...LEAGUE_MATCHES, ...extraMatches].map(m => ({
    ...m, ...(matchEdits[m.id] || {})
  }))

  const catPoolIds = useMemo(() => {
    const base = CAT_POOLS[category] || []
    const extra = extraPools.filter(p => p.category === category).map(p => p.id)
    return [...base, ...extra]
  }, [category, extraPools])

  const visiblePools = allPools.filter(p => catPoolIds.includes(p.id))

  const handleAddPair = (team: Team, mode: 'existing' | 'new', poolId: string) => {
    setExtraTeams(prev => [...prev, { ...team, category: team.category }])

    if (mode === 'existing') {
      setExtraPools(prev => prev.map(p => p.id === poolId
        ? { ...p, teams: [...p.teams, team.id] } : p))
      // Also update base pools if it's one
      const basePool = POOLS.find(p => p.id === poolId)
      if (basePool) {
        // generate new fixtures
        const newMatches: Match[] = basePool.teams.map((tid, i) => ({
          id: `EXTRA-${team.id}-${tid}`,
          poolId,
          court: ((i % 3) + 1) as 1 | 2 | 3,
          t1: team.id, t2: tid,
          status: 'Scheduled' as const,
          time: '14:00',
          orderOfPlay: 100 + i,
        }))
        setExtraMatches(prev => [...prev, ...newMatches])
      }
    } else {
      // new pool
      const newPool: Pool = {
        id: poolId, label: `Pool ${poolId}`,
        teams: [team.id], category: team.category
      }
      setExtraPools(prev => [...prev, newPool])
    }
  }

  const handleSaveEdit = (id: string, time: string, court: number, order: number) => {
    setMatchEdits(prev => ({
      ...prev, [id]: { ...prev[id], time, court, orderOfPlay: order }
    }))
  }

  // ── Pools Tab ──
  const PoolsTab = () => {
    const [active, setActive] = useState(visiblePools[0]?.id || 'A')
    const pool = visiblePools.find(p => p.id === active)

    if (!pool) return (
      <div style={{ textAlign: 'center', padding: '48px 0' }}>
        <div style={{ fontSize: 40, marginBottom: 12 }}>🏊</div>
        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, color: '#1A237E', fontSize: 18 }}>
          No pools for {category}
        </div>
      </div>
    )

    return (
      <div>
        <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 4, marginBottom: 16 }}>
          {visiblePools.map(p => (
            <button key={p.id} onClick={() => setActive(p.id)} style={{
              flexShrink: 0, padding: '8px 16px', borderRadius: 20, border: 'none',
              fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 13, cursor: 'pointer',
              background: active === p.id ? (POOL_COLORS[p.id] || '#1565C0') : 'white',
              color: active === p.id ? 'white' : '#78909C',
              boxShadow: active === p.id ? `0 4px 12px ${POOL_COLORS[p.id] || '#1565C0'}40` : '0 2px 6px rgba(0,0,0,0.06)'
            }}>
              {p.label}
            </button>
          ))}
        </div>
        <div className="card overflow-hidden">
          <div style={{ background: POOL_COLORS[pool.id] || '#1565C0', padding: '12px 16px' }}>
            <h3 style={{ fontFamily: 'var(--font-display)', color: 'white', fontWeight: 800, fontSize: 16, margin: 0 }}>
              {pool.label}
            </h3>
            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12, margin: 0 }}>
              {pool.teams.length} teams · League Round Robin
            </p>
          </div>
          {pool.teams.map((tid, i) => {
            const t = allTeams.find(x => x.id === tid)
            if (!t) return null
            return (
              <div key={tid} style={{
                display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px',
                borderBottom: i < pool.teams.length - 1 ? '1px solid #F0F4F8' : 'none'
              }}>
                <div style={{
                  width: 32, height: 32, borderRadius: 10,
                  background: t.seeded ? 'rgba(249,168,37,0.12)' : '#F0F4F8',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 800, fontSize: 13,
                  color: t.seeded ? '#F57F17' : '#90A4AE'
                }}>
                  {i + 1}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: '#1A237E', fontSize: 14 }}>
                    {t.p1} & {t.p2}
                  </div>
                  <div style={{ color: '#90A4AE', fontSize: 11 }}>
                    {t.p1id} · {t.p2id}
                  </div>
                </div>
                {t.seeded && <span className="badge-seed">SEED {t.seed}</span>}
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  // ── Standings Tab ──
  const StandingsTab = () => {
    const [active, setActive] = useState(visiblePools[0]?.id || 'A')
    const rows = buildStandings(active, allMatches, allPools)

    if (!visiblePools.length) return (
      <div style={{ textAlign: 'center', padding: '48px 0' }}>
        <div style={{ fontSize: 40, marginBottom: 12 }}>📊</div>
        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, color: '#1A237E', fontSize: 18 }}>
          No standings for {category}
        </div>
      </div>
    )

    return (
      <div>
        <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 4, marginBottom: 16 }}>
          {visiblePools.map(p => (
            <button key={p.id} onClick={() => setActive(p.id)} style={{
              flexShrink: 0, padding: '8px 16px', borderRadius: 20, border: 'none',
              fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 13, cursor: 'pointer',
              background: active === p.id ? (POOL_COLORS[p.id] || '#1565C0') : 'white',
              color: active === p.id ? 'white' : '#78909C',
              boxShadow: active === p.id ? `0 4px 12px ${POOL_COLORS[p.id] || '#1565C0'}40` : '0 2px 6px rgba(0,0,0,0.06)'
            }}>
              Pool {p.id}
            </button>
          ))}
        </div>
        <div className="card overflow-hidden">
          <div style={{ background: POOL_COLORS[active] || '#1565C0', padding: '10px 16px' }}>
            <h3 style={{ fontFamily: 'var(--font-display)', color: 'white', fontWeight: 800, fontSize: 15, margin: 0 }}>
              Pool {active} Standings
            </h3>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table className="standings-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th style={{ textAlign: 'left', minWidth: 120 }}>Players</th>
                  <th>P</th><th>W</th><th>L</th>
                  <th>PW</th><th>PL</th><th>+/-</th><th>LP</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r, i) => {
                  const t = allTeams.find(x => x.id === r.teamId)
                  if (!t) return null
                  const isQ = i < 2
                  return (
                    <tr key={r.teamId} style={{ background: isQ ? 'rgba(21,101,192,0.03)' : 'transparent' }}>
                      <td>
                        <div style={{
                          width: 22, height: 22, borderRadius: '50%',
                          background: isQ ? (i === 0 ? '#F9A825' : '#78909C') : '#F0F4F8',
                          color: isQ ? 'white' : '#90A4AE',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 11, fontWeight: 800, margin: '0 auto'
                        }}>
                          {i + 1}
                        </div>
                      </td>
                      <td style={{ textAlign: 'left', paddingLeft: 12 }}>
                        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: '#1A237E', fontSize: 12 }}>
                          {t.p1} & {t.p2}
                        </div>
                        <div style={{ fontSize: 10, color: '#90A4AE' }}>{t.p1id} · {t.p2id}</div>
                        {isQ && <div style={{ fontSize: 10, color: '#00897B', fontWeight: 600 }}>✓ Qualifies</div>}
                      </td>
                      <td style={{ fontWeight: 600 }}>{r.played}</td>
                      <td style={{ color: '#00897B', fontWeight: 700 }}>{r.won}</td>
                      <td style={{ color: '#F44336', fontWeight: 700 }}>{r.lost}</td>
                      <td>{r.ptWon}</td>
                      <td>{r.ptLost}</td>
                      <td style={{ color: r.diff > 0 ? '#00897B' : r.diff < 0 ? '#F44336' : '#78909C', fontWeight: 700 }}>
                        {r.diff > 0 ? '+' : ''}{r.diff}
                      </td>
                      <td>
                        <span style={{
                          background: isQ ? '#E3F2FD' : '#F0F4F8',
                          color: isQ ? '#1565C0' : '#90A4AE',
                          padding: '2px 8px', borderRadius: 10, fontWeight: 800, fontSize: 12
                        }}>
                          {r.lp}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    )
  }

  // ── Matches Tab ──
  const MatchesTab = () => {
    const catMatches = allMatches.filter(m => catPoolIds.includes(m.poolId))

    // Search filter
    const filtered = useMemo(() => {
      if (!searchQ.trim()) return catMatches
      const q = searchQ.toLowerCase()
      return catMatches.filter(m => {
        const t1 = allTeams.find(t => t.id === m.t1)
        const t2 = allTeams.find(t => t.id === m.t2)
        return [t1?.p1, t1?.p2, t1?.p1id, t1?.p2id, t2?.p1, t2?.p2, t2?.p1id, t2?.p2id]
          .some(s => s?.toLowerCase().includes(q))
      })
    }, [catMatches])

    const courts = [1, 2, 3]
    const [expandedCourt, setExpandedCourt] = useState<number>(1)

    return (
      <div>
        {/* Search + Settings row */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
          <div style={{
            flex: 1, display: 'flex', alignItems: 'center', gap: 8,
            background: 'white', borderRadius: 12, padding: '10px 14px',
            boxShadow: '0 2px 8px rgba(21,101,192,0.08)'
          }}>
            <span style={{ fontSize: 16 }}>🔍</span>
            <input
              value={searchQ}
              onChange={e => setSearchQ(e.target.value)}
              placeholder="Search by player name or ID..."
              style={{
                flex: 1, border: 'none', outline: 'none', fontSize: 13,
                fontFamily: 'var(--font-body)', color: '#1A237E', background: 'transparent'
              }}
            />
            {searchQ && (
              <button onClick={() => setSearchQ('')} style={{
                background: 'none', border: 'none', cursor: 'pointer',
                color: '#90A4AE', fontSize: 16, padding: 0
              }}>✕</button>
            )}
          </div>
          <button onClick={() => setShowSettings(true)} style={{
            width: 44, height: 44, borderRadius: 12, border: 'none',
            background: 'white', boxShadow: '0 2px 8px rgba(21,101,192,0.08)',
            cursor: 'pointer', fontSize: 18, flexShrink: 0
          }}>
            ⚙️
          </button>
        </div>

        {/* Display settings chips */}
        {(!displaySettings.showTime || !displaySettings.showCourt || !displaySettings.showOrder) && (
          <div style={{ display: 'flex', gap: 6, marginBottom: 12, flexWrap: 'wrap' }}>
            {!displaySettings.showTime && (
              <span style={{ background: '#FFF3E0', color: '#E65100', fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20 }}>
                ⏰ Time hidden
              </span>
            )}
            {!displaySettings.showCourt && (
              <span style={{ background: '#FFF3E0', color: '#E65100', fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20 }}>
                🏟️ Court hidden
              </span>
            )}
            {!displaySettings.showOrder && (
              <span style={{ background: '#FFF3E0', color: '#E65100', fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20 }}>
                🔢 Order hidden
              </span>
            )}
          </div>
        )}

        {searchQ && (
          <div style={{ marginBottom: 12, color: '#78909C', fontSize: 13 }}>
            <strong style={{ color: '#1A237E' }}>{filtered.length}</strong> result{filtered.length !== 1 ? 's' : ''} for "{searchQ}"
          </div>
        )}

        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px 0' }}>
            <div style={{ fontSize: 36, marginBottom: 8 }}>🔍</div>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: '#1A237E', fontSize: 16 }}>
              No matches found
            </div>
            <div style={{ color: '#90A4AE', fontSize: 13, marginTop: 4 }}>Try a different name or ID</div>
          </div>
        ) : searchQ ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {filtered.map(m => <MatchCard key={m.id} m={m} />)}
          </div>
        ) : (
          courts.map(court => {
            const courtMatches = filtered.filter(m => m.court === court)
            if (!courtMatches.length) return null
            const isOpen = expandedCourt === court
            return (
              <div key={court} style={{ marginBottom: 10 }}>
                {/* Accordion header */}
                <button
                  onClick={() => setExpandedCourt(isOpen ? -1 : court)}
                  style={{
                    width: '100%', display: 'flex', alignItems: 'center', gap: 12,
                    padding: '13px 16px', borderRadius: isOpen ? '16px 16px 0 0' : 16,
                    border: 'none', cursor: 'pointer', transition: 'all 0.15s ease',
                    background: isOpen ? 'linear-gradient(135deg, #1565C0, #1976D2)' : 'white',
                    boxShadow: isOpen ? '0 4px 16px rgba(21,101,192,0.25)' : '0 2px 8px rgba(21,101,192,0.07)',
                  }}
                >
                  {displaySettings.showCourt && (
                    <div style={{
                      width: 34, height: 34, borderRadius: 10, flexShrink: 0,
                      background: isOpen ? 'rgba(255,255,255,0.2)' : 'linear-gradient(135deg, #1565C0, #1976D2)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: 'white', fontWeight: 800, fontSize: 14
                    }}>
                      {court}
                    </div>
                  )}
                  <div style={{ flex: 1, textAlign: 'left' }}>
                    <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 15, color: isOpen ? 'white' : '#1A237E' }}>
                      {displaySettings.showCourt ? `Court ${court}` : `Group ${court}`}
                    </div>
                    <div style={{ fontSize: 12, color: isOpen ? 'rgba(255,255,255,0.7)' : '#90A4AE' }}>
                      {courtMatches.length} match{courtMatches.length !== 1 ? 'es' : ''}
                    </div>
                  </div>
                  <span style={{ fontSize: 18, color: isOpen ? 'white' : '#90A4AE', transition: 'transform 0.2s ease', display: 'inline-block', transform: isOpen ? 'rotate(180deg)' : 'none' }}>
                    ▾
                  </span>
                </button>

                {/* Accordion body */}
                {isOpen && (
                  <div style={{ background: '#F8FAFF', borderRadius: '0 0 16px 16px', padding: '10px 10px 10px', border: '1px solid #E3F2FD', borderTop: 'none', display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {courtMatches.map((m, idx) => <MatchCard key={m.id} m={m} localOrder={idx + 1} />)}
                  </div>
                )}
              </div>
            )
          })
        )}

        <div style={{ height: 24 }} />
        <div style={{
          background: 'linear-gradient(135deg, #E0F2F1, #B2DFDB)',
          borderRadius: 16, padding: '16px', textAlign: 'center', marginBottom: 8
        }}>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, color: '#00897B', fontSize: 16, marginBottom: 8 }}>
            Ready for Knockout?
          </div>
          <button className="btn-primary" onClick={() => nav('generate-knockout')}>
            Generate Knockout Draw →
          </button>
        </div>
      </div>
    )

    function MatchCard({ m, localOrder }: { m: Match; localOrder?: number }) {
      return (
        <div className={`match-card ${m.status.toLowerCase()}`}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontFamily: 'var(--font-display)', fontWeight: 600, color: '#78909C', fontSize: 11 }}>
                Pool {m.poolId} · {m.id}
              </span>
              {displaySettings.showOrder && (m.orderOfPlay || localOrder) && (
                <span style={{ background: '#F0F4F8', color: '#78909C', fontSize: 10, fontWeight: 700, padding: '2px 6px', borderRadius: 6 }}>
                  #{localOrder ?? m.orderOfPlay}
                </span>
              )}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              {displaySettings.showTime && m.time && (
                <span style={{ color: '#90A4AE', fontSize: 11, fontWeight: 600 }}>⏰ {m.time}</span>
              )}
              <span style={{
                fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20,
                background: m.status === 'Live' ? '#FFEBEE' : m.status === 'Completed' ? '#E0F2F1' : '#F0F4F8',
                color: m.status === 'Live' ? '#F44336' : m.status === 'Completed' ? '#00897B' : '#78909C'
              }}>
                {m.status === 'Live' ? '● LIVE' : m.status}
              </span>
              {/* Edit button */}
              <button onClick={() => setEditMatch(m)} style={{
                width: 28, height: 28, borderRadius: 8, border: 'none',
                background: '#F0F4F8', cursor: 'pointer', fontSize: 12,
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                ✏️
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ flex: 1, textAlign: 'center' }}>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, color: '#1A237E', fontSize: 13, lineHeight: 1.3 }}>
                {teamLabel(m.t1)}
              </div>
              {m.status === 'Live' && (
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 28, color: '#1565C0' }}>
                  {m.s1?.[0] ?? 0}
                </div>
              )}
            </div>
            <div style={{
              width: 32, height: 32, borderRadius: 10, background: '#F0F4F8',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: 'var(--font-display)', fontWeight: 900, color: '#90A4AE', fontSize: 11
            }}>
              VS
            </div>
            <div style={{ flex: 1, textAlign: 'center' }}>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, color: '#1A237E', fontSize: 13, lineHeight: 1.3 }}>
                {teamLabel(m.t2)}
              </div>
              {m.status === 'Live' && (
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 28, color: '#1A237E' }}>
                  {m.s2?.[0] ?? 0}
                </div>
              )}
            </div>
          </div>

          {m.status === 'Completed' && m.s1 && m.s2 && (
            <div style={{ textAlign: 'center', marginTop: 8, color: '#78909C', fontSize: 12 }}>
              {m.s1.join(', ')} — {m.s2.join(', ')}
            </div>
          )}
          {m.status === 'Scheduled' && (
            <button style={{
              marginTop: 10, width: '100%', padding: '10px',
              background: 'linear-gradient(135deg, #1565C0, #1976D2)',
              color: 'white', border: 'none', borderRadius: 10,
              fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 13, cursor: 'pointer'
            }} onClick={() => nav('finals')}>
              ▶ Start Match
            </button>
          )}
        </div>
      )
    }
  }

  return (
    <div className="screen pb-8">
      {/* Modals */}
      {showAddPair && (
        <AddPairModal
          category={category}
          pools={visiblePools}
          onClose={() => setShowAddPair(false)}
          onAdd={handleAddPair}
        />
      )}
      {showSettings && (
        <SettingsPanel
          settings={displaySettings}
          onChange={setDisplaySettings}
          onClose={() => setShowSettings(false)}
        />
      )}
      {editMatch && (
        <EditMatchModal
          match={editMatch}
          onClose={() => setEditMatch(null)}
          onSave={handleSaveEdit}
        />
      )}

      {/* Header */}
      <div className="header-gradient px-5 pt-12 pb-6">
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 4 }}>
          <div>
            <h1 style={{ fontFamily: 'var(--font-display)', color: 'white', fontSize: 20, fontWeight: 800, margin: 0 }}>
              League Dashboard
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12, margin: 0 }}>
              {visiblePools.length} pools · {category}
            </p>
          </div>
          <CategoryDropdown value={category} onChange={setCategory} />
        </div>

        <div style={{ marginTop: 16 }}>
          <div className="tab-bar">
            {(['pools', 'standings', 'matches'] as const).map(t => (
              <button key={t} className={`tab-btn ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>
                {t === 'pools' ? '🏊 Pools' : t === 'standings' ? '📊 Standings' : '🏸 Matches'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Add Pair FAB */}
      <button onClick={() => setShowAddPair(true)} style={{
        position: 'fixed', bottom: 24, right: 'max(16px, calc(50vw - 224px))',
        zIndex: 50, width: 52, height: 52, borderRadius: 16,
        background: 'linear-gradient(135deg, #00897B, #00695C)',
        border: 'none', cursor: 'pointer', fontSize: 24,
        boxShadow: '0 4px 20px rgba(0,137,123,0.45)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: 'white', fontWeight: 900,
        transition: 'transform 0.15s ease'
      }}
        title="Add Pair"
      >
        +
      </button>

      <div className="px-4 pt-4">
        {tab === 'pools'     && <PoolsTab />}
        {tab === 'standings' && <StandingsTab />}
        {tab === 'matches'   && <MatchesTab />}
      </div>
    </div>
  )
}
