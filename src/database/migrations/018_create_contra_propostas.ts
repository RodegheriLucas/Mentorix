import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateContraPropostas1700000018000 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS contra_propostas (
        id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        card_id INT UNSIGNED NOT NULL,
        professor_id INT UNSIGNED NOT NULL,
        mensagem TEXT NULL,
        status ENUM('PENDENTE','ACEITA','RECUSADA') DEFAULT 'PENDENTE',
        criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (card_id) REFERENCES cards_ajuda(id) ON DELETE CASCADE,
        FOREIGN KEY (professor_id) REFERENCES usuarios(id),
        UNIQUE KEY uq_proposta_card_professor (card_id, professor_id),
        INDEX idx_card_status (card_id, status)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE IF EXISTS contra_propostas;');
  }
}
