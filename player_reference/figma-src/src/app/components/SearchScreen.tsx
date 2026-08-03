import { useState } from "react";
import { Search, X, Clock, TrendingUp, MapPin, Users, Trophy, GraduationCap, Star } from "lucide-react";

const recentSearches = [
  "Axiata Arena",
  "Lee Zii Jia",
  "KL Open Masters",
  "Coach Razif",
  "Bukit Jalil courts",
];

const popularSearches = [
  "Indoor courts KL",
  "Doubles partner",
  "Weekend tournament",
  "Beginner coaching",
  "Mixed doubles",
  "BWF tournament",
];

const categories = [
  { id: "courts", label: "Courts", icon: MapPin, color: "#3B82F6", bg: "rgba(59,130,246,0.1)" },
  { id: "players", label: "Players", icon: Users, color: "#10B981", bg: "rgba(16,185,129,0.1)" },
  { id: "tournaments", label: "Tournaments", icon: Trophy, color: "#F59E0B", bg: "rgba(245,158,11,0.1)" },
  { id: "coaching", label: "Coaching", icon: GraduationCap, color: "var(--navy)", bg: "rgba(11,31,58,0.08)" },
];

const searchResults = {
  courts: [
    { id: 1, name: "Axiata Arena — Hall A", sub: "Bukit Jalil · 2.4 km · RM 18/hr", rating: 4.9, image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=80&h=80&fit=crop" },
    { id: 2, name: "Cheras Sports Complex", sub: "Cheras · 4.1 km · RM 12/hr", rating: 4.6, image: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=80&h=80&fit=crop" },
    { id: 3, name: "Titiwangsa Outdoor Courts", sub: "Titiwangsa · 5.8 km · RM 8/hr", rating: 4.3, image: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=80&h=80&fit=crop" },
  ],
  players: [
    { id: 1, name: "Lee Zii Jia", sub: "Elite · Rank #1 · Kuala Lumpur", rating: 4.9, image: "https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=80&h=80&fit=crop" },
    { id: 2, name: "Tan Wei Ming", sub: "Advanced · Rank #8 · Bangsar", rating: 4.8, image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&h=80&fit=crop" },
  ],
  tournaments: [
    { id: 1, name: "BWF World Championships 2025", sub: "Tokyo · Aug 5–11 · $1.2M Prize", rating: null, image: "https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=80&h=80&fit=crop" },
    { id: 2, name: "KL Open Masters 2025", sub: "Kuala Lumpur · Aug 14–20 · $250K", rating: null, image: "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=80&h=80&fit=crop" },
  ],
  coaching: [
    { id: 1, name: "Coach Razif Sidek", sub: "Sidek Academy · Elite · RM 120/session", rating: 4.9, image: "https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=80&h=80&fit=crop" },
    { id: 2, name: "Coach Sarah Lin", sub: "KL Shuttlers · Intermediate · RM 90/session", rating: 4.8, image: "https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=80&h=80&fit=crop" },
  ],
};

type Category = keyof typeof searchResults;

export function SearchScreen() {
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<Category | "all">("all");
  const [recents, setRecents] = useState(recentSearches);
  const hasQuery = query.trim().length > 0;

  const removeRecent = (term: string) => setRecents((r) => r.filter((x) => x !== term));

  const allResults = hasQuery
    ? (activeCategory === "all"
        ? Object.values(searchResults).flat()
        : searchResults[activeCategory as Category])
    : [];

  return (
    <div className="flex flex-col" style={{ backgroundColor: "var(--background)", minHeight: "100vh" }}>
      {/* Search input */}
      <div
        className="sticky top-0 z-10 px-4 lg:px-6 pt-4 pb-3"
        style={{ backgroundColor: "var(--background)", borderBottom: "1px solid var(--border)" }}
      >
        <div
          className="flex items-center gap-3 px-4 py-3 rounded-2xl"
          style={{ backgroundColor: "var(--card)", border: "1.5px solid var(--border)", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}
        >
          <Search size={18} style={{ color: hasQuery ? "var(--navy)" : "var(--muted-foreground)" }} strokeWidth={2} />
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search courts, players, coaches, tournaments…"
            className="flex-1 bg-transparent outline-none text-sm"
            style={{ color: "var(--foreground)" }}
          />
          {hasQuery && (
            <button onClick={() => setQuery("")}>
              <X size={16} style={{ color: "var(--muted-foreground)" }} />
            </button>
          )}
        </div>

        {/* Category pills */}
        {hasQuery && (
          <div className="flex gap-2 mt-3 overflow-x-auto pb-0.5">
            {[{ id: "all", label: "All" }, ...categories.map((c) => ({ id: c.id, label: c.label }))].map((c) => (
              <button
                key={c.id}
                onClick={() => setActiveCategory(c.id as Category | "all")}
                className="flex-shrink-0 px-4 py-1.5 rounded-full text-xs font-medium transition-all"
                style={{
                  backgroundColor: activeCategory === c.id ? "var(--navy)" : "var(--card)",
                  color: activeCategory === c.id ? "var(--lime)" : "var(--foreground)",
                  border: `1px solid ${activeCategory === c.id ? "transparent" : "var(--border)"}`,
                }}
              >
                {c.label}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="flex-1 px-4 lg:px-6 py-5 flex flex-col gap-6">

        {/* Empty state — show discovery */}
        {!hasQuery && (
          <>
            {/* Recent searches */}
            {recents.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--muted-foreground)" }}>
                    Recent
                  </p>
                  <button className="text-xs" style={{ color: "var(--navy)", fontWeight: 500 }} onClick={() => setRecents([])}>
                    Clear all
                  </button>
                </div>
                <div className="flex flex-col gap-1">
                  {recents.map((term) => (
                    <div
                      key={term}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-xl"
                      style={{ backgroundColor: "var(--card)", border: "1px solid var(--border)" }}
                    >
                      <Clock size={14} style={{ color: "var(--muted-foreground)" }} />
                      <span
                        className="flex-1 text-sm cursor-pointer"
                        style={{ color: "var(--foreground)" }}
                        onClick={() => setQuery(term)}
                      >
                        {term}
                      </span>
                      <button onClick={() => removeRecent(term)}>
                        <X size={13} style={{ color: "var(--muted-foreground)" }} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Quick categories */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: "var(--muted-foreground)" }}>
                Browse by Category
              </p>
              <div className="grid grid-cols-2 gap-3">
                {categories.map(({ id, label, icon: Icon, color, bg }) => (
                  <button
                    key={id}
                    onClick={() => setQuery(label)}
                    className="flex items-center gap-3 p-4 rounded-2xl text-left hover:scale-[1.02] transition-all"
                    style={{ backgroundColor: "var(--card)", border: "1px solid var(--border)", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}
                  >
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: bg }}>
                      <Icon size={18} style={{ color }} strokeWidth={2} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>{label}</p>
                      <p className="text-xs mt-0.5" style={{ color: "var(--muted-foreground)" }}>
                        {id === "courts" ? "Book & play" : id === "players" ? "Find & challenge" : id === "tournaments" ? "Compete & win" : "Train & improve"}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Popular searches */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp size={14} style={{ color: "var(--navy)" }} />
                <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--muted-foreground)" }}>
                  Trending
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {popularSearches.map((term) => (
                  <button
                    key={term}
                    onClick={() => setQuery(term)}
                    className="px-4 py-2 rounded-full text-sm"
                    style={{ backgroundColor: "var(--card)", border: "1px solid var(--border)", color: "var(--foreground)" }}
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Search results */}
        {hasQuery && (
          <div>
            {allResults.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 gap-4">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{ backgroundColor: "var(--muted)" }}>
                  <Search size={28} style={{ color: "var(--muted-foreground)" }} />
                </div>
                <div className="text-center">
                  <p className="font-semibold" style={{ color: "var(--foreground)" }}>No results found</p>
                  <p className="text-sm mt-1" style={{ color: "var(--muted-foreground)" }}>Try a different search term</p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <p className="text-xs mb-1" style={{ color: "var(--muted-foreground)" }}>
                  {allResults.length} result{allResults.length !== 1 ? "s" : ""} for "{query}"
                </p>
                {allResults.map((item, i) => (
                  <button
                    key={`${item.id}-${i}`}
                    className="flex items-center gap-3 p-4 rounded-2xl text-left hover:scale-[1.005] transition-all"
                    style={{ backgroundColor: "var(--card)", border: "1px solid var(--border)" }}
                  >
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-12 h-12 rounded-xl object-cover flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate" style={{ color: "var(--foreground)" }}>{item.name}</p>
                      <p className="text-xs mt-0.5 truncate" style={{ color: "var(--muted-foreground)" }}>{item.sub}</p>
                    </div>
                    {item.rating && (
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <Star size={12} fill="#F59E0B" stroke="#F59E0B" />
                        <span className="text-xs font-medium" style={{ color: "var(--foreground)" }}>{item.rating}</span>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
