import {
  Injectable, NotFoundException, BadRequestException, ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Card } from './entities/card.entity';
import { Disponibilidade } from './entities/disponibilidade.entity';
import { CardPreferencia } from './entities/card-preferencia.entity';
import { CreateCardDto } from './dto/create-card.dto';
import { CardStatus, CardCategoria } from '../../common/types/status.enum';
import { AuditService } from '../audit/audit.service';

export interface TccFeedItem {
  card: Card;
  is_preferido: boolean;
  tem_preferencias: boolean;
}

@Injectable()
export class CardsService {
  constructor(
    @InjectRepository(Card)
    private readonly cardRepo: Repository<Card>,
    @InjectRepository(Disponibilidade)
    private readonly dispRepo: Repository<Disponibilidade>,
    @InjectRepository(CardPreferencia)
    private readonly prefRepo: Repository<CardPreferencia>,
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
    if (dto.categoria === CardCategoria.TCC) {
      const activeTccCard = await this.cardRepo.findOne({
        where: {
          aluno_id: alunoId,
          categoria: CardCategoria.TCC,
          status: In([CardStatus.ABERTO, CardStatus.ACEITO, CardStatus.AGENDADO, CardStatus.EM_ANDAMENTO]),
        },
      });

      if (activeTccCard) {
        throw new BadRequestException('Você já possui uma solicitação de TCC ativa.');
      }
    }

    if (dto.categoria === CardCategoria.GERAL && dto.disponibilidades.length === 0) {
      throw new BadRequestException('Informe ao menos uma disponibilidade para cards Gerais.');
    }
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

    if (dto.categoria === CardCategoria.TCC && dto.professores_preferidos?.length) {
      const prefs = dto.professores_preferidos.map((profId) =>
        this.prefRepo.create({ card_id: saved.id, professor_id: profId }),
      );
      await this.prefRepo.save(prefs);
    }

    const full = await this.findById(saved.id);
    await this.auditService.log(alunoId, 'CARD_CRIADO', 'cards_ajuda', saved.id, null, { titulo: dto.titulo }, ip);

    return full;
  }

  async findById(id: number): Promise<Card> {
    const card = await this.cardRepo.findOne({
      where: { id },
      relations: ['aluno', 'disponibilidades', 'preferencias', 'preferencias.professor'],
    });
    if (!card) throw new NotFoundException('Card não encontrado.');
    return card;
  }

  async findByAluno(alunoId: number): Promise<Card[]> {
    return this.cardRepo.find({
      where: { aluno_id: alunoId },
      relations: ['disponibilidades', 'preferencias', 'preferencias.professor'],
      order: { criado_em: 'DESC' },
    });
  }

  async findByCategoria(categoria: CardCategoria, tagsFilter?: string[]): Promise<Card[]> {
    const qb = this.cardRepo
      .createQueryBuilder('card')
      .leftJoinAndSelect('card.aluno', 'aluno')
      .leftJoinAndSelect('card.disponibilidades', 'disp')
      .leftJoinAndSelect('card.preferencias', 'pref')
      .leftJoinAndSelect('pref.professor', 'prefProf')
      .where('card.categoria = :categoria', { categoria })
      .andWhere('card.status = :status', { status: CardStatus.ABERTO })
      .orderBy('card.criado_em', 'DESC');

    return qb.getMany();
  }

  async findTccFeedForProfessor(professorId: number): Promise<TccFeedItem[]> {
    const allTcc = await this.cardRepo
      .createQueryBuilder('card')
      .leftJoinAndSelect('card.aluno', 'aluno')
      .leftJoinAndSelect('card.disponibilidades', 'disp')
      .leftJoinAndSelect('card.preferencias', 'pref')
      .leftJoinAndSelect('pref.professor', 'prefProf')
      .where('card.categoria = :categoria', { categoria: CardCategoria.TCC })
      .andWhere('card.status = :status', { status: CardStatus.ABERTO })
      .orderBy('card.criado_em', 'DESC')
      .getMany();

    const items: TccFeedItem[] = [];
    for (const card of allTcc) {
      const tem_preferencias = card.preferencias.length > 0;
      const is_preferido = card.preferencias.some((p) => p.professor_id === professorId);

      // Se o card tem preferências mas este professor não está na lista, não exibir
      if (tem_preferencias && !is_preferido) continue;

      items.push({ card, is_preferido, tem_preferencias });
    }

    // Preferidos primeiro
    items.sort((a, b) => {
      if (a.is_preferido && !b.is_preferido) return -1;
      if (!a.is_preferido && b.is_preferido) return 1;
      return 0;
    });

    return items;
  }

  async update(cardId: number, alunoId: number, dto: Partial<CreateCardDto>): Promise<Card> {
    const card = await this.findById(cardId);
    if (card.aluno_id !== alunoId) throw new ForbiddenException('Sem permissão para editar este card.');
    if (card.status !== CardStatus.ABERTO) throw new BadRequestException('Só é possível editar cards ABERTO.');
    if (dto.categoria && dto.categoria !== card.categoria) {
      throw new BadRequestException('Não é possível alterar a categoria de um card após sua criação.');
    }

    if (dto.disponibilidades) {
      this.validateSlots(dto.disponibilidades);
      await this.dispRepo.delete({ card_id: cardId });
      const disps = dto.disponibilidades.map((d) => this.dispRepo.create({ ...d, card_id: cardId }));
      await this.dispRepo.save(disps);
    }

    if (dto.professores_preferidos !== undefined) {
      await this.prefRepo.delete({ card_id: cardId });
      if (dto.professores_preferidos.length > 0) {
        const prefs = dto.professores_preferidos.map((profId) =>
          this.prefRepo.create({ card_id: cardId, professor_id: profId }),
        );
        await this.prefRepo.save(prefs);
      }
    }

    await this.cardRepo.update(cardId, {
      titulo: dto.titulo,
      descricao: dto.descricao,
      tags: dto.tags,
    });

    return this.findById(cardId);
  }

  async updateDocumento(cardId: number, alunoId: number, filename: string): Promise<Card> {
    const card = await this.findById(cardId);
    if (card.aluno_id !== alunoId) throw new ForbiddenException('Sem permissão.');
    await this.cardRepo.update(cardId, { documento_url: `/uploads/card-docs/${filename}` });
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
