import { useState } from 'react'
import { ChevronLeft, ChevronRight, Trophy, Users, ShoppingBag, Megaphone, Check, ArrowRight, Star } from 'lucide-react'

// ─── Promo pages ──────────────────────────────────────────────────────────────
type PromoConfig = {
  id: string
  title: string
  subtitle: string
  heroGradient: string
  heroEmoji: string
  tagline: string
  description: string
  benefits: string[]
  ctaLabel: string
  accentColor: string
  accentLight: string
}

const promos: PromoConfig[] = [
  {
    id: 'organizer',
    title: 'Become an Organizer',
    subtitle: 'Host tournaments and reach more players.',
    heroGradient: 'linear-gradient(145deg, #1D4ED8 0%, #7C3AED 100%)',
    heroEmoji: '🏆',
    tagline: 'Turn your court into a tournament destination',
    description: 'Join hundreds of courts already hosting badminton tournaments on the platform. Automate fixtures, payments, and leaderboards — all from your phone.',
    benefits: [
      'Reach thousands of registered players nearby',
      'Automated draw fixtures and bracket management',
      'Integrated online registrations and payments',
      'Live rankings, scoring, and results',
      'Promoted on the player app automatically',
    ],
    ctaLabel: 'Become an Organizer',
    accentColor: '#7C3AED',
    accentLight: '#F5F3FF',
  },
  {
    id: 'coaches',
    title: 'Add Coaches',
    subtitle: 'Promote your coaching programs to local players.',
    heroGradient: 'linear-gradient(145deg, #0369A1 0%, #2563EB 100%)',
    heroEmoji: '🎓',
    tagline: 'Connect your coaches with eager learners',
    description: "List your coaching staff, slot availability, and training programs. Players actively searching for badminton coaching in your area will discover your court first.",
    benefits: [
      'Create coach profiles with specializations and experience',
      'List coaching slots with pricing and availability',
      'Receive direct enquiries from players in-app',
      'Track session attendance and player progress',
      'Boost court revenue during off-peak hours',
    ],
    ctaLabel: 'Add Coach',
    accentColor: '#2563EB',
    accentLight: '#EFF6FF',
  },
  {
    id: 'shop',
    title: 'Sell Sports Items',
    subtitle: 'Sell badminton equipment directly to your players.',
    heroGradient: 'linear-gradient(145deg, #D97706 0%, #EA580C 100%)',
    heroEmoji: '🛒',
    tagline: 'Your court, your shop — sell to players you already serve',
    description: 'List racquets, shoes, shuttles, grips and accessories for the players already visiting your facility. No logistics hassle — just list, sell, and collect.',
    benefits: [
      'List racquets, footwear, grips, strings and shuttles',
      'Sell directly to your existing customer base',
      'Future: enable in-app ordering and delivery',
      'Manage inventory and stock levels easily',
      'Generate additional revenue from your space',
    ],
    ctaLabel: 'Start Selling',
    accentColor: '#D97706',
    accentLight: '#FFFBEB',
  },
  {
    id: 'events',
    title: 'Promote Events',
    subtitle: 'Promote tournaments, camps and badminton events.',
    heroGradient: 'linear-gradient(145deg, #16A34A 0%, #0891B2 100%)',
    heroEmoji: '📣',
    tagline: 'Fill your events fast with targeted promotion',
    description: 'Promote tournaments, weekend leagues, summer camps, clinics and special activities to a highly targeted audience of badminton players near your court.',
    benefits: [
      'Promote to players within a set kilometre radius',
      'Event pages with rich descriptions and photos',
      'One-tap interest registration for players',
      'Push notifications to nearby players',
      'Track views, clicks, and registrations in real-time',
    ],
    ctaLabel: 'Promote Event',
    accentColor: '#16A34A',
    accentLight: '#F0FDF4',
  },
]

// ─── Promo Page ───────────────────────────────────────────────────────────────
function PromoPage({ config, onBack }: { config: PromoConfig; onBack: () => void }) {
  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: '#F8FAFC' }}>
      {/* Hero */}
      <div style={{ background: config.heroGradient, padding: '0 20px 32px', flexShrink: 0, position: 'relative', overflow: 'hidden' }}>
        {/* Decorative circles */}
        <div style={{ position: 'absolute', top: -60, right: -60, width: 200, height: 200, borderRadius: '50%', background: 'rgba(255,255,255,0.06)' }} />
        <div style={{ position: 'absolute', bottom: -30, left: -30, width: 130, height: 130, borderRadius: '50%', background: 'rgba(255,255,255,0.06)' }} />

        {/* Back button */}
        <button onClick={onBack} style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(255,255,255,0.15)', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', marginBottom: 24, position: 'relative' }}>
          <ChevronLeft size={20} color="#fff" />
        </button>

        {/* Emoji illustration */}
        <div style={{ width: 88, height: 88, borderRadius: 26, background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20, fontSize: 44, border: '2px solid rgba(255,255,255,0.2)' }}>
          {config.heroEmoji}
        </div>

        <div style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.7)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 8 }}>Grow Your Business</div>
        <div style={{ fontSize: 24, fontWeight: 900, color: '#fff', fontFamily: 'Plus Jakarta Sans, sans-serif', lineHeight: 1.2, marginBottom: 10 }}>{config.tagline}</div>
        <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.8)', lineHeight: 1.55 }}>{config.description}</div>
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '24px 20px' }} className="scrollbar-hide">
        {/* Benefits */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 13, fontWeight: 800, color: '#0F172A', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 14 }}>Why it works</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {config.benefits.map((b, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '14px', background: '#fff', borderRadius: 14, border: '1px solid #F1F5F9' }}>
                <div style={{ width: 28, height: 28, borderRadius: 8, background: config.accentLight, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>
                  <Check size={14} color={config.accentColor} />
                </div>
                <span style={{ fontSize: 14, fontWeight: 600, color: '#0F172A', lineHeight: 1.45 }}>{b}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Social proof strip */}
        <div style={{ background: '#fff', borderRadius: 16, padding: '16px', marginBottom: 24, border: '1px solid #F1F5F9', display: 'flex', gap: 14, alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            {['🏸', '🏸', '🏸'].map((e, i) => (
              <div key={i} style={{ width: 30, height: 30, borderRadius: '50%', background: config.accentLight, display: 'flex', alignItems: 'center', justifyContent: 'center', marginLeft: i > 0 ? -8 : 0, border: '2px solid #fff', fontSize: 14 }}>{e}</div>
            ))}
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#0F172A' }}>200+ courts already joined</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
              {[1, 2, 3, 4, 5].map(s => <Star key={s} size={11} color="#F59E0B" fill="#F59E0B" />)}
              <span style={{ fontSize: 11, color: '#64748B', fontWeight: 500 }}> 4.8 average rating</span>
            </div>
          </div>
        </div>

        {/* Free badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px 16px', background: config.accentLight, borderRadius: 14, marginBottom: 100, border: `1px solid ${config.accentColor}22` }}>
          <div style={{ fontSize: 22 }}>🎁</div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: config.accentColor }}>Free to get started</div>
            <div style={{ fontSize: 12, color: '#64748B', marginTop: 2 }}>No setup fees. Get onboarded in minutes.</div>
          </div>
        </div>
      </div>

      {/* Sticky CTA */}
      <div style={{ background: '#fff', padding: '16px 20px 24px', borderTop: '1px solid #F1F5F9', flexShrink: 0 }}>
        <button style={{ width: '100%', padding: '16px', background: config.heroGradient, color: '#fff', border: 'none', borderRadius: 16, fontSize: 16, fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, boxShadow: `0 6px 20px ${config.accentColor}40`, fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
          {config.ctaLabel}
          <ArrowRight size={20} />
        </button>
        <div style={{ textAlign: 'center', marginTop: 10 }}>
          <span style={{ fontSize: 12, color: '#94A3B8' }}>Our team will reach out within 24 hours</span>
        </div>
      </div>
    </div>
  )
}

// ─── Grow Business List ───────────────────────────────────────────────────────
const iconMap: Record<string, React.ComponentType<{ size: number; color: string }>> = {
  organizer: Trophy,
  coaches: Users,
  shop: ShoppingBag,
  events: Megaphone,
}

const gradients: Record<string, string> = {
  organizer: 'linear-gradient(135deg, #1D4ED8, #7C3AED)',
  coaches: 'linear-gradient(135deg, #0369A1, #2563EB)',
  shop: 'linear-gradient(135deg, #D97706, #EA580C)',
  events: 'linear-gradient(135deg, #16A34A, #0891B2)',
}

interface Props { onBack: () => void }

export default function GrowBusinessScreen({ onBack }: Props) {
  const [activePromo, setActivePromo] = useState<string | null>(null)

  const config = promos.find(p => p.id === activePromo)
  if (config) return <PromoPage config={config} onBack={() => setActivePromo(null)} />

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: '#F8FAFC' }}>
      {/* Header */}
      <div style={{ background: '#fff', padding: '0 16px 16px', borderBottom: '1px solid #F1F5F9', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button onClick={onBack} style={{ width: 36, height: 36, borderRadius: 10, background: '#F8FAFC', border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <ChevronLeft size={20} color="#0F172A" />
          </button>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 18, fontWeight: 800, color: '#0F172A', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>Grow Your Business</div>
            <div style={{ fontSize: 12, color: '#64748B', fontWeight: 500, marginTop: 1 }}>Expand your court's potential</div>
          </div>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }} className="scrollbar-hide">
        {/* Intro banner */}
        <div style={{ background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)', borderRadius: 20, padding: '20px', marginBottom: 20, position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: -30, right: -30, width: 120, height: 120, borderRadius: '50%', background: 'rgba(37,99,235,0.2)' }} />
          <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>Platform Opportunity</div>
          <div style={{ fontSize: 20, fontWeight: 900, color: '#fff', fontFamily: 'Plus Jakarta Sans, sans-serif', lineHeight: 1.25, marginBottom: 8 }}>More ways to earn from your court</div>
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.65)', lineHeight: 1.5 }}>Unlock new revenue streams beyond hourly bookings. Tap an opportunity below to learn more.</div>
        </div>

        {/* Cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 88 }}>
          {promos.map(p => {
            const Icon = iconMap[p.id]
            return (
              <button key={p.id} onClick={() => setActivePromo(p.id)}
                style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '18px 16px', background: '#fff', borderRadius: 18, border: '1px solid #F1F5F9', cursor: 'pointer', textAlign: 'left', width: '100%' }}>
                <div style={{ width: 52, height: 52, borderRadius: 16, background: gradients[p.id], display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: `0 4px 12px ${p.accentColor}30` }}>
                  <Icon size={24} color="#fff" />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 15, fontWeight: 800, color: '#0F172A', fontFamily: 'Plus Jakarta Sans, sans-serif', marginBottom: 4 }}>{p.title}</div>
                  <div style={{ fontSize: 12, color: '#64748B', lineHeight: 1.4 }}>{p.subtitle}</div>
                </div>
                <div style={{ width: 32, height: 32, borderRadius: 10, background: '#F8FAFC', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <ChevronRight size={16} color="#94A3B8" />
                </div>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
