# 🎓 Documento de Especificação Técnica: UniMatch + VagaLivre
**Plataforma de Mentoria Acadêmica e Logística de Espaços Físicos**

---

## 👥 1. Matriz de Perfis de Usuário e Permissões

O ecossistema é composto por quatro atores principais. Suas ações e visibilidades dentro do aplicativo são determinadas rigidamente por seus papéis:

| Perfil | Descrição e Papel no Ecossistema | Ações Exclusivas na Interface |
| :--- | :--- | :--- |
| **Aluno (Mentorado)** | Estudante que busca auxílio acadêmico pontual ou orientação de longo prazo. | Postar solicitações, definir janelas de horários e avaliar encontros. |
| **Aluno Mentor (Veterano)** | Aluno de períodos avançados que oferece ajuda em disciplinas já cursadas. | Visualizar e aceitar apenas cards da categoria 'Geral'. Fornece telefone no cadastro. |
| **Professor Mentor** | Membro do corpo docente da instituição focado em orientações metodológicas. | Perfil exclusivo que visualiza e aceita cards de 'TCC' e postagens de eventos. |
| **Gestor (Universidade)** | Funcionário responsável pelo bloco/prédio e a guarda do patrimônio físico. | Digitar ponto de encontro dinâmico e realizar Check-in/Check-out manuais de chaves. |

---

## 🔄 2. Detalhamento das Fases do Aplicativo

### FASE 1: Postagem, Triagem e Definição de Disponibilidade

O ciclo de vida de uma mentoria começa quando o Aluno externaliza uma necessidade de conhecimento, delimitando uma janela temporal para que o sistema possa automatizar o gargalo logístico nas fases seguintes.

#### A. Fluxo de Interface (UI/UX)
*   **Formulário de Solicitação:** O Aluno preenche um formulário contendo Título, Descrição e a seleção de Tags de Competência (ex: `#SQL`, `#IHC`).
*   **Seleção de Categoria:** O Aluno escolhe explicitamente o tipo de projeto: `Geral` (matérias da grade) ou `TCC` (Trabalho de Conclusão de Curso).
*   **Matriz de Disponibilidade:** Através de uma grade visual estruturada por dias da semana e intervalos de tempo (ex: Segunda das 14:00 às 16:00), o Aluno delimita quando pode se encontrar. O sistema impede a digitação livre de texto nesta etapa para evitar dados inválidos.

#### B. Lógica de Negócio e Processamento
*   **Validação de Tempo:** O sistema valida se os intervalos de horas possuem um período mínimo de 1 hora de duração antes de permitir a publicação.
*   **Filtro Automático de Triagem:** 
    *   Se o card for marcado como `Geral`, ele entra na fila de distribuição comum voltada para os Alunos Mentores.
    *   Se o card for marcado como `TCC`, o sistema aciona uma regra de segurança na camada de dados que **oculta completamente** o registro para qualquer usuário que não possua a credencial de `Professor Mentor`.

---

### FASE 2: Matchmaking Automatizado e Logística do Gestor

Esta fase resolve o problema de conciliação de agendas entre os usuários e a infraestrutura da universidade, eliminando a necessidade de ferramentas de chat interno.

#### A. Fluxo de Interface (UI/UX)
*   **Feed Customizado:** Mentores e Professores abrem suas respectivas visões de feed e encontram cards compatíveis com suas tags de competência e suas próprias disponibilidades.
*   **Painel do Gestor:** Uma interface simplificada onde o funcionário da portaria/secretaria visualiza notificações de novos agendamentos vinculados ao seu bloco específico.

#### B. Lógica de Negócio e Processamento
*   **O Algoritmo de Cruzamento de Salas:** Quando o Mentor clica em um card, o sistema faz uma varredura cruzada:
    $$\text{Slots Livres} = \text{Disponibilidade do Aluno} \cap \text{Agenda de Salas Livres do Campus}$$
*   **Mecânica de Contingência (Salas Cheias):** Caso a consulta retorne que todas as salas físicas fechadas da faculdade estão reservadas no horário que o aluno pode, a lógica do sistema altera o filtro automaticamente. Ele passa a buscar e listar os **Ambientes Comuns** cadastrados (ex: Mesas da biblioteca, sofás do bloco de TI, bancos do pátio), garantindo que o encontro ocorra sob a segurança da instituição.
*   **Injeção Dinâmica do Ponto de Encontro:** No momento em que o Mentor confirma um slot e uma sala, o sistema dispara um gatilho para o Gestor daquele bloco. O Gestor é obrigado a preencher um campo de texto livre descrevendo sua localização real naquele dia (ex: *"Estarei na secretaria do Bloco B fazendo ronda, se eu não estiver lá, me liguem"*). Essa mensagem é transmitida instantaneamente para o card de mentoria nas telas do Aluno e do Mentor.

---

### FASE 3: Execução, Contato Direto e Controle de Presença

Gerencia o andamento do encontro físico no mundo real e a validação de que os atores compareceram ao local demarcado.

#### A. Fluxo de Interface (UI/UX)
*   **Card Agendado:** Exibe as instruções em destaque textuais enviadas pelo gestor, a sala escolhida e um botão de ação rápida de telefone, que aciona o discador nativo do celular com o número do Mentor para emergências de comunicação fora do app.
*   **Painel de Portaria:** O Gestor visualiza a lista de mentorias agendadas para o período e possui dois botões manuais de controle: `[Registrar Check-in]` e `[Registrar Check-out]`.

#### B. Lógica de Negócio e Processamento
*   **Gatilho de Check-in:** Quando a dupla chega para retirar a chave da sala, o Gestor clica no botão. O sistema altera o status da mentoria para `Em Andamento` e grava o carimbo de data/hora oficial do início real do encontro.
*   **Gatilho de Check-out Diário:** Quando a chave é devolvida, o Gestor encerra o ciclo diário. O sistema calcula imediatamente a diferença entre o tempo final e inicial:
    $$\text{Tempo da Sessão} = \text{Horário de Check-out} - \text{Horário de Check-in}$$
*   Este valor é salvo em formato numérico como um crédito de horas flutuante na tabela de histórico diário, aguardando a validação final.

---

### FASE 4: O Sistema de Penalidades por Fibonacci

Regra de governança automatizada criada para coibir reservas "fantasmas" de salas e atrasos abusivos na devolução do patrimônio físico (chaves).

#### A. Fluxo de Interface (UI/UX)
*   **Tela de Bloqueio de Conta:** Caso o usuário esteja cumprindo uma penalidade, toda a interface do aplicativo é substituída por um aviso impeditivo vermelho exibindo o motivo da suspensão e um cronômetro regressivo com a data de liberação do acesso.

#### B. Lógica de Negócio e Processamento
*   **Abertura de Infração:** Se o horário limite reservado expirar em mais de 15 minutos e o Gestor não tiver registrado o encerramento do encontro (ou o comparecimento inicial), uma flag de infração é vinculada à conta do Mentor.
*   **Cálculo da Escala Matemática:** O sistema consulta o histórico de erros daquele usuário e aplica a sequência matemática de Fibonacci ($F_n$) para definir os dias de banimento com base na reincidência:
    $$\text{Dias de Suspensão} = F_{n+1}$$
    *   1ª infração registrada: 1 dia de bloqueio.
    *   2ª infração registrada: 1 dia de bloqueio.
    *   3ª infração registrada: 2 dias de bloqueio.
    *   4ª infração registrada: 3 dias de bloqueio.
    *   5ª infração registrada: 5 dias de bloqueio (progressão geométrica contínua).

---

### FASE 5: Encerramento, Resolução de Conflitos e Contabilidade Fracionada

Garante o fechamento do ciclo, a integridade das informações e a recompensa justa do Mentor por cada esforço empreendido.

#### A. Fluxo de Interface (UI/UX)
*   **Tela de Avaliação (Aluno):** Um questionário rápido contendo avaliação de 1 a 5 estrelas e espaço para depoimento.
*   **Tela de Contestação (Mentor):** Interface habilitada caso o aluno não interaja com o encerramento, permitindo que o mentor envie uma justificativa de texto e acione a câmera do celular para anexar uma foto comprobatória da mentoria realizada.

#### B. Lógica de Negócio e Processamento
*   **Contabilidade Fracionada Diária:** O sistema atualiza o contador de horas do Mentor **dia a dia**. Assim que o Aluno envia a avaliação daquela data específica, as horas computadas no Check-out da Fase 3 são consolidadas e somadas imediatamente ao saldo global do perfil do Mentor.
*   **Lógica Antifraude e Resolução de Disputas:** Se o Aluno cometer evasão da plataforma (*ghosting*) e não avaliar em até 24 horas, o Mentor abre a contestação. O pedido cai no painel do Gestor do bloco. Como o Gestor participou da logística real de entrega e recebimento da chave da sala para aquele Mentor, ele atua como árbitro, analisa a foto/texto e aprova manualmente a liberação das horas diárias calculadas, impedindo prejuízos ao Mentor engajado.

---

## 🗄️ 3. Visão Abstrata do Banco de Dados (Entidades)

Para apoiar as regras computacionais descritas, a estrutura de dados organiza-se de forma relacional ao redor das seguintes entidades básicas:

[Usuarios] ─── (Possui) ───► [Historico_Encontros_Diarios]
│                                     ▲
└─── (Cria) ───► [Cards_Ajuda]        │ (Alimenta)
│               │
▼               │
[Agendamentos] ─────────┘
│
▼
[Ambientes]

1.  **Usuários:** Armazena credenciais, papéis (`Aluno`, `Aluno_Mentor`, `Professor_Mentor`, `Gestor`), número de telefone de contato obrigatório, carimbo de data de suspensão e o acumulador global de horas complementares.
2.  **Ambientes:** Registro das salas de aula e espaços comuns da universidade, mapeando o bloco correspondente, se o local exige chave física para abertura (`exige_chave = TRUE/FALSE`) e o identificador do Gestor responsável pelo perímetro.
3.  **Cards de Ajuda:** Publicações dos alunos contendo a descrição da dor acadêmica, a tag de competências requeridas, o tipo do projeto (`Geral` ou `TCC`) e o objeto estruturado contendo a matriz de dias e horários pretendidos.
4.  **Agendamentos:** Registro consolidado do match, contendo o vínculo do card, o mentor aceito, o ambiente determinado e a coluna de texto livre preenchida pelo gestor com as instruções de encontro.
5.  **Histórico de Encontros Diários:** Tabela fracionada que armazena os timestamps de entrada e saída reais validados pelo gestor a cada dia de mentoria, servindo de base para o cálculo matemático do contador de horas diário.