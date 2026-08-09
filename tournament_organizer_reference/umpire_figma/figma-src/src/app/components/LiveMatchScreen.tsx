import React, { useState, useEffect, useRef } from 'react';
import { RotateCcw, Pause, Play, Clock, List } from 'lucide-react';
import { CourtDiagram } from './CourtDiagram';
import { ChangeEndsModal } from './ChangeEndsModal';
import { EventAction } from './EventsPanel';

interface GameScore { a: number; b: number; }

interface TeamState {
  rightCourt: string;
  leftCourt: string;
}

export interface MatchEvent {
  id: string;
  type: string;
  description: string;
  time: number;
  scorer?: 'A' | 'B';
}

interface LiveMatchScreenProps {
  tournament: string;
  court: string;
  matchNumber: string;
  category: string;
  teamAName: string;
  teamBName: string;
  teamAPlayers: [string, string];
  teamBPlayers: [string, string];
  currentGame: number;
  numSets: number;
  pointsPerGame: number;
  gameScores: GameScore[];
  score: GameScore;
  servingTeam: 'A' | 'B';
  teamA: TeamState;
  teamB: TeamState;
  teamAOnLeft: boolean;
  startTime: number;
  events: MatchEvent[];
  isPaused: boolean;
  canUndo: boolean;
  activeBanner: string | null;
  pendingChangeEnds: boolean;
  onScorePoint: (team: 'A' | 'B') => void;
  onEventAction: (action: EventAction) => void;
  onConfirmChangeEnds: () => void;
  onSkipChangeEnds: () => void;
}

function formatTime(ms: number): string {
  const s = Math.floor(ms / 1000);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
  return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
}

function formatEventTime(ms: number): string {
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
}

function getServerInfo(
  score: GameScore,
  serving: 'A' | 'B',
  teamA: TeamState,
  teamB: TeamState,
  teamAOnLeft: boolean
) {
  let server: string;
  let serverPos: 'topLeft' | 'bottomLeft' | 'topRight' | 'bottomRight';

  if (teamAOnLeft) {
    if (serving === 'A') {
      const isEven = score.a % 2 === 0;
      server = isEven ? teamA.rightCourt : teamA.leftCourt;
      serverPos = isEven ? 'bottomLeft' : 'topLeft';
    } else {
      const isEven = score.b % 2 === 0;
      server = isEven ? teamB.rightCourt : teamB.leftCourt;
      serverPos = isEven ? 'topRight' : 'bottomRight';
    }
  } else {
    if (serving === 'A') {
      const isEven = score.a % 2 === 0;
      server = isEven ? teamA.rightCourt : teamA.leftCourt;
      serverPos = isEven ? 'topRight' : 'bottomRight';
    } else {
      const isEven = score.b % 2 === 0;
      server = isEven ? teamB.rightCourt : teamB.leftCourt;
      serverPos = isEven ? 'bottomLeft' : 'topLeft';
    }
  }

  const diagMap: Record<string, 'topLeft' | 'bottomLeft' | 'topRight' | 'bottomRight'> = {
    bottomLeft: 'topRight', topLeft: 'bottomRight', topRight: 'bottomLeft', bottomRight: 'topLeft',
  };
  const receiverPos = diagMap[serverPos];

  let receiver: string;
  if (teamAOnLeft) {
    if (receiverPos === 'bottomLeft') receiver = teamA.rightCourt;
    else if (receiverPos === 'topLeft') receiver = teamA.leftCourt;
    else if (receiverPos === 'topRight') receiver = teamB.rightCourt;
    else receiver = teamB.leftCourt;
  } else {
    if (receiverPos === 'topRight') receiver = teamA.rightCourt;
    else if (receiverPos === 'bottomRight') receiver = teamA.leftCourt;
    else if (receiverPos === 'bottomLeft') receiver = teamB.rightCourt;
    else receiver = teamB.leftCourt;
  }

  return { server, receiver, serverPos, receiverPos };
}

interface PlayerInfo { name: string; isServer: boolean; isReceiver: boolean; }

function buildCourtPlayers(
  teamA: TeamState, teamB: TeamState,
  server: string, receiver: string, teamAOnLeft: boolean
): { topLeft: PlayerInfo; bottomLeft: PlayerInfo; topRight: PlayerInfo; bottomRight: PlayerInfo } {
  const mk = (name: string): PlayerInfo => ({ name, isServer: name === server, isReceiver: name === receiver });
  return teamAOnLeft
    ? { topLeft: mk(teamA.leftCourt), bottomLeft: mk(teamA.rightCourt), topRight: mk(teamB.rightCourt), bottomRight: mk(teamB.leftCourt) }
    : { topLeft: mk(teamB.leftCourt), bottomLeft: mk(teamB.rightCourt), topRight: mk(teamA.rightCourt), bottomRight: mk(teamA.leftCourt) };
}

function getEventIcon(type: string): string {
  if (type.startsWith('point')) return '●';
  if (type === 'timeout' || type === 'injury_timeout') return '⏸';
  if (type.includes('yellow_card')) return '🟨';
  if (type.includes('red_card')) return '🟥';
  if (type === 'pause') return '⏸';
  if (type === 'resume') return '▶';
  if (type === 'change_ends') return '⇄';
  if (type === 'game_start' || type === 'match_start') return '🏸';
  return '📋';
}

export function LiveMatchScreen({
  tournament, court, matchNumber, category,
  teamAName, teamBName, teamAPlayers, teamBPlayers,
  currentGame, numSets, pointsPerGame,
  gameScores, score, servingTeam,
  teamA, teamB, teamAOnLeft,
  startTime, events, isPaused, canUndo,
  activeBanner, pendingChangeEnds,
  onScorePoint, onEventAction, onConfirmChangeEnds, onSkipChangeEnds,
}: LiveMatchScreenProps) {
  const [elapsed, setElapsed] = useState(0);
  const [showTimeline, setShowTimeline] = useState(false);
  const [bannerVisible, setBannerVisible] = useState(false);
  const bannerRef = useRef<string | null>(null);

  useEffect(() => {
    if (isPaused || pendingChangeEnds) return;
    const interval = setInterval(() => setElapsed(Date.now() - startTime), 500);
    return () => clearInterval(interval);
  }, [startTime, isPaused, pendingChangeEnds]);

  useEffect(() => {
    if (!activeBanner) { bannerRef.current = null; return; }
    if (activeBanner !== bannerRef.current) {
      bannerRef.current = activeBanner;
      setBannerVisible(true);
      const t = setTimeout(() => setBannerVisible(false), 3200);
      return () => clearTimeout(t);
    }
  }, [activeBanner]);

  const { server, receiver } = getServerInfo(score, servingTeam, teamA, teamB, teamAOnLeft);
  const courtPlayers = buildCourtPlayers(teamA, teamB, server, receiver, teamAOnLeft);

  const gpThreshold = pointsPerGame - 1;
  const isGamePoint =
    (score.a >= gpThreshold && score.a > score.b && servingTeam === 'A') ||
    (score.b >= gpThreshold && score.b > score.a && servingTeam === 'B');
  const gamesNeeded = Math.ceil(numSets / 2);
  const isMatchPoint = isGamePoint && (
    (servingTeam === 'A' && gameScores.filter(g => g.a > g.b).length === gamesNeeded - 1) ||
    (servingTeam === 'B' && gameScores.filter(g => g.b > g.a).length === gamesNeeded - 1)
  );

  const serverFirst = server.split(' ')[0];
  const receiverFirst = receiver.split(' ')[0];
  const blocked = isPaused || pendingChangeEnds;

  // Which team is visually on the left/right side of the court?
  // When teamAOnLeft=true: left=A, right=B. When false: left=B, right=A.
  const leftTeam = teamAOnLeft ? 'A' : 'B';
  const rightTeam = teamAOnLeft ? 'B' : 'A';
  const leftTeamName = teamAOnLeft ? teamAName : teamBName;
  const rightTeamName = teamAOnLeft ? teamBName : teamAName;
  const leftPlayers = teamAOnLeft ? teamAPlayers : teamBPlayers;
  const rightPlayers = teamAOnLeft ? teamBPlayers : teamAPlayers;
  const leftScore = teamAOnLeft ? score.a : score.b;
  const rightScore = teamAOnLeft ? score.b : score.a;
  const leftSideServing = servingTeam === leftTeam;
  const teamASideLabel = teamAOnLeft ? 'LEFT' : 'RIGHT';
  const teamBSideLabel = teamAOnLeft ? 'RIGHT' : 'LEFT';

  return (
    <div
      className="size-full flex flex-col"
      style={{ background: '#0F172A', fontFamily: 'Inter, sans-serif', overflow: 'hidden', position: 'relative' }}
    >
      {/* TOP BAR */}
      <div
        className="flex items-center px-4 gap-3"
        style={{ background: '#0B1F3A', borderBottom: '1px solid #1E3A5F', height: 40, flexShrink: 0 }}
      >
        <span style={{ color: '#94A3B8', fontSize: 10, fontWeight: 600 }}>{court}</span>
        <span style={{ color: '#334155' }}>|</span>
        <span style={{ color: '#94A3B8', fontSize: 10, fontWeight: 600 }}>{matchNumber}</span>
        <span style={{ color: '#334155' }}>|</span>
        <span style={{ color: '#CBD5E1', fontSize: 10, fontWeight: 700 }}>Game {currentGame} of {numSets}</span>
        <span style={{ color: '#334155' }}>|</span>
        <span style={{ color: '#64748B', fontSize: 9, fontWeight: 600 }}>{category}</span>
        <span style={{ color: '#334155' }}>|</span>
        <span style={{ color: '#475569', fontSize: 9, fontWeight: 600 }}>{pointsPerGame}pts</span>

        <div className="ml-auto flex items-center gap-3">
          {gameScores.map((gs, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
              <span style={{ color: '#64748B', fontSize: 8, fontWeight: 700 }}>G{i + 1}</span>
              <span style={{ color: gs.a > gs.b ? '#22C55E' : '#94A3B8', fontSize: 10, fontWeight: 800 }}>{gs.a}</span>
              <span style={{ color: '#475569', fontSize: 9 }}>-</span>
              <span style={{ color: gs.b > gs.a ? '#22C55E' : '#94A3B8', fontSize: 10, fontWeight: 800 }}>{gs.b}</span>
            </div>
          ))}

          <div className="flex items-center gap-1.5">
            <Clock size={10} color="#64748B" />
            <span style={{ color: '#CBD5E1', fontSize: 11, fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>
              {formatTime(elapsed)}
            </span>
          </div>

          {isPaused ? (
            <div style={{ background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.35)', borderRadius: 4, padding: '2px 8px', color: '#F59E0B', fontSize: 8, fontWeight: 800, letterSpacing: '0.1em' }}>PAUSED</div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.25)', borderRadius: 4, padding: '2px 8px' }}>
              <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#22C55E', animation: 'pulse-dot 1.5s infinite' }} />
              <span style={{ color: '#22C55E', fontSize: 8, fontWeight: 800, letterSpacing: '0.1em' }}>LIVE</span>
            </div>
          )}

          <button onClick={() => setShowTimeline(t => !t)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: showTimeline ? '#22C55E' : '#64748B', padding: 4 }}>
            <List size={14} />
          </button>
        </div>
      </div>

      {/* MAIN AREA */}
      <div className="flex flex-1" style={{ overflow: 'hidden', minHeight: 0 }}>

        {/* Left side team panel */}
        <TeamPanel
          label={leftTeam === 'A' ? 'TEAM A' : 'TEAM B'}
          subLabel="LEFT SIDE"
          teamName={leftTeamName}
          players={leftPlayers}
          score={leftScore}
          opponentScore={rightScore}
          isServing={leftSideServing}
          server={server}
          receiver={receiver}
          borderSide="right"
          highlightColor={leftTeam === 'A' ? 'rgba(59,130,246,0.04)' : 'rgba(124,58,237,0.04)'}
        />

        {/* Center: service info + court */}
        <div className="flex flex-col flex-1 items-center justify-between" style={{ padding: '6px 8px', gap: 4, overflow: 'hidden' }}>
          <div className="flex items-center gap-3 w-full justify-center">
            <div style={{ background: '#1E293B', border: '1px solid #334155', borderRadius: 6, padding: '3px 10px', display: 'flex', alignItems: 'center', gap: 6, fontSize: 9 }}>
              <div style={{ width: 10, height: 10, borderRadius: 2, background: '#22C55E', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 6, fontWeight: 900, color: '#fff' }}>S</div>
              <span style={{ color: '#94A3B8', fontWeight: 500 }}>{serverFirst}</span>
              <span style={{ color: '#334155' }}>→</span>
              <div style={{ width: 10, height: 10, borderRadius: 2, background: '#F59E0B', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 6, fontWeight: 900, color: '#fff' }}>R</div>
              <span style={{ color: '#94A3B8', fontWeight: 500 }}>{receiverFirst}</span>
            </div>
            {isGamePoint && (
              <div style={{ background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.4)', borderRadius: 6, padding: '3px 10px', color: '#F59E0B', fontSize: 8, fontWeight: 800, letterSpacing: '0.08em', animation: 'pulse-orange 1.5s infinite' }}>
                {isMatchPoint ? 'MATCH POINT' : 'GAME POINT'}
              </div>
            )}
          </div>

          <div className="w-full flex-1" style={{ minHeight: 0 }}>
            <CourtDiagram
              topLeft={courtPlayers.topLeft}
              bottomLeft={courtPlayers.bottomLeft}
              topRight={courtPlayers.topRight}
              bottomRight={courtPlayers.bottomRight}
              servingTeam={servingTeam}
              teamAOnLeft={teamAOnLeft}
            />
          </div>
        </div>

        {/* Right side team panel */}
        <TeamPanel
          label={rightTeam === 'A' ? 'TEAM A' : 'TEAM B'}
          subLabel="RIGHT SIDE"
          teamName={rightTeamName}
          players={rightPlayers}
          score={rightScore}
          opponentScore={leftScore}
          isServing={!leftSideServing}
          server={server}
          receiver={receiver}
          borderSide="left"
          highlightColor={rightTeam === 'A' ? 'rgba(59,130,246,0.04)' : 'rgba(124,58,237,0.04)'}
        />
      </div>

      {/* BOTTOM: Scoring + inline controls */}
      <div style={{ flexShrink: 0, borderTop: '1px solid #1E293B' }}>
        {/* Scoring buttons — swap sides with teamAOnLeft */}
        <div className="flex" style={{ height: 64 }}>
          {/* Left scoring button — always the team currently on the left side */}
          <ScoringButton
            team={leftTeam}
            teamName={leftTeamName}
            score={leftScore}
            blocked={blocked}
            side="left"
            color={leftTeam === 'A' ? 'linear-gradient(135deg, #1D4ED8 0%, #1E40AF 100%)' : 'linear-gradient(135deg, #6D28D9 0%, #7C3AED 100%)'}
            onClick={() => onScorePoint(leftTeam)}
          />

          {/* Center controls: Undo + Pause/Resume */}
          <div
            className="flex flex-col items-center justify-center gap-1"
            style={{ width: 100, flexShrink: 0, background: '#0B1F3A', borderLeft: '1px solid #1E293B', borderRight: '1px solid #1E293B' }}
          >
            <div className="flex gap-1">
              <ControlButton
                icon={<RotateCcw size={13} />}
                label="UNDO"
                disabled={!canUndo || blocked}
                danger
                onClick={() => onEventAction('undo')}
              />
              <ControlButton
                icon={isPaused ? <Play size={13} /> : <Pause size={13} />}
                label={isPaused ? 'RESUME' : 'PAUSE'}
                disabled={pendingChangeEnds}
                onClick={() => onEventAction(isPaused ? 'resume' : 'pause')}
              />
            </div>
          </div>

          {/* Right scoring button — always the team currently on the right side */}
          <ScoringButton
            team={rightTeam}
            teamName={rightTeamName}
            score={rightScore}
            blocked={blocked}
            side="right"
            color={rightTeam === 'A' ? 'linear-gradient(135deg, #1D4ED8 0%, #1E40AF 100%)' : 'linear-gradient(135deg, #6D28D9 0%, #7C3AED 100%)'}
            onClick={() => onScorePoint(rightTeam)}
          />
        </div>
      </div>

      {/* Transient banner */}
      {activeBanner && bannerVisible && !pendingChangeEnds && (
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 40, pointerEvents: 'none' }}>
          <div
            style={{
              background: activeBanner.includes('MATCH') ? 'rgba(34,197,94,0.95)' : activeBanner.includes('GAME') ? 'rgba(59,130,246,0.95)' : 'rgba(245,158,11,0.95)',
              borderRadius: 16, padding: '16px 32px', textAlign: 'center',
              boxShadow: '0 0 60px rgba(0,0,0,0.5)', animation: 'banner-pop 0.3s cubic-bezier(0.34,1.56,0.64,1)',
            }}
          >
            <div style={{ color: '#fff', fontSize: 20, fontWeight: 900, letterSpacing: '0.04em' }}>{activeBanner}</div>
          </div>
        </div>
      )}

      {/* Timeline side drawer */}
      {showTimeline && (
        <div style={{ position: 'absolute', top: 40, right: 0, bottom: 64, width: 220, background: '#0B1F3A', borderLeft: '1px solid #334155', zIndex: 30, display: 'flex', flexDirection: 'column' }}>
          <div className="flex items-center justify-between px-3 py-2" style={{ borderBottom: '1px solid #1E293B' }}>
            <span style={{ color: '#94A3B8', fontSize: 9, fontWeight: 700, letterSpacing: '0.1em' }}>MATCH TIMELINE</span>
            <button onClick={() => setShowTimeline(false)} style={{ color: '#475569', background: 'none', border: 'none', cursor: 'pointer', fontSize: 14 }}>✕</button>
          </div>
          <div style={{ flex: 1, overflowY: 'auto', padding: '6px 8px' }}>
            {[...events].reverse().map(ev => (
              <div key={ev.id} style={{ display: 'flex', gap: 6, padding: '4px 0', borderBottom: '1px solid rgba(30,41,59,0.6)' }}>
                <span style={{ color: '#475569', fontSize: 8, fontVariantNumeric: 'tabular-nums', flexShrink: 0, paddingTop: 1 }}>{formatEventTime(ev.time)}</span>
                <span style={{ fontSize: 10, flexShrink: 0 }}>{getEventIcon(ev.type)}</span>
                <span style={{ color: ev.type === 'change_ends' ? '#86EFAC' : '#94A3B8', fontSize: 9, lineHeight: 1.4 }}>{ev.description}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Change Ends Modal */}
      {pendingChangeEnds && (
        <ChangeEndsModal
          teamAName={teamAName}
          teamBName={teamBName}
          teamAOnLeft={teamAOnLeft}
          score={score}
          currentGame={currentGame}
          onConfirm={onConfirmChangeEnds}
          onSkip={onSkipChangeEnds}
        />
      )}

      <style>{`
        @keyframes pulse-dot { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }
        @keyframes pulse-orange { 0%, 100% { opacity: 1; } 50% { opacity: 0.6; } }
        @keyframes banner-pop { from { transform: scale(0.8); opacity: 0; } to { transform: scale(1); opacity: 1; } }
      `}</style>
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function ScoringButton({ team, teamName, score, blocked, side, color, onClick }: {
  team: 'A' | 'B'; teamName: string; score: number; blocked: boolean; side: 'left' | 'right'; color: string; onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      disabled={blocked}
      style={{
        flex: 1, background: blocked ? '#0B1F3A' : color, border: 'none',
        color: blocked ? '#334155' : '#fff',
        fontSize: 13, fontWeight: 900, fontFamily: 'Inter, sans-serif',
        cursor: blocked ? 'not-allowed' : 'pointer', letterSpacing: '0.05em',
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        transition: 'filter 0.1s',
      }}
      onMouseDown={e => { if (!blocked) e.currentTarget.style.filter = 'brightness(1.2)'; }}
      onMouseUp={e => { e.currentTarget.style.filter = ''; }}
    >
      {side === 'left' && <span style={{ fontSize: 16, opacity: blocked ? 0.3 : 1 }}>◄</span>}
      <span style={{ opacity: blocked ? 0.4 : 1 }}>{teamName.split('/')[0].trim().toUpperCase()} POINT</span>
      <span style={{ fontSize: 20, fontWeight: 900, opacity: blocked ? 0.3 : 1 }}>{score}</span>
      {side === 'right' && <span style={{ fontSize: 16, opacity: blocked ? 0.3 : 1 }}>►</span>}
    </button>
  );
}

function ControlButton({ icon, label, disabled, danger, onClick }: {
  icon: React.ReactNode; label: string; disabled?: boolean; danger?: boolean; onClick: () => void;
}) {
  const activeColor = danger ? '#EF4444' : '#22C55E';
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2,
        width: 44, height: 44, borderRadius: 8,
        background: disabled ? 'rgba(30,41,59,0.4)' : `${activeColor}12`,
        border: `1px solid ${disabled ? 'rgba(71,85,105,0.2)' : activeColor + '35'}`,
        color: disabled ? '#475569' : activeColor,
        cursor: disabled ? 'not-allowed' : 'pointer',
        fontSize: 7, fontWeight: 700, fontFamily: 'Inter, sans-serif', letterSpacing: '0.06em',
        transition: 'all 0.15s',
        opacity: disabled ? 0.5 : 1,
      }}
    >
      {icon}
      {label}
    </button>
  );
}

function TeamPanel({ label, subLabel, teamName, players, score, opponentScore, isServing, server, receiver, borderSide, highlightColor }: {
  label: string; subLabel: string; teamName: string; players: [string, string];
  score: number; opponentScore: number; isServing: boolean; server: string; receiver: string;
  borderSide: 'left' | 'right'; highlightColor: string;
}) {
  return (
    <div
      className="flex flex-col items-center justify-center"
      style={{
        width: '22%', flexShrink: 0,
        background: isServing ? highlightColor : 'transparent',
        borderRight: borderSide === 'right' ? '1px solid #1E293B' : 'none',
        borderLeft: borderSide === 'left' ? '1px solid #1E293B' : 'none',
        padding: '8px 6px', gap: 5,
      }}
    >
      <div style={{ color: '#64748B', fontSize: 8, fontWeight: 700, letterSpacing: '0.1em' }}>{label}</div>
      <div style={{ color: '#475569', fontSize: 7, fontWeight: 600, letterSpacing: '0.08em' }}>{subLabel}</div>
      <div style={{ color: '#94A3B8', fontSize: 9, fontWeight: 600, textAlign: 'center', lineHeight: 1.3 }}>{teamName}</div>
      <div style={{ fontSize: 64, fontWeight: 900, color: score > opponentScore ? '#FFFFFF' : score === opponentScore ? '#CBD5E1' : '#94A3B8', lineHeight: 1, letterSpacing: '-0.04em', fontVariantNumeric: 'tabular-nums' }}>
        {score}
      </div>
      {isServing && (
        <div style={{ background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.3)', borderRadius: 4, padding: '2px 8px', color: '#22C55E', fontSize: 8, fontWeight: 800, letterSpacing: '0.1em' }}>
          SERVING
        </div>
      )}
      <div className="flex flex-col gap-1 w-full mt-1">
        {players.map(p => (
          <div key={p} style={{ display: 'flex', alignItems: 'center', gap: 4, background: p === server || p === receiver ? 'rgba(30,41,59,0.8)' : 'transparent', borderRadius: 4, padding: '2px 4px' }}>
            {p === server && <div style={{ width: 12, height: 12, borderRadius: 2, background: '#22C55E', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 7, fontWeight: 900, color: '#fff', flexShrink: 0 }}>S</div>}
            {p === receiver && <div style={{ width: 12, height: 12, borderRadius: 2, background: '#F59E0B', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 7, fontWeight: 900, color: '#fff', flexShrink: 0 }}>R</div>}
            {p !== server && p !== receiver && <div style={{ width: 12, height: 12, borderRadius: 2, background: '#334155', flexShrink: 0 }} />}
            <span style={{ color: '#94A3B8', fontSize: 8, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.split(' ')[0]}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
