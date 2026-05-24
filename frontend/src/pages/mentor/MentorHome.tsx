import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../config/api';
import { Skeleton } from '../../components/ui/Skeleton';

const STATUS_LABEL: Record<string, string> = {
  PENDENTE_GESTOR: 'Pendente',
  AGENDADO:        'Agendado',
  EM_ANDAMENTO:    'Em andamento',
  CONCLUIDO:       'Concluído',
  CANCELADO:       'Cancelado',
};
const STATUS_DOT: Record<string, string> = {
  PENDENTE_GESTOR: '#E0A800',
  AGENDADO:        'var(--primary)',
  EM_ANDAMENTO:    '#2E7D32',
  CONCLUIDO:       '#7bb87b',
  CANCELADO:       '#E64A19',
};
const ACTIVE_STATUSES = ['PENDENTE_GESTOR', 'AGENDADO', 'EM_ANDAMENTO'];

function fmtDate(iso: string) {
  if (!iso) return '';
  const [y, m, d] = iso.split('T')[0].split('-');
  return new Date(Number(y), Number(m) - 1, Number(d))
    .toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' });
}

function todayIso() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

// ── StatCard ──────────────────────────────────────────────────
function StatCard({ label, value, color, bg, icon }: {
  label: string; value: string | number;
  color: string; bg: string; icon: React.ReactNode;
}) {
  return (
    <div style={{
      background: '#fff', border: '1px solid var(--border)',
      borderRadius: 16, padding: '16px 16px 14px',
      display: 'flex', flexDirection: 'column', gap: 10,
    }}>
      <div style={{
        width: 36, height: 36, borderRadius: 10,
        background: bg, display: 'flex', alignItems: 'center',
        justifyContent: 'center', color,
      }}>
        {icon}
      </div>
      <div>
        <div style={{ fontSize: 26, fontWeight: 700, fontFamily: 'var(--f-head)', color, lineHeight: 1 }}>
          {value}
        </div>
        <div style={{ marginTop: 3, fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5, color: 'var(--text-3)' }}>
          {label}
        </div>
      </div>
    </div>
  );
}

// ── MentorCalendar ────────────────────────────────────────────
function MentorCalendar({ agendamentos, loading, isProfessor }: { agendamentos: any[]; loading: boolean; isProfessor: boolean }) {
  const today = todayIso();
  const [calYear,     setCalYear]     = useState(() => new Date().getFullYear());
  const [calMonth,    setCalMonth]    = useState(() => new Date().getMonth());
  const [selectedDay, setSelectedDay] = useState<string | null>(null);

  const byDate = React.useMemo(() => {
    const map: Record<string, any[]> = {};
    agendamentos
      .filter((a) => ACTIVE_STATUSES.includes(a.status))
      .forEach((ag) => {
        const key = (ag.data || '').split('T')[0];
        if (!key) return;
        if (!map[key]) map[key] = [];
        map[key].push(ag);
      });
    return map;
  }, [agendamentos]);

  const prevMonth = () => {
    if (calMonth === 0) { setCalMonth(11); setCalYear((y) => y - 1); }
    else setCalMonth((m) => m - 1);
    setSelectedDay(null);
  };
  const nextMonth = () => {
    if (calMonth === 11) { setCalMonth(0); setCalYear((y) => y + 1); }
    else setCalMonth((m) => m + 1);
    setSelectedDay(null);
  };

  const firstDow    = new Date(calYear, calMonth, 1).getDay(); // 0=Dom
  const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
  const cells: (number | null)[] = Array(firstDow).fill(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);

  const monthLabel = new Date(calYear, calMonth, 1)
    .toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });

  const selectedAgs = selectedDay
    ? [...(byDate[selectedDay] || [])].sort((a, b) =>
        (a.hora_inicio || '').localeCompare(b.hora_inicio || ''))
    : [];

  const navBtnStyle: React.CSSProperties = {
    width: 32, height: 32, borderRadius: 8,
    border: '1px solid var(--border)', background: '#fff',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    cursor: 'pointer', color: 'var(--text-2)',
  };

  const DOW = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <span style={{
          fontFamily: 'var(--f-head)', fontWeight: 700, fontSize: 15,
          color: 'var(--text)', textTransform: 'capitalize',
        }}>
          {monthLabel}
        </span>
        <div style={{ display: 'flex', gap: 6 }}>
          <button onClick={prevMonth} style={navBtnStyle}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
              <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <button onClick={nextMonth} style={navBtnStyle}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
              <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
      </div>

      {/* Grid */}
      <div style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: 16, overflow: 'hidden' }}>
        {/* Weekday labels */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', borderBottom: '1px solid var(--border)' }}>
          {DOW.map((d, i) => (
            <div key={i} style={{
              textAlign: 'center', padding: '9px 0',
              fontSize: 11, fontWeight: 700,
              color: i === 0 ? '#E64A19' : 'var(--text-3)',
              fontFamily: 'var(--f-head)',
            }}>{d}</div>
          ))}
        </div>

        {/* Days */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)' }}>
          {cells.map((day, idx) => {
            if (!day) {
              return <div key={`e-${idx}`} style={{ minHeight: 54, borderTop: idx >= 7 ? '1px solid var(--border)' : 'none' }}/>;
            }
            const iso = `${calYear}-${String(calMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const isToday    = iso === today;
            const isSelected = iso === selectedDay;
            const dayAgs     = byDate[iso] || [];
            const hasAgs     = dayAgs.length > 0;
            const isSunday   = idx % 7 === 0;

            return (
              <button
                key={iso}
                onClick={() => hasAgs && setSelectedDay(isSelected ? null : iso)}
                style={{
                  padding: '7px 4px 8px',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5,
                  cursor: hasAgs ? 'pointer' : 'default',
                  background: isSelected ? 'var(--primary)' : 'transparent',
                  border: 'none',
                  borderTop: idx >= 7 ? '1px solid var(--border)' : 'none',
                  minHeight: 54,
                  transition: 'background 0.12s',
                  outline: 'none',
                }}
              >
                {/* Day number */}
                <span style={{
                  width: 28, height: 28, borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 13, fontWeight: isToday || isSelected ? 700 : 400,
                  background: isToday && !isSelected ? '#ECE9F9' : 'transparent',
                  color: isSelected ? '#fff'
                    : isToday ? 'var(--primary)'
                    : isSunday ? '#E64A19'
                    : 'var(--text)',
                  lineHeight: 1,
                }}>
                  {day}
                </span>

                {/* Status dots */}
                {hasAgs && (
                  <div style={{ display: 'flex', gap: 3, justifyContent: 'center' }}>
                    {dayAgs.slice(0, 3).map((ag: any, i: number) => (
                      <span key={i} style={{
                        width: 5, height: 5, borderRadius: '50%',
                        background: isSelected ? 'rgba(255,255,255,0.75)' : (STATUS_DOT[ag.status] || 'var(--border)'),
                        display: 'inline-block', flexShrink: 0,
                      }}/>
                    ))}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Legenda */}
      <div style={{ display: 'flex', gap: 14, marginTop: 10, flexWrap: 'wrap' }}>
        {[
          { color: STATUS_DOT.PENDENTE_GESTOR, label: 'Pendente' },
          { color: STATUS_DOT.AGENDADO,        label: 'Agendado' },
          { color: STATUS_DOT.EM_ANDAMENTO,    label: 'Em andamento' },
        ].map(({ color, label }) => (
          <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: color, display: 'inline-block', flexShrink: 0 }}/>
            <span style={{ fontSize: 11, color: 'var(--text-3)', fontWeight: 500 }}>{label}</span>
          </div>
        ))}
      </div>

      {/* Cards do dia selecionado */}
      {selectedDay && (
        <div style={{ marginTop: 16 }}>
          <div style={{
            fontFamily: 'var(--f-head)', fontWeight: 700, fontSize: 13,
            color: 'var(--text)', marginBottom: 10, textTransform: 'capitalize',
          }}>
            {fmtDate(selectedDay)}
          </div>
          {selectedAgs.length === 0 ? (
            <p style={{ fontSize: 13, color: 'var(--text-3)', textAlign: 'center' }}>Nenhuma {isProfessor ? 'orientação' : 'mentoria'} ativa neste dia.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {selectedAgs.map((ag: any) => (
                <div key={ag.id} style={{
                  background: '#fff', border: '1px solid var(--border)',
                  borderRadius: 14, padding: '12px 14px',
                  display: 'flex', alignItems: 'center', gap: 12,
                }}>
                  <div style={{
                    width: 10, height: 10, borderRadius: '50%', flexShrink: 0,
                    background: STATUS_DOT[ag.status] || 'var(--border)',
                  }}/>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      fontFamily: 'var(--f-head)', fontWeight: 600, fontSize: 13,
                      color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    }}>
                      {ag.card?.titulo || (isProfessor ? 'Orientação' : 'Mentoria')}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 3 }}>
                      {ag.hora_inicio}–{ag.hora_fim}
                      {ag.ambiente?.nome ? ` · ${ag.ambiente.nome}` : ''}
                      {ag.card?.aluno?.nome ? ` · ${ag.card.aluno.nome}` : ''}
                    </div>
                  </div>
                  <span style={{
                    fontSize: 11, fontWeight: 700, flexShrink: 0,
                    color: STATUS_DOT[ag.status] || 'var(--text-3)',
                  }}>
                    {STATUS_LABEL[ag.status]}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────
export const MentorHome: React.FC = () => {
  const { user } = useAuth();
  const [agendamentos, setAgendamentos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const isProfessor = user?.papel === 'PROFESSOR_MENTOR';

  useEffect(() => {
    api.get('/agendamentos')
      .then((r) => setAgendamentos(r.data))
      .finally(() => setLoading(false));
  }, []);

  const today = todayIso();

  const ativos = agendamentos.filter((a) => ACTIVE_STATUSES.includes(a.status));

  const proximos = agendamentos
    .filter((a) => (a.data || '').split('T')[0] >= today && a.status !== 'CANCELADO')
    .sort((a, b) => {
      const da = (a.data || '').split('T')[0];
      const db = (b.data || '').split('T')[0];
      return da.localeCompare(db) || (a.hora_inicio || '').localeCompare(b.hora_inicio || '');
    })
    .slice(0, 3);

  const horas     = Number(user?.horas_complementares || 0);
  const firstName = user?.nome?.split(' ')[0] ?? '';

  return (
    <div className="animate-fadeIn" style={{ maxWidth: 560, margin: '0 auto' }}>

      {/* Saudação */}
      <div style={{ marginBottom: 22 }}>
        <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: 0.8, margin: '0 0 4px' }}>
          {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' })}
        </p>
        <h1 style={{ fontFamily: 'var(--f-head)', fontWeight: 700, fontSize: 26, color: 'var(--text)', margin: 0, letterSpacing: -0.5 }}>
          Olá, {firstName}!
        </h1>
        <p style={{ fontSize: 13, color: 'var(--text-3)', marginTop: 4 }}>
          {isProfessor ? 'Painel do orientador' : 'Painel do mentor'}
        </p>
      </div>

      {/* Stats */}
      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 24 }}>
          {[1, 2, 3].map((i) => <Skeleton key={i} height={96}/>)}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 24 }}>
          <StatCard
            label="Horas"
            value={`${horas.toFixed(1)}h`}
            color="var(--primary)"
            bg="#ECE9F9"
            icon={
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8"/>
                <path d="M12 7v5l3 2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
              </svg>
            }
          />
          <StatCard
            label="Ativas"
            value={ativos.length}
            color="#2E7D32"
            bg="#E8F5E9"
            icon={
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M5 12l5 5L20 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            }
          />
          <StatCard
            label="Total"
            value={agendamentos.length}
            color="#7A5B00"
            bg="#FFF7E0"
            icon={
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <rect x="3" y="4" width="18" height="18" rx="3" stroke="currentColor" strokeWidth="1.8" fill="none"/>
                <path d="M3 9h18M8 2v4M16 2v4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
              </svg>
            }
          />
        </div>
      )}

      {/* Próximas mentorias / orientações */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontFamily: 'var(--f-head)', fontWeight: 700, fontSize: 15, color: 'var(--text)', marginBottom: 12 }}>
          {isProfessor ? 'Próximas orientações' : 'Próximas mentorias'}
        </div>

        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[1, 2].map((i) => <Skeleton key={i} height={68}/>)}
          </div>
        ) : proximos.length === 0 ? (
          <div style={{
            padding: '28px 20px', textAlign: 'center',
            border: '1.5px dashed var(--border)', borderRadius: 14, background: '#fff',
          }}>
            <p style={{ fontSize: 13, color: 'var(--text-3)', margin: 0 }}>Nenhuma {isProfessor ? 'orientação' : 'mentoria'} agendada</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {proximos.map((ag) => (
              <div key={ag.id} style={{
                background: '#fff', border: '1px solid var(--border)',
                borderRadius: 14, padding: '12px 14px',
                display: 'flex', alignItems: 'center', gap: 12,
              }}>
                <div style={{
                  width: 40, height: 40, borderRadius: 10, flexShrink: 0,
                  background: '#ECE9F9',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <rect x="3" y="4" width="18" height="18" rx="3" stroke="var(--primary)" strokeWidth="1.8" fill="none"/>
                    <path d="M3 9h18M8 2v4M16 2v4" stroke="var(--primary)" strokeWidth="1.8" strokeLinecap="round"/>
                  </svg>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontFamily: 'var(--f-head)', fontWeight: 600, fontSize: 13,
                    color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  }}>
                    {ag.card?.titulo || (isProfessor ? 'Orientação' : 'Mentoria')}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 2 }}>
                    {fmtDate(ag.data)} · {ag.hora_inicio}–{ag.hora_fim}
                    {ag.ambiente?.nome ? ` · ${ag.ambiente.nome}` : ''}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5, flexShrink: 0 }}>
                  <span style={{
                    width: 7, height: 7, borderRadius: '50%',
                    background: STATUS_DOT[ag.status] || 'var(--border)',
                    display: 'inline-block',
                  }}/>
                  <span style={{ fontSize: 11, color: 'var(--text-3)', fontWeight: 600 }}>
                    {STATUS_LABEL[ag.status] || ag.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Calendário */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontFamily: 'var(--f-head)', fontWeight: 700, fontSize: 15, color: 'var(--text)', marginBottom: 14 }}>
          {isProfessor ? 'Calendário de orientações' : 'Calendário de mentorias'}
        </div>
        {loading ? (
          <Skeleton height={260}/>
        ) : (
          <MentorCalendar agendamentos={agendamentos} loading={loading} isProfessor={isProfessor}/>
        )}
      </div>

      {/* Aviso de suspensão */}
      {user?.suspenso_ate && new Date(user.suspenso_ate) > new Date() && (
        <div style={{
          marginTop: 4, padding: '14px 16px',
          background: '#FBE9E7', border: '1px solid #FFCCBC',
          borderRadius: 14, display: 'flex', gap: 10, alignItems: 'flex-start',
        }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0, marginTop: 1 }}>
            <path d="M12 2L2 22h20L12 2z" stroke="#E64A19" strokeWidth="1.8" strokeLinejoin="round"/>
            <path d="M12 9v6M12 18v.5" stroke="#E64A19" strokeWidth="1.8" strokeLinecap="round"/>
          </svg>
          <div>
            <div style={{ fontWeight: 700, fontSize: 13, color: '#BF360C' }}>Conta suspensa</div>
            <div style={{ fontSize: 12, color: '#E64A19', marginTop: 2 }}>
              Suspensa até {new Date(user.suspenso_ate).toLocaleDateString('pt-BR')}.
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
