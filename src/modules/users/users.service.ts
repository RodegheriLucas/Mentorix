import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { Role } from '../../common/types/roles.enum';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  async findById(id: number): Promise<User> {
    const user = await this.userRepo.findOne({ where: { id, ativo: 1 } });
    if (!user) throw new NotFoundException('Usuário não encontrado.');
    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepo.findOne({ where: { email, ativo: 1 } });
  }

  async findAll(): Promise<User[]> {
    return this.userRepo.find({ where: { ativo: 1 }, select: ['id', 'nome', 'email', 'papel', 'tags_competencia', 'horas_complementares', 'avatar_url'] });
  }

  async findActiveByRole(role?: Role): Promise<Partial<User>[]> {
    return this.userRepo.find({
      where: role ? { ativo: 1, papel: role } : { ativo: 1 },
      select: ['id', 'nome', 'email', 'papel', 'tags_competencia', 'horas_complementares', 'avatar_url'],
      order: { nome: 'ASC' },
    });
  }

  async updateSuspension(userId: number, suspendedUntil: Date | null): Promise<void> {
    await this.userRepo.update(userId, { suspenso_ate: suspendedUntil ?? undefined });
  }

  async incrementInfractions(userId: number): Promise<number> {
    await this.userRepo.increment({ id: userId }, 'total_infracoes', 1);
    const user = await this.findById(userId);
    return user.total_infracoes;
  }

  async addHoras(userId: number, horas: number): Promise<void> {
    await this.userRepo.increment({ id: userId }, 'horas_complementares', horas);
  }
}
