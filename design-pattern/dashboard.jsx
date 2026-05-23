// dashboard.jsx — Gestor: Painel de Portaria (desktop)

const AGENDAMENTOS = [
  // PENDENTE_GESTOR — mentor aceitou, esperando instruções do gestor
  { id: 'g1', status: 'PENDENTE_GESTOR', title: 'Modelagem de banco para TCC',
    aluno: 'Camila Iwasaki', alunoAv: 'CI', alunoBg: 'linear-gradient(135deg,#8a6fe0,#5c3fc0)', alunoCurso: 'CC · M2',
    mentor: 'Bruno Yagami', mentorAv: 'BY', mentorBg: 'linear-gradient(135deg,#506fc7,#2e4ea0)',
    when: 'Qua 28 mai · 09h00–11h00', sala: 'Bloco A · Sala 301', topics: ['SQL', 'Postgres'],
    pedidoEm: 'há 12 min', },
  { id: 'g2', status: 'PENDENTE_GESTOR', title: 'Hooks e arquitetura',
    aluno: 'Lucas Pinto', alunoAv: 'LP', alunoBg: 'linear-gradient(135deg,#4a78d6,#2854b4)', alunoCurso: 'SI · 3º',
    mentor: 'Bruno Yagami', mentorAv: 'BY', mentorBg: 'linear-gradient(135deg,#506fc7,#2e4ea0)',
    when: 'Ter 27 mai · 10h00–11h00', sala: 'Bloco D · Sala 14', topics: ['React', 'Hooks'],
    pedidoEm: 'há 38 min', },

  // AGENDADO — gestor enviou instruções, aguardando check-in
  { id: 'g3', status: 'AGENDADO', title: 'Otimização de queries Postgres',
    aluno: 'Marina Ribeiro', alunoAv: 'MR', alunoBg: 'linear-gradient(135deg,#e64a19,#bf360c)', alunoCurso: 'Eng. Comp. · 5º',
    mentor: 'Letícia Vasconcelos', mentorAv: 'LV', mentorBg: 'linear-gradient(135deg,#6f5ad0,#4632a0)',
    when: 'Hoje · 16h00–17h00', sala: 'Bloco B · Sala 207', topics: ['SQL', 'Postgres', 'Indexação'],
    instrucao: 'Buscar a chave 5 min antes — leve o crachá.', emRel: 'em 47 min', },
  { id: 'g4', status: 'AGENDADO', title: 'Pandas para análise de notas',
    aluno: 'Joana Mendes', alunoAv: 'JM', alunoBg: 'linear-gradient(135deg,#7a5fd0,#4a35a0)', alunoCurso: 'Lic. Mat. · 4º',
    mentor: 'Bruno Yagami', mentorAv: 'BY', mentorBg: 'linear-gradient(135deg,#506fc7,#2e4ea0)',
    when: 'Hoje · 14h00–15h00', sala: 'Bloco A · Sala 305', topics: ['Python', 'Pandas'],
    instrucao: 'Acesso pela portaria do Bloco A.', emRel: 'agora há 7 min · atrasado', late: true, },

  // EM_ANDAMENTO — check-in feito
  { id: 'g5', status: 'EM_ANDAMENTO', title: 'Intervalos de confiança',
    aluno: 'Henrique Bittencourt', alunoAv: 'HB', alunoBg: 'linear-gradient(135deg,#506fc7,#2e4ea0)', alunoCurso: 'Eng. Comp. · 7º',
    mentor: 'Camila Iwasaki', mentorAv: 'CI', mentorBg: 'linear-gradient(135deg,#8a6fe0,#5c3fc0)',
    when: '13h00–14h00 · em curso', sala: 'Bloco A · Sala 301', topics: ['Estatística'],
    checkinAt: '12h54', },
  { id: 'g6', status: 'EM_ANDAMENTO', title: 'CI/CD app da Atlética',
    aluno: 'Sofia Maranhão', alunoAv: 'SM', alunoBg: 'linear-gradient(135deg,#506fc7,#2e4ea0)', alunoCurso: 'Design · 6º',
    mentor: 'Henrique Bittencourt', mentorAv: 'HB', mentorBg: 'linear-gradient(135deg,#506fc7,#2e4ea0)',
    when: '12h00–13h00 · em curso', sala: 'Bloco D · Sala 22', topics: ['GitHub', 'CI/CD'],
    checkinAt: '12h02', },
];

const DISPUTAS = [
  { id: 'd1', mentor: 'Henrique B.', mentorAv: 'HB', motivo: 'Aluno não compareceu — aguardei 20 min na sala.', when: 'sex 23 mai · 14h00', card: 'CI/CD para app da Atlética', evidencia: true },
  { id: 'd2', mentor: 'Rafael O.',   mentorAv: 'RO', motivo: 'Sessão realizada mas aluno ainda não avaliou (5 dias).', when: 'seg 19 mai · 10h00', card: 'Refator de hooks', evidencia: false },
];

function GestorSidebar({ active, onNav }) {
  const items = [
    { id: 'portaria', label: 'Painel de portaria', n: 6, icon: (
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2h-4v-7H9v7H5a2 2 0 0 1-2-2z" stroke="currentColor" strokeWidth="1.8" fill="none" strokeLinejoin="round"/>
    )},
    { id: 'agenda', label: 'Agenda do bloco', n: 14, icon: (
      <><rect x="3" y="4" width="18" height="18" rx="3" stroke="currentColor" strokeWidth="1.8" fill="none"/><path d="M3 9h18M8 2v4M16 2v4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></>
    )},
    { id: 'ambientes', label: 'Ambientes', n: 8, icon: (
      <><rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="1.8" fill="none"/><path d="M3 12h18M8 5v14M16 5v14" stroke="currentColor" strokeWidth="1.8"/></>
    )},
    { id: 'disputas', label: 'Disputas', n: 2, accent: true, icon: (
      <><path d="M12 2L2 22h20L12 2z" stroke="currentColor" strokeWidth="1.8" fill="none" strokeLinejoin="round"/><path d="M12 9v6M12 18v.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></>
    )},
    { id: 'historico', label: 'Histórico', icon: (
      <><circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8" fill="none"/><path d="M12 7v5l3 2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></>
    )},
  ];
  return (
    <aside style={{
      width: 240, background: 'var(--primary-dark)',
      display: 'flex', flexDirection: 'column',
      padding: '24px 14px', gap: 4, flexShrink: 0,
      color: '#fff',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '0 10px 8px' }}>
        <MxLogo size={22} color="#fff"/>
        <span style={{ fontFamily: 'var(--f-head)', fontWeight: 700, fontSize: 18, color: '#fff' }}>mentorix</span>
        <span style={{
          fontFamily: 'var(--f-body)', fontSize: 10, fontWeight: 600, letterSpacing: 0.6,
          background: 'rgba(255,255,255,0.15)', padding: '2px 6px', borderRadius: 6,
          color: 'rgba(255,255,255,0.85)', textTransform: 'uppercase',
        }}>Gestor</span>
      </div>
      <div style={{
        fontSize: 10, fontWeight: 600, letterSpacing: 0.8, textTransform: 'uppercase',
        color: 'rgba(255,255,255,0.5)', padding: '14px 12px 6px',
      }}>Bloco B</div>
      {items.map(it => (
        <button key={it.id} onClick={() => onNav(it.id)} style={{
          display: 'flex', alignItems: 'center', gap: 12,
          padding: '10px 12px', border: 0, borderRadius: 10, cursor: 'pointer',
          background: active === it.id ? 'rgba(255,255,255,0.14)' : 'transparent',
          color: active === it.id ? '#fff' : 'rgba(255,255,255,0.72)',
          fontFamily: 'var(--f-body)', fontSize: 14, fontWeight: 500,
          textAlign: 'left',
        }}>
          <svg width="18" height="18" viewBox="0 0 24 24">{it.icon}</svg>
          <span style={{ flex: 1 }}>{it.label}</span>
          {it.n != null && (
            <span style={{
              fontSize: 11, fontWeight: 600,
              padding: '2px 7px', borderRadius: 999,
              background: it.accent ? 'var(--accent)' : 'rgba(255,255,255,0.18)',
              color: '#fff',
            }}>{it.n}</span>
          )}
        </button>
      ))}
      <div style={{ flex: 1 }}/>
      <div style={{
        padding: 12, borderRadius: 12, background: 'rgba(0,0,0,0.22)',
        display: 'flex', alignItems: 'center', gap: 10,
      }}>
        <Avatar initials="EG" size={36} color="linear-gradient(135deg,#2e7d32,#1b5e20)"/>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#fff' }}>Edu Gusmão</div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)' }}>Gestor · Bloco B</div>
        </div>
      </div>
    </aside>
  );
}

function GestorTopbar({ onOpenDisputas }) {
  return (
    <header style={{
      height: 64, padding: '0 28px',
      display: 'flex', alignItems: 'center', gap: 16,
      borderBottom: '1px solid var(--border)', background: '#fff',
    }}>
      <div>
        <div style={{ fontFamily: 'var(--f-head)', fontWeight: 700, fontSize: 18, color: 'var(--text)' }}>
          Painel de Portaria
        </div>
        <div className="mx-caption">Qua, 28 mai · auto-refresh 30s</div>
      </div>
      <div style={{ flex: 1 }}/>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 6,
        padding: '6px 12px', borderRadius: 999, background: 'var(--secondary-light)',
      }}>
        <span className="mx-pulse" style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--secondary)' }}/>
        <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--secondary-dark)' }}>
          Supabase realtime
        </span>
      </div>
      <button onClick={onOpenDisputas} className="mx-btn accent" style={{
        padding: '8px 14px', display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 13,
      }}>
        Resolver disputas
        <span style={{
          fontSize: 11, fontWeight: 700, padding: '1px 7px', borderRadius: 999,
          background: 'rgba(255,255,255,0.25)', color: '#fff',
        }}>2</span>
      </button>
    </header>
  );
}

function StatCard({ label, value, sub, color, bg, icon }) {
  return (
    <div className="mx-card" style={{ padding: 16, flex: 1, minWidth: 0 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
        <div style={{
          width: 32, height: 32, borderRadius: 9, background: bg, color,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>{icon}</div>
        <div className="mx-caption" style={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.4, fontSize: 10 }}>
          {label}
        </div>
      </div>
      <div style={{ fontFamily: 'var(--f-head)', fontWeight: 700, fontSize: 26, color: 'var(--text)', lineHeight: 1 }}>{value}</div>
      <div className="mx-caption" style={{ marginTop: 4, fontSize: 11 }}>{sub}</div>
    </div>
  );
}

function ColumnHeader({ title, count, tone }) {
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
        <span style={{ width: 8, height: 8, borderRadius: '50%', background: toneStyles.dot }}/>
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

function AgendamentoCard({ a, onAction, flashing }) {
  const actionLabel = a.status === 'PENDENTE_GESTOR' ? 'Enviar instruções'
    : a.status === 'AGENDADO' ? 'Realizar check-in'
    : 'Encerrar & check-out';
  const btnClass = a.status === 'PENDENTE_GESTOR' ? 'mx-btn'
    : a.status === 'AGENDADO' ? 'mx-btn green'
    : 'mx-btn ghost';
  const isLate = a.late;

  return (
    <div className="mx-card" style={{
      padding: 12, marginBottom: 8, position: 'relative',
      border: flashing ? '1.5px solid var(--secondary)' : isLate ? '1.5px solid var(--accent)' : '1px solid transparent',
      background: flashing ? 'var(--secondary-light)' : '#fff',
      transition: 'background .4s ease',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
        <div style={{ fontFamily: 'var(--f-head)', fontWeight: 700, fontSize: 13, color: 'var(--text)', flex: 1, paddingRight: 8, lineHeight: 1.25 }}>
          {a.title}
        </div>
        {isLate && (
          <span style={{
            fontSize: 9, fontWeight: 700, padding: '2px 6px', borderRadius: 5,
            background: 'var(--accent)', color: '#fff', letterSpacing: 0.4, textTransform: 'uppercase',
          }}>atrasado</span>
        )}
      </div>

      {/* Pessoas */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
        <Avatar initials={a.alunoAv} color={a.alunoBg} size={26}/>
        <span style={{ fontSize: 11, color: 'var(--text-2)' }}>{a.aluno.split(' ')[0]}</span>
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none">
          <path d="M5 12h14M13 6l6 6-6 6" stroke="var(--text-3)" strokeWidth="2" strokeLinecap="round"/>
        </svg>
        <Avatar initials={a.mentorAv} color={a.mentorBg} size={26}/>
        <span style={{ fontSize: 11, color: 'var(--text-2)' }}>{a.mentor.split(' ')[0]}</span>
      </div>

      <div style={{
        padding: '8px 10px', borderRadius: 8, background: 'var(--surface)',
        display: 'flex', flexDirection: 'column', gap: 3, marginBottom: 8,
      }}>
        <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--text)' }}>{a.when}</div>
        <div className="mx-caption" style={{ fontSize: 11 }}>{a.sala}</div>
      </div>

      {a.instrucao && (
        <div className="mx-caption" style={{
          fontSize: 11, padding: '6px 8px', background: 'var(--primary-light)',
          color: 'var(--primary-dark)', borderRadius: 7, marginBottom: 8,
          display: 'flex', alignItems: 'flex-start', gap: 6,
        }}>
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0, marginTop: 2 }}>
            <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2"/>
            <path d="M12 8v5M12 16v.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          <span>{a.instrucao}</span>
        </div>
      )}

      {a.pedidoEm && (
        <div className="mx-caption" style={{ fontSize: 11, color: 'var(--text-3)', marginBottom: 8 }}>
          Mentor aceitou {a.pedidoEm}
        </div>
      )}
      {a.emRel && !a.late && (
        <div className="mx-caption" style={{ fontSize: 11, color: 'var(--accent-dark)', fontWeight: 500, marginBottom: 8 }}>
          {a.emRel}
        </div>
      )}
      {a.late && (
        <div className="mx-caption" style={{ fontSize: 11, color: 'var(--accent-dark)', fontWeight: 600, marginBottom: 8 }}>
          {a.emRel}
        </div>
      )}
      {a.checkinAt && (
        <div className="mx-caption" style={{ fontSize: 11, color: 'var(--secondary-dark)', fontWeight: 500, marginBottom: 8 }}>
          ✓ check-in {a.checkinAt}
        </div>
      )}

      <button onClick={() => onAction(a)} className={btnClass} style={{ width: '100%', padding: '9px 0', fontSize: 12, fontWeight: 600 }}>
        {actionLabel}
      </button>
    </div>
  );
}

function InstrucoesModal({ open, ag, onClose, onSend }) {
  const [text, setText] = React.useState('');
  React.useEffect(() => {
    if (open) setText(`Procure o gestor do ${ag.sala.split('·')[0].trim()} 5 min antes — leve o crachá. Devolução da chave até ${ag.when.split('·')[1]?.split('–')[1] || '17h00'}.`);
  }, [open, ag]);
  if (!open) return null;
  return (
    <div onClick={onClose} style={{
      position: 'absolute', inset: 0, background: 'rgba(18,18,18,0.45)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50,
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        width: 480, background: '#fff', borderRadius: 18, padding: 24,
        boxShadow: '0 20px 50px rgba(0,0,0,0.30)',
      }}>
        <div className="mx-caption" style={{
          fontFamily: 'JetBrains Mono, monospace', textTransform: 'uppercase', fontSize: 10, fontWeight: 600,
          letterSpacing: 1, color: 'var(--primary)', marginBottom: 4,
        }}>Aprovar mentoria</div>
        <h2 className="mx-h2" style={{ fontWeight: 700, marginBottom: 4 }}>{ag.title}</h2>
        <p className="mx-caption" style={{ marginBottom: 14 }}>{ag.aluno} · {ag.mentor} · {ag.when}</p>
        <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)' }}>Instruções para aluno e mentor</label>
        <textarea value={text} onChange={e => setText(e.target.value)} rows={4} style={{
          width: '100%', boxSizing: 'border-box',
          padding: '10px 12px', marginTop: 6, borderRadius: 10,
          border: '1px solid var(--border)', outline: 'none', resize: 'none',
          fontFamily: 'var(--f-body)', fontSize: 13, color: 'var(--text)', lineHeight: 1.5,
        }}/>
        <div className="mx-caption" style={{ fontSize: 11, marginTop: 4, color: 'var(--text-3)' }}>
          Após enviar, as instruções ficam <strong>imutáveis</strong>. Aluno e mentor recebem notificação.
        </div>
        <div style={{ display: 'flex', gap: 10, marginTop: 18, justifyContent: 'flex-end' }}>
          <button onClick={onClose} className="mx-btn ghost" style={{ padding: '10px 16px' }}>Cancelar</button>
          <button onClick={() => onSend(text)} className="mx-btn" style={{ padding: '10px 16px' }}>
            Enviar & marcar como Agendado
          </button>
        </div>
      </div>
    </div>
  );
}

function DisputasPanel({ open, onClose }) {
  if (!open) return null;
  return (
    <div onClick={onClose} style={{
      position: 'absolute', inset: 0, background: 'rgba(18,18,18,0.45)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50,
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        width: 560, background: '#fff', borderRadius: 18, padding: 24,
        boxShadow: '0 20px 50px rgba(0,0,0,0.30)',
        maxHeight: '80%', overflow: 'auto',
      }}>
        <h2 className="mx-h2" style={{ fontWeight: 700, marginBottom: 14 }}>Disputas abertas</h2>
        {DISPUTAS.map(d => (
          <div key={d.id} className="mx-card" style={{ padding: 14, marginBottom: 10, border: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <Avatar initials={d.mentorAv} size={32} color="linear-gradient(135deg,#506fc7,#2e4ea0)"/>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 600 }}>{d.mentor}</div>
                <div className="mx-caption" style={{ fontSize: 11 }}>{d.card} · {d.when}</div>
              </div>
              {d.evidencia && (
                <span style={{ fontSize: 10, fontWeight: 600, padding: '3px 8px', borderRadius: 999, background: 'var(--primary-light)', color: 'var(--primary-dark)' }}>
                  📎 evidência
                </span>
              )}
            </div>
            <p className="mx-body" style={{ fontSize: 13, color: 'var(--text-2)', marginBottom: 12 }}>{d.motivo}</p>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="mx-btn green" style={{ flex: 1, padding: '8px 0', fontSize: 12 }}>Aprovar — creditar horas</button>
              <button className="mx-btn ghost" style={{ flex: 1, padding: '8px 0', fontSize: 12 }}>Rejeitar</button>
            </div>
          </div>
        ))}
        <button onClick={onClose} className="mx-btn ghost" style={{ marginTop: 4 }}>Fechar</button>
      </div>
    </div>
  );
}

function DashboardScreen() {
  const [items, setItems] = React.useState(AGENDAMENTOS);
  const [modal, setModal] = React.useState({ open: false, ag: null });
  const [disputas, setDisputas] = React.useState(false);
  const [flashing, setFlashing] = React.useState(null);

  const handleAction = (a) => {
    if (a.status === 'PENDENTE_GESTOR') {
      setModal({ open: true, ag: a });
      return;
    }
    if (a.status === 'AGENDADO') {
      setFlashing(a.id);
      setItems(items => items.map(x => x.id === a.id
        ? { ...x, status: 'EM_ANDAMENTO', checkinAt: 'agora', late: false, emRel: null, instrucao: null }
        : x));
      setTimeout(() => setFlashing(null), 1200);
      return;
    }
    if (a.status === 'EM_ANDAMENTO') {
      setItems(items => items.filter(x => x.id !== a.id));
      return;
    }
  };

  const handleSendInstrucoes = (text) => {
    setItems(items => items.map(x => x.id === modal.ag.id
      ? { ...x, status: 'AGENDADO', instrucao: text, emRel: 'em 47 min', pedidoEm: null }
      : x));
    setModal({ open: false, ag: null });
  };

  const cols = {
    PENDENTE_GESTOR: items.filter(x => x.status === 'PENDENTE_GESTOR'),
    AGENDADO:        items.filter(x => x.status === 'AGENDADO'),
    EM_ANDAMENTO:    items.filter(x => x.status === 'EM_ANDAMENTO'),
  };

  return (
    <div data-screen-label="G01 Gestor · Painel de Portaria" style={{
      width: 1280, height: 800, display: 'flex',
      background: '#F5F4F0', fontFamily: 'var(--f-body)',
      borderRadius: 16, overflow: 'hidden',
      boxShadow: '0 30px 60px rgba(0,0,0,0.15), 0 0 0 1px rgba(0,0,0,0.06)',
      position: 'relative',
    }}>
      <GestorSidebar active="portaria" onNav={() => {}}/>
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <GestorTopbar onOpenDisputas={() => setDisputas(true)}/>
        <div className="mx-scroll" style={{ flex: 1, overflowY: 'auto', padding: 24 }}>
          {/* Stat row */}
          <div style={{ display: 'flex', gap: 14, marginBottom: 18 }}>
            <StatCard label="Hoje · Bloco B" value={items.length} sub="agendamentos no painel"
              color="var(--primary)" bg="var(--primary-light)"
              icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2"/><path d="M3 9h18M8 2v4M16 2v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>}/>
            <StatCard label="Pendentes" value={cols.PENDENTE_GESTOR.length} sub="aguardando instruções"
              color="#7A5B00" bg="#FFF7E0"
              icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2"/><path d="M12 7v5l3 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>}/>
            <StatCard label="Em andamento" value={cols.EM_ANDAMENTO.length} sub={`última: ${cols.EM_ANDAMENTO[cols.EM_ANDAMENTO.length-1]?.checkinAt || '—'}`}
              color="var(--secondary)" bg="var(--secondary-light)"
              icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M4 12l5 5L20 6" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"/></svg>}/>
            <StatCard label="Disputas" value={DISPUTAS.length} sub="aguardando parecer"
              color="var(--accent)" bg="var(--accent-light)"
              icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M12 2L2 22h20L12 2z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/><path d="M12 9v6M12 18v.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>}/>
          </div>

          {/* 3 columns kanban */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
            <div>
              <ColumnHeader title="Pendente de Instruções" count={cols.PENDENTE_GESTOR.length} tone="yellow"/>
              {cols.PENDENTE_GESTOR.map(a => <AgendamentoCard key={a.id} a={a} onAction={handleAction}/>)}
              {cols.PENDENTE_GESTOR.length === 0 && <EmptyCol label="Nada aguardando 🎉"/>}
            </div>
            <div>
              <ColumnHeader title="Agendado · aguardando check-in" count={cols.AGENDADO.length} tone="accent"/>
              {cols.AGENDADO.map(a => <AgendamentoCard key={a.id} a={a} onAction={handleAction} flashing={flashing === a.id}/>)}
              {cols.AGENDADO.length === 0 && <EmptyCol label="Tudo em andamento"/>}
            </div>
            <div>
              <ColumnHeader title="Em andamento · sala ocupada" count={cols.EM_ANDAMENTO.length} tone="green"/>
              {cols.EM_ANDAMENTO.map(a => <AgendamentoCard key={a.id} a={a} onAction={handleAction}/>)}
              {cols.EM_ANDAMENTO.length === 0 && <EmptyCol label="Nenhuma sala em uso"/>}
            </div>
          </div>
        </div>
      </main>

      <InstrucoesModal open={modal.open} ag={modal.ag || {}}
        onClose={() => setModal({ open: false, ag: null })}
        onSend={handleSendInstrucoes}/>
      <DisputasPanel open={disputas} onClose={() => setDisputas(false)}/>
    </div>
  );
}

function EmptyCol({ label }) {
  return (
    <div style={{
      padding: '24px 12px', borderRadius: 10, textAlign: 'center',
      border: '1.5px dashed var(--border)', color: 'var(--text-3)', fontSize: 12,
    }}>{label}</div>
  );
}

Object.assign(window, { DashboardScreen });
