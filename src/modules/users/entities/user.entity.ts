import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
  UpdateDateColumn, OneToMany,
} from 'typeorm';
import { Role } from '../../../common/types/roles.enum';
import { Exclude } from 'class-transformer';

@Entity('usuarios')
export class User {
  @PrimaryGeneratedColumn({ unsigned: true })
  id: number;

  @Column({ length: 255, unique: true })
  email: string;

  @Exclude()
  @Column({ name: 'senha_hash', length: 255 })
  senha_hash: string;

  @Column({ length: 150 })
  nome: string;

  @Column({ type: 'enum', enum: Role })
  papel: Role;

  @Column({ length: 20, nullable: true })
  telefone: string;

  @Column({ name: 'tags_competencia', type: 'json', nullable: true })
  tags_competencia: string[];

  @Column({ name: 'horas_complementares', type: 'decimal', precision: 8, scale: 2, default: 0 })
  horas_complementares: number;

  @Column({ name: 'suspenso_ate', type: 'datetime', nullable: true })
  suspenso_ate: Date;

  @Column({ name: 'total_infracoes', unsigned: true, default: 0 })
  total_infracoes: number;

  @Column({ name: 'avatar_url', length: 500, nullable: true })
  avatar_url: string;

  @Column({ default: 1 })
  ativo: number;

  @CreateDateColumn({ name: 'criado_em' })
  criado_em: Date;

  @UpdateDateColumn({ name: 'atualizado_em', nullable: true })
  atualizado_em: Date;
}
