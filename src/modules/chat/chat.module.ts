import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatMensagem } from './entities/chat-mensagem.entity';
import { Agendamento } from '../agendamentos/entities/agendamento.entity';
import { ChatService } from './chat.service';
import { ChatController } from './chat.controller';

@Module({
  imports: [TypeOrmModule.forFeature([ChatMensagem, Agendamento])],
  providers: [ChatService],
  controllers: [ChatController],
})
export class ChatModule {}
