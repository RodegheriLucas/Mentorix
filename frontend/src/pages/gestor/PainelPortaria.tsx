import React, { useEffect, useState, useCallback } from 'react';
import api from '../../config/api';
import { Badge, statusToBadge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Skeleton } from '../../components/ui/Skeleton';

export const PainelPortaria: React.FC = () => {
  const [agendamentos, setAgendamentos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [instrucaoModal, setInstrucaoModal] = useState<any>(null);
  const [instrucao, setInstrucao] = useState('');
  const [saving, setSaving] = useState(false);
  const [checkinLoading, setCheckinLoading] = useState<Record<number, boolean>>({});

  const load = useCallback(() => {
    setLoading(true);
    api.get('/agendamentos/hoje').then((r) => setAgendamentos(r.data)).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
    const interval = setInterval(load, 30000);
    return () => clearInterval(interval);
  }, [load]);

  const enviarInstrucoes = async () => {
    if (!instrucao.trim()) { alert('Digite as instruções.'); return; }
    setSaving(true);
    try {
      await api.patch(`/agendamentos/${instrucaoModal.id}/instrucoes`, { instrucoes: instrucao });
      setInstrucaoModal(null);
      setInstrucao('');
      load();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Erro ao enviar instruções.');
    } finally {
      setSaving(false);
    }
  };

  const doCheckin = async (agendamentoId: number) => {
    setCheckinLoading((c) => ({ ...c, [agendamentoId]: true }));
    try {
      await api.post(`/checkin/${agendamentoId}`);
      load();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Erro no check-in.');
    } finally {
      setCheckinLoading((c) => ({ ...c, [agendamentoId]: false }));
    }
  };

  const doCheckout = async (agendamentoId: number) => {
    setCheckinLoading((c) => ({ ...c, [agendamentoId]: true }));
    try {
      await api.post(`/checkout/${agendamentoId}`);
      load();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Erro no check-out.');
    } finally {
      setCheckinLoading((c) => ({ ...c, [agendamentoId]: false }));
    }
  };

  if (loading) return <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>{[1,2,3].map(i => <Skeleton key={i} height={150} />)}</div>;

  const pendentes = agendamentos.filter((a) => a.status === 'PENDENTE_GESTOR');
  const agendados = agendamentos.filter((a) => a.status === 'AGENDADO');
  const emAndamento = agendamentos.filter((a) => a.status === 'EM_ANDAMENTO');

  const CardMentoria = ({ ag }: { ag: any }) => (
    <div className="glass" style={{ borderRadius: 'var(--border-radius)', padding: 20, marginBottom: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
        <div>
          <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 2 }}>{ag.card?.titulo}</div>
          <div style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>
            Mentor: {ag.mentor?.nome} | Aluno: {ag.card?.aluno?.nome}
          </div>
          <div style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>
            {ag.dia_semana} {ag.hora_inicio}-{ag.hora_fim} | {ag.ambiente?.nome}
          </div>
        </div>
        <Badge variant={statusToBadge(ag.status)}>{ag.status}</Badge>
      </div>

      {ag.instrucoes_gestor && (
        <div style={{ background: 'var(--color-bg-glass)', borderRadius: 8, padding: '10px 14px', marginBottom: 12, fontSize: 13, color: 'var(--color-text-secondary)', border: '1px solid var(--color-border)' }}>
          <strong>Instruções:</strong> {ag.instrucoes_gestor}
        </div>
      )}

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {ag.status === 'PENDENTE_GESTOR' && (
          <Button size="sm" onClick={() => { setInstrucaoModal(ag); setInstrucao(''); }}>
            📝 Enviar Instruções
          </Button>
        )}
        {ag.status === 'AGENDADO' && (
          <Button size="sm" variant="secondary" onClick={() => doCheckin(ag.id)} loading={checkinLoading[ag.id]}>
            ✅ Check-in
          </Button>
        )}
        {ag.status === 'EM_ANDAMENTO' && (
          <Button size="sm" variant="danger" onClick={() => doCheckout(ag.id)} loading={checkinLoading[ag.id]}>
            🔴 Check-out
          </Button>
        )}
        {ag.mentor?.telefone && (
          <a href={`tel:${ag.mentor.telefone}`} style={{ display: 'inline-flex' }}>
            <Button size="sm" variant="ghost">📞 {ag.mentor.telefone}</Button>
          </a>
        )}
      </div>
    </div>
  );

  const today = new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' });

  return (
    <div className="animate-fadeIn" style={{ maxWidth: 900 }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 4 }}>Painel de Portaria</h1>
        <p style={{ color: 'var(--color-text-secondary)', textTransform: 'capitalize' }}>Hoje: {today}</p>
      </div>

      {agendamentos.length === 0 && (
        <div className="glass" style={{ borderRadius: 'var(--border-radius)', padding: 48, textAlign: 'center', color: 'var(--color-text-muted)' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🏢</div>
          <p>Nenhuma mentoria agendada para hoje.</p>
        </div>
      )}

      {pendentes.length > 0 && (
        <section style={{ marginBottom: 24 }}>
          <h2 style={{ fontSize: 16, fontWeight: 600, color: 'var(--color-warning)', marginBottom: 12 }}>
            🟡 Pendente de Instruções ({pendentes.length})
          </h2>
          {pendentes.map((ag) => <CardMentoria key={ag.id} ag={ag} />)}
        </section>
      )}

      {agendados.length > 0 && (
        <section style={{ marginBottom: 24 }}>
          <h2 style={{ fontSize: 16, fontWeight: 600, color: 'var(--color-success)', marginBottom: 12 }}>
            🟢 Agendado ({agendados.length})
          </h2>
          {agendados.map((ag) => <CardMentoria key={ag.id} ag={ag} />)}
        </section>
      )}

      {emAndamento.length > 0 && (
        <section style={{ marginBottom: 24 }}>
          <h2 style={{ fontSize: 16, fontWeight: 600, color: 'var(--color-info)', marginBottom: 12 }}>
            🔵 Em Andamento ({emAndamento.length})
          </h2>
          {emAndamento.map((ag) => <CardMentoria key={ag.id} ag={ag} />)}
        </section>
      )}

      <Modal open={!!instrucaoModal} onClose={() => setInstrucaoModal(null)} title="Enviar Instruções de Encontro">
        <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', marginBottom: 16 }}>
          Informe a localização real e como a dupla deve proceder. Estas instruções são <strong>imutáveis</strong> após o envio.
        </p>
        <textarea
          value={instrucao}
          onChange={(e) => setInstrucao(e.target.value)}
          placeholder={`Ex: "Estarei na secretaria do ${instrucaoModal?.ambiente?.bloco}. Se não estiver lá, me liguem."`}
          style={{
            width: '100%', minHeight: 100, resize: 'vertical',
            background: 'var(--color-bg-glass)', border: '1px solid var(--color-border)',
            borderRadius: 8, color: 'var(--color-text)', fontSize: 14,
            padding: '12px', outline: 'none', marginBottom: 16,
          }}
        />
        <Button fullWidth onClick={enviarInstrucoes} loading={saving}>Enviar Instruções</Button>
      </Modal>
    </div>
  );
};
