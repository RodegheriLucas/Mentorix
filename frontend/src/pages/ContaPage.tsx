import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { MxLogo } from '../components/ui/DesignSystem';
import { Skeleton } from '../components/ui/Skeleton';
import api from '../config/api';

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

function fmtDate(iso: string) {
  if (!iso) return '';
  const [y, m, d] = iso.split('T')[0].split('-');
  return new Date(Number(y), Number(m) - 1, Number(d))
    .toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' });
}

function fmtDuration(horas: number) {
  const h = Math.floor(horas);
  const min = Math.round((horas - h) * 60);
  if (min === 0) return `${h}h`;
  return `${h}h ${min}min`;
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

interface SessaoHora {
  data: string;
  hora_inicio: string;
  hora_fim: string;
  duracao_horas: number;
  card_titulo: string;
  aluno_nome: string;
}

interface HorasData {
  total: number;
  sessoes: SessaoHora[];
}

export const ContaPage: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [horasData, setHorasData] = useState<HorasData | null>(null);
  const [loadingHoras, setLoadingHoras] = useState(false);

  const isMentor = user?.papel === 'ALUNO_MENTOR';

  useEffect(() => {
    if (!isMentor) return;
    setLoadingHoras(true);
    api.get('/users/me/horas')
      .then((r) => setHorasData(r.data))
      .finally(() => setLoadingHoras(false));
  }, [isMentor]);

  if (!user) return null;

  const grad = nameGradient(user.nome);
  const ini = initials(user.nome);
  const roleLabel = ROLE_PT[user.papel] || user.papel;
  const roleBadge = ROLE_BADGE_COLORS[user.papel] || ROLE_BADGE_COLORS.ALUNO;

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const totalHoras = horasData?.total ?? Number(user.horas_complementares ?? 0);
  const sessoes = horasData?.sessoes ?? [];

  return (
    <div className="animate-fadeIn">
      {/* Page header */}
      <div style={{ padding: '12px 0 14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <MxLogo size={20} />
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
        <div style={{
          height: 80,
          background: 'linear-gradient(135deg, var(--primary-dark), var(--primary))',
        }} />
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

      {/* Stats — mentores e professores */}
      {isMentor && (
        <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
          {/* Horas acumuladas */}
          <div style={{
            flex: 1, padding: '16px', borderRadius: 14,
            background: 'linear-gradient(135deg, var(--secondary-light), #d4edda)',
            border: '1px solid rgba(46,125,50,0.15)',
            display: 'flex', flexDirection: 'column', gap: 4,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="9" stroke="var(--secondary)" strokeWidth="1.8" />
                <path d="M12 7v5l3 2" stroke="var(--secondary)" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
              <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, color: 'var(--secondary-dark)' }}>
                Horas acumuladas
              </span>
            </div>
            <div style={{ fontFamily: 'var(--f-head)', fontWeight: 800, fontSize: 28, color: 'var(--secondary)', letterSpacing: -1, lineHeight: 1 }}>
              {loadingHoras ? '—' : totalHoras.toFixed(1)}
              <span style={{ fontSize: 14, fontWeight: 500, marginLeft: 3 }}>h</span>
            </div>
            <div style={{ fontSize: 11, color: 'var(--secondary-dark)', marginTop: 2 }}>
              {loadingHoras ? '' : `${sessoes.length} sess${sessoes.length === 1 ? 'ão' : 'ões'} concluída${sessoes.length === 1 ? '' : 's'}`}
            </div>
          </div>

          {/* Competências */}
          <div style={{
            flex: 1, padding: '16px', borderRadius: 14,
            background: 'var(--primary-light)',
            border: '1px solid rgba(93,70,184,0.15)',
            display: 'flex', flexDirection: 'column', gap: 4,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path d="M12 2l3 6h6l-5 4 2 6-6-4-6 4 2-6-5-4h6z" stroke="var(--primary)" strokeWidth="1.8" strokeLinejoin="round" />
              </svg>
              <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, color: 'var(--primary-dark)' }}>
                Competências
              </span>
            </div>
            <div style={{ fontFamily: 'var(--f-head)', fontWeight: 800, fontSize: 28, color: 'var(--primary)', letterSpacing: -1, lineHeight: 1 }}>
              {user.tags_competencia?.length ?? 0}
            </div>
            <div style={{ fontSize: 11, color: 'var(--primary-dark)', marginTop: 2 }}>
              assunto{(user.tags_competencia?.length ?? 0) !== 1 ? 's' : ''} cadastrado{(user.tags_competencia?.length ?? 0) !== 1 ? 's' : ''}
            </div>
          </div>
        </div>
      )}

      {/* Histórico de horas — só para mentores */}
      {isMentor && (
        <div style={{
          borderRadius: 14, background: '#fff',
          border: '1px solid var(--border)', marginBottom: 16, overflow: 'hidden',
        }}>
          <div style={{
            padding: '14px 16px 12px',
            borderBottom: '1px solid var(--border)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{
                width: 30, height: 30, borderRadius: 9,
                background: 'var(--secondary-light)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="9" stroke="var(--secondary)" strokeWidth="1.8" />
                  <path d="M12 7v5l3 2" stroke="var(--secondary)" strokeWidth="1.8" strokeLinecap="round" />
                </svg>
              </div>
              <span style={{ fontFamily: 'var(--f-head)', fontWeight: 700, fontSize: 14, color: 'var(--text)' }}>
                Histórico de horas
              </span>
            </div>
            {!loadingHoras && sessoes.length > 0 && (
              <span style={{
                fontSize: 11, fontWeight: 700,
                color: 'var(--secondary-dark)', background: 'var(--secondary-light)',
                padding: '2px 8px', borderRadius: 999,
              }}>
                {totalHoras.toFixed(1)}h total
              </span>
            )}
          </div>

          {loadingHoras ? (
            <div style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[1, 2, 3].map((i) => <Skeleton key={i} height={64} />)}
            </div>
          ) : sessoes.length === 0 ? (
            <div style={{ padding: '32px 16px', textAlign: 'center' }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" style={{ margin: '0 auto 10px', display: 'block' }}>
                <circle cx="12" cy="12" r="9" stroke="var(--text-3)" strokeWidth="1.5" />
                <path d="M12 7v5l3 2" stroke="var(--text-3)" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              <p style={{ fontSize: 13, color: 'var(--text-2)', fontWeight: 500 }}>Nenhuma hora consolidada ainda</p>
              <p style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 4 }}>
                As horas são contabilizadas após a avaliação do aluno.
              </p>
            </div>
          ) : (
            <div>
              {sessoes.map((s, i) => (
                <div key={i} style={{
                  padding: '12px 16px',
                  borderBottom: i < sessoes.length - 1 ? '1px solid var(--border)' : 'none',
                  display: 'flex', alignItems: 'center', gap: 12,
                }}>
                  <div style={{
                    width: 48, height: 48, borderRadius: 12, flexShrink: 0,
                    background: 'var(--secondary-light)',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                    gap: 1,
                  }}>
                    <span style={{ fontFamily: 'var(--f-head)', fontWeight: 800, fontSize: 15, color: 'var(--secondary)', lineHeight: 1 }}>
                      {fmtDuration(s.duracao_horas).split(' ')[0]}
                    </span>
                    {fmtDuration(s.duracao_horas).split(' ')[1] && (
                      <span style={{ fontSize: 9, color: 'var(--secondary-dark)', fontWeight: 600 }}>
                        {fmtDuration(s.duracao_horas).split(' ')[1]}
                      </span>
                    )}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontFamily: 'var(--f-head)', fontWeight: 700, fontSize: 13, color: 'var(--text)', lineHeight: 1.3, marginBottom: 3 }}>
                      {s.card_titulo || 'Mentoria'}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--text-2)', display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none">
                          <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="1.8" />
                          <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                        </svg>
                        {s.aluno_nome.split(' ')[0] || 'Aluno'}
                      </span>
                      <span style={{ color: 'var(--border)' }}>·</span>
                      <span>{s.hora_inicio} – {s.hora_fim}</span>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div style={{ fontSize: 10, color: 'var(--text-3)', fontWeight: 500, lineHeight: 1.4 }}>
                      {fmtDate(s.data).split(',')[0]}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--text-2)', fontWeight: 600 }}>
                      {fmtDate(s.data).split(',')[1]?.trim()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Competências */}
      {user.papel !== 'PROFESSOR_MENTOR' && user.tags_competencia && user.tags_competencia.length > 0 && (
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

      {/* Telefone */}
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
            <path d="M22 16.92v3a2 2 0 0 1-2.18 2A19.79 19.79 0 0 1 11.37 18 19.45 19.45 0 0 1 3 9.63 19.79 19.79 0 0 1 .08 1.04 2 2 0 0 1 2.06 0h3a2 2 0 0 1 2 1.72c.13 1 .38 1.97.73 2.9a2 2 0 0 1-.45 2.11L6.09 7.91A16 16 0 0 0 12 13.82l1.27-1.27a2 2 0 0 1 2.11-.45c.93.35 1.9.6 2.9.73A2 2 0 0 1 20 15z"
              stroke="var(--text-3)" strokeWidth="1.8" strokeLinecap="round" />
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
            stroke="var(--accent-dark)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        Sair da conta
      </button>

      <div style={{ height: 8 }} />
      <p style={{ textAlign: 'center', fontSize: 11, color: 'var(--text-3)', fontFamily: 'var(--f-body)' }}>
        mentorix · acesso restrito à instituição
      </p>
    </div>
  );
};
