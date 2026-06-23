const fs = require('fs');
const path = require('path');

process.env.DB_DIALECT = 'sqlite';
process.env.DB_HOST = '';

const artificialIds = [
  'jack-white',
  'alex-martinez',
  'bernardo-santos',
  'matheus-da-silva',
  'ruben-torres',
  'rafael-silva',
  'federico-sanchez',
  'carlos-lopez',
  'aaron-smith'
];

async function main() {
  const playersJsonPath = path.join(__dirname, 'knowledge/players.json');
  const data = JSON.parse(fs.readFileSync(playersJsonPath, 'utf8'));

  const before = data.players.length;
  data.players = data.players.filter(p => !artificialIds.includes(p.id));
  const after = data.players.length;

  fs.writeFileSync(playersJsonPath, JSON.stringify(data, null, 2));
  console.log(`✅ players.json: ${before} → ${after} jugadores (eliminados ${before - after})`);

  // Remove from SQLite
  const { sequelize } = require('./database');
  for (const id of artificialIds) {
    await sequelize.query(`DELETE FROM Players WHERE id = '${id}'`).catch(() => {});
  }
  const [[{ cnt }]] = await sequelize.query('SELECT COUNT(*) as cnt FROM Players');
  console.log(`✅ SQLite: ${cnt} jugadores`);
  await sequelize.close();

  // Remove from MSSQL
  const { Sequelize } = require('sequelize');
  const mssql = new Sequelize('FutbolAI', 'football_user', 'FootballPassword123!', {
    dialect: 'mssql', host: 'localhost', port: 1433,
    dialectOptions: { options: { encrypt: false, trustServerCertificate: true } },
    logging: false
  });
  try {
    await mssql.authenticate();
    for (const id of artificialIds) {
      await mssql.query(`DELETE FROM Players WHERE id = '${id}'`).catch(() => {});
    }
    const [[{ cnt: mssqlCnt }]] = await mssql.query('SELECT COUNT(*) as cnt FROM Players');
    console.log(`✅ MSSQL FutbolAI: ${mssqlCnt} jugadores`);
    await mssql.close();
  } catch (e) {
    console.log('⚠️  MSSQL:', e.message.substring(0, 60));
  }

  console.log(`\n🎉 Listo. Total jugadores: ${after}`);
}

main().catch(e => { console.error(e.message); process.exit(1); });
