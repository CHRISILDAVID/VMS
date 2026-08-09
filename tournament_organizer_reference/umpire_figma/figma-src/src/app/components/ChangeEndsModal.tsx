import React from 'react';
import { ArrowLeftRight, CheckCircle2, ArrowRight } from 'lucide-react';

interface ChangeEndsModalProps {
  teamAName: string;
  teamBName: string;
  teamAOnLeft: boolean; // current side (before potential swap)
  score: { a: number; b: number };
  currentGame: number;
  onConfirm: () => void;
  onSkip: () => void;
}

function SwapCourtPreview({
  teamAName,
  teamBName,
  teamAOnLeft,
}: {
  teamAName: string;
  teamBName: string;
  teamAOnLeft: boolean;
}) {
  // Preview shows NEW positions (after swap)
  const newAOnLeft = !teamAOnLeft;
  const leftName = newAOnLeft ? teamAName : teamBName;
  const rightName = newAOnLeft ? teamBName : teamAName;
  const leftColor = newAOnLeft ? '#3B82F6' : '#7C3AED';
  const rightColor = newAOnLeft ? '#7C3AED' : '#3B82F6';

  return (
    <svg viewBox="0 0 280 130" style={{ width: '100%', height: '100%', display: 'block' }}>
      <defs>
        <linearGradient id="ceCourtGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0D2645" />
          <stop offset="100%" stopColor="#0B1F3A" />
        </linearGradient>
      </defs>

      <rect width="280" height="130" fill="#080F1E" rx="8" />
      <rect x="14" y="14" width="252" height="102" fill="url(#ceCourtGrad)" rx="4" />
      <rect x="14" y="14" width="252" height="102" fill="none" stroke="rgba(148,163,184,0.4)" strokeWidth="1.2" rx="4" />

      <line x1="14" y1="28" x2="266" y2="28" stroke="rgba(148,163,184,0.2)" strokeWidth="0.8" />
      <line x1="14" y1="102" x2="266" y2="102" stroke="rgba(148,163,184,0.2)" strokeWidth="0.8" />
      <line x1="82" y1="28" x2="82" y2="102" stroke="rgba(148,163,184,0.35)" strokeWidth="0.8" />
      <line x1="198" y1="28" x2="198" y2="102" stroke="rgba(148,163,184,0.35)" strokeWidth="0.8" />
      <line x1="32" y1="65" x2="82" y2="65" stroke="rgba(148,163,184,0.35)" strokeWidth="0.8" />
      <line x1="198" y1="65" x2="248" y2="65" stroke="rgba(148,163,184,0.35)" strokeWidth="0.8" />
      <line x1="32" y1="28" x2="32" y2="102" stroke="rgba(148,163,184,0.25)" strokeWidth="0.8" />
      <line x1="248" y1="28" x2="248" y2="102" stroke="rgba(148,163,184,0.25)" strokeWidth="0.8" />

      <rect x="138" y="14" width="4" height="102" fill="rgba(0,0,0,0.3)" />
      <line x1="140" y1="14" x2="140" y2="116" stroke="#94A3B8" strokeWidth="2.5" />

      <rect x="15" y="15" width="124" height="100" fill={leftColor} fillOpacity="0.1" rx="3" />
      <rect x="141" y="15" width="124" height="100" fill={rightColor} fillOpacity="0.1" rx="3" />

      <text x="77" y="10" textAnchor="middle" fontSize="8" fill={leftColor} fontFamily="Inter, sans-serif" fontWeight="800" letterSpacing="0.5">
        {leftName.length > 10 ? leftName.split('/')[0].trim() : leftName}
      </text>
      <text x="203" y="10" textAnchor="middle" fontSize="8" fill={rightColor} fontFamily="Inter, sans-serif" fontWeight="800" letterSpacing="0.5">
        {rightName.length > 10 ? rightName.split('/')[0].trim() : rightName}
      </text>

      <circle cx="65" cy="44" r="10" fill={leftColor} fillOpacity="0.9" />
      <text x="65" y="47" textAnchor="middle" fontSize="8" fill="#fff" fontWeight="800" fontFamily="Inter, sans-serif">{leftName[0]}</text>
      <circle cx="65" cy="86" r="10" fill={leftColor} fillOpacity="0.9" />
      <text x="65" y="89" textAnchor="middle" fontSize="8" fill="#fff" fontWeight="800" fontFamily="Inter, sans-serif">{leftName[0]}</text>

      <circle cx="215" cy="44" r="10" fill={rightColor} fillOpacity="0.9" />
      <text x="215" y="47" textAnchor="middle" fontSize="8" fill="#fff" fontWeight="800" fontFamily="Inter, sans-serif">{rightName[0]}</text>
      <circle cx="215" cy="86" r="10" fill={rightColor} fillOpacity="0.9" />
      <text x="215" y="89" textAnchor="middle" fontSize="8" fill="#fff" fontWeight="800" fontFamily="Inter, sans-serif">{rightName[0]}</text>

      <rect x="18" y="118" width="40" height="10" rx="3" fill={leftColor} fillOpacity="0.2" />
      <text x="38" y="125" textAnchor="middle" fontSize="6" fill={leftColor} fontFamily="Inter, sans-serif" fontWeight="700">LEFT</text>
      <rect x="222" y="118" width="44" height="10" rx="3" fill={rightColor} fillOpacity="0.2" />
      <text x="244" y="125" textAnchor="middle" fontSize="6" fill={rightColor} fontFamily="Inter, sans-serif" fontWeight="700">RIGHT</text>
    </svg>
  );
}

export function ChangeEndsModal({
  teamAName, teamBName, teamAOnLeft, score, currentGame, onConfirm, onSkip,
}: ChangeEndsModalProps) {
  return (
    <div
      style={{
        position: 'absolute', inset: 0, zIndex: 60,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'rgba(8,15,30,0.88)', backdropFilter: 'blur(6px)',
      }}
    >
      <div
        style={{
          background: '#0B1F3A', border: '1px solid #334155', borderRadius: 20,
          padding: '18px 22px', width: '70%', maxWidth: 540,
          boxShadow: '0 0 60px rgba(0,0,0,0.6)',
          animation: 'modal-appear 0.3s cubic-bezier(0.34,1.56,0.64,1)',
        }}
      >
        {/* Header */}
        <div className="flex items-center gap-3 mb-3">
          <div
            style={{
              width: 38, height: 38, background: 'rgba(59,130,246,0.15)',
              border: '2px solid rgba(59,130,246,0.35)', borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}
          >
            <ArrowLeftRight size={17} color="#60A5FA" />
          </div>
          <div>
            <div style={{ color: '#fff', fontSize: 17, fontWeight: 900, lineHeight: 1.2 }}>Side Change</div>
            <div style={{ color: '#64748B', fontSize: 10, fontWeight: 600, marginTop: 2 }}>
              Game {currentGame} · Score: {score.a}–{score.b}
            </div>
          </div>
        </div>

        {/* Question */}
        <div
          style={{
            background: 'rgba(59,130,246,0.06)', border: '1px solid rgba(59,130,246,0.15)',
            borderRadius: 8, padding: '8px 12px', marginBottom: 10,
          }}
        >
          <div style={{ color: '#CBD5E1', fontSize: 11, lineHeight: 1.5 }}>
            Would you like to switch court sides?
          </div>
        </div>

        <div className="flex gap-3 items-center">
          {/* Court preview of new positions */}
          <div style={{ flex: 1, height: 130, borderRadius: 8, overflow: 'hidden', border: '1px solid #1E3A5F' }}>
            <SwapCourtPreview teamAName={teamAName} teamBName={teamBName} teamAOnLeft={teamAOnLeft} />
          </div>

          {/* Side-change summary */}
          <div className="flex flex-col gap-2" style={{ minWidth: 130 }}>
            <div style={{ color: '#64748B', fontSize: 8, fontWeight: 700, letterSpacing: '0.1em', marginBottom: 2 }}>
              NEW POSITIONS
            </div>
            {[
              { team: teamAName, color: '#3B82F6', from: teamAOnLeft ? 'Left' : 'Right', to: teamAOnLeft ? 'Right' : 'Left' },
              { team: teamBName, color: '#7C3AED', from: teamAOnLeft ? 'Right' : 'Left', to: teamAOnLeft ? 'Left' : 'Right' },
            ].map(({ team, color, from, to }) => (
              <div key={team} style={{ background: '#1E293B', border: '1px solid #334155', borderRadius: 8, padding: '6px 10px' }}>
                <div style={{ color, fontSize: 9, fontWeight: 700, marginBottom: 3 }}>{team.split('/')[0].trim()}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span style={{ color: '#475569', fontSize: 9, fontWeight: 600 }}>{from}</span>
                  <ArrowLeftRight size={9} color="#334155" />
                  <span style={{ color: '#22C55E', fontSize: 9, fontWeight: 800 }}>{to}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex gap-2 mt-3">
          {/* Primary: Change Sides */}
          <button
            onClick={onConfirm}
            style={{
              flex: 1, height: 46, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
              background: '#22C55E', color: '#fff', border: 'none', borderRadius: 10,
              fontSize: 12, fontWeight: 900, fontFamily: 'Inter, sans-serif',
              cursor: 'pointer', letterSpacing: '0.04em',
              boxShadow: '0 0 18px rgba(34,197,94,0.35)',
            }}
          >
            <CheckCircle2 size={15} />
            Change Sides
          </button>

          {/* Secondary: Continue Without Changing */}
          <button
            onClick={onSkip}
            style={{
              flex: 1, height: 46, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
              background: 'transparent', color: '#94A3B8',
              border: '1px solid #334155', borderRadius: 10,
              fontSize: 12, fontWeight: 600, fontFamily: 'Inter, sans-serif',
              cursor: 'pointer', letterSpacing: '0.02em',
            }}
          >
            <ArrowRight size={14} />
            Continue Without Changing
          </button>
        </div>
      </div>

      <style>{`
        @keyframes modal-appear {
          from { transform: scale(0.93) translateY(6px); opacity: 0; }
          to { transform: scale(1) translateY(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
