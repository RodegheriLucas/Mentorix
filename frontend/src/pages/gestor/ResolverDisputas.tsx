import React, { useEffect, useState } from 'react';
import api from '../../config/api';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Skeleton } from '../../components/ui/Skeleton';

export const ResolverDisputas: React.FC = () => {
  const [disputas, setDisputas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<any>(null);
  const [parecer, setParecer] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const load = () => api.get('/disputas').then((r) => setDisputas(r.data)).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const resolver = async (aprovada: boolean) => {
    if (!parecer.trim()) { setError('Digite o parecer antes de resolver.'); return; }
    setError('');
    setSaving(true);
    try {
      await api.patch(`/disputas/${selected.id}/resolver`, { aprovada, parecer });
      setSelected(null);
      setParecer('');
      load();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao resolver contestação.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Skeleton height={200} />;

  return (
    <div className="animate-fadeIn" style={{ maxWidth: 800 }}>
      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>Resolver Disputas</h1>
      <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', marginBottom: 24 }}>
        Contestações abertas por mentores que realizaram sessões não avaliadas pelo aluno.
      </p>

      {disputas.length === 0 ? (
        <div className="glass" style={{ borderRadius: 'var(--border-radius)', padding: 48, textAlign: 'center', color: 'var(--color-text-muted)' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>⚖️</div>
          <p>Nenhuma contestação aberta.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {disputas.map((d) => {
            const agendamento = d.historico?.agendamento;
            const card = agendamento?.card;
            const aluno = card?.aluno;
            const duracaoHoras = d.historico?.duracao_horas;

            return (
              <div key={d.id} className="glass" style={{ borderRadius: 'var(--border-radius)', padding: 24 }}>
                {/* Cabeçalho: mentor e card */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 2 }}>{d.mentor?.nome}</div>
                    <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>Mentor</div>
                  </div>
                  {duracaoHoras && (
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--color-primary)' }}>{Number(duracaoHoras).toFixed(1)}h</div>
                      <div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>em disputa</div>
                    </div>
                  )}
                </div>

                {/* Contexto da sessão */}
                {card && (
                  <div style={{ padding: '10px 14px', background: 'var(--color-bg-glass)', borderRadius: 8, borderLeft: '3px solid var(--color-primary)', marginBottom: 14 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 2 }}>{card.titulo}</div>
                    <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>
                      Aluno: {aluno?.nome ?? '—'} · {agendamento?.dia_semana} {agendamento?.hora_inicio?.slice(0,5)}–{agendamento?.hora_fim?.slice(0,5)}
                    </div>
                  </div>
                )}

                {/* Justificativa */}
                <div style={{ marginBottom: 14 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: 4 }}>Justificativa do mentor</div>
                  <div style={{ fontSize: 13, color: 'var(--color-text)', lineHeight: 1.6 }}>{d.justificativa}</div>
                </div>

                {/* Foto */}
                {d.foto_url && (
                  <img
                    src={d.foto_url}
                    alt="Comprovante"
                    style={{ maxWidth: '100%', maxHeight: 200, borderRadius: 8, marginBottom: 14, objectFit: 'cover', display: 'block' }}
                  />
                )}

                <Button size="sm" onClick={() => { setSelected(d); setParecer(''); setError(''); }}>
                  Analisar e Resolver
                </Button>
              </div>
            );
          })}
        </div>
      )}

      <Modal open={!!selected} onClose={() => { setSelected(null); setError(''); }} title="Resolver Contestação">
        {selected && (
          <>
            <div style={{ marginBottom: 16, padding: '12px 14px', background: 'var(--color-bg-glass)', borderRadius: 8 }}>
              <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 4 }}>
                {selected.historico?.agendamento?.card?.titulo ?? 'Sessão'}
              </div>
              <div style={{ fontSize: 12, color: 'var(--color-text-muted)', marginBottom: 8 }}>
                Mentor: {selected.mentor?.nome} · {Number(selected.historico?.duracao_horas ?? 0).toFixed(1)}h
              </div>
              <div style={{ fontSize: 13, color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
                {selected.justificativa}
              </div>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--color-text-secondary)', display: 'block', marginBottom: 6 }}>
                Seu Parecer <span style={{ color: 'var(--color-danger)' }}>*</span>
              </label>
              <textarea
                value={parecer}
                onChange={(e) => { setParecer(e.target.value); setError(''); }}
                placeholder="Descreva sua decisão e a justificativa..."
                style={{
                  width: '100%', minHeight: 88, resize: 'vertical',
                  padding: '10px 12px', background: 'var(--color-bg-glass)',
                  border: '1px solid var(--color-border)', borderRadius: 8,
                  color: 'var(--color-text)', fontSize: 13, outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            {error && (
              <div style={{ fontSize: 13, color: 'var(--color-danger)', marginBottom: 12, padding: '8px 12px', background: 'rgba(239,68,68,.1)', borderRadius: 6 }}>
                {error}
              </div>
            )}

            <div style={{ display: 'flex', gap: 12 }}>
              <Button fullWidth onClick={() => resolver(true)} loading={saving}>
                ✅ Aprovar — Liberar {Number(selected.historico?.duracao_horas ?? 0).toFixed(1)}h
              </Button>
              <Button fullWidth variant="danger" onClick={() => resolver(false)} loading={saving}>
                ❌ Rejeitar
              </Button>
            </div>
          </>
        )}
      </Modal>
    </div>
  );
};
