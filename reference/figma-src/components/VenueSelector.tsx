import { useState } from 'react'
import { ChevronDown, MapPin, Check } from 'lucide-react'

const venues = [
  { id: 'all', name: 'All Venues' },
  { id: 'v1', name: 'Elite Arena OMR' },
  { id: 'v2', name: 'Elite Arena Velachery' },
  { id: 'v3', name: 'Elite Arena Anna Nagar' },
]

interface VenueSelectorProps {
  selectedVenue: string
  onSelect: (id: string) => void
}

export default function VenueSelector({ selectedVenue, onSelect }: VenueSelectorProps) {
  const [open, setOpen] = useState(false)
  const current = venues.find(v => v.id === selectedVenue) ?? venues[0]

  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          background: '#EFF6FF',
          border: '1px solid #BFDBFE',
          borderRadius: 10,
          padding: '6px 12px',
          cursor: 'pointer',
          maxWidth: 200,
        }}
      >
        <MapPin size={13} color="#2563EB" />
        <span style={{ fontSize: 13, fontWeight: 600, color: '#2563EB', flex: 1, textAlign: 'left', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {current.name}
        </span>
        <ChevronDown size={14} color="#2563EB" style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
      </button>

      {open && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            marginTop: 6,
            background: '#fff',
            borderRadius: 14,
            boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
            border: '1px solid #E2E8F0',
            zIndex: 100,
            minWidth: 220,
            overflow: 'hidden',
          }}
          className="scale-in"
        >
          {venues.map(v => (
            <button
              key={v.id}
              onClick={() => { onSelect(v.id); setOpen(false) }}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                width: '100%',
                padding: '12px 16px',
                background: v.id === selectedVenue ? '#EFF6FF' : 'transparent',
                border: 'none',
                cursor: 'pointer',
                textAlign: 'left',
              }}
            >
              <span style={{ fontSize: 14, fontWeight: v.id === selectedVenue ? 600 : 400, color: v.id === selectedVenue ? '#2563EB' : '#0F172A' }}>
                {v.name}
              </span>
              {v.id === selectedVenue && <Check size={14} color="#2563EB" />}
            </button>
          ))}
        </div>
      )}

      {open && (
        <div
          style={{ position: 'fixed', inset: 0, zIndex: 99 }}
          onClick={() => setOpen(false)}
        />
      )}
    </div>
  )
}
