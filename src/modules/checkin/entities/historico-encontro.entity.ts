import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
  ManyToOne, OneToOne, JoinColumn,
} from 'typeorm';
import { Agendamento } from '../../agendamentos/entities/agendamento.entity';
import { User } from '../../users/entities/user.entity';

@Entity('historico_encontros')
export class HistoricoEncontro {
  @PrimaryGeneratedColumn({ unsigned: true })
  id: number;

  @Column({ name: 'agendamento_id', unsigned: true })
  agendamento_id: number;

  @ManyToOne(() => Agendamento)
  @JoinColumn({ name: 'agendamento_id' })
  agendamento: Agendamento;

  @Column({ name: 'data_encontro', type: 'date' })
  data_encontro: string;

  @Column({ name: 'checkin_em', type: 'datetime', nullable: true })
  checkin_em: Date;

  @Column({ name: 'checkout_em', type: 'datetime', nullable: true })
  checkout_em: Date;

  @Column({ name: 'duracao_horas', type: 'decimal', precision: 5, scale: 2, nullable: true })
  duracao_horas: number;

  @Column({ name: 'horas_consolidadas', default: 0 })
  horas_consolidadas: number;

  @Column({ name: 'gestor_id', unsigned: true, nullable: true })
  gestor_id: number;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'gestor_id' })
  gestor: User;

  @CreateDateColumn({ name: 'criado_em' })
  criado_em: Date;
}
