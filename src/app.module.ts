import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

import { databaseConfig } from './config/database.config';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { CardsModule } from './modules/cards/cards.module';
import { MatchmakingModule } from './modules/matchmaking/matchmaking.module';
import { AmbientesModule } from './modules/ambientes/ambientes.module';
import { AgendamentosModule } from './modules/agendamentos/agendamentos.module';
import { CheckinModule } from './modules/checkin/checkin.module';
import { PenaltiesModule } from './modules/penalties/penalties.module';
import { AvaliacoesModule } from './modules/avaliacoes/avaliacoes.module';
import { DisputesModule } from './modules/disputes/disputes.module';
import { AuditModule } from './modules/audit/audit.module';
import { ContraPropostasModule } from './modules/contra-propostas/contra-propostas.module';
import { ChatModule } from './modules/chat/chat.module';
import { PenaltyCheckerCron } from './tasks/penalty-checker.cron';

@Module({
  imports: [
    TypeOrmModule.forRoot(databaseConfig()),
    ScheduleModule.forRoot(),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads'),
      serveRoot: '/uploads',
    }),
    AuthModule,
    UsersModule,
    CardsModule,
    MatchmakingModule,
    AmbientesModule,
    AgendamentosModule,
    CheckinModule,
    PenaltiesModule,
    AvaliacoesModule,
    DisputesModule,
    AuditModule,
    ContraPropostasModule,
    ChatModule,
  ],
  providers: [PenaltyCheckerCron],
})
export class AppModule {}
