import { useState, useRef } from "react";
import {
  Trophy,
  Calendar,
  MapPin,
  Users,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Wifi,
  Clock,
  Star,
  Filter,
  Target,
  Award,
  TrendingUp,
  Search,
} from "lucide-react";

const tournaments = [
  {
    id: 1,
    name: "BWF World Championships 2025",
    status: "LIVE",
    location: "Tokyo, Japan",
    dates: "Aug 5–11, 2025",
    prize: "$1,200,000",
    category: "International",
    players: 128,
    registered: true,
    image: "https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=600&h=300&fit=crop&auto=format",
    format: "Knockout",
    level: "Elite",
  },
  {
    id: 2,
    name: "KL Open Masters 2025",
    status: "OPEN",
    location: "Kuala Lumpur, MY",
    dates: "Aug 14–20, 2025",
    prize: "$250,000",
    category: "National",
    players: 64,
    registered: false,
    image: "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=600&h=300&fit=crop&auto=format",
    format: "Group + Knockout",
    level: "Advanced",
  },
  {
    id: 3,
    name: "Community Sunday League",
    status: "OPEN",
    location: "Cheras, KL",
    dates: "Every Sunday",
    prize: "RM 500",
    category: "Community",
    players: 32,
    registered: false,
    image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&h=300&fit=crop&auto=format",
    format: "Round Robin",
    level: "All Levels",
  },
  {
    id: 4,
    name: "Selangor State Championships",
    status: "UPCOMING",
    location: "Shah Alam, MY",
    dates: "Sep 2–5, 2025",
    prize: "RM 15,000",
    category: "State",
    players: 96,
    registered: false,
    image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=600&h=300&fit=crop&auto=format",
    format: "Knockout",
    level: "Intermediate+",
  },
];

const liveMatches = [
  {
    id: 1,
    matchNum: 3,
    category: "XD",
    round: "R16",
    court: "Court 3",
    timer: "00:56",
    playerA: "Chen T J / C San",
    playerB: "R Oupthong / J Sudjaipraparat",
    gamesA: [21, 12, 16],
    gamesB: [17, 21, 21],
    currentGameIdx: 2,
    servingA: false,
  },
  {
    id: 2,
    matchNum: 7,
    category: "MS",
    round: "QF",
    court: "Court 1",
    timer: "34:12",
    playerA: "Lee Zii Jia",
    playerB: "Viktor Axelsen",
    gamesA: [21, 18, 14],
    gamesB: [19, 21, 11],
    currentGameIdx: 2,
    servingA: true,
  },
  {
    id: 3,
    matchNum: 12,
    category: "WS",
    round: "SF",
    court: "Court 2",
    timer: "52:44",
    playerA: "An Se Young",
    playerB: "Tai Tzu Ying",
    gamesA: [21, 15, 8],
    gamesB: [14, 21, 6],
    currentGameIdx: 2,
    servingA: true,
  },
];

const fixtures = [
  { time: "14:00", player1: "Marcus/Kevin", player2: "Fajar/Rian", court: "Court 3", round: "QF" },
  { time: "15:30", player1: "Carolina Marin", player2: "Chen Yu Fei", court: "Court 1", round: "SF" },
  { time: "17:00", player1: "Zheng/Huang", player2: "Gideon/Sukamuljo", court: "Court 2", round: "QF" },
];

type MatchStatus = "completed" | "live" | "upcoming";

const courtMatches = [
  {
    court: "Court 1",
    matches: [
      {
        matchNum: 1, category: "MS", round: "QF", status: "completed" as MatchStatus,
        time: "09:00", duration: "45:23",
        playerA: { name: "Lee Zii Jia", id: "#SH-00001" },
        playerB: { name: "Chou Tien Chen", id: "#SH-00032" },
        gamesA: [21, 18, 21], gamesB: [18, 21, 16], winner: "A" as "A" | "B" | null,
        currentGameIdx: 2,
      },
      {
        matchNum: 5, category: "WS", round: "SF", status: "live" as MatchStatus,
        time: "11:30", duration: "34:12",
        playerA: { name: "An Se Young", id: "#SH-00005" },
        playerB: { name: "Tai Tzu Ying", id: "#SH-00010" },
        gamesA: [21, 15, 8], gamesB: [14, 21, 6], winner: null as "A" | "B" | null,
        currentGameIdx: 2,
      },
      {
        matchNum: 9, category: "MS", round: "F", status: "upcoming" as MatchStatus,
        time: "14:00", duration: "",
        playerA: { name: "Viktor Axelsen", id: "#SH-00002" },
        playerB: { name: "TBD", id: "" },
        gamesA: [], gamesB: [], winner: null as "A" | "B" | null,
        currentGameIdx: 0,
      },
      {
        matchNum: 13, category: "XD", round: "QF", status: "upcoming" as MatchStatus,
        time: "15:30", duration: "",
        playerA: { name: "Zheng / Si Wei", id: "#SH-00044" },
        playerB: { name: "Chan / Peck", id: "#SH-00067" },
        gamesA: [], gamesB: [], winner: null as "A" | "B" | null,
        currentGameIdx: 0,
      },
      {
        matchNum: 17, category: "MD", round: "R16", status: "completed" as MatchStatus,
        time: "08:00", duration: "38:50",
        playerA: { name: "Marcus / Kevin", id: "#SH-00007" },
        playerB: { name: "Fajar / Rian", id: "#SH-00008" },
        gamesA: [21, 17], gamesB: [17, 14], winner: "A" as "A" | "B" | null,
        currentGameIdx: 1,
      },
    ],
  },
  {
    court: "Court 2",
    matches: [
      {
        matchNum: 2, category: "WD", round: "QF", status: "completed" as MatchStatus,
        time: "09:00", duration: "52:11",
        playerA: { name: "Chen / Jia", id: "#SH-00020" },
        playerB: { name: "Matsuyama / Shida", id: "#SH-00021" },
        gamesA: [21, 19, 21], gamesB: [18, 21, 17], winner: "A" as "A" | "B" | null,
        currentGameIdx: 2,
      },
      {
        matchNum: 6, category: "MS", round: "QF", status: "live" as MatchStatus,
        time: "11:00", duration: "28:06",
        playerA: { name: "Viktor Axelsen", id: "#SH-00002" },
        playerB: { name: "Kodai Naraoka", id: "#SH-00003" },
        gamesA: [21, 14], gamesB: [19, 12], winner: null as "A" | "B" | null,
        currentGameIdx: 1,
      },
      {
        matchNum: 10, category: "WS", round: "QF", status: "upcoming" as MatchStatus,
        time: "13:00", duration: "",
        playerA: { name: "Carolina Marin", id: "#SH-00011" },
        playerB: { name: "Chen Yu Fei", id: "#SH-00012" },
        gamesA: [], gamesB: [], winner: null as "A" | "B" | null,
        currentGameIdx: 0,
      },
      {
        matchNum: 14, category: "MD", round: "SF", status: "upcoming" as MatchStatus,
        time: "15:00", duration: "",
        playerA: { name: "Gideon / Sukamuljo", id: "#SH-00009" },
        playerB: { name: "TBD", id: "" },
        gamesA: [], gamesB: [], winner: null as "A" | "B" | null,
        currentGameIdx: 0,
      },
      {
        matchNum: 18, category: "XD", round: "SF", status: "completed" as MatchStatus,
        time: "07:30", duration: "41:18",
        playerA: { name: "R Oupthong / J Sudjaipr", id: "#SH-00030" },
        playerB: { name: "Chen T J / C San", id: "#SH-00031" },
        gamesA: [17, 21, 21], gamesB: [21, 12, 16], winner: "A" as "A" | "B" | null,
        currentGameIdx: 2,
      },
    ],
  },
  {
    court: "Court 3",
    matches: [
      {
        matchNum: 3, category: "XD", round: "R16", status: "completed" as MatchStatus,
        time: "09:30", duration: "39:44",
        playerA: { name: "Loh Kean Yew", id: "#SH-00015" },
        playerB: { name: "Shi Yu Qi", id: "#SH-00016" },
        gamesA: [21, 21], gamesB: [17, 19], winner: "A" as "A" | "B" | null,
        currentGameIdx: 1,
      },
      {
        matchNum: 7, category: "WS", round: "R16", status: "completed" as MatchStatus,
        time: "10:30", duration: "30:22",
        playerA: { name: "Ratchanok Intanon", id: "#SH-00013" },
        playerB: { name: "Nozomi Okuhara", id: "#SH-00014" },
        gamesA: [21, 18], gamesB: [15, 21], winner: "A" as "A" | "B" | null,
        currentGameIdx: 1,
      },
      {
        matchNum: 11, category: "MS", round: "QF", status: "upcoming" as MatchStatus,
        time: "12:30", duration: "",
        playerA: { name: "Chou Tien Chen", id: "#SH-00032" },
        playerB: { name: "TBD", id: "" },
        gamesA: [], gamesB: [], winner: null as "A" | "B" | null,
        currentGameIdx: 0,
      },
      {
        matchNum: 15, category: "WD", round: "SF", status: "upcoming" as MatchStatus,
        time: "14:30", duration: "",
        playerA: { name: "Fukushima / Hirota", id: "#SH-00025" },
        playerB: { name: "TBD", id: "" },
        gamesA: [], gamesB: [], winner: null as "A" | "B" | null,
        currentGameIdx: 0,
      },
      {
        matchNum: 19, category: "MD", round: "QF", status: "upcoming" as MatchStatus,
        time: "16:30", duration: "",
        playerA: { name: "TBD", id: "" },
        playerB: { name: "TBD", id: "" },
        gamesA: [], gamesB: [], winner: null as "A" | "B" | null,
        currentGameIdx: 0,
      },
    ],
  },
];

const poolStandings = [
  {
    id: "A",
    qualifyCount: 2,
    teams: [
      { rank: 1, name: "Lee Zii Jia", played: 3, wins: 3, losses: 0, points: 6, diff: +9, qualified: true },
      { rank: 2, name: "Viktor Axelsen", played: 3, wins: 2, losses: 1, points: 4, diff: +3, qualified: true },
      { rank: 3, name: "Kodai Naraoka", played: 3, wins: 1, losses: 2, points: 2, diff: -4, qualified: false },
      { rank: 4, name: "Chou Tien Chen", played: 3, wins: 0, losses: 3, points: 0, diff: -8, qualified: false },
    ],
  },
  {
    id: "B",
    qualifyCount: 2,
    teams: [
      { rank: 1, name: "An Se Young", played: 3, wins: 3, losses: 0, points: 6, diff: +11, qualified: true },
      { rank: 2, name: "Tai Tzu Ying", played: 3, wins: 2, losses: 1, points: 4, diff: +2, qualified: true },
      { rank: 3, name: "Carolina Marin", played: 3, wins: 1, losses: 2, points: 2, diff: -5, qualified: false },
      { rank: 4, name: "Chen Yu Fei", played: 3, wins: 0, losses: 3, points: 0, diff: -8, qualified: false },
    ],
  },
  {
    id: "C",
    qualifyCount: 2,
    teams: [
      { rank: 1, name: "Marcus / Kevin", played: 3, wins: 3, losses: 0, points: 6, diff: +7, qualified: true },
      { rank: 2, name: "Fajar / Rian", played: 3, wins: 2, losses: 1, points: 4, diff: +1, qualified: true },
      { rank: 3, name: "Gideon / Sukamuljo", played: 3, wins: 1, losses: 2, points: 2, diff: -3, qualified: false },
      { rank: 4, name: "Zheng / Huang", played: 3, wins: 0, losses: 3, points: 0, diff: -5, qualified: false },
    ],
  },
];

const statsData = [
  { name: "QF", points: 12 },
  { name: "SF", points: 18 },
  { name: "F", points: 25 },
  { name: "W", points: 35 },
];

type TTabs = "overview" | "live" | "draw" | "matches" | "standings";

interface TournamentsScreenProps {
  onViewPlayer?: () => void;
  onRegister?: (t: typeof tournaments[0]) => void;
}

export function TournamentsScreen({ onViewPlayer, onRegister }: TournamentsScreenProps) {
  const [viewMode, setViewMode] = useState<"list" | "detail">("list");
  const [selectedTournament, setSelectedTournament] = useState(tournaments[0]);
  const [tTab, setTTab] = useState<TTabs>("overview");
  const [filterCat, setFilterCat] = useState("All");
  const [expandedPool, setExpandedPool] = useState<string | null>("A");
  const [expandedCourt, setExpandedCourt] = useState<string | null>("Court 1");
  const [matchSearch, setMatchSearch] = useState("");
  const [drawSearch, setDrawSearch] = useState("");
  const [selectedRound, setSelectedRound] = useState("r16");
  const bracketScrollRef = useRef<HTMLDivElement>(null);

  const statusColors: Record<string, { bg: string; text: string }> = {
    LIVE: { bg: "#EF4444", text: "#fff" },
    OPEN: { bg: "#10B981", text: "#fff" },
    UPCOMING: { bg: "#F59E0B", text: "#fff" },
    CLOSED: { bg: "#6B7280", text: "#fff" },
  };

  if (viewMode === "detail") {
    const tabsList: { id: TTabs; label: string }[] = [
      { id: "overview", label: "Overview" },
      { id: "live", label: "Live" },
      { id: "matches", label: "Matches" },
      { id: "standings", label: "Standings" },
      { id: "draw", label: "Draw" },
    ];

    return (
      <div className="p-4 lg:p-6 flex flex-col gap-5 lg:gap-6" style={{ backgroundColor: "var(--background)", minHeight: "100vh" }}>
        {/* Back + Header */}
        <button
          onClick={() => setViewMode("list")}
          className="flex items-center gap-2 text-sm"
          style={{ color: "var(--muted-foreground)" }}
        >
          ← Back to Tournaments
        </button>

        {/* Tournament Hero */}
        <div
          className="relative overflow-hidden rounded-2xl"
          style={{ height: 200 }}
        >
          <img
            src={selectedTournament.image}
            alt={selectedTournament.name}
            className="w-full h-full object-cover"
          />
          <div
            className="absolute inset-0"
            style={{ background: "linear-gradient(90deg, rgba(11,31,58,0.9) 0%, rgba(11,31,58,0.4) 100%)" }}
          />
          <div className="absolute inset-0 p-6 flex flex-col justify-between">
            <div className="flex items-center gap-3">
              <span
                className="text-xs font-bold px-3 py-1 rounded-full tracking-widest"
                style={{
                  backgroundColor: statusColors[selectedTournament.status]?.bg,
                  color: statusColors[selectedTournament.status]?.text,
                }}
              >
                {selectedTournament.status === "LIVE" && "● "}
                {selectedTournament.status}
              </span>
              <span className="text-white text-sm" style={{ opacity: 0.7 }}>
                {selectedTournament.level} · {selectedTournament.format}
              </span>
            </div>
            <div>
              <h2 className="text-white mb-2" style={{ fontSize: 24, fontWeight: 700 }}>
                {selectedTournament.name}
              </h2>
              <div className="flex items-center gap-5 text-sm" style={{ color: "rgba(255,255,255,0.7)" }}>
                <span className="flex items-center gap-1.5">
                  <MapPin size={13} />{selectedTournament.location}
                </span>
                <span className="flex items-center gap-1.5">
                  <Calendar size={13} />{selectedTournament.dates}
                </span>
                <span className="flex items-center gap-1.5">
                  <Trophy size={13} />{selectedTournament.prize}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 5-tab fixed segmented nav — no scroll */}
        <div
          className="grid rounded-2xl p-1"
          style={{
            gridTemplateColumns: `repeat(${tabsList.length}, 1fr)`,
            backgroundColor: "var(--muted)",
            border: "1px solid var(--border)",
          }}
        >
          {tabsList.map(({ id, label }) => (
            <button
              key={id}
              onClick={() => setTTab(id)}
              className="relative flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm transition-all"
              style={{
                backgroundColor: tTab === id ? "var(--navy)" : "transparent",
                color: tTab === id ? "var(--lime)" : "var(--muted-foreground)",
                fontWeight: tTab === id ? 700 : 400,
              }}
            >
              {label}
              {id === "live" && (
                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: "var(--live-red)" }} />
              )}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {tTab === "overview" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            <div className="col-span-1 lg:col-span-2 flex flex-col gap-5">
              {/* Stats */}
              <div className="grid grid-cols-3 gap-4">
                {[
                  { label: "Total Players", value: selectedTournament.players, icon: Users },
                  { label: "Prize Pool", value: selectedTournament.prize, icon: Trophy },
                  { label: "Courts Active", value: "4", icon: Target },
                ].map(({ label, value, icon: Icon }) => (
                  <div
                    key={label}
                    className="p-4 rounded-2xl"
                    style={{ backgroundColor: "var(--card)", border: "1px solid var(--border)" }}
                  >
                    <Icon size={20} style={{ color: "var(--navy)" }} className="mb-3" />
                    <p className="text-xl font-bold" style={{ color: "var(--foreground)" }}>{value}</p>
                    <p className="text-xs mt-1" style={{ color: "var(--muted-foreground)" }}>{label}</p>
                  </div>
                ))}
              </div>
              {/* Points breakdown */}
              <div
                className="p-5 rounded-2xl"
                style={{ backgroundColor: "var(--card)", border: "1px solid var(--border)" }}
              >
                <h3 className="text-sm font-semibold mb-4" style={{ color: "var(--foreground)" }}>
                  Points Distribution
                </h3>
                {(() => {
                  const h = 160, padL = 28, padB = 24, padT = 8, padR = 8;
                  const maxVal = Math.max(...statsData.map(d => d.points));
                  const chartH = h - padT - padB;
                  const barW = 28;
                  const step = (300 - padL - padR) / statsData.length;
                  return (
                    <svg width="100%" height={h} viewBox={`0 0 300 ${h}`} preserveAspectRatio="xMidYMid meet">
                      {[0, Math.round(maxVal/2), maxVal].map((v) => {
                        const y = padT + chartH - (v / maxVal) * chartH;
                        return (
                          <g key={v}>
                            <line x1={padL} x2={300 - padR} y1={y} y2={y} stroke="var(--border)" strokeWidth={0.5} />
                            <text x={padL - 4} y={y + 4} textAnchor="end" fontSize={9} fill="var(--muted-foreground)">{v}</text>
                          </g>
                        );
                      })}
                      {statsData.map((d, i) => {
                        const bh = (d.points / maxVal) * chartH;
                        const x = padL + i * step + (step - barW) / 2;
                        const y = padT + chartH - bh;
                        return (
                          <g key={d.name}>
                            <rect x={x} y={y} width={barW} height={bh} rx={5} fill="var(--navy)" />
                            <text x={x + barW / 2} y={h - 6} textAnchor="middle" fontSize={10} fill="var(--muted-foreground)">{d.name}</text>
                          </g>
                        );
                      })}
                    </svg>
                  );
                })()}
              </div>
            </div>
            <div className="flex flex-col gap-4">
              {/* Registration CTA */}
              {!selectedTournament.registered && (
                <div
                  className="p-5 rounded-2xl"
                  style={{
                    background: "linear-gradient(145deg, var(--navy) 0%, #162D52 100%)",
                  }}
                >
                  <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: "var(--lime)" }}>
                    Registration Open
                  </p>
                  <p className="text-white mb-4" style={{ fontSize: 15, fontWeight: 600 }}>
                    Join {selectedTournament.name}
                  </p>
                  <button
                    onClick={() => onRegister?.(selectedTournament)}
                    className="w-full py-3 rounded-xl text-sm font-bold"
                    style={{ backgroundColor: "var(--lime)", color: "var(--navy)" }}
                  >
                    Register Now →
                  </button>
                </div>
              )}
              {/* Format */}
              <div
                className="p-5 rounded-2xl"
                style={{ backgroundColor: "var(--card)", border: "1px solid var(--border)" }}
              >
                <h3 className="text-sm font-semibold mb-3" style={{ color: "var(--foreground)" }}>
                  Tournament Info
                </h3>
                {[
                  ["Format", selectedTournament.format],
                  ["Level", selectedTournament.level],
                  ["Category", selectedTournament.category],
                  ["Players", `${selectedTournament.players} Participants`],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between py-2" style={{ borderBottom: "1px solid var(--border)" }}>
                    <span className="text-sm" style={{ color: "var(--muted-foreground)" }}>{k}</span>
                    <span className="text-sm font-medium" style={{ color: "var(--foreground)" }}>{v}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {tTab === "live" && (
          <div className="flex flex-col gap-4">
            {liveMatches.map((match) => {
              // Count games won from completed games
              let winsA = 0, winsB = 0;
              for (let i = 0; i < match.currentGameIdx; i++) {
                if (match.gamesA[i] > match.gamesB[i]) winsA++;
                else winsB++;
              }
              const aLeadsMatch = winsA > winsB;
              const bLeadsMatch = winsB > winsA;
              const curA = match.gamesA[match.currentGameIdx];
              const curB = match.gamesB[match.currentGameIdx];
              const aLeadsCur = curA > curB;
              const bLeadsCur = curB > curA;

              return (
                <div
                  key={match.id}
                  className="rounded-2xl overflow-hidden"
                  style={{ backgroundColor: "var(--card)", border: "1px solid var(--border)", boxShadow: "0 2px 12px rgba(11,31,58,0.08)" }}
                >
                  {/* Card header */}
                  <div className="px-4 pt-4 pb-3 flex items-center justify-between" style={{ borderBottom: "1px solid var(--border)" }}>
                    <div className="flex items-center gap-2">
                      <span
                        className="flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full"
                        style={{ backgroundColor: "rgba(239,68,68,0.1)", color: "var(--live-red)" }}
                      >
                        <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: "var(--live-red)" }} />
                        LIVE
                      </span>
                      <span className="text-xs font-semibold" style={{ color: "var(--muted-foreground)" }}>
                        Match {match.matchNum}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold px-2 py-0.5 rounded-md" style={{ backgroundColor: "rgba(11,31,58,0.07)", color: "var(--navy)" }}>{match.category}</span>
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-md" style={{ backgroundColor: "var(--muted)", color: "var(--muted-foreground)" }}>{match.round}</span>
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-md" style={{ backgroundColor: "rgba(167,255,63,0.12)", color: "#5a9c00" }}>{match.court}</span>
                    </div>
                  </div>

                  {/* Scoreboard area */}
                  <div className="px-4 py-4">
                    {/* Game column headers */}
                    <div className="flex items-center mb-2">
                      <div className="flex-1" />
                      <div className="flex gap-0">
                        {match.gamesA.map((_, gi) => (
                          <div key={gi} className="w-11 text-center">
                            <span
                              className="text-xs font-semibold"
                              style={{
                                color: gi === match.currentGameIdx ? "var(--navy)" : "var(--muted-foreground)",
                                opacity: gi === match.currentGameIdx ? 1 : 0.6,
                              }}
                            >
                              G{gi + 1}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Player A row */}
                    <div
                      className="flex items-center py-2.5 px-3 rounded-xl mb-1"
                      style={{
                        backgroundColor: aLeadsMatch || (!aLeadsMatch && !bLeadsMatch && aLeadsCur)
                          ? "rgba(11,31,58,0.04)" : "transparent",
                      }}
                    >
                      <div className="flex-1 flex items-center gap-2 min-w-0">
                        <p
                          className="text-sm font-bold truncate"
                          style={{ color: aLeadsMatch ? "var(--navy)" : "var(--muted-foreground)" }}
                        >
                          {match.playerA}
                        </p>
                        {match.servingA && (
                          <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: "var(--win-green)" }} />
                        )}
                      </div>
                      <div className="flex gap-0">
                        {match.gamesA.map((score, gi) => {
                          const isCurrent = gi === match.currentGameIdx;
                          const aWonThisGame = !isCurrent && score > match.gamesB[gi];
                          const aLeadsCurGame = isCurrent && score > match.gamesB[gi];
                          return (
                            <div
                              key={gi}
                              className="w-11 text-center py-1 rounded-lg"
                              style={{
                                backgroundColor: isCurrent ? "rgba(167,255,63,0.12)" : "transparent",
                              }}
                            >
                              <span
                                className="font-black"
                                style={{
                                  fontSize: isCurrent ? 20 : 16,
                                  color: aWonThisGame || aLeadsCurGame
                                    ? "var(--navy)"
                                    : isCurrent
                                    ? "var(--muted-foreground)"
                                    : "var(--muted-foreground)",
                                  opacity: !isCurrent && !aWonThisGame ? 0.55 : 1,
                                }}
                              >
                                {score}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Thin divider */}
                    <div className="mx-3 mb-1" style={{ height: 1, backgroundColor: "var(--border)" }} />

                    {/* Player B row */}
                    <div
                      className="flex items-center py-2.5 px-3 rounded-xl"
                      style={{
                        backgroundColor: bLeadsMatch || (!aLeadsMatch && !bLeadsMatch && bLeadsCur)
                          ? "rgba(11,31,58,0.04)" : "transparent",
                      }}
                    >
                      <div className="flex-1 flex items-center gap-2 min-w-0">
                        <p
                          className="text-sm font-bold truncate"
                          style={{ color: bLeadsMatch ? "var(--navy)" : "var(--muted-foreground)" }}
                        >
                          {match.playerB}
                        </p>
                        {!match.servingA && (
                          <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: "var(--win-green)" }} />
                        )}
                      </div>
                      <div className="flex gap-0">
                        {match.gamesB.map((score, gi) => {
                          const isCurrent = gi === match.currentGameIdx;
                          const bWonThisGame = !isCurrent && score > match.gamesA[gi];
                          const bLeadsCurGame = isCurrent && score > match.gamesA[gi];
                          return (
                            <div
                              key={gi}
                              className="w-11 text-center py-1 rounded-lg"
                              style={{
                                backgroundColor: isCurrent ? "rgba(167,255,63,0.12)" : "transparent",
                              }}
                            >
                              <span
                                className="font-black"
                                style={{
                                  fontSize: isCurrent ? 20 : 16,
                                  color: bWonThisGame || bLeadsCurGame
                                    ? "var(--navy)"
                                    : isCurrent
                                    ? "var(--muted-foreground)"
                                    : "var(--muted-foreground)",
                                  opacity: !isCurrent && !bWonThisGame ? 0.55 : 1,
                                }}
                              >
                                {score}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Footer */}
                  <div
                    className="px-4 py-3 flex items-center justify-between"
                    style={{ backgroundColor: "rgba(11,31,58,0.03)", borderTop: "1px solid var(--border)" }}
                  >
                    <div className="flex items-center gap-3 text-xs" style={{ color: "var(--muted-foreground)" }}>
                      <span className="font-semibold" style={{ color: "var(--navy)" }}>{match.court}</span>
                      <span>·</span>
                      <span>{match.category}</span>
                      <span>·</span>
                      <span>{match.round}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock size={11} style={{ color: "var(--muted-foreground)" }} />
                      <span className="text-xs font-semibold" style={{ color: "var(--muted-foreground)" }}>{match.timer}</span>
                      <span className="w-1 h-1 rounded-full" style={{ backgroundColor: "var(--live-red)" }} />
                      <span className="text-xs font-bold" style={{ color: "var(--live-red)" }}>LIVE</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {tTab === "draw" && (() => {
          const BCARD_H = 70;
          const BSLOT = 94;
          const BCARD_W = 182;
          const BCONN_W = 28;
          const BMID = BCONN_W / 2;
          const BHEADER_H = 34;
          const BRACKET_H = 8 * BSLOT;
          const BRACKET_ROUNDS = [
            {
              id: "r16", name: "Round of 16", short: "R16",
              matches: [
                { id: 1, pA: { name: "Lee Zii Jia", pid: "#SH-001" }, pB: { name: "Chou Tien Chen", pid: "#SH-032" }, gA: [21,18,21], gB: [18,21,16], winner: "A" as "A"|"B"|null, status: "completed" as MatchStatus, court: "C1", time: "09:00", isMyMatch: false },
                { id: 2, pA: { name: "Viktor Axelsen", pid: "#SH-002" }, pB: { name: "Kodai Naraoka", pid: "#SH-003" }, gA: [21,21], gB: [17,18], winner: "A" as "A"|"B"|null, status: "completed" as MatchStatus, court: "C2", time: "09:30", isMyMatch: false },
                { id: 3, pA: { name: "An Se Young", pid: "#SH-005" }, pB: { name: "Ratchanok I.", pid: "#SH-013" }, gA: [21,21], gB: [15,18], winner: "A" as "A"|"B"|null, status: "completed" as MatchStatus, court: "C3", time: "10:00", isMyMatch: false },
                { id: 4, pA: { name: "Tai Tzu Ying", pid: "#SH-010" }, pB: { name: "N. Okuhara", pid: "#SH-014" }, gA: [21,21], gB: [17,19], winner: "A" as "A"|"B"|null, status: "completed" as MatchStatus, court: "C1", time: "10:30", isMyMatch: false },
                { id: 5, pA: { name: "Marcus / Kevin", pid: "#SH-007" }, pB: { name: "Fajar / Rian", pid: "#SH-008" }, gA: [21,21], gB: [16,19], winner: "A" as "A"|"B"|null, status: "completed" as MatchStatus, court: "C2", time: "11:00", isMyMatch: false },
                { id: 6, pA: { name: "Gideon / Kevin S.", pid: "#SH-009" }, pB: { name: "Zheng / Huang", pid: "#SH-044" }, gA: [21,18,21], gB: [18,21,16], winner: "A" as "A"|"B"|null, status: "completed" as MatchStatus, court: "C3", time: "11:30", isMyMatch: false },
                { id: 7, pA: { name: "Carolina Marin", pid: "#SH-011" }, pB: { name: "Chen Yu Fei", pid: "#SH-012" }, gA: [21,14], gB: [18,12], winner: null, status: "live" as MatchStatus, court: "C1", time: "12:00", isMyMatch: false },
                { id: 8, pA: { name: "Shi Yu Qi", pid: "#SH-016" }, pB: { name: "Loh Kean Yew", pid: "#SH-015" }, gA: [], gB: [], winner: null, status: "upcoming" as MatchStatus, court: "C2", time: "13:00", isMyMatch: true },
              ],
            },
            {
              id: "qf", name: "Quarter Finals", short: "QF",
              matches: [
                { id: 9, pA: { name: "Lee Zii Jia", pid: "#SH-001" }, pB: { name: "Viktor Axelsen", pid: "#SH-002" }, gA: [21,18,21], gB: [19,21,16], winner: "A" as "A"|"B"|null, status: "completed" as MatchStatus, court: "C1", time: "14:00", isMyMatch: false },
                { id: 10, pA: { name: "An Se Young", pid: "#SH-005" }, pB: { name: "Tai Tzu Ying", pid: "#SH-010" }, gA: [21,15], gB: [14,21], winner: null, status: "live" as MatchStatus, court: "C2", time: "14:30", isMyMatch: false },
                { id: 11, pA: { name: "Marcus / Kevin", pid: "#SH-007" }, pB: { name: "Gideon / Kevin S.", pid: "#SH-009" }, gA: [], gB: [], winner: null, status: "upcoming" as MatchStatus, court: "C3", time: "15:00", isMyMatch: false },
                { id: 12, pA: { name: "Carolina Marin", pid: "#SH-011" }, pB: { name: "TBD", pid: "" }, gA: [], gB: [], winner: null, status: "upcoming" as MatchStatus, court: "C1", time: "15:30", isMyMatch: false },
              ],
            },
            {
              id: "sf", name: "Semi Finals", short: "SF",
              matches: [
                { id: 13, pA: { name: "Lee Zii Jia", pid: "#SH-001" }, pB: { name: "TBD", pid: "" }, gA: [], gB: [], winner: null, status: "upcoming" as MatchStatus, court: "C1", time: "17:00", isMyMatch: false },
                { id: 14, pA: { name: "TBD", pid: "" }, pB: { name: "TBD", pid: "" }, gA: [], gB: [], winner: null, status: "upcoming" as MatchStatus, court: "C2", time: "17:30", isMyMatch: false },
              ],
            },
            {
              id: "final", name: "Final", short: "F",
              matches: [
                { id: 15, pA: { name: "TBD", pid: "" }, pB: { name: "TBD", pid: "" }, gA: [], gB: [], winner: null, status: "upcoming" as MatchStatus, court: "C1", time: "19:00", isMyMatch: false },
              ],
            },
          ];

          const getColX = (ri: number) => ri * (BCARD_W + BCONN_W);
          const getSlotH = (ri: number) => BSLOT * Math.pow(2, ri);
          const getCardCenterY = (mi: number, ri: number) => {
            const s = getSlotH(ri);
            return mi * s + s / 2;
          };
          const getCardTop = (mi: number, ri: number) => BHEADER_H + getCardCenterY(mi, ri) - BCARD_H / 2;

          const q = drawSearch.trim().toLowerCase();
          const TOTAL_W = BRACKET_ROUNDS.length * BCARD_W + (BRACKET_ROUNDS.length - 1) * BCONN_W;
          const TOTAL_H = BHEADER_H + BRACKET_H;

          const statusCfg: Record<MatchStatus, { color: string; label: string }> = {
            live:      { color: "#059669", label: "LIVE" },
            upcoming:  { color: "#3B82F6", label: "TBD" },
            completed: { color: "#94A3B8", label: "FT" },
          };

          return (
            <div className="flex flex-col gap-3">
              {/* Search bar */}
              <div
                className="flex items-center gap-3 px-4 py-3 rounded-2xl"
                style={{ backgroundColor: "var(--card)", border: "1.5px solid var(--border)", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}
              >
                <Search size={14} style={{ color: "var(--muted-foreground)" }} strokeWidth={2} />
                <input
                  value={drawSearch}
                  onChange={(e) => setDrawSearch(e.target.value)}
                  placeholder="Search Player Name or Player ID"
                  className="bg-transparent outline-none flex-1 text-sm"
                  style={{ color: "var(--foreground)" }}
                />
                {drawSearch && (
                  <button
                    onClick={() => setDrawSearch("")}
                    className="text-xs px-2 py-0.5 rounded-lg"
                    style={{ color: "var(--muted-foreground)", backgroundColor: "var(--muted)" }}
                  >
                    Clear
                  </button>
                )}
              </div>

              {/* Round selector chips */}
              <div className="flex gap-2 overflow-x-auto pb-1">
                {BRACKET_ROUNDS.map((round, ri) => (
                  <button
                    key={round.id}
                    onClick={() => {
                      setSelectedRound(round.id);
                      bracketScrollRef.current?.scrollTo({ left: getColX(ri), behavior: "smooth" });
                    }}
                    className="px-3 py-1.5 rounded-xl text-xs font-semibold flex-shrink-0 transition-all"
                    style={{
                      backgroundColor: selectedRound === round.id ? "var(--navy)" : "var(--card)",
                      color: selectedRound === round.id ? "var(--lime)" : "var(--muted-foreground)",
                      border: `1px solid ${selectedRound === round.id ? "transparent" : "var(--border)"}`,
                    }}
                  >
                    {round.name}
                  </button>
                ))}
              </div>

              {/* Category label */}
              <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--muted-foreground)" }}>
                Men's Singles · 16-Player Draw
              </p>

              {/* Bracket scroll container */}
              <div
                ref={bracketScrollRef}
                className="rounded-2xl overflow-auto"
                style={{
                  backgroundColor: "var(--card)",
                  border: "1px solid var(--border)",
                  maxHeight: "calc(100vh - 420px)",
                  minHeight: 280,
                  WebkitOverflowScrolling: "touch",
                }}
              >
                <div style={{ position: "relative", width: TOTAL_W, height: TOTAL_H, userSelect: "none" }}>

                  {/* Round header row */}
                  {BRACKET_ROUNDS.map((round, ri) => (
                    <div
                      key={round.id}
                      style={{
                        position: "absolute",
                        left: getColX(ri),
                        top: 0,
                        width: BCARD_W,
                        height: BHEADER_H,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        borderBottom: "1px solid var(--border)",
                        borderRight: ri < BRACKET_ROUNDS.length - 1 ? "1px solid var(--border)" : undefined,
                      }}
                    >
                      <span className="text-xs font-bold uppercase tracking-widest" style={{ color: "var(--navy)" }}>
                        {round.short}
                      </span>
                    </div>
                  ))}

                  {/* SVG connector lines between each pair of rounds */}
                  {BRACKET_ROUNDS.slice(0, -1).map((_, ri) => {
                    const nextRound = BRACKET_ROUNDS[ri + 1];
                    return (
                      <svg
                        key={ri}
                        style={{
                          position: "absolute",
                          left: getColX(ri) + BCARD_W,
                          top: BHEADER_H,
                          width: BCONN_W,
                          height: BRACKET_H,
                          overflow: "visible",
                          pointerEvents: "none",
                        }}
                      >
                        {nextRound.matches.map((_, mi) => {
                          const fa_Y = getCardCenterY(2 * mi, ri);
                          const fb_Y = getCardCenterY(2 * mi + 1, ri);
                          const n_Y = getCardCenterY(mi, ri + 1);
                          const feederDone = BRACKET_ROUNDS[ri].matches[2 * mi]?.status === "completed";
                          const lineColor = feederDone ? "rgba(11,31,58,0.25)" : "var(--border)";
                          return (
                            <path
                              key={mi}
                              d={`M 0,${fa_Y} H ${BMID} V ${fb_Y} H 0 M ${BMID},${n_Y} H ${BCONN_W}`}
                              fill="none"
                              stroke={lineColor}
                              strokeWidth={1.5}
                              strokeLinecap="round"
                            />
                          );
                        })}
                      </svg>
                    );
                  })}

                  {/* Match cards */}
                  {BRACKET_ROUNDS.map((round, ri) =>
                    round.matches.map((match, mi) => {
                      const cardTop = getCardTop(mi, ri);
                      const cardLeft = getColX(ri);
                      const aWins = match.winner === "A";
                      const bWins = match.winner === "B";
                      const cfg = statusCfg[match.status];
                      const matchesQ = q
                        ? match.pA.name.toLowerCase().includes(q) ||
                          match.pA.pid.toLowerCase().includes(q) ||
                          match.pB.name.toLowerCase().includes(q) ||
                          match.pB.pid.toLowerCase().includes(q)
                        : true;
                      const aHl = q && (match.pA.name.toLowerCase().includes(q) || match.pA.pid.toLowerCase().includes(q));
                      const bHl = q && (match.pB.name.toLowerCase().includes(q) || match.pB.pid.toLowerCase().includes(q));

                      return (
                        <div
                          key={match.id}
                          style={{
                            position: "absolute",
                            left: cardLeft,
                            top: cardTop,
                            width: BCARD_W,
                            height: BCARD_H,
                            backgroundColor: "var(--background)",
                            borderRadius: 10,
                            overflow: "hidden",
                            opacity: q && !matchesQ ? 0.25 : 1,
                            borderTop: `1px solid ${matchesQ && q ? "var(--navy)" : "var(--border)"}`,
                            borderRight: `1px solid ${matchesQ && q ? "var(--navy)" : "var(--border)"}`,
                            borderBottom: `1px solid ${matchesQ && q ? "var(--navy)" : "var(--border)"}`,
                            borderLeft: `3px solid ${match.isMyMatch ? "var(--lime)" : match.status === "live" ? "#059669" : aWins || bWins ? "rgba(11,31,58,0.3)" : "var(--border)"}`,
                            boxShadow: match.isMyMatch
                              ? "0 0 0 2px rgba(167,255,63,0.35)"
                              : matchesQ && q
                              ? "0 0 0 2px rgba(11,31,58,0.12)"
                              : "0 1px 3px rgba(0,0,0,0.05)",
                          }}
                        >
                          {/* Status badge top-right */}
                          <div style={{ position: "absolute", top: 4, right: 5 }}>
                            <span style={{ fontSize: 8, fontWeight: 700, color: cfg.color, letterSpacing: "0.04em" }}>
                              {match.status === "live" ? "● LIVE" : match.status === "completed" ? "FT" : ""}
                            </span>
                          </div>

                          {/* Player A row */}
                          <div
                            style={{
                              height: "50%",
                              padding: "5px 6px 2px 7px",
                              display: "flex",
                              alignItems: "center",
                              gap: 4,
                              backgroundColor: aWins ? "rgba(167,255,63,0.07)" : "transparent",
                            }}
                          >
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <p style={{
                                fontSize: 11,
                                fontWeight: aWins ? 700 : aHl ? 700 : 500,
                                color: aHl ? "#5a9a10" : aWins ? "var(--navy)" : "var(--foreground)",
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                lineHeight: 1.3,
                              }}>
                                {aWins && <span style={{ color: "#7ec920", fontSize: 9 }}>● </span>}
                                {match.pA.name}
                              </p>
                              {match.pA.pid && (
                                <p style={{ fontSize: 9, color: "var(--muted-foreground)", lineHeight: 1.1 }}>
                                  {match.pA.pid}
                                </p>
                              )}
                            </div>
                            {match.gA.length > 0 && (
                              <div style={{ display: "flex", gap: 2, flexShrink: 0 }}>
                                {match.gA.map((s, gi) => (
                                  <span key={gi} style={{
                                    fontSize: 11,
                                    fontWeight: s > (match.gB[gi] ?? 0) ? 700 : 400,
                                    color: s > (match.gB[gi] ?? 0) ? "var(--navy)" : "var(--muted-foreground)",
                                    minWidth: 14,
                                    textAlign: "center",
                                    lineHeight: 1,
                                  }}>{s}</span>
                                ))}
                              </div>
                            )}
                          </div>

                          {/* Divider */}
                          <div style={{ height: 1, backgroundColor: "var(--border)", margin: "0 5px" }} />

                          {/* Player B row */}
                          <div
                            style={{
                              height: "50%",
                              padding: "2px 6px 5px 7px",
                              display: "flex",
                              alignItems: "center",
                              gap: 4,
                              backgroundColor: bWins ? "rgba(167,255,63,0.07)" : "transparent",
                            }}
                          >
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <p style={{
                                fontSize: 11,
                                fontWeight: bWins ? 700 : bHl ? 700 : 500,
                                color: bHl ? "#5a9a10" : bWins ? "var(--navy)" : "var(--foreground)",
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                lineHeight: 1.3,
                              }}>
                                {bWins && <span style={{ color: "#7ec920", fontSize: 9 }}>● </span>}
                                {match.pB.name}
                              </p>
                              {match.pB.pid && (
                                <p style={{ fontSize: 9, color: "var(--muted-foreground)", lineHeight: 1.1 }}>
                                  {match.pB.pid}
                                </p>
                              )}
                            </div>
                            {match.gB.length > 0 && (
                              <div style={{ display: "flex", gap: 2, flexShrink: 0 }}>
                                {match.gB.map((s, gi) => (
                                  <span key={gi} style={{
                                    fontSize: 11,
                                    fontWeight: s > (match.gA[gi] ?? 0) ? 700 : 400,
                                    color: s > (match.gA[gi] ?? 0) ? "var(--navy)" : "var(--muted-foreground)",
                                    minWidth: 14,
                                    textAlign: "center",
                                    lineHeight: 1,
                                  }}>{s}</span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              <p className="text-center text-xs" style={{ color: "var(--muted-foreground)" }}>
                Scroll left/right to explore the bracket · Your match highlighted in green
              </p>
            </div>
          );
        })()}

        {tTab === "matches" && (() => {
          const q = matchSearch.trim().toLowerCase();

          // Filter matches by search query across all courts
          const filtered = courtMatches.map((cg) => ({
            ...cg,
            matches: q
              ? cg.matches.filter(
                  (m) =>
                    m.playerA.name.toLowerCase().includes(q) ||
                    m.playerB.name.toLowerCase().includes(q) ||
                    m.playerA.id.toLowerCase().includes(q) ||
                    m.playerB.id.toLowerCase().includes(q)
                )
              : cg.matches,
          })).filter((cg) => cg.matches.length > 0);

          const statusCfg: Record<MatchStatus, { label: string; bg: string; text: string }> = {
            live:      { label: "LIVE",      bg: "rgba(16,185,129,0.12)", text: "#059669" },
            upcoming:  { label: "Upcoming",  bg: "rgba(59,130,246,0.1)",  text: "#3B82F6" },
            completed: { label: "Completed", bg: "rgba(107,114,128,0.1)", text: "#6B7280" },
          };

          return (
            <div className="flex flex-col gap-4">
              {/* Search bar */}
              <div
                className="flex items-center gap-3 px-4 py-3 rounded-2xl"
                style={{ backgroundColor: "var(--card)", border: "1.5px solid var(--border)", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}
              >
                <Search size={15} style={{ color: "var(--muted-foreground)" }} strokeWidth={2} />
                <input
                  value={matchSearch}
                  onChange={(e) => setMatchSearch(e.target.value)}
                  placeholder="Search by Player Name or Player ID"
                  className="bg-transparent outline-none flex-1 text-sm"
                  style={{ color: "var(--foreground)" }}
                />
                {matchSearch && (
                  <button
                    onClick={() => setMatchSearch("")}
                    className="text-xs px-2 py-0.5 rounded-lg"
                    style={{ color: "var(--muted-foreground)", backgroundColor: "var(--muted)" }}
                  >
                    Clear
                  </button>
                )}
              </div>

              {filtered.length === 0 && (
                <div className="py-12 text-center">
                  <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>No matches found for "{matchSearch}"</p>
                </div>
              )}

              {/* Court accordions */}
              {filtered.map((cg) => {
                const isOpen = expandedCourt === cg.court || (q.length > 0);
                const liveCount = cg.matches.filter((m) => m.status === "live").length;

                return (
                  <div
                    key={cg.court}
                    className="rounded-2xl overflow-hidden"
                    style={{
                      border: `1px solid ${isOpen && !q ? "rgba(11,31,58,0.18)" : "var(--border)"}`,
                      boxShadow: isOpen && !q ? "0 2px 12px rgba(11,31,58,0.07)" : "none",
                    }}
                  >
                    {/* Accordion header */}
                    {!q && (
                      <button
                        className="w-full flex items-center gap-3 px-4 py-4 text-left"
                        style={{ backgroundColor: isOpen ? "var(--navy)" : "var(--card)" }}
                        onClick={() => setExpandedCourt(isOpen ? null : cg.court)}
                      >
                        <div
                          className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 text-xs font-black"
                          style={{
                            backgroundColor: isOpen ? "rgba(167,255,63,0.2)" : "rgba(11,31,58,0.07)",
                            color: isOpen ? "var(--lime)" : "var(--navy)",
                          }}
                        >
                          {cg.court.replace("Court ", "C")}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-bold" style={{ color: isOpen ? "#fff" : "var(--foreground)" }}>
                            {cg.court}
                          </p>
                          <p className="text-xs mt-0.5" style={{ color: isOpen ? "rgba(255,255,255,0.5)" : "var(--muted-foreground)" }}>
                            {cg.matches.length} matches
                          </p>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {liveCount > 0 && (
                            <span
                              className="flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full"
                              style={{ backgroundColor: "rgba(16,185,129,0.15)", color: "#059669" }}
                            >
                              <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: "#059669" }} />
                              {liveCount} Live
                            </span>
                          )}
                          {isOpen
                            ? <ChevronUp size={16} style={{ color: "rgba(255,255,255,0.6)" }} />
                            : <ChevronDown size={16} style={{ color: "var(--muted-foreground)" }} />
                          }
                        </div>
                      </button>
                    )}

                    {/* Match cards */}
                    {(isOpen || q.length > 0) && (
                      <div className="flex flex-col" style={{ borderTop: !q ? "1px solid var(--border)" : "none" }}>
                        {cg.matches.map((match, mi) => {
                          const cfg = statusCfg[match.status];
                          const aWins = match.winner === "A";
                          const bWins = match.winner === "B";
                          const hasScores = match.gamesA.length > 0;

                          return (
                            <div
                              key={match.matchNum}
                              style={{
                                backgroundColor: "var(--card)",
                                borderBottom: mi < cg.matches.length - 1 ? "1px solid var(--border)" : "none",
                              }}
                            >
                              {/* Match header */}
                              <div className="flex items-center justify-between px-4 pt-3.5 pb-2">
                                <div className="flex items-center gap-2">
                                  <span
                                    className="text-xs font-bold px-2 py-0.5 rounded-md"
                                    style={{ backgroundColor: "rgba(11,31,58,0.07)", color: "var(--navy)" }}
                                  >
                                    M{match.matchNum}
                                  </span>
                                  <span
                                    className="text-xs font-semibold px-2 py-0.5 rounded-md"
                                    style={{ backgroundColor: "rgba(11,31,58,0.06)", color: "var(--navy)" }}
                                  >
                                    {match.category}
                                  </span>
                                  <span
                                    className="text-xs px-2 py-0.5 rounded-md"
                                    style={{ backgroundColor: "var(--muted)", color: "var(--muted-foreground)" }}
                                  >
                                    {match.round}
                                  </span>
                                </div>
                                <span
                                  className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full"
                                  style={{ backgroundColor: cfg.bg, color: cfg.text }}
                                >
                                  {match.status === "live" && (
                                    <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: cfg.text }} />
                                  )}
                                  {cfg.label}
                                </span>
                              </div>

                              {/* Players + Scoreboard */}
                              <div className="px-4 pb-3">
                                {/* Player A */}
                                <div
                                  className="flex items-center py-2 px-2.5 rounded-xl mb-1"
                                  style={{ backgroundColor: aWins ? "rgba(167,255,63,0.07)" : "transparent" }}
                                >
                                  <div className="flex-1 min-w-0">
                                    <p
                                      className="text-sm font-bold truncate"
                                      style={{ color: aWins ? "var(--navy)" : bWins ? "var(--muted-foreground)" : "var(--foreground)" }}
                                    >
                                      {aWins && <span style={{ color: "var(--win-green)" }}>● </span>}
                                      {match.playerA.name}
                                    </p>
                                    {match.playerA.id && (
                                      <p className="text-xs font-mono" style={{ color: "var(--muted-foreground)" }}>{match.playerA.id}</p>
                                    )}
                                  </div>
                                  {hasScores && (
                                    <div className="flex gap-1 flex-shrink-0 ml-3">
                                      {match.gamesA.map((score, gi) => {
                                        const isCurrent = match.status === "live" && gi === match.currentGameIdx;
                                        const wonGame = match.gamesA[gi] > match.gamesB[gi];
                                        return (
                                          <div
                                            key={gi}
                                            className="w-9 h-9 rounded-lg flex items-center justify-center"
                                            style={{
                                              backgroundColor: isCurrent
                                                ? "rgba(167,255,63,0.15)"
                                                : wonGame ? "rgba(11,31,58,0.06)" : "transparent",
                                            }}
                                          >
                                            <span
                                              className="font-black"
                                              style={{
                                                fontSize: isCurrent ? 17 : 15,
                                                color: wonGame ? "var(--navy)" : "var(--muted-foreground)",
                                                opacity: !wonGame && !isCurrent ? 0.6 : 1,
                                              }}
                                            >
                                              {score}
                                            </span>
                                          </div>
                                        );
                                      })}
                                    </div>
                                  )}
                                </div>

                                {/* Divider */}
                                <div className="mx-2 mb-1" style={{ height: 1, backgroundColor: "var(--border)" }} />

                                {/* Player B */}
                                <div
                                  className="flex items-center py-2 px-2.5 rounded-xl"
                                  style={{ backgroundColor: bWins ? "rgba(167,255,63,0.07)" : "transparent" }}
                                >
                                  <div className="flex-1 min-w-0">
                                    <p
                                      className="text-sm font-bold truncate"
                                      style={{ color: bWins ? "var(--navy)" : aWins ? "var(--muted-foreground)" : "var(--foreground)" }}
                                    >
                                      {bWins && <span style={{ color: "var(--win-green)" }}>● </span>}
                                      {match.playerB.name}
                                    </p>
                                    {match.playerB.id && (
                                      <p className="text-xs font-mono" style={{ color: "var(--muted-foreground)" }}>{match.playerB.id}</p>
                                    )}
                                  </div>
                                  {hasScores && (
                                    <div className="flex gap-1 flex-shrink-0 ml-3">
                                      {match.gamesB.map((score, gi) => {
                                        const isCurrent = match.status === "live" && gi === match.currentGameIdx;
                                        const wonGame = match.gamesB[gi] > match.gamesA[gi];
                                        return (
                                          <div
                                            key={gi}
                                            className="w-9 h-9 rounded-lg flex items-center justify-center"
                                            style={{
                                              backgroundColor: isCurrent
                                                ? "rgba(167,255,63,0.15)"
                                                : wonGame ? "rgba(11,31,58,0.06)" : "transparent",
                                            }}
                                          >
                                            <span
                                              className="font-black"
                                              style={{
                                                fontSize: isCurrent ? 17 : 15,
                                                color: wonGame ? "var(--navy)" : "var(--muted-foreground)",
                                                opacity: !wonGame && !isCurrent ? 0.6 : 1,
                                              }}
                                            >
                                              {score}
                                            </span>
                                          </div>
                                        );
                                      })}
                                    </div>
                                  )}
                                </div>
                              </div>

                              {/* Match footer */}
                              <div
                                className="px-4 py-2.5 flex items-center justify-between"
                                style={{ backgroundColor: "rgba(11,31,58,0.025)", borderTop: "1px solid var(--border)" }}
                              >
                                <span className="text-xs font-semibold" style={{ color: "var(--navy)" }}>{cg.court}</span>
                                <div className="flex items-center gap-1.5">
                                  <Clock size={11} style={{ color: "var(--muted-foreground)" }} />
                                  <span className="text-xs" style={{ color: "var(--muted-foreground)" }}>
                                    {match.status === "upcoming"
                                      ? match.time
                                      : match.status === "live"
                                      ? <span style={{ color: "#059669", fontWeight: 600 }}>{match.duration}</span>
                                      : match.duration}
                                  </span>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          );
        })()}

        {tTab === "standings" && (
          <div className="flex flex-col gap-3">
            {poolStandings.map((pool) => {
              const isOpen = expandedPool === pool.id;
              return (
                <div
                  key={pool.id}
                  className="rounded-2xl overflow-hidden"
                  style={{ border: `1px solid ${isOpen ? "rgba(11,31,58,0.2)" : "var(--border)"}`, boxShadow: isOpen ? "0 2px 12px rgba(11,31,58,0.07)" : "none" }}
                >
                  {/* Accordion header */}
                  <button
                    className="w-full flex items-center gap-3 px-4 py-4 text-left"
                    style={{ backgroundColor: isOpen ? "var(--navy)" : "var(--card)" }}
                    onClick={() => setExpandedPool(isOpen ? null : pool.id)}
                  >
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 text-sm font-black"
                      style={{
                        backgroundColor: isOpen ? "rgba(167,255,63,0.2)" : "rgba(11,31,58,0.07)",
                        color: isOpen ? "var(--lime)" : "var(--navy)",
                      }}
                    >
                      {pool.id}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-bold" style={{ color: isOpen ? "#fff" : "var(--foreground)" }}>
                        Pool {pool.id}
                      </p>
                      <p className="text-xs mt-0.5" style={{ color: isOpen ? "rgba(255,255,255,0.5)" : "var(--muted-foreground)" }}>
                        {pool.teams.length} teams · {pool.qualifyCount} qualify
                      </p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span
                        className="text-xs font-semibold px-2 py-0.5 rounded-full"
                        style={{
                          backgroundColor: isOpen ? "rgba(167,255,63,0.15)" : "rgba(167,255,63,0.1)",
                          color: isOpen ? "var(--lime)" : "#5a9c00",
                        }}
                      >
                        Top {pool.qualifyCount} ↑
                      </span>
                      {isOpen
                        ? <ChevronUp size={16} style={{ color: "rgba(255,255,255,0.6)" }} />
                        : <ChevronDown size={16} style={{ color: "var(--muted-foreground)" }} />
                      }
                    </div>
                  </button>

                  {/* Expanded table */}
                  {isOpen && (
                    <div>
                      {/* Column headers */}
                      <div
                        className="grid px-4 py-2"
                        style={{
                          gridTemplateColumns: "28px 1fr 32px 28px 28px 36px 36px 44px",
                          backgroundColor: "rgba(11,31,58,0.04)",
                          borderTop: "1px solid var(--border)",
                        }}
                      >
                        {["#", "Team", "MP", "W", "L", "Pts", "+/-", ""].map((h) => (
                          <span key={h} className="text-xs font-semibold text-center" style={{ color: "var(--muted-foreground)" }}>{h}</span>
                        ))}
                      </div>

                      {/* Team rows */}
                      {pool.teams.map((team, ti) => (
                        <div
                          key={team.rank}
                          className="grid items-center px-4 py-3"
                          style={{
                            gridTemplateColumns: "28px 1fr 32px 28px 28px 36px 36px 44px",
                            backgroundColor: team.qualified ? "rgba(167,255,63,0.04)" : "var(--card)",
                            borderTop: "1px solid var(--border)",
                          }}
                        >
                          {/* Rank */}
                          <div className="flex justify-center">
                            <span
                              className="w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold"
                              style={{
                                backgroundColor: team.rank === 1 ? "var(--navy)" : team.rank === 2 ? "rgba(11,31,58,0.1)" : "var(--muted)",
                                color: team.rank === 1 ? "var(--lime)" : "var(--muted-foreground)",
                              }}
                            >
                              {team.rank}
                            </span>
                          </div>

                          {/* Team name */}
                          <div className="flex items-center gap-1.5 pl-1 min-w-0">
                            <p className="text-sm truncate" style={{ color: "var(--foreground)", fontWeight: team.qualified ? 600 : 400 }}>
                              {team.name}
                            </p>
                          </div>

                          {/* MP */}
                          <span className="text-xs text-center" style={{ color: "var(--muted-foreground)" }}>{team.played}</span>

                          {/* W */}
                          <span className="text-xs font-semibold text-center" style={{ color: "var(--win-green)" }}>{team.wins}</span>

                          {/* L */}
                          <span className="text-xs font-semibold text-center" style={{ color: "var(--live-red)" }}>{team.losses}</span>

                          {/* Pts */}
                          <span className="text-sm font-bold text-center" style={{ color: "var(--navy)" }}>{team.points}</span>

                          {/* Diff */}
                          <span
                            className="text-xs font-semibold text-center"
                            style={{ color: team.diff > 0 ? "var(--win-green)" : team.diff < 0 ? "var(--live-red)" : "var(--muted-foreground)" }}
                          >
                            {team.diff > 0 ? `+${team.diff}` : team.diff}
                          </span>

                          {/* Qualify badge */}
                          <div className="flex justify-center">
                            {team.qualified && (
                              <span
                                className="text-xs font-bold px-1.5 py-0.5 rounded-md"
                                style={{ backgroundColor: "rgba(167,255,63,0.18)", color: "#5a9c00", letterSpacing: 0.3 }}
                              >
                                Q
                              </span>
                            )}
                          </div>
                        </div>
                      ))}

                      {/* Legend */}
                      <div className="px-4 py-2.5 flex items-center gap-3" style={{ backgroundColor: "rgba(167,255,63,0.03)", borderTop: "1px solid var(--border)" }}>
                        <span
                          className="text-xs font-bold px-1.5 py-0.5 rounded-md"
                          style={{ backgroundColor: "rgba(167,255,63,0.18)", color: "#5a9c00" }}
                        >
                          Q
                        </span>
                        <span className="text-xs" style={{ color: "var(--muted-foreground)" }}>
                          Qualifies to knockout round
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

      </div>
    );
  }

  return (
    <div className="p-4 lg:p-6 flex flex-col gap-5 lg:gap-6" style={{ backgroundColor: "var(--background)", minHeight: "100vh" }}>
      {/* Tournament Search */}
      <div
        className="flex items-center gap-3 px-4 py-3 rounded-2xl"
        style={{ backgroundColor: "var(--card)", border: "1.5px solid var(--border)", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}
      >
        <Search size={16} style={{ color: "var(--muted-foreground)" }} strokeWidth={2} />
        <input
          placeholder="Search tournaments, venues, locations…"
          className="bg-transparent outline-none flex-1 text-sm"
          style={{ color: "var(--foreground)" }}
        />
      </div>

      {/* Status Filters */}
      <div className="flex items-center gap-2 overflow-x-auto pb-0.5" style={{ scrollbarWidth: "none" }}>
        {[
          { id: "All", label: "All" },
          { id: "LIVE", label: "🔴 Live" },
          { id: "OPEN", label: "🟢 Registration Open" },
          { id: "UPCOMING", label: "📅 Upcoming" },
        ].map(({ id, label }) => (
          <button
            key={id}
            onClick={() => setFilterCat(id)}
            className="px-4 py-2 rounded-xl text-sm transition-all flex-shrink-0"
            style={{
              backgroundColor: filterCat === id ? "var(--navy)" : "var(--card)",
              color: filterCat === id ? "var(--lime)" : "var(--foreground)",
              border: `1px solid ${filterCat === id ? "transparent" : "var(--border)"}`,
              fontWeight: filterCat === id ? 600 : 400,
            }}
          >
            {label}
          </button>
        ))}
        <button
          className="ml-auto flex items-center gap-2 px-4 py-2 rounded-xl text-sm flex-shrink-0"
          style={{ backgroundColor: "var(--card)", border: "1px solid var(--border)", color: "var(--foreground)" }}
        >
          <Filter size={14} />
          Filters
        </button>
      </div>

      {/* Featured Banner */}
      <div
        onClick={() => { setSelectedTournament(tournaments[0]); setViewMode("detail"); }}
        className="relative overflow-hidden rounded-2xl cursor-pointer"
        style={{ height: 220 }}
      >
        <img
          src={tournaments[0].image}
          alt={tournaments[0].name}
          className="w-full h-full object-cover"
        />
        <div
          className="absolute inset-0"
          style={{ background: "linear-gradient(90deg, rgba(11,31,58,0.92) 0%, transparent 65%)" }}
        />
        <div className="absolute inset-0 p-8 flex flex-col justify-center">
          <div className="flex items-center gap-3 mb-3">
            <span
              className="text-xs font-bold px-3 py-1 rounded-full tracking-widest animate-pulse"
              style={{ backgroundColor: "#EF4444", color: "#fff" }}
            >
              ● LIVE
            </span>
            <span className="text-white text-sm" style={{ opacity: 0.7 }}>Featured Tournament</span>
          </div>
          <h2 className="text-white mb-2" style={{ fontSize: 28, fontWeight: 800, lineHeight: 1.2 }}>
            {tournaments[0].name}
          </h2>
          <div className="flex items-center gap-5">
            <span style={{ color: "var(--lime)", fontWeight: 700, fontSize: 20 }}>{tournaments[0].prize}</span>
            <span className="text-white text-sm" style={{ opacity: 0.65 }}>
              {tournaments[0].players} players · {tournaments[0].location}
            </span>
            <button
              onClick={(e) => { e.stopPropagation(); onRegister?.(tournaments[0]); }}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold"
              style={{ backgroundColor: "var(--lime)", color: "var(--navy)" }}
            >
              View Tournament <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Tournament Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-5">
        {tournaments.filter((t) => filterCat === "All" || t.status === filterCat).map((t) => (
          <div
            key={t.id}
            className="rounded-2xl overflow-hidden cursor-pointer hover:scale-[1.01] transition-all"
            style={{
              backgroundColor: "var(--card)",
              border: "1px solid var(--border)",
              boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
            }}
            onClick={() => { setSelectedTournament(t); setViewMode("detail"); }}
          >
            <div className="relative" style={{ height: 140 }}>
              <img src={t.image} alt={t.name} className="w-full h-full object-cover" />
              <div className="absolute inset-0" style={{ background: "rgba(0,0,0,0.25)" }} />
              <span
                className="absolute top-3 left-3 text-xs font-bold px-3 py-1 rounded-full"
                style={{
                  backgroundColor: statusColors[t.status]?.bg,
                  color: statusColors[t.status]?.text,
                }}
              >
                {t.status === "LIVE" && "● "}
                {t.status}
              </span>
            </div>
            <div className="p-4">
              <p className="text-sm font-bold mb-1" style={{ color: "var(--foreground)" }}>{t.name}</p>
              <div className="flex items-center gap-1 text-xs mb-3" style={{ color: "var(--muted-foreground)" }}>
                <MapPin size={11} />{t.location} · <Calendar size={11} />{t.dates}
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs" style={{ color: "var(--muted-foreground)" }}>Prize Pool</span>
                  <p className="text-sm font-bold" style={{ color: "var(--navy)" }}>{t.prize}</p>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); if (!t.registered) onRegister?.(t); }}
                  className="px-4 py-2 rounded-xl text-xs font-semibold"
                  style={{
                    backgroundColor: t.registered ? "rgba(16,185,129,0.1)" : "var(--navy)",
                    color: t.registered ? "var(--win-green)" : "#fff",
                  }}
                >
                  {t.registered ? "✓ Registered" : t.status === "OPEN" ? "Register" : "View"}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
