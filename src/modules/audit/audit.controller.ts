import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AuditService } from './audit.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/types/roles.enum';

@Controller('api/audit')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.GESTOR)
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Get()
  findAll(@Query('page') page = '1', @Query('limit') limit = '50') {
    return this.auditService.findAll(+page, +limit);
  }
}
