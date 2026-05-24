import { MigrationInterface, QueryRunner } from 'typeorm';

export class AlterAgendamentosNullableTcc1700000016000 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE agendamentos
        MODIFY COLUMN ambiente_id INT UNSIGNED NULL,
        MODIFY COLUMN data DATE NULL,
        MODIFY COLUMN hora_inicio TIME NULL,
        MODIFY COLUMN hora_fim TIME NULL;
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE agendamentos
        MODIFY COLUMN ambiente_id INT UNSIGNED NOT NULL,
        MODIFY COLUMN data DATE NOT NULL,
        MODIFY COLUMN hora_inicio TIME NOT NULL,
        MODIFY COLUMN hora_fim TIME NOT NULL;
    `);
  }
}
