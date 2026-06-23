/**
 * restore-local-db.js
 * Rebuilds the local SQLite database from scratch using players.json.
 * Run: node restore-local-db.js
 */

const path = require('path');
const fs = require('fs');

// Force SQLite mode BEFORE loading database.js
process.env.DB_DIALECT = 'sqlite';
process.env.DB_HOST = '';  // clear to avoid MSSQL path

const sqlitePath = path.join(__dirname, 'database.sqlite');

async function main() {
  console.log('🔧 Starting local SQLite DB restoration...\n');
  
  // Step 1: Check players.json
  const playersFile = path.join(__dirname, 'knowledge/players.json');
  if (!fs.existsSync(playersFile)) {
    console.error('❌ players.json not found!');
    process.exit(1);
  }
  const playersData = JSON.parse(fs.readFileSync(playersFile, 'utf8'));
  console.log(`📋 players.json contains: ${playersData.players.length} players`);
  
  // Step 2: Backup old SQLite and delete it
  if (fs.existsSync(sqlitePath)) {
    const backupPath = sqlitePath + '.backup_' + Date.now();
    fs.copyFileSync(sqlitePath, backupPath);
    console.log(`📦 Old database backed up to: ${path.basename(backupPath)}`);
    fs.unlinkSync(sqlitePath);
    console.log(`🗑️  Old database.sqlite deleted\n`);
  }
  
  // Step 3: Load database module (creates fresh SQLite)
  const { sequelize, Player, User, League, Team, Payment, QueryLog, ComparisonLog, FavoriteLog } = require('./database');
  const seedLeaguesAndTeams = require('./seed-db-onboarding');
  
  try {
    await sequelize.authenticate();
    const dialect = sequelize.options.dialect;
    const storage = sequelize.options.storage || 'MSSQL';
    console.log(`✅ Connected to: ${dialect} — ${storage}`);
    
    if (dialect !== 'sqlite') {
      console.error('❌ ERROR: Expected SQLite but got ' + dialect);
      console.error('   Make sure DB_HOST is not set or DB_DIALECT=sqlite is in .env');
      process.exit(1);
    }
  } catch (e) {
    console.error('❌ DB connection failed:', e.message);
    process.exit(1);
  }
  
  // Step 4: Sync all tables (force: true to start clean)
  console.log('🏗️  Creating database tables...');
  await User.sync({ force: true });
  await Player.sync({ force: true });
  await Payment.sync({ force: true });
  await QueryLog.sync({ force: true });
  await ComparisonLog.sync({ force: true });
  await FavoriteLog.sync({ force: true });
  await League.sync({ force: true });
  await Team.sync({ force: true });
  console.log('✅ All tables created fresh\n');
  
  // Step 5: Seed leagues and teams
  console.log('🌍 Seeding leagues and teams...');
  await seedLeaguesAndTeams();
  
  // Step 6: Seed players in batches
  console.log(`\n⚽ Seeding ${playersData.players.length} players from players.json...`);
  
  const playersToInsert = playersData.players.map(p => ({
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
      // Fallback: insert one by one
      for (const p of batch) {
        try {
          await Player.create(p);
          inserted++;
          process.stdout.write(`\r   Progress: ${inserted}/${playersToInsert.length}`);
        } catch (err) {
          errors++;
          // console.error(`\n  ❌ ${p.id}: ${err.message}`);
        }
      }
    }
  }
  
  const finalCount = await Player.count();
  console.log(`\n\n📊 Final Status:`);
  console.log(`   Players in DB:   ${finalCount}`);
  console.log(`   Players in JSON: ${playersData.players.length}`);
  if (errors > 0) {
    console.warn(`   ⚠️  Errors:       ${errors} players had insertion errors`);
  }
  
  if (finalCount >= 680) {
    console.log('\n🎉 Restoration SUCCESSFUL!');
  } else {
    console.warn(`\n⚠️  Only ${finalCount} players restored. Expected ~697.`);
    console.warn('   The players.json may be incomplete. Check if additional players need to be re-added.');
  }
  
  await sequelize.close();
  console.log('\n✅ Done. You can now start the server normally.');
}

main().catch(e => {
  console.error('\n❌ Fatal error:', e.message);
  console.error(e.stack);
  process.exit(1);
});
