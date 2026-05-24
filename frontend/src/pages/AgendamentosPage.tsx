import React, { useEffect, useState } from 'react';
import api from '../config/api';
import { StatusPill, Avatar, CheckInOutCard, WhatsAppButton } from '../components/ui/DesignSystem';
import { Skeleton } from '../components/ui/Skeleton';
import { useAuth } from '../contexts/AuthContext';

function initials(name: string) {
  return name?.split(' ').map((p: string) => p[0]).slice(0, 2).join('').toUpperCase() || '?';
}

// ── View toggle ───────────────────────────────────────────────
function ViewToggle({ view, onChange }: { view: string; onChange: (v: string) => void }) {
  return (
    <div style={{ display: 'flex', gap: 4, padding: 4, borderRadius: 12, background: 'var(--surface)', width: 'fit-content', marginBottom: 20 }}>
      {['Lista', 'Calend\u00e1rio'].map((label) => {
        const id = label.toLowerCase().replace('\u00e1', 'a');
        const a = view === id;
        return (
          <button key={id} onClick={() => onChange(id)} style={{
            padding: '8px 18px', borderRadius: 9, border: 0, cursor: 'pointer',
            background: a ? '#fff' : 'transparent',
            color: a ? 'var(--text)' : 'var(--text-2)',
            fontFamily: 'var(--f-body)', fontSize: 12, fontWeight: 600,
            boxShadow: a ? '0 1px 2px rgba(0,0,0,0.06)' : 'none',
          }}>{label}</button>
        );
      })}
    </div>
  );
}

// ── Status stripe color ───────────────────────────────────────
function stripeColor(status: string) {
  if (status === 'EM_ANDAMENTO') return 'var(--secondary)';
  if (status === 'AGENDADO') return 'var(--accent)';
  if (status === 'PENDENTE_GESTOR') return '#E0A800';
  if (status === 'CONCLUIDO') return 'var(--secondary)';
  if (status === 'CANCELADO') return 'var(--accent-dark)';
  return 'var(--primary)';
}

// ── Calendar grid (week view) ─────────────────────────────────
const DAYS = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex'];
const HOURS_CAL = Array.from({ length: 13 }, (_, i) => 8 + i);
const ROW_H = 44;

function statusCalColor(status: string) {
  if (status === 'EM_ANDAMENTO')    return 'linear-gradient(135deg,#2E7D32,#1B5E20)';
  if (status === 'AGENDADO')        return 'linear-gradient(135deg,#E64A19,#BF360C)';
  if (status === 'PENDENTE_GESTOR') return 'linear-gradient(135deg,#E8B33A,#A37800)';
  if (status === 'CONCLUIDO')       return 'linear-gradient(135deg,rgba(46,125,50,0.6),rgba(27,94,32,0.6))';
  return 'linear-gradient(135deg,#5D46B8,#3A2885)';
}

function dayIndex(data: string) {
  if (!data) return -1;
  const [year, month, day] = data.split('-').map(Number);
  const d = new Date(year, month - 1, day);
  const map: Record<number, number> = { 1: 0, 2: 1, 3: 2, 4: 3, 5: 4 };
  return map[d.getDay()] ?? -1;
}

function formatData(data: string): string {
  if (!data) return '';
  const [year, month, day] = data.split('-').map(Number);
  const d = new Date(year, month - 1, day);
  return d.toLocaleDateString('pt-BR', { weekday: 'short', day: 'numeric', month: 'short' }).replace('.', '');
}

function CalendarView({ items }: { items: any[] }) {
  const today = new Date().getDay(); // 0=sun..6=sat, mon=1..fri=5
  const todayIdx = today >= 1 && today <= 5 ? today - 1 : -1;

  return (
    <div style={{ background: '#fff', borderRadius: 18, padding: '16px', overflowX: 'auto' }}>
      {/* Header */}
      <div style={{ display: 'grid', gridTemplateColumns: '46px repeat(5, 1fr)', marginBottom: 4 }}>
        <div/>
        {DAYS.map((d, i) => (
          <div key={d} style={{ textAlign: 'center', padding: '6px 0' }}>
            <div style={{
              fontFamily: 'var(--f-body)', fontSize: 10, fontWeight: 600,
              color: i === todayIdx ? 'var(--primary)' : 'var(--text-3)', letterSpacing: 0.6,
            }}>{d.toUpperCase()}</div>
          </div>
        ))}
      </div>

      {/* Grid */}
      <div style={{ position: 'relative' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '46px repeat(5, 1fr)' }}>
          {HOURS_CAL.map((h) => (
            <React.Fragment key={h}>
              <div style={{
                fontFamily: 'monospace', fontSize: 9.5, color: 'var(--text-3)',
                textAlign: 'right', paddingRight: 6, height: ROW_H,
                lineHeight: '12px', borderTop: '1px solid transparent',
              }}>{h}h</div>
              {DAYS.map((_, i) => (
                <div key={i} style={{
                  height: ROW_H,
                  borderTop: '1px solid #EFEFF3',
                  background: i === todayIdx ? 'rgba(93,70,184,0.03)' : 'transparent',
                }}/>
              ))}
            </React.Fragment>
          ))}
        </div>

        {/* Event blocks */}
        <div style={{ position: 'absolute', top: 0, left: 46, right: 0, bottom: 0, pointerEvents: 'none' }}>
          {items.map((ag) => {
            const col = dayIndex(ag.data);
            if (col < 0) return null;
            const startH = parseInt(ag.hora_inicio?.split(':')[0] ?? '8', 10);
            const endH   = parseInt(ag.hora_fim?.split(':')[0] ?? '9', 10);
            const dur = Math.max(1, endH - startH);
            const startRow = startH - 8;
            const title = ag.card?.titulo || 'Orientação';
            const init  = initials(ag.card?.aluno?.nome || ag.mentor?.nome || '?');
            const isDone = ag.status === 'CONCLUIDO';

            return (
              <div key={ag.id} style={{
                pointerEvents: 'auto',
                position: 'absolute',
                top: startRow * ROW_H + 2,
                height: dur * ROW_H - 4,
                left: `calc((100%) * ${col} / 5 + 2px)`,
                width: `calc(100% / 5 - 4px)`,
                borderRadius: 8, padding: '6px 7px',
                background: statusCalColor(ag.status), color: '#fff',
                overflow: 'hidden', cursor: 'default',
                opacity: isDone ? 0.75 : 1,
                boxShadow: isDone ? 'none' : '0 2px 6px rgba(0,0,0,0.10)',
                display: 'flex', flexDirection: 'column', gap: 2,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <div style={{
                    width: 16, height: 16, borderRadius: '50%',
                    background: 'rgba(255,255,255,0.25)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 7, fontWeight: 700, flexShrink: 0,
                  }}>{init}</div>
                  <span style={{ fontSize: 9.5, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {title}
                  </span>
                </div>
                {dur >= 1 && (
                  <span style={{ fontSize: 9, opacity: 0.85 }}>
                    {ag.hora_inicio?.slice(0,5)}–{ag.hora_fim?.slice(0,5)}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div style={{ marginTop: 16, display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {[
          { color: 'linear-gradient(135deg,#2E7D32,#1B5E20)', label: 'Em andamento' },
          { color: 'linear-gradient(135deg,#E64A19,#BF360C)', label: 'Agendado' },
          { color: 'linear-gradient(135deg,#E8B33A,#A37800)', label: 'Pendente gestor' },
          { color: 'linear-gradient(135deg,rgba(46,125,50,0.6),rgba(27,94,32,0.6))', label: 'Concluído' },
        ].map((l) => (
          <span key={l.label} style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '4px 10px 4px 6px', borderRadius: 999,
            background: '#fff', border: '1px solid var(--border)',
            fontFamily: 'var(--f-body)', fontSize: 11, color: 'var(--text-2)',
          }}>
            <span style={{ width: 14, height: 14, borderRadius: 4, background: l.color, display: 'inline-block' }}/>
            {l.label}
          </span>
        ))}
      </div>
    </div>
  );
}

// ── List item ─────────────────────────────────────────────────
function AgItem({ ag, onCancel, isMentor, isProfessor }: { ag: any; onCancel: (id: number) => void; isMentor: boolean; isProfessor: boolean }) {
  const isLive = ag.status === 'EM_ANDAMENTO';
  const isAg   = ag.status === 'AGENDADO';
  const isDone = ag.status === 'CONCLUIDO';

  const title = ag.card?.titulo || ('Orienta\u00e7\u00e3o');
  const otherPerson = isMentor ? ag.card?.aluno : ag.mentor;
  const otherName   = otherPerson?.nome || '—';
  const role        = isMentor ? 'Aluno' : (otherPerson?.papel === 'PROFESSOR_MENTOR' ? 'Orientador' : 'Mentor');

  const checkinData = {
    status: ag.status,
    sala: ag.ambiente?.nome,
    when: `${formatData(ag.data)} \u00b7 ${ag.hora_inicio?.slice(0,5)}\u2013${ag.hora_fim?.slice(0,5)}`,
    duracao: ag.duracao_horas ? `${ag.duracao_horas}h` : undefined,
    checkinAt: ag.checkin_em ? ag.hora_inicio?.slice(0,5) : undefined,
    checkoutAt: ag.checkout_em ? ag.hora_fim?.slice(0,5) : undefined,
    checkinPrev: ag.hora_inicio?.slice(0,5),
    checkoutPrev: ag.hora_fim?.slice(0,5),
    elapsed: isLive ? 'em curso' : undefined,
  };

  return (
    <div className="mx-card" style={{
      overflow: 'hidden', marginBottom: 10,
      border: isLive ? '1.5px solid var(--secondary)' : '1px solid transparent',
    }}>
      <div style={{ display: 'flex' }}>
        <div style={{ flex: 1, padding: 14 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 10 }}>
            <Avatar initials={initials(otherName)} size={40}/>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="mx-caption" style={{ marginBottom: 1, fontSize: 11 }}>{role}: {otherName}</div>
              <div style={{ fontFamily: 'var(--f-head)', fontWeight: 700, fontSize: 15, lineHeight: 1.2 }}>{title}</div>
            </div>
            <StatusPill status={ag.status} size="sm" pulse={isLive}/>
          </div>

          {(isLive || isAg || isDone) && <CheckInOutCard c={checkinData}/>}

          {ag.status === 'PENDENTE_GESTOR' && (
            <div style={{
              padding: '10px 12px', borderRadius: 10, marginTop: 4,
              background: '#FFF7E0', color: '#7A5B00',
              fontSize: 12, lineHeight: 1.45,
              display: 'flex', alignItems: 'center', gap: 8,
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="9" stroke="#E0A800" strokeWidth="2"/>
                <path d="M12 7v5l3 2" stroke="#E0A800" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              {'Aguardando gestor enviar instru\u00e7\u00f5es de sala.'}
            </div>
          )}

          {ag.instrucoes_gestor && (
            <div style={{
              marginTop: 10, padding: '8px 10px', borderRadius: 10,
              background: 'var(--primary-light)', color: 'var(--primary-dark)',
              fontSize: 12, lineHeight: 1.4,
              display: 'flex', alignItems: 'flex-start', gap: 6,
            }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" style={{ marginTop: 2, flexShrink: 0 }}>
                <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2"/>
                <path d="M12 8v5M12 16v.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              <span>{ag.instrucoes_gestor}</span>
            </div>
          )}

          {isAg && otherPerson?.telefone && (
            <div style={{ marginTop: 10 }}>
              <WhatsAppButton phone={otherPerson.telefone} name={otherName}/>
            </div>
          )}

          {['PENDENTE_GESTOR', 'AGENDADO'].includes(ag.status) && (
            <button onClick={() => onCancel(ag.id)} style={{
              marginTop: 10, padding: '8px 14px', borderRadius: 10,
              border: '1px solid var(--border)', background: '#fff', cursor: 'pointer',
              fontFamily: 'var(--f-body)', fontSize: 12, color: 'var(--accent)',
            }}>
              Cancelar
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────
export const AgendamentosPage: React.FC = () => {
  const { user } = useAuth();
  const [agendamentos, setAgendamentos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('lista');
  const [canceladosOpen, setCanceladosOpen] = useState(false);

  const isMentor = ['ALUNO_MENTOR', 'PROFESSOR_MENTOR'].includes(user?.papel ?? '');
  const isProfessor = user?.papel === 'PROFESSOR_MENTOR';
  const pageLabel = isProfessor ? 'Orientador' : isMentor ? 'Mentor' : 'Aluno';
  const pageSection = isProfessor ? 'Orienta\u00e7\u00f5es' : 'Mentorias';
  const pageTitle = isProfessor ? 'Suas orienta\u00e7\u00f5es' : 'Suas mentorias';
  const nextTitle = isProfessor ? 'Pr\u00f3xima orienta\u00e7\u00e3o' : 'Pr\u00f3xima mentoria';
  const nextItemTitle = isProfessor ? 'Orienta\u00e7\u00e3o' : 'Mentoria';

  const load = () => api.get('/agendamentos').then((r) => setAgendamentos(r.data)).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const cancelar = async (id: number) => {
    if (!confirm('Cancelar este agendamento?')) return;
    try {
      await api.patch(`/agendamentos/${id}/cancelar`);
      load();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Erro ao cancelar.');
    }
  };

  const live      = agendamentos.filter((a) => a.status === 'EM_ANDAMENTO');
  const agendados = agendamentos.filter((a) => ['AGENDADO', 'PENDENTE_GESTOR'].includes(a.status));
  // Aluno consulta o histórico em /aluno/historico; mentores e gestor ainda veem aqui
  const hist      = isMentor
    ? agendamentos.filter((a) => a.status === 'CONCLUIDO')
    : [];
  const cancelados = isMentor
    ? [...agendamentos.filter((a) => a.status === 'CANCELADO')]
        .sort((a, b) => new Date(b.data || 0).getTime() - new Date(a.data || 0).getTime())
    : [];

  const nextSession = live[0] || agendados[0];

  return (
    <div className="animate-fadeIn" style={{ maxWidth: 820 }}>
      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <p className="mx-caption" style={{
          fontSize: 10, fontWeight: 700, letterSpacing: 1,
          textTransform: 'uppercase', color: 'var(--primary)', marginBottom: 4,
        }}>{pageLabel + ' \u00b7 ' + pageSection}</p>
        <h1 className="mx-h1" style={{ fontSize: 26 }}>{pageTitle}</h1>
        <p className="mx-caption" style={{ marginTop: 4 }}>
          {agendamentos.filter((a) => !['CONCLUIDO', 'CANCELADO'].includes(a.status)).length} ativa(s) esta semana
        </p>
      </div>

      {loading && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[1,2,3].map((i) => <Skeleton key={i} height={140}/>)}
        </div>
      )}

      {!loading && (
        <>
          {/* Next session reminder */}
          {nextSession && live.length === 0 && (
            <div style={{
              borderRadius: 14, padding: '12px 14px', marginBottom: 18,
              background: 'var(--accent-light)', border: '1.5px solid var(--accent)',
              display: 'flex', alignItems: 'center', gap: 10,
            }}>
              <div style={{
                width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                background: 'var(--accent)', color: '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(230,74,25,0.30)',
              }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path d="M6 9a6 6 0 1 1 12 0c0 4 2 5 2 7H4c0-2 2-3 2-7zM10 19a2 2 0 0 0 4 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 0.6, textTransform: 'uppercase', color: 'var(--accent-dark)', marginBottom: 2 }}>{nextTitle}</div>
                <div style={{ fontFamily: 'var(--f-head)', fontWeight: 700, fontSize: 14, color: 'var(--text)' }}>
                  {nextSession.card?.titulo || nextItemTitle} {'\u00b7'} {formatData(nextSession.data)} {nextSession.hora_inicio?.slice(0,5)}
                </div>
              </div>
            </div>
          )}

          <ViewToggle view={view} onChange={setView}/>

          {view === 'calendario' ? (
            <CalendarView items={agendamentos.filter((a) => a.status !== 'CANCELADO')}/>
          ) : (
            <>
              {agendamentos.length === 0 && (
                <div className="mx-card" style={{ padding: 48, textAlign: 'center', color: 'var(--text-3)' }}>
                  <div style={{ fontSize: 36, marginBottom: 12 }}>📅</div>
                  <p>Nenhum agendamento encontrado.</p>
                </div>
              )}

              {live.length > 0 && (
                <div style={{ marginBottom: 12 }}>
                  <p className="mx-caption" style={{ padding: '0 0 6px', fontSize: 10, fontWeight: 600, letterSpacing: 0.5, textTransform: 'uppercase', color: 'var(--text-3)' }}>
                    Em andamento · {live.length}
                  </p>
                  {live.map((ag) => <AgItem key={ag.id} ag={ag} onCancel={cancelar} isMentor={isMentor} isProfessor={isProfessor}/>)}
                </div>
              )}

              {agendados.length > 0 && (
                <div style={{ marginBottom: 12 }}>
                  <p className="mx-caption" style={{ padding: '0 0 6px', fontSize: 10, fontWeight: 600, letterSpacing: 0.5, textTransform: 'uppercase', color: 'var(--text-3)' }}>
                    Agendado · {agendados.length}
                  </p>
                  {agendados.map((ag) => <AgItem key={ag.id} ag={ag} onCancel={cancelar} isMentor={isMentor} isProfessor={isProfessor}/>)}
                </div>
              )}

              {hist.length > 0 && (
                <div style={{ marginBottom: 12 }}>
                  <p className="mx-caption" style={{ padding: '0 0 6px', fontSize: 10, fontWeight: 600, letterSpacing: 0.5, textTransform: 'uppercase', color: 'var(--text-3)' }}>
                    {'Hist\u00f3rico \u00b7 '}{hist.length}
                  </p>
                  {hist.map((ag) => <AgItem key={ag.id} ag={ag} onCancel={cancelar} isMentor={isMentor} isProfessor={isProfessor}/>)}
                </div>
              )}

              {cancelados.length > 0 && (
                <div style={{ marginTop: 4 }}>
                  <button
                    type="button"
                    onClick={() => setCanceladosOpen((o) => !o)}
                    style={{
                      width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '8px 0 8px', background: 'none', border: 'none', cursor: 'pointer',
                      borderTop: '1px solid var(--border)',
                    }}
                  >
                    <p className="mx-caption" style={{ fontSize: 10, fontWeight: 600, letterSpacing: 0.5, textTransform: 'uppercase', color: 'var(--accent-dark)', margin: 0 }}>
                      Cancelados \u00b7 {cancelados.length}
                    </p>
                    <svg
                      width="14" height="14" viewBox="0 0 24 24" fill="none"
                      style={{ transform: canceladosOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', flexShrink: 0 }}
                    >
                      <path d="M6 9l6 6 6-6" stroke="var(--accent-dark)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>

                  {canceladosOpen && (
                    <div style={{ marginTop: 6 }}>
                      {cancelados.map((ag) => (
                        <AgItem key={ag.id} ag={ag} onCancel={cancelar} isMentor={isMentor} isProfessor={isProfessor}/>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
};
