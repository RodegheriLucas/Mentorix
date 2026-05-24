import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
  UpdateDateColumn, ManyToOne, OneToMany, JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Card } from '../../cards/entities/card.entity';
import { Ambiente } from '../../ambientes/entities/ambiente.entity';
import { AgendamentoStatus } from '../../../common/types/status.enum';

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

  @Column({ name: 'ambiente_id', unsigned: true, nullable: true })
  ambiente_id: number | null;

  @ManyToOne(() => Ambiente, { nullable: true })
  @JoinColumn({ name: 'ambiente_id' })
  ambiente: Ambiente | null;

  @Column({ name: 'data', type: 'date', nullable: true })
  data: string | null;

  @Column({ name: 'hora_inicio', type: 'time', nullable: true })
  hora_inicio: string | null;

  @Column({ name: 'hora_fim', type: 'time', nullable: true })
  hora_fim: string | null;

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
