import React, { useEffect, useState } from 'react';
import api from '../../config/api';
import { Button } from '../../components/ui/Button';
import { StarRating } from '../../components/ui/StarRating';
import { Skeleton } from '../../components/ui/Skeleton';

export const AvaliarEncontro: React.FC = () => {
  const [pendentes, setPendentes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [notas, setNotas] = useState<Record<number, number>>({});
  const [depoimentos, setDepoimentos] = useState<Record<number, string>>({});
  const [submitting, setSubmitting] = useState<Record<number, boolean>>({});
  const [done, setDone] = useState<Record<number, boolean>>({});

  useEffect(() => {
    api.get('/avaliacoes/pendentes').then((r) => setPendentes(r.data)).finally(() => setLoading(false));
  }, []);

  const submit = async (historico_id: number) => {
    const nota = notas[historico_id];
    if (!nota) { alert('Selecione uma nota.'); return; }
    setSubmitting((s) => ({ ...s, [historico_id]: true }));
    try {
      await api.post('/avaliacoes', { historico_id, nota, depoimento: depoimentos[historico_id] });
      setDone((d) => ({ ...d, [historico_id]: true }));
    } catch (err: any) {
      alert(err.response?.data?.message || 'Erro ao avaliar.');
    } finally {
      setSubmitting((s) => ({ ...s, [historico_id]: false }));
    }
  };

  if (loading) return <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>{[1,2].map(i => <Skeleton key={i} height={160} />)}</div>;

  const restantes = pendentes.filter((p) => !done[p.id]);

  return (
    <div className="animate-fadeIn" style={{ maxWidth: 700 }}>
      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>Avaliar Encontros</h1>
      <p style={{ color: 'var(--color-text-secondary)', marginBottom: 24 }}>Avalie sua experiência para liberar as horas do mentor.</p>

      {restantes.length === 0 ? (
        <div className="glass" style={{ borderRadius: 'var(--border-radius)', padding: 48, textAlign: 'center', color: 'var(--color-text-muted)' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>✅</div>
          <p>Nenhuma avaliação pendente!</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {restantes.map((h) => (
            <div key={h.id} className="glass" style={{ borderRadius: 'var(--border-radius)', padding: 24 }}>
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>
                  Encontro em {new Date(h.data_encontro).toLocaleDateString('pt-BR')}
                </div>
                <div style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>
                  Duração: {h.duracao_horas}h
                </div>
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={{ fontSize: 13, color: 'var(--color-text-secondary)', display: 'block', marginBottom: 8 }}>Avaliação</label>
                <StarRating value={notas[h.id] || 0} onChange={(v) => setNotas((n) => ({ ...n, [h.id]: v }))} />
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={{ fontSize: 13, color: 'var(--color-text-secondary)', display: 'block', marginBottom: 8 }}>Depoimento (opcional)</label>
                <textarea
                  value={depoimentos[h.id] || ''}
                  onChange={(e) => setDepoimentos((d) => ({ ...d, [h.id]: e.target.value }))}
                  placeholder="Compartilhe sua experiência..."
                  style={{
                    width: '100%', minHeight: 80, resize: 'vertical',
                    background: 'var(--color-bg-glass)', border: '1px solid var(--color-border)',
                    borderRadius: 8, color: 'var(--color-text)', fontSize: 13,
                    padding: '10px 12px', outline: 'none',
                  }}
                />
              </div>

              <Button onClick={() => submit(h.id)} loading={submitting[h.id]}>
                Enviar Avaliação
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
