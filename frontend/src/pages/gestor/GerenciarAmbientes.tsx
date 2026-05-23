import React, { useEffect, useState } from 'react';
import api from '../../config/api';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Badge } from '../../components/ui/Badge';
import { Skeleton } from '../../components/ui/Skeleton';

export const GerenciarAmbientes: React.FC = () => {
  const [ambientes, setAmbientes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ nome: '', bloco: '', tipo: 'SALA_FECHADA', exige_chave: false, capacidade: '' });
  const [saving, setSaving] = useState(false);

  const load = () => api.get('/ambientes').then((r) => setAmbientes(r.data)).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post('/ambientes', { ...form, exige_chave: form.exige_chave ? 1 : 0, capacidade: form.capacidade ? Number(form.capacidade) : null });
      setModal(false);
      setForm({ nome: '', bloco: '', tipo: 'SALA_FECHADA', exige_chave: false, capacidade: '' });
      load();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Erro ao criar ambiente.');
    } finally {
      setSaving(false);
    }
  };

  const inputStyle: React.CSSProperties = { width: '100%', padding: '10px 12px', background: 'var(--color-bg-glass)', border: '1px solid var(--color-border)', borderRadius: 8, color: 'var(--color-text)', fontSize: 14, outline: 'none', marginBottom: 12 };

  if (loading) return <Skeleton height={200} />;

  return (
    <div className="animate-fadeIn" style={{ maxWidth: 800 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700 }}>Ambientes</h1>
        <Button onClick={() => setModal(true)}>+ Novo Ambiente</Button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 16 }}>
        {ambientes.map((a) => (
          <div key={a.id} className="glass" style={{ borderRadius: 'var(--border-radius)', padding: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <div style={{ fontWeight: 600, fontSize: 15 }}>{a.nome}</div>
              <Badge variant={a.tipo === 'SALA_FECHADA' ? 'info' : 'warning'}>
                {a.tipo === 'SALA_FECHADA' ? 'Sala' : 'Comum'}
              </Badge>
            </div>
            <div style={{ fontSize: 13, color: 'var(--color-text-muted)', marginBottom: 4 }}>{a.bloco}</div>
            {a.capacidade && <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>Cap: {a.capacidade} pessoas</div>}
            {a.exige_chave ? <div style={{ fontSize: 12, color: 'var(--color-warning)', marginTop: 4 }}>🔑 Exige chave</div> : null}
          </div>
        ))}
      </div>

      <Modal open={modal} onClose={() => setModal(false)} title="Novo Ambiente">
        <form onSubmit={save}>
          <label style={{ fontSize: 13, color: 'var(--color-text-secondary)', display: 'block', marginBottom: 4 }}>Nome</label>
          <input style={inputStyle} value={form.nome} onChange={(e) => setForm((f) => ({ ...f, nome: e.target.value }))} placeholder="Ex: Sala B-203" required />

          <label style={{ fontSize: 13, color: 'var(--color-text-secondary)', display: 'block', marginBottom: 4 }}>Bloco</label>
          <input style={inputStyle} value={form.bloco} onChange={(e) => setForm((f) => ({ ...f, bloco: e.target.value }))} placeholder="Ex: Bloco B" required />

          <label style={{ fontSize: 13, color: 'var(--color-text-secondary)', display: 'block', marginBottom: 4 }}>Tipo</label>
          <select style={inputStyle} value={form.tipo} onChange={(e) => setForm((f) => ({ ...f, tipo: e.target.value }))}>
            <option value="SALA_FECHADA">Sala Fechada</option>
            <option value="AMBIENTE_COMUM">Ambiente Comum</option>
          </select>

          <label style={{ fontSize: 13, color: 'var(--color-text-secondary)', display: 'block', marginBottom: 4 }}>Capacidade</label>
          <input style={inputStyle} type="number" value={form.capacidade} onChange={(e) => setForm((f) => ({ ...f, capacidade: e.target.value }))} placeholder="Ex: 20" />

          <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--color-text-secondary)', marginBottom: 16, cursor: 'pointer' }}>
            <input type="checkbox" checked={form.exige_chave} onChange={(e) => setForm((f) => ({ ...f, exige_chave: e.target.checked }))} />
            Exige chave
          </label>

          <Button type="submit" fullWidth loading={saving}>Criar Ambiente</Button>
        </form>
      </Modal>
    </div>
  );
};
