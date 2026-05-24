import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Agendamento } from './entities/agendamento.entity';
import { AgendamentosService } from './agendamentos.service';
import { AgendamentosController } from './agendamentos.controller';
import { AuditModule } from '../audit/audit.module';
import { Card } from '../cards/entities/card.entity';

import { AmbienteReserva } from '../ambientes/entities/ambiente-reserva.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Agendamento, Card, AmbienteReserva]),
    AuditModule,
  ],
  providers: [AgendamentosService],
  controllers: [AgendamentosController],
  exports: [AgendamentosService],
})
export class AgendamentosModule {}
