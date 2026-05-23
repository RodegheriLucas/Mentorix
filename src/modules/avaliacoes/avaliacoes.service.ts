import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Avaliacao } from './entities/avaliacao.entity';
import { HistoricoEncontro } from '../checkin/entities/historico-encontro.entity';
import { User } from '../users/entities/user.entity';
import { CheckinService } from '../checkin/checkin.service';
import { AuditService } from '../audit/audit.service';

export class CreateAvaliacaoDto {
  historico_id: number;
  nota: number;
  depoimento?: string;
}

@Injectable()
export class AvaliacoesService {
  constructor(
    @InjectRepository(Avaliacao)
    private readonly avaliacaoRepo: Repository<Avaliacao>,
    @InjectRepository(HistoricoEncontro)
    private readonly historicoRepo: Repository<HistoricoEncontro>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    private readonly checkinService: CheckinService,
    private readonly auditService: AuditService,
    private readonly dataSource: DataSource,
  ) {}

  async create(alunoId: number, dto: CreateAvaliacaoDto, ip?: string): Promise<Avaliacao> {
    if (dto.nota < 1 || dto.nota > 5) throw new BadRequestException('Nota deve ser entre 1 e 5.');

    const historico = await this.historicoRepo.findOne({
      where: { id: dto.historico_id },
      relations: ['agendamento', 'agendamento.mentor'],
    });

    if (!historico) throw new NotFoundException('Histórico não encontrado.');
    if (!historico.checkin_em || !historico.checkout_em) {
      throw new BadRequestException('Encontro sem check-in/check-out completo.');
    }
    if (historico.horas_consolidadas) {
      throw new BadRequestException('Avaliação já realizada para este encontro.');
    }

    return this.dataSource.transaction(async (manager) => {
      const avaliacao = await manager.save(Avaliacao, {
        historico_id: dto.historico_id,
        aluno_id: alunoId,
        nota: dto.nota,
        depoimento: dto.depoimento,
      });

      await manager.update(HistoricoEncontro, historico.id, { horas_consolidadas: 1 });

      const mentor = historico.agendamento?.mentor;
      if (mentor) {
        await manager.increment(User, { id: mentor.id }, 'horas_complementares', Number(historico.duracao_horas));
      }

      await this.auditService.log(
        alunoId, 'AVALIACAO_ENVIADA', 'avaliacoes', avaliacao.id,
        null, { nota: dto.nota, historico_id: dto.historico_id }, ip,
      );

      if (mentor) {
        await this.auditService.log(
          alunoId, 'HORAS_CONSOLIDADAS', 'usuarios', mentor.id,
          null, { delta: historico.duracao_horas }, ip,
        );
      }

      return avaliacao;
    });
  }

  async findPendentes(alunoId: number): Promise<HistoricoEncontro[]> {
    return this.checkinService.findPendentesAvaliacao(alunoId);
  }
}
