// app.jsx — Mentorix canvas

function MentorFlow() {
  const [view, setView] = React.useState('map'); // 'map' | 'detail'
  const [picked, setPicked] = React.useState(SOLICITACOES[0]);
  return view === 'map' ? (
    <MentorMapaScreen onPickPin={(s) => { setPicked(s); setView('detail'); }}/>
  ) : (
    <SolicitacaoDetalheScreen s={picked} onBack={() => setView('map')}/>
  );
}

function App() {
  return (
    <DesignCanvas>
      <DCSection id="ds" title="Design system" subtitle="Tokens, tríade, escala tipográfica e mapeamento de status do ciclo da mentoria.">
        <DCArtboard id="ds-overview" label="00 · Tokens & sistema" width={1280} height={1700}>
          <DesignSystemArtboard/>
        </DCArtboard>
      </DCSection>

      <DCSection id="aluno" title="Aluno · UniMatch (mobile)" subtitle="Publica solicitação no matchmaking, acompanha o ciclo, fala via WhatsApp com o mentor que aceitou.">
        <DCArtboard id="aluno-list" label="A01 · Minhas solicitações" width={390} height={812}>
          <AlunoListScreen/>
        </DCArtboard>
        <DCArtboard id="aluno-nova" label="A02 · Nova solicitação" width={390} height={812}>
          <NovaSolicitacaoScreen/>
        </DCArtboard>
        <DCArtboard id="aluno-detalhe" label="A03 · Detalhe (vista do aluno)" width={390} height={812}>
          <SolicitacaoDetalheScreen s={SOLICITACOES[0]} viewer="aluno"/>
        </DCArtboard>
      </DCSection>

      <DCSection id="mentor" title="Mentor · Descobrir → Aceitar → Mentorias (mobile)" subtitle="Mapa do campus com pinos coloridos (heat divergente), tela de detalhe com aceitar/recusar e mentorias em lista ou calendário.">
        <DCArtboard id="mentor-mapa" label="M01 · Descobrir (mapa + heat divergente)" width={390} height={812}>
          <MentorFlow/>
        </DCArtboard>
        <DCArtboard id="mentor-detalhe" label="M02 · Detalhe da solicitação" width={390} height={812}>
          <SolicitacaoDetalheScreen s={SOLICITACOES[0]}/>
        </DCArtboard>
        <DCArtboard id="mentor-mentorias-lista" label="M03a · Mentorias · lista" width={390} height={812}>
          <MentorMentoriasScreen view="lista"/>
        </DCArtboard>
        <DCArtboard id="mentor-mentorias-cal" label="M03b · Mentorias · calendário" width={390} height={812}>
          <MentorMentoriasScreen view="calendario"/>
        </DCArtboard>
      </DCSection>

      <DCSection id="gestor" title="Gestor (desktop)" subtitle="Painel de portaria com três colunas — pendente / agendado / em andamento — auto-refresh do Supabase, modal de instruções imutáveis e fila de disputas.">
        <DCArtboard id="gestor-portaria" label="G01 · Painel de Portaria — Bloco B" width={1280} height={800}>
          <DashboardScreen/>
        </DCArtboard>
      </DCSection>
    </DesignCanvas>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App/>);
