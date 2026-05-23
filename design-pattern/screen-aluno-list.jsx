// screen-aluno-list.jsx — Aluno: Minhas solicitações (incl. mentorias com WhatsApp)

const ALUNO_CARDS = [
{
  id: 'c1', title: 'Otimização de queries Postgres',
  desc: 'Relatório de 9s, quero entender índices e EXPLAIN.',
  topics: ['SQL', 'Postgres', 'Indexação'],
  status: 'EM_ANDAMENTO',
  mentor: { name: 'Letícia Vasconcelos', avatar: 'LV', curso: 'Eng. Comp. · 8º', phone: '(85) 9 9876-3402',
    bg: 'linear-gradient(135deg,#6f5ad0,#4632a0)' },
  when: 'Hoje · 16h00–17h00',
  sala: 'Bloco B · Sala 207',
  checkinAt: '16:00',
  checkoutPrev: '17:00',
  elapsed: '12 min em curso'
},
{
  id: 'c2', title: 'Refator de hooks no app de pedidos',
  desc: 'Trazer arquitetura por feature, evitar prop drilling.',
  topics: ['React', 'TypeScript', 'Hooks'],
  status: 'AGENDADO',
  mentor: { name: 'Rafael Otieno', avatar: 'RO', curso: 'SI · 6º', phone: '(85) 9 8245-1109',
    bg: 'linear-gradient(135deg,#4a78d6,#2854b4)' },
  when: 'Amanhã · 10h00–11h00',
  sala: 'Bloco D · Sala 14',
  checkinPrev: '10:00',
  checkoutPrev: '11:00',
  instrucoes: 'Procure o gestor na portaria 5 min antes — leve o crachá.'
},
{
  id: 'c3', title: 'Intervalos de confiança no TCC',
  desc: 'Análise de dados de pesquisa de campo.',
  topics: ['Estatística', 'Python', 'Pandas'],
  status: 'PENDENTE_GESTOR',
  mentor: { name: 'Camila Iwasaki', avatar: 'CI', curso: 'CC · M2', phone: '',
    bg: 'linear-gradient(135deg,#8a6fe0,#5c3fc0)' },
  when: 'Qui · 14h00–15h00',
  sala: 'aguardando aprovação do gestor'
},
{
  id: 'c4', title: 'Estudo de grafos para a P2',
  desc: 'Caminhos mínimos, Dijkstra, exercícios da lista.',
  topics: ['Grafos', 'Dijkstra'],
  status: 'ABERTO',
  matchmaking: { views: 27, candidates: 3 }
},
{
  id: 'c5', title: 'Setup CI/CD app da Atlética',
  desc: 'Deploy automatizado no Vercel + actions.',
  topics: ['GitHub', 'Deploy'],
  status: 'CONCLUIDO',
  mentor: { name: 'Henrique Bittencourt', avatar: 'HB', curso: 'Eng. Comp. · 7º',
    bg: 'linear-gradient(135deg,#506fc7,#2e4ea0)' },
  when: 'Ontem · 10h00–10h50',
  duracao: '0h50',
  checkinAt: '10:02',
  checkoutAt: '10:52',
  needsRating: true
}];


function AlunoHeader({ name = 'Marina', curso = 'Eng. Comp.', mat = '2021105432' }) {
  return (
    <div style={{ padding: '12px 20px 14px' }}>
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
          }}>Aluno</span>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Avatar initials="MR" size={32} color="linear-gradient(135deg,#e64a19,#bf360c)" />
        </div>
      </div>
      <h1 className="mx-h1" style={{ fontSize: 24 }}>Olá, {name}.</h1>
      <p className="mx-caption" style={{ marginTop: 2 }}>
        {curso} · matrícula {mat}
      </p>
    </div>);

}

function AlunoTabs({ active, onChange, counts }) {
  const tabs = [
  { id: 'todas', label: 'Todas', n: counts.todas },
  { id: 'mentoria', label: 'Mentorias', n: counts.mentoria },
  { id: 'matchmaking', label: 'Matchmaking', n: counts.matchmaking },
  { id: 'historico', label: 'Histórico', n: counts.historico }];

  return (
    <div style={{ display: 'flex', gap: 4, padding: '0 20px 14px', overflowX: 'auto', scrollbarWidth: 'none' }}>
      {tabs.map((t) => {
        const a = active === t.id;
        return (
          <button key={t.id} onClick={() => onChange(t.id)} style={{
            flexShrink: 0, padding: '7px 12px', borderRadius: 999, cursor: 'pointer',
            border: a ? '1px solid var(--primary)' : '1px solid var(--border)',
            background: a ? 'var(--primary)' : '#fff',
            color: a ? '#fff' : 'var(--text)',
            fontFamily: 'var(--f-body)', fontSize: 12, fontWeight: 500,
            display: 'inline-flex', alignItems: 'center', gap: 5
          }}>
            {t.label}
            <span style={{
              fontSize: 10, fontWeight: 600, padding: '1px 6px', borderRadius: 999,
              color: a ? '#fff' : 'var(--text-3)',
              background: a ? 'rgba(255,255,255,0.18)' : 'var(--surface)'
            }}>{t.n}</span>
          </button>);

      })}
    </div>);

}

function WhatsAppButton({ phone, name }) {
  return (
    <a href={`https://wa.me/55${phone.replace(/\D/g, '')}`} target="_blank" style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
      padding: '10px 14px', borderRadius: 12, cursor: 'pointer',
      background: '#25D366', color: '#fff', textDecoration: 'none',
      fontFamily: 'var(--f-body)', fontSize: 13, fontWeight: 600,
      boxShadow: '0 1px 0 rgba(17,80,42,0.25), 0 6px 14px rgba(37,211,102,0.25)'
    }} onClick={(e) => e.preventDefault()}>
      <svg width="16" height="16" viewBox="0 0 32 32" fill="currentColor">
        <path d="M16 3C9 3 3.5 8.5 3.5 15.5c0 2.3.6 4.5 1.7 6.4L3 29l7.4-2.1c1.8 1 3.7 1.5 5.7 1.5 7 0 12.5-5.5 12.5-12.5S23 3 16 3Zm7.4 17.6c-.3.9-1.7 1.8-2.5 1.9-.6.1-1.4.1-2.3-.2-.5-.2-1.2-.4-2-.8-3.6-1.6-5.9-5.2-6.1-5.4-.2-.2-1.5-2-1.5-3.8 0-1.9.9-2.8 1.3-3.2.3-.4.7-.5 1-.5h.7c.2 0 .5-.1.8.6.3.7 1 2.5 1.1 2.7.1.2.1.4 0 .7-.1.2-.2.4-.4.6-.2.2-.4.5-.6.6-.2.2-.4.4-.2.8.2.4 1 1.6 2.1 2.6 1.4 1.3 2.6 1.7 3 1.9.4.2.6.2.8-.1.2-.3.9-1 1.1-1.4.2-.4.4-.3.7-.2.3.1 2 1 2.4 1.1.4.2.6.3.7.5.1.1.1.7-.2 1.4Z" />
      </svg>
      Falar com {name.split(' ')[0]}
    </a>);

}

function CheckInOutCard({ c }) {
  const isLive = c.status === 'EM_ANDAMENTO';
  const isDone = c.status === 'CONCLUIDO';
  const isAg = c.status === 'AGENDADO';

  const checkin = c.checkinAt || c.checkinPrev || '—';
  const checkout = c.checkoutAt || c.checkoutPrev || '—';
  const checkinDone = !!c.checkinAt;
  const checkoutDone = !!c.checkoutAt;

  const progress = isLive ? 0.20 : isDone ? 1.0 : 0.0;

  // Tones
  const tone = isLive ? { bg: 'var(--secondary-light)', accent: 'var(--secondary)', dark: 'var(--secondary-dark)' } :
  isDone ? { bg: 'var(--secondary-light)', accent: 'var(--secondary)', dark: 'var(--secondary-dark)' } :
  { bg: 'var(--accent-light)', accent: 'var(--accent)', dark: 'var(--accent-dark)' };

  return (
    <div style={{
      padding: 14, borderRadius: 14,
      background: tone.bg,
      border: `1px solid ${isLive ? 'var(--secondary)' : 'transparent'}`,
      position: 'relative', overflow: 'hidden'
    }}>

      <div style={{
        display: 'grid', gridTemplateColumns: '1fr auto 1fr',
        gap: 12, alignItems: 'flex-end', marginBottom: 12
      }}>
        {/* Check-in column */}
        <div>
          <div style={{
            fontSize: 10, fontWeight: 700, letterSpacing: 0.6, textTransform: 'uppercase',
            color: checkinDone ? tone.dark : 'var(--text-3)',
            display: 'flex', alignItems: 'center', gap: 4, marginBottom: 4
          }}>
            <TimelineDot done={checkinDone} accent={tone.accent} />
            check-in
          </div>
          <div style={{
            fontFamily: 'var(--f-head)', fontWeight: 700, fontSize: 24,
            color: checkinDone ? 'var(--text)' : 'var(--text-2)',
            lineHeight: 1, letterSpacing: -0.3,
            fontFeatureSettings: '"tnum"'
          }}>{checkin}</div>
          <div style={{ fontSize: 10.5, color: checkinDone ? tone.dark : 'var(--text-3)', marginTop: 3, fontWeight: 500 }}>
            {checkinDone ? '✓ confirmado' : 'previsto'}
          </div>
        </div>

        {/* Middle separator */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, paddingBottom: 4 }}>
          <span style={{ fontSize: 9, color: 'var(--text-3)', fontWeight: 600, letterSpacing: 0.5, textTransform: 'uppercase' }}>
            {isLive ? c.elapsed : isDone ? c.duracao : '1h'}
          </span>
          <svg width="14" height="10" viewBox="0 0 24 16" fill="none">
            <path d="M2 8h18M14 2l6 6-6 6" stroke="var(--text-3)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>

        {/* Check-out column */}
        <div style={{ textAlign: 'right' }}>
          <div style={{
            fontSize: 10, fontWeight: 700, letterSpacing: 0.6, textTransform: 'uppercase',
            color: checkoutDone ? tone.dark : 'var(--text-3)',
            display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 4, marginBottom: 4
          }}>
            check-out
            <TimelineDot done={checkoutDone} accent={tone.accent} />
          </div>
          <div style={{
            fontFamily: 'var(--f-head)', fontWeight: 700, fontSize: 24,
            color: checkoutDone ? 'var(--text)' : 'var(--text-2)',
            lineHeight: 1, letterSpacing: -0.3,
            fontFeatureSettings: '"tnum"'
          }}>{checkout}</div>
          <div style={{ fontSize: 10.5, color: checkoutDone ? tone.dark : 'var(--text-3)', marginTop: 3, fontWeight: 500 }}>
            {checkoutDone ? '✓ devolvido' : 'previsto'}
          </div>
        </div>
      </div>

      {/* progress bar */}
      <div style={{ height: 4, borderRadius: 99, background: 'rgba(0,0,0,0.06)', overflow: 'hidden', marginBottom: 8 }}>
        <div style={{
          height: '100%', width: `${progress * 100}%`,
          background: tone.accent,
          borderRadius: 99,
          transition: 'width .4s ease',
          ...(isLive ? { backgroundImage: 'linear-gradient(90deg, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0) 50%, rgba(255,255,255,0.4) 100%)', animation: 'mxShimmer 2s linear infinite' } : {})
        }} />
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 11, color: 'var(--text-2)', fontWeight: 500 }}>{c.sala}</span>
        <span style={{ fontSize: 11, color: 'var(--text-3)' }}>{c.when}</span>
      </div>
      <style>{`@keyframes mxShimmer { 0% { background-position: -100px 0; } 100% { background-position: 100px 0; } }`}</style>
    </div>);

}

function TimelineDot({ done, accent }) {
  if (done) {
    return (
      <span style={{
        width: 14, height: 14, borderRadius: '50%', background: accent,
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center'
      }}>
        <svg width="8" height="8" viewBox="0 0 24 24" fill="none">
          <path d="M4 12.5L9 17.5L20 6.5" stroke="#fff" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>);

  }
  return (
    <span style={{
      width: 14, height: 14, borderRadius: '50%',
      background: '#fff', border: '2px dashed var(--text-3)',
      boxSizing: 'border-box'
    }} />);

}

function CardAluno({ c, onWhatsapp, onAvaliar }) {
  const stripe = c.status === 'EM_ANDAMENTO' ? 'var(--secondary)' :
  c.status === 'AGENDADO' ? 'var(--accent)' :
  c.status === 'PENDENTE_GESTOR' ? '#E0A800' :
  c.status === 'CONCLUIDO' ? 'var(--secondary)' :
  c.status === 'CANCELADO' ? 'var(--accent-dark)' :
  'var(--primary)';
  const isLive = c.status === 'EM_ANDAMENTO';

  return (
    <div className="mx-card" style={{
      margin: '0 20px 12px', overflow: 'hidden',
      border: isLive ? '1.5px solid var(--secondary)' : '1px solid transparent'
    }}>
      <div style={{ display: 'flex' }}>
        <div style={{ width: 4, background: stripe, opacity: c.status === 'CONCLUIDO' ? 0.45 : 1 }} />
        <div style={{ flex: 1, padding: 14 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10, marginBottom: 6 }}>
            <div style={{ fontFamily: 'var(--f-head)', fontWeight: 700, fontSize: 15, lineHeight: 1.25, color: 'var(--text)', flex: 1 }}>
              {c.title}
            </div>
            <StatusPill status={c.status} pulse={isLive} size="sm" />
          </div>
          <p className="mx-caption" style={{ marginBottom: 10, lineHeight: 1.45 }}>{c.desc}</p>
          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 12 }}>
            {c.topics.map((t) => <TopicBadge key={t}>#{t}</TopicBadge>)}
          </div>

          {c.mentor &&
          <div style={{
            padding: 10, borderRadius: 12,
            background: isLive ? 'var(--secondary-light)' : 'var(--surface)',
            display: 'flex', alignItems: 'center', gap: 10,
            marginBottom: c.status === 'EM_ANDAMENTO' || c.status === 'AGENDADO' ? 10 : 0
          }}>
              <Avatar initials={c.mentor.avatar} color={c.mentor.bg} size={36} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{c.mentor.name}</div>
                <div className="mx-caption" style={{ fontSize: 11 }}>{c.mentor.curso}</div>
              </div>
            </div>
          }

          {(c.status === 'EM_ANDAMENTO' || c.status === 'AGENDADO') && c.mentor && c.mentor.phone &&
          <>
              <CheckInOutCard c={c} />
              {c.instrucoes &&
            <div style={{
              marginTop: 10, padding: '8px 10px', borderRadius: 10,
              background: 'var(--primary-light)', color: 'var(--primary-dark)',
              fontSize: 12, lineHeight: 1.4,
              display: 'flex', alignItems: 'flex-start', gap: 6
            }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" style={{ marginTop: 2, flexShrink: 0 }}>
                    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
                    <path d="M12 8v5M12 16v.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                  <span>{c.instrucoes}</span>
                </div>
            }
              <div style={{ marginTop: 10 }}>
                <WhatsAppButton phone={c.mentor.phone} name={c.mentor.name} />
              </div>
            </>
          }

          {c.status === 'PENDENTE_GESTOR' &&
          <div style={{
            marginTop: 4, padding: '10px 12px', borderRadius: 10,
            background: '#FFF7E0', color: '#7A5B00',
            fontSize: 12, lineHeight: 1.45,
            display: 'flex', alignItems: 'center', gap: 8
          }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="9" stroke="#E0A800" strokeWidth="2" />
                <path d="M12 7v5l3 2" stroke="#E0A800" strokeWidth="2" strokeLinecap="round" />
              </svg>
              Mentor escolheu o slot — aguardando gestor confirmar a sala.
            </div>
          }

          {c.status === 'ABERTO' &&
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: '8px 12px', borderRadius: 10, background: 'var(--primary-light)'
          }}>
              <span style={{ fontSize: 12, color: 'var(--primary-dark)' }}>
                <strong>{c.matchmaking.candidates}</strong> mentores compatíveis &nbsp;·&nbsp; {c.matchmaking.views} visualizações
              </span>
              <span className="mx-pulse" style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--primary)' }} />
            </div>
          }

          {c.status === 'CONCLUIDO' && c.needsRating &&
          <>
              <CheckInOutCard c={c} />
              <button onClick={onAvaliar} className="mx-btn" style={{
              width: '100%', marginTop: 10, padding: '11px 14px',
              background: 'var(--accent)', boxShadow: '0 1px 0 rgba(191,54,12,0.25), 0 6px 16px rgba(230,74,25,0.25)'
            }}>
                ★ Avaliar a mentoria de {c.mentor.name.split(' ')[0]}
              </button>
            </>
          }
          {c.status === 'CONCLUIDO' && !c.needsRating &&
          <div className="mx-caption" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span>✓ Avaliada · {c.duracao || ''} computadas no histórico do mentor</span>
            </div>
          }
        </div>
      </div>
    </div>);

}

function AlunoListScreen({ onTab, onNova }) {
  const [filter, setFilter] = React.useState('todas');
  const cards = React.useMemo(() => {
    if (filter === 'mentoria') return ALUNO_CARDS.filter((c) => ['AGENDADO', 'EM_ANDAMENTO', 'PENDENTE_GESTOR'].includes(c.status));
    if (filter === 'matchmaking') return ALUNO_CARDS.filter((c) => c.status === 'ABERTO');
    if (filter === 'historico') return ALUNO_CARDS.filter((c) => ['CONCLUIDO', 'CANCELADO'].includes(c.status));
    return ALUNO_CARDS;
  }, [filter]);

  const counts = {
    todas: ALUNO_CARDS.length,
    mentoria: ALUNO_CARDS.filter((c) => ['AGENDADO', 'EM_ANDAMENTO', 'PENDENTE_GESTOR'].includes(c.status)).length,
    matchmaking: ALUNO_CARDS.filter((c) => c.status === 'ABERTO').length,
    historico: ALUNO_CARDS.filter((c) => ['CONCLUIDO', 'CANCELADO'].includes(c.status)).length
  };

  return (
    <PhoneScreen
      screenLabel="A01 Aluno · Solicitações"
      tab="solicitacoes" onTab={onTab}
      tabs={[
      { id: 'solicitacoes', label: 'Solicitações' },
      { id: 'historico', label: 'Histórico' },
      { id: 'notificacoes', label: 'Avisos' },
      { id: 'perfil', label: 'Perfil' }]
      }
      centerFab={{ label: 'Nova', onClick: onNova }}
      header={<>
        <AlunoHeader />
        <AlunoTabs active={filter} onChange={setFilter} counts={counts} />
      </>}
      scrollPadBottom={40}>
      
      <div style={{ padding: '12px 0 0' }}>
        {cards.map((c) => <CardAluno key={c.id} c={c} />)}
      </div>
    </PhoneScreen>);

}

Object.assign(window, { AlunoListScreen, ALUNO_CARDS, WhatsAppButton, CheckInOutCard });