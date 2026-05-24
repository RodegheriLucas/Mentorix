import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
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
  for (let i = 0; i < nome.length; i++) hash = (hash * 31 + nome.charCodeAt(i)) % AVATAR_GRADIENTS.length;
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

interface DateSlot {
  data: string;
  hora_inicio: string;
  hora_fim: string;
}

interface EditState {
  id: number;
  titulo: string;
  descricao: string;
  categoria: 'GERAL' | 'TCC';
  selectedTopics: string[];
  slots: DateSlot[];
  novaData: string;
  novaHoraInicio: string;
  novaHoraFim: string;
  slotError: string;
  loading: boolean;
  error: string;
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

// ─── Propostas recebidas (TCC sem preferência) ────────────────────────────────
function PropostasSection({ card, propostas, onAceitar, onRecusar }: {
  card: any;
  propostas: any[];
  onAceitar: (propostaId: number) => void;
  onRecusar: (propostaId: number) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  if (propostas.length === 0) return (
    <div style={{ padding: '8px 12px', borderRadius: 10, background: 'var(--primary-light)', marginTop: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
      <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--primary)', display: 'inline-block', animation: 'mxPulse 1.5s ease-in-out infinite' }}/>
      <span style={{ fontSize: 12, color: 'var(--primary-dark)' }}>Aguardando propostas de professores…</span>
    </div>
  );

  return (
    <div style={{ marginTop: 8, borderRadius: 12, border: '1.5px solid var(--primary)', overflow: 'hidden' }}>
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        style={{
          width: '100%', textAlign: 'left', padding: '10px 12px',
          background: 'var(--primary)', border: 'none', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
            <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" stroke="#fff" strokeWidth="2" strokeLinejoin="round"/>
          </svg>
          <span style={{ fontSize: 12, fontWeight: 700, color: '#fff' }}>
            {propostas.length} professor{propostas.length > 1 ? 'es' : ''} interessado{propostas.length > 1 ? 's' : ''} no seu TCC
          </span>
        </div>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" style={{ transform: expanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', flexShrink: 0 }}>
          <path d="M6 9l6 6 6-6" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"/>
        </svg>
      </button>

      {expanded && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
          {propostas.map((proposta, i) => {
            const prof = proposta.professor || {};
            const ini = prof.nome?.split(' ').map((n: string) => n[0]).slice(0, 2).join('').toUpperCase() || '??';
            return (
              <div key={proposta.id} style={{
                padding: '12px 12px',
                borderTop: i > 0 ? '1px solid var(--border)' : 'none',
                background: '#fff',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: proposta.mensagem ? 8 : 10 }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
                    background: 'linear-gradient(135deg,#6f5ad0,#4632a0)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 12, fontWeight: 700, color: '#fff',
                  }}>{ini}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{prof.nome || '—'}</div>
                    <div className="mx-caption" style={{ fontSize: 11 }}>Professor Mentor</div>
                  </div>
                </div>
                {proposta.mensagem && (
                  <div style={{
                    padding: '8px 10px', borderRadius: 10,
                    background: 'var(--surface)', border: '1px solid var(--border)',
                    fontSize: 12, color: 'var(--text-2)', lineHeight: 1.5, marginBottom: 10,
                    fontStyle: 'italic',
                  }}>
                    "{proposta.mensagem}"
                  </div>
                )}
                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    onClick={() => onAceitar(proposta.id)}
                    style={{
                      flex: 1, padding: '9px 0', borderRadius: 10, border: 0, cursor: 'pointer',
                      background: 'linear-gradient(135deg, var(--secondary), var(--secondary-dark))',
                      color: '#fff', fontFamily: 'var(--f-body)', fontWeight: 600, fontSize: 12,
                      boxShadow: '0 2px 8px rgba(46,125,50,0.25)',
                    }}
                  >
                    Aceitar proposta
                  </button>
                  <button
                    onClick={() => onRecusar(proposta.id)}
                    style={{
                      padding: '9px 14px', borderRadius: 10, cursor: 'pointer',
                      border: '1px solid var(--border)', background: '#fff',
                      fontFamily: 'var(--f-body)', fontSize: 12, color: 'var(--accent)',
                    }}
                  >
                    Recusar
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function CardAluno({ card, onCancel, onEdit, propostas, onAceitarProposta, onRecusarProposta }: {
  card: any;
  onCancel: (id: number) => void;
  onEdit: (card: any) => void;
  propostas?: any[];
  onAceitarProposta?: (propostaId: number) => void;
  onRecusarProposta?: (propostaId: number) => void;
}) {
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

          {/* Aberto / matchmaking — GERAL */}
          {card.status === 'ABERTO' && card.categoria !== 'TCC' && (
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

          {/* TCC — propostas de professores */}
          {card.status === 'ABERTO' && card.categoria === 'TCC' && (card.preferencias || []).length === 0 && propostas !== undefined && onAceitarProposta && onRecusarProposta && (
            <PropostasSection
              card={card}
              propostas={propostas}
              onAceitar={onAceitarProposta}
              onRecusar={onRecusarProposta}
            />
          )}

          {/* TCC com professores preferidos — aguardando aceite deles */}
          {card.status === 'ABERTO' && card.categoria === 'TCC' && (card.preferencias || []).length > 0 && (
            <div style={{ padding: '8px 12px', borderRadius: 10, background: 'var(--primary-light)', marginTop: 4 }}>
              <div style={{ fontSize: 12, color: 'var(--primary-dark)', marginBottom: 6 }}>
                Aguardando aceite dos professores indicados:
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {card.preferencias.map((pref: any) => {
                  const prof = pref.professor || {};
                  const ini = prof.nome?.split(' ').map((n: string) => n[0]).slice(0, 2).join('').toUpperCase() || '??';
                  return (
                    <div key={pref.id} style={{
                      display: 'inline-flex', alignItems: 'center', gap: 5,
                      padding: '4px 10px 4px 6px', borderRadius: 999,
                      background: 'var(--primary)', color: '#fff',
                      fontSize: 11, fontWeight: 500,
                    }}>
                      <div style={{ width: 18, height: 18, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 8, fontWeight: 700 }}>{ini}</div>
                      {prof.nome?.split(' ')[0] || 'Professor'}
                    </div>
                  );
                })}
              </div>
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
              <button onClick={() => onEdit(card)} style={{
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
  const [cards, setCards] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('todas');
  const [edit, setEdit] = useState<EditState | null>(null);
  const [propostasMap, setPropostasMap] = useState<Record<number, any[]>>({});

  const today = new Date().toISOString().split('T')[0];

  const fetchPropostas = async (cardList: any[]) => {
    const tccAbertosSemPref = cardList.filter(
      (c) => c.categoria === 'TCC' && c.status === 'ABERTO' && (c.preferencias || []).length === 0
    );
    const entries = await Promise.all(
      tccAbertosSemPref.map((c) =>
        api.get(`/contra-propostas/card/${c.id}`)
          .then((r) => [c.id, r.data] as [number, any[]])
          .catch(() => [c.id, []] as [number, any[]])
      )
    );
    setPropostasMap(Object.fromEntries(entries));
  };

  const load = () => api.get('/cards/meus').then((r) => {
    setCards(r.data);
    fetchPropostas(r.data);
  }).finally(() => setLoading(false));

  useEffect(() => { load(); }, []);

  const handleAceitarProposta = async (propostaId: number) => {
    if (!confirm('Aceitar esta proposta? Os outros professores serão notificados da recusa.')) return;
    await api.post(`/contra-propostas/${propostaId}/aceitar`);
    load();
  };

  const handleRecusarProposta = async (propostaId: number) => {
    await api.post(`/contra-propostas/${propostaId}/recusar`);
    setPropostasMap((prev) => {
      const newMap = { ...prev };
      for (const cardId in newMap) {
        newMap[cardId] = newMap[cardId].filter((p) => p.id !== propostaId);
      }
      return newMap;
    });
  };

  const cancelar = async (id: number) => {
    if (!confirm('Cancelar este card?')) return;
    await api.delete(`/cards/${id}`);
    load();
  };

  const openEdit = (card: any) => {
    setEdit({
      id: card.id,
      titulo: card.titulo,
      descricao: card.descricao,
      categoria: card.categoria,
      selectedTopics: card.tags ?? [],
      slots: (card.disponibilidades ?? []).map((d: any) => ({
        data: d.data ?? '',
        hora_inicio: d.hora_inicio,
        hora_fim: d.hora_fim,
      })),
      novaData: '',
      novaHoraInicio: '',
      novaHoraFim: '',
      slotError: '',
      loading: false,
      error: '',
    });
  };

  const addEditSlot = () => {
    if (!edit) return;
    if (!edit.novaData || !edit.novaHoraInicio || !edit.novaHoraFim) {
      setEdit({ ...edit, slotError: 'Preencha data, hora de início e hora de fim.' });
      return;
    }
    if (edit.novaHoraFim <= edit.novaHoraInicio) {
      setEdit({ ...edit, slotError: 'A hora de fim deve ser maior que a hora de início.' });
      return;
    }
    setEdit({
      ...edit,
      slots: [...edit.slots, { data: edit.novaData, hora_inicio: edit.novaHoraInicio, hora_fim: edit.novaHoraFim }],
      novaData: edit.novaData,
      novaHoraInicio: '',
      novaHoraFim: '',
      slotError: '',
    });
  };

  const saveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!edit) return;
    if (edit.categoria === 'GERAL' && edit.slots.length === 0) {
      setEdit({ ...edit, error: 'Adicione pelo menos um horário de disponibilidade.' });
      return;
    }
    setEdit({ ...edit, loading: true, error: '' });
    try {
      await api.patch(`/cards/${edit.id}`, {
        titulo: edit.titulo,
        descricao: edit.descricao,
        categoria: edit.categoria,
        tags: edit.selectedTopics,
        disponibilidades: edit.categoria === 'GERAL' ? edit.slots : [],
      });
      setEdit(null);
      load();
    } catch (err: any) {
      setEdit((prev) => prev ? { ...prev, loading: false, error: err.response?.data?.message || 'Erro ao salvar.' } : null);
    }
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

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '10px 12px', borderRadius: 10,
    border: '1px solid var(--border)', background: '#fff',
    fontFamily: 'var(--f-body)', fontSize: 13, color: 'var(--text)',
    outline: 'none', boxSizing: 'border-box',
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
        <CardAluno
          key={card.id}
          card={card}
          onCancel={cancelar}
          onEdit={openEdit}
          propostas={propostasMap[card.id]}
          onAceitarProposta={handleAceitarProposta}
          onRecusarProposta={handleRecusarProposta}
        />
      ))}

      {/* Modal de edição */}
      {edit && (
        <div
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
            display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
            zIndex: 1000,
          }}
          onClick={(e) => { if (e.target === e.currentTarget) setEdit(null); }}
        >
          <div style={{
            background: '#fff', borderRadius: '24px 24px 0 0',
            width: '100%', maxWidth: 480,
            maxHeight: '90vh', overflowY: 'auto',
            padding: 20,
          }}>
            {/* Drag handle */}
            <div style={{ width: 36, height: 4, borderRadius: 2, background: 'var(--border)', margin: '0 auto 16px' }}/>
            <h2 style={{ fontFamily: 'var(--f-head)', fontWeight: 700, fontSize: 18, marginBottom: 20, color: 'var(--text)' }}>
              Editar solicitação
            </h2>

            <form onSubmit={saveEdit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-2)', marginBottom: 5 }}>Título</label>
                <input
                  style={inputStyle}
                  value={edit.titulo}
                  onChange={(e) => setEdit({ ...edit, titulo: e.target.value })}
                  required maxLength={200}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-2)', marginBottom: 5 }}>Descrição</label>
                <textarea
                  style={{ ...inputStyle, minHeight: 90, resize: 'vertical', lineHeight: 1.45 }}
                  value={edit.descricao}
                  onChange={(e) => setEdit({ ...edit, descricao: e.target.value })}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-2)', marginBottom: 5 }}>Categoria</label>
                <div style={{ display: 'flex', gap: 8 }}>
                  {(['GERAL', 'TCC'] as const).map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setEdit({ ...edit, categoria: cat })}
                      style={{
                        flex: 1, padding: '10px', borderRadius: 10,
                        border: edit.categoria === cat ? '2px solid var(--primary)' : '1px solid var(--border)',
                        background: edit.categoria === cat ? 'var(--primary-light)' : '#fff',
                        color: edit.categoria === cat ? 'var(--primary-dark)' : 'var(--text-2)',
                        fontFamily: 'var(--f-body)', fontWeight: 600, fontSize: 13, cursor: 'pointer',
                      }}
                    >
                      {cat === 'GERAL' ? '📘 Geral' : '🎓 TCC'}
                    </button>
                  ))}
                </div>
              </div>

              {edit.categoria === 'GERAL' && (
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-2)', marginBottom: 8 }}>Disponibilidade horária</label>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end', flexWrap: 'wrap' }}>
                    <input
                      type="date" min={today}
                      value={edit.novaData}
                      onChange={(e) => setEdit({ ...edit, novaData: e.target.value })}
                      style={{ ...inputStyle, flex: '1 1 130px' }}
                    />
                    <input
                      type="time"
                      value={edit.novaHoraInicio}
                      onChange={(e) => setEdit({ ...edit, novaHoraInicio: e.target.value })}
                      style={{ ...inputStyle, flex: '1 1 90px' }}
                    />
                    <input
                      type="time"
                      value={edit.novaHoraFim}
                      onChange={(e) => setEdit({ ...edit, novaHoraFim: e.target.value })}
                      style={{ ...inputStyle, flex: '1 1 90px' }}
                    />
                    <button
                      type="button" onClick={addEditSlot}
                      style={{
                        padding: '10px 14px', borderRadius: 10, border: 0,
                        background: 'var(--primary)', color: '#fff',
                        fontFamily: 'var(--f-body)', fontWeight: 600, fontSize: 12, cursor: 'pointer',
                      }}
                    >+ Add</button>
                  </div>
                  {edit.slotError && (
                    <p style={{ fontSize: 11, color: 'var(--accent-dark)', marginTop: 6 }}>{edit.slotError}</p>
                  )}
                  {edit.slots.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 10 }}>
                      {edit.slots.map((s, i) => (
                        <div key={i} style={{
                          display: 'inline-flex', alignItems: 'center', gap: 5,
                          background: 'var(--primary-light)', borderRadius: 999, padding: '4px 10px',
                        }}>
                          <span style={{ fontSize: 11, color: 'var(--primary-dark)', fontWeight: 500 }}>
                            {s.data} {s.hora_inicio}–{s.hora_fim}
                          </span>
                          <button
                            type="button"
                            onClick={() => setEdit({ ...edit, slots: edit.slots.filter((_, idx) => idx !== i) })}
                            style={{ background: 'none', border: 'none', color: 'var(--accent)', cursor: 'pointer', fontSize: 13, lineHeight: 1, padding: 0 }}
                          >×</button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {edit.error && (
                <div style={{ background: 'var(--accent-light)', border: '1px solid var(--accent)', borderRadius: 10, padding: '10px 14px', fontSize: 12, color: 'var(--accent-dark)' }}>
                  {edit.error}
                </div>
              )}

              <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                <button
                  type="submit"
                  disabled={edit.loading}
                  style={{
                    flex: 1, padding: '13px', borderRadius: 12, border: 0,
                    background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))',
                    color: '#fff', fontFamily: 'var(--f-body)', fontWeight: 600, fontSize: 14, cursor: 'pointer',
                    opacity: edit.loading ? 0.7 : 1,
                  }}
                >
                  {edit.loading ? 'Salvando…' : 'Salvar alterações'}
                </button>
                <button
                  type="button" onClick={() => setEdit(null)}
                  style={{
                    padding: '13px 18px', borderRadius: 12,
                    border: '1px solid var(--border)', background: '#fff',
                    fontFamily: 'var(--f-body)', fontWeight: 500, fontSize: 14, cursor: 'pointer', color: 'var(--text-2)',
                  }}
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
