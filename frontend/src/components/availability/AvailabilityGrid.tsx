import React, { useState, useEffect } from 'react';

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

  useEffect(() => {
    const handleMouseUp = () => setDragging(false);
    document.addEventListener('mouseup', handleMouseUp);
    return () => document.removeEventListener('mouseup', handleMouseUp);
  }, []);

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
      let idx = HORAS.indexOf(s.hora_inicio);
      while (idx >= 0 && idx < HORAS.length && HORAS[idx] < s.hora_fim) {
        byDia[s.dia_semana].push(HORAS[idx]);
        idx++;
      }
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
                <th key={d} style={{ padding: '8px 4px', color: 'var(--color-text-secondary)', fontSize: 13, fontWeight: 600, textAlign: 'center' }}>{d}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {HORAS.map((hora) => (
              <tr key={hora}>
                <td style={{ padding: '4px 8px', color: 'var(--color-text-muted)', fontSize: 12, textAlign: 'right' }}>{hora}</td>
                {DIAS.map((dia) => {
                  const sel = isSelected(value, dia, hora);
                  return (
                    <td key={dia} style={{ padding: '2px' }}>
                      <div
                        onMouseDown={() => { if (!readonly) { setDragging(true); setDragStart({ dia, hora }); setDragMode(sel ? 'remove' : 'add'); toggleCell(dia, hora); } }}
                        onMouseEnter={() => { if (dragging && !readonly) toggleCell(dia, hora); }}
                        style={{
                          width: '100%',
                          height: 28,
                          borderRadius: 4,
                          background: sel ? 'var(--color-primary)' : 'var(--color-bg-glass)',
                          border: `1px solid ${sel ? 'var(--color-primary)' : 'var(--color-border)'}`,
                          cursor: readonly ? 'default' : 'pointer',
                          transition: 'all 0.15s',
                          boxShadow: sel ? 'var(--shadow-primary)' : 'none',
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

      <div style={{ marginTop: 16, minHeight: 48 }}>
        {value.length > 0 && (
          <>
            <div style={{ fontSize: 12, color: 'var(--color-text-muted)', marginBottom: 8 }}>Horários selecionados:</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {value.map((s, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  background: 'var(--color-primary-light)',
                  border: '1px solid var(--color-primary)',
                  borderRadius: 6, padding: '4px 10px', fontSize: 13,
                }}>
                  <span>📅 {formatSlot(s)}</span>
                  {!readonly && (
                    <button
                      type="button"
                      onClick={() => onChange(value.filter((_, idx) => idx !== i))}
                      style={{ background: 'none', border: 'none', color: 'var(--color-danger)', cursor: 'pointer', fontSize: 14, lineHeight: 1 }}
                    >×</button>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};
