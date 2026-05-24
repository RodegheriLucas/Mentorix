import React, { useEffect, useState, useCallback, useMemo } from 'react';
import api from '../../config/api';
import { Avatar, MxSelect } from '../../components/ui/DesignSystem';
import { Skeleton } from '../../components/ui/Skeleton';
import { DatePicker } from '../../components/ui/DatePicker';
import { useAuth } from '../../contexts/AuthContext';

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
function fmtDate(iso: string) {
  if (!iso) return '';
  const [y, m, d] = iso.split('T')[0].split('-');
  return new Date(Number(y), Number(m) - 1, Number(d))
    .toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: 'short' });
}
function todayIso() {
  return new Date().toISOString().split('T')[0];
}

const STATUS_ALL = ['PENDENTE_GESTOR', 'AGENDADO', 'EM_ANDAMENTO', 'CONCLUIDO', 'CANCELADO'];
const STATUS_LABEL: Record<string, string> = {
  PENDENTE_GESTOR: 'Pendente',
  AGENDADO: 'Agendado',
  EM_ANDAMENTO: 'Em andamento',
  CONCLUIDO: 'Concluído',
  CANCELADO: 'Cancelado',
};
const STATUS_COLORS: Record<string, { bg: string; fg: string; dot: string }> = {
  PENDENTE_GESTOR: { bg: '#FFF7E0', fg: '#7A5B00', dot: '#E0A800' },
  AGENDADO:        { bg: 'var(--accent-light)', fg: 'var(--accent-dark)', dot: 'var(--accent)' },
  EM_ANDAMENTO:    { bg: 'var(--secondary-light)', fg: 'var(--secondary-dark)', dot: 'var(--secondary)' },
  CONCLUIDO:       { bg: '#F0F4F0', fg: '#3A6B3A', dot: '#7bb87b' },
  CANCELADO:       { bg: '#FFEBEE', fg: 'var(--accent-dark)', dot: 'var(--accent-dark)' },
};

// ── SectionBadge ──────────────────────────────────────────────
function SectionBadge({ icon, label, sub }: { icon: React.ReactNode; label: string; sub: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 22 }}>
      <div style={{
        width: 44, height: 44, borderRadius: 13, flexShrink: 0,
        background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: '0 4px 14px rgba(93,70,184,0.28)',
      }}>
        {icon}
      </div>
      <div>
        <div style={{ fontFamily: 'var(--f-head)', fontWeight: 700, fontSize: 20, color: 'var(--text)', lineHeight: 1.2 }}>
          {label}
        </div>
        <div style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 2 }}>{sub}</div>
      </div>
    </div>
  );
}

// ── ColumnHeader ───────────────────────────────────────────────
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
        <span style={{ width: 8, height: 8, borderRadius: '50%', background: toneStyles.dot, display: 'inline-block', flexShrink: 0 }}/>
        <span style={{ fontFamily: 'var(--f-head)', fontWeight: 700, fontSize: 12, color: toneStyles.fg, letterSpacing: 0.2 }}>
          {title}
        </span>
      </div>
      <span style={{
        fontSize: 11, fontWeight: 700, padding: '2px 10px', borderRadius: 999,
        background: '#fff', color: toneStyles.fg, flexShrink: 0,
      }}>{count}</span>
    </div>
  );
}

// ── AgendamentoCard (kanban de hoje) ───────────────────────────
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
  const sala = ag.ambiente?.nome
    ? `${ag.ambiente.bloco ? ag.ambiente.bloco + ' · ' : ''}${ag.ambiente.nome}`
    : 'Sala a confirmar';

  return (
    <div className="mx-card" style={{
      padding: 14, marginBottom: 8,
      border: flashing ? '1.5px solid var(--secondary)' : '1px solid transparent',
      background: flashing ? 'var(--secondary-light)' : '#fff',
      transition: 'background .4s ease',
    }}>
      <div style={{ fontFamily: 'var(--f-head)', fontWeight: 700, fontSize: 13, color: 'var(--text)', marginBottom: 10, lineHeight: 1.3 }}>
        {ag.card?.titulo || 'Mentoria'}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
        <Avatar initials={initials(alunoName)} color={avatarGrad(ag.id % 6)} size={26}/>
        <span style={{ fontSize: 12, color: 'var(--text-2)', fontWeight: 500 }}>{alunoName.split(' ')[0]}</span>
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
          <path d="M5 12h14M13 6l6 6-6 6" stroke="var(--text-3)" strokeWidth="2" strokeLinecap="round"/>
        </svg>
        <Avatar initials={initials(mentorName)} color={avatarGrad((ag.id + 3) % 6)} size={26}/>
        <span style={{ fontSize: 12, color: 'var(--text-2)', fontWeight: 500 }}>{mentorName.split(' ')[0]}</span>
      </div>

      <div style={{
        padding: '9px 12px', borderRadius: 9, background: 'var(--surface)',
        display: 'flex', flexDirection: 'column', gap: 3, marginBottom: 10,
      }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)' }}>
          {ag.hora_inicio} – {ag.hora_fim}
        </div>
        <div className="mx-caption" style={{ fontSize: 11 }}>{sala}</div>
      </div>

      {ag.instrucoes_gestor && (
        <div style={{
          fontSize: 11, padding: '7px 10px', background: 'var(--primary-light)',
          color: 'var(--primary-dark)', borderRadius: 8, marginBottom: 10,
          display: 'flex', alignItems: 'flex-start', gap: 7,
        }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0, marginTop: 1 }}>
            <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2"/>
            <path d="M12 8v5M12 16v.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          <span>{ag.instrucoes_gestor}</span>
        </div>
      )}

      {ag.checkin_em && (
        <div style={{ fontSize: 11, color: 'var(--secondary-dark)', fontWeight: 600, marginBottom: 10, display: 'flex', alignItems: 'center', gap: 5 }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
            <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Check-in realizado
        </div>
      )}

      <button
        onClick={() => onAction(ag)}
        className={btnClass}
        disabled={checkinLoading}
        style={{ width: '100%', padding: '9px 0', fontSize: 12, fontWeight: 600 }}
      >
        {checkinLoading ? '…' : actionLabel}
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
        width: 480, background: '#fff', borderRadius: 18, padding: 28,
        boxShadow: '0 20px 50px rgba(0,0,0,0.25)',
      }}>
        <div style={{
          fontFamily: 'var(--f-body)', textTransform: 'uppercase', fontSize: 10, fontWeight: 700,
          letterSpacing: 1.2, color: 'var(--primary)', marginBottom: 6,
        }}>Aprovar mentoria</div>
        <h2 className="mx-h2" style={{ fontWeight: 700, marginBottom: 4 }}>{ag.card?.titulo}</h2>
        <p className="mx-caption" style={{ marginBottom: 18 }}>
          {ag.card?.aluno?.nome} · {ag.mentor?.nome} · {ag.hora_inicio} – {ag.hora_fim}
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
        <div style={{ display: 'flex', gap: 10, marginTop: 20, justifyContent: 'flex-end' }}>
          <button onClick={onClose} className="mx-btn ghost" style={{ padding: '10px 18px' }}>Cancelar</button>
          <button onClick={handleSend} className="mx-btn" style={{ padding: '10px 18px' }} disabled={saving}>
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
      padding: '20px 12px', borderRadius: 10, textAlign: 'center',
      border: '1.5px dashed var(--border)', color: 'var(--text-3)', fontSize: 12,
    }}>{label}</div>
  );
}

// ── Chip (filtro toggle) ───────────────────────────────────────
function Chip({
  label, active, onClick, dot,
}: { label: string; active: boolean; onClick: () => void; dot?: string }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 6,
        padding: '5px 13px', borderRadius: 999, border: 'none',
        cursor: 'pointer', fontSize: 12, fontWeight: active ? 700 : 500,
        fontFamily: 'var(--f-body)',
        background: active ? 'var(--primary)' : '#fff',
        color: active ? '#fff' : 'var(--text-2)',
        transition: 'all 0.15s',
        outline: active ? 'none' : '1px solid var(--border)',
        whiteSpace: 'nowrap',
        boxShadow: active ? '0 2px 8px rgba(93,70,184,0.22)' : 'none',
      }}
    >
      {dot && (
        <span style={{
          width: 7, height: 7, borderRadius: '50%',
          background: active ? 'rgba(255,255,255,0.8)' : dot,
          display: 'inline-block', flexShrink: 0,
        }}/>
      )}
      {label}
    </button>
  );
}

// ── UpcomingCard (card do painel de salas) ─────────────────────
function UpcomingCard({ ag }: { ag: any }) {
  const alunoName = ag.card?.aluno?.nome || 'Aluno';
  const mentorName = ag.mentor?.nome || 'Mentor';
  const amb = ag.ambiente;
  const sc = STATUS_COLORS[ag.status] || STATUS_COLORS.AGENDADO;

  return (
    <div style={{
      padding: '14px 16px', borderRadius: 12, background: '#fff',
      border: '1px solid var(--border)', marginBottom: 8,
      borderLeft: `4px solid ${sc.dot}`,
      boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
    }}>
      {/* título + pill */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10, marginBottom: 10 }}>
        <span style={{ fontFamily: 'var(--f-head)', fontWeight: 700, fontSize: 13, color: 'var(--text)', lineHeight: 1.35, flex: 1 }}>
          {ag.card?.titulo || 'Mentoria'}
        </span>
        <span style={{
          fontSize: 10, fontWeight: 700, padding: '3px 9px', borderRadius: 999,
          background: sc.bg, color: sc.fg, whiteSpace: 'nowrap', flexShrink: 0,
          textTransform: 'uppercase', letterSpacing: 0.5,
        }}>
          {STATUS_LABEL[ag.status]}
        </span>
      </div>

      {/* pessoas */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
        <Avatar initials={initials(alunoName)} color={avatarGrad(ag.id % 6)} size={28}/>
        <span style={{ fontSize: 12, color: 'var(--text-2)', fontWeight: 500 }}>{alunoName.split(' ')[0]}</span>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
          <path d="M5 12h14M13 6l6 6-6 6" stroke="var(--text-3)" strokeWidth="2" strokeLinecap="round"/>
        </svg>
        <Avatar initials={initials(mentorName)} color={avatarGrad((ag.id + 3) % 6)} size={28}/>
        <span style={{ fontSize: 12, color: 'var(--text-2)', fontWeight: 500 }}>{mentorName.split(' ')[0]}</span>
      </div>

      {/* horário + sala */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 6,
          padding: '5px 10px', borderRadius: 8, background: 'var(--surface)',
          fontSize: 12, color: 'var(--text)', fontWeight: 600, flexShrink: 0,
        }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="9" stroke="var(--text-3)" strokeWidth="1.8" fill="none"/>
            <path d="M12 7v5l3 2" stroke="var(--text-3)" strokeWidth="1.8" strokeLinecap="round"/>
          </svg>
          {ag.hora_inicio} – {ag.hora_fim}
        </div>

        {amb && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '5px 10px', borderRadius: 8, background: 'var(--surface)',
            fontSize: 12, color: 'var(--text)', fontWeight: 500, flex: 1, minWidth: 0,
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
              <rect x="3" y="5" width="18" height="14" rx="2" stroke="var(--text-3)" strokeWidth="1.8" fill="none"/>
              <path d="M3 12h18M8 5v14M16 5v14" stroke="var(--text-3)" strokeWidth="1.2"/>
            </svg>
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {amb.bloco ? `${amb.bloco} · ` : ''}{amb.nome}
            </span>
            {!!amb.exige_chave && (
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
                <circle cx="8" cy="15" r="4" stroke="#E0A800" strokeWidth="1.8"/>
                <path d="M12 11l6-6M16 6l2 2" stroke="#E0A800" strokeWidth="1.8" strokeLinecap="round"/>
              </svg>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ── UpcomingPanel (painel direito) ─────────────────────────────
function UpcomingPanel({ refreshSignal }: { refreshSignal: number }) {
  const [allAg, setAllAg] = useState<any[]>([]);
  const [ambientes, setAmbientes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [filterTipo, setFilterTipo] = useState<string>('TODOS');
  const [filterBloco, setFilterBloco] = useState<string>('TODOS');
  const [filterExigeChave, setFilterExigeChave] = useState<boolean | null>(null);
  const [filterStatus, setFilterStatus] = useState<string[]>(['PENDENTE_GESTOR', 'AGENDADO']);
  const [filterDataAte, setFilterDataAte] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [agRes, ambRes] = await Promise.all([
        api.get('/agendamentos'),
        api.get('/ambientes'),
      ]);
      setAllAg(agRes.data);
      setAmbientes(ambRes.data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load, refreshSignal]);

  const blocos = useMemo(() => {
    const set = new Set<string>();
    ambientes.forEach((a) => { if (a.bloco) set.add(a.bloco); });
    return Array.from(set).sort();
  }, [ambientes]);

  const today = todayIso();

  const filtered = useMemo(() => {
    return allAg
      .filter((ag) => (ag.data || '').split('T')[0] > today)
      .filter((ag) => filterStatus.includes(ag.status))
      .filter((ag) => filterTipo === 'TODOS' || ag.ambiente?.tipo === filterTipo)
      .filter((ag) => filterBloco === 'TODOS' || ag.ambiente?.bloco === filterBloco)
      .filter((ag) => filterExigeChave === null || !!ag.ambiente?.exige_chave === filterExigeChave)
      .filter((ag) => !filterDataAte || (ag.data || '').split('T')[0] <= filterDataAte)
      .sort((a, b) => {
        const da = (a.data || '').split('T')[0];
        const db = (b.data || '').split('T')[0];
        return da.localeCompare(db) || (a.hora_inicio || '').localeCompare(b.hora_inicio || '');
      });
  }, [allAg, today, filterStatus, filterTipo, filterBloco, filterExigeChave, filterDataAte]);

  const grouped = useMemo(() => {
    const map: Record<string, any[]> = {};
    filtered.forEach((ag) => {
      const key = (ag.data || '').split('T')[0];
      if (!map[key]) map[key] = [];
      map[key].push(ag);
    });
    return map;
  }, [filtered]);

  const toggleStatus = (s: string) =>
    setFilterStatus((prev) => prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]);

  return (
    <div style={{
      display: 'flex', flexDirection: 'column',
      position: 'sticky', top: 0,
      maxHeight: 'calc(100vh - 56px)',
      overflow: 'hidden',
    }}>
      {/* ── Cabeçalho do painel ── */}
      <div style={{ paddingBottom: 16 }}>
        <SectionBadge
          label="Agenda de Salas"
          sub={`${filtered.length} agendamento${filtered.length !== 1 ? 's' : ''} a partir de amanhã`}
          icon={
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <rect x="3" y="5" width="18" height="14" rx="2" stroke="#fff" strokeWidth="1.8" fill="none"/>
              <path d="M3 12h18M8 5v14M16 5v14" stroke="#fff" strokeWidth="1.4"/>
            </svg>
          }
        />

        {/* ── Filtros ── */}
        <div style={{
          background: '#fff', border: '1px solid var(--border)', borderRadius: 14,
          padding: '16px', display: 'flex', flexDirection: 'column', gap: 14,
        }}>
          {/* Cabeçalho do bloco de filtros */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                <path d="M4 6h16M7 12h10M10 18h4" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              <span style={{ fontFamily: 'var(--f-head)', fontWeight: 700, fontSize: 13, color: 'var(--text)' }}>
                Filtros
              </span>
            </div>
            <button
              onClick={load}
              style={{
                display: 'flex', alignItems: 'center', gap: 5,
                padding: '5px 10px', borderRadius: 8, cursor: 'pointer',
                border: '1px solid var(--border)', background: 'var(--surface)',
                fontSize: 11, fontWeight: 500, color: 'var(--text-2)', fontFamily: 'var(--f-body)',
              }}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                <path d="M1 4v6h6M23 20v-6h-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10M23 14l-4.64 4.36A9 9 0 0 1 3.51 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Atualizar
            </button>
          </div>

          {/* Status */}
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 7 }}>
              Status
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
              {STATUS_ALL.map((s) => (
                <Chip
                  key={s} label={STATUS_LABEL[s]}
                  active={filterStatus.includes(s)}
                  dot={STATUS_COLORS[s]?.dot}
                  onClick={() => toggleStatus(s)}
                />
              ))}
            </div>
          </div>

          {/* Tipo de ambiente */}
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 7 }}>
              Tipo de ambiente
            </div>
            <div style={{ display: 'flex', gap: 5 }}>
              {[
                { value: 'TODOS', label: 'Todos' },
                { value: 'SALA_FECHADA', label: 'Sala fechada' },
                { value: 'AMBIENTE_COMUM', label: 'Amb. comum' },
              ].map((o) => (
                <Chip key={o.value} label={o.label} active={filterTipo === o.value} onClick={() => setFilterTipo(o.value)}/>
              ))}
            </div>
          </div>

          {/* Bloco + Exige chave */}
          <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end' }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 7 }}>
                Bloco
              </div>
              <MxSelect
                value={filterBloco}
                onChange={(e) => setFilterBloco(e.target.value)}
                style={{ padding: '7px 32px 7px 10px', fontSize: 12, borderRadius: 9 }}
              >
                <option value="TODOS">Todos os blocos</option>
                {blocos.map((b) => <option key={b} value={b}>{b}</option>)}
              </MxSelect>
            </div>

            <div>
              <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 7 }}>
                Chave
              </div>
              <button
                onClick={() => setFilterExigeChave((v) => v === true ? null : true)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '7px 12px', borderRadius: 9, fontSize: 12, fontWeight: 600,
                  border: 'none', cursor: 'pointer',
                  background: filterExigeChave === true ? 'var(--primary)' : 'var(--surface)',
                  color: filterExigeChave === true ? '#fff' : 'var(--text-2)',
                  outline: filterExigeChave === true ? 'none' : '1px solid var(--border)',
                  fontFamily: 'var(--f-body)',
                  boxShadow: filterExigeChave === true ? '0 2px 8px rgba(93,70,184,0.22)' : 'none',
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <circle cx="8" cy="15" r="4" stroke="currentColor" strokeWidth="1.8"/>
                  <path d="M12 11l6-6M16 6l2 2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                </svg>
                Exige chave
              </button>
            </div>
          </div>

          {/* Até a data */}
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 7 }}>
              Até a data
            </div>
            <DatePicker
              value={filterDataAte}
              onChange={setFilterDataAte}
              min={today}
              placeholder="Sem limite de data"
            />
          </div>
        </div>
      </div>

      {/* ── Lista de resultados ── */}
      <div style={{ flex: 1, overflowY: 'auto', paddingBottom: 8 }}>
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[1, 2, 3].map((i) => <Skeleton key={i} height={80}/>)}
          </div>
        ) : filtered.length === 0 ? (
          <div style={{
            padding: '40px 20px', textAlign: 'center',
            border: '1.5px dashed var(--border)', borderRadius: 14, background: '#fff',
          }}>
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" style={{ margin: '0 auto 12px', display: 'block' }}>
              <rect x="3" y="5" width="18" height="14" rx="2" stroke="var(--text-3)" strokeWidth="1.5" fill="none"/>
              <path d="M3 12h18M8 5v14M16 5v14" stroke="var(--text-3)" strokeWidth="1.2"/>
            </svg>
            <p style={{ fontSize: 13, color: 'var(--text-2)', fontWeight: 600, marginBottom: 4 }}>
              Nenhum agendamento
            </p>
            <p style={{ fontSize: 11, color: 'var(--text-3)' }}>
              Ajuste os filtros para ver outros resultados.
            </p>
          </div>
        ) : (
          Object.entries(grouped).map(([date, items]) => (
            <div key={date} style={{ marginBottom: 18 }}>
              {/* Divisor de data */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                <div style={{
                  padding: '3px 10px', borderRadius: 999,
                  background: date === today ? 'var(--primary)' : 'var(--surface)',
                  border: date === today ? 'none' : '1px solid var(--border)',
                }}>
                  <span style={{
                    fontSize: 11, fontWeight: 700,
                    color: date === today ? '#fff' : 'var(--text-2)',
                    fontFamily: 'var(--f-head)', textTransform: 'capitalize', whiteSpace: 'nowrap',
                  }}>
                    {date === today ? 'Hoje' : fmtDate(date)}
                  </span>
                </div>
                <div style={{ flex: 1, height: 1, background: 'var(--border)' }}/>
                <span style={{
                  fontSize: 11, color: 'var(--text-3)', fontWeight: 700,
                  background: 'var(--surface)', padding: '2px 8px', borderRadius: 999,
                  border: '1px solid var(--border)',
                }}>
                  {items.length}
                </span>
              </div>
              {items.map((ag) => <UpcomingCard key={ag.id} ag={ag}/>)}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────
export const PainelPortaria: React.FC = () => {
  const [agendamentos, setAgendamentos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [instrucaoModal, setInstrucaoModal] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [checkinLoading, setCheckinLoading] = useState<Record<number, boolean>>({});
  const [flashing, setFlashing] = useState<number | null>(null);
  const [rightRefresh, setRightRefresh] = useState(0);
  const { user } = useAuth();

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
      setRightRefresh((n) => n + 1);
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
      setRightRefresh((n) => n + 1);
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
      setRightRefresh((n) => n + 1);
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

  const pendentes   = agendamentos.filter((a) => a.status === 'PENDENTE_GESTOR');
  const agendados   = agendamentos.filter((a) => a.status === 'AGENDADO');
  const emAndamento = agendamentos.filter((a) => a.status === 'EM_ANDAMENTO');

  return (
    <div className="animate-fadeIn" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0, alignItems: 'start' }}>

      {/* ── ESQUERDA: Portaria de hoje ── */}
      <div style={{ paddingRight: 32, borderRight: '1.5px solid var(--border)' }}>

        {/* Cabeçalho da seção */}
        <SectionBadge
          label="Painel de Portaria"
          sub={new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })}
          icon={
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path d="M3 9L12 3l9 6v11a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9z" stroke="#fff" strokeWidth="1.8" fill="none"/>
              <path d="M9 22V12h6v10" stroke="#fff" strokeWidth="1.8"/>
            </svg>
          }
        />

        {/* Saudação */}
        <div style={{ marginBottom: 20 }}>
          <h1 style={{ fontFamily: 'var(--f-head)', fontWeight: 700, fontSize: 26, color: 'var(--text)', margin: 0, letterSpacing: -0.5 }}>
            Olá, {user?.nome?.split(' ')[0]}!
          </h1>
          <p className="mx-caption" style={{ marginTop: 4, fontSize: 13 }}>
            Aqui estão os agendamentos de hoje que precisam da sua atenção.
          </p>
        </div>

        {/* Linha de stats */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
          {[
            { label: 'Total hoje', value: agendamentos.length, color: 'var(--primary)', bg: 'var(--primary-light)', icon: (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <rect x="3" y="4" width="18" height="18" rx="3" stroke="currentColor" strokeWidth="2" fill="none"/>
                <path d="M3 10h18M8 4v6M16 4v6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            )},
            { label: 'Pendentes', value: pendentes.length, color: '#7A5B00', bg: '#FFF7E0', icon: (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2"/>
                <path d="M12 7v5l3 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            )},
            { label: 'Em andamento', value: emAndamento.length, color: 'var(--secondary)', bg: 'var(--secondary-light)', icon: (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M5 12l5 5L20 7" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            )},
          ].map((s) => (
            <div key={s.label} className="mx-card" style={{ padding: '16px 18px', flex: 1, display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ width: 34, height: 34, borderRadius: 9, background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: s.color }}>
                {s.icon}
              </div>
              <div>
                <div style={{ fontSize: 28, fontWeight: 700, fontFamily: 'var(--f-head)', color: s.color, lineHeight: 1 }}>{s.value}</div>
                <div style={{ marginTop: 3, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5, fontSize: 10, color: 'var(--text-3)' }}>{s.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Kanban */}
        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
            {[1, 2, 3].map((i) => <Skeleton key={i} height={280}/>)}
          </div>
        ) : agendamentos.length === 0 ? (
          <div className="mx-card" style={{ padding: 48, textAlign: 'center', color: 'var(--text-3)' }}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" style={{ margin: '0 auto 14px', display: 'block' }}>
              <path d="M3 9L12 3l9 6v11a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9z" stroke="var(--text-3)" strokeWidth="1.5" fill="none"/>
              <path d="M9 22V12h6v10" stroke="var(--text-3)" strokeWidth="1.5"/>
            </svg>
            <p style={{ fontWeight: 600, marginBottom: 4 }}>Nenhuma mentoria agendada para hoje</p>
            <p style={{ fontSize: 12 }}>A portaria está livre por ora.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
            <div>
              <ColumnHeader title="Pendente de Instruções" count={pendentes.length} tone="yellow"/>
              {pendentes.map((ag) => (
                <AgendamentoCard key={ag.id} ag={ag} onAction={handleAction} flashing={false} checkinLoading={!!checkinLoading[ag.id]}/>
              ))}
              {pendentes.length === 0 && <EmptyCol label="Nada aguardando 🎉"/>}
            </div>
            <div>
              <ColumnHeader title="Aguardando check-in" count={agendados.length} tone="accent"/>
              {agendados.map((ag) => (
                <AgendamentoCard key={ag.id} ag={ag} onAction={handleAction} flashing={flashing === ag.id} checkinLoading={!!checkinLoading[ag.id]}/>
              ))}
              {agendados.length === 0 && <EmptyCol label="Tudo em andamento"/>}
            </div>
            <div>
              <ColumnHeader title="Sala ocupada" count={emAndamento.length} tone="green"/>
              {emAndamento.map((ag) => (
                <AgendamentoCard key={ag.id} ag={ag} onAction={handleAction} flashing={false} checkinLoading={!!checkinLoading[ag.id]}/>
              ))}
              {emAndamento.length === 0 && <EmptyCol label="Nenhuma sala em uso"/>}
            </div>
          </div>
        )}
      </div>

      {/* ── DIREITA: Agenda de Salas ── */}
      <div style={{ paddingLeft: 32 }}>
        <UpcomingPanel refreshSignal={rightRefresh}/>
      </div>

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
