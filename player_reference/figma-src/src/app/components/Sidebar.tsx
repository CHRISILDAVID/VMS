import {
  Home,
  Shuffle,
  Trophy,
  BarChart2,
  ShoppingBag,
  ChevronRight,
  Zap,
} from "lucide-react";

const navItems = [
  { id: "home", label: "Home", icon: Home },
  { id: "play", label: "Play", icon: Shuffle },
  { id: "tournaments", label: "Tournaments", icon: Trophy },
  { id: "rankings", label: "Rankings", icon: BarChart2 },
  { id: "shop", label: "Shop", icon: ShoppingBag },
];

interface SidebarProps {
  active: string;
  onNav: (id: string) => void;
}

export function Sidebar({ active, onNav }: SidebarProps) {
  return (
    <aside
      style={{ backgroundColor: "var(--navy)", width: 240, minWidth: 240 }}
      className="h-screen flex-col fixed left-0 top-0 z-50 hidden lg:flex"
    >
      {/* Logo */}
      <div className="px-6 py-6 flex items-center gap-3">
        <div
          style={{ backgroundColor: "var(--lime)", borderRadius: 10 }}
          className="w-9 h-9 flex items-center justify-center"
        >
          <Zap size={18} style={{ color: "var(--navy)" }} strokeWidth={2.5} />
        </div>
        <div>
          <span className="text-white text-sm font-bold tracking-wide">SHUTTLE</span>
          <span style={{ color: "var(--lime)" }} className="text-sm font-bold tracking-wide">HUB</span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 pt-2 flex flex-col gap-1">
        {navItems.map(({ id, label, icon: Icon }) => {
          const isActive = active === id;
          return (
            <button
              key={id}
              onClick={() => onNav(id)}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-left"
              style={{
                backgroundColor: isActive ? "var(--lime)" : "transparent",
                color: isActive ? "var(--navy)" : "rgba(255,255,255,0.65)",
              }}
            >
              <Icon
                size={18}
                strokeWidth={isActive ? 2.5 : 2}
                style={{ color: isActive ? "var(--navy)" : "rgba(255,255,255,0.65)" }}
              />
              <span
                className="text-sm"
                style={{ fontWeight: isActive ? 600 : 400, color: isActive ? "var(--navy)" : "rgba(255,255,255,0.65)" }}
              >
                {label}
              </span>
              {isActive && (
                <ChevronRight size={14} className="ml-auto" style={{ color: "var(--navy)" }} />
              )}
            </button>
          );
        })}
      </nav>

      {/* Player ID CTA */}
      <div className="px-4 pb-6">
        <div
          style={{
            background: "linear-gradient(135deg, var(--navy-light) 0%, rgba(167,255,63,0.15) 100%)",
            borderRadius: 14,
            border: "1px solid rgba(167,255,63,0.2)",
          }}
          className="p-4"
        >
          <div className="flex items-center gap-2 mb-1">
            <span className="text-lg">🪪</span>
            <div style={{ color: "var(--lime)" }} className="text-xs font-semibold uppercase tracking-widest">
              Player ID
            </div>
          </div>
          <p className="text-white text-xs leading-relaxed mb-3" style={{ opacity: 0.7 }}>
            Get your official ShuttleHub Player ID and appear on the global rankings
          </p>
          <button
            onClick={() => onNav("playerid")}
            style={{ backgroundColor: "var(--lime)", color: "var(--navy)", borderRadius: 8, fontSize: 12, fontWeight: 600 }}
            className="w-full py-2"
          >
            Register Free →
          </button>
        </div>
      </div>
    </aside>
  );
}
