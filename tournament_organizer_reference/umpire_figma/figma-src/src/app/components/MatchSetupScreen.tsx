import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, CheckCircle2 } from 'lucide-react';

export interface MatchConfig {
  teamASide: 'left' | 'right';
  pointsPerGame: 15 | 21 | 30;
  numSets: 1 | 3;
}

interface MatchSetupScreenProps {
  teamAName: string;
  teamBName: string;
  onBack: () => void;
  onContinue: (config: MatchConfig) => void;
}

const PTS_OPTIONS: Array<15 | 21 | 30> = [15, 21, 30];
const SET_OPTIONS: Array<{ value: 1 | 3; label: string }> = [
  { value: 1, label: 'Best of 1' },
  { value: 3, label: 'Best of 3' },
];

function MiniCourt({
  teamASide,
  teamAName,
  teamBName,
}: {
  teamASide: 'left' | 'right';
  teamAName: string;
  teamBName: string;
}) {
  const aOnLeft = teamASide === 'left';
  const leftName = aOnLeft ? teamAName : teamBName;
  const rightName = aOnLeft ? teamBName : teamAName;
  const leftColor = aOnLeft ? '#3B82F6' : '#7C3AED';
  const rightColor = aOnLeft ? '#7C3AED' : '#3B82F6';

  return (
    <svg viewBox="0 0 220 110" style={{ width: '100%', height: '100%', display: 'block' }}>
      <defs>
        <linearGradient id="mcCourtGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0D2645" />
          <stop offset="100%" stopColor="#0B1F3A" />
        </linearGradient>
      </defs>
      <rect x="0" y="0" width="220" height="110" fill="#080F1E" rx="6" />
      <rect x="12" y="10" width="196" height="90" fill="url(#mcCourtGrad)" rx="3" />
      <rect x="12" y="10" width="196" height="90" fill="none" stroke="rgba(148,163,184,0.45)" strokeWidth="1.2" rx="3" />
      <line x1="12" y1="23" x2="208" y2="23" stroke="rgba(148,163,184,0.25)" strokeWidth="0.8" />
      <line x1="12" y1="87" x2="208" y2="87" stroke="rgba(148,163,184,0.25)" strokeWidth="0.8" />
      <line x1="68" y1="23" x2="68" y2="87" stroke="rgba(148,163,184,0.4)" strokeWidth="0.8" />
      <line x1="152" y1="23" x2="152" y2="87" stroke="rgba(148,163,184,0.4)" strokeWidth="0.8" />
      <line x1="28" y1="55" x2="68" y2="55" stroke="rgba(148,163,184,0.4)" strokeWidth="0.8" />
      <line x1="152" y1="55" x2="192" y2="55" stroke="rgba(148,163,184,0.4)" strokeWidth="0.8" />
      <line x1="28" y1="23" x2="28" y2="87" stroke="rgba(148,163,184,0.3)" strokeWidth="0.8" />
      <line x1="192" y1="23" x2="192" y2="87" stroke="rgba(148,163,184,0.3)" strokeWidth="0.8" />
      <rect x="108" y="10" width="4" height="90" fill="rgba(0,0,0,0.3)" />
      <line x1="110" y1="10" x2="110" y2="100" stroke="#94A3B8" strokeWidth="2" />
      {[0, 1, 2, 3, 4, 5].map(i => (
        <line key={i} x1="109" y1={18 + i * 14} x2="111" y2={18 + i * 14} stroke="rgba(148,163,184,0.35)" strokeWidth="0.8" />
      ))}
      <rect x="13" y="11" width="96" height="88" fill={leftColor} fillOpacity="0.08" rx="2" />
      <rect x="111" y="11" width="96" height="88" fill={rightColor} fillOpacity="0.08" rx="2" />
      <text x="62" y="6" textAnchor="middle" fontSize="7" fill={leftColor} fontFamily="Inter, sans-serif" fontWeight="700" letterSpacing="0.5">
        {leftName.split('/')[0].trim().toUpperCase()}
      </text>
      <text x="158" y="6" textAnchor="middle" fontSize="7" fill={rightColor} fontFamily="Inter, sans-serif" fontWeight="700" letterSpacing="0.5">
        {rightName.split('/')[0].trim().toUpperCase()}
      </text>
      <circle cx="55" cy="38" r="8" fill={leftColor} fillOpacity="0.9" />
      <text x="55" y="41" textAnchor="middle" fontSize="7" fill="#fff" fontWeight="700" fontFamily="Inter, sans-serif">{leftName.split(' ')[0][0]}</text>
      <circle cx="55" cy="72" r="8" fill={leftColor} fillOpacity="0.9" />
      <text x="55" y="75" textAnchor="middle" fontSize="7" fill="#fff" fontWeight="700" fontFamily="Inter, sans-serif">{leftName.split(' ')[0][0]}</text>
      <circle cx="165" cy="38" r="8" fill={rightColor} fillOpacity="0.9" />
      <text x="165" y="41" textAnchor="middle" fontSize="7" fill="#fff" fontWeight="700" fontFamily="Inter, sans-serif">{rightName.split(' ')[0][0]}</text>
      <circle cx="165" cy="72" r="8" fill={rightColor} fillOpacity="0.9" />
      <text x="165" y="75" textAnchor="middle" fontSize="7" fill="#fff" fontWeight="700" fontFamily="Inter, sans-serif">{rightName.split(' ')[0][0]}</text>
      <text x="62" y="107" textAnchor="middle" fontSize="6" fill="rgba(148,163,184,0.5)" fontFamily="Inter, sans-serif">LEFT</text>
      <text x="158" y="107" textAnchor="middle" fontSize="6" fill="rgba(148,163,184,0.5)" fontFamily="Inter, sans-serif">RIGHT</text>
    </svg>
  );
}

export function MatchSetupScreen({ teamAName, teamBName, onBack, onContinue }: MatchSetupScreenProps) {
  const [teamASide, setTeamASide] = useState<'left' | 'right'>('left');
  const [pointsPerGame, setPointsPerGame] = useState<15 | 21 | 30>(21);
  const [numSets, setNumSets] = useState<1 | 3>(3);

  const teamBSide = teamASide === 'left' ? 'right' : 'left';
  const halfPoint = pointsPerGame === 15 ? 8 : pointsPerGame === 21 ? 11 : 15;

  return (
    <div className="mss-wrapper size-full flex flex-col" style={{ background: '#0F172A', fontFamily: 'Inter, sans-serif', overflow: 'hidden' }}>

      {/* ── Scoped landscape-compact overrides ────────────────────────────────
          Only active when height ≤ 450 px in landscape — i.e. mobile phones.
          Desktop (tall) and portrait (blocked) are never affected.
      ──────────────────────────────────────────────────────────────────────── */}
      <style>{`
        @media screen and (max-height: 450px) and (orientation: landscape) {
          .mss-topbar        { height: 36px !important; }
          .mss-content       { padding: 6px 16px !important; gap: 12px !important; }
          .mss-left-panel    { gap: 6px !important; }
          .mss-right-panel   { gap: 6px !important; }
          .mss-court-wrap    { height: 82px !important; }
          .mss-section-hdr   { padding-bottom: 2px !important; margin-bottom: 0 !important; font-size: 8px !important; }
          .mss-field-label   { font-size: 8px !important; margin-bottom: 3px !important; }
          .mss-pts-btn       { height: 36px !important; font-size: 14px !important; }
          .mss-sets-btn      { height: 32px !important; font-size: 11px !important; }
          .mss-side-btn      { height: 36px !important; }
          .mss-summary-card  { padding: 6px 10px !important; }
          .mss-summary-row   { margin-bottom: 4px !important; }
          .mss-summary-lbl   { font-size: 8px !important; }
          .mss-summary-val   { font-size: 8px !important; }
          .mss-auto-row      { padding: 5px 10px !important; }
          .mss-cta-btn       { height: 38px !important; font-size: 12px !important; }
          .mss-side-lbl      { font-size: 8px !important; margin-bottom: 3px !important; }
        }
      `}</style>

      {/* Top bar */}
      <div
        className="mss-topbar flex items-center gap-3 px-5"
        style={{ background: '#0B1F3A', borderBottom: '1px solid #1E3A5F', height: 44, flexShrink: 0 }}
      >
        <button
          onClick={onBack}
          style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#64748B', background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600, fontFamily: 'Inter, sans-serif' }}
        >
          <ChevronLeft size={14} /> Back
        </button>

        <div style={{ color: '#334155', fontSize: 12 }}>|</div>

        <div>
          <div style={{ color: '#fff', fontSize: 11, fontWeight: 700 }}>Match Setup</div>
          <div style={{ color: '#64748B', fontSize: 9, fontWeight: 600, letterSpacing: '0.08em' }}>CONFIGURE BEFORE START</div>
        </div>

        <div
          style={{ marginLeft: 'auto', background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.25)', borderRadius: 6, padding: '3px 10px', color: '#22C55E', fontSize: 9, fontWeight: 700, letterSpacing: '0.08em' }}
        >
          STEP 2 OF 4
        </div>
      </div>

      {/* Main content */}
      <div className="mss-content flex flex-1 gap-4 px-5 py-3" style={{ overflow: 'hidden' }}>

        {/* LEFT PANEL: Court Side Selection */}
        <div className="mss-left-panel flex flex-col gap-3" style={{ width: '44%', flexShrink: 0 }}>

          <div className="mss-section-hdr" style={{ color: '#94A3B8', fontSize: 9, fontWeight: 700, letterSpacing: '0.12em', borderBottom: '1px solid #1E293B', paddingBottom: 4 }}>
            COURT SIDE SELECTION
          </div>

          {/* Mini court */}
          <div className="mss-court-wrap" style={{ height: 110, borderRadius: 8, overflow: 'hidden', border: '1px solid #334155' }}>
            <MiniCourt teamASide={teamASide} teamAName={teamAName} teamBName={teamBName} />
          </div>

          {/* Team A side buttons */}
          <div>
            <div className="mss-side-lbl" style={{ color: '#64748B', fontSize: 9, fontWeight: 600, marginBottom: 6 }}>Team A Starting Side</div>
            <div className="flex gap-2">
              {(['left', 'right'] as const).map(side => (
                <button
                  key={side}
                  className="mss-side-btn"
                  onClick={() => setTeamASide(side)}
                  style={{
                    flex: 1, height: 46, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2,
                    background: teamASide === side ? 'rgba(59,130,246,0.18)' : '#1E293B',
                    border: `2px solid ${teamASide === side ? '#3B82F6' : '#334155'}`,
                    borderRadius: 8, cursor: 'pointer', transition: 'all 0.15s',
                    boxShadow: teamASide === side ? '0 0 14px rgba(59,130,246,0.3)' : 'none',
                  }}
                >
                  <span style={{ color: teamASide === side ? '#3B82F6' : '#64748B', fontSize: 11, fontWeight: 900, fontFamily: 'Inter, sans-serif' }}>
                    {side === 'left' ? '◄ LEFT SIDE' : 'RIGHT SIDE ►'}
                  </span>
                  {teamASide === side && (
                    <span style={{ color: '#86EFAC', fontSize: 8, fontWeight: 700, letterSpacing: '0.06em' }}>SELECTED</span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Team B auto-assigned */}
          <div
            className="mss-auto-row"
            style={{ background: 'rgba(30,41,59,0.6)', border: '1px solid #1E293B', borderRadius: 8, padding: '8px 12px', display: 'flex', alignItems: 'center', gap: 8 }}
          >
            <div style={{ width: 20, height: 20, borderRadius: 4, background: 'rgba(124,58,237,0.2)', border: '1px solid rgba(124,58,237,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#A78BFA', fontSize: 9, fontWeight: 800, flexShrink: 0 }}>
              B
            </div>
            <div>
              <div style={{ color: '#64748B', fontSize: 8, fontWeight: 600 }}>TEAM B AUTO-ASSIGNED</div>
              <div style={{ color: '#CBD5E1', fontSize: 11, fontWeight: 700 }}>
                {teamBName} → {teamBSide.charAt(0).toUpperCase() + teamBSide.slice(1)} Side
              </div>
            </div>
            <CheckCircle2 size={14} color="#22C55E" style={{ marginLeft: 'auto' }} />
          </div>
        </div>

        {/* RIGHT PANEL: Match Format + Summary + CTA */}
        <div className="mss-right-panel flex flex-col gap-3 flex-1" style={{ overflow: 'hidden' }}>

          <div className="mss-section-hdr" style={{ color: '#94A3B8', fontSize: 9, fontWeight: 700, letterSpacing: '0.12em', borderBottom: '1px solid #1E293B', paddingBottom: 4 }}>
            MATCH FORMAT
          </div>

          {/* Points per game */}
          <div>
            <div className="mss-field-label" style={{ color: '#64748B', fontSize: 9, fontWeight: 600, marginBottom: 5 }}>Points Per Game</div>
            <div className="flex gap-2">
              {PTS_OPTIONS.map(pts => (
                <button
                  key={pts}
                  className="mss-pts-btn"
                  onClick={() => setPointsPerGame(pts)}
                  style={{
                    flex: 1, height: 44, position: 'relative',
                    background: pointsPerGame === pts ? 'rgba(34,197,94,0.15)' : '#1E293B',
                    border: `2px solid ${pointsPerGame === pts ? '#22C55E' : '#334155'}`,
                    borderRadius: 8,
                    color: pointsPerGame === pts ? '#22C55E' : '#94A3B8',
                    fontSize: 16, fontWeight: 900, fontFamily: 'Inter, sans-serif',
                    cursor: 'pointer', transition: 'all 0.15s',
                    boxShadow: pointsPerGame === pts ? '0 0 12px rgba(34,197,94,0.2)' : 'none',
                  }}
                >
                  {pts}
                  {pts === 21 && pointsPerGame !== pts && (
                    <span style={{ position: 'absolute', top: 2, right: 4, fontSize: 6, color: '#475569', fontWeight: 700 }}>DEFAULT</span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Number of sets */}
          <div>
            <div className="mss-field-label" style={{ color: '#64748B', fontSize: 9, fontWeight: 600, marginBottom: 5 }}>Number of Sets</div>
            <div className="flex gap-2">
              {SET_OPTIONS.map(({ value, label }) => (
                <button
                  key={value}
                  className="mss-sets-btn"
                  onClick={() => setNumSets(value)}
                  style={{
                    flex: 1, height: 40,
                    background: numSets === value ? 'rgba(59,130,246,0.15)' : '#1E293B',
                    border: `2px solid ${numSets === value ? '#3B82F6' : '#334155'}`,
                    borderRadius: 8,
                    color: numSets === value ? '#60A5FA' : '#94A3B8',
                    fontSize: 12, fontWeight: 700, fontFamily: 'Inter, sans-serif',
                    cursor: 'pointer', transition: 'all 0.15s',
                    boxShadow: numSets === value ? '0 0 12px rgba(59,130,246,0.15)' : 'none',
                  }}
                >
                  {label}
                  {value === 3 && numSets !== value && (
                    <span style={{ display: 'block', fontSize: 7, color: '#475569', fontWeight: 700 }}>DEFAULT</span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Summary card */}
          <div className="mss-summary-card" style={{ background: '#1E293B', border: '1px solid #334155', borderRadius: 10, padding: '10px 14px', flex: 1 }}>
            <div style={{ color: '#64748B', fontSize: 8, fontWeight: 700, letterSpacing: '0.1em', marginBottom: 8 }}>
              MATCH FORMAT SUMMARY
            </div>
            {[
              { label: 'Points Per Game', value: `${pointsPerGame} Points` },
              { label: 'Number of Sets',  value: numSets === 1 ? 'Best of 1' : 'Best of 3' },
              { label: 'Team A Starting Side', value: `${teamASide.charAt(0).toUpperCase() + teamASide.slice(1)} Side` },
              { label: 'Team B Starting Side', value: `${teamBSide.charAt(0).toUpperCase() + teamBSide.slice(1)} Side` },
              { label: 'Change Ends At', value: `${halfPoint} Points` },
            ].map(({ label, value }) => (
              <div className="mss-summary-row" key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <span className="mss-summary-lbl" style={{ color: '#64748B', fontSize: 9, fontWeight: 600 }}>{label}</span>
                <span className="mss-summary-val" style={{ color: '#CBD5E1', fontSize: 10, fontWeight: 700 }}>{value}</span>
              </div>
            ))}
          </div>

          {/* CTA */}
          <button
            className="mss-cta-btn"
            onClick={() => onContinue({ teamASide, pointsPerGame, numSets })}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              height: 48, flexShrink: 0,
              background: '#22C55E', color: '#fff', border: 'none', borderRadius: 10,
              fontSize: 13, fontWeight: 900, fontFamily: 'Inter, sans-serif',
              cursor: 'pointer', letterSpacing: '0.05em',
              boxShadow: '0 0 20px rgba(34,197,94,0.3)',
            }}
          >
            SELECT SERVERS <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
