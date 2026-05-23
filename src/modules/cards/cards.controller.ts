import {
  Controller, Get, Post, Patch, Delete, Body, Param, ParseIntPipe,
  UseGuards, Request, ValidationPipe, Req,
} from '@nestjs/common';
import { CardsService } from './cards.service';
import { CreateCardDto } from './dto/create-card.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { PenaltyGuard } from '../../common/guards/penalty.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Role } from '../../common/types/roles.enum';

@Controller('api/cards')
@UseGuards(JwtAuthGuard)
export class CardsController {
  constructor(private readonly cardsService: CardsService) {}

  @Post()
  @UseGuards(RolesGuard, PenaltyGuard)
  @Roles(Role.ALUNO)
  create(@Body(ValidationPipe) dto: CreateCardDto, @CurrentUser() user: any, @Req() req: any) {
    return this.cardsService.create(user.id, dto, req.ip);
  }

  @Get('meus')
  meus(@CurrentUser() user: any) {
    return this.cardsService.findByAluno(user.id);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.cardsService.findById(id);
  }

  @Patch(':id')
  @UseGuards(RolesGuard, PenaltyGuard)
  @Roles(Role.ALUNO)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body(ValidationPipe) dto: Partial<CreateCardDto>,
    @CurrentUser() user: any,
  ) {
    return this.cardsService.update(id, user.id, dto);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(Role.ALUNO)
  cancelar(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: any) {
    return this.cardsService.cancelar(id, user.id);
  }
}
