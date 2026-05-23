import { IsInt, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';

export class CreateAvaliacaoDto {
  @IsInt()
  historico_id: number;

  @IsInt()
  @Min(1)
  @Max(5)
  nota: number;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  depoimento?: string;
}
