import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../config/api';
import { Badge, statusToBadge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Skeleton } from '../../components/ui/Skeleton';

export const MeusCards: React.FC = () => {
  const [cards, setCards] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () => api.get('/cards/meus').then((r) => setCards(r.data)).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const cancelar = async (id: number) => {
    if (!confirm('Cancelar este card?')) return;
    await api.delete(`/cards/${id}`);
    load();
  };

  if (loading) return <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>{[1,2,3].map(i => <Skeleton key={i} height={120} />)}</div>;

  return (
    <div className="animate-fadeIn" style={{ maxWidth: 800 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700 }}>Meus Cards</h1>
        <Link to="/aluno/novo-card"><Button>+ Novo Card</Button></Link>
      </div>

      {cards.length === 0 ? (
        <div className="glass" style={{ borderRadius: 'var(--border-radius)', padding: 48, textAlign: 'center', color: 'var(--color-text-muted)' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>📄</div>
          <p>Nenhuma solicitação criada ainda.</p>
          <Link to="/aluno/novo-card" style={{ marginTop: 16, display: 'inline-block' }}>
            <Button>Criar primeira solicitação</Button>
          </Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {cards.map((card) => (
            <div key={card.id} className="glass" style={{ borderRadius: 'var(--border-radius)', padding: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                <div>
                  <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 4 }}>{card.titulo}</h3>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <Badge variant={statusToBadge(card.status)}>{card.status}</Badge>
                    <span style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>{card.categoria}</span>
                  </div>
                </div>
                {['ABERTO', 'ACEITO'].includes(card.status) && (
                  <Button variant="danger" size="sm" onClick={() => cancelar(card.id)}>Cancelar</Button>
                )}
              </div>
              <p style={{ fontSize: 14, color: 'var(--color-text-secondary)', marginBottom: 12, lineHeight: 1.6 }}>{card.descricao}</p>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12 }}>
                {card.tags?.map((t: string) => (
                  <span key={t} style={{ fontSize: 11, padding: '2px 8px', background: 'var(--color-primary-light)', color: 'var(--color-primary)', borderRadius: 20 }}>#{t}</span>
                ))}
              </div>
              <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>
                {card.disponibilidades?.map((d: any) => `${d.dia_semana} ${d.hora_inicio}-${d.hora_fim}`).join(' | ')}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
