import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateCardPreferencias1700000017000 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS card_preferencias (
        id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        card_id INT UNSIGNED NOT NULL,
        professor_id INT UNSIGNED NOT NULL,
        criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (card_id) REFERENCES cards_ajuda(id) ON DELETE CASCADE,
        FOREIGN KEY (professor_id) REFERENCES usuarios(id),
        UNIQUE KEY uq_card_professor (card_id, professor_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE IF EXISTS card_preferencias;');
  }
}
