import React, { useState } from 'react';

const DIAS = ['SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SAB'];
const HORAS = ['08:00', '09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'];

export interface Slot {
  dia_semana: string;
  hora_inicio: string;
  hora_fim: string;
}

interface AvailabilityGridProps {
  value: Slot[];
  onChange: (slots: Slot[]) => void;
  readonly?: boolean;
}

function nextHour(h: string): string {
  const [hh, mm] = h.split(':').map(Number);
  return `${String(hh + 1).padStart(2, '0')}:${String(mm).padStart(2, '0')}`;
}

function isSelected(slots: Slot[], dia: string, hora: string): boolean {
  return slots.some(
    (s) => s.dia_semana === dia && s.hora_inicio <= hora && hora < s.hora_fim,
  );
}

export const AvailabilityGrid: React.FC<AvailabilityGridProps> = ({ value, onChange, readonly = false }) => {
  const [dragging, setDragging] = useState(false);
  const [dragStart, setDragStart] = useState<{ dia: string; hora: string } | null>(null);
  const [dragMode, setDragMode] = useState<'add' | 'remove'>('add');

  const toggleCell = (dia: string, hora: string) => {
    if (readonly) return;
    const selected = isSelected(value, dia, hora);
    if (selected) {
      onChange(value.filter((s) => !(s.dia_semana === dia && s.hora_inicio <= hora && hora < s.hora_fim)));
    } else {
      const newSlot: Slot = { dia_semana: dia, hora_inicio: hora, hora_fim: nextHour(hora) };
      const merged = mergeSlots([...value, newSlot]);
      onChange(merged);
    }
  };

  function mergeSlots(slots: Slot[]): Slot[] {
    const byDia: Record<string, string[]> = {};
    for (const s of slots) {
      if (!byDia[s.dia_semana]) byDia[s.dia_semana] = [];
      const idx = HORAS.indexOf(s.hora_inicio);
      if (idx >= 0) byDia[s.dia_semana].push(s.hora_inicio);
    }
    const result: Slot[] = [];
    for (const [dia, horas] of Object.entries(byDia)) {
      const sorted = [...new Set(horas)].sort();
      let start = sorted[0];
      let prev = sorted[0];
      for (let i = 1; i <= sorted.length; i++) {
        const cur = sorted[i];
        if (cur && HORAS.indexOf(cur) === HORAS.indexOf(prev) + 1) {
          prev = cur;
        } else {
          result.push({ dia_semana: dia, hora_inicio: start, hora_fim: nextHour(prev) });
          start = cur;
          prev = cur;
        }
      }
    }
    return result;
  }

  const formatSlot = (s: Slot) => `${s.dia_semana} ${s.hora_inicio}-${s.hora_fim}`;

  return (
    <div>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ borderCollapse: 'collapse', width: '100%', minWidth: 400 }}>
          <thead>
            <tr>
              <th style={{ padding: '8px', color: 'var(--color-text-muted)', fontSize: 12, width: 60 }}></th>
              {DIAS.map((d) => (
                <th key={d} style={{ padding: '8px 4px', color: 'var(--text-2)', fontSize: 11, fontWeight: 600, textAlign: 'center', letterSpacing: 0.5 }}>{d}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {HORAS.map((hora) => (
              <tr key={hora}>
                <td style={{ padding: '4px 8px', color: 'var(--text-3)', fontSize: 10, textAlign: 'right', fontFamily: 'monospace' }}>{hora}</td>
                {DIAS.map((dia) => {
                  const sel = isSelected(value, dia, hora);
                  return (
                    <td key={dia} style={{ padding: '2px' }}>
                      <div
                        onMouseDown={() => { if (!readonly) { setDragging(true); setDragStart({ dia, hora }); setDragMode(sel ? 'remove' : 'add'); toggleCell(dia, hora); } }}
                        onMouseEnter={() => { if (dragging && !readonly) toggleCell(dia, hora); }}
                        onMouseUp={() => setDragging(false)}
                        style={{
                          width: '100%',
                          height: 24,
                          borderRadius: 4,
                          background: sel ? 'var(--primary)' : '#fff',
                          border: `1px solid ${sel ? 'var(--primary)' : 'var(--border)'}`,
                          cursor: readonly ? 'default' : 'pointer',
                          transition: 'background .12s',
                          boxShadow: sel ? '0 2px 6px rgba(93,70,184,0.20)' : 'none',
                        }}
                      />
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {value.length > 0 && (
        <div style={{ marginTop: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', borderRadius: 10, background: 'var(--primary-light)' }}>
          <span style={{ fontSize: 12, color: 'var(--primary-dark)', fontWeight: 500 }}>
            <strong>{value.length}</strong> slot{value.length !== 1 ? 's' : ''} selecionado{value.length !== 1 ? 's' : ''}
          </span>
          {!readonly && (
            <button type="button" onClick={() => onChange([])} style={{ background: 'transparent', border: 0, cursor: 'pointer', color: 'var(--primary)', fontSize: 12, fontWeight: 500 }}>
              Limpar
            </button>
          )}
        </div>
      )}
    </div>
  );
};
