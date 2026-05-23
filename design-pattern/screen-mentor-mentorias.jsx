// screen-mentor-mentorias.jsx — Mentor: Minhas mentorias (visão de calendário semanal)

const MENTOR_MENTORIAS = [
{ id: 'mm1', day: 1, h: 14, dur: 1, name: 'Marina R.', avatar: 'MR', topic: 'Postgres', status: 'AGENDADO',
  bg: 'linear-gradient(135deg,#e64a19,#bf360c)' },
{ id: 'mm2', day: 1, h: 16, dur: 1, name: 'Joana M.', avatar: 'JM', topic: 'Pandas', status: 'EM_ANDAMENTO',
  bg: 'linear-gradient(135deg,#7a5fd0,#4a35a0)' },
{ id: 'mm3', day: 2, h: 10, dur: 1, name: 'Lucas P.', avatar: 'LP', topic: 'React', status: 'AGENDADO',
  bg: 'linear-gradient(135deg,#4a78d6,#2854b4)' },
{ id: 'mm4', day: 3, h: 9, dur: 2, name: 'Camila I.', avatar: 'CI', topic: 'Modelagem DB', status: 'PENDENTE_GESTOR',
  bg: 'linear-gradient(135deg,#8a6fe0,#5c3fc0)' },
{ id: 'mm5', day: 3, h: 15, dur: 1, name: 'Marina R.', avatar: 'MR', topic: 'Indexação', status: 'AGENDADO',
  bg: 'linear-gradient(135deg,#e64a19,#bf360c)' },
{ id: 'mm6', day: 4, h: 14, dur: 1, name: 'Henrique B.', avatar: 'HB', topic: 'CI/CD', status: 'AGENDADO',
  bg: 'linear-gradient(135deg,#506fc7,#2e4ea0)' }];


const WEEK_DAYS = [
{ id: 1, short: 'SEG', date: '26' },
{ id: 2, short: 'TER', date: '27' },
{ id: 3, short: 'QUA', date: '28' },
{ id: 4, short: 'QUI', date: '29' },
{ id: 5, short: 'SEX', date: '30' }];


const HOURS_CAL = Array.from({ length: 13 }, (_, i) => 8 + i); // 8..20

function MentorMentoriasHeader({ today = 28 }) {
  return (
    <div style={{ padding: '12px 20px 10px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <MxLogo size={20} />
          <span style={{ fontFamily: 'var(--f-head)', fontWeight: 700, fontSize: 16, letterSpacing: -0.2, color: 'var(--primary-dark)' }}>
            mentorix
          </span>
          <span style={{
            fontSize: 9, fontWeight: 700, letterSpacing: 0.6, textTransform: 'uppercase',
            color: 'var(--primary-dark)', background: 'var(--primary-light)',
            padding: '2px 6px', borderRadius: 6
          }}>Mentor</span>
        </div>
        <button style={{
          width: 32, height: 32, borderRadius: 10, border: '1px solid var(--border)',
          background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer'
        }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <path d="M12 5v14M5 12h14" stroke="var(--text)" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>
      </div>
      <h1 className="mx-h1" style={{ fontSize: 22 }}>Suas mentorias</h1>
      <p className="mx-caption" style={{ marginTop: 2 }}>Semana de 26 a 30 de maio · 6 marcadas</p>
    </div>);

}

function WeekHeader({ today = 3 }) {
  return (
    <div style={{
      display: 'grid', gridTemplateColumns: '38px repeat(5, 1fr)',
      padding: '0 12px', marginBottom: 6
    }}>
      <div />
      {WEEK_DAYS.map((d) => {
        const isToday = d.id === today;
        return (
          <div key={d.id} style={{
            textAlign: 'center', padding: '8px 0'
          }}>
            <div style={{
              fontFamily: 'var(--f-body)', fontSize: 10, fontWeight: 600,
              color: isToday ? 'var(--primary)' : 'var(--text-3)',
              letterSpacing: 0.6
            }}>{d.short}</div>
            <div style={{
              fontFamily: 'var(--f-head)', fontWeight: 700, fontSize: 18, marginTop: 2,
              color: isToday ? '#fff' : 'var(--text)',
              width: 28, height: 28, lineHeight: '28px', margin: '2px auto 0',
              borderRadius: '50%',
              background: isToday ? 'var(--primary)' : 'transparent'
            }}>{d.date}</div>
          </div>);

      })}
    </div>);

}

function statusToCalColor(status) {
  if (status === 'EM_ANDAMENTO') return { bg: 'linear-gradient(135deg,#2E7D32,#1B5E20)', text: '#fff', soft: 'rgba(46,125,50,0.18)' };
  if (status === 'AGENDADO') return { bg: 'linear-gradient(135deg,#E64A19,#BF360C)', text: '#fff', soft: 'rgba(230,74,25,0.18)' };
  if (status === 'PENDENTE_GESTOR') return { bg: 'linear-gradient(135deg,#E8B33A,#A37800)', text: '#fff', soft: 'rgba(224,168,0,0.20)' };
  return { bg: 'linear-gradient(135deg,#5D46B8,#3A2885)', text: '#fff', soft: 'rgba(93,70,184,0.18)' };
}

function CalendarGrid({ items, onPick, today = 3 }) {
  const rowH = 42;
  return (
    <div style={{ position: 'relative', padding: '0 12px' }}>
      <div style={{
        display: 'grid', gridTemplateColumns: '38px repeat(5, 1fr)',
        position: 'relative'
      }}>
        {/* hour gutter + day columns */}
        {HOURS_CAL.map((h) =>
        <React.Fragment key={h}>
            <div style={{
            fontFamily: 'JetBrains Mono, monospace', fontSize: 9.5, color: 'var(--text-3)',
            textAlign: 'right', paddingRight: 6, paddingTop: 0,
            height: rowH, lineHeight: '12px',
            borderTop: '1px solid transparent'
          }}>{h}h</div>
            {WEEK_DAYS.map((d) =>
          <div key={`${h}-${d.id}`} style={{
            height: rowH,
            borderTop: '1px solid #EFEFF3',
            borderLeft: d.id !== 1 ? 'none' : '1px solid #EFEFF3',
            background: d.id === today ? 'rgba(93,70,184,0.03)' : 'transparent'
          }} />
          )}
          </React.Fragment>
        )}
      </div>

      {/* Mentoria blocks positioned absolute */}
      <div style={{ position: 'absolute', top: 0, left: 12, right: 12, bottom: 0, pointerEvents: 'none' }}>
        {items.map((m) => {
          const col = WEEK_DAYS.findIndex((d) => d.id === m.day);
          const startRow = m.h - 8;
          const c = statusToCalColor(m.status);
          // Grid uses 38px gutter + 5 equal columns. Compute via percent: gutter=38, rest split among 5.
          // Use calc styling instead.
          return (
            <button key={m.id} onClick={() => onPick && onPick(m)} style={{
              pointerEvents: 'auto',
              position: 'absolute',
              top: startRow * rowH + 2,
              height: m.dur * rowH - 4,
              left: `calc(38px + (100% - 38px) * ${col} / 5 + 2px)`,
              width: `calc((100% - 38px) / 5 - 4px)`,
              border: 0, padding: '6px 7px', cursor: 'pointer',
              borderRadius: 8,
              background: c.bg, color: c.text, textAlign: 'left',
              boxShadow: '0 2px 6px rgba(0,0,0,0.10)',
              overflow: 'hidden',
              display: 'flex', flexDirection: 'column', gap: 2
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <div style={{
                  width: 16, height: 16, borderRadius: '50%',
                  background: 'rgba(255,255,255,0.25)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 8, fontWeight: 700, color: '#fff', flexShrink: 0
                }}>{m.avatar}</div>
                <span style={{
                  fontFamily: 'var(--f-body)', fontSize: 9.5, fontWeight: 600,
                  whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'
                }}>{m.name.split(' ')[0]}</span>
              </div>
              {m.dur >= 1 &&
              <span style={{ fontSize: 9, opacity: 0.85, lineHeight: 1.2 }}>
                  {m.topic}
                </span>
              }
              {m.status === 'EM_ANDAMENTO' &&
              <span style={{
                position: 'absolute', top: 4, right: 4,
                width: 6, height: 6, borderRadius: '50%', background: '#fff',
                animation: 'mxPulseDot 1.4s infinite'
              }} />
              }
            </button>);

        })}

        {/* now-line at 16h on day 3 (quarta) */}
        <div style={{
          position: 'absolute',
          top: (16 - 8) * rowH + 12,
          left: 38,
          right: 0,
          pointerEvents: 'none'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent)' }} />
            <div style={{ flex: 1, height: 1.5, background: 'var(--accent)' }} />
          </div>
        </div>
      </div>
      <style>{`@keyframes mxPulseDot { 0%,100%{opacity:1;} 50%{opacity:0.3;} }`}</style>
    </div>);

}

function NextSessionReminder({ items }) {
  // Notificação de lembrete: só aparece se NENHUMA mentoria está em andamento.
  // Se houver EM_ANDAMENTO, o mentor já está com o foco lá — não notificamos nada.
  const hasLive = items.some((m) => m.status === 'EM_ANDAMENTO');
  if (hasLive) return null;
  const next = items.find((m) => m.status === 'AGENDADO');
  if (!next) return null;
  return (
    <div style={{
      margin: '0 20px 14px',
      borderRadius: 14, padding: '12px 14px',
      background: 'var(--accent-light)',
      border: '1.5px solid var(--accent)',
      display: 'flex', alignItems: 'center', gap: 10,
      position: 'relative'
    }}>
      <div style={{
        width: 36, height: 36, borderRadius: 10, flexShrink: 0,
        background: 'var(--accent)', color: '#fff',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: '0 4px 12px rgba(230,74,25,0.30)'
      }}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <path d="M6 9a6 6 0 1 1 12 0c0 4 2 5 2 7H4c0-2 2-3 2-7zM10 19a2 2 0 0 0 4 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: 10, fontWeight: 700, letterSpacing: 0.6, textTransform: 'uppercase',
          color: 'var(--accent-dark)', marginBottom: 2
        }}>Lembrete · próxima mentoria em 47 min</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Avatar initials={next.avatar} color={next.bg} size={22} />
          <span style={{ fontFamily: 'var(--f-head)', fontWeight: 700, fontSize: 14, color: 'var(--text)' }}>
            {next.name}
          </span>
          <span className="mx-caption" style={{ fontSize: 11 }}>· {next.topic}</span>
        </div>
      </div>
    </div>);

}

function MentorMentoriasScreen({ onTab, view: viewProp }) {
  const [view, setView] = React.useState(viewProp || 'calendario');
  return (
    <PhoneScreen
      screenLabel={`M03 Mentor · Mentorias (${view === 'calendario' ? 'calendário' : 'lista'})`}
      tab="mentorias" onTab={onTab}
      tabs={[
      { id: 'mapa', label: 'Descobrir' },
      { id: 'mentorias', label: 'Mentorias' },
      { id: 'horas', label: 'Horas' },
      { id: 'perfil', label: 'Perfil' }]
      }
      header={<>
        <MentorMentoriasHeader />
        <ViewToggle view={view} onChange={setView} />
      </>}>
      
      <NextSessionReminder items={MENTOR_MENTORIAS} />
      {view === 'calendario' ?
      <>
          <WeekHeader today={3} />
          <CalendarGrid items={MENTOR_MENTORIAS} today={3} />
          <div style={{ padding: '14px 20px 8px' }}>
            <div className="mx-caption" style={{ textTransform: 'uppercase', letterSpacing: 0.5, fontSize: 10, fontWeight: 600, marginBottom: 8 }}>
              Legenda
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              <LegendChip color="linear-gradient(135deg,#2E7D32,#1B5E20)" label="Em andamento" />
              <LegendChip color="linear-gradient(135deg,#E64A19,#BF360C)" label="Agendado" />
              <LegendChip color="linear-gradient(135deg,#E8B33A,#A37800)" label="Pendente gestor" />
            </div>
          </div>
        </> :

      <MentorListView items={MENTOR_MENTORIAS} />
      }
    </PhoneScreen>);

}

function ViewToggle({ view, onChange }) {
  const opts = [
  { id: 'lista', label: 'Lista' },
  { id: 'calendario', label: 'Calendário' }];

  return (
    <div style={{ padding: '0 20px 14px' }}>
      <div style={{
        display: 'flex', gap: 4, padding: 4, borderRadius: 12,
        background: 'var(--surface)'
      }}>
        {opts.map((o) => {
          const a = view === o.id;
          return (
            <button key={o.id} onClick={() => onChange(o.id)} style={{
              flex: 1, padding: '8px 0', borderRadius: 9, border: 0, cursor: 'pointer',
              background: a ? '#fff' : 'transparent',
              color: a ? 'var(--text)' : 'var(--text-2)',
              fontFamily: 'var(--f-body)', fontSize: 12, fontWeight: 600,
              boxShadow: a ? '0 1px 2px rgba(0,0,0,0.06)' : 'none'
            }}>{o.label}</button>);

        })}
      </div>
    </div>);

}

function MentorListItem({ m }) {
  const stripe = m.status === 'EM_ANDAMENTO' ? 'var(--secondary)' :
  m.status === 'AGENDADO' ? 'var(--accent)' :
  m.status === 'PENDENTE_GESTOR' ? '#E0A800' :
  'var(--primary)';
  const isLive = m.status === 'EM_ANDAMENTO';
  const isAg   = m.status === 'AGENDADO';
  const isPend = m.status === 'PENDENTE_GESTOR';
  const dayLabel = ['', 'Seg 26', 'Ter 27', 'Qua 28', 'Qui 29', 'Sex 30'][m.day];
  const endH = m.h + m.dur;
  const hh = (n) => String(n).padStart(2,'0') + ':00';

  const checkBase = {
    status: m.status,
    sala: 'Bloco B · Sala 207',
    when: `${dayLabel} · ${m.h}h–${endH}h`,
    duracao: `${m.dur}h`,
  };
  const checkData = isLive ? {
    ...checkBase, checkinAt: hh(m.h), checkoutPrev: hh(endH), elapsed: '12 min em curso',
  } : isAg ? {
    ...checkBase, checkinPrev: hh(m.h), checkoutPrev: hh(endH),
  } : null;

  return (
    <div className="mx-card" style={{
      margin: '0 20px 10px', overflow: 'hidden',
      border: isLive ? '1.5px solid var(--secondary)' : '1px solid transparent'
    }}>
      <div style={{ display: 'flex' }}>
        <div style={{ width: 4, background: stripe }} />
        <div style={{ flex: 1, padding: 14 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 10 }}>
            <Avatar initials={m.avatar} color={m.bg} size={40} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="mx-caption" style={{ marginBottom: 1, fontSize: 11 }}>{m.name}</div>
              <div style={{ fontFamily: 'var(--f-head)', fontWeight: 700, fontSize: 15, lineHeight: 1.2, color: 'var(--text)' }}>
                {m.topic}
              </div>
            </div>
            <StatusPill status={m.status} size="sm" pulse={isLive} />
          </div>

          {checkData && <CheckInOutCard c={checkData} />}

          {isPend && (
            <div style={{
              padding: '10px 12px', borderRadius: 10,
              background: '#FFF7E0', color: '#7A5B00',
              fontSize: 12, lineHeight: 1.45,
              display: 'flex', alignItems: 'center', gap: 8,
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="9" stroke="#E0A800" strokeWidth="2" />
                <path d="M12 7v5l3 2" stroke="#E0A800" strokeWidth="2" strokeLinecap="round" />
              </svg>
              Aguardando gestor enviar instruções de sala.
            </div>
          )}
        </div>
      </div>
    </div>);

}

function MentorListView({ items }) {
  // Agrupa por status — semelhante à lista do aluno
  const ordered = ['EM_ANDAMENTO', 'AGENDADO', 'PENDENTE_GESTOR'];
  const groups = ordered.map((s) => ({ status: s, items: items.filter((i) => i.status === s) })).filter((g) => g.items.length);
  return (
    <div style={{ padding: '4px 0 8px' }}>
      {groups.map((g) =>
      <div key={g.status} style={{ marginBottom: 8 }}>
          <div className="mx-caption" style={{
          padding: '0 20px 6px', fontSize: 10, fontWeight: 600,
          letterSpacing: 0.5, textTransform: 'uppercase',
          color: 'var(--text-3)'
        }}>{STATUS_META[g.status]?.label} · {g.items.length}</div>
          {g.items.map((m) => <MentorListItem key={m.id} m={m} />)}
        </div>
      )}
    </div>);

}

function LegendChip({ color, label }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      padding: '4px 10px 4px 6px', borderRadius: 999,
      background: '#fff', border: '1px solid var(--border)',
      fontFamily: 'var(--f-body)', fontSize: 11, color: 'var(--text-2)'
    }}>
      <span style={{ width: 14, height: 14, borderRadius: 4, background: color }} />
      {label}
    </span>);

}

Object.assign(window, { MentorMentoriasScreen });