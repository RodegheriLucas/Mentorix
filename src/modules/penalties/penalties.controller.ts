import { Controller, Get, UseGuards } from '@nestjs/common';
import { PenaltiesService } from './penalties.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Role } from '../../common/types/roles.enum';

@Controller('api/penalidades')
@UseGuards(JwtAuthGuard)
export class PenaltiesController {
  constructor(private readonly penaltiesService: PenaltiesService) {}

  @Get('status')
  status(@CurrentUser() user: any) {
    return this.penaltiesService.getStatus(user.id);
  }

  @Get('historico')
  @UseGuards(RolesGuard)
  @Roles(Role.ALUNO_MENTOR, Role.PROFESSOR_MENTOR)
  historico(@CurrentUser() user: any) {
    return this.penaltiesService.getHistorico(user.id);
  }
}
