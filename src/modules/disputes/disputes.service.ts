import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Contestacao } from './entities/contestacao.entity';
import { HistoricoEncontro } from '../checkin/entities/historico-encontro.entity';
import { User } from '../users/entities/user.entity';
import { ContestacaoStatus } from '../../common/types/status.enum';
import { AuditService } from '../audit/audit.service';

export class CreateDisputaDto {
  historico_id: number;
  justificativa: string;
  foto_url?: string;
}

@Injectable()
export class DisputesService {
  constructor(
    @InjectRepository(Contestacao)
    private readonly contestacaoRepo: Repository<Contestacao>,
    @InjectRepository(HistoricoEncontro)
    private readonly historicoRepo: Repository<HistoricoEncontro>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    private readonly auditService: AuditService,
    private readonly dataSource: DataSource,
  ) {}

  async create(mentorId: number, dto: CreateDisputaDto, ip?: string): Promise<Contestacao> {
    const historico = await this.historicoRepo.findOne({ where: { id: dto.historico_id } });
    if (!historico) throw new NotFoundException('Histórico não encontrado.');

    const existing = await this.contestacaoRepo.findOne({ where: { historico_id: dto.historico_id } });
    if (existing) throw new BadRequestException('Contestação já aberta para este encontro.');

    const contestacao = await this.contestacaoRepo.save(
      this.contestacaoRepo.create({
        historico_id: dto.historico_id,
        mentor_id: mentorId,
        justificativa: dto.justificativa,
        foto_url: dto.foto_url,
        status: ContestacaoStatus.ABERTA,
      }),
    );

    await this.auditService.log(mentorId, 'DISPUTA_ABERTA', 'contestacoes', contestacao.id, null, { historico_id: dto.historico_id }, ip);

    return contestacao;
  }

  async findAll(): Promise<Contestacao[]> {
    return this.contestacaoRepo.find({
      where: { status: ContestacaoStatus.ABERTA },
      relations: ['mentor', 'historico'],
      order: { criado_em: 'ASC' },
    });
  }

  async resolver(id: number, gestorId: number, aprovada: boolean, parecer: string, ip?: string): Promise<Contestacao> {
    const contestacao = await this.contestacaoRepo.findOne({
      where: { id },
      relations: ['historico', 'historico.agendamento', 'historico.agendamento.mentor'],
    });
    if (!contestacao) throw new NotFoundException('Contestação não encontrada.');
    if (contestacao.status !== ContestacaoStatus.ABERTA) throw new BadRequestException('Contestação já resolvida.');

    const novoStatus = aprovada ? ContestacaoStatus.APROVADA : ContestacaoStatus.REJEITADA;

    await this.contestacaoRepo.update(id, {
      status: novoStatus,
      gestor_id: gestorId,
      gestor_parecer: parecer,
      resolvida_em: new Date(),
    });

    if (aprovada && contestacao.historico) {
      await this.dataSource.transaction(async (manager) => {
        await manager.update(HistoricoEncontro, contestacao.historico.id, { horas_consolidadas: 1 });
        const mentor = contestacao.historico.agendamento?.mentor;
        if (mentor && contestacao.historico.duracao_horas) {
          await manager.increment(User, { id: mentor.id }, 'horas_complementares', Number(contestacao.historico.duracao_horas));
        }
      });
    }

    await this.auditService.log(
      gestorId, 'DISPUTA_RESOLVIDA', 'contestacoes', id,
      { status: ContestacaoStatus.ABERTA }, { status: novoStatus, parecer }, ip,
    );

    return this.contestacaoRepo.findOne({ where: { id } }) as Promise<Contestacao>;
  }
}
