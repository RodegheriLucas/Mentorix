import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
  UpdateDateColumn, ManyToOne, OneToMany, JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Card } from '../../cards/entities/card.entity';
import { Ambiente } from '../../ambientes/entities/ambiente.entity';
import { AgendamentoStatus, DiaSemana } from '../../../common/types/status.enum';

@Entity('agendamentos')
export class Agendamento {
  @PrimaryGeneratedColumn({ unsigned: true })
  id: number;

  @Column({ name: 'card_id', unsigned: true })
  card_id: number;

  @ManyToOne(() => Card)
  @JoinColumn({ name: 'card_id' })
  card: Card;

  @Column({ name: 'mentor_id', unsigned: true })
  mentor_id: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'mentor_id' })
  mentor: User;

  @Column({ name: 'ambiente_id', unsigned: true })
  ambiente_id: number;

  @ManyToOne(() => Ambiente)
  @JoinColumn({ name: 'ambiente_id' })
  ambiente: Ambiente;

  @Column({ name: 'dia_semana', type: 'enum', enum: DiaSemana })
  dia_semana: DiaSemana;

  @Column({ name: 'hora_inicio', type: 'time' })
  hora_inicio: string;

  @Column({ name: 'hora_fim', type: 'time' })
  hora_fim: string;

  @Column({ name: 'instrucoes_gestor', type: 'text', nullable: true })
  instrucoes_gestor: string;

  @Column({ name: 'instrucoes_gestor_em', type: 'datetime', nullable: true })
  instrucoes_gestor_em: Date;

  @Column({ type: 'enum', enum: AgendamentoStatus, default: AgendamentoStatus.PENDENTE_GESTOR })
  status: AgendamentoStatus;

  @CreateDateColumn({ name: 'criado_em' })
  criado_em: Date;

  @UpdateDateColumn({ name: 'atualizado_em', nullable: true })
  atualizado_em: Date;
}
