import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../config/api';
import { DatePicker } from '../../components/ui/DatePicker';
import { TimePicker } from '../../components/ui/TimePicker';

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
  const { id } = useParams<{ id: string }>();
  const isEdit = !!id;
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
  const [initialLoading, setInitialLoading] = useState(isEdit);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isEdit) {
      api.get(`/cards/${id}`)
        .then((r) => {
          const card = r.data;
          setTitulo(card.titulo);
          setDescricao(card.descricao);
          setCategoria(card.categoria);
          setSelectedTopics(card.tags || []);
          setSlots((card.disponibilidades || []).map((d: any) => ({
            data: d.data,
            hora_inicio: d.hora_inicio,
            hora_fim: d.hora_fim,
          })));
        })
        .catch(() => setError('Erro ao carregar os dados da solicitação.'))
        .finally(() => setInitialLoading(false));
    }
  }, [id, isEdit]);

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
      const data = {
        titulo,
        descricao,
        categoria,
        tags: selectedTopics,
        disponibilidades: categoria === 'GERAL' ? slots : [],
      };

      if (isEdit) {
        await api.patch(`/cards/${id}`, data);
      } else {
        await api.post('/cards', data);
      }
      navigate('/aluno/meus-cards');
    } catch (err: any) {
      const msg = err.response?.data?.message;
      setError(Array.isArray(msg) ? msg.join(' · ') : (msg || `Erro ao ${isEdit ? 'salvar' : 'criar'} solicitação.`));
    } finally {
      setLoading(false);
    }
  };

  const canPublish = titulo.trim() && descricao.trim() && selectedTopics.length > 0 && (categoria === 'TCC' || slots.length > 0);

  if (initialLoading) {
    return <div style={{ padding: 40, color: 'var(--text-3)' }}>Carregando dados...</div>;
  }

  return (
    <div className="animate-fadeIn" style={{ maxWidth: 720 }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h1 className="mx-h1" style={{ fontSize: 26 }}>{isEdit ? 'Editar solicitação' : 'Nova solicitação'}</h1>
        <p className="mx-caption" style={{ marginTop: 4 }}>
          {isEdit ? 'Atualize os detalhes da sua necessidade acadêmica.' : 'Descreva sua necessidade acadêmica.'}
        </p>
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

            {/* Date row */}
            <div style={{ marginBottom: 10 }}>
              <DatePicker
                value={novaData}
                onChange={setNovaData}
                min={today}
                label="Data"
                placeholder="Escolha uma data..."
              />
              {novaData && (
                <div style={{
                  marginTop: 6, fontSize: 11, color: 'var(--primary-dark)', fontWeight: 600,
                  display: 'flex', alignItems: 'center', gap: 4,
                }}>
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none">
                    <rect x="3" y="4" width="18" height="18" rx="3" stroke="currentColor" strokeWidth="2" fill="none"/>
                    <path d="M3 9h18" stroke="currentColor" strokeWidth="2"/>
                  </svg>
                  {new Date(novaData + 'T00:00:00').toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })}
                </div>
              )}
            </div>

            {/* Time + button row */}
            <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end', flexWrap: 'wrap' }}>
              <div style={{ flex: '1 1 110px' }}>
                <TimePicker value={novaHoraInicio} onChange={setNovaHoraInicio} label="Início" placeholder="--:--" />
              </div>
              <div style={{ flex: '1 1 110px' }}>
                <TimePicker value={novaHoraFim} onChange={setNovaHoraFim} label="Fim" placeholder="--:--" />
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
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {slots.map((s, i) => {
                    const isoDate = (s.data || '').split('T')[0];
                    const [year, month, day] = isoDate.split('-');
                    const dateObj = new Date(Number(year), Number(month) - 1, Number(day));
                    const weekday = dateObj.toLocaleDateString('pt-BR', { weekday: 'long' });
                    const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1);
                    return (
                      <div key={i} style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        background: 'var(--primary-light)', borderRadius: 12,
                        padding: '8px 12px', gap: 10,
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                            <rect x="3" y="4" width="18" height="18" rx="3" stroke="var(--primary)" strokeWidth="2" fill="none"/>
                            <path d="M3 9h18M8 2v4M16 2v4" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round"/>
                          </svg>
                          <div>
                            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--primary-dark)' }}>
                              {capitalize(weekday)}, {String(day).padStart(2,'0')}/{String(month).padStart(2,'0')}
                            </div>
                            <div style={{ fontSize: 11, color: 'var(--primary)', fontWeight: 500 }}>
                              {s.hora_inicio} – {s.hora_fim}
                            </div>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => setSlots(slots.filter((_, idx) => idx !== i))}
                          style={{
                            background: 'rgba(230,74,25,0.12)', border: 'none', borderRadius: 6,
                            color: 'var(--accent-dark)', cursor: 'pointer', fontSize: 13,
                            lineHeight: 1, padding: '4px 6px', fontWeight: 700,
                          }}
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
            {loading ? (isEdit ? 'Salvando…' : 'Publicando…') : (isEdit ? 'Salvar alterações →' : 'Publicar solicitação →')}
          </button>
          <button type="button" className="mx-btn ghost" onClick={() => navigate(-1)} style={{ padding: '14px 20px' }}>
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
};
