import { useState, useMemo, useRef, useCallback } from 'react'
import type { ScreenProps } from '../App'
import type { Category } from '../data'
import CategoryDropdown from '../components/CategoryDropdown'

// ─── Types ────────────────────────────────────────────────────────────────────

type MS = 'Upcoming' | 'Live' | 'Completed' | 'Walkover' | 'Retired' | 'BYE'
interface P { name: string; pid: string }
interface KT { id: string; p1: P; p2: P; seed?: number; isBye: boolean }
interface KM {
  id: string; round: string; roundLabel: string
  matchNo: number; court: number; time: string; orderOfPlay: number
  teamA: KT | null; teamB: KT | null
  winner: 'A' | 'B' | null; status: MS
  scoreA: string; scoreB: string
  nextMatchId: string | null; nextMatchPosition: 'A' | 'B' | null
}

// ─── Constants ────────────────────────────────────────────────────────────────

const BYE: KT = { id: '__BYE__', p1: { name: 'BYE', pid: '—' }, p2: { name: '', pid: '' }, isBye: true }

const ROUND_META: Record<number, { code: string; label: string; short: string }> = {
  256: { code: 'Prelim', label: 'Preliminary',   short: 'Prelim' },
  128: { code: 'R128',   label: 'Round of 128',  short: 'R128'  },
  64:  { code: 'R64',    label: 'Round of 64',   short: 'R64'   },
  32:  { code: 'R32',    label: 'Round of 32',   short: 'R32'   },
  16:  { code: 'R16',    label: 'Round of 16',   short: 'R16'   },
  8:   { code: 'QF',     label: 'Quarter Finals', short: 'QF'   },
  4:   { code: 'SF',     label: 'Semi Finals',   short: 'SF'    },
  2:   { code: 'F',      label: 'Final',         short: 'Final' },
}

const ST: Record<MS, { bg: string; text: string; dot?: string }> = {
  Upcoming:  { bg: '#EEF2F8', text: '#546E7A' },
  Live:      { bg: '#FFEBEE', text: '#F44336', dot: '#F44336' },
  Completed: { bg: '#E0F2F1', text: '#00897B' },
  Walkover:  { bg: '#FFF3E0', text: '#E65100' },
  Retired:   { bg: '#FCE4EC', text: '#C62828' },
  BYE:       { bg: '#F3E5F5', text: '#7B1FA2' },
}

const ST_LABEL: Record<MS, string> = {
  Upcoming:'Upcoming', Live:'● LIVE', Completed:'✓ Done',
  Walkover:'Walkover', Retired:'Retired', BYE:'BYE',
}

// ─── Bracket Engine ───────────────────────────────────────────────────────────

function nextPow2(n: number): number {
  let p = 2
  while (p < n) p *= 2
  return p
}

function makeTeam(p1n: string, p1id: string, p2n: string, p2id: string, seed?: number): KT {
  return { id: `${p1id}-${p2id}`, p1: { name: p1n, pid: p1id }, p2: { name: p2n, pid: p2id }, seed, isBye: false }
}

function buildBracket(teams: KT[]): KM[] {
  if (!teams.length) return []
  const n = teams.length
  const p2 = nextPow2(Math.max(n, 2))
  // Place seeds at standard bracket positions, fill with non-seeds, then BYEs
  const seeds = [...teams.filter(t => t.seed)].sort((a, b) => (a.seed ?? 99) - (b.seed ?? 99))
  const others = teams.filter(t => !t.seed)

  // Create slot array (size p2): interleave to give seeds favorable positions
  const slots: KT[] = new Array(p2).fill(null)
  const seedPositions = [0, p2 - 1, Math.floor(p2 / 2), Math.floor(p2 / 2) - 1,
    Math.floor(p2 / 4), Math.floor(p2 * 3 / 4), Math.floor(p2 / 4) - 1, Math.floor(p2 * 3 / 4) - 1]
  seeds.forEach((s, i) => { if (seedPositions[i] !== undefined) slots[seedPositions[i]] = s })
  let oi = 0
  for (let i = 0; i < p2; i++) {
    if (!slots[i] && oi < others.length) slots[i] = others[oi++]
  }
  // Remaining empty slots → BYE
  for (let i = 0; i < p2; i++) {
    if (!slots[i]) slots[i] = { ...BYE, id: `BYE-${i}` }
  }

  const allMatches: KM[] = []
  const roundArrays: KM[][] = []
  let size = p2

  while (size >= 2) {
    const rm = ROUND_META[size] ?? { code: `R${size}`, label: `Round of ${size}`, short: `R${size}` }
    const count = size / 2
    const rnd: KM[] = []

    for (let mi = 0; mi < count; mi++) {
      const tA = roundArrays.length === 0 ? slots[mi * 2] : null
      const tB = roundArrays.length === 0 ? slots[mi * 2 + 1] : null
      const isByeA = tA?.isBye ?? false
      const isByeB = tB?.isBye ?? false
      const autoW: 'A' | 'B' | null = isByeA ? 'B' : isByeB ? 'A' : null
      const h = 9 + Math.floor((mi * 35) / 60)
      const m2 = (mi * 35) % 60
      const match: KM = {
        id: `${rm.code}-${mi + 1}`, round: rm.code, roundLabel: rm.label,
        matchNo: mi + 1, court: (mi % 3) + 1,
        time: `${String(h).padStart(2, '0')}:${String(m2).padStart(2, '0')} ${h < 12 ? 'AM' : 'PM'}`,
        orderOfPlay: mi + 1,
        teamA: tA, teamB: tB,
        winner: autoW, status: (isByeA || isByeB) ? 'BYE' : 'Upcoming',
        scoreA: '', scoreB: '',
        nextMatchId: null, nextMatchPosition: null,
      }
      rnd.push(match)
      allMatches.push(match)
    }
    roundArrays.push(rnd)
    size = Math.floor(size / 2)
  }

  // Wire next-round links
  for (let ri = 0; ri < roundArrays.length - 1; ri++) {
    roundArrays[ri].forEach((m, mi) => {
      m.nextMatchId = roundArrays[ri + 1][Math.floor(mi / 2)]?.id ?? null
      m.nextMatchPosition = mi % 2 === 0 ? 'A' : 'B'
    })
  }

  // Auto-propagate BYE winners
  for (let ri = 0; ri < roundArrays.length - 1; ri++) {
    roundArrays[ri].forEach(m => {
      if (m.winner !== null && m.nextMatchId) {
        const wt = m.winner === 'A' ? m.teamA : m.teamB
        const nm = allMatches.find(x => x.id === m.nextMatchId)
        if (nm && wt) {
          if (m.nextMatchPosition === 'A') nm.teamA = wt
          else nm.teamB = wt
          if (nm.teamA?.isBye) { nm.winner = 'B'; nm.status = 'BYE' }
          else if (nm.teamB?.isBye) { nm.winner = 'A'; nm.status = 'BYE' }
        }
      }
    })
  }

  return allMatches
}

// Mutate a bracket copy to apply a winner
function applyWinner(bracket: KM[], matchId: string, winner: 'A' | 'B', scoreA: string, scoreB: string, status: MS): KM[] {
  const b = bracket.map(m => ({ ...m }))
  const m = b.find(x => x.id === matchId)!
  m.winner = winner; m.scoreA = scoreA; m.scoreB = scoreB; m.status = status
  const wt = winner === 'A' ? m.teamA : m.teamB
  if (m.nextMatchId && wt) {
    const nm = b.find(x => x.id === m.nextMatchId)!
    if (m.nextMatchPosition === 'A') nm.teamA = wt
    else nm.teamB = wt
  }
  return b
}

// Replace a BYE slot with a new team
function applyAddTeam(bracket: KM[], matchId: string, pos: 'A' | 'B', newTeam: KT): KM[] {
  const b = bracket.map(m => ({ ...m }))
  const m = b.find(x => x.id === matchId)!
  if (pos === 'A') m.teamA = newTeam
  else m.teamB = newTeam
  m.winner = null
  m.status = 'Upcoming'
  // Clear auto-propagated team from next round
  if (m.nextMatchId) {
    const nm = b.find(x => x.id === m.nextMatchId)
    if (nm) {
      if (m.nextMatchPosition === 'A') nm.teamA = null
      else nm.teamB = null
      if (nm.status === 'BYE') nm.status = 'Upcoming'
      nm.winner = null
    }
  }
  return b
}

// ─── Demo Team Data ───────────────────────────────────────────────────────────

const CAT_TEAMS: Record<Category, KT[]> = {
  "Men's": [
    makeTeam('Rajesh',    'BD10231', 'Hari',       'BD10232', 1),
    makeTeam('Vignesh',   'BD10233', 'Manoj',      'BD10234', 2),
    makeTeam('Suresh',    'BD10235', 'Kiran',       'BD10236', 3),
    makeTeam('Deepak',    'BD10237', 'Anand',      'BD10238', 4),
    makeTeam('Jose',      'BD10249', 'Harsha',     'BD10250', 5),
    makeTeam('Arjun',     'BD10251', 'Srihari',    'BD10252', 6),
    makeTeam('Karthik',   'BD10253', 'Praveen',    'BD10254', 7),
    makeTeam('Surya',     'BD10255', 'Ajay',       'BD10256', 8),
    makeTeam('Raju',      'BD10247', 'Arul',       'BD10248'),
    makeTeam('Akash',     'BD10257', 'Dinesh',     'BD10258'),
    makeTeam('Bala',      'BD10259', 'Naveen',     'BD10260'),
    makeTeam('Rahul',     'BD10261', 'Vinoth',     'BD10262'),
    makeTeam('Muthu',     'BD10263', 'Selvam',     'BD10264'),
    makeTeam('Saravanan', 'BD10291', 'Ponraj',     'BD10292'),
    makeTeam('Anbu',      'BD10293', 'Selva',      'BD10294'),
    makeTeam('Thiagu',    'BD10295', 'Muthukumar', 'BD10296'),
  ],
  "Women's": [
    makeTeam('Priya',    'WD10101', 'Lakshmi',  'WD10102', 1),
    makeTeam('Kavitha',  'WD10103', 'Meena',    'WD10104', 2),
    makeTeam('Divya',    'WD10105', 'Shalini',  'WD10106', 3),
    makeTeam('Nithya',   'WD10107', 'Revathi',  'WD10108', 4),
    makeTeam('Geetha',   'WD10109', 'Anjali',   'WD10110'),
    makeTeam('Saranya',  'WD10111', 'Bhavani',  'WD10112'),
    makeTeam('Pooja',    'WD10113', 'Keerthana','WD10114'),
  ],
  'Mixed': [
    makeTeam('Ravi',    'BD10239', 'Sathish',   'BD10240', 1),
    makeTeam('Ganesh',  'BD10241', 'Murugan',   'BD10242', 2),
    makeTeam('Pandi',   'BD10265', 'Vel',       'BD10266', 3),
    makeTeam('Ramesh',  'BD10267', 'Kumaran',   'BD10268', 4),
    makeTeam('Sekar',   'BD10269', 'Bose',      'BD10270'),
    makeTeam('Nathan',  'BD10271', 'Kavin',     'BD10272'),
    makeTeam('Durai',   'BD10273', 'Prakash',   'BD10274'),
    makeTeam('Mani',    'BD10275', 'Shankar',   'BD10276'),
    makeTeam('Aravind', 'BD10277', 'Cheran',    'BD10278'),
    makeTeam('Babu',    'BD10279', 'Sundaram',  'BD10280'),
    makeTeam('Pandian', 'BD10297', 'Arumugam',  'BD10298'),
    makeTeam('Sathya',  'BD10299', 'Vasanth',   'BD10300'),
  ],
  '50+': [
    makeTeam('Pradeep',   'BD10243', 'Senthil',     'BD10244', 1),
    makeTeam('Arun',      'BD10245', 'Vijay',       'BD10246', 2),
    makeTeam('Gopal',     'BD10281', 'Siva',        'BD10282', 3),
    makeTeam('Sriram',    'BD10283', 'Balaji',      'BD10284', 4),
    makeTeam('Elavarasan','BD10285', 'Jegan',       'BD10286'),
    makeTeam('Vinay',     'BD10287', 'Mohan',       'BD10288'),
    makeTeam('Harish',    'BD10289', 'Nithish',     'BD10290'),
    makeTeam('Sendhil',   'BD10301', 'Logesh',      'BD10302'),
    makeTeam('Jeeva',     'BD10305', 'Tamilarasan', 'BD10306'),
    makeTeam('Mahesh',    'BD10311', 'Dineshkumar', 'BD10312'),
  ],
}

// Seed Men's bracket with some completed matches for demo
function seedMensResults(b: KM[]): KM[] {
  const completed: [string, 'A' | 'B', string, string][] = [
    ['R16-1','A','21-15, 21-11',''],
    ['R16-2','A','21-18, 21-16',''],
    ['R16-3','A','21-13, 21-9', ''],
    ['R16-4','A','21-17, 21-14',''],
    ['R16-5','B','19-21, 13-21',''],
    ['R16-6','A','21-19, 23-21',''],
    ['R16-7','A','21-8, 21-14', ''],
    ['R16-8','B','15-21, 17-21',''],
  ]
  let out = b
  for (const [id, w, sa, sb] of completed) {
    out = applyWinner(out, id, w, sa, sb, 'Completed')
  }
  // Mark QF-1 as Live
  out = out.map(m => m.id === 'QF-1' ? { ...m, status: 'Live' } : m)
  return out
}

// ─── Sub-components ───────────────────────────────────────────────────────────

// Round Selector
interface RoundSelectorProps {
  rounds: { code: string; label: string; short: string; matchCount: number; byeCount: number }[]
  active: string
  onSelect: (code: string) => void
}

function RoundSelector({ rounds, active, onSelect }: RoundSelectorProps) {
  const scrollRef = useRef<HTMLDivElement>(null)

  const scroll = (dir: -1 | 1) => {
    if (scrollRef.current) scrollRef.current.scrollBy({ left: dir * 160, behavior: 'smooth' })
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'white', borderRadius: 16, padding: '8px 10px', boxShadow: '0 2px 12px rgba(21,101,192,0.1)' }}>
      <button onClick={() => scroll(-1)} style={{ flexShrink: 0, width: 28, height: 28, borderRadius: 8, border: 'none', background: '#F0F4F8', cursor: 'pointer', fontSize: 14, color: '#78909C', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        ‹
      </button>
      <div ref={scrollRef} style={{ display: 'flex', gap: 6, overflowX: 'auto', scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch', flex: 1 }}>
        {rounds.map(r => {
          const isActive = r.code === active
          return (
            <button key={r.code} onClick={() => onSelect(r.code)} style={{
              flexShrink: 0, padding: '8px 12px', borderRadius: 10, border: 'none',
              cursor: 'pointer', transition: 'all 0.15s ease',
              background: isActive ? '#1565C0' : '#F0F4F8',
              boxShadow: isActive ? '0 4px 12px rgba(21,101,192,0.3)' : 'none',
            }}>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 12, color: isActive ? 'white' : '#546E7A', whiteSpace: 'nowrap' }}>
                {r.short}
              </div>
              <div style={{ fontSize: 10, color: isActive ? 'rgba(255,255,255,0.7)' : '#90A4AE', marginTop: 1 }}>
                {r.matchCount}M{r.byeCount > 0 ? ` · ${r.byeCount}BYE` : ''}
              </div>
            </button>
          )
        })}
      </div>
      <button onClick={() => scroll(1)} style={{ flexShrink: 0, width: 28, height: 28, borderRadius: 8, border: 'none', background: '#F0F4F8', cursor: 'pointer', fontSize: 14, color: '#78909C', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        ›
      </button>
    </div>
  )
}

// Edit Match Modal
interface EditModalProps {
  match: KM
  onClose: () => void
  onSave: (id: string, court: number, time: string, order: number) => void
}

function EditModal({ match, onClose, onSave }: EditModalProps) {
  const [court, setCourt] = useState(match.court)
  const [time, setTime] = useState(match.time.substring(0, 5))
  const [order, setOrder] = useState(match.orderOfPlay)

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 300, background: 'rgba(13,27,75,0.55)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ width: '100%', maxWidth: 380, background: 'white', borderRadius: 20, overflow: 'hidden', boxShadow: '0 24px 64px rgba(13,27,75,0.25)', animation: 'fadeInUp 0.2s ease' }}>
        <div style={{ background: 'linear-gradient(135deg, #1565C0, #1976D2)', padding: '16px 20px' }}>
          <h3 style={{ fontFamily: 'var(--font-display)', color: 'white', fontWeight: 800, fontSize: 16, margin: 0 }}>
            Edit Match {match.matchNo}
          </h3>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12, margin: '4px 0 0' }}>{match.roundLabel}</p>
        </div>
        <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: '#546E7A', fontSize: 12, display: 'block', marginBottom: 8 }}>🏟️ Court Number</label>
            <div style={{ display: 'flex', gap: 8 }}>
              {[1, 2, 3].map(c => (
                <button key={c} onClick={() => setCourt(c)} style={{ flex: 1, padding: '12px', borderRadius: 10, border: 'none', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 18, cursor: 'pointer', transition: 'all 0.15s', background: court === c ? '#1565C0' : '#F0F4F8', color: court === c ? 'white' : '#78909C' }}>
                  {c}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: '#546E7A', fontSize: 12, display: 'block', marginBottom: 8 }}>⏰ Match Time</label>
            <input type="time" value={time} onChange={e => setTime(e.target.value)} style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: '1.5px solid #E0E8F0', fontSize: 14, fontFamily: 'var(--font-body)', color: '#1A237E', boxSizing: 'border-box' }} />
          </div>
          <div>
            <label style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: '#546E7A', fontSize: 12, display: 'block', marginBottom: 8 }}>🔢 Order of Play</label>
            <input type="number" value={order} min={1} onChange={e => setOrder(Number(e.target.value))} style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: '1.5px solid #E0E8F0', fontSize: 14, fontFamily: 'var(--font-body)', color: '#1A237E', boxSizing: 'border-box' }} />
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={onClose} className="btn-secondary" style={{ flex: 1, padding: '12px' }}>Cancel</button>
            <button onClick={() => { onSave(match.id, court, time, order); onClose() }} className="btn-primary" style={{ flex: 2, padding: '12px' }}>Save Changes</button>
          </div>
        </div>
      </div>
    </div>
  )
}

// Declare Winner Modal
interface WinnerModalProps {
  match: KM
  onClose: () => void
  onDeclare: (id: string, winner: 'A' | 'B', scoreA: string, scoreB: string, status: MS) => void
}

function WinnerModal({ match, onClose, onDeclare }: WinnerModalProps) {
  const [selectedWinner, setSelectedWinner] = useState<'A' | 'B' | null>(null)
  const [scoreA, setScoreA] = useState('')
  const [scoreB, setScoreB] = useState('')
  const [status, setStatus] = useState<MS>('Completed')

  const nameA = match.teamA ? `${match.teamA.p1.name} & ${match.teamA.p2.name}` : 'TBD'
  const nameB = match.teamB ? `${match.teamB.p1.name} & ${match.teamB.p2.name}` : 'TBD'

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 300, background: 'rgba(13,27,75,0.55)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'flex-end' }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ width: '100%', maxWidth: 480, margin: '0 auto', background: 'white', borderRadius: '24px 24px 0 0', padding: '0 0 36px', animation: 'fadeInUp 0.2s ease' }}>
        <div style={{ padding: '12px', textAlign: 'center' }}>
          <div style={{ width: 40, height: 4, borderRadius: 2, background: '#DDE3EC', margin: '0 auto' }} />
        </div>
        <div style={{ padding: '4px 20px 20px', borderBottom: '1px solid #F0F4F8' }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, color: '#1A237E', fontSize: 18, margin: 0 }}>Declare Winner</h3>
          <p style={{ color: '#78909C', fontSize: 13, margin: '4px 0 0' }}>{match.roundLabel} · Match {match.matchNo}</p>
        </div>
        <div style={{ padding: 20 }}>
          {/* Winner selection */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: '#546E7A', fontSize: 12, marginBottom: 10 }}>SELECT WINNER</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {(['A', 'B'] as const).map(pos => {
                const team = pos === 'A' ? match.teamA : match.teamB
                const label = team ? `${team.p1.name} & ${team.p2.name}` : 'TBD'
                const isSelected = selectedWinner === pos
                return (
                  <button key={pos} onClick={() => setSelectedWinner(pos)} style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '14px', borderRadius: 12, border: `2px solid ${isSelected ? '#1565C0' : '#E0E8F0'}`,
                    background: isSelected ? '#E3F2FD' : 'white', cursor: 'pointer', transition: 'all 0.15s', width: '100%', textAlign: 'left'
                  }}>
                    <div style={{ width: 28, height: 28, borderRadius: '50%', background: isSelected ? '#1565C0' : '#F0F4F8', display: 'flex', alignItems: 'center', justifyContent: 'center', color: isSelected ? 'white' : '#90A4AE', fontWeight: 900, fontSize: 14, flexShrink: 0 }}>
                      {isSelected ? '✓' : pos}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: '#1A237E', fontSize: 14 }}>{label}</div>
                      {team?.seed && <div style={{ fontSize: 11, color: '#F9A825', fontWeight: 700 }}>⭐ Seed {team.seed}</div>}
                    </div>
                    {isSelected && <span style={{ color: '#1565C0', fontSize: 18 }}>🏆</span>}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Scores */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
            <div>
              <label style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: '#546E7A', fontSize: 11, display: 'block', marginBottom: 6 }}>
                {nameA.split(' & ')[0]} Score
              </label>
              <input value={scoreA} onChange={e => setScoreA(e.target.value)} placeholder="21-15, 21-18" style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: '1.5px solid #E0E8F0', fontSize: 12, boxSizing: 'border-box' }} />
            </div>
            <div>
              <label style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: '#546E7A', fontSize: 11, display: 'block', marginBottom: 6 }}>
                {nameB.split(' & ')[0]} Score
              </label>
              <input value={scoreB} onChange={e => setScoreB(e.target.value)} placeholder="15-21, 18-21" style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: '1.5px solid #E0E8F0', fontSize: 12, boxSizing: 'border-box' }} />
            </div>
          </div>

          {/* Result type */}
          <div style={{ display: 'flex', gap: 6, marginBottom: 20 }}>
            {(['Completed', 'Walkover', 'Retired'] as MS[]).map(s => (
              <button key={s} onClick={() => setStatus(s)} style={{
                flex: 1, padding: '8px 6px', borderRadius: 8, border: 'none',
                fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 11,
                cursor: 'pointer', transition: 'all 0.15s',
                background: status === s ? ST[s].bg : '#F0F4F8',
                color: status === s ? ST[s].text : '#78909C'
              }}>
                {s}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={onClose} className="btn-secondary" style={{ flex: 1, padding: '12px' }}>Cancel</button>
            <button onClick={() => { if (selectedWinner) { onDeclare(match.id, selectedWinner, scoreA, scoreB, status); onClose() } }}
              className="btn-primary" style={{ flex: 2, padding: '12px', opacity: selectedWinner ? 1 : 0.4 }} disabled={!selectedWinner}>
              🏆 Confirm Result
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// Add Team Modal
interface AddTeamModalProps {
  bracket: KM[]
  category: Category
  onClose: () => void
  onAdd: (matchId: string, pos: 'A' | 'B', team: KT) => void
}

function AddTeamModal({ bracket, category, onClose, onAdd }: AddTeamModalProps) {
  const byeMatches = bracket.filter(m => m.teamA?.isBye || m.teamB?.isBye)
  const byeRounds = [...new Set(byeMatches.map(m => m.round))]
  const [selRound, setSelRound] = useState(byeRounds[0] || '')
  const [selMatchId, setSelMatchId] = useState('')
  const [p1n, setP1n] = useState('')
  const [p1id, setP1id] = useState('')
  const [p2n, setP2n] = useState('')
  const [p2id, setP2id] = useState('')
  const [seed, setSeed] = useState('')

  const roundByeMatches = byeMatches.filter(m => m.round === selRound)
  const selMatch = bracket.find(m => m.id === selMatchId)
  const byePos: 'A' | 'B' | null = selMatch ? (selMatch.teamA?.isBye ? 'A' : selMatch.teamB?.isBye ? 'B' : null) : null
  const opponent = selMatch ? (byePos === 'A' ? selMatch.teamB : selMatch.teamA) : null

  const canSubmit = p1n && p1id && p2n && p2id && selMatchId && byePos

  const handle = () => {
    if (!canSubmit || !byePos) return
    const newTeam: KT = {
      id: `${p1id}-${p2id}`,
      p1: { name: p1n, pid: p1id },
      p2: { name: p2n, pid: p2id },
      seed: seed ? Number(seed) : undefined,
      isBye: false,
    }
    onAdd(selMatchId, byePos, newTeam)
    onClose()
  }

  const iStyle: React.CSSProperties = { width: '100%', padding: '10px 12px', borderRadius: 10, border: '1.5px solid #E0E8F0', fontSize: 13, fontFamily: 'var(--font-body)', color: '#1A237E', background: '#FAFCFF', boxSizing: 'border-box' }

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 300, background: 'rgba(13,27,75,0.55)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'flex-end' }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ width: '100%', maxWidth: 480, margin: '0 auto', background: 'white', borderRadius: '24px 24px 0 0', maxHeight: '92dvh', overflowY: 'auto', animation: 'fadeInUp 0.25s ease' }}>
        <div style={{ padding: '12px', textAlign: 'center' }}>
          <div style={{ width: 40, height: 4, borderRadius: 2, background: '#DDE3EC', margin: '0 auto' }} />
        </div>
        <div style={{ padding: '4px 20px 20px', borderBottom: '1px solid #F0F4F8' }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, color: '#1A237E', fontSize: 20, margin: 0 }}>Add Team to BYE Slot</h3>
          <p style={{ color: '#78909C', fontSize: 13, margin: '4px 0 0' }}>Category: <strong style={{ color: '#1565C0' }}>{category}</strong> · {byeMatches.length} vacant BYE positions</p>
        </div>

        <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: 18 }}>
          {/* Round selector */}
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: '#546E7A', fontSize: 12, marginBottom: 8 }}>SELECT ROUND WITH BYE</div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {byeRounds.map(r => {
                const cnt = byeMatches.filter(m => m.round === r).length
                const label = bracket.find(m => m.round === r)?.roundLabel || r
                return (
                  <button key={r} onClick={() => { setSelRound(r); setSelMatchId('') }} style={{
                    padding: '8px 14px', borderRadius: 10, border: 'none',
                    fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 12,
                    cursor: 'pointer', transition: 'all 0.15s',
                    background: selRound === r ? '#1565C0' : '#F0F4F8',
                    color: selRound === r ? 'white' : '#546E7A'
                  }}>
                    {label} <span style={{ opacity: 0.8 }}>({cnt})</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Match selector */}
          {selRound && (
            <div>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: '#546E7A', fontSize: 12, marginBottom: 8 }}>SELECT BYE POSITION</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {roundByeMatches.map(m => {
                  const bp = m.teamA?.isBye ? 'A' : 'B'
                  const opp = bp === 'A' ? m.teamB : m.teamA
                  const oppName = opp ? `${opp.p1.name} & ${opp.p2.name}` : 'TBD'
                  return (
                    <button key={m.id} onClick={() => setSelMatchId(m.id)} style={{
                      display: 'flex', alignItems: 'center', gap: 12,
                      padding: '12px 14px', borderRadius: 12,
                      border: `2px solid ${selMatchId === m.id ? '#1565C0' : '#E0E8F0'}`,
                      background: selMatchId === m.id ? '#E3F2FD' : 'white',
                      cursor: 'pointer', transition: 'all 0.15s', textAlign: 'left', width: '100%'
                    }}>
                      <div style={{ width: 32, height: 32, borderRadius: 8, background: '#F3E5F5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>🎯</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: '#1A237E', fontSize: 13 }}>Match {m.matchNo} · Court {m.court}</div>
                        <div style={{ color: '#78909C', fontSize: 12 }}>Opponent: <strong>{oppName}</strong></div>
                      </div>
                      {selMatchId === m.id && <span style={{ color: '#1565C0', fontSize: 16 }}>✓</span>}
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* Opponent info */}
          {opponent && (
            <div style={{ background: '#F0F7FF', borderRadius: 12, padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 20 }}>⚔️</span>
              <div>
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: '#1565C0', fontSize: 13 }}>
                  Will face: {opponent.p1.name} & {opponent.p2.name}
                </div>
                <div style={{ color: '#78909C', fontSize: 11 }}>{opponent.p1.pid} · {opponent.p2.pid}</div>
              </div>
            </div>
          )}

          {/* Player details */}
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: '#1A237E', fontSize: 13, marginBottom: 10 }}>Player 1</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              <input value={p1n} onChange={e => setP1n(e.target.value)} placeholder="Player Name" style={iStyle} />
              <input value={p1id} onChange={e => setP1id(e.target.value)} placeholder="BD ID" style={iStyle} />
            </div>
          </div>
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: '#1A237E', fontSize: 13, marginBottom: 10 }}>Player 2</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              <input value={p2n} onChange={e => setP2n(e.target.value)} placeholder="Player Name" style={iStyle} />
              <input value={p2id} onChange={e => setP2id(e.target.value)} placeholder="BD ID" style={iStyle} />
            </div>
          </div>
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: '#546E7A', fontSize: 12, marginBottom: 8 }}>SEED (OPTIONAL)</div>
            <input type="number" value={seed} onChange={e => setSeed(e.target.value)} placeholder="e.g. 9" style={{ ...iStyle, width: '100%' }} />
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={onClose} className="btn-secondary" style={{ flex: 1 }}>Cancel</button>
            <button onClick={handle} className="btn-primary" style={{ flex: 2, opacity: canSubmit ? 1 : 0.4 }} disabled={!canSubmit}>
              + Add Team
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// Match Card
interface MatchCardProps {
  match: KM
  onEdit: (m: KM) => void
  onDeclare: (m: KM) => void
  localOrder?: number
}

function MatchCard({ match: m, onEdit, onDeclare, localOrder }: MatchCardProps) {
  const st = ST[m.status]
  const isDone = m.status === 'Completed' || m.status === 'Walkover' || m.status === 'Retired' || m.status === 'BYE'

  const TeamSlot = ({ team, isWinner }: { team: KT | null; isWinner: boolean }) => {
    if (!team) return (
      <div style={{ flex: 1, textAlign: 'center', padding: '12px 8px', background: '#F8FAFF', borderRadius: 10, border: '1.5px dashed #B0BEC5' }}>
        <div style={{ color: '#B0BEC5', fontStyle: 'italic', fontSize: 13 }}>TBD</div>
      </div>
    )
    if (team.isBye) return (
      <div style={{ flex: 1, textAlign: 'center', padding: '12px 8px', background: '#F3E5F5', borderRadius: 10, border: '1.5px dashed #CE93D8' }}>
        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, color: '#7B1FA2', fontSize: 15 }}>BYE</div>
      </div>
    )
    return (
      <div style={{ flex: 1, padding: '12px 10px', background: isWinner ? '#E3F2FD' : 'white', borderRadius: 10, border: `1.5px solid ${isWinner ? '#1565C0' : '#EEF2F8'}`, position: 'relative' }}>
        {team.seed && (
          <div style={{ position: 'absolute', top: -8, left: 8 }}>
            <span className="badge-seed">⭐ S{team.seed}</span>
          </div>
        )}
        {isWinner && (
          <div style={{ position: 'absolute', top: -8, right: 8, background: '#1565C0', color: 'white', fontSize: 9, fontWeight: 700, padding: '2px 6px', borderRadius: 10 }}>
            WINNER
          </div>
        )}
        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, color: isWinner ? '#1565C0' : '#1A237E', fontSize: 14, lineHeight: 1.3, marginTop: team.seed ? 4 : 0 }}>
          {team.p1.name}
          <span style={{ color: '#90A4AE', fontWeight: 500 }}> & </span>
          {team.p2.name}
        </div>
        <div style={{ display: 'flex', gap: 4, marginTop: 4, flexWrap: 'wrap' }}>
          <span style={{ background: '#EEF2F8', color: '#78909C', fontSize: 10, padding: '1px 6px', borderRadius: 4, fontFamily: 'var(--font-display)', fontWeight: 600 }}>
            {team.p1.pid}
          </span>
          <span style={{ background: '#EEF2F8', color: '#78909C', fontSize: 10, padding: '1px 6px', borderRadius: 4, fontFamily: 'var(--font-display)', fontWeight: 600 }}>
            {team.p2.pid}
          </span>
        </div>
        {isDone && m.winner && (
          <div style={{ marginTop: 6, fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 16, color: isWinner ? '#1565C0' : '#90A4AE' }}>
            {isWinner ? m.scoreA || '—' : m.scoreB || '—'}
          </div>
        )}
      </div>
    )
  }

  return (
    <div style={{ background: 'white', borderRadius: 18, boxShadow: '0 2px 14px rgba(21,101,192,0.08)', overflow: 'hidden', marginBottom: 10 }}>
      {/* Match header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 16px', background: '#F8FAFF', borderBottom: '1px solid #F0F4F8' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 28, height: 28, borderRadius: 8, background: '#E3F2FD', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-display)', fontWeight: 900, color: '#1565C0', fontSize: 12 }}>
            {m.matchNo}
          </div>
          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            <span style={{ background: '#F0F4F8', color: '#546E7A', fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 6, fontFamily: 'var(--font-display)' }}>
              🏟️ C{m.court}
            </span>
            <span style={{ background: '#F0F4F8', color: '#546E7A', fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 6, fontFamily: 'var(--font-display)' }}>
              ⏰ {m.time}
            </span>
            <span style={{ background: '#F0F4F8', color: '#546E7A', fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 6 }}>
              #{localOrder ?? m.orderOfPlay}
            </span>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ background: st.bg, color: st.text, fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20 }}>
            {ST_LABEL[m.status]}
          </span>
          <button onClick={() => onEdit(m)} style={{ width: 28, height: 28, borderRadius: 8, border: 'none', background: '#F0F4F8', cursor: 'pointer', fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            ✏️
          </button>
        </div>
      </div>

      {/* Teams */}
      <div style={{ padding: '14px 14px 0' }}>
        <div style={{ display: 'flex', gap: 10, alignItems: 'stretch' }}>
          <TeamSlot team={m.teamA} isWinner={m.winner === 'A'} />
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4, flexShrink: 0 }}>
            <div style={{ width: 2, height: 20, background: '#EEF2F8', borderRadius: 1 }} />
            <div style={{ width: 32, height: 32, borderRadius: 10, background: '#F0F4F8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-display)', fontWeight: 900, color: '#B0BEC5', fontSize: 11 }}>VS</div>
            <div style={{ width: 2, height: 20, background: '#EEF2F8', borderRadius: 1 }} />
          </div>
          <TeamSlot team={m.teamB} isWinner={m.winner === 'B'} />
        </div>
      </div>

      {/* Actions */}
      <div style={{ padding: '12px 14px 14px' }}>
        {!isDone && m.teamA && m.teamB && !m.teamA.isBye && !m.teamB.isBye ? (
          <button onClick={() => onDeclare(m)} style={{ width: '100%', padding: '10px', background: m.status === 'Live' ? 'linear-gradient(135deg, #F44336, #E53935)' : 'linear-gradient(135deg, #1565C0, #1976D2)', color: 'white', border: 'none', borderRadius: 10, fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
            {m.status === 'Live' ? '🏸 End Match & Declare Winner' : '▶ Start & Declare Winner'}
          </button>
        ) : m.status === 'BYE' && m.winner ? (
          <div style={{ textAlign: 'center', padding: '6px', background: '#F3E5F5', borderRadius: 8 }}>
            <span style={{ color: '#7B1FA2', fontSize: 12, fontWeight: 700, fontFamily: 'var(--font-display)' }}>
              ✓ {m.winner === 'A' ? m.teamA?.p1.name : m.teamB?.p1.name} advances (BYE)
            </span>
          </div>
        ) : null}
      </div>
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function S8KnockoutDashboard({ nav, category, setCategory }: ScreenProps) {
  const initialBracket = useCallback((cat: Category) => {
    const teams = CAT_TEAMS[cat] || []
    const b = buildBracket(teams)
    if (cat === "Men's") return seedMensResults(b)
    return b
  }, [])

  const [bracket, setBracket] = useState<KM[]>(() => initialBracket(category))
  const [prevCat, setPrevCat] = useState<Category>(category)
  const [searchQ, setSearchQ] = useState('')
  const [statusFilter, setStatusFilter] = useState<MS | 'All'>('All')
  const [courtFilter, setCourtFilter] = useState<number | 'All'>('All')
  const [editingMatch, setEditingMatch] = useState<KM | null>(null)
  const [declaringMatch, setDeclaringMatch] = useState<KM | null>(null)
  const [showAddTeam, setShowAddTeam] = useState(false)
  const [expandedCourt, setExpandedCourt] = useState<number>(1)
  const stickyRef = useRef<HTMLDivElement>(null)

  // Category switch
  if (category !== prevCat) {
    setPrevCat(category)
    setBracket(initialBracket(category))
    setSearchQ('')
    setStatusFilter('All')
  }

  // Derive round list from bracket
  const rounds = useMemo(() => {
    const seen: Record<string, { code: string; label: string; short: string; matchCount: number; byeCount: number }> = {}
    bracket.forEach(m => {
      if (!seen[m.round]) seen[m.round] = { code: m.round, label: m.roundLabel, short: m.round, matchCount: 0, byeCount: 0 }
      seen[m.round].matchCount++
      if (m.status === 'BYE') seen[m.round].byeCount++
    })
    const order = ['Prelim','R128','R64','R32','R16','QF','SF','F']
    return Object.values(seen).sort((a, b) => order.indexOf(a.code) - order.indexOf(b.code))
  }, [bracket])

  const [selectedRound, setSelectedRound] = useState(() => rounds[0]?.code || 'R16')

  // Keep selected round valid
  const activeRound = rounds.find(r => r.code === selectedRound)?.code || rounds[0]?.code || 'R16'

  const byeMatchesInBracket = useMemo(() => bracket.filter(m => m.teamA?.isBye || m.teamB?.isBye), [bracket])

  // Filtered matches for current round
  const visibleMatches = useMemo(() => {
    return bracket.filter(m => {
      if (m.round !== activeRound) return false
      if (statusFilter !== 'All' && m.status !== statusFilter) return false
      if (courtFilter !== 'All' && m.court !== courtFilter) return false
      if (searchQ.trim()) {
        const q = searchQ.toLowerCase()
        const teams = [m.teamA, m.teamB].filter(Boolean) as KT[]
        const hits = teams.flatMap(t => [t.p1.name, t.p1.pid, t.p2.name, t.p2.pid])
        if (!hits.some(s => s.toLowerCase().includes(q))) return false
      }
      return true
    })
  }, [bracket, activeRound, statusFilter, courtFilter, searchQ])

  const courts = useMemo(() => [...new Set(visibleMatches.map(m => m.court))].sort(), [visibleMatches])

  const roundInfo = rounds.find(r => r.code === activeRound)

  const handleWinner = useCallback((id: string, winner: 'A' | 'B', scoreA: string, scoreB: string, status: MS) => {
    setBracket(prev => applyWinner(prev, id, winner, scoreA, scoreB, status))
  }, [])

  const handleEdit = useCallback((id: string, court: number, time: string, order: number) => {
    setBracket(prev => prev.map(m => m.id === id ? { ...m, court, time: `${time} ${Number(time.split(':')[0]) < 12 ? 'AM' : 'PM'}`, orderOfPlay: order } : m))
  }, [])

  const handleAddTeam = useCallback((matchId: string, pos: 'A' | 'B', team: KT) => {
    setBracket(prev => applyAddTeam(prev, matchId, pos, team))
  }, [])

  const totalMatches = rounds.reduce((s, r) => s + r.matchCount, 0)
  const completedMatches = bracket.filter(m => m.status === 'Completed' || m.status === 'BYE').length

  return (
    <div className="screen" style={{ paddingBottom: 24 }}>
      {/* Modals */}
      {editingMatch && <EditModal match={editingMatch} onClose={() => setEditingMatch(null)} onSave={handleEdit} />}
      {declaringMatch && <WinnerModal match={declaringMatch} onClose={() => setDeclaringMatch(null)} onDeclare={handleWinner} />}
      {showAddTeam && <AddTeamModal bracket={bracket} category={category} onClose={() => setShowAddTeam(false)} onAdd={handleAddTeam} />}

      {/* Header */}
      <div className="header-gradient px-5 pt-12 pb-5">
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
          <div>
            <h1 style={{ fontFamily: 'var(--font-display)', color: 'white', fontSize: 20, fontWeight: 800, margin: 0 }}>
              Knockout Dashboard
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12, margin: '2px 0 0' }}>
              {category} · {totalMatches} matches · {CAT_TEAMS[category]?.length ?? 0} teams
            </p>
          </div>
          <CategoryDropdown value={category} onChange={setCategory} />
        </div>

        {/* Progress bar */}
        <div style={{ background: 'rgba(255,255,255,0.12)', borderRadius: 99, height: 6, overflow: 'hidden', marginBottom: 6 }}>
          <div style={{ height: '100%', borderRadius: 99, background: 'linear-gradient(90deg,#4FC3F7,#00E5FF)', width: `${totalMatches > 0 ? Math.round((completedMatches / totalMatches) * 100) : 0}%`, transition: 'width 0.4s ease' }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: 11 }}>{completedMatches} of {totalMatches} matches done</span>
          <span style={{ color: 'white', fontSize: 11, fontWeight: 700 }}>{totalMatches > 0 ? Math.round((completedMatches / totalMatches) * 100) : 0}%</span>
        </div>
      </div>

      {/* Sticky control bar */}
      <div ref={stickyRef} style={{ position: 'sticky', top: 0, zIndex: 40, background: '#EEF2F8', padding: '10px 16px 8px', boxShadow: '0 2px 12px rgba(21,101,192,0.08)' }}>
        {/* Round selector */}
        <div style={{ marginBottom: 8 }}>
          <RoundSelector rounds={rounds} active={activeRound} onSelect={setSelectedRound} />
        </div>

        {/* Search + Add Team */}
        <div style={{ display: 'flex', gap: 8 }}>
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8, background: 'white', borderRadius: 12, padding: '9px 12px', boxShadow: '0 1px 6px rgba(21,101,192,0.07)' }}>
            <span style={{ fontSize: 15 }}>🔍</span>
            <input value={searchQ} onChange={e => setSearchQ(e.target.value)} placeholder="Player name or ID…" style={{ flex: 1, border: 'none', outline: 'none', fontSize: 13, fontFamily: 'var(--font-body)', color: '#1A237E', background: 'transparent' }} />
            {searchQ && <button onClick={() => setSearchQ('')} style={{ background: 'none', border: 'none', color: '#90A4AE', cursor: 'pointer', fontSize: 16, padding: 0 }}>✕</button>}
          </div>
          {byeMatchesInBracket.length > 0 && (
            <button onClick={() => setShowAddTeam(true)} style={{
              flexShrink: 0, padding: '9px 12px', borderRadius: 12,
              background: 'linear-gradient(135deg, #00897B, #00695C)',
              color: 'white', border: 'none', cursor: 'pointer',
              fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 12,
              boxShadow: '0 2px 10px rgba(0,137,123,0.35)', whiteSpace: 'nowrap'
            }}>
              + Add Team
              <span style={{ marginLeft: 4, background: 'rgba(255,255,255,0.25)', borderRadius: 10, padding: '0 5px', fontSize: 11 }}>
                {byeMatchesInBracket.length}
              </span>
            </button>
          )}
        </div>

        {/* Status + Court filters */}
        <div style={{ display: 'flex', gap: 6, marginTop: 8, overflowX: 'auto', paddingBottom: 2 }}>
          {(['All','Upcoming','Live','Completed','BYE'] as const).map(f => (
            <button key={f} onClick={() => setStatusFilter(f)} style={{
              flexShrink: 0, padding: '5px 12px', borderRadius: 20, border: 'none',
              fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 11,
              cursor: 'pointer', transition: 'all 0.15s',
              background: statusFilter === f ? '#1565C0' : 'white',
              color: statusFilter === f ? 'white' : '#78909C',
              boxShadow: statusFilter === f ? '0 2px 8px rgba(21,101,192,0.3)' : '0 1px 4px rgba(0,0,0,0.06)'
            }}>
              {f === 'Live' ? '● Live' : f}
            </button>
          ))}
          <div style={{ width: 1, height: 'auto', background: '#E0E8F0', flexShrink: 0, margin: '2px 0' }} />
          {([
            { v: 'All' as const, l: 'All Courts' },
            { v: 1, l: 'C1' }, { v: 2, l: 'C2' }, { v: 3, l: 'C3' }
          ]).map(f => (
            <button key={String(f.v)} onClick={() => setCourtFilter(f.v)} style={{
              flexShrink: 0, padding: '5px 12px', borderRadius: 20, border: 'none',
              fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 11,
              cursor: 'pointer', transition: 'all 0.15s',
              background: courtFilter === f.v ? '#00897B' : 'white',
              color: courtFilter === f.v ? 'white' : '#78909C',
              boxShadow: courtFilter === f.v ? '0 2px 8px rgba(0,137,123,0.3)' : '0 1px 4px rgba(0,0,0,0.06)'
            }}>
              {f.l}
            </button>
          ))}
        </div>
      </div>

      {/* Match list */}
      <div style={{ padding: '12px 16px' }}>
        {/* Round header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, color: '#1A237E', fontSize: 17, margin: 0 }}>
              {roundInfo?.label}
            </h2>
            <div style={{ color: '#78909C', fontSize: 12, marginTop: 2 }}>
              {visibleMatches.length} match{visibleMatches.length !== 1 ? 'es' : ''} shown
              {roundInfo && roundInfo.byeCount > 0 && (
                <span style={{ marginLeft: 8, background: '#F3E5F5', color: '#7B1FA2', fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 10 }}>
                  {roundInfo.byeCount} BYE
                </span>
              )}
            </div>
          </div>
          {searchQ && (
            <div style={{ background: '#E3F2FD', borderRadius: 10, padding: '4px 10px' }}>
              <span style={{ color: '#1565C0', fontSize: 12, fontWeight: 700 }}>{visibleMatches.length} results</span>
            </div>
          )}
        </div>

        {visibleMatches.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '56px 24px', background: 'white', borderRadius: 20 }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🔍</div>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, color: '#1A237E', fontSize: 17, marginBottom: 8 }}>No matches found</div>
            <div style={{ color: '#90A4AE', fontSize: 13 }}>Adjust your search or filters</div>
          </div>
        ) : searchQ ? (
          visibleMatches.map(m => (
            <MatchCard key={m.id} match={m} onEdit={setEditingMatch} onDeclare={setDeclaringMatch} />
          ))
        ) : (
          courts.map(court => {
            const courtMatches = visibleMatches.filter(m => m.court === court)
            const isOpen = expandedCourt === court
            return (
              <div key={court} style={{ marginBottom: 10 }}>
                {/* Accordion header */}
                <button
                  onClick={() => setExpandedCourt(isOpen ? -1 : court)}
                  style={{
                    width: '100%', display: 'flex', alignItems: 'center', gap: 12,
                    padding: '14px 16px', borderRadius: isOpen ? '16px 16px 0 0' : 16,
                    border: 'none', cursor: 'pointer', transition: 'all 0.15s ease',
                    background: isOpen ? 'linear-gradient(135deg, #1565C0, #1976D2)' : 'white',
                    boxShadow: isOpen ? '0 4px 16px rgba(21,101,192,0.25)' : '0 2px 8px rgba(21,101,192,0.07)',
                  }}
                >
                  <div style={{
                    width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                    background: isOpen ? 'rgba(255,255,255,0.2)' : 'linear-gradient(135deg, #1565C0, #1976D2)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'white', fontWeight: 900, fontSize: 16
                  }}>
                    {court}
                  </div>
                  <div style={{ flex: 1, textAlign: 'left' }}>
                    <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 15, color: isOpen ? 'white' : '#1A237E' }}>
                      Court {court}
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
                  <div style={{ background: '#F8FAFF', borderRadius: '0 0 16px 16px', padding: '12px 12px 12px', border: '1px solid #E3F2FD', borderTop: 'none' }}>
                    {courtMatches.map((m, idx) => (
                      <MatchCard key={m.id} match={m} onEdit={setEditingMatch} onDeclare={setDeclaringMatch} localOrder={idx + 1} />
                    ))}
                  </div>
                )}
              </div>
            )
          })
        )}

        {/* Go to Finals shortcut */}
        {activeRound === 'F' && (
          <div style={{ marginTop: 8 }}>
            <button className="btn-primary" onClick={() => nav('finals')} style={{ background: 'linear-gradient(135deg, #E65100, #FF6D00)', boxShadow: '0 4px 16px rgba(230,81,0,0.4)' }}>
              🏆 Open Final Live Scoring →
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
