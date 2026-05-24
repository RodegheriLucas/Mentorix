import {
  Injectable, NotFoundException, BadRequestException,
  ForbiddenException, ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not, DataSource } from 'typeorm';
import { ContraProposta, ContraPropostaStatus } from './entities/contra-proposta.entity';
import { CreateContraPropostaDto } from './dto/create-contra-proposta.dto';
import { Card } from '../cards/entities/card.entity';
import { Agendamento } from '../agendamentos/entities/agendamento.entity';
import { CardStatus, AgendamentoStatus, CardCategoria } from '../../common/types/status.enum';
import { AuditService } from '../audit/audit.service';

@Injectable()
export class ContraPropostasService {
  constructor(
    @InjectRepository(ContraProposta)
    private readonly propostaRepo: Repository<ContraProposta>,
    @InjectRepository(Card)
    private readonly cardRepo: Repository<Card>,
    @InjectRepository(Agendamento)
    private readonly agendamentoRepo: Repository<Agendamento>,
    private readonly auditService: AuditService,
    private readonly dataSource: DataSource,
  ) {}

  async enviar(cardId: number, professorId: number, dto: CreateContraPropostaDto, ip?: string): Promise<ContraProposta> {
    const card = await this.cardRepo.findOne({ where: { id: cardId }, relations: ['preferencias'] });
    if (!card) throw new NotFoundException('Card não encontrado.');
    if (card.categoria !== CardCategoria.TCC) throw new BadRequestException('Contra-propostas são exclusivas para cards TCC.');
    if (card.status !== CardStatus.ABERTO) throw new BadRequestException('Card não está mais disponível para propostas.');

    const existing = await this.propostaRepo.findOne({ where: { card_id: cardId, professor_id: professorId } });
    if (existing) throw new ConflictException('Você já enviou uma proposta para este card.');

    const proposta = this.propostaRepo.create({
      card_id: cardId,
      professor_id: professorId,
      mensagem: dto.mensagem,
      status: ContraPropostaStatus.PENDENTE,
    });

    const saved = await this.propostaRepo.save(proposta);
    await this.auditService.log(professorId, 'CONTRA_PROPOSTA_ENVIADA', 'contra_propostas', saved.id, null, { card_id: cardId }, ip);
    const created = await this.propostaRepo.findOne({ where: { id: saved.id }, relations: ['professor'] });
    if (!created) throw new NotFoundException('Proposta nÃ£o encontrada apÃ³s criaÃ§Ã£o.');
    return created;
  }

  async findByCard(cardId: number, alunoId: number): Promise<ContraProposta[]> {
    const card = await this.cardRepo.findOne({ where: { id: cardId } });
    if (!card) throw new NotFoundException('Card não encontrado.');
    if (card.aluno_id !== alunoId) throw new ForbiddenException('Sem permissão.');
    return this.propostaRepo.find({
      where: { card_id: cardId, status: ContraPropostaStatus.PENDENTE },
      relations: ['professor'],
      order: { criado_em: 'ASC' },
    });
  }

  async aceitar(propostaId: number, alunoId: number, ip?: string): Promise<Agendamento> {
    const proposta = await this.propostaRepo.findOne({ where: { id: propostaId }, relations: ['card'] });
    if (!proposta) throw new NotFoundException('Proposta não encontrada.');
    if (proposta.card.aluno_id !== alunoId) throw new ForbiddenException('Sem permissão.');
    if (proposta.status !== ContraPropostaStatus.PENDENTE) throw new BadRequestException('Proposta não está mais disponível.');
    if (proposta.card.status !== CardStatus.ABERTO) throw new BadRequestException('Card não está mais disponível.');

    return this.dataSource.transaction(async (manager) => {
      await manager.update(ContraProposta, { card_id: proposta.card_id, status: ContraPropostaStatus.PENDENTE }, { status: ContraPropostaStatus.RECUSADA });
      await manager.update(ContraProposta, { id: propostaId }, { status: ContraPropostaStatus.ACEITA });
      await manager.update(Card, { id: proposta.card_id }, { status: CardStatus.ACEITO });

      const agendamento = manager.create(Agendamento, {
        card_id: proposta.card_id,
        mentor_id: proposta.professor_id,
        status: AgendamentoStatus.PENDENTE_GESTOR,
      });
      const saved = await manager.save(agendamento);

      await this.auditService.log(alunoId, 'CONTRA_PROPOSTA_ACEITA', 'agendamentos', saved.id, null, {
        proposta_id: propostaId,
        professor_id: proposta.professor_id,
        card_id: proposta.card_id,
      }, ip);

      const created = await manager.findOne(Agendamento, { where: { id: saved.id }, relations: ['card', 'mentor'] });
      if (!created) throw new NotFoundException('Agendamento nÃ£o encontrado apÃ³s aceitar proposta.');
      return created;
    });
  }

  async recusar(propostaId: number, alunoId: number, ip?: string): Promise<void> {
    const proposta = await this.propostaRepo.findOne({ where: { id: propostaId }, relations: ['card'] });
    if (!proposta) throw new NotFoundException('Proposta não encontrada.');
    if (proposta.card.aluno_id !== alunoId) throw new ForbiddenException('Sem permissão.');
    if (proposta.status !== ContraPropostaStatus.PENDENTE) throw new BadRequestException('Proposta não está pendente.');
    await this.propostaRepo.update(propostaId, { status: ContraPropostaStatus.RECUSADA });
    await this.auditService.log(alunoId, 'CONTRA_PROPOSTA_RECUSADA', 'contra_propostas', propostaId, null, { card_id: proposta.card_id }, ip);
  }

  async findMinhasPorProfessor(professorId: number): Promise<ContraProposta[]> {
    return this.propostaRepo.find({
      where: { professor_id: professorId },
      relations: ['card'],
      order: { criado_em: 'DESC' },
    });
  }
}
