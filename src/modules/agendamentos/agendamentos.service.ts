import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Agendamento } from './entities/agendamento.entity';
import { Card } from '../cards/entities/card.entity';
import { AmbienteReserva } from '../ambientes/entities/ambiente-reserva.entity';
import { AgendamentoStatus, CardStatus } from '../../common/types/status.enum';
import { Role } from '../../common/types/roles.enum';
import { AuditService } from '../audit/audit.service';

@Injectable()
export class AgendamentosService {
  constructor(
    @InjectRepository(Agendamento)
    private readonly agendamentoRepo: Repository<Agendamento>,
    @InjectRepository(Card)
    private readonly cardRepo: Repository<Card>,
    @InjectRepository(AmbienteReserva)
    private readonly reservaRepo: Repository<AmbienteReserva>,
    private readonly auditService: AuditService,
  ) {}

  async findByUser(userId: number, papel: Role): Promise<Agendamento[]> {
    const qb = this.agendamentoRepo
      .createQueryBuilder('a')
      .leftJoinAndSelect('a.card', 'card')
      .leftJoinAndSelect('card.aluno', 'aluno')
      .leftJoinAndSelect('a.mentor', 'mentor')
      .leftJoinAndSelect('a.ambiente', 'ambiente')
      .orderBy('a.criado_em', 'DESC');

    if (papel === Role.ALUNO) {
      qb.where('aluno.id = :uid', { uid: userId });
    } else if (papel === Role.ALUNO_MENTOR || papel === Role.PROFESSOR_MENTOR) {
      qb.where('a.mentor_id = :uid', { uid: userId });
    } else if (papel === Role.GESTOR) {
      qb.where('ambiente.gestor_id = :uid', { uid: userId });
    }

    return qb.getMany();
  }

  async findById(id: number): Promise<Agendamento> {
    const a = await this.agendamentoRepo.findOne({
      where: { id },
      relations: ['card', 'card.aluno', 'mentor', 'ambiente'],
    });
    if (!a) throw new NotFoundException('Agendamento não encontrado.');
    return a;
  }

  async injetarInstrucoes(id: number, gestorId: number, instrucoes: string, ip?: string): Promise<Agendamento> {
    const a = await this.findById(id);
    if (a.instrucoes_gestor) throw new BadRequestException('Instruções já foram enviadas e são imutáveis.');

    const antes = { status: a.status };
    await this.agendamentoRepo.update(id, {
      instrucoes_gestor: instrucoes,
      instrucoes_gestor_em: new Date(),
      status: AgendamentoStatus.AGENDADO,
    });

    if (a.card) {
      await this.cardRepo.update(a.card.id, { status: CardStatus.AGENDADO });
    }

    await this.auditService.log(
      gestorId, 'INSTRUCAO_GESTOR', 'agendamentos', id,
      antes, { instrucoes, status: AgendamentoStatus.AGENDADO }, ip,
    );

    return this.findById(id);
  }

  async cancelar(id: number, userId: number, papel: Role): Promise<void> {
    const a = await this.findById(id);
    const alunoId = a.card?.aluno?.id;

    if (papel === Role.ALUNO && alunoId !== userId) throw new ForbiddenException();
    if ((papel === Role.ALUNO_MENTOR || papel === Role.PROFESSOR_MENTOR) && a.mentor_id !== userId) throw new ForbiddenException();

    const cancelaveis = [AgendamentoStatus.PENDENTE_GESTOR, AgendamentoStatus.AGENDADO];
    if (!cancelaveis.includes(a.status)) throw new BadRequestException('Não é possível cancelar neste status.');

    await this.agendamentoRepo.update(id, { status: AgendamentoStatus.CANCELADO });

    // Remove a reserva do ambiente para liberar o horário
    await this.reservaRepo.delete({ agendamento_id: id });

    if (a.card_id) {
      // Se o aluno cancela, o card é cancelado. Se o mentor cancela, o card volta a ficar aberto.
      const novoCardStatus = (papel === Role.ALUNO) ? CardStatus.CANCELADO : CardStatus.ABERTO;
      await this.cardRepo.update(a.card_id, { status: novoCardStatus });
    }
  }

  async findPendentesGestor(): Promise<Agendamento[]> {
    return this.agendamentoRepo.find({
      where: { status: AgendamentoStatus.PENDENTE_GESTOR },
      relations: ['card', 'card.aluno', 'mentor', 'ambiente'],
      order: { criado_em: 'ASC' },
    });
  }

  async findHojeGestor(): Promise<Agendamento[]> {
    const hoje = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

    return this.agendamentoRepo
      .createQueryBuilder('a')
      .leftJoinAndSelect('a.card', 'card')
      .leftJoinAndSelect('card.aluno', 'aluno')
      .leftJoinAndSelect('a.mentor', 'mentor')
      .leftJoinAndSelect('a.ambiente', 'ambiente')
      .where('a.data = :hoje', { hoje })
      .andWhere('a.status IN (:...statuses)', {
        statuses: [AgendamentoStatus.AGENDADO, AgendamentoStatus.EM_ANDAMENTO, AgendamentoStatus.PENDENTE_GESTOR],
      })
      .orderBy('a.hora_inicio', 'ASC')
      .getMany();
  }

  async updateStatus(id: number, status: AgendamentoStatus): Promise<void> {
    const agendamento = await this.agendamentoRepo.findOne({ where: { id }, relations: ['card'] });
    await this.agendamentoRepo.update(id, { status });
    if (agendamento && agendamento.card) {
      await this.cardRepo.update(agendamento.card.id, { status: status as unknown as CardStatus });
    }
  }
}
