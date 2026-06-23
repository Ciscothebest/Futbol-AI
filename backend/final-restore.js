/**
 * final-restore.js
 * 
 * Restores the workspace to the correct state before midnight June 8:
 * 1. Uses the backup players.json (697 players with all corrections from before midnight)
 * 2. Applies player-faces.js photo IDs to ensure all famous players have correct photos
 * 3. Rebuilds SQLite from scratch with the corrected data
 * 4. Syncs corrections to MSSQL FutbolAI as well
 */

const path = require('path');
const fs = require('fs');
const { Sequelize, DataTypes } = require('sequelize');

// Force SQLite mode
process.env.DB_DIALECT = 'sqlite';
process.env.DB_HOST = '';

const sqlitePath = path.join(__dirname, 'database.sqlite');
const playersJsonPath = path.join(__dirname, 'knowledge/players.json');
const backupJsonPath = path.join(__dirname, 'knowledge/players.json.backup_1780977277615');
const playerFacesPath = path.join(__dirname, 'player-faces.js');

async function main() {
  console.log('🔧 Final restoration to pre-midnight state...\n');

  // 1. Load the player-faces.js mappings (correct photo IDs)
  const playerFaces = require(playerFacesPath);
  console.log(`📸 Loaded ${Object.keys(playerFaces).length} photo ID mappings from player-faces.js`);

  // 2. Load the backup players.json (697 players from 2:05am backup)
  let playersData;
  if (fs.existsSync(backupJsonPath)) {
    playersData = JSON.parse(fs.readFileSync(backupJsonPath, 'utf8'));
    console.log(`📋 Loaded backup players.json: ${playersData.players.length} players`);
  } else {
    console.error('❌ Backup players.json not found! Looking for alternatives...');
    // Try current
    if (fs.existsSync(playersJsonPath)) {
      playersData = JSON.parse(fs.readFileSync(playersJsonPath, 'utf8'));
      console.log(`📋 Using current players.json: ${playersData.players.length} players`);
    } else {
      console.error('❌ No players.json found!');
      process.exit(1);
    }
  }

  // 3. Apply player-faces.js photo ID corrections to the players array
  // The player-faces.js uses different ID formats (e.g. "cole-palmer", "martin-odegaard")
  // The players.json may use the same IDs - we need to match them
  
  let corrected = 0;
  const playerFacesMap = playerFaces; // already an object

  // Map of player-faces IDs to players.json IDs (for cases where they differ)
  // player-faces uses: cole-palmer, martin-odegaard, william-saliba, etc.
  // players.json uses: same format typically

  playersData.players.forEach(p => {
    // Direct ID match
    if (playerFacesMap[p.id] !== undefined) {
      if (p.photoId !== playerFacesMap[p.id]) {
        p.photoId = playerFacesMap[p.id];
        corrected++;
      }
    }
    
    // Also try name-based matching for some players with different ID formats
    // e.g. "gavi-paez" in player-faces vs "gavi" in players.json
    const slugName = p.name.toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s]/g, '').trim().replace(/\s+/g, '-');
    
    if (!playerFacesMap[p.id] && playerFacesMap[slugName] !== undefined) {
      if (p.photoId !== playerFacesMap[slugName]) {
        p.photoId = playerFacesMap[slugName];
        corrected++;
      }
    }
  });

  // Also check for specific important players by name fragments
  const importantPlayers = {
    'Cole Palmer': '257534',
    'Martin Ødegaard': '222665',
    'William Saliba': '243715',
    'Pervis Estupiñán': '231533',
    'Antonio Rüdiger': '205452',
    'Alejandro Baldé': '263578',
    'Gavi': '264240',
    'Marc Casadó': '263595',
    'Pedro Porro': '243576',
    'Andriy Lunin': '243952',
    'Dani Ceballos': '222509',
  };

  Object.entries(importantPlayers).forEach(([name, photoId]) => {
    const player = playersData.players.find(p => p.name === name || p.name.includes(name.split(' ')[0]));
    if (player && player.name === name) {
      if (player.photoId !== photoId) {
        console.log(`   🔧 ${player.name}: ${player.photoId} -> ${photoId}`);
        player.photoId = photoId;
        corrected++;
      }
    }
  });

  console.log(`✅ Applied ${corrected} photo ID corrections\n`);

  // Show key players status
  console.log('Key players after corrections:');
  const checkPlayers = ['Alejandro Baldé', 'Gavi', 'Marc Casadó', 'Pedro Porro', 'Cole Palmer', 'Martin Ødegaard', 'William Saliba', 'Antonio Rüdiger'];
  checkPlayers.forEach(name => {
    const p = playersData.players.find(x => x.name === name);
    console.log(`   ${name}: ${p ? 'photoId=' + p.photoId : 'NOT FOUND'} (id: ${p ? p.id : 'N/A'})`);
  });

  // 4. Backup current players.json and write restored version
  if (fs.existsSync(playersJsonPath)) {
    const backupNew = playersJsonPath + '.pre_restore_' + Date.now();
    fs.copyFileSync(playersJsonPath, backupNew);
  }
  fs.writeFileSync(playersJsonPath, JSON.stringify(playersData, null, 2));
  console.log(`\n📝 players.json restored: ${playersData.players.length} players`);

  // 5. Backup and rebuild SQLite
  if (fs.existsSync(sqlitePath)) {
    const backupSqlite = sqlitePath + '.pre_restore_' + Date.now();
    fs.copyFileSync(sqlitePath, backupSqlite);
    fs.unlinkSync(sqlitePath);
    console.log('🗑️  Old database.sqlite removed\n');
  }

  // Import database modules fresh
  const { sequelize, Player, User, League, Team, Payment, QueryLog, ComparisonLog, FavoriteLog } = require('./database');
  const seedLeaguesAndTeams = require('./seed-db-onboarding');

  await sequelize.authenticate();
  console.log(`✅ Connected to: ${sequelize.options.dialect}`);

  // Sync all tables
  console.log('🏗️  Creating database tables...');
  await User.sync({ force: true });
  await Player.sync({ force: true });
  await Payment.sync({ force: true });
  await QueryLog.sync({ force: true });
  await ComparisonLog.sync({ force: true });
  await FavoriteLog.sync({ force: true });
  await League.sync({ force: true });
  await Team.sync({ force: true });
  console.log('✅ Tables ready\n');

  // Seed leagues and teams
  console.log('🌍 Seeding leagues and teams...');
  await seedLeaguesAndTeams();

  // Seed players
  console.log(`\n⚽ Seeding ${playersData.players.length} players...`);
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

  const BATCH = 50;
  let ins = 0, errs = 0;
  for (let i = 0; i < playersToInsert.length; i += BATCH) {
    const batch = playersToInsert.slice(i, i + BATCH);
    try {
      await Player.bulkCreate(batch, { ignoreDuplicates: true });
      ins += batch.length;
      process.stdout.write(`\r   ${Math.min(ins, playersToInsert.length)}/${playersToInsert.length}`);
    } catch (e) {
      for (const p of batch) {
        try { await Player.create(p); ins++; } catch (err) { errs++; }
      }
    }
  }

  const finalCount = await Player.count();
  console.log(`\n\n📊 SQLite: ${finalCount} players (${errs} errors)`);

  // 6. Also update MSSQL with the corrected photo IDs for players that exist there
  console.log('\n🐘 Applying photo corrections to MSSQL FutbolAI...');
  try {
    const mssql = new Sequelize('FutbolAI', 'football_user', 'FootballPassword123!', {
      dialect: 'mssql', host: 'localhost', port: 1433,
      dialectOptions: { options: { encrypt: false, trustServerCertificate: true } },
      logging: false
    });
    await mssql.authenticate();

    const MssqlPlayer = mssql.define('Player', {
      id: { type: DataTypes.STRING, primaryKey: true },
      photoId: DataTypes.STRING,
      name: DataTypes.STRING
    });

    let mssqlFixed = 0;
    // Apply corrections from player-faces.js to MSSQL
    for (const [id, photoId] of Object.entries(playerFacesMap)) {
      try {
        const [result] = await mssql.query(
          `UPDATE Players SET photoId = '${photoId}' WHERE id = '${id}'`
        );
        if (result > 0) mssqlFixed++;
      } catch (e) { /* ignore */ }
    }
    // Also update important players by their actual IDs in MSSQL
    const mssqlUpdates = {
      'alejandro-balde': '263578',
      'marc-casado': '263595',
      'gavi-paez': '264240',
      'porro-pedro': '243576',
      'andriy-lunin': '243952',
      'dani-ceballos': '222509',
      'antonio-rudiger': '205452',
    };
    for (const [id, photoId] of Object.entries(mssqlUpdates)) {
      await mssql.query(`UPDATE Players SET photoId = '${photoId}' WHERE id = '${id}'`).catch(() => {});
    }

    const [cnt] = await mssql.query('SELECT COUNT(*) as cnt FROM Players');
    console.log(`✅ MSSQL FutbolAI: ${cnt[0].cnt} players, ${mssqlFixed} photo IDs updated`);
    await mssql.close();
  } catch (e) {
    console.log(`⚠️  MSSQL update skipped: ${e.message.substring(0, 60)}`);
  }

  console.log('\n🎉 RESTORATION COMPLETE!');
  console.log(`   players.json: ${playersData.players.length} players`);
  console.log(`   database.sqlite: ${finalCount} players`);

  await sequelize.close();
}

main().catch(e => {
  console.error('\n❌ Fatal error:', e.message);
  console.error(e.stack);
  process.exit(1);
});
