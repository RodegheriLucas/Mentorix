import React, { useEffect, useRef, useState } from 'react';
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

const GESTOR_GRADIENT = 'linear-gradient(135deg, #5D46B8 0%, #3A2885 100%)';

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
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const isGestor = user?.papel === 'GESTOR';

  useEffect(() => {
    if (!menuOpen) return;
    const onClick = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMenuOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [menuOpen]);

  if (!user) return null;

  const badgeText = badgeOverride || roleLabel[user.papel] || 'Usuário';
  const ini = initials(user.nome);
  const avatarColor = isGestor ? GESTOR_GRADIENT : mentorGradient(user.nome);

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
          isGestor ? (
            <div ref={wrapperRef} style={{ position: 'relative' }}>
              <button
                type="button"
                aria-label="Abrir menu da conta"
                aria-haspopup="menu"
                aria-expanded={menuOpen}
                onClick={() => setMenuOpen((v) => !v)}
                style={{
                  background: 'transparent', border: 0, padding: 0, cursor: 'pointer',
                  borderRadius: '50%', lineHeight: 0,
                  boxShadow: menuOpen ? '0 0 0 3px rgba(93,70,184,0.25)' : 'none',
                  transition: 'box-shadow 0.15s',
                }}
              >
                <Avatar initials={ini} size={32} color={avatarColor} />
              </button>
              {menuOpen && (
                <div
                  role="menu"
                  style={{
                    position: 'absolute', top: 'calc(100% + 8px)', right: 0,
                    minWidth: 220, background: '#fff',
                    border: '1px solid var(--border)', borderRadius: 12,
                    boxShadow: '0 12px 32px rgba(18,18,18,0.16)',
                    padding: 14, zIndex: 1200,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                    <Avatar initials={ini} size={40} color={avatarColor} />
                    <div style={{ minWidth: 0 }}>
                      <div style={{
                        fontFamily: 'var(--f-head)', fontWeight: 700, fontSize: 14,
                        color: 'var(--text)', lineHeight: 1.2,
                      }}>
                        {user.nome}
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 2 }}>
                        {roleLabel[user.papel]}
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => { setMenuOpen(false); logout(); }}
                    style={{
                      width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                      padding: '9px 12px', borderRadius: 10, cursor: 'pointer',
                      background: 'var(--accent-light)', color: 'var(--accent-dark)',
                      border: '1px solid transparent',
                      fontFamily: 'var(--f-body)', fontSize: 13, fontWeight: 600,
                    }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    Sair da conta
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Avatar initials={ini} size={32} color={avatarColor} />
          )
        )}
      </div>
      <h1 className="mx-h1" style={{ fontSize: 24, margin: 0 }}>{title}</h1>
      {subtitle && <p className="mx-caption" style={{ marginTop: 2, color: 'var(--text-3)' }}>{subtitle}</p>}
    </div>
  );
};
