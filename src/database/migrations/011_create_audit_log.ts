import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateAuditLog1700000011 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS audit_log (
        id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        usuario_id INT UNSIGNED NULL,
        acao VARCHAR(100) NOT NULL,
        entidade VARCHAR(50) NOT NULL,
        entidade_id INT UNSIGNED NOT NULL,
        dados_anteriores JSON NULL,
        dados_novos JSON NULL,
        ip VARCHAR(45) NULL,
        criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE IF EXISTS audit_log;');
  }
}
