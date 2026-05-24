import React from 'react';

// ── MxLogo ────────────────────────────────────────────────────
export function MxLogo({ size = 22, color = 'var(--primary)' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <path d="M5 24V8L11 18L17 8V24" stroke={color} strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx="25" cy="11" r="3" fill={color}/>
      <path d="M17 18L22.5 13" stroke={color} strokeWidth="2.4" strokeLinecap="round"/>
    </svg>
  );
}

// ── Status metadata ────────────────────────────────────────────
export const STATUS_META: Record<string, { label: string; bg: string; fg: string; dot: string }> = {
  ABERTO:          { label: 'Aberto',           bg: 'var(--primary-light)', fg: 'var(--primary-dark)', dot: 'var(--primary)' },
  ACEITO:          { label: 'Aceito',           bg: 'var(--primary-light)', fg: 'var(--primary-dark)', dot: 'var(--primary)' },
  PENDENTE_GESTOR: { label: 'Pendente gestor',  bg: '#FFF7E0',              fg: '#7A5B00',              dot: '#E0A800' },
  AGENDADO:        { label: 'Agendado',         bg: 'var(--accent-light)',  fg: 'var(--accent-dark)',  dot: 'var(--accent)' },
  EM_ANDAMENTO:    { label: 'Em andamento',     bg: 'var(--secondary-light)', fg: 'var(--secondary-dark)', dot: 'var(--secondary)' },
  CONCLUIDO:       { label: 'Concluído',        bg: 'var(--secondary-light)', fg: 'var(--secondary-dark)', dot: 'var(--secondary)' },
  CANCELADO:       { label: 'Cancelado',        bg: '#FFEBEE',              fg: 'var(--accent-dark)',  dot: 'var(--accent-dark)' },
  EXPIRADO:        { label: 'Expirado',         bg: '#F5F5F5',              fg: '#757575',              dot: '#9E9E9E' },
};

// ── StatusPill ────────────────────────────────────────────────
export function StatusPill({ status, pulse = false, size = 'md' }: { status: string; pulse?: boolean; size?: 'sm' | 'md' }) {
  const m = STATUS_META[status];
  if (!m) return null;
  const padding = size === 'sm' ? '3px 8px 3px 7px' : '4px 10px 4px 8px';
  const fontSize = size === 'sm' ? 11 : 12;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      padding, borderRadius: 999,
      background: m.bg, color: m.fg,
      fontFamily: 'var(--f-body)', fontSize, fontWeight: 500,
      letterSpacing: -0.1, whiteSpace: 'nowrap',
    }}>
      <span className={pulse ? 'mx-pulse' : ''} style={{
        width: 8, height: 8, borderRadius: '50%', background: m.dot, flexShrink: 0,
      }}/>
      {m.label}
    </span>
  );
}

// ── Avatar ────────────────────────────────────────────────────
export function Avatar({ initials, color, size = 44 }: { initials: string; color?: string; size?: number }) {
  const grad = color || 'linear-gradient(135deg, #6f5ad0 0%, #4632a0 100%)';
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%', flexShrink: 0,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: 'var(--f-head)', fontWeight: 700, color: '#fff',
      background: grad, fontSize: size * 0.36,
    }}>
      {initials}
    </div>
  );
}

// ── TopicBadge ────────────────────────────────────────────────
type TopicTone = 'primary' | 'accent' | 'green' | 'gray' | 'on';
export function TopicBadge({ children, tone = 'primary' }: { children: React.ReactNode; tone?: TopicTone }) {
  const map: Record<TopicTone, { bg: string; fg: string }> = {
    primary: { bg: 'var(--primary-light)', fg: 'var(--primary-dark)' },
    accent:  { bg: 'var(--accent-light)',  fg: 'var(--accent-dark)' },
    green:   { bg: 'var(--secondary-light)', fg: 'var(--secondary-dark)' },
    gray:    { bg: '#F1F1F4', fg: 'var(--text-2)' },
    on:      { bg: 'var(--primary)', fg: '#fff' },
  };
  const c = map[tone];
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 3,
      padding: '4px 10px', borderRadius: 999,
      background: c.bg, color: c.fg,
      fontFamily: 'var(--f-body)', fontSize: 12, fontWeight: 500,
      letterSpacing: -0.1, whiteSpace: 'nowrap',
    }}>{children}</span>
  );
}

// ── WhatsAppButton ────────────────────────────────────────────
export function WhatsAppButton({ phone, name }: { phone: string; name: string }) {
  const clean = phone.replace(/\D/g, '');
  return (
    <a
      href={`https://wa.me/55${clean}`}
      target="_blank"
      rel="noreferrer"
      style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        padding: '10px 14px', borderRadius: 12, cursor: 'pointer',
        background: '#25D366', color: '#fff', textDecoration: 'none',
        fontFamily: 'var(--f-body)', fontSize: 13, fontWeight: 600,
        boxShadow: '0 1px 0 rgba(17,80,42,0.25), 0 6px 14px rgba(37,211,102,0.25)',
      }}
    >
      <svg width="16" height="16" viewBox="0 0 32 32" fill="currentColor">
        <path d="M16 3C9 3 3.5 8.5 3.5 15.5c0 2.3.6 4.5 1.7 6.4L3 29l7.4-2.1c1.8 1 3.7 1.5 5.7 1.5 7 0 12.5-5.5 12.5-12.5S23 3 16 3Zm7.4 17.6c-.3.9-1.7 1.8-2.5 1.9-.6.1-1.4.1-2.3-.2-.5-.2-1.2-.4-2-.8-3.6-1.6-5.9-5.2-6.1-5.4-.2-.2-1.5-2-1.5-3.8 0-1.9.9-2.8 1.3-3.2.3-.4.7-.5 1-.5h.7c.2 0 .5-.1.8.6.3.7 1 2.5 1.1 2.7.1.2.1.4 0 .7-.1.2-.2.4-.4.6-.2.2-.4.5-.6.6-.2.2-.4.4-.2.8.2.4 1 1.6 2.1 2.6 1.4 1.3 2.6 1.7 3 1.9.4.2.6.2.8-.1.2-.3.9-1 1.1-1.4.2-.4.4-.3.7-.2.3.1 2 1 2.4 1.1.4.2.6.3.7.5.1.1.1.7-.2 1.4Z" />
      </svg>
      Falar com {name.split(' ')[0]}
    </a>
  );
}

// ── TimelineDot ───────────────────────────────────────────────
function TimelineDot({ done, accent }: { done: boolean; accent: string }) {
  if (done) {
    return (
      <span style={{
        width: 14, height: 14, borderRadius: '50%', background: accent,
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
      }}>
        <svg width="8" height="8" viewBox="0 0 24 24" fill="none">
          <path d="M4 12.5L9 17.5L20 6.5" stroke="#fff" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </span>
    );
  }
  return (
    <span style={{
      width: 14, height: 14, borderRadius: '50%', flexShrink: 0,
      background: '#fff', border: '2px dashed var(--text-3)', boxSizing: 'border-box',
    }}/>
  );
}

// ── CheckInOutCard ────────────────────────────────────────────
interface CheckInOutData {
  status: string;
  sala?: string;
  when?: string;
  duracao?: string;
  checkinAt?: string;
  checkoutAt?: string;
  checkinPrev?: string;
  checkoutPrev?: string;
  elapsed?: string;
}

export function CheckInOutCard({ c }: { c: CheckInOutData }) {
  const isLive = c.status === 'EM_ANDAMENTO';
  const isDone = c.status === 'CONCLUIDO';

  const checkin = c.checkinAt || c.checkinPrev || '—';
  const checkout = c.checkoutAt || c.checkoutPrev || '—';
  const checkinDone = !!c.checkinAt;
  const checkoutDone = !!c.checkoutAt;

  const progress = isLive ? 0.2 : isDone ? 1.0 : 0.0;

  const tone = isLive || isDone
    ? { bg: 'var(--secondary-light)', accent: 'var(--secondary)', dark: 'var(--secondary-dark)' }
    : { bg: 'var(--accent-light)', accent: 'var(--accent)', dark: 'var(--accent-dark)' };

  return (
    <div style={{
      padding: 14, borderRadius: 14,
      background: tone.bg,
      border: `1px solid ${isLive ? 'var(--secondary)' : 'transparent'}`,
      position: 'relative', overflow: 'hidden',
    }}>
      <div style={{
        display: 'grid', gridTemplateColumns: '1fr auto 1fr',
        gap: 12, alignItems: 'flex-end', marginBottom: 12,
      }}>
        <div>
          <div style={{
            fontSize: 10, fontWeight: 700, letterSpacing: 0.6, textTransform: 'uppercase',
            color: checkinDone ? tone.dark : 'var(--text-3)',
            display: 'flex', alignItems: 'center', gap: 4, marginBottom: 4,
          }}>
            <TimelineDot done={checkinDone} accent={tone.accent}/>
            check-in
          </div>
          <div style={{
            fontFamily: 'var(--f-head)', fontWeight: 700, fontSize: 22,
            color: checkinDone ? 'var(--text)' : 'var(--text-2)',
            lineHeight: 1, letterSpacing: -0.3,
          }}>{checkin}</div>
          <div style={{ fontSize: 10.5, color: checkinDone ? tone.dark : 'var(--text-3)', marginTop: 3, fontWeight: 500 }}>
            {checkinDone ? '✓ confirmado' : 'previsto'}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, paddingBottom: 4 }}>
          <span style={{ fontSize: 9, color: 'var(--text-3)', fontWeight: 600, letterSpacing: 0.5, textTransform: 'uppercase' }}>
            {isLive ? c.elapsed : isDone ? c.duracao : '1h'}
          </span>
          <svg width="14" height="10" viewBox="0 0 24 16" fill="none">
            <path d="M2 8h18M14 2l6 6-6 6" stroke="var(--text-3)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>

        <div style={{ textAlign: 'right' }}>
          <div style={{
            fontSize: 10, fontWeight: 700, letterSpacing: 0.6, textTransform: 'uppercase',
            color: checkoutDone ? tone.dark : 'var(--text-3)',
            display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 4, marginBottom: 4,
          }}>
            check-out
            <TimelineDot done={checkoutDone} accent={tone.accent}/>
          </div>
          <div style={{
            fontFamily: 'var(--f-head)', fontWeight: 700, fontSize: 22,
            color: checkoutDone ? 'var(--text)' : 'var(--text-2)',
            lineHeight: 1, letterSpacing: -0.3,
          }}>{checkout}</div>
          <div style={{ fontSize: 10.5, color: checkoutDone ? tone.dark : 'var(--text-3)', marginTop: 3, fontWeight: 500 }}>
            {checkoutDone ? '✓ devolvido' : 'previsto'}
          </div>
        </div>
      </div>

      <div style={{ height: 4, borderRadius: 99, background: 'rgba(0,0,0,0.06)', overflow: 'hidden', marginBottom: 8 }}>
        <div style={{
          height: '100%', width: `${progress * 100}%`,
          background: tone.accent, borderRadius: 99,
          transition: 'width .4s ease',
        }}/>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 11, color: 'var(--text-2)', fontWeight: 500 }}>{c.sala}</span>
        <span style={{ fontSize: 11, color: 'var(--text-3)' }}>{c.when}</span>
      </div>
    </div>
  );
}
