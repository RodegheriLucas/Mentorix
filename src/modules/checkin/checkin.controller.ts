import { Controller, Post, Get, Param, ParseIntPipe, UseGuards, Req } from '@nestjs/common';
import { CheckinService } from './checkin.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Role } from '../../common/types/roles.enum';

@Controller('api')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CheckinController {
  constructor(private readonly checkinService: CheckinService) {}

  @Post('checkin/:agendamentoId')
  @Roles(Role.GESTOR)
  checkin(
    @Param('agendamentoId', ParseIntPipe) id: number,
    @CurrentUser() user: any,
    @Req() req: any,
  ) {
    return this.checkinService.checkin(id, user.id, req.ip);
  }

  @Post('checkout/:agendamentoId')
  @Roles(Role.GESTOR)
  checkout(
    @Param('agendamentoId', ParseIntPipe) id: number,
    @CurrentUser() user: any,
    @Req() req: any,
  ) {
    return this.checkinService.checkout(id, user.id, req.ip);
  }

  @Get('historico/:agendamentoId')
  historico(@Param('agendamentoId', ParseIntPipe) id: number) {
    return this.checkinService.findByAgendamento(id);
  }
}
