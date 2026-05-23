import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLog } from './entities/audit-log.entity';

@Injectable()
export class AuditService {
  constructor(
    @InjectRepository(AuditLog)
    private readonly auditRepo: Repository<AuditLog>,
  ) {}

  async log(
    usuarioId: number | null,
    acao: string,
    entidade: string,
    entidadeId: number,
    dadosAnteriores: any,
    dadosNovos: any,
    ip?: string,
  ): Promise<void> {
    await this.auditRepo.save({
      usuario_id: usuarioId ?? undefined,
      acao,
      entidade,
      entidade_id: entidadeId,
      dados_anteriores: dadosAnteriores,
      dados_novos: dadosNovos,
      ip,
    });
  }

  async findAll(page = 1, limit = 50) {
    const [data, total] = await this.auditRepo.findAndCount({
      order: { criado_em: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { data, total, page, limit };
  }
}
