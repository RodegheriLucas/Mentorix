import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../config/api';
import { Badge, statusToBadge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Skeleton } from '../../components/ui/Skeleton';
import { AvailabilityGrid, Slot } from '../../components/availability/AvailabilityGrid';

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '12px 14px',
  background: 'var(--color-bg-secondary)',
  border: '1px solid var(--color-border-hover)',
  borderRadius: 8, color: 'var(--color-text)', fontSize: 14, outline: 'none',
};

const labelStyle: React.CSSProperties = {
  display: 'block', fontSize: 13, fontWeight: 500,
  color: 'var(--color-text-secondary)', marginBottom: 6,
};

interface EditState {
  id: number;
  titulo: string;
  descricao: string;
  categoria: 'GERAL' | 'TCC';
  tagsInput: string;
  slots: Slot[];
  loading: boolean;
  error: string;
}

export const MeusCards: React.FC = () => {
  const [cards, setCards] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [edit, setEdit] = useState<EditState | null>(null);

  const load = () => api.get('/cards/meus').then((r) => setCards(r.data)).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const cancelar = async (id: number) => {
    if (!confirm('Cancelar este card?')) return;
    await api.delete(`/cards/${id}`);
    load();
  };

  const openEdit = (card: any) => {
    setEdit({
      id: card.id,
      titulo: card.titulo,
      descricao: card.descricao,
      categoria: card.categoria,
      tagsInput: (card.tags ?? []).join(', '),
      slots: (card.disponibilidades ?? []).map((d: any) => ({
        dia_semana: d.dia_semana,
        hora_inicio: d.hora_inicio,
        hora_fim: d.hora_fim,
      })),
      loading: false,
      error: '',
    });
  };

  const saveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!edit) return;
    if (edit.slots.length === 0) {
      setEdit({ ...edit, error: 'Adicione pelo menos um horário de disponibilidade.' });
      return;
    }
    setEdit({ ...edit, loading: true, error: '' });
    try {
      const tags = edit.tagsInput.split(',').map((t) => t.trim()).filter(Boolean);
      await api.patch(`/cards/${edit.id}`, {
        titulo: edit.titulo,
        descricao: edit.descricao,
        categoria: edit.categoria,
        tags,
        disponibilidades: edit.slots,
      });
      setEdit(null);
      load();
    } catch (err: any) {
      setEdit((prev) => prev ? { ...prev, loading: false, error: err.response?.data?.message || 'Erro ao salvar.' } : null);
    }
  };

  if (loading) return <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>{[1, 2, 3].map(i => <Skeleton key={i} height={120} />)}</div>;

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
                <div style={{ display: 'flex', gap: 8 }}>
                  {card.status === 'ABERTO' && (
                    <Button variant="secondary" size="sm" onClick={() => openEdit(card)}>Editar</Button>
                  )}
                  {card.status === 'ABERTO' && (
                    <Button variant="danger" size="sm" onClick={() => cancelar(card.id)}>Cancelar</Button>
                  )}
                </div>
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

      {edit && (
        <div
          style={{
            position: 'fixed', inset: 0, background: 'var(--color-bg-secondary)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 1000, padding: 16,
          }}
          onClick={(e) => { if (e.target === e.currentTarget) setEdit(null); }}
        >
          <div
            className="glass"
            style={{
              borderRadius: 'var(--border-radius)', padding: 32,
              width: '100%', maxWidth: 680,
              maxHeight: '90vh', overflowY: 'auto',
            }}
          >
            <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 20 }}>Editar Card</h2>

            <form onSubmit={saveEdit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={labelStyle}>Título</label>
                <input
                  style={inputStyle}
                  value={edit.titulo}
                  onChange={(e) => setEdit({ ...edit, titulo: e.target.value })}
                  required
                  maxLength={200}
                />
              </div>

              <div>
                <label style={labelStyle}>Descrição</label>
                <textarea
                  style={{ ...inputStyle, minHeight: 100, resize: 'vertical' }}
                  value={edit.descricao}
                  onChange={(e) => setEdit({ ...edit, descricao: e.target.value })}
                  required
                />
              </div>

              <div>
                <label style={labelStyle}>Categoria</label>
                <div style={{ display: 'flex', gap: 12 }}>
                  {(['GERAL', 'TCC'] as const).map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setEdit({ ...edit, categoria: cat })}
                      style={{
                        flex: 1, padding: '12px', borderRadius: 8,
                        border: `2px solid ${edit.categoria === cat ? 'var(--color-primary)' : 'var(--color-border)'}`,
                        background: edit.categoria === cat ? 'var(--color-primary-light)' : 'transparent',
                        color: edit.categoria === cat ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                        fontWeight: 600, fontSize: 14, cursor: 'pointer', transition: 'all 0.2s',
                      }}
                    >
                      {cat === 'GERAL' ? '📘 Geral' : '🎓 TCC'}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label style={labelStyle}>Tags (separadas por vírgula)</label>
                <input
                  style={inputStyle}
                  value={edit.tagsInput}
                  onChange={(e) => setEdit({ ...edit, tagsInput: e.target.value })}
                  placeholder="Ex: SQL, Python, IHC"
                />
              </div>

              <div>
                <label style={{ ...labelStyle, marginBottom: 12 }}>Disponibilidade Horária</label>
                <AvailabilityGrid
                  value={edit.slots}
                  onChange={(slots) => setEdit({ ...edit, slots })}
                />
              </div>

              {edit.error && (
                <div style={{ background: 'var(--color-danger-bg)', border: '1px solid var(--color-danger)', borderRadius: 8, padding: '12px 16px', fontSize: 13, color: 'var(--color-danger)' }}>
                  {edit.error}
                </div>
              )}

              <div style={{ display: 'flex', gap: 12, marginTop: 4 }}>
                <Button type="submit" loading={edit.loading}>Salvar Alterações</Button>
                <Button type="button" variant="secondary" onClick={() => setEdit(null)}>Cancelar</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
