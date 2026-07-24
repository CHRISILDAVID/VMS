import { useState } from 'react'
import LoginScreen from './screens/LoginScreen'
import ScheduleScreen from './screens/ScheduleScreen'
import BookingsScreen from './screens/BookingsScreen'
import BookingDetailsScreen from './screens/BookingDetailsScreen'
import NewBookingScreen from './screens/NewBookingScreen'
import MembersScreen from './screens/MembersScreen'
import PaymentsScreen from './screens/PaymentsScreen'
import ProfileScreen from './screens/ProfileScreen'
import BottomNav from './components/BottomNav'
import FABMenu from './components/FABMenu'

type Screen =
  | 'login'
  | 'schedule'
  | 'bookings'
  | 'booking-details'
  | 'new-booking'
  | 'members'
  | 'payments'
  | 'profile'

const NAV_TABS = ['schedule', 'bookings', 'members', 'payments', 'profile']

function StatusBar({ light }: { light?: boolean }) {
  const now = new Date()
  const time = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })
  const color = light ? '#fff' : '#0F172A'
  const opacity = light ? '0.9' : '0.8'
  return (
    <div style={{ height: 44, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 20px', position: 'absolute', top: 0, left: 0, right: 0, zIndex: 100 }}>
      <span style={{ fontSize: 13, fontWeight: 700, color }}>{time}</span>
      <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
        {/* Signal bars */}
        <svg width="16" height="12" viewBox="0 0 16 12" fill="none">
          <rect x="0" y="9" width="2" height="3" rx="0.5" fill={color} opacity={opacity} />
          <rect x="3" y="6" width="2" height="6" rx="0.5" fill={color} opacity={opacity} />
          <rect x="6" y="3" width="2" height="9" rx="0.5" fill={color} opacity={opacity} />
          <rect x="9" y="0" width="2" height="12" rx="0.5" fill={color} opacity={opacity} />
        </svg>
        {/* WiFi */}
        <svg width="16" height="12" viewBox="0 0 16 12" fill="none">
          <path d="M8 9.5a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3z" fill={color} opacity={opacity}/>
          <path d="M3.5 6.5C4.9 5.1 6.35 4.4 8 4.4s3.1.7 4.5 2.1" stroke={color} strokeWidth="1.5" strokeLinecap="round" opacity={opacity}/>
          <path d="M1 4C3.1 1.9 5.4 1 8 1s4.9.9 7 3" stroke={color} strokeWidth="1.5" strokeLinecap="round" opacity={opacity}/>
        </svg>
        {/* Battery */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <div style={{ width: 22, height: 11, border: `1.5px solid ${color}`, borderRadius: 3, display: 'flex', alignItems: 'center', padding: '0 2px', opacity: parseFloat(opacity) }}>
            <div style={{ width: 14, height: 7, background: '#16A34A', borderRadius: 1.5 }} />
          </div>
          <div style={{ width: 2, height: 5, background: color, borderRadius: 1, opacity: parseFloat(opacity) }} />
        </div>
      </div>
    </div>
  )
}

export default function App() {
  const [loggedIn, setLoggedIn] = useState(false)
  const [screen, setScreen] = useState<Screen>('schedule')
  const [selectedBookingId, setSelectedBookingId] = useState<string>('BK001')

  const navigate = (s: string) => setScreen(s as Screen)

  const handleBookingSelect = (id: string) => {
    setSelectedBookingId(id)
    setScreen('booking-details')
  }

  const handleFABAction = (action: string) => {
    if (action === 'booking') setScreen('new-booking')
  }

  const isNavScreen = NAV_TABS.includes(screen)
  const showNav = loggedIn && isNavScreen
  const showFAB = showNav && (screen === 'schedule' || screen === 'bookings')

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)',
        padding: '20px',
      }}
    >
      {/* Phone frame */}
      <div
        style={{
          width: 390,
          height: 844,
          background: '#F8FAFC',
          borderRadius: 48,
          overflow: 'hidden',
          position: 'relative',
          boxShadow: '0 40px 120px rgba(0,0,0,0.6), 0 0 0 12px #1E293B, 0 0 0 14px #334155, inset 0 0 0 1px rgba(255,255,255,0.05)',
          flexShrink: 0,
        }}
      >
        {/* Dynamic island */}
        <div style={{ position: 'absolute', top: 12, left: '50%', transform: 'translateX(-50%)', width: 126, height: 34, background: '#0F172A', borderRadius: 20, zIndex: 200 }} />

        {/* Status bar */}
        <StatusBar light={!loggedIn || screen === 'login'} />

        {/* Screen content */}
        <div
          style={{ position: 'absolute', top: 44, left: 0, right: 0, bottom: 0 }}
          key={screen}
          className="screen-enter"
        >
          {!loggedIn ? (
            <LoginScreen onLogin={() => { setLoggedIn(true); setScreen('schedule') }} />
          ) : screen === 'schedule' ? (
            <ScheduleScreen onNavigate={navigate} />
          ) : screen === 'bookings' ? (
            <BookingsScreen onBookingSelect={handleBookingSelect} onNewBooking={() => navigate('new-booking')} />
          ) : screen === 'booking-details' ? (
            <BookingDetailsScreen bookingId={selectedBookingId} onBack={() => navigate('bookings')} />
          ) : screen === 'new-booking' ? (
            <NewBookingScreen onBack={() => navigate(isNavScreen ? screen : 'schedule')} onComplete={() => navigate('bookings')} />
          ) : screen === 'members' ? (
            <MembersScreen />
          ) : screen === 'payments' ? (
            <PaymentsScreen />
          ) : screen === 'profile' ? (
            <ProfileScreen />
          ) : null}
        </div>

        {/* Bottom navigation */}
        {showNav && (
          <BottomNav
            active={screen}
            onNavigate={navigate}
          />
        )}

        {/* FAB */}
        {showFAB && <FABMenu onAction={handleFABAction} />}

        {/* Home indicator */}
        <div style={{ position: 'absolute', bottom: 8, left: '50%', transform: 'translateX(-50%)', width: 134, height: 5, background: '#0F172A', borderRadius: 3, opacity: 0.2, zIndex: 201 }} />
      </div>
    </div>
  )
}
