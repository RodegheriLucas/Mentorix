import {
  Controller, Get, Post, Patch, Delete, Body, Param, ParseIntPipe,
  UseGuards, UseInterceptors, UploadedFile, BadRequestException, Req,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import * as fs from 'fs';
import { CardsService } from './cards.service';
import { CreateCardDto } from './dto/create-card.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { PenaltyGuard } from '../../common/guards/penalty.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Role } from '../../common/types/roles.enum';
import { ValidationPipe } from '@nestjs/common';

const ALLOWED_EXTS = ['.pdf', '.doc', '.docx', '.txt', '.png', '.jpg', '.jpeg'];

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

  @Post(':id/documento')
  @UseGuards(RolesGuard, PenaltyGuard)
  @Roles(Role.ALUNO)
  @UseInterceptors(FileInterceptor('arquivo', {
    storage: diskStorage({
      destination: (req, file, cb) => {
        const dir = './uploads/card-docs';
        fs.mkdirSync(dir, { recursive: true });
        cb(null, dir);
      },
      filename: (req, file, cb) => {
        const ext = extname(file.originalname).toLowerCase();
        cb(null, `card-${req.params.id}-${Date.now()}${ext}`);
      },
    }),
    fileFilter: (req, file, cb) => {
      const ext = extname(file.originalname).toLowerCase();
      cb(null, ALLOWED_EXTS.includes(ext));
    },
    limits: { fileSize: 10 * 1024 * 1024 },
  }))
  uploadDocumento(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: any,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) throw new BadRequestException('Arquivo inválido. Formatos aceitos: PDF, DOC, DOCX, TXT, PNG, JPG.');
    return this.cardsService.updateDocumento(id, user.id, file.filename);
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
