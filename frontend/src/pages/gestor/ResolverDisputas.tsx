import React, { useEffect, useState } from 'react';
import api from '../../config/api';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Skeleton } from '../../components/ui/Skeleton';

export const ResolverDisputas: React.FC = () => {
  const [disputas, setDisputas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<any>(null);
  const [parecer, setParecer] = useState('');
  const [saving, setSaving] = useState(false);

  const load = () => api.get('/disputas').then((r) => setDisputas(r.data)).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const resolver = async (aprovada: boolean) => {
    if (!parecer.trim()) { alert('Digite o parecer.'); return; }
    setSaving(true);
    try {
      await api.patch(`/disputas/${selected.id}/resolver`, { aprovada, parecer });
      setSelected(null);
      setParecer('');
      load();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Erro ao resolver.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Skeleton height={200} />;

  return (
    <div className="animate-fadeIn" style={{ maxWidth: 800 }}>
      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 24 }}>Resolver Disputas</h1>

      {disputas.length === 0 ? (
        <div className="glass" style={{ borderRadius: 'var(--border-radius)', padding: 48, textAlign: 'center', color: 'var(--color-text-muted)' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>⚖️</div>
          <p>Nenhuma contestação aberta.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {disputas.map((d) => (
            <div key={d.id} className="glass" style={{ borderRadius: 'var(--border-radius)', padding: 20 }}>
              <div style={{ marginBottom: 12 }}>
                <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>Mentor: {d.mentor?.nome}</div>
                <div style={{ fontSize: 13, color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>{d.justificativa}</div>
              </div>
              {d.foto_url && (
                <img src={d.foto_url} alt="Comprovante" style={{ maxWidth: '100%', maxHeight: 200, borderRadius: 8, marginBottom: 12, objectFit: 'cover' }} />
              )}
              <Button size="sm" onClick={() => { setSelected(d); setParecer(''); }}>
                Analisar e Resolver
              </Button>
            </div>
          ))}
        </div>
      )}

      <Modal open={!!selected} onClose={() => setSelected(null)} title="Resolver Contestação">
        <div style={{ marginBottom: 16 }}>
          <p style={{ fontSize: 13, fontWeight: 600, marginBottom: 4 }}>Justificativa do Mentor:</p>
          <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>{selected?.justificativa}</p>
        </div>
        <div style={{ marginBottom: 16 }}>
          <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--color-text-secondary)', display: 'block', marginBottom: 6 }}>Seu Parecer</label>
          <textarea
            value={parecer}
            onChange={(e) => setParecer(e.target.value)}
            placeholder="Descreva sua decisão..."
            style={{ width: '100%', minHeight: 80, resize: 'vertical', padding: '10px 12px', background: 'var(--color-bg-glass)', border: '1px solid var(--color-border)', borderRadius: 8, color: 'var(--color-text)', fontSize: 13, outline: 'none' }}
          />
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <Button fullWidth onClick={() => resolver(true)} loading={saving}>✅ Aprovar e Liberar Horas</Button>
          <Button fullWidth variant="danger" onClick={() => resolver(false)} loading={saving}>❌ Rejeitar</Button>
        </div>
      </Modal>
    </div>
  );
};
