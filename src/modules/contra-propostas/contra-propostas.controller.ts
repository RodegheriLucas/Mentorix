import {
  Controller, Post, Get, Param, Body, ParseIntPipe,
  UseGuards, Req, ValidationPipe,
} from '@nestjs/common';
import { ContraPropostasService } from './contra-propostas.service';
import { CreateContraPropostaDto } from './dto/create-contra-proposta.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { PenaltyGuard } from '../../common/guards/penalty.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Role } from '../../common/types/roles.enum';

@Controller('api/contra-propostas')
@UseGuards(JwtAuthGuard, RolesGuard, PenaltyGuard)
export class ContraPropostasController {
  constructor(private readonly svc: ContraPropostasService) {}

  @Post('card/:cardId')
  @Roles(Role.PROFESSOR_MENTOR)
  enviar(
    @Param('cardId', ParseIntPipe) cardId: number,
    @Body(ValidationPipe) dto: CreateContraPropostaDto,
    @CurrentUser() user: any,
    @Req() req: any,
  ) {
    return this.svc.enviar(cardId, user.id, dto, req.ip);
  }

  @Get('card/:cardId')
  @Roles(Role.ALUNO)
  findByCard(
    @Param('cardId', ParseIntPipe) cardId: number,
    @CurrentUser() user: any,
  ) {
    return this.svc.findByCard(cardId, user.id);
  }

  @Post(':id/aceitar')
  @Roles(Role.ALUNO)
  aceitar(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: any,
    @Req() req: any,
  ) {
    return this.svc.aceitar(id, user.id, req.ip);
  }

  @Post(':id/recusar')
  @Roles(Role.ALUNO)
  recusar(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: any,
    @Req() req: any,
  ) {
    return this.svc.recusar(id, user.id, req.ip);
  }
}
