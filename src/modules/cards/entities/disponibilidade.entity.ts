import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
  ManyToOne, JoinColumn,
} from 'typeorm';
import { Card } from './card.entity';
import { DiaSemana } from '../../../common/types/status.enum';

@Entity('disponibilidades')
export class Disponibilidade {
  @PrimaryGeneratedColumn({ unsigned: true })
  id: number;

  @Column({ name: 'card_id', unsigned: true })
  card_id: number;

  @ManyToOne(() => Card, (c) => c.disponibilidades, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'card_id' })
  card: Card;

  @Column({ name: 'dia_semana', type: 'enum', enum: DiaSemana })
  dia_semana: DiaSemana;

  @Column({ name: 'hora_inicio', type: 'time' })
  hora_inicio: string;

  @Column({ name: 'hora_fim', type: 'time' })
  hora_fim: string;

  @CreateDateColumn({ name: 'criado_em' })
  criado_em: Date;
}
