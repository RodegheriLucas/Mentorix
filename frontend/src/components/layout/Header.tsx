import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const rolLabels: Record<string, string> = {
  ALUNO: 'Aluno',
  ALUNO_MENTOR: 'Mentor',
  PROFESSOR_MENTOR: 'Professor Mentor',
  GESTOR: 'Gestor',
};

export const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header style={{
      height: 'var(--header-height)',
      background: 'var(--color-bg-secondary)',
      borderBottom: '1px solid var(--color-border)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'flex-end',
      padding: '0 24px',
      gap: '16px',
    }}>
      <div style={{ textAlign: 'right' }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text)' }}>{user?.nome}</div>
        <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>{rolLabels[user?.papel || '']}</div>
      </div>
      <div style={{
        width: 36, height: 36,
        borderRadius: '50%',
        background: 'var(--color-primary-light)',
        border: '2px solid var(--color-primary)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 16, fontWeight: 700, color: 'var(--color-primary)',
      }}>
        {user?.nome?.[0] || '?'}
      </div>
      <button
        onClick={handleLogout}
        style={{
          background: 'var(--color-danger-bg)',
          color: 'var(--color-danger)',
          border: '1px solid var(--color-danger)',
          borderRadius: 8,
          padding: '6px 12px',
          fontSize: 13,
          fontWeight: 600,
          cursor: 'pointer',
          transition: 'all 0.2s',
        }}
      >
        Sair
      </button>
    </header>
  );
};
