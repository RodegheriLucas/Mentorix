import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
  ManyToOne, JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { HistoricoEncontro } from '../../checkin/entities/historico-encontro.entity';

@Entity('penalidades')
export class Penalidade {
  @PrimaryGeneratedColumn({ unsigned: true })
  id: number;

  @Column({ name: 'usuario_id', unsigned: true })
  usuario_id: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'usuario_id' })
  usuario: User;

  @Column({ name: 'historico_id', unsigned: true, nullable: true })
  historico_id: number;

  @ManyToOne(() => HistoricoEncontro, { nullable: true })
  @JoinColumn({ name: 'historico_id' })
  historico: HistoricoEncontro;

  @Column({ name: 'numero_infracao', unsigned: true })
  numero_infracao: number;

  @Column({ name: 'dias_suspensao', unsigned: true })
  dias_suspensao: number;

  @Column({ type: 'text' })
  motivo: string;

  @Column({ name: 'inicio_suspensao', type: 'datetime' })
  inicio_suspensao: Date;

  @Column({ name: 'fim_suspensao', type: 'datetime' })
  fim_suspensao: Date;

  @CreateDateColumn({ name: 'criado_em' })
  criado_em: Date;
}
