import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../config/api';

interface Stats {
  agendamentosHoje: number;
  disputasPendentes: number;
  ambientesAtivos: number;
  sessoesEmAndamento: number;
}

export const GestorDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    Promise.all([
      api.get('/agendamentos').catch(() => ({ data: [] })),
      api.get('/disputas').catch(() => ({ data: [] })),
      api.get('/ambientes').catch(() => ({ data: [] })),
    ]).then(([ag, disp, amb]) => {
      const hoje = new Date().toISOString().split('T')[0];
      const agendamentos = Array.isArray(ag.data) ? ag.data : [];
      setStats({
        agendamentosHoje: agendamentos.filter((a: any) => a.data_agendamento?.startsWith(hoje)).length,
        disputasPendentes: Array.isArray(disp.data) ? disp.data.filter((d: any) => d.status === 'ABERTA').length : 0,
        ambientesAtivos: Array.isArray(amb.data) ? amb.data.length : 0,
        sessoesEmAndamento: agendamentos.filter((a: any) => a.status === 'EM_ANDAMENTO').length,
      });
    });
  }, []);

  const cards = [
    {
      label: 'Portaria / Check-in',
      desc: 'Iniciar e encerrar sessões',
      value: stats?.sessoesEmAndamento ?? '—',
      valueLabel: 'em andamento',
      color: '#2E7D32',
      bg: '#E8F5E9',
      path: '/gestor/portaria',
    },
    {
      label: 'Agendamentos de hoje',
      desc: 'Sessões marcadas para hoje',
      value: stats?.agendamentosHoje ?? '—',
      valueLabel: 'agendamentos',
      color: '#5D46B8',
      bg: '#ECE9F9',
      path: '/gestor/portaria',
    },
    {
      label: 'Contestações',
      desc: 'Disputas aguardando resolução',
      value: stats?.disputasPendentes ?? '—',
      valueLabel: 'pendentes',
      color: '#E64A19',
      bg: '#FBE9E7',
      path: '/gestor/disputas',
    },
    {
      label: 'Ambientes',
      desc: 'Salas e espaços cadastrados',
      value: stats?.ambientesAtivos ?? '—',
      valueLabel: 'ambientes',
      color: '#5D46B8',
      bg: '#ECE9F9',
      path: '/gestor/ambientes',
    },
  ];

  const firstName = user?.nome?.split(' ')[0] ?? 'Gestor';

  return (
    <div>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontFamily: 'var(--f-head)', fontSize: 24, fontWeight: 700, color: 'var(--text)', margin: 0, letterSpacing: -0.5 }}>
          Olá, {firstName}.
        </h1>
        <p style={{ fontFamily: 'var(--f-body)', fontSize: 14, color: 'var(--text-2)', margin: '4px 0 0' }}>
          Painel administrativo — {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' })}
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16 }}>
        {cards.map((c) => (
          <button
            key={c.label}
            onClick={() => navigate(c.path)}
            style={{
              background: '#fff',
              border: '1px solid var(--border)',
              borderRadius: 12,
              padding: '20px 20px 16px',
              textAlign: 'left',
              cursor: 'pointer',
              transition: 'box-shadow 0.15s',
              outline: 'none',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.08)')}
            onMouseLeave={(e) => (e.currentTarget.style.boxShadow = 'none')}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <span style={{ fontFamily: 'var(--f-head)', fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>
                {c.label}
              </span>
              <span style={{ background: c.bg, color: c.color, borderRadius: 8, padding: '2px 8px', fontSize: 11, fontWeight: 700 }}>
                {c.value}
              </span>
            </div>
            <p style={{ fontFamily: 'var(--f-body)', fontSize: 12, color: 'var(--text-2)', margin: 0 }}>{c.desc}</p>
            <p style={{ fontFamily: 'var(--f-body)', fontSize: 11, color: 'var(--text-3)', margin: '4px 0 0' }}>{c.valueLabel}</p>
          </button>
        ))}
      </div>
    </div>
  );
};
