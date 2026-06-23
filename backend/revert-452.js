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

  const [[{ before }]] = await seq.query("SELECT COUNT(*) AS before FROM players");
  console.log('Jugadores antes:', before);

  // Delete all players created on 2026-05-11 (the unwanted batch of 452)
  const [result] = await seq.query(`
    DELETE FROM players
    WHERE CAST(createdAt AS DATE) = '2026-05-12'
  `);

  const [[{ after }]] = await seq.query("SELECT COUNT(*) AS after FROM players");
  console.log('Jugadores eliminados:', before - after);
  console.log('Jugadores restantes:', after);

  // Verify remaining are only the originals
  const [byDate] = await seq.query(`
    SELECT CAST(createdAt AS DATE) AS fecha, COUNT(*) AS total
    FROM players
    GROUP BY CAST(createdAt AS DATE)
    ORDER BY fecha
  `);
  console.log('\nDistribución por fecha (deben ser solo 2026-05-05 y 2026-05-09):');
  byDate.forEach(r => console.log(`  ${r.fecha}: ${r.total} jugadores`));

  await seq.close();
}
main().catch(console.error);
