import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { CheckinService } from '../modules/checkin/checkin.service';
import { PenaltiesService } from '../modules/penalties/penalties.service';
import { DataSource } from 'typeorm';

@Injectable()
export class PenaltyCheckerCron {
  private readonly logger = new Logger(PenaltyCheckerCron.name);

  constructor(
    private readonly checkinService: CheckinService,
    private readonly penaltiesService: PenaltiesService,
    private readonly dataSource: DataSource,
  ) {}

  @Cron('*/5 * * * *')
  async checkOverdueSchedules(): Promise<void> {
    this.logger.log('Verificando agendamentos com pendência...');

    try {
      const overdueHistoricos: any[] = await this.checkinService.findOverdue();

      for (const h of overdueHistoricos) {
        const alreadyApplied = await this.penaltiesService.isPenaltyAlreadyApplied(h.id);
        if (alreadyApplied) continue;

        const motivo = h.checkin_em
          ? 'Checkout não realizado após 15 min do horário limite'
          : 'Não comparecimento ao encontro agendado';

        await this.penaltiesService.applyPenalty(h.mentor_id, h.id, motivo);
        this.logger.warn(`Penalidade aplicada ao mentor ${h.mentor_id} — ${motivo}`);
      }
    } catch (error) {
      this.logger.error('Erro no job de verificação de penalidades:', error);
    }
  }

  @Cron('0 0 * * *') // Meia-noite
  async expireOldCards(): Promise<void> {
    this.logger.log('Verificando cards expirados...');

    try {
      const result = await this.dataSource.query(`
        UPDATE cards_ajuda c
        SET c.status = 'EXPIRADO'
        WHERE c.status = 'ABERTO'
          AND NOT EXISTS (
            SELECT 1 FROM disponibilidades d
            WHERE d.card_id = c.id AND d.data >= CURDATE()
          )
          AND EXISTS (
            SELECT 1 FROM disponibilidades d2
            WHERE d2.card_id = c.id
          )
      `);

      if (result.affectedRows > 0) {
        this.logger.warn(`${result.affectedRows} card(s) expirado(s) automaticamente.`);
      }
    } catch (error) {
      this.logger.error('Erro no job de expiração de cards:', error);
    }
  }
}
