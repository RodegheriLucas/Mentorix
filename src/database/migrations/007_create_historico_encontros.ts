import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateHistoricoEncontros1700000007000 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS historico_encontros (
        id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        agendamento_id INT UNSIGNED NOT NULL,
        data_encontro DATE NOT NULL,
        checkin_em DATETIME NULL,
        checkout_em DATETIME NULL,
        duracao_horas DECIMAL(5,2) NULL,
        horas_consolidadas TINYINT(1) DEFAULT 0,
        gestor_id INT UNSIGNED NULL,
        criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (agendamento_id) REFERENCES agendamentos(id),
        FOREIGN KEY (gestor_id) REFERENCES usuarios(id) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE IF EXISTS historico_encontros;');
  }
}
