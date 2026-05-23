// screen-aluno-nova.jsx — Aluno: nova solicitação

const HOURS = Array.from({ length: 14 }, (_, i) => 8 + i); // 8..21
const WEEKDAYS = ['SEG', 'TER', 'QUA', 'QUI', 'SEX'];

function TopicSelector({ selected, onToggle, open, onOpen }) {
  return (
    <div>
      <button onClick={onOpen} style={{
        width: '100%', textAlign: 'left',
        padding: '12px 14px', borderRadius: 12,
        border: '1px solid var(--border)', background: '#fff', cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        fontFamily: 'var(--f-body)', fontSize: 14, color: 'var(--text)'
      }}>
        <span style={{ color: selected.length ? 'var(--text)' : 'var(--text-3)' }}>
          {selected.length ? `${selected.length} assunto${selected.length > 1 ? 's' : ''} selecionado${selected.length > 1 ? 's' : ''}` : 'Escolha os assuntos…'}
        </span>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
          <path d="M6 9l6 6 6-6" stroke="var(--text-2)" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </button>
      {selected.length > 0 &&
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 10 }}>
          {selected.map((t) =>
        <button key={t} onClick={() => onToggle(t)} style={{
          padding: '5px 10px 5px 12px', borderRadius: 999,
          background: 'var(--primary)', color: '#fff', border: 0, cursor: 'pointer',
          fontFamily: 'var(--f-body)', fontSize: 12, fontWeight: 500,
          display: 'inline-flex', alignItems: 'center', gap: 6
        }}>
              #{t}
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none">
                <path d="M6 6l12 12M18 6l-12 12" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" />
              </svg>
            </button>
        )}
        </div>
      }
      {open &&
      <div style={{
        marginTop: 12, padding: 14, borderRadius: 14,
        background: 'var(--surface)', border: '1px solid var(--border)'
      }}>
          <div className="mx-caption" style={{ fontWeight: 600, marginBottom: 10, textTransform: 'uppercase', letterSpacing: 0.5, fontSize: 10 }}>
            Disponíveis
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {TOPICS.map((t) => {
            const on = selected.includes(t);
            return (
              <button key={t} onClick={() => onToggle(t)} style={{
                padding: '5px 10px', borderRadius: 999, cursor: 'pointer',
                border: on ? '1px solid var(--primary)' : '1px solid var(--border)',
                background: on ? 'var(--primary)' : '#fff',
                color: on ? '#fff' : 'var(--text)',
                fontFamily: 'var(--f-body)', fontSize: 12, fontWeight: 500
              }}>
                  {on ? '✓ ' : ''}#{t}
                </button>);

          })}
          </div>
        </div>
      }
    </div>);

}

function PeriodPicker({ from, to, onFrom, onTo }) {
  const presets = [
  { id: '1w', label: 'Próximos 7d' },
  { id: '2w', label: '14 dias' },
  { id: 'mes', label: 'Este mês' }];

  return (
    <div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
        <DateField label="De" value={from} onChange={onFrom} />
        <DateField label="Até" value={to} onChange={onTo} />
      </div>
      <div style={{ display: 'flex', gap: 6 }}>
        {presets.map((p) =>
        <button key={p.id} style={{
          padding: '6px 10px', borderRadius: 999, cursor: 'pointer',
          border: '1px solid var(--border)', background: '#fff',
          fontFamily: 'var(--f-body)', fontSize: 11, color: 'var(--text-2)'
        }}>{p.label}</button>
        )}
      </div>
    </div>);

}

function DateField({ label, value, onChange }) {
  return (
    <div style={{ flex: 1 }}>
      <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-3)', letterSpacing: 0.6, textTransform: 'uppercase', marginBottom: 4 }}>
        {label}
      </div>
      <div style={{
        padding: '10px 12px', borderRadius: 12,
        border: '1px solid var(--border)', background: '#fff',
        display: 'flex', alignItems: 'center', gap: 8
      }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
          <rect x="3" y="4" width="18" height="18" rx="3" stroke="var(--primary)" strokeWidth="1.8" />
          <path d="M3 9h18M8 2v4M16 2v4" stroke="var(--primary)" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
        <span style={{ fontFamily: 'var(--f-body)', fontSize: 13, fontWeight: 500 }}>{value}</span>
      </div>
    </div>);

}

function AvailabilityGrid({ selected, onToggle }) {
  // selected: Set of "DAY-HOUR" e.g. "SEG-14"
  const isOn = (d, h) => selected.has(`${d}-${h}`);

  return (
    <div style={{
      borderRadius: 14, overflow: 'hidden', border: '1px solid var(--border)',
      background: '#fff'
    }}>
      <div style={{ display: 'grid', gridTemplateColumns: '36px repeat(5, 1fr)' }}>
        {/* header */}
        <div />
        {WEEKDAYS.map((d) =>
        <div key={d} style={{
          padding: '8px 0', textAlign: 'center',
          fontFamily: 'var(--f-body)', fontSize: 10, fontWeight: 600,
          color: 'var(--text-2)', letterSpacing: 0.6,
          borderBottom: '1px solid var(--border)',
          background: 'var(--surface)'
        }}>{d}</div>
        )}
        {/* rows */}
        {HOURS.map((h) =>
        <React.Fragment key={h}>
            <div style={{
            padding: '0 4px',
            fontFamily: 'JetBrains Mono, monospace', fontSize: 9.5, color: 'var(--text-3)',
            display: 'flex', alignItems: 'flex-start', justifyContent: 'flex-end',
            paddingTop: 4,
            borderRight: '1px solid var(--border)'
          }}>{h}h</div>
            {WEEKDAYS.map((d) => {
            const on = isOn(d, h);
            return (
              <button key={`${d}-${h}`} onClick={() => onToggle(d, h)} style={{
                height: 22, border: 0, cursor: 'pointer', padding: 0,
                background: on ? 'var(--primary)' : '#fff',
                borderRight: '1px solid var(--border)',
                borderTop: h > 8 ? '1px solid var(--border)' : 'none',
                transition: 'background .12s'
              }} />);

          })}
          </React.Fragment>
        )}
      </div>
    </div>);

}

function NovaSolicitacaoScreen({ onTab, onPublish }) {
  const [title, setTitle] = React.useState('Ajuda com queries lentas em Postgres');
  const [desc, setDesc] = React.useState('Tenho um relatório que demora 9s pra carregar. Quero entender índices e EXPLAIN.');
  const [topics, setTopics] = React.useState(['SQL', 'Postgres']);
  const [topicOpen, setTopicOpen] = React.useState(false);
  const [from, setFrom] = React.useState('26 mai');
  const [to, setTo] = React.useState('30 mai');
  const [slots, setSlots] = React.useState(new Set(['SEG-14', 'SEG-15', 'TER-10', 'QUA-16', 'QUI-14', 'QUI-15']));

  const toggleTopic = (t) => {
    setTopics((prev) => prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]);
  };
  const toggleSlot = (d, h) => {
    const k = `${d}-${h}`;
    setSlots((prev) => {
      const n = new Set(prev);
      if (n.has(k)) n.delete(k);else n.add(k);
      return n;
    });
  };

  const canPublish = title.trim() && desc.trim() && topics.length > 0 && slots.size > 0;

  return (
    <PhoneScreen
      screenLabel="A02 Aluno · Nova solicitação"
      tab="nova" onTab={onTab}
      tabs={[
      { id: 'solicitacoes', label: 'Solicitações' },
      { id: 'historico', label: 'Histórico' },
      { id: 'notificacoes', label: 'Avisos' },
      { id: 'perfil', label: 'Perfil' }]
      }
      centerFab={{ label: 'Nova', onClick: () => {} }}
      header={
      <div style={{ padding: '12px 20px 14px' }}>
          <div className="mx-caption" style={{
          fontFamily: 'JetBrains Mono, monospace', fontSize: 10, fontWeight: 600,
          letterSpacing: 1, textTransform: 'uppercase', color: 'var(--primary)', marginBottom: 4
        }}>Aluno · UniMatch</div>
          <h1 className="mx-h1" style={{ fontSize: 24 }}>Nova solicitação</h1>
        </div>
      }
      scrollPadBottom={40}>
      
      <div style={{ padding: '14px 20px 16px', display: 'flex', flexDirection: 'column', gap: 18 }}>
        <Field label="Título">
          <input value={title} onChange={(e) => setTitle(e.target.value)} style={inputStyle} />
        </Field>
        <Field label="Descrição">
          <textarea value={desc} onChange={(e) => setDesc(e.target.value)} rows={3} style={{ ...inputStyle, resize: 'none', lineHeight: 1.45 }} />
          <div style={{ fontSize: 10, color: 'var(--text-3)', textAlign: 'right', marginTop: 4 }}>
            {desc.length}/600
          </div>
        </Field>
        <Field label="Assuntos" hint="Tags usadas para casar com o mentor">
          <TopicSelector selected={topics} onToggle={toggleTopic}
          open={topicOpen} onOpen={() => setTopicOpen((o) => !o)} />
        </Field>
        <Field label="Período de disponibilidade" hint="Toque nas células para liberar horários · seg–sex · 8h–22h">
          <PeriodPicker from={from} to={to} onFrom={setFrom} onTo={setTo} />
          <div style={{ height: 12 }} />
          <AvailabilityGrid selected={slots} onToggle={toggleSlot} />
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            marginTop: 10, padding: '8px 12px', borderRadius: 10,
            background: slots.size > 0 ? 'var(--primary-light)' : 'var(--surface)'
          }}>
            <span style={{ fontSize: 12, color: slots.size > 0 ? 'var(--primary-dark)' : 'var(--text-2)' }}>
              <strong>{slots.size}</strong> {slots.size === 1 ? 'horário liberado' : 'horários liberados'}
              {slots.size > 0 && ` na semana ${from} → ${to}`}
            </span>
            {slots.size > 0 &&
            <button onClick={() => setSlots(new Set())} style={{
              background: 'transparent', border: 0, cursor: 'pointer',
              color: 'var(--primary)', fontSize: 12, fontWeight: 500
            }}>Limpar</button>
            }
          </div>
        </Field>
      </div>
      <div style={{ padding: '4px 20px 24px' }}>
        <button onClick={onPublish} disabled={!canPublish} className="mx-btn" style={{
          width: '100%', padding: '14px 0', fontSize: 15, fontWeight: 600,
          opacity: canPublish ? 1 : 0.5, cursor: canPublish ? 'pointer' : 'not-allowed'
        }}>Publicar 

        </button>
      </div>
    </PhoneScreen>);

}

const inputStyle = {
  width: '100%', padding: '12px 14px', borderRadius: 12,
  border: '1px solid var(--border)', background: '#fff',
  fontFamily: 'var(--f-body)', fontSize: 14, color: 'var(--text)',
  outline: 'none', boxSizing: 'border-box'
};

function Field({ label, hint, children }) {
  return (
    <div>
      <label style={{ display: 'block', marginBottom: 6 }}>
        <span style={{ fontFamily: 'var(--f-body)', fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{label}</span>
        {hint && <span style={{ display: 'block', fontSize: 11, color: 'var(--text-3)', marginTop: 2 }}>{hint}</span>}
      </label>
      {children}
    </div>);

}

Object.assign(window, { NovaSolicitacaoScreen });