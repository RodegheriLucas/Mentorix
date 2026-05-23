import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateAmbientes1700000002 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS ambientes (
        id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        nome VARCHAR(150) NOT NULL,
        bloco VARCHAR(50) NOT NULL,
        tipo ENUM('SALA_FECHADA','AMBIENTE_COMUM') NOT NULL,
        exige_chave TINYINT(1) DEFAULT 0,
        capacidade INT UNSIGNED NULL,
        gestor_id INT UNSIGNED NULL,
        ativo TINYINT(1) DEFAULT 1,
        criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (gestor_id) REFERENCES usuarios(id) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE IF EXISTS ambientes;');
  }
}
