import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../config/api';

interface DateSlot {
  data: string;
  hora_inicio: string;
  hora_fim: string;
}

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
  const today = new Date().toISOString().split('T')[0];

  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [categoria, setCategoria] = useState<'GERAL' | 'TCC'>('GERAL');
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [topicOpen, setTopicOpen] = useState(false);
  const [slots, setSlots] = useState<DateSlot[]>([]);
  const [novaData, setNovaData] = useState('');
  const [novaHoraInicio, setNovaHoraInicio] = useState('');
  const [novaHoraFim, setNovaHoraFim] = useState('');
  const [slotError, setSlotError] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const toggleTopic = (t: string) => {
    setSelectedTopics((prev) => prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]);
  };

  const addSlot = () => {
    setSlotError('');
    if (!novaData || !novaHoraInicio || !novaHoraFim) {
      setSlotError('Preencha data, hora de início e hora de fim.');
      return;
    }
    if (novaHoraFim <= novaHoraInicio) {
      setSlotError('A hora de fim deve ser maior que a hora de início.');
      return;
    }
    const [hI, mI] = novaHoraInicio.split(':').map(Number);
    const [hF, mF] = novaHoraFim.split(':').map(Number);
    if ((hF * 60 + mF) - (hI * 60 + mI) < 60) {
      setSlotError('O horário deve ter no mínimo 1 hora de duração.');
      return;
    }
    const duplicate = slots.some(
      (s) => s.data === novaData && s.hora_inicio === novaHoraInicio && s.hora_fim === novaHoraFim,
    );
    if (duplicate) {
      setSlotError('Este horário já foi adicionado.');
      return;
    }
    setSlots((prev) => [...prev, { data: novaData, hora_inicio: novaHoraInicio, hora_fim: novaHoraFim }]);
    setNovaHoraInicio('');
    setNovaHoraFim('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (categoria === 'GERAL' && slots.length === 0) {
      setError('Adicione pelo menos um horário de disponibilidade.');
      return;
    }
    if (selectedTopics.length === 0) { setError('Selecione pelo menos um assunto.'); return; }
    setError('');
    setLoading(true);
    try {
      await api.post('/cards', {
        titulo,
        descricao,
        categoria,
        tags: selectedTopics,
        disponibilidades: categoria === 'GERAL' ? slots : [],
      });
      navigate('/aluno/meus-cards');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao criar solicitação.');
    } finally {
      setLoading(false);
    }
  };

  const canPublish = titulo.trim() && descricao.trim() && selectedTopics.length > 0 && (categoria === 'TCC' || slots.length > 0);

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
                  {cat === 'GERAL' ? 'Geral' : 'TCC'}
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

        {categoria === 'GERAL' && (
          <div className="mx-card" style={{ padding: 20 }}>
            <h2 className="mx-h3" style={{ marginBottom: 4 }}>Disponibilidade horária</h2>
            <p className="mx-caption" style={{ marginBottom: 16 }}>Informe as datas e horários em que você está disponível para a sessão.</p>

            <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end', flexWrap: 'wrap' }}>
              <div style={{ flex: '1 1 150px' }}>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'var(--text-2)', marginBottom: 5 }}>Data</label>
                <input
                  type="date"
                  min={today}
                  value={novaData}
                  onChange={(e) => setNovaData(e.target.value)}
                  style={{ ...inputStyle, padding: '10px 12px' }}
                />
              </div>
              <div style={{ flex: '1 1 110px' }}>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'var(--text-2)', marginBottom: 5 }}>Início</label>
                <input
                  type="time"
                  value={novaHoraInicio}
                  onChange={(e) => setNovaHoraInicio(e.target.value)}
                  style={{ ...inputStyle, padding: '10px 12px' }}
                />
              </div>
              <div style={{ flex: '1 1 110px' }}>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'var(--text-2)', marginBottom: 5 }}>Fim</label>
                <input
                  type="time"
                  value={novaHoraFim}
                  onChange={(e) => setNovaHoraFim(e.target.value)}
                  style={{ ...inputStyle, padding: '10px 12px' }}
                />
              </div>
              <button
                type="button"
                onClick={addSlot}
                style={{
                  flex: '0 0 auto', padding: '10px 18px', borderRadius: 12,
                  background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))',
                  color: '#fff', border: 0, cursor: 'pointer',
                  fontFamily: 'var(--f-body)', fontWeight: 600, fontSize: 13,
                }}
              >
                + Adicionar
              </button>
            </div>

            {slotError && (
              <p style={{ fontSize: 12, color: 'var(--accent-dark)', marginTop: 8 }}>{slotError}</p>
            )}

            {slots.length > 0 && (
              <div style={{ marginTop: 14 }}>
                <div style={{ fontSize: 11, color: 'var(--text-3)', marginBottom: 8 }}>Horários adicionados:</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {slots.map((s, i) => {
                    const [year, month, day] = s.data.split('-');
                    const date = new Date(Number(year), Number(month) - 1, Number(day));
                    const weekday = date.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', '');
                    const label = `${weekday}, ${day}/${month} ${s.hora_inicio}–${s.hora_fim}`;
                    return (
                      <div key={i} style={{
                        display: 'inline-flex', alignItems: 'center', gap: 6,
                        background: 'var(--primary-light)', borderRadius: 999,
                        padding: '5px 10px', fontSize: 12,
                      }}>
                        <span style={{ color: 'var(--primary-dark)', fontWeight: 500 }}>{label}</span>
                        <button
                          type="button"
                          onClick={() => setSlots(slots.filter((_, idx) => idx !== i))}
                          style={{ background: 'none', border: 'none', color: 'var(--accent)', cursor: 'pointer', fontSize: 14, lineHeight: 1, padding: 0 }}
                        >×</button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

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
