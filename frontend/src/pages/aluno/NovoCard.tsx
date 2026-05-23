import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../config/api';
import { Button } from '../../components/ui/Button';
import { AvailabilityGrid, Slot } from '../../components/availability/AvailabilityGrid';

export const NovoCard: React.FC = () => {
  const navigate = useNavigate();
  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [categoria, setCategoria] = useState<'GERAL' | 'TCC'>('GERAL');
  const [tagsInput, setTagsInput] = useState('');
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const tags = tagsInput.split(',').map((t) => t.trim()).filter(Boolean);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (slots.length === 0) { setError('Adicione pelo menos um horário de disponibilidade.'); return; }
    setError('');
    setLoading(true);
    try {
      await api.post('/cards', { titulo, descricao, categoria, tags, disponibilidades: slots });
      navigate('/aluno/meus-cards');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao criar solicitação.');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '12px 14px',
    background: 'var(--color-bg-glass)',
    border: '1px solid var(--color-border)',
    borderRadius: 8, color: 'var(--color-text)', fontSize: 14, outline: 'none',
  };

  const labelStyle: React.CSSProperties = {
    display: 'block', fontSize: 13, fontWeight: 500,
    color: 'var(--color-text-secondary)', marginBottom: 6,
  };

  return (
    <div className="animate-fadeIn" style={{ maxWidth: 700 }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 4 }}>Nova Solicitação</h1>
        <p style={{ color: 'var(--color-text-secondary)' }}>Descreva sua necessidade acadêmica.</p>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div className="glass" style={{ borderRadius: 'var(--border-radius)', padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={labelStyle}>Título</label>
            <input style={inputStyle} value={titulo} onChange={(e) => setTitulo(e.target.value)} placeholder="Ex: Ajuda com SQL Avançado" required maxLength={200} />
          </div>

          <div>
            <label style={labelStyle}>Descrição</label>
            <textarea
              style={{ ...inputStyle, minHeight: 100, resize: 'vertical' }}
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              placeholder="Descreva sua dificuldade em detalhes..."
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
                  onClick={() => setCategoria(cat)}
                  style={{
                    flex: 1, padding: '12px', borderRadius: 8,
                    border: `2px solid ${categoria === cat ? 'var(--color-primary)' : 'var(--color-border)'}`,
                    background: categoria === cat ? 'var(--color-primary-light)' : 'transparent',
                    color: categoria === cat ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                    fontWeight: 600, fontSize: 14, cursor: 'pointer', transition: 'all 0.2s',
                  }}
                >
                  {cat === 'GERAL' ? '📘 Geral' : '🎓 TCC'}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label style={labelStyle}>Tags de Competência (separadas por vírgula)</label>
            <input style={inputStyle} value={tagsInput} onChange={(e) => setTagsInput(e.target.value)} placeholder="Ex: SQL, Python, IHC" />
          </div>
        </div>

        <div className="glass" style={{ borderRadius: 'var(--border-radius)', padding: 24 }}>
          <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>Disponibilidade Horária</h2>
          <p style={{ fontSize: 13, color: 'var(--color-text-muted)', marginBottom: 16 }}>Clique ou arraste para selecionar seus horários disponíveis (mínimo 1h por slot).</p>
          <AvailabilityGrid value={slots} onChange={setSlots} />
        </div>

        {error && (
          <div style={{ background: 'var(--color-danger-bg)', border: '1px solid var(--color-danger)', borderRadius: 8, padding: '12px 16px', fontSize: 13, color: 'var(--color-danger)' }}>
            {error}
          </div>
        )}

        <div style={{ display: 'flex', gap: 12 }}>
          <Button type="submit" loading={loading} size="lg">Publicar Solicitação</Button>
          <Button type="button" variant="secondary" onClick={() => navigate(-1)}>Cancelar</Button>
        </div>
      </form>
    </div>
  );
};
