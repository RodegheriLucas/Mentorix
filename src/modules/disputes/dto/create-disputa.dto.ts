import { Transform } from 'class-transformer';
import { IsInt, IsString, MinLength } from 'class-validator';

export class CreateDisputaDto {
  @IsInt()
  @Transform(({ value }) => Number(value))
  agendamento_id: number;

  @IsString()
  @MinLength(10)
  justificativa: string;

  foto_url?: string;
}
