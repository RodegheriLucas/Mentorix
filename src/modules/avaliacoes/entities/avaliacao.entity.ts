import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
  ManyToOne, JoinColumn,
} from 'typeorm';
import { HistoricoEncontro } from '../../checkin/entities/historico-encontro.entity';
import { User } from '../../users/entities/user.entity';

@Entity('avaliacoes')
export class Avaliacao {
  @PrimaryGeneratedColumn({ unsigned: true })
  id: number;

  @Column({ name: 'historico_id', unsigned: true })
  historico_id: number;

  @ManyToOne(() => HistoricoEncontro)
  @JoinColumn({ name: 'historico_id' })
  historico: HistoricoEncontro;

  @Column({ name: 'aluno_id', unsigned: true })
  aluno_id: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'aluno_id' })
  aluno: User;

  @Column({ type: 'tinyint', unsigned: true })
  nota: number;

  @Column({ type: 'text', nullable: true })
  depoimento: string;

  @CreateDateColumn({ name: 'criado_em' })
  criado_em: Date;
}
