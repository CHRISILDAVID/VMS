import { useReducer, useCallback, useState, useEffect } from 'react';
import { MatchPrepScreen } from './components/MatchPrepScreen';
import { MatchSetupScreen, MatchConfig } from './components/MatchSetupScreen';
import { SetupScreen } from './components/SetupScreen';
import { LiveMatchScreen, MatchEvent } from './components/LiveMatchScreen';
import { MatchCompleteScreen } from './components/MatchCompleteScreen';
import { EventAction } from './components/EventsPanel';

// ─── Pre-filled match data (from organiser dashboard) ────────────────────────

const MATCH = {
  tournament: 'Tamil Nadu State Championship',
  court: 'Court 3',
  matchNumber: 'M42',
  category: "Men's Doubles",
  matchType: 'Best of 3',
  teamAName: 'Arjun / Ravi',
  teamBName: 'Pradeep / Vikram',
  teamAPlayers: ['Arjun Kumar', 'Ravi Shankar'] as [string, string],
  teamBPlayers: ['Pradeep Raj', 'Vikram Singh'] as [string, string],
  // No servingTeamFirst — umpire selects during setup
};

// ─── Types ────────────────────────────────────────────────────────────────────

type Phase =
  | 'prep'
  | 'matchSetup'
  | 'servingTeamSelect'
  | 'serverSelect'
  | 'receiverSelect'
  | 'courtPreview'
  | 'live'
  | 'complete';

interface GameScore { a: number; b: number; }

interface TeamState {
  rightCourt: string;
  leftCourt: string;
}

interface GameSnapshot {
  score: GameScore;
  servingTeam: 'A' | 'B';
  teamA: TeamState;
  teamB: TeamState;
  events: MatchEvent[];
  intervalShown: boolean;
  teamAOnLeft: boolean;
  changeEndsShownThisGame: boolean;
}

interface AppState {
  phase: Phase;

  // Match config (matchSetup screen)
  teamASide: 'left' | 'right';
  pointsPerGame: 15 | 21 | 30;
  numSets: 1 | 3;

  // Setup selections
  servingTeam: 'A' | 'B' | null;  // chosen by umpire
  firstServer: string;
  firstReceiver: string;

  // Live match state
  currentGame: number;
  gameScores: GameScore[];
  score: GameScore;
  teamA: TeamState;
  teamB: TeamState;
  teamAOnLeft: boolean;

  startTime: number;
  events: MatchEvent[];
  isPaused: boolean;
  intervalShown: boolean;
  changeEndsShownThisGame: boolean;
  pendingChangeEnds: boolean;
  activeBanner: string | null;
  winner: 'A' | 'B' | null;
  history: GameSnapshot[];
}

type Action =
  | { type: 'NEXT_PHASE' }
  | { type: 'BACK_PHASE' }
  | { type: 'APPLY_MATCH_CONFIG'; config: MatchConfig }
  | { type: 'SET_SERVING_TEAM'; team: 'A' | 'B' }
  | { type: 'SET_SERVER'; player: string }
  | { type: 'SET_RECEIVER'; player: string }
  | { type: 'START_MATCH' }
  | { type: 'SCORE_POINT'; team: 'A' | 'B' }
  | { type: 'CONFIRM_CHANGE_ENDS' }
  | { type: 'SKIP_CHANGE_ENDS' }
  | { type: 'EVENT_ACTION'; action: EventAction };

// ─── Phase ordering ───────────────────────────────────────────────────────────

const SETUP_PHASES: Phase[] = [
  'prep', 'matchSetup', 'servingTeamSelect', 'serverSelect', 'receiverSelect', 'courtPreview', 'live',
];

// ─── BWF Logic ────────────────────────────────────────────────────────────────

function checkGameWon(score: GameScore, pts: number): 'A' | 'B' | null {
  const { a, b } = score;
  const cap = pts + 9; // deuce cap (30 for 21-pt format, etc.)
  if (a >= cap) return 'A';
  if (b >= cap) return 'B';
  if (a >= pts && a - b >= 2) return 'A';
  if (b >= pts && b - a >= 2) return 'B';
  return null;
}

function halfwayThreshold(pts: number): number {
  return pts === 15 ? 8 : pts === 21 ? 11 : 15;
}

function isGamePoint(score: GameScore, serving: 'A' | 'B', pts: number): boolean {
  const t = pts - 1;
  return serving === 'A' ? score.a >= t && score.a >= score.b : score.b >= t && score.b >= score.a;
}

function isMatchPoint(
  score: GameScore, serving: 'A' | 'B',
  gameScores: GameScore[], numSets: number, pts: number
): boolean {
  if (!isGamePoint(score, serving, pts)) return false;
  const need = Math.ceil(numSets / 2);
  const winsA = gameScores.filter(g => g.a > g.b).length;
  const winsB = gameScores.filter(g => g.b > g.a).length;
  return serving === 'A' ? winsA === need - 1 : winsB === need - 1;
}

function newEvent(type: string, description: string, startTime: number, scorer?: 'A' | 'B'): MatchEvent {
  return { id: `${Date.now()}-${Math.random()}`, type, description, time: Date.now() - startTime, scorer };
}

// ─── Initial positions ────────────────────────────────────────────────────────

function buildInitialPositions(
  firstServer: string,
  firstReceiver: string,
  servingTeam: 'A' | 'B',
  teamAPlayers: [string, string],
  teamBPlayers: [string, string]
): { teamA: TeamState; teamB: TeamState } {
  if (servingTeam === 'A') {
    const partner = teamAPlayers.find(p => p !== firstServer) ?? teamAPlayers[1];
    const bPartner = teamBPlayers.find(p => p !== firstReceiver) ?? teamBPlayers[1];
    return {
      teamA: { rightCourt: firstServer, leftCourt: partner },
      teamB: { rightCourt: firstReceiver, leftCourt: bPartner },
    };
  } else {
    const partner = teamBPlayers.find(p => p !== firstServer) ?? teamBPlayers[1];
    const aPartner = teamAPlayers.find(p => p !== firstReceiver) ?? teamAPlayers[1];
    return {
      teamA: { rightCourt: firstReceiver, leftCourt: aPartner },
      teamB: { rightCourt: firstServer, leftCourt: partner },
    };
  }
}

// ─── Score a rally ────────────────────────────────────────────────────────────

function scorePoint(state: AppState, team: 'A' | 'B'): AppState {
  if (state.isPaused || state.pendingChangeEnds || !state.servingTeam) return state;

  const snapshot: GameSnapshot = {
    score: state.score, servingTeam: state.servingTeam,
    teamA: state.teamA, teamB: state.teamB,
    events: state.events, intervalShown: state.intervalShown,
    teamAOnLeft: state.teamAOnLeft, changeEndsShownThisGame: state.changeEndsShownThisGame,
  };

  let { score, teamA, teamB } = state;
  let servingTeam = state.servingTeam;
  const servingWon = team === servingTeam;

  score = team === 'A' ? { ...score, a: score.a + 1 } : { ...score, b: score.b + 1 };

  if (servingWon) {
    if (team === 'A') teamA = { rightCourt: teamA.leftCourt, leftCourt: teamA.rightCourt };
    else teamB = { rightCourt: teamB.leftCourt, leftCourt: teamB.rightCourt };
  } else {
    servingTeam = team;
  }

  let activeBanner: string | null = null;
  let intervalShown = state.intervalShown;

  // BWF 11-point service interval
  const leadScore = team === 'A' ? score.a : score.b;
  if (!intervalShown && leadScore === 11) {
    activeBanner = '11 POINT INTERVAL';
    intervalShown = true;
  }

  // Halftime Change Ends
  const halfPt = halfwayThreshold(state.pointsPerGame);
  const maxScore = Math.max(score.a, score.b);
  let changeEndsShownThisGame = state.changeEndsShownThisGame;
  let pendingChangeEnds = false;

  if (!changeEndsShownThisGame && maxScore >= halfPt) {
    pendingChangeEnds = true;
    changeEndsShownThisGame = true;
    activeBanner = null;
  }

  if (!pendingChangeEnds && !activeBanner) {
    if (isMatchPoint(score, servingTeam, state.gameScores, state.numSets, state.pointsPerGame))
      activeBanner = 'MATCH POINT';
    else if (isGamePoint(score, servingTeam, state.pointsPerGame))
      activeBanner = 'GAME POINT';
  }

  let events = [...state.events];
  events.push(newEvent('point_' + team, `${team === 'A' ? MATCH.teamAName : MATCH.teamBName} — ${score.a}–${score.b}`, state.startTime, team));

  const gameWinner = checkGameWon(score, state.pointsPerGame);
  let { currentGame, gameScores } = state;

  if (gameWinner) {
    const newGameScores = [...gameScores, { ...score }];
    const need = Math.ceil(state.numSets / 2);
    const aWins = newGameScores.filter(g => g.a > g.b).length;
    const bWins = newGameScores.filter(g => g.b > g.a).length;

    if (aWins >= need) {
      events.push(newEvent('game_end', `Match won: ${MATCH.teamAName}`, state.startTime));
      return { ...state, score, servingTeam, teamA, teamB, gameScores: newGameScores, events, intervalShown, changeEndsShownThisGame, pendingChangeEnds: false, history: [...state.history.slice(-9), snapshot], activeBanner: `🏆 MATCH WON — ${MATCH.teamAName.toUpperCase()}`, winner: 'A', phase: 'complete' };
    }
    if (bWins >= need) {
      events.push(newEvent('game_end', `Match won: ${MATCH.teamBName}`, state.startTime));
      return { ...state, score, servingTeam, teamA, teamB, gameScores: newGameScores, events, intervalShown, changeEndsShownThisGame, pendingChangeEnds: false, history: [...state.history.slice(-9), snapshot], activeBanner: `🏆 MATCH WON — ${MATCH.teamBName.toUpperCase()}`, winner: 'B', phase: 'complete' };
    }

    events.push(newEvent('game_start', `Game ${currentGame + 1} started`, state.startTime));
    return {
      ...state, score: { a: 0, b: 0 }, servingTeam: gameWinner, teamA, teamB,
      gameScores: newGameScores, currentGame: currentGame + 1,
      intervalShown: false, changeEndsShownThisGame: false, pendingChangeEnds: false,
      activeBanner: `GAME ${currentGame} WON — ${gameWinner === 'A' ? MATCH.teamAName.toUpperCase() : MATCH.teamBName.toUpperCase()}`,
      events, history: [...state.history.slice(-9), snapshot], winner: null,
    };
  }

  return { ...state, score, servingTeam, teamA, teamB, activeBanner, events, intervalShown, changeEndsShownThisGame, pendingChangeEnds, history: [...state.history.slice(-9), snapshot] };
}

// ─── Reducer ──────────────────────────────────────────────────────────────────

function initialState(): AppState {
  return {
    phase: 'prep',
    teamASide: 'left', pointsPerGame: 21, numSets: 3,
    servingTeam: null, firstServer: '', firstReceiver: '',
    currentGame: 1, gameScores: [],
    score: { a: 0, b: 0 },
    teamA: { rightCourt: '', leftCourt: '' },
    teamB: { rightCourt: '', leftCourt: '' },
    teamAOnLeft: true, startTime: 0,
    events: [], isPaused: false,
    intervalShown: false, changeEndsShownThisGame: false,
    pendingChangeEnds: false, activeBanner: null, winner: null, history: [],
  };
}

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {

    case 'NEXT_PHASE': {
      const idx = SETUP_PHASES.indexOf(state.phase);
      if (idx < 0 || idx >= SETUP_PHASES.length - 1) return state;
      return { ...state, phase: SETUP_PHASES[idx + 1] };
    }

    case 'BACK_PHASE': {
      const idx = SETUP_PHASES.indexOf(state.phase);
      if (idx <= 0) return state;
      return { ...state, phase: SETUP_PHASES[idx - 1] };
    }

    case 'APPLY_MATCH_CONFIG': {
      const { teamASide, pointsPerGame, numSets } = action.config;
      return {
        ...state,
        teamASide, pointsPerGame, numSets,
        teamAOnLeft: teamASide === 'left',
        phase: 'servingTeamSelect',
      };
    }

    case 'SET_SERVING_TEAM':
      return { ...state, servingTeam: action.team, firstServer: '', firstReceiver: '' };

    case 'SET_SERVER':
      return { ...state, firstServer: action.player };

    case 'SET_RECEIVER':
      return { ...state, firstReceiver: action.player };

    case 'START_MATCH': {
      if (!state.servingTeam) return state;
      const { teamA, teamB } = buildInitialPositions(
        state.firstServer, state.firstReceiver, state.servingTeam,
        MATCH.teamAPlayers, MATCH.teamBPlayers
      );
      const now = Date.now();
      return {
        ...state, phase: 'live',
        teamA, teamB,
        startTime: now,
        score: { a: 0, b: 0 },
        servingTeam: state.servingTeam,
        teamAOnLeft: state.teamASide === 'left',
        events: [newEvent('match_start', `Match started · ${state.pointsPerGame}pts · Best of ${state.numSets}`, now)],
      };
    }

    case 'SCORE_POINT':
      return scorePoint(state, action.team);

    case 'CONFIRM_CHANGE_ENDS': {
      const events = [
        ...state.events,
        newEvent('change_ends', `Court sides changed at halftime (${state.score.a}–${state.score.b})`, state.startTime),
      ];
      return { ...state, teamAOnLeft: !state.teamAOnLeft, pendingChangeEnds: false, activeBanner: 'CHANGE ENDS ✓', events };
    }

    case 'SKIP_CHANGE_ENDS':
      return { ...state, pendingChangeEnds: false };

    case 'EVENT_ACTION': {
      const { action: ev } = action;
      const events = [...state.events];

      if (ev === 'undo') {
        if (!state.history.length) return state;
        const prev = state.history[state.history.length - 1];
        return { ...state, score: prev.score, servingTeam: prev.servingTeam, teamA: prev.teamA, teamB: prev.teamB, events: prev.events, intervalShown: prev.intervalShown, teamAOnLeft: prev.teamAOnLeft, changeEndsShownThisGame: prev.changeEndsShownThisGame, history: state.history.slice(0, -1), activeBanner: null, pendingChangeEnds: false };
      }
      if (ev === 'pause') {
        events.push(newEvent('pause', 'Match paused', state.startTime));
        return { ...state, isPaused: true, events };
      }
      if (ev === 'resume') {
        events.push(newEvent('resume', 'Match resumed', state.startTime));
        return { ...state, isPaused: false, events };
      }
      if (ev === 'injury_timeout') {
        events.push(newEvent('timeout', 'Injury timeout', state.startTime));
        return { ...state, isPaused: true, events, activeBanner: 'INJURY TIMEOUT' };
      }
      if (ev === 'yellow_card_a') { events.push(newEvent('yellow_card_a', `Yellow card — ${MATCH.teamAName}`, state.startTime)); return { ...state, events, activeBanner: `YELLOW CARD — ${MATCH.teamAName.toUpperCase()}` }; }
      if (ev === 'yellow_card_b') { events.push(newEvent('yellow_card_b', `Yellow card — ${MATCH.teamBName}`, state.startTime)); return { ...state, events, activeBanner: `YELLOW CARD — ${MATCH.teamBName.toUpperCase()}` }; }
      if (ev === 'red_card_a') { events.push(newEvent('red_card_a', `Red card — ${MATCH.teamAName}`, state.startTime)); return { ...state, events, activeBanner: `RED CARD — ${MATCH.teamAName.toUpperCase()}` }; }
      if (ev === 'red_card_b') { events.push(newEvent('red_card_b', `Red card — ${MATCH.teamBName}`, state.startTime)); return { ...state, events, activeBanner: `RED CARD — ${MATCH.teamBName.toUpperCase()}` }; }
      if (ev === 'official_note') { events.push(newEvent('note', 'Official note recorded', state.startTime)); return { ...state, events }; }
      return state;
    }

    default:
      return state;
  }
}

// ─── App ──────────────────────────────────────────────────────────────────────

// ─── Portrait warning screen ──────────────────────────────────────────────────

function PortraitWarning() {
  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: '#0F172A',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        gap: 24, padding: 32, fontFamily: 'Inter, sans-serif',
      }}
    >
      {/* Animated rotate-device icon */}
      <div style={{ animation: 'rotate-hint 2s ease-in-out infinite' }}>
        <svg width="72" height="72" viewBox="0 0 72 72" fill="none">
          {/* Phone outline in portrait */}
          <rect x="22" y="8" width="28" height="48" rx="5" stroke="#334155" strokeWidth="2.5" fill="none" />
          <rect x="29" y="52" width="14" height="2" rx="1" fill="#334155" />
          {/* Arrow curving to landscape */}
          <path
            d="M 58 28 C 64 28 68 34 68 42 C 68 50 62 56 54 56"
            stroke="#22C55E" strokeWidth="2.5" fill="none"
            strokeLinecap="round"
          />
          <polyline points="50,52 54,56 50,60" stroke="#22C55E" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        </svg>
      </div>

      <div style={{ textAlign: 'center', maxWidth: 280 }}>
        <div style={{ color: '#FFFFFF', fontSize: 15, fontWeight: 700, lineHeight: 1.5, marginBottom: 8 }}>
          Please rotate your device to Landscape for the best umpiring experience.
        </div>
        <div
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            color: '#64748B', fontSize: 11, fontWeight: 600,
          }}
        >
          <span
            style={{
              display: 'inline-block', width: 6, height: 6, borderRadius: '50%',
              background: '#22C55E', animation: 'pulse-dot 1.5s infinite',
            }}
          />
          Waiting for Landscape Orientation…
        </div>
      </div>

      <style>{`
        @keyframes rotate-hint {
          0%, 100% { transform: rotate(0deg); }
          40% { transform: rotate(-15deg); }
          60% { transform: rotate(15deg); }
        }
        @keyframes pulse-dot {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
      `}</style>
    </div>
  );
}

// ─── App ──────────────────────────────────────────────────────────────────────

export default function App() {
  const [state, dispatch] = useReducer(reducer, undefined, initialState);

  // Portrait detection — only blocks on narrow screens (mobile/tablet)
  const [isPortrait, setIsPortrait] = useState(() =>
    typeof window !== 'undefined' && window.matchMedia('(orientation: portrait)').matches
  );

  useEffect(() => {
    const mq = window.matchMedia('(orientation: portrait)');
    const handler = (e: MediaQueryListEvent) => setIsPortrait(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  const handleScorePoint = useCallback((team: 'A' | 'B') => dispatch({ type: 'SCORE_POINT', team }), []);
  const handleEventAction = useCallback((action: EventAction) => dispatch({ type: 'EVENT_ACTION', action }), []);
  const handleConfirmChangeEnds = useCallback(() => dispatch({ type: 'CONFIRM_CHANGE_ENDS' }), []);
  const handleSkipChangeEnds = useCallback(() => dispatch({ type: 'SKIP_CHANGE_ENDS' }), []);

  // Show portrait warning on narrow screens in portrait orientation
  if (isPortrait) return <PortraitWarning />;

  if (state.phase === 'prep') {
    return (
      <MatchPrepScreen
        data={{
          tournament: MATCH.tournament, court: MATCH.court, matchNumber: MATCH.matchNumber,
          category: MATCH.category, matchType: MATCH.matchType,
          teamAName: MATCH.teamAName, teamBName: MATCH.teamBName,
          teamAPlayers: MATCH.teamAPlayers, teamBPlayers: MATCH.teamBPlayers,
        }}
        onContinue={() => dispatch({ type: 'NEXT_PHASE' })}
      />
    );
  }

  if (state.phase === 'matchSetup') {
    return (
      <MatchSetupScreen
        teamAName={MATCH.teamAName}
        teamBName={MATCH.teamBName}
        onBack={() => dispatch({ type: 'BACK_PHASE' })}
        onContinue={(config) => dispatch({ type: 'APPLY_MATCH_CONFIG', config })}
      />
    );
  }

  // SetupScreen handles: servingTeamSelect, serverSelect, receiverSelect, courtPreview
  if (
    state.phase === 'servingTeamSelect' ||
    state.phase === 'serverSelect' ||
    state.phase === 'receiverSelect' ||
    state.phase === 'courtPreview'
  ) {
    return (
      <SetupScreen
        teamAPlayers={MATCH.teamAPlayers}
        teamBPlayers={MATCH.teamBPlayers}
        teamAName={MATCH.teamAName}
        teamBName={MATCH.teamBName}
        phase={state.phase as any}
        servingTeam={state.servingTeam}
        firstServer={state.firstServer}
        firstReceiver={state.firstReceiver}
        onSelectServingTeam={(team) => {
          dispatch({ type: 'SET_SERVING_TEAM', team });
          dispatch({ type: 'NEXT_PHASE' });
        }}
        onSelectServer={(p) => dispatch({ type: 'SET_SERVER', player: p })}
        onSelectReceiver={(p) => dispatch({ type: 'SET_RECEIVER', player: p })}
        onBack={() => dispatch({ type: 'BACK_PHASE' })}
        onNext={() => dispatch({ type: 'NEXT_PHASE' })}
        onStartMatch={() => dispatch({ type: 'START_MATCH' })}
      />
    );
  }

  if (state.phase === 'live' && state.servingTeam) {
    return (
      <LiveMatchScreen
        tournament={MATCH.tournament}
        court={MATCH.court}
        matchNumber={MATCH.matchNumber}
        category={MATCH.category}
        teamAName={MATCH.teamAName}
        teamBName={MATCH.teamBName}
        teamAPlayers={MATCH.teamAPlayers}
        teamBPlayers={MATCH.teamBPlayers}
        currentGame={state.currentGame}
        numSets={state.numSets}
        pointsPerGame={state.pointsPerGame}
        gameScores={state.gameScores}
        score={state.score}
        servingTeam={state.servingTeam}
        teamA={state.teamA}
        teamB={state.teamB}
        teamAOnLeft={state.teamAOnLeft}
        startTime={state.startTime}
        events={state.events}
        isPaused={state.isPaused}
        canUndo={state.history.length > 0}
        activeBanner={state.activeBanner}
        pendingChangeEnds={state.pendingChangeEnds}
        onScorePoint={handleScorePoint}
        onEventAction={handleEventAction}
        onConfirmChangeEnds={handleConfirmChangeEnds}
        onSkipChangeEnds={handleSkipChangeEnds}
      />
    );
  }

  if (state.phase === 'complete' && state.winner) {
    return (
      <MatchCompleteScreen
        winner={state.winner}
        teamAName={MATCH.teamAName}
        teamBName={MATCH.teamBName}
        teamAPlayers={MATCH.teamAPlayers}
        teamBPlayers={MATCH.teamBPlayers}
        gameScores={state.gameScores}
        duration={Math.floor((Date.now() - state.startTime) / 1000)}
        teamAStartSide={state.teamASide}
        pointsPerGame={state.pointsPerGame}
        numSets={state.numSets}
        onSubmit={() => {}}
      />
    );
  }

  return null;
}
