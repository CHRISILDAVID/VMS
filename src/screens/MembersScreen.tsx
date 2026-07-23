import { useState } from 'react'
import {
  Plus, Users, UserCheck, UserX, Clock, ChevronRight,
  X, Check, Star, Calendar, Dumbbell,
  Edit2, Trash2, ToggleLeft, ToggleRight, Eye,
  UserPlus, Phone, MessageCircle, Pause,
  ArrowRightLeft, ChevronLeft, ArrowRight,
} from 'lucide-react'

// ─── Types ─────────────────────────────────────────────────────────────────────
type SlotMember = { id: string; name: string; phone: string; payStatus: 'paid' | 'due' | 'overdue'; active: boolean }
type Slot = {
  id: string; name: string; days: string; time: string; skill: string
  fee: number; capacity: number; members: SlotMember[]; open: boolean; guestFee: number
}

// ─── Seed Data ─────────────────────────────────────────────────────────────────
const seedSlots: Slot[] = [
  {
    id: 'S1', name: 'Morning Warriors', days: 'Mon, Wed, Fri', time: '06:00 – 08:00',
    skill: 'Intermediate', fee: 2500, capacity: 8, open: true, guestFee: 300,
    members: [
      { id: 'M1', name: 'Arjun Sharma',  phone: '9876543210', payStatus: 'paid',    active: true },
      { id: 'M2', name: 'Priya Nair',    phone: '9123456789', payStatus: 'due',     active: true },
      { id: 'M3', name: 'Karthik Rajan', phone: '9988776655', payStatus: 'overdue', active: true },
      { id: 'M4', name: 'Deepa Menon',   phone: '9845612300', payStatus: 'paid',    active: false },
      { id: 'M5', name: 'Vikram Anand',  phone: '9500067890', payStatus: 'paid',    active: true },
      { id: 'M6', name: 'Meera Raj',     phone: '9600045678', payStatus: 'due',     active: true },
    ],
  },
  {
    id: 'S2', name: 'Evening Smashers', days: 'Tue, Thu, Sat', time: '18:00 – 20:00',
    skill: 'Advanced', fee: 3000, capacity: 6, open: false, guestFee: 400,
    members: [
      { id: 'M7', name: 'Sundar Pichai', phone: '9700012345', payStatus: 'paid',    active: true },
      { id: 'M8', name: 'Nisha Kumar',   phone: '9400089012', payStatus: 'overdue', active: true },
    ],
  },
  {
    id: 'S3', name: 'Weekend Warriors', days: 'Sat, Sun', time: '07:00 – 09:00',
    skill: 'Beginner', fee: 1800, capacity: 10, open: true, guestFee: 250,
    members: [
      { id: 'M9',  name: 'Ravi Kumar',   phone: '9711122233', payStatus: 'paid', active: true },
      { id: 'M10', name: 'Anita Sharma', phone: '9822233344', payStatus: 'due',  active: true },
    ],
  },
  {
    id: 'S4', name: 'Corporate League', days: 'Mon–Fri', time: '07:00 – 08:00',
    skill: 'Recreational', fee: 2000, capacity: 12, open: true, guestFee: 300,
    members: [
      { id: 'M11', name: 'Ramesh Iyer',  phone: '9933344455', payStatus: 'paid', active: true },
    ],
  },
]

const applications = [
  { id: 'A1', name: 'Rahul Verma',  skill: 'Intermediate', experience: '3 years', days: 'Mon, Wed, Fri', slot: 'Morning Warriors',  photo: 'R', status: 'pending' },
  { id: 'A2', name: 'Sonia Patel',  skill: 'Advanced',     experience: '6 years', days: 'Tue, Thu, Sat', slot: 'Evening Smashers', photo: 'S', status: 'pending' },
  { id: 'A3', name: 'Arun Babu',    skill: 'Beginner',     experience: '6 months',days: 'Sat, Sun',     slot: 'Weekend Warriors',  photo: 'A', status: 'review'  },
]

const guestPlays = [
  { id: 'G1', name: 'Kiran Rao',    slot: 'Morning Warriors',  date: 'Tomorrow', time: '06:00 – 08:00', fee: 300, status: 'upcoming',  photo: 'K' },
  { id: 'G2', name: 'Divya Singh',  slot: 'Corporate League',  date: 'Today',    time: '07:00 – 08:00', fee: 300, status: 'upcoming',  photo: 'D' },
  { id: 'G3', name: 'Manish Iyer',  slot: 'Morning Warriors',  date: 'Yesterday',time: '06:00 – 08:00', fee: 300, status: 'completed', photo: 'M' },
]

// ─── Helpers ───────────────────────────────────────────────────────────────────
const skillColors: Record<string, { bg: string; text: string }> = {
  Beginner:     { bg: '#F0FDF4', text: '#16A34A' },
  Intermediate: { bg: '#EFF6FF', text: '#2563EB' },
  Advanced:     { bg: '#F5F3FF', text: '#7C3AED' },
  Recreational: { bg: '#FFFBEB', text: '#D97706' },
}
const payColors: Record<string, string> = { paid: '#16A34A', due: '#D97706', overdue: '#DC2626' }
const payBg:     Record<string, string> = { paid: '#F0FDF4', due: '#FFFBEB', overdue: '#FEF2F2' }
const payLabel:  Record<string, string> = { paid: 'Paid', due: 'Due Soon', overdue: 'Overdue' }

// ─── Summary Stats ─────────────────────────────────────────────────────────────
function SummaryCards({ slots }: { slots: Slot[] }) {
  const totalMembers = slots.reduce((a, s) => a + s.members.length, 0)
  const activeSlots  = slots.filter(s => s.open).length
  const vacancies    = slots.reduce((a, s) => a + Math.max(0, s.capacity - s.members.length), 0)
  const stats = [
    { label: 'Total Members', value: totalMembers, icon: Users,     color: '#2563EB', bg: '#EFF6FF' },
    { label: 'Active Slots',  value: activeSlots,  icon: UserCheck, color: '#16A34A', bg: '#F0FDF4' },
    { label: 'Vacancies',     value: vacancies,    icon: UserX,     color: '#D97706', bg: '#FFFBEB' },
    { label: 'Pending Apps',  value: applications.length, icon: Clock, color: '#7C3AED', bg: '#F5F3FF' },
  ]
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, padding: '14px 16px 0' }}>
      {stats.map(s => {
        const Icon = s.icon
        return (
          <div key={s.label} style={{ background: '#fff', borderRadius: 16, padding: '14px', border: '1px solid #F1F5F9', display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 38, height: 38, borderRadius: 11, background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Icon size={18} color={s.color} />
            </div>
            <div>
              <div style={{ fontSize: 20, fontWeight: 800, color: '#0F172A', fontFamily: 'Plus Jakarta Sans, sans-serif', lineHeight: 1.1 }}>{s.value}</div>
              <div style={{ fontSize: 11, color: '#64748B', fontWeight: 500, marginTop: 2 }}>{s.label}</div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ─── Add Member Form (used inside CreateSlot and SlotMembersView) ──────────────
function AddMemberSheet({ onAdd, onClose }: { onAdd: (m: Omit<SlotMember, 'id' | 'payStatus' | 'active'>) => void; onClose: () => void }) {
  const [name, setName]   = useState('')
  const [phone, setPhone] = useState('')
  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 90 }}>
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)' }} onClick={onClose} />
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: '#fff', borderRadius: '24px 24px 0 0', padding: '0 0 32px' }} className="bottom-sheet-enter">
        <div style={{ display: 'flex', justifyContent: 'center', padding: '12px 0 4px' }}><div style={{ width: 36, height: 4, borderRadius: 2, background: '#E2E8F0' }} /></div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 20px 16px', borderBottom: '1px solid #F1F5F9' }}>
          <div style={{ fontSize: 16, fontWeight: 800, color: '#0F172A' }}>Add Member</div>
          <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: 16, background: '#F1F5F9', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><X size={16} color="#64748B" /></button>
        </div>
        <div style={{ padding: '20px' }}>
          {[{ label: 'Full Name', val: name, set: setName, placeholder: 'e.g. Arjun Sharma' }, { label: 'Mobile Number', val: phone, set: setPhone, placeholder: '98765 43210', type: 'tel' }].map(f => (
            <div key={f.label} style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 12, fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: 8 }}>{f.label}</label>
              <input type={f.type ?? 'text'} placeholder={f.placeholder} value={f.val} onChange={e => f.set(e.target.value)}
                style={{ width: '100%', padding: '12px 14px', border: '1.5px solid #E2E8F0', borderRadius: 12, fontSize: 15, fontWeight: 600, color: '#0F172A', background: '#F8FAFC', outline: 'none', boxSizing: 'border-box' }} />
            </div>
          ))}
          <button
            onClick={() => { if (name.trim() && phone.trim()) { onAdd({ name: name.trim(), phone: phone.trim() }); onClose() } }}
            disabled={!name.trim() || !phone.trim()}
            style={{ width: '100%', padding: '14px', background: name.trim() && phone.trim() ? '#2563EB' : '#E2E8F0', color: name.trim() && phone.trim() ? '#fff' : '#94A3B8', border: 'none', borderRadius: 14, fontSize: 15, fontWeight: 700, cursor: name.trim() && phone.trim() ? 'pointer' : 'default', boxShadow: name.trim() && phone.trim() ? '0 4px 12px rgba(37,99,235,0.3)' : 'none' }}>
            Add Member
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Edit Member Sheet ─────────────────────────────────────────────────────────
function EditMemberSheet({ member, onSave, onClose }: { member: SlotMember; onSave: (m: SlotMember) => void; onClose: () => void }) {
  const [name, setName]   = useState(member.name)
  const [phone, setPhone] = useState(member.phone)
  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 90 }}>
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)' }} onClick={onClose} />
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: '#fff', borderRadius: '24px 24px 0 0', padding: '0 0 32px' }} className="bottom-sheet-enter">
        <div style={{ display: 'flex', justifyContent: 'center', padding: '12px 0 4px' }}><div style={{ width: 36, height: 4, borderRadius: 2, background: '#E2E8F0' }} /></div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 20px 16px', borderBottom: '1px solid #F1F5F9' }}>
          <div style={{ fontSize: 16, fontWeight: 800, color: '#0F172A' }}>Edit Member</div>
          <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: 16, background: '#F1F5F9', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><X size={16} color="#64748B" /></button>
        </div>
        <div style={{ padding: '20px' }}>
          {[{ label: 'Full Name', val: name, set: setName }, { label: 'Mobile Number', val: phone, set: setPhone, type: 'tel' }].map(f => (
            <div key={f.label} style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 12, fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: 8 }}>{f.label}</label>
              <input type={f.type ?? 'text'} value={f.val} onChange={e => f.set(e.target.value)}
                style={{ width: '100%', padding: '12px 14px', border: '1.5px solid #E2E8F0', borderRadius: 12, fontSize: 15, fontWeight: 600, color: '#0F172A', background: '#F8FAFC', outline: 'none', boxSizing: 'border-box' }} />
            </div>
          ))}
          <button onClick={() => { onSave({ ...member, name: name.trim(), phone: phone.trim() }); onClose() }}
            style={{ width: '100%', padding: '14px', background: '#2563EB', color: '#fff', border: 'none', borderRadius: 14, fontSize: 15, fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 12px rgba(37,99,235,0.3)' }}>
            Save Changes
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Transfer Sheet ────────────────────────────────────────────────────────────
function TransferSheet({ member, slots, currentSlotId, onTransfer, onClose }: {
  member: SlotMember; slots: Slot[]; currentSlotId: string
  onTransfer: (toSlotId: string) => void; onClose: () => void
}) {
  const [selected, setSelected] = useState('')
  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 90 }}>
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)' }} onClick={onClose} />
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: '#fff', borderRadius: '24px 24px 0 0', padding: '0 0 32px' }} className="bottom-sheet-enter">
        <div style={{ display: 'flex', justifyContent: 'center', padding: '12px 0 4px' }}><div style={{ width: 36, height: 4, borderRadius: 2, background: '#E2E8F0' }} /></div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 20px 16px', borderBottom: '1px solid #F1F5F9' }}>
          <div>
            <div style={{ fontSize: 16, fontWeight: 800, color: '#0F172A' }}>Transfer Member</div>
            <div style={{ fontSize: 12, color: '#64748B', marginTop: 2 }}>{member.name} → select destination slot</div>
          </div>
          <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: 16, background: '#F1F5F9', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><X size={16} color="#64748B" /></button>
        </div>
        <div style={{ padding: '16px 20px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
            {slots.filter(s => s.id !== currentSlotId).map(s => {
              const vacant = s.capacity - s.members.length
              return (
                <button key={s.id} onClick={() => setSelected(s.id)}
                  style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px', borderRadius: 14, border: `1.5px solid ${selected === s.id ? '#2563EB' : '#E2E8F0'}`, background: selected === s.id ? '#EFF6FF' : '#F8FAFC', cursor: vacant > 0 ? 'pointer' : 'not-allowed', opacity: vacant > 0 ? 1 : 0.4, textAlign: 'left', width: '100%' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: selected === s.id ? '#2563EB' : '#0F172A' }}>{s.name}</div>
                    <div style={{ fontSize: 12, color: '#64748B', marginTop: 2 }}>{s.days} · {s.time}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: vacant > 0 ? '#16A34A' : '#DC2626' }}>{vacant > 0 ? `${vacant} vacant` : 'Full'}</div>
                  </div>
                  {selected === s.id && <Check size={16} color="#2563EB" />}
                </button>
              )
            })}
          </div>
          <button onClick={() => { if (selected) { onTransfer(selected); onClose() } }} disabled={!selected}
            style={{ width: '100%', padding: '14px', background: selected ? '#2563EB' : '#E2E8F0', color: selected ? '#fff' : '#94A3B8', border: 'none', borderRadius: 14, fontSize: 15, fontWeight: 700, cursor: selected ? 'pointer' : 'default', boxShadow: selected ? '0 4px 12px rgba(37,99,235,0.3)' : 'none' }}>
            Confirm Transfer
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Slot Members View ─────────────────────────────────────────────────────────
function SlotMembersView({ slot, allSlots, onUpdateSlots, onBack }: {
  slot: Slot; allSlots: Slot[]; onUpdateSlots: (slots: Slot[]) => void; onBack: () => void
}) {
  const [showAddMember, setShowAddMember]     = useState(false)
  const [editMember, setEditMember]           = useState<SlotMember | null>(null)
  const [transferMember, setTransferMember]   = useState<SlotMember | null>(null)

  const updateSlot = (updated: Slot) => {
    onUpdateSlots(allSlots.map(s => s.id === updated.id ? updated : s))
  }

  const addMember = (m: Omit<SlotMember, 'id' | 'payStatus' | 'active'>) => {
    updateSlot({ ...slot, members: [...slot.members, { ...m, id: `M${Date.now()}`, payStatus: 'due', active: true }] })
  }

  const saveMember = (m: SlotMember) => {
    updateSlot({ ...slot, members: slot.members.map(x => x.id === m.id ? m : x) })
  }

  const removeMember = (id: string) => {
    updateSlot({ ...slot, members: slot.members.filter(m => m.id !== id) })
  }

  const toggleActive = (id: string) => {
    updateSlot({ ...slot, members: slot.members.map(m => m.id === id ? { ...m, active: !m.active } : m) })
  }

  const transferMemberToSlot = (memberId: string, toSlotId: string) => {
    const member = slot.members.find(m => m.id === memberId)
    if (!member) return
    onUpdateSlots(allSlots.map(s => {
      if (s.id === slot.id)   return { ...s, members: s.members.filter(m => m.id !== memberId) }
      if (s.id === toSlotId)  return { ...s, members: [...s.members, { ...member, id: `M${Date.now()}` }] }
      return s
    }))
    onBack()
  }

  const activeCount   = slot.members.filter(m => m.active).length
  const inactiveCount = slot.members.filter(m => !m.active).length

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: '#F8FAFC', position: 'relative' }}>
      {/* Header */}
      <div style={{ background: '#fff', padding: '0 16px 14px', borderBottom: '1px solid #F1F5F9', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 }}>
          <button onClick={onBack} style={{ width: 36, height: 36, borderRadius: 10, background: '#F8FAFC', border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <ChevronLeft size={20} color="#0F172A" />
          </button>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 17, fontWeight: 800, color: '#0F172A', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>{slot.name}</div>
            <div style={{ fontSize: 12, color: '#64748B', marginTop: 2 }}>{slot.days} · {slot.time}</div>
          </div>
        </div>
        {/* Mini stats */}
        <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
          {[
            { label: 'Total',    value: slot.members.length, color: '#0F172A', bg: '#F8FAFC' },
            { label: 'Active',   value: activeCount,          color: '#16A34A', bg: '#F0FDF4' },
            { label: 'Inactive', value: inactiveCount,        color: '#64748B', bg: '#F1F5F9' },
            { label: 'Capacity', value: slot.capacity,        color: '#2563EB', bg: '#EFF6FF' },
          ].map(s => (
            <div key={s.label} style={{ flex: 1, background: s.bg, borderRadius: 10, padding: '8px 6px', textAlign: 'center' }}>
              <div style={{ fontSize: 16, fontWeight: 800, color: s.color, fontFamily: 'Plus Jakarta Sans, sans-serif' }}>{s.value}</div>
              <div style={{ fontSize: 10, color: '#64748B', fontWeight: 500, marginTop: 1 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Member list */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '14px 16px 100px' }} className="scrollbar-hide">
        {slot.members.length === 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 260, gap: 12 }}>
            <div style={{ width: 60, height: 60, borderRadius: 18, background: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Users size={26} color="#CBD5E1" />
            </div>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#64748B' }}>No members yet</div>
            <div style={{ fontSize: 13, color: '#94A3B8' }}>Tap + to add members</div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {slot.members.map(m => (
              <div key={m.id} style={{ background: '#fff', borderRadius: 16, padding: '14px 16px', border: '1px solid #F1F5F9', opacity: m.active ? 1 : 0.7 }}>
                {/* Top row */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                  <div style={{ width: 42, height: 42, borderRadius: 12, background: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <span style={{ fontSize: 17, fontWeight: 800, color: '#2563EB' }}>{m.name.charAt(0)}</span>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ fontSize: 14, fontWeight: 700, color: '#0F172A' }}>{m.name}</span>
                      {!m.active && (
                        <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 20, background: '#F1F5F9', color: '#64748B' }}>Inactive</span>
                      )}
                    </div>
                    <div style={{ fontSize: 12, color: '#64748B', marginTop: 2 }}>{m.phone}</div>
                  </div>
                  {/* Active toggle */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontSize: 10, fontWeight: 600, color: m.active ? '#16A34A' : '#94A3B8' }}>{m.active ? 'Active' : 'Inactive'}</span>
                    <div onClick={() => toggleActive(m.id)} style={{ width: 40, height: 22, borderRadius: 11, background: m.active ? '#16A34A' : '#E2E8F0', cursor: 'pointer', position: 'relative', transition: 'background 0.2s', flexShrink: 0 }}>
                      <div style={{ width: 18, height: 18, borderRadius: 9, background: '#fff', position: 'absolute', top: 2, left: m.active ? 20 : 2, transition: 'left 0.2s', boxShadow: '0 1px 4px rgba(0,0,0,0.15)' }} />
                    </div>
                  </div>
                </div>

                {/* Payment status + actions */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, borderTop: '1px solid #F8FAFC', paddingTop: 10 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20, background: payBg[m.payStatus], color: payColors[m.payStatus] }}>
                    {payLabel[m.payStatus]}
                  </span>
                  <div style={{ flex: 1 }} />
                  <button onClick={() => setEditMember(m)} style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '5px 10px', background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 8, cursor: 'pointer', fontSize: 11, fontWeight: 600, color: '#64748B' }}>
                    <Edit2 size={11} /> Edit
                  </button>
                  <button onClick={() => setTransferMember(m)} style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '5px 10px', background: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: 8, cursor: 'pointer', fontSize: 11, fontWeight: 600, color: '#2563EB' }}>
                    <ArrowRightLeft size={11} /> Transfer
                  </button>
                  <button onClick={() => removeMember(m.id)} style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '5px 10px', background: '#FEF2F2', border: '1px solid #FCA5A5', borderRadius: 8, cursor: 'pointer', fontSize: 11, fontWeight: 600, color: '#DC2626' }}>
                    <UserX size={11} /> Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Floating Add Member button */}
      <button onClick={() => setShowAddMember(true)}
        style={{ position: 'absolute', bottom: 84, right: 20, width: 52, height: 52, borderRadius: 15, background: '#2563EB', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 20px rgba(37,99,235,0.4)', zIndex: 40 }}>
        <Plus size={24} color="#fff" />
      </button>

      {showAddMember && (
        <AddMemberSheet onAdd={addMember} onClose={() => setShowAddMember(false)} />
      )}
      {editMember && (
        <EditMemberSheet member={editMember} onSave={saveMember} onClose={() => setEditMember(null)} />
      )}
      {transferMember && (
        <TransferSheet member={transferMember} slots={allSlots} currentSlotId={slot.id} onTransfer={id => transferMemberToSlot(transferMember.id, id)} onClose={() => setTransferMember(null)} />
      )}
    </div>
  )
}

// ─── Edit Slot Sheet ───────────────────────────────────────────────────────────
function EditSlotSheet({ slot, onSave, onClose }: { slot: Slot; onSave: (s: Slot) => void; onClose: () => void }) {
  const [name, setName]         = useState(slot.name)
  const [time, setTime]         = useState(slot.time)
  const [fee, setFee]           = useState(String(slot.fee))
  const [cap, setCap]           = useState(String(slot.capacity))
  const [guestFee, setGuestFee] = useState(String(slot.guestFee))
  const [allowGuest, setAllowGuest] = useState(true)
  const [skill, setSkill]       = useState(slot.skill)
  const [days, setDays]         = useState<string[]>(slot.days.split(', '))
  const [open, setOpen]         = useState(slot.open)
  const allDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  const toggle  = (d: string) => setDays(prev => prev.includes(d) ? prev.filter(x => x !== d) : [...prev, d])

  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 80 }}>
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)' }} onClick={onClose} />
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: '#fff', borderRadius: '24px 24px 0 0', maxHeight: '94%', display: 'flex', flexDirection: 'column' }} className="bottom-sheet-enter">
        <div style={{ display: 'flex', justifyContent: 'center', padding: '12px 0 4px', flexShrink: 0 }}><div style={{ width: 36, height: 4, borderRadius: 2, background: '#E2E8F0' }} /></div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 20px 14px', borderBottom: '1px solid #F1F5F9', flexShrink: 0 }}>
          <div style={{ fontSize: 16, fontWeight: 800, color: '#0F172A' }}>Edit Slot</div>
          <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: 16, background: '#F1F5F9', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><X size={16} color="#64748B" /></button>
        </div>
        <div style={{ overflowY: 'auto', padding: '20px' }} className="scrollbar-hide">
          {[
            { label: 'Slot Name',        val: name,     set: setName,     placeholder: 'Morning Warriors' },
            { label: 'Time',             val: time,     set: setTime,     placeholder: '06:00 – 08:00' },
            { label: 'Capacity',         val: cap,      set: setCap,      placeholder: '8', type: 'number' },
            { label: 'Monthly Fee (₹)',  val: fee,      set: setFee,      placeholder: '2500', type: 'number' },
            { label: 'Guest Play Fee (₹)', val: guestFee, set: setGuestFee, placeholder: '300', type: 'number' },
          ].map(f => (
            <div key={f.label} style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 12, fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: 8 }}>{f.label}</label>
              <input type={f.type ?? 'text'} placeholder={f.placeholder} value={f.val} onChange={e => f.set(e.target.value)}
                style={{ width: '100%', padding: '12px 14px', border: '1.5px solid #E2E8F0', borderRadius: 12, fontSize: 14, fontWeight: 600, color: '#0F172A', background: '#F8FAFC', outline: 'none', boxSizing: 'border-box' }} />
            </div>
          ))}

          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 12, fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: 8 }}>Skill Level</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {['Beginner', 'Intermediate', 'Advanced', 'Recreational'].map(s => (
                <button key={s} onClick={() => setSkill(s)} style={{ padding: '8px 14px', borderRadius: 20, border: `1.5px solid ${skill === s ? '#2563EB' : '#E2E8F0'}`, background: skill === s ? '#EFF6FF' : '#F8FAFC', color: skill === s ? '#2563EB' : '#64748B', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>{s}</button>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 12, fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: 8 }}>Playing Days</label>
            <div style={{ display: 'flex', gap: 6 }}>
              {allDays.map(d => {
                const sel = days.includes(d)
                return (
                  <button key={d} onClick={() => toggle(d)} style={{ flex: 1, padding: '8px 0', borderRadius: 10, border: `1.5px solid ${sel ? '#2563EB' : '#E2E8F0'}`, background: sel ? '#2563EB' : '#F8FAFC', color: sel ? '#fff' : '#64748B', fontSize: 10, fontWeight: 700, cursor: 'pointer' }}>{d}</button>
                )
              })}
            </div>
          </div>

          {/* Allow Guest toggle */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '13px 14px', background: '#F8FAFC', borderRadius: 12, marginBottom: 12 }}>
            <span style={{ fontSize: 14, fontWeight: 600, color: '#0F172A' }}>Allow Guest Play</span>
            <div onClick={() => setAllowGuest(!allowGuest)} style={{ width: 44, height: 24, borderRadius: 12, background: allowGuest ? '#2563EB' : '#E2E8F0', cursor: 'pointer', position: 'relative', transition: 'background 0.2s' }}>
              <div style={{ width: 20, height: 20, borderRadius: 10, background: '#fff', position: 'absolute', top: 2, left: allowGuest ? 22 : 2, transition: 'left 0.2s', boxShadow: '0 1px 4px rgba(0,0,0,0.15)' }} />
            </div>
          </div>

          {/* Open/Close toggle */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '13px 14px', background: '#F8FAFC', borderRadius: 12, marginBottom: 24 }}>
            <span style={{ fontSize: 14, fontWeight: 600, color: '#0F172A' }}>Open Recruitment</span>
            <div onClick={() => setOpen(!open)} style={{ width: 44, height: 24, borderRadius: 12, background: open ? '#16A34A' : '#E2E8F0', cursor: 'pointer', position: 'relative', transition: 'background 0.2s' }}>
              <div style={{ width: 20, height: 20, borderRadius: 10, background: '#fff', position: 'absolute', top: 2, left: open ? 22 : 2, transition: 'left 0.2s', boxShadow: '0 1px 4px rgba(0,0,0,0.15)' }} />
            </div>
          </div>

          <button onClick={() => { onSave({ ...slot, name, time, fee: parseInt(fee) || slot.fee, capacity: parseInt(cap) || slot.capacity, guestFee: parseInt(guestFee) || slot.guestFee, skill, days: days.join(', '), open }); onClose() }}
            style={{ width: '100%', padding: '14px', background: '#2563EB', color: '#fff', border: 'none', borderRadius: 14, fontSize: 15, fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 12px rgba(37,99,235,0.3)' }}>
            Save Changes
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Create Slot Sheet (with Initial Members) ──────────────────────────────────
function CreateSlotSheet({ onClose }: { onClose: () => void }) {
  const [name, setName]         = useState('')
  const [time, setTime]         = useState('')
  const [fee, setFee]           = useState('')
  const [cap, setCap]           = useState('')
  const [guestFee, setGuestFee] = useState('')
  const [allowGuest, setAllowGuest] = useState(true)
  const [skill, setSkill]       = useState('Intermediate')
  const [days, setDays]         = useState<string[]>([])
  const [initMembers, setInitMembers] = useState<{ name: string; phone: string }[]>([])
  const [showAddMemberForm, setShowAddMemberForm] = useState(false)
  const [editIdx, setEditIdx]   = useState<number | null>(null)
  const [mName, setMName]       = useState('')
  const [mPhone, setMPhone]     = useState('')
  const allDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  const capacity = parseInt(cap) || 0

  const openAddForm = (idx?: number) => {
    if (idx !== undefined) {
      setMName(initMembers[idx].name); setMPhone(initMembers[idx].phone); setEditIdx(idx)
    } else {
      setMName(''); setMPhone(''); setEditIdx(null)
    }
    setShowAddMemberForm(true)
  }

  const saveMemberForm = () => {
    if (!mName.trim() || !mPhone.trim()) return
    if (editIdx !== null) {
      setInitMembers(prev => prev.map((m, i) => i === editIdx ? { name: mName.trim(), phone: mPhone.trim() } : m))
    } else {
      setInitMembers(prev => [...prev, { name: mName.trim(), phone: mPhone.trim() }])
    }
    setShowAddMemberForm(false)
  }

  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 80 }}>
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)' }} onClick={onClose} />
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: '#fff', borderRadius: '24px 24px 0 0', maxHeight: '94%', display: 'flex', flexDirection: 'column' }} className="bottom-sheet-enter">
        <div style={{ display: 'flex', justifyContent: 'center', padding: '12px 0 4px', flexShrink: 0 }}><div style={{ width: 36, height: 4, borderRadius: 2, background: '#E2E8F0' }} /></div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 20px 14px', borderBottom: '1px solid #F1F5F9', flexShrink: 0 }}>
          <div style={{ fontSize: 16, fontWeight: 800, color: '#0F172A' }}>Create Membership Slot</div>
          <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: 16, background: '#F1F5F9', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><X size={16} color="#64748B" /></button>
        </div>

        <div style={{ overflowY: 'auto', padding: '20px' }} className="scrollbar-hide">
          {[
            { label: 'Slot Name',          placeholder: 'e.g. Morning Warriors', val: name, set: setName },
            { label: 'Time',               placeholder: 'e.g. 06:00 – 08:00',   val: time, set: setTime },
            { label: 'Capacity',           placeholder: 'Max players',           val: cap,  set: setCap,  type: 'number' },
            { label: 'Monthly Fee (₹)',    placeholder: '2500',                  val: fee,  set: setFee,  type: 'number' },
            { label: 'Guest Play Fee (₹)', placeholder: '300',                   val: guestFee, set: setGuestFee, type: 'number' },
          ].map(f => (
            <div key={f.label} style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 12, fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: 8 }}>{f.label}</label>
              <input type={f.type ?? 'text'} placeholder={f.placeholder} value={f.val} onChange={e => f.set(e.target.value)}
                style={{ width: '100%', padding: '12px 14px', border: '1.5px solid #E2E8F0', borderRadius: 12, fontSize: 14, fontWeight: 600, color: '#0F172A', background: '#F8FAFC', outline: 'none', boxSizing: 'border-box' }} />
            </div>
          ))}

          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 12, fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: 8 }}>Skill Level</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {['Beginner', 'Intermediate', 'Advanced', 'Recreational'].map(s => (
                <button key={s} onClick={() => setSkill(s)} style={{ padding: '8px 14px', borderRadius: 20, border: `1.5px solid ${skill === s ? '#2563EB' : '#E2E8F0'}`, background: skill === s ? '#EFF6FF' : '#F8FAFC', color: skill === s ? '#2563EB' : '#64748B', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>{s}</button>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 12, fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: 8 }}>Playing Days</label>
            <div style={{ display: 'flex', gap: 6 }}>
              {allDays.map(d => {
                const sel = days.includes(d)
                return (
                  <button key={d} onClick={() => setDays(prev => sel ? prev.filter(x => x !== d) : [...prev, d])}
                    style={{ flex: 1, padding: '8px 0', borderRadius: 10, border: `1.5px solid ${sel ? '#2563EB' : '#E2E8F0'}`, background: sel ? '#2563EB' : '#F8FAFC', color: sel ? '#fff' : '#64748B', fontSize: 10, fontWeight: 700, cursor: 'pointer' }}>{d}</button>
                )
              })}
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '13px 14px', background: '#F8FAFC', borderRadius: 12, marginBottom: 20 }}>
            <span style={{ fontSize: 14, fontWeight: 600, color: '#0F172A' }}>Allow Guest Play</span>
            <div onClick={() => setAllowGuest(!allowGuest)} style={{ width: 44, height: 24, borderRadius: 12, background: allowGuest ? '#2563EB' : '#E2E8F0', cursor: 'pointer', position: 'relative', transition: 'background 0.2s' }}>
              <div style={{ width: 20, height: 20, borderRadius: 10, background: '#fff', position: 'absolute', top: 2, left: allowGuest ? 22 : 2, transition: 'left 0.2s', boxShadow: '0 1px 4px rgba(0,0,0,0.15)' }} />
            </div>
          </div>

          {/* ── Initial Members section ── */}
          <div style={{ marginBottom: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 800, color: '#0F172A' }}>Initial Members</div>
                <div style={{ fontSize: 11, color: '#64748B', marginTop: 2 }}>
                  {capacity > 0 ? `${initMembers.length}/${capacity} members added` : `${initMembers.length} members added`}
                  <span style={{ color: '#94A3B8' }}> · optional</span>
                </div>
              </div>
              <button onClick={() => openAddForm()}
                disabled={capacity > 0 && initMembers.length >= capacity}
                style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '7px 12px', background: capacity > 0 && initMembers.length >= capacity ? '#F1F5F9' : '#EFF6FF', border: `1px solid ${capacity > 0 && initMembers.length >= capacity ? '#E2E8F0' : '#BFDBFE'}`, borderRadius: 10, cursor: capacity > 0 && initMembers.length >= capacity ? 'not-allowed' : 'pointer', fontSize: 12, fontWeight: 700, color: capacity > 0 && initMembers.length >= capacity ? '#94A3B8' : '#2563EB' }}>
                <Plus size={13} /> Add Member
              </button>
            </div>

            {/* Capacity progress bar */}
            {capacity > 0 && (
              <div style={{ marginBottom: 12 }}>
                <div style={{ height: 5, background: '#F1F5F9', borderRadius: 3, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${Math.min((initMembers.length / capacity) * 100, 100)}%`, background: initMembers.length >= capacity ? '#16A34A' : '#2563EB', borderRadius: 3, transition: 'width 0.3s' }} />
                </div>
              </div>
            )}

            {initMembers.length === 0 ? (
              <div style={{ border: '1.5px dashed #E2E8F0', borderRadius: 14, padding: '20px', textAlign: 'center' }}>
                <div style={{ fontSize: 13, color: '#94A3B8', fontWeight: 500 }}>No members added yet</div>
                <div style={{ fontSize: 12, color: '#CBD5E1', marginTop: 4 }}>You can publish the slot without members</div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {initMembers.map((m, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', background: '#F8FAFC', borderRadius: 12, border: '1px solid #F1F5F9' }}>
                    <div style={{ width: 36, height: 36, borderRadius: 10, background: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <span style={{ fontSize: 14, fontWeight: 800, color: '#2563EB' }}>{m.name.charAt(0)}</span>
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: '#0F172A' }}>{m.name}</div>
                      <div style={{ fontSize: 11, color: '#64748B', marginTop: 1 }}>{m.phone}</div>
                    </div>
                    <button onClick={() => openAddForm(i)} style={{ width: 28, height: 28, borderRadius: 8, background: '#fff', border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                      <Edit2 size={13} color="#64748B" />
                    </button>
                    <button onClick={() => setInitMembers(prev => prev.filter((_, j) => j !== i))} style={{ width: 28, height: 28, borderRadius: 8, background: '#FEF2F2', border: '1px solid #FCA5A5', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                      <X size={13} color="#DC2626" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <button style={{ width: '100%', padding: '14px', background: '#2563EB', color: '#fff', border: 'none', borderRadius: 14, fontSize: 15, fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 12px rgba(37,99,235,0.3)' }}>
            Publish Slot{initMembers.length > 0 ? ` with ${initMembers.length} Member${initMembers.length > 1 ? 's' : ''}` : ''}
          </button>
        </div>

        {/* Inline add/edit member form */}
        {showAddMemberForm && (
          <div style={{ position: 'absolute', inset: 0, zIndex: 10, background: 'rgba(0,0,0,0.4)' }}>
            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: '#fff', borderRadius: '24px 24px 0 0', padding: '0 0 32px' }} className="bottom-sheet-enter">
              <div style={{ display: 'flex', justifyContent: 'center', padding: '12px 0 4px' }}><div style={{ width: 36, height: 4, borderRadius: 2, background: '#E2E8F0' }} /></div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 20px 16px', borderBottom: '1px solid #F1F5F9' }}>
                <div style={{ fontSize: 15, fontWeight: 800, color: '#0F172A' }}>{editIdx !== null ? 'Edit Member' : 'Add Member'}</div>
                <button onClick={() => setShowAddMemberForm(false)} style={{ width: 30, height: 30, borderRadius: 15, background: '#F1F5F9', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><X size={14} color="#64748B" /></button>
              </div>
              <div style={{ padding: '20px' }}>
                {[{ label: 'Full Name', val: mName, set: setMName, placeholder: 'e.g. Arjun Sharma' }, { label: 'Mobile Number', val: mPhone, set: setMPhone, placeholder: '98765 43210', type: 'tel' }].map(f => (
                  <div key={f.label} style={{ marginBottom: 14 }}>
                    <label style={{ fontSize: 12, fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: 8 }}>{f.label}</label>
                    <input type={f.type ?? 'text'} placeholder={f.placeholder} value={f.val} onChange={e => f.set(e.target.value)}
                      style={{ width: '100%', padding: '12px 14px', border: '1.5px solid #E2E8F0', borderRadius: 12, fontSize: 15, fontWeight: 600, color: '#0F172A', background: '#F8FAFC', outline: 'none', boxSizing: 'border-box' }} />
                  </div>
                ))}
                <button onClick={saveMemberForm} disabled={!mName.trim() || !mPhone.trim()}
                  style={{ width: '100%', padding: '13px', background: mName.trim() && mPhone.trim() ? '#2563EB' : '#E2E8F0', color: mName.trim() && mPhone.trim() ? '#fff' : '#94A3B8', border: 'none', borderRadius: 12, fontSize: 14, fontWeight: 700, cursor: mName.trim() && mPhone.trim() ? 'pointer' : 'default' }}>
                  {editIdx !== null ? 'Save Changes' : 'Add Member'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Slots Tab ─────────────────────────────────────────────────────────────────
function SlotsTab({ slots, onUpdateSlots, onCreate, onViewMembers }: {
  slots: Slot[]; onUpdateSlots: (s: Slot[]) => void; onCreate: () => void; onViewMembers: (s: Slot) => void
}) {
  const [editSlot, setEditSlot] = useState<Slot | null>(null)

  const saveSlot = (updated: Slot) => onUpdateSlots(slots.map(s => s.id === updated.id ? updated : s))
  const toggleOpen = (id: string) => onUpdateSlots(slots.map(s => s.id === id ? { ...s, open: !s.open } : s))
  const deleteSlot = (id: string) => onUpdateSlots(slots.filter(s => s.id !== id))

  return (
    <div style={{ padding: '14px 16px 88px', display: 'flex', flexDirection: 'column', gap: 12 }}>
      {slots.map(s => {
        const sc = skillColors[s.skill] ?? { bg: '#F8FAFC', text: '#64748B' }
        const vacant = s.capacity - s.members.length
        return (
          <div key={s.id} style={{ background: '#fff', borderRadius: 18, padding: '16px', border: '1px solid #F1F5F9' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ fontSize: 15, fontWeight: 800, color: '#0F172A', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>{s.name}</div>
                  <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 20, background: s.open ? '#F0FDF4' : '#F1F5F9', color: s.open ? '#16A34A' : '#94A3B8' }}>{s.open ? 'OPEN' : 'CLOSED'}</span>
                </div>
                <div style={{ fontSize: 12, color: '#64748B', marginTop: 4 }}>{s.days} · {s.time}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 16, fontWeight: 800, color: '#2563EB' }}>₹{s.fee}<span style={{ fontSize: 11, fontWeight: 600, color: '#64748B' }}>/mo</span></div>
                <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 20, background: sc.bg, color: sc.text }}>{s.skill}</span>
              </div>
            </div>

            {/* Capacity bar */}
            <div style={{ marginBottom: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: '#64748B' }}>{s.members.length}/{s.capacity} members</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: vacant > 0 ? '#16A34A' : '#DC2626' }}>{vacant > 0 ? `${vacant} vacanc${vacant === 1 ? 'y' : 'ies'}` : 'Full'}</span>
              </div>
              <div style={{ height: 6, background: '#F1F5F9', borderRadius: 3 }}>
                <div style={{ height: '100%', width: `${Math.min((s.members.length / s.capacity) * 100, 100)}%`, background: s.members.length >= s.capacity ? '#DC2626' : '#2563EB', borderRadius: 3 }} />
              </div>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: 6 }}>
              <button onClick={() => onViewMembers(s)} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, padding: '9px', background: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: 10, cursor: 'pointer', fontSize: 12, fontWeight: 600, color: '#2563EB' }}>
                <Eye size={13} /> Members
              </button>
              <button onClick={() => setEditSlot(s)} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, padding: '9px', background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 10, cursor: 'pointer', fontSize: 12, fontWeight: 600, color: '#64748B' }}>
                <Edit2 size={13} /> Edit
              </button>
              <button onClick={() => toggleOpen(s.id)} style={{ padding: '9px 12px', background: s.open ? '#FFFBEB' : '#F0FDF4', border: `1px solid ${s.open ? '#FDE68A' : '#BBF7D0'}`, borderRadius: 10, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {s.open ? <ToggleRight size={16} color="#D97706" /> : <ToggleLeft size={16} color="#16A34A" />}
              </button>
              <button onClick={() => deleteSlot(s.id)} style={{ padding: '9px 12px', background: '#FEF2F2', border: '1px solid #FCA5A5', borderRadius: 10, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Trash2 size={14} color="#DC2626" />
              </button>
            </div>
          </div>
        )
      })}

      <button onClick={onCreate} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '16px', background: 'transparent', border: '2px dashed #CBD5E1', borderRadius: 18, cursor: 'pointer', fontSize: 14, fontWeight: 700, color: '#2563EB' }}>
        <Plus size={18} /> Create New Slot
      </button>

      {editSlot && (
        <EditSlotSheet slot={editSlot} onSave={s => { saveSlot(s); setEditSlot(null) }} onClose={() => setEditSlot(null)} />
      )}
    </div>
  )
}

// ─── Applications Tab ──────────────────────────────────────────────────────────
function ApplicationsTab() {
  const [dismissed, setDismissed] = useState<string[]>([])
  const visible = applications.filter(a => !dismissed.includes(a.id))
  if (visible.length === 0) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 300, gap: 12 }}>
        <div style={{ width: 60, height: 60, borderRadius: 18, background: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Check size={28} color="#CBD5E1" />
        </div>
        <div style={{ fontSize: 15, fontWeight: 700, color: '#64748B' }}>All caught up!</div>
        <div style={{ fontSize: 13, color: '#94A3B8' }}>No pending applications</div>
      </div>
    )
  }
  return (
    <div style={{ padding: '14px 16px 88px', display: 'flex', flexDirection: 'column', gap: 12 }}>
      {visible.map(a => (
        <div key={a.id} style={{ background: '#fff', borderRadius: 18, padding: '16px', border: '1px solid #F1F5F9' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
            <div style={{ width: 46, height: 46, borderRadius: 14, background: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <span style={{ fontSize: 18, fontWeight: 800, color: '#2563EB' }}>{a.photo}</span>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: '#0F172A' }}>{a.name}</div>
              <div style={{ fontSize: 12, color: '#64748B', marginTop: 2 }}>Applied for: <span style={{ fontWeight: 600, color: '#2563EB' }}>{a.slot}</span></div>
            </div>
            <span style={{ fontSize: 10, fontWeight: 700, padding: '3px 10px', borderRadius: 20, background: a.status === 'review' ? '#FFFBEB' : '#F0FDF4', color: a.status === 'review' ? '#D97706' : '#16A34A' }}>
              {a.status === 'review' ? 'Review' : 'New'}
            </span>
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 14 }}>
            {[{ icon: Dumbbell, label: a.skill }, { icon: Star, label: a.experience }, { icon: Calendar, label: a.days }].map((t, i) => {
              const Icon = t.icon
              return (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 5, background: '#F8FAFC', borderRadius: 8, padding: '5px 10px' }}>
                  <Icon size={12} color="#94A3B8" />
                  <span style={{ fontSize: 12, fontWeight: 600, color: '#64748B' }}>{t.label}</span>
                </div>
              )
            })}
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={() => setDismissed(d => [...d, a.id])} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '11px', background: '#F0FDF4', border: '1.5px solid #BBF7D0', borderRadius: 12, cursor: 'pointer', fontSize: 13, fontWeight: 700, color: '#16A34A' }}>
              <UserCheck size={15} /> Accept
            </button>
            <button style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '11px', background: '#EFF6FF', border: '1.5px solid #BFDBFE', borderRadius: 12, cursor: 'pointer', fontSize: 13, fontWeight: 700, color: '#2563EB' }}>
              <UserPlus size={15} /> Guest Play
            </button>
            <button onClick={() => setDismissed(d => [...d, a.id])} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '11px', background: '#FEF2F2', border: '1.5px solid #FCA5A5', borderRadius: 12, cursor: 'pointer', fontSize: 13, fontWeight: 700, color: '#DC2626' }}>
              <X size={15} /> Reject
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}

// ─── Guest Play Tab ────────────────────────────────────────────────────────────
function GuestPlayTab() {
  const [guestTab, setGuestTab] = useState<'upcoming' | 'completed'>('upcoming')
  const filtered = guestPlays.filter(g => g.status === guestTab)
  return (
    <div>
      <div style={{ display: 'flex', background: '#F8FAFC', borderRadius: 12, padding: 3, gap: 2, margin: '14px 16px 12px' }}>
        {(['upcoming', 'completed'] as const).map(t => (
          <button key={t} onClick={() => setGuestTab(t)} style={{ flex: 1, padding: '8px', borderRadius: 10, border: 'none', background: guestTab === t ? '#fff' : 'transparent', color: guestTab === t ? '#2563EB' : '#64748B', fontSize: 13, fontWeight: guestTab === t ? 700 : 500, cursor: 'pointer', boxShadow: guestTab === t ? '0 1px 4px rgba(0,0,0,0.08)' : 'none', textTransform: 'capitalize' }}>{t}</button>
        ))}
      </div>
      <div style={{ padding: '0 16px 88px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: '#94A3B8' }}>
            <div style={{ fontSize: 40, marginBottom: 8 }}>🏸</div>
            <div style={{ fontSize: 14, fontWeight: 600 }}>No guest play sessions</div>
          </div>
        ) : filtered.map(g => (
          <div key={g.id} style={{ background: '#fff', borderRadius: 16, padding: '16px', border: '1px solid #F1F5F9' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
              <div style={{ width: 42, height: 42, borderRadius: 12, background: '#F5F3FF', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <span style={{ fontSize: 17, fontWeight: 800, color: '#7C3AED' }}>{g.photo}</span>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#0F172A' }}>{g.name}</div>
                <div style={{ fontSize: 12, color: '#64748B', marginTop: 2 }}>{g.slot} · {g.date} · {g.time}</div>
              </div>
              <div style={{ fontSize: 15, fontWeight: 800, color: '#2563EB' }}>₹{g.fee}</div>
            </div>
            {g.status === 'completed' ? (
              <div style={{ display: 'flex', gap: 8 }}>
                <button style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '10px', background: '#F0FDF4', border: '1.5px solid #BBF7D0', borderRadius: 12, cursor: 'pointer', fontSize: 13, fontWeight: 700, color: '#16A34A' }}>
                  <UserCheck size={14} /> Accept as Member
                </button>
                <button style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '10px', background: '#FEF2F2', border: '1.5px solid #FCA5A5', borderRadius: 12, cursor: 'pointer', fontSize: 13, fontWeight: 700, color: '#DC2626' }}>
                  <X size={14} /> Reject
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', gap: 8 }}>
                <button style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '10px', background: '#EFF6FF', border: '1.5px solid #BFDBFE', borderRadius: 12, cursor: 'pointer', fontSize: 13, fontWeight: 600, color: '#2563EB' }}>
                  <Phone size={13} /> Contact
                </button>
                <button style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '10px', background: '#F8FAFC', border: '1.5px solid #E2E8F0', borderRadius: 12, cursor: 'pointer', fontSize: 13, fontWeight: 600, color: '#64748B' }}>
                  <X size={13} /> Cancel
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Members List Tab ──────────────────────────────────────────────────────────
function MembersListTab({ slots, onViewSlotMembers }: { slots: Slot[]; onViewSlotMembers: (s: Slot) => void }) {
  const allMembers = slots.flatMap(s => s.members.map(m => ({ ...m, slotName: s.name })))
  return (
    <div style={{ padding: '14px 16px 88px' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {allMembers.map(m => (
          <div key={m.id} style={{ background: '#fff', borderRadius: 16, padding: '14px 16px', border: '1px solid #F1F5F9', cursor: 'pointer' }}
            onClick={() => { const s = slots.find(s => s.members.some(x => x.id === m.id)); if (s) onViewSlotMembers(s) }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 42, height: 42, borderRadius: 12, background: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <span style={{ fontSize: 17, fontWeight: 800, color: '#2563EB' }}>{m.name.charAt(0)}</span>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontSize: 14, fontWeight: 700, color: '#0F172A' }}>{m.name}</span>
                  {!m.active && <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 20, background: '#F1F5F9', color: '#64748B' }}>Inactive</span>}
                  <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 20, background: payBg[m.payStatus], color: payColors[m.payStatus] }}>
                    {payLabel[m.payStatus]}
                  </span>
                </div>
                <div style={{ fontSize: 12, color: '#64748B', marginTop: 2 }}>{m.slotName} · {m.phone}</div>
              </div>
              <ChevronRight size={15} color="#CBD5E1" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Main Screen ───────────────────────────────────────────────────────────────
const TABS = ['Slots', 'Applications', 'Guest Play', 'Members'] as const
type Tab = typeof TABS[number]

export default function MembersScreen() {
  const [tab, setTab]             = useState<Tab>('Slots')
  const [createOpen, setCreateOpen] = useState(false)
  const [slots, setSlots]         = useState<Slot[]>(seedSlots)
  const [viewingSlot, setViewingSlot] = useState<Slot | null>(null)

  // If viewing a slot's members, render that sub-view
  if (viewingSlot) {
    // Keep in sync with latest slot data
    const latestSlot = slots.find(s => s.id === viewingSlot.id) ?? viewingSlot
    return (
      <SlotMembersView
        slot={latestSlot}
        allSlots={slots}
        onUpdateSlots={setSlots}
        onBack={() => setViewingSlot(null)}
      />
    )
  }

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: '#F8FAFC', position: 'relative' }}>
      {/* Header */}
      <div style={{ background: '#fff', padding: '0 16px 0', borderBottom: '1px solid #F1F5F9', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: 12 }}>
          <div>
            <div style={{ fontSize: 20, fontWeight: 800, color: '#0F172A', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>Members</div>
            <div style={{ fontSize: 12, color: '#64748B', fontWeight: 500, marginTop: 1 }}>Membership management</div>
          </div>
          {tab === 'Slots' && (
            <button onClick={() => setCreateOpen(true)} style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#2563EB', border: 'none', borderRadius: 12, padding: '8px 14px', cursor: 'pointer' }}>
              <Plus size={15} color="#fff" />
              <span style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>New Slot</span>
            </button>
          )}
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 0 }}>
          {TABS.map(t => {
            const badge = t === 'Applications' ? applications.length : t === 'Guest Play' ? guestPlays.filter(g => g.status === 'upcoming').length : null
            return (
              <button key={t} onClick={() => setTab(t)}
                style={{ flex: 1, padding: '10px 4px 12px', border: 'none', background: 'transparent', cursor: 'pointer', fontSize: 12, fontWeight: tab === t ? 700 : 500, color: tab === t ? '#2563EB' : '#64748B', borderBottom: tab === t ? '2px solid #2563EB' : '2px solid transparent', marginBottom: -2, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, transition: 'color 0.15s' }}>
                <span>{t}</span>
                {badge !== null && badge > 0 && (
                  <span style={{ width: 16, height: 16, borderRadius: 8, background: '#DC2626', color: '#fff', fontSize: 9, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{badge}</span>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Summary cards */}
      <SummaryCards slots={slots} />

      {/* Tab content */}
      <div style={{ flex: 1, overflowY: 'auto' }} className="scrollbar-hide">
        {tab === 'Slots' && (
          <SlotsTab
            slots={slots}
            onUpdateSlots={setSlots}
            onCreate={() => setCreateOpen(true)}
            onViewMembers={s => setViewingSlot(s)}
          />
        )}
        {tab === 'Applications' && <ApplicationsTab />}
        {tab === 'Guest Play' && <GuestPlayTab />}
        {tab === 'Members' && <MembersListTab slots={slots} onViewSlotMembers={s => setViewingSlot(s)} />}
      </div>

      {createOpen && <CreateSlotSheet onClose={() => setCreateOpen(false)} />}
    </div>
  )
}
