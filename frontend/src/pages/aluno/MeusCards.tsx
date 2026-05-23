import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../config/api';
import { StatusPill, Avatar, TopicBadge, WhatsAppButton, CheckInOutCard, MxLogo } from '../../components/ui/DesignSystem';
import { Skeleton } from '../../components/ui/Skeleton';
import { useAuth } from '../../contexts/AuthContext';

const AVATAR_GRADIENTS = [
  'linear-gradient(135deg,#6f5ad0,#4632a0)',
  'linear-gradient(135deg,#4a78d6,#2854b4)',
  'linear-gradient(135deg,#8a6fe0,#5c3fc0)',
  'linear-gradient(135deg,#e64a19,#bf360c)',
  'linear-gradient(135deg,#506fc7,#2e4ea0)',
  'linear-gradient(135deg,#7a5fd0,#4a35a0)',
];

function mentorGradient(nome: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) % AVATAR_GRADIENTS.length;
  return AVATAR_GRADIENTS[Math.abs(hash)];
}

function initials(name: string) {
  return name?.split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase() || '??';
}

function stripeColor(status: string) {
  if (status === 'EM_ANDAMENTO') return 'var(--secondary)';
  if (status === 'AGENDADO') return 'var(--accent)';
  if (status === 'PENDENTE_GESTOR') return '#E0A800';
  if (status === 'CONCLUIDO') return 'var(--secondary)';
  if (status === 'CANCELADO') return 'var(--accent-dark)';
  return 'var(--primary)';
}

const FILTER_TABS = [
  { id: 'todas',      label: 'Todas' },
  { id: 'mentoria',   label: 'Mentorias' },
  { id: 'matchmaking',label: 'Matchmaking' },
  { id: 'historico',  label: 'Histórico' },
];

function AlunoHeader({ nome, email }: { nome: string; email: string }) {
  const firstName = nome.split(' ')[0];
  const ini = initials(nome);
  return (
    <div style={{ padding: '12px 0 14px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <MxLogo size={20}/>
          <span style={{ fontFamily: 'var(--f-head)', fontWeight: 700, fontSize: 16, letterSpacing: -0.2, color: 'var(--primary-dark)' }}>
            mentorix
          </span>
          <span style={{
            fontSize: 9, fontWeight: 700, letterSpacing: 0.6, textTransform: 'uppercase',
            color: 'var(--primary-dark)', background: 'var(--primary-light)',
            padding: '2px 6px', borderRadius: 6,
          }}>Aluno</span>
        </div>
        <Avatar initials={ini} size={32} color={mentorGradient(nome)}/>
      </div>
      <h1 className="mx-h1" style={{ fontSize: 24 }}>Olá, {firstName}.</h1>
      <p className="mx-caption" style={{ marginTop: 2 }}>{email}</p>
    </div>
  );
}

function FilterTabs({ active, onChange, counts }: {
  active: string; onChange: (id: string) => void; counts: Record<string, number>;
}) {
  return (
    <div style={{ display: 'flex', gap: 4, marginBottom: 14, overflowX: 'auto', scrollbarWidth: 'none' }}>
      {FILTER_TABS.map((t) => {
        const a = active === t.id;
        return (
          <button key={t.id} onClick={() => onChange(t.id)} style={{
            flexShrink: 0, padding: '7px 12px', borderRadius: 999, cursor: 'pointer',
            border: a ? '1px solid var(--primary)' : '1px solid var(--border)',
            background: a ? 'var(--primary)' : '#fff',
            color: a ? '#fff' : 'var(--text)',
            fontFamily: 'var(--f-body)', fontSize: 12, fontWeight: 500,
            display: 'inline-flex', alignItems: 'center', gap: 5,
          }}>
            {t.label}
            <span style={{
              fontSize: 10, fontWeight: 600, padding: '1px 6px', borderRadius: 999,
              color: a ? '#fff' : 'var(--text-3)',
              background: a ? 'rgba(255,255,255,0.18)' : 'var(--surface)',
            }}>{counts[t.id] ?? 0}</span>
          </button>
        );
      })}
    </div>
  );
}

function CardAluno({ card, onCancel, onEdit }: { card: any; onCancel: (id: number) => void; onEdit: (id: number) => void }) {
  const isLive = card.status === 'EM_ANDAMENTO';
  const isAg   = card.status === 'AGENDADO';
  const isDone = card.status === 'CONCLUIDO';

  const tags: string[] = card.tags || [];
  const mentor = card.agendamento?.mentor;
  const ag = card.agendamento;

  const grad = mentor ? mentorGradient(mentor.nome) : undefined;

  const checkinData = ag ? {
    status: card.status,
    sala: ag.ambiente?.nome,
    when: `${ag.dia_semana} · ${ag.hora_inicio}–${ag.hora_fim}`,
    duracao: ag.duracao_horas ? `${ag.duracao_horas}h` : undefined,
    checkinAt: ag.checkin_em ? ag.hora_inicio : undefined,
    checkoutAt: ag.checkout_em ? ag.hora_fim : undefined,
    checkinPrev: ag.hora_inicio,
    checkoutPrev: ag.hora_fim,
    elapsed: isLive ? 'em curso' : undefined,
  } : null;

  return (
    <div className="mx-card" style={{
      overflow: 'hidden', marginBottom: 12,
      border: isLive ? '1.5px solid var(--secondary)' : '1px solid transparent',
    }}>
      <div style={{ display: 'flex' }}>
        {/* Status stripe */}
        <div style={{
          width: 4, background: stripeColor(card.status),
          opacity: isDone ? 0.45 : 1, flexShrink: 0,
        }}/>
        <div style={{ flex: 1, padding: 14 }}>
          {/* Title + Status */}
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10, marginBottom: 6 }}>
            <div style={{ fontFamily: 'var(--f-head)', fontWeight: 700, fontSize: 15, lineHeight: 1.25, color: 'var(--text)', flex: 1 }}>
              {card.titulo}
            </div>
            <StatusPill status={card.status} pulse={isLive} size="sm"/>
          </div>

          {/* Description */}
          <p className="mx-caption" style={{ marginBottom: 10, lineHeight: 1.45 }}>
            {card.descricao?.substring(0, 140)}{(card.descricao?.length ?? 0) > 140 ? '…' : ''}
          </p>

          {/* Tags */}
          {tags.length > 0 && (
            <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 12 }}>
              {tags.map((t) => <TopicBadge key={t}>#{t}</TopicBadge>)}
            </div>
          )}

          {/* Mentor row */}
          {mentor && (
            <div style={{
              padding: 10, borderRadius: 12,
              background: isLive ? 'var(--secondary-light)' : 'var(--surface)',
              display: 'flex', alignItems: 'center', gap: 10,
              marginBottom: (isLive || isAg) ? 10 : 0,
            }}>
              <Avatar initials={initials(mentor.nome)} color={grad} size={36}/>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{mentor.nome}</div>
                <div className="mx-caption" style={{ fontSize: 11 }}>
                  {mentor.papel === 'PROFESSOR_MENTOR' ? 'Professor Mentor' : 'Mentor'}
                </div>
              </div>
            </div>
          )}

          {/* CheckInOut + instrucoes + WhatsApp */}
          {(isLive || isAg) && checkinData && mentor && (
            <>
              <CheckInOutCard c={checkinData}/>
              {ag?.instrucoes_gestor && (
                <div style={{
                  marginTop: 10, padding: '8px 10px', borderRadius: 10,
                  background: 'var(--primary-light)', color: 'var(--primary-dark)',
                  fontSize: 12, lineHeight: 1.4,
                  display: 'flex', alignItems: 'flex-start', gap: 6,
                }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" style={{ marginTop: 2, flexShrink: 0 }}>
                    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2"/>
                    <path d="M12 8v5M12 16v.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                  <span>{ag.instrucoes_gestor}</span>
                </div>
              )}
              {mentor.telefone && (
                <div style={{ marginTop: 10 }}>
                  <WhatsAppButton phone={mentor.telefone} name={mentor.nome}/>
                </div>
              )}
            </>
          )}

          {/* Pendente gestor */}
          {card.status === 'PENDENTE_GESTOR' && (
            <div style={{
              marginTop: 4, padding: '10px 12px', borderRadius: 10,
              background: '#FFF7E0', color: '#7A5B00',
              fontSize: 12, lineHeight: 1.45,
              display: 'flex', alignItems: 'center', gap: 8,
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="9" stroke="#E0A800" strokeWidth="2"/>
                <path d="M12 7v5l3 2" stroke="#E0A800" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              Mentor escolheu o slot — aguardando gestor confirmar a sala.
            </div>
          )}

          {/* Aberto / matchmaking */}
          {card.status === 'ABERTO' && (
            <div style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '8px 12px', borderRadius: 10, background: 'var(--primary-light)',
            }}>
              <span style={{ fontSize: 12, color: 'var(--primary-dark)' }}>
                Aguardando mentor compatível…
              </span>
              <span className="mx-pulse" style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--primary)', display: 'inline-block' }}/>
            </div>
          )}

          {/* Concluído */}
          {isDone && (
            <div style={{ marginTop: 4 }}>
              {checkinData && <CheckInOutCard c={checkinData}/>}
              <Link to="/aluno/avaliar" style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginTop: 10, padding: '11px 14px', borderRadius: 12,
                background: 'linear-gradient(135deg, var(--accent), var(--accent-dark))',
                boxShadow: '0 1px 0 rgba(191,54,12,0.25), 0 6px 16px rgba(230,74,25,0.25)',
                color: '#fff', fontFamily: 'var(--f-body)', fontWeight: 600, fontSize: 13,
                textDecoration: 'none',
              }}>
                ★ Avaliar a mentoria {mentor ? `de ${mentor.nome.split(' ')[0]}` : ''}
              </Link>
            </div>
          )}

          {/* Ações em cards abertos */}
          {card.status === 'ABERTO' && (
            <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
              <button onClick={() => onEdit(card.id)} style={{
                padding: '8px 14px', borderRadius: 10,
                border: '1px solid var(--primary)', background: 'var(--primary-light)', cursor: 'pointer',
                fontFamily: 'var(--f-body)', fontSize: 12, color: 'var(--primary-dark)', fontWeight: 500,
              }}>
                Editar
              </button>
              <button onClick={() => onCancel(card.id)} style={{
                padding: '8px 14px', borderRadius: 10,
                border: '1px solid var(--border)', background: '#fff', cursor: 'pointer',
                fontFamily: 'var(--f-body)', fontSize: 12, color: 'var(--accent)',
              }}>
                Cancelar solicitação
              </button>
            </div>
          )}

          {['ACEITO'].includes(card.status) && (
            <button onClick={() => onCancel(card.id)} style={{
              marginTop: 10, padding: '8px 14px', borderRadius: 10,
              border: '1px solid var(--border)', background: '#fff', cursor: 'pointer',
              fontFamily: 'var(--f-body)', fontSize: 12, color: 'var(--accent)',
            }}>
              Cancelar solicitação
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export const MeusCards: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [cards, setCards] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('todas');

  const load = () => api.get('/cards/meus').then((r) => setCards(r.data)).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const cancelar = async (id: number) => {
    if (!confirm('Cancelar este card?')) return;
    await api.delete(`/cards/${id}`);
    load();
  };

  const handleEdit = (id: number) => {
    navigate(`/aluno/editar-card/${id}`);
  };

  const filtered = React.useMemo(() => {
    if (filter === 'mentoria')    return cards.filter((c) => ['AGENDADO', 'EM_ANDAMENTO', 'PENDENTE_GESTOR'].includes(c.status));
    if (filter === 'matchmaking') return cards.filter((c) => ['ABERTO', 'ACEITO'].includes(c.status));
    if (filter === 'historico')   return cards.filter((c) => ['CONCLUIDO', 'CANCELADO'].includes(c.status));
    return cards;
  }, [cards, filter]);

  const counts = {
    todas:       cards.length,
    mentoria:    cards.filter((c) => ['AGENDADO', 'EM_ANDAMENTO', 'PENDENTE_GESTOR'].includes(c.status)).length,
    matchmaking: cards.filter((c) => ['ABERTO', 'ACEITO'].includes(c.status)).length,
    historico:   cards.filter((c) => ['CONCLUIDO', 'CANCELADO'].includes(c.status)).length,
  };

  return (
    <div className="animate-fadeIn">
      <AlunoHeader nome={user?.nome || 'Usuário'} email={user?.email || ''}/>

      <FilterTabs active={filter} onChange={setFilter} counts={counts}/>

      {loading && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[1, 2, 3].map((i) => <Skeleton key={i} height={140}/>)}
        </div>
      )}

      {!loading && filtered.length === 0 && (
        <div className="mx-card" style={{ padding: 40, textAlign: 'center', color: 'var(--text-3)' }}>
          <div style={{
            width: 52, height: 52, borderRadius: 16, margin: '0 auto 14px',
            background: 'var(--primary-light)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <rect x="3" y="5" width="18" height="14" rx="3" stroke="var(--primary)" strokeWidth="1.8"/>
              <path d="M3 10h18M8 5v5" stroke="var(--primary)" strokeWidth="1.8" strokeLinecap="round"/>
            </svg>
          </div>
          <p style={{ marginBottom: 16, fontSize: 14, color: 'var(--text-2)' }}>
            {filter === 'todas' ? 'Nenhuma solicitação criada ainda.' : 'Nada nessa categoria.'}
          </p>
          {filter === 'todas' && (
            <Link to="/aluno/novo-card" className="mx-btn" style={{ textDecoration: 'none', display: 'inline-block', fontSize: 13 }}>
              Criar primeira solicitação
            </Link>
          )}
        </div>
      )}

      {!loading && filtered.map((card) => (
        <CardAluno key={card.id} card={card} onCancel={cancelar} onEdit={handleEdit}/>
      ))}
    </div>
  );
};
