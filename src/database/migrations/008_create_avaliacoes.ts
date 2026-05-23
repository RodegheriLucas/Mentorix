import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateAvaliacoes1700000008000 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS avaliacoes (
        id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        historico_id INT UNSIGNED NOT NULL,
        aluno_id INT UNSIGNED NOT NULL,
        nota TINYINT UNSIGNED NOT NULL CHECK (nota BETWEEN 1 AND 5),
        depoimento TEXT NULL,
        criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (historico_id) REFERENCES historico_encontros(id),
        FOREIGN KEY (aluno_id) REFERENCES usuarios(id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE IF EXISTS avaliacoes;');
  }
}
