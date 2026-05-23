import React, { useState, useEffect, useRef } from 'react';

export interface TimePickerProps {
  value: string;         // "HH:MM"
  onChange: (v: string) => void;
  placeholder?: string;
  label?: string;
}

const HOURS = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'));
const MINUTES = ['00', '05', '10', '15', '20', '25', '30', '35', '40', '45', '50', '55'];

function parseTime(val: string): [string, string] {
  if (!val) return ['', ''];
  const parts = val.split(':');
  const h = parts[0] || '';
  const rawM = parts[1]?.substring(0, 2) || '';
  // snap to nearest 5-min step
  const num = parseInt(rawM, 10);
  const m = isNaN(num) ? '' : String(Math.min(55, Math.round(num / 5) * 5)).padStart(2, '0');
  return [h, m];
}

export const TimePicker: React.FC<TimePickerProps> = ({
  value,
  onChange,
  placeholder = 'Selecionar hora',
  label,
}) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const hourRef = useRef<HTMLDivElement>(null);
  const minRef = useRef<HTMLDivElement>(null);

  const [selH, selM] = parseTime(value);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  // Auto-scroll to selected item when dropdown opens
  useEffect(() => {
    if (!open) return;
    requestAnimationFrame(() => {
      if (selH && hourRef.current) {
        const idx = HOURS.indexOf(selH);
        const el = hourRef.current.children[idx] as HTMLElement | undefined;
        el?.scrollIntoView({ block: 'center' });
      }
      if (selM && minRef.current) {
        const idx = MINUTES.indexOf(selM);
        const el = minRef.current.children[idx] as HTMLElement | undefined;
        el?.scrollIntoView({ block: 'center' });
      }
    });
  }, [open]);

  const selectH = (h: string) => onChange(`${h}:${selM || '00'}`);
  const selectM = (m: string) => onChange(`${selH || '08'}:${m}`);

  const displayValue = selH && selM ? `${selH}:${selM}` : '';

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      {label && (
        <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-2)', marginBottom: 5 }}>
          {label}
        </div>
      )}

      {/* Trigger */}
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
          color: displayValue ? 'var(--text)' : 'var(--text-3)',
          transition: 'border-color 0.15s',
          boxSizing: 'border-box',
          userSelect: 'none',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1 }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
            <circle cx="12" cy="12" r="9" stroke={displayValue ? 'var(--primary)' : 'var(--text-3)'} strokeWidth="1.8" fill="none"/>
            <path d="M12 7v5l3 2" stroke={displayValue ? 'var(--primary)' : 'var(--text-3)'} strokeWidth="1.8" strokeLinecap="round"/>
          </svg>
          <span>{displayValue || placeholder}</span>
        </div>
        {displayValue && (
          <span
            role="button"
            tabIndex={0}
            aria-label="Limpar hora"
            onClick={(e) => { e.stopPropagation(); onChange(''); }}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.stopPropagation(); onChange(''); } }}
            style={{ padding: '0 2px', cursor: 'pointer', color: 'var(--text-3)', lineHeight: 1, display: 'flex' }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
              <path d="M6 6l12 12M18 6l-12 12" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"/>
            </svg>
          </span>
        )}
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
          style={{ flexShrink: 0, transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
          <path d="M6 9l6 6 6-6" stroke="var(--text-3)" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      </div>

      {/* Dropdown */}
      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 6px)', left: 0, zIndex: 300,
          background: '#fff', borderRadius: 16,
          border: '1px solid var(--border)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.14)',
          width: 200, boxSizing: 'border-box',
          overflow: 'hidden',
          animation: 'mxFadeIn 0.15s ease',
        }}>
          {/* Column headers */}
          <div style={{
            display: 'grid', gridTemplateColumns: '1fr 1fr',
            padding: '10px 0 8px',
            borderBottom: '1px solid var(--border)',
          }}>
            {['Hora', 'Minuto'].map((h) => (
              <div key={h} style={{
                textAlign: 'center', fontSize: 10, fontWeight: 700,
                letterSpacing: 0.6, textTransform: 'uppercase', color: 'var(--text-3)',
              }}>{h}</div>
            ))}
          </div>

          {/* Scrollable columns */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', height: 192 }}>
            {/* Hours */}
            <div ref={hourRef} style={{
              overflowY: 'auto', borderRight: '1px solid var(--border)',
              scrollbarWidth: 'none',
            }}>
              {HOURS.map((h) => {
                const active = h === selH;
                return (
                  <button
                    key={h}
                    type="button"
                    onClick={() => selectH(h)}
                    style={{
                      width: '100%', padding: '8px 0',
                      border: 'none', cursor: 'pointer',
                      fontSize: 13, fontWeight: active ? 700 : 400,
                      background: active
                        ? 'linear-gradient(135deg, var(--primary), var(--primary-dark))'
                        : 'transparent',
                      color: active ? '#fff' : 'var(--text)',
                      transition: 'background 0.1s',
                    }}
                    onMouseEnter={(e) => {
                      if (!active) (e.currentTarget as HTMLButtonElement).style.background = 'var(--primary-light)';
                    }}
                    onMouseLeave={(e) => {
                      if (!active) (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
                    }}
                  >{h}</button>
                );
              })}
            </div>

            {/* Minutes */}
            <div ref={minRef} style={{ overflowY: 'auto', scrollbarWidth: 'none' }}>
              {MINUTES.map((m) => {
                const active = m === selM;
                return (
                  <button
                    key={m}
                    type="button"
                    onClick={() => selectM(m)}
                    style={{
                      width: '100%', padding: '8px 0',
                      border: 'none', cursor: 'pointer',
                      fontSize: 13, fontWeight: active ? 700 : 400,
                      background: active
                        ? 'linear-gradient(135deg, var(--primary), var(--primary-dark))'
                        : 'transparent',
                      color: active ? '#fff' : 'var(--text)',
                      transition: 'background 0.1s',
                    }}
                    onMouseEnter={(e) => {
                      if (!active) (e.currentTarget as HTMLButtonElement).style.background = 'var(--primary-light)';
                    }}
                    onMouseLeave={(e) => {
                      if (!active) (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
                    }}
                  >{m}</button>
                );
              })}
            </div>
          </div>

          {/* Selected time confirmation strip */}
          <div style={{
            padding: '8px 14px',
            borderTop: '1px solid var(--border)',
            background: displayValue ? 'var(--primary-light)' : 'var(--surface)',
            display: 'flex', alignItems: 'center', gap: 6,
            minHeight: 34,
          }}>
            {displayValue ? (
              <>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                  <path d="M20 6L9 17l-5-5" stroke="var(--primary)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--primary-dark)', fontFamily: 'var(--f-head)' }}>
                  {displayValue}
                </span>
              </>
            ) : (
              <span style={{ fontSize: 11, color: 'var(--text-3)' }}>Selecione hora e minuto</span>
            )}
          </div>
        </div>
      )}

      <style>{`
        @keyframes mxFadeIn { from { opacity:0; transform:translateY(-6px); } to { opacity:1; transform:none; } }
        div::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  );
};
