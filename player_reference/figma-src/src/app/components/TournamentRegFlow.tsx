import { useState } from "react";
import {
  ArrowLeft, MapPin, Calendar, Trophy, Users, Shield,
  CheckCircle, XCircle, CreditCard, Smartphone, Wallet,
  ChevronRight, Loader2, Star, FileText, RefreshCw,
} from "lucide-react";
import { PlayerIDRegistration } from "./PlayerIDRegistration";

/* ─── Shared types ─── */
export interface TournamentForReg {
  id: number;
  name: string;
  location: string;
  dates: string;
  prize: string;
  category: string;
  players: number;
  image: string;
  format: string;
  level: string;
  status: string;
}

type Step =
  | "detail"
  | "player"
  | "summary"
  | "payment"
  | "processing"
  | "noPlayerId"
  | "success"
  | "failed"
  | "registerPlayerId";

type PayMethod = "upi" | "card" | "wallet";

const CATEGORIES = ["Men's Singles", "Women's Singles", "Men's Doubles", "Women's Doubles", "Mixed Doubles"];

const ENTRY_FEES: Record<string, string> = {
  "Men's Singles": "RM 30",
  "Women's Singles": "RM 30",
  "Men's Doubles": "RM 50",
  "Women's Doubles": "RM 50",
  "Mixed Doubles": "RM 50",
};

function makeRegId() {
  return `TR${Date.now().toString().slice(-7)}`;
}

/* ─── Style tokens (dark-theme consistent) ─── */
const bg = "rgba(255,255,255,0.04)";
const border = "rgba(255,255,255,0.08)";
const cardStyle: React.CSSProperties = {
  backgroundColor: bg, border: `1px solid ${border}`, borderRadius: 20, padding: "18px 18px",
};
const label: React.CSSProperties = { color: "rgba(255,255,255,0.55)", fontSize: 12, fontWeight: 500 };
const value: React.CSSProperties = { color: "#fff", fontSize: 14, fontWeight: 600 };
const inputStyle: React.CSSProperties = {
  backgroundColor: "rgba(255,255,255,0.06)",
  border: "1.5px solid rgba(255,255,255,0.12)",
  color: "#fff", borderRadius: 12, width: "100%",
  padding: "12px 16px", fontSize: 14, outline: "none",
};
const stickyBar: React.CSSProperties = {
  position: "fixed", bottom: 0, left: 0, right: 0,
  /* zIndex above the overlay itself (z-50 = 50) so it always renders on top */
  zIndex: 200,
  backgroundColor: "rgba(11,31,58,0.97)", backdropFilter: "blur(12px)",
  borderTop: "1px solid rgba(255,255,255,0.06)",
  padding: "12px 20px calc(12px + env(safe-area-inset-bottom))",
};
const primaryBtn: React.CSSProperties = {
  width: "100%", padding: "15px 0", borderRadius: 16,
  backgroundColor: "var(--lime)", color: "var(--navy)",
  fontWeight: 800, fontSize: 15, cursor: "pointer", border: "none",
};
const ghostBtn: React.CSSProperties = {
  width: "100%", padding: "13px 0", borderRadius: 16,
  backgroundColor: "rgba(255,255,255,0.06)", color: "#fff",
  fontWeight: 600, fontSize: 14, cursor: "pointer",
  border: "1px solid rgba(255,255,255,0.1)",
};

/* ─── Back header ─── */
function FlowHeader({ title, onBack }: { title: string; onBack: () => void }) {
  return (
    <div
      className="flex items-center gap-3 px-4 py-4 sticky top-0 z-30"
      style={{ backgroundColor: "rgba(11,31,58,0.97)", backdropFilter: "blur(12px)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}
    >
      <button onClick={onBack}
        className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ backgroundColor: "rgba(255,255,255,0.08)" }}>
        <ArrowLeft size={16} color="#fff" />
      </button>
      <h1 style={{ color: "#fff", fontSize: 16, fontWeight: 700 }}>{title}</h1>
    </div>
  );
}

/* ─── Step indicator ─── */
const STEPS = ["Details", "Player", "Summary", "Payment"];
const stepIndex: Record<Step, number> = { detail: 0, player: 1, summary: 2, payment: 3, processing: 3, noPlayerId: 3, success: 4, failed: 3, registerPlayerId: 4 };

function StepBar({ step }: { step: Step }) {
  const current = stepIndex[step] ?? 0;
  return (
    <div className="flex items-center gap-1.5 px-4 py-3" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
      {STEPS.map((s, i) => (
        <div key={s} className="flex items-center gap-1.5 flex-1">
          <div
            className="flex items-center justify-center rounded-full text-xs font-bold flex-shrink-0"
            style={{
              width: 22, height: 22,
              backgroundColor: i <= current ? "var(--lime)" : "rgba(255,255,255,0.1)",
              color: i <= current ? "var(--navy)" : "rgba(255,255,255,0.3)",
            }}
          >
            {i < current ? "✓" : i + 1}
          </div>
          <span style={{ fontSize: 10, color: i <= current ? "rgba(255,255,255,0.7)" : "rgba(255,255,255,0.25)", fontWeight: i === current ? 600 : 400 }}>
            {s}
          </span>
          {i < STEPS.length - 1 && (
            <div className="flex-1 h-px" style={{ backgroundColor: i < current ? "var(--lime)" : "rgba(255,255,255,0.1)" }} />
          )}
        </div>
      ))}
    </div>
  );
}

/* ─── Row helper ─── */
function Row({ label: l, val }: { label: string; val: string }) {
  return (
    <div className="flex justify-between items-center py-2.5" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
      <span style={label}>{l}</span>
      <span style={value}>{val}</span>
    </div>
  );
}

/* ─── Props ─── */
interface TournamentRegFlowProps {
  tournament: TournamentForReg;
  onClose: () => void;
  onGoToTournaments: () => void;
  playerName?: string;
  hasPlayerId?: boolean;
  existingPlayerId?: string;
}

export function TournamentRegFlow({
  tournament,
  onClose,
  onGoToTournaments,
  playerName = "Amir Hassan",
  hasPlayerId = false,
  existingPlayerId = "",
}: TournamentRegFlowProps) {
  const [step, setStep] = useState<Step>("detail");
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [playerNameVal, setPlayerNameVal] = useState(playerName);
  const [playerIdVal, setPlayerIdVal] = useState(existingPlayerId);
  const [payMethod, setPayMethod] = useState<PayMethod>("upi");
  const [upiId, setUpiId] = useState("");
  const [regId] = useState(makeRegId());
  // After Player ID registration completes inside the flow, mark as registered
  const [playerIdRegistered, setPlayerIdRegistered] = useState(hasPlayerId);

  const entryFee = ENTRY_FEES[category] ?? "RM 30";
  const feeNum = parseInt(entryFee.replace(/\D/g, ""), 10);

  const back = () => {
    if (step === "player") setStep("detail");
    else if (step === "summary") setStep("player");
    else if (step === "payment") setStep("summary");
    else if (step === "failed") setStep("payment");
    else if (step === "noPlayerId") setStep("payment");
    else onClose();
  };

  /* ── SCREEN: Player ID Registration sub-flow ── */
  if (step === "registerPlayerId") {
    return (
      <div className="fixed inset-0 z-[100]">
        <PlayerIDRegistration
          onBack={() => setStep("noPlayerId")}
          onViewRankings={() => {
            setPlayerIdRegistered(true);
            setStep("success");
          }}
          onGoHome={() => {
            setPlayerIdRegistered(true);
            setStep("success");
          }}
        />
      </div>
    );
  }

  /* ── SCREEN: Processing overlay ── */
  if (step === "processing") {
    return (
      <div
        className="fixed inset-0 z-[100] flex flex-col items-center justify-center gap-6 px-6"
        style={{ background: "linear-gradient(160deg, var(--navy) 0%, #0D2647 100%)" }}
      >
        <div className="w-20 h-20 rounded-full flex items-center justify-center"
          style={{ backgroundColor: "rgba(167,255,63,0.1)", border: "2px solid rgba(167,255,63,0.3)" }}>
          <Loader2 size={32} style={{ color: "var(--lime)" }} className="animate-spin" />
        </div>
        <div className="text-center">
          <p className="font-bold text-xl text-white mb-2">Processing Payment…</p>
          <p className="text-sm" style={{ color: "rgba(255,255,255,0.45)" }}>Do not close this screen</p>
        </div>
        <div className="flex items-center gap-2 px-5 py-2.5 rounded-full"
          style={{ backgroundColor: "rgba(167,255,63,0.08)", border: "1px solid rgba(167,255,63,0.15)" }}>
          <Shield size={13} style={{ color: "var(--lime)" }} />
          <span className="text-xs" style={{ color: "var(--lime)" }}>Secure Payment</span>
        </div>
      </div>
    );
  }

  /* ── SCREEN: Payment Failed ── */
  if (step === "failed") {
    return (
      <div className="fixed inset-0 z-[100] flex flex-col"
        style={{ background: "linear-gradient(160deg, var(--navy) 0%, #0D2647 100%)" }}>
        <FlowHeader title="Payment Failed" onBack={back} />
        <div className="flex-1 flex flex-col items-center justify-center px-6 gap-6 text-center">
          <div className="w-24 h-24 rounded-full flex items-center justify-center"
            style={{ backgroundColor: "rgba(239,68,68,0.1)", border: "2px solid rgba(239,68,68,0.3)" }}>
            <XCircle size={44} style={{ color: "var(--live-red)" }} strokeWidth={1.5} />
          </div>
          <div>
            <h2 className="text-white font-black text-2xl mb-2">Payment Failed</h2>
            <p className="text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.5)" }}>
              Your payment could not be processed. Please check your payment details and try again.
            </p>
          </div>
          <div className="w-full max-w-xs p-4 rounded-2xl" style={{ backgroundColor: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.15)" }}>
            <p className="text-sm font-semibold text-white mb-2">Possible reasons:</p>
            <ul className="text-xs space-y-1 text-left list-disc list-inside" style={{ color: "rgba(255,255,255,0.45)" }}>
              <li>Insufficient balance</li>
              <li>Payment timeout</li>
              <li>Bank declined transaction</li>
            </ul>
          </div>
        </div>
        <div style={{ ...stickyBar, display: "flex", flexDirection: "column", gap: 10 }}>
          <button style={primaryBtn} onClick={() => setStep("payment")}>
            <span className="flex items-center justify-center gap-2"><RefreshCw size={15} /> Retry Payment</span>
          </button>
          <button style={ghostBtn} onClick={() => { setStep("payment"); setPayMethod("card"); }}>
            Change Payment Method
          </button>
        </div>
      </div>
    );
  }

  /* ── SCREEN: Success ── */
  if (step === "success") {
    return (
      <div className="fixed inset-0 z-[100] flex flex-col"
        style={{ background: "linear-gradient(160deg, var(--navy) 0%, #0D2647 100%)", paddingBottom: 130 }}>
        <div className="flex-1 flex flex-col items-center justify-center px-6 gap-5 text-center">
          <div className="w-24 h-24 rounded-full flex items-center justify-center"
            style={{ backgroundColor: "rgba(167,255,63,0.12)", border: "2px solid rgba(167,255,63,0.35)" }}>
            <CheckCircle size={44} style={{ color: "var(--lime)" }} strokeWidth={1.5} />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: "var(--lime)" }}>Registration Successful</p>
            <h2 className="text-white font-black mb-1" style={{ fontSize: 24 }}>You're In! 🏸</h2>
            <p className="text-sm" style={{ color: "rgba(255,255,255,0.45)" }}>Your spot has been confirmed</p>
          </div>

          {/* Confirmation card */}
          <div className="w-full max-w-sm p-5 rounded-2xl" style={{ backgroundColor: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
            <div className="flex flex-col gap-0">
              <Row label="Tournament" val={tournament.name} />
              <Row label="Category" val={category} />
              <Row label="Player Name" val={playerNameVal} />
              <Row label="Entry Fee Paid" val={entryFee} />
              <Row label="Status" val="✅ Registered" />
              <div className="flex justify-between items-center pt-3 mt-1">
                <span style={label}>Registration ID</span>
                <span className="font-black tracking-wider" style={{ color: "var(--lime)", fontSize: 13 }}>#{regId}</span>
              </div>
            </div>
          </div>
        </div>

        <div style={{ ...stickyBar, display: "flex", flexDirection: "column", gap: 10 }}>
          <button style={primaryBtn} onClick={onGoToTournaments}>
            <span className="flex items-center justify-center gap-2"><Trophy size={15} /> View Tournament</span>
          </button>
          <button style={ghostBtn} onClick={onGoToTournaments}>
            Back to Tournaments
          </button>
        </div>
      </div>
    );
  }

  /* ── SCREEN: No Player ID modal ── */
  const noPlayerIdModal = step === "noPlayerId" && (
    <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center px-4"
      style={{ backgroundColor: "rgba(0,0,0,0.65)" }}>
      <div className="w-full max-w-sm rounded-t-3xl sm:rounded-2xl p-6"
        style={{ backgroundColor: "#0F2744", border: "1px solid rgba(255,255,255,0.1)" }}>
        <div className="w-10 h-1 rounded-full mx-auto mb-5" style={{ backgroundColor: "rgba(255,255,255,0.15)" }} />

        <div className="flex flex-col items-center text-center gap-3 mb-6">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
            style={{ backgroundColor: "rgba(167,255,63,0.1)", border: "1px solid rgba(167,255,63,0.2)" }}>
            <span className="text-2xl">🪪</span>
          </div>
          <div>
            <h3 className="text-white font-bold text-lg mb-1">Player ID Required</h3>
            <p className="text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.5)" }}>
              Register a Player ID to complete your tournament entry and appear on rankings.
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <button
            style={{ ...primaryBtn }}
            onClick={() => setStep("registerPlayerId")}
          >
            <span className="flex items-center justify-center gap-2">Register Player ID →</span>
          </button>
          <button
            style={{ ...ghostBtn }}
            onClick={() => setStep("detail")}
          >
            Later
          </button>
        </div>
      </div>
    </div>
  );

  /* ─── SCREEN 1: Tournament Detail ─── */
  if (step === "detail") {
    const rules = [
      "Players must be registered with ShuttleHub Player ID to participate.",
      "All matches follow BWF standard rules.",
      "Players must report 15 minutes before match time.",
      "Unsportsmanlike conduct will result in disqualification.",
      "Organiser decisions are final.",
    ];
    const highlights = [
      { icon: Trophy, label: "Prize Pool", val: tournament.prize },
      { icon: Users, label: "Players", val: `${tournament.players} slots` },
      { icon: Star, label: "Level", val: tournament.level },
      { icon: FileText, label: "Format", val: tournament.format },
    ];
    return (
      <div className="fixed inset-0 flex flex-col overflow-y-auto"
        style={{ background: "linear-gradient(160deg, var(--navy) 0%, #0D2647 100%)", paddingBottom: 130, zIndex: 100 }}>
        <FlowHeader title="Tournament Details" onBack={back} />

        {/* Banner */}
        <div className="relative overflow-hidden" style={{ height: 200, flexShrink: 0 }}>
          <img src={tournament.image} alt={tournament.name} className="w-full h-full object-cover" />
          <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(11,31,58,0.95) 0%, rgba(11,31,58,0.3) 60%, transparent 100%)" }} />
          <div className="absolute bottom-4 left-4">
            <span className="text-xs font-bold px-3 py-1.5 rounded-full"
              style={{ backgroundColor: tournament.status === "LIVE" ? "#EF4444" : tournament.status === "OPEN" ? "#10B981" : "#F59E0B", color: "#fff" }}>
              {tournament.status === "LIVE" && "● "}{tournament.status}
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-4 px-4 py-5">
          {/* Name + location */}
          <div>
            <h1 className="text-white font-black mb-2" style={{ fontSize: 22, lineHeight: 1.2 }}>{tournament.name}</h1>
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center gap-2 text-sm" style={{ color: "rgba(255,255,255,0.55)" }}>
                <MapPin size={14} style={{ color: "var(--lime)", flexShrink: 0 }} /> {tournament.location}
              </div>
              <div className="flex items-center gap-2 text-sm" style={{ color: "rgba(255,255,255,0.55)" }}>
                <Calendar size={14} style={{ color: "var(--lime)", flexShrink: 0 }} /> {tournament.dates}
              </div>
            </div>
          </div>

          {/* Highlights grid */}
          <div className="grid grid-cols-2 gap-3">
            {highlights.map(({ icon: Icon, label: l, val }) => (
              <div key={l} className="flex items-center gap-3 p-3 rounded-2xl" style={cardStyle}>
                <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: "rgba(167,255,63,0.1)" }}>
                  <Icon size={16} style={{ color: "var(--lime)" }} />
                </div>
                <div>
                  <p style={{ ...label, fontSize: 10 }}>{l}</p>
                  <p style={{ ...value, fontSize: 13 }}>{val}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Category selector */}
          <div style={cardStyle}>
            <p style={{ ...label, marginBottom: 10, fontSize: 11, letterSpacing: "0.06em", textTransform: "uppercase" }}>Select Category</p>
            <div className="flex flex-col gap-2">
              {CATEGORIES.map((cat) => (
                <button key={cat} onClick={() => setCategory(cat)}
                  className="flex items-center justify-between px-4 py-3 rounded-xl text-left transition-all"
                  style={{
                    backgroundColor: category === cat ? "rgba(167,255,63,0.1)" : "rgba(255,255,255,0.03)",
                    border: `1.5px solid ${category === cat ? "rgba(167,255,63,0.4)" : "rgba(255,255,255,0.06)"}`,
                  }}>
                  <span style={{ fontSize: 14, color: category === cat ? "var(--lime)" : "#fff", fontWeight: category === cat ? 600 : 400 }}>
                    {cat}
                  </span>
                  <div className="flex items-center gap-2">
                    <span style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>{ENTRY_FEES[cat]}</span>
                    {category === cat && (
                      <div className="w-5 h-5 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: "var(--lime)" }}>
                        <span style={{ color: "var(--navy)", fontSize: 10, fontWeight: 800 }}>✓</span>
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Rules */}
          <div style={cardStyle}>
            <p style={{ ...label, marginBottom: 10, fontSize: 11, letterSpacing: "0.06em", textTransform: "uppercase" }}>Rules & Description</p>
            <ul className="flex flex-col gap-2.5">
              {rules.map((r, i) => (
                <li key={i} className="flex items-start gap-2.5">
                  <span className="mt-0.5 w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold"
                    style={{ backgroundColor: "rgba(167,255,63,0.15)", color: "var(--lime)" }}>
                    {i + 1}
                  </span>
                  <span style={{ fontSize: 13, color: "rgba(255,255,255,0.55)", lineHeight: 1.55 }}>{r}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div style={stickyBar}>
          <button style={primaryBtn} onClick={() => setStep("player")}>
            Register Now →
          </button>
        </div>
      </div>
    );
  }

  /* ─── SCREEN 2: Player Details ─── */
  if (step === "player") {
    return (
      <div className="fixed inset-0 flex flex-col overflow-y-auto"
        style={{ background: "linear-gradient(160deg, var(--navy) 0%, #0D2647 100%)", paddingBottom: 130, zIndex: 100 }}>
        <FlowHeader title="Player Details" onBack={back} />
        <StepBar step={step} />

        <div className="flex flex-col gap-4 px-4 py-5">
          <div style={cardStyle}>
            <p style={{ ...label, marginBottom: 14, fontSize: 11, letterSpacing: "0.06em", textTransform: "uppercase" }}>Your Information</p>

            <div className="flex flex-col gap-4">
              <div>
                <label style={{ ...label, display: "block", marginBottom: 6 }}>Player Name</label>
                <input
                  style={inputStyle}
                  value={playerNameVal}
                  onChange={(e) => setPlayerNameVal(e.target.value)}
                  placeholder="Your full name"
                />
              </div>
              <div>
                <label style={{ ...label, display: "block", marginBottom: 6 }}>
                  Player ID
                  <span className="ml-1.5 px-2 py-0.5 rounded text-xs"
                    style={{ backgroundColor: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.35)", fontStyle: "normal" }}>
                    Optional
                  </span>
                </label>
                <input
                  style={inputStyle}
                  value={playerIdVal}
                  onChange={(e) => setPlayerIdVal(e.target.value)}
                  placeholder="e.g. SH-45821"
                />
              </div>
            </div>
          </div>

          {/* Helper note */}
          <div className="flex items-start gap-3 px-4 py-3.5 rounded-2xl"
            style={{ backgroundColor: "rgba(167,255,63,0.05)", border: "1px solid rgba(167,255,63,0.12)" }}>
            <span className="text-base flex-shrink-0">💡</span>
            <p style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", lineHeight: 1.6 }}>
              If you don't have a Player ID, you can continue and create one later. Having a Player ID links your match records to the global rankings.
            </p>
          </div>

          {/* Selected category recap */}
          <div style={cardStyle}>
            <p style={{ ...label, marginBottom: 10, fontSize: 11, letterSpacing: "0.06em", textTransform: "uppercase" }}>Entry Details</p>
            <Row label="Tournament" val={tournament.name} />
            <Row label="Category" val={category} />
            <Row label="Entry Fee" val={entryFee} />
          </div>
        </div>

        <div style={stickyBar}>
          <button style={primaryBtn} onClick={() => setStep("summary")}>
            Continue →
          </button>
        </div>
      </div>
    );
  }

  /* ─── SCREEN 3: Entry Summary ─── */
  if (step === "summary") {
    return (
      <div className="fixed inset-0 flex flex-col overflow-y-auto"
        style={{ background: "linear-gradient(160deg, var(--navy) 0%, #0D2647 100%)", paddingBottom: 130, zIndex: 100 }}>
        <FlowHeader title="Entry Summary" onBack={back} />
        <StepBar step={step} />

        <div className="flex flex-col gap-4 px-4 py-5">
          {/* Summary card */}
          <div style={cardStyle}>
            <p style={{ ...label, marginBottom: 14, fontSize: 11, letterSpacing: "0.06em", textTransform: "uppercase" }}>Registration Summary</p>
            <Row label="Tournament" val={tournament.name} />
            <Row label="Category" val={category} />
            <Row label="Player Name" val={playerNameVal} />
            {playerIdVal && <Row label="Player ID" val={playerIdVal} />}
            <Row label="Date" val={tournament.dates} />
            <Row label="Venue" val={tournament.location} />
            <Row label="Format" val={tournament.format} />
            <Row label="Level" val={tournament.level} />
          </div>

          {/* Fee breakdown */}
          <div style={cardStyle}>
            <p style={{ ...label, marginBottom: 14, fontSize: 11, letterSpacing: "0.06em", textTransform: "uppercase" }}>Fee Breakdown</p>
            <Row label="Entry Fee" val={entryFee} />
            <Row label="Platform Fee" val="RM 2" />
            <Row label="GST (8%)" val={`RM ${Math.round((feeNum + 2) * 0.08)}`} />
            <div className="flex justify-between items-center pt-3 mt-1">
              <span className="font-bold text-white text-sm">Total</span>
              <span className="font-black" style={{ color: "var(--lime)", fontSize: 18 }}>
                RM {Math.round((feeNum + 2) * 1.08)}
              </span>
            </div>
          </div>

          {/* Terms note */}
          <div className="flex items-start gap-3 px-4 py-3.5 rounded-2xl"
            style={{ backgroundColor: "rgba(167,255,63,0.05)", border: "1px solid rgba(167,255,63,0.12)" }}>
            <Shield size={14} style={{ color: "var(--lime)", flexShrink: 0, marginTop: 2 }} />
            <p style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", lineHeight: 1.6 }}>
              By proceeding you agree to the tournament rules. Entry fees are non-refundable once registration is confirmed.
            </p>
          </div>
        </div>

        <div style={stickyBar}>
          <button style={primaryBtn} onClick={() => setStep("payment")}>
            Proceed to Payment →
          </button>
        </div>
      </div>
    );
  }

  /* ─── SCREEN 4: Payment ─── */
  if (step === "payment" || step === "noPlayerId") {
    const totalAmount = Math.round((feeNum + 2) * 1.08);

    const handlePay = () => {
      setStep("processing");
      setTimeout(() => {
        const success = Math.random() > 0.15;
        if (!success) { setStep("failed"); return; }
        if (!playerIdRegistered && !playerIdVal) {
          setStep("noPlayerId");
        } else {
          setStep("success");
        }
      }, 2200);
    };

    const methodOk =
      payMethod === "upi" ? upiId.includes("@") :
      payMethod === "card" ? true :
      true;

    return (
      <div className="fixed inset-0 flex flex-col overflow-y-auto"
        style={{ background: "linear-gradient(160deg, var(--navy) 0%, #0D2647 100%)", paddingBottom: 130, zIndex: 100 }}>
        <FlowHeader title="Payment" onBack={back} />
        <StepBar step="payment" />

        <div className="flex flex-col gap-4 px-4 py-5">
          {/* Amount banner */}
          <div className="flex items-center justify-between px-5 py-4 rounded-2xl"
            style={{ background: "linear-gradient(135deg, rgba(167,255,63,0.12) 0%, rgba(167,255,63,0.04) 100%)", border: "1px solid rgba(167,255,63,0.25)" }}>
            <div>
              <p style={{ ...label, fontSize: 11 }}>Total Amount</p>
              <p className="font-black" style={{ color: "var(--lime)", fontSize: 28 }}>RM {totalAmount}</p>
            </div>
            <div className="flex flex-col items-end gap-1">
              <span style={{ fontSize: 12, color: "rgba(255,255,255,0.45)" }}>{tournament.name}</span>
              <span style={{ fontSize: 12, color: "rgba(255,255,255,0.3)" }}>{category}</span>
            </div>
          </div>

          {/* Method selector */}
          <div style={cardStyle}>
            <p style={{ ...label, marginBottom: 12, fontSize: 11, letterSpacing: "0.06em", textTransform: "uppercase" }}>Payment Method</p>
            <div className="flex flex-col gap-2">
              {([
                ["upi", Smartphone, "UPI", "GPay, PhonePe, Paytm"],
                ["card", CreditCard, "Debit / Credit Card", "Visa, Mastercard, Amex"],
                ["wallet", Wallet, "Wallet", "ShuttleHub Wallet · RM 540"],
              ] as [PayMethod, React.ElementType, string, string][]).map(([id, Icon, name, sub]) => (
                <button key={id} onClick={() => setPayMethod(id)}
                  className="flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all"
                  style={{
                    backgroundColor: payMethod === id ? "rgba(167,255,63,0.08)" : "rgba(255,255,255,0.03)",
                    border: `1.5px solid ${payMethod === id ? "rgba(167,255,63,0.35)" : "rgba(255,255,255,0.06)"}`,
                  }}>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: payMethod === id ? "rgba(167,255,63,0.15)" : "rgba(255,255,255,0.06)" }}>
                    <Icon size={18} style={{ color: payMethod === id ? "var(--lime)" : "rgba(255,255,255,0.5)" }} />
                  </div>
                  <div className="flex-1 text-left">
                    <p style={{ fontSize: 14, color: payMethod === id ? "#fff" : "rgba(255,255,255,0.7)", fontWeight: payMethod === id ? 600 : 400 }}>{name}</p>
                    <p style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", marginTop: 1 }}>{sub}</p>
                  </div>
                  <div className="w-5 h-5 rounded-full flex-shrink-0"
                    style={{ border: `2px solid ${payMethod === id ? "var(--lime)" : "rgba(255,255,255,0.2)"}`, backgroundColor: payMethod === id ? "var(--lime)" : "transparent" }}>
                    {payMethod === id && <div className="w-full h-full rounded-full flex items-center justify-center">
                      <span style={{ color: "var(--navy)", fontSize: 9, fontWeight: 800 }}>✓</span>
                    </div>}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* UPI input */}
          {payMethod === "upi" && (
            <div style={cardStyle}>
              <p style={{ ...label, marginBottom: 8, fontSize: 11, letterSpacing: "0.06em", textTransform: "uppercase" }}>Enter UPI ID</p>
              <input style={inputStyle} placeholder="yourname@okaxis" value={upiId} onChange={(e) => setUpiId(e.target.value)} />
              <div className="flex gap-2 mt-3">
                {["GPay", "PhonePe", "Paytm"].map((app) => (
                  <div key={app} className="flex-1 py-2 rounded-xl text-center text-xs"
                    style={{ backgroundColor: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.45)", border: "1px solid rgba(255,255,255,0.06)" }}>
                    {app}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Secure note */}
          <div className="flex items-center gap-2 px-4 py-3 rounded-xl"
            style={{ backgroundColor: "rgba(167,255,63,0.04)", border: "1px solid rgba(167,255,63,0.08)" }}>
            <Shield size={13} style={{ color: "var(--lime)", flexShrink: 0 }} />
            <p style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>256-bit SSL encrypted · Your data is safe</p>
          </div>
        </div>

        <div style={stickyBar}>
          <button style={{ ...primaryBtn, opacity: methodOk ? 1 : 0.5, cursor: methodOk ? "pointer" : "not-allowed" }}
            onClick={methodOk ? handlePay : undefined}>
            <span className="flex items-center justify-center gap-2">
              <Shield size={15} /> Pay RM {totalAmount}
            </span>
          </button>
        </div>

        {/* No Player ID modal */}
        {step === "noPlayerId" && noPlayerIdModal}
      </div>
    );
  }

  return null;
}
