import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

type TabItem = { to: string; label: string; icon: string };

const icn = (id: string, active: boolean) => {
  const c = active ? 'var(--primary)' : 'rgba(60,60,67,0.45)';
  const w = '1.8';
  switch (id) {
    case 'cards':
      return <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><rect x="3" y="5" width="18" height="14" rx="3" stroke={c} strokeWidth={w}/><path d="M3 10h18" stroke={c} strokeWidth={w}/></svg>;
    case 'nova':
      return <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke={c} strokeWidth={w}/><path d="M12 8v8M8 12h8" stroke={c} strokeWidth={w} strokeLinecap="round"/></svg>;
    case 'agenda':
      return <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><rect x="3" y="4" width="18" height="18" rx="3" stroke={c} strokeWidth={w}/><path d="M3 9h18M8 2v4M16 2v4" stroke={c} strokeWidth={w} strokeLinecap="round"/></svg>;
    case 'avaliar':
      return <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M12 2l3 6h6l-5 4 2 6-6-4-6 4 2-6-5-4h6z" stroke={c} strokeWidth={w} strokeLinejoin="round"/></svg>;
    case 'feed':
      return <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M9 3L3 5v16l6-2 6 2 6-2V3l-6 2-6-2z" stroke={c} strokeWidth={w} strokeLinejoin="round"/><path d="M9 3v16M15 5v16" stroke={c} strokeWidth={w}/></svg>;
    case 'horas':
      return <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke={c} strokeWidth={w}/><path d="M12 7v5l3 2" stroke={c} strokeWidth={w} strokeLinecap="round"/></svg>;
    case 'disputas':
      return <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M12 2L2 22h20L12 2z" stroke={c} strokeWidth={w} strokeLinejoin="round"/><path d="M12 9v6M12 18v.5" stroke={c} strokeWidth={w} strokeLinecap="round"/></svg>;
    case 'conta':
      return <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="8" r="4" stroke={c} strokeWidth={w}/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke={c} strokeWidth={w} strokeLinecap="round"/></svg>;
    default:
      return null;
  }
};

const ALUNO_TABS: TabItem[] = [
  { to: '/aluno',             label: 'Início',    icon: 'cards' },
  { to: '/aluno/novo-card',   label: 'Nova',      icon: 'nova' },
  { to: '/aluno/agendamentos',label: 'Agenda',    icon: 'agenda' },
  { to: '/aluno/avaliar',     label: 'Avaliar',   icon: 'avaliar' },
  { to: '/aluno/conta',       label: 'Conta',     icon: 'conta' },
];

const MENTOR_TABS: TabItem[] = [
  { to: '/mentor/feed',          label: 'Descobrir', icon: 'feed' },
  { to: '/mentor/agendamentos',  label: 'Agenda',    icon: 'agenda' },
  { to: '/mentor/horas',         label: 'Horas',     icon: 'horas' },
  { to: '/mentor/contestacao',   label: 'Disputa',   icon: 'disputas' },
  { to: '/mentor/conta',         label: 'Conta',     icon: 'conta' },
];

const PROFESSOR_TABS: TabItem[] = [
  { to: '/professor/feed',         label: 'Descobrir', icon: 'feed' },
  { to: '/professor/agendamentos', label: 'Agenda',    icon: 'agenda' },
  { to: '/professor/conta',        label: 'Conta',     icon: 'conta' },
];

export const MobileTabBar: React.FC = () => {
  const { user } = useAuth();
  if (!user) return null;

  const tabs =
    user.papel === 'ALUNO'            ? ALUNO_TABS :
    user.papel === 'ALUNO_MENTOR'     ? MENTOR_TABS :
    user.papel === 'PROFESSOR_MENTOR' ? PROFESSOR_TABS :
    null;

  if (!tabs) return null;

  const rootPaths = ['/aluno', '/mentor/feed', '/professor/feed'];

  return (
    <div style={{
      display: 'flex', alignItems: 'stretch',
      background: 'rgba(255,255,255,0.94)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      borderTop: '0.5px solid rgba(60,60,67,0.15)',
    }}>
      {tabs.map((tab) => (
        <NavLink
          key={tab.to}
          to={tab.to}
          end={rootPaths.includes(tab.to)}
          style={{ flex: 1, textDecoration: 'none' }}
        >
          {({ isActive }) => (
            <div style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              justifyContent: 'center', padding: '8px 2px 6px', gap: 3,
            }}>
              {icn(tab.icon, isActive)}
              <span style={{
                fontSize: 9.5, fontWeight: isActive ? 600 : 400,
                color: isActive ? 'var(--primary)' : 'rgba(60,60,67,0.55)',
                fontFamily: 'var(--f-body)', lineHeight: 1,
              }}>{tab.label}</span>
            </div>
          )}
        </NavLink>
      ))}
    </div>
  );
};
