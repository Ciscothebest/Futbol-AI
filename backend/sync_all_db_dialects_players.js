const fs = require('fs');
const path = require('path');
const { Sequelize, DataTypes } = require('sequelize');

const playersJsonPath = path.join(__dirname, 'knowledge/players.json');
const playersData = JSON.parse(fs.readFileSync(playersJsonPath, 'utf8'));
const playersList = Array.isArray(playersData) ? playersData : (playersData.players || []);

console.log(`Loaded ${playersList.length} players from knowledge/players.json.`);

// 1. Sync SQLite DB
async function syncSQLite() {
  console.log('\n--- Syncing SQLite database (database.sqlite) ---');
  const sqliteSequelize = new Sequelize({
    dialect: 'sqlite',
    storage: path.join(__dirname, 'database.sqlite'),
    logging: false
  });

  const Player = sqliteSequelize.define('Player', {
    id: { type: DataTypes.STRING, primaryKey: true },
    name: DataTypes.STRING,
    marketValue: DataTypes.BIGINT
  }, { tableName: 'Players', timestamps: false });

  await sqliteSequelize.sync();

  let updatedCount = 0;
  for (const p of playersList) {
    const [affectedRows] = await Player.update(
      { marketValue: p.marketValue || 0 },
      { where: { id: p.id } }
    );
    if (affectedRows > 0) updatedCount++;
  }
  console.log(`✅ Updated marketValue for ${updatedCount} players in SQLite database.`);
  await sqliteSequelize.close();
}

// 2. Sync MSSQL / SQL Server DB if configured
async function syncMSSQL() {
  require('dotenv').config({ path: path.join(__dirname, '.env') });
  const rawHost = process.env.DB_HOST || '127.0.0.1';
  const dbHost = (rawHost === 'localhost') ? '127.0.0.1' : rawHost;

  console.log(`\n--- Syncing MSSQL database (${dbHost}: FutbolAI) ---`);
  try {
    const mssqlSequelize = new Sequelize(
      process.env.DB_NAME || 'FutbolAI',
      process.env.DB_USER || 'sa',
      process.env.DB_PASS || 'YourStrongPassword123!',
      {
        host: dbHost,
        port: process.env.DB_PORT || 1433,
        dialect: 'mssql',
        dialectOptions: {
          options: {
            encrypt: false,
            trustServerCertificate: true
          }
        },
        logging: false
      }
    );

    await mssqlSequelize.authenticate();
    console.log('Connected to MSSQL successfully.');

    const Player = mssqlSequelize.define('Player', {
      id: { type: DataTypes.STRING, primaryKey: true },
      name: DataTypes.STRING,
      marketValue: DataTypes.BIGINT
    }, { tableName: 'Players', timestamps: false });

    await Player.sync({ alter: true });

    let updatedCount = 0;
    for (const p of playersList) {
      const [affectedRows] = await Player.update(
        { marketValue: p.marketValue || 0 },
        { where: { id: p.id } }
      );
      if (affectedRows > 0) updatedCount++;
    }
    console.log(`✅ Updated marketValue for ${updatedCount} players in MSSQL database.`);
    await mssqlSequelize.close();
  } catch (err) {
    console.warn(`MSSQL sync skipped or failed (${err.message}). SQLite is fully updated.`);
  }
}

async function run() {
  await syncSQLite();
  await syncMSSQL();
  console.log('\nAll database sync operations complete.');
  process.exit(0);
}

run();
