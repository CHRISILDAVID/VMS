import { Home, Shuffle, Trophy, BarChart2, ShoppingBag } from "lucide-react";

const navItems = [
  { id: "home", label: "Home", icon: Home },
  { id: "play", label: "Play", icon: Shuffle },
  { id: "tournaments", label: "Tournaments", icon: Trophy },
  { id: "rankings", label: "Rankings", icon: BarChart2 },
  { id: "shop", label: "Shop", icon: ShoppingBag },
];

interface BottomNavProps {
  active: string;
  onNav: (id: string) => void;
}

export function BottomNav({ active, onNav }: BottomNavProps) {
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around px-2 py-2"
      style={{
        backgroundColor: "var(--navy)",
        borderTop: "1px solid rgba(255,255,255,0.08)",
        paddingBottom: "calc(0.5rem + env(safe-area-inset-bottom))",
      }}
    >
      {navItems.map(({ id, label, icon: Icon }) => {
        const isActive = active === id;
        return (
          <button
            key={id}
            onClick={() => onNav(id)}
            className="flex flex-col items-center gap-1 flex-1 py-1 rounded-xl transition-all relative"
            style={{ minWidth: 0 }}
          >
            {isActive && (
              <span
                className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full"
                style={{ backgroundColor: "var(--lime)" }}
              />
            )}
            <div
              className="w-9 h-9 flex items-center justify-center rounded-xl transition-all"
              style={{ backgroundColor: isActive ? "var(--lime)" : "transparent" }}
            >
              <Icon
                size={18}
                strokeWidth={isActive ? 2.5 : 2}
                style={{ color: isActive ? "var(--navy)" : "rgba(255,255,255,0.5)" }}
              />
            </div>
            <span
              className="text-center leading-none"
              style={{
                fontSize: 9,
                fontWeight: isActive ? 700 : 400,
                color: isActive ? "var(--lime)" : "rgba(255,255,255,0.45)",
                letterSpacing: "0.02em",
              }}
            >
              {label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
