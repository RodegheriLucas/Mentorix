import { Controller, Get, Patch, Param, Body, ParseIntPipe, UseGuards, Req } from '@nestjs/common';
import { AgendamentosService } from './agendamentos.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Role } from '../../common/types/roles.enum';

@Controller('api/agendamentos')
@UseGuards(JwtAuthGuard)
export class AgendamentosController {
  constructor(private readonly agendamentosService: AgendamentosService) {}

  @Get()
  findAll(@CurrentUser() user: any) {
    return this.agendamentosService.findByUser(user.id, user.papel);
  }

  @Get('hoje')
  @UseGuards(RolesGuard)
  @Roles(Role.GESTOR)
  hoje() {
    return this.agendamentosService.findHojeGestor();
  }

  @Get('pendentes')
  @UseGuards(RolesGuard)
  @Roles(Role.GESTOR)
  pendentes() {
    return this.agendamentosService.findPendentesGestor();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.agendamentosService.findById(id);
  }

  @Patch(':id/instrucoes')
  @UseGuards(RolesGuard)
  @Roles(Role.GESTOR)
  instrucoes(
    @Param('id', ParseIntPipe) id: number,
    @Body('instrucoes') instrucoes: string,
    @CurrentUser() user: any,
    @Req() req: any,
  ) {
    return this.agendamentosService.injetarInstrucoes(id, user.id, instrucoes, req.ip);
  }

  @Patch(':id/cancelar')
  cancelar(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: any) {
    return this.agendamentosService.cancelar(id, user.id, user.papel);
  }
}
