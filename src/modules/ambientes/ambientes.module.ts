import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Ambiente } from './entities/ambiente.entity';
import { AmbienteReserva } from './entities/ambiente-reserva.entity';
import { AmbientesService } from './ambientes.service';
import { AmbientesController } from './ambientes.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Ambiente, AmbienteReserva])],
  providers: [AmbientesService],
  controllers: [AmbientesController],
  exports: [AmbientesService],
})
export class AmbientesModule {}
