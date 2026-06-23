require('dotenv').config();
const { Sequelize } = require('sequelize');

const seq = new Sequelize(
  process.env.DB_NAME     || 'FutbolAI',
  process.env.DB_USER     || 'football_user',
  process.env.DB_PASSWORD || 'FootballPassword123!',
  {
    dialect: 'mssql',
    host:    process.env.DB_HOST || 'localhost',
    port:    parseInt(process.env.DB_PORT || '1433'),
    dialectOptions: { options: { encrypt: false, trustServerCertificate: true } },
    logging: false
  }
);

async function main() {
  await seq.authenticate();
  console.log('Conectado a SQL Server.');

  const [[{ total }]] = await seq.query("SELECT COUNT(*) AS total FROM players");
  console.log(`Total actual: ${total} jugadores.`);

  // Deleting all players created on May 12th 2026
  console.log('Eliminando lote de 452 jugadores (2026-05-12)...');
  const [result] = await seq.query("DELETE FROM players WHERE createdAt >= '2026-05-12'");
  
  const [[{ finalCount }]] = await seq.query("SELECT COUNT(*) AS finalCount FROM players");
  console.log(`\nLimpieza completada.`);
  console.log(`Jugadores eliminados: ${total - finalCount}`);
  console.log(`Total final en base de datos: ${finalCount}`);

  await seq.close();
}
main().catch(console.error);
