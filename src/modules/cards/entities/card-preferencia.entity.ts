import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
  ManyToOne, JoinColumn,
} from 'typeorm';
import { Card } from './card.entity';
import { User } from '../../users/entities/user.entity';

@Entity('card_preferencias')
export class CardPreferencia {
  @PrimaryGeneratedColumn({ unsigned: true })
  id: number;

  @Column({ name: 'card_id', unsigned: true })
  card_id: number;

  @ManyToOne(() => Card, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'card_id' })
  card: Card;

  @Column({ name: 'professor_id', unsigned: true })
  professor_id: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'professor_id' })
  professor: User;

  @CreateDateColumn({ name: 'criado_em' })
  criado_em: Date;
}
