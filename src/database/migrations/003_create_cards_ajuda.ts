import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateCardsAjuda1700000003 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS cards_ajuda (
        id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        aluno_id INT UNSIGNED NOT NULL,
        titulo VARCHAR(200) NOT NULL,
        descricao TEXT NOT NULL,
        categoria ENUM('GERAL','TCC') NOT NULL,
        tags JSON NOT NULL,
        status ENUM('ABERTO','ACEITO','AGENDADO','EM_ANDAMENTO','CONCLUIDO','CANCELADO') DEFAULT 'ABERTO',
        criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
        atualizado_em DATETIME NULL ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (aluno_id) REFERENCES usuarios(id),
        INDEX idx_categoria_status (categoria, status)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE IF EXISTS cards_ajuda;');
  }
}
