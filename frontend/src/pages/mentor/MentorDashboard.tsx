import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../config/api';
import { Badge, statusToBadge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Skeleton } from '../../components/ui/Skeleton';

export const MentorDashboard: React.FC = () => {
  const { user } = useAuth();
  const [agendamentos, setAgendamentos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/agendamentos').then((r) => setAgendamentos(r.data)).finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>{[1,2].map(i => <Skeleton key={i} height={100} />)}</div>;

  const ativos = agendamentos.filter((a) => ['PENDENTE_GESTOR','AGENDADO','EM_ANDAMENTO'].includes(a.status));

  return (
    <div className="animate-fadeIn" style={{ maxWidth: 900 }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 4 }}>Olá, {user?.nome?.split(' ')[0]}!</h1>
        <p style={{ color: 'var(--color-text-secondary)' }}>Bem-vindo ao seu painel de mentor.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 32 }}>
        {[
          { label: 'Horas Acumuladas', value: `${Number(user?.horas_complementares || 0).toFixed(1)}h`, icon: '⏱️', color: 'var(--color-primary)' },
          { label: 'Mentorias Ativas', value: ativos.length, icon: '🎯', color: 'var(--color-success)' },
          { label: 'Total de Mentorias', value: agendamentos.length, icon: '📊', color: 'var(--color-info)' },
        ].map((stat) => (
          <div key={stat.label} className="glass" style={{ borderRadius: 'var(--border-radius)', padding: '20px', display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ fontSize: 32 }}>{stat.icon}</div>
            <div>
              <div style={{ fontSize: 24, fontWeight: 700, color: stat.color }}>{stat.value}</div>
              <div style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>{stat.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
        <Link to="/mentor/feed"><Button>🎯 Ver Feed</Button></Link>
        <Link to="/mentor/horas"><Button variant="secondary">⏱️ Minhas Horas</Button></Link>
      </div>

      <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16 }}>Mentorias Recentes</h2>
      {agendamentos.length === 0 ? (
        <div className="glass" style={{ borderRadius: 'var(--border-radius)', padding: 32, textAlign: 'center', color: 'var(--color-text-muted)' }}>
          Nenhuma mentoria ainda. <Link to="/mentor/feed">Explore o feed!</Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {agendamentos.slice(0, 5).map((a) => (
            <div key={a.id} className="glass" style={{ borderRadius: 'var(--border-radius)', padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600 }}>{a.card?.titulo}</div>
                <div style={{ fontSize: 12, color: 'var(--color-text-muted)', marginTop: 2 }}>
                  {a.dia_semana} {a.hora_inicio}-{a.hora_fim} — {a.ambiente?.nome}
                </div>
              </div>
              <Badge variant={statusToBadge(a.status)}>{a.status}</Badge>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
