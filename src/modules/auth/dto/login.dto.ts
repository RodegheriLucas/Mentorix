import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  @IsNotEmpty({ message: 'O usuário/email é obrigatório.' })
  @IsString()
  email: string;

  @IsNotEmpty({ message: 'Senha é obrigatória.' })
  @IsString()
  senha: string;
}
