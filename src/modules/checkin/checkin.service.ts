import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HistoricoEncontro } from './entities/historico-encontro.entity';
import { Agendamento } from '../agendamentos/entities/agendamento.entity';
import { AgendamentosService } from '../agendamentos/agendamentos.service';
import { AgendamentoStatus } from '../../common/types/status.enum';
import { AuditService } from '../audit/audit.service';

@Injectable()
export class CheckinService {
  constructor(
    @InjectRepository(HistoricoEncontro)
    private readonly historicoRepo: Repository<HistoricoEncontro>,
    @InjectRepository(Agendamento)
    private readonly agendamentoRepo: Repository<Agendamento>,
    private readonly agendamentosService: AgendamentosService,
    private readonly auditService: AuditService,
  ) {}

  async checkin(agendamentoId: number, gestorId: number, ip?: string): Promise<HistoricoEncontro> {
    const agendamento = await this.agendamentosService.findById(agendamentoId);

    if (agendamento.status !== AgendamentoStatus.AGENDADO) {
      throw new BadRequestException('Agendamento não está no status AGENDADO.');
    }

    const hoje = new Date().toISOString().split('T')[0];

    const existing = await this.historicoRepo.findOne({
      where: { agendamento_id: agendamentoId, data_encontro: hoje },
    });

    if (existing?.checkin_em) {
      throw new BadRequestException('Check-in já realizado para hoje.');
    }

    let historico: HistoricoEncontro;
    if (existing) {
      await this.historicoRepo.update(existing.id, { checkin_em: new Date(), gestor_id: gestorId });
      historico = await this.historicoRepo.findOne({ where: { id: existing.id } }) as HistoricoEncontro;
    } else {
      historico = await this.historicoRepo.save(
        this.historicoRepo.create({
          agendamento_id: agendamentoId,
          data_encontro: hoje,
          checkin_em: new Date(),
          gestor_id: gestorId,
        }),
      ) as HistoricoEncontro;
    }

    await this.agendamentosService.updateStatus(agendamentoId, AgendamentoStatus.EM_ANDAMENTO);
    await this.auditService.log(gestorId, 'CHECKIN', 'historico_encontros', historico.id, null, { agendamento_id: agendamentoId }, ip);

    return historico;
  }

  async checkout(agendamentoId: number, gestorId: number, ip?: string): Promise<HistoricoEncontro> {
    const hoje = new Date().toISOString().split('T')[0];

    const historico = await this.historicoRepo.findOne({
      where: { agendamento_id: agendamentoId, data_encontro: hoje },
    });

    if (!historico) throw new NotFoundException('Histórico de hoje não encontrado. Faça o check-in primeiro.');
    if (!historico.checkin_em) throw new BadRequestException('Check-in não realizado.');
    if (historico.checkout_em) throw new BadRequestException('Check-out já realizado.');

    const checkout = new Date();
    const diffMs = checkout.getTime() - historico.checkin_em.getTime();
    const duracaoHoras = parseFloat((diffMs / 3600000).toFixed(2));

    await this.historicoRepo.update(historico.id, {
      checkout_em: checkout,
      duracao_horas: duracaoHoras,
    });

    await this.agendamentosService.updateStatus(agendamentoId, AgendamentoStatus.CONCLUIDO);
    await this.auditService.log(gestorId, 'CHECKOUT', 'historico_encontros', historico.id, null, { duracao_horas: duracaoHoras }, ip);

    return this.historicoRepo.findOne({ where: { id: historico.id } }) as Promise<HistoricoEncontro>;
  }

  async findByAgendamento(agendamentoId: number): Promise<HistoricoEncontro[]> {
    return this.historicoRepo.find({
      where: { agendamento_id: agendamentoId },
      order: { data_encontro: 'DESC' },
    });
  }

  async findOverdue(): Promise<HistoricoEncontro[]> {
    return this.historicoRepo.query(`
      SELECT h.*, a.hora_fim, a.mentor_id
      FROM historico_encontros h
      JOIN agendamentos a ON h.agendamento_id = a.id
      WHERE h.data_encontro = CURDATE()
      AND (
        (h.checkin_em IS NOT NULL AND h.checkout_em IS NULL
         AND DATE_ADD(CONCAT(h.data_encontro, ' ', a.hora_fim), INTERVAL 15 MINUTE) < NOW())
        OR
        (h.checkin_em IS NULL AND CONCAT(h.data_encontro, ' ', a.hora_fim) < NOW())
      )
      AND h.id NOT IN (
        SELECT historico_id FROM penalidades WHERE historico_id IS NOT NULL
      )
    `);
  }

  async findPendentesAvaliacao(alunoId: number): Promise<HistoricoEncontro[]> {
    return this.historicoRepo.query(`
      SELECT h.* FROM historico_encontros h
      JOIN agendamentos a ON h.agendamento_id = a.id
      JOIN cards_ajuda c ON a.card_id = c.id
      WHERE c.aluno_id = ?
      AND h.checkout_em IS NOT NULL
      AND h.horas_consolidadas = 0
      AND h.id NOT IN (SELECT historico_id FROM avaliacoes)
    `, [alunoId]);
  }
}
