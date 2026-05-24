const mysql = require('mysql2');
require('dotenv').config();
const con = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE
});
con.query("ALTER TABLE cards_ajuda MODIFY COLUMN status ENUM('ABERTO','ACEITO','AGENDADO','EM_ANDAMENTO','CONCLUIDO','CANCELADO','EXPIRADO') DEFAULT 'ABERTO'", (err, res) => {
  if (err) {
    if (err.code === 'ER_TABLE_NOT_FOUND') {
      console.log('No cards_ajuda table? Maybe running synchronize first.');
    } else {
      console.error(err);
    }
  } else {
    console.log('DB Updated');
  }
  con.end();
});
