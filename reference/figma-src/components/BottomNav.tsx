import { Calendar, BookOpen, Users, CreditCard, User } from 'lucide-react'

const tabs = [
  { id: 'schedule', label: 'Schedule', icon: Calendar },
  { id: 'bookings', label: 'Bookings', icon: BookOpen },
  { id: 'members', label: 'Members', icon: Users },
  { id: 'payments', label: 'Payments', icon: CreditCard },
  { id: 'profile', label: 'Profile', icon: User },
]

interface BottomNavProps {
  active: string
  onNavigate: (screen: string) => void
}

export default function BottomNav({ active, onNavigate }: BottomNavProps) {
  return (
    <div
      style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        background: '#fff',
        borderTop: '1px solid #E2E8F0',
        display: 'flex',
        height: 72,
        paddingBottom: 8,
        zIndex: 50,
      }}
    >
      {tabs.map(tab => {
        const Icon = tab.icon
        const isActive = active === tab.id
        return (
          <button
            key={tab.id}
            onClick={() => onNavigate(tab.id)}
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 3,
              border: 'none',
              background: 'transparent',
              cursor: 'pointer',
              padding: '8px 0',
            }}
          >
            <div
              style={{
                width: 48,
                height: 32,
                borderRadius: 16,
                background: isActive ? '#EFF6FF' : 'transparent',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'background 0.2s',
              }}
            >
              <Icon size={22} color={isActive ? '#2563EB' : '#94A3B8'} strokeWidth={isActive ? 2.5 : 1.8} />
            </div>
            <span style={{ fontSize: 10, fontWeight: isActive ? 700 : 400, color: isActive ? '#2563EB' : '#94A3B8', letterSpacing: '0.01em' }}>
              {tab.label}
            </span>
          </button>
        )
      })}
    </div>
  )
}
