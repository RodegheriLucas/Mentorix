import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Contestacao } from './entities/contestacao.entity';
import { HistoricoEncontro } from '../checkin/entities/historico-encontro.entity';
import { Agendamento } from '../agendamentos/entities/agendamento.entity';
import { User } from '../users/entities/user.entity';
import { ContestacaoStatus } from '../../common/types/status.enum';
import { AuditService } from '../audit/audit.service';
import { CreateDisputaDto } from './dto/create-disputa.dto';

@Injectable()
export class DisputesService {
  constructor(
    @InjectRepository(Contestacao)
    private readonly contestacaoRepo: Repository<Contestacao>,
    @InjectRepository(HistoricoEncontro)
    private readonly historicoRepo: Repository<HistoricoEncontro>,
    @InjectRepository(Agendamento)
    private readonly agendamentoRepo: Repository<Agendamento>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    private readonly auditService: AuditService,
    private readonly dataSource: DataSource,
  ) {}

  async create(mentorId: number, dto: CreateDisputaDto, ip?: string): Promise<Contestacao> {
    const agendamento = await this.agendamentoRepo.findOne({ where: { id: dto.agendamento_id } });
    if (!agendamento) throw new NotFoundException('Agendamento não encontrado.');

    if (agendamento.mentor_id !== mentorId) {
      throw new ForbiddenException('Você não pode contestar este agendamento.');
    }

    const historico = await this.historicoRepo.findOne({
      where: { agendamento_id: dto.agendamento_id },
      order: { criado_em: 'DESC' },
    });

    if (!historico) throw new NotFoundException('Histórico de encontro não encontrado. O gestor deve ter realizado o check-in e check-out.');
    if (!historico.checkout_em) throw new BadRequestException('O encontro ainda não foi encerrado pelo gestor (falta check-out).');

    const existing = await this.contestacaoRepo.findOne({ where: { historico_id: historico.id } });
    if (existing) throw new BadRequestException('Já existe uma contestação aberta para este encontro.');

    if (historico.horas_consolidadas) {
      throw new BadRequestException('As horas deste encontro já foram consolidadas via avaliação do aluno.');
    }

    const contestacao = await this.contestacaoRepo.save(
      this.contestacaoRepo.create({
        historico_id: historico.id,
        mentor_id: mentorId,
        justificativa: dto.justificativa,
        foto_url: dto.foto_url,
        status: ContestacaoStatus.ABERTA,
      }),
    );

    await this.auditService.log(mentorId, 'DISPUTA_ABERTA', 'contestacoes', contestacao.id, null, { agendamento_id: dto.agendamento_id, historico_id: historico.id }, ip);

    return contestacao;
  }

  async findAll(): Promise<Contestacao[]> {
    return this.contestacaoRepo.find({
      where: { status: ContestacaoStatus.ABERTA },
      relations: ['mentor', 'historico', 'historico.agendamento', 'historico.agendamento.card', 'historico.agendamento.card.aluno'],
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
