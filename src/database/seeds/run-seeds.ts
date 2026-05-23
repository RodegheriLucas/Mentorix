import 'reflect-metadata';
import { AppDataSource } from '../../config/data-source';
import * as bcrypt from 'bcrypt';

async function runSeeds() {
  await AppDataSource.initialize();
  console.log('Database connected. Running seeds...');

  const SENHA_HASH = await bcrypt.hash('123456', 12);

  // Seed usuarios
  await AppDataSource.query(`
    INSERT IGNORE INTO usuarios (email, senha_hash, nome, papel, telefone, tags_competencia) VALUES
    ('aluno@email.com', '${SENHA_HASH}', 'Ana Silva', 'ALUNO', NULL, NULL),
    ('mentor@email.com', '${SENHA_HASH}', 'Carlos Mentor', 'ALUNO_MENTOR', '(11) 99999-0001', '["SQL","IHC","Python"]'),
    ('professor@email.com', '${SENHA_HASH}', 'Dra. Maria Lima', 'PROFESSOR_MENTOR', '(11) 99999-0002', '["TCC","Metodologia","Pesquisa"]'),
    ('gestor@email.com', '${SENHA_HASH}', 'João Portaria', 'GESTOR', '(11) 99999-0003', NULL)
  `);
  console.log('Usuarios criados.');

  const gestor = await AppDataSource.query(`SELECT id FROM usuarios WHERE email = 'gestor@email.com' LIMIT 1`);
  const gestorId = gestor[0]?.id;

  // Seed ambientes
  await AppDataSource.query(`
    INSERT IGNORE INTO ambientes (nome, bloco, tipo, exige_chave, capacidade, gestor_id) VALUES
    ('Sala A-101', 'Bloco A', 'SALA_FECHADA', 1, 20, ${gestorId}),
    ('Sala A-102', 'Bloco A', 'SALA_FECHADA', 1, 15, ${gestorId}),
    ('Sala B-201', 'Bloco B', 'SALA_FECHADA', 1, 25, ${gestorId}),
    ('Sala B-202', 'Bloco B', 'SALA_FECHADA', 1, 20, ${gestorId}),
    ('Sala B-203', 'Bloco B', 'SALA_FECHADA', 1, 30, ${gestorId}),
    ('Biblioteca — Área de Estudos', 'Biblioteca', 'AMBIENTE_COMUM', 0, 50, ${gestorId}),
    ('Sofás — Bloco de TI', 'Bloco TI', 'AMBIENTE_COMUM', 0, 10, ${gestorId}),
    ('Pátio Central', 'Pátio', 'AMBIENTE_COMUM', 0, 100, ${gestorId})
  `);
  console.log('Ambientes criados.');

  // Reservas institucionais de exemplo (Sala A-101 em datas futuras)
  const ambA101 = await AppDataSource.query(`SELECT id FROM ambientes WHERE nome = 'Sala A-101' LIMIT 1`);
  if (ambA101[0]) {
    await AppDataSource.query(`
      INSERT IGNORE INTO ambiente_reservas (ambiente_id, data, hora_inicio, hora_fim) VALUES
      (${ambA101[0].id}, DATE_ADD(CURDATE(), INTERVAL 1 DAY), '08:00:00', '10:00:00'),
      (${ambA101[0].id}, DATE_ADD(CURDATE(), INTERVAL 3 DAY), '10:00:00', '12:00:00')
    `);
    console.log('Reservas institucionais criadas.');
  }

  console.log('Seeds executados com sucesso!');
  await AppDataSource.destroy();
}

runSeeds().catch((err) => {
  console.error('Erro nos seeds:', err);
  process.exit(1);
});
