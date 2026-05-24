import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { MxLogo, Avatar } from './DesignSystem';

interface PageHeaderProps {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  showAvatar?: boolean;
  badgeOverride?: string;
}

const roleLabel: Record<string, string> = {
  ALUNO: 'Aluno',
  ALUNO_MENTOR: 'Mentor',
  PROFESSOR_MENTOR: 'Orientador',
  GESTOR: 'Gestor',
};

// Simplified hash based gradient matching AlunoHeader's logic or using fallback
const mentorGradient = (name: string) => {
  const hash = Array.from(name).reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const colors = [
    'linear-gradient(135deg, #FF6B6B 0%, #C92A2A 100%)',
    'linear-gradient(135deg, #4DABF7 0%, #1864AB 100%)',
    'linear-gradient(135deg, #69DB7C 0%, #2B8A3E 100%)',
    'linear-gradient(135deg, #FF922B 0%, #D9480F 100%)',
    'linear-gradient(135deg, #FCC419 0%, #E67700 100%)',
  ];
  return colors[hash % colors.length];
};

const initials = (name: string) => name.split(' ').map(p => p[0]).slice(0, 2).join('').toUpperCase();

export const PageHeader: React.FC<PageHeaderProps> = ({ title, subtitle, showAvatar = false, badgeOverride }) => {
  const { user } = useAuth();

  if (!user) return null;

  const badgeText = badgeOverride || roleLabel[user.papel] || 'Usuário';
  const ini = initials(user.nome);

  return (
    <div style={{ padding: '12px 0 14px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <MxLogo size={20} />
          <span style={{ fontFamily: 'var(--f-head)', fontWeight: 700, fontSize: 16, letterSpacing: -0.2, color: 'var(--primary-dark)' }}>
            mentorix
          </span>
          <span style={{
            fontSize: 9, fontWeight: 700, letterSpacing: 0.6, textTransform: 'uppercase',
            color: 'var(--primary-dark)', background: 'var(--primary-light)',
            padding: '2px 6px', borderRadius: 6,
          }}>
            {badgeText}
          </span>
        </div>
        {showAvatar && (
          <Avatar initials={ini} size={32} color={mentorGradient(user.nome)} />
        )}
      </div>
      <h1 className="mx-h1" style={{ fontSize: 24, margin: 0 }}>{title}</h1>
      {subtitle && <p className="mx-caption" style={{ marginTop: 2, color: 'var(--text-3)' }}>{subtitle}</p>}
    </div>
  );
};
