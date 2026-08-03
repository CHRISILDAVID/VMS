import { ChevronLeft, MapPin, Trophy, TrendingUp, TrendingDown, Minus, Award } from "lucide-react";

const performanceData = [
  { month: "Mar", wins: 4, losses: 2 },
  { month: "Apr", wins: 6, losses: 1 },
  { month: "May", wins: 5, losses: 3 },
  { month: "Jun", wins: 8, losses: 1 },
  { month: "Jul", wins: 7, losses: 2 },
  { month: "Aug", wins: 9, losses: 1 },
];

const matchResults = [
  { opponent: "Viktor Axelsen", date: "Aug 8", result: "W", score: "21-18, 19-21, 21-16", event: "BWF Championships", round: "SF" },
  { opponent: "Kodai Naraoka", date: "Aug 6", result: "W", score: "21-15, 21-18", event: "BWF Championships", round: "QF" },
  { opponent: "Shi Yu Qi", date: "Aug 4", result: "L", score: "18-21, 21-18, 18-21", event: "Asia Open", round: "F" },
  { opponent: "Chou Tien Chen", date: "Jul 30", result: "W", score: "21-14, 21-18", event: "KL Open", round: "SF" },
  { opponent: "Loh Kean Yew", date: "Jul 27", result: "W", score: "21-19, 21-17", event: "KL Open", round: "QF" },
];

const tournamentHistory = [
  { name: "BWF World Championships 2025", result: "Semi-Finals", year: 2025, points: 18000 },
  { name: "KL Open Masters 2025", result: "Champion 🏆", year: 2025, points: 12000 },
  { name: "Asia Badminton Championships", result: "Runner-Up 🥈", year: 2024, points: 9600 },
  { name: "Selangor State Championships", result: "Champion 🏆", year: 2024, points: 4500 },
  { name: "BWF Junior Championships", result: "Quarter-Finals", year: 2023, points: 6000 },
];

const h2hRecords = [
  { opponent: "Viktor Axelsen", wins: 3, losses: 5, lastResult: "W" },
  { opponent: "Kodai Naraoka", wins: 7, losses: 2, lastResult: "W" },
  { opponent: "Shi Yu Qi", wins: 4, losses: 6, lastResult: "L" },
];

const badges = [
  { icon: "🏆", label: "National Champion", earned: true },
  { icon: "🥈", label: "World #3 Ranked", earned: true },
  { icon: "⚡", label: "5 Win Streak", earned: true },
  { icon: "🔥", label: "Most Improved", earned: true },
  { icon: "🌟", label: "Fan Favourite", earned: true },
  { icon: "💎", label: "Elite Player", earned: false },
  { icon: "👑", label: "Legend Status", earned: false },
  { icon: "🎯", label: "Perfect Season", earned: false },
];

export interface PublicPlayerData {
  name: string;
  playerId: string;
  rank: number;
  prevRank: number;
  country: string;
  location: string;
  level: string;
  image: string;
  wins: number;
  losses: number;
  winRate: number;
  points: number;
  titles: number;
}

interface PublicPlayerProfileProps {
  player?: PublicPlayerData;
  onBack?: () => void;
}

const defaultPlayer: PublicPlayerData = {
  name: "Lee Zii Jia",
  playerId: "#SH-00001",
  rank: 1,
  prevRank: 2,
  country: "🇲🇾",
  location: "Kuala Lumpur, Malaysia",
  level: "Elite",
  image: "https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=120&h=120&fit=crop&auto=format",
  wins: 89,
  losses: 12,
  winRate: 88,
  points: 92450,
  titles: 6,
};

export function PublicPlayerProfile({ player = defaultPlayer, onBack }: PublicPlayerProfileProps) {
  const trend = player.rank < player.prevRank ? "up" : player.rank > player.prevRank ? "down" : "same";

  return (
    <div className="p-4 lg:p-6 flex flex-col gap-5 lg:gap-6" style={{ backgroundColor: "var(--background)", minHeight: "100vh" }}>
      {onBack && (
        <button onClick={onBack} className="flex items-center gap-2 text-sm w-fit" style={{ color: "var(--muted-foreground)" }}>
          <ChevronLeft size={16} /> Back to Rankings
        </button>
      )}

      {/* Profile Hero */}
      <div
        className="p-5 lg:p-6 rounded-2xl"
        style={{ background: "linear-gradient(135deg, var(--navy) 0%, #162D52 100%)" }}
      >
        <div className="flex flex-col sm:flex-row gap-5 items-start">
          <div className="relative flex-shrink-0">
            <img src={player.image} alt={player.name} className="w-20 h-20 lg:w-24 lg:h-24 rounded-2xl object-cover" style={{ border: "3px solid var(--lime)" }} />
            <span
              className="absolute -bottom-2 -right-2 px-2 py-0.5 rounded-lg text-xs font-bold"
              style={{ backgroundColor: "var(--lime)", color: "var(--navy)" }}
            >
              #{player.rank}
            </span>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-3 mb-1">
              <h2 className="text-white" style={{ fontSize: 22, fontWeight: 800 }}>{player.name}</h2>
              <span className="text-base">{player.country}</span>
              <span className="text-xs px-2 py-0.5 rounded-md font-semibold" style={{ backgroundColor: "rgba(167,255,63,0.15)", color: "var(--lime)" }}>
                {player.level}
              </span>
            </div>
            <div className="flex items-center gap-2 mb-1">
              <MapPin size={12} style={{ color: "rgba(255,255,255,0.45)" }} />
              <span className="text-sm" style={{ color: "rgba(255,255,255,0.5)" }}>{player.location}</span>
            </div>
            <div className="flex items-center gap-2 mb-4">
              <span className="text-xs font-mono" style={{ color: "rgba(255,255,255,0.35)" }}>{player.playerId}</span>
              <span className="mx-1" style={{ color: "rgba(255,255,255,0.2)" }}>·</span>
              <div className="flex items-center gap-1 text-xs">
                {trend === "up" ? <TrendingUp size={12} style={{ color: "#10B981" }} /> : trend === "down" ? <TrendingDown size={12} style={{ color: "#EF4444" }} /> : <Minus size={12} style={{ color: "rgba(255,255,255,0.4)" }} />}
                <span style={{ color: trend === "up" ? "#10B981" : trend === "down" ? "#EF4444" : "rgba(255,255,255,0.4)" }}>
                  {trend === "up" ? `▲ ${player.prevRank - player.rank}` : trend === "down" ? `▼ ${player.rank - player.prevRank}` : "—"}
                </span>
              </div>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
              {[
                { label: "Points", value: player.points.toLocaleString() },
                { label: "Wins", value: player.wins },
                { label: "Losses", value: player.losses },
                { label: "Win %", value: `${player.winRate}%` },
                { label: "Titles", value: player.titles },
              ].map(({ label, value }) => (
                <div key={label} className="text-center p-2.5 rounded-xl" style={{ backgroundColor: "rgba(255,255,255,0.06)" }}>
                  <p className="font-bold text-white" style={{ fontSize: 16 }}>{value}</p>
                  <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.4)" }}>{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left — performance + matches */}
        <div className="lg:col-span-2 flex flex-col gap-5">
          {/* Performance Chart */}
          <div className="p-5 rounded-2xl" style={{ backgroundColor: "var(--card)", border: "1px solid var(--border)" }}>
            <h3 className="text-sm font-semibold mb-4" style={{ color: "var(--foreground)" }}>Performance (Last 6 Months)</h3>
            {(() => {
              const h = 140, padL = 26, padB = 22, padT = 8, padR = 6;
              const maxVal = Math.max(...performanceData.map(d => Math.max(d.wins, d.losses)));
              const chartH = h - padT - padB;
              const groupW = 26, gap = 2;
              const bW = (groupW - gap) / 2;
              const step = (300 - padL - padR) / performanceData.length;
              return (
                <svg width="100%" height={h} viewBox={`0 0 300 ${h}`} preserveAspectRatio="xMidYMid meet">
                  {[0, Math.round(maxVal / 2), maxVal].map((v) => {
                    const y = padT + chartH - (v / maxVal) * chartH;
                    return (
                      <g key={v}>
                        <line x1={padL} x2={300 - padR} y1={y} y2={y} stroke="var(--border)" strokeWidth={0.5} />
                        <text x={padL - 4} y={y + 3.5} textAnchor="end" fontSize={8.5} fill="var(--muted-foreground)">{v}</text>
                      </g>
                    );
                  })}
                  {performanceData.map((d, i) => {
                    const cx = padL + i * step + (step - groupW) / 2;
                    const wh = (d.wins / maxVal) * chartH;
                    const lh = (d.losses / maxVal) * chartH;
                    return (
                      <g key={d.month}>
                        <rect x={cx} y={padT + chartH - wh} width={bW} height={wh} rx={3} fill="var(--navy)" />
                        <rect x={cx + bW + gap} y={padT + chartH - lh} width={bW} height={lh} rx={3} fill="var(--border)" />
                        <text x={cx + groupW / 2} y={h - 5} textAnchor="middle" fontSize={8.5} fill="var(--muted-foreground)">{d.month}</text>
                      </g>
                    );
                  })}
                  <g>
                    <rect x={padL} y={h - 2} width={8} height={3.5} rx={1} fill="var(--navy)" />
                    <text x={padL + 10} y={h - 0.5} fontSize={8} fill="var(--muted-foreground)">Wins</text>
                    <rect x={padL + 36} y={h - 2} width={8} height={3.5} rx={1} fill="var(--border)" />
                    <text x={padL + 46} y={h - 0.5} fontSize={8} fill="var(--muted-foreground)">Losses</text>
                  </g>
                </svg>
              );
            })()}
          </div>

          {/* Recent Match Results */}
          <div className="p-5 rounded-2xl" style={{ backgroundColor: "var(--card)", border: "1px solid var(--border)" }}>
            <h3 className="text-sm font-semibold mb-4" style={{ color: "var(--foreground)" }}>Recent Match Results</h3>
            <div className="flex flex-col gap-2">
              {matchResults.map((m, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-xl" style={{ backgroundColor: "var(--background)" }}>
                  <span className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0"
                    style={{ backgroundColor: m.result === "W" ? "rgba(16,185,129,0.1)" : "rgba(239,68,68,0.1)", color: m.result === "W" ? "var(--win-green)" : "var(--live-red)" }}>
                    {m.result}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate" style={{ color: "var(--foreground)" }}>vs {m.opponent}</p>
                    <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>{m.event} · {m.round} · {m.date}</p>
                  </div>
                  <span className="text-xs font-mono flex-shrink-0" style={{ color: "var(--muted-foreground)" }}>{m.score}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Tournament History */}
          <div className="p-5 rounded-2xl" style={{ backgroundColor: "var(--card)", border: "1px solid var(--border)" }}>
            <h3 className="text-sm font-semibold mb-4" style={{ color: "var(--foreground)" }}>Tournament History</h3>
            <div className="flex flex-col gap-2">
              {tournamentHistory.map((t, i) => (
                <div key={i} className="flex items-center justify-between gap-3 p-3 rounded-xl" style={{ backgroundColor: "var(--background)" }}>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate" style={{ color: "var(--foreground)" }}>{t.name}</p>
                    <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>{t.year} · {t.points.toLocaleString()} pts</p>
                  </div>
                  <span className="text-xs px-2.5 py-1 rounded-lg font-medium flex-shrink-0"
                    style={{ backgroundColor: t.result.includes("🏆") ? "rgba(245,158,11,0.1)" : t.result.includes("🥈") ? "rgba(156,163,175,0.15)" : "var(--muted)", color: t.result.includes("🏆") ? "#F59E0B" : t.result.includes("🥈") ? "#9CA3AF" : "var(--muted-foreground)", fontWeight: t.result.includes("🏆") || t.result.includes("🥈") ? 600 : 400 }}>
                    {t.result}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right — badges + H2H */}
        <div className="flex flex-col gap-5">
          {/* Achievements */}
          <div className="p-5 rounded-2xl" style={{ backgroundColor: "var(--card)", border: "1px solid var(--border)" }}>
            <div className="flex items-center gap-2 mb-4">
              <Award size={15} style={{ color: "var(--navy)" }} />
              <h3 className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>Achievements & Titles</h3>
            </div>
            <div className="flex flex-col gap-2">
              {badges.map(({ icon, label, earned }) => (
                <div key={label} className="flex items-center gap-3 p-2.5 rounded-xl" style={{ backgroundColor: earned ? "rgba(11,31,58,0.04)" : "transparent", opacity: earned ? 1 : 0.35 }}>
                  <span className="text-xl flex-shrink-0">{icon}</span>
                  <span className="text-sm" style={{ color: "var(--foreground)", fontWeight: earned ? 500 : 400 }}>{label}</span>
                  {earned && <span className="ml-auto text-xs px-2 py-0.5 rounded-md" style={{ backgroundColor: "rgba(16,185,129,0.1)", color: "var(--win-green)" }}>Earned</span>}
                </div>
              ))}
            </div>
          </div>

          {/* Head-to-Head */}
          <div className="p-5 rounded-2xl" style={{ backgroundColor: "var(--card)", border: "1px solid var(--border)" }}>
            <h3 className="text-sm font-semibold mb-4" style={{ color: "var(--foreground)" }}>Head-to-Head Record</h3>
            <div className="flex flex-col gap-3">
              {h2hRecords.map((h, i) => (
                <div key={i} className="p-3 rounded-xl" style={{ backgroundColor: "var(--background)" }}>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium" style={{ color: "var(--foreground)" }}>vs {h.opponent}</p>
                    <span className="text-xs font-bold px-2 py-0.5 rounded" style={{ backgroundColor: h.lastResult === "W" ? "rgba(16,185,129,0.1)" : "rgba(239,68,68,0.1)", color: h.lastResult === "W" ? "var(--win-green)" : "var(--live-red)" }}>
                      Last: {h.lastResult}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ backgroundColor: "var(--muted)" }}>
                      <div className="h-full rounded-full" style={{ width: `${(h.wins / (h.wins + h.losses)) * 100}%`, backgroundColor: "var(--navy)" }} />
                    </div>
                    <span className="text-xs font-semibold flex-shrink-0" style={{ color: "var(--navy)" }}>
                      {h.wins}W–{h.losses}L
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
