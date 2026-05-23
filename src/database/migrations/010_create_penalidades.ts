import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreatePenalidades1700000010 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS penalidades (
        id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        usuario_id INT UNSIGNED NOT NULL,
        historico_id INT UNSIGNED NULL,
        numero_infracao INT UNSIGNED NOT NULL,
        dias_suspensao INT UNSIGNED NOT NULL,
        motivo TEXT NOT NULL,
        inicio_suspensao DATETIME NOT NULL,
        fim_suspensao DATETIME NOT NULL,
        criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
        FOREIGN KEY (historico_id) REFERENCES historico_encontros(id) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE IF EXISTS penalidades;');
  }
}
