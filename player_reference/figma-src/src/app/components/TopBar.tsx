import { useState } from "react";
import { MapPin, ChevronDown, Wallet, Zap } from "lucide-react";

interface TopBarProps {
  onNav?: (id: string) => void;
}

export function TopBar({ onNav }: TopBarProps) {
  const [walletOpen, setWalletOpen] = useState(false);

  return (
    <header
      className="flex items-center gap-3 px-4 lg:px-6 py-3 sticky top-0 z-40"
      style={{
        backgroundColor: "var(--card)",
        borderBottom: "1px solid var(--border)",
        minHeight: 60,
      }}
    >
      {/* Logo + wordmark */}
      <button
        onClick={() => onNav?.("home")}
        className="flex items-center gap-2.5 flex-shrink-0"
      >
        <div
          className="w-10 h-10 rounded-2xl flex items-center justify-center"
          style={{ backgroundColor: "var(--navy)" }}
        >
          <Zap size={18} style={{ color: "var(--lime)" }} strokeWidth={2.5} />
        </div>
        <span className="hidden sm:block font-bold tracking-tight" style={{ color: "var(--navy)", fontSize: 17 }}>
          ShuttleHub
        </span>
      </button>

      <div className="flex-1" />

      {/* Location Pill — center */}
      <button
        className="flex items-center gap-1.5 px-3 py-2 rounded-full border transition-all"
        style={{ borderColor: "var(--border)", backgroundColor: "var(--card)" }}
      >
        <MapPin size={13} style={{ color: "var(--lime-dark)" }} strokeWidth={2.5} />
        <span className="text-sm font-medium" style={{ color: "var(--foreground)" }}>
          Kuala Lumpur
        </span>
        <ChevronDown size={12} style={{ color: "var(--muted-foreground)" }} />
      </button>

      <div className="flex-1" />

      {/* Right cluster: Wallet + Avatar */}
      <div className="flex items-center gap-2 flex-shrink-0">

        {/* Wallet button + dropdown */}
        <div style={{ position: "relative" }}>
          <button
            onClick={() => setWalletOpen((v) => !v)}
            className="w-10 h-10 rounded-2xl flex items-center justify-center"
            style={{
              backgroundColor: walletOpen ? "var(--navy)" : "var(--input-background)",
              border: `1px solid ${walletOpen ? "var(--navy)" : "var(--border)"}`,
              transition: "background 0.15s, border 0.15s",
            }}
          >
            <Wallet size={17} style={{ color: walletOpen ? "var(--lime)" : "var(--navy)" }} strokeWidth={2} />
          </button>

          {walletOpen && (
            <>
              {/* Invisible backdrop to close on outside click */}
              <div
                style={{ position: "fixed", inset: 0, zIndex: 49 }}
                onClick={() => setWalletOpen(false)}
              />

              {/* Dropdown popover */}
              <div
                style={{
                  position: "absolute",
                  top: "calc(100% + 10px)",
                  right: 0,
                  width: 240,
                  backgroundColor: "var(--card)",
                  border: "1px solid var(--border)",
                  borderRadius: 18,
                  boxShadow: "0 12px 36px rgba(0,0,0,0.13)",
                  zIndex: 50,
                  overflow: "hidden",
                }}
              >
                {/* Balance section */}
                <div
                  className="px-5 pt-5 pb-4"
                  style={{ background: "linear-gradient(135deg, var(--navy) 0%, #162D52 100%)" }}
                >
                  <div className="flex items-center gap-2 mb-3">
                    <div
                      className="w-7 h-7 rounded-xl flex items-center justify-center"
                      style={{ backgroundColor: "rgba(167,255,63,0.15)" }}
                    >
                      <Wallet size={14} style={{ color: "var(--lime)" }} strokeWidth={2.5} />
                    </div>
                    <span className="text-xs font-bold uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.5)" }}>
                      Wallet Balance
                    </span>
                  </div>
                  <p style={{ fontSize: 28, fontWeight: 800, color: "#fff", letterSpacing: "-0.5px" }}>
                    ₹1,250.<span style={{ fontSize: 18, fontWeight: 600, color: "rgba(255,255,255,0.6)" }}>00</span>
                  </p>
                </div>

                {/* Usage info */}
                <div className="px-5 py-4">
                  <p className="text-xs font-semibold mb-2.5" style={{ color: "var(--muted-foreground)" }}>
                    Your wallet balance can be used for:
                  </p>
                  <div className="flex flex-col gap-2">
                    {[
                      { emoji: "🎾", label: "Court Bookings" },
                      { emoji: "🏆", label: "Tournament Registrations" },
                      { emoji: "🛒", label: "Shop Purchases" },
                    ].map(({ emoji, label }) => (
                      <div key={label} className="flex items-center gap-2.5">
                        <span style={{ fontSize: 14 }}>{emoji}</span>
                        <span className="text-xs font-medium" style={{ color: "var(--foreground)" }}>{label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Avatar with initials */}
        <button
          onClick={() => onNav?.("profile")}
          className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: "var(--navy)", border: "2px solid var(--lime)" }}
        >
          <span className="text-sm font-bold" style={{ color: "var(--lime)", letterSpacing: "0.03em" }}>
            AH
          </span>
        </button>
      </div>
    </header>
  );
}
