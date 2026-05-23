import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Penalidade } from './entities/penalidade.entity';
import { User } from '../users/entities/user.entity';
import { PenaltiesService } from './penalties.service';
import { PenaltiesController } from './penalties.controller';
import { AuditModule } from '../audit/audit.module';

@Module({
  imports: [TypeOrmModule.forFeature([Penalidade, User]), AuditModule],
  providers: [PenaltiesService],
  controllers: [PenaltiesController],
  exports: [PenaltiesService],
})
export class PenaltiesModule {}
