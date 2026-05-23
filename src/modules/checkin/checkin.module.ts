import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HistoricoEncontro } from './entities/historico-encontro.entity';
import { Agendamento } from '../agendamentos/entities/agendamento.entity';
import { CheckinService } from './checkin.service';
import { CheckinController } from './checkin.controller';
import { AgendamentosModule } from '../agendamentos/agendamentos.module';
import { AuditModule } from '../audit/audit.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([HistoricoEncontro, Agendamento]),
    AgendamentosModule,
    AuditModule,
  ],
  providers: [CheckinService],
  controllers: [CheckinController],
  exports: [CheckinService],
})
export class CheckinModule {}
