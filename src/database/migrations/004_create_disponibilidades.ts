import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateDisponibilidades1700000004 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS disponibilidades (
        id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        card_id INT UNSIGNED NOT NULL,
        dia_semana ENUM('SEG','TER','QUA','QUI','SEX','SAB') NOT NULL,
        hora_inicio TIME NOT NULL,
        hora_fim TIME NOT NULL,
        criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (card_id) REFERENCES cards_ajuda(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE IF EXISTS disponibilidades;');
  }
}
