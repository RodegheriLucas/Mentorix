import React, { useEffect, useState, useCallback } from 'react';
import api from '../../config/api';
import { Avatar, StatusPill } from '../../components/ui/DesignSystem';
import { Skeleton } from '../../components/ui/Skeleton';

// ── helpers ────────────────────────────────────────────────────
function initials(name: string) {
  return name?.split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase() || '??';
}
function avatarGrad(index: number) {
  const grads = [
    'linear-gradient(135deg,#6f5ad0,#4632a0)',
    'linear-gradient(135deg,#506fc7,#2e4ea0)',
    'linear-gradient(135deg,#e64a19,#bf360c)',
    'linear-gradient(135deg,#4a78d6,#2854b4)',
    'linear-gradient(135deg,#8a6fe0,#5c3fc0)',
    'linear-gradient(135deg,#2e7d32,#1b5e20)',
  ];
  return grads[index % grads.length];
}

// ── Column header ─────────────────────────────────────────────
function ColumnHeader({ title, count, tone }: { title: string; count: number; tone: 'yellow' | 'accent' | 'green' }) {
  const toneStyles = {
    yellow: { bg: '#FFF7E0', dot: '#E0A800', fg: '#7A5B00' },
    accent: { bg: 'var(--accent-light)', dot: 'var(--accent)', fg: 'var(--accent-dark)' },
    green:  { bg: 'var(--secondary-light)', dot: 'var(--secondary)', fg: 'var(--secondary-dark)' },
  }[tone];
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '10px 14px', borderRadius: 10,
      background: toneStyles.bg, marginBottom: 10,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ width: 8, height: 8, borderRadius: '50%', background: toneStyles.dot, display: 'inline-block' }}/>
        <span style={{ fontFamily: 'var(--f-head)', fontWeight: 700, fontSize: 13, color: toneStyles.fg, letterSpacing: 0.2 }}>
          {title}
        </span>
      </div>
      <span style={{
        fontSize: 12, fontWeight: 700, padding: '2px 10px', borderRadius: 999,
        background: '#fff', color: toneStyles.fg,
      }}>{count}</span>
    </div>
  );
}

// ── AgendamentoCard ───────────────────────────────────────────
function AgendamentoCard({
  ag, onAction, flashing, checkinLoading,
}: {
  ag: any; onAction: (ag: any) => void; flashing: boolean; checkinLoading: boolean;
}) {
  const actionLabel = ag.status === 'PENDENTE_GESTOR' ? 'Enviar instruções'
    : ag.status === 'AGENDADO' ? 'Realizar check-in'
    : 'Encerrar & check-out';
  const btnClass = ag.status === 'PENDENTE_GESTOR' ? 'mx-btn'
    : ag.status === 'AGENDADO' ? 'mx-btn green'
    : 'mx-btn ghost';

  const alunoName = ag.card?.aluno?.nome || 'Aluno';
  const mentorName = ag.mentor?.nome || 'Mentor';
  const sala = ag.ambiente?.nome ? `${ag.ambiente.bloco ? ag.ambiente.bloco + ' · ' : ''}${ag.ambiente.nome}` : 'Sala a confirmar';

  return (
    <div className="mx-card" style={{
      padding: 12, marginBottom: 8,
      border: flashing ? '1.5px solid var(--secondary)' : '1px solid transparent',
      background: flashing ? 'var(--secondary-light)' : '#fff',
      transition: 'background .4s ease',
    }}>
      <div style={{ fontFamily: 'var(--f-head)', fontWeight: 700, fontSize: 13, color: 'var(--text)', marginBottom: 8, lineHeight: 1.25 }}>
        {ag.card?.titulo || 'Mentoria'}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
        <Avatar initials={initials(alunoName)} color={avatarGrad(ag.id % 6)} size={24}/>
        <span style={{ fontSize: 11, color: 'var(--text-2)' }}>{alunoName.split(' ')[0]}</span>
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none">
          <path d="M5 12h14M13 6l6 6-6 6" stroke="var(--text-3)" strokeWidth="2" strokeLinecap="round"/>
        </svg>
        <Avatar initials={initials(mentorName)} color={avatarGrad((ag.id + 3) % 6)} size={24}/>
        <span style={{ fontSize: 11, color: 'var(--text-2)' }}>{mentorName.split(' ')[0]}</span>
      </div>

      <div style={{
        padding: '8px 10px', borderRadius: 8, background: 'var(--surface)',
        display: 'flex', flexDirection: 'column', gap: 2, marginBottom: 8,
      }}>
        <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--text)' }}>
          {ag.dia_semana} · {ag.hora_inicio}–{ag.hora_fim}
        </div>
        <div className="mx-caption" style={{ fontSize: 11 }}>{sala}</div>
      </div>

      {ag.instrucoes_gestor && (
        <div className="mx-caption" style={{
          fontSize: 11, padding: '6px 8px', background: 'var(--primary-light)',
          color: 'var(--primary-dark)', borderRadius: 7, marginBottom: 8,
          display: 'flex', alignItems: 'flex-start', gap: 6,
        }}>
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0, marginTop: 2 }}>
            <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2"/>
            <path d="M12 8v5M12 16v.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          <span>{ag.instrucoes_gestor}</span>
        </div>
      )}

      {ag.checkin_em && (
        <div className="mx-caption" style={{ fontSize: 11, color: 'var(--secondary-dark)', fontWeight: 500, marginBottom: 8 }}>
          ✓ check-in realizado
        </div>
      )}

      <button
        onClick={() => onAction(ag)}
        className={btnClass}
        disabled={checkinLoading}
        style={{ width: '100%', padding: '9px 0', fontSize: 12, fontWeight: 600 }}
      >
        {checkinLoading ? '...' : actionLabel}
      </button>
    </div>
  );
}

// ── InstrucoesModal ───────────────────────────────────────────
function InstrucoesModal({ open, ag, onClose, onSend, saving }: {
  open: boolean; ag: any; onClose: () => void;
  onSend: (text: string) => void; saving: boolean;
}) {
  const [text, setText] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (open && ag) {
      const sala = ag.ambiente?.nome || 'sala';
      setText(`Procure o gestor na portaria 5 min antes — leve o crachá. Devolução da chave até ${ag.hora_fim || '17h00'}.`);
      setError('');
    }
  }, [open, ag]);

  if (!open || !ag) return null;

  const handleSend = () => {
    if (!text.trim()) { setError('Digite as instruções.'); return; }
    onSend(text);
  };

  return (
    <div onClick={onClose} style={{
      position: 'fixed', inset: 0, background: 'rgba(18,18,18,0.45)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200,
    }}>
      <div onClick={(e) => e.stopPropagation()} style={{
        width: 480, background: '#fff', borderRadius: 18, padding: 24,
        boxShadow: '0 20px 50px rgba(0,0,0,0.25)',
      }}>
        <div className="mx-caption" style={{
          fontFamily: 'var(--f-body)', textTransform: 'uppercase', fontSize: 10, fontWeight: 600,
          letterSpacing: 1, color: 'var(--primary)', marginBottom: 4,
        }}>Aprovar mentoria</div>
        <h2 className="mx-h2" style={{ fontWeight: 700, marginBottom: 4 }}>{ag.card?.titulo}</h2>
        <p className="mx-caption" style={{ marginBottom: 14 }}>
          {ag.card?.aluno?.nome} · {ag.mentor?.nome} · {ag.dia_semana} {ag.hora_inicio}–{ag.hora_fim}
        </p>
        <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)' }}>Instruções para aluno e mentor</label>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={4}
          style={{
            width: '100%', boxSizing: 'border-box',
            padding: '10px 12px', marginTop: 6, borderRadius: 10,
            border: '1px solid var(--border)', outline: 'none', resize: 'none',
            fontFamily: 'var(--f-body)', fontSize: 13, color: 'var(--text)', lineHeight: 1.5,
          }}
        />
        <div className="mx-caption" style={{ fontSize: 11, marginTop: 4, color: 'var(--text-3)' }}>
          Após enviar, as instruções são <strong>imutáveis</strong>. Aluno e mentor recebem notificação.
        </div>
        {error && <p style={{ color: 'var(--accent)', fontSize: 12, marginTop: 8 }}>{error}</p>}
        <div style={{ display: 'flex', gap: 10, marginTop: 18, justifyContent: 'flex-end' }}>
          <button onClick={onClose} className="mx-btn ghost" style={{ padding: '10px 16px' }}>Cancelar</button>
          <button onClick={handleSend} className="mx-btn" style={{ padding: '10px 16px' }} disabled={saving}>
            {saving ? 'Enviando…' : 'Enviar & marcar como Agendado'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── EmptyCol ──────────────────────────────────────────────────
function EmptyCol({ label }: { label: string }) {
  return (
    <div style={{
      padding: '24px 12px', borderRadius: 10, textAlign: 'center',
      border: '1.5px dashed var(--border)', color: 'var(--text-3)', fontSize: 12,
    }}>{label}</div>
  );
}

// ── Main component ────────────────────────────────────────────
export const PainelPortaria: React.FC = () => {
  const [agendamentos, setAgendamentos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [instrucaoModal, setInstrucaoModal] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [checkinLoading, setCheckinLoading] = useState<Record<number, boolean>>({});
  const [flashing, setFlashing] = useState<number | null>(null);

  const load = useCallback(() => {
    api.get('/agendamentos/hoje')
      .then((r) => setAgendamentos(r.data))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
    const interval = setInterval(load, 30000);
    return () => clearInterval(interval);
  }, [load]);

  const enviarInstrucoes = async (text: string) => {
    setSaving(true);
    try {
      await api.patch(`/agendamentos/${instrucaoModal.id}/instrucoes`, { instrucoes: text });
      setInstrucaoModal(null);
      load();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Erro ao enviar instruções.');
    } finally {
      setSaving(false);
    }
  };

  const doCheckin = async (ag: any) => {
    setCheckinLoading((c) => ({ ...c, [ag.id]: true }));
    try {
      await api.post(`/checkin/${ag.id}`);
      setFlashing(ag.id);
      setTimeout(() => setFlashing(null), 1200);
      load();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Erro no check-in.');
    } finally {
      setCheckinLoading((c) => ({ ...c, [ag.id]: false }));
    }
  };

  const doCheckout = async (ag: any) => {
    setCheckinLoading((c) => ({ ...c, [ag.id]: true }));
    try {
      await api.post(`/checkout/${ag.id}`);
      load();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Erro no check-out.');
    } finally {
      setCheckinLoading((c) => ({ ...c, [ag.id]: false }));
    }
  };

  const handleAction = (ag: any) => {
    if (ag.status === 'PENDENTE_GESTOR') { setInstrucaoModal(ag); return; }
    if (ag.status === 'AGENDADO') { doCheckin(ag); return; }
    if (ag.status === 'EM_ANDAMENTO') { doCheckout(ag); return; }
  };

  if (loading) return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
      {[1,2,3].map((i) => <Skeleton key={i} height={300}/>)}
    </div>
  );

  const pendentes   = agendamentos.filter((a) => a.status === 'PENDENTE_GESTOR');
  const agendados   = agendamentos.filter((a) => a.status === 'AGENDADO');
  const emAndamento = agendamentos.filter((a) => a.status === 'EM_ANDAMENTO');

  const today = new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' });

  return (
    <div className="animate-fadeIn">
      {/* Topbar */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 16,
        marginBottom: 20,
      }}>
        <div>
          <h1 style={{ fontFamily: 'var(--f-head)', fontWeight: 700, fontSize: 22, color: 'var(--text)', margin: 0 }}>
            Painel de Portaria
          </h1>
          <p className="mx-caption" style={{ marginTop: 2, textTransform: 'capitalize' }}>{today} · auto-refresh 30s</p>
        </div>
        <div style={{ flex: 1 }}/>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 6,
          padding: '6px 12px', borderRadius: 999, background: 'var(--secondary-light)',
        }}>
          <span className="mx-pulse" style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--secondary)', display: 'inline-block' }}/>
          <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--secondary-dark)' }}>ao vivo</span>
        </div>
      </div>

      {/* Stat row */}
      <div style={{ display: 'flex', gap: 14, marginBottom: 20 }}>
        {[
          { label: 'Total hoje', value: agendamentos.length, color: 'var(--primary)', bg: 'var(--primary-light)' },
          { label: 'Pendentes', value: pendentes.length, color: '#7A5B00', bg: '#FFF7E0' },
          { label: 'Em andamento', value: emAndamento.length, color: 'var(--secondary)', bg: 'var(--secondary-light)' },
        ].map((s) => (
          <div key={s.label} className="mx-card" style={{ padding: '14px 18px', flex: 1 }}>
            <div style={{ fontSize: 26, fontWeight: 700, fontFamily: 'var(--f-head)', color: s.color }}>{s.value}</div>
            <div className="mx-caption" style={{ marginTop: 2, fontWeight: 500, textTransform: 'uppercase', letterSpacing: 0.4, fontSize: 10 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Kanban */}
      {agendamentos.length === 0 ? (
        <div className="mx-card" style={{ padding: 48, textAlign: 'center', color: 'var(--text-3)' }}>
          <div style={{ fontSize: 36, marginBottom: 12 }}>🏢</div>
          <p>Nenhuma mentoria agendada para hoje.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
          <div>
            <ColumnHeader title="Pendente de Instruções" count={pendentes.length} tone="yellow"/>
            {pendentes.map((ag) => (
              <AgendamentoCard
                key={ag.id} ag={ag}
                onAction={handleAction}
                flashing={false}
                checkinLoading={!!checkinLoading[ag.id]}
              />
            ))}
            {pendentes.length === 0 && <EmptyCol label="Nada aguardando 🎉"/>}
          </div>
          <div>
            <ColumnHeader title="Agendado · aguardando check-in" count={agendados.length} tone="accent"/>
            {agendados.map((ag) => (
              <AgendamentoCard
                key={ag.id} ag={ag}
                onAction={handleAction}
                flashing={flashing === ag.id}
                checkinLoading={!!checkinLoading[ag.id]}
              />
            ))}
            {agendados.length === 0 && <EmptyCol label="Tudo em andamento"/>}
          </div>
          <div>
            <ColumnHeader title="Em andamento · sala ocupada" count={emAndamento.length} tone="green"/>
            {emAndamento.map((ag) => (
              <AgendamentoCard
                key={ag.id} ag={ag}
                onAction={handleAction}
                flashing={false}
                checkinLoading={!!checkinLoading[ag.id]}
              />
            ))}
            {emAndamento.length === 0 && <EmptyCol label="Nenhuma sala em uso"/>}
          </div>
        </div>
      )}

      <InstrucoesModal
        open={!!instrucaoModal}
        ag={instrucaoModal}
        onClose={() => setInstrucaoModal(null)}
        onSend={enviarInstrucoes}
        saving={saving}
      />
    </div>
  );
};
