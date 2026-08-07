import { useRef, useState, useEffect } from 'react'
import type { Category } from '../data'

interface Props {
  value: Category
  onChange: (c: Category) => void
}

const CATEGORIES: Category[] = ["Men's", "Women's", 'Mixed', '50+']

const CAT_ICONS: Record<Category, string> = {
  "Men's": '👨', "Women's": '👩', 'Mixed': '🤝', '50+': '🏅'
}

export default function CategoryDropdown({ value, onChange }: Props) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <div ref={ref} style={{ position: 'relative', zIndex: 100 }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          display: 'flex', alignItems: 'center', gap: 6,
          background: 'rgba(255,255,255,0.15)',
          border: '1px solid rgba(255,255,255,0.25)',
          borderRadius: 10, padding: '6px 10px 6px 8px',
          cursor: 'pointer', transition: 'all 0.15s ease',
          minWidth: 110,
        }}
      >
        <span style={{ fontSize: 14 }}>{CAT_ICONS[value]}</span>
        <span style={{
          fontFamily: 'var(--font-display)', fontWeight: 700,
          color: 'white', fontSize: 12, flex: 1, textAlign: 'left'
        }}>
          {value}
        </span>
        <span style={{
          color: 'rgba(255,255,255,0.7)', fontSize: 10,
          transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
          transition: 'transform 0.2s ease', display: 'inline-block'
        }}>
          ▼
        </span>
      </button>

      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 6px)', right: 0,
          background: 'white', borderRadius: 12,
          boxShadow: '0 8px 32px rgba(13,27,75,0.2)',
          minWidth: 150, overflow: 'hidden',
          animation: 'fadeInUp 0.15s ease'
        }}>
          {CATEGORIES.map(cat => (
            <button key={cat} onClick={() => { onChange(cat); setOpen(false) }} style={{
              display: 'flex', alignItems: 'center', gap: 10,
              width: '100%', padding: '12px 14px', border: 'none',
              background: cat === value ? '#E3F2FD' : 'white',
              cursor: 'pointer', transition: 'background 0.15s ease',
              borderBottom: '1px solid #F0F4F8',
            }}>
              <span style={{ fontSize: 16 }}>{CAT_ICONS[cat]}</span>
              <div style={{ flex: 1, textAlign: 'left' }}>
                <div style={{
                  fontFamily: 'var(--font-display)', fontWeight: 700,
                  color: cat === value ? '#1565C0' : '#1A237E', fontSize: 13
                }}>
                  {cat}
                </div>
              </div>
              {cat === value && (
                <span style={{ color: '#1565C0', fontSize: 14, fontWeight: 900 }}>✓</span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
