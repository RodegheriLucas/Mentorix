import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { MxLogo } from '../components/ui/DesignSystem';
import { TextField, Text } from '@radix-ui/themes';

const roleRoutes: Record<string, string> = {
  ALUNO: '/aluno',
  ALUNO_MENTOR: '/mentor',
  PROFESSOR_MENTOR: '/professor',
  GESTOR: '/gestor',
};

const FEATURES = [
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <path d="M9 3L3 5v16l6-2 6 2 6-2V3l-6 2-6-2z" stroke="rgba(255,255,255,0.9)" strokeWidth="1.8" strokeLinejoin="round"/>
        <path d="M9 3v16M15 5v16" stroke="rgba(255,255,255,0.9)" strokeWidth="1.8"/>
      </svg>
    ),
    title: 'Matchmaking inteligente',
    desc: 'Pinos de calor no mapa do campus casam alunos com mentores pelo assunto.',
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <rect x="3" y="4" width="18" height="18" rx="3" stroke="rgba(255,255,255,0.9)" strokeWidth="1.8"/>
        <path d="M3 9h18M8 2v4M16 2v4" stroke="rgba(255,255,255,0.9)" strokeWidth="1.8" strokeLinecap="round"/>
      </svg>
    ),
    title: 'Ciclo completo de sessão',
    desc: 'Check-in, check-out e histórico de horas — tudo gerenciado pelo gestor.',
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="9" stroke="rgba(255,255,255,0.9)" strokeWidth="1.8"/>
        <path d="M12 7v5l3 2" stroke="rgba(255,255,255,0.9)" strokeWidth="1.8" strokeLinecap="round"/>
      </svg>
    ),
    title: 'Horas complementares',
    desc: 'Mentores acumulam horas automaticamente após cada avaliação concluída.',
  },
];

function useIsDesktop() {
  const [isDesktop, setIsDesktop] = useState(() => window.innerWidth >= 768);
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 768px)');
    const handler = (e: MediaQueryListEvent) => setIsDesktop(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);
  return isDesktop;
}

export const LoginPage: React.FC = () => {
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const isDesktop = useIsDesktop();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) navigate(roleRoutes[user.papel] || '/');
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, senha);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Credenciais inválidas.');
    } finally {
      setLoading(false);
    }
  };

  const gradientBg = 'linear-gradient(145deg, #1A0E5C 0%, #3A2885 45%, #5D46B8 80%, #7A5FD0 100%)';

  const formPanel = (
    <div style={{
      width: isDesktop ? 480 : '100%',
      background: '#FAFAF8',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: isDesktop ? '60px 52px' : '36px 24px 48px',
      borderLeft: isDesktop ? '1px solid rgba(0,0,0,0.06)' : 'none',
      boxSizing: 'border-box',
    }}>
      <div style={{ width: '100%', maxWidth: 360 }}>
        <h2 style={{
          fontFamily: 'var(--f-head)', fontWeight: 700,
          fontSize: isDesktop ? 28 : 24,
          color: 'var(--text)', margin: '0 0 6px', letterSpacing: -0.5,
        }}>Bom ver você!</h2>
        <p style={{ fontSize: 14, color: 'var(--text-2)', marginBottom: 28, lineHeight: 1.5 }}>
          Entre com seu email institucional para acessar sua área.
        </p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
          <div style={{ marginBottom: 16 }}>
            <label style={{
              display: 'block', fontSize: 12, fontWeight: 600,
              color: 'var(--text)', marginBottom: 7, letterSpacing: 0.1,
            }}>Email institucional</label>
            <TextField.Root
              size="3"
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{ width: '100%' }}
            />
          </div>

          <div style={{ marginBottom: 24 }}>
            <label style={{
              display: 'block', fontSize: 12, fontWeight: 600,
              color: 'var(--text)', marginBottom: 7, letterSpacing: 0.1,
            }}>Senha</label>
            <TextField.Root
              size="3"
              type="password"
              placeholder="••••••••"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              required
              style={{ width: '100%' }}
            />
          </div>

          {error && (
            <div style={{
              marginBottom: 20, padding: '11px 14px', borderRadius: 12,
              background: '#FBE9E7', border: '1px solid rgba(230,74,25,0.3)',
              display: 'flex', alignItems: 'center', gap: 8,
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="9" stroke="#E64A19" strokeWidth="2"/>
                <path d="M12 8v5M12 16v.5" stroke="#E64A19" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              <Text size="2" style={{ color: '#BF360C' }}>{error}</Text>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%', padding: '14px 0',
              borderRadius: 12, border: 0, cursor: loading ? 'not-allowed' : 'pointer',
              background: loading
                ? 'rgba(93,70,184,0.5)'
                : 'linear-gradient(135deg, #5D46B8 0%, #3A2885 100%)',
              color: '#fff',
              fontFamily: 'var(--f-body)', fontWeight: 600, fontSize: 15,
              letterSpacing: -0.1,
              boxShadow: loading ? 'none' : '0 1px 0 rgba(30,15,100,0.3), 0 6px 20px rgba(93,70,184,0.35)',
              transition: 'all 0.15s',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            }}
          >
            {loading ? (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{ animation: 'mxSpin 0.8s linear infinite' }}>
                  <circle cx="12" cy="12" r="9" stroke="rgba(255,255,255,0.3)" strokeWidth="2.5"/>
                  <path d="M12 3a9 9 0 0 1 9 9" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"/>
                </svg>
                Entrando…
              </>
            ) : 'Entrar →'}
          </button>
        </form>
      </div>
    </div>
  );

  if (!isDesktop) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', fontFamily: 'var(--f-body)', background: '#FAFAF8' }}>
        {/* Mobile: compact gradient header */}
        <div style={{
          background: gradientBg,
          padding: '40px 24px 36px',
          position: 'relative',
          overflow: 'hidden',
        }}>
          {/* Decorative circles */}
          <div style={{
            position: 'absolute', top: -60, right: -60,
            width: 240, height: 240, borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(93,70,184,0.45) 0%, transparent 70%)',
            pointerEvents: 'none',
          }}/>
          <div style={{
            position: 'absolute', bottom: -40, left: -40,
            width: 180, height: 180, borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(46,125,50,0.2) 0%, transparent 70%)',
            pointerEvents: 'none',
          }}/>

          {/* Wordmark */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 24, position: 'relative' }}>
            <MxLogo size={22} color="#fff"/>
            <span style={{ fontFamily: 'var(--f-head)', fontWeight: 700, fontSize: 18, color: '#fff', letterSpacing: -0.3 }}>
              mentorix
            </span>
            <span style={{
              fontSize: 9, fontWeight: 700, letterSpacing: 0.8, textTransform: 'uppercase',
              color: 'rgba(255,255,255,0.6)', background: 'rgba(255,255,255,0.12)',
              padding: '2px 7px', borderRadius: 6, border: '1px solid rgba(255,255,255,0.15)',
            }}>Beta</span>
          </div>

          {/* Headline */}
          <div style={{ position: 'relative' }}>


            <h1 style={{
              fontFamily: 'var(--f-head)', fontWeight: 800,
              fontSize: 30, lineHeight: 1.1, letterSpacing: -0.8,
              color: '#fff', margin: '0 0 12px',
            }}>
              Conhecimento e{' '}
              <span style={{
                background: 'linear-gradient(90deg, #A78BF5, #E2D9FF)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}>espaço na mesma conversa.</span>
            </h1>

            <p style={{
              fontFamily: 'var(--f-body)', fontSize: 13, lineHeight: 1.6,
              color: 'rgba(255,255,255,0.6)', margin: 0,
            }}>
              Aluno publica, mentor aceita, gestor fecha o ciclo.
            </p>
          </div>
        </div>

        {/* Mobile: form area */}
        {formPanel}

        <style>{`@keyframes mxSpin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', fontFamily: 'var(--f-body)' }}>
      {/* Desktop: left brand side */}
      <div style={{
        flex: 1,
        background: gradientBg,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '52px 64px',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', top: -120, right: -80,
          width: 400, height: 400, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(93,70,184,0.4) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}/>
        <div style={{
          position: 'absolute', bottom: -80, left: -60,
          width: 320, height: 320, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(46,125,50,0.25) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}/>
        <div style={{
          position: 'absolute', top: '40%', left: '55%',
          width: 180, height: 180, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(230,74,25,0.12) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}/>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, position: 'relative' }}>
          <MxLogo size={26} color="#fff"/>
          <span style={{ fontFamily: 'var(--f-head)', fontWeight: 700, fontSize: 20, color: '#fff', letterSpacing: -0.4 }}>
            mentorix
          </span>
          <span style={{
            fontSize: 9, fontWeight: 700, letterSpacing: 0.8, textTransform: 'uppercase',
            color: 'rgba(255,255,255,0.6)', background: 'rgba(255,255,255,0.12)',
            padding: '2px 7px', borderRadius: 6, border: '1px solid rgba(255,255,255,0.15)',
          }}>Beta</span>
        </div>

        <div style={{ position: 'relative' }}>
          <div style={{
            fontSize: 10, fontWeight: 700, letterSpacing: 1.2, textTransform: 'uppercase',
            color: 'rgba(255,255,255,0.5)', marginBottom: 16, fontFamily: 'var(--f-body)',
          }}>Plataforma de Mentoria Acadêmica</div>

          <h1 style={{
            fontFamily: 'var(--f-head)', fontWeight: 800,
            fontSize: 44, lineHeight: 1.08, letterSpacing: -1.2,
            color: '#fff', margin: '0 0 20px',
          }}>
            Conhecimento e<br/>
            <span style={{
              background: 'linear-gradient(90deg, #A78BF5, #E2D9FF)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>espaço na mesma<br/>conversa.</span>
          </h1>

          <p style={{
            fontFamily: 'var(--f-body)', fontSize: 15, lineHeight: 1.65,
            color: 'rgba(255,255,255,0.65)', marginBottom: 40, maxWidth: 420,
          }}>
            Aluno publica uma solicitação. Mentor vê um mapa do campus com pinos coloridos
            por compatibilidade. Gestor fecha o ciclo com check-in e avaliação.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            {FEATURES.map((f, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                <div style={{
                  width: 40, height: 40, borderRadius: 12, flexShrink: 0,
                  background: 'rgba(255,255,255,0.10)',
                  border: '1px solid rgba(255,255,255,0.14)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  backdropFilter: 'blur(8px)',
                }}>
                  {f.icon}
                </div>
                <div>
                  <div style={{ fontFamily: 'var(--f-head)', fontWeight: 600, fontSize: 14, color: '#fff', marginBottom: 3 }}>
                    {f.title}
                  </div>
                  <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.55)', lineHeight: 1.5 }}>
                    {f.desc}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Desktop: right form side */}
      {formPanel}

      <style>{`@keyframes mxSpin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};
