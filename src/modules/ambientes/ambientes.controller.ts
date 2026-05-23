import { Controller, Get, Post, Patch, Body, Param, ParseIntPipe, UseGuards, ValidationPipe } from '@nestjs/common';
import { AmbientesService } from './ambientes.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/types/roles.enum';
import { Ambiente } from './entities/ambiente.entity';

@Controller('api/ambientes')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.GESTOR)
export class AmbientesController {
  constructor(private readonly ambientesService: AmbientesService) {}

  @Get()
  findAll() {
    return this.ambientesService.findAll();
  }

  @Post()
  create(@Body() dto: Partial<Ambiente>) {
    return this.ambientesService.create(dto);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: Partial<Ambiente>) {
    return this.ambientesService.update(id, dto);
  }

  @Get(':id/reservas')
  reservas(@Param('id', ParseIntPipe) id: number) {
    return this.ambientesService.findReservasByAmbiente(id);
  }
}
