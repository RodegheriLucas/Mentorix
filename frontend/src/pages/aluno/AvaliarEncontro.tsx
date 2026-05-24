import React, { useEffect, useState } from 'react';
import api from '../../config/api';
import { Button } from '../../components/ui/Button';
import { StarRating } from '../../components/ui/StarRating';
import { Skeleton } from '../../components/ui/Skeleton';

interface PendenteItem {
  id: number;
  data_encontro: string;
  checkin_em: string;
  checkout_em: string;
  duracao_horas: number;
  dia_semana: string;
  hora_inicio: string;
  hora_fim: string;
  card_titulo: string;
  card_tags: string[];
  mentor_nome: string;
  mentor_avatar: string | null;
}

function formatDate(dateStr: string): string {
  const [year, month, day] = dateStr.split('-');
  return new Date(Number(year), Number(month) - 1, Number(day)).toLocaleDateString('pt-BR', {
    weekday: 'long', day: '2-digit', month: 'long', year: 'numeric',
  });
}

function formatDuration(horas: number): string {
  const h = Math.floor(horas);
  const m = Math.round((horas - h) * 60);
  if (h === 0) return `${m}min`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}min`;
}

export const AvaliarEncontro: React.FC = () => {
  const [pendentes, setPendentes] = useState<PendenteItem[]>([]);
  const [historico, setHistorico] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [notas, setNotas] = useState<Record<number, number>>({});
  const [depoimentos, setDepoimentos] = useState<Record<number, string>>({});
  const [submitting, setSubmitting] = useState<Record<number, boolean>>({});
  const [done, setDone] = useState<Record<number, boolean>>({});
  const [errors, setErrors] = useState<Record<number, string>>({});

  const loadData = () => {
    Promise.all([
      api.get('/avaliacoes/pendentes'),
      api.get('/avaliacoes/historico'),
    ]).then(([p, h]) => {
      setPendentes(p.data);
      setHistorico(h.data);
    }).finally(() => setLoading(false));
  };

  useEffect(() => { loadData(); }, []);

  const submit = async (item: PendenteItem) => {
    const nota = notas[item.id];
    if (!nota) {
      setErrors((e) => ({ ...e, [item.id]: 'Selecione uma nota antes de enviar.' }));
      return;
    }
    setErrors((e) => ({ ...e, [item.id]: '' }));
    setSubmitting((s) => ({ ...s, [item.id]: true }));
    try {
      await api.post('/avaliacoes', {
        historico_id: item.id,
        nota,
        depoimento: depoimentos[item.id] || undefined,
      });
      setDone((d) => ({ ...d, [item.id]: true }));
      loadData();
    } catch (err: any) {
      setErrors((e) => ({
        ...e,
        [item.id]: err.response?.data?.message || 'Erro ao enviar avaliação.',
      }));
    } finally {
      setSubmitting((s) => ({ ...s, [item.id]: false }));
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {[1, 2].map((i) => <Skeleton key={i} height={200} />)}
      </div>
    );
  }

  const restantes = pendentes.filter((p) => !done[p.id]);
  const concluidas = pendentes.filter((p) => done[p.id]);

  return (
    <div className="animate-fadeIn" style={{ maxWidth: 700 }}>
      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>Avaliar Encontros</h1>
      <p style={{ color: 'var(--color-text-secondary)', marginBottom: 24 }}>
        Avalie sua experiência para liberar as horas complementares do mentor.
      </p>

      {restantes.length === 0 && concluidas.length === 0 && (
        <div className="glass" style={{ borderRadius: 'var(--border-radius)', padding: 48, textAlign: 'center', color: 'var(--color-text-muted)' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>✅</div>
          <p>Nenhuma avaliação pendente!</p>
        </div>
      )}

      {restantes.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 24 }}>
          {restantes.map((h) => (
            <div key={h.id} className="glass" style={{ borderRadius: 'var(--border-radius)', padding: 24 }}>
              {/* Mentor */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                <div style={{
                  width: 40, height: 40, borderRadius: '50%',
                  background: 'var(--color-primary-muted)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 18, fontWeight: 700, color: 'var(--color-primary)',
                  flexShrink: 0,
                }}>
                  {h.mentor_avatar
                    ? <img src={`/uploads/${h.mentor_avatar}`} alt="" style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover' }} />
                    : h.mentor_nome.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 15 }}>{h.mentor_nome}</div>
                  <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>Mentor</div>
                </div>
              </div>

              {/* Card info */}
              <div style={{ marginBottom: 16, padding: '12px 16px', background: 'var(--color-bg-glass)', borderRadius: 8, borderLeft: '3px solid var(--color-primary)' }}>
                <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>{h.card_titulo}</div>
                {h.card_tags?.length > 0 && (
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {h.card_tags.map((tag) => (
                      <span key={tag} style={{
                        fontSize: 11, padding: '2px 8px',
                        background: 'var(--color-primary-muted)',
                        color: 'var(--color-primary)',
                        borderRadius: 20, fontWeight: 500,
                      }}>{tag}</span>
                    ))}
                  </div>
                )}
              </div>

              {/* Data e duração */}
              <div style={{ display: 'flex', gap: 24, marginBottom: 20, fontSize: 13, color: 'var(--color-text-secondary)' }}>
                <div>
                  <span style={{ marginRight: 4 }}>📅</span>
                  {formatDate(h.data_encontro)}
                </div>
                <div>
                  <span style={{ marginRight: 4 }}>⏱</span>
                  {formatDuration(Number(h.duracao_horas))}
                  <span style={{ marginLeft: 8, color: 'var(--color-text-muted)' }}>
                    ({h.hora_inicio.slice(0, 5)} – {h.hora_fim.slice(0, 5)})
                  </span>
                </div>
              </div>

              {/* Nota */}
              <div style={{ marginBottom: 16 }}>
                <label style={{ fontSize: 13, color: 'var(--color-text-secondary)', display: 'block', marginBottom: 8 }}>
                  Sua avaliação <span style={{ color: 'var(--color-danger)' }}>*</span>
                </label>
                <StarRating value={notas[h.id] || 0} onChange={(v) => {
                  setNotas((n) => ({ ...n, [h.id]: v }));
                  setErrors((e) => ({ ...e, [h.id]: '' }));
                }} />
              </div>

              {/* Depoimento */}
              <div style={{ marginBottom: 16 }}>
                <label style={{ fontSize: 13, color: 'var(--color-text-secondary)', display: 'block', marginBottom: 8 }}>
                  Depoimento <span style={{ color: 'var(--color-text-muted)' }}>(opcional)</span>
                </label>
                <textarea
                  value={depoimentos[h.id] || ''}
                  onChange={(e) => setDepoimentos((d) => ({ ...d, [h.id]: e.target.value }))}
                  placeholder="Compartilhe sua experiência com este encontro..."
                  maxLength={1000}
                  style={{
                    width: '100%', minHeight: 88, resize: 'vertical',
                    background: 'var(--color-bg-glass)', border: '1px solid var(--color-border)',
                    borderRadius: 8, color: 'var(--color-text)', fontSize: 13,
                    padding: '10px 12px', outline: 'none', boxSizing: 'border-box',
                  }}
                />
                <div style={{ fontSize: 11, color: 'var(--color-text-muted)', textAlign: 'right', marginTop: 2 }}>
                  {(depoimentos[h.id] || '').length}/1000
                </div>
              </div>

              {errors[h.id] && (
                <div style={{ fontSize: 13, color: 'var(--color-danger)', marginBottom: 12, padding: '8px 12px', background: 'rgba(239,68,68,.1)', borderRadius: 6 }}>
                  {errors[h.id]}
                </div>
              )}

              <Button onClick={() => submit(h)} loading={submitting[h.id]}>
                Enviar Avaliação
              </Button>
            </div>
          ))}
        </div>
      )}

      {concluidas.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <p style={{ fontSize: 13, color: 'var(--color-text-muted)', fontWeight: 600 }}>
            Avaliações enviadas nesta sessão
          </p>
          {concluidas.map((h) => (
            <div key={h.id} className="glass" style={{
              borderRadius: 'var(--border-radius)', padding: '16px 20px',
              display: 'flex', alignItems: 'center', gap: 16,
              opacity: 0.75,
            }}>
              <div style={{ fontSize: 22 }}>✅</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: 14 }}>{h.card_titulo}</div>
                <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>
                  {h.mentor_nome} · {formatDate(h.data_encontro)}
                </div>
              </div>
              <StarRating value={notas[h.id] || 0} readonly size={16} />
            </div>
          ))}
        </div>
      )}

      {/* Histórico de todas as avaliações */}
      {historico.length > 0 && (
        <div style={{ marginTop: 32 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>Histórico de Avaliações</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {historico.map((h: any) => (
              <div key={h.avaliacao_id} className="mx-card" style={{ padding: 16 }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10, marginBottom: 10 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontFamily: 'var(--f-head)', fontWeight: 700, fontSize: 15, color: 'var(--text)', marginBottom: 4 }}>
                      {h.card_titulo}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text-2)', display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                      <span>👤 {h.mentor_nome}</span>
                      <span style={{ color: 'var(--border)' }}>·</span>
                      <span>📅 {formatDate(h.data_encontro)}</span>
                      <span style={{ color: 'var(--border)' }}>·</span>
                      <span>⏱ {h.hora_inicio?.slice(0, 5)}–{h.hora_fim?.slice(0, 5)}</span>
                      <span style={{ color: 'var(--border)' }}>·</span>
                      <span>{formatDuration(Number(h.duracao_horas))}</span>
                    </div>
                  </div>
                  <StarRating value={h.nota} readonly size={18} />
                </div>
                {h.card_tags?.length > 0 && (
                  <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 10 }}>
                    {h.card_tags.map((tag: string) => (
                      <span key={tag} style={{
                        fontSize: 10, padding: '2px 8px', borderRadius: 999,
                        background: 'var(--primary-light)', color: 'var(--primary-dark)', fontWeight: 500,
                      }}>#{tag}</span>
                    ))}
                  </div>
                )}
                {h.depoimento && (
                  <div style={{
                    padding: '10px 12px', borderRadius: 10,
                    background: 'var(--surface)', fontSize: 13,
                    color: 'var(--text-2)', lineHeight: 1.5, fontStyle: 'italic',
                  }}>
                    "{h.depoimento}"
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
