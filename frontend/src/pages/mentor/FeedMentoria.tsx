import React, { useEffect, useState } from 'react';
import api from '../../config/api';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Skeleton } from '../../components/ui/Skeleton';
import { useAuth } from '../../contexts/AuthContext';

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
    if (!selectedSlot) { alert('Selecione um horário.'); return; }
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
      alert('Mentoria aceita! Aguarde as instruções do gestor.');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Erro ao aceitar.');
    } finally {
      setConfirming(false);
    }
  };

  if (loading) return <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>{[1,2,3].map(i => <Skeleton key={i} height={150} />)}</div>;

  return (
    <div className="animate-fadeIn" style={{ maxWidth: 800 }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 4 }}>{isTCC ? 'Feed TCC' : 'Feed de Mentorias'}</h1>
        <p style={{ color: 'var(--color-text-secondary)' }}>
          {isTCC ? 'Cards de orientação de TCC disponíveis.' : 'Solicitações de mentoria disponíveis.'}
        </p>
      </div>

      {cards.length === 0 ? (
        <div className="glass" style={{ borderRadius: 'var(--border-radius)', padding: 48, textAlign: 'center', color: 'var(--color-text-muted)' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🎯</div>
          <p>Nenhuma solicitação disponível no momento.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {cards.map((card) => (
            <div key={card.id} className="glass" style={{ borderRadius: 'var(--border-radius)', padding: 24, transition: 'border-color 0.2s', borderColor: 'var(--color-border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                <div>
                  <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 6 }}>{card.titulo}</h3>
                  <div style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>
                    por {card.aluno?.nome} • {new Date(card.criado_em).toLocaleDateString('pt-BR')}
                  </div>
                </div>
                <Badge variant="info">{card.categoria}</Badge>
              </div>

              <p style={{ fontSize: 14, color: 'var(--color-text-secondary)', marginBottom: 16, lineHeight: 1.6 }}>
                {card.descricao.substring(0, 200)}{card.descricao.length > 200 ? '...' : ''}
              </p>

              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 16 }}>
                {card.tags?.map((t: string) => (
                  <span key={t} style={{ fontSize: 11, padding: '2px 8px', background: 'var(--color-primary-light)', color: 'var(--color-primary)', borderRadius: 20 }}>#{t}</span>
                ))}
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>
                  📅 {card.disponibilidades?.length} horário(s) disponível(is)
                </span>
                <Button onClick={() => openCard(card)}>Ver Slots Disponíveis →</Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={!!selectedCard} onClose={() => setSelectedCard(null)} title={`Aceitar: ${selectedCard?.titulo}`} width={560}>
        {loadingSlots ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>{[1,2,3].map(i => <Skeleton key={i} height={60} />)}</div>
        ) : slots.length === 0 ? (
          <p style={{ color: 'var(--color-text-muted)', textAlign: 'center', padding: '24px 0' }}>Nenhum slot disponível no momento.</p>
        ) : (
          <>
            <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', marginBottom: 16 }}>Selecione um horário e local:</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 300, overflowY: 'auto', marginBottom: 20 }}>
              {slots.map((slot, i) => (
                <div
                  key={i}
                  onClick={() => setSelectedSlot(slot)}
                  style={{
                    padding: '14px 16px',
                    borderRadius: 8,
                    border: `2px solid ${selectedSlot === slot ? 'var(--color-primary)' : 'var(--color-border)'}`,
                    background: selectedSlot === slot ? 'var(--color-primary-light)' : 'var(--color-bg-glass)',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 14 }}>{slot.data ? new Date(slot.data + 'T00:00:00').toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: '2-digit', year: 'numeric' }) : ''} • {slot.hora_inicio} - {slot.hora_fim}</div>
                      <div style={{ fontSize: 12, color: 'var(--color-text-muted)', marginTop: 2 }}>
                        {slot.ambiente.nome} — {slot.ambiente.bloco}
                      </div>
                    </div>
                    <Badge variant={slot.tipo === 'SALA_FECHADA' ? 'success' : 'warning'}>
                      {slot.tipo === 'SALA_FECHADA' ? 'Sala' : 'Comum'}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
            <Button fullWidth onClick={aceitar} loading={confirming} disabled={!selectedSlot}>
              Confirmar Mentoria
            </Button>
          </>
        )}
      </Modal>
    </div>
  );
};
