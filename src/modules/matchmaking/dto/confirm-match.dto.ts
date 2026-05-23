import { IsNumber, IsString, IsDateString } from 'class-validator';

export class ConfirmMatchDto {
  @IsNumber()
  ambienteId: number;

  @IsDateString()
  data: string;

  @IsString()
  horaInicio: string;

  @IsString()
  horaFim: string;
}
