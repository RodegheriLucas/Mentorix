import { Injectable, BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Avaliacao } from './entities/avaliacao.entity';
import { HistoricoEncontro } from '../checkin/entities/historico-encontro.entity';
import { User } from '../users/entities/user.entity';
import { AuditService } from '../audit/audit.service';
import { CreateAvaliacaoDto } from './dto/create-avaliacao.dto';

@Injectable()
export class AvaliacoesService {
  constructor(
    @InjectRepository(Avaliacao)
    private readonly avaliacaoRepo: Repository<Avaliacao>,
    @InjectRepository(HistoricoEncontro)
    private readonly historicoRepo: Repository<HistoricoEncontro>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    private readonly auditService: AuditService,
    private readonly dataSource: DataSource,
  ) {}

  async create(alunoId: number, dto: CreateAvaliacaoDto, ip?: string): Promise<Avaliacao> {
    const historico = await this.historicoRepo.findOne({
      where: { id: dto.historico_id },
      relations: ['agendamento', 'agendamento.card', 'agendamento.card.aluno', 'agendamento.mentor'],
    });

    if (!historico) throw new NotFoundException('Histórico não encontrado.');

    if (historico.agendamento?.card?.aluno?.id !== alunoId) {
      throw new ForbiddenException('Você não pode avaliar este encontro.');
    }

    if (!historico.checkin_em || !historico.checkout_em) {
      throw new BadRequestException('Encontro sem check-in/check-out completo.');
    }

    const jaAvaliado = await this.avaliacaoRepo.findOne({ where: { historico_id: dto.historico_id } });
    if (jaAvaliado) throw new BadRequestException('Este encontro já foi avaliado.');

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

  async findPendentes(alunoId: number): Promise<any[]> {
    const rows = await this.historicoRepo.query(`
      SELECT
        h.id,
        h.data_encontro,
        h.checkin_em,
        h.checkout_em,
        h.duracao_horas,
        a.data AS dia_semana,
        a.hora_inicio,
        a.hora_fim,
        c.titulo AS card_titulo,
        c.tags  AS card_tags,
        u.nome  AS mentor_nome,
        u.avatar_url AS mentor_avatar
      FROM historico_encontros h
      JOIN agendamentos a ON h.agendamento_id = a.id
      JOIN cards_ajuda c  ON a.card_id = c.id
      JOIN usuarios u     ON a.mentor_id = u.id
      WHERE c.aluno_id = ?
        AND h.checkout_em IS NOT NULL
        AND h.id NOT IN (SELECT historico_id FROM avaliacoes)
      ORDER BY h.data_encontro DESC
    `, [alunoId]);

    return rows.map((r: any) => ({
      ...r,
      card_tags: typeof r.card_tags === 'string' ? JSON.parse(r.card_tags) : r.card_tags,
    }));
  }

  async findHistorico(alunoId: number): Promise<any[]> {
    const rows = await this.historicoRepo.query(`
      SELECT
        av.id AS avaliacao_id,
        av.nota,
        av.depoimento,
        av.criado_em AS avaliado_em,
        h.data_encontro,
        h.duracao_horas,
        a.hora_inicio,
        a.hora_fim,
        a.data AS dia_semana,
        c.titulo AS card_titulo,
        c.tags  AS card_tags,
        u.nome  AS mentor_nome,
        u.avatar_url AS mentor_avatar
      FROM avaliacoes av
      JOIN historico_encontros h ON av.historico_id = h.id
      JOIN agendamentos a ON h.agendamento_id = a.id
      JOIN cards_ajuda c  ON a.card_id = c.id
      JOIN usuarios u     ON a.mentor_id = u.id
      WHERE av.aluno_id = ?
      ORDER BY av.criado_em DESC
    `, [alunoId]);

    return rows.map((r: any) => ({
      ...r,
      card_tags: typeof r.card_tags === 'string' ? JSON.parse(r.card_tags) : r.card_tags,
    }));
  }
}
