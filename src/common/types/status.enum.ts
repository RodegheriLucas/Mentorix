export enum CardStatus {
  ABERTO = 'ABERTO',
  ACEITO = 'ACEITO',
  AGENDADO = 'AGENDADO',
  EM_ANDAMENTO = 'EM_ANDAMENTO',
  CONCLUIDO = 'CONCLUIDO',
  CANCELADO = 'CANCELADO',
}

export enum CardCategoria {
  GERAL = 'GERAL',
  TCC = 'TCC',
}

export enum AgendamentoStatus {
  PENDENTE_GESTOR = 'PENDENTE_GESTOR',
  AGENDADO = 'AGENDADO',
  EM_ANDAMENTO = 'EM_ANDAMENTO',
  CONCLUIDO = 'CONCLUIDO',
  CANCELADO = 'CANCELADO',
  DISPUTA = 'DISPUTA',
}

export enum DiaSemana {
  SEG = 'SEG',
  TER = 'TER',
  QUA = 'QUA',
  QUI = 'QUI',
  SEX = 'SEX',
  SAB = 'SAB',
}

export enum AmbienteTipo {
  SALA_FECHADA = 'SALA_FECHADA',
  AMBIENTE_COMUM = 'AMBIENTE_COMUM',
}

export enum ContestacaoStatus {
  ABERTA = 'ABERTA',
  APROVADA = 'APROVADA',
  REJEITADA = 'REJEITADA',
}
