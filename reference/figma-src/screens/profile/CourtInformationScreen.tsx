import { useState } from 'react'
import {
  ChevronLeft, Edit2, MapPin, Phone, Mail, Wifi, ParkingSquare,
  ShowerHead, Coffee, Camera, Plus, X, Check,
} from 'lucide-react'

const amenityList = [
  { icon: Wifi,         label: 'Free Wi-Fi' },
  { icon: ParkingSquare,label: 'Parking' },
  { icon: ShowerHead,   label: 'Changing Room' },
  { icon: Coffee,       label: 'Cafeteria' },
]

const courtPhotos = [
  'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=400&h=260&fit=crop&auto=format',
  'https://images.unsplash.com/photo-1599474924187-334a4ae5bd3c?w=400&h=260&fit=crop&auto=format',
  'https://images.unsplash.com/photo-1640505793546-5b4ad735cdff?w=400&h=260&fit=crop&auto=format',
]

const InfoRow = ({ label, value, icon: Icon }: { label: string; value: string; icon?: React.ComponentType<{ size: number; color: string }> }) => (
  <div style={{ padding: '13px 0', borderBottom: '1px solid #F8FAFC', display: 'flex', alignItems: 'flex-start', gap: 12 }}>
    {Icon && (
      <div style={{ width: 32, height: 32, borderRadius: 9, background: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>
        <Icon size={15} color="#2563EB" />
      </div>
    )}
    <div style={{ flex: 1 }}>
      <div style={{ fontSize: 11, fontWeight: 600, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 3 }}>{label}</div>
      <div style={{ fontSize: 14, fontWeight: 600, color: '#0F172A', lineHeight: 1.4 }}>{value}</div>
    </div>
  </div>
)

interface Props { onBack: () => void }

export default function CourtInformationScreen({ onBack }: Props) {
  const [editing, setEditing] = useState(false)
  const [name, setName]     = useState('Elite Arena Badminton')
  const [address, setAddress] = useState('42, OMR Bypass Road, Perungudi, Chennai – 600096')
  const [phone, setPhone]   = useState('+91 98765 43210')
  const [email, setEmail]   = useState('info@elitearena.in')
  const [courtCount, setCourtCount] = useState('6')
  const [courtType, setCourtType]   = useState('Synthetic Mat + Wooden')
  const [amenities, setAmenities]   = useState(['Free Wi-Fi', 'Parking', 'Changing Room'])

  const toggleAmenity = (a: string) =>
    setAmenities(prev => prev.includes(a) ? prev.filter(x => x !== a) : [...prev, a])

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: '#F8FAFC' }}>
      {/* Header */}
      <div style={{ background: '#fff', padding: '0 16px 14px', borderBottom: '1px solid #F1F5F9', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button onClick={onBack} style={{ width: 36, height: 36, borderRadius: 10, background: '#F8FAFC', border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <ChevronLeft size={20} color="#0F172A" />
          </button>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 18, fontWeight: 800, color: '#0F172A', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>Court Information</div>
          </div>
          <button
            onClick={() => setEditing(!editing)}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 12, border: `1.5px solid ${editing ? '#16A34A' : '#2563EB'}`, background: editing ? '#F0FDF4' : '#EFF6FF', cursor: 'pointer' }}
          >
            {editing ? <Check size={15} color="#16A34A" /> : <Edit2 size={15} color="#2563EB" />}
            <span style={{ fontSize: 13, fontWeight: 700, color: editing ? '#16A34A' : '#2563EB' }}>{editing ? 'Save' : 'Edit'}</span>
          </button>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }} className="scrollbar-hide">
        {/* Photos */}
        <div style={{ background: '#fff', borderRadius: 18, overflow: 'hidden', marginBottom: 14, border: '1px solid #F1F5F9' }}>
          <div style={{ overflowX: 'auto', display: 'flex', gap: 2 }} className="scrollbar-hide">
            {courtPhotos.map((url, i) => (
              <div key={i} style={{ flexShrink: 0, width: 200, height: 130, background: '#F1F5F9', position: 'relative' }}>
                <img src={url} alt={`Court ${i + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
            ))}
            {editing && (
              <div style={{ flexShrink: 0, width: 100, height: 130, background: '#F8FAFC', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6, cursor: 'pointer', border: '2px dashed #CBD5E1' }}>
                <Camera size={20} color="#94A3B8" />
                <span style={{ fontSize: 11, fontWeight: 600, color: '#94A3B8' }}>Add Photo</span>
              </div>
            )}
          </div>
          <div style={{ padding: '10px 14px 4px', display: 'flex', gap: 6, alignItems: 'center' }}>
            <Camera size={13} color="#94A3B8" />
            <span style={{ fontSize: 11, color: '#94A3B8', fontWeight: 500 }}>{courtPhotos.length} photos · Swipe to view</span>
          </div>
        </div>

        {/* Basic Info */}
        <div style={{ background: '#fff', borderRadius: 18, padding: '16px', marginBottom: 14, border: '1px solid #F1F5F9' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 4 }}>Basic Details</div>
          {editing ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, paddingTop: 12 }}>
              {[
                { label: 'Court Name', val: name, set: setName },
                { label: 'Address', val: address, set: setAddress, multi: true },
                { label: 'Phone', val: phone, set: setPhone },
                { label: 'Email', val: email, set: setEmail },
                { label: 'Number of Courts', val: courtCount, set: setCourtCount, type: 'number' },
                { label: 'Court Type', val: courtType, set: setCourtType },
              ].map(f => (
                <div key={f.label}>
                  <label style={{ fontSize: 11, fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: 6 }}>{f.label}</label>
                  {f.multi ? (
                    <textarea value={f.val} onChange={e => f.set(e.target.value)} rows={2}
                      style={{ width: '100%', padding: '10px 12px', border: '1.5px solid #E2E8F0', borderRadius: 10, fontSize: 13, fontWeight: 500, color: '#0F172A', background: '#F8FAFC', outline: 'none', resize: 'none', lineHeight: 1.5, boxSizing: 'border-box' }} />
                  ) : (
                    <input type={f.type ?? 'text'} value={f.val} onChange={e => f.set(e.target.value)}
                      style={{ width: '100%', padding: '10px 12px', border: '1.5px solid #E2E8F0', borderRadius: 10, fontSize: 13, fontWeight: 500, color: '#0F172A', background: '#F8FAFC', outline: 'none', boxSizing: 'border-box' }} />
                  )}
                </div>
              ))}
            </div>
          ) : (
            <>
              <InfoRow label="Court Name" value={name} />
              <InfoRow label="Address" value={address} icon={MapPin} />
              <InfoRow label="Phone" value={phone} icon={Phone} />
              <InfoRow label="Email" value={email} icon={Mail} />
              <InfoRow label="Number of Courts" value={courtCount} />
              <InfoRow label="Court Type" value={courtType} />
            </>
          )}
        </div>

        {/* Google Maps placeholder */}
        <div style={{ background: '#fff', borderRadius: 18, overflow: 'hidden', marginBottom: 14, border: '1px solid #F1F5F9' }}>
          <div style={{ padding: '14px 16px 10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#0F172A' }}>Location</div>
            {editing && <button style={{ fontSize: 12, fontWeight: 600, color: '#2563EB', background: 'none', border: 'none', cursor: 'pointer' }}>Edit Pin</button>}
          </div>
          <div style={{ height: 140, background: 'linear-gradient(135deg, #E0F2FE 0%, #DBEAFE 100%)', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {/* Stylised map placeholder */}
            <div style={{ position: 'absolute', inset: 0, opacity: 0.3, backgroundImage: 'linear-gradient(#CBD5E1 1px, transparent 1px), linear-gradient(90deg, #CBD5E1 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
            <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
              <div style={{ width: 36, height: 36, borderRadius: '50% 50% 50% 0', background: '#2563EB', transform: 'rotate(-45deg)', boxShadow: '0 4px 12px rgba(37,99,235,0.4)' }} />
              <div style={{ background: '#fff', borderRadius: 8, padding: '4px 10px', fontSize: 11, fontWeight: 700, color: '#0F172A', boxShadow: '0 2px 8px rgba(0,0,0,0.12)' }}>Elite Arena OMR</div>
            </div>
          </div>
          <div style={{ padding: '10px 16px 14px', display: 'flex', gap: 8 }}>
            <button style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '9px', background: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: 10, cursor: 'pointer', fontSize: 12, fontWeight: 600, color: '#2563EB' }}>
              <MapPin size={13} /> Open in Maps
            </button>
            <button style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '9px', background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 10, cursor: 'pointer', fontSize: 12, fontWeight: 600, color: '#64748B' }}>
              Copy Link
            </button>
          </div>
        </div>

        {/* Amenities */}
        <div style={{ background: '#fff', borderRadius: 18, padding: '16px', marginBottom: 88, border: '1px solid #F1F5F9' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 14 }}>Amenities</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {amenityList.map(a => {
              const active = amenities.includes(a.label)
              const Icon = a.icon
              return (
                <button
                  key={a.label}
                  onClick={() => editing && toggleAmenity(a.label)}
                  style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px', borderRadius: 12, border: `1.5px solid ${active ? '#2563EB' : '#E2E8F0'}`, background: active ? '#EFF6FF' : '#F8FAFC', cursor: editing ? 'pointer' : 'default', textAlign: 'left' }}
                >
                  <Icon size={16} color={active ? '#2563EB' : '#94A3B8'} />
                  <span style={{ fontSize: 12, fontWeight: 600, color: active ? '#2563EB' : '#64748B' }}>{a.label}</span>
                  {active && <Check size={12} color="#2563EB" style={{ marginLeft: 'auto' }} />}
                </button>
              )
            })}
            {editing && (
              <button style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 14px', borderRadius: 12, border: '1.5px dashed #CBD5E1', background: 'transparent', cursor: 'pointer' }}>
                <Plus size={15} color="#94A3B8" />
                <span style={{ fontSize: 12, fontWeight: 600, color: '#94A3B8' }}>Add amenity</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
