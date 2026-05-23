// shared.jsx — Mentorix shared components

function MxLogo({ size = 22, color = 'var(--primary)' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <path d="M5 24V8L11 18L17 8V24" stroke={color} strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx="25" cy="11" r="3" fill={color}/>
      <path d="M17 18L22.5 13" stroke={color} strokeWidth="2.4" strokeLinecap="round"/>
    </svg>
  );
}

const STATUS_META = {
  ABERTO:           { label: 'Aberto',           bg: 'var(--primary-light)', fg: 'var(--primary-dark)', dot: 'var(--primary)' },
  ACEITO:           { label: 'Aceito',           bg: 'var(--primary-light)', fg: 'var(--primary-dark)', dot: 'var(--primary)' },
  PENDENTE_GESTOR:  { label: 'Pendente gestor',  bg: '#FFF7E0',              fg: '#7A5B00',              dot: '#E0A800' },
  AGENDADO:         { label: 'Agendado',         bg: 'var(--accent-light)',  fg: 'var(--accent-dark)',  dot: 'var(--accent)' },
  EM_ANDAMENTO:     { label: 'Em andamento',     bg: 'var(--secondary-light)', fg: 'var(--secondary-dark)', dot: 'var(--secondary)' },
  CONCLUIDO:        { label: 'Concluído',        bg: 'var(--secondary-light)', fg: 'var(--secondary-dark)', dot: 'var(--secondary)' },
  CANCELADO:        { label: 'Cancelado',        bg: '#FFEBEE',              fg: 'var(--accent-dark)',  dot: 'var(--accent-dark)' },
};

function StatusPill({ status, pulse = false, size = 'md' }) {
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
        width: 8, height: 8, borderRadius: '50%', background: m.dot,
        flexShrink: 0,
      }}/>
      {m.label}
    </span>
  );
}

function Avatar({ initials, color, size = 44 }) {
  const grad = color || 'linear-gradient(135deg, #6f5ad0 0%, #4632a0 100%)';
  return (
    <div className="mx-avatar" style={{ width: size, height: size, background: grad, fontSize: size * 0.36 }}>
      {initials}
    </div>
  );
}

function PhoneScreen({ children, screenLabel, tab, onTab, tabs, header, headerBg = 'rgba(255,255,255,0.92)', hideTabs = false, scrollPadBottom = 24, centerFab }) {
  return (
    <IOSDevice width={390} height={812}>
      <div data-screen-label={screenLabel} style={{
        position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
        background: 'var(--bg)',
      }}>
        <div style={{ height: 47, flexShrink: 0 }} />
        {header && (
          <div style={{
            background: headerBg,
            backdropFilter: 'blur(20px) saturate(180%)',
            WebkitBackdropFilter: 'blur(20px) saturate(180%)',
            borderBottom: '1px solid rgba(0,0,0,0.05)',
            zIndex: 5,
          }}>
            {header}
          </div>
        )}
        <div className="mx-scroll" style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', paddingBottom: scrollPadBottom }}>
          {children}
        </div>
        {!hideTabs && <TabBar active={tab} onTab={onTab} tabs={tabs} centerFab={centerFab}/>}
        <div style={{ height: 22, flexShrink: 0 }} />
      </div>
    </IOSDevice>
  );
}

function TabBar({ active, onTab, tabs, centerFab }) {
  const _tabs = tabs || [
    { id: 'descobrir', label: 'Descobrir' },
    { id: 'mentorias', label: 'Mentorias' },
    { id: 'horas',     label: 'Horas' },
    { id: 'perfil',    label: 'Perfil' },
  ];
  const iconFor = (id, a) => {
    const stroke = a ? 'var(--primary)' : 'var(--text-3)';
    if (id === 'descobrir' || id === 'mapa')
      return (<svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path d="M9 3L3 5v16l6-2 6 2 6-2V3l-6 2-6-2z" stroke={stroke} strokeWidth="1.8" strokeLinejoin="round"/>
        <path d="M9 3v16M15 5v16" stroke={stroke} strokeWidth="1.8"/>
      </svg>);
    if (id === 'inicio')
      return (<svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path d="M3 11l9-8 9 8v9a2 2 0 0 1-2 2h-4v-7h-6v7H5a2 2 0 0 1-2-2z" stroke={stroke} strokeWidth="1.8" strokeLinejoin="round" fill="none"/>
      </svg>);
    if (id === 'solicitar' || id === 'nova')
      return (<svg width="26" height="26" viewBox="0 0 24 24" fill="none">
        <path d="M12 5v14M5 12h14" stroke={stroke} strokeWidth="2.4" strokeLinecap="round"/>
      </svg>);
    if (id === 'solicitacoes')
      // "Hand raised" - mais condizente com "solicitar ajuda"
      return (<svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path d="M9 12V5a1.5 1.5 0 0 1 3 0v6M12 11V3.5a1.5 1.5 0 0 1 3 0V11M15 11V5a1.5 1.5 0 0 1 3 0v9c0 4.4-3.1 7-7 7-2.8 0-4.6-1-5.8-3.1L3 14.4c-.4-.7-.2-1.6.4-2 .8-.5 1.8-.3 2.4.4L9 17V8.5a1.5 1.5 0 0 1 3 0V11"
          stroke={stroke} strokeWidth="1.8" strokeLinejoin="round" fill="none"/>
      </svg>);
    if (id === 'mentorias')
      return (<svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <rect x="3" y="4" width="18" height="18" rx="3" stroke={stroke} strokeWidth="1.8"/>
        <path d="M3 9h18M8 2v4M16 2v4M8 14h2M14 14h2M8 18h2" stroke={stroke} strokeWidth="1.8" strokeLinecap="round"/>
      </svg>);
    if (id === 'historico')
      return (<svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path d="M3.5 12a8.5 8.5 0 1 0 2.5-6M3 4v5h5" stroke={stroke} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M12 7v5l3 2" stroke={stroke} strokeWidth="1.8" strokeLinecap="round"/>
      </svg>);
    if (id === 'notificacoes')
      return (<svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path d="M6 9a6 6 0 1 1 12 0c0 4 2 5 2 7H4c0-2 2-3 2-7zM10 19a2 2 0 0 0 4 0" stroke={stroke} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>);
    if (id === 'horas')
      return (<svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="9" stroke={stroke} strokeWidth="1.8"/>
        <path d="M12 7v5l3 2" stroke={stroke} strokeWidth="2" strokeLinecap="round"/>
      </svg>);
    if (id === 'perfil')
      return (<svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="8" r="4" stroke={stroke} strokeWidth="1.8"/>
        <path d="M4 20c1.5-3.5 4.5-5 8-5s6.5 1.5 8 5" stroke={stroke} strokeWidth="1.8" strokeLinecap="round"/>
      </svg>);
    return null;
  };

  // With centerFab: split tabs around center slot
  const halfTabs = centerFab ? Math.floor(_tabs.length / 2) : null;
  const leftTabs  = centerFab ? _tabs.slice(0, halfTabs) : _tabs;
  const rightTabs = centerFab ? _tabs.slice(halfTabs) : [];

  const renderTab = (t) => {
    const isActive = active === t.id;
    return (
      <button key={t.id} onClick={() => onTab && onTab(t.id)} style={{
        flex: 1,
        background: 'transparent', border: 0, cursor: 'pointer',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
        padding: '6px 4px', borderRadius: 12,
        color: isActive ? 'var(--primary)' : 'var(--text-3)',
        fontFamily: 'var(--f-body)', fontSize: 10.5, fontWeight: 500,
      }}>
        {iconFor(t.id, isActive)}
        <span>{t.label}</span>
      </button>
    );
  };

  return (
    <div style={{
      flexShrink: 0, position: 'relative',
      display: 'flex', alignItems: 'center',
      padding: '8px 12px 6px',
      background: 'rgba(255,255,255,0.96)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      borderTop: '1px solid rgba(0,0,0,0.06)',
    }}>
      {leftTabs.map(renderTab)}
      {centerFab && (
        <>
          <div style={{ flex: 1 }}/>
          <button onClick={centerFab.onClick} aria-label={centerFab.label} style={{
            position: 'absolute', top: 0, left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 58, height: 58, borderRadius: '50%',
            border: '4px solid #fff',
            background: 'var(--primary)',
            cursor: 'pointer', padding: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 6px 18px rgba(93,70,184,0.40), 0 2px 4px rgba(58,40,133,0.30)',
            zIndex: 6,
          }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path d="M12 5v14M5 12h14" stroke="#fff" strokeWidth="2.6" strokeLinecap="round"/>
            </svg>
          </button>
          {/* Pequeno label sob o FAB, no nível dos outros tabs */}
          <div style={{
            position: 'absolute', top: 38, left: '50%', transform: 'translateX(-50%)',
            fontFamily: 'var(--f-body)', fontSize: 10.5, fontWeight: 600,
            color: 'var(--primary)', whiteSpace: 'nowrap', pointerEvents: 'none',
          }}>{centerFab.label}</div>
        </>
      )}
      {rightTabs.map(renderTab)}
    </div>
  );
}

// Compact badge for assuntos (#SQL)
function TopicBadge({ children, tone = 'primary' }) {
  const map = {
    primary: { bg: 'var(--primary-light)', fg: 'var(--primary-dark)' },
    accent:  { bg: 'var(--accent-light)',  fg: 'var(--accent-dark)' },
    green:   { bg: 'var(--secondary-light)', fg: 'var(--secondary-dark)' },
    gray:    { bg: '#F1F1F4', fg: 'var(--text-2)' },
    on:      { bg: 'var(--primary)', fg: '#fff' },
  };
  const c = map[tone] || map.primary;
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

// Mocked datasets used across screens
const TOPICS = [
  'SQL', 'Postgres', 'Indexação',
  'React', 'TypeScript', 'Hooks',
  'Python', 'Pandas', 'Estatística',
  'Cálculo II', 'Álgebra Linear',
  'UX/UI', 'Figma',
  'C', 'Git', 'CI/CD',
];

Object.assign(window, {
  MxLogo, StatusPill, Avatar, PhoneScreen, TabBar, TopicBadge,
  STATUS_META, TOPICS,
});
