import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../config/api';

function StatCard({ label, value, sub, color, bg, icon }: {
  label: string; value: number; sub: string; color: string; bg: string; icon: React.ReactNode;
}) {
  return (
    <div className="mx-card" style={{ padding: 16, flex: 1, minWidth: 0 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
        <div style={{
          width: 32, height: 32, borderRadius: 9, background: bg, color,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>{icon}</div>
        <div className="mx-caption" style={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.4, fontSize: 10 }}>
          {label}
        </div>
      </div>
      <div style={{ fontFamily: 'var(--f-head)', fontWeight: 700, fontSize: 28, color: 'var(--text)', lineHeight: 1 }}>{value}</div>
      <div className="mx-caption" style={{ marginTop: 4, fontSize: 11 }}>{sub}</div>
    </div>
  );
}

export const GestorDashboard: React.FC = () => {
  const { user } = useAuth();
  const [hoje, setHoje] = useState<any[]>([]);
  const [disputas, setDisputas] = useState<any[]>([]);

  useEffect(() => {
    api.get('/agendamentos/hoje').then((r) => setHoje(r.data));
    api.get('/disputas').then((r) => setDisputas(r.data));
  }, []);

  const pendentes   = hoje.filter((a) => a.status === 'PENDENTE_GESTOR');
  const emAndamento = hoje.filter((a) => a.status === 'EM_ANDAMENTO');

  return (
    <div className="animate-fadeIn" style={{ maxWidth: 900 }}>
      <div style={{ marginBottom: 28 }}>
        <p className="mx-caption" style={{
          fontSize: 10, fontWeight: 700, letterSpacing: 1,
          textTransform: 'uppercase', color: 'var(--primary)', marginBottom: 4,
        }}>Gestor · UniMatch</p>
        <h1 style={{ fontFamily: 'var(--f-head)', fontWeight: 700, fontSize: 28, color: 'var(--text)', margin: 0 }}>
          Olá, {user?.nome?.split(' ')[0]}!
        </h1>
        <p className="mx-caption" style={{ marginTop: 4 }}>
          {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' })}
        </p>
      </div>

      <div style={{ display: 'flex', gap: 14, marginBottom: 28 }}>
        <StatCard
          label="Mentorias hoje" value={hoje.length} sub="no painel de portaria"
          color="var(--primary)" bg="var(--primary-light)"
          icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2"/><path d="M3 9h18M8 2v4M16 2v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>}
        />
        <StatCard
          label="Pendentes" value={pendentes.length} sub="aguardando instruções"
          color="#7A5B00" bg="#FFF7E0"
          icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2"/><path d="M12 7v5l3 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>}
        />
        <StatCard
          label="Em andamento" value={emAndamento.length} sub="salas ocupadas"
          color="var(--secondary)" bg="var(--secondary-light)"
          icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M4 12l5 5L20 6" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"/></svg>}
        />
        <StatCard
          label="Disputas" value={disputas.length} sub="aguardando parecer"
          color="var(--accent)" bg="var(--accent-light)"
          icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M12 2L2 22h20L12 2z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/><path d="M12 9v6M12 18v.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>}
        />
      </div>

      <div style={{ display: 'flex', gap: 12 }}>
        <Link to="/gestor/portaria" className="mx-btn" style={{ textDecoration: 'none' }}>
          Painel de Portaria
        </Link>
        {disputas.length > 0 && (
          <Link to="/gestor/disputas" className="mx-btn accent" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
            Resolver Disputas
            <span style={{ fontSize: 11, fontWeight: 700, padding: '1px 7px', borderRadius: 999, background: 'rgba(255,255,255,0.25)' }}>
              {disputas.length}
            </span>
          </Link>
        )}
        <Link to="/gestor/ambientes" className="mx-btn ghost" style={{ textDecoration: 'none' }}>
          Ambientes
        </Link>
      </div>
    </div>
  );
};
