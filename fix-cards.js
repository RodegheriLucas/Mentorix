const mysql = require('mysql2/promise');

async function migrate() {
  const c = await mysql.createConnection({host:'127.0.0.1', user:'root', password:'password', database:'mentorix'});
  await c.query("ALTER TABLE cards_ajuda MODIFY COLUMN status ENUM('ABERTO','ACEITO','AGENDADO','EM_ANDAMENTO','CONCLUIDO','CANCELADO','EXPIRADO') NOT NULL DEFAULT 'ABERTO'");
  console.log('Migration done: EXPIRADO added to cards_ajuda.status');
  await c.end();
}

migrate().catch(console.error);
