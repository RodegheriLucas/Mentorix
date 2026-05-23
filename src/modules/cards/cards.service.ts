import {
  Injectable, NotFoundException, BadRequestException, ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Card } from './entities/card.entity';
import { Disponibilidade } from './entities/disponibilidade.entity';
import { CreateCardDto } from './dto/create-card.dto';
import { CardStatus, CardCategoria } from '../../common/types/status.enum';
import { Role } from '../../common/types/roles.enum';
import { AuditService } from '../audit/audit.service';

@Injectable()
export class CardsService {
  constructor(
    @InjectRepository(Card)
    private readonly cardRepo: Repository<Card>,
    @InjectRepository(Disponibilidade)
    private readonly dispRepo: Repository<Disponibilidade>,
    private readonly auditService: AuditService,
  ) {}

  private validateSlots(disponibilidades: { hora_inicio: string; hora_fim: string }[]) {
    for (const slot of disponibilidades) {
      const [hI, mI] = slot.hora_inicio.split(':').map(Number);
      const [hF, mF] = slot.hora_fim.split(':').map(Number);
      const minutos = (hF * 60 + mF) - (hI * 60 + mI);
      if (minutos < 60) {
        throw new BadRequestException(`Slot ${slot.hora_inicio}-${slot.hora_fim} tem menos de 1 hora.`);
      }
    }
  }

  async create(alunoId: number, dto: CreateCardDto, ip?: string): Promise<Card> {
    this.validateSlots(dto.disponibilidades);

    const card = this.cardRepo.create({
      aluno_id: alunoId,
      titulo: dto.titulo,
      descricao: dto.descricao,
      categoria: dto.categoria,
      tags: dto.tags,
      status: CardStatus.ABERTO,
    });

    const saved = await this.cardRepo.save(card);

    const disps = dto.disponibilidades.map((d) =>
      this.dispRepo.create({ ...d, card_id: saved.id }),
    );
    await this.dispRepo.save(disps);

    const full = await this.findById(saved.id);
    await this.auditService.log(alunoId, 'CARD_CRIADO', 'cards_ajuda', saved.id, null, { titulo: dto.titulo }, ip);

    return full;
  }

  async findById(id: number): Promise<Card> {
    const card = await this.cardRepo.findOne({
      where: { id },
      relations: ['aluno', 'disponibilidades'],
    });
    if (!card) throw new NotFoundException('Card não encontrado.');
    return card;
  }

  async findByAluno(alunoId: number): Promise<Card[]> {
    return this.cardRepo.find({
      where: { aluno_id: alunoId },
      relations: ['disponibilidades'],
      order: { criado_em: 'DESC' },
    });
  }

  async findByCategoria(categoria: CardCategoria, tagsFilter?: string[]): Promise<Card[]> {
    const qb = this.cardRepo
      .createQueryBuilder('card')
      .leftJoinAndSelect('card.aluno', 'aluno')
      .leftJoinAndSelect('card.disponibilidades', 'disp')
      .where('card.categoria = :categoria', { categoria })
      .andWhere('card.status = :status', { status: CardStatus.ABERTO })
      .orderBy('card.criado_em', 'DESC');

    return qb.getMany();
  }

  async update(cardId: number, alunoId: number, dto: Partial<CreateCardDto>): Promise<Card> {
    const card = await this.findById(cardId);
    if (card.aluno_id !== alunoId) throw new ForbiddenException('Sem permissão para editar este card.');
    if (card.status !== CardStatus.ABERTO) throw new BadRequestException('Só é possível editar cards ABERTO.');

    if (dto.disponibilidades) {
      this.validateSlots(dto.disponibilidades);
      await this.dispRepo.delete({ card_id: cardId });
      const disps = dto.disponibilidades.map((d) => this.dispRepo.create({ ...d, card_id: cardId }));
      await this.dispRepo.save(disps);
    }

    await this.cardRepo.update(cardId, {
      titulo: dto.titulo,
      descricao: dto.descricao,
      categoria: dto.categoria,
      tags: dto.tags,
    });

    return this.findById(cardId);
  }

  async cancelar(cardId: number, alunoId: number): Promise<void> {
    const card = await this.findById(cardId);
    if (card.aluno_id !== alunoId) throw new ForbiddenException('Sem permissão.');
    if (![CardStatus.ABERTO, CardStatus.ACEITO].includes(card.status)) {
      throw new BadRequestException('Não é possível cancelar neste status.');
    }
    await this.cardRepo.update(cardId, { status: CardStatus.CANCELADO });
  }

  async updateStatus(cardId: number, status: CardStatus): Promise<void> {
    await this.cardRepo.update(cardId, { status });
  }
}
