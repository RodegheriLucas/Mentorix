import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Contestacao } from './entities/contestacao.entity';
import { HistoricoEncontro } from '../checkin/entities/historico-encontro.entity';
import { User } from '../users/entities/user.entity';
import { DisputesService } from './disputes.service';
import { DisputesController } from './disputes.controller';
import { AuditModule } from '../audit/audit.module';

@Module({
  imports: [TypeOrmModule.forFeature([Contestacao, HistoricoEncontro, User]), AuditModule],
  providers: [DisputesService],
  controllers: [DisputesController],
})
export class DisputesModule {}
