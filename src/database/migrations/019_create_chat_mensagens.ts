import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateChatMensagens1700000019000 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS chat_mensagens (
        id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        agendamento_id INT UNSIGNED NOT NULL,
        autor_id INT UNSIGNED NOT NULL,
        mensagem TEXT NOT NULL,
        criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (agendamento_id) REFERENCES agendamentos(id) ON DELETE CASCADE,
        FOREIGN KEY (autor_id) REFERENCES usuarios(id),
        INDEX idx_chat_agendamento (agendamento_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE IF EXISTS chat_mensagens;');
  }
}
