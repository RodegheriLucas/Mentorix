# 📋 Ficha de Acompanhamento e Diagnóstico do Projeto
---

## 🏛️ 1. Identificação da Equipe

- Equipe Mentora
- João Otávio, Lucas R. Rocha, João Victor de Paula e Marcelo Cauan / 7º período 
- **Link do Repositório (GitHub/GitLab):** ta privado
- **Link do Rascunho/Design (Figma/Lovable/Excalidraw):** Link do drive

---

## 💡 2. O Problema e a Proposta de Valor (O Coração da Ideia)

### 2.1. Qual problema real e específico vocês estão resolvendo?

> Enquanto alguns alunos encontram dificuldades para conseguir horas complementares, outros encontram dificuldades em algumas matérias e conteúdos.

### 2.2. O diferencial da solução está claro? O que torna a ideia de vocês única?

> O intuito é trazer praticidade e versatilidade para os alunos trazendo uma solução voltada para mobile, e trazendo praticidade em processos que até hoje nas faculdades costumam ser burocráticas e custosas.

---

## ⚙️ 3. A Solução na Prática (Como Funciona)

### 3.1. Como a solução funciona para o usuário final?

> 1.Abertura do Card:(Ação do Aluno).O Aluno cria um card no aplicativo e faz sua solicitação de mentoria (Geral ou TCC), adiciona as tags do assunto (ex: React, SQL) e sugere seus horários disponíveis. O status do card fica como ABERTO.

> 2.Match e Reserva:(Ação do Mentor).O Mentor visualiza o card em seu feed (ordenado por afinidade de tags). Ele aceita a mentoria, escolhe um dos horários propostos pelo aluno e seleciona uma sala física livre no campus. O status muda para ACEITO / PENDENTE GESTOR.

>3.Liberação da Sala:(Ação do Gestor).O Gestor visualiza o agendamento pendente em seu painel da portaria. Ele preenche as instruções de acesso e chaves do local e libera o encontro. O status do agendamento passa para AGENDADO

>4.Check-in na Portaria:(Ação do Gestor No dia do encontro).No dia e horário marcados, o aluno e o mentor chegam à portaria do campus. O Gestor realiza o Check-in presencial no sistema, registrando o horário exato de início. O status muda para EM ANDAMENTO.

>5.Check-out e Cálculo de Tempo:(Ação do Gestor ao final da sessão de mentoria) Os participantes retornam à portaria. O Gestor realiza o Check-out no painel, e o sistema calcula automaticamente a duração real do encontro. O status muda para CONCLUÍDO.

>6.Avaliação e Carga Horária:(Ação do Aluno / Automação).O Aluno acessa o aplicativo, atribui uma nota de 1 a 5 estrelas e deixa um depoimento sobre o atendimento. Essa ação valida o encontro e o sistema credita as horas reais convertidas em horas complementares/extensão no painel do Mentor.

### 3.2. Quais são as principais tecnologias, linguagens ou ferramentas que decidiram usar?

>Typescript, Javascript, React, MySQL, Inteligência Ariticial aplicada a metodologias de pair programming

---

## 👥 4. Gestão e Divisão de Trabalho

### 4.1. Quem está fazendo o quê na equipe?

- João Otávio: Estruturação do backend e banco de dados e implementações de features
- Marcelo: correção de bugs e implementações de features 
- João Victor: QA (testes de telas, lógicas e sugestões de melhorias)
- Lucas: Frontend UI/UX e design patter e implementações de features

---

## 🛠️ 5. Status Atual do Desenvolvimento (O MVP)

### 5.1. Vocês já começaram o protótipo visual ou o código do MVP? Qual o percentual de conclusão estimado?

- ( ) Não começamos | ( ) Apenas rascunho visual | ( ) Código inicial iniciado | (X) Mais da metade pronto

### 5.2. O projeto já funciona em alguma parte? O que já está codificado e operacional?

> Funciona em grande parte, 80% foi implementado com sucesso.

### 5.3. O que foi ou será "Mockado" (dados fictícios/estáticos)?

> Populamos o banco de dados para testes funcionais. Mas não há dados mockados. 

### 5.4. O que ainda falta finalizar obrigatoriamente para a entrega?

> Todo o fluxo de matchmaking entre alunos e mentores está funcional, logo não há pontos cruciais que ficaram em falta.
---

## 🚧 6. Obstáculos e Pedidos de Ajuda

### 6.1. Qual maior dificuldade da equipe?

> dificuldade no fluxo de CI/CD e uma leve confusão na utilização de stacks (uma stack estar desatualizada em relação ao que o outro estava usando por exemplo)

---

## 🎤 7. Preparação para o Show (O Pitch)

### 7.1. Como será a estratégia de apresentação de vocês na segunda-feira?

> **Descrição:** (Quem vai falar? Vocês pretendem abrir o sistema ao vivo ou vão usar prints/vídeos gravados nas telas dos slides?)
