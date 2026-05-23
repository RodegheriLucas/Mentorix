import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Agendamento } from '../agendamentos/entities/agendamento.entity';
import { AmbienteReserva } from '../ambientes/entities/ambiente-reserva.entity';
import { Card } from '../cards/entities/card.entity';
import { AmbientesService } from '../ambientes/ambientes.service';
import { CardsService } from '../cards/cards.service';
import { ConfirmMatchDto } from './dto/confirm-match.dto';
import { CardStatus, AgendamentoStatus } from '../../common/types/status.enum';
import { AuditService } from '../audit/audit.service';

export interface SlotResult {
  dia_semana: string;
  hora_inicio: string;
  hora_fim: string;
  ambiente: any;
  tipo: string;
}

@Injectable()
export class MatchmakingService {
  constructor(
    @InjectRepository(Agendamento)
    private readonly agendamentoRepo: Repository<Agendamento>,
    @InjectRepository(AmbienteReserva)
    private readonly reservaRepo: Repository<AmbienteReserva>,
    private readonly ambientesService: AmbientesService,
    private readonly cardsService: CardsService,
    private readonly auditService: AuditService,
    private readonly dataSource: DataSource,
  ) {}

  async findAvailableSlots(cardId: number): Promise<SlotResult[]> {
    const card = await this.cardsService.findById(cardId);
    if (card.status !== CardStatus.ABERTO) {
      throw new BadRequestException('Card não está aberto para match.');
    }

    const results: SlotResult[] = [];

    for (const slot of card.disponibilidades) {
      const { salasFechadas, ambientesComuns } = await this.ambientesService.findFreeForSlot(
        slot.dia_semana,
        slot.hora_inicio,
        slot.hora_fim,
      );

      if (salasFechadas.length > 0) {
        salasFechadas.forEach((sala) =>
          results.push({
            dia_semana: slot.dia_semana,
            hora_inicio: slot.hora_inicio,
            hora_fim: slot.hora_fim,
            ambiente: sala,
            tipo: 'SALA_FECHADA',
          }),
        );
      } else {
        ambientesComuns.forEach((espaco) =>
          results.push({
            dia_semana: slot.dia_semana,
            hora_inicio: slot.hora_inicio,
            hora_fim: slot.hora_fim,
            ambiente: espaco,
            tipo: 'AMBIENTE_COMUM',
          }),
        );
      }
    }

    return results;
  }

  async confirmMatch(
    cardId: number,
    mentorId: number,
    dto: ConfirmMatchDto,
    ip?: string,
  ): Promise<Agendamento> {
    const card = await this.cardsService.findById(cardId);
    if (card.status !== CardStatus.ABERTO) {
      throw new BadRequestException('Card não está mais disponível.');
    }

    const ambiente = await this.ambientesService.findById(dto.ambienteId);

    return this.dataSource.transaction(async (manager) => {
      const agendamento = manager.create(Agendamento, {
        card_id: cardId,
        mentor_id: mentorId,
        ambiente_id: dto.ambienteId,
        dia_semana: dto.diaSemana,
        hora_inicio: dto.horaInicio,
        hora_fim: dto.horaFim,
        status: AgendamentoStatus.PENDENTE_GESTOR,
      });

      const saved = await manager.save(agendamento);

      await manager.save(AmbienteReserva, {
        ambiente_id: dto.ambienteId,
        dia_semana: dto.diaSemana,
        hora_inicio: dto.horaInicio,
        hora_fim: dto.horaFim,
        agendamento_id: saved.id,
      });

      await manager.update(Card, { id: cardId }, { status: CardStatus.ACEITO });

      await this.auditService.log(
        mentorId,
        'CARD_ACEITO',
        'agendamentos',
        saved.id,
        null,
        { card_id: cardId, mentor_id: mentorId, ambiente_id: dto.ambienteId },
        ip,
      );

      return manager.findOne(Agendamento, {
        where: { id: saved.id },
        relations: ['card', 'mentor', 'ambiente'],
      }) as Promise<Agendamento>;
    });
  }
}
