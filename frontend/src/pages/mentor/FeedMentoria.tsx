import React, { useEffect, useState } from 'react';
import api from '../../config/api';
import { Avatar, TopicBadge, MxLogo } from '../../components/ui/DesignSystem';
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

function avatarGrad(nome?: string) {
  if (!nome) return AVATAR_GRADIENTS[0];
  let h = 0;
  for (let i = 0; i < nome.length; i++) h = (h * 31 + nome.charCodeAt(i)) % AVATAR_GRADIENTS.length;
  return AVATAR_GRADIENTS[Math.abs(h)];
}

function initials(name: string) {
  return name?.split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase() || '??';
}

function matchRatio(mentorTopics: string[], cardTopics: string[]) {
  if (!cardTopics.length || !mentorTopics.length) return 0;
  return cardTopics.filter((t) => mentorTopics.includes(t)).length / cardTopics.length;
}

function heatColor(ratio: number) {
  if (ratio >= 0.8) return { core: '#5D46B8', label: 'Forte' };
  if (ratio >= 0.5) return { core: '#9C7BE0', label: 'Bom' };
  if (ratio >= 0.25) return { core: '#E8B33A', label: 'Parcial' };
  return { core: '#E64A19', label: 'Baixo' };
}

function MatchBar({ ratio }: { ratio: number }) {
  const h = heatColor(ratio);
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
        <span style={{
          fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.8,
          color: h.core, fontFamily: 'var(--f-body)',
        }}>Match {h.label}</span>
        <span style={{ fontFamily: 'var(--f-head)', fontWeight: 700, fontSize: 12, color: 'var(--text)' }}>
          {Math.round(ratio * 100)}%
        </span>
      </div>
      <div style={{ height: 4, borderRadius: 99, background: '#F1F1F4', overflow: 'hidden' }}>
        <div style={{
          width: `${ratio * 100}%`, height: '100%', borderRadius: 99,
          background: `linear-gradient(90deg, ${h.core}66, ${h.core})`,
          transition: 'width .4s ease',
        }}/>
      </div>
    </div>
  );
}

interface SlotModalProps {
  card: any;
  slots: any[];
  loading: boolean;
  selectedSlot: any;
  onSelectSlot: (s: any) => void;
  onConfirm: () => void;
  onClose: () => void;
  confirming: boolean;
}

function SlotModal({ card, slots, loading, selectedSlot, onSelectSlot, onConfirm, onClose, confirming }: SlotModalProps) {
  return (
    <div onClick={onClose} style={{
      position: 'fixed', inset: 0, background: 'rgba(18,18,18,0.5)',
      backdropFilter: 'blur(6px)', display: 'flex',
      alignItems: 'flex-end', justifyContent: 'center', zIndex: 1000,
    }}>
      <div onClick={(e) => e.stopPropagation()} style={{
        width: '100%', maxWidth: 402,
        background: '#fff', borderRadius: '24px 24px 0 0',
        padding: '20px 20px 32px',
        boxShadow: '0 -8px 40px rgba(0,0,0,0.2)',
        maxHeight: 680, overflowY: 'auto',
      }}>
        {/* Handle */}
        <div style={{
          width: 36, height: 4, borderRadius: 99,
          background: 'var(--border)', margin: '0 auto 18px',
        }}/>

        <p className="mx-caption" style={{
          textTransform: 'uppercase', fontSize: 9, fontWeight: 700, letterSpacing: 1,
          color: 'var(--primary)', marginBottom: 4,
        }}>Aceitar mentoria</p>
        <h2 style={{ fontFamily: 'var(--f-head)', fontWeight: 700, fontSize: 17, lineHeight: 1.25, color: 'var(--text)', marginBottom: 3 }}>
          {card?.titulo}
        </h2>
        <p className="mx-caption" style={{ marginBottom: 18, fontSize: 12 }}>
          por {card?.aluno?.nome}
        </p>

        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[1,2,3].map((i) => <Skeleton key={i} height={56}/>)}
          </div>
        ) : slots.length === 0 ? (
          <p style={{ color: 'var(--text-3)', textAlign: 'center', padding: '20px 0', fontSize: 13 }}>
            Nenhum slot disponível no momento.
          </p>
        ) : (
          <>
            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)', marginBottom: 10 }}>
              Horários compatíveis
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
              {slots.map((slot, i) => {
                const on = selectedSlot === slot;
                return (
                  <button key={i} onClick={() => onSelectSlot(slot)} style={{
                    textAlign: 'left', padding: '12px 14px', borderRadius: 12, cursor: 'pointer',
                    border: on ? '2px solid var(--primary)' : '1px solid var(--border)',
                    background: on ? 'var(--primary-light)' : '#fff',
                    display: 'flex', alignItems: 'center', gap: 10,
                  }}>
                    <div style={{
                      width: 18, height: 18, borderRadius: '50%', flexShrink: 0,
                      border: on ? '5px solid var(--primary)' : '2px solid var(--border)',
                      background: '#fff',
                    }}/>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>
                        {slot.data ? new Date(slot.data + 'T00:00:00').toLocaleDateString('pt-BR', { weekday: 'short', day: 'numeric', month: 'short' }) : ''} · {slot.hora_inicio} – {slot.hora_fim}
                      </div>
                      <div className="mx-caption" style={{ fontSize: 11 }}>
                        {slot.ambiente?.nome}{slot.ambiente?.bloco ? ` · ${slot.ambiente.bloco}` : ''}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
            <button onClick={onConfirm} disabled={!selectedSlot || confirming} style={{
              width: '100%', padding: '14px 0', borderRadius: 12, border: 0,
              cursor: (!selectedSlot || confirming) ? 'not-allowed' : 'pointer',
              background: (!selectedSlot || confirming)
                ? 'rgba(93,70,184,0.4)'
                : 'linear-gradient(135deg, #5D46B8, #3A2885)',
              color: '#fff', fontFamily: 'var(--f-body)', fontWeight: 600, fontSize: 14,
              boxShadow: (!selectedSlot || confirming) ? 'none' : '0 4px 14px rgba(93,70,184,0.35)',
            }}>
              {confirming ? 'Confirmando…' : 'Aceitar mentoria'}
            </button>
          </>
        )}

        <button onClick={onClose} style={{
          width: '100%', marginTop: 10, padding: '12px 0', borderRadius: 12,
          border: '1px solid var(--border)', background: '#fff', cursor: 'pointer',
          fontFamily: 'var(--f-body)', fontWeight: 500, fontSize: 14, color: 'var(--text-2)',
        }}>Cancelar</button>
      </div>
    </div>
  );
}

function FeedCard({ card, mentorTopics, onAccept }: { card: any; mentorTopics: string[]; onAccept: (c: any) => void }) {
  const [expanded, setExpanded] = useState(false);

  const cardTopics: string[] = card.tags || [];
  const ratio = matchRatio(mentorTopics, cardTopics);
  const hotTopics = cardTopics.filter((t) => mentorTopics.includes(t));
  const hasMentorTopics = mentorTopics.length > 0;

  const aluno = card.aluno || {};
  const grad = avatarGrad(aluno.nome || '?');
  const curso: string = aluno.curso || '';
  const periodo: string = aluno.periodo || aluno.semestre || '';
  const metaLine = [curso, periodo].filter(Boolean).join(' · ');

  return (
    <div
      onClick={() => setExpanded((v) => !v)}
      className="mx-card"
      style={{
        overflow: 'hidden', cursor: 'pointer',
        border: expanded ? '1.5px solid var(--primary)' : '1px solid transparent',
        transition: 'border-color 0.15s',
      }}
    >
      {/* Match bar */}
      {hasMentorTopics && (
        <div style={{ padding: '12px 14px 0' }}>
          <MatchBar ratio={ratio}/>
        </div>
      )}

      <div style={{ padding: hasMentorTopics ? '0 14px 14px' : '14px' }}>
        {/* Aluno row: avatar + info + status dot */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
          <Avatar initials={initials(aluno.nome || '?')} color={grad} size={38}/>
          <div style={{ flex: 1, minWidth: 0 }}>
            {metaLine && (
              <div className="mx-caption" style={{ fontSize: 10, marginBottom: 2, color: 'var(--text-3)' }}>
                {metaLine}
              </div>
            )}
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', lineHeight: 1.2 }}>
              {aluno.nome || '—'}
            </div>
          </div>
          {/* Expand/collapse indicator */}
          <div style={{
            width: 22, height: 22, borderRadius: '50%', flexShrink: 0,
            background: expanded ? 'var(--primary)' : 'var(--surface)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'all 0.15s',
          }}>
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none"
              style={{ transform: expanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
              <path d="M6 9l6 6 6-6" stroke={expanded ? '#fff' : 'var(--text-3)'} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </div>

        {/* Title */}
        <div style={{ fontFamily: 'var(--f-head)', fontWeight: 700, fontSize: 14, lineHeight: 1.3, color: 'var(--text)', marginBottom: 10 }}>
          {card.titulo}
        </div>

        {/* Description — only when expanded */}
        {expanded && card.descricao && (
          <p style={{
            fontSize: 13, color: 'var(--text-2)', lineHeight: 1.55, marginBottom: 12,
            fontFamily: 'var(--f-body)',
            animation: 'mxFadeIn 0.2s ease',
          }}>
            {card.descricao}
          </p>
        )}

        {/* Topics */}
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 12 }}>
          {cardTopics.map((t) => (
            <TopicBadge key={t} tone={hotTopics.includes(t) ? 'accent' : 'gray'}>
              {hotTopics.includes(t) && (
                <svg width="9" height="9" viewBox="0 0 24 24" fill="currentColor" style={{ flexShrink: 0 }}>
                  <path d="M12 2C9 6 6 8 6 13a6 6 0 1 0 12 0c0-2-1-3-1-5 0-3-3-5-5-6z"/>
                </svg>
              )}
              #{t}
            </TopicBadge>
          ))}
        </div>

        {/* Footer */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          paddingTop: 10, borderTop: '1px solid var(--border)',
        }}>
          <span className="mx-caption" style={{ fontSize: 11 }}>
            {card.disponibilidades?.length ?? 0} slot{(card.disponibilidades?.length ?? 0) !== 1 ? 's' : ''} disponível
          </span>
          <button
            onClick={(e) => { e.stopPropagation(); onAccept(card); }}
            style={{
              padding: '8px 14px', borderRadius: 10, border: 0, cursor: 'pointer',
              background: 'linear-gradient(135deg, #5D46B8, #3A2885)',
              color: '#fff', fontFamily: 'var(--f-body)', fontWeight: 600, fontSize: 12,
              boxShadow: '0 2px 8px rgba(93,70,184,0.3)',
            }}
          >
            Ver slots →
          </button>
        </div>
      </div>

      <style>{`@keyframes mxFadeIn { from { opacity:0; transform:translateY(-4px); } to { opacity:1; transform:none; } }`}</style>
    </div>
  );
}

export const FeedMentoria: React.FC = () => {
  const { user } = useAuth();
  const [cards, setCards] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCard, setSelectedCard] = useState<any>(null);
  const [slots, setSlots] = useState<any[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<any>(null);
  const [confirming, setConfirming] = useState(false);

  const isTCC = user?.papel === 'PROFESSOR_MENTOR';
  const mentorTopics: string[] = user?.tags_competencia || [];

  useEffect(() => {
    api.get('/feed').then((r) => setCards(r.data)).finally(() => setLoading(false));
  }, []);

  const openAccept = async (card: any) => {
    setSelectedCard(card);
    setLoadingSlots(true);
    setSlots([]);
    setSelectedSlot(null);
    try {
      const r = await api.get(`/feed/${card.id}/slots`);
      setSlots(r.data);
    } finally {
      setLoadingSlots(false);
    }
  };

  const aceitar = async () => {
    if (!selectedSlot) return;
    setConfirming(true);
    try {
      await api.post(`/feed/${selectedCard.id}/aceitar`, {
        ambienteId: selectedSlot.ambiente.id,
        data: selectedSlot.data,
        horaInicio: selectedSlot.hora_inicio,
        horaFim: selectedSlot.hora_fim,
      });
      setCards((prev) => prev.filter((c) => c.id !== selectedCard.id));
      setSelectedCard(null);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Erro ao aceitar.');
    } finally {
      setConfirming(false);
    }
  };

  const firstName = user?.nome?.split(' ')[0] || '';

  return (
    <div className="animate-fadeIn">
      {/* Header */}
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
            }}>{isTCC ? 'Professor' : 'Mentor'}</span>
          </div>
        </div>
        <h1 className="mx-h1" style={{ fontSize: 22 }}>
          {isTCC ? 'Feed TCC' : 'Descobrir'}
        </h1>
        <p className="mx-caption" style={{ marginTop: 2 }}>
          {loading ? '…' : `${cards.length} solicitaç${cards.length === 1 ? 'ão' : 'ões'} disponível${cards.length !== 1 ? 'is' : ''}`}
        </p>
      </div>

      {/* Your topics */}
      {mentorTopics.length > 0 && (
        <div style={{
          marginBottom: 14, padding: '10px 12px', borderRadius: 12,
          background: '#fff', border: '1px solid var(--border)',
          display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap',
        }}>
          <span className="mx-caption" style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5, color: 'var(--text-3)', flexShrink: 0 }}>
            Seus assuntos
          </span>
          {mentorTopics.map((t) => (
            <span key={t} style={{
              padding: '3px 8px', borderRadius: 999,
              background: 'var(--primary-light)', color: 'var(--primary-dark)',
              fontSize: 11, fontWeight: 500, fontFamily: 'var(--f-body)',
            }}>#{t}</span>
          ))}
        </div>
      )}

      {loading && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[1,2,3].map((i) => <Skeleton key={i} height={160}/>)}
        </div>
      )}

      {!loading && cards.length === 0 && (
        <div className="mx-card" style={{ padding: 40, textAlign: 'center', color: 'var(--text-3)' }}>
          <div style={{
            width: 52, height: 52, borderRadius: 16, margin: '0 auto 14px',
            background: 'var(--primary-light)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M9 3L3 5v16l6-2 6 2 6-2V3l-6 2-6-2z" stroke="var(--primary)" strokeWidth="1.8" strokeLinejoin="round"/>
              <path d="M9 3v16M15 5v16" stroke="var(--primary)" strokeWidth="1.8"/>
            </svg>
          </div>
          <p style={{ fontSize: 14, color: 'var(--text-2)' }}>Nenhuma solicitação disponível agora.</p>
        </div>
      )}

      {!loading && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {cards.map((card) => (
            <FeedCard
              key={card.id}
              card={card}
              mentorTopics={mentorTopics}
              onAccept={openAccept}
            />
          ))}
        </div>
      )}

      {selectedCard && (
        <SlotModal
          card={selectedCard}
          slots={slots}
          loading={loadingSlots}
          selectedSlot={selectedSlot}
          onSelectSlot={setSelectedSlot}
          onConfirm={aceitar}
          onClose={() => setSelectedCard(null)}
          confirming={confirming}
        />
      )}
    </div>
  );
};
