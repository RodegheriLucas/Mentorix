import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../config/api';
import { MxFileInput, MxLogo, Avatar } from '../../components/ui/DesignSystem';
import { Skeleton } from '../../components/ui/Skeleton';

function initials(name: string) {
  return name?.split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase() || '??';
}

const AVATAR_GRADIENTS = [
  'linear-gradient(135deg,#6f5ad0,#4632a0)',
  'linear-gradient(135deg,#4a78d6,#2854b4)',
  'linear-gradient(135deg,#8a6fe0,#5c3fc0)',
  'linear-gradient(135deg,#e64a19,#bf360c)',
  'linear-gradient(135deg,#506fc7,#2e4ea0)',
  'linear-gradient(135deg,#7a5fd0,#4a35a0)',
];
function avatarGradient(nome?: string) {
  if (!nome) return AVATAR_GRADIENTS[0];
  let hash = 0;
  for (let i = 0; i < nome.length; i++) hash = (hash * 31 + nome.charCodeAt(i)) % AVATAR_GRADIENTS.length;
  return AVATAR_GRADIENTS[Math.abs(hash)];
}

export const AbrirContestacao: React.FC = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [agendamentos, setAgendamentos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<number | null>(null);
  const [dropOpen, setDropOpen] = useState(false);
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
    if (!justificativa.trim()) { setError('A justificativa é obrigatória.'); return; }
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

  if (success) {
    return (
      <div className="animate-fadeIn mx-card" style={{ padding: 40, textAlign: 'center' }}>
        <div style={{
          width: 56, height: 56, borderRadius: 18, margin: '0 auto 16px',
          background: 'var(--secondary-light)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
            <path d="M4 12.5L9 17.5L20 6.5" stroke="var(--secondary)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <p style={{ fontFamily: 'var(--f-head)', fontWeight: 700, fontSize: 18, color: 'var(--text)', marginBottom: 6 }}>
          Contestação enviada!
        </p>
        <p style={{ fontSize: 13, color: 'var(--text-2)', lineHeight: 1.5 }}>
          O gestor analisará sua solicitação e liberará as horas complementares se aprovada.
        </p>
      </div>
    );
  }

  if (loading) return <Skeleton height={360} />;

  const selectedAg = agendamentos.find((a) => a.id === selected);
  if (loading) return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ height: 30, width: 200, background: '#e0e0e0', borderRadius: 8 }} className="mx-pulse" />
      <div style={{ height: 400, background: '#fff', borderRadius: 18 }} className="mx-pulse" />
    </div>
  );

  return (
    <div className="animate-fadeIn">
      {/* Header */}
      <div style={{ padding: '12px 0 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <MxLogo size={20} />
            <span style={{ fontFamily: 'var(--f-head)', fontWeight: 700, fontSize: 16, letterSpacing: -0.2, color: 'var(--primary-dark)' }}>
              mentorix
            </span>
            <span style={{
              fontSize: 9, fontWeight: 700, letterSpacing: 0.6, textTransform: 'uppercase',
              color: 'var(--primary-dark)', background: 'var(--primary-light)',
              padding: '2px 6px', borderRadius: 6,
            }}>Mentor</span>
          </div>
        </div>
        <h1 className="mx-h1" style={{ fontSize: 22 }}>Abrir Contestação</h1>
        <p className="mx-caption" style={{ marginTop: 2, lineHeight: 1.4 }}>
          Use quando o aluno não avaliar em até 24h após o encontro.
        </p>
      </div>

      {agendamentos.length === 0 ? (
        <div className="mx-card" style={{ padding: 36, textAlign: 'center', color: 'var(--text-3)' }}>
          <div style={{
            width: 48, height: 48, borderRadius: 14, margin: '0 auto 12px',
            background: '#F5F5F5',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="9" stroke="#9E9E9E" strokeWidth="1.8"/>
              <path d="M12 7v5l3 2" stroke="#9E9E9E" strokeWidth="1.8" strokeLinecap="round"/>
            </svg>
          </div>
          <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-2)', marginBottom: 4 }}>
            Nenhuma mentoria concluída
          </p>
          <p style={{ fontSize: 12, color: 'var(--text-3)' }}>
            Contestações só podem ser abertas para sessões já concluídas.
          </p>
        </div>
      ) : (
        <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Agendamento */}
          <div className="mx-card" style={{ padding: 14 }}>
            <label style={{ fontSize: 11, fontWeight: 700, letterSpacing: 0.5, textTransform: 'uppercase', color: 'var(--text-3)', display: 'block', marginBottom: 8 }}>
              Mentoria concluída
            </label>
            {/* Trigger */}
            <button
              type="button"
              onClick={() => setDropOpen((o) => !o)}
              style={{
                width: '100%', textAlign: 'left',
                padding: '11px 14px', borderRadius: 12,
                border: `1px solid ${dropOpen ? 'var(--primary)' : 'var(--border)'}`,
                background: '#fff', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8,
                fontFamily: 'var(--f-body)', fontSize: 13, color: 'var(--text)',
                transition: 'border-color 0.15s',
              }}
            >
              <div style={{ flex: 1, minWidth: 0 }}>
                {selectedAg ? (
                  <>
                    <div style={{ fontWeight: 600, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {selectedAg.card?.titulo}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--text-2)', marginTop: 1 }}>
                      {selectedAg.dia_semana} · {selectedAg.hora_inicio?.slice(0, 5)}–{selectedAg.hora_fim?.slice(0, 5)}
                    </div>
                  </>
                ) : (
                  <span style={{ color: 'var(--text-3)' }}>Selecione uma mentoria…</span>
                )}
              </div>
              <svg
                width="14" height="14" viewBox="0 0 24 24" fill="none"
                style={{ flexShrink: 0, transform: dropOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s' }}
              >
                <path d="M6 9l6 6 6-6" stroke="var(--text-3)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>

            {/* Dropdown panel */}
            {dropOpen && (
              <div style={{
                marginTop: 6, borderRadius: 14,
                background: 'var(--surface)', border: '1px solid var(--border)',
                boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                maxHeight: 220, overflowY: 'auto',
              }}>
                {agendamentos.map((a, idx) => {
                  const isSelected = selected === a.id;
                  return (
                    <button
                      key={a.id}
                      type="button"
                      onClick={() => { setSelected(a.id); setDropOpen(false); setError(''); }}
                      style={{
                        width: '100%', textAlign: 'left', border: 'none', cursor: 'pointer',
                        padding: '10px 14px',
                        background: isSelected ? 'var(--primary-light)' : 'transparent',
                        borderBottom: idx < agendamentos.length - 1 ? '1px solid var(--border)' : 'none',
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10,
                        borderRadius: idx === 0 ? '14px 14px 0 0' : idx === agendamentos.length - 1 ? '0 0 14px 14px' : '0',
                      }}
                    >
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{
                          fontFamily: 'var(--f-head)', fontWeight: 700, fontSize: 13,
                          color: isSelected ? 'var(--primary-dark)' : 'var(--text)',
                          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                        }}>
                          {a.card?.titulo}
                        </div>
                        <div style={{ fontSize: 11, color: isSelected ? 'var(--primary)' : 'var(--text-2)', marginTop: 2 }}>
                          {a.dia_semana} · {a.hora_inicio?.slice(0, 5)}–{a.hora_fim?.slice(0, 5)}
                        </div>
                      </div>
                      {isSelected && (
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
                          <path d="M4 12.5L9 17.5L20 6.5" stroke="var(--primary)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Justificativa */}
          <div className="mx-card" style={{ padding: 14 }}>
            <label style={{ fontSize: 11, fontWeight: 700, letterSpacing: 0.5, textTransform: 'uppercase', color: 'var(--text-3)', display: 'block', marginBottom: 8 }}>
              Justificativa <span style={{ color: 'var(--accent)' }}>*</span>
            </label>
            <textarea
              value={justificativa}
              onChange={(e) => { setJustificativa(e.target.value); setError(''); }}
              required
              placeholder="Descreva o que aconteceu e por que o aluno não avaliou…"
              maxLength={1000}
              style={{
                width: '100%', minHeight: 110, resize: 'vertical',
                background: 'var(--surface)', border: '1px solid var(--border)',
                borderRadius: 10, color: 'var(--text)', fontSize: 13,
                padding: '10px 12px', outline: 'none', boxSizing: 'border-box',
                fontFamily: 'var(--f-body)', lineHeight: 1.5,
              }}
            />
            <div style={{ fontSize: 11, color: 'var(--text-3)', textAlign: 'right', marginTop: 3 }}>
              {justificativa.length}/1000
            </div>
          </div>

          {/* Foto comprobatória */}
          <div className="mx-card" style={{ padding: 14 }}>
            <label style={{ fontSize: 11, fontWeight: 700, letterSpacing: 0.5, textTransform: 'uppercase', color: 'var(--text-3)', display: 'block', marginBottom: 8 }}>
              Foto comprobatória <span style={{ color: 'var(--text-3)', fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>(opcional)</span>
            </label>
            <MxFileInput
              value={foto}
              onChange={setFoto}
              accept="image/*"
              label="Arraste ou clique para adicionar foto"
              hint="PNG, JPG, JPEG"
            />
          </div>

          {error && (
            <div style={{
              padding: '10px 14px', borderRadius: 10,
              background: 'var(--accent-light)', color: 'var(--accent-dark)',
              fontSize: 12, lineHeight: 1.4,
            }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            style={{
              width: '100%', padding: '12px 14px', borderRadius: 12, border: 'none',
              background: submitting
                ? 'var(--primary-light)'
                : 'linear-gradient(135deg, #5D46B8 0%, #3A2885 100%)',
              boxShadow: submitting ? 'none' : '0 1px 0 rgba(93,70,184,0.25), 0 6px 16px rgba(93,70,184,0.25)',
              color: submitting ? 'var(--primary-dark)' : '#fff',
              fontFamily: 'var(--f-body)', fontWeight: 600, fontSize: 14,
              cursor: submitting ? 'not-allowed' : 'pointer',
            }}
          >
            {submitting ? 'Enviando…' : 'Enviar Contestação'}
          </button>
        </form>
      )}
    </div>
  );
};
