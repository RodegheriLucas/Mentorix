import {
  IsArray, IsEnum, IsNotEmpty, IsString, MaxLength, ValidateNested, ArrayMinSize,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CardCategoria, DiaSemana } from '../../../common/types/status.enum';

class DisponibilidadeDto {
  @IsEnum(DiaSemana)
  dia_semana: DiaSemana;

  @IsString()
  hora_inicio: string;

  @IsString()
  hora_fim: string;
}

export class CreateCardDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(200)
  titulo: string;

  @IsNotEmpty()
  @IsString()
  descricao: string;

  @IsEnum(CardCategoria)
  categoria: CardCategoria;

  @IsArray()
  @IsString({ each: true })
  tags: string[];

  @IsArray()
  @ArrayMinSize(1, { message: 'Informe ao menos uma disponibilidade.' })
  @ValidateNested({ each: true })
  @Type(() => DisponibilidadeDto)
  disponibilidades: DisponibilidadeDto[];
}
