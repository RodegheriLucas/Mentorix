import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async login(dto: LoginDto) {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user) {
      throw new UnauthorizedException('Credenciais inválidas.');
    }

    const passwordValid = await bcrypt.compare(dto.senha, user.senha_hash);
    if (!passwordValid) {
      throw new UnauthorizedException('Credenciais inválidas.');
    }

    const payload = { sub: user.id, email: user.email, papel: user.papel };

    const accessToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_SECRET || 'mentorix-jwt-secret-dev-2024',
      expiresIn: process.env.JWT_EXPIRES_IN || '15m',
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_REFRESH_SECRET || 'mentorix-refresh-secret-dev-2024',
      expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
    });

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
      user: {
        id: user.id,
        email: user.email,
        nome: user.nome,
        papel: user.papel,
        telefone: user.telefone,
        tags_competencia: user.tags_competencia,
        horas_complementares: user.horas_complementares,
        suspenso_ate: user.suspenso_ate,
        avatar_url: user.avatar_url,
      },
    };
  }

  async refresh(token: string) {
    try {
      const payload = this.jwtService.verify(token, {
        secret: process.env.JWT_REFRESH_SECRET || 'mentorix-refresh-secret-dev-2024',
      });

      const user = await this.usersService.findById(payload.sub);
      const newPayload = { sub: user.id, email: user.email, papel: user.papel };

      return {
        access_token: this.jwtService.sign(newPayload, {
          secret: process.env.JWT_SECRET || 'mentorix-jwt-secret-dev-2024',
          expiresIn: process.env.JWT_EXPIRES_IN || '15m',
        }),
      };
    } catch {
      throw new UnauthorizedException('Refresh token inválido ou expirado.');
    }
  }
}
