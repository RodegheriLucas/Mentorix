import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

interface NavItem {
  to: string;
  label: string;
  icon: string;
  roles?: string[];
}

const navItems: NavItem[] = [
  // ALUNO
  { to: '/aluno', label: 'Dashboard', icon: '📊', roles: ['ALUNO'] },
  { to: '/aluno/novo-card', label: 'Nova Solicitação', icon: '📝', roles: ['ALUNO'] },
  { to: '/aluno/meus-cards', label: 'Meus Cards', icon: '📄', roles: ['ALUNO'] },
  { to: '/aluno/agendamentos', label: 'Agendamentos', icon: '📅', roles: ['ALUNO'] },
  { to: '/aluno/avaliar', label: 'Avaliações', icon: '⭐', roles: ['ALUNO'] },
  // MENTOR
  { to: '/mentor', label: 'Dashboard', icon: '📊', roles: ['ALUNO_MENTOR'] },
  { to: '/mentor/feed', label: 'Feed de Mentorias', icon: '🎯', roles: ['ALUNO_MENTOR'] },
  { to: '/mentor/agendamentos', label: 'Agendamentos', icon: '📅', roles: ['ALUNO_MENTOR'] },
  { to: '/mentor/horas', label: 'Minhas Horas', icon: '⏱️', roles: ['ALUNO_MENTOR'] },
  { to: '/mentor/contestacao', label: 'Contestações', icon: '⚠️', roles: ['ALUNO_MENTOR'] },
  // PROFESSOR
  { to: '/professor', label: 'Dashboard', icon: '📊', roles: ['PROFESSOR_MENTOR'] },
  { to: '/professor/feed', label: 'Feed TCC', icon: '🎓', roles: ['PROFESSOR_MENTOR'] },
  { to: '/professor/agendamentos', label: 'Agendamentos', icon: '📅', roles: ['PROFESSOR_MENTOR'] },
  // GESTOR
  { to: '/gestor', label: 'Dashboard', icon: '📊', roles: ['GESTOR'] },
  { to: '/gestor/portaria', label: 'Painel de Portaria', icon: '🏢', roles: ['GESTOR'] },
  { to: '/gestor/ambientes', label: 'Ambientes', icon: '🔑', roles: ['GESTOR'] },
  { to: '/gestor/disputas', label: 'Disputas', icon: '⚖️', roles: ['GESTOR'] },
];

export const Sidebar: React.FC = () => {
  const { user } = useAuth();

  const filtered = navItems.filter(
    (item) => !item.roles || (user && item.roles.includes(user.papel)),
  );

  return (
    <nav style={{
      position: 'fixed',
      left: 0, top: 0, bottom: 0,
      width: 'var(--sidebar-width)',
      background: 'var(--color-bg-secondary)',
      borderRight: '1px solid var(--color-border)',
      display: 'flex',
      flexDirection: 'column',
      padding: '0',
      zIndex: 100,
    }}>
      <div style={{
        padding: '20px 16px',
        borderBottom: '1px solid var(--color-border)',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
      }}>
        <div style={{
          width: 36, height: 36,
          borderRadius: 8,
          background: 'var(--color-primary)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 18,
        }}>🎓</div>
        <div>
          <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-text)' }}>Mentorix</div>
          <div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>UniMatch + VagaLivre</div>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '12px 8px' }}>
        {filtered.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/aluno' || item.to === '/mentor' || item.to === '/professor' || item.to === '/gestor'}
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '10px 12px',
              borderRadius: 8,
              marginBottom: 2,
              color: isActive ? 'var(--color-primary)' : 'var(--color-text-secondary)',
              background: isActive ? 'var(--color-primary-light)' : 'transparent',
              fontSize: 14,
              fontWeight: isActive ? 600 : 400,
              textDecoration: 'none',
              transition: 'all 0.2s',
            })}
          >
            <span style={{ fontSize: 16 }}>{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </div>
    </nav>
  );
};
