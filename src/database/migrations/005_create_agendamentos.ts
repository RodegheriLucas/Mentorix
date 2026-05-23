import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateAgendamentos1700000005 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS agendamentos (
        id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        card_id INT UNSIGNED NOT NULL,
        mentor_id INT UNSIGNED NOT NULL,
        ambiente_id INT UNSIGNED NOT NULL,
        dia_semana ENUM('SEG','TER','QUA','QUI','SEX','SAB') NOT NULL,
        hora_inicio TIME NOT NULL,
        hora_fim TIME NOT NULL,
        instrucoes_gestor TEXT NULL,
        instrucoes_gestor_em DATETIME NULL,
        status ENUM('PENDENTE_GESTOR','AGENDADO','EM_ANDAMENTO','CONCLUIDO','CANCELADO','DISPUTA') DEFAULT 'PENDENTE_GESTOR',
        criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
        atualizado_em DATETIME NULL ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (card_id) REFERENCES cards_ajuda(id),
        FOREIGN KEY (mentor_id) REFERENCES usuarios(id),
        FOREIGN KEY (ambiente_id) REFERENCES ambientes(id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE IF EXISTS agendamentos;');
  }
}
