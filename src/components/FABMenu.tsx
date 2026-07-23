import { useState } from 'react'
import { Plus, X, CalendarPlus, Ban, Trophy, GraduationCap, Wrench, CreditCard } from 'lucide-react'

const actions = [
  { id: 'booking', label: 'New Booking', icon: CalendarPlus, color: '#2563EB' },
  { id: 'block', label: 'Block Slot', icon: Ban, color: '#DC2626' },
  { id: 'tournament', label: 'Tournament', icon: Trophy, color: '#7C3AED' },
  { id: 'coaching', label: 'Coaching', icon: GraduationCap, color: '#D97706' },
  { id: 'maintenance', label: 'Maintenance', icon: Wrench, color: '#64748B' },
  { id: 'membership', label: 'Membership', icon: CreditCard, color: '#16A34A' },
]

interface FABMenuProps {
  onAction: (action: string) => void
}

export default function FABMenu({ onAction }: FABMenuProps) {
  const [open, setOpen] = useState(false)

  return (
    <>
      {open && (
        <div
          style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 58 }}
          className="fade-in"
          onClick={() => setOpen(false)}
        />
      )}

      <div style={{ position: 'absolute', bottom: 84, right: 20, zIndex: 59, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 12 }}>
        {open && actions.map((action, i) => {
          const Icon = action.icon
          return (
            <div
              key={action.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                animation: `slideUp 0.2s cubic-bezier(0.4,0,0.2,1) ${i * 0.04}s both`,
              }}
            >
              <span style={{
                background: '#fff',
                color: '#0F172A',
                fontSize: 13,
                fontWeight: 600,
                padding: '6px 14px',
                borderRadius: 20,
                boxShadow: '0 2px 12px rgba(0,0,0,0.12)',
                whiteSpace: 'nowrap',
              }}>
                {action.label}
              </span>
              <button
                onClick={() => { setOpen(false); onAction(action.id) }}
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 22,
                  background: action.color,
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
                }}
              >
                <Icon size={20} color="#fff" />
              </button>
            </div>
          )
        })}

        <button
          onClick={() => setOpen(!open)}
          style={{
            width: 56,
            height: 56,
            borderRadius: 16,
            background: '#2563EB',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 20px rgba(37,99,235,0.4)',
            transition: 'transform 0.2s',
          }}
        >
          {open ? <X size={24} color="#fff" /> : <Plus size={24} color="#fff" />}
        </button>
      </div>
    </>
  )
}
