import React, { useEffect, useState } from 'react';
import api from '../../config/api';
import { Avatar, TopicBadge, StatusPill } from '../../components/ui/DesignSystem';
import { Skeleton } from '../../components/ui/Skeleton';
import { useAuth } from '../../contexts/AuthContext';

function initials(name: string) {
  return name?.split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase() || '??';
}

function matchRatio(mentorTopics: string[], cardTopics: string[]) {
  if (!cardTopics.length) return 0;
  const overlap = cardTopics.filter((t) => mentorTopics.includes(t)).length;
  return overlap / cardTopics.length;
}

function heatLabel(ratio: number) {
  if (ratio >= 0.8) return { label: 'Excelente', color: '#2E7D32' };
  if (ratio >= 0.5) return { label: 'Bom', color: 'var(--primary)' };
  if (ratio >= 0.2) return { label: 'Parcial', color: '#E0A800' };
  return { label: 'Baixo', color: 'var(--text-3)' };
}

function MatchBar({ ratio }: { ratio: number }) {
  const heat = heatLabel(ratio);
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
        <span className="mx-caption" style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.8, color: heat.color }}>
          Match {heat.label}
        </span>
        <span style={{ fontFamily: 'var(--f-head)', fontWeight: 700, fontSize: 13, color: 'var(--text)' }}>
          {Math.round(ratio * 100)}%
        </span>
      </div>
      <div style={{ height: 5, borderRadius: 99, background: '#F1F1F4', overflow: 'hidden' }}>
        <div style={{
          width: `${ratio * 100}%`, height: '100%', borderRadius: 99,
          background: `linear-gradient(90deg, ${heat.color}88, ${heat.color})`,
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
      position: 'fixed', inset: 0, background: 'rgba(18,18,18,0.45)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200,
    }}>
      <div onClick={(e) => e.stopPropagation()} style={{
        width: 520, background: '#fff', borderRadius: 18, padding: 24,
        boxShadow: '0 20px 50px rgba(0,0,0,0.25)',
        maxHeight: '80vh', overflow: 'auto',
      }}>
        <p className="mx-caption" style={{
          textTransform: 'uppercase', fontSize: 10, fontWeight: 600, letterSpacing: 1,
          color: 'var(--primary)', marginBottom: 4,
        }}>Aceitar mentoria</p>
        <h2 className="mx-h2" style={{ marginBottom: 4 }}>{card?.titulo}</h2>
        <p className="mx-caption" style={{ marginBottom: 18 }}>por {card?.aluno?.nome}</p>

        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[1,2,3].map((i) => <Skeleton key={i} height={56}/>)}
          </div>
        ) : slots.length === 0 ? (
          <p style={{ color: 'var(--text-3)', textAlign: 'center', padding: '24px 0', fontSize: 13 }}>
            Nenhum slot disponível no momento.
          </p>
        ) : (
          <>
            <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)', display: 'block', marginBottom: 10 }}>
              Horários compatíveis
            </label>
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
                      width: 18, height: 18, borderRadius: '50%',
                      border: on ? '5px solid var(--primary)' : '2px solid var(--border)',
                      background: '#fff', flexShrink: 0,
                    }}/>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>
                        {slot.dia_semana} · {slot.hora_inicio} – {slot.hora_fim}
                      </div>
                      <div className="mx-caption" style={{ fontSize: 11 }}>
                        {slot.ambiente?.nome}{slot.ambiente?.bloco ? ` · ${slot.ambiente.bloco}` : ''}
                        {slot.tipo === 'SALA_FECHADA' ? ' · Sala fechada' : ' · Ambiente comum'}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
            <button
              onClick={onConfirm}
              className="mx-btn"
              disabled={!selectedSlot || confirming}
              style={{ width: '100%', padding: '14px 0', fontSize: 14, fontWeight: 600 }}
            >
              {confirming ? 'Confirmando…' : 'Aceitar mentoria'}
            </button>
          </>
        )}

        <button onClick={onClose} className="mx-btn ghost" style={{ width: '100%', marginTop: 10, padding: '12px 0' }}>
          Cancelar
        </button>
      </div>
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

  const openCard = async (card: any) => {
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
        diaSemana: selectedSlot.dia_semana,
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

  return (
    <div className="animate-fadeIn" style={{ maxWidth: 760 }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <p className="mx-caption" style={{
          fontSize: 10, fontWeight: 700, letterSpacing: 1,
          textTransform: 'uppercase', color: 'var(--primary)', marginBottom: 4,
        }}>Mentor · UniMatch</p>
        <h1 className="mx-h1" style={{ fontSize: 26 }}>{isTCC ? 'Feed TCC' : 'Descobrir mentorias'}</h1>
        <p className="mx-caption" style={{ marginTop: 4 }}>
          {cards.length} solicitaç{cards.length === 1 ? 'ão' : 'ões'} disponível{cards.length !== 1 ? 'is' : ''}
        </p>
      </div>

      {loading && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {[1,2,3].map((i) => <Skeleton key={i} height={180}/>)}
        </div>
      )}

      {!loading && cards.length === 0 && (
        <div className="mx-card" style={{ padding: 48, textAlign: 'center', color: 'var(--text-3)' }}>
          <div style={{ fontSize: 36, marginBottom: 12 }}>🎯</div>
          <p>Nenhuma solicitação disponível no momento.</p>
        </div>
      )}

      {!loading && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {cards.map((card) => {
            const cardTopics: string[] = card.tags || [];
            const ratio = mentorTopics.length > 0 ? matchRatio(mentorTopics, cardTopics) : 0;
            const hotTopics = cardTopics.filter((t) => mentorTopics.includes(t));

            return (
              <div key={card.id} className="mx-card" style={{ padding: 16 }}>
                {/* Match bar */}
                {mentorTopics.length > 0 && <MatchBar ratio={ratio}/>}

                {/* Aluno + title */}
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 10 }}>
                  <Avatar initials={initials(card.aluno?.nome || '?')} size={40}/>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="mx-caption" style={{ marginBottom: 2, fontSize: 11 }}>{card.aluno?.nome}</div>
                    <h3 className="mx-h3" style={{ fontWeight: 700, fontSize: 16, lineHeight: 1.25 }}>{card.titulo}</h3>
                  </div>
                  <StatusPill status="ABERTO" size="sm"/>
                </div>

                <p className="mx-body" style={{ color: 'var(--text-2)', marginBottom: 14, lineHeight: 1.5, fontSize: 13 }}>
                  {card.descricao?.substring(0, 180)}{card.descricao?.length > 180 ? '…' : ''}
                </p>

                {/* Topics */}
                <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 14 }}>
                  {cardTopics.map((t) => (
                    <TopicBadge key={t} tone={hotTopics.includes(t) ? 'accent' : 'gray'}>
                      {hotTopics.includes(t) && (
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" style={{ flexShrink: 0 }}>
                          <path d="M12 2C9 6 6 8 6 13a6 6 0 1 0 12 0c0-2-1-3-1-5 0-3-3-5-5-6z"/>
                        </svg>
                      )}
                      #{t}
                    </TopicBadge>
                  ))}
                </div>

                {/* Footer */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span className="mx-caption" style={{ fontSize: 11 }}>
                    {card.disponibilidades?.length ?? 0} horário(s) disponível(is)
                  </span>
                  <button onClick={() => openCard(card)} className="mx-btn" style={{ padding: '9px 16px', fontSize: 13 }}>
                    Ver slots →
                  </button>
                </div>
              </div>
            );
          })}
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
