// screen-mentor-mapa.jsx — Mentor: Descobrir (mapa do campus com pins + heat)

// Mentor logado: Bruno · domina os tópicos abaixo
const MENTOR_TOPICS = ['SQL', 'Postgres', 'React', 'TypeScript', 'Python'];

// Pinos de solicitações abertas no campus
const SOLICITACOES = [
  { id: 's1', x: 50, y: 27, name: 'Marina R.', avatar: 'MR', bg: 'linear-gradient(135deg,#e64a19,#bf360c)',
    titulo: 'Otimização de queries Postgres',
    topics: ['SQL', 'Postgres', 'Indexação'], curso: 'Eng. Comp. · 5º', sala: 'Bloco B · Sala 207' },
  { id: 's2', x: 78, y: 38, name: 'Lucas P.', avatar: 'LP', bg: 'linear-gradient(135deg,#4a78d6,#2854b4)',
    titulo: 'Hooks e arquitetura no projeto integrador',
    topics: ['React', 'TypeScript', 'Hooks'], curso: 'SI · 3º', sala: 'Bloco D · Sala 14' },
  { id: 's3', x: 26, y: 56, name: 'Joana M.', avatar: 'JM', bg: 'linear-gradient(135deg,#7a5fd0,#4a35a0)',
    titulo: 'Pandas para análise de notas',
    topics: ['Python', 'Pandas'], curso: 'Lic. Mat. · 4º', sala: 'Bloco A · Sala 305' },
  { id: 's4', x: 64, y: 65, name: 'Pedro S.', avatar: 'PS', bg: 'linear-gradient(135deg,#9070e0,#5a3fc0)',
    titulo: 'Integrais duplas — revisão P2',
    topics: ['Cálculo II', 'Álgebra Linear'], curso: 'Eng. Civil · 2º', sala: 'Bloco C · Sala 112' },
  { id: 's5', x: 41, y: 76, name: 'Sofia M.', avatar: 'SM', bg: 'linear-gradient(135deg,#506fc7,#2e4ea0)',
    titulo: 'Wireframes para o app da Atlética',
    topics: ['UX/UI', 'Figma'], curso: 'Design · 6º', sala: 'Bloco D · Sala 22' },
  { id: 's6', x: 84, y: 72, name: 'Camila I.', avatar: 'CI', bg: 'linear-gradient(135deg,#8a6fe0,#5c3fc0)',
    titulo: 'Modelagem de banco para TCC',
    topics: ['SQL', 'Postgres'], curso: 'CC · M2', sala: 'Bloco A · Sala 301' },
];

function computeMatch(topics) {
  const overlap = topics.filter(t => MENTOR_TOPICS.includes(t)).length;
  const total = topics.length || 1;
  return overlap / total;
}

function heatColor(ratio) {
  // Escala divergente: vermelho-alaranjado (alerta) → neutro → violeta (positivo)
  if (ratio >= 0.85) return { core: '#5D46B8', ring: 'rgba(93,70,184,0.32)',  label: 'match forte',  text: '#fff' };
  if (ratio >= 0.65) return { core: '#9C7BE0', ring: 'rgba(156,123,224,0.26)', label: 'positivo',     text: '#fff' };
  if (ratio >= 0.45) return { core: '#C9C3AE', ring: 'rgba(201,195,174,0.30)', label: 'neutro',       text: '#3a2f17' };
  if (ratio >= 0.25) return { core: '#F08F60', ring: 'rgba(240,143,96,0.26)',  label: 'baixo',        text: '#fff' };
  return                    { core: '#E64A19', ring: 'rgba(230,74,25,0.32)',   label: 'fora do match', text: '#fff' };
}

function CampusMap({ onPickPin }) {
  // 360 × 520 — mapa fictício, sem detalhe real. Só ruas abstratas + pins com nome.
  return (
    <div style={{
      position: 'relative',
      margin: '0 16px 14px',
      borderRadius: 22, overflow: 'hidden',
      background: '#EFEBE0',
      boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.06)',
    }}>
      <svg viewBox="0 0 360 520" width="100%" style={{ display: 'block' }}>
        <defs>
          <pattern id="dots" x="0" y="0" width="22" height="22" patternUnits="userSpaceOnUse">
            <rect width="22" height="22" fill="#EFEBE0"/>
            <circle cx="11" cy="11" r="0.7" fill="rgba(0,0,0,0.06)"/>
          </pattern>
        </defs>
        <rect width="360" height="520" fill="url(#dots)"/>

        {/* abstract streets — apenas linhas, sem rótulo de prédio */}
        <g fill="none">
          {/* halo (calçada) */}
          <g stroke="#E2DCC9" strokeWidth="26" strokeLinecap="round">
            <path d="M-10 130 C 80 110, 180 170, 280 130 S 380 140, 410 100"/>
            <path d="M40 -10 C 60 90, 30 180, 90 260 S 110 420, 70 540"/>
            <path d="M-10 360 C 100 380, 200 320, 300 380 S 380 350, 410 380"/>
            <path d="M280 -10 C 270 80, 320 160, 290 250 S 260 420, 310 540"/>
            <path d="M150 30 C 200 120, 130 200, 200 290 S 180 460, 220 530"/>
          </g>
          {/* asfalto */}
          <g stroke="#F7F2E2" strokeWidth="20" strokeLinecap="round">
            <path d="M-10 130 C 80 110, 180 170, 280 130 S 380 140, 410 100"/>
            <path d="M40 -10 C 60 90, 30 180, 90 260 S 110 420, 70 540"/>
            <path d="M-10 360 C 100 380, 200 320, 300 380 S 380 350, 410 380"/>
            <path d="M280 -10 C 270 80, 320 160, 290 250 S 260 420, 310 540"/>
            <path d="M150 30 C 200 120, 130 200, 200 290 S 180 460, 220 530"/>
          </g>
          {/* linhas centrais tracejadas */}
          <g stroke="#D6CFB5" strokeWidth="1.2" strokeDasharray="4 5" opacity="0.85">
            <path d="M-10 130 C 80 110, 180 170, 280 130 S 380 140, 410 100"/>
            <path d="M40 -10 C 60 90, 30 180, 90 260 S 110 420, 70 540"/>
            <path d="M-10 360 C 100 380, 200 320, 300 380 S 380 350, 410 380"/>
            <path d="M280 -10 C 270 80, 320 160, 290 250 S 260 420, 310 540"/>
          </g>
        </g>

        {/* nomes fictícios de ruas */}
        <g style={{ fontFamily: 'Inter, sans-serif', fontSize: 9, fontWeight: 600, fill: '#A99E7E', letterSpacing: 0.4 }}>
          <text x="60" y="124" transform="rotate(-2 60 124)">av. das mentorias</text>
          <text x="240" y="384" transform="rotate(-3 240 384)">r. dos saberes</text>
          <text x="76" y="220" transform="rotate(76 76 220)">tv. da curiosidade</text>
        </g>

        {/* alguns elementos pontuais sutis: pracinhas/quadras */}
        <g opacity="0.55">
          <circle cx="170" cy="60" r="10" fill="#C9D7B6"/>
          <circle cx="330" cy="240" r="12" fill="#C9D7B6"/>
          <circle cx="50" cy="450" r="14" fill="#C9D7B6"/>
          <rect x="200" y="200" width="22" height="22" rx="4" fill="#D8D2BC"/>
          <rect x="100" y="320" width="22" height="14" rx="3" fill="#D8D2BC"/>
        </g>
      </svg>

      {/* Pinos — agora cada um com o nome do solicitante */}
      {SOLICITACOES.map(s => {
        const ratio = computeMatch(s.topics);
        const heat = heatColor(ratio);
        return (
          <button key={s.id} onClick={() => onPickPin(s)} style={{
            position: 'absolute',
            left: `${s.x}%`, top: `${s.y}%`, transform: 'translate(-50%,-100%)',
            border: 0, background: 'transparent', cursor: 'pointer', padding: 0,
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
          }}>
            <div style={{
              position: 'relative',
              width: 44, height: 44,
              filter: 'drop-shadow(0 3px 4px rgba(0,0,0,0.18))',
            }}>
              <span style={{
                position: 'absolute', inset: -6, borderRadius: '50%',
                background: heat.ring,
                animation: ratio >= 0.85 ? 'mxHeat 1.6s ease-out infinite' : 'none',
              }}/>
              <div style={{
                width: 44, height: 44, borderRadius: '50%',
                background: heat.core,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                border: '3px solid #fff',
                position: 'relative',
              }}>
                <div style={{
                  width: 30, height: 30, borderRadius: '50%',
                  background: s.bg,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: 'var(--f-head)', fontWeight: 700, fontSize: 11, color: '#fff',
                }}>{s.avatar}</div>
              </div>
              <div style={{
                position: 'absolute', bottom: -6, left: '50%', transform: 'translateX(-50%) rotate(45deg)',
                width: 10, height: 10, background: heat.core,
                borderRight: '3px solid #fff', borderBottom: '3px solid #fff',
                borderRadius: 2,
              }}/>
            </div>
            {/* etiqueta com nome */}
            <span style={{
              padding: '2px 8px', borderRadius: 999,
              background: 'rgba(255,255,255,0.95)',
              backdropFilter: 'blur(8px)',
              boxShadow: '0 1px 3px rgba(0,0,0,0.10)',
              fontFamily: 'var(--f-body)', fontSize: 10, fontWeight: 600,
              color: 'var(--text)', whiteSpace: 'nowrap',
              marginTop: 2,
            }}>{s.name}</span>
          </button>
        );
      })}

      {/* Heat legend */}
      <div style={{
        position: 'absolute', left: 12, bottom: 12,
        padding: '8px 10px', borderRadius: 12,
        background: 'rgba(255,255,255,0.94)',
        backdropFilter: 'blur(8px)',
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        fontFamily: 'var(--f-body)', fontSize: 10,
        minWidth: 168,
      }}>
        <div style={{ fontWeight: 600, color: 'var(--text)', marginBottom: 5, textTransform: 'uppercase', letterSpacing: 0.5, fontSize: 9 }}>
          Heat de match · escala divergente
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#E64A19' }}/>
          <span style={{ flex: 1, height: 5, borderRadius: 99,
            background: 'linear-gradient(90deg, #E64A19, #F08F60, #C9C3AE, #9C7BE0, #5D46B8)' }}/>
          <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#5D46B8' }}/>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 3, color: 'var(--text-2)', fontSize: 9.5 }}>
          <span>fora</span><span>neutro</span><span>forte</span>
        </div>
      </div>

      {/* badge de mapa fictício */}
      <div style={{
        position: 'absolute', top: 12, right: 12,
        padding: '3px 8px', borderRadius: 8,
        background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(6px)',
        color: 'rgba(255,255,255,0.92)',
        fontFamily: 'JetBrains Mono, monospace', fontSize: 9, fontWeight: 600,
        letterSpacing: 0.6, textTransform: 'uppercase',
      }}>mapa ilustrativo</div>

      <style>{`
        @keyframes mxHeat {
          0% { transform: scale(0.85); opacity: 0.65; }
          70% { transform: scale(1.6); opacity: 0; }
          100% { opacity: 0; }
        }
      `}</style>
    </div>
  );
}

function MapaSummary() {
  return (
    <div style={{
      display: 'flex', gap: 10, padding: '0 20px 12px',
    }}>
      {[
        { label: '6', sub: 'solicitações no campus' },
        { label: '3', sub: 'fortemente compatíveis' },
        { label: '47min', sub: 'desde a última publicada' },
      ].map((s,i) => (
        <div key={i} style={{
          flex: 1, padding: 12, borderRadius: 14,
          background: '#fff', border: '1px solid var(--border)',
        }}>
          <div style={{ fontFamily: 'var(--f-head)', fontWeight: 700, fontSize: 18, color: 'var(--text)', letterSpacing: -0.3 }}>{s.label}</div>
          <div className="mx-caption" style={{ fontSize: 10.5, marginTop: 1 }}>{s.sub}</div>
        </div>
      ))}
    </div>
  );
}

function MentorMapaHeader({ name = 'Bruno' }) {
  return (
    <div style={{ padding: '12px 20px 12px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <MxLogo size={20}/>
          <span style={{ fontFamily: 'var(--f-head)', fontWeight: 700, fontSize: 16, letterSpacing: -0.2, color: 'var(--primary-dark)' }}>
            mentorix
          </span>
          <span style={{
            fontSize: 9, fontWeight: 700, letterSpacing: 0.6, textTransform: 'uppercase',
            color: 'var(--primary-dark)', background: 'var(--primary-light)',
            padding: '2px 6px', borderRadius: 6,
          }}>Mentor</span>
        </div>
        <Avatar initials="BY" size={32} color="linear-gradient(135deg,#506fc7,#2e4ea0)"/>
      </div>
      <h1 className="mx-h1" style={{ fontSize: 22 }}>Olá, {name}.</h1>
      <p className="mx-caption" style={{ marginTop: 2 }}>Pinos do campus em tempo real — quanto mais quente, maior o casamento de assuntos.</p>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 8, flexWrap: 'wrap' }}>
        <span className="mx-caption" style={{ fontSize: 10, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: 0.6, fontWeight: 600 }}>
          seus assuntos
        </span>
        {MENTOR_TOPICS.map(t => <TopicBadge key={t} tone="primary">#{t}</TopicBadge>)}
      </div>
    </div>
  );
}

function MentorMapaScreen({ onTab, onPickPin }) {
  return (
    <PhoneScreen
      screenLabel="M01 Mentor · Descobrir"
      tab="mapa" onTab={onTab}
      tabs={[
        { id: 'mapa',      label: 'Descobrir' },
        { id: 'mentorias', label: 'Mentorias' },
        { id: 'horas',     label: 'Horas' },
        { id: 'perfil',    label: 'Perfil' },
      ]}
      header={<MentorMapaHeader/>}
    >
      <div style={{ paddingTop: 12 }}>
        <MapaSummary/>
        <CampusMap onPickPin={onPickPin}/>
        <div style={{ padding: '0 20px 8px' }}>
          <div className="mx-caption" style={{ textTransform: 'uppercase', letterSpacing: 0.5, fontSize: 10, fontWeight: 600, marginBottom: 8 }}>
            Mais quentes agora
          </div>
          {SOLICITACOES
            .map(s => ({ s, r: computeMatch(s.topics) }))
            .sort((a,b) => b.r - a.r)
            .slice(0, 3)
            .map(({ s, r }) => {
              const heat = heatColor(r);
              return (
                <button key={s.id} onClick={() => onPickPin(s)} className="mx-card" style={{
                  margin: '0 0 8px', padding: 12, width: '100%',
                  display: 'flex', alignItems: 'center', gap: 10,
                  border: 0, textAlign: 'left', cursor: 'pointer', background: '#fff',
                }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: '50%',
                    background: heat.core, color: '#fff',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontFamily: 'var(--f-head)', fontWeight: 700, fontSize: 13,
                    border: '2px solid #fff', boxShadow: `0 0 0 2px ${heat.core}`,
                  }}>{s.avatar}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {s.titulo}
                    </div>
                    <div className="mx-caption" style={{ fontSize: 11, marginTop: 1 }}>
                      {s.name} · {s.sala}
                    </div>
                  </div>
                  <span style={{
                    fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 999,
                    color: '#fff', background: heat.core, letterSpacing: 0.3,
                  }}>{Math.round(r*100)}%</span>
                </button>
              );
            })}
        </div>
      </div>
    </PhoneScreen>
  );
}

Object.assign(window, { MentorMapaScreen, SOLICITACOES, MENTOR_TOPICS, computeMatch, heatColor });
