import { Controller, Get, Param, ParseIntPipe, UseGuards, ClassSerializerInterceptor, UseInterceptors, Query } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Role } from '../../common/types/roles.enum';

@Controller('api/users')
@UseGuards(JwtAuthGuard)
@UseInterceptors(ClassSerializerInterceptor)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  getMe(@CurrentUser() user: any) {
    return this.usersService.findById(user.id);
  }

  @Get()
  findAll(@Query('papel') papel?: Role) {
    return this.usersService.findActiveByRole(papel);
  }

  @Get('professores/lista')
  async listarProfessores() {
    return this.usersService.findActiveByRole(Role.PROFESSOR_MENTOR);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.findById(id);
  }
}
