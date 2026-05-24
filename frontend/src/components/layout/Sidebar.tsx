import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { MxLogo, Avatar } from '../ui/DesignSystem';

interface NavItem {
  to: string;
  label: string;
  roles?: string[];
}

const iconFor = (id: string, active: boolean) => {
  const s = active ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.65)';
  const w = '1.8';
  if (id === 'portaria' )
    return <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2h-4v-7H9v7H5a2 2 0 0 1-2-2z" stroke={s} strokeWidth={w} fill="none" strokeLinejoin="round"/></svg>;
  if (id === 'agenda')
    return <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><rect x="3" y="4" width="18" height="18" rx="3" stroke={s} strokeWidth={w} fill="none"/><path d="M3 9h18M8 2v4M16 2v4" stroke={s} strokeWidth={w} strokeLinecap="round"/></svg>;
  if (id === 'ambientes')
    return <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><rect x="3" y="5" width="18" height="14" rx="2" stroke={s} strokeWidth={w} fill="none"/><path d="M3 12h18M8 5v14M16 5v14" stroke={s} strokeWidth={w}/></svg>;
  if (id === 'disputas')
    return <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M12 2L2 22h20L12 2z" stroke={s} strokeWidth={w} fill="none" strokeLinejoin="round"/><path d="M12 9v6M12 18v.5" stroke={s} strokeWidth={w} strokeLinecap="round"/></svg>;
  if (id === 'feed')
    return <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M9 3L3 5v16l6-2 6 2 6-2V3l-6 2-6-2z" stroke={s} strokeWidth={w} strokeLinejoin="round"/><path d="M9 3v16M15 5v16" stroke={s} strokeWidth={w}/></svg>;
  if (id === 'horas')
    return <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke={s} strokeWidth={w}/><path d="M12 7v5l3 2" stroke={s} strokeWidth={w} strokeLinecap="round"/></svg>;
  if (id === 'historico')
    return <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke={s} strokeWidth={w}/><path d="M12 7v5l3 2" stroke={s} strokeWidth={w} strokeLinecap="round"/></svg>;
  if (id === 'contestacao')
    return <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M12 2L2 22h20L12 2z" stroke={s} strokeWidth={w} fill="none" strokeLinejoin="round"/><path d="M12 9v6M12 18v.5" stroke={s} strokeWidth={w} strokeLinecap="round"/></svg>;
  // default: cards/list
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><rect x="3" y="4" width="18" height="18" rx="3" stroke={s} strokeWidth={w} fill="none"/><path d="M3 9h18M8 2v4M16 2v4" stroke={s} strokeWidth={w} strokeLinecap="round"/></svg>;
};

const navItems: Array<NavItem & { iconId: string; }> = [
  // ALUNO
  { to: '/aluno', label: 'Início', iconId: 'agenda', roles: ['ALUNO'] },
  { to: '/aluno/agendamentos', label: 'Agenda', iconId: 'agenda', roles: ['ALUNO'] },
  { to: '/aluno/historico', label: 'Histórico', iconId: 'historico', roles: ['ALUNO'] },
  { to: '/aluno/novo-card', label: 'Nova Solicitação', iconId: 'nova', roles: ['ALUNO'] },
  // MENTOR
  { to: '/mentor', label: 'Dashboard', iconId: 'portaria', roles: ['ALUNO_MENTOR'] },
  { to: '/mentor/feed', label: 'Descobrir', iconId: 'feed', roles: ['ALUNO_MENTOR'] },
  { to: '/mentor/agendamentos', label: 'Mentorias', iconId: 'agenda', roles: ['ALUNO_MENTOR'] },
  { to: '/mentor/horas', label: 'Minhas Horas', iconId: 'horas', roles: ['ALUNO_MENTOR'] },
  { to: '/mentor/contestacao', label: 'Contestações', iconId: 'contestacao', roles: ['ALUNO_MENTOR'] },
  // PROFESSOR
  { to: '/professor', label: 'Dashboard', iconId: 'portaria', roles: ['PROFESSOR_MENTOR'] },
  { to: '/professor/feed', label: 'Feed TCC', iconId: 'feed', roles: ['PROFESSOR_MENTOR'] },
  { to: '/professor/agendamentos', label: 'Orienta\u00e7\u00f5es', iconId: 'agenda', roles: ['PROFESSOR_MENTOR'] },
  { to: '/professor/historico', label: 'Hist\u00f3rico', iconId: 'historico', roles: ['PROFESSOR_MENTOR'] },
  // GESTOR
  { to: '/gestor/portaria', label: 'Painel de Portaria', iconId: 'portaria', roles: ['GESTOR'] },
  { to: '/gestor/ambientes', label: 'Ambientes', iconId: 'ambientes', roles: ['GESTOR'] },
  { to: '/gestor/disputas', label: 'Disputas', iconId: 'disputas', roles: ['GESTOR'] },
];

export const Sidebar: React.FC = () => {
  const { user, logout } = useAuth();

  const filtered = navItems.filter(
    (item) => !item.roles || (user && item.roles.includes(user.papel)),
  );

  const initials = user?.nome
    ? user.nome.split(' ').map((p: string) => p[0]).slice(0, 2).join('').toUpperCase()
    : '??';

  const rolePt: Record<string, string> = {
    ALUNO: 'Aluno',
    ALUNO_MENTOR: 'Mentor',
    PROFESSOR_MENTOR: 'Orientador',
    GESTOR: 'Gestor',
  };

  return (
    <nav style={{
      position: 'fixed', left: 0, top: 0, bottom: 0,
      width: 'var(--sidebar-width)',
      background: 'var(--primary-dark)',
      display: 'flex', flexDirection: 'column',
      padding: '0', zIndex: 100,
    }}>
      {/* Logo */}
      <div style={{
        padding: '20px 16px 16px',
        display: 'flex', alignItems: 'center', gap: 10,
      }}>
        <MxLogo size={22} color="#fff"/>
        <span style={{ fontFamily: 'var(--f-head)', fontWeight: 700, fontSize: 18, color: '#fff', letterSpacing: -0.3 }}>
          mentorix
        </span>
        <span style={{
          fontFamily: 'var(--f-body)', fontSize: 10, fontWeight: 600, letterSpacing: 0.6,
          background: 'rgba(255,255,255,0.15)', padding: '2px 6px', borderRadius: 6,
          color: 'rgba(255,255,255,0.85)', textTransform: 'uppercase',
        }}>{user?.papel ? rolePt[user.papel] : ''}</span>
      </div>

      {/* Nav items */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '8px 10px' }}>
        {filtered.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/aluno' || item.to === '/mentor' || item.to === '/professor' || item.to === '/gestor'}
            style={({ isActive }) => ({
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '10px 12px', borderRadius: 10, marginBottom: 2,
              color: isActive ? '#fff' : 'rgba(255,255,255,0.72)',
              background: isActive ? 'rgba(255,255,255,0.14)' : 'transparent',
              fontSize: 14, fontWeight: isActive ? 600 : 400,
              textDecoration: 'none', transition: 'all 0.15s',
            })}
          >
            {({ isActive }) => (
              <>
                {iconFor(item.iconId, isActive)}
                {item.label}
              </>
            )}
          </NavLink>
        ))}
      </div>

      {/* User footer */}
      <div style={{ padding: '12px 14px 20px' }}>
        <div style={{
          padding: 12, borderRadius: 12, background: 'rgba(0,0,0,0.22)',
          display: 'flex', alignItems: 'center', gap: 10,
        }}>
          <Avatar initials={initials} size={36}/>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user?.nome}
            </div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)' }}>{user?.papel ? rolePt[user.papel] : ''}</div>
          </div>
          <button onClick={logout} title="Sair" style={{
            background: 'transparent', border: 0, cursor: 'pointer',
            color: 'rgba(255,255,255,0.5)', padding: 4,
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
      </div>
    </nav>
  );
};
