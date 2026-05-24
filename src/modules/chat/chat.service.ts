import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ChatMensagem } from './entities/chat-mensagem.entity';
import { Agendamento } from '../agendamentos/entities/agendamento.entity';

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(ChatMensagem)
    private readonly mensagemRepo: Repository<ChatMensagem>,
    @InjectRepository(Agendamento)
    private readonly agendamentoRepo: Repository<Agendamento>,
  ) {}

  private async assertAccess(agendamentoId: number, userId: number): Promise<Agendamento> {
    const ag = await this.agendamentoRepo.findOne({
      where: { id: agendamentoId },
      relations: ['card', 'card.aluno'],
    });
    if (!ag) throw new NotFoundException('Agendamento não encontrado.');
    const alunoId = ag.card?.aluno?.id;
    if (ag.mentor_id !== userId && alunoId !== userId) throw new ForbiddenException();
    return ag;
  }

  async findMensagens(agendamentoId: number, userId: number): Promise<ChatMensagem[]> {
    await this.assertAccess(agendamentoId, userId);
    return this.mensagemRepo.find({
      where: { agendamento_id: agendamentoId },
      relations: ['autor'],
      order: { criado_em: 'ASC' },
    });
  }

  async enviarMensagem(agendamentoId: number, autorId: number, mensagem: string): Promise<ChatMensagem> {
    await this.assertAccess(agendamentoId, autorId);
    const msg = this.mensagemRepo.create({ agendamento_id: agendamentoId, autor_id: autorId, mensagem });
    const saved = await this.mensagemRepo.save(msg);
    return this.mensagemRepo.findOne({ where: { id: saved.id }, relations: ['autor'] }) as Promise<ChatMensagem>;
  }
}
