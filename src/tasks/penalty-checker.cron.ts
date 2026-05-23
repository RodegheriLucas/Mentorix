import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { CheckinService } from '../modules/checkin/checkin.service';
import { PenaltiesService } from '../modules/penalties/penalties.service';

@Injectable()
export class PenaltyCheckerCron {
  private readonly logger = new Logger(PenaltyCheckerCron.name);

  constructor(
    private readonly checkinService: CheckinService,
    private readonly penaltiesService: PenaltiesService,
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
}
