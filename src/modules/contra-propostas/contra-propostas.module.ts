import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ContraProposta } from './entities/contra-proposta.entity';
import { Card } from '../cards/entities/card.entity';
import { Agendamento } from '../agendamentos/entities/agendamento.entity';
import { ContraPropostasService } from './contra-propostas.service';
import { ContraPropostasController } from './contra-propostas.controller';
import { AuditModule } from '../audit/audit.module';

@Module({
  imports: [TypeOrmModule.forFeature([ContraProposta, Card, Agendamento]), AuditModule],
  providers: [ContraPropostasService],
  controllers: [ContraPropostasController],
  exports: [ContraPropostasService],
})
export class ContraPropostasModule {}
