import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Ambiente } from './entities/ambiente.entity';
import { AmbienteReserva } from './entities/ambiente-reserva.entity';
import { AmbienteTipo } from '../../common/types/status.enum';

@Injectable()
export class AmbientesService {
  constructor(
    @InjectRepository(Ambiente)
    private readonly ambienteRepo: Repository<Ambiente>,
    @InjectRepository(AmbienteReserva)
    private readonly reservaRepo: Repository<AmbienteReserva>,
  ) {}

  async findAll(): Promise<Ambiente[]> {
    return this.ambienteRepo.find({ where: { ativo: 1 }, relations: ['gestor'] });
  }

  async findById(id: number): Promise<Ambiente> {
    const a = await this.ambienteRepo.findOne({ where: { id, ativo: 1 }, relations: ['gestor'] });
    if (!a) throw new NotFoundException('Ambiente não encontrado.');
    return a;
  }

  async create(dto: Partial<Ambiente>): Promise<Ambiente> {
    return this.ambienteRepo.save(this.ambienteRepo.create(dto));
  }

  async update(id: number, dto: Partial<Ambiente>): Promise<Ambiente> {
    await this.ambienteRepo.update(id, dto);
    return this.findById(id);
  }

  async findFreeForSlot(data: string, horaInicio: string, horaFim: string): Promise<{
    salasFechadas: Ambiente[];
    ambientesComuns: Ambiente[];
  }> {
    const ocupados = await this.reservaRepo
      .createQueryBuilder('r')
      .select('r.ambiente_id')
      .where('r.data = :data', { data })
      .andWhere('r.hora_inicio < :hfim', { hfim: horaFim })
      .andWhere('r.hora_fim > :hinicio', { hinicio: horaInicio })
      .getRawMany();

    const ocupadosIds = ocupados.map((r) => r.r_ambiente_id);

    const qb = this.ambienteRepo
      .createQueryBuilder('a')
      .where('a.ativo = 1');

    if (ocupadosIds.length > 0) {
      qb.andWhere('a.id NOT IN (:...ids)', { ids: ocupadosIds });
    }

    const livres = await qb.getMany();

    return {
      salasFechadas: livres.filter((a) => a.tipo === AmbienteTipo.SALA_FECHADA),
      ambientesComuns: livres.filter((a) => a.tipo === AmbienteTipo.AMBIENTE_COMUM),
    };
  }

  async createReserva(
    ambienteId: number,
    data: string,
    horaInicio: string,
    horaFim: string,
    agendamentoId?: number,
  ): Promise<AmbienteReserva> {
    const existing = await this.reservaRepo.findOne({
      where: { ambiente_id: ambienteId, data, hora_inicio: horaInicio, hora_fim: horaFim },
    });
    if (existing) throw new ConflictException('Horário já reservado para este ambiente.');

    return this.reservaRepo.save(
      this.reservaRepo.create({
        ambiente_id: ambienteId,
        data,
        hora_inicio: horaInicio,
        hora_fim: horaFim,
        agendamento_id: agendamentoId,
      }),
    );
  }

  async findReservasByAmbiente(ambienteId: number): Promise<AmbienteReserva[]> {
    return this.reservaRepo.find({ where: { ambiente_id: ambienteId } });
  }
}
