import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateContestacoes1700000009 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS contestacoes (
        id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        historico_id INT UNSIGNED NOT NULL,
        mentor_id INT UNSIGNED NOT NULL,
        justificativa TEXT NOT NULL,
        foto_url VARCHAR(500) NULL,
        status ENUM('ABERTA','APROVADA','REJEITADA') DEFAULT 'ABERTA',
        gestor_id INT UNSIGNED NULL,
        gestor_parecer TEXT NULL,
        resolvida_em DATETIME NULL,
        criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (historico_id) REFERENCES historico_encontros(id),
        FOREIGN KEY (mentor_id) REFERENCES usuarios(id),
        FOREIGN KEY (gestor_id) REFERENCES usuarios(id) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE IF EXISTS contestacoes;');
  }
}
