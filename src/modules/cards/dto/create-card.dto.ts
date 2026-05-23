import {
  IsArray, IsEnum, IsNotEmpty, IsString, IsDateString, MaxLength, ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CardCategoria } from '../../../common/types/status.enum';

class DisponibilidadeDto {
  @IsDateString()
  data: string;

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
  @ValidateNested({ each: true })
  @Type(() => DisponibilidadeDto)
  disponibilidades: DisponibilidadeDto[];
}
