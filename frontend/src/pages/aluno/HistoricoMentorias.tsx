import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../config/api';
import { StatusPill, Avatar, TopicBadge, MxLogo } from '../../components/ui/DesignSystem';
import { Skeleton } from '../../components/ui/Skeleton';
import { StarRating } from '../../components/ui/StarRating';
import { useAuth } from '../../contexts/AuthContext';

interface PendenteItem {
  id: number;
  data_encontro: string;
  checkin_em: string;
  checkout_em: string;
  duracao_horas: number;
  dia_semana: string;
  hora_inicio: string;
  hora_fim: string;
  card_titulo: string;
  card_tags: string[];
  mentor_nome: string;
  mentor_avatar: string | null;
}

interface AvaliacaoHistorico {
  avaliacao_id: number;
  nota: number;
  depoimento?: string;
  avaliado_em: string;
  data_encontro: string;
  duracao_horas: number;
  hora_inicio: string;
  hora_fim: string;
  dia_semana: string;
  card_titulo: string;
  card_tags: string[];
  mentor_nome: string;
  mentor_avatar: string | null;
}

const AVATAR_GRADIENTS = [
  'linear-gradient(135deg,#6f5ad0,#4632a0)',
  'linear-gradient(135deg,#4a78d6,#2854b4)',
  'linear-gradient(135deg,#8a6fe0,#5c3fc0)',
  'linear-gradient(135deg,#e64a19,#bf360c)',
  'linear-gradient(135deg,#506fc7,#2e4ea0)',
  'linear-gradient(135deg,#7a5fd0,#4a35a0)',
];

function mentorGradient(nome?: string) {
  if (!nome) return AVATAR_GRADIENTS[0];
  let hash = 0;
  for (let i = 0; i < nome.length; i++) hash = (hash * 31 + nome.charCodeAt(i)) % AVATAR_GRADIENTS.length;
  return AVATAR_GRADIENTS[Math.abs(hash)];
}

function initials(name: string) {
  return name?.split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase() || '??';
}

function formatDate(dateStr: string): string {
  const [year, month, day] = dateStr.split('-');
  return new Date(Number(year), Number(month) - 1, Number(day)).toLocaleDateString('pt-BR', {
    weekday: 'long', day: '2-digit', month: 'long',
  });
}

function fmtDateTime(iso: string) {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })
    + ' às ' + d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

function formatDuration(horas: number): string {
  const h = Math.floor(horas);
  const m = Math.round((horas - h) * 60);
  if (h === 0) return `${m}min`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}min`;
}

function HistoricoHeader({ nome, email }: { nome: string; email: string }) {
  const ini = initials(nome);
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
          }}>Aluno</span>
        </div>
        <Avatar initials={ini} size={32} color={mentorGradient(nome)} />
      </div>
      <h1 className="mx-h1" style={{ fontSize: 24 }}>Histórico</h1>
      <p className="mx-caption" style={{ marginTop: 2 }}>{email}</p>
    </div>
  );
}

// ── Card: pendente de avaliação ─────────────────────────────────────────────

interface CardPendenteProps {
  item: PendenteItem;
  isOpen: boolean;
  onToggle: () => void;
  nota: number;
  depoimento: string;
  submitting: boolean;
  error: string;
  done: boolean;
  onNota: (v: number) => void;
  onDepoimento: (v: string) => void;
  onSubmit: () => void;
}

function CardPendente({ item, isOpen, onToggle, nota, depoimento, submitting, error, done, onNota, onDepoimento, onSubmit }: CardPendenteProps) {
  const grad = mentorGradient(item.mentor_nome);
  return (
    <div className="mx-card" style={{ overflow: 'hidden', marginBottom: 12 }}>
      <div style={{ display: 'flex' }}>
        <div style={{ flex: 1, padding: 14 }}>
          <div onClick={onToggle} style={{ cursor: 'pointer' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10, marginBottom: 4 }}>
              <div style={{ fontFamily: 'var(--f-head)', fontWeight: 700, fontSize: 15, lineHeight: 1.25, color: 'var(--text)', flex: 1 }}>
                {item.card_titulo}
              </div>
              <span style={{
                fontSize: 10, fontWeight: 700, letterSpacing: 0.4,
                color: 'var(--primary-dark)', background: 'var(--primary-light)',
                padding: '3px 8px', borderRadius: 20, whiteSpace: 'nowrap', flexShrink: 0,
              }}>★ Avaliar</span>
            </div>
            {item.mentor_nome && (
              <p className="mx-caption" style={{ marginBottom: 0 }}>👤 {item.mentor_nome}</p>
            )}
          </div>

          {isOpen && (
            <div style={{ marginTop: 14 }}>
              {item.card_tags?.length > 0 && (
                <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 12 }}>
                  {item.card_tags.map((t) => <TopicBadge key={t} tone="gray">#{t}</TopicBadge>)}
                </div>
              )}

              <div style={{
                padding: 10, borderRadius: 12, background: 'var(--primary-light)',
                display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12,
              }}>
                <Avatar initials={initials(item.mentor_nome)} color={grad} size={36} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{item.mentor_nome}</div>
                  <div className="mx-caption" style={{ fontSize: 11 }}>Mentor</div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 10, marginBottom: 14, fontSize: 12, color: 'var(--text-2)', flexWrap: 'wrap' }}>
                <span>📅 {formatDate(item.data_encontro)}</span>
                <span>⏱ {formatDuration(Number(item.duracao_horas))} · {item.hora_inicio?.slice(0, 5)}–{item.hora_fim?.slice(0, 5)}</span>
              </div>

              {done ? (
                <div style={{
                  textAlign: 'center', padding: '14px 0',
                  color: 'var(--secondary-dark)', fontSize: 13, fontWeight: 600,
                }}>
                  ✅ Avaliação enviada!
                </div>
              ) : (
                <>
                  <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', marginBottom: 10 }}>
                    Avalie esta mentoria
                  </p>
                  <div style={{ marginBottom: 12 }}>
                    <label style={{ fontSize: 12, color: 'var(--text-2)', display: 'block', marginBottom: 6 }}>
                      Sua nota <span style={{ color: 'var(--accent)' }}>*</span>
                    </label>
                    <StarRating value={nota || 0} onChange={onNota} />
                  </div>
                  <div style={{ marginBottom: 12 }}>
                    <label style={{ fontSize: 12, color: 'var(--text-2)', display: 'block', marginBottom: 6 }}>
                      Depoimento <span style={{ color: 'var(--text-3)' }}>(opcional)</span>
                    </label>
                    <textarea
                      value={depoimento}
                      onChange={(e) => onDepoimento(e.target.value)}
                      placeholder="Compartilhe sua experiência..."
                      maxLength={1000}
                      style={{
                        width: '100%', minHeight: 80, resize: 'vertical',
                        background: 'var(--surface)', border: '1px solid var(--border)',
                        borderRadius: 10, color: 'var(--text)', fontSize: 13,
                        padding: '10px 12px', outline: 'none', boxSizing: 'border-box',
                        fontFamily: 'var(--f-body)',
                      }}
                    />
                    <div style={{ fontSize: 11, color: 'var(--text-3)', textAlign: 'right', marginTop: 2 }}>
                      {depoimento.length}/1000
                    </div>
                  </div>
                  {error && (
                    <div style={{
                      fontSize: 12, color: 'var(--accent-dark)', marginBottom: 10,
                      padding: '8px 12px', background: 'var(--accent-light)', borderRadius: 8,
                    }}>
                      {error}
                    </div>
                  )}
                  <button
                    onClick={onSubmit}
                    disabled={submitting}
                    style={{
                      width: '100%', padding: '11px 14px', borderRadius: 12, border: 'none',
                      background: submitting
                        ? 'var(--primary-light)'
                        : 'linear-gradient(135deg, #5D46B8 0%, #3A2885 100%)',
                      boxShadow: submitting ? 'none' : '0 1px 0 rgba(93,70,184,0.25), 0 6px 16px rgba(93,70,184,0.25)',
                      color: submitting ? 'var(--primary-dark)' : '#fff',
                      fontFamily: 'var(--f-body)', fontWeight: 600, fontSize: 13,
                      cursor: submitting ? 'not-allowed' : 'pointer',
                    }}
                  >
                    {submitting ? 'Enviando…' : 'Enviar Avaliação'}
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Card: já avaliado ───────────────────────────────────────────────────────

function CardAvaliado({ item, isOpen, onToggle }: { item: AvaliacaoHistorico; isOpen: boolean; onToggle: () => void }) {
  const grad = mentorGradient(item.mentor_nome);
  return (
    <div className="mx-card" style={{ overflow: 'hidden', marginBottom: 12 }}>
      <div style={{ display: 'flex' }}>
        <div style={{ flex: 1, padding: 14 }}>
          <div onClick={onToggle} style={{ cursor: 'pointer' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10, marginBottom: 4 }}>
              <div style={{ fontFamily: 'var(--f-head)', fontWeight: 700, fontSize: 15, lineHeight: 1.25, color: 'var(--text)', flex: 1 }}>
                {item.card_titulo}
              </div>
              <StatusPill status="CONCLUIDO" size="sm" />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
              {item.mentor_nome && (
                <p className="mx-caption" style={{ marginBottom: 0 }}>👤 {item.mentor_nome}</p>
              )}
              <StarRating value={item.nota} readonly size={14} />
            </div>
          </div>

          {isOpen && (
            <div style={{ marginTop: 14 }}>
              {item.card_tags?.length > 0 && (
                <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 12 }}>
                  {item.card_tags.map((t) => <TopicBadge key={t} tone="gray">#{t}</TopicBadge>)}
                </div>
              )}

              <div style={{
                padding: 10, borderRadius: 12, background: 'var(--secondary-light)',
                display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12,
              }}>
                <Avatar initials={initials(item.mentor_nome)} color={grad} size={36} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{item.mentor_nome}</div>
                  <div className="mx-caption" style={{ fontSize: 11 }}>Mentor</div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 10, marginBottom: 14, fontSize: 12, color: 'var(--text-2)', flexWrap: 'wrap' }}>
                <span>📅 {formatDate(item.data_encontro)}</span>
                <span>⏱ {formatDuration(Number(item.duracao_horas))} · {item.hora_inicio?.slice(0, 5)}–{item.hora_fim?.slice(0, 5)}</span>
              </div>

              <div style={{ marginBottom: item.depoimento ? 12 : 0 }}>
                <div style={{ fontSize: 12, color: 'var(--text-2)', marginBottom: 6 }}>Sua avaliação</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <StarRating value={item.nota} readonly size={20} />
                  <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)' }}>{item.nota}/5</span>
                </div>
              </div>

              {item.depoimento && (
                <div style={{
                  padding: '10px 12px', borderRadius: 10,
                  background: 'var(--surface)', fontSize: 13,
                  color: 'var(--text-2)', lineHeight: 1.5, fontStyle: 'italic',
                }}>
                  "{item.depoimento}"
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Card: cancelado / expirado ─────────────────────────────────────────────

function CardFinalizado({ card, isOpen, onToggle }: { card: any; isOpen: boolean; onToggle: () => void }) {
  const isCancelled = card.status === 'CANCELADO';
  const tags: string[] = card.tags || [];

  return (
    <div className="mx-card" style={{ overflow: 'hidden', marginBottom: 12, opacity: 0.82 }}>
      <div style={{ display: 'flex' }}>
        <div style={{ flex: 1, padding: 14 }}>
          <div onClick={onToggle} style={{ cursor: 'pointer' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10, marginBottom: 6 }}>
              <div style={{ fontFamily: 'var(--f-head)', fontWeight: 700, fontSize: 15, lineHeight: 1.25, color: 'var(--text)', flex: 1 }}>
                {card.titulo}
              </div>
              <StatusPill status={card.status} size="sm" />
            </div>
            <p className="mx-caption" style={{ marginBottom: 0 }}>
              {card.descricao?.substring(0, 80)}{(card.descricao?.length ?? 0) > 80 ? '…' : ''}
            </p>
          </div>

          {isOpen && (
            <div style={{ marginTop: 14 }}>
              {card.descricao && card.descricao.length > 80 && (
                <p className="mx-caption" style={{ marginBottom: 12, lineHeight: 1.5 }}>
                  {card.descricao}
                </p>
              )}

              {tags.length > 0 && (
                <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 12 }}>
                  {tags.map((t: string) => <TopicBadge key={t} tone="gray">#{t}</TopicBadge>)}
                </div>
              )}

              {isCancelled ? (
                <div style={{
                  padding: '8px 12px', borderRadius: 10,
                  background: '#FFEBEE', color: 'var(--accent-dark)',
                  fontSize: 12, lineHeight: 1.4,
                  display: 'flex', alignItems: 'center', gap: 6,
                }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
                    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
                    <path d="M15 9l-6 6M9 9l6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                  Solicitação cancelada.
                </div>
              ) : (
                <div style={{
                  padding: '8px 12px', borderRadius: 10,
                  background: '#F5F5F5', color: '#757575',
                  fontSize: 12, lineHeight: 1.4,
                  display: 'flex', alignItems: 'center', gap: 6,
                }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
                    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
                    <path d="M12 7v5l3 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                  Prazo encerrado sem aceite de mentor.
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Seção com label ─────────────────────────────────────────────────────────

function SectionLabel({ label, count, color }: { label: string; count: number; color: string }) {
  return (
    <p className="mx-caption" style={{
      padding: '0 0 8px', fontSize: 10, fontWeight: 700,
      letterSpacing: 0.5, textTransform: 'uppercase', color,
    }}>
      {label} · {count}
    </p>
  );
}

// ── Componente principal ────────────────────────────────────────────────────

const HISTORICO_STATUSES = ['CONCLUIDO', 'CANCELADO', 'EXPIRADO'];

export const HistoricoMentorias: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [pendentes, setPendentes] = useState<PendenteItem[]>([]);
  const [historico, setHistorico] = useState<AvaliacaoHistorico[]>([]);
  const [cards, setCards] = useState<any[]>([]);
  const [tccConcluidos, setTccConcluidos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [notas, setNotas] = useState<Record<number, number>>({});
  const [depoimentos, setDepoimentos] = useState<Record<number, string>>({});
  const [submitting, setSubmitting] = useState<Record<number, boolean>>({});
  const [errors, setErrors] = useState<Record<number, string>>({});
  const [done, setDone] = useState<Record<number, boolean>>({});

  const loadData = () => {
    setLoading(true);
    Promise.all([
      api.get('/avaliacoes/pendentes'),
      api.get('/avaliacoes/historico'),
      api.get('/cards/meus'),
      api.get('/agendamentos'),
    ]).then(([p, h, c, ag]) => {
      setPendentes([...p.data].sort((a, b) => new Date(b.data_encontro).getTime() - new Date(a.data_encontro).getTime()));
      setHistorico([...h.data].sort((a, b) => new Date(b.avaliado_em).getTime() - new Date(a.avaliado_em).getTime()));
      setCards([...c.data].sort((a, b) => new Date(b.criado_em).getTime() - new Date(a.criado_em).getTime()));
      setTccConcluidos(
        (ag.data as any[])
          .filter((a) => a.card?.categoria === 'TCC' && a.status === 'CONCLUIDO')
          .sort((a, b) => new Date(b.criado_em).getTime() - new Date(a.criado_em).getTime()),
      );
    }).finally(() => setLoading(false));
  };

  useEffect(() => { loadData(); }, []);

  const toggle = (key: string) => setExpanded((prev) => (prev === key ? null : key));

  const submit = async (item: PendenteItem) => {
    const nota = notas[item.id];
    if (!nota) {
      setErrors((e) => ({ ...e, [item.id]: 'Selecione uma nota antes de enviar.' }));
      return;
    }
    setErrors((e) => ({ ...e, [item.id]: '' }));
    setSubmitting((s) => ({ ...s, [item.id]: true }));
    try {
      await api.post('/avaliacoes', {
        historico_id: item.id,
        nota,
        depoimento: depoimentos[item.id] || undefined,
      });
      setDone((d) => ({ ...d, [item.id]: true }));
      setTimeout(() => {
        setExpanded(null);
        loadData();
      }, 1200);
    } catch (err: any) {
      setErrors((e) => ({
        ...e,
        [item.id]: err.response?.data?.message || 'Erro ao enviar avaliação.',
      }));
    } finally {
      setSubmitting((s) => ({ ...s, [item.id]: false }));
    }
  };

  const cancelados = cards.filter((c) => c.status === 'CANCELADO');
  const expirados = cards.filter((c) => c.status === 'EXPIRADO');
  const totalRegistros = pendentes.length + historico.length + tccConcluidos.length + cancelados.length + expirados.length;
  const vazio = !loading && totalRegistros === 0;

  return (
    <div className="animate-fadeIn">
      <HistoricoHeader nome={user?.nome || 'Usuário'} email={user?.email || ''} />

      <div style={{ marginBottom: 16 }}>
        <p className="mx-caption" style={{
          fontSize: 10, fontWeight: 700, letterSpacing: 0.8,
          textTransform: 'uppercase', color: 'var(--text-3)',
        }}>
          {totalRegistros} registro{totalRegistros !== 1 ? 's' : ''}
        </p>
      </div>

      {loading && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[1, 2, 3].map((i) => <Skeleton key={i} height={80} />)}
        </div>
      )}

      {vazio && (
        <div className="mx-card" style={{ padding: 40, textAlign: 'center', color: 'var(--text-3)' }}>
          <div style={{
            width: 52, height: 52, borderRadius: 16, margin: '0 auto 14px',
            background: '#F5F5F5',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="9" stroke="#9E9E9E" strokeWidth="1.8" />
              <path d="M12 7v5l3 2" stroke="#9E9E9E" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </div>
          <p style={{ marginBottom: 4, fontSize: 14, color: 'var(--text-2)', fontWeight: 600 }}>
            Nenhum histórico ainda
          </p>
          <p style={{ fontSize: 12, color: 'var(--text-3)' }}>
            Mentorias concluídas, canceladas e expiradas aparecerão aqui.
          </p>
        </div>
      )}

      {!loading && pendentes.length > 0 && (
        <div style={{ marginBottom: 8 }}>
          <SectionLabel label="Pendentes de avaliação" count={pendentes.length} color="var(--primary-dark)" />
          {pendentes.map((item) => (
            <CardPendente
              key={item.id}
              item={item}
              isOpen={expanded === `p-${item.id}`}
              onToggle={() => toggle(`p-${item.id}`)}
              nota={notas[item.id] || 0}
              depoimento={depoimentos[item.id] || ''}
              submitting={!!submitting[item.id]}
              error={errors[item.id] || ''}
              done={!!done[item.id]}
              onNota={(v) => {
                setNotas((n) => ({ ...n, [item.id]: v }));
                setErrors((e) => ({ ...e, [item.id]: '' }));
              }}
              onDepoimento={(v) => setDepoimentos((d) => ({ ...d, [item.id]: v }))}
              onSubmit={() => submit(item)}
            />
          ))}
        </div>
      )}

      {!loading && historico.length > 0 && (
        <div style={{ marginBottom: 8 }}>
          <SectionLabel label="Concluídas" count={historico.length} color="var(--secondary-dark)" />
          {historico.map((item) => (
            <CardAvaliado
              key={item.avaliacao_id}
              item={item}
              isOpen={expanded === `h-${item.avaliacao_id}`}
              onToggle={() => toggle(`h-${item.avaliacao_id}`)}
            />
          ))}
        </div>
      )}

      {!loading && tccConcluidos.length > 0 && (
        <div style={{ marginBottom: 8 }}>
          <SectionLabel label="Orientações TCC" count={tccConcluidos.length} color="var(--secondary-dark)" />
          {tccConcluidos.map((ag) => {
            const professorNome = ag.mentor?.nome || 'Orientador';
            const professorIni = professorNome.split(' ').map((p: string) => p[0]).slice(0, 2).join('').toUpperCase();
            return (
              <div key={ag.id} className="mx-card" style={{ overflow: 'hidden', marginBottom: 12 }}>
                <div style={{ flex: 1, padding: 14 }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10, marginBottom: 8 }}>
                    <div style={{ fontFamily: 'var(--f-head)', fontWeight: 700, fontSize: 15, lineHeight: 1.25, color: 'var(--text)', flex: 1 }}>
                      {ag.card?.titulo || 'Orientação TCC'}
                    </div>
                    <StatusPill status="CONCLUIDO" size="sm" />
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                    <Avatar initials={professorIni} size={26} />
                    <p className="mx-caption" style={{ margin: 0 }}>Orientador: {professorNome}</p>
                  </div>
                  {ag.atualizado_em && (
                    <div style={{
                      fontSize: 11, color: 'var(--text-3)', marginBottom: 6,
                      display: 'flex', alignItems: 'center', gap: 5,
                    }}>
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8"/>
                        <path d="M12 7v5l3 2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                      </svg>
                      Concluído em {fmtDateTime(ag.atualizado_em)}
                    </div>
                  )}
                  <button
                    onClick={() => navigate(`/aluno/orientacao/${ag.id}`)}
                    style={{
                      width: '100%', padding: '8px 14px', borderRadius: 10,
                      border: '1.5px solid var(--primary)', background: 'var(--primary-light)',
                      cursor: 'pointer', fontFamily: 'var(--f-body)', fontSize: 12,
                      color: 'var(--primary-dark)', fontWeight: 600,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                    }}
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
                    </svg>
                    Ver detalhes e chat
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {!loading && cancelados.length > 0 && (
        <div style={{ marginBottom: 8 }}>
          <SectionLabel label="Canceladas" count={cancelados.length} color="var(--accent-dark)" />
          {cancelados.map((card) => (
            <CardFinalizado
              key={card.id}
              card={card}
              isOpen={expanded === `c-${card.id}`}
              onToggle={() => toggle(`c-${card.id}`)}
            />
          ))}
        </div>
      )}

      {!loading && expirados.length > 0 && (
        <div style={{ marginBottom: 8 }}>
          <SectionLabel label="Expiradas" count={expirados.length} color="#9E9E9E" />
          {expirados.map((card) => (
            <CardFinalizado
              key={card.id}
              card={card}
              isOpen={expanded === `e-${card.id}`}
              onToggle={() => toggle(`e-${card.id}`)}
            />
          ))}
        </div>
      )}
    </div>
  );
};
