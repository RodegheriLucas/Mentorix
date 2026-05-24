import React, { useEffect, useState } from 'react';
import { PageHeader } from '../../components/ui/PageHeader';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../config/api';
import { Badge, statusToBadge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Skeleton } from '../../components/ui/Skeleton';

export const AlunoDashboard: React.FC = () => {
  const { user } = useAuth();
  const [cards, setCards] = useState<any[]>([]);
  const [agendamentos, setAgendamentos] = useState<any[]>([]);
  const [pendentes, setPendentes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/cards/meus'),
      api.get('/agendamentos'),
      api.get('/avaliacoes/pendentes'),
    ]).then(([c, a, p]) => {
      setCards([...c.data].sort((a, b) => new Date(b.criado_em).getTime() - new Date(a.criado_em).getTime()));
      setAgendamentos(a.data);
      setPendentes(p.data);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>{[1,2,3].map(i => <Skeleton key={i} height={80} />)}</div>;

  const ativos = cards.filter((c) => ['ABERTO','ACEITO','AGENDADO','EM_ANDAMENTO'].includes(c.status));

  return (
    <div className="animate-fadeIn" style={{ maxWidth: 900 }}>
      <div style={{ marginBottom: 32 }}>
        <PageHeader title={`Olá, ${user?.nome?.split(' ')[0]}!`} />
        <p style={{ color: 'var(--color-text-secondary)' }}>Bem-vindo à sua área de aprendizado.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 32 }}>
        {[
          { label: 'Cards Ativos', value: ativos.length, icon: '📄', color: 'var(--color-primary)' },
          { label: 'Agendamentos', value: agendamentos.length, icon: '📅', color: 'var(--color-success)' },
          { label: 'Avaliações Pendentes', value: pendentes.length, icon: '⭐', color: 'var(--color-warning)' },
        ].map((stat) => (
          <div key={stat.label} className="glass" style={{ borderRadius: 'var(--border-radius)', padding: '20px', display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ fontSize: 32 }}>{stat.icon}</div>
            <div>
              <div style={{ fontSize: 28, fontWeight: 700, color: stat.color }}>{stat.value}</div>
              <div style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>{stat.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
        {pendentes.length > 0 && (
          <Link to="/aluno/avaliar">
            <Button variant="secondary">⭐ Avaliar Encontros ({pendentes.length})</Button>
          </Link>
        )}
      </div>

      <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16 }}>Meus Cards</h2>
      {cards.length === 0 ? (
        <div className="glass" style={{ borderRadius: 'var(--border-radius)', padding: 32, textAlign: 'center', color: 'var(--color-text-muted)' }}>
          Nenhum card criado ainda. <Link to="/aluno/novo-card">Crie sua primeira solicitação!</Link>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
          {cards.map((card) => (
            <div key={card.id} className="glass" style={{ borderRadius: 'var(--border-radius)', padding: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                <h3 style={{ fontSize: 15, fontWeight: 600, color: 'var(--color-text)' }}>{card.titulo}</h3>
                <Badge variant={statusToBadge(card.status)}>{card.status}</Badge>
              </div>
              <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', marginBottom: 12, lineHeight: 1.5 }}>
                {card.descricao.substring(0, 100)}{card.descricao.length > 100 ? '...' : ''}
              </p>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {card.tags?.map((t: string) => (
                  <span key={t} style={{ fontSize: 11, padding: '2px 8px', background: 'var(--color-primary-light)', color: 'var(--color-primary)', borderRadius: 20 }}>
                    #{t}
                  </span>
                ))}
              </div>
              <div style={{ marginTop: 12, fontSize: 12, color: 'var(--color-text-muted)' }}>
                {card.disponibilidades?.length || 0} horário(s) disponível(is)
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
