import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../config/api';
import { StatusPill, Avatar, TopicBadge, MxLogo } from '../../components/ui/DesignSystem';
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

function mentorGradient(nome?: string) {
  if (!nome) return AVATAR_GRADIENTS[0];
  let hash = 0;
  for (let i = 0; i < nome.length; i++) hash = (hash * 31 + nome.charCodeAt(i)) % AVATAR_GRADIENTS.length;
  return AVATAR_GRADIENTS[Math.abs(hash)];
}

function initials(name: string) {
  return name?.split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase() || '??';
}

function stripeColor(status: string) {
  if (status === 'CONCLUIDO') return 'rgba(46,125,50,0.5)';
  if (status === 'CANCELADO') return 'var(--accent-dark)';
  if (status === 'EXPIRADO')  return '#9E9E9E';
  return 'var(--border)';
}

function HistoricoHeader({ nome, email }: { nome: string; email: string }) {
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
      <h1 className="mx-h1" style={{ fontSize: 24 }}>Histórico</h1>
      <p className="mx-caption" style={{ marginTop: 2 }}>{email}</p>
    </div>
  );
}

function CardHistorico({ card }: { card: any }) {
  const tags: string[] = card.tags || [];
  const mentor = card.agendamento?.mentor;
  const grad = mentor ? mentorGradient(mentor.nome) : undefined;
  const stripe = stripeColor(card.status);

  const isExpired   = card.status === 'EXPIRADO';
  const isCancelled = card.status === 'CANCELADO';
  const isDone      = card.status === 'CONCLUIDO';

  return (
    <div className="mx-card" style={{ overflow: 'hidden', marginBottom: 12, opacity: isExpired || isCancelled ? 0.82 : 1 }}>
      <div style={{ display: 'flex' }}>
        <div style={{ width: 4, background: stripe, flexShrink: 0 }}/>
        <div style={{ flex: 1, padding: 14 }}>
          {/* Title + Status */}
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10, marginBottom: 6 }}>
            <div style={{ fontFamily: 'var(--f-head)', fontWeight: 700, fontSize: 15, lineHeight: 1.25, color: 'var(--text)', flex: 1 }}>
              {card.titulo}
            </div>
            <StatusPill status={card.status} size="sm"/>
          </div>

          {/* Description */}
          <p className="mx-caption" style={{ marginBottom: 10, lineHeight: 1.45 }}>
            {card.descricao?.substring(0, 120)}{(card.descricao?.length ?? 0) > 120 ? '…' : ''}
          </p>

          {/* Tags */}
          {tags.length > 0 && (
            <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 10 }}>
              {tags.map((t) => <TopicBadge key={t} tone="gray">#{t}</TopicBadge>)}
            </div>
          )}

          {/* Mentor row (CONCLUIDO) */}
          {mentor && isDone && (
            <div style={{
              padding: 10, borderRadius: 12,
              background: 'var(--secondary-light)',
              display: 'flex', alignItems: 'center', gap: 10,
              marginBottom: 10,
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

          {/* Avaliar CTA */}
          {isDone && (
            <Link to="/aluno/avaliar" style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              padding: '10px 14px', borderRadius: 12,
              background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))',
              boxShadow: '0 1px 0 rgba(93,70,184,0.25), 0 6px 16px rgba(93,70,184,0.20)',
              color: '#fff', fontFamily: 'var(--f-body)', fontWeight: 600, fontSize: 13,
              textDecoration: 'none',
            }}>
              ★ Avaliar a mentoria{mentor ? ` de ${mentor.nome.split(' ')[0]}` : ''}
            </Link>
          )}

          {/* Cancelado note */}
          {isCancelled && (
            <div style={{
              padding: '8px 12px', borderRadius: 10,
              background: '#FFEBEE', color: 'var(--accent-dark)',
              fontSize: 12, lineHeight: 1.4,
              display: 'flex', alignItems: 'center', gap: 6,
            }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
                <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2"/>
                <path d="M15 9l-6 6M9 9l6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              Solicitação cancelada.
            </div>
          )}

          {/* Expirado note */}
          {isExpired && (
            <div style={{
              padding: '8px 12px', borderRadius: 10,
              background: '#F5F5F5', color: '#757575',
              fontSize: 12, lineHeight: 1.4,
              display: 'flex', alignItems: 'center', gap: 6,
            }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
                <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2"/>
                <path d="M12 7v5l3 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              Prazo encerrado sem aceite de mentor.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const HISTORICO_STATUSES = ['CONCLUIDO', 'CANCELADO', 'EXPIRADO'];

export const HistoricoMentorias: React.FC = () => {
  const { user } = useAuth();
  const [cards, setCards] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/cards/meus')
      .then((r) => setCards(r.data))
      .finally(() => setLoading(false));
  }, []);

  const historico = cards.filter((c) => HISTORICO_STATUSES.includes(c.status));

  const concluidos = historico.filter((c) => c.status === 'CONCLUIDO');
  const cancelados = historico.filter((c) => c.status === 'CANCELADO');
  const expirados  = historico.filter((c) => c.status === 'EXPIRADO');

  return (
    <div className="animate-fadeIn">
      <HistoricoHeader nome={user?.nome || 'Usuário'} email={user?.email || ''}/>

      <div style={{ marginBottom: 16 }}>
        <p className="mx-caption" style={{
          fontSize: 10, fontWeight: 700, letterSpacing: 0.8,
          textTransform: 'uppercase', color: 'var(--text-3)',
        }}>
          {historico.length} registro{historico.length !== 1 ? 's' : ''}
        </p>
      </div>

      {loading && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[1, 2, 3].map((i) => <Skeleton key={i} height={130}/>)}
        </div>
      )}

      {!loading && historico.length === 0 && (
        <div className="mx-card" style={{ padding: 40, textAlign: 'center', color: 'var(--text-3)' }}>
          <div style={{
            width: 52, height: 52, borderRadius: 16, margin: '0 auto 14px',
            background: '#F5F5F5',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="9" stroke="#9E9E9E" strokeWidth="1.8"/>
              <path d="M12 7v5l3 2" stroke="#9E9E9E" strokeWidth="1.8" strokeLinecap="round"/>
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

      {!loading && concluidos.length > 0 && (
        <div style={{ marginBottom: 8 }}>
          <p className="mx-caption" style={{ padding: '0 0 8px', fontSize: 10, fontWeight: 700, letterSpacing: 0.5, textTransform: 'uppercase', color: 'var(--secondary-dark)' }}>
            Concluídas · {concluidos.length}
          </p>
          {concluidos.map((card) => <CardHistorico key={card.id} card={card}/>)}
        </div>
      )}

      {!loading && cancelados.length > 0 && (
        <div style={{ marginBottom: 8 }}>
          <p className="mx-caption" style={{ padding: '0 0 8px', fontSize: 10, fontWeight: 700, letterSpacing: 0.5, textTransform: 'uppercase', color: 'var(--accent-dark)' }}>
            Canceladas · {cancelados.length}
          </p>
          {cancelados.map((card) => <CardHistorico key={card.id} card={card}/>)}
        </div>
      )}

      {!loading && expirados.length > 0 && (
        <div style={{ marginBottom: 8 }}>
          <p className="mx-caption" style={{ padding: '0 0 8px', fontSize: 10, fontWeight: 700, letterSpacing: 0.5, textTransform: 'uppercase', color: '#9E9E9E' }}>
            Expiradas · {expirados.length}
          </p>
          {expirados.map((card) => <CardHistorico key={card.id} card={card}/>)}
        </div>
      )}
    </div>
  );
};
