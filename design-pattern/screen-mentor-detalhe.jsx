// screen-mentor-detalhe.jsx — Mentor: detalhe da solicitação (vista do mentor)

function MatchMeter({ ratio, count, total }) {
  const heat = heatColor(ratio);
  return (
    <div style={{
      padding: '14px 16px',
      background: 'rgba(255,255,255,0.95)',
      backdropFilter: 'blur(20px)',
      borderRadius: 16,
      border: '1px solid rgba(0,0,0,0.06)',
      margin: '0 16px',
      transform: 'translateY(-30px)',
      boxShadow: '0 10px 24px rgba(0,0,0,0.10)'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <div className="mx-caption" style={{
          fontFamily: 'JetBrains Mono, monospace', fontSize: 10, fontWeight: 600,
          letterSpacing: 0.8, textTransform: 'uppercase', color: heat.core
        }}>Match {heat.label}</div>
        <div style={{ fontFamily: 'var(--f-head)', fontWeight: 700, fontSize: 16, color: 'var(--text)' }}>
          {count}/{total} <span style={{ color: 'var(--text-3)', fontWeight: 500 }}>assuntos</span>
        </div>
      </div>
      <div style={{ height: 6, borderRadius: 99, background: '#F1F1F4', overflow: 'hidden' }}>
        <div style={{
          width: `${ratio * 100}%`, height: '100%',
          background: `linear-gradient(90deg, ${heat.core}99, ${heat.core})`,
          borderRadius: 99, transition: 'width .4s ease'
        }} />
      </div>
    </div>);

}

function SolicitacaoDetalheScreen({ s, onTab, onBack, onAccept, onReject, viewer = 'mentor', mentor }) {
  const isAluno = viewer === 'aluno';
  const r = computeMatch(s.topics);
  const overlap = s.topics.filter((t) => MENTOR_TOPICS.includes(t)).length;
  const slots = [
  { id: 'sl1', day: 'Seg 26 mai', time: '14h00 – 15h00', room: 'Bloco B · 207' },
  { id: 'sl2', day: 'Ter 27 mai', time: '10h00 – 11h00', room: 'Bloco D · 14' },
  { id: 'sl3', day: 'Qui 29 mai', time: '14h00 – 15h00', room: 'Bloco B · 207' }];

  const [picked, setPicked] = React.useState('sl1');
  const [decision, setDecision] = React.useState(null);

  if (decision === 'accepted' && !isAluno) {
    return <AcceptedConfirmScreen s={s} slot={slots.find((x) => x.id === picked)} onTab={onTab} />;
  }

  const matched = mentor || { name: 'Bruno Yagami', avatar: 'BY', bg: 'linear-gradient(135deg,#506fc7,#2e4ea0)',
    curso: 'Sistemas de Informação · 7º', phone: '(85) 9 8245-1109' };
  const lockedSlot = slots[0];

  return (
    <IOSDevice width={390} height={812}>
      <div data-screen-label={isAluno ? "A03 Aluno · Detalhe solicitação" : "M02 Mentor · Detalhe solicitação"} style={{
        position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
        background: 'var(--bg)'
      }}>
        <div style={{ height: 47, flexShrink: 0, position: 'absolute', top: 0, left: 0, right: 0, zIndex: 20 }} />

        <div className="mx-scroll" style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden' }}>
          <RoomHero sala={s.sala} />
          <button onClick={onBack} style={{
            position: 'absolute', top: 56, left: 16, zIndex: 30,
            width: 38, height: 38, borderRadius: '50%', border: 0, cursor: 'pointer',
            background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(10px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path d="M15 6l-6 6 6 6" stroke="var(--text)" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>

          {/* Topo: para mentor o medidor, para aluno o status atual */}
          {isAluno ?
          <AlunoStatusBanner status="AGENDADO" when={`${lockedSlot.day} · ${lockedSlot.time}`} sala={lockedSlot.room} /> :

          <MatchMeter ratio={r} count={overlap} total={s.topics.length} />
          }

          <div style={{ padding: '0 20px 20px', marginTop: -16 }}>
            {/* Pessoa */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18 }}>
              <Avatar initials={s.avatar} color={s.bg} size={48} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <h2 className="mx-h2" style={{ fontSize: 18 }}>{isAluno ? 'Você (solicitante)' : s.name}</h2>
                <p className="mx-caption" style={{ marginTop: 2 }}>{s.curso} · matr. 2024105432</p>
              </div>
              {!isAluno && <StatusPill status="ABERTO" size="sm" />}
            </div>

            <h1 className="mx-h1" style={{ fontSize: 21, marginBottom: 8, lineHeight: 1.2 }}>
              {s.titulo}
            </h1>
            <p className="mx-body" style={{ color: 'var(--text-2)', marginBottom: 16, lineHeight: 1.5 }}>
              {longDescOf(s.id)}
            </p>

            <div className="mx-caption" style={{ textTransform: 'uppercase', letterSpacing: 0.5, fontSize: 10, fontWeight: 600, marginBottom: 8 }}>
              Assuntos solicitados
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 18 }}>
              {s.topics.map((t) => {
                const hot = !isAluno && MENTOR_TOPICS.includes(t);
                return (
                  <span key={t} style={{
                    display: 'inline-flex', alignItems: 'center', gap: 4,
                    padding: '5px 10px', borderRadius: 999,
                    background: hot ? 'var(--accent-light)' : isAluno ? 'var(--primary-light)' : '#F1F1F4',
                    color: hot ? 'var(--accent-dark)' : isAluno ? 'var(--primary-dark)' : 'var(--text-2)',
                    fontFamily: 'var(--f-body)', fontSize: 12, fontWeight: 500
                  }}>
                    {hot &&
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2C9 6 6 8 6 13a6 6 0 1 0 12 0c0-2-1-3-1-5 0-3-3-5-5-6z" />
                      </svg>
                    }
                    #{t}
                  </span>);

              })}
            </div>

            {/* Sala */}
            <div style={{
              padding: 14, borderRadius: 14, background: 'var(--surface)',
              display: 'flex', gap: 12, alignItems: 'center', marginBottom: 18
            }}>
              <div style={{
                width: 38, height: 38, borderRadius: 10,
                background: 'var(--primary-light)', color: 'var(--primary)',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M12 21s-7-5-7-12a7 7 0 1 1 14 0c0 7-7 12-7 12z" stroke="currentColor" strokeWidth="2" />
                  <circle cx="12" cy="9" r="2.5" stroke="currentColor" strokeWidth="2" />
                </svg>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 600 }}>{s.sala}</div>
                <div className="mx-caption" style={{ fontSize: 11 }}>{isAluno ? 'definido pelo gestor' : 'livre nos horários abaixo · capacidade 6'}</div>
              </div>
            </div>

            {isAluno ?
            <>
                <div className="mx-caption" style={{ textTransform: 'uppercase', letterSpacing: 0.5, fontSize: 10, fontWeight: 600, marginBottom: 8 }}>
                  Mentor que aceitou
                </div>
                <div className="mx-card" style={{ padding: 14, display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18, border: '1px solid var(--border)' }}>
                  <Avatar initials={matched.avatar} color={matched.bg} size={44} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 600 }}>{matched.name}</div>
                    <div className="mx-caption" style={{ fontSize: 11 }}>{matched.curso}</div>
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 8px', borderRadius: 999, background: 'var(--secondary-light)', color: 'var(--secondary-dark)' }}>
                    ✓ confirmado
                  </span>
                </div>
              </> :

            <>
                <div className="mx-caption" style={{ textTransform: 'uppercase', letterSpacing: 0.5, fontSize: 10, fontWeight: 600, marginBottom: 8 }}>
                  Horários compatíveis
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 18 }}>
                  {slots.map((sl) => {
                  const on = picked === sl.id;
                  return (
                    <button key={sl.id} onClick={() => setPicked(sl.id)} style={{
                      textAlign: 'left', padding: '12px 14px', borderRadius: 12,
                      border: on ? '2px solid var(--primary)' : '1px solid var(--border)',
                      background: on ? 'var(--primary-light)' : '#fff',
                      cursor: 'pointer',
                      display: 'flex', alignItems: 'center', gap: 10
                    }}>
                        <div style={{
                        width: 18, height: 18, borderRadius: '50%',
                        border: on ? '5px solid var(--primary)' : '2px solid var(--border)',
                        background: '#fff', flexShrink: 0
                      }} />
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{sl.day} · {sl.time}</div>
                          <div className="mx-caption" style={{ fontSize: 11 }}>{sl.room}</div>
                        </div>
                      </button>);

                })}
                </div>
              </>
            }
          </div>
        </div>

        {/* Sticky CTA bar — muda por viewer */}
        <div style={{
          flexShrink: 0, padding: '12px 16px 12px',
          borderTop: '1px solid var(--border)', background: '#fff',
          display: 'flex', gap: 10
        }}>
          {isAluno ?
          <>
              <button className="mx-btn ghost" style={{ flex: 1 }}>
                Cancelar
              </button>
              <a href={`https://wa.me/55${matched.phone.replace(/\D/g, '')}`}
            onClick={(e) => e.preventDefault()}
            style={{
              flex: 2, padding: '12px 0', borderRadius: 12,
              background: '#25D366', color: '#fff', textDecoration: 'none',
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              fontFamily: 'var(--f-body)', fontSize: 14, fontWeight: 600,
              boxShadow: '0 1px 0 rgba(17,80,42,0.25), 0 6px 14px rgba(37,211,102,0.25)'
            }}>
                <svg width="16" height="16" viewBox="0 0 32 32" fill="currentColor">
                  <path d="M16 3C9 3 3.5 8.5 3.5 15.5c0 2.3.6 4.5 1.7 6.4L3 29l7.4-2.1c1.8 1 3.7 1.5 5.7 1.5 7 0 12.5-5.5 12.5-12.5S23 3 16 3Zm7.4 17.6c-.3.9-1.7 1.8-2.5 1.9-.6.1-1.4.1-2.3-.2-.5-.2-1.2-.4-2-.8-3.6-1.6-5.9-5.2-6.1-5.4-.2-.2-1.5-2-1.5-3.8 0-1.9.9-2.8 1.3-3.2.3-.4.7-.5 1-.5h.7c.2 0 .5-.1.8.6.3.7 1 2.5 1.1 2.7.1.2.1.4 0 .7-.1.2-.2.4-.4.6-.2.2-.4.5-.6.6-.2.2-.4.4-.2.8.2.4 1 1.6 2.1 2.6 1.4 1.3 2.6 1.7 3 1.9.4.2.6.2.8-.1.2-.3.9-1 1.1-1.4.2-.4.4-.3.7-.2.3.1 2 1 2.4 1.1.4.2.6.3.7.5.1.1.1.7-.2 1.4Z" />
                </svg>
                Falar no WhatsApp
              </a>
            </> :

          <>
              <button onClick={() => onReject && onReject(s)} style={{
                flex: 1, padding: '12px 18px', borderRadius: 12, cursor: 'pointer',
                background: 'var(--accent-light)', color: 'var(--accent-dark)',
                border: '1.5px solid var(--accent)',
                fontFamily: 'var(--f-body)', fontWeight: 600, fontSize: 14,
                letterSpacing: -0.1,
              }} data-comment-anchor="543b3b77d6-button-238-15">
                Recusar
              </button>
              <button onClick={() => {setDecision('accepted');onAccept && onAccept(s, picked);}}
            className="mx-btn" style={{ flex: 2 }}>
                Aceitar mentoria
              </button>
            </>
          }
        </div>
        <div style={{ height: 22, flexShrink: 0 }} />
      </div>
    </IOSDevice>);

}

function AlunoStatusBanner({ status, when, sala }) {
  const meta = STATUS_META[status];
  return (
    <div style={{
      padding: '14px 16px',
      background: 'rgba(255,255,255,0.96)',
      backdropFilter: 'blur(20px)',
      borderRadius: 16,
      border: '1px solid rgba(0,0,0,0.06)',
      margin: '0 16px',
      transform: 'translateY(-30px)',
      boxShadow: '0 10px 24px rgba(0,0,0,0.10)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div className="mx-caption" style={{
            fontFamily: 'JetBrains Mono, monospace', fontSize: 10, fontWeight: 600,
            letterSpacing: 0.8, textTransform: 'uppercase', color: 'var(--text-2)', marginBottom: 4
          }}>Sua solicitação</div>
          <div style={{ fontFamily: 'var(--f-head)', fontWeight: 700, fontSize: 16, color: 'var(--text)' }}>
            {when}
          </div>
        </div>
        <StatusPill status={status} pulse />
      </div>
    </div>);

}

function RoomHero({ sala }) {
  // Estilizada — placeholder de foto de sala
  return (
    <div style={{
      position: 'relative', height: 260, overflow: 'hidden',
      background: 'linear-gradient(135deg, #3a2885 0%, #5D46B8 60%, #7a5fd0 100%)'
    }}>
      {/* abstract isometric room */}
      <svg viewBox="0 0 390 260" width="100%" height="260" style={{ position: 'absolute', inset: 0 }}>
        <defs>
          <linearGradient id="floor" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#E8DFFE" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#E8DFFE" stopOpacity="0" />
          </linearGradient>
        </defs>
        {/* big window */}
        <rect x="40" y="40" width="200" height="120" rx="6" fill="rgba(255,255,255,0.10)" stroke="rgba(255,255,255,0.18)" />
        <line x1="140" y1="40" x2="140" y2="160" stroke="rgba(255,255,255,0.18)" />
        <line x1="40" y1="100" x2="240" y2="100" stroke="rgba(255,255,255,0.18)" />
        {/* whiteboard */}
        <rect x="270" y="56" width="100" height="64" rx="3" fill="rgba(255,255,255,0.92)" />
        <line x1="285" y1="75" x2="350" y2="75" stroke="#5D46B8" strokeWidth="2" />
        <line x1="285" y1="85" x2="320" y2="85" stroke="#E64A19" strokeWidth="1.5" />
        <line x1="285" y1="95" x2="340" y2="95" stroke="#5D46B8" strokeWidth="1.5" />
        {/* table */}
        <ellipse cx="180" cy="220" rx="140" ry="22" fill="rgba(0,0,0,0.25)" />
        <rect x="60" y="180" width="240" height="34" rx="4" fill="#F0EAD8" />
        <rect x="60" y="180" width="240" height="6" fill="#D8CFB1" />
        {/* chairs */}
        {[80, 130, 180, 230, 280].map((cx, i) =>
        <g key={i}>
            <rect x={cx - 10} y="218" width="20" height="6" rx="2" fill="rgba(0,0,0,0.3)" />
            <rect x={cx - 8} y="222" width="3" height="14" fill="rgba(0,0,0,0.3)" />
            <rect x={cx + 5} y="222" width="3" height="14" fill="rgba(0,0,0,0.3)" />
          </g>
        )}
        {/* light from window */}
        <polygon points="40,160 240,160 360,260 0,260" fill="url(#floor)" />
      </svg>

      {/* monospace placeholder badge */}
      <div style={{
        position: 'absolute', top: 12, right: 14,
        padding: '4px 8px', borderRadius: 8,
        background: 'rgba(0,0,0,0.35)',
        color: 'rgba(255,255,255,0.85)',
        fontFamily: 'JetBrains Mono, monospace', fontSize: 10, fontWeight: 600,
        letterSpacing: 0.5, textTransform: 'uppercase'
      }}>foto da sala</div>

      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        padding: '0 16px 14px',
        background: 'linear-gradient(180deg, transparent 0%, rgba(58,40,133,0.5) 100%)'
      }}>
        <span style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          padding: '4px 10px', borderRadius: 999,
          background: 'rgba(255,255,255,0.18)', backdropFilter: 'blur(10px)',
          fontFamily: 'var(--f-body)', fontSize: 11, fontWeight: 500, color: '#fff',
          letterSpacing: 0.2
        }}>
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none">
            <path d="M12 21s-7-5-7-12a7 7 0 1 1 14 0c0 7-7 12-7 12z" stroke="#fff" strokeWidth="2" />
            <circle cx="12" cy="9" r="2.5" stroke="#fff" strokeWidth="2" />
          </svg>
          {sala}
        </span>
      </div>
    </div>);

}

function AcceptedConfirmScreen({ s, slot, onTab }) {
  return (
    <PhoneScreen
      screenLabel="M02b Mentor · Confirmação"
      tab="mentorias" onTab={onTab}
      tabs={[
      { id: 'mapa', label: 'Descobrir' },
      { id: 'mentorias', label: 'Mentorias' },
      { id: 'horas', label: 'Horas' },
      { id: 'perfil', label: 'Perfil' }]
      }>
      
      <div style={{ padding: '40px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18, textAlign: 'center' }}>
        <div style={{
          width: 72, height: 72, borderRadius: '50%',
          background: 'var(--secondary-light)', color: 'var(--secondary)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 0 0 12px rgba(46,125,50,0.08)',
          animation: 'mxPop 0.5s ease'
        }}>
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none">
            <path d="M4 12.5l5 5L20 6.5" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <div>
          <h1 className="mx-h1" style={{ fontSize: 22 }}>Mentoria criada.</h1>
          <p className="mx-body" style={{ color: 'var(--text-2)', marginTop: 6, maxWidth: 280 }}>
            A solicitação de {s.name} agora está aguardando o gestor liberar a sala.
          </p>
        </div>
        <div className="mx-card" style={{ width: '100%', padding: 14, display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Avatar initials={s.avatar} color={s.bg} size={38} />
            <div style={{ flex: 1, textAlign: 'left' }}>
              <div style={{ fontSize: 13, fontWeight: 600 }}>{s.name}</div>
              <div className="mx-caption" style={{ fontSize: 11 }}>{s.titulo}</div>
            </div>
            <StatusPill status="PENDENTE_GESTOR" size="sm" />
          </div>
          <div style={{ borderTop: '1px solid var(--border)' }} />
          <div style={{ display: 'flex', gap: 12, textAlign: 'left' }}>
            <div style={{ flex: 1 }}>
              <div className="mx-caption" style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.5, fontWeight: 600 }}>Quando</div>
              <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)' }}>{slot.day}</div>
              <div style={{ fontSize: 12, color: 'var(--text-2)' }}>{slot.time}</div>
            </div>
            <div style={{ flex: 1 }}>
              <div className="mx-caption" style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.5, fontWeight: 600 }}>Onde</div>
              <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)' }}>{slot.room}</div>
            </div>
          </div>
        </div>
        <button className="mx-btn" style={{ width: '100%' }}>
          Ver no calendário de mentorias
        </button>
      </div>
      <style>{`@keyframes mxPop { 0% { transform: scale(0.2); opacity: 0; } 70% { transform: scale(1.08); } 100% { transform: scale(1); opacity: 1; } }`}</style>
    </PhoneScreen>);

}

function longDescOf(id) {
  return {
    s1: 'Tenho um relatório que demora 9 segundos pra carregar a tabela de pedidos da última semana. Já tentei mexer em índices mas não tô conseguindo identificar onde está o gargalo. Gostaria de revisar EXPLAIN ANALYZE e estratégias de indexação em colunas com cardinalidade baixa.',
    s2: 'Estou estruturando a tela de pedidos e tô caindo em prop drilling. Quero discutir custom hooks, separação por feature e como aplicar Context sem matar performance.',
    s3: 'TCC sobre desempenho acadêmico, preciso comparar duas amostras independentes. Suspeito que minha amostra não é normal — não sei se uso t-test ou Mann-Whitney.',
    s4: 'Volume 5 do Stewart, exercícios 3 ao 9. Travei em mudança de variáveis com coordenadas polares.',
    s5: 'Estou no projeto da Atlética. Tenho 6 fluxos e nenhum sketch fechado. Queria critique e ajuda pra priorizar.',
    s6: 'TCC modelagem de banco — relacionamentos N:N, normalização até 3FN, queria revisar antes de fechar o ER.'
  }[id] || 'Detalhes da solicitação.';
}

Object.assign(window, { SolicitacaoDetalheScreen });