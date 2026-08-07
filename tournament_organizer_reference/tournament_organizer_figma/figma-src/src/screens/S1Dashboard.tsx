import type { ScreenProps } from '../App'
import { TOURNAMENT, CAT_COLORS } from '../data'
import CategoryDropdown from '../components/CategoryDropdown'

const stats = [
  { label: 'Teams',      value: '42', icon: '👥', color: '#1565C0', bg: '#E3F2FD' },
  { label: 'Pools',      value: '8',  icon: '🏆', color: '#7B1FA2', bg: '#F3E5F5' },
  { label: 'Courts',     value: '3',  icon: '🏸', color: '#00897B', bg: '#E0F2F1' },
  { label: 'Categories', value: '4',  icon: '🎯', color: '#E65100', bg: '#FFF3E0' },
]

export default function S1Dashboard({ nav, category, setCategory }: ScreenProps) {
  const catStyle = CAT_COLORS[category]

  return (
    <div className="screen pb-8">
      {/* Header Banner */}
      <div className="header-gradient px-5 pt-12 pb-8 relative overflow-hidden">
        <div style={{ position: 'absolute', right: -40, top: -40, width: 180, height: 180, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.08)' }} />
        <div style={{ position: 'absolute', right: 10, top: 30, width: 100, height: 100, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.06)' }} />
        <div style={{ position: 'absolute', left: -30, bottom: -20, width: 120, height: 120, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.05)' }} />

        <div className="relative">
          {/* Top row: badge + dropdown */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              background: 'rgba(255,255,255,0.15)', borderRadius: 20, padding: '4px 12px'
            }}>
              <span style={{ fontSize: 14 }}>🏸</span>
              <span style={{ color: 'rgba(255,255,255,0.9)', fontSize: 12, fontWeight: 600, letterSpacing: 0.5 }}>
                BADMINTON TOURNAMENT
              </span>
            </div>
            <CategoryDropdown value={category} onChange={setCategory} />
          </div>

          <h1 style={{ fontFamily: 'var(--font-display)', color: 'white', fontSize: 24, fontWeight: 800, lineHeight: 1.2, marginBottom: 4 }}>
            {TOURNAMENT.name}
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13, marginBottom: 20 }}>
            Organised by <span style={{ color: 'white', fontWeight: 600 }}>{TOURNAMENT.organizer}</span>
          </p>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {[
              { icon: '📍', text: TOURNAMENT.venue },
              { icon: '📅', text: TOURNAMENT.date },
              { icon: '🕙', text: TOURNAMENT.time },
            ].map(pill => (
              <div key={pill.text} style={{
                display: 'flex', alignItems: 'center', gap: 5,
                background: 'rgba(255,255,255,0.12)', borderRadius: 20, padding: '6px 12px'
              }}>
                <span style={{ fontSize: 12 }}>{pill.icon}</span>
                <span style={{ color: 'white', fontSize: 12, fontWeight: 500 }}>{pill.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="px-4 -mt-4">
        {/* Active category badge */}
        <div style={{
          background: 'white', borderRadius: 16, padding: '12px 16px',
          boxShadow: '0 2px 12px rgba(21,101,192,0.1)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          marginBottom: 16
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#FF9800', boxShadow: '0 0 0 3px rgba(255,152,0,0.2)' }} />
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: '#37474F', fontSize: 14 }}>
              Status: <span style={{ color: '#F57C00' }}>Setup Pending</span>
            </span>
          </div>
          <span style={{ background: catStyle.bg, color: catStyle.text, fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 20 }}>
            {category}
          </span>
        </div>

        {/* Tournament Details */}
        <div className="card p-4 mb-4">
          <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: '#1A237E', fontSize: 15, marginBottom: 14 }}>
            Tournament Details
          </h2>
          {[
            { label: 'Format', value: TOURNAMENT.format },
            { label: 'Type', value: TOURNAMENT.type },
            { label: 'Courts', value: `${TOURNAMENT.courts} Courts` },
            { label: 'Knockout', value: TOURNAMENT.knockoutFrom },
            { label: 'Categories', value: TOURNAMENT.categories.join(', ') },
          ].map((row) => (
            <div key={row.label} style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              paddingBottom: 10, marginBottom: 10, borderBottom: '1px solid #F0F4F8'
            }}>
              <span style={{ color: '#78909C', fontSize: 13 }}>{row.label}</span>
              <span style={{ fontFamily: 'var(--font-display)', fontWeight: 600, color: '#1A237E', fontSize: 13 }}>
                {row.value}
              </span>
            </div>
          ))}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: '#78909C', fontSize: 13 }}>Venue</span>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 600, color: '#1A237E', fontSize: 13 }}>
              {TOURNAMENT.venue}
            </span>
          </div>
        </div>

        {/* Stats Grid */}
        <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: '#1A237E', fontSize: 15, marginBottom: 12 }}>
          Tournament Overview
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
          {stats.map(s => (
            <div key={s.label} style={{
              background: 'white', borderRadius: 16, padding: 16,
              boxShadow: '0 2px 12px rgba(21,101,192,0.08)',
              display: 'flex', alignItems: 'center', gap: 12
            }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>
                {s.icon}
              </div>
              <div>
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 24, color: s.color, lineHeight: 1 }}>
                  {s.value}
                </div>
                <div style={{ color: '#78909C', fontSize: 12, fontWeight: 500, marginTop: 2 }}>{s.label}</div>
              </div>
            </div>
          ))}
          <div style={{
            gridColumn: '1 / -1', background: 'white', borderRadius: 16, padding: 16,
            boxShadow: '0 2px 12px rgba(21,101,192,0.08)',
            display: 'flex', alignItems: 'center', gap: 12
          }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: '#FFF3E0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>⏳</div>
            <div>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 16, color: '#E65100', lineHeight: 1 }}>
                Setup Pending
              </div>
              <div style={{ color: '#78909C', fontSize: 12, fontWeight: 500, marginTop: 2 }}>Tournament Status</div>
            </div>
          </div>
        </div>

        <button className="btn-primary" onClick={() => nav('team-entry')}>
          <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            <span>👥</span> Enter Teams
          </span>
        </button>
      </div>
    </div>
  )
}
