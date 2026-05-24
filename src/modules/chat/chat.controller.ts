import { Controller, Get, Post, Param, Body, ParseIntPipe, UseGuards } from '@nestjs/common';
import { ChatService } from './chat.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('api/chat')
@UseGuards(JwtAuthGuard)
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get(':agendamentoId')
  findMensagens(
    @Param('agendamentoId', ParseIntPipe) agendamentoId: number,
    @CurrentUser() user: any,
  ) {
    return this.chatService.findMensagens(agendamentoId, user.id);
  }

  @Post(':agendamentoId')
  enviar(
    @Param('agendamentoId', ParseIntPipe) agendamentoId: number,
    @Body('mensagem') mensagem: string,
    @CurrentUser() user: any,
  ) {
    return this.chatService.enviarMensagem(agendamentoId, user.id, mensagem);
  }
}
