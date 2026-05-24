import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../config/api';

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

export const AbrirContestacao: React.FC = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [agendamentos, setAgendamentos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<number | null>(null);
  const [justificativa, setJustificativa] = useState('');
  const [foto, setFoto] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/agendamentos').then((r) => {
      // Filtrar apenas concluídos que ainda não foram avaliados ou que o mentor queira contestar a falta de avaliação
      setAgendamentos(r.data.filter((a: any) => a.status === 'CONCLUIDO'));
    }).catch(() => {
      setError('Erro ao carregar seus agendamentos.');
    }).finally(() => setLoading(false));
  }, []);

  const handleFileChange = (file: File | null) => {
    if (file && file.size > 5 * 1024 * 1024) {
      alert('A imagem deve ter no máximo 5MB.');
      return;
    }
    setFoto(file);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selected) { setError('Selecione um agendamento.'); return; }
    if (!justificativa.trim()) { setError('Descreva sua justificativa.'); return; }
    
    setError('');
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('agendamento_id', String(selected));
      formData.append('justificativa', justificativa);
      if (foto) formData.append('foto', foto);
      
      await api.post('/disputas', formData, { 
        headers: { 'Content-Type': 'multipart/form-data' } 
      });
      setSuccess(true);
    } catch (err: any) {
      const msg = err.response?.data?.message;
      setError(Array.isArray(msg) ? msg.join(' · ') : (msg || 'Erro ao abrir contestação.'));
    } finally {
      setSubmitting(false);
    }
  };

  if (success) return (
    <div className="mx-fadeup" style={{ 
      maxWidth: 500, margin: '60px auto', textAlign: 'center',
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20
    }}>
      <div style={{ 
        width: 80, height: 80, borderRadius: '50%', background: 'var(--secondary-light)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 40
      }}>✅</div>
      <div>
        <h1 className="mx-h1" style={{ marginBottom: 8 }}>Contestação enviada!</h1>
        <p className="mx-body" style={{ color: 'var(--text-2)' }}>
          Sua solicitação foi registrada. O gestor analisará a justificativa e as evidências para liberar suas horas.
        </p>
      </div>
      <button className="mx-btn" onClick={() => navigate('/mentor')} style={{ padding: '14px 32px' }}>
        Voltar ao início
      </button>
    </div>
  );

  if (loading) return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ height: 30, width: 200, background: '#e0e0e0', borderRadius: 8 }} className="mx-pulse" />
      <div style={{ height: 400, background: '#fff', borderRadius: 18 }} className="mx-pulse" />
    </div>
  );

  return (
    <div className="mx-fadeup" style={{ maxWidth: 640, margin: '0 auto' }}>
      <div style={{ marginBottom: 24 }}>
        <h1 className="mx-h1" style={{ fontSize: 26 }}>Abrir contestação</h1>
        <p className="mx-caption" style={{ marginTop: 4 }}>
          Solicite a revisão de um encontro concluído quando o aluno não realizar a avaliação.
        </p>
      </div>

      <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div className="mx-card" style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 20 }}>
          
          <Field label="Selecione o agendamento" hint="Apenas agendamentos concluídos aparecem aqui">
            <select
              value={selected || ''}
              onChange={(e) => setSelected(Number(e.target.value))}
              required
              style={inputStyle}
            >
              <option value="">Escolha um encontro...</option>
              {agendamentos.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.card?.titulo} — {a.dia_semana}, {a.hora_inicio}
                </option>
              ))}
            </select>
            {agendamentos.length === 0 && (
              <p style={{ fontSize: 12, color: 'var(--accent-dark)', marginTop: 8 }}>
                Nenhum agendamento concluído encontrado para contestação.
              </p>
            )}
          </Field>

          <Field label="Justificativa" hint="Explique o que ocorreu durante o encontro">
            <textarea
              value={justificativa}
              onChange={(e) => setJustificativa(e.target.value)}
              required
              placeholder="Descreva aqui o motivo da contestação..."
              style={{ ...inputStyle, minHeight: 140, resize: 'none', lineHeight: 1.5 }}
            />
          </Field>

          <Field label="Foto comprobatória (opcional)" hint="Prints do chat ou do encontro ajudam na análise">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={(e) => handleFileChange(e.target.files?.[0] || null)}
              style={{ display: 'none' }}
            />
            
            {!foto ? (
              <div 
                onClick={() => fileInputRef.current?.click()}
                style={{
                  border: '2px dashed var(--border)', borderRadius: 14,
                  padding: '24px', textAlign: 'center', cursor: 'pointer',
                  background: 'var(--surface)', transition: 'all 0.15s'
                }}
              >
                <div style={{ fontSize: 24, marginBottom: 8 }}>📸</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>
                  Clique para anexar uma imagem
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 4 }}>
                  PNG, JPG ou JPEG (máx. 5MB)
                </div>
              </div>
            ) : (
              <div style={{
                display: 'flex', alignItems: 'center', gap: 12, padding: 12,
                borderRadius: 14, background: 'var(--primary-light)', border: '1.5px solid var(--primary)'
              }}>
                <div style={{ 
                  width: 40, height: 40, borderRadius: 10, background: 'var(--primary)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18
                }}>🖼️</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ 
                    fontSize: 13, fontWeight: 600, color: 'var(--primary-dark)',
                    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'
                  }}>
                    {foto.name}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--primary)' }}>
                    {(foto.size / 1024).toFixed(1)} KB
                  </div>
                </div>
                <button 
                  type="button" 
                  onClick={() => setFoto(null)}
                  style={{ 
                    background: 'rgba(230,74,25,0.1)', border: 'none', borderRadius: 8,
                    color: 'var(--accent-dark)', cursor: 'pointer', padding: '4px 8px', fontWeight: 700
                  }}
                >✕</button>
              </div>
            )}
          </Field>

        </div>

        {error && (
          <div style={{ 
            background: 'var(--accent-light)', border: '1px solid var(--accent)', 
            borderRadius: 12, padding: '12px 16px', fontSize: 13, color: 'var(--accent-dark)' 
          }}>
            {error}
          </div>
        )}

        <div style={{ display: 'flex', gap: 12 }}>
          <button 
            type="submit" 
            disabled={submitting || !selected || !justificativa}
            className="mx-btn"
            style={{ flex: 1, padding: '14px' }}
          >
            {submitting ? 'Enviando...' : 'Enviar contestação →'}
          </button>
          <button 
            type="button" 
            className="mx-btn ghost" 
            onClick={() => navigate(-1)}
            style={{ padding: '14px 24px' }}
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
};
