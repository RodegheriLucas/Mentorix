import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateUsuarios1700000001 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS usuarios (
        id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(255) NOT NULL UNIQUE,
        senha_hash VARCHAR(255) NOT NULL,
        nome VARCHAR(150) NOT NULL,
        papel ENUM('ALUNO','ALUNO_MENTOR','PROFESSOR_MENTOR','GESTOR') NOT NULL,
        telefone VARCHAR(20) NULL,
        tags_competencia JSON NULL,
        horas_complementares DECIMAL(8,2) DEFAULT 0.00,
        suspenso_ate DATETIME NULL,
        total_infracoes INT UNSIGNED DEFAULT 0,
        avatar_url VARCHAR(500) NULL,
        ativo TINYINT(1) DEFAULT 1,
        criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
        atualizado_em DATETIME NULL ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE IF EXISTS usuarios;');
  }
}
