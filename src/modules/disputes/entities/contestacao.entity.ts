import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
  ManyToOne, JoinColumn,
} from 'typeorm';
import { HistoricoEncontro } from '../../checkin/entities/historico-encontro.entity';
import { User } from '../../users/entities/user.entity';
import { ContestacaoStatus } from '../../../common/types/status.enum';

@Entity('contestacoes')
export class Contestacao {
  @PrimaryGeneratedColumn({ unsigned: true })
  id: number;

  @Column({ name: 'historico_id', unsigned: true })
  historico_id: number;

  @ManyToOne(() => HistoricoEncontro)
  @JoinColumn({ name: 'historico_id' })
  historico: HistoricoEncontro;

  @Column({ name: 'mentor_id', unsigned: true })
  mentor_id: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'mentor_id' })
  mentor: User;

  @Column({ type: 'text' })
  justificativa: string;

  @Column({ name: 'foto_url', length: 500, nullable: true })
  foto_url: string;

  @Column({ type: 'enum', enum: ContestacaoStatus, default: ContestacaoStatus.ABERTA })
  status: ContestacaoStatus;

  @Column({ name: 'gestor_id', unsigned: true, nullable: true })
  gestor_id: number;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'gestor_id' })
  gestor: User;

  @Column({ name: 'gestor_parecer', type: 'text', nullable: true })
  gestor_parecer: string;

  @Column({ name: 'resolvida_em', type: 'datetime', nullable: true })
  resolvida_em: Date;

  @CreateDateColumn({ name: 'criado_em' })
  criado_em: Date;
}
