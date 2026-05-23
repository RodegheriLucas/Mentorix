import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
  ManyToOne, OneToMany, JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { AmbienteReserva } from './ambiente-reserva.entity';
import { AmbienteTipo } from '../../../common/types/status.enum';

@Entity('ambientes')
export class Ambiente {
  @PrimaryGeneratedColumn({ unsigned: true })
  id: number;

  @Column({ length: 150 })
  nome: string;

  @Column({ length: 50 })
  bloco: string;

  @Column({ type: 'enum', enum: AmbienteTipo })
  tipo: AmbienteTipo;

  @Column({ name: 'exige_chave', default: 0 })
  exige_chave: number;

  @Column({ unsigned: true, nullable: true })
  capacidade: number;

  @Column({ name: 'gestor_id', unsigned: true, nullable: true })
  gestor_id: number;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'gestor_id' })
  gestor: User;

  @OneToMany(() => AmbienteReserva, (r) => r.ambiente)
  reservas: AmbienteReserva[];

  @Column({ default: 1 })
  ativo: number;

  @CreateDateColumn({ name: 'criado_em' })
  criado_em: Date;
}
