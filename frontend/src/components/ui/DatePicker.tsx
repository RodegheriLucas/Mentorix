import React, { useState, useEffect, useRef } from 'react';

export interface DatePickerProps {
  value: string;          // YYYY-MM-DD
  onChange: (v: string) => void;
  min?: string;           // YYYY-MM-DD  — dias anteriores ficam desabilitados
  max?: string;           // YYYY-MM-DD
  placeholder?: string;
  label?: string;
}

const WEEKDAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const MONTHS = [
  'Janeiro','Fevereiro','Março','Abril','Maio','Junho',
  'Julho','Agosto','Setembro','Outubro','Novembro','Dezembro',
];

function parseIso(iso: string): [number, number, number] {
  const [y, m, d] = iso.split('-').map(Number);
  return [y, m, d];
}

function toIso(year: number, month: number, day: number): string {
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

function deriveDiaSemana(iso: string): string {
  if (!iso) return '';
  const [y, m, d] = parseIso(iso);
  return new Date(y, m - 1, d).toLocaleDateString('pt-BR', { weekday: 'long' });
}

function formatDisplay(iso: string): string {
  if (!iso) return '';
  const [y, m, d] = parseIso(iso);
  const day = deriveDiaSemana(iso);
  const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
  return `${capitalize(day)}, ${String(d).padStart(2, '0')}/${String(m).padStart(2, '0')}/${y}`;
}

function daysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

function firstWeekday(year: number, month: number): number {
  return new Date(year, month - 1, 1).getDay();
}

function todayIso(): string {
  return new Date().toISOString().split('T')[0];
}

export const DatePicker: React.FC<DatePickerProps> = ({
  value,
  onChange,
  min,
  max,
  placeholder = 'Selecionar data',
  label,
}) => {
  const today = todayIso();
  const effectiveMin = min ?? today;

  // initialize calendar view to current value or today
  const initYear = value ? parseIso(value)[0] : new Date().getFullYear();
  const initMonth = value ? parseIso(value)[1] : new Date().getMonth() + 1;

  const [open, setOpen] = useState(false);
  const [viewYear, setViewYear] = useState(initYear);
  const [viewMonth, setViewMonth] = useState(initMonth);
  const ref = useRef<HTMLDivElement>(null);

  // Sync view when value changes externally
  useEffect(() => {
    if (value) {
      const [y, m] = parseIso(value);
      setViewYear(y);
      setViewMonth(m);
    }
  }, [value]);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const prevMonth = () => {
    if (viewMonth === 1) { setViewYear((y) => y - 1); setViewMonth(12); }
    else setViewMonth((m) => m - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 12) { setViewYear((y) => y + 1); setViewMonth(1); }
    else setViewMonth((m) => m + 1);
  };

  const totalDays = daysInMonth(viewYear, viewMonth);
  const startPad = firstWeekday(viewYear, viewMonth);
  const cells: (number | null)[] = [
    ...Array(startPad).fill(null),
    ...Array.from({ length: totalDays }, (_, i) => i + 1),
  ];

  const selectDay = (day: number) => {
    const iso = toIso(viewYear, viewMonth, day);
    onChange(iso);
    setOpen(false);
  };

  const isDisabled = (day: number) => {
    const iso = toIso(viewYear, viewMonth, day);
    if (effectiveMin && iso < effectiveMin) return true;
    if (max && iso > max) return true;
    return false;
  };

  const isSelected = (day: number) => value === toIso(viewYear, viewMonth, day);
  const isToday = (day: number) => today === toIso(viewYear, viewMonth, day);

  // Can navigate back?
  const canPrev = () => {
    if (!effectiveMin) return true;
    const [minY, minM] = parseIso(effectiveMin);
    return viewYear > minY || (viewYear === minY && viewMonth > minM);
  };

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      {label && (
        <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-2)', marginBottom: 5 }}>
          {label}
        </div>
      )}

      {/* Trigger — div to avoid nested <button> violation */}
      <div
        role="button"
        tabIndex={0}
        onClick={() => setOpen((o) => !o)}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setOpen((o) => !o); }}
        style={{
          width: '100%', textAlign: 'left',
          padding: '10px 12px', borderRadius: 12,
          border: open ? '1.5px solid var(--primary)' : '1px solid var(--border)',
          background: '#fff', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8,
          fontFamily: 'var(--f-body)', fontSize: 13,
          color: value ? 'var(--text)' : 'var(--text-3)',
          transition: 'border-color 0.15s',
          boxSizing: 'border-box',
          userSelect: 'none',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, minWidth: 0 }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
            <rect x="3" y="4" width="18" height="18" rx="3" stroke={value ? 'var(--primary)' : 'var(--text-3)'} strokeWidth="1.8" fill="none"/>
            <path d="M3 9h18M8 2v4M16 2v4" stroke={value ? 'var(--primary)' : 'var(--text-3)'} strokeWidth="1.8" strokeLinecap="round"/>
          </svg>
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {value ? formatDisplay(value) : placeholder}
          </span>
        </div>
        {value && (
          <span
            role="button"
            tabIndex={0}
            aria-label="Limpar data"
            onClick={(e) => { e.stopPropagation(); onChange(''); }}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.stopPropagation(); onChange(''); } }}
            style={{ padding: '0 2px', cursor: 'pointer', color: 'var(--text-3)', lineHeight: 1, display: 'flex' }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
              <path d="M6 6l12 12M18 6l-12 12" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"/>
            </svg>
          </span>
        )}
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0, transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
          <path d="M6 9l6 6 6-6" stroke="var(--text-3)" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      </div>

      {/* Calendar dropdown */}
      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 6px)', left: 0, zIndex: 300,
          background: '#fff', borderRadius: 16, padding: '16px',
          border: '1px solid var(--border)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.14)',
          width: 288, boxSizing: 'border-box',
          animation: 'mxFadeIn 0.15s ease',
        }}>
          {/* Month navigation */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <button
              type="button"
              onClick={prevMonth}
              disabled={!canPrev()}
              style={{
                background: 'none', border: 'none', cursor: canPrev() ? 'pointer' : 'not-allowed',
                padding: '4px 8px', borderRadius: 8, color: canPrev() ? 'var(--text)' : 'var(--text-3)',
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </button>

            <span style={{ fontFamily: 'var(--f-head)', fontWeight: 700, fontSize: 14, color: 'var(--text)' }}>
              {MONTHS[viewMonth - 1]} {viewYear}
            </span>

            <button
              type="button"
              onClick={nextMonth}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px 8px', borderRadius: 8, color: 'var(--text)' }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </button>
          </div>

          {/* Weekday headers */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', marginBottom: 6 }}>
            {WEEKDAYS.map((w) => (
              <div key={w} style={{
                textAlign: 'center', fontSize: 10, fontWeight: 700,
                color: 'var(--text-3)', padding: '2px 0', textTransform: 'uppercase', letterSpacing: 0.3,
              }}>{w}</div>
            ))}
          </div>

          {/* Day grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2 }}>
            {cells.map((day, i) => {
              if (!day) return <div key={`e-${i}`}/>;
              const disabled = isDisabled(day);
              const selected = isSelected(day);
              const todayCell = isToday(day);
              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => !disabled && selectDay(day)}
                  disabled={disabled}
                  style={{
                    aspectRatio: '1', borderRadius: 8, border: 'none',
                    fontSize: 12, fontWeight: selected ? 700 : todayCell ? 600 : 400,
                    cursor: disabled ? 'not-allowed' : 'pointer',
                    background: selected
                      ? 'linear-gradient(135deg, var(--primary), var(--primary-dark))'
                      : todayCell
                        ? 'var(--primary-light)'
                        : 'transparent',
                    color: selected ? '#fff' : disabled ? 'var(--text-3)' : todayCell ? 'var(--primary-dark)' : 'var(--text)',
                    transition: 'background 0.12s',
                    opacity: disabled ? 0.4 : 1,
                  }}
                  onMouseEnter={(e) => {
                    if (!disabled && !selected) (e.currentTarget as HTMLButtonElement).style.background = 'var(--primary-light)';
                  }}
                  onMouseLeave={(e) => {
                    if (!selected && !todayCell) (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
                    if (!selected && todayCell) (e.currentTarget as HTMLButtonElement).style.background = 'var(--primary-light)';
                  }}
                >
                  {day}
                </button>
              );
            })}
          </div>

          {/* Selected date pill */}
          {value && (
            <div style={{
              marginTop: 12, padding: '8px 12px', borderRadius: 10,
              background: 'var(--primary-light)',
              display: 'flex', alignItems: 'center', gap: 6,
            }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                <path d="M20 6L9 17l-5-5" stroke="var(--primary)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--primary-dark)' }}>
                {formatDisplay(value)}
              </span>
            </div>
          )}
        </div>
      )}

      <style>{`@keyframes mxFadeIn { from { opacity:0; transform:translateY(-6px); } to { opacity:1; transform:none; } }`}</style>
    </div>
  );
};
