import React, { useEffect, useState } from 'react';
import api from '../../config/api';
import { Button } from '../../components/ui/Button';
import { Skeleton } from '../../components/ui/Skeleton';

export const AbrirContestacao: React.FC = () => {
  const [agendamentos, setAgendamentos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<number | null>(null);
  const [justificativa, setJustificativa] = useState('');
  const [foto, setFoto] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    api.get('/agendamentos').then((r) => {
      setAgendamentos(r.data.filter((a: any) => a.status === 'CONCLUIDO'));
    }).finally(() => setLoading(false));
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selected) { alert('Selecione um agendamento.'); return; }
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('historico_id', String(selected));
      formData.append('justificativa', justificativa);
      if (foto) formData.append('foto', foto);
      await api.post('/disputas', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      setSuccess(true);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Erro ao abrir contestação.');
    } finally {
      setSubmitting(false);
    }
  };

  if (success) return (
    <div className="animate-fadeIn glass" style={{ borderRadius: 'var(--border-radius)', padding: 48, textAlign: 'center', maxWidth: 500 }}>
      <div style={{ fontSize: 48, marginBottom: 16 }}>✅</div>
      <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 8 }}>Contestação Aberta!</h2>
      <p style={{ color: 'var(--color-text-secondary)' }}>O gestor analisará sua solicitação e liberará as horas se aprovada.</p>
    </div>
  );

  if (loading) return <Skeleton height={200} />;

  return (
    <div className="animate-fadeIn" style={{ maxWidth: 600 }}>
      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>Abrir Contestação</h1>
      <p style={{ color: 'var(--color-text-secondary)', marginBottom: 24 }}>Use quando o aluno não avaliar em até 24h após o encontro.</p>

      <form onSubmit={submit} className="glass" style={{ borderRadius: 'var(--border-radius)', padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div>
          <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--color-text-secondary)', display: 'block', marginBottom: 6 }}>Agendamento Concluído</label>
          <select
            value={selected || ''}
            onChange={(e) => setSelected(Number(e.target.value))}
            required
            style={{ width: '100%', padding: '12px', background: 'var(--color-bg-glass)', border: '1px solid var(--color-border)', borderRadius: 8, color: 'var(--color-text)', fontSize: 14, outline: 'none' }}
          >
            <option value="">Selecione...</option>
            {agendamentos.map((a) => (
              <option key={a.id} value={a.id}>
                {a.card?.titulo} — {a.dia_semana} {a.hora_inicio}-{a.hora_fim}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--color-text-secondary)', display: 'block', marginBottom: 6 }}>Justificativa</label>
          <textarea
            value={justificativa}
            onChange={(e) => setJustificativa(e.target.value)}
            required
            placeholder="Descreva o que aconteceu e por que o aluno não avaliou..."
            style={{ width: '100%', minHeight: 120, resize: 'vertical', padding: '12px', background: 'var(--color-bg-glass)', border: '1px solid var(--color-border)', borderRadius: 8, color: 'var(--color-text)', fontSize: 14, outline: 'none' }}
          />
        </div>

        <div>
          <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--color-text-secondary)', display: 'block', marginBottom: 6 }}>Foto Comprobatória (opcional)</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setFoto(e.target.files?.[0] || null)}
            style={{ width: '100%', fontSize: 13, color: 'var(--color-text)' }}
          />
        </div>

        <Button type="submit" loading={submitting}>Enviar Contestação</Button>
      </form>
    </div>
  );
};
