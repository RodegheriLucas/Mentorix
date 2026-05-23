import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';

@Injectable()
export class PenaltyGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const { user } = context.switchToHttp().getRequest();

    if (user?.suspenso_ate && new Date(user.suspenso_ate) > new Date()) {
      throw new ForbiddenException({
        message: 'Conta suspensa por penalidade.',
        suspenso_ate: user.suspenso_ate,
        code: 'ACCOUNT_SUSPENDED',
      });
    }

    return true;
  }
}
