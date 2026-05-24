import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
  ManyToOne, JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Agendamento } from '../../agendamentos/entities/agendamento.entity';

@Entity('chat_mensagens')
export class ChatMensagem {
  @PrimaryGeneratedColumn({ unsigned: true })
  id: number;

  @Column({ name: 'agendamento_id', unsigned: true })
  agendamento_id: number;

  @ManyToOne(() => Agendamento)
  @JoinColumn({ name: 'agendamento_id' })
  agendamento: Agendamento;

  @Column({ name: 'autor_id', unsigned: true })
  autor_id: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'autor_id' })
  autor: User;

  @Column({ type: 'text' })
  mensagem: string;

  @CreateDateColumn({ name: 'criado_em' })
  criado_em: Date;
}
