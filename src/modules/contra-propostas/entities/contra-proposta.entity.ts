import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
  ManyToOne, JoinColumn,
} from 'typeorm';
import { Card } from '../../cards/entities/card.entity';
import { User } from '../../users/entities/user.entity';

export enum ContraPropostaStatus {
  PENDENTE = 'PENDENTE',
  ACEITA = 'ACEITA',
  RECUSADA = 'RECUSADA',
}

@Entity('contra_propostas')
export class ContraProposta {
  @PrimaryGeneratedColumn({ unsigned: true })
  id: number;

  @Column({ name: 'card_id', unsigned: true })
  card_id: number;

  @ManyToOne(() => Card, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'card_id' })
  card: Card;

  @Column({ name: 'professor_id', unsigned: true })
  professor_id: number;

  @ManyToOne(() => User, { eager: true })
  @JoinColumn({ name: 'professor_id' })
  professor: User;

  @Column({ type: 'text', nullable: true })
  mensagem: string;

  @Column({ type: 'enum', enum: ContraPropostaStatus, default: ContraPropostaStatus.PENDENTE })
  status: ContraPropostaStatus;

  @CreateDateColumn({ name: 'criado_em' })
  criado_em: Date;
}
