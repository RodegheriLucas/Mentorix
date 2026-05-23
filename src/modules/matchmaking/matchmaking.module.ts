import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Agendamento } from '../agendamentos/entities/agendamento.entity';
import { AmbienteReserva } from '../ambientes/entities/ambiente-reserva.entity';
import { Card } from '../cards/entities/card.entity';
import { MatchmakingService } from './matchmaking.service';
import { MatchmakingController } from './matchmaking.controller';
import { AmbientesModule } from '../ambientes/ambientes.module';
import { CardsModule } from '../cards/cards.module';
import { AuditModule } from '../audit/audit.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Agendamento, AmbienteReserva, Card]),
    AmbientesModule,
    CardsModule,
    AuditModule,
  ],
  providers: [MatchmakingService],
  controllers: [MatchmakingController],
})
export class MatchmakingModule {}
