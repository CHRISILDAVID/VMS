import React, { useEffect, useState } from 'react';
import { Trophy, FileText, Clock, Shield, ArrowLeftRight } from 'lucide-react';

interface GameScore { a: number; b: number; }

interface MatchCompleteScreenProps {
  winner: 'A' | 'B';
  teamAName: string;
  teamBName: string;
  teamAPlayers: [string, string];
  teamBPlayers: [string, string];
  gameScores: GameScore[];
  duration: number; // seconds
  // Match config
  teamAStartSide: 'left' | 'right';
  pointsPerGame: number;
  numSets: number;
  onSubmit: () => void;
}

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  if (m === 0) return `${s} Seconds`;
  if (s === 0) return `${m} Minute${m !== 1 ? 's' : ''}`;
  return `${m}m ${s}s`;
}

export function MatchCompleteScreen({
  winner, teamAName, teamBName, teamAPlayers, teamBPlayers,
  gameScores, duration, teamAStartSide, pointsPerGame, numSets, onSubmit,
}: MatchCompleteScreenProps) {
  const [visible, setVisible] = useState(false);
  const winnerName = winner === 'A' ? teamAName : teamBName;
  const winnerPlayers = winner === 'A' ? teamAPlayers : teamBPlayers;

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 100);
    return () => clearTimeout(t);
  }, []);

  const gamesWonA = gameScores.filter(g => g.a > g.b).length;
  const gamesWonB = gameScores.filter(g => g.b > g.a).length;
  const teamBStartSide = teamAStartSide === 'left' ? 'right' : 'left';

  return (
    <div
      className="size-full flex flex-col items-center justify-center"
      style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(34,197,94,0.08) 0%, #0F172A 60%)', fontFamily: 'Inter, sans-serif', overflow: 'hidden', position: 'relative' }}
    >
      {/* Trophy glow */}
      <div style={{ position: 'absolute', top: '10%', left: '50%', transform: 'translateX(-50%)', width: 200, height: 200, background: 'radial-gradient(circle, rgba(34,197,94,0.15) 0%, transparent 70%)', pointerEvents: 'none' }} />

      <div
        className="flex items-stretch gap-5 w-full px-6"
        style={{ opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(20px)', transition: 'all 0.5s cubic-bezier(0.34,1.56,0.64,1)' }}
      >
        {/* Winner info */}
        <div className="flex flex-col items-center justify-center" style={{ minWidth: 180 }}>
          <div style={{ width: 52, height: 52, background: 'rgba(34,197,94,0.15)', border: '2px solid rgba(34,197,94,0.4)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 10, boxShadow: '0 0 30px rgba(34,197,94,0.3)' }}>
            <Trophy size={24} color="#22C55E" />
          </div>
          <div style={{ color: '#22C55E', fontSize: 8, fontWeight: 800, letterSpacing: '0.15em', marginBottom: 6 }}>WINNER</div>
          <div style={{ color: '#fff', fontSize: 16, fontWeight: 900, letterSpacing: '-0.02em', textAlign: 'center', lineHeight: 1.2, marginBottom: 6 }}>
            {winnerName}
          </div>
          <div className="flex flex-col gap-1 items-center">
            {winnerPlayers.map(p => (
              <div key={p} style={{ color: '#86EFAC', fontSize: 11, fontWeight: 600 }}>{p}</div>
            ))}
          </div>
        </div>

        {/* Games score */}
        <div className="flex flex-col items-center justify-center flex-1">
          <div className="flex items-center gap-4 mb-3">
            <div style={{ textAlign: 'center' }}>
              <div style={{ color: '#94A3B8', fontSize: 8, fontWeight: 700, letterSpacing: '0.1em', marginBottom: 2 }}>TEAM A</div>
              <div style={{ fontSize: 44, fontWeight: 900, color: winner === 'A' ? '#22C55E' : '#475569', lineHeight: 1, letterSpacing: '-0.04em' }}>{gamesWonA}</div>
            </div>
            <div style={{ color: '#334155', fontSize: 24, fontWeight: 900 }}>–</div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ color: '#94A3B8', fontSize: 8, fontWeight: 700, letterSpacing: '0.1em', marginBottom: 2 }}>TEAM B</div>
              <div style={{ fontSize: 44, fontWeight: 900, color: winner === 'B' ? '#22C55E' : '#475569', lineHeight: 1, letterSpacing: '-0.04em' }}>{gamesWonB}</div>
            </div>
          </div>

          {/* Per-game scores */}
          <div className="flex gap-2 mb-3">
            {gameScores.map((gs, i) => {
              const gw = gs.a > gs.b ? 'A' : 'B';
              return (
                <div key={i} style={{ background: '#1E293B', border: '1px solid #334155', borderRadius: 8, padding: '5px 12px', textAlign: 'center' }}>
                  <div style={{ color: '#64748B', fontSize: 7, fontWeight: 700, letterSpacing: '0.1em', marginBottom: 3 }}>GAME {i + 1}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                    <span style={{ fontSize: 16, fontWeight: 900, color: gw === 'A' ? '#22C55E' : '#94A3B8', letterSpacing: '-0.02em' }}>{gs.a}</span>
                    <span style={{ color: '#334155', fontSize: 11, fontWeight: 700 }}>–</span>
                    <span style={{ fontSize: 16, fontWeight: 900, color: gw === 'B' ? '#22C55E' : '#94A3B8', letterSpacing: '-0.02em' }}>{gs.b}</span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex items-center gap-2">
            <Clock size={11} color="#64748B" />
            <span style={{ color: '#64748B', fontSize: 10, fontWeight: 600 }}>Duration:</span>
            <span style={{ color: '#CBD5E1', fontSize: 10, fontWeight: 700 }}>{formatDuration(duration)}</span>
          </div>
        </div>

        {/* Match config + actions */}
        <div className="flex flex-col gap-2 justify-center" style={{ minWidth: 180 }}>
          {/* Config summary */}
          <div style={{ background: '#1E293B', border: '1px solid #334155', borderRadius: 10, padding: '10px 12px', marginBottom: 4 }}>
            <div style={{ color: '#64748B', fontSize: 8, fontWeight: 700, letterSpacing: '0.1em', marginBottom: 8 }}>MATCH CONFIGURATION</div>
            <div className="flex flex-col gap-2">
              {[
                { label: 'Points / Game', value: `${pointsPerGame}` },
                { label: 'Sets', value: numSets === 1 ? 'Best of 1' : 'Best of 3' },
                { label: 'Team A Started', value: `${teamAStartSide.charAt(0).toUpperCase() + teamAStartSide.slice(1)} Side` },
                { label: 'Team B Started', value: `${teamBStartSide.charAt(0).toUpperCase() + teamBStartSide.slice(1)} Side` },
              ].map(({ label, value }) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                  <span style={{ color: '#64748B', fontSize: 8, fontWeight: 600 }}>{label}</span>
                  <span style={{ color: '#CBD5E1', fontSize: 9, fontWeight: 700 }}>{value}</span>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={onSubmit}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, background: '#22C55E', color: '#fff', border: 'none', borderRadius: 10, padding: '13px 20px', fontSize: 12, fontWeight: 900, fontFamily: 'Inter, sans-serif', cursor: 'pointer', letterSpacing: '0.05em', boxShadow: '0 0 20px rgba(34,197,94,0.4)', whiteSpace: 'nowrap' }}
          >
            <Shield size={14} /> SUBMIT RESULT
          </button>
          <button
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, background: 'transparent', color: '#94A3B8', border: '1px solid #334155', borderRadius: 10, padding: '11px 20px', fontSize: 11, fontWeight: 600, fontFamily: 'Inter, sans-serif', cursor: 'pointer', whiteSpace: 'nowrap' }}
          >
            <FileText size={13} /> VIEW REPORT
          </button>
        </div>
      </div>
    </div>
  );
}
