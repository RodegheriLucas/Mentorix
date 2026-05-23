import { MigrationInterface, QueryRunner } from 'typeorm';

export class AlterAgendamentosData1700000013000 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`SET FOREIGN_KEY_CHECKS = 0;`);
    await queryRunner.query(`DELETE FROM ambiente_reservas;`);
    await queryRunner.query(`DELETE FROM agendamentos;`);
    await queryRunner.query(`SET FOREIGN_KEY_CHECKS = 1;`);
    await queryRunner.query(`
      ALTER TABLE agendamentos
        DROP COLUMN dia_semana,
        ADD COLUMN data DATE NOT NULL AFTER ambiente_id;
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`SET FOREIGN_KEY_CHECKS = 0;`);
    await queryRunner.query(`DELETE FROM agendamentos;`);
    await queryRunner.query(`SET FOREIGN_KEY_CHECKS = 1;`);
    await queryRunner.query(`
      ALTER TABLE agendamentos
        DROP COLUMN data,
        ADD COLUMN dia_semana ENUM('SEG','TER','QUA','QUI','SEX','SAB') NOT NULL AFTER ambiente_id;
    `);
  }
}
