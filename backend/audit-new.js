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

  const [[{ total }]] = await seq.query('SELECT COUNT(*) AS total FROM players');
  console.log('Total actual:', total);

  // Show oldest 173 (the original ones) vs newer ones
  const [all] = await seq.query('SELECT id, name, createdAt FROM players ORDER BY createdAt ASC');

  // Group by date to understand when batches were inserted
  const byDate = {};
  all.forEach(p => {
    const d = new Date(p.createdAt).toISOString().split('T')[0];
    byDate[d] = (byDate[d] || 0) + 1;
  });

  console.log('\nJugadores por fecha de creación:');
  Object.entries(byDate).forEach(([d, c]) => console.log(`  ${d}: ${c} jugadores`));

  // Show newest 20 to understand what was added
  console.log('\nÚltimos 20 agregados:');
  all.slice(-20).forEach(p => console.log(`  ${p.createdAt?.toString().substring(0,24)} | ${p.id} | ${p.name}`));

  await seq.close();
}
main().catch(console.error);
