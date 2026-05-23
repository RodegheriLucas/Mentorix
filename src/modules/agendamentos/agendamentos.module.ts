import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Agendamento } from './entities/agendamento.entity';
import { AgendamentosService } from './agendamentos.service';
import { AgendamentosController } from './agendamentos.controller';
import { AuditModule } from '../audit/audit.module';

@Module({
  imports: [TypeOrmModule.forFeature([Agendamento]), AuditModule],
  providers: [AgendamentosService],
  controllers: [AgendamentosController],
  exports: [AgendamentosService],
})
export class AgendamentosModule {}
