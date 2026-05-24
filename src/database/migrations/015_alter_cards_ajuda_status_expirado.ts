import { MigrationInterface, QueryRunner } from 'typeorm';

export class AlterCardsAjudaStatusExpirado1700000015000 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE cards_ajuda
      MODIFY COLUMN status ENUM('ABERTO','ACEITO','AGENDADO','EM_ANDAMENTO','CONCLUIDO','CANCELADO','EXPIRADO') DEFAULT 'ABERTO'
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE cards_ajuda
      MODIFY COLUMN status ENUM('ABERTO','ACEITO','AGENDADO','EM_ANDAMENTO','CONCLUIDO','CANCELADO') DEFAULT 'ABERTO'
    `);
  }
}
