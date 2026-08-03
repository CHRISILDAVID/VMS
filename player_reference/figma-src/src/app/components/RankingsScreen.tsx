import { useState } from "react";
import { TrendingUp, TrendingDown, Minus, ExternalLink } from "lucide-react";
import { PublicPlayerProfile, type PublicPlayerData } from "./PublicPlayerProfile";

const rankings = [
  {
    rank: 1,
    prev: 1,
    name: "Lee Zii Jia",
    country: "🇲🇾",
    points: 92450,
    wins: 24,
    losses: 3,
    winRate: 89,
    level: "Elite",
    image: "https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=56&h=56&fit=crop&auto=format",
    trend: 0,
    streak: "W6",
  },
  {
    rank: 2,
    prev: 3,
    name: "Viktor Axelsen",
    country: "🇩🇰",
    points: 88930,
    wins: 22,
    losses: 4,
    winRate: 85,
    level: "Elite",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=56&h=56&fit=crop&auto=format",
    trend: 1,
    streak: "W4",
  },
  {
    rank: 3,
    prev: 2,
    name: "Kodai Naraoka",
    country: "🇯🇵",
    points: 85210,
    wins: 20,
    losses: 5,
    winRate: 80,
    level: "Elite",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=56&h=56&fit=crop&auto=format",
    trend: -1,
    streak: "L1",
  },
  {
    rank: 4,
    prev: 4,
    name: "Shi Yu Qi",
    country: "🇨🇳",
    points: 81400,
    wins: 19,
    losses: 6,
    winRate: 76,
    level: "Elite",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=56&h=56&fit=crop&auto=format",
    trend: 0,
    streak: "W2",
  },
  {
    rank: 5,
    prev: 7,
    name: "Chou Tien Chen",
    country: "🇹🇼",
    points: 76800,
    wins: 18,
    losses: 6,
    winRate: 75,
    level: "Elite",
    image: "https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=56&h=56&fit=crop&auto=format",
    trend: 2,
    streak: "W3",
  },
  {
    rank: 6,
    prev: 5,
    name: "Loh Kean Yew",
    country: "🇸🇬",
    points: 73200,
    wins: 17,
    losses: 7,
    winRate: 71,
    level: "Elite",
    image: "https://images.unsplash.com/photo-1547425260-76bcadfb4f2c?w=56&h=56&fit=crop&auto=format",
    trend: -1,
    streak: "L2",
  },
  {
    rank: 7,
    prev: 6,
    name: "An Se Young",
    country: "🇰🇷",
    points: 70100,
    wins: 21,
    losses: 3,
    winRate: 88,
    level: "Elite",
    image: "https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=56&h=56&fit=crop&auto=format",
    trend: -1,
    streak: "W5",
  },
  {
    rank: 8,
    prev: 9,
    name: "Tai Tzu Ying",
    country: "🇹🇼",
    points: 68400,
    wins: 19,
    losses: 5,
    winRate: 79,
    level: "Elite",
    image: "https://images.unsplash.com/photo-1515377905703-c4788e51af15?w=56&h=56&fit=crop&auto=format",
    trend: 1,
    streak: "W2",
  },
  {
    rank: 9,
    prev: 10,
    name: "Chen Yu Fei",
    country: "🇨🇳",
    points: 65900,
    wins: 18,
    losses: 6,
    winRate: 75,
    level: "Elite",
    image: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=56&h=56&fit=crop&auto=format",
    trend: 1,
    streak: "W1",
  },
  {
    rank: 10,
    prev: 8,
    name: "Ratchanok Intanon",
    country: "🇹🇭",
    points: 63250,
    wins: 16,
    losses: 7,
    winRate: 70,
    level: "Elite",
    image: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=56&h=56&fit=crop&auto=format",
    trend: -2,
    streak: "L1",
  },
];

const userHasPlayerId = false; // toggle to true once user registers

interface RankingsScreenProps {
  onViewPlayer?: () => void;
  onRegisterPlayerId?: () => void;
}

export function RankingsScreen({ onViewPlayer, onRegisterPlayerId }: RankingsScreenProps) {
  const [selectedPlayer, setSelectedPlayer] = useState<PublicPlayerData | null>(null);
  const top3 = rankings.slice(0, 3);
  const rest = rankings.slice(3);
  const medalColors = ["#F59E0B", "#9CA3AF", "#CD7F32"];
  const medalLabels = ["🥇", "🥈", "🥉"];

  if (selectedPlayer) {
    return <PublicPlayerProfile player={selectedPlayer} onBack={() => setSelectedPlayer(null)} />;
  }

  return (
    <div className="p-4 lg:p-6 flex flex-col lg:flex-row gap-5 lg:gap-6" style={{ backgroundColor: "var(--background)", minHeight: "100vh" }}>
      {/* Main Leaderboard */}
      <div className="flex-1 flex flex-col gap-5 min-w-0">
        {/* Top 3 Podium */}
        <div
          className="p-6 rounded-2xl"
          style={{
            background: "linear-gradient(135deg, var(--navy) 0%, #162D52 100%)",
          }}
        >
          <p className="text-xs font-bold uppercase tracking-widest mb-6" style={{ color: "var(--lime)" }}>
            Top 3 Global Rankings
          </p>
          <div className="flex items-end justify-center gap-6">
            {[top3[1], top3[0], top3[2]].map((p, i) => {
              const podiumIndex = i === 0 ? 1 : i === 1 ? 0 : 2;
              const heights = ["h-24", "h-32", "h-20"];
              return (
                <div key={p.rank} className="flex flex-col items-center gap-3">
                  <span className="text-2xl">{medalLabels[podiumIndex]}</span>
                  <img
                    src={p.image}
                    alt={p.name}
                    className="rounded-2xl object-cover"
                    style={{
                      width: podiumIndex === 0 ? 64 : 52,
                      height: podiumIndex === 0 ? 64 : 52,
                      border: `3px solid ${podiumIndex === 0 ? "var(--lime)" : "rgba(255,255,255,0.2)"}`,
                    }}
                  />
                  <div className="text-center">
                    <p className="text-white text-sm font-semibold">{p.name.split(" ")[0]}</p>
                    <p className="text-xs" style={{ color: "rgba(255,255,255,0.5)" }}>{p.country}</p>
                    <p className="text-xs font-bold" style={{ color: "var(--lime)" }}>
                      {(p.points / 1000).toFixed(1)}k pts
                    </p>
                  </div>
                  <div
                    className={`${heights[podiumIndex === 0 ? 1 : podiumIndex === 1 ? 0 : 2]} w-20 rounded-t-xl flex items-start justify-center pt-2`}
                    style={{
                      backgroundColor: podiumIndex === 0
                        ? "var(--lime)"
                        : podiumIndex === 1
                        ? "rgba(255,255,255,0.12)"
                        : "rgba(255,255,255,0.08)",
                    }}
                  >
                    <span
                      className="text-lg font-black"
                      style={{ color: podiumIndex === 0 ? "var(--navy)" : "rgba(255,255,255,0.4)" }}
                    >
                      #{p.rank}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Player ID card */}
        {userHasPlayerId ? (
          <div
            className="flex items-center gap-5 p-5 rounded-2xl"
            style={{ backgroundColor: "var(--card)", border: "1px solid var(--border)" }}
          >
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl font-black flex-shrink-0"
              style={{ backgroundColor: "var(--lime)", color: "var(--navy)" }}
            >
              24
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold" style={{ color: "var(--foreground)" }}>Amir Hassan</p>
              <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>
                #SH-20481 · Intermediate · 4,820 pts
              </p>
            </div>
            <span
              className="text-xs px-3 py-1.5 rounded-xl font-semibold"
              style={{ backgroundColor: "rgba(16,185,129,0.1)", color: "var(--win-green)" }}
            >
              ✓ Player ID Active
            </span>
          </div>
        ) : (
          <div
            className="flex items-center gap-5 p-5 rounded-2xl"
            style={{
              background: "linear-gradient(135deg, var(--navy) 0%, #162D52 100%)",
              border: "1px solid rgba(167,255,63,0.15)",
            }}
          >
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: "rgba(167,255,63,0.12)", border: "1px solid rgba(167,255,63,0.25)" }}
            >
              <span className="text-2xl">🪪</span>
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-white">Get your ShuttleHub Player ID</p>
              <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.5)" }}>
                Appear on the global rankings, earn badges, and track your career stats
              </p>
            </div>
            <button
              onClick={onRegisterPlayerId}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold flex-shrink-0"
              style={{ backgroundColor: "var(--lime)", color: "var(--navy)" }}
            >
              Register Free <ExternalLink size={13} />
            </button>
          </div>
        )}

        {/* Rankings Table */}
        <div
          className="rounded-2xl overflow-hidden overflow-x-auto"
          style={{ border: "1px solid var(--border)" }}
        >
          <div className="flex items-center justify-between px-5 py-4" style={{ backgroundColor: "var(--card)" }}>
            <h3 className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>
              Full Leaderboard
            </h3>
            <div className="flex gap-2">
              {["Global", "Regional", "Local"].map((scope) => (
                <button
                  key={scope}
                  className="px-3 py-1.5 rounded-lg text-xs"
                  style={{
                    backgroundColor: scope === "Global" ? "var(--navy)" : "var(--muted)",
                    color: scope === "Global" ? "#fff" : "var(--muted-foreground)",
                    fontWeight: scope === "Global" ? 600 : 400,
                  }}
                >
                  {scope}
                </button>
              ))}
            </div>
          </div>
          <table className="w-full">
            <thead>
              <tr style={{ backgroundColor: "var(--muted)" }}>
                {["Rank", "Player", "Country", "Points", "W/L", "Win%", "Streak", ""].map((h) => (
                  <th
                    key={h}
                    className="text-left px-5 py-3 text-xs font-semibold"
                    style={{ color: "var(--muted-foreground)" }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rest.map((p) => (
                <tr
                  key={p.rank}
                  className="hover:bg-[#F8FAFC] cursor-pointer transition-colors"
                  style={{ backgroundColor: "var(--card)", borderBottom: "1px solid var(--border)" }}
                  onClick={() => setSelectedPlayer({ name: p.name, playerId: `#SH-${String(p.rank).padStart(5,"0")}`, rank: p.rank, prevRank: p.rank + (p.trend < 0 ? Math.abs(p.trend) : p.trend > 0 ? -p.trend : 0), country: p.country, location: "Kuala Lumpur, Malaysia", level: p.level, image: p.image, wins: p.wins, losses: p.losses, winRate: p.winRate, points: p.points, titles: Math.max(0, Math.floor(p.rank / 3)) })}
                >
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold flex-shrink-0"
                        style={{ backgroundColor: "var(--muted)", color: "var(--foreground)" }}
                      >
                        {p.rank}
                      </span>
                      {p.trend > 0 ? (
                        <TrendingUp size={13} style={{ color: "var(--win-green)" }} />
                      ) : p.trend < 0 ? (
                        <TrendingDown size={13} style={{ color: "var(--live-red)" }} />
                      ) : (
                        <Minus size={13} style={{ color: "var(--muted-foreground)" }} />
                      )}
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={p.image}
                        alt={p.name}
                        className="w-9 h-9 rounded-full object-cover flex-shrink-0"
                      />
                      <div>
                        <p className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>{p.name}</p>
                        <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>{p.level}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-sm">{p.country}</td>
                  <td className="px-5 py-4 text-sm font-bold" style={{ color: "var(--navy)" }}>
                    {p.points.toLocaleString()}
                  </td>
                  <td className="px-5 py-4 text-sm">
                    <span style={{ color: "var(--win-green)", fontWeight: 600 }}>{p.wins}</span>
                    <span style={{ color: "var(--muted-foreground)" }}>/</span>
                    <span style={{ color: "var(--live-red)", fontWeight: 600 }}>{p.losses}</span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <div
                        className="flex-1 h-1.5 rounded-full overflow-hidden"
                        style={{ backgroundColor: "var(--muted)", width: 60 }}
                      >
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${p.winRate}%`,
                            backgroundColor: p.winRate >= 80 ? "var(--win-green)" : p.winRate >= 70 ? "#F59E0B" : "var(--live-red)",
                          }}
                        />
                      </div>
                      <span className="text-sm font-medium" style={{ color: "var(--foreground)" }}>
                        {p.winRate}%
                      </span>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <span
                      className="text-xs font-bold px-2 py-1 rounded-md"
                      style={{
                        backgroundColor: p.streak.startsWith("W")
                          ? "rgba(16,185,129,0.1)"
                          : "rgba(239,68,68,0.1)",
                        color: p.streak.startsWith("W") ? "var(--win-green)" : "var(--live-red)",
                      }}
                    >
                      {p.streak}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <button className="text-xs font-medium" style={{ color: "var(--navy)" }} onClick={(e) => e.stopPropagation()}>
                      View →
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Right Panel */}
      <div className="w-full lg:w-[300px] lg:flex-shrink-0 flex flex-col gap-5">
        {/* Your Ranking */}
        <div
          className="p-5 rounded-2xl"
          style={{
            background: "linear-gradient(145deg, var(--navy) 0%, #162D52 100%)",
          }}
        >
          <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "var(--lime)" }}>
            Your Ranking
          </p>
          <div className="flex items-center gap-4 mb-4">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl font-black"
              style={{ backgroundColor: "var(--lime)", color: "var(--navy)" }}
            >
              24
            </div>
            <div>
              <p className="text-white font-bold text-lg">Amir Hassan</p>
              <p className="text-sm" style={{ color: "rgba(255,255,255,0.55)" }}>Intermediate · KL</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "Points", value: "4,820" },
              { label: "Win Rate", value: "71%" },
              { label: "Streak", value: "W3" },
            ].map(({ label, value }) => (
              <div key={label} className="text-center p-3 rounded-xl" style={{ backgroundColor: "rgba(255,255,255,0.06)" }}>
                <p className="font-bold text-white text-sm">{value}</p>
                <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.45)" }}>{label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Achievements */}
        <div
          className="p-5 rounded-2xl"
          style={{ backgroundColor: "var(--card)", border: "1px solid var(--border)" }}
        >
          <h3 className="text-sm font-semibold mb-4" style={{ color: "var(--foreground)" }}>
            Badges Earned
          </h3>
          <div className="grid grid-cols-4 gap-3">
            {[
              { icon: "🏆", label: "Champion", earned: true },
              { icon: "⚡", label: "Speed", earned: true },
              { icon: "🎯", label: "Precision", earned: true },
              { icon: "🔥", label: "Hot Streak", earned: true },
              { icon: "🌟", label: "Rising", earned: false },
              { icon: "💎", label: "Elite", earned: false },
              { icon: "🦅", label: "Eagle Eye", earned: false },
              { icon: "👑", label: "Legend", earned: false },
            ].map(({ icon, label, earned }) => (
              <div
                key={label}
                className="flex flex-col items-center gap-1 p-2 rounded-xl"
                style={{
                  backgroundColor: earned ? "rgba(11,31,58,0.06)" : "var(--muted)",
                  opacity: earned ? 1 : 0.4,
                }}
              >
                <span className="text-xl">{icon}</span>
                <span className="text-xs text-center leading-tight" style={{ color: "var(--foreground)", fontSize: 9 }}>
                  {label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
