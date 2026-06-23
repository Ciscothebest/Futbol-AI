/**
 * restore-from-mssql.js
 * Restores the local workspace from SQL Server (FutbolAI) as source of truth.
 * - Dumps all 697 players from MSSQL to players.json
 * - Rebuilds SQLite database from scratch with those players
 */

const path = require('path');
const fs = require('fs');
const { Sequelize, DataTypes } = require('sequelize');

// Force SQLite for the target
process.env.DB_DIALECT = 'sqlite';
process.env.DB_HOST = '';

const sqlitePath = path.join(__dirname, 'database.sqlite');
const playersJsonPath = path.join(__dirname, 'knowledge/players.json');

async function main() {
  console.log('🔧 Restoring workspace from MSSQL FutbolAI (697 players)...\n');

  // 1. Connect to MSSQL and get all players
  console.log('🐘 Connecting to SQL Server FutbolAI...');
  const mssql = new Sequelize('FutbolAI', 'football_user', 'FootballPassword123!', {
    dialect: 'mssql',
    host: 'localhost',
    port: 1433,
    dialectOptions: { options: { encrypt: false, trustServerCertificate: true } },
    logging: false
  });

  await mssql.authenticate();
  console.log('✅ Connected to MSSQL FutbolAI');

  // Get all players from MSSQL
  const [mssqlPlayers] = await mssql.query('SELECT * FROM Players ORDER BY name');
  console.log(`✅ Retrieved ${mssqlPlayers.length} players from MSSQL`);

  // Parse JSON fields that come back as strings
  const parsedPlayers = mssqlPlayers.map(p => {
    const player = { ...p };
    // Remove sequelize metadata fields
    delete player.createdAt;
    delete player.updatedAt;
    
    // Parse JSON string fields back to objects/arrays
    ['stats', 'careerTotals', 'trophies', 'transfers', 'strengths', 'tags', 'history'].forEach(field => {
      if (player[field] && typeof player[field] === 'string') {
        try {
          player[field] = JSON.parse(player[field]);
        } catch (e) {
          // Keep as-is if not parseable
        }
      }
    });
    return player;
  });

  await mssql.close();
  console.log('✅ MSSQL connection closed\n');

  // 2. Backup existing players.json
  if (fs.existsSync(playersJsonPath)) {
    const backupPath = playersJsonPath + '.backup_' + Date.now();
    fs.copyFileSync(playersJsonPath, backupPath);
    console.log(`📦 Backed up players.json to: ${path.basename(backupPath)}`);
  }

  // 3. Write new players.json from MSSQL data
  const playersJson = { players: parsedPlayers };
  fs.writeFileSync(playersJsonPath, JSON.stringify(playersJson, null, 2));
  console.log(`📝 players.json updated with ${parsedPlayers.length} players from MSSQL\n`);

  // 4. Backup and delete old SQLite
  if (fs.existsSync(sqlitePath)) {
    const backupSqlite = sqlitePath + '.backup_' + Date.now();
    fs.copyFileSync(sqlitePath, backupSqlite);
    console.log(`📦 Backed up database.sqlite to: ${path.basename(backupSqlite)}`);
    fs.unlinkSync(sqlitePath);
    console.log('🗑️  Old database.sqlite deleted\n');
  }

  // 5. Rebuild SQLite from scratch
  console.log('🏗️  Rebuilding SQLite database...');
  const { sequelize, Player, User, League, Team, Payment, QueryLog, ComparisonLog, FavoriteLog } = require('./database');
  const seedLeaguesAndTeams = require('./seed-db-onboarding');

  await sequelize.authenticate();
  const dialect = sequelize.options.dialect;
  console.log(`✅ Connected to: ${dialect} (${sequelize.options.storage})`);

  if (dialect !== 'sqlite') {
    console.error('❌ ERROR: Expected SQLite but got ' + dialect);
    process.exit(1);
  }

  // Create all tables fresh
  await User.sync({ force: true });
  await Player.sync({ force: true });
  await Payment.sync({ force: true });
  await QueryLog.sync({ force: true });
  await ComparisonLog.sync({ force: true });
  await FavoriteLog.sync({ force: true });
  await League.sync({ force: true });
  await Team.sync({ force: true });
  console.log('✅ All tables created fresh\n');

  // Seed leagues and teams
  console.log('🌍 Seeding leagues and teams...');
  await seedLeaguesAndTeams();

  // Seed players in batches
  console.log(`\n⚽ Seeding ${parsedPlayers.length} players into SQLite...`);
  const playersToInsert = parsedPlayers.map(p => ({
    ...p,
    stats: p.stats ? JSON.stringify(p.stats) : null,
    careerTotals: p.careerTotals ? JSON.stringify(p.careerTotals) : null,
    trophies: p.trophies ? JSON.stringify(p.trophies) : null,
    transfers: p.transfers ? JSON.stringify(p.transfers) : null,
    strengths: p.strengths ? JSON.stringify(p.strengths) : null,
    tags: p.tags ? JSON.stringify(p.tags) : null,
    history: p.history ? JSON.stringify(p.history) : null
  }));

  const BATCH_SIZE = 50;
  let inserted = 0;
  let errors = 0;

  for (let i = 0; i < playersToInsert.length; i += BATCH_SIZE) {
    const batch = playersToInsert.slice(i, i + BATCH_SIZE);
    try {
      await Player.bulkCreate(batch, { ignoreDuplicates: true });
      inserted += batch.length;
      process.stdout.write(`\r   Progress: ${Math.min(inserted, playersToInsert.length)}/${playersToInsert.length}`);
    } catch (e) {
      for (const p of batch) {
        try {
          await Player.create(p);
          inserted++;
          process.stdout.write(`\r   Progress: ${inserted}/${playersToInsert.length}`);
        } catch (err) {
          errors++;
        }
      }
    }
  }

  const finalCount = await Player.count();
  console.log(`\n\n📊 Final Status:`);
  console.log(`   Players in SQLite: ${finalCount}`);
  console.log(`   Players in JSON:   ${parsedPlayers.length}`);
  if (errors > 0) console.warn(`   ⚠️  Errors: ${errors}`);

  // Verify key players have correct photo IDs
  console.log('\n🔍 Verifying photo IDs for key players...');
  const keyIds = ['marc-casado', 'alejandro-balde', 'gavi', 'cole-palmer', 'martin-odegaard', 'william-saliba', 'antonio-rudiger'];
  for (const id of keyIds) {
    const p = await Player.findByPk(id);
    if (p) {
      console.log(`   ${id}: photoId=${p.photoId}`);
    } else {
      console.log(`   ${id}: NOT FOUND`);
    }
  }

  if (finalCount >= 697) {
    console.log('\n🎉 RESTORATION SUCCESSFUL! All 697 players restored from MSSQL.');
  } else {
    console.warn(`\n⚠️  Expected 697, got ${finalCount}`);
  }

  await sequelize.close();
  console.log('\n✅ Done. Workspace restored from MSSQL FutbolAI.');
}

main().catch(e => {
  console.error('\n❌ Fatal error:', e.message);
  console.error(e.stack);
  process.exit(1);
});
