import { IsNumber, IsString, IsEnum } from 'class-validator';
import { DiaSemana } from '../../../common/types/status.enum';

export class ConfirmMatchDto {
  @IsNumber()
  ambienteId: number;

  @IsEnum(DiaSemana)
  diaSemana: DiaSemana;

  @IsString()
  horaInicio: string;

  @IsString()
  horaFim: string;
}
