import React, { useState } from "react";
import {
  Trophy, TrendingUp, Users, ChevronLeft, CalendarDays,
  ShoppingBag, Clock, ChevronRight, ChevronDown, ChevronUp, BadgeCheck,
  Pencil, Shield, Bell, HelpCircle, Lock, LogOut, FileText, Star,
  Target, Award, Activity, Swords, MapPin,
} from "lucide-react";
import type { Order } from "../types/shop";
import { OrderHistoryScreen } from "./OrderHistoryScreen";

// ── data ─────────────────────────────────────────────────────────────────────

const performanceData = [
  { month: "Mar", wins: 4, losses: 2 },
  { month: "Apr", wins: 6, losses: 1 },
  { month: "May", wins: 5, losses: 3 },
  { month: "Jun", wins: 8, losses: 1 },
  { month: "Jul", wins: 7, losses: 2 },
  { month: "Aug", wins: 9, losses: 1 },
];

const rankHistory = [
  { month: "Mar", rank: 34 },
  { month: "Apr", rank: 30 },
  { month: "May", rank: 28 },
  { month: "Jun", rank: 26 },
  { month: "Jul", rank: 25 },
  { month: "Aug", rank: 24 },
];

const tournamentHistory = [
  { name: "KL Open Masters 2025", date: "Aug 2–5, 2025", category: "Intermediate", result: "Quarter-Finals", points: 320, details: "Defeated in QF by #8 seed in 3 games." },
  { name: "Community Sunday League", date: "Jun 15, 2025", category: "Open", result: "Champion 🏆", points: 750, details: "Won all 5 matches. Finals score: 21-18, 21-14." },
  { name: "Selangor State Champs 2024", date: "Nov 10–12, 2024", category: "Intermediate", result: "Round of 16", points: 120, details: "Lost to top seed in straight games." },
  { name: "BWF Junior Open 2024", date: "Aug 20–22, 2024", category: "Intermediate", result: "Semi-Finals", points: 480, details: "Reached SF, lost to eventual champion." },
];

const courtBookings = [
  { court: "Axiata Arena — Hall A", date: "Aug 8, 2025", time: "18:00–19:00", price: "RM 18", status: "Completed" },
  { court: "Cheras Sports Complex", date: "Aug 5, 2025", time: "07:00–08:00", price: "RM 12", status: "Completed" },
  { court: "Axiata Arena — Hall A", date: "Jul 30, 2025", time: "19:00–20:00", price: "RM 18", status: "Completed" },
  { court: "Titiwangsa Outdoor", date: "Jul 25, 2025", time: "06:00–07:00", price: "RM 8", status: "Cancelled" },
];

const gamesJoined = [
  { title: "Singles — Intermediate", host: "Raj Kumaran", court: "Axiata Arena", date: "Aug 7, 2025", time: "19:00", result: "W" },
  { title: "Doubles — Open", host: "Marcus Tan", court: "Cheras Sports", date: "Aug 3, 2025", time: "08:00", result: "L" },
  { title: "Singles — Intermediate", host: "Ahmad Zaki", court: "Titiwangsa", date: "Jul 28, 2025", time: "06:30", result: "W" },
];

const gamesHosted = [
  { title: "Singles — Intermediate", court: "Axiata Arena — Hall A", date: "Aug 1, 2025", time: "20:00–21:00", players: 3, maxPlayers: 4 },
  { title: "Doubles — Open", court: "Cheras Sports Complex", date: "Jul 20, 2025", time: "08:00–09:00", players: 4, maxPlayers: 4 },
];

const shopOrdersSample = [
  { item: "Yonex Aerosensa 50 (12-pack)", date: "Aug 2, 2025", price: "RM 48", status: "Delivered" },
  { item: "Victor Overgrip (12-pack)", date: "Jul 20, 2025", price: "RM 18", status: "Delivered" },
  { item: "ShuttleHub Pro Jersey — Navy/Lime", date: "Jun 28, 2025", price: "RM 65", status: "Processing" },
];

const achievementBadges = [
  { icon: "🏆", label: "Tournament Champion", desc: "Won a tournament", earned: true },
  { icon: "🎯", label: "First Tournament", desc: "Entered first tournament", earned: true },
  { icon: "⚡", label: "Win Streak", desc: "5 consecutive wins", earned: true },
  { icon: "🔥", label: "100 Matches Played", desc: "Played 100+ matches", earned: false },
  { icon: "👑", label: "Top Ranked Player", desc: "Reached top 10 nationally", earned: false },
  { icon: "💎", label: "Elite Player", desc: "Achieve Elite classification", earned: false },
];

// ── helpers ───────────────────────────────────────────────────────────────────

type ProfileSection = "identity" | "tournaments" | "activity" | "performance" | "orders" | "settings";

function resultColor(result: string) {
  if (result.includes("🏆")) return { bg: "rgba(245,158,11,0.12)", text: "#F59E0B" };
  if (result.includes("Semi")) return { bg: "rgba(59,130,246,0.1)", text: "#3B82F6" };
  if (result.includes("Quarter") || result.includes("QF")) return { bg: "rgba(139,92,246,0.1)", text: "#8B5CF6" };
  if (result.includes("Runner")) return { bg: "rgba(156,163,175,0.15)", text: "#9CA3AF" };
  return { bg: "var(--muted)", text: "var(--muted-foreground)" };
}

// ── Shared sub-screen wrapper ─────────────────────────────────────────────────

function DetailScreen({ title, onBack, children }: { title: string; onBack: () => void; children: React.ReactNode }) {
  return (
    <div className="flex flex-col" style={{ backgroundColor: "var(--background)", minHeight: "100vh" }}>
      <div className="flex items-center gap-3 px-4 pt-5 pb-4 sticky top-0 z-10" style={{ backgroundColor: "var(--background)", borderBottom: "1px solid var(--border)" }}>
        <button onClick={onBack} className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: "var(--card)", border: "1px solid var(--border)" }}>
          <ChevronLeft size={16} style={{ color: "var(--foreground)" }} />
        </button>
        <h2 className="text-base font-bold" style={{ color: "var(--foreground)" }}>{title}</h2>
      </div>
      <div className="flex flex-col gap-4 p-4 pb-8">{children}</div>
    </div>
  );
}

// ── Detail screens ────────────────────────────────────────────────────────────

function IdentityDetail({ onBack }: { onBack: () => void }) {
  return (
    <DetailScreen title="Player Identity" onBack={onBack}>
      <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid var(--border)" }}>
        {[
          { label: "Player ID", value: "#SH-20481", mono: true },
          { label: "Full Name", value: "Amir bin Hassan" },
          { label: "Date of Birth", value: "12 March 1998" },
          { label: "Government ID Submitted", value: "Aadhaar Card" },
          { label: "Current Category", value: "Intermediate" },
          { label: "Current Rank", value: "#24 — National" },
          { label: "Verification Status", value: "Verified ✓", green: true },
        ].map(({ label, value, mono, green }, i, arr) => (
          <div
            key={label}
            className="flex items-center justify-between gap-4 px-4 py-3.5"
            style={{
              backgroundColor: "var(--card)",
              borderBottom: i < arr.length - 1 ? "1px solid var(--border)" : "none",
            }}
          >
            <span className="text-sm" style={{ color: "var(--muted-foreground)" }}>{label}</span>
            <span
              className="text-sm font-semibold text-right"
              style={{
                color: green ? "var(--win-green)" : "var(--foreground)",
                fontFamily: mono ? "monospace" : undefined,
              }}
            >
              {value}
            </span>
          </div>
        ))}
      </div>
    </DetailScreen>
  );
}

function TournamentsDetail({ onBack }: { onBack: () => void }) {
  const [expanded, setExpanded] = useState<number | null>(null);
  return (
    <DetailScreen title="Tournament History" onBack={onBack}>
      {tournamentHistory.map((t, i) => {
        const { bg, text } = resultColor(t.result);
        const isOpen = expanded === i;
        return (
          <div key={i} className="rounded-2xl overflow-hidden" style={{ border: "1px solid var(--border)", backgroundColor: "var(--card)" }}>
            <button className="w-full flex items-center gap-3 p-4 text-left" onClick={() => setExpanded(isOpen ? null : i)}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: "rgba(11,31,58,0.06)" }}>
                <Trophy size={16} style={{ color: "var(--navy)" }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate" style={{ color: "var(--foreground)" }}>{t.name}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs" style={{ color: "var(--muted-foreground)" }}>{t.date}</span>
                  <span className="text-xs px-1.5 py-0.5 rounded-md" style={{ backgroundColor: "rgba(11,31,58,0.06)", color: "var(--muted-foreground)" }}>{t.category}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className="text-xs px-2 py-0.5 rounded-lg font-semibold" style={{ backgroundColor: bg, color: text }}>{t.result}</span>
                {isOpen ? <ChevronUp size={14} style={{ color: "var(--muted-foreground)" }} /> : <ChevronDown size={14} style={{ color: "var(--muted-foreground)" }} />}
              </div>
            </button>
            {isOpen && (
              <div className="px-4 pb-4 flex flex-col gap-3" style={{ borderTop: "1px solid var(--border)" }}>
                <p className="text-sm pt-3" style={{ color: "var(--muted-foreground)" }}>{t.details}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Star size={13} style={{ color: "#F59E0B" }} />
                    <span className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>+{t.points} ranking pts</span>
                  </div>
                  <button className="text-xs font-semibold px-3 py-1.5 rounded-xl flex items-center gap-1" style={{ backgroundColor: "rgba(11,31,58,0.06)", color: "var(--navy)" }}>
                    View Details <ChevronRight size={11} />
                  </button>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </DetailScreen>
  );
}

function ActivityDetail({ onBack }: { onBack: () => void }) {
  const [tab, setTab] = useState<"bookings" | "joined" | "hosted">("bookings");
  return (
    <DetailScreen title="Play Activity" onBack={onBack}>
      <div className="flex gap-1 p-1 rounded-2xl" style={{ backgroundColor: "var(--muted)" }}>
        {([
          { id: "bookings", label: "Bookings", icon: CalendarDays },
          { id: "joined", label: "Joined", icon: Users },
          { id: "hosted", label: "Hosted", icon: Swords },
        ] as const).map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-semibold"
            style={{
              backgroundColor: tab === id ? "var(--card)" : "transparent",
              color: tab === id ? "var(--navy)" : "var(--muted-foreground)",
              boxShadow: tab === id ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
            }}
          >
            <Icon size={12} /> {label}
          </button>
        ))}
      </div>

      {tab === "bookings" && (
        <div className="flex flex-col gap-2">
          {courtBookings.map((b, i) => (
            <div key={i} className="flex items-center gap-3 p-4 rounded-2xl" style={{ backgroundColor: "var(--card)", border: "1px solid var(--border)" }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: "rgba(11,31,58,0.06)" }}>
                <Clock size={16} style={{ color: "var(--navy)" }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate" style={{ color: "var(--foreground)" }}>{b.court}</p>
                <p className="text-xs mt-0.5" style={{ color: "var(--muted-foreground)" }}>{b.date} · {b.time}</p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-sm font-bold" style={{ color: "var(--navy)" }}>{b.price}</p>
                <span className="text-xs" style={{ color: b.status === "Completed" ? "var(--win-green)" : "var(--live-red)" }}>{b.status}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === "joined" && (
        <div className="flex flex-col gap-2">
          {gamesJoined.map((g, i) => (
            <div key={i} className="flex items-center gap-3 p-4 rounded-2xl" style={{ backgroundColor: "var(--card)", border: "1px solid var(--border)" }}>
              <span className="w-10 h-10 rounded-xl flex items-center justify-center text-xs font-bold flex-shrink-0"
                style={{ backgroundColor: g.result === "W" ? "rgba(16,185,129,0.1)" : "rgba(239,68,68,0.1)", color: g.result === "W" ? "var(--win-green)" : "var(--live-red)" }}>
                {g.result}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate" style={{ color: "var(--foreground)" }}>{g.title}</p>
                <p className="text-xs mt-0.5" style={{ color: "var(--muted-foreground)" }}>Host: {g.host} · {g.date}</p>
              </div>
              <p className="text-xs flex-shrink-0" style={{ color: "var(--muted-foreground)" }}>{g.time}</p>
            </div>
          ))}
        </div>
      )}

      {tab === "hosted" && (
        <div className="flex flex-col gap-2">
          {gamesHosted.map((g, i) => (
            <div key={i} className="flex items-center gap-3 p-4 rounded-2xl" style={{ backgroundColor: "var(--card)", border: "1px solid var(--border)" }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: "rgba(167,255,63,0.12)" }}>
                <Swords size={16} style={{ color: "#7ec920" }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate" style={{ color: "var(--foreground)" }}>{g.title}</p>
                <p className="text-xs mt-0.5" style={{ color: "var(--muted-foreground)" }}>{g.court} · {g.date}</p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-sm font-bold" style={{ color: "var(--navy)" }}>{g.players}/{g.maxPlayers}</p>
                <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>players</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </DetailScreen>
  );
}

function PerformanceDetail({ onBack }: { onBack: () => void }) {
  const totalWins = performanceData.reduce((s, d) => s + d.wins, 0);
  const totalLosses = performanceData.reduce((s, d) => s + d.losses, 0);
  const winPct = Math.round((totalWins / (totalWins + totalLosses)) * 100);

  // SVG bar chart
  const BarChart = () => {
    const h = 150, padL = 24, padB = 22, padT = 8, padR = 6;
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
      </svg>
    );
  };

  // SVG area chart
  const AreaChart = () => {
    const W = 300, H = 110, padL = 28, padR = 6, padT = 10, padB = 22;
    const chartW = W - padL - padR;
    const chartH = H - padT - padB;
    const minR = Math.min(...rankHistory.map(d => d.rank));
    const maxR = Math.max(...rankHistory.map(d => d.rank));
    const range = maxR - minR || 1;
    const pts = rankHistory.map((d, i) => ({
      x: padL + (i / (rankHistory.length - 1)) * chartW,
      y: padT + ((d.rank - minR) / range) * chartH,
      ...d,
    }));
    const linePath = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");
    const areaPath = `${linePath} L${pts[pts.length - 1].x.toFixed(1)},${(padT + chartH).toFixed(1)} L${pts[0].x.toFixed(1)},${(padT + chartH).toFixed(1)} Z`;
    return (
      <svg width="100%" height={H} viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet">
        <defs>
          <linearGradient id="perf-rankGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#0B1F3A" stopOpacity={0.18} />
            <stop offset="100%" stopColor="#0B1F3A" stopOpacity={0} />
          </linearGradient>
        </defs>
        {[maxR, Math.round((maxR + minR) / 2), minR].map((v) => {
          const y = padT + ((v - minR) / range) * chartH;
          return (
            <g key={v}>
              <line x1={padL} x2={W - padR} y1={y} y2={y} stroke="var(--border)" strokeWidth={0.5} />
              <text x={padL - 4} y={y + 3.5} textAnchor="end" fontSize={8.5} fill="var(--muted-foreground)">#{v}</text>
            </g>
          );
        })}
        <path d={areaPath} fill="url(#perf-rankGrad)" />
        <path d={linePath} fill="none" stroke="var(--navy)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
        {pts.map((p) => (
          <g key={p.month}>
            <circle cx={p.x} cy={p.y} r={3} fill="var(--navy)" />
            <text x={p.x} y={H - 5} textAnchor="middle" fontSize={8.5} fill="var(--muted-foreground)">{p.month}</text>
          </g>
        ))}
      </svg>
    );
  };

  return (
    <DetailScreen title="Performance Report" onBack={onBack}>
      {/* KPI grid */}
      <div className="grid grid-cols-2 gap-3">
        {[
          { label: "Total Ranking Points", value: "4,820", icon: Star, color: "#F59E0B" },
          { label: "Win Percentage", value: `${winPct}%`, icon: Target, color: "var(--win-green)" },
          { label: "Highest Rank Achieved", value: "#21", icon: Trophy, color: "var(--navy)" },
          { label: "Tournament Titles", value: "1", icon: Award, color: "#8B5CF6" },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="p-4 rounded-2xl" style={{ backgroundColor: "var(--card)", border: "1px solid var(--border)" }}>
            <div className="flex items-center gap-1.5 mb-2">
              <Icon size={13} style={{ color }} />
              <span className="text-xs" style={{ color: "var(--muted-foreground)", lineHeight: 1.3 }}>{label}</span>
            </div>
            <p className="font-bold" style={{ fontSize: 24, color: "var(--foreground)" }}>{value}</p>
          </div>
        ))}
      </div>

      {/* Wins vs Losses */}
      <div className="p-4 rounded-2xl" style={{ backgroundColor: "var(--card)", border: "1px solid var(--border)" }}>
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>Wins vs Losses</h4>
          <div className="flex items-center gap-3 text-xs" style={{ color: "var(--muted-foreground)" }}>
            <span className="flex items-center gap-1"><span className="inline-block w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: "var(--navy)" }} /> Wins</span>
            <span className="flex items-center gap-1"><span className="inline-block w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: "var(--border)" }} /> Losses</span>
          </div>
        </div>
        <BarChart />
      </div>

      {/* Ranking Progress */}
      <div className="p-4 rounded-2xl" style={{ backgroundColor: "var(--card)", border: "1px solid var(--border)" }}>
        <h4 className="text-sm font-semibold mb-3" style={{ color: "var(--foreground)" }}>Ranking Progress (Last 6 Months)</h4>
        <AreaChart />
      </div>

      {/* Tournament stats */}
      <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid var(--border)" }}>
        {[
          { label: "Tournaments Entered", value: "12" },
          { label: "Matches Won", value: "47" },
          { label: "Matches Lost", value: "19" },
          { label: "Points This Season", value: "1,670" },
        ].map(({ label, value }, i, arr) => (
          <div key={label} className="flex items-center justify-between gap-4 px-4 py-3.5"
            style={{ backgroundColor: "var(--card)", borderBottom: i < arr.length - 1 ? "1px solid var(--border)" : "none" }}>
            <span className="text-sm" style={{ color: "var(--muted-foreground)" }}>{label}</span>
            <span className="text-sm font-bold" style={{ color: "var(--foreground)" }}>{value}</span>
          </div>
        ))}
      </div>

      {/* Achievements */}
      <div className="p-4 rounded-2xl" style={{ backgroundColor: "var(--card)", border: "1px solid var(--border)" }}>
        <div className="flex items-center gap-2 mb-4">
          <Award size={14} style={{ color: "var(--navy)" }} />
          <h4 className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>Achievements</h4>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {achievementBadges.map(({ icon, label, desc, earned }) => (
            <div key={label} className="p-3 rounded-xl flex flex-col items-center text-center gap-1"
              style={{ backgroundColor: earned ? "rgba(11,31,58,0.05)" : "var(--muted)", border: `1px solid ${earned ? "var(--border)" : "transparent"}`, opacity: earned ? 1 : 0.45 }}>
              <span style={{ fontSize: 26 }}>{icon}</span>
              <p className="text-xs font-semibold leading-tight" style={{ color: "var(--foreground)" }}>{label}</p>
              <p style={{ fontSize: 10, color: "var(--muted-foreground)", lineHeight: 1.3 }}>{desc}</p>
              {earned && (
                <span className="text-xs px-2 py-0.5 rounded-md font-semibold" style={{ backgroundColor: "rgba(16,185,129,0.1)", color: "var(--win-green)" }}>Earned</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </DetailScreen>
  );
}

function OrdersDetail({ onBack, orders, onShowOrders, onReorder }: { onBack: () => void; orders: Order[]; onShowOrders?: () => void; onReorder?: (o: Order) => void }) {
  const displayOrders = orders.length > 0
    ? orders.map((o) => ({ item: o.items[0]?.name + (o.items.length > 1 ? ` +${o.items.length - 1}` : ""), date: o.date, price: `RM ${o.total.toFixed(0)}`, status: o.status }))
    : shopOrdersSample;

  return (
    <DetailScreen title="Shop Orders" onBack={onBack}>
      {orders.length > 0 && (
        <button onClick={() => onShowOrders?.()} className="w-full py-3 rounded-2xl text-sm font-semibold flex items-center justify-center gap-2"
          style={{ backgroundColor: "var(--card)", border: "1px solid var(--border)", color: "var(--navy)" }}>
          View Full Order History <ChevronRight size={14} />
        </button>
      )}
      <div className="flex flex-col gap-2">
        {displayOrders.map((o, i) => {
          const statusColor = o.status === "Delivered" ? "var(--win-green)" : o.status === "Cancelled" ? "var(--live-red)" : "#3B82F6";
          return (
            <div key={i} className="flex items-center gap-3 p-4 rounded-2xl" style={{ backgroundColor: "var(--card)", border: "1px solid var(--border)" }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: "rgba(167,255,63,0.1)" }}>
                <ShoppingBag size={16} style={{ color: "#7ec920" }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate" style={{ color: "var(--foreground)" }}>{o.item}</p>
                <p className="text-xs mt-0.5" style={{ color: "var(--muted-foreground)" }}>{o.date}</p>
              </div>
              <div className="text-right flex-shrink-0 flex flex-col items-end gap-1.5">
                <p className="text-sm font-bold" style={{ color: "var(--navy)" }}>{o.price}</p>
                <span className="text-xs font-semibold" style={{ color: statusColor }}>{o.status}</span>
                <button className="text-xs px-2.5 py-1 rounded-lg flex items-center gap-1"
                  style={{ backgroundColor: "rgba(11,31,58,0.06)", color: "var(--navy)" }}>
                  <FileText size={10} /> Invoice
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </DetailScreen>
  );
}

function SettingsDetail({ onBack, phone }: { onBack: () => void; phone?: string }) {
  return (
    <DetailScreen title="Settings" onBack={onBack}>
      <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid var(--border)" }}>
        {[
          { icon: MapPin, label: "Linked Mobile Number", value: phone ?? "+60 12-345 6789" },
          { icon: Shield, label: "Recovery Email", value: "amir@example.com" },
        ].map(({ icon: Icon, label, value }, i) => (
          <button key={label} className="w-full flex items-center gap-3 px-4 py-3.5 text-left"
            style={{ backgroundColor: "var(--card)", borderBottom: "1px solid var(--border)" }}>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: "rgba(11,31,58,0.06)" }}>
              <Icon size={14} style={{ color: "var(--navy)" }} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>{label}</p>
              <p className="text-sm font-medium" style={{ color: "var(--foreground)" }}>{value}</p>
            </div>
            <ChevronRight size={14} style={{ color: "var(--muted-foreground)" }} />
          </button>
        ))}
        {[
          { icon: Bell, label: "Notifications" },
          { icon: Lock, label: "Privacy" },
          { icon: HelpCircle, label: "Help & Support" },
        ].map(({ icon: Icon, label }, i, arr) => (
          <button key={label} className="w-full flex items-center gap-3 px-4 py-3.5 text-left"
            style={{ backgroundColor: "var(--card)", borderBottom: i < arr.length - 1 ? "1px solid var(--border)" : "none" }}>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: "rgba(11,31,58,0.06)" }}>
              <Icon size={14} style={{ color: "var(--navy)" }} />
            </div>
            <span className="text-sm font-medium flex-1" style={{ color: "var(--foreground)" }}>{label}</span>
            <ChevronRight size={14} style={{ color: "var(--muted-foreground)" }} />
          </button>
        ))}
      </div>
    </DetailScreen>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

interface PlayerProfileProps {
  onBack?: () => void;
  phone?: string;
  orders?: Order[];
  showOrders?: boolean;
  onShowOrders?: () => void;
  onHideOrders?: () => void;
  onReorder?: (order: Order) => void;
}

export function PlayerProfile({ onBack, phone, orders = [], showOrders = false, onShowOrders, onHideOrders, onReorder }: PlayerProfileProps) {
  const [activeSection, setActiveSection] = useState<ProfileSection | null>(null);

  // OrderHistoryScreen (external flow)
  if (showOrders) {
    return <OrderHistoryScreen orders={orders} onBack={() => onHideOrders?.()} onReorder={(o) => { onReorder?.(o); }} />;
  }

  // Detail screens
  if (activeSection === "identity") return <IdentityDetail onBack={() => setActiveSection(null)} />;
  if (activeSection === "tournaments") return <TournamentsDetail onBack={() => setActiveSection(null)} />;
  if (activeSection === "activity") return <ActivityDetail onBack={() => setActiveSection(null)} />;
  if (activeSection === "performance") return <PerformanceDetail onBack={() => setActiveSection(null)} />;
  if (activeSection === "orders") return <OrdersDetail onBack={() => setActiveSection(null)} orders={orders} onShowOrders={onShowOrders} onReorder={onReorder} />;
  if (activeSection === "settings") return <SettingsDetail onBack={() => setActiveSection(null)} phone={phone} />;

  // ── List view ───────────────────────────────────────────────────────────────
  const menuItems: Array<{
    id: ProfileSection;
    icon: React.ElementType;
    iconBg: string;
    iconColor: string;
    label: string;
    desc: string;
  }> = [
    {
      id: "identity",
      icon: Shield,
      iconBg: "rgba(59,130,246,0.1)",
      iconColor: "#3B82F6",
      label: "Player Identity",
      desc: "Player ID, date of birth, government ID, category, rank and verification status",
    },
    {
      id: "tournaments",
      icon: Trophy,
      iconBg: "rgba(245,158,11,0.1)",
      iconColor: "#F59E0B",
      label: "Tournament History",
      desc: "Tournaments participated, results, ranking points earned and tournament details",
    },
    {
      id: "activity",
      icon: Activity,
      iconBg: "rgba(16,185,129,0.1)",
      iconColor: "var(--win-green)",
      label: "Play Activity",
      desc: "Court booking history, games joined, games hosted and upcoming activities",
    },
    {
      id: "performance",
      icon: TrendingUp,
      iconBg: "rgba(139,92,246,0.1)",
      iconColor: "#8B5CF6",
      label: "Performance Report",
      desc: "Ranking progression, win percentage, highest rank, titles won and achievements",
    },
  ];

  return (
    <div className="flex flex-col gap-0 pb-8" style={{ backgroundColor: "var(--background)", minHeight: "100vh" }}>
      {onBack && (
        <div className="px-4 pt-5 pb-2">
          <button onClick={onBack} className="flex items-center gap-2 text-sm w-fit" style={{ color: "var(--muted-foreground)" }}>
            <ChevronLeft size={16} /> Back
          </button>
        </div>
      )}

      {/* ── Profile Header ────────────────────────────────────────────────── */}
      <div className="mx-4 mt-4 mb-5 p-5 rounded-2xl" style={{ background: "linear-gradient(135deg, var(--navy) 0%, #162D52 100%)" }}>
        <div className="flex items-start gap-4 mb-5">
          <div className="relative flex-shrink-0">
            <img
              src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=96&h=96&fit=crop&auto=format"
              alt="Amir Hassan"
              className="rounded-2xl object-cover"
              style={{ width: 84, height: 84, border: "3px solid var(--lime)" }}
            />
            <button className="absolute -bottom-2 -right-2 w-7 h-7 rounded-full flex items-center justify-center" style={{ backgroundColor: "var(--lime)" }}>
              <Pencil size={12} style={{ color: "var(--navy)" }} />
            </button>
          </div>
          <div className="flex-1 min-w-0 pt-1">
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-white" style={{ fontSize: 20, fontWeight: 800, letterSpacing: -0.3 }}>Amir Hassan</h2>
              <BadgeCheck size={16} style={{ color: "var(--lime)" }} />
            </div>
            <p className="text-xs font-mono mb-2" style={{ color: "rgba(255,255,255,0.4)" }}>#SH-20481</p>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs px-2 py-0.5 rounded-md font-semibold" style={{ backgroundColor: "rgba(167,255,63,0.15)", color: "var(--lime)" }}>
                Intermediate
              </span>
              <span className="text-xs px-2 py-0.5 rounded-md font-semibold" style={{ backgroundColor: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.7)" }}>
                Rank #24
              </span>
            </div>
            {phone && <p className="text-xs mt-1.5" style={{ color: "rgba(255,255,255,0.35)" }}>📱 {phone}</p>}
          </div>
        </div>

        <div className="grid grid-cols-4 gap-2 mb-4">
          {[
            { label: "Points", value: "4,820" },
            { label: "Wins", value: "47" },
            { label: "Win %", value: "71%" },
            { label: "Titles", value: "1" },
          ].map(({ label, value }) => (
            <div key={label} className="text-center p-2.5 rounded-xl" style={{ backgroundColor: "rgba(255,255,255,0.06)" }}>
              <p className="text-white font-bold" style={{ fontSize: 15 }}>{value}</p>
              <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.4)" }}>{label}</p>
            </div>
          ))}
        </div>

        <button
          className="w-full py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2"
          style={{ backgroundColor: "rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.85)", border: "1px solid rgba(255,255,255,0.15)" }}
        >
          <Pencil size={13} /> Edit Profile
        </button>
      </div>

      {/* ── Menu list — first group ───────────────────────────────────────── */}
      <div className="mx-4 mb-3 rounded-2xl overflow-hidden" style={{ border: "1px solid var(--border)" }}>
        {menuItems.map(({ id, icon: Icon, iconBg, iconColor, label, desc }, i) => (
          <button
            key={id}
            onClick={() => setActiveSection(id)}
            className="w-full flex items-center gap-3 px-4 py-3.5 text-left"
            style={{
              backgroundColor: "var(--card)",
              borderBottom: i < menuItems.length - 1 ? "1px solid var(--border)" : "none",
            }}
          >
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: iconBg }}>
              <Icon size={17} style={{ color: iconColor }} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>{label}</p>
              <p className="text-xs mt-0.5 leading-snug" style={{ color: "var(--muted-foreground)" }}>{desc}</p>
            </div>
            <ChevronRight size={16} style={{ color: "var(--muted-foreground)", flexShrink: 0 }} />
          </button>
        ))}
      </div>

      {/* ── Organizer promo card ──────────────────────────────────────────── */}
      <div
        className="mx-4 mb-3 p-5 rounded-2xl overflow-hidden relative"
        style={{ background: "linear-gradient(135deg, #0B1F3A 0%, #162D52 60%, #1a3a66 100%)", border: "1px solid rgba(167,255,63,0.2)" }}
      >
        <div className="absolute top-0 right-0 w-28 h-28 rounded-full" style={{ background: "var(--lime)", opacity: 0.05, transform: "translate(30%, -30%)" }} />
        <div className="relative">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: "rgba(167,255,63,0.15)" }}>
              <Trophy size={15} style={{ color: "var(--lime)" }} />
            </div>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ backgroundColor: "rgba(167,255,63,0.12)", color: "var(--lime)" }}>
              Premium Feature
            </span>
          </div>
          <h3 className="text-white mb-2" style={{ fontSize: 16, fontWeight: 800 }}>Become a Tournament Organizer</h3>
          <p className="text-sm mb-4" style={{ color: "rgba(255,255,255,0.55)", lineHeight: 1.55 }}>
            Create and manage professional badminton tournaments with automated fixture generation, live scoring, player check-in, pool &amp; knockout management and tournament reports.
          </p>
          <div className="grid grid-cols-3 gap-2 mb-4">
            {["Fixtures", "Live Scoring", "Reports"].map((f) => (
              <div key={f} className="text-center py-1.5 rounded-lg" style={{ backgroundColor: "rgba(255,255,255,0.06)" }}>
                <p className="text-xs font-medium" style={{ color: "rgba(255,255,255,0.65)" }}>{f}</p>
              </div>
            ))}
          </div>
          <button className="w-full py-3 rounded-xl text-sm font-bold" style={{ backgroundColor: "var(--lime)", color: "var(--navy)" }}>
            Explore Organizer Dashboard
          </button>
        </div>
      </div>

      {/* ── Menu list — second group ──────────────────────────────────────── */}
      <div className="mx-4 mb-3 rounded-2xl overflow-hidden" style={{ border: "1px solid var(--border)" }}>
        <button
          onClick={() => setActiveSection("orders")}
          className="w-full flex items-center gap-3 px-4 py-3.5 text-left"
          style={{ backgroundColor: "var(--card)", borderBottom: "1px solid var(--border)" }}
        >
          <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: "rgba(167,255,63,0.1)" }}>
            <ShoppingBag size={17} style={{ color: "#7ec920" }} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>Shop Orders</p>
            <p className="text-xs mt-0.5" style={{ color: "var(--muted-foreground)" }}>Purchased products, order history, invoices and order status</p>
          </div>
          <ChevronRight size={16} style={{ color: "var(--muted-foreground)", flexShrink: 0 }} />
        </button>

        <button
          onClick={() => setActiveSection("settings")}
          className="w-full flex items-center gap-3 px-4 py-3.5 text-left"
          style={{ backgroundColor: "var(--card)" }}
        >
          <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: "rgba(11,31,58,0.06)" }}>
            <Shield size={17} style={{ color: "var(--navy)" }} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>Settings</p>
            <p className="text-xs mt-0.5" style={{ color: "var(--muted-foreground)" }}>Mobile number, recovery email, notifications, privacy and help</p>
          </div>
          <ChevronRight size={16} style={{ color: "var(--muted-foreground)", flexShrink: 0 }} />
        </button>
      </div>

      {/* ── Logout ────────────────────────────────────────────────────────── */}
      <div className="mx-4 mt-1">
        <button
          className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl text-sm font-semibold"
          style={{ backgroundColor: "rgba(239,68,68,0.07)", color: "var(--live-red)", border: "1px solid rgba(239,68,68,0.15)" }}
        >
          <LogOut size={15} /> Logout
        </button>
        <p className="text-center text-xs mt-3" style={{ color: "var(--muted-foreground)" }}>ShuttleHub v2.4.1 · #SH-20481</p>
      </div>
    </div>
  );
}
