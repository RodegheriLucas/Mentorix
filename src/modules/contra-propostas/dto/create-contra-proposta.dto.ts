import { IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateContraPropostaDto {
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  mensagem?: string;
}
