import { MigrationInterface, QueryRunner } from 'typeorm';

export class AlterCardsAjudaAddDocumento1700000015000 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE cards_ajuda
      ADD COLUMN documento_url VARCHAR(500) NULL AFTER tags;
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE cards_ajuda DROP COLUMN documento_url;`);
  }
}
