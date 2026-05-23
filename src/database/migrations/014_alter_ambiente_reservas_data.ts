import { MigrationInterface, QueryRunner } from 'typeorm';

export class AlterAmbienteReservasData1700000014000 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DELETE FROM ambiente_reservas;`);
    await queryRunner.query(`
      ALTER TABLE ambiente_reservas
        DROP COLUMN dia_semana,
        ADD COLUMN data DATE NOT NULL AFTER ambiente_id,
        DROP INDEX uk_reserva,
        ADD UNIQUE KEY uk_reserva (ambiente_id, data, hora_inicio, hora_fim);
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DELETE FROM ambiente_reservas;`);
    await queryRunner.query(`
      ALTER TABLE ambiente_reservas
        DROP COLUMN data,
        ADD COLUMN dia_semana ENUM('SEG','TER','QUA','QUI','SEX','SAB') NOT NULL AFTER ambiente_id,
        DROP INDEX uk_reserva,
        ADD UNIQUE KEY uk_reserva (ambiente_id, dia_semana, hora_inicio, hora_fim);
    `);
  }
}
