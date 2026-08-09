import React, { useState } from 'react';
import { X, Clock, AlertTriangle, Pause, Play, RotateCcw, FileText, Activity } from 'lucide-react';

export type EventAction =
  | 'injury_timeout'
  | 'yellow_card_a'
  | 'yellow_card_b'
  | 'red_card_a'
  | 'red_card_b'
  | 'official_note'
  | 'pause'
  | 'resume'
  | 'undo';

interface EventsPanelProps {
  onClose: () => void;
  onAction: (action: EventAction) => void;
  isPaused: boolean;
  canUndo: boolean;
}

interface ActionButton {
  id: EventAction;
  label: string;
  icon: React.ReactNode;
  color: string;
  bg: string;
  border: string;
  disabled?: boolean;
}

export function EventsPanel({ onClose, onAction, isPaused, canUndo }: EventsPanelProps) {
  const [note, setNote] = useState('');
  const [showNote, setShowNote] = useState(false);

  const actions: ActionButton[] = [
    {
      id: 'injury_timeout',
      label: 'Injury Timeout',
      icon: <Activity size={16} />,
      color: '#F59E0B',
      bg: 'rgba(245,158,11,0.12)',
      border: 'rgba(245,158,11,0.3)',
    },
    {
      id: 'yellow_card_a',
      label: 'Yellow Card — A',
      icon: <span style={{ fontSize: 14, lineHeight: 1 }}>🟨</span>,
      color: '#EAB308',
      bg: 'rgba(234,179,8,0.12)',
      border: 'rgba(234,179,8,0.3)',
    },
    {
      id: 'yellow_card_b',
      label: 'Yellow Card — B',
      icon: <span style={{ fontSize: 14, lineHeight: 1 }}>🟨</span>,
      color: '#EAB308',
      bg: 'rgba(234,179,8,0.12)',
      border: 'rgba(234,179,8,0.3)',
    },
    {
      id: 'red_card_a',
      label: 'Red Card — A',
      icon: <span style={{ fontSize: 14, lineHeight: 1 }}>🟥</span>,
      color: '#EF4444',
      bg: 'rgba(239,68,68,0.12)',
      border: 'rgba(239,68,68,0.3)',
    },
    {
      id: 'red_card_b',
      label: 'Red Card — B',
      icon: <span style={{ fontSize: 14, lineHeight: 1 }}>🟥</span>,
      color: '#EF4444',
      bg: 'rgba(239,68,68,0.12)',
      border: 'rgba(239,68,68,0.3)',
    },
    {
      id: isPaused ? 'resume' : 'pause',
      label: isPaused ? 'Resume Match' : 'Pause Match',
      icon: isPaused ? <Play size={16} /> : <Pause size={16} />,
      color: isPaused ? '#22C55E' : '#94A3B8',
      bg: isPaused ? 'rgba(34,197,94,0.12)' : 'rgba(148,163,184,0.08)',
      border: isPaused ? 'rgba(34,197,94,0.3)' : 'rgba(148,163,184,0.2)',
    },
    {
      id: 'undo',
      label: 'Undo Last Point',
      icon: <RotateCcw size={16} />,
      color: canUndo ? '#EF4444' : '#475569',
      bg: canUndo ? 'rgba(239,68,68,0.12)' : 'rgba(71,85,105,0.08)',
      border: canUndo ? 'rgba(239,68,68,0.3)' : 'rgba(71,85,105,0.15)',
      disabled: !canUndo,
    },
  ];

  return (
    <div
      className="absolute inset-0 z-50 flex items-end"
      onClick={onClose}
      style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
    >
      <div
        className="w-full"
        onClick={e => e.stopPropagation()}
        style={{
          background: '#0B1F3A',
          borderTop: '1px solid #334155',
          borderRadius: '16px 16px 0 0',
          padding: '16px',
        }}
      >
        <div className="flex items-center justify-between mb-3">
          <span style={{ color: '#CBD5E1', fontSize: 11, fontWeight: 700, letterSpacing: '0.1em' }}>
            MATCH EVENTS
          </span>
          <button onClick={onClose} style={{ color: '#64748B', padding: 4 }}>
            <X size={18} />
          </button>
        </div>

        <div className="grid gap-2" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
          {actions.map(action => (
            <button
              key={action.id}
              disabled={action.disabled}
              onClick={() => {
                if (action.id === 'official_note') {
                  setShowNote(true);
                  return;
                }
                onAction(action.id);
                onClose();
              }}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 6,
                padding: '10px 8px',
                background: action.disabled ? 'rgba(30,41,59,0.4)' : action.bg,
                border: `1px solid ${action.disabled ? 'rgba(71,85,105,0.2)' : action.border}`,
                borderRadius: 10,
                color: action.disabled ? '#475569' : action.color,
                cursor: action.disabled ? 'not-allowed' : 'pointer',
                opacity: action.disabled ? 0.5 : 1,
                fontSize: 10,
                fontWeight: 600,
                fontFamily: 'Inter, sans-serif',
                transition: 'all 0.15s',
                lineHeight: 1.2,
                textAlign: 'center',
              }}
            >
              <span style={{ color: action.disabled ? '#475569' : action.color }}>{action.icon}</span>
              {action.label}
            </button>
          ))}

          <button
            onClick={() => setShowNote(true)}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 6,
              padding: '10px 8px',
              background: 'rgba(148,163,184,0.08)',
              border: '1px solid rgba(148,163,184,0.2)',
              borderRadius: 10,
              color: '#94A3B8',
              cursor: 'pointer',
              fontSize: 10,
              fontWeight: 600,
              fontFamily: 'Inter, sans-serif',
              lineHeight: 1.2,
              textAlign: 'center',
            }}
          >
            <FileText size={16} />
            Official Note
          </button>
        </div>

        {showNote && (
          <div className="mt-3 flex gap-2">
            <input
              type="text"
              value={note}
              onChange={e => setNote(e.target.value)}
              placeholder="Enter official note..."
              autoFocus
              style={{
                flex: 1,
                background: '#1E293B',
                border: '1px solid #334155',
                borderRadius: 8,
                padding: '8px 12px',
                color: '#fff',
                fontSize: 13,
                fontFamily: 'Inter, sans-serif',
                outline: 'none',
              }}
            />
            <button
              onClick={() => {
                onAction('official_note');
                setShowNote(false);
                setNote('');
                onClose();
              }}
              style={{
                background: '#22C55E',
                color: '#fff',
                border: 'none',
                borderRadius: 8,
                padding: '8px 16px',
                fontSize: 13,
                fontWeight: 700,
                fontFamily: 'Inter, sans-serif',
                cursor: 'pointer',
              }}
            >
              Save
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
