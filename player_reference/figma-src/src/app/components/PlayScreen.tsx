import { useState } from "react";
import {
  MapPin, Star, Clock, Users, Swords, CalendarDays,
  Building2, GraduationCap, Phone, MessageCircle, Award,
  X, ChevronRight, Wifi, UserCheck, AlertCircle, Search,
  BadgeCheck, Shield, Plus, ArrowLeft, CheckCircle, CreditCard,
  Smartphone, Wallet, Coffee, ShowerHead, ParkingCircle, Calendar,
  Share2, Copy, Edit2, XCircle,
} from "lucide-react";

/* ─── Static dates (14 days from Jul 30) ─── */
const DATES = [
  { day: "Thu", date: 30, month: "Jul", full: "2026-07-30" },
  { day: "Fri", date: 31, month: "Jul", full: "2026-07-31" },
  { day: "Sat", date: 1,  month: "Aug", full: "2026-08-01" },
  { day: "Sun", date: 2,  month: "Aug", full: "2026-08-02" },
  { day: "Mon", date: 3,  month: "Aug", full: "2026-08-03" },
  { day: "Tue", date: 4,  month: "Aug", full: "2026-08-04" },
  { day: "Wed", date: 5,  month: "Aug", full: "2026-08-05" },
  { day: "Thu", date: 6,  month: "Aug", full: "2026-08-06" },
  { day: "Fri", date: 7,  month: "Aug", full: "2026-08-07" },
  { day: "Sat", date: 8,  month: "Aug", full: "2026-08-08" },
  { day: "Sun", date: 9,  month: "Aug", full: "2026-08-09" },
  { day: "Mon", date: 10, month: "Aug", full: "2026-08-10" },
  { day: "Tue", date: 11, month: "Aug", full: "2026-08-11" },
  { day: "Wed", date: 12, month: "Aug", full: "2026-08-12" },
];

/* 30-min slots grouped by time of day */
const TOD_SLOTS_30MIN: Record<string, string[]> = {
  twilight: ["06:00","06:30","07:00","07:30","08:00","08:30"],
  morning:  ["09:00","09:30","10:00","10:30","11:00","11:30"],
  noon:     ["12:00","12:30","13:00","13:30","14:00","14:30","15:00","15:30","16:00","16:30","17:00","17:30"],
  evening:  ["18:00","18:30","19:00","19:30","20:00","20:30","21:00","21:30"],
};

const BOOKED_SLOTS: Record<number, string[]> = {
  1: ["07:00","07:30","09:00","12:00","12:30","14:00","14:30","18:00"],
  2: ["08:00","08:30","11:00","13:00","13:30","15:00","20:00","20:30"],
  3: ["06:00","06:30","07:00","07:30","17:00","17:30"],
};

/* For a row of 6 thirty-min slots, return the 4 hour boundary labels */
function getRowHourLabels(row: string[]): string[] {
  if (!row.length) return [];
  const startH = parseInt(row[0].split(":")[0]);
  return [0, 1, 2, 3].map((offset) => {
    const h = startH + offset;
    return `${h % 12 || 12} ${h >= 12 ? "pm" : "am"}`;
  });
}

function to12hLabel(t: string): string {
  const [h, m] = t.split(":").map(Number);
  const ampm = h >= 12 ? "pm" : "am";
  const hr = h % 12 || 12;
  return m === 0 ? `${hr} ${ampm}` : `${hr}:${String(m).padStart(2,"0")} ${ampm}`;
}

function to12h(t: string): string {
  const [h, m] = t.split(":").map(Number);
  const ampm = h >= 12 ? "PM" : "AM";
  const hr = h % 12 || 12;
  return `${hr}:${String(m).padStart(2, "0")} ${ampm}`;
}

function hourEnd(slot: string): string {
  const [h, m] = slot.split(":").map(Number);
  const total = h * 60 + m + 60;
  return `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
}

/* ─── Data ─── */
const courts = [
  {
    id: 1, name: "Axiata Arena — Hall A", area: "Bukit Jalil", location: "Bukit Jalil, KL",
    distance: "2.4 km", price: 18, rating: 4.9, reviews: 234, courts: 12,
    available: true, ac: true, popular: true, sport: "Badminton",
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=320&fit=crop&auto=format",
    amenities: ["Parking", "Showers", "Cafe"],
  },
  {
    id: 2, name: "Cheras Sports Complex", area: "Cheras", location: "Cheras, KL",
    distance: "4.1 km", price: 12, rating: 4.6, reviews: 148, courts: 8,
    available: true, ac: true, popular: false, sport: "Badminton",
    image: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&h=320&fit=crop&auto=format",
    amenities: ["Parking", "Showers"],
  },
  {
    id: 3, name: "Titiwangsa Outdoor Courts", area: "Titiwangsa", location: "Titiwangsa, KL",
    distance: "5.8 km", price: 8, rating: 4.3, reviews: 92, courts: 4,
    available: false, ac: false, popular: false, sport: "Badminton",
    image: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600&h=320&fit=crop&auto=format",
    amenities: ["Parking"],
  },
];

const courtMeta: Record<number, { description: string; hours: string }> = {
  1: {
    description: "Axiata Arena Hall A is a world-class facility hosting BWF international events. Features professional-grade maple wood flooring, Olympic-standard lighting at 1,500 lux, and central air conditioning.",
    hours: "6:00 AM – 11:00 PM daily",
  },
  2: {
    description: "Cheras Sports Complex is a community-run indoor facility with 8 full-size badminton courts. Maintained to BWF club standard with wooden flooring, good lighting, and friendly staff.",
    hours: "7:00 AM – 10:00 PM daily",
  },
  3: {
    description: "Titiwangsa Outdoor Courts offer an open-air badminton experience in a scenic park setting. Synthetic surface courts with night lighting. Great for casual play and community games.",
    hours: "6:00 AM – 9:00 PM daily",
  },
};

const membershipBatches = [
  {
    id: 1, name: "Morning Warriors", coach: "Coach Hafiz", skillLevel: "Beginner",
    time: "7:00 AM – 9:00 AM", days: ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"],
    activeDays: ["Mon","Wed","Fri"], sessionsPerWeek: 3,
    benefits: ["Shuttle included", "Basic coaching"],
    enrolled: 8, capacity: 12, fee: 180,
  },
  {
    id: 2, name: "Intermediate Squad", coach: "Coach Razif", skillLevel: "Intermediate",
    time: "6:00 PM – 8:00 PM", days: ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"],
    activeDays: ["Tue","Thu","Sat"], sessionsPerWeek: 3,
    benefits: ["Shuttle included", "Tactical coaching", "Video analysis"],
    enrolled: 8, capacity: 10, fee: 240,
  },
  {
    id: 3, name: "Advanced Warriors", coach: "Coach Sarah", skillLevel: "Advanced",
    time: "8:00 AM – 11:00 AM", days: ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"],
    activeDays: ["Mon","Wed","Fri","Sat"], sessionsPerWeek: 4,
    benefits: ["Shuttle included", "Elite coaching", "Match prep", "Fitness sessions"],
    enrolled: 5, capacity: 8, fee: 380,
  },
];

function makeBookingId() { return `BK${Date.now().toString().slice(-7)}`; }
function makeAppId() { return `APP-2026-${Math.floor(100000 + Math.random() * 900000)}`; }

function slotEnd(slot: string): string {
  const [h, m] = slot.split(":").map(Number);
  const total = h * 60 + m + 30;
  return `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
}

function formatDuration(slotCount: number): string {
  const mins = slotCount * 30;
  if (mins < 60) return `${mins} min`;
  const h = Math.floor(mins / 60); const m = mins % 60;
  return m === 0 ? `${h} hr` : `${h} hr ${m} min`;
}

function formatHourDuration(slotCount: number): string {
  if (slotCount === 1) return "1 hr";
  return `${slotCount} hrs`;
}

const players = [
  { id: 1, name: "Tan Wei Ming", level: "Advanced", age: 26, location: "Bangsar", distance: "1.2 km", wins: 47, losses: 11, winRate: 82, playStyle: "Singles", available: true, image: "https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=96&h=96&fit=crop&auto=format", looking: "Friendly Match", rank: 8, playerId: "#SH-0482", verified: true, matches: 58, achievements: ["Top 10", "KL Open SF"] },
  { id: 2, name: "Priya Sharma", level: "Intermediate", age: 24, location: "Mont Kiara", distance: "3.5 km", wins: 31, losses: 14, winRate: 68, playStyle: "Doubles", available: true, image: "https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=96&h=96&fit=crop&auto=format", looking: "Doubles Partner", rank: 22, playerId: "#SH-1190", verified: true, matches: 45, achievements: ["State Doubles Runner-up"] },
  { id: 3, name: "Ahmad Zaki", level: "Advanced", age: 29, location: "Petaling Jaya", distance: "6.2 km", wins: 63, losses: 17, winRate: 79, playStyle: "Mixed Doubles", available: false, image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=96&h=96&fit=crop&auto=format", looking: "Tournament Partner", rank: 5, playerId: "#SH-0051", verified: true, matches: 80, achievements: ["National #5", "BWF Qualifier"] },
  { id: 4, name: "Chen Li Fang", level: "Beginner", age: 22, location: "Subang Jaya", distance: "8.1 km", wins: 8, losses: 10, winRate: 44, playStyle: "Singles", available: true, image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=96&h=96&fit=crop&auto=format", looking: "Practice Sessions", rank: 67, playerId: "#SH-4421", verified: false, matches: 18, achievements: [] },
  { id: 5, name: "Lim Hui Wen", level: "Intermediate", age: 27, location: "KLCC", distance: "2.8 km", wins: 22, losses: 9, winRate: 71, playStyle: "Doubles", available: true, image: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=96&h=96&fit=crop&auto=format", looking: "Doubles Partner", rank: 34, playerId: "#SH-2210", verified: true, matches: 31, achievements: ["Club Champion 2024"] },
  { id: 6, name: "Raj Kumaran", level: "Intermediate", age: 31, location: "Ampang", distance: "4.7 km", wins: 18, losses: 9, winRate: 67, playStyle: "Mixed Doubles", available: true, image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=96&h=96&fit=crop&auto=format", looking: "Mixed Doubles Partner", rank: 41, playerId: "#SH-3318", verified: false, matches: 27, achievements: [] },
];

const activeMatches = [
  { id: 1, host: "Tan Wei Ming", hostImage: "https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=60&h=60&fit=crop", playerId: "#SH-0482", rank: 8, level: "Advanced", format: "Singles", venue: "Axiata Arena — Hall A", court: "Court 3", date: "Today", time: "18:00 – 19:00", totalSlots: 2, filledSlots: 1, distance: "2.4 km", status: "Open" },
  { id: 2, host: "Priya Sharma", hostImage: "https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=60&h=60&fit=crop", playerId: "#SH-1190", rank: 22, level: "Intermediate", format: "Doubles", venue: "Cheras Sports Complex", court: "Court 6", date: "Today", time: "19:00 – 20:00", totalSlots: 4, filledSlots: 3, distance: "4.1 km", status: "Filling Fast" },
  { id: 3, host: "Ahmad Zaki", hostImage: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=60&h=60&fit=crop", playerId: "#SH-0051", rank: 5, level: "Advanced", format: "Mixed Doubles", venue: "Axiata Arena — Hall B", court: "Court 1", date: "Tomorrow", time: "07:00 – 08:00", totalSlots: 4, filledSlots: 4, distance: "2.4 km", status: "Full" },
  { id: 4, host: "Lim Hui Wen", hostImage: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=60&h=60&fit=crop", playerId: "#SH-2210", rank: 34, level: "Intermediate", format: "Doubles", venue: "Titiwangsa Outdoor Courts", court: "Court 2", date: "This Weekend", time: "08:00 – 09:00", totalSlots: 4, filledSlots: 1, distance: "5.8 km", status: "Open" },
  { id: 5, host: "Raj Kumaran", hostImage: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=60&h=60&fit=crop", playerId: "#SH-3318", rank: 41, level: "Intermediate", format: "Mixed Doubles", venue: "Cheras Sports Complex", court: "Court 4", date: "Today", time: "20:00 – 21:00", totalSlots: 4, filledSlots: 2, distance: "4.1 km", status: "Starting Soon" },
];

const joinedPlayers = [
  { id: 1, name: "Priya Sharma", playerId: "#SH-1190", level: "Intermediate", joinTime: "10 min ago", status: "Confirmed", image: "https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=60&h=60&fit=crop" },
  { id: 2, name: "Chen Li Fang", playerId: "#SH-4421", level: "Beginner", joinTime: "25 min ago", status: "Pending", image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=60&h=60&fit=crop" },
];

const coaches = [
  { id: 1, name: "Coach Razif Sidek", academy: "Sidek Badminton Academy", location: "Bukit Jalil, KL", distance: "2.4 km", experience: "18 years", speciality: ["Singles", "Footwork", "Smash"], level: "Elite / National", students: 142, rating: 4.9, reviews: 87, sessionRate: 120, available: true, image: "https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=96&h=96&fit=crop&auto=format", academyImage: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=280&fit=crop&auto=format", bio: "Former national-level player with 18 years of coaching experience. Trained multiple BWF-ranked players.", certifications: ["BWF Level 3 Coach", "Sports Science Diploma"], schedule: ["Mon–Fri 7AM–10AM", "Sat–Sun 8AM–12PM"], phone: "+60 12-388 9201" },
  { id: 2, name: "Coach Sarah Lin", academy: "KL Shuttlers Club", location: "Cheras, KL", distance: "4.1 km", experience: "11 years", speciality: ["Doubles", "Net Play", "Mixed Doubles"], level: "Intermediate – Advanced", students: 98, rating: 4.8, reviews: 63, sessionRate: 90, available: true, image: "https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=96&h=96&fit=crop&auto=format", academyImage: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&h=280&fit=crop&auto=format", bio: "Specialist in doubles strategy and net play. Works with juniors and adults looking to compete at club level.", certifications: ["BWF Level 2 Coach", "National Coaching Certificate"], schedule: ["Tue/Thu 6PM–9PM", "Sat 9AM–1PM"], phone: "+60 11-2456 7890" },
  { id: 3, name: "Coach Rajan Pillai", academy: "PJ Badminton Academy", location: "Petaling Jaya", distance: "6.8 km", experience: "9 years", speciality: ["Beginner Programs", "Kids Coaching", "Defense"], level: "Beginner – Intermediate", students: 74, rating: 4.7, reviews: 51, sessionRate: 70, available: true, image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=96&h=96&fit=crop&auto=format", academyImage: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&h=280&fit=crop&auto=format", bio: "Patient and structured coach ideal for beginners and young players.", certifications: ["BWF Level 1 Coach"], schedule: ["Mon/Wed/Fri 5PM–8PM", "Sun 8AM–11AM"], phone: "+60 16-777 3341" },
  { id: 4, name: "Coach Mei Ling Tan", academy: "Subang Elite Badminton", location: "Subang Jaya", distance: "9.2 km", experience: "14 years", speciality: ["Women's Singles", "Speed & Agility", "Tournament Prep"], level: "Advanced – Elite", students: 56, rating: 4.9, reviews: 44, sessionRate: 150, available: false, image: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=96&h=96&fit=crop&auto=format", academyImage: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600&h=280&fit=crop&auto=format", bio: "Former national women's singles player. Specialises in high-performance training and tournament prep.", certifications: ["BWF Level 3 Coach", "Exercise Physiology Cert"], schedule: ["Mon–Fri 6AM–9AM"], phone: "+60 12-900 1122" },
];

const statusColors: Record<string, { bg: string; text: string }> = {
  "Open": { bg: "rgba(16,185,129,0.12)", text: "#10B981" },
  "Filling Fast": { bg: "rgba(245,158,11,0.12)", text: "#F59E0B" },
  "Full": { bg: "rgba(239,68,68,0.1)", text: "#EF4444" },
  "Starting Soon": { bg: "rgba(59,130,246,0.12)", text: "#3B82F6" },
  "Live": { bg: "rgba(239,68,68,0.1)", text: "#EF4444" },
  "Cancelled": { bg: "rgba(107,114,128,0.12)", text: "#6B7280" },
};

const levelColors: Record<string, string> = {
  Beginner: "#10B981", Intermediate: "#3B82F6", Advanced: "#F59E0B", Elite: "#EF4444",
};

type SubTab = "book" | "find" | "host" | "train";
type BookStep = null | "detail" | "slot" | "summary" | "payment" | "processing" | "confirmation" | "membership";

/* ─── No Booking Modal ─── */
function NoBookingModal({ title, message, onBook, onCancel }: {
  title: string; message: string; onBook: () => void; onCancel: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" style={{ backgroundColor: "rgba(0,0,0,0.55)" }} onClick={onCancel}>
      <div className="w-full max-w-sm rounded-2xl p-6" style={{ backgroundColor: "var(--card)" }} onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: "rgba(245,158,11,0.1)" }}>
            <AlertCircle size={20} style={{ color: "#F59E0B" }} />
          </div>
          <p className="font-bold" style={{ color: "var(--foreground)" }}>{title}</p>
        </div>
        <p className="text-sm leading-relaxed mb-6" style={{ color: "var(--muted-foreground)" }}>{message}</p>
        <div className="flex flex-col gap-2">
          <button onClick={onBook} className="w-full py-3.5 rounded-xl text-sm font-bold" style={{ backgroundColor: "var(--navy)", color: "var(--lime)" }}>
            Book a Court
          </button>
          <button onClick={onCancel} className="w-full py-2.5 text-sm" style={{ color: "var(--muted-foreground)" }}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

/* ─── Host Match Modal ─── */
function HostMatchModal({ courtName, dateLabel, timeRange, onClose, onPublish }: {
  courtName: string; dateLabel: string; timeRange: string; onClose: () => void; onPublish: (format: string) => void;
}) {
  const [matchFormat, setMatchFormat] = useState("Singles");
  const [skillLevel, setSkillLevel] = useState("All Levels Welcome");
  const [isPublic, setIsPublic] = useState(true);
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" style={{ backgroundColor: "rgba(0,0,0,0.55)" }} onClick={onClose}>
      <div className="w-full max-w-sm rounded-3xl p-6" style={{ backgroundColor: "var(--card)" }} onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h2 style={{ fontSize: 20, fontWeight: 800, color: "var(--foreground)" }}>Host a Match</h2>
          <button onClick={onClose} className="w-9 h-9 rounded-full flex items-center justify-center" style={{ backgroundColor: "var(--muted)" }}>
            <X size={16} style={{ color: "var(--foreground)" }} />
          </button>
        </div>
        <div className="p-4 rounded-2xl mb-5" style={{ backgroundColor: "var(--muted)", border: "1px solid var(--border)" }}>
          <p className="text-xs mb-1" style={{ color: "var(--muted-foreground)" }}>Using your booking:</p>
          <p className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>{courtName} · {dateLabel}, {timeRange}</p>
        </div>
        <div className="mb-4">
          <p className="text-sm font-semibold mb-2.5" style={{ color: "var(--foreground)" }}>Match Format</p>
          <div className="flex gap-2">
            {["Singles", "Doubles", "Mixed"].map((f) => (
              <button key={f} onClick={() => setMatchFormat(f)} className="flex-1 py-2.5 rounded-xl text-sm font-medium transition-all"
                style={{ backgroundColor: matchFormat === f ? "var(--navy)" : "transparent", color: matchFormat === f ? "#fff" : "var(--foreground)", border: `1.5px solid ${matchFormat === f ? "var(--navy)" : "var(--border)"}` }}>
                {f}
              </button>
            ))}
          </div>
        </div>
        <div className="mb-4">
          <p className="text-sm font-semibold mb-2.5" style={{ color: "var(--foreground)" }}>Skill Level</p>
          <div className="relative">
            <select value={skillLevel} onChange={(e) => setSkillLevel(e.target.value)}
              className="w-full px-4 py-3 rounded-xl text-sm outline-none appearance-none"
              style={{ backgroundColor: "var(--input-background)", border: "1px solid var(--border)", color: "var(--foreground)" }}>
              {["All Levels Welcome", "Beginner", "Intermediate", "Advanced", "Elite"].map((l) => (
                <option key={l} value={l}>{l}</option>
              ))}
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
              <svg width="12" height="8" viewBox="0 0 12 8" fill="none"><path d="M1 1L6 6L11 1" stroke="var(--muted-foreground)" strokeWidth="1.5" strokeLinecap="round"/></svg>
            </div>
          </div>
        </div>
        <div className="mb-6">
          <p className="text-sm font-semibold mb-2.5" style={{ color: "var(--foreground)" }}>Visibility</p>
          <div className="flex gap-2">
            {[true, false].map((pub) => (
              <button key={String(pub)} onClick={() => setIsPublic(pub)} className="flex-1 py-2.5 rounded-xl text-sm font-medium transition-all"
                style={{ backgroundColor: isPublic === pub ? "var(--navy)" : "transparent", color: isPublic === pub ? "#fff" : "var(--foreground)", border: `1.5px solid ${isPublic === pub ? "var(--navy)" : "var(--border)"}` }}>
                {pub ? "Public" : "Private"}
              </button>
            ))}
          </div>
        </div>
        <button onClick={() => onPublish(matchFormat)} className="w-full py-4 rounded-2xl text-sm font-bold" style={{ backgroundColor: "var(--lime)", color: "var(--navy)" }}>
          Publish Match
        </button>
      </div>
    </div>
  );
}

/* ─── Application Confirmed Dialog ─── */
function ApplicationConfirmedDialog({ appId, batchName, courtName, onDone, onViewApps }: {
  appId: string; batchName: string; courtName: string; onDone: () => void; onViewApps: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4" style={{ backgroundColor: "rgba(0,0,0,0.6)" }}>
      <div className="w-full max-w-sm rounded-3xl p-6 text-center" style={{ backgroundColor: "var(--card)" }}>
        <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: "rgba(16,185,129,0.1)", border: "2px solid rgba(16,185,129,0.3)" }}>
          <CheckCircle size={32} style={{ color: "#10B981" }} strokeWidth={1.5} />
        </div>
        <h2 className="font-black mb-1" style={{ fontSize: 18, color: "var(--foreground)" }}>Application Submitted!</h2>
        <p className="text-sm mb-1 font-medium" style={{ color: "var(--foreground)" }}>{batchName}</p>
        <p className="text-xs mb-4" style={{ color: "var(--muted-foreground)" }}>{courtName}</p>
        <div className="p-4 rounded-2xl mb-5" style={{ backgroundColor: "var(--muted)", border: "1px solid var(--border)" }}>
          <p className="text-xs mb-1" style={{ color: "var(--muted-foreground)" }}>Application ID</p>
          <p className="font-black tracking-widest" style={{ color: "var(--navy)", fontSize: 16 }}>{appId}</p>
        </div>
        <p className="text-xs mb-5 leading-relaxed" style={{ color: "var(--muted-foreground)" }}>
          Your membership application has been submitted to the court owner. You will be notified once your application is reviewed.
        </p>
        <div className="flex flex-col gap-2">
          <button onClick={onViewApps} className="w-full py-3.5 rounded-xl text-sm font-bold" style={{ backgroundColor: "var(--navy)", color: "var(--lime)" }}>
            View My Applications
          </button>
          <button onClick={onDone} className="w-full py-3 text-sm" style={{ color: "var(--muted-foreground)" }}>Done</button>
        </div>
      </div>
    </div>
  );
}

/* ─── My Applications Sheet ─── */
function MyApplicationsSheet({ apps, onClose }: {
  apps: Array<{ appId: string; courtName: string; batchName: string; date: string }>; onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[105] flex items-end justify-center" style={{ backgroundColor: "rgba(0,0,0,0.55)" }} onClick={onClose}>
      <div className="w-full max-w-lg rounded-t-3xl overflow-y-auto" style={{ backgroundColor: "var(--card)", maxHeight: "75vh" }} onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full" style={{ backgroundColor: "var(--border)" }} />
        </div>
        <div className="px-5 pt-3 pb-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-bold" style={{ fontSize: 18, color: "var(--foreground)" }}>My Applications</h2>
            <button onClick={onClose}><X size={18} style={{ color: "var(--muted-foreground)" }} /></button>
          </div>
          {apps.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>No applications yet</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {apps.map((app) => (
                <div key={app.appId} className="p-4 rounded-2xl" style={{ backgroundColor: "var(--background)", border: "1px solid var(--border)" }}>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <p className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>{app.batchName}</p>
                      <p className="text-xs mt-0.5" style={{ color: "var(--muted-foreground)" }}>{app.courtName}</p>
                    </div>
                    <span className="text-xs px-2.5 py-1 rounded-lg font-semibold flex-shrink-0" style={{ backgroundColor: "rgba(245,158,11,0.1)", color: "#F59E0B" }}>
                      Pending Review
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-mono" style={{ color: "var(--muted-foreground)" }}>{app.appId}</p>
                    <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>{app.date}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── Cancel Match Dialog ─── */
function CancelMatchDialog({ onKeep, onCancel }: { onKeep: () => void; onCancel: () => void }) {
  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4" style={{ backgroundColor: "rgba(0,0,0,0.6)" }}>
      <div className="w-full max-w-sm rounded-3xl p-6" style={{ backgroundColor: "var(--card)" }}>
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4" style={{ backgroundColor: "rgba(239,68,68,0.1)" }}>
          <XCircle size={24} style={{ color: "#EF4444" }} />
        </div>
        <h2 className="font-black mb-2" style={{ fontSize: 18, color: "var(--foreground)" }}>Cancel Match?</h2>
        <p className="text-sm leading-relaxed mb-6" style={{ color: "var(--muted-foreground)" }}>
          This will cancel the hosted match and notify all joined players.
        </p>
        <div className="flex flex-col gap-2">
          <button onClick={onCancel} className="w-full py-3.5 rounded-xl text-sm font-bold" style={{ backgroundColor: "#EF4444", color: "#fff" }}>
            Cancel Match
          </button>
          <button onClick={onKeep} className="w-full py-3.5 rounded-xl text-sm font-semibold" style={{ backgroundColor: "var(--muted)", color: "var(--foreground)" }}>
            Keep Match
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Hosted Match Details Screen ─── */
function HostedMatchDetailsScreen({ courtName, dateLabel, timeRange, matchFormat, onBack, onCancelled }: {
  courtName: string; dateLabel: string; timeRange: string; matchFormat: string;
  onBack: () => void; onCancelled: () => void;
}) {
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [registrationClosed, setRegistrationClosed] = useState(false);
  return (
    <div className="flex flex-col" style={{ backgroundColor: "var(--background)", minHeight: "100vh" }}>
      {showCancelDialog && (
        <CancelMatchDialog
          onKeep={() => setShowCancelDialog(false)}
          onCancel={() => { setShowCancelDialog(false); onCancelled(); }}
        />
      )}
      <div className="flex items-center gap-3 px-4 lg:px-6 py-3 sticky top-0 z-10" style={{ backgroundColor: "var(--card)", borderBottom: "1px solid var(--border)" }}>
        <button onClick={onBack} className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: "var(--muted)" }}>
          <ArrowLeft size={16} style={{ color: "var(--foreground)" }} />
        </button>
        <h2 className="font-bold" style={{ color: "var(--foreground)", fontSize: 16 }}>Hosted Match Details</h2>
      </div>

      <div className="px-4 lg:px-6 py-4 flex flex-col gap-4">
        {/* Match Info */}
        <div className="p-4 rounded-2xl" style={{ backgroundColor: "var(--card)", border: "1px solid var(--border)" }}>
          <div className="flex items-center justify-between mb-4">
            <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--muted-foreground)" }}>Match Information</p>
            <span className="text-xs font-bold px-2.5 py-1 rounded-lg" style={{ backgroundColor: statusColors["Open"].bg, color: statusColors["Open"].text }}>
              {registrationClosed ? "Closed" : "Open"}
            </span>
          </div>
          {[
            ["Court", courtName],
            ["Date", dateLabel],
            ["Time", timeRange],
            ["Match Format", matchFormat],
            ["Skill Level", "All Levels Welcome"],
            ["Visibility", "Public"],
            ["Total Slots", "4"],
            ["Available Slots", `${4 - joinedPlayers.length}`],
          ].map(([k, v]) => (
            <div key={k} className="flex justify-between py-2.5" style={{ borderBottom: "1px solid var(--border)" }}>
              <span className="text-sm" style={{ color: "var(--muted-foreground)" }}>{k}</span>
              <span className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>{v}</span>
            </div>
          ))}
        </div>

        {/* Joined Players */}
        <div className="p-4 rounded-2xl" style={{ backgroundColor: "var(--card)", border: "1px solid var(--border)" }}>
          <div className="flex items-center justify-between mb-4">
            <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--muted-foreground)" }}>Joined Players</p>
            <span className="text-xs font-medium px-2.5 py-1 rounded-lg" style={{ backgroundColor: "var(--muted)", color: "var(--foreground)" }}>
              {joinedPlayers.length} / 4
            </span>
          </div>
          {joinedPlayers.length === 0 ? (
            <div className="text-center py-6">
              <Users size={24} style={{ color: "var(--muted-foreground)", margin: "0 auto 8px" }} />
              <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>No players have joined yet.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {joinedPlayers.map((p) => (
                <div key={p.id} className="flex items-center gap-3 p-3 rounded-xl" style={{ backgroundColor: "var(--background)" }}>
                  <img src={p.image} alt={p.name} className="w-10 h-10 rounded-xl object-cover flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate" style={{ color: "var(--foreground)" }}>{p.name}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs" style={{ color: "var(--muted-foreground)" }}>{p.playerId}</span>
                      <span className="text-xs px-1.5 py-0.5 rounded font-medium" style={{ backgroundColor: `${levelColors[p.level]}15`, color: levelColors[p.level] }}>{p.level}</span>
                    </div>
                    <p className="text-xs mt-0.5" style={{ color: "var(--muted-foreground)" }}>Joined {p.joinTime}</p>
                  </div>
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-lg flex-shrink-0"
                    style={{ backgroundColor: p.status === "Confirmed" ? "rgba(16,185,129,0.1)" : "rgba(245,158,11,0.1)", color: p.status === "Confirmed" ? "#10B981" : "#F59E0B" }}>
                    {p.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="p-4 rounded-2xl" style={{ backgroundColor: "var(--card)", border: "1px solid var(--border)" }}>
          <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: "var(--muted-foreground)" }}>Actions</p>
          <div className="flex flex-col gap-2">
            <div className="flex gap-2">
              <button className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold" style={{ backgroundColor: "var(--muted)", color: "var(--foreground)", border: "1px solid var(--border)" }}>
                <Edit2 size={14} /> Edit Match
              </button>
              <button onClick={() => setRegistrationClosed(!registrationClosed)} className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold" style={{ backgroundColor: "var(--muted)", color: "var(--foreground)", border: "1px solid var(--border)" }}>
                {registrationClosed ? <><CheckCircle size={14} /> Reopen</> : <><XCircle size={14} /> Close Reg</>}
              </button>
            </div>
            <div className="flex gap-2">
              <button className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold" style={{ backgroundColor: "var(--muted)", color: "var(--foreground)", border: "1px solid var(--border)" }}>
                <Share2 size={14} /> Share
              </button>
              <button className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold" style={{ backgroundColor: "var(--muted)", color: "var(--foreground)", border: "1px solid var(--border)" }}>
                <Copy size={14} /> Copy Link
              </button>
            </div>
            <button onClick={() => setShowCancelDialog(true)} className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold"
              style={{ backgroundColor: "rgba(239,68,68,0.08)", color: "#EF4444", border: "1px solid rgba(239,68,68,0.2)" }}>
              <XCircle size={14} /> Cancel Match
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Membership Batches Screen ─── */
function MembershipBatchesScreen({ courtName, onBack, onApply }: {
  courtName: string; onBack: () => void;
  onApply: (batchId: number, batchName: string) => void;
}) {
  return (
    <div className="flex flex-col">
      <div className="flex items-center gap-3 px-4 lg:px-6 py-3 sticky top-0 z-10" style={{ backgroundColor: "var(--card)", borderBottom: "1px solid var(--border)" }}>
        <button onClick={onBack} className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: "var(--muted)" }}>
          <ArrowLeft size={16} style={{ color: "var(--foreground)" }} />
        </button>
        <div className="flex-1 min-w-0">
          <h2 className="font-bold truncate" style={{ color: "var(--foreground)", fontSize: 15 }}>Membership Batches</h2>
          <p className="text-xs truncate" style={{ color: "var(--muted-foreground)" }}>{courtName}</p>
        </div>
      </div>

      {/* Header */}
      <div className="px-4 lg:px-6 py-5" style={{ background: "linear-gradient(135deg, var(--navy) 0%, #162D52 100%)" }}>
        <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: "var(--lime)" }}>Become a Member</p>
        <h2 className="text-white mb-2" style={{ fontSize: 20, fontWeight: 800 }}>Save more. Play more.</h2>
        <p className="text-sm mb-4" style={{ color: "rgba(255,255,255,0.6)" }}>
          Join a membership batch to enjoy exclusive rates, reserved courts, and coach-led sessions.
        </p>
        <div className="flex flex-wrap gap-2">
          {["Save up to 40%", "Reserved Courts", "Community Play"].map((b) => (
            <span key={b} className="text-xs font-semibold px-3 py-1.5 rounded-full" style={{ backgroundColor: "rgba(167,255,63,0.15)", color: "var(--lime)", border: "1px solid rgba(167,255,63,0.25)" }}>
              ✓ {b}
            </span>
          ))}
        </div>
      </div>

      <div className="px-4 lg:px-6 py-4 flex flex-col gap-4">
        {membershipBatches.map((batch) => {
          const pct = Math.round((batch.enrolled / batch.capacity) * 100);
          const seatsLeft = batch.capacity - batch.enrolled;
          return (
            <div key={batch.id} className="p-5 rounded-2xl" style={{ backgroundColor: "var(--card)", border: "1px solid var(--border)", boxShadow: "0 2px 12px rgba(0,0,0,0.05)" }}>
              <div className="flex items-start justify-between gap-3 mb-3">
                <div>
                  <p className="font-bold mb-1" style={{ color: "var(--foreground)", fontSize: 16 }}>{batch.name}</p>
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-lg" style={{ backgroundColor: `${levelColors[batch.skillLevel]}15`, color: levelColors[batch.skillLevel] }}>
                    {batch.skillLevel}
                  </span>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="font-black" style={{ color: "var(--navy)", fontSize: 20 }}>RM {batch.fee}</p>
                  <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>/ month</p>
                </div>
              </div>

              <div className="flex flex-col gap-1.5 mb-3">
                <div className="flex items-center gap-2 text-xs" style={{ color: "var(--muted-foreground)" }}>
                  <GraduationCap size={12} style={{ color: "var(--navy)", flexShrink: 0 }} />
                  <span>{batch.coach}</span>
                </div>
                <div className="flex items-center gap-2 text-xs" style={{ color: "var(--muted-foreground)" }}>
                  <Clock size={12} style={{ color: "var(--navy)", flexShrink: 0 }} />
                  <span>{batch.time}</span>
                </div>
                <div className="flex items-center gap-2 text-xs" style={{ color: "var(--muted-foreground)" }}>
                  <CalendarDays size={12} style={{ color: "var(--navy)", flexShrink: 0 }} />
                  <span>{batch.sessionsPerWeek}x per week</span>
                </div>
              </div>

              {/* Day pills */}
              <div className="flex gap-1.5 mb-3 flex-wrap">
                {batch.days.map((d) => {
                  const active = batch.activeDays.includes(d);
                  return (
                    <span key={d} className="text-xs px-2.5 py-1 rounded-lg font-medium"
                      style={{ backgroundColor: active ? "var(--navy)" : "var(--muted)", color: active ? "var(--lime)" : "var(--muted-foreground)" }}>
                      {d}
                    </span>
                  );
                })}
              </div>

              {/* Benefits */}
              <div className="flex flex-wrap gap-1.5 mb-4">
                {batch.benefits.map((b) => (
                  <span key={b} className="text-xs px-2.5 py-1 rounded-lg" style={{ backgroundColor: "rgba(11,31,58,0.06)", color: "var(--navy)" }}>
                    ✓ {b}
                  </span>
                ))}
              </div>

              {/* Progress */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs" style={{ color: "var(--muted-foreground)" }}>{batch.enrolled} enrolled · {seatsLeft} seats left</span>
                  <span className="text-xs font-semibold" style={{ color: seatsLeft <= 2 ? "#EF4444" : "var(--foreground)" }}>{pct}% full</span>
                </div>
                <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: "var(--muted)" }}>
                  <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: pct >= 80 ? "#EF4444" : "var(--navy)" }} />
                </div>
              </div>

              <button onClick={() => onApply(batch.id, batch.name)}
                className="w-full py-3.5 rounded-xl text-sm font-bold"
                style={{ backgroundColor: seatsLeft === 0 ? "var(--muted)" : "var(--navy)", color: seatsLeft === 0 ? "var(--muted-foreground)" : "var(--lime)" }}
                disabled={seatsLeft === 0}>
                {seatsLeft === 0 ? "Batch Full" : "Apply Now"}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ─── Challenge Modal ─── */
function ChallengeModal({ player, onClose, onSend }: { player: typeof players[0]; onClose: () => void; onSend: () => void; }) {
  const [message, setMessage] = useState("");
  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4" style={{ backgroundColor: "rgba(0,0,0,0.55)" }} onClick={onClose}>
      <div className="w-full sm:max-w-md rounded-t-3xl sm:rounded-2xl p-6" style={{ backgroundColor: "var(--card)" }} onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <p className="font-bold" style={{ color: "var(--foreground)" }}>Challenge Player</p>
          <button onClick={onClose}><X size={18} style={{ color: "var(--muted-foreground)" }} /></button>
        </div>
        <div className="flex items-center gap-3 p-3 rounded-xl mb-4" style={{ backgroundColor: "var(--background)", border: "1px solid var(--border)" }}>
          <img src={player.image} alt={player.name} className="w-12 h-12 rounded-xl object-cover flex-shrink-0" />
          <div>
            <p className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>{player.name}</p>
            <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>{player.playerId} · Rank #{player.rank} · {player.level}</p>
          </div>
        </div>
        <div className="mb-5">
          <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--muted-foreground)" }}>Message (optional)</label>
          <textarea rows={2} placeholder="Add a note to your challenge…" value={message} onChange={(e) => setMessage(e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl text-sm outline-none resize-none"
            style={{ backgroundColor: "var(--input-background)", border: "1px solid var(--border)", color: "var(--foreground)" }} />
        </div>
        <button onClick={onSend} className="w-full py-3.5 rounded-xl text-sm font-bold" style={{ backgroundColor: "var(--navy)", color: "var(--lime)" }}>
          Send Challenge Request →
        </button>
      </div>
    </div>
  );
}

/* ─── Match Detail Modal ─── */
function MatchDetailModal({ match, onClose }: { match: typeof activeMatches[0]; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4" style={{ backgroundColor: "rgba(0,0,0,0.5)" }} onClick={onClose}>
      <div className="w-full sm:max-w-md rounded-t-3xl sm:rounded-2xl p-6" style={{ backgroundColor: "var(--card)" }} onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <p className="font-bold" style={{ color: "var(--foreground)" }}>Match Details</p>
          <button onClick={onClose}><X size={18} style={{ color: "var(--muted-foreground)" }} /></button>
        </div>
        <div className="flex items-center gap-3 mb-4">
          <img src={match.hostImage} alt={match.host} className="w-14 h-14 rounded-2xl object-cover" style={{ border: "2px solid var(--lime)" }} />
          <div>
            <p className="font-bold" style={{ color: "var(--foreground)" }}>{match.host}</p>
            <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>{match.playerId} · Rank #{match.rank} · {match.level}</p>
          </div>
          <span className="ml-auto text-xs font-bold px-2.5 py-1 rounded-lg" style={{ backgroundColor: statusColors[match.status]?.bg, color: statusColors[match.status]?.text }}>{match.status}</span>
        </div>
        <div className="flex flex-col gap-0 mb-5">
          {[["Venue", match.venue], ["Court", match.court], ["Format", match.format], ["Date", match.date], ["Time", match.time], ["Distance", match.distance]].map(([k, v]) => (
            <div key={k} className="flex justify-between py-2.5" style={{ borderBottom: "1px solid var(--border)" }}>
              <span className="text-sm" style={{ color: "var(--muted-foreground)" }}>{k}</span>
              <span className="text-sm font-medium" style={{ color: "var(--foreground)" }}>{v}</span>
            </div>
          ))}
          <div className="flex justify-between py-2.5">
            <span className="text-sm" style={{ color: "var(--muted-foreground)" }}>Slots Left</span>
            <span className="text-sm font-semibold" style={{ color: match.filledSlots === match.totalSlots ? "var(--live-red)" : "var(--win-green)" }}>
              {match.totalSlots - match.filledSlots} of {match.totalSlots}
            </span>
          </div>
        </div>
        <div className="flex gap-3">
          {match.filledSlots < match.totalSlots
            ? <button onClick={onClose} className="flex-1 py-3.5 rounded-xl text-sm font-bold" style={{ backgroundColor: "var(--navy)", color: "var(--lime)" }}>Join Match →</button>
            : <button className="flex-1 py-3.5 rounded-xl text-sm font-bold" style={{ backgroundColor: "var(--muted)", color: "var(--muted-foreground)" }}>Match Full</button>
          }
          <button onClick={onClose} className="px-5 py-3.5 rounded-xl text-sm font-medium" style={{ backgroundColor: "var(--muted)", color: "var(--foreground)" }}>Close</button>
        </div>
      </div>
    </div>
  );
}

/* ─── Player Profile Sheet ─── */
function PlayerProfileSheet({ player, onClose, onChallenge }: { player: typeof players[0]; onClose: () => void; onChallenge: () => void; }) {
  const recentMatches = [
    { opponent: "Marcus Tan", result: "W", score: "21-15, 21-18", date: "Aug 8" },
    { opponent: "Ahmad Zaki", result: "L", score: "18-21, 17-21", date: "Aug 5" },
    { opponent: "Raj Kumaran", result: "W", score: "21-12, 21-16", date: "Aug 1" },
  ];
  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center" style={{ backgroundColor: "rgba(0,0,0,0.55)" }} onClick={onClose}>
      <div className="w-full max-w-lg rounded-t-3xl overflow-y-auto" style={{ backgroundColor: "var(--card)", maxHeight: "88vh" }} onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-center pt-3 pb-1"><div className="w-10 h-1 rounded-full" style={{ backgroundColor: "var(--border)" }} /></div>
        <div className="px-5 pt-3 pb-5" style={{ background: "linear-gradient(135deg, var(--navy) 0%, #162D52 100%)" }}>
          <div className="flex items-start gap-4">
            <div className="relative flex-shrink-0">
              <img src={player.image} alt={player.name} className="w-20 h-20 rounded-2xl object-cover" style={{ border: "2px solid var(--lime)" }} />
              {player.verified && (
                <div className="absolute -bottom-1.5 -right-1.5 w-6 h-6 rounded-full flex items-center justify-center" style={{ backgroundColor: "#3B82F6", border: "2px solid var(--card)" }}>
                  <BadgeCheck size={12} color="#fff" strokeWidth={2.5} />
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-white font-bold mb-1" style={{ fontSize: 18 }}>{player.name}</h2>
              <p className="text-xs mb-2" style={{ color: "rgba(255,255,255,0.5)" }}>{player.playerId}</p>
              <div className="flex flex-wrap gap-2">
                <span className="text-xs font-bold px-2.5 py-1 rounded-lg" style={{ backgroundColor: "rgba(255,255,255,0.1)", color: "#fff" }}>Rank #{player.rank}</span>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-lg" style={{ backgroundColor: `${levelColors[player.level]}20`, color: levelColors[player.level] }}>{player.level}</span>
              </div>
            </div>
            <button onClick={onClose} className="flex-shrink-0"><X size={20} style={{ color: "rgba(255,255,255,0.5)" }} /></button>
          </div>
          <div className="grid grid-cols-3 gap-2 mt-4">
            {[["Matches", player.matches], ["Wins", player.wins], ["Win %", `${player.winRate}%`]].map(([l, v]) => (
              <div key={String(l)} className="text-center p-2 rounded-xl" style={{ backgroundColor: "rgba(255,255,255,0.06)" }}>
                <p className="text-white font-bold" style={{ fontSize: 18 }}>{v}</p>
                <p className="text-xs" style={{ color: "rgba(255,255,255,0.45)" }}>{l}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="px-5 py-4 flex flex-col gap-4">
          {player.achievements.length > 0 && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "var(--muted-foreground)" }}>Achievements</p>
              <div className="flex flex-wrap gap-2">
                {player.achievements.map((a) => (
                  <span key={a} className="text-xs px-3 py-1.5 rounded-xl font-medium" style={{ backgroundColor: "rgba(245,158,11,0.1)", color: "#F59E0B" }}>🏆 {a}</span>
                ))}
              </div>
            </div>
          )}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "var(--muted-foreground)" }}>Recent Matches</p>
            <div className="flex flex-col gap-2">
              {recentMatches.map((m, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-xl" style={{ backgroundColor: "var(--background)" }}>
                  <span className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0"
                    style={{ backgroundColor: m.result === "W" ? "rgba(16,185,129,0.1)" : "rgba(239,68,68,0.1)", color: m.result === "W" ? "var(--win-green)" : "var(--live-red)" }}>
                    {m.result}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium" style={{ color: "var(--foreground)" }}>vs {m.opponent}</p>
                    <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>{m.date}</p>
                  </div>
                  <span className="text-xs font-mono" style={{ color: "var(--muted-foreground)" }}>{m.score}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="flex gap-3 pt-1">
            <button onClick={onChallenge} className="flex-1 py-3.5 rounded-2xl text-sm font-bold" style={{ backgroundColor: "var(--navy)", color: "var(--lime)" }}>Challenge Player</button>
            <button onClick={onClose} className="flex-1 py-3.5 rounded-2xl text-sm font-semibold" style={{ backgroundColor: "var(--muted)", color: "var(--foreground)", border: "1px solid var(--border)" }}>Invite to Match</button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Main Component ─── */
export function PlayScreen({ onNav }: { onNav?: (id: string) => void }) {
  const [subTab, setSubTab] = useState<SubTab>("book");
  const [bookStep, setBookStep] = useState<BookStep>(null);
  const [selectedCourt, setSelectedCourt] = useState<number | null>(null);
  const [selectedDate, setSelectedDate] = useState("2026-07-30");
  const [selectedSlots, setSelectedSlots] = useState<string[]>([]);
  const [numCourts, setNumCourts] = useState(1);
  const [dateIndex, setDateIndex] = useState(0);
  const [timeOfDay, setTimeOfDay] = useState<"twilight" | "morning" | "noon" | "evening">("morning");
  const [slotAcPref, setSlotAcPref] = useState<"ac" | "nonac">("ac");
  const [courtSearch, setCourtSearch] = useState("");
  const [courtTypeFilter, setCourtTypeFilter] = useState<"all" | "ac" | "nonac">("all");
  const [bookingId, setBookingId] = useState("");
  const [payMethodBook, setPayMethodBook] = useState<"upi" | "card" | "wallet">("upi");
  const [upiIdBook, setUpiIdBook] = useState("");
  const [cardNumBook, setCardNumBook] = useState("");
  const [cardExpiryBook, setCardExpiryBook] = useState("");
  const [cardCvvBook, setCardCvvBook] = useState("");

  /* Confirmed booking */
  const [confirmedBooking, setConfirmedBooking] = useState<{ courtId: number; slots: string[]; date: string; bookingId: string; } | null>(null);

  /* Find Players */
  const [playerSearch, setPlayerSearch] = useState("");
  const [levelFilter, setLevelFilter] = useState("All");
  const [challengePlayer, setChallengePlayer] = useState<typeof players[0] | null>(null);
  const [viewProfilePlayer, setViewProfilePlayer] = useState<typeof players[0] | null>(null);
  const [showNoBookingForChallenge, setShowNoBookingForChallenge] = useState(false);

  /* Host / Join */
  const [hostJoinTab, setHostJoinTab] = useState<"host" | "join">("join");
  const [viewMatch, setViewMatch] = useState<typeof activeMatches[0] | null>(null);
  const [showHostModal, setShowHostModal] = useState(false);
  const [showNoBookingForHost, setShowNoBookingForHost] = useState(false);
  const [matchFilter, setMatchFilter] = useState("All");
  const [publishedMatch, setPublishedMatch] = useState(false);
  const [publishedMatchFormat, setPublishedMatchFormat] = useState("Singles");
  const [viewHostedMatchDetails, setViewHostedMatchDetails] = useState(false);

  /* Membership */
  const [memberApps, setMemberApps] = useState<Array<{ appId: string; courtName: string; batchName: string; date: string }>>([]);
  const [pendingApp, setPendingApp] = useState<{ batchId: number; batchName: string; appId: string } | null>(null);
  const [showMyApps, setShowMyApps] = useState(false);

  /* Train */
  const [selectedCoach, setSelectedCoach] = useState<typeof coaches[0] | null>(null);
  const [coachFilter, setCoachFilter] = useState("All");

  const hasCourtyBooking = confirmedBooking !== null;
  const selectedCourtData = courts.find((c) => c.id === selectedCourt);
  const confirmedCourtData = confirmedBooking ? courts.find((c) => c.id === confirmedBooking.courtId) : null;
  const confirmedTimeRange = confirmedBooking && confirmedBooking.slots.length > 0
    ? `${confirmedBooking.slots[0]} – ${slotEnd(confirmedBooking.slots[confirmedBooking.slots.length - 1])}`
    : "";
  const confirmedDateLabel = confirmedBooking?.date ?? "";

  const filteredCourts = courts.filter((c) => {
    if (courtTypeFilter === "ac" && !c.ac) return false;
    if (courtTypeFilter === "nonac" && c.ac) return false;
    if (courtSearch && !c.name.toLowerCase().includes(courtSearch.toLowerCase()) && !c.area.toLowerCase().includes(courtSearch.toLowerCase())) return false;
    return true;
  });

  const filteredPlayers = players.filter((p) => {
    if (levelFilter !== "All" && p.level !== levelFilter) return false;
    if (playerSearch && !p.name.toLowerCase().includes(playerSearch.toLowerCase())) return false;
    return true;
  });

  const filteredMatches = activeMatches.filter((m) => matchFilter === "All" || m.format === matchFilter);

  const currentSlots = TOD_SLOTS_30MIN[timeOfDay];
  const bookedForCourt = selectedCourt ? (BOOKED_SLOTS[selectedCourt] ?? []) : [];

  const toggleSlot = (slot: string) => {
    if (bookedForCourt.includes(slot)) return;
    setSelectedSlots((prev) => prev.includes(slot) ? prev.filter((s) => s !== slot) : [...prev, slot].sort());
  };

  const slotPrice = selectedCourtData ? selectedCourtData.price / 2 : 0;
  const totalCourtFee = selectedSlots.length * slotPrice * numCourts;
  const totalAmount = totalCourtFee + 1;

  const handleChallengeClick = (player: typeof players[0]) => {
    if (!player.available) return;
    if (!hasCourtyBooking) { setChallengePlayer(player); setShowNoBookingForChallenge(true); }
    else setChallengePlayer(player);
  };

  const handleHostClick = () => {
    if (!hasCourtyBooking) setShowNoBookingForHost(true);
    else setShowHostModal(true);
  };

  const tabs: { id: SubTab; label: string; icon: string }[] = [
    { id: "book", label: "Book Court", icon: "🏸" },
    { id: "find", label: "Find Players", icon: "👥" },
    { id: "host", label: "Host / Join", icon: "⚡" },
    { id: "train", label: "Train", icon: "🎯" },
  ];

  /* Hosted match details screen — render as overlay */
  if (viewHostedMatchDetails && confirmedCourtData && confirmedBooking) {
    return (
      <HostedMatchDetailsScreen
        courtName={confirmedCourtData.name}
        dateLabel={confirmedDateLabel}
        timeRange={confirmedTimeRange}
        matchFormat={publishedMatchFormat}
        onBack={() => setViewHostedMatchDetails(false)}
        onCancelled={() => { setViewHostedMatchDetails(false); setPublishedMatch(false); }}
      />
    );
  }

  return (
    <div className="flex flex-col" style={{ backgroundColor: "var(--background)", minHeight: "100vh" }}>

      {/* Modals */}
      {showNoBookingForChallenge && challengePlayer && (
        <NoBookingModal title="No Active Court Booking" message="You need an active court booking before sending a challenge. Book a court first, then challenge this player."
          onBook={() => { setShowNoBookingForChallenge(false); setChallengePlayer(null); setSubTab("book"); }}
          onCancel={() => { setShowNoBookingForChallenge(false); setChallengePlayer(null); }} />
      )}
      {!showNoBookingForChallenge && challengePlayer && (
        <ChallengeModal player={challengePlayer} onClose={() => setChallengePlayer(null)} onSend={() => setChallengePlayer(null)} />
      )}
      {viewMatch && <MatchDetailModal match={viewMatch} onClose={() => setViewMatch(null)} />}
      {viewProfilePlayer && (
        <PlayerProfileSheet player={viewProfilePlayer} onClose={() => setViewProfilePlayer(null)}
          onChallenge={() => { setViewProfilePlayer(null); handleChallengeClick(viewProfilePlayer); }} />
      )}
      {showNoBookingForHost && (
        <NoBookingModal title="No Active Court Booking" message="Please book a court before hosting a match. Your match will be linked to your court booking."
          onBook={() => { setShowNoBookingForHost(false); setSubTab("book"); }}
          onCancel={() => setShowNoBookingForHost(false)} />
      )}
      {showHostModal && confirmedCourtData && (
        <HostMatchModal courtName={confirmedCourtData.name} dateLabel={confirmedDateLabel} timeRange={confirmedTimeRange}
          onClose={() => setShowHostModal(false)}
          onPublish={(fmt) => { setShowHostModal(false); setPublishedMatch(true); setPublishedMatchFormat(fmt); }} />
      )}
      {pendingApp && selectedCourtData && (
        <ApplicationConfirmedDialog
          appId={pendingApp.appId}
          batchName={pendingApp.batchName}
          courtName={selectedCourtData.name}
          onDone={() => setPendingApp(null)}
          onViewApps={() => { setPendingApp(null); setShowMyApps(true); }}
        />
      )}
      {showMyApps && <MyApplicationsSheet apps={memberApps} onClose={() => setShowMyApps(false)} />}

      {/* ── Segmented Nav ── */}
      <div className="px-4 lg:px-6 pt-4">
        <div className="grid rounded-2xl p-1" style={{ gridTemplateColumns: `repeat(${tabs.length}, 1fr)`, backgroundColor: "var(--muted)", border: "1px solid var(--border)" }}>
          {tabs.map(({ id, label, icon }) => {
            const isActive = subTab === id;
            return (
              <button key={id} onClick={() => setSubTab(id)}
                className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 py-2.5 px-2 rounded-xl transition-all"
                style={{ backgroundColor: isActive ? "var(--navy)" : "transparent", color: isActive ? "var(--lime)" : "var(--muted-foreground)", fontWeight: isActive ? 700 : 400 }}>
                <span className="text-base leading-none">{icon}</span>
                <span className="text-xs sm:text-sm leading-none">{label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ════ BOOK COURT ════ */}
      {subTab === "book" && (
        <div className="flex flex-col">

          {/* ── Listing ── */}
          {!bookStep && (
            <>
              {/* Search + filters */}
              <div className="px-4 lg:px-6 pt-4 pb-3 flex flex-col gap-3">
                <div className="flex items-center gap-3 px-4 py-3 rounded-2xl" style={{ backgroundColor: "var(--card)", border: "1.5px solid var(--border)" }}>
                  <Search size={16} style={{ color: "var(--muted-foreground)" }} />
                  <input placeholder="Search courts or areas…" value={courtSearch} onChange={(e) => setCourtSearch(e.target.value)}
                    className="bg-transparent outline-none flex-1 text-sm" style={{ color: "var(--foreground)" }} />
                </div>
                <div className="flex gap-2">
                  {(["all", "ac", "nonac"] as const).map((f) => {
                    const labels: Record<string, string> = { all: "All Types", ac: "A/C", nonac: "Non A/C" };
                    return (
                      <button key={f} onClick={() => setCourtTypeFilter(f)}
                        className="px-4 py-2 rounded-full text-xs font-semibold transition-all"
                        style={{ backgroundColor: courtTypeFilter === f ? "var(--navy)" : "var(--card)", color: courtTypeFilter === f ? "var(--lime)" : "var(--foreground)", border: `1.5px solid ${courtTypeFilter === f ? "transparent" : "var(--border)"}` }}>
                        {labels[f]}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Court cards */}
              <div className="px-4 lg:px-6 pb-4 flex flex-col gap-4">
                {filteredCourts.map((court) => (
                  <button key={court.id}
                    onClick={() => { setSelectedCourt(court.id); setSelectedSlots([]); setNumCourts(1); setDateIndex(0); setTimeOfDay("morning"); setBookStep("slot"); }}
                    className="text-left rounded-2xl overflow-hidden transition-all hover:scale-[1.01]"
                    style={{ backgroundColor: "var(--card)", border: "1px solid var(--border)", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
                    <div className="relative" style={{ height: 180 }}>
                      <img src={court.image} alt={court.name} className="w-full h-full object-cover" />
                      <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.45) 0%, transparent 55%)" }} />
                      {/* Sport badge top-left */}
                      <span className="absolute top-3 left-3 flex items-center gap-1.5 text-xs font-bold px-2.5 py-1.5 rounded-full"
                        style={{ backgroundColor: "rgba(0,0,0,0.6)", color: "#fff", backdropFilter: "blur(4px)" }}>
                        🏸 {court.sport}
                      </span>
                      {/* Popular badge top-right */}
                      {court.popular && (
                        <span className="absolute top-3 right-3 text-xs font-bold px-2.5 py-1.5 rounded-full"
                          style={{ backgroundColor: "#10B981", color: "#fff" }}>
                          Popular
                        </span>
                      )}
                      {/* A/C or Non A/C bottom-left */}
                      <span className="absolute bottom-3 left-3 text-xs font-semibold px-2.5 py-1 rounded-lg"
                        style={{ backgroundColor: "rgba(0,0,0,0.55)", color: "#fff" }}>
                        {court.ac ? "❄️ A/C" : "🌬️ Non A/C"}
                      </span>
                    </div>
                    <div className="p-4">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <p className="font-bold" style={{ color: "var(--foreground)", fontSize: 15 }}>{court.name}</p>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <Star size={12} fill="#F59E0B" stroke="#F59E0B" />
                          <span className="text-xs font-semibold" style={{ color: "var(--foreground)" }}>{court.rating}</span>
                          <span className="text-xs" style={{ color: "var(--muted-foreground)" }}>({court.reviews})</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 mb-2">
                        <MapPin size={11} style={{ color: "var(--muted-foreground)" }} />
                        <span className="text-xs" style={{ color: "var(--muted-foreground)" }}>{court.area} · {court.distance}</span>
                      </div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs px-2.5 py-1 rounded-lg font-medium" style={{ backgroundColor: "var(--muted)", color: "var(--muted-foreground)" }}>
                          {court.courts} courts
                        </span>
                        <span className="text-sm font-bold ml-auto" style={{ color: "var(--navy)" }}>RM {court.price}/hr</span>
                      </div>
                    </div>
                  </button>
                ))}
                {filteredCourts.length === 0 && (
                  <div className="text-center py-12 rounded-2xl" style={{ backgroundColor: "var(--card)", border: "1px dashed var(--border)" }}>
                    <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>No courts found matching your search.</p>
                  </div>
                )}
              </div>
            </>
          )}

          {/* ── Court Details ── */}
          {bookStep === "detail" && selectedCourtData && (() => {
            const meta = courtMeta[selectedCourtData.id];
            return (
              <div className="flex flex-col">
                <div className="flex items-center gap-3 px-4 lg:px-6 py-3 sticky top-0 z-10" style={{ backgroundColor: "var(--card)", borderBottom: "1px solid var(--border)" }}>
                  <button onClick={() => setBookStep(null)} className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: "var(--muted)" }}>
                    <ArrowLeft size={16} style={{ color: "var(--foreground)" }} />
                  </button>
                  <h2 className="font-bold truncate" style={{ color: "var(--foreground)", fontSize: 16 }}>Court Details</h2>
                </div>
                <div className="relative" style={{ height: 220 }}>
                  <img src={selectedCourtData.image} alt={selectedCourtData.name} className="w-full h-full object-cover" />
                  <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(11,31,58,0.7) 0%, transparent 50%)" }} />
                  <div className="absolute bottom-4 left-4">
                    <span className="text-xs font-bold px-3 py-1.5 rounded-full" style={{ backgroundColor: selectedCourtData.available ? "#10B981" : "#EF4444", color: "#fff" }}>
                      {selectedCourtData.available ? "Open Now" : "Fully Booked"}
                    </span>
                  </div>
                </div>
                <div className="px-4 lg:px-6 py-4 flex flex-col gap-4">
                  <div>
                    <h1 style={{ fontSize: 22, fontWeight: 800, color: "var(--foreground)" }} className="mb-1">{selectedCourtData.name}</h1>
                    <div className="flex items-center gap-3 flex-wrap">
                      <div className="flex items-center gap-1">
                        <MapPin size={13} style={{ color: "var(--muted-foreground)" }} />
                        <span className="text-sm" style={{ color: "var(--muted-foreground)" }}>{selectedCourtData.location} · {selectedCourtData.distance}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Star size={13} fill="#F59E0B" stroke="#F59E0B" />
                        <span className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>{selectedCourtData.rating}</span>
                        <span className="text-xs" style={{ color: "var(--muted-foreground)" }}>({selectedCourtData.reviews} reviews)</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 flex-wrap">
                    <div className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl" style={{ backgroundColor: "rgba(11,31,58,0.06)", border: "1px solid rgba(11,31,58,0.1)" }}>
                      <span className="font-black" style={{ color: "var(--navy)", fontSize: 20 }}>RM {selectedCourtData.price}</span>
                      <span className="text-xs" style={{ color: "var(--muted-foreground)" }}>/ hour</span>
                    </div>
                    <span className="text-xs px-3 py-1.5 rounded-lg font-medium" style={{ backgroundColor: "var(--muted)", color: "var(--muted-foreground)" }}>
                      {selectedCourtData.ac ? "❄️ A/C" : "🌬️ Non A/C"}
                    </span>
                    <span className="text-xs px-3 py-1.5 rounded-lg font-medium" style={{ backgroundColor: "var(--muted)", color: "var(--muted-foreground)" }}>
                      {selectedCourtData.courts} courts
                    </span>
                  </div>
                  <div className="p-4 rounded-2xl" style={{ backgroundColor: "var(--card)", border: "1px solid var(--border)" }}>
                    <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "var(--muted-foreground)" }}>About</p>
                    <p className="text-sm leading-relaxed" style={{ color: "var(--foreground)" }}>{meta.description}</p>
                  </div>
                  <div className="p-4 rounded-2xl" style={{ backgroundColor: "var(--card)", border: "1px solid var(--border)" }}>
                    <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: "var(--muted-foreground)" }}>Amenities</p>
                    <div className="flex flex-wrap gap-2">
                      {selectedCourtData.amenities.map((a) => (
                        <span key={a} className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-xl font-medium" style={{ backgroundColor: "rgba(11,31,58,0.06)", color: "var(--navy)" }}>
                          <Shield size={12} /> {a}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="p-4 rounded-2xl" style={{ backgroundColor: "var(--card)", border: "1px solid var(--border)" }}>
                    <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "var(--muted-foreground)" }}>Operating Hours</p>
                    <div className="flex items-center gap-2">
                      <Clock size={14} style={{ color: "var(--navy)" }} />
                      <span className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>{meta.hours}</span>
                    </div>
                  </div>
                </div>
                <div className="sticky bottom-[72px] lg:bottom-0 left-0 right-0 px-4 lg:px-6 pb-4 pt-3" style={{ backgroundColor: "var(--background)", borderTop: "1px solid var(--border)" }}>
                  <div className="flex gap-3">
                    <button onClick={() => setBookStep("slot")} className="flex-1 py-4 rounded-2xl text-sm font-bold"
                      style={{ backgroundColor: selectedCourtData.available ? "var(--navy)" : "var(--muted)", color: selectedCourtData.available ? "var(--lime)" : "var(--muted-foreground)" }}>
                      {selectedCourtData.available ? "Book Slot →" : "No Slots Available"}
                    </button>
                    <button onClick={() => setBookStep("membership")} className="px-5 py-4 rounded-2xl text-sm font-semibold"
                      style={{ backgroundColor: "var(--muted)", color: "var(--foreground)", border: "1px solid var(--border)" }}>
                      Become a Member
                    </button>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* ── Membership Batches ── */}
          {bookStep === "membership" && selectedCourtData && (
            <MembershipBatchesScreen
              courtName={selectedCourtData.name}
              onBack={() => setBookStep("detail")}
              onApply={(batchId, batchName) => {
                const appId = makeAppId();
                const newApp = { appId, courtName: selectedCourtData.name, batchName, date: "Jul 30, 2026" };
                setMemberApps((prev) => [...prev, newApp]);
                setPendingApp({ batchId, batchName, appId });
              }}
            />
          )}

          {/* ── Slot Selection ── */}
          {bookStep === "slot" && selectedCourtData && (() => {
            const slotRows: string[][] = [];
            for (let i = 0; i < currentSlots.length; i += 6) slotRows.push(currentSlots.slice(i, i + 6));
            const todTabs = [
              { id: "twilight" as const, label: "Twilight", icon: "🌅" },
              { id: "morning"  as const, label: "Morning",  icon: "☀️" },
              { id: "noon"     as const, label: "Noon",     icon: "🌤️" },
              { id: "evening"  as const, label: "Evening",  icon: "🌆" },
            ];
            const winStart = Math.max(0, Math.min(dateIndex - 2, DATES.length - 5));
            const visibleDates = DATES.slice(winStart, winStart + 5);
            const durationMins = selectedSlots.length * 30;
            const durationLabel = durationMins >= 60
              ? `${Math.floor(durationMins/60)}h${durationMins%60 ? ` ${durationMins%60}m` : ""}`
              : `${durationMins}m`;

            return (
              <div className="flex flex-col">
                {/* Nav bar */}
                <div className="flex items-center gap-3 px-4 lg:px-6 py-3 sticky top-0 z-10"
                  style={{ backgroundColor: "var(--card)", borderBottom: "1px solid var(--border)" }}>
                  <button onClick={() => setBookStep(null)} className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: "var(--muted)" }}>
                    <ArrowLeft size={16} style={{ color: "var(--foreground)" }} />
                  </button>
                  <div className="flex-1 min-w-0">
                    <h2 className="font-bold truncate" style={{ color: "var(--foreground)", fontSize: 15 }}>{selectedCourtData.name}</h2>
                    <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>Select your slots · RM {selectedCourtData.price}/hr</p>
                  </div>
                  {selectedSlots.length > 0 && (
                    <button onClick={() => setSelectedSlots([])} className="text-xs px-3 py-1.5 rounded-lg" style={{ backgroundColor: "var(--muted)", color: "var(--muted-foreground)" }}>Clear</button>
                  )}
                </div>

                {/* Court image strip */}
                <div className="relative" style={{ height: 120 }}>
                  <img src={selectedCourtData.image} alt={selectedCourtData.name} className="w-full h-full object-cover" />
                  <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.55) 0%, transparent 55%)" }} />
                  <div className="absolute bottom-3 left-4 right-4 flex items-center gap-2">
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full" style={{ backgroundColor: "rgba(0,0,0,0.6)", color: "#fff" }}>
                      {selectedCourtData.ac ? "❄️ A/C" : "🌬️ Non A/C"}
                    </span>
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full" style={{ backgroundColor: "rgba(0,0,0,0.6)", color: "#fff" }}>
                      {selectedCourtData.courts} courts
                    </span>
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full ml-auto" style={{ backgroundColor: "rgba(0,0,0,0.6)", color: "#fff" }}>
                      🏸 {selectedCourtData.sport}
                    </span>
                  </div>
                </div>

                <div className="px-4 lg:px-6 py-5 flex flex-col gap-6">

                  {/* Court Type toggle */}
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "var(--muted-foreground)" }}>Court Type</p>
                    <div className="flex gap-2">
                      {(["ac","nonac"] as const).map((v) => {
                        const label = v === "ac" ? "A/C" : "Non A/C";
                        const active = slotAcPref === v;
                        return (
                          <button key={v} onClick={() => setSlotAcPref(v)}
                            className="px-6 py-2.5 rounded-2xl text-sm font-bold transition-all"
                            style={{ backgroundColor: active ? "var(--navy)" : "var(--card)", color: active ? "#fff" : "var(--foreground)", border: `2px solid ${active ? "var(--navy)" : "var(--border)"}` }}>
                            {label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* No. of Courts */}
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "var(--muted-foreground)" }}>No. of Courts</p>
                    <div className="flex gap-2">
                      {[1,2,3,4].filter((n) => n <= selectedCourtData.courts).map((n) => {
                        const active = numCourts === n;
                        return (
                          <button key={n} onClick={() => setNumCourts(n)}
                            className="w-12 h-12 rounded-2xl text-sm font-bold transition-all"
                            style={{ backgroundColor: active ? "var(--navy)" : "var(--card)", color: active ? "#fff" : "var(--foreground)", border: `2px solid ${active ? "var(--navy)" : "var(--border)"}` }}>
                            {n}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Divider */}
                  <div style={{ height: 1, backgroundColor: "var(--border)" }} />

                  {/* Date Picker with chevron nav */}
                  <div className="flex items-center gap-2">
                    <button onClick={() => { if (dateIndex > 0) { setDateIndex(dateIndex - 1); setSelectedSlots([]); } }}
                      className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 transition-all"
                      style={{ backgroundColor: dateIndex > 0 ? "var(--muted)" : "transparent", color: "var(--foreground)", opacity: dateIndex > 0 ? 1 : 0.3 }}>
                      <ChevronRight size={16} style={{ transform: "rotate(180deg)" }} />
                    </button>
                    <div className="flex gap-3 flex-1 justify-around">
                      {visibleDates.map((d) => {
                        const idx = DATES.findIndex((x) => x.full === d.full);
                        const isActive = dateIndex === idx;
                        return (
                          <button key={d.full} onClick={() => { setDateIndex(idx); setSelectedSlots([]); }}
                            className="flex flex-col items-center gap-0.5 transition-all"
                            style={{ minWidth: 44 }}>
                            <span className="text-xs" style={{ color: isActive ? "var(--navy)" : "var(--muted-foreground)" }}>{d.day}</span>
                            <div className="w-11 py-2.5 rounded-2xl flex flex-col items-center"
                              style={{ backgroundColor: isActive ? "var(--navy)" : "var(--card)", border: `2px solid ${isActive ? "var(--navy)" : "var(--border)"}` }}>
                              <span className="font-black" style={{ fontSize: 17, color: isActive ? "#fff" : "var(--foreground)", lineHeight: 1 }}>{d.date}</span>
                              <span className="text-xs mt-1" style={{ color: isActive ? "rgba(255,255,255,0.65)" : "var(--muted-foreground)" }}>{d.month}</span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                    <button onClick={() => { if (dateIndex < DATES.length - 1) { setDateIndex(dateIndex + 1); setSelectedSlots([]); } }}
                      className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 transition-all"
                      style={{ backgroundColor: dateIndex < DATES.length - 1 ? "var(--muted)" : "transparent", color: "var(--foreground)", opacity: dateIndex < DATES.length - 1 ? 1 : 0.3 }}>
                      <ChevronRight size={16} />
                    </button>
                  </div>

                  {/* Divider */}
                  <div style={{ height: 1, backgroundColor: "var(--border)" }} />

                  {/* Time of Day tabs */}
                  <div className="flex gap-1 p-1 rounded-2xl" style={{ backgroundColor: "var(--muted)" }}>
                    {todTabs.map((tod) => {
                      const isActive = timeOfDay === tod.id;
                      return (
                        <button key={tod.id} onClick={() => { setTimeOfDay(tod.id); setSelectedSlots([]); }}
                          className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-semibold transition-all"
                          style={{ backgroundColor: isActive ? "var(--navy)" : "transparent", color: isActive ? "#fff" : "var(--muted-foreground)" }}>
                          <span>{tod.icon}</span>
                          <span className="hidden sm:inline">{tod.label}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Slot timeline grid */}
                  <div className="flex items-stretch gap-2">
                    {/* Left nav (prev time-of-day) */}
                    <button
                      onClick={() => {
                        const ids = ["twilight","morning","noon","evening"] as const;
                        const cur = ids.indexOf(timeOfDay);
                        if (cur > 0) { setTimeOfDay(ids[cur - 1]); setSelectedSlots([]); }
                      }}
                      className="w-8 flex-shrink-0 flex items-center justify-center rounded-xl transition-all"
                      style={{ backgroundColor: "var(--muted)", color: "var(--foreground)", opacity: timeOfDay === "twilight" ? 0.3 : 1 }}>
                      <ChevronRight size={14} style={{ transform: "rotate(180deg)" }} />
                    </button>

                    {/* Rows */}
                    <div className="flex-1 flex flex-col gap-5 min-w-0">
                      {slotRows.map((row, rowIdx) => {
                        const hourLabels = getRowHourLabels(row);
                        return (
                          <div key={rowIdx}>
                            {/* Hour labels */}
                            <div className="flex justify-between mb-2 px-0.5">
                              {hourLabels.map((lbl, li) => (
                                <span key={li} className="text-xs font-medium" style={{ color: "var(--muted-foreground)" }}>{lbl}</span>
                              ))}
                            </div>
                            {/* Slot cells — 6 per row */}
                            <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 6 }}>
                              {row.map((slot) => {
                                const isBooked = bookedForCourt.includes(slot);
                                const isSelected = selectedSlots.includes(slot);
                                return (
                                  <button key={slot}
                                    onClick={() => toggleSlot(slot)}
                                    disabled={isBooked}
                                    title={to12hLabel(slot)}
                                    style={{
                                      height: 44,
                                      borderRadius: 12,
                                      border: isBooked
                                        ? "1.5px solid var(--border)"
                                        : isSelected
                                          ? "2px solid var(--navy)"
                                          : "1.5px solid var(--border)",
                                      backgroundColor: isBooked
                                        ? "transparent"
                                        : isSelected
                                          ? "var(--navy)"
                                          : "transparent",
                                      backgroundImage: isBooked
                                        ? "repeating-linear-gradient(135deg, rgba(100,100,100,0.15) 0px, rgba(100,100,100,0.15) 3px, transparent 3px, transparent 9px)"
                                        : "none",
                                      cursor: isBooked ? "not-allowed" : "pointer",
                                      transition: "all 0.15s",
                                    }}
                                  />
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}

                      {/* Legend */}
                      <div className="flex items-center gap-4 pt-1">
                        {[
                          { style: { border: "1.5px solid var(--border)", backgroundColor: "transparent" }, label: "Available" },
                          { style: { border: "2px solid var(--navy)", backgroundColor: "var(--navy)" }, label: "Selected" },
                          { style: { border: "1.5px solid var(--border)", backgroundImage: "repeating-linear-gradient(135deg, rgba(100,100,100,0.18) 0px, rgba(100,100,100,0.18) 3px, transparent 3px, transparent 9px)" }, label: "Booked" },
                        ].map(({ style, label }) => (
                          <div key={label} className="flex items-center gap-1.5">
                            <div style={{ width: 20, height: 14, borderRadius: 4, ...style }} />
                            <span className="text-xs" style={{ color: "var(--muted-foreground)" }}>{label}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Right nav (next time-of-day) */}
                    <button
                      onClick={() => {
                        const ids = ["twilight","morning","noon","evening"] as const;
                        const cur = ids.indexOf(timeOfDay);
                        if (cur < ids.length - 1) { setTimeOfDay(ids[cur + 1]); setSelectedSlots([]); }
                      }}
                      className="w-8 flex-shrink-0 flex items-center justify-center rounded-xl transition-all"
                      style={{ backgroundColor: "var(--muted)", color: "var(--foreground)", opacity: timeOfDay === "evening" ? 0.3 : 1 }}>
                      <ChevronRight size={14} />
                    </button>
                  </div>

                  {/* Selected slots detail */}
                  {selectedSlots.length > 0 && (
                    <div className="flex items-center gap-3 p-4 rounded-2xl" style={{ backgroundColor: "rgba(11,31,58,0.05)", border: "1.5px solid rgba(11,31,58,0.12)" }}>
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: "var(--navy)" }}>
                        <Clock size={16} style={{ color: "var(--lime)" }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>
                          {to12hLabel(selectedSlots[0])} – {to12hLabel(slotEnd(selectedSlots[selectedSlots.length - 1]))}
                        </p>
                        <p className="text-xs mt-0.5" style={{ color: "var(--muted-foreground)" }}>
                          {selectedSlots.length} slot{selectedSlots.length !== 1 ? "s" : ""} · {durationLabel} · {numCourts} court{numCourts > 1 ? "s" : ""}
                        </p>
                      </div>
                      <span className="font-black flex-shrink-0" style={{ color: "var(--navy)", fontSize: 18 }}>
                        RM {totalCourtFee % 1 === 0 ? totalCourtFee : totalCourtFee.toFixed(1)}
                      </span>
                    </div>
                  )}
                </div>

                {/* Sticky bottom CTA */}
                <div className="sticky bottom-[72px] lg:bottom-0 px-4 lg:px-6 pb-4 pt-3"
                  style={{ backgroundColor: "var(--background)", borderTop: "1px solid var(--border)" }}>
                  {selectedSlots.length > 0 && (
                    <div className="flex items-center justify-between mb-3 px-1">
                      <div>
                        <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>
                          {durationLabel} · {numCourts} court{numCourts > 1 ? "s" : ""}
                        </p>
                      </div>
                      <p className="font-black" style={{ color: "var(--navy)", fontSize: 20 }}>
                        RM {totalCourtFee % 1 === 0 ? totalCourtFee : totalCourtFee.toFixed(1)}
                      </p>
                    </div>
                  )}
                  <button onClick={() => selectedSlots.length > 0 && setBookStep("summary")}
                    className="w-full py-4 rounded-2xl text-sm font-bold transition-all"
                    style={{
                      backgroundColor: selectedSlots.length > 0 ? "var(--lime)" : "var(--muted)",
                      color: selectedSlots.length > 0 ? "var(--navy)" : "var(--muted-foreground)",
                      cursor: selectedSlots.length > 0 ? "pointer" : "not-allowed",
                    }}>
                    {selectedSlots.length > 0 ? "Continue to Booking Summary →" : "Select at least one slot"}
                  </button>
                </div>
              </div>
            );
          })()}

          {/* ── Booking Summary ── */}
          {bookStep === "summary" && selectedCourtData && selectedSlots.length > 0 && (
            <div className="flex flex-col">
              <div className="flex items-center gap-3 px-4 lg:px-6 py-3 sticky top-0 z-10" style={{ backgroundColor: "var(--card)", borderBottom: "1px solid var(--border)" }}>
                <button onClick={() => setBookStep("slot")} className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: "var(--muted)" }}>
                  <ArrowLeft size={16} style={{ color: "var(--foreground)" }} />
                </button>
                <h2 className="font-bold" style={{ color: "var(--foreground)", fontSize: 16 }}>Booking Summary</h2>
              </div>
              <div className="px-4 lg:px-6 py-4 flex flex-col gap-4">
                <div className="flex gap-3 p-4 rounded-2xl" style={{ backgroundColor: "var(--card)", border: "1px solid var(--border)" }}>
                  <img src={selectedCourtData.image} alt={selectedCourtData.name} className="w-16 h-16 rounded-xl object-cover flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="font-bold truncate" style={{ color: "var(--foreground)" }}>{selectedCourtData.name}</p>
                    <div className="flex items-center gap-1 mt-0.5"><MapPin size={11} style={{ color: "var(--muted-foreground)" }} /><span className="text-xs truncate" style={{ color: "var(--muted-foreground)" }}>{selectedCourtData.location}</span></div>
                    <div className="flex items-center gap-1 mt-0.5"><Star size={11} fill="#F59E0B" stroke="#F59E0B" /><span className="text-xs" style={{ color: "var(--foreground)" }}>{selectedCourtData.rating}</span></div>
                  </div>
                </div>
                <div className="p-4 rounded-2xl" style={{ backgroundColor: "var(--card)", border: "1px solid var(--border)" }}>
                  <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: "var(--muted-foreground)" }}>Booking Details</p>
                  {[
                    ["Date", DATES[dateIndex] ? `${DATES[dateIndex].day}, ${DATES[dateIndex].date} ${DATES[dateIndex].month} 2026` : selectedDate],
                    ["Time Slot", `${to12hLabel(selectedSlots[0])} – ${to12hLabel(slotEnd(selectedSlots[selectedSlots.length - 1]))}`],
                    ["Duration", formatDuration(selectedSlots.length)],
                    ["No. of Courts", `${numCourts}`],
                    ["Court Type", selectedCourtData.ac ? "A/C Indoor" : "Non A/C"],
                  ].map(([k, v]) => (
                    <div key={k} className="flex justify-between py-2.5" style={{ borderBottom: "1px solid var(--border)" }}>
                      <span className="text-sm" style={{ color: "var(--muted-foreground)" }}>{k}</span>
                      <span className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>{v}</span>
                    </div>
                  ))}
                </div>
                <div className="p-4 rounded-2xl" style={{ backgroundColor: "var(--card)", border: "1px solid var(--border)" }}>
                  <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: "var(--muted-foreground)" }}>Price Breakdown</p>
                  <div className="flex justify-between py-2" style={{ borderBottom: "1px solid var(--border)" }}>
                    <span className="text-sm" style={{ color: "var(--muted-foreground)" }}>RM {slotPrice}/30min × {selectedSlots.length} slot{selectedSlots.length > 1 ? "s" : ""} × {numCourts} court{numCourts > 1 ? "s" : ""}</span>
                    <span className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>RM {totalCourtFee % 1 === 0 ? totalCourtFee : totalCourtFee.toFixed(1)}</span>
                  </div>
                  <div className="flex justify-between py-2" style={{ borderBottom: "1px solid var(--border)" }}>
                    <span className="text-sm" style={{ color: "var(--muted-foreground)" }}>Platform fee</span>
                    <span className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>RM 1</span>
                  </div>
                  <div className="flex justify-between pt-3 mt-1">
                    <span className="font-bold" style={{ color: "var(--foreground)" }}>Total Amount</span>
                    <span className="font-black" style={{ color: "var(--navy)", fontSize: 20 }}>RM {totalAmount % 1 === 0 ? totalAmount : totalAmount.toFixed(1)}</span>
                  </div>
                </div>
              </div>
              <div className="sticky bottom-[72px] lg:bottom-0 px-4 lg:px-6 pb-4 pt-3" style={{ backgroundColor: "var(--background)", borderTop: "1px solid var(--border)" }}>
                <button onClick={() => setBookStep("payment")} className="w-full py-4 rounded-2xl text-sm font-bold" style={{ backgroundColor: "var(--navy)", color: "var(--lime)" }}>
                  Proceed to Payment →
                </button>
              </div>
            </div>
          )}

          {/* ── Payment ── */}
          {bookStep === "payment" && selectedCourtData && (
            <div className="flex flex-col">
              <div className="flex items-center gap-3 px-4 lg:px-6 py-3 sticky top-0 z-10" style={{ backgroundColor: "var(--card)", borderBottom: "1px solid var(--border)" }}>
                <button onClick={() => setBookStep("summary")} className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: "var(--muted)" }}>
                  <ArrowLeft size={16} style={{ color: "var(--foreground)" }} />
                </button>
                <h2 className="font-bold" style={{ color: "var(--foreground)", fontSize: 16 }}>Payment</h2>
                <div className="ml-auto flex items-center gap-1.5 text-xs" style={{ color: "var(--muted-foreground)" }}><Shield size={12} style={{ color: "var(--navy)" }} /> Secure</div>
              </div>
              <div className="px-4 lg:px-6 py-4 flex flex-col gap-4">
                <div className="flex items-center justify-between px-5 py-4 rounded-2xl" style={{ background: "linear-gradient(135deg, var(--navy) 0%, #162D52 100%)" }}>
                  <div>
                    <p className="text-xs mb-0.5" style={{ color: "rgba(255,255,255,0.5)" }}>Total Amount</p>
                    <p className="font-black" style={{ color: "var(--lime)", fontSize: 28 }}>RM {totalAmount % 1 === 0 ? totalAmount : totalAmount.toFixed(1)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-white">{selectedCourtData.name}</p>
                    <p className="text-xs" style={{ color: "rgba(255,255,255,0.45)" }}>
                      {selectedSlots.length > 0 ? `${to12hLabel(selectedSlots[0])} – ${to12hLabel(slotEnd(selectedSlots[selectedSlots.length - 1]))}` : ""}
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-3 p-1 rounded-2xl gap-1" style={{ backgroundColor: "var(--muted)" }}>
                  {([["upi", Smartphone, "UPI"], ["card", CreditCard, "Card"], ["wallet", Wallet, "Wallet"]] as const).map(([id, Icon, label]) => (
                    <button key={id} onClick={() => setPayMethodBook(id)} className="flex items-center justify-center gap-2 py-3 rounded-xl text-sm transition-all"
                      style={{ backgroundColor: payMethodBook === id ? "var(--navy)" : "transparent", color: payMethodBook === id ? "var(--lime)" : "var(--muted-foreground)", fontWeight: payMethodBook === id ? 700 : 400 }}>
                      <Icon size={14} /> {label}
                    </button>
                  ))}
                </div>
                {payMethodBook === "upi" && (
                  <div className="p-4 rounded-2xl" style={{ backgroundColor: "var(--card)", border: "1px solid var(--border)" }}>
                    <p className="text-sm font-semibold mb-3" style={{ color: "var(--foreground)" }}>Enter UPI ID</p>
                    <input className="w-full px-4 py-3 rounded-xl text-sm outline-none" style={{ backgroundColor: "var(--input-background)", border: "1px solid var(--border)", color: "var(--foreground)" }}
                      placeholder="yourname@okaxis" value={upiIdBook} onChange={(e) => setUpiIdBook(e.target.value)} />
                    <div className="flex gap-2 mt-3">
                      {["GPay", "PhonePe", "Paytm"].map((app) => (
                        <div key={app} className="flex-1 py-2 rounded-xl text-center text-xs" style={{ backgroundColor: "var(--muted)", color: "var(--muted-foreground)" }}>{app}</div>
                      ))}
                    </div>
                  </div>
                )}
                {payMethodBook === "card" && (
                  <div className="p-4 rounded-2xl flex flex-col gap-3" style={{ backgroundColor: "var(--card)", border: "1px solid var(--border)" }}>
                    <p className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>Card Details</p>
                    <input className="w-full px-4 py-3 rounded-xl text-sm outline-none" style={{ backgroundColor: "var(--input-background)", border: "1px solid var(--border)", color: "var(--foreground)" }}
                      placeholder="Card Number" value={cardNumBook} onChange={(e) => setCardNumBook(e.target.value.replace(/\D/g, "").replace(/(.{4})/g, "$1 ").trim().slice(0, 19))} />
                    <div className="grid grid-cols-2 gap-3">
                      <input className="px-4 py-3 rounded-xl text-sm outline-none" style={{ backgroundColor: "var(--input-background)", border: "1px solid var(--border)", color: "var(--foreground)" }}
                        placeholder="MM/YY" value={cardExpiryBook} onChange={(e) => { const d = e.target.value.replace(/\D/g, "").slice(0, 4); setCardExpiryBook(d.length > 2 ? `${d.slice(0,2)}/${d.slice(2)}` : d); }} />
                      <input className="px-4 py-3 rounded-xl text-sm outline-none" style={{ backgroundColor: "var(--input-background)", border: "1px solid var(--border)", color: "var(--foreground)" }}
                        placeholder="CVV" type="password" maxLength={3} value={cardCvvBook} onChange={(e) => setCardCvvBook(e.target.value.replace(/\D/g, "").slice(0, 3))} />
                    </div>
                  </div>
                )}
                {payMethodBook === "wallet" && (
                  <div className="p-4 rounded-2xl" style={{ backgroundColor: "var(--card)", border: "1px solid var(--border)" }}>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>ShuttleHub Wallet</p>
                        <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>Available balance</p>
                      </div>
                      <span className="font-black" style={{ color: "var(--win-green)", fontSize: 18 }}>RM 540</span>
                    </div>
                  </div>
                )}
              </div>
              <div className="sticky bottom-[72px] lg:bottom-0 px-4 lg:px-6 pb-4 pt-3" style={{ backgroundColor: "var(--background)", borderTop: "1px solid var(--border)" }}>
                <button onClick={() => {
                  setBookStep("processing");
                  const id = makeBookingId();
                  setTimeout(() => {
                    setBookingId(id);
                    setBookStep("confirmation");
                    setConfirmedBooking({ courtId: selectedCourt!, slots: selectedSlots, date: DATES[dateIndex]?.full ?? selectedDate, bookingId: id });
                  }, 1800);
                }} className="w-full py-4 rounded-2xl text-sm font-bold flex items-center justify-center gap-2" style={{ backgroundColor: "var(--navy)", color: "var(--lime)" }}>
                  <Shield size={14} /> Pay Now — RM {totalAmount % 1 === 0 ? totalAmount : totalAmount.toFixed(1)}
                </button>
              </div>
            </div>
          )}

          {/* ── Processing ── */}
          {bookStep === "processing" && (
            <div className="flex flex-col items-center justify-center py-24 gap-5 px-6">
              <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ backgroundColor: "rgba(11,31,58,0.06)" }}>
                <div className="w-8 h-8 rounded-full border-4 border-t-transparent animate-spin" style={{ borderColor: `var(--navy) var(--navy) var(--navy) transparent` }} />
              </div>
              <div className="text-center">
                <p className="font-bold" style={{ color: "var(--foreground)" }}>Processing Payment…</p>
                <p className="text-sm mt-1" style={{ color: "var(--muted-foreground)" }}>Please do not close this screen</p>
              </div>
            </div>
          )}

          {/* ── Confirmation ── */}
          {bookStep === "confirmation" && selectedCourtData && selectedSlots.length > 0 && (
            <div className="flex flex-col">
              <div className="px-4 lg:px-6 pt-8 pb-6 flex flex-col items-center text-center" style={{ background: "linear-gradient(135deg, var(--navy) 0%, #162D52 100%)" }}>
                <div className="w-20 h-20 rounded-full flex items-center justify-center mb-4" style={{ backgroundColor: "rgba(167,255,63,0.12)", border: "2px solid rgba(167,255,63,0.35)" }}>
                  <CheckCircle size={40} style={{ color: "var(--lime)" }} strokeWidth={1.5} />
                </div>
                <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: "var(--lime)" }}>Booking Confirmed</p>
                <h2 className="text-white font-black mb-1" style={{ fontSize: 22 }}>Court Booked! 🏸</h2>
                <p className="text-sm" style={{ color: "rgba(255,255,255,0.5)" }}>Your booking is confirmed</p>
              </div>
              <div className="px-4 lg:px-6 py-4 flex flex-col gap-4">
                <div className="flex items-center justify-between px-5 py-4 rounded-2xl" style={{ backgroundColor: "rgba(11,31,58,0.05)", border: "1.5px solid rgba(11,31,58,0.12)" }}>
                  <div>
                    <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>Booking ID</p>
                    <p className="font-black tracking-widest" style={{ color: "var(--navy)", fontSize: 18 }}>#{bookingId}</p>
                  </div>
                  <div className="px-3 py-1.5 rounded-xl" style={{ backgroundColor: "rgba(16,185,129,0.1)" }}>
                    <span className="text-xs font-bold" style={{ color: "var(--win-green)" }}>✓ Paid</span>
                  </div>
                </div>
                <div className="p-4 rounded-2xl" style={{ backgroundColor: "var(--card)", border: "1px solid var(--border)" }}>
                  <div className="flex gap-3 mb-4 pb-4" style={{ borderBottom: "1px solid var(--border)" }}>
                    <img src={selectedCourtData.image} alt={selectedCourtData.name} className="w-14 h-14 rounded-xl object-cover flex-shrink-0" />
                    <div>
                      <p className="font-bold" style={{ color: "var(--foreground)" }}>{selectedCourtData.name}</p>
                      <p className="text-xs mt-0.5" style={{ color: "var(--muted-foreground)" }}>{selectedCourtData.location}</p>
                    </div>
                  </div>
                  {[
                    ["Date", DATES[dateIndex] ? `${DATES[dateIndex].day}, ${DATES[dateIndex].date} ${DATES[dateIndex].month} 2026` : selectedDate],
                    ["Time", `${to12hLabel(selectedSlots[0])} – ${to12hLabel(slotEnd(selectedSlots[selectedSlots.length - 1]))}`],
                    ["Duration", formatDuration(selectedSlots.length)],
                    ["Courts", `${numCourts}`],
                    ["Amount Paid", `RM ${totalAmount % 1 === 0 ? totalAmount : totalAmount.toFixed(1)}`],
                  ].map(([k, v]) => (
                    <div key={k} className="flex justify-between py-2.5" style={{ borderBottom: "1px solid var(--border)" }}>
                      <span className="text-sm" style={{ color: "var(--muted-foreground)" }}>{k}</span>
                      <span className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>{v}</span>
                    </div>
                  ))}
                </div>
                <div className="flex flex-col gap-3">
                  <button onClick={() => { setSubTab("host"); setHostJoinTab("host"); setBookStep(null); }} className="w-full py-4 rounded-2xl text-sm font-bold" style={{ backgroundColor: "var(--navy)", color: "var(--lime)" }}>
                    🏸 Host a Match
                  </button>
                  <button onClick={() => { setSubTab("find"); setBookStep(null); }} className="w-full py-4 rounded-2xl text-sm font-semibold" style={{ backgroundColor: "var(--muted)", color: "var(--foreground)", border: "1px solid var(--border)" }}>
                    👥 Challenge a Friend
                  </button>
                  <button onClick={() => { setBookStep(null); setSelectedCourt(null); setSelectedSlots([]); }} className="w-full py-3 text-sm" style={{ color: "var(--muted-foreground)" }}>
                    Back to Court Listing
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ════ FIND PLAYERS ════ */}
      {subTab === "find" && (
        <div className="px-4 lg:px-6 py-4 flex flex-col gap-4">
          <div className="flex items-center gap-3 px-4 py-3 rounded-2xl" style={{ backgroundColor: "var(--card)", border: "1.5px solid var(--border)" }}>
            <Search size={16} style={{ color: "var(--muted-foreground)" }} strokeWidth={2} />
            <input placeholder="Search players by name…" value={playerSearch} onChange={(e) => setPlayerSearch(e.target.value)} className="bg-transparent outline-none flex-1 text-sm" style={{ color: "var(--foreground)" }} />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-0.5">
            {["All", "Beginner", "Intermediate", "Advanced", "Elite"].map((l) => (
              <button key={l} onClick={() => setLevelFilter(l)} className="flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all"
                style={{ backgroundColor: levelFilter === l ? "var(--navy)" : "var(--card)", color: levelFilter === l ? "var(--lime)" : "var(--foreground)", border: `1.5px solid ${levelFilter === l ? "transparent" : "var(--border)"}`, fontWeight: levelFilter === l ? 700 : 400 }}>
                {l}
              </button>
            ))}
          </div>
          <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>{filteredPlayers.length} players found</p>
          <div className="flex flex-col gap-3">
            {filteredPlayers.map((player) => (
              <div key={player.id} className="p-4 rounded-2xl" style={{ backgroundColor: "var(--card)", border: "1px solid var(--border)", boxShadow: "0 1px 6px rgba(0,0,0,0.04)" }}>
                <div className="flex items-center gap-3 mb-3">
                  <div className="relative flex-shrink-0">
                    <img src={player.image} alt={player.name} className="w-14 h-14 rounded-2xl object-cover" />
                    {player.verified && (
                      <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center" style={{ backgroundColor: "#3B82F6", border: "2px solid var(--card)" }}>
                        <BadgeCheck size={10} color="#fff" strokeWidth={2.5} />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-bold" style={{ color: "var(--foreground)", fontSize: 15 }}>{player.name}</p>
                      <span className="text-xs px-2 py-0.5 rounded font-bold" style={{ backgroundColor: "rgba(11,31,58,0.08)", color: "var(--navy)" }}>#{player.rank}</span>
                    </div>
                    <p className="text-xs mt-0.5" style={{ color: "var(--muted-foreground)" }}>{player.playerId}</p>
                    <span className="inline-block text-xs px-2 py-0.5 rounded-md mt-1 font-medium" style={{ backgroundColor: `${levelColors[player.level]}15`, color: levelColors[player.level] }}>{player.level}</span>
                  </div>
                  <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: player.available ? "var(--win-green)" : "var(--muted-foreground)" }} />
                </div>
                <div className="flex items-center justify-around py-2.5 mb-3 rounded-xl" style={{ backgroundColor: "var(--background)" }}>
                  {[["Matches", player.matches], ["Wins", player.wins], ["Win %", `${player.winRate}%`]].map(([l, v]) => (
                    <div key={String(l)} className="text-center">
                      <p className="font-bold" style={{ color: "var(--foreground)", fontSize: 15 }}>{v}</p>
                      <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>{l}</p>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setViewProfilePlayer(player)} className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all" style={{ backgroundColor: "var(--muted)", color: "var(--foreground)", border: "1px solid var(--border)" }}>View Profile</button>
                  <button onClick={() => handleChallengeClick(player)} className="flex-1 py-2.5 rounded-xl text-sm font-bold transition-all" style={{ backgroundColor: player.available ? "var(--navy)" : "var(--muted)", color: player.available ? "#fff" : "var(--muted-foreground)" }}>
                    {player.available ? "Challenge" : "Unavailable"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ════ HOST / JOIN ════ */}
      {subTab === "host" && (
        <div className="flex flex-col">
          <div className="px-4 lg:px-6 pt-4">
            <div className="grid grid-cols-2 p-1 rounded-2xl" style={{ backgroundColor: "var(--muted)", border: "1px solid var(--border)" }}>
              {(["join", "host"] as const).map((t) => (
                <button key={t} onClick={() => setHostJoinTab(t)} className="py-3 rounded-xl text-sm font-bold transition-all capitalize"
                  style={{ backgroundColor: hostJoinTab === t ? "var(--navy)" : "transparent", color: hostJoinTab === t ? "var(--lime)" : "var(--muted-foreground)" }}>
                  {t === "host" ? "HOST" : "JOIN"}
                </button>
              ))}
            </div>
          </div>

          {/* ── JOIN ── */}
          {hostJoinTab === "join" && (
            <div className="px-4 lg:px-6 py-4 flex flex-col gap-4">
              <div className="flex gap-2 overflow-x-auto pb-0.5">
                {["All", "Singles", "Doubles", "Mixed Doubles"].map((f) => (
                  <button key={f} onClick={() => setMatchFilter(f)} className="flex-shrink-0 px-4 py-1.5 rounded-full text-xs font-medium transition-all"
                    style={{ backgroundColor: matchFilter === f ? "var(--navy)" : "var(--card)", color: matchFilter === f ? "var(--lime)" : "var(--foreground)", border: `1px solid ${matchFilter === f ? "transparent" : "var(--border)"}` }}>
                    {f}
                  </button>
                ))}
              </div>
              <div className="flex flex-col gap-3">
                {filteredMatches.map((match) => (
                  <div key={match.id} className="p-4 rounded-2xl" style={{ backgroundColor: "var(--card)", border: "1px solid var(--border)", boxShadow: "0 1px 6px rgba(0,0,0,0.04)" }}>
                    <div className="flex items-center gap-3 mb-3">
                      <img src={match.hostImage} alt={match.host} className="w-10 h-10 rounded-xl object-cover flex-shrink-0" style={{ border: "2px solid var(--lime)" }} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold truncate" style={{ color: "var(--foreground)" }}>{match.host}</p>
                        <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>Rank #{match.rank} · {match.level}</p>
                      </div>
                      <span className="text-xs font-bold px-2.5 py-1 rounded-lg flex-shrink-0" style={{ backgroundColor: statusColors[match.status]?.bg, color: statusColors[match.status]?.text }}>
                        {match.status}
                      </span>
                    </div>
                    <div className="flex flex-col gap-1.5 mb-3">
                      <div className="flex items-center gap-1.5 text-xs" style={{ color: "var(--muted-foreground)" }}><MapPin size={11} /> <span className="truncate">{match.venue}</span></div>
                      <div className="flex items-center gap-4 text-xs" style={{ color: "var(--muted-foreground)" }}>
                        <span className="flex items-center gap-1"><Clock size={11} /> {match.date} · {match.time}</span>
                        <span className="px-2 py-0.5 rounded" style={{ backgroundColor: "var(--muted)", color: "var(--foreground)" }}>{match.format}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mb-3">
                      <div className="flex gap-1 flex-1">
                        {Array.from({ length: match.totalSlots }).map((_, i) => (
                          <div key={i} className="flex-1 h-1.5 rounded-full" style={{ backgroundColor: i < match.filledSlots ? "var(--navy)" : "var(--muted)" }} />
                        ))}
                      </div>
                      <span className="text-xs flex-shrink-0 font-medium" style={{ color: match.filledSlots === match.totalSlots ? "var(--live-red)" : "var(--win-green)" }}>
                        {match.totalSlots - match.filledSlots} slot{match.totalSlots - match.filledSlots !== 1 ? "s" : ""} left
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => setViewMatch(match)} className="flex-1 py-2.5 rounded-xl text-sm font-bold transition-all"
                        style={{ backgroundColor: match.filledSlots < match.totalSlots ? "var(--navy)" : "var(--muted)", color: match.filledSlots < match.totalSlots ? "#fff" : "var(--muted-foreground)" }}>
                        {match.filledSlots < match.totalSlots ? "Join Match" : "Match Full"}
                      </button>
                      <button onClick={() => setViewMatch(match)} className="px-4 py-2.5 rounded-xl text-sm font-medium" style={{ backgroundColor: "var(--muted)", color: "var(--foreground)" }}>Details</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── HOST ── */}
          {hostJoinTab === "host" && (
            <div className="px-4 lg:px-6 py-4 flex flex-col gap-4">
              {publishedMatch && (
                <div className="flex items-center gap-3 p-4 rounded-2xl" style={{ backgroundColor: "rgba(16,185,129,0.08)", border: "1.5px solid rgba(16,185,129,0.25)" }}>
                  <CheckCircle size={18} style={{ color: "var(--win-green)", flexShrink: 0 }} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>Match published successfully!</p>
                    <p className="text-xs mt-0.5" style={{ color: "var(--muted-foreground)" }}>Players can now find and join your match.</p>
                  </div>
                  <button onClick={() => setPublishedMatch(false)}><X size={14} style={{ color: "var(--muted-foreground)" }} /></button>
                </div>
              )}

              <div>
                <p className="text-sm font-semibold mb-3" style={{ color: "var(--foreground)" }}>Your Hosted Matches</p>
                {!publishedMatch ? (
                  <div className="flex flex-col items-center justify-center py-10 gap-3 rounded-2xl" style={{ backgroundColor: "var(--card)", border: "1px dashed var(--border)" }}>
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ backgroundColor: "var(--muted)" }}>
                      <Swords size={22} style={{ color: "var(--muted-foreground)" }} />
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>No hosted matches yet</p>
                      <p className="text-xs mt-1 leading-relaxed px-6" style={{ color: "var(--muted-foreground)" }}>Book a court and host a match</p>
                    </div>
                  </div>
                ) : (
                  confirmedCourtData && confirmedBooking && (
                    /* Clickable hosted match card with chevron */
                    <button onClick={() => setViewHostedMatchDetails(true)} className="w-full text-left p-4 rounded-2xl transition-all hover:scale-[1.01]"
                      style={{ backgroundColor: "var(--card)", border: "1px solid var(--border)" }}>
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-bold px-2.5 py-1 rounded-lg" style={{ backgroundColor: "rgba(16,185,129,0.12)", color: "#10B981" }}>Open</span>
                        <div className="flex items-center gap-2">
                          <span className="text-xs" style={{ color: "var(--muted-foreground)" }}>2 slots left</span>
                          <ChevronRight size={14} style={{ color: "var(--muted-foreground)" }} />
                        </div>
                      </div>
                      <div className="flex items-center gap-2 mb-1.5">
                        <MapPin size={12} style={{ color: "var(--muted-foreground)" }} />
                        <span className="text-sm font-semibold truncate" style={{ color: "var(--foreground)" }}>{confirmedCourtData.name}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs" style={{ color: "var(--muted-foreground)" }}>
                        <Clock size={11} />
                        <span>{confirmedDateLabel} · {confirmedTimeRange}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-2 text-xs" style={{ color: "var(--muted-foreground)" }}>
                        <Swords size={11} />
                        <span>{publishedMatchFormat}</span>
                        <span>·</span>
                        <Users size={11} />
                        <span>{joinedPlayers.length}/4 joined</span>
                      </div>
                    </button>
                  )
                )}
              </div>

              {hasCourtyBooking && confirmedCourtData && !publishedMatch && (
                <div className="p-4 rounded-2xl" style={{ backgroundColor: "var(--card)", border: "1px solid var(--border)" }}>
                  <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: "var(--muted-foreground)" }}>Your Booked Court</p>
                  <div className="flex gap-3 items-center">
                    <img src={confirmedCourtData.image} alt={confirmedCourtData.name} className="w-14 h-14 rounded-xl object-cover flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold truncate" style={{ color: "var(--foreground)" }}>{confirmedCourtData.name}</p>
                      <div className="flex items-center gap-1 mt-0.5"><Calendar size={11} style={{ color: "var(--muted-foreground)" }} /><span className="text-xs truncate" style={{ color: "var(--muted-foreground)" }}>{confirmedDateLabel}</span></div>
                      <div className="flex items-center gap-1 mt-0.5"><Clock size={11} style={{ color: "var(--muted-foreground)" }} /><span className="text-xs" style={{ color: "var(--muted-foreground)" }}>{confirmedTimeRange}</span></div>
                    </div>
                    <div className="px-2.5 py-1 rounded-lg flex-shrink-0" style={{ backgroundColor: "rgba(16,185,129,0.1)" }}>
                      <span className="text-xs font-bold" style={{ color: "var(--win-green)" }}>✓ Booked</span>
                    </div>
                  </div>
                </div>
              )}

              <button onClick={handleHostClick} className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl text-sm font-bold"
                style={{ backgroundColor: hasCourtyBooking ? "var(--lime)" : "var(--navy)", color: hasCourtyBooking ? "var(--navy)" : "var(--lime)" }}>
                <Plus size={16} /> Host a Match
              </button>

              {!hasCourtyBooking && (
                <p className="text-center text-xs" style={{ color: "var(--muted-foreground)" }}>
                  You need an active court booking to host a match.{" "}
                  <button onClick={() => setSubTab("book")} className="font-semibold underline" style={{ color: "var(--navy)" }}>Book a court</button>
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {/* ════ TRAIN ════ */}
      {subTab === "train" && !selectedCoach && (
        <div className="p-4 lg:p-6 flex flex-col gap-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold" style={{ color: "var(--foreground)" }}>Find a Coach</h2>
              <p className="text-sm mt-0.5" style={{ color: "var(--muted-foreground)" }}>Certified badminton coaches from top academies near you</p>
            </div>
            <div className="flex gap-2 flex-wrap">
              {["All", "Beginner", "Intermediate", "Advanced", "Elite"].map((f) => (
                <button key={f} onClick={() => setCoachFilter(f)} className="px-3 py-1.5 rounded-xl text-xs transition-all"
                  style={{ backgroundColor: coachFilter === f ? "var(--navy)" : "var(--card)", color: coachFilter === f ? "#fff" : "var(--foreground)", border: `1px solid ${coachFilter === f ? "transparent" : "var(--border)"}`, fontWeight: coachFilter === f ? 600 : 400 }}>
                  {f}
                </button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {(coachFilter === "All" ? coaches : coaches.filter((c) => c.level.includes(coachFilter))).map((coach) => (
              <div key={coach.id} className="rounded-2xl overflow-hidden cursor-pointer hover:scale-[1.01] transition-all"
                style={{ backgroundColor: "var(--card)", border: "1px solid var(--border)", boxShadow: "0 2px 12px rgba(0,0,0,0.05)" }}
                onClick={() => setSelectedCoach(coach)}>
                <div className="relative" style={{ height: 110 }}>
                  <img src={coach.academyImage} alt={coach.academy} className="w-full h-full object-cover" />
                  <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(11,31,58,0.7) 0%, transparent 60%)" }} />
                  <span className="absolute bottom-3 left-3 text-white text-xs font-semibold">{coach.academy}</span>
                  {!coach.available && <span className="absolute top-3 right-3 text-xs font-bold px-2 py-1 rounded-lg" style={{ backgroundColor: "rgba(0,0,0,0.6)", color: "#fff" }}>Fully Booked</span>}
                </div>
                <div className="p-4">
                  <div className="flex items-start gap-3 mb-3">
                    <img src={coach.image} alt={coach.name} className="w-12 h-12 rounded-2xl object-cover flex-shrink-0" style={{ border: "2px solid var(--lime)", marginTop: -24, position: "relative", zIndex: 1, backgroundColor: "var(--card)" }} />
                    <div className="flex-1 min-w-0 pt-1">
                      <p className="font-bold truncate" style={{ color: "var(--foreground)", fontSize: 15 }}>{coach.name}</p>
                      <div className="flex items-center gap-1 mt-0.5"><MapPin size={11} style={{ color: "var(--muted-foreground)" }} /><span className="text-xs truncate" style={{ color: "var(--muted-foreground)" }}>{coach.location}</span></div>
                    </div>
                    <div className="text-right flex-shrink-0"><p className="font-bold" style={{ color: "var(--navy)", fontSize: 15 }}>RM {coach.sessionRate}</p><p className="text-xs" style={{ color: "var(--muted-foreground)" }}>/ session</p></div>
                  </div>
                  <div className="flex gap-1.5 flex-wrap mb-3">
                    {coach.speciality.map((s) => <span key={s} className="text-xs px-2.5 py-1 rounded-lg" style={{ backgroundColor: "rgba(11,31,58,0.06)", color: "var(--navy)" }}>{s}</span>)}
                  </div>
                  <div className="flex items-center justify-between text-xs mb-4" style={{ color: "var(--muted-foreground)" }}>
                    <div className="flex items-center gap-1"><Star size={11} fill="#F59E0B" stroke="#F59E0B" /><span className="font-medium" style={{ color: "var(--foreground)" }}>{coach.rating}</span><span>({coach.reviews})</span></div>
                    <span>{coach.experience} exp.</span>
                    <span>{coach.students} students</span>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={(e) => { e.stopPropagation(); setSelectedCoach(coach); }} className="flex-1 py-2.5 rounded-xl text-sm font-semibold"
                      style={{ backgroundColor: coach.available ? "var(--navy)" : "var(--muted)", color: coach.available ? "#fff" : "var(--muted-foreground)" }}>
                      {coach.available ? "Book a Session" : "Join Waitlist"}
                    </button>
                    <button onClick={(e) => e.stopPropagation()} className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: "rgba(11,31,58,0.06)", border: "1px solid var(--border)" }}>
                      <Phone size={15} style={{ color: "var(--navy)" }} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* COACH DETAIL */}
      {subTab === "train" && selectedCoach && (
        <div className="p-4 lg:p-6 flex flex-col gap-5">
          <button onClick={() => setSelectedCoach(null)} className="flex items-center gap-2 text-sm w-fit" style={{ color: "var(--muted-foreground)" }}>← Back to Coaches</button>
          <div className="flex flex-col lg:flex-row gap-5">
            <div className="flex-1 flex flex-col gap-5">
              <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid var(--border)" }}>
                <div className="relative" style={{ height: 180 }}>
                  <img src={selectedCoach.academyImage} alt={selectedCoach.academy} className="w-full h-full object-cover" />
                  <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(11,31,58,0.8) 0%, transparent 50%)" }} />
                  <div className="absolute bottom-4 left-4"><p className="text-white text-xs" style={{ opacity: 0.75 }}>{selectedCoach.academy}</p></div>
                </div>
                <div className="p-5">
                  <div className="flex items-start gap-4">
                    <img src={selectedCoach.image} alt={selectedCoach.name} className="w-16 h-16 rounded-2xl object-cover flex-shrink-0"
                      style={{ border: "3px solid var(--lime)", marginTop: -32, backgroundColor: "var(--card)", position: "relative", zIndex: 1 }} />
                    <div className="flex-1 min-w-0">
                      <h2 style={{ fontSize: 20, fontWeight: 700, color: "var(--foreground)" }}>{selectedCoach.name}</h2>
                      <div className="flex items-center gap-1 mt-1"><MapPin size={13} style={{ color: "var(--muted-foreground)" }} /><span className="text-sm" style={{ color: "var(--muted-foreground)" }}>{selectedCoach.location}</span></div>
                    </div>
                    <div className="text-right"><p style={{ fontSize: 22, fontWeight: 800, color: "var(--navy)" }}>RM {selectedCoach.sessionRate}</p><p className="text-xs" style={{ color: "var(--muted-foreground)" }}>per session</p></div>
                  </div>
                  <p className="text-sm mt-4 leading-relaxed" style={{ color: "var(--muted-foreground)" }}>{selectedCoach.bio}</p>
                  <div className="flex flex-wrap gap-2 mt-4">
                    {selectedCoach.speciality.map((s) => <span key={s} className="text-xs px-3 py-1.5 rounded-lg font-medium" style={{ backgroundColor: "rgba(11,31,58,0.06)", color: "var(--navy)" }}>{s}</span>)}
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                {[{ label: "Experience", value: selectedCoach.experience }, { label: "Students", value: `${selectedCoach.students}+` }, { label: "Rating", value: `${selectedCoach.rating} ★` }].map(({ label, value }) => (
                  <div key={label} className="p-4 rounded-2xl text-center" style={{ backgroundColor: "var(--card)", border: "1px solid var(--border)" }}>
                    <p className="font-bold" style={{ color: "var(--navy)", fontSize: 18 }}>{value}</p>
                    <p className="text-xs mt-1" style={{ color: "var(--muted-foreground)" }}>{label}</p>
                  </div>
                ))}
              </div>
              <div className="p-5 rounded-2xl" style={{ backgroundColor: "var(--card)", border: "1px solid var(--border)" }}>
                <h3 className="text-sm font-semibold mb-3 flex items-center gap-2" style={{ color: "var(--foreground)" }}><Award size={15} style={{ color: "var(--navy)" }} /> Certifications</h3>
                {selectedCoach.certifications.map((c) => <div key={c} className="flex items-center gap-2 py-2" style={{ borderBottom: "1px solid var(--border)" }}><span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: "var(--lime-dark)" }} /><span className="text-sm" style={{ color: "var(--foreground)" }}>{c}</span></div>)}
              </div>
              <div className="p-5 rounded-2xl" style={{ backgroundColor: "var(--card)", border: "1px solid var(--border)" }}>
                <h3 className="text-sm font-semibold mb-3 flex items-center gap-2" style={{ color: "var(--foreground)" }}><Clock size={15} style={{ color: "var(--navy)" }} /> Training Schedule</h3>
                {selectedCoach.schedule.map((s) => <div key={s} className="flex items-center gap-2 py-2" style={{ borderBottom: "1px solid var(--border)" }}><span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: "var(--navy)" }} /><span className="text-sm" style={{ color: "var(--foreground)" }}>{s}</span></div>)}
              </div>
            </div>
            <div className="w-full lg:w-[300px] lg:flex-shrink-0 flex flex-col gap-4">
              <div className="p-6 rounded-2xl sticky top-6 flex flex-col gap-4" style={{ background: "linear-gradient(145deg, var(--navy) 0%, #162D52 100%)" }}>
                <p className="text-xs font-bold uppercase tracking-widest" style={{ color: "var(--lime)" }}>{selectedCoach.available ? "Available for Booking" : "Fully Booked"}</p>
                <div><p className="text-white font-bold" style={{ fontSize: 26 }}>RM {selectedCoach.sessionRate}</p><p className="text-sm" style={{ color: "rgba(255,255,255,0.5)" }}>per training session</p></div>
                <button className="w-full py-3.5 rounded-xl text-sm font-bold" style={{ backgroundColor: "var(--lime)", color: "var(--navy)" }}>{selectedCoach.available ? "Book a Session" : "Join Waitlist"}</button>
                <div className="flex gap-2">
                  <button className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium" style={{ backgroundColor: "rgba(255,255,255,0.08)", color: "#fff" }} onClick={() => window.open(`tel:${selectedCoach.phone}`)}>
                    <Phone size={14} /> Call
                  </button>
                  <button className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium" style={{ backgroundColor: "rgba(255,255,255,0.08)", color: "#fff" }}>
                    <MessageCircle size={14} /> Message
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
