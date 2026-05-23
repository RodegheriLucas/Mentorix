import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UsersService } from '../../users/users.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly usersService: UsersService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'mentorix-jwt-secret-dev-2024',
    });
  }

  async validate(payload: { sub: number; email: string; papel: string }) {
    const user = await this.usersService.findById(payload.sub);
    if (!user || !user.ativo) {
      throw new UnauthorizedException('Token inválido.');
    }
    return {
      id: user.id,
      email: user.email,
      papel: user.papel,
      nome: user.nome,
      suspenso_ate: user.suspenso_ate,
      tags_competencia: user.tags_competencia,
    };
  }
}
