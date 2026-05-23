import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
  ManyToOne, JoinColumn,
} from 'typeorm';
import { Ambiente } from './ambiente.entity';
import { DiaSemana } from '../../../common/types/status.enum';

@Entity('ambiente_reservas')
export class AmbienteReserva {
  @PrimaryGeneratedColumn({ unsigned: true })
  id: number;

  @Column({ name: 'ambiente_id', unsigned: true })
  ambiente_id: number;

  @ManyToOne(() => Ambiente, (a) => a.reservas, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'ambiente_id' })
  ambiente: Ambiente;

  @Column({ name: 'dia_semana', type: 'enum', enum: DiaSemana })
  dia_semana: DiaSemana;

  @Column({ name: 'hora_inicio', type: 'time' })
  hora_inicio: string;

  @Column({ name: 'hora_fim', type: 'time' })
  hora_fim: string;

  @Column({ name: 'agendamento_id', unsigned: true, nullable: true })
  agendamento_id: number;

  @CreateDateColumn({ name: 'criado_em' })
  criado_em: Date;
}
