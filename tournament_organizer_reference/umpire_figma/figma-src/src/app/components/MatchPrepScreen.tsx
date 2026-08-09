import React from 'react';
import { Shield, MapPin, Hash, ChevronRight } from 'lucide-react';

interface MatchData {
  tournament: string;
  court: string;
  matchNumber: string;
  category: string;
  matchType: string;
  teamAName: string;
  teamBName: string;
  teamAPlayers: [string, string];
  teamBPlayers: [string, string];
}

interface MatchPrepScreenProps {
  data: MatchData;
  onContinue: () => void;
}

export function MatchPrepScreen({ data, onContinue }: MatchPrepScreenProps) {
  return (
    <div
      className="size-full flex flex-col"
      style={{ background: '#0F172A', fontFamily: 'Inter, sans-serif', overflow: 'hidden' }}
    >
      {/* Top bar */}
      <div
        className="flex items-center gap-3 px-5"
        style={{ background: '#0B1F3A', borderBottom: '1px solid #1E3A5F', height: 44, flexShrink: 0 }}
      >
        <div
          style={{ width: 28, height: 28, background: 'rgba(34,197,94,0.15)', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          <Shield size={14} color="#22C55E" />
        </div>
        <div>
          <div style={{ color: '#fff', fontSize: 12, fontWeight: 700, lineHeight: 1.2 }}>{data.tournament}</div>
          <div style={{ color: '#64748B', fontSize: 9, fontWeight: 600, letterSpacing: '0.08em' }}>MATCH PREPARATION</div>
        </div>
        <div className="ml-auto flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <MapPin size={11} color="#64748B" />
            <span style={{ color: '#94A3B8', fontSize: 11, fontWeight: 600 }}>{data.court}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Hash size={11} color="#64748B" />
            <span style={{ color: '#94A3B8', fontSize: 11, fontWeight: 600 }}>{data.matchNumber}</span>
          </div>
          <div style={{ background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.25)', borderRadius: 4, padding: '2px 8px', color: '#22C55E', fontSize: 9, fontWeight: 700, letterSpacing: '0.1em' }}>
            {data.category}
          </div>
        </div>
      </div>

      {/* Main content — teams + match info */}
      <div className="flex flex-1 items-center gap-4 px-6 py-3" style={{ overflow: 'hidden', minHeight: 0 }}>
        {/* Match info card */}
        <div style={{ background: '#1E293B', border: '1px solid #334155', borderRadius: 12, padding: '14px 20px', minWidth: 180, flexShrink: 0 }}>
          <div style={{ color: '#64748B', fontSize: 9, fontWeight: 700, letterSpacing: '0.12em', marginBottom: 10 }}>MATCH INFO</div>
          <div className="flex flex-col gap-2.5">
            {[
              { label: 'Court', value: data.court },
              { label: 'Match', value: data.matchNumber },
              { label: 'Category', value: data.category },
              { label: 'Format', value: data.matchType },
            ].map(({ label, value }) => (
              <div key={label} className="flex justify-between items-center gap-4">
                <span style={{ color: '#64748B', fontSize: 10, fontWeight: 600 }}>{label}</span>
                <span style={{ color: '#CBD5E1', fontSize: 11, fontWeight: 600 }}>{value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Teams */}
        <div className="flex flex-1 items-center gap-3">
          <TeamCard teamLabel="TEAM A" teamName={data.teamAName} players={data.teamAPlayers} accentColor="#3B82F6" glowColor="rgba(59,130,246,0.15)" />

          <div className="flex flex-col items-center gap-1 flex-shrink-0">
            <div style={{ width: 42, height: 42, background: 'rgba(30,41,59,0.8)', border: '2px solid #334155', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#475569', fontSize: 12, fontWeight: 900 }}>
              VS
            </div>
            <div style={{ color: '#475569', fontSize: 8, fontWeight: 600, letterSpacing: '0.06em' }}>{data.matchType}</div>
          </div>

          <TeamCard teamLabel="TEAM B" teamName={data.teamBName} players={data.teamBPlayers} accentColor="#7C3AED" glowColor="rgba(124,58,237,0.15)" />
        </div>
      </div>

      {/* Bottom bar — always visible CTA */}
      <div
        style={{ background: '#0B1F3A', borderTop: '1px solid #1E3A5F', padding: '10px 20px', flexShrink: 0 }}
      >
        <button
          onClick={onContinue}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            width: '100%', height: 46,
            background: '#22C55E', color: '#fff', border: 'none', borderRadius: 10,
            fontSize: 13, fontWeight: 800, fontFamily: 'Inter, sans-serif',
            cursor: 'pointer', letterSpacing: '0.05em',
            boxShadow: '0 0 20px rgba(34,197,94,0.3)',
            transition: 'all 0.15s',
          }}
          onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 0 28px rgba(34,197,94,0.5)'; }}
          onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 0 20px rgba(34,197,94,0.3)'; }}
        >
          SETUP MATCH <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}

function TeamCard({ teamLabel, teamName, players, accentColor, glowColor }: {
  teamLabel: string; teamName: string; players: [string, string]; accentColor: string; glowColor: string;
}) {
  return (
    <div
      className="flex-1"
      style={{ background: '#1E293B', border: `1px solid #334155`, borderRadius: 12, padding: '12px 16px' }}
    >
      <div className="flex items-center justify-between mb-2">
        <span style={{ color: accentColor, fontSize: 9, fontWeight: 700, letterSpacing: '0.12em' }}>{teamLabel}</span>
      </div>
      <div style={{ color: '#fff', fontSize: 13, fontWeight: 800, marginBottom: 8, letterSpacing: '-0.01em' }}>{teamName}</div>
      <div className="flex flex-col gap-1.5">
        {players.map((player, i) => (
          <div key={i} className="flex items-center gap-2">
            <div style={{ width: 20, height: 20, background: accentColor + '20', border: `1px solid ${accentColor}40`, borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', color: accentColor, fontSize: 8, fontWeight: 800, flexShrink: 0 }}>
              {player.split(' ').map(n => n[0]).join('').slice(0, 2)}
            </div>
            <span style={{ color: '#CBD5E1', fontSize: 11, fontWeight: 500 }}>{player}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
