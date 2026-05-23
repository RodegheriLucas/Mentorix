import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../config/api';
import { AvailabilityGrid, Slot } from '../../components/availability/AvailabilityGrid';

const TOPICS = [
  'SQL', 'Postgres', 'Indexação',
  'React', 'TypeScript', 'Hooks',
  'Python', 'Pandas', 'Estatística',
  'Cálculo II', 'Álgebra Linear',
  'UX/UI', 'Figma', 'C', 'Git', 'CI/CD',
];

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label style={{ display: 'block', marginBottom: 6 }}>
        <span style={{ fontFamily: 'var(--f-body)', fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{label}</span>
        {hint && <span style={{ display: 'block', fontSize: 11, color: 'var(--text-3)', marginTop: 2 }}>{hint}</span>}
      </label>
      {children}
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '12px 14px', borderRadius: 12,
  border: '1px solid var(--border)', background: '#fff',
  fontFamily: 'var(--f-body)', fontSize: 14, color: 'var(--text)',
  outline: 'none', boxSizing: 'border-box',
};

export const NovoCard: React.FC = () => {
  const navigate = useNavigate();
  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [categoria, setCategoria] = useState<'GERAL' | 'TCC'>('GERAL');
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [topicOpen, setTopicOpen] = useState(false);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const toggleTopic = (t: string) => {
    setSelectedTopics((prev) => prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (slots.length === 0) { setError('Adicione pelo menos um horário de disponibilidade.'); return; }
    if (selectedTopics.length === 0) { setError('Selecione pelo menos um assunto.'); return; }
    setError('');
    setLoading(true);
    try {
      await api.post('/cards', { titulo, descricao, categoria, tags: selectedTopics, disponibilidades: slots });
      navigate('/aluno');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao criar solicitação.');
    } finally {
      setLoading(false);
    }
  };

  const canPublish = titulo.trim() && descricao.trim() && selectedTopics.length > 0 && slots.length > 0;

  return (
    <div className="animate-fadeIn" style={{ maxWidth: 720 }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <p className="mx-caption" style={{
          fontSize: 10, fontWeight: 700, letterSpacing: 1,
          textTransform: 'uppercase', color: 'var(--primary)', marginBottom: 4,
        }}>Aluno · UniMatch</p>
        <h1 className="mx-h1" style={{ fontSize: 26 }}>Nova solicitação</h1>
        <p className="mx-caption" style={{ marginTop: 4 }}>Descreva sua necessidade acadêmica para que mentores compatíveis possam aceitar.</p>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div className="mx-card" style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 18 }}>
          <Field label="Título">
            <input
              style={inputStyle}
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              placeholder="Ex: Ajuda com queries lentas em Postgres"
              required maxLength={200}
            />
          </Field>

          <Field label="Descrição">
            <textarea
              style={{ ...inputStyle, resize: 'none', lineHeight: 1.45 }}
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              placeholder="Descreva sua dificuldade em detalhes..."
              rows={4}
              required
              maxLength={600}
            />
            <div style={{ fontSize: 10, color: 'var(--text-3)', textAlign: 'right', marginTop: 4 }}>{descricao.length}/600</div>
          </Field>

          <Field label="Categoria">
            <div style={{ display: 'flex', gap: 10 }}>
              {(['GERAL', 'TCC'] as const).map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategoria(cat)}
                  style={{
                    flex: 1, padding: '12px', borderRadius: 12, cursor: 'pointer',
                    border: categoria === cat ? '2px solid var(--primary)' : '1px solid var(--border)',
                    background: categoria === cat ? 'var(--primary-light)' : '#fff',
                    color: categoria === cat ? 'var(--primary-dark)' : 'var(--text-2)',
                    fontFamily: 'var(--f-body)', fontWeight: 600, fontSize: 14,
                    transition: 'all 0.15s',
                  }}
                >
                  {cat === 'GERAL' ? '📘 Geral' : '🎓 TCC'}
                </button>
              ))}
            </div>
          </Field>

          <Field label="Assuntos" hint="Tags usadas para casar com o mentor">
            {/* Trigger */}
            <button type="button" onClick={() => setTopicOpen((o) => !o)} style={{
              width: '100%', textAlign: 'left',
              padding: '12px 14px', borderRadius: 12,
              border: '1px solid var(--border)', background: '#fff', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              fontFamily: 'var(--f-body)', fontSize: 14, color: 'var(--text)',
            }}>
              <span style={{ color: selectedTopics.length ? 'var(--text)' : 'var(--text-3)' }}>
                {selectedTopics.length
                  ? `${selectedTopics.length} assunto${selectedTopics.length > 1 ? 's' : ''} selecionado${selectedTopics.length > 1 ? 's' : ''}`
                  : 'Escolha os assuntos…'}
              </span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path d="M6 9l6 6 6-6" stroke="var(--text-2)" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </button>

            {/* Selected chips */}
            {selectedTopics.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 10 }}>
                {selectedTopics.map((t) => (
                  <button key={t} type="button" onClick={() => toggleTopic(t)} style={{
                    padding: '5px 10px 5px 12px', borderRadius: 999,
                    background: 'var(--primary)', color: '#fff', border: 0, cursor: 'pointer',
                    fontFamily: 'var(--f-body)', fontSize: 12, fontWeight: 500,
                    display: 'inline-flex', alignItems: 'center', gap: 6,
                  }}>
                    #{t}
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none">
                      <path d="M6 6l12 12M18 6l-12 12" stroke="#fff" strokeWidth="2.4" strokeLinecap="round"/>
                    </svg>
                  </button>
                ))}
              </div>
            )}

            {/* Dropdown */}
            {topicOpen && (
              <div style={{
                marginTop: 12, padding: 14, borderRadius: 14,
                background: 'var(--surface)', border: '1px solid var(--border)',
              }}>
                <div className="mx-caption" style={{ fontWeight: 600, marginBottom: 10, textTransform: 'uppercase', letterSpacing: 0.5, fontSize: 10 }}>
                  Disponíveis
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {TOPICS.map((t) => {
                    const on = selectedTopics.includes(t);
                    return (
                      <button key={t} type="button" onClick={() => toggleTopic(t)} style={{
                        padding: '5px 10px', borderRadius: 999, cursor: 'pointer',
                        border: on ? '1px solid var(--primary)' : '1px solid var(--border)',
                        background: on ? 'var(--primary)' : '#fff',
                        color: on ? '#fff' : 'var(--text)',
                        fontFamily: 'var(--f-body)', fontSize: 12, fontWeight: 500,
                      }}>
                        {on ? '✓ ' : ''}#{t}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </Field>
        </div>

        <div className="mx-card" style={{ padding: 20 }}>
          <h2 className="mx-h3" style={{ marginBottom: 6 }}>Disponibilidade horária</h2>
          <p className="mx-caption" style={{ marginBottom: 14 }}>Clique nas células para liberar horários de seg–sab, 8h–18h.</p>
          <AvailabilityGrid value={slots} onChange={setSlots}/>
        </div>

        {error && (
          <div style={{ background: 'var(--accent-light)', border: '1px solid var(--accent)', borderRadius: 10, padding: '12px 16px', fontSize: 13, color: 'var(--accent-dark)' }}>
            {error}
          </div>
        )}

        <div style={{ display: 'flex', gap: 12 }}>
          <button
            type="submit"
            disabled={!canPublish || loading}
            className="mx-btn"
            style={{ padding: '14px 24px', fontSize: 15, fontWeight: 600, opacity: canPublish ? 1 : 0.5 }}
          >
            {loading ? 'Publicando…' : 'Publicar solicitação →'}
          </button>
          <button type="button" className="mx-btn ghost" onClick={() => navigate(-1)} style={{ padding: '14px 20px' }}>
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
};
