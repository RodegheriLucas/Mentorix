import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Avaliacao } from './entities/avaliacao.entity';
import { HistoricoEncontro } from '../checkin/entities/historico-encontro.entity';
import { User } from '../users/entities/user.entity';
import { AvaliacoesService } from './avaliacoes.service';
import { AvaliacoesController } from './avaliacoes.controller';
import { CheckinModule } from '../checkin/checkin.module';
import { AuditModule } from '../audit/audit.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Avaliacao, HistoricoEncontro, User]),
    CheckinModule,
    AuditModule,
  ],
  providers: [AvaliacoesService],
  controllers: [AvaliacoesController],
})
export class AvaliacoesModule {}
