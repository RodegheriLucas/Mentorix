import { Controller, Post, Get, Patch, Body, Param, ParseIntPipe, UseGuards, Req, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { DisputesService } from './disputes.service';
import { CreateDisputaDto } from './dto/create-disputa.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Role } from '../../common/types/roles.enum';

@Controller('api/disputas')
@UseGuards(JwtAuthGuard)
export class DisputesController {
  constructor(private readonly disputesService: DisputesService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles(Role.ALUNO_MENTOR, Role.PROFESSOR_MENTOR)
  @UseInterceptors(
    FileInterceptor('foto', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => cb(null, `${Date.now()}${extname(file.originalname)}`),
      }),
      limits: { fileSize: 5 * 1024 * 1024 },
    }),
  )
  create(
    @Body() dto: CreateDisputaDto,
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() user: any,
    @Req() req: any,
  ) {
    if (file) dto.foto_url = `/uploads/${file.filename}`;
    return this.disputesService.create(user.id, dto, req.ip);
  }

  @Get()
  @UseGuards(RolesGuard)
  @Roles(Role.GESTOR)
  findAll() {
    return this.disputesService.findAll();
  }

  @Patch(':id/resolver')
  @UseGuards(RolesGuard)
  @Roles(Role.GESTOR)
  resolver(
    @Param('id', ParseIntPipe) id: number,
    @Body('aprovada') aprovada: boolean,
    @Body('parecer') parecer: string,
    @CurrentUser() user: any,
    @Req() req: any,
  ) {
    return this.disputesService.resolver(id, user.id, aprovada, parecer, req.ip);
  }
}
