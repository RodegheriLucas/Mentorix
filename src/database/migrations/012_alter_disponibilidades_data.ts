import { MigrationInterface, QueryRunner } from 'typeorm';

export class AlterDisponibilidadesData1700000012000 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DELETE FROM disponibilidades;`);
    await queryRunner.query(`
      ALTER TABLE disponibilidades
        DROP COLUMN dia_semana,
        ADD COLUMN data DATE NOT NULL AFTER card_id;
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE disponibilidades
        DROP COLUMN data,
        ADD COLUMN dia_semana ENUM('SEG','TER','QUA','QUI','SEX','SAB') NOT NULL AFTER card_id;
    `);
  }
}
