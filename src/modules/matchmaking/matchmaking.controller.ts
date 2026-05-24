import { Controller, Get, Post, Param, Body, ParseIntPipe, UseGuards, Req, ValidationPipe } from '@nestjs/common';
import { MatchmakingService } from './matchmaking.service';
import { ConfirmMatchDto } from './dto/confirm-match.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { PenaltyGuard } from '../../common/guards/penalty.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Role } from '../../common/types/roles.enum';
import { CardsService } from '../cards/cards.service';
import { CardCategoria } from '../../common/types/status.enum';

@Controller('api/feed')
@UseGuards(JwtAuthGuard, RolesGuard, PenaltyGuard)
@Roles(Role.ALUNO_MENTOR, Role.PROFESSOR_MENTOR)
export class MatchmakingController {
  constructor(
    private readonly matchmakingService: MatchmakingService,
    private readonly cardsService: CardsService,
  ) {}

  @Get()
  async getFeed(@CurrentUser() user: any) {
    if (user.papel === Role.PROFESSOR_MENTOR) {
      return this.cardsService.findTccFeedForProfessor(user.id);
    }
    return this.cardsService.findByCategoria(CardCategoria.GERAL, user.tags_competencia);
  }

  @Get(':cardId/slots')
  getSlots(@Param('cardId', ParseIntPipe) cardId: number) {
    return this.matchmakingService.findAvailableSlots(cardId);
  }

  @Post(':cardId/aceitar')
  aceitar(
    @Param('cardId', ParseIntPipe) cardId: number,
    @Body(ValidationPipe) dto: ConfirmMatchDto,
    @CurrentUser() user: any,
    @Req() req: any,
  ) {
    return this.matchmakingService.confirmMatch(cardId, user.id, dto, req.ip);
  }

  @Post(':cardId/aceitar-tcc')
  @Roles(Role.PROFESSOR_MENTOR)
  aceitarTcc(
    @Param('cardId', ParseIntPipe) cardId: number,
    @CurrentUser() user: any,
    @Req() req: any,
  ) {
    return this.matchmakingService.confirmMatchTcc(cardId, user.id, req.ip);
  }
}
