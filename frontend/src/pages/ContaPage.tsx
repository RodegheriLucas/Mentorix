import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { MxLogo, Avatar } from '../components/ui/DesignSystem';

const AVATAR_GRADIENTS = [
  'linear-gradient(135deg,#6f5ad0,#4632a0)',
  'linear-gradient(135deg,#4a78d6,#2854b4)',
  'linear-gradient(135deg,#8a6fe0,#5c3fc0)',
  'linear-gradient(135deg,#e64a19,#bf360c)',
  'linear-gradient(135deg,#506fc7,#2e4ea0)',
  'linear-gradient(135deg,#7a5fd0,#4a35a0)',
];

function nameGradient(nome?: string) {
  if (!nome) return AVATAR_GRADIENTS[0];
  let h = 0;
  for (let i = 0; i < nome.length; i++) h = (h * 31 + nome.charCodeAt(i)) % AVATAR_GRADIENTS.length;
  return AVATAR_GRADIENTS[Math.abs(h)];
}

function initials(nome: string) {
  return nome?.split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase() || '??';
}

const ROLE_PT: Record<string, string> = {
  ALUNO: 'Aluno',
  ALUNO_MENTOR: 'Mentor',
  PROFESSOR_MENTOR: 'Orientador',
  GESTOR: 'Gestor',
};

const ROLE_BADGE_COLORS: Record<string, { bg: string; fg: string }> = {
  ALUNO: { bg: 'var(--primary-light)', fg: 'var(--primary-dark)' },
  ALUNO_MENTOR: { bg: 'var(--secondary-light)', fg: 'var(--secondary-dark)' },
  PROFESSOR_MENTOR: { bg: '#E8E0FF', fg: '#3A2885' },
  GESTOR: { bg: 'var(--accent-light)', fg: 'var(--accent-dark)' },
};

export const ContaPage: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  if (!user) return null;

  const grad = nameGradient(user.nome);
  const ini = initials(user.nome);
  const roleLabel = ROLE_PT[user.papel] || user.papel;
  const roleBadge = ROLE_BADGE_COLORS[user.papel] || ROLE_BADGE_COLORS.ALUNO;
  const firstName = user.nome.split(' ')[0];

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="animate-fadeIn">
      {/* Page header */}
      <div style={{ padding: '12px 0 14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <MxLogo size={20}/>
            <span style={{ fontFamily: 'var(--f-head)', fontWeight: 700, fontSize: 16, letterSpacing: -0.2, color: 'var(--primary-dark)' }}>
              mentorix
            </span>
            <span style={{
              fontSize: 9, fontWeight: 700, letterSpacing: 0.6, textTransform: 'uppercase',
              color: roleBadge.fg, background: roleBadge.bg,
              padding: '2px 6px', borderRadius: 6,
            }}>{roleLabel}</span>
          </div>
        </div>
        <h1 className="mx-h1" style={{ fontSize: 24 }}>Minha conta</h1>
      </div>

      {/* Profile card */}
      <div style={{
        borderRadius: 18, overflow: 'hidden', marginBottom: 16,
        boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.05)',
      }}>
        {/* Gradient hero strip */}
        <div style={{
          height: 80,
          background: `linear-gradient(135deg, ${grad.includes('4632a0') ? '#3A2885' : grad.includes('2854b4') ? '#1A3890' : grad.includes('5c3fc0') ? '#4A2E9A' : '#3A2885'} 0%, ${grad.match(/#[0-9a-f]{6}/gi)?.[0] || '#5D46B8'} 100%)`,
          position: 'relative',
        }}/>
        {/* Avatar overlapping strip */}
        <div style={{ background: '#fff', padding: '0 16px 20px', position: 'relative' }}>
          <div style={{
            position: 'absolute', top: -28, left: 16,
            width: 60, height: 60, borderRadius: '50%',
            border: '3px solid #fff',
            background: grad,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'var(--f-head)', fontWeight: 700, fontSize: 22, color: '#fff',
            boxShadow: '0 2px 12px rgba(0,0,0,0.18)',
          }}>{ini}</div>
          <div style={{ paddingTop: 40 }}>
            <div style={{ fontFamily: 'var(--f-head)', fontWeight: 700, fontSize: 18, color: 'var(--text)', letterSpacing: -0.3 }}>
              {user.nome}
            </div>
            <div style={{ fontSize: 13, color: 'var(--text-2)', marginTop: 2 }}>{user.email}</div>
            <div style={{ marginTop: 8 }}>
              <span style={{
                display: 'inline-block',
                padding: '3px 10px', borderRadius: 999,
                background: roleBadge.bg, color: roleBadge.fg,
                fontSize: 11, fontWeight: 600, fontFamily: 'var(--f-body)',
              }}>{roleLabel}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats — mentors and professors only */}
      {(user.papel === 'ALUNO_MENTOR' || user.papel === 'PROFESSOR_MENTOR') && (
        <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
          <div style={{
            flex: 1, padding: '14px 16px', borderRadius: 14,
            background: '#fff', border: '1px solid var(--border)',
          }}>
            <div style={{ fontFamily: 'var(--f-head)', fontWeight: 700, fontSize: 22, color: 'var(--secondary)', letterSpacing: -0.5 }}>
              {Number(user.horas_complementares || 0).toFixed(1)}h
            </div>
            <div className="mx-caption" style={{ fontSize: 11, marginTop: 2 }}>{'Compet\u00eancias'}</div>
          </div>
          <div style={{
            flex: 1, padding: '14px 16px', borderRadius: 14,
            background: '#fff', border: '1px solid var(--border)',
          }}>
            <div style={{ fontFamily: 'var(--f-head)', fontWeight: 700, fontSize: 22, color: 'var(--primary)', letterSpacing: -0.5 }}>
              {user.tags_competencia?.length ?? 0}
            </div>
            <div className="mx-caption" style={{ fontSize: 11, marginTop: 2 }}>{'Compet\u00eancias'}</div>
          </div>
        </div>
      )}

      {/* Compet\u00eancias */}
      {user.tags_competencia && user.tags_competencia.length > 0 && (
        <div style={{
          padding: '14px 16px', borderRadius: 14,
          background: '#fff', border: '1px solid var(--border)',
          marginBottom: 16,
        }}>
          <div className="mx-caption" style={{
            textTransform: 'uppercase', letterSpacing: 0.5, fontSize: 10,
            fontWeight: 600, marginBottom: 10,
          }}>Seus assuntos</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {user.tags_competencia.map((t) => (
              <span key={t} style={{
                padding: '5px 10px', borderRadius: 999,
                background: 'var(--primary-light)', color: 'var(--primary-dark)',
                fontFamily: 'var(--f-body)', fontSize: 12, fontWeight: 500,
              }}>#{t}</span>
            ))}
          </div>
        </div>
      )}

      {/* Contact */}
      {user.telefone && (
        <div style={{
          padding: '14px 16px', borderRadius: 14,
          background: '#fff', border: '1px solid var(--border)',
          marginBottom: 16,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div>
            <div className="mx-caption" style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.5, fontWeight: 600 }}>
              Telefone
            </div>
            <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--text)', marginTop: 3 }}>{user.telefone}</div>
          </div>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M22 16.92v3a2 2 0 0 1-2.18 2A19.79 19.79 0 0 1 11.37 18 19.45 19.45 0 0 1 3 9.63 19.79 19.79 0 0 1 .08 1.04 2 2 0 0 1 2.06 0h3a2 2 0 0 1 2 1.72c.13 1 .38 1.97.73 2.9a2 2 0 0 1-.45 2.11L6.09 7.91A16 16 0 0 0 12 13.82l1.27-1.27a2 2 0 0 1 2.11-.45c.93.35 1.9.6 2.9.73A2 2 0 0 1 20 15z" stroke="var(--text-3)" strokeWidth="1.8" strokeLinecap="round"/>
          </svg>
        </div>
      )}

      {/* Logout */}
      <button onClick={handleLogout} style={{
        width: '100%', padding: '14px 0',
        borderRadius: 14, border: '1.5px solid rgba(230,74,25,0.3)',
        background: 'var(--accent-light)', cursor: 'pointer',
        fontFamily: 'var(--f-body)', fontWeight: 600, fontSize: 14,
        color: 'var(--accent-dark)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        transition: 'all 0.15s',
        marginTop: 8,
      }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"
            stroke="var(--accent-dark)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        Sair da conta
      </button>

      <div style={{ height: 8 }}/>
      <p style={{ textAlign: 'center', fontSize: 11, color: 'var(--text-3)', fontFamily: 'var(--f-body)' }}>
        {'mentorix \u00b7 acesso restrito \u00e0 institui\u00e7\u00e3o'}
      </p>
    </div>
  );
};
