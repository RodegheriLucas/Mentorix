import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateAmbienteReservas1700000006 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS ambiente_reservas (
        id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        ambiente_id INT UNSIGNED NOT NULL,
        dia_semana ENUM('SEG','TER','QUA','QUI','SEX','SAB') NOT NULL,
        hora_inicio TIME NOT NULL,
        hora_fim TIME NOT NULL,
        agendamento_id INT UNSIGNED NULL,
        criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (ambiente_id) REFERENCES ambientes(id) ON DELETE CASCADE,
        FOREIGN KEY (agendamento_id) REFERENCES agendamentos(id) ON DELETE SET NULL,
        UNIQUE KEY uk_reserva (ambiente_id, dia_semana, hora_inicio, hora_fim)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE IF EXISTS ambiente_reservas;');
  }
}
