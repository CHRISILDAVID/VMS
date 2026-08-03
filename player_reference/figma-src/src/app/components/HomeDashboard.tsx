import { useState } from "react";
import {
  MapPin,
  Clock,
  Star,
  ChevronRight,
  ChevronLeft,
  Play,
  Wifi,
  Search,
  Bell,
  Swords,
  Users,
  CreditCard,
  X,
} from "lucide-react";

const notifications = [
  {
    id: 1,
    type: "challenge",
    icon: Swords,
    iconBg: "rgba(239,68,68,0.1)",
    iconColor: "#EF4444",
    label: "Challenge Request",
    challenger: "Aditya Mehta",
    matchType: "Men's Singles",
    venue: "Axiata Arena — Court 4",
    date: "Sun, Aug 3, 2025",
    time: "6:00 PM",
    fee: "RM 20",
  },
  {
    id: 2,
    type: "guest",
    icon: Users,
    iconBg: "rgba(59,130,246,0.1)",
    iconColor: "#3B82F6",
    label: "Guest Play Invitation",
    academy: "KL Badminton Academy",
    message: "You've been invited to join a guest play session.",
    date: "Sat, Aug 2, 2025",
    time: "8:00 AM",
    venue: "KL Badminton Academy — Hall B",
    fee: "RM 15",
  },
  {
    id: 3,
    type: "membership",
    icon: CreditCard,
    iconBg: "rgba(245,158,11,0.1)",
    iconColor: "#F59E0B",
    label: "Membership Renewal",
    academy: "Cheras Sports Club",
    message: "Your membership is expiring soon. Renew to keep your benefits.",
    dueDate: "Aug 10, 2025",
    fee: "RM 180 / year",
  },
];

const heroSlides = [
  {
    id: 1,
    title: "BWF World Championships 2025",
    subtitle: "Prize Pool: $1,200,000 · Aug 5–11",
    badge: "LIVE",
    badgeColor: "#EF4444",
    cta: "Watch Live",
    ctaScreen: "tournaments",
    isProduct: false,
  },
  {
    id: 2,
    title: "KL Open Masters 2025",
    subtitle: "Prize Pool: $250,000 · Aug 14–20",
    badge: "TOURNAMENT",
    badgeColor: "#A7FF3F",
    cta: "Register Now",
    ctaScreen: "tournaments",
    isProduct: false,
  },
  {
    id: 3,
    title: "Yonex Astrox 100 ZZ — #1 Racket 2025",
    subtitle: "Trending in Shop · Rated 4.9 by pros · RM 289",
    badge: "SHOP",
    badgeColor: "#F59E0B",
    cta: "Shop Now",
    ctaScreen: "shop",
    isProduct: true,
  },
  {
    id: 4,
    title: "Community Sunday League",
    subtitle: "Prize Pool: RM 500 · Every Sunday",
    badge: "JOIN",
    badgeColor: "#A7FF3F",
    cta: "Join Now",
    ctaScreen: "tournaments",
    isProduct: false,
  },
];

const quickActions = [
  { id: "book",  label: "Book Court",   emoji: "🎾", screen: "play" },
  { id: "join",  label: "Join Game",    emoji: "⚡", screen: "play" },
  { id: "tourn", label: "Tournaments",  emoji: "🏆", screen: "tournaments" },
  { id: "rank",  label: "See Your Rank", emoji: "📊", screen: "rankings" },
];

const nearbyCourts = [
  { id: 1, name: "Axiata Arena Badminton Hall", location: "Bukit Jalil", distance: "2.4 km", price: "RM 18/hr", rating: 4.9, courts: 12, available: true, image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=200&h=130&fit=crop&auto=format", indoor: true },
  { id: 2, name: "Cheras Sports Complex", location: "Cheras", distance: "4.1 km", price: "RM 12/hr", rating: 4.6, courts: 8, available: true, image: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=200&h=130&fit=crop&auto=format", indoor: true },
  { id: 3, name: "Dewan Badminton Titiwangsa", location: "Titiwangsa", distance: "5.8 km", price: "RM 15/hr", rating: 4.7, courts: 6, available: false, image: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=200&h=130&fit=crop&auto=format", indoor: false },
];

const fastSellingItems = [
  { id: 1, name: "Yonex Astrox 100 ZZ", price: "RM 289", rating: 4.9, image: "https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=160&h=160&fit=crop&auto=format" },
  { id: 2, name: "Victor Thruster K 9900", price: "RM 349", rating: 4.8, image: "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=160&h=160&fit=crop&auto=format" },
  { id: 3, name: "Yonex Mavis 350 Shuttles", price: "RM 45", rating: 4.6, image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=160&h=160&fit=crop&auto=format" },
  { id: 4, name: "Li-Ning Badminton Bag", price: "RM 120", rating: 4.7, image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=160&h=160&fit=crop&auto=format" },
  { id: 5, name: "Yonex Pro Grip x3", price: "RM 22", rating: 4.5, image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=160&h=160&fit=crop&auto=format" },
];

const liveMatch = {
  player1: "Lee Zii Jia", player2: "Viktor Axelsen",
  score1: [21, 18, 14], score2: [19, 21, 11],
  set: 3, timer: "34:12", court: "Court 1",
};

interface HomeDashboardProps {
  onNav: (id: string) => void;
}

export function HomeDashboard({ onNav }: HomeDashboardProps) {
  const [activeSlide, setActiveSlide] = useState(0);
  const [notifOpen, setNotifOpen] = useState(false);
  const [dismissed, setDismissed] = useState<number[]>([]);
  const slide = heroSlides[activeSlide];
  const total = heroSlides.length;
  const activeNotifs = notifications.filter((n) => !dismissed.includes(n.id));
  const unreadCount = activeNotifs.length;

  const prev = () => setActiveSlide((s) => (s - 1 + total) % total);
  const next = () => setActiveSlide((s) => (s + 1) % total);

  return (
    <div className="flex flex-col lg:flex-row gap-5 min-h-screen" style={{ backgroundColor: "var(--background)" }}>
      {/* Main Column */}
      <div className="flex-1 flex flex-col gap-5 min-w-0">

        {/* ── Search + Bell row ── */}
        <div className="flex gap-3 px-4 lg:px-6 pt-4" style={{ position: "relative" }}>
          {/* Search bar */}
          <div
            className="flex-1 flex items-center gap-3 px-4 py-3 rounded-2xl"
            style={{
              backgroundColor: "var(--card)",
              border: "1.5px solid var(--border)",
              boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
            }}
          >
            <Search size={16} style={{ color: "var(--muted-foreground)" }} strokeWidth={2} />
            <input
              placeholder="Search courts, players..."
              className="bg-transparent outline-none flex-1 text-sm"
              style={{ color: "var(--foreground)" }}
            />
          </div>

          {/* Notification Bell */}
          <div style={{ position: "relative", flexShrink: 0 }}>
            <button
              onClick={() => setNotifOpen((v) => !v)}
              className="flex flex-col items-center justify-center gap-1 px-4 py-2 rounded-2xl relative"
              style={{
                backgroundColor: notifOpen ? "var(--navy)" : "var(--card)",
                border: `1.5px solid ${notifOpen ? "var(--navy)" : "var(--border)"}`,
                boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
                minWidth: 72,
                transition: "background 0.15s",
              }}
            >
              <div className="relative">
                <Bell size={20} style={{ color: notifOpen ? "var(--lime)" : "var(--foreground)" }} strokeWidth={1.8} />
                {unreadCount > 0 && (
                  <span
                    className="absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center text-white border-2"
                    style={{ backgroundColor: "var(--live-red)", borderColor: notifOpen ? "var(--navy)" : "var(--card)", fontSize: 9, fontWeight: 700 }}
                  >
                    {unreadCount}
                  </span>
                )}
              </div>
              <span className="text-xs font-medium" style={{ color: notifOpen ? "var(--lime)" : "var(--foreground)" }}>
                Alerts
              </span>
            </button>

            {notifOpen && (
              <>
                {/* Backdrop */}
                <div style={{ position: "fixed", inset: 0, zIndex: 49 }} onClick={() => setNotifOpen(false)} />

                {/* Notification panel */}
                <div
                  style={{
                    position: "absolute",
                    top: "calc(100% + 10px)",
                    right: 0,
                    width: 320,
                    maxWidth: "calc(100vw - 32px)",
                    maxHeight: "70vh",
                    overflowY: "auto",
                    backgroundColor: "var(--card)",
                    border: "1px solid var(--border)",
                    borderRadius: 20,
                    boxShadow: "0 16px 48px rgba(0,0,0,0.14)",
                    zIndex: 50,
                  }}
                >
                  {/* Panel header */}
                  <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: "1px solid var(--border)" }}>
                    <div>
                      <p className="text-sm font-bold" style={{ color: "var(--foreground)" }}>Notifications</p>
                      {unreadCount > 0 && (
                        <p className="text-xs mt-0.5" style={{ color: "var(--muted-foreground)" }}>{unreadCount} action{unreadCount > 1 ? "s" : ""} required</p>
                      )}
                    </div>
                    <button onClick={() => setNotifOpen(false)}>
                      <X size={16} style={{ color: "var(--muted-foreground)" }} />
                    </button>
                  </div>

                  {activeNotifs.length === 0 ? (
                    <div className="flex flex-col items-center justify-center gap-2 py-10">
                      <Bell size={28} style={{ color: "var(--muted-foreground)", opacity: 0.4 }} />
                      <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>All caught up!</p>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-0">
                      {activeNotifs.map((notif, idx) => {
                        const Icon = notif.icon;
                        return (
                          <div
                            key={notif.id}
                            className="px-5 py-4"
                            style={{ borderBottom: idx < activeNotifs.length - 1 ? "1px solid var(--border)" : undefined }}
                          >
                            {/* Label row */}
                            <div className="flex items-center gap-2.5 mb-3">
                              <div
                                className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                                style={{ backgroundColor: notif.iconBg }}
                              >
                                <Icon size={15} style={{ color: notif.iconColor }} strokeWidth={2} />
                              </div>
                              <span className="text-xs font-bold uppercase tracking-wider" style={{ color: notif.iconColor }}>
                                {notif.label}
                              </span>
                            </div>

                            {/* Challenge notification */}
                            {notif.type === "challenge" && (
                              <>
                                <p className="text-sm font-semibold mb-2" style={{ color: "var(--foreground)" }}>
                                  {notif.challenger} challenged you
                                </p>
                                <div className="flex flex-col gap-1 mb-3">
                                  {[
                                    ["Match Type", notif.matchType],
                                    ["Venue", notif.venue],
                                    ["Date", notif.date],
                                    ["Time", notif.time],
                                    ["Entry Fee", notif.fee],
                                  ].map(([k, v]) => (
                                    <div key={k} className="flex justify-between">
                                      <span style={{ fontSize: 11, color: "var(--muted-foreground)" }}>{k}</span>
                                      <span style={{ fontSize: 11, fontWeight: 600, color: "var(--foreground)" }}>{v}</span>
                                    </div>
                                  ))}
                                </div>
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => setDismissed((d) => [...d, notif.id])}
                                    className="flex-1 py-2 rounded-xl text-xs font-bold"
                                    style={{ backgroundColor: "var(--navy)", color: "var(--lime)" }}
                                  >
                                    Accept & Pay
                                  </button>
                                  <button
                                    onClick={() => setDismissed((d) => [...d, notif.id])}
                                    className="flex-1 py-2 rounded-xl text-xs font-semibold"
                                    style={{ backgroundColor: "var(--muted)", color: "var(--muted-foreground)", border: "1px solid var(--border)" }}
                                  >
                                    Decline
                                  </button>
                                </div>
                              </>
                            )}

                            {/* Guest play notification */}
                            {notif.type === "guest" && (
                              <>
                                <p className="text-sm font-semibold mb-1" style={{ color: "var(--foreground)" }}>
                                  {notif.academy}
                                </p>
                                <p className="text-xs mb-2" style={{ color: "var(--muted-foreground)" }}>{notif.message}</p>
                                <div className="flex flex-col gap-1 mb-3">
                                  {[
                                    ["Date", notif.date],
                                    ["Time", notif.time],
                                    ["Venue", notif.venue],
                                    ["Guest Fee", notif.fee],
                                  ].map(([k, v]) => (
                                    <div key={k} className="flex justify-between">
                                      <span style={{ fontSize: 11, color: "var(--muted-foreground)" }}>{k}</span>
                                      <span style={{ fontSize: 11, fontWeight: 600, color: "var(--foreground)" }}>{v}</span>
                                    </div>
                                  ))}
                                </div>
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => setDismissed((d) => [...d, notif.id])}
                                    className="flex-1 py-2 rounded-xl text-xs font-bold"
                                    style={{ backgroundColor: "var(--navy)", color: "var(--lime)" }}
                                  >
                                    Accept & Pay
                                  </button>
                                  <button
                                    onClick={() => setDismissed((d) => [...d, notif.id])}
                                    className="flex-1 py-2 rounded-xl text-xs font-semibold"
                                    style={{ backgroundColor: "var(--muted)", color: "var(--muted-foreground)", border: "1px solid var(--border)" }}
                                  >
                                    Decline
                                  </button>
                                </div>
                              </>
                            )}

                            {/* Membership renewal */}
                            {notif.type === "membership" && (
                              <>
                                <p className="text-sm font-semibold mb-1" style={{ color: "var(--foreground)" }}>
                                  {notif.academy}
                                </p>
                                <p className="text-xs mb-2" style={{ color: "var(--muted-foreground)" }}>{notif.message}</p>
                                <div className="flex flex-col gap-1 mb-3">
                                  {[
                                    ["Renewal Due", notif.dueDate],
                                    ["Fee", notif.fee],
                                  ].map(([k, v]) => (
                                    <div key={k} className="flex justify-between">
                                      <span style={{ fontSize: 11, color: "var(--muted-foreground)" }}>{k}</span>
                                      <span style={{ fontSize: 11, fontWeight: 600, color: "var(--foreground)" }}>{v}</span>
                                    </div>
                                  ))}
                                </div>
                                <button
                                  onClick={() => setDismissed((d) => [...d, notif.id])}
                                  className="w-full py-2 rounded-xl text-xs font-bold"
                                  style={{ backgroundColor: "#F59E0B", color: "#fff" }}
                                >
                                  Pay Now
                                </button>
                              </>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>

        {/* ── Hero Carousel (reference style) ── */}
        <div className="px-4 lg:px-6">
          <div
            className="relative overflow-hidden"
            style={{ borderRadius: 20, backgroundColor: "var(--navy)" }}
          >
            {/* Content */}
            <div className="px-6 pt-6 pb-10">
              {/* Badge */}
              <span
                className="inline-block text-xs font-bold px-4 py-1.5 rounded-full mb-4"
                style={{
                  backgroundColor: slide.badgeColor,
                  color: slide.badge === "JOIN" || slide.badge === "TOURNAMENT" ? "var(--navy)" : "#fff",
                  letterSpacing: "0.04em",
                }}
              >
                {slide.badge}
              </span>
              {/* Title */}
              <h2
                className="text-white mb-2 leading-tight"
                style={{ fontSize: "clamp(18px, 3.5vw, 26px)", fontWeight: 800 }}
              >
                {slide.title}
              </h2>
              {/* Subtitle */}
              <p className="mb-5" style={{ color: "rgba(255,255,255,0.6)", fontSize: 14 }}>
                {slide.subtitle}
              </p>
              {/* CTA */}
              <button
                onClick={() => onNav(slide.ctaScreen)}
                className="flex items-center gap-1.5 text-sm font-semibold"
                style={{ color: "var(--lime)" }}
              >
                {slide.cta} <ChevronRight size={15} />
              </button>
            </div>

            {/* Dot indicators — bottom left */}
            <div className="absolute bottom-3 left-6 flex gap-2">
              {heroSlides.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActiveSlide(i)}
                  className="rounded-full transition-all"
                  style={{
                    width: i === activeSlide ? 24 : 8,
                    height: 8,
                    backgroundColor: i === activeSlide ? "var(--lime)" : "rgba(255,255,255,0.25)",
                  }}
                />
              ))}
            </div>

            {/* Prev arrow */}
            <button
              onClick={prev}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full flex items-center justify-center"
              style={{ backgroundColor: "rgba(0,0,0,0.35)" }}
            >
              <ChevronLeft size={16} color="#fff" />
            </button>

            {/* Next arrow */}
            <button
              onClick={next}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full flex items-center justify-center"
              style={{ backgroundColor: "rgba(0,0,0,0.35)" }}
            >
              <ChevronRight size={16} color="#fff" />
            </button>
          </div>
        </div>

        {/* ── Quick Actions ── */}
        <div className="px-4 lg:px-6">
          <h3 className="mb-3" style={{ color: "var(--foreground)", fontWeight: 700, fontSize: 17 }}>
            Quick Actions
          </h3>
          <div className="grid grid-cols-4 gap-3">
            {quickActions.map(({ id, label, emoji, screen }) => (
              <button
                key={id}
                onClick={() => onNav(screen)}
                className="flex flex-col items-center justify-center gap-2.5 py-5 rounded-2xl transition-all hover:scale-[1.03]"
                style={{ backgroundColor: "var(--navy)" }}
              >
                <span style={{ fontSize: 28 }}>{emoji}</span>
                <span className="text-xs font-medium text-center leading-tight" style={{ color: "#fff" }}>
                  {label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* ── Nearby Courts ── */}
        <div className="px-4 lg:px-6">
          <div className="flex items-center justify-between mb-3">
            <h3 style={{ color: "var(--foreground)", fontWeight: 600, fontSize: 15 }}>
              Nearby Courts
            </h3>
            <button onClick={() => onNav("play")} className="text-xs flex items-center gap-1" style={{ color: "var(--navy)", fontWeight: 500 }}>
              View All <ChevronRight size={12} />
            </button>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
            {nearbyCourts.map((court) => (
              <div
                key={court.id}
                className="flex-shrink-0 flex flex-col rounded-2xl overflow-hidden"
                style={{ width: 200, backgroundColor: "var(--card)", border: "1px solid var(--border)", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}
              >
                <div style={{ height: 110, overflow: "hidden" }}>
                  <img src={court.image} alt={court.name} className="w-full h-full object-cover" />
                </div>
                <div className="p-3 flex flex-col gap-1.5">
                  <div className="flex items-start justify-between gap-1">
                    <p style={{ fontSize: 12, fontWeight: 600, color: "var(--foreground)", lineHeight: 1.35, flex: 1 }}>{court.name}</p>
                    <span
                      className="text-xs font-semibold px-1.5 py-0.5 rounded-lg flex-shrink-0"
                      style={{ backgroundColor: court.available ? "rgba(16,185,129,0.1)" : "rgba(239,68,68,0.1)", color: court.available ? "var(--win-green)" : "var(--live-red)", fontSize: 10 }}
                    >
                      {court.available ? "Open" : "Full"}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MapPin size={10} style={{ color: "var(--muted-foreground)" }} />
                    <span style={{ fontSize: 10, color: "var(--muted-foreground)" }}>{court.location} · {court.distance}</span>
                  </div>
                  <div className="flex items-center gap-3 mt-0.5">
                    <div className="flex items-center gap-1">
                      <Star size={10} fill="#F59E0B" stroke="#F59E0B" />
                      <span style={{ fontSize: 10, fontWeight: 500, color: "var(--foreground)" }}>{court.rating}</span>
                    </div>
                    <span style={{ fontSize: 10, color: "var(--muted-foreground)" }}>{court.indoor ? "Indoor" : "Outdoor"}</span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: "var(--navy)", marginLeft: "auto" }}>{court.price}</span>
                  </div>
                  <button
                    onClick={() => onNav("play")}
                    className="w-full py-1.5 rounded-xl text-xs font-semibold mt-1"
                    style={{ backgroundColor: "var(--navy)", color: "var(--lime)" }}
                  >
                    Book Now
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* ── Right Panel ── */}
      <div className="flex flex-col gap-5 px-4 lg:px-0 pb-4 lg:pb-6 lg:pr-6 w-full lg:w-80 lg:flex-shrink-0">
        {/* Live Match Widget */}
        <div
          className="p-5 rounded-2xl"
          style={{ background: "linear-gradient(145deg, var(--navy) 0%, #162D52 100%)" }}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Wifi size={12} style={{ color: "var(--live-red)" }} />
              <span className="text-xs font-bold tracking-widest" style={{ color: "var(--live-red)" }}>LIVE</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock size={12} style={{ color: "rgba(255,255,255,0.5)" }} />
              <span className="text-xs" style={{ color: "rgba(255,255,255,0.5)" }}>{liveMatch.timer}</span>
            </div>
          </div>
          <div className="text-center mb-4">
            <span className="text-xs" style={{ color: "rgba(255,255,255,0.5)" }}>Set {liveMatch.set} · {liveMatch.court}</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex-1 text-center">
              <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center mx-auto mb-2">
                <span className="text-lg font-bold text-white">LZ</span>
              </div>
              <p className="text-xs text-white font-medium">{liveMatch.player1}</p>
            </div>
            <div className="flex-1 text-center">
              <div className="flex gap-2 justify-center mb-1">
                {liveMatch.score1.map((s, i) => (
                  <div key={i} className="text-center w-12">
                    <span className="block text-xl font-bold" style={{ color: i < 2 ? "rgba(255,255,255,0.4)" : "var(--lime)" }}>{s}</span>
                    <span className="block text-xl font-bold" style={{ color: "rgba(255,255,255,0.25)" }}>{liveMatch.score2[i]}</span>
                  </div>
                ))}
              </div>
              <span className="text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>vs</span>
            </div>
            <div className="flex-1 text-center">
              <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center mx-auto mb-2">
                <span className="text-lg font-bold text-white">VA</span>
              </div>
              <p className="text-xs text-white font-medium">{liveMatch.player2}</p>
            </div>
          </div>
          <button
            onClick={() => onNav("tournaments")}
            className="w-full mt-4 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm"
            style={{ backgroundColor: "rgba(167,255,63,0.15)", color: "var(--lime)", fontWeight: 600 }}
          >
            <Play size={13} fill="currentColor" />
            Watch Live
          </button>
        </div>

        {/* Fast Selling Items */}
        <div className="rounded-2xl overflow-hidden" style={{ backgroundColor: "var(--card)", border: "1px solid var(--border)" }}>
          <div className="flex items-center justify-between px-5 pt-5 pb-3">
            <div>
              <h3 className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>Fast Selling Items</h3>
              <p className="text-xs mt-0.5" style={{ color: "var(--muted-foreground)" }}>Top picks from the shop</p>
            </div>
            <button onClick={() => onNav("shop")} className="text-xs" style={{ color: "var(--navy)", fontWeight: 600 }}>Shop All</button>
          </div>
          <div className="flex gap-3 overflow-x-auto px-5 pb-5" style={{ scrollbarWidth: "none" }}>
            {fastSellingItems.map((item) => (
              <div
                key={item.id}
                className="flex-shrink-0 flex flex-col rounded-2xl overflow-hidden"
                style={{
                  width: 120,
                  backgroundColor: "var(--background)",
                  border: "1px solid var(--border)",
                }}
              >
                <div style={{ height: 100, overflow: "hidden", backgroundColor: "var(--muted)" }}>
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-2.5 flex flex-col gap-1.5">
                  <p style={{ fontSize: 11, fontWeight: 600, color: "var(--foreground)", lineHeight: 1.35 }}>
                    {item.name}
                  </p>
                  <div className="flex items-center gap-1">
                    <Star size={10} fill="#F59E0B" stroke="#F59E0B" />
                    <span style={{ fontSize: 10, color: "var(--muted-foreground)", fontWeight: 500 }}>{item.rating}</span>
                  </div>
                  <p style={{ fontSize: 12, fontWeight: 700, color: "var(--navy)" }}>{item.price}</p>
                  <button
                    onClick={() => onNav("shop")}
                    className="w-full py-1.5 rounded-xl text-xs font-semibold mt-0.5"
                    style={{ backgroundColor: "var(--navy)", color: "var(--lime)" }}
                  >
                    View
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Organiser Banner */}
        <div
          className="p-5 rounded-2xl cursor-pointer hover:scale-[1.01] transition-all"
          style={{ background: "linear-gradient(135deg, #162D52 0%, var(--navy) 100%)", border: "1px solid rgba(167,255,63,0.2)" }}
          onClick={() => window.open("https://forms.google.com", "_blank")}
        >
          <div className="flex items-center gap-2 mb-3">
            <span className="text-lg">🏟️</span>
            <span className="text-xs font-bold uppercase tracking-widest" style={{ color: "var(--lime)" }}>For Organisers</span>
          </div>
          <h3 className="text-white mb-2" style={{ fontSize: 14, fontWeight: 700, lineHeight: 1.4 }}>
            Run Tournaments on ShuttleHub
          </h3>
          <p className="text-xs leading-relaxed mb-4" style={{ color: "rgba(255,255,255,0.6)" }}>
            Fixtures, live scoring, referee tools, player registrations — everything to run a seamless event.
          </p>
          <div className="flex flex-wrap gap-2 mb-4">
            {["Fixtures", "Live Scores", "Referee App", "Registrations"].map((f) => (
              <span key={f} className="text-xs px-2.5 py-1 rounded-lg" style={{ backgroundColor: "rgba(167,255,63,0.12)", color: "var(--lime)" }}>{f}</span>
            ))}
          </div>
          <div className="w-full py-2.5 rounded-xl text-sm font-bold text-center" style={{ backgroundColor: "rgba(167,255,63,0.15)", color: "var(--lime)", border: "1px solid rgba(167,255,63,0.3)" }}>
            Get Started — Fill the Form →
          </div>
        </div>
      </div>
    </div>
  );
}
