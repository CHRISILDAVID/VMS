import React from 'react';
import { ChevronRight, ChevronLeft, Eye } from 'lucide-react';
import { CourtDiagram } from './CourtDiagram';

type SetupPhase = 'servingTeamSelect' | 'serverSelect' | 'receiverSelect' | 'courtPreview';

interface SetupScreenProps {
  teamAPlayers: [string, string];
  teamBPlayers: [string, string];
  teamAName: string;
  teamBName: string;
  phase: SetupPhase;
  servingTeam: 'A' | 'B' | null;
  firstServer: string;
  firstReceiver: string;
  onSelectServingTeam: (team: 'A' | 'B') => void;
  onSelectServer: (player: string) => void;
  onSelectReceiver: (player: string) => void;
  onBack: () => void;
  onNext: () => void;
  onStartMatch: () => void;
}

function getInitials(name: string) {
  return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
}

const STEP_LABELS: Record<SetupPhase, string> = {
  servingTeamSelect: 'Select Serving Team',
  serverSelect: 'Select First Server',
  receiverSelect: 'Select First Receiver',
  courtPreview: 'Court Formation',
};

const PHASES: SetupPhase[] = ['servingTeamSelect', 'serverSelect', 'receiverSelect', 'courtPreview'];

export function SetupScreen({
  teamAPlayers, teamBPlayers, teamAName, teamBName,
  phase, servingTeam, firstServer, firstReceiver,
  onSelectServingTeam, onSelectServer, onSelectReceiver,
  onBack, onNext, onStartMatch,
}: SetupScreenProps) {
  const stepIndex = PHASES.indexOf(phase);

  const servingPlayers = servingTeam === 'A' ? teamAPlayers : teamBPlayers;
  const receivingPlayers = servingTeam === 'A' ? teamBPlayers : teamAPlayers;
  const servingTeamName = servingTeam === 'A' ? teamAName : teamBName;
  const receivingTeamName = servingTeam === 'A' ? teamBName : teamAName;

  // Build positions for court preview
  const serverOnA = servingTeam === 'A';
  const aServer = serverOnA ? firstServer : '';
  const aPartner = serverOnA ? teamAPlayers.find(p => p !== firstServer) || teamAPlayers[1] : teamAPlayers[0];
  const bServer = !serverOnA ? firstServer : '';
  const bPartner = !serverOnA ? teamBPlayers.find(p => p !== firstServer) || teamBPlayers[1] : teamBPlayers[0];

  const courtTopLeft = {
    name: serverOnA ? aPartner : teamAPlayers[0],
    isServer: false,
    isReceiver: !serverOnA && firstReceiver === (serverOnA ? aPartner : teamAPlayers[0]),
  };
  const courtBottomLeft = {
    name: serverOnA ? (firstServer || teamAPlayers[0]) : teamAPlayers[1],
    isServer: serverOnA && !!firstServer,
    isReceiver: !serverOnA && firstReceiver === (serverOnA ? (firstServer || teamAPlayers[0]) : teamAPlayers[1]),
  };
  const courtTopRight = {
    name: !serverOnA ? (firstServer || teamBPlayers[0]) : teamBPlayers[0],
    isServer: !serverOnA && !!firstServer,
    isReceiver: serverOnA && firstReceiver === (!serverOnA ? (firstServer || teamBPlayers[0]) : teamBPlayers[0]),
  };
  const courtBottomRight = {
    name: !serverOnA ? bPartner : teamBPlayers[1],
    isServer: false,
    isReceiver: serverOnA && firstReceiver === (!serverOnA ? bPartner : teamBPlayers[1]),
  };

  const canProceed = (() => {
    if (phase === 'servingTeamSelect') return !!servingTeam;
    if (phase === 'serverSelect') return !!firstServer;
    if (phase === 'receiverSelect') return !!firstReceiver;
    return true;
  })();

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
        <button
          onClick={onBack}
          style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#64748B', background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600, fontFamily: 'Inter, sans-serif' }}
        >
          <ChevronLeft size={14} /> Back
        </button>

        {/* Step progress */}
        <div className="flex items-center gap-2 mx-auto">
          {PHASES.map((s, i) => (
            <React.Fragment key={s}>
              <div
                style={{
                  width: i <= stepIndex ? 24 : 20, height: i <= stepIndex ? 24 : 20,
                  borderRadius: '50%',
                  background: i < stepIndex ? '#22C55E' : i === stepIndex ? 'rgba(34,197,94,0.2)' : '#1E293B',
                  border: `2px solid ${i <= stepIndex ? '#22C55E' : '#334155'}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: i <= stepIndex ? '#fff' : '#64748B',
                  fontSize: 9, fontWeight: 800, transition: 'all 0.2s',
                }}
              >
                {i < stepIndex ? '✓' : i + 1}
              </div>
              {i < PHASES.length - 1 && (
                <div style={{ width: 20, height: 1, background: i < stepIndex ? '#22C55E' : '#334155' }} />
              )}
            </React.Fragment>
          ))}
        </div>

        <div style={{ color: '#94A3B8', fontSize: 11, fontWeight: 600 }}>{STEP_LABELS[phase]}</div>
      </div>

      {/* Content */}
      <div className="flex flex-1 gap-4 p-4" style={{ overflow: 'hidden' }}>

        {/* Left panel */}
        <div className="flex flex-col gap-3" style={{ minWidth: 260, flexShrink: 0 }}>

          {/* STEP 1: Select Serving Team */}
          {phase === 'servingTeamSelect' && (
            <>
              <Label>SELECT SERVING TEAM</Label>
              <div style={{ color: '#64748B', fontSize: 10 }}>Which team will serve first?</div>
              <div className="flex flex-col gap-2">
                <TeamSelectButton
                  teamLabel="TEAM A"
                  teamName={teamAName}
                  players={teamAPlayers}
                  selected={servingTeam === 'A'}
                  accentColor="#3B82F6"
                  onClick={() => onSelectServingTeam('A')}
                />
                <TeamSelectButton
                  teamLabel="TEAM B"
                  teamName={teamBName}
                  players={teamBPlayers}
                  selected={servingTeam === 'B'}
                  accentColor="#7C3AED"
                  onClick={() => onSelectServingTeam('B')}
                />
              </div>
            </>
          )}

          {/* STEP 2: Select Server */}
          {phase === 'serverSelect' && servingTeam && (
            <>
              <Label>SERVING TEAM · {servingTeamName.toUpperCase()}</Label>
              <div style={{ color: '#64748B', fontSize: 10 }}>Select which player will serve first</div>
              <div className="flex flex-col gap-2">
                {servingPlayers.map(player => (
                  <PlayerSelectButton
                    key={player} player={player}
                    selected={firstServer === player}
                    onSelect={() => onSelectServer(player)}
                    accentColor="#22C55E" badge="S"
                  />
                ))}
              </div>
            </>
          )}

          {/* STEP 3: Select Receiver */}
          {phase === 'receiverSelect' && servingTeam && (
            <>
              <Label>RECEIVING TEAM · {receivingTeamName.toUpperCase()}</Label>
              <div style={{ color: '#64748B', fontSize: 10 }}>Select which player will receive first</div>
              <div className="flex flex-col gap-2">
                {receivingPlayers.map(player => (
                  <PlayerSelectButton
                    key={player} player={player}
                    selected={firstReceiver === player}
                    onSelect={() => onSelectReceiver(player)}
                    accentColor="#F59E0B" badge="R"
                  />
                ))}
              </div>
            </>
          )}

          {/* STEP 4: Court Preview info */}
          {phase === 'courtPreview' && servingTeam && (
            <>
              <Label>INITIAL FORMATION</Label>
              <div className="flex flex-col gap-2">
                <InfoRow label="Serving Team" value={servingTeamName} badge={servingTeam} badgeColor="#3B82F6" />
                <InfoRow label="First Server" value={firstServer} badge="S" badgeColor="#22C55E" />
                <InfoRow label="First Receiver" value={firstReceiver} badge="R" badgeColor="#F59E0B" />
              </div>
              <div style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: 8, padding: '10px 12px', marginTop: 4 }}>
                <div style={{ color: '#86EFAC', fontSize: 9, fontWeight: 700, letterSpacing: '0.08em', marginBottom: 4 }}>BWF RULE</div>
                <div style={{ color: '#CBD5E1', fontSize: 10, lineHeight: 1.5 }}>
                  Server starts in right service court (even score). All rotations are automatic.
                </div>
              </div>
            </>
          )}
        </div>

        {/* Right panel: court diagram */}
        <div className="flex flex-col flex-1 gap-3" style={{ overflow: 'hidden' }}>
          <div className="flex items-center gap-2">
            <Eye size={12} color="#64748B" />
            <span style={{ color: '#64748B', fontSize: 10, fontWeight: 600, letterSpacing: '0.06em' }}>UMPIRE VIEW — COURT PREVIEW</span>
          </div>

          <div className="flex-1" style={{ maxHeight: 180, overflow: 'hidden' }}>
            {(phase === 'servingTeamSelect' || !servingTeam) ? (
              /* Placeholder court when no serving team selected */
              <div style={{ width: '100%', height: '100%', background: '#080F1E', borderRadius: 8, border: '1px solid #1E293B', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ color: '#334155', fontSize: 10, fontWeight: 600 }}>Select a serving team to preview</span>
              </div>
            ) : (
              <CourtDiagram
                topLeft={courtTopLeft}
                bottomLeft={courtBottomLeft}
                topRight={courtTopRight}
                bottomRight={courtBottomRight}
                servingTeam={servingTeam}
              />
            )}
          </div>

          {/* Player legend (steps 2+) */}
          {servingTeam && phase !== 'servingTeamSelect' && (
            <div className="flex gap-4 flex-wrap">
              {[
                { name: courtTopLeft.name, pos: 'Top Left', team: 'A' },
                { name: courtBottomLeft.name, pos: 'Bottom Left', team: 'A' },
                { name: courtTopRight.name, pos: 'Top Right', team: 'B' },
                { name: courtBottomRight.name, pos: 'Bottom Right', team: 'B' },
              ].map(({ name, pos, team }) => (
                <div key={name + pos} className="flex items-center gap-1.5">
                  <div style={{ width: 16, height: 16, borderRadius: 3, background: team === 'A' ? 'rgba(59,130,246,0.2)' : 'rgba(124,58,237,0.2)', border: `1px solid ${team === 'A' ? 'rgba(59,130,246,0.4)' : 'rgba(124,58,237,0.4)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 7, fontWeight: 800, color: team === 'A' ? '#60A5FA' : '#A78BFA' }}>
                    {getInitials(name || '?')}
                  </div>
                  <div>
                    <div style={{ color: '#CBD5E1', fontSize: 9, fontWeight: 600 }}>{(name || '—').split(' ')[0]}</div>
                    <div style={{ color: '#475569', fontSize: 8 }}>{pos}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Bottom bar */}
      <div style={{ borderTop: '1px solid #1E3A5F', background: '#0B1F3A', padding: '10px 20px', flexShrink: 0 }}>
        {phase !== 'courtPreview' ? (
          <button
            onClick={onNext}
            disabled={!canProceed}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              width: '100%', height: 44,
              background: canProceed ? '#22C55E' : '#1E293B',
              color: canProceed ? '#fff' : '#475569',
              border: 'none', borderRadius: 10,
              fontSize: 13, fontWeight: 800, fontFamily: 'Inter, sans-serif',
              cursor: canProceed ? 'pointer' : 'not-allowed', letterSpacing: '0.04em',
              boxShadow: canProceed ? '0 0 16px rgba(34,197,94,0.3)' : 'none',
              transition: 'all 0.15s',
            }}
          >
            NEXT <ChevronRight size={16} />
          </button>
        ) : (
          <button
            onClick={onStartMatch}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              width: '100%', height: 50,
              background: '#22C55E', color: '#fff', border: 'none', borderRadius: 10,
              fontSize: 15, fontWeight: 900, fontFamily: 'Inter, sans-serif',
              cursor: 'pointer', letterSpacing: '0.06em',
              boxShadow: '0 0 24px rgba(34,197,94,0.4)',
            }}
          >
            ▶ START MATCH
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function Label({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ color: '#94A3B8', fontSize: 9, fontWeight: 700, letterSpacing: '0.12em', borderBottom: '1px solid #1E293B', paddingBottom: 4 }}>
      {children}
    </div>
  );
}

function TeamSelectButton({ teamLabel, teamName, players, selected, accentColor, onClick }: {
  teamLabel: string; teamName: string; players: [string, string];
  selected: boolean; accentColor: string; onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex', alignItems: 'center', gap: 12, textAlign: 'left',
        background: selected ? `${accentColor}15` : '#1E293B',
        border: `2px solid ${selected ? accentColor : '#334155'}`,
        borderRadius: 10, padding: '10px 14px', cursor: 'pointer',
        width: '100%', transition: 'all 0.15s',
        boxShadow: selected ? `0 0 16px ${accentColor}25` : 'none',
      }}
    >
      <div style={{ width: 32, height: 32, borderRadius: 8, background: selected ? accentColor : '#334155', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 10, fontWeight: 900, flexShrink: 0 }}>
        {selected ? '✓' : teamLabel.replace('TEAM ', '')}
      </div>
      <div className="flex-1">
        <div style={{ color: selected ? '#fff' : '#CBD5E1', fontSize: 12, fontWeight: 700, fontFamily: 'Inter, sans-serif', marginBottom: 3 }}>{teamName}</div>
        <div style={{ color: '#475569', fontSize: 9 }}>{players.join(' · ')}</div>
      </div>
      {selected && (
        <div style={{ background: `${accentColor}20`, border: `1px solid ${accentColor}50`, borderRadius: 4, padding: '2px 8px', color: accentColor, fontSize: 8, fontWeight: 800, letterSpacing: '0.08em', flexShrink: 0 }}>
          SERVING
        </div>
      )}
    </button>
  );
}

function PlayerSelectButton({ player, selected, onSelect, accentColor, badge }: {
  player: string; selected: boolean; onSelect: () => void; accentColor: string; badge: string;
}) {
  return (
    <button
      onClick={onSelect}
      style={{
        display: 'flex', alignItems: 'center', gap: 12, width: '100%', textAlign: 'left',
        background: selected ? `${accentColor}15` : '#1E293B',
        border: `2px solid ${selected ? accentColor : '#334155'}`,
        borderRadius: 10, padding: '10px 14px', cursor: 'pointer',
        transition: 'all 0.15s', boxShadow: selected ? `0 0 16px ${accentColor}30` : 'none',
      }}
    >
      <div style={{ width: 28, height: 28, borderRadius: '50%', background: selected ? accentColor : '#334155', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 11, fontWeight: 900, flexShrink: 0 }}>
        {selected ? badge : getInitials(player)}
      </div>
      <div>
        <div style={{ color: selected ? '#fff' : '#CBD5E1', fontSize: 13, fontWeight: 700, fontFamily: 'Inter, sans-serif' }}>{player}</div>
        {selected && <div style={{ color: accentColor, fontSize: 9, fontWeight: 700, letterSpacing: '0.08em', marginTop: 1 }}>SELECTED</div>}
      </div>
      <div style={{ marginLeft: 'auto', width: 18, height: 18, borderRadius: '50%', border: `2px solid ${selected ? accentColor : '#334155'}`, background: selected ? accentColor : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        {selected && <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#fff' }} />}
      </div>
    </button>
  );
}

function InfoRow({ label, value, badge, badgeColor }: { label: string; value: string; badge: string; badgeColor: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#1E293B', border: '1px solid #334155', borderRadius: 8, padding: '8px 12px' }}>
      <div style={{ width: 22, height: 22, borderRadius: 5, background: badgeColor + '20', border: `1px solid ${badgeColor}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: badgeColor, fontSize: 9, fontWeight: 900, flexShrink: 0 }}>
        {badge}
      </div>
      <div>
        <div style={{ color: '#64748B', fontSize: 8, fontWeight: 700, letterSpacing: '0.08em' }}>{label.toUpperCase()}</div>
        <div style={{ color: '#CBD5E1', fontSize: 11, fontWeight: 600 }}>{value}</div>
      </div>
    </div>
  );
}
