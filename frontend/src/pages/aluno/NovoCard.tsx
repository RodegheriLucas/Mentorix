import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { DatePicker } from '../../components/ui/DatePicker';
import api from '../../config/api';

interface Professor {
  id: number;
  nome: string;
  email: string;
  tags_competencia: string[];
  avatar_url: string | null;
}
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

const ACCEPTED_EXTS = '.pdf,.doc,.docx,.txt,.png,.jpg,.jpeg';
const MAX_SIZE_MB = 10;

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

function formatBytes(bytes: number) {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function fileIcon(name: string) {
  const ext = name.split('.').pop()?.toLowerCase();
  if (ext === 'pdf') return '📄';
  if (['doc', 'docx'].includes(ext || '')) return '📝';
  if (['png', 'jpg', 'jpeg'].includes(ext || '')) return '🖼️';
  return '📎';
}

export const NovoCard: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEdit = !!id;
  const today = new Date().toISOString().split('T')[0];
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  // TCC document attachment
  const [documento, setDocumento] = useState<File | null>(null);
  const [documentoError, setDocumentoError] = useState('');
  const [dragOver, setDragOver] = useState(false);

  // TCC professor preferences
  const [professores, setProfessores] = useState<Professor[]>([]);
  const [professoresPreferidos, setProfessoresPreferidos] = useState<number[]>([]);
  const [profSearch, setProfSearch] = useState('');
  const [profOpen, setProfOpen] = useState(false);
  const [profLoading, setProfLoading] = useState(false);
  const [profError, setProfError] = useState('');

  useEffect(() => {
    if (categoria !== 'TCC' || professores.length > 0 || profLoading) return;

    let active = true;

    const loadProfessores = async () => {
      setProfLoading(true);
      setProfError('');

      try {
        const response = await api.get('/users', {
          params: { papel: 'PROFESSOR_MENTOR' },
        });

        if (!active) return;
        setProfessores(Array.isArray(response.data) ? response.data : []);
      } catch {
        try {
          const fallback = await api.get('/users/professores/lista');
          if (!active) return;
          setProfessores(Array.isArray(fallback.data) ? fallback.data : []);
        } catch {
          if (!active) return;
          setProfError('Não foi possível carregar os professores agora. Verifique se a API foi reiniciada e tente novamente.');
        }
      } finally {
        if (active) setProfLoading(false);
      }
    };

    loadProfessores();

    return () => {
      active = false;
    };
  }, [categoria]);

  const toggleTopic = (t: string) => {
    setSelectedTopics((prev) => prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]);
  };

  const handleFileChange = (file: File | null) => {
    setDocumentoError('');
    if (!file) { setDocumento(null); return; }
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      setDocumentoError(`O arquivo deve ter no máximo ${MAX_SIZE_MB} MB.`);
      return;
    }
    const ext = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!ACCEPTED_EXTS.split(',').includes(ext)) {
      setDocumentoError('Formato não suportado. Use PDF, DOC, DOCX, TXT, PNG ou JPG.');
      return;
    }
    setDocumento(file);
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
    if (categoria === 'GERAL' && selectedTopics.length === 0) {
      setError('Selecione pelo menos um assunto.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const res = await api.post('/cards', {
        titulo,
        descricao,
        categoria,
        tags: categoria === 'TCC' ? [] : selectedTopics,
        disponibilidades: categoria === 'GERAL' ? slots : [],
        professores_preferidos: categoria === 'TCC' ? professoresPreferidos : [],
      });

      if (categoria === 'TCC' && documento) {
        const formData = new FormData();
        formData.append('arquivo', documento);
        await api.post(`/cards/${res.data.id}/documento`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }

      navigate('/aluno/meus-cards');
    } catch (err: any) {
      const msg = err.response?.data?.message;
      setError(Array.isArray(msg) ? msg.join(' · ') : (msg || `Erro ao ${isEdit ? 'salvar' : 'criar'} solicitação.`));
    } finally {
      setLoading(false);
    }
  };

  const canPublish =
    titulo.trim() &&
    descricao.trim() &&
    (categoria === 'TCC' || (selectedTopics.length > 0 && slots.length > 0));

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

          {/* Assuntos — visível apenas para GERAL */}
          {categoria === 'GERAL' && (
            <Field label="Assuntos" hint="Tags usadas para casar com o mentor">
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
          )}

          {/* Documento + Professor selector — visíveis apenas para TCC */}
          {categoria === 'TCC' && (
            <>
            <Field
              label="Documento de apoio"
              hint="Opcional — envie um arquivo que ajude o professor a entender o seu TCC"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept={ACCEPTED_EXTS}
                style={{ display: 'none' }}
                onChange={(e) => handleFileChange(e.target.files?.[0] ?? null)}
              />

              {/* Drop zone */}
              {!documento && (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setDragOver(false);
                    handleFileChange(e.dataTransfer.files?.[0] ?? null);
                  }}
                  style={{
                    border: `2px dashed ${dragOver ? 'var(--primary)' : 'var(--border)'}`,
                    borderRadius: 14,
                    background: dragOver ? 'var(--primary-light)' : 'var(--surface)',
                    padding: '28px 20px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 10,
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                  }}
                >
                  <div style={{
                    width: 44, height: 44, borderRadius: 12,
                    background: dragOver ? 'var(--primary)' : 'var(--primary-light)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'all 0.15s',
                  }}>
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                      <path d="M12 16V4M12 4l-4 4M12 4l4 4" stroke={dragOver ? '#fff' : 'var(--primary)'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M4 20h16" stroke={dragOver ? '#fff' : 'var(--primary)'} strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                  </div>

                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontFamily: 'var(--f-body)', fontWeight: 600, fontSize: 13, color: 'var(--text)' }}>
                      Arraste um arquivo ou{' '}
                      <span style={{ color: 'var(--primary)', textDecoration: 'underline' }}>
                        clique para selecionar
                      </span>
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 4 }}>
                      PDF, DOC, DOCX, TXT, PNG, JPG — máx. {MAX_SIZE_MB} MB
                    </div>
                  </div>
                </div>
              )}

              {/* File preview after selection */}
              {documento && (
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '12px 14px', borderRadius: 12,
                  border: '1.5px solid var(--primary)',
                  background: 'var(--primary-light)',
                }}>
                  <div style={{
                    width: 38, height: 38, borderRadius: 10,
                    background: 'var(--primary)', display: 'flex', alignItems: 'center',
                    justifyContent: 'center', fontSize: 18, flexShrink: 0,
                  }}>
                    {fileIcon(documento.name)}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      fontFamily: 'var(--f-body)', fontWeight: 600, fontSize: 13,
                      color: 'var(--primary-dark)', whiteSpace: 'nowrap',
                      overflow: 'hidden', textOverflow: 'ellipsis',
                    }}>
                      {documento.name}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--primary)', marginTop: 2 }}>
                      {formatBytes(documento.size)}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setDocumento(null);
                      if (fileInputRef.current) fileInputRef.current.value = '';
                    }}
                    style={{
                      background: 'rgba(230,74,25,0.12)', border: 'none', borderRadius: 8,
                      color: 'var(--accent-dark)', cursor: 'pointer',
                      padding: '5px 8px', fontWeight: 700, fontSize: 15, lineHeight: 1,
                    }}
                    title="Remover arquivo"
                  >
                    ×
                  </button>
                </div>
              )}

              {documentoError && (
                <p style={{ fontSize: 12, color: 'var(--accent-dark)', marginTop: 6 }}>{documentoError}</p>
              )}
            </Field>

            {/* Professor selector */}
            <Field
              label="Preferência de professor"
              hint="Opcional — indique quem você gostaria que orientasse seu TCC"
            >
              {/* Info banner */}
              <div style={{
                padding: '10px 14px', borderRadius: 10,
                background: professoresPreferidos.length === 0 ? '#FFF7E0' : 'var(--primary-light)',
                border: `1px solid ${professoresPreferidos.length === 0 ? '#E0A800' : 'var(--primary)'}`,
                fontSize: 12, color: professoresPreferidos.length === 0 ? '#7A5800' : 'var(--primary-dark)',
                marginBottom: 10, lineHeight: 1.5,
              }}>
                {professoresPreferidos.length === 0
                  ? 'Sem preferência selecionada — qualquer professor poderá enviar uma contra-proposta para você analisar antes de confirmar.'
                  : `${professoresPreferidos.length} professor${professoresPreferidos.length > 1 ? 'es' : ''} selecionado${professoresPreferidos.length > 1 ? 's' : ''} — apenas eles verão seu card em destaque e poderão aceitar diretamente.`}
              </div>

              {/* Search trigger */}
              <button
                type="button"
                onClick={() => setProfOpen((o) => !o)}
                style={{
                  width: '100%', textAlign: 'left', padding: '12px 14px', borderRadius: 12,
                  border: '1px solid var(--border)', background: '#fff', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  fontFamily: 'var(--f-body)', fontSize: 14, color: 'var(--text)',
                }}
              >
                <span style={{ color: 'var(--text-3)' }}>
                  {profLoading ? 'Carregando professores…' : 'Buscar professor…'}
                </span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <path d="M6 9l6 6 6-6" stroke="var(--text-2)" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </button>

              {profError && (
                <p style={{ fontSize: 12, color: 'var(--accent-dark)', marginTop: 6 }}>{profError}</p>
              )}

              {/* Selected professors chips */}
              {professoresPreferidos.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 10 }}>
                  {professoresPreferidos.map((pid) => {
                    const prof = professores.find((p) => p.id === pid);
                    if (!prof) return null;
                    const ini = (prof.nome || '').split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase();
                    return (
                      <div key={pid} style={{
                        display: 'inline-flex', alignItems: 'center', gap: 8,
                        padding: '6px 10px 6px 8px', borderRadius: 999,
                        background: 'var(--primary)', color: '#fff',
                        fontFamily: 'var(--f-body)', fontSize: 12, fontWeight: 500,
                      }}>
                        <div style={{
                          width: 22, height: 22, borderRadius: '50%',
                          background: 'rgba(255,255,255,0.25)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 9, fontWeight: 700, flexShrink: 0,
                        }}>{ini}</div>
                        {(prof.nome || '').split(' ')[0]}
                        <button
                          type="button"
                          onClick={() => setProfessoresPreferidos((prev) => prev.filter((id) => id !== pid))}
                          style={{
                            background: 'none', border: 'none', color: 'rgba(255,255,255,0.8)',
                            cursor: 'pointer', padding: 0, fontSize: 14, lineHeight: 1,
                          }}
                        >×</button>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Dropdown list */}
              {profOpen && (
                <div style={{
                  marginTop: 8, borderRadius: 14, overflow: 'hidden',
                  border: '1px solid var(--border)', background: '#fff',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                }}>
                  <div style={{ padding: '10px 12px', borderBottom: '1px solid var(--border)' }}>
                    <input
                      autoFocus
                      type="text"
                      placeholder="Nome do professor…"
                      value={profSearch}
                      onChange={(e) => setProfSearch(e.target.value)}
                      style={{ ...inputStyle, padding: '8px 12px', fontSize: 13 }}
                    />
                  </div>
                  <div style={{ maxHeight: 240, overflowY: 'auto' }}>
                    {profLoading && (
                      <div style={{ padding: '16px', textAlign: 'center', fontSize: 13, color: 'var(--text-3)' }}>
                        Carregando professores…
                      </div>
                    )}
                    {professores
                      .filter((p) => (p.nome || '').toLowerCase().includes(profSearch.toLowerCase()))
                      .map((prof) => {
                        const selected = professoresPreferidos.includes(prof.id);
                        const ini = (prof.nome || '').split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase();
                        return (
                          <button
                            key={prof.id}
                            type="button"
                            onClick={() => {
                              setProfessoresPreferidos((prev) =>
                                selected ? prev.filter((id) => id !== prof.id) : [...prev, prof.id]
                              );
                            }}
                            style={{
                              width: '100%', textAlign: 'left', padding: '10px 14px',
                              border: 'none', cursor: 'pointer', display: 'flex',
                              alignItems: 'center', gap: 10,
                              background: selected ? 'var(--primary-light)' : '#fff',
                              borderBottom: '1px solid var(--border)',
                            }}
                          >
                            <div style={{
                              width: 34, height: 34, borderRadius: '50%', flexShrink: 0,
                              background: selected ? 'var(--primary)' : 'linear-gradient(135deg,#6f5ad0,#4632a0)',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              fontSize: 11, fontWeight: 700, color: '#fff',
                            }}>{ini}</div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>
                                {prof.nome}
                              </div>
                              {Array.isArray(prof.tags_competencia) && prof.tags_competencia.length > 0 && (
                                <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 1 }}>
                                  {prof.tags_competencia.slice(0, 3).map((t) => `#${t}`).join(' · ')}
                                </div>
                              )}
                            </div>
                            {selected && (
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                <circle cx="12" cy="12" r="10" fill="var(--primary)"/>
                                <path d="M7 12l4 4 6-7" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              </svg>
                            )}
                          </button>
                        );
                      })}
                    {!profLoading && professores.filter((p) => (p.nome || '').toLowerCase().includes(profSearch.toLowerCase())).length === 0 && (
                      <div style={{ padding: '16px', textAlign: 'center', fontSize: 13, color: 'var(--text-3)' }}>
                        Nenhum professor encontrado.
                      </div>
                    )}
                  </div>
                  <div style={{ padding: '10px 14px', borderTop: '1px solid var(--border)' }}>
                    <button
                      type="button"
                      onClick={() => setProfOpen(false)}
                      style={{
                        width: '100%', padding: '8px 0', borderRadius: 10,
                        border: '1px solid var(--border)', background: '#fff', cursor: 'pointer',
                        fontFamily: 'var(--f-body)', fontSize: 13, fontWeight: 500, color: 'var(--text-2)',
                      }}
                    >
                      Confirmar seleção
                    </button>
                  </div>
                </div>
              )}
            </Field>
            </>
          )}
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
