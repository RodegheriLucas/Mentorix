import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../config/api';
import { Badge, statusToBadge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';

export const GestorDashboard: React.FC = () => {
  const { user } = useAuth();
  const [hoje, setHoje] = useState<any[]>([]);
  const [disputas, setDisputas] = useState<any[]>([]);

  useEffect(() => {
    api.get('/agendamentos/hoje').then((r) => setHoje(r.data));
    api.get('/disputas').then((r) => setDisputas(r.data));
  }, []);

  const pendentes = hoje.filter((a) => a.status === 'PENDENTE_GESTOR');

  return (
    <div className="animate-fadeIn" style={{ maxWidth: 900 }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 4 }}>Olá, {user?.nome?.split(' ')[0]}!</h1>
        <p style={{ color: 'var(--color-text-secondary)' }}>Painel de gestão da portaria.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 32 }}>
        {[
          { label: 'Mentorias Hoje', value: hoje.length, icon: '🏢', color: 'var(--color-primary)' },
          { label: 'Pendentes de Instrução', value: pendentes.length, icon: '⚠️', color: 'var(--color-warning)' },
          { label: 'Disputas Abertas', value: disputas.length, icon: '⚖️', color: 'var(--color-danger)' },
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
        <Link to="/gestor/portaria"><Button>🏢 Painel de Portaria</Button></Link>
        {disputas.length > 0 && <Link to="/gestor/disputas"><Button variant="secondary">⚖️ Resolver Disputas ({disputas.length})</Button></Link>}
      </div>
    </div>
  );
};
