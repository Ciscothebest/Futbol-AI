// Compare SQLite vs SQL Server to find missing players
const path = require('path');
const { Sequelize, DataTypes } = require('sequelize');

async function run() {
  // Connect to SQL Server (current state = 688)
  const mssql = new Sequelize('FutbolAI', 'football_user', 'FootballPassword123!', {
    dialect: 'mssql',
    host: 'localhost',
    port: 1433,
    dialectOptions: { options: { encrypt: false, trustServerCertificate: true } },
    logging: false
  });

  // Connect to SQLite (may have 164 now, but let's check)
  const sqliteLocal = new Sequelize({
    dialect: 'sqlite',
    storage: 'C:\\Users\\franc\\OneDrive\\Escritorio\\Futbol AI Local\\backend\\database.sqlite',
    logging: false
  });

  // Check counts
  const [mssqlResult] = await mssql.query('SELECT COUNT(*) as cnt FROM Players');
  const [sqliteResult] = await sqliteLocal.query('SELECT COUNT(*) as cnt FROM Players');
  console.log('SQL Server count:', mssqlResult[0].cnt);
  console.log('SQLite count:', sqliteResult[0].cnt);

  // Get all IDs from SQL Server
  const [mssqlIds] = await mssql.query('SELECT id FROM Players');
  const mssqlSet = new Set(mssqlIds.map(r => r.id));

  // Get all IDs from SQLite
  const [sqliteIds] = await sqliteLocal.query('SELECT id FROM Players');
  const sqliteSet = new Set(sqliteIds.map(r => r.id));

  // Find what's in SQLite but not in SQL Server
  const missingFromMssql = [...sqliteSet].filter(id => !mssqlSet.has(id));
  // Find what's in SQL Server but not in SQLite
  const missingFromSqlite = [...mssqlSet].filter(id => !sqliteSet.has(id));

  console.log('\nIn SQLite but NOT in SQL Server (', missingFromMssql.length, '):');
  missingFromMssql.forEach(id => console.log(' -', id));

  console.log('\nIn SQL Server but NOT in SQLite (', missingFromSqlite.length, '):');
  missingFromSqlite.forEach(id => console.log(' -', id));

  await mssql.close();
  await sqliteLocal.close();
}

run().catch(e => { console.error(e.message); process.exit(1); });
