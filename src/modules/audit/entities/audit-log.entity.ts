import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
  ManyToOne, JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('audit_log')
export class AuditLog {
  @PrimaryGeneratedColumn('increment', { unsigned: true, type: 'bigint' })
  id: number;

  @Column({ name: 'usuario_id', unsigned: true, nullable: true })
  usuario_id: number;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'usuario_id' })
  usuario: User;

  @Column({ length: 100 })
  acao: string;

  @Column({ length: 50 })
  entidade: string;

  @Column({ name: 'entidade_id', unsigned: true })
  entidade_id: number;

  @Column({ name: 'dados_anteriores', type: 'json', nullable: true })
  dados_anteriores: any;

  @Column({ name: 'dados_novos', type: 'json', nullable: true })
  dados_novos: any;

  @Column({ length: 45, nullable: true })
  ip: string;

  @CreateDateColumn({ name: 'criado_em' })
  criado_em: Date;
}
