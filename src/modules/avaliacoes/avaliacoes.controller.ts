import { Controller, Post, Get, Body, UseGuards, Req } from '@nestjs/common';
import { AvaliacoesService } from './avaliacoes.service';
import { CreateAvaliacaoDto } from './dto/create-avaliacao.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Role } from '../../common/types/roles.enum';

@Controller('api/avaliacoes')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ALUNO)
export class AvaliacoesController {
  constructor(private readonly avaliacoesService: AvaliacoesService) {}

  @Post()
  create(@Body() dto: CreateAvaliacaoDto, @CurrentUser() user: any, @Req() req: any) {
    return this.avaliacoesService.create(user.id, dto, req.ip);
  }

  @Get('pendentes')
  pendentes(@CurrentUser() user: any) {
    return this.avaliacoesService.findPendentes(user.id);
  }

  @Get('historico')
  historico(@CurrentUser() user: any) {
    return this.avaliacoesService.findHistorico(user.id);
  }
}
