import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Penalidade } from './entities/penalidade.entity';
import { User } from '../users/entities/user.entity';
import { AuditService } from '../audit/audit.service';

function fibonacci(n: number): number {
  if (n <= 1) return n;
  let a = 0, b = 1;
  for (let i = 2; i <= n; i++) {
    [a, b] = [b, a + b];
  }
  return b;
}

@Injectable()
export class PenaltiesService {
  constructor(
    @InjectRepository(Penalidade)
    private readonly penalidadeRepo: Repository<Penalidade>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    private readonly auditService: AuditService,
    private readonly dataSource: DataSource,
  ) {}

  async applyPenalty(mentorId: number, historicoId: number | null, motivo: string): Promise<void> {
    await this.dataSource.transaction(async (manager) => {
      const user = await manager.findOne(User, { where: { id: mentorId } });
      if (!user) return;
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion

      user.total_infracoes += 1;
      const n = user.total_infracoes;
      const diasSuspensao = fibonacci(n + 1);

      const inicio = new Date();
      const fim = new Date(inicio);
      fim.setDate(fim.getDate() + diasSuspensao);

      user.suspenso_ate = fim;
      await manager.save(user);

      await manager.save(Penalidade, {
        usuario_id: mentorId,
        historico_id: historicoId ?? undefined,
        numero_infracao: n,
        dias_suspensao: diasSuspensao,
        motivo,
        inicio_suspensao: inicio,
        fim_suspensao: fim,
      });

      await this.auditService.log(
        mentorId, 'PENALIDADE_APLICADA', 'penalidades', mentorId,
        null, { infracao: n, dias: diasSuspensao, motivo },
      );
    });
  }

  async getStatus(userId: number) {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) return { suspenso: false, suspenso_ate: null, total_infracoes: 0, historico: [] };
    const historico = await this.penalidadeRepo.find({
      where: { usuario_id: userId },
      order: { criado_em: 'ASC' },
    });

    return {
      suspenso: user.suspenso_ate && new Date(user.suspenso_ate) > new Date(),
      suspenso_ate: user.suspenso_ate,
      total_infracoes: user.total_infracoes,
      historico,
    };
  }

  async getHistorico(userId: number): Promise<Penalidade[]> {
    return this.penalidadeRepo.find({
      where: { usuario_id: userId },
      order: { criado_em: 'DESC' },
    });
  }

  async isPenaltyAlreadyApplied(historicoId: number): Promise<boolean> {
    if (!historicoId) return false;
    const existing = await this.penalidadeRepo.findOne({ where: { historico_id: historicoId } });
    return !!existing;
  }
}
