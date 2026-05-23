import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
  UpdateDateColumn, ManyToOne, OneToMany, JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Disponibilidade } from './disponibilidade.entity';
import { CardStatus, CardCategoria } from '../../../common/types/status.enum';

@Entity('cards_ajuda')
export class Card {
  @PrimaryGeneratedColumn({ unsigned: true })
  id: number;

  @Column({ name: 'aluno_id', unsigned: true })
  aluno_id: number;

  @ManyToOne(() => User, { eager: false })
  @JoinColumn({ name: 'aluno_id' })
  aluno: User;

  @Column({ length: 200 })
  titulo: string;

  @Column({ type: 'text' })
  descricao: string;

  @Column({ type: 'enum', enum: CardCategoria })
  categoria: CardCategoria;

  @Column({ type: 'json' })
  tags: string[];

  @Column({ type: 'enum', enum: CardStatus, default: CardStatus.ABERTO })
  status: CardStatus;

  @OneToMany(() => Disponibilidade, (d) => d.card, { cascade: true, eager: true })
  disponibilidades: Disponibilidade[];

  @CreateDateColumn({ name: 'criado_em' })
  criado_em: Date;

  @UpdateDateColumn({ name: 'atualizado_em', nullable: true })
  atualizado_em: Date;
}
