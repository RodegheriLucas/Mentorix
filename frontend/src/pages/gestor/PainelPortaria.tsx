import React, { useEffect, useState, useCallback, useMemo } from 'react';
import api from '../../config/api';
import { Avatar, StatusPill } from '../../components/ui/DesignSystem';
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

// ── AgendamentoCard (today kanban) ────────────────────────────
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

// ── Chip (filter toggle) ──────────────────────────────────────
function Chip({
  label, active, onClick, dot,
}: { label: string; active: boolean; onClick: () => void; dot?: string }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 5,
        padding: '4px 10px', borderRadius: 999, border: 'none',
        cursor: 'pointer', fontSize: 11, fontWeight: active ? 700 : 400,
        fontFamily: 'var(--f-body)',
        background: active ? 'var(--primary)' : 'var(--surface)',
        color: active ? '#fff' : 'var(--text-2)',
        transition: 'all 0.15s',
        outline: active ? 'none' : '1px solid var(--border)',
        whiteSpace: 'nowrap',
      }}
    >
      {dot && (
        <span style={{
          width: 6, height: 6, borderRadius: '50%',
          background: active ? 'rgba(255,255,255,0.7)' : dot,
          display: 'inline-block', flexShrink: 0,
        }}/>
      )}
      {label}
    </button>
  );
}

// ── UpcomingCard (card no painel direito) ─────────────────────
function UpcomingCard({ ag }: { ag: any }) {
  const alunoName = ag.card?.aluno?.nome || 'Aluno';
  const mentorName = ag.mentor?.nome || 'Mentor';
  const amb = ag.ambiente;
  const sc = STATUS_COLORS[ag.status] || STATUS_COLORS.AGENDADO;

  return (
    <div style={{
      padding: '10px 12px', borderRadius: 10, background: '#fff',
      border: '1px solid var(--border)', marginBottom: 6,
      borderLeft: `3px solid ${sc.dot}`,
    }}>
      {/* title + status */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8, marginBottom: 6 }}>
        <span style={{ fontFamily: 'var(--f-head)', fontWeight: 700, fontSize: 12, color: 'var(--text)', lineHeight: 1.3, flex: 1 }}>
          {ag.card?.titulo || 'Mentoria'}
        </span>
        <span style={{
          fontSize: 9, fontWeight: 700, padding: '2px 7px', borderRadius: 999,
          background: sc.bg, color: sc.fg, whiteSpace: 'nowrap', flexShrink: 0,
          textTransform: 'uppercase', letterSpacing: 0.4,
        }}>
          {STATUS_LABEL[ag.status]}
        </span>
      </div>

      {/* people row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 6 }}>
        <Avatar initials={initials(alunoName)} color={avatarGrad(ag.id % 6)} size={20}/>
        <span style={{ fontSize: 10, color: 'var(--text-2)' }}>{alunoName.split(' ')[0]}</span>
        <svg width="9" height="9" viewBox="0 0 24 24" fill="none">
          <path d="M5 12h14M13 6l6 6-6 6" stroke="var(--text-3)" strokeWidth="2" strokeLinecap="round"/>
        </svg>
        <Avatar initials={initials(mentorName)} color={avatarGrad((ag.id + 3) % 6)} size={20}/>
        <span style={{ fontSize: 10, color: 'var(--text-2)' }}>{mentorName.split(' ')[0]}</span>
      </div>

      {/* time + sala row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 4,
          padding: '3px 8px', borderRadius: 6, background: 'var(--surface)',
          fontSize: 10, color: 'var(--text)', fontWeight: 500,
        }}>
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="9" stroke="var(--text-3)" strokeWidth="2"/>
            <path d="M12 7v5l3 2" stroke="var(--text-3)" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          {ag.hora_inicio}–{ag.hora_fim}
        </div>
        {amb && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 4,
            padding: '3px 8px', borderRadius: 6, background: 'var(--surface)',
            fontSize: 10, color: 'var(--text)', fontWeight: 500, flex: 1,
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none">
              <rect x="3" y="5" width="18" height="14" rx="2" stroke="var(--text-3)" strokeWidth="2" fill="none"/>
            </svg>
            {amb.bloco ? `${amb.bloco} · ` : ''}{amb.nome}
            {!!amb.exige_chave && (
              <svg width="9" height="9" viewBox="0 0 24 24" fill="none" style={{ marginLeft: 3, flexShrink: 0 }}>
                <circle cx="8" cy="15" r="4" stroke="var(--text-3)" strokeWidth="2"/>
                <path d="M12 11l6-6M16 6l2 2" stroke="var(--text-3)" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ── UpcomingPanel (painel direito completo) ───────────────────
function UpcomingPanel({ refreshSignal }: { refreshSignal: number }) {
  const [allAg, setAllAg] = useState<any[]>([]);
  const [ambientes, setAmbientes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // filters
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
      .filter((ag) => {
        const agDate = (ag.data || '').split('T')[0];
        return agDate >= today;
      })
      .filter((ag) => filterStatus.includes(ag.status))
      .filter((ag) => filterTipo === 'TODOS' || ag.ambiente?.tipo === filterTipo)
      .filter((ag) => filterBloco === 'TODOS' || ag.ambiente?.bloco === filterBloco)
      .filter((ag) => filterExigeChave === null || !!ag.ambiente?.exige_chave === filterExigeChave)
      .filter((ag) => {
        if (!filterDataAte) return true;
        const agDate = (ag.data || '').split('T')[0];
        return agDate <= filterDataAte;
      })
      .sort((a, b) => {
        const da = (a.data || '').split('T')[0];
        const db = (b.data || '').split('T')[0];
        return da.localeCompare(db) || (a.hora_inicio || '').localeCompare(b.hora_inicio || '');
      });
  }, [allAg, today, filterStatus, filterTipo, filterBloco, filterExigeChave, filterDataAte]);

  // group by date
  const grouped = useMemo(() => {
    const map: Record<string, any[]> = {};
    filtered.forEach((ag) => {
      const key = (ag.data || '').split('T')[0];
      if (!map[key]) map[key] = [];
      map[key].push(ag);
    });
    return map;
  }, [filtered]);

  const toggleStatus = (s: string) => {
    setFilterStatus((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]
    );
  };

  return (
    <div style={{
      background: '#fff', borderRadius: 16, border: '1px solid var(--border)',
      display: 'flex', flexDirection: 'column',
      position: 'sticky', top: 0, maxHeight: 'calc(100vh - 56px)',
      overflow: 'hidden',
    }}>
      {/* Panel header */}
      <div style={{ padding: '16px 18px 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                <rect x="3" y="5" width="18" height="14" rx="2" stroke="var(--primary)" strokeWidth="2" fill="none"/>
                <path d="M3 12h18M8 5v14M16 5v14" stroke="var(--primary)" strokeWidth="1.5"/>
              </svg>
              <span style={{ fontFamily: 'var(--f-head)', fontWeight: 700, fontSize: 15, color: 'var(--text)' }}>
                Visão de Salas
              </span>
            </div>
            <p style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 2 }}>
              Agendamentos futuros · {filtered.length} resultado{filtered.length !== 1 ? 's' : ''}
            </p>
          </div>
          <button
            onClick={load}
            title="Atualizar"
            style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, padding: '6px 8px', cursor: 'pointer' }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
              <path d="M1 4v6h6M23 20v-6h-6" stroke="var(--text-2)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10M23 14l-4.64 4.36A9 9 0 0 1 3.51 15" stroke="var(--text-2)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>

        {/* ── Filters ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, paddingBottom: 14, borderBottom: '1px solid var(--border)' }}>

          {/* Status chips */}
          <div>
            <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 5 }}>
              Status
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
              {STATUS_ALL.map((s) => (
                <Chip
                  key={s}
                  label={STATUS_LABEL[s]}
                  active={filterStatus.includes(s)}
                  dot={STATUS_COLORS[s]?.dot}
                  onClick={() => toggleStatus(s)}
                />
              ))}
            </div>
          </div>

          {/* Tipo chips */}
          <div>
            <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 5 }}>
              Tipo de ambiente
            </div>
            <div style={{ display: 'flex', gap: 4 }}>
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
          <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 5 }}>
                Bloco
              </div>
              <select
                value={filterBloco}
                onChange={(e) => setFilterBloco(e.target.value)}
                style={{
                  width: '100%', padding: '5px 8px', borderRadius: 8,
                  border: '1px solid var(--border)', background: 'var(--surface)',
                  fontFamily: 'var(--f-body)', fontSize: 12, color: 'var(--text)',
                  outline: 'none', cursor: 'pointer',
                }}
              >
                <option value="TODOS">Todos os blocos</option>
                {blocos.map((b) => <option key={b} value={b}>{b}</option>)}
              </select>
            </div>

            <div>
              <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 5 }}>
                Chave
              </div>
              <button
                onClick={() => setFilterExigeChave((v) => v === true ? null : true)}
                style={{
                  padding: '5px 10px', borderRadius: 8, fontSize: 11, fontWeight: 600,
                  border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4,
                  background: filterExigeChave === true ? 'var(--primary)' : 'var(--surface)',
                  color: filterExigeChave === true ? '#fff' : 'var(--text-2)',
                  outline: filterExigeChave === true ? 'none' : '1px solid var(--border)',
                }}
              >
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none">
                  <circle cx="8" cy="15" r="4" stroke="currentColor" strokeWidth="2"/>
                  <path d="M12 11l6-6M16 6l2 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
                Exige chave
              </button>
            </div>
          </div>

          {/* Date filter */}
          <div>
            <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 5 }}>
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

      {/* ── Results list ── */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '12px 18px 18px' }}>
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[1,2,3].map((i) => <Skeleton key={i} height={72}/>)}
          </div>
        ) : filtered.length === 0 ? (
          <div style={{
            padding: '32px 16px', textAlign: 'center',
            border: '1.5px dashed var(--border)', borderRadius: 12,
          }}>
            <div style={{ fontSize: 28, marginBottom: 8 }}>🗓️</div>
            <p style={{ fontSize: 13, color: 'var(--text-2)', fontWeight: 500 }}>Nenhum agendamento</p>
            <p style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 4 }}>
              Ajuste os filtros para ver outros resultados.
            </p>
          </div>
        ) : (
          Object.entries(grouped).map(([date, items]) => (
            <div key={date} style={{ marginBottom: 16 }}>
              {/* Date divider */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8,
              }}>
                <span style={{
                  fontSize: 11, fontWeight: 700, color: 'var(--primary)',
                  fontFamily: 'var(--f-head)', whiteSpace: 'nowrap',
                  textTransform: 'capitalize',
                }}>
                  {date === today ? '🔵 Hoje' : fmtDate(date)}
                </span>
                <div style={{ flex: 1, height: 1, background: 'var(--border)' }}/>
                <span style={{
                  fontSize: 10, color: 'var(--text-3)', fontWeight: 600,
                  background: 'var(--surface)', padding: '1px 7px', borderRadius: 999,
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

// ── Main component ────────────────────────────────────────────
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
    <div className="animate-fadeIn" style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: 24, alignItems: 'start' }}>

      {/* ── LEFT: Portaria (hoje) ── */}
      <div>
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontFamily: 'var(--f-head)', fontWeight: 700, fontSize: 28, color: 'var(--text)', margin: 0 }}>
            Olá, {user?.nome?.split(' ')[0]}!
          </h1>
          <p className="mx-caption" style={{ marginTop: 4 }}>
            {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' })}
          </p>
        </div>

        {/* Stat row */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
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
        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
            {[1,2,3].map((i) => <Skeleton key={i} height={280}/>)}
          </div>
        ) : agendamentos.length === 0 ? (
          <div className="mx-card" style={{ padding: 48, textAlign: 'center', color: 'var(--text-3)' }}>
            <div style={{ fontSize: 36, marginBottom: 12 }}>🏢</div>
            <p>Nenhuma mentoria agendada para hoje.</p>
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
              <ColumnHeader title="Agendado · aguardando check-in" count={agendados.length} tone="accent"/>
              {agendados.map((ag) => (
                <AgendamentoCard key={ag.id} ag={ag} onAction={handleAction} flashing={flashing === ag.id} checkinLoading={!!checkinLoading[ag.id]}/>
              ))}
              {agendados.length === 0 && <EmptyCol label="Tudo em andamento"/>}
            </div>
            <div>
              <ColumnHeader title="Em andamento · sala ocupada" count={emAndamento.length} tone="green"/>
              {emAndamento.map((ag) => (
                <AgendamentoCard key={ag.id} ag={ag} onAction={handleAction} flashing={false} checkinLoading={!!checkinLoading[ag.id]}/>
              ))}
              {emAndamento.length === 0 && <EmptyCol label="Nenhuma sala em uso"/>}
            </div>
          </div>
        )}
      </div>

      {/* ── RIGHT: Visão de Salas ── */}
      <UpcomingPanel refreshSignal={rightRefresh}/>

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
