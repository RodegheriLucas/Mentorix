import React, { useEffect, useState } from 'react';
import api from '../config/api';
import { Badge, statusToBadge } from '../components/ui/Badge';
import { Skeleton } from '../components/ui/Skeleton';
import { Button } from '../components/ui/Button';

export const AgendamentosPage: React.FC = () => {
  const [agendamentos, setAgendamentos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () => api.get('/agendamentos').then((r) => setAgendamentos(r.data)).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const cancelar = async (id: number) => {
    if (!confirm('Cancelar este agendamento?')) return;
    try {
      await api.patch(`/agendamentos/${id}/cancelar`);
      load();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Erro ao cancelar.');
    }
  };

  if (loading) return <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>{[1,2,3].map(i => <Skeleton key={i} height={140} />)}</div>;

  return (
    <div className="animate-fadeIn" style={{ maxWidth: 800 }}>
      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 24 }}>Agendamentos</h1>

      {agendamentos.length === 0 ? (
        <div className="glass" style={{ borderRadius: 'var(--border-radius)', padding: 48, textAlign: 'center', color: 'var(--color-text-muted)' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>📅</div>
          <p>Nenhum agendamento encontrado.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {agendamentos.map((a) => (
            <div key={a.id} className="glass" style={{ borderRadius: 'var(--border-radius)', padding: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 4 }}>{a.card?.titulo}</div>
                  <div style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>
                    {a.dia_semana} • {a.hora_inicio} - {a.hora_fim} | {a.ambiente?.nome}
                  </div>
                </div>
                <Badge variant={statusToBadge(a.status)}>{a.status}</Badge>
              </div>

              {a.instrucoes_gestor && (
                <div style={{ background: 'var(--color-bg-glass)', borderRadius: 8, padding: '10px 14px', marginBottom: 12, fontSize: 13, border: '1px solid var(--color-border)' }}>
                  <strong style={{ color: 'var(--color-text-secondary)' }}>Instruções do Gestor:</strong>
                  <p style={{ color: 'var(--color-text)', marginTop: 4 }}>{a.instrucoes_gestor}</p>
                </div>
              )}

              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                {a.mentor?.telefone && (
                  <a href={`tel:${a.mentor.telefone}`}>
                    <Button size="sm" variant="secondary">📞 {a.mentor.telefone}</Button>
                  </a>
                )}
                {['PENDENTE_GESTOR', 'AGENDADO'].includes(a.status) && (
                  <Button size="sm" variant="danger" onClick={() => cancelar(a.id)}>Cancelar</Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
