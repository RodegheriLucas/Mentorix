// design-system.jsx — Tokens overview artboard

function lerpColor(c1, c2, t) {
  const hex = (s) => [parseInt(s.slice(1,3),16), parseInt(s.slice(3,5),16), parseInt(s.slice(5,7),16)];
  const [r1,g1,b1] = hex(c1);
  const [r2,g2,b2] = hex(c2);
  const m = (a,b) => Math.round(a + (b - a) * t);
  return `rgb(${m(r1,r2)},${m(g1,g2)},${m(b1,b2)})`;
}

function Swatch({ name, hex, value }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <div style={{
        width: '100%', height: 76, borderRadius: 12,
        background: hex,
        border: hex === '#FFFFFF' ? '1px solid var(--border)' : 'none',
        position: 'relative', overflow: 'hidden',
      }}>
        <span style={{
          position: 'absolute', bottom: 8, left: 10,
          fontFamily: 'JetBrains Mono, monospace', fontSize: 11, fontWeight: 600,
          color: name.includes('light') || hex === '#FFFFFF' || hex === '#F8F9FA' ? 'var(--text)' : '#fff',
          opacity: 0.9,
        }}>{hex}</span>
      </div>
      <div>
        <div style={{ fontFamily: 'var(--f-body)', fontSize: 12, fontWeight: 600, color: 'var(--text)' }}>{name}</div>
        <div className="mx-caption" style={{ fontSize: 11 }}>{value}</div>
      </div>
    </div>
  );
}

function TypeRow({ name, font, size, weight, sample }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'baseline', gap: 18,
      padding: '14px 0', borderBottom: '1px solid var(--border)',
    }}>
      <div style={{ width: 100, flexShrink: 0 }}>
        <div style={{ fontFamily: 'var(--f-body)', fontWeight: 600, fontSize: 12, color: 'var(--text)' }}>{name}</div>
        <div className="mx-caption" style={{ fontSize: 10, color: 'var(--text-3)' }}>{font}, {weight}, {size}</div>
      </div>
      <div style={{
        flex: 1, fontFamily: font.includes('Jakarta') ? 'var(--f-head)' : 'var(--f-body)',
        fontWeight: weight, fontSize: parseInt(size), color: 'var(--text)',
        letterSpacing: parseInt(size) > 20 ? -0.3 : 0,
        lineHeight: 1.1,
      }}>{sample}</div>
    </div>
  );
}

function DesignSystemArtboard() {
  return (
    <div data-screen-label="00 Design System" style={{
      width: 1280, padding: 48, background: '#fff', boxSizing: 'border-box',
      fontFamily: 'var(--f-body)',
      boxShadow: '0 30px 60px rgba(0,0,0,0.10), 0 0 0 1px rgba(0,0,0,0.06)',
      borderRadius: 16,
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 36 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
            <MxLogo size={34}/>
            <span style={{ fontFamily: 'var(--f-head)', fontWeight: 700, fontSize: 28, letterSpacing: -0.5, color: 'var(--primary-dark)' }}>
              mentorix
            </span>
          </div>
          <h1 style={{ fontFamily: 'var(--f-head)', fontWeight: 700, fontSize: 42, letterSpacing: -1, margin: 0, lineHeight: 1.05 }}>
            Conhecimento e espaço<br/>na mesma conversa.
          </h1>
          <p className="mx-body" style={{ marginTop: 14, maxWidth: 540, color: 'var(--text-2)', fontSize: 15 }}>
            Aluno publica uma solicitação no matchmaking. Mentor abre o app e vê um mapa do campus com pinos coloridos — quanto mais quente o pino, maior o casamento de assuntos. Gestor aprova a sala, faz check-in e fecha o ciclo. WhatsApp do mentor para qualquer outra dúvida.
          </p>
        </div>
        <div style={{
          display: 'flex', flexDirection: 'column', gap: 8,
          padding: '14px 18px', borderRadius: 14,
          background: 'var(--surface)', width: 240,
        }}>
          <div className="mx-caption" style={{ textTransform: 'uppercase', letterSpacing: 0.6, fontSize: 10, fontWeight: 600 }}>
            Regra 60-30-10
          </div>
          <div style={{ display: 'flex', height: 14, borderRadius: 99, overflow: 'hidden' }}>
            <div style={{ width: '60%', background: '#fff', borderRight: '1px solid var(--border)' }}/>
            <div style={{ width: '30%', background: 'var(--primary)' }}/>
            <div style={{ width: '7%', background: 'var(--secondary)' }}/>
            <div style={{ width: '3%', background: 'var(--accent)' }}/>
          </div>
          <div className="mx-caption" style={{ fontSize: 11, lineHeight: 1.4 }}>
            60% neutros · 30% roxo · 10% verde + laranja
          </div>
        </div>
      </div>

      {/* Triade */}
      <div style={{ marginBottom: 36 }}>
        <SectionTitle eyebrow="01 Tríade equilátera" title="Cores governantes"/>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginTop: 16 }}>
          <ColorBlock
            label="Violeta Acadêmico"
            sub="Sabedoria · prestígio · transformação"
            role="Primária · UniMatch"
            base="#5D46B8" light="#ECE9F9" dark="#3A2885"/>
          <ColorBlock
            label="Verde Logístico"
            sub="Segurança · permissão · estabilidade"
            role="Secundária · VagaLivre"
            base="#2E7D32" light="#E8F5E9" dark="#1B5E20"/>
          <ColorBlock
            label="Vermelho-Alaranjado"
            sub="Urgência · ação · alerta"
            role="Accent · Gatilho físico"
            base="#E64A19" light="#FBE9E7" dark="#BF360C"/>
        </div>
      </div>

      {/* Neutrals + typography side by side */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: 32, marginBottom: 36 }}>
        <div>
          <SectionTitle eyebrow="02 Neutros" title="60% espaço dominante"/>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginTop: 16 }}>
            <Swatch name="background" hex="#FFFFFF" value="Superfície do app"/>
            <Swatch name="surface" hex="#F8F9FA" value="Cards vazios"/>
            <Swatch name="border" hex="#E0E0E0" value="Inputs · divisórias"/>
            <Swatch name="text.primary" hex="#121212" value="Títulos, corpo"/>
            <Swatch name="text.secondary" hex="#666666" value="Datas, hint"/>
            <Swatch name="text.muted" hex="#9E9E9E" value="Ícones off"/>
          </div>
        </div>
        <div>
          <SectionTitle eyebrow="03 Tipografia" title="Alta mobilidade"/>
          <div style={{ marginTop: 6 }}>
            <TypeRow name="H1" font="Plus Jakarta Sans" size="24px" weight="700" sample="Suas mentorias"/>
            <TypeRow name="H2" font="Plus Jakarta Sans" size="20px" weight="700" sample="Otimização de queries"/>
            <TypeRow name="H3" font="Plus Jakarta Sans" size="16px" weight="500" sample="Letícia Vasconcelos"/>
            <TypeRow name="Body" font="Inter" size="14px" weight="400" sample="Sessões objetivas, com problemas reais."/>
            <TypeRow name="Caption" font="Inter" size="12px" weight="400" sample="Bloco B · Sala 207 · em 47 min"/>
          </div>
        </div>
      </div>

      {/* Status mapping */}
      <div style={{ marginBottom: 36 }}>
        <SectionTitle eyebrow="04 Estado da mentoria" title="Mapeamento cromático do ciclo"/>
        <div style={{
          display: 'flex', gap: 0, marginTop: 16, position: 'relative',
          background: 'var(--surface)', padding: 18, borderRadius: 18,
        }}>
          {[
            { s: 'ABERTO',          t: 'solicitação publicada no matchmaking' },
            { s: 'ACEITO',          t: 'mentor escolheu slot · cria agendamento' },
            { s: 'PENDENTE_GESTOR', t: 'aguardando gestor enviar instruções' },
            { s: 'AGENDADO',        t: 'compromisso físico com hora marcada' },
            { s: 'EM_ANDAMENTO',    t: 'check-in feito · sala em uso' },
            { s: 'CONCLUIDO',       t: 'check-out · horas a creditar pós-avaliação' },
          ].map((it, i, arr) => (
            <React.Fragment key={it.s}>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, padding: '0 4px' }}>
                <div style={{ height: 24, display: 'flex', alignItems: 'center' }}>
                  <StatusPill status={it.s} pulse={it.s === 'AGENDADO' || it.s === 'EM_ANDAMENTO'}/>
                </div>
                <p style={{ fontSize: 11, color: 'var(--text-2)', textAlign: 'center', lineHeight: 1.35, margin: 0 }}>
                  {it.t}
                </p>
              </div>
              {i < arr.length - 1 && (
                <div style={{ width: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: 12 }}>
                  <svg width="10" height="10" viewBox="0 0 24 24"><path d="M9 6l6 6-6 6" stroke="var(--text-3)" strokeWidth="2.4" fill="none" strokeLinecap="round"/></svg>
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Components row */}
      <div>
        <SectionTitle eyebrow="05 Componentes-chave" title="Anatomia conversacional"/>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginTop: 16 }}>
          {/* buttons */}
          <div className="mx-card" style={{ padding: 20 }}>
            <div className="mx-caption" style={{ fontWeight: 600, marginBottom: 14 }}>Botões de ação</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <button className="mx-btn">Solicitar mentoria</button>
              <button className="mx-btn green">Realizar check-in</button>
              <button className="mx-btn accent">Retirar chave</button>
              <button className="mx-btn ghost">Ver perfil</button>
            </div>
          </div>
          {/* tags */}
          <div className="mx-card" style={{ padding: 20 }}>
            <div className="mx-caption" style={{ fontWeight: 600, marginBottom: 14 }}>Tags de competência</div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 14 }}>
              {['#SQL', '#React', '#Postgres', '#Estatística', '#Hooks'].map(t => <span key={t} className="mx-tag">{t}</span>)}
            </div>
            <div className="mx-caption" style={{ fontWeight: 600, marginBottom: 8 }}>Status pills</div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              <StatusPill status="AGENDADO"/>
              <StatusPill status="EM_ANDAMENTO"/>
              <StatusPill status="CONCLUIDO"/>
              <StatusPill status="CANCELADO"/>
            </div>
          </div>
          {/* Heat pin + heatmap divergente */}
          <div className="mx-card" style={{ padding: 20 }}>
            <div className="mx-caption" style={{ fontWeight: 600, marginBottom: 4 }}>Heat pin · escala divergente</div>
            <div className="mx-caption" style={{ fontSize: 10.5, color: 'var(--text-3)', marginBottom: 12, lineHeight: 1.45 }}>
              Vermelho-alaranjado em −, neutro creme no centro, violeta em +.
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10, marginBottom: 14 }}>
              {[
                { core: '#E64A19', label: 'fora' },
                { core: '#F08F60', label: '25%' },
                { core: '#C9C3AE', label: '50%' },
                { core: '#9C7BE0', label: '75%' },
                { core: '#5D46B8', label: 'forte' },
              ].map((h, i) => (
                <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                  <div style={{
                    width: 28, height: 28, borderRadius: '50%',
                    background: h.core, border: '3px solid #fff',
                    boxShadow: `0 0 0 2px ${h.core}33`,
                  }}/>
                  <span style={{ fontSize: 9, color: 'var(--text-3)', fontFamily: 'JetBrains Mono, monospace', letterSpacing: 0.3 }}>{h.label}</span>
                </div>
              ))}
            </div>
            {/* Mini heatmap 5×5 com correlações fictícias */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 2, marginBottom: 10 }}>
              {[
                1.00, 0.62,-0.18, 0.10,-0.85,
                0.62, 1.00, 0.30,-0.40, 0.05,
               -0.18, 0.30, 1.00, 0.70,-0.20,
                0.10,-0.40, 0.70, 1.00, 0.55,
               -0.85, 0.05,-0.20, 0.55, 1.00,
              ].map((v, i) => {
                // map -1..+1 → color
                const c = v >= 0
                  ? lerpColor('#F8F9FA', '#5D46B8', v)
                  : lerpColor('#F8F9FA', '#E64A19', -v);
                return (
                  <div key={i} style={{
                    aspectRatio: '1 / 1', background: c, border: '0.5px solid #E0E0E0',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontFamily: 'JetBrains Mono, monospace', fontSize: 9, fontWeight: 600,
                    color: Math.abs(v) > 0.55 ? '#fff' : '#121212',
                  }}>{v.toFixed(2)}</div>
                );
              })}
            </div>
            <div className="mx-caption" style={{ fontSize: 10, color: 'var(--text-3)', textAlign: 'center', fontStyle: 'italic' }}>
              matriz de correlação · vmin = −1, center = 0, vmax = +1
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const chip = {
  padding: '6px 12px', borderRadius: 999, cursor: 'pointer',
  border: '1px solid var(--primary)',
  background: 'var(--primary-light)', color: 'var(--primary-dark)',
  fontFamily: 'var(--f-body)', fontSize: 12, fontWeight: 500,
};

function SectionTitle({ eyebrow, title }) {
  return (
    <div>
      <div className="mx-caption" style={{
        fontFamily: 'JetBrains Mono, monospace',
        textTransform: 'uppercase', fontSize: 10, fontWeight: 600, letterSpacing: 1,
        color: 'var(--primary)', marginBottom: 4,
      }}>{eyebrow}</div>
      <h2 className="mx-h2" style={{ fontSize: 22, fontWeight: 700 }}>{title}</h2>
    </div>
  );
}

function ColorBlock({ label, sub, role, base, light, dark }) {
  return (
    <div style={{
      borderRadius: 18, overflow: 'hidden',
      background: '#fff', border: '1px solid var(--border)',
    }}>
      <div style={{
        height: 130, background: base, padding: 16,
        display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
      }}>
        <span style={{
          fontFamily: 'JetBrains Mono, monospace', fontSize: 10, fontWeight: 600,
          color: 'rgba(255,255,255,0.7)', letterSpacing: 0.6, textTransform: 'uppercase',
        }}>{role}</span>
        <div>
          <div style={{ fontFamily: 'var(--f-head)', fontWeight: 700, fontSize: 22, color: '#fff', letterSpacing: -0.3 }}>{label}</div>
          <div style={{ fontFamily: 'var(--f-body)', fontSize: 11, color: 'rgba(255,255,255,0.75)', marginTop: 2 }}>{sub}</div>
        </div>
      </div>
      <div style={{ display: 'flex' }}>
        <div style={{ flex: 1, padding: 12, background: light, borderRight: '1px solid var(--border)' }}>
          <div className="mx-caption" style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, fontWeight: 600 }}>light</div>
          <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: dark }}>{light}</div>
        </div>
        <div style={{ flex: 1, padding: 12, background: '#fff', borderRight: '1px solid var(--border)' }}>
          <div className="mx-caption" style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, fontWeight: 600 }}>base</div>
          <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: base }}>{base}</div>
        </div>
        <div style={{ flex: 1, padding: 12, background: dark }}>
          <div className="mx-caption" style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, fontWeight: 600, color: 'rgba(255,255,255,0.7)' }}>dark</div>
          <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: '#fff' }}>{dark}</div>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { DesignSystemArtboard });
