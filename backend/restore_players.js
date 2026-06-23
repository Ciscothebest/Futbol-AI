// Extract 9 players from workspace SQLite and restore them everywhere
const fs = require('fs');
const path = require('path');
const { Sequelize } = require('sequelize');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const targetIds = [
  'cole-palmer', 'bukayo-saka', 'martin-odegaard', 'declan-rice',
  'phil-foden', 'william-saliba', 'gabriel-martinelli', 'bruno-guimaraes', 'ollie-watkins', 'alexis-mac-allister'
];

const jsonPaths = [
  path.join(__dirname, 'knowledge/players.json'),
  'C:\\Users\\franc\\OneDrive\\Escritorio\\Futbol AI Local\\backend\\knowledge\\players.json',
  'C:\\Users\\franc\\OneDrive\\Escritorio\\Futbol AI producción\\backend\\knowledge\\players.json'
];

const sqlServerDbs = [
  { name: 'FutbolAI', label: 'FutbolAI (Local)' },
  { name: 'FutbolAI_Prod', label: 'FutbolAI_Prod (Produccion)' }
];

async function run() {
  // 1. Get the 9 players from workspace SQLite (they still exist there)
  const sqlite = new Sequelize({
    dialect: 'sqlite',
    storage: path.join(__dirname, 'database.sqlite'),
    logging: false
  });

  const [rows] = await sqlite.query(
    `SELECT * FROM Players WHERE id IN (${targetIds.map(id => `'${id}'`).join(',')})`
  );
  console.log(`✅ Found ${rows.length} players to restore from SQLite`);
  rows.forEach(r => console.log('  -', r.id, '|', r.name));
  await sqlite.close();

  if (rows.length === 0) {
    console.error('❌ No players found in SQLite source!');
    return;
  }

  // 2. Restore to all players.json files
  for (const jsonPath of jsonPaths) {
    try {
      const data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
      const existingIds = new Set(data.players.map(p => p.id));
      const toAdd = rows.filter(r => !existingIds.has(r.id)).map(r => {
        // Parse JSON fields back to objects for storage
        const parsed = { ...r };
        ['stats','careerTotals','trophies','transfers','strengths','tags','history'].forEach(f => {
          if (parsed[f] && typeof parsed[f] === 'string') {
            try { parsed[f] = JSON.parse(parsed[f]); } catch(e) {}
          }
        });
        return parsed;
      });
      data.players.push(...toAdd);
      fs.writeFileSync(jsonPath, JSON.stringify(data, null, 2));
      console.log(`✅ JSON ${jsonPath.split('\\').pop()}: ${existingIds.size} -> ${data.players.length} players (+${toAdd.length} added)`);
    } catch(e) {
      console.error(`❌ Failed to update JSON at ${jsonPath}:`, e.message);
    }
  }

  // 3. Restore to all SQL Server databases
  for (const dbConfig of sqlServerDbs) {
    try {
      const mssql = new Sequelize(dbConfig.name, 'football_user', 'FootballPassword123!', {
        dialect: 'mssql',
        host: 'localhost',
        port: 1433,
        dialectOptions: { options: { encrypt: false, trustServerCertificate: true } },
        logging: false
      });

      // Check which ones are already there
      const [existing] = await mssql.query(
        `SELECT id FROM Players WHERE id IN (${targetIds.map(id => `'${id}'`).join(',')})`
      );
      const existingSet = new Set(existing.map(r => r.id));
      const missing = rows.filter(r => !existingSet.has(r.id));
      
      if (missing.length === 0) {
        console.log(`⚠️  ${dbConfig.label}: All 9 already present, skipping.`);
        await mssql.close();
        continue;
      }

      let insertedCount = 0;
      for (const player of missing) {
        const safeVal = (v) => {
          if (v === null || v === undefined) return 'NULL';
          const s = String(v).replace(/'/g, "''");
          return `'${s}'`;
        };

        const cols = Object.keys(player).filter(k => k !== 'createdAt' && k !== 'updatedAt');
        const insertCols = [...cols, 'createdAt', 'updatedAt'];
        const vals = cols.map(c => {
          const v = player[c];
          if (v === null || v === undefined) return 'NULL';
          if (typeof v === 'number') return String(v);
          return safeVal(typeof v === 'object' ? JSON.stringify(v) : v);
        });
        vals.push('GETDATE()', 'GETDATE()');

        try {
          await mssql.query(`INSERT INTO Players (${insertCols.join(',')}) VALUES (${vals.join(',')})`);
          insertedCount++;
        } catch(e) {
          console.error(`  ❌ Failed to insert ${player.id}:`, e.message);
        }
      }

      const [countRes] = await mssql.query('SELECT COUNT(*) as cnt FROM Players');
      console.log(`✅ ${dbConfig.label}: +${insertedCount} inserted. Total now: ${countRes[0].cnt}`);
      await mssql.close();
    } catch(e) {
      console.error(`❌ Failed connecting to ${dbConfig.label}:`, e.message);
    }
  }

  // 4. Also restore to SQLite copies in desktop folders
  const sqliteDesktopPaths = [
    'C:\\Users\\franc\\OneDrive\\Escritorio\\Futbol AI Local\\backend\\database.sqlite',
    'C:\\Users\\franc\\OneDrive\\Escritorio\\Futbol AI producción\\backend\\database.sqlite'
  ];
  for (const sqlitePath of sqliteDesktopPaths) {
    try {
      const db = new Sequelize({ dialect: 'sqlite', storage: sqlitePath, logging: false });
      const [existing] = await db.query(
        `SELECT id FROM Players WHERE id IN (${targetIds.map(id => `'${id}'`).join(',')})`
      );
      const existingSet = new Set(existing.map(r => r.id));
      const missing = rows.filter(r => !existingSet.has(r.id));
      let inserted = 0;
      for (const player of missing) {
        const cols = Object.keys(player).filter(k => k !== 'createdAt' && k !== 'updatedAt');
        const insertCols = [...cols, 'createdAt', 'updatedAt'];
        const vals = cols.map(c => {
          const v = player[c];
          if (v === null || v === undefined) return 'NULL';
          const s = String(typeof v === 'object' ? JSON.stringify(v) : v).replace(/'/g, "''");
          return `'${s}'`;
        });
        vals.push("datetime('now')", "datetime('now')");
        try {
          await db.query(`INSERT INTO Players (${insertCols.join(',')}) VALUES (${vals.join(',')})`);
          inserted++;
        } catch(e) { console.error('  ❌', player.id, ':', e.message); }
      }
      const [cnt] = await db.query('SELECT COUNT(*) as cnt FROM Players');
      console.log(`✅ SQLite ${sqlitePath.split('\\').pop()} (${sqlitePath.includes('produccion') || sqlitePath.includes('producci') ? 'Prod' : 'Local'}): +${inserted}. Total: ${cnt[0].cnt}`);
      await db.close();
    } catch(e) {
      console.error('❌ SQLite error:', e.message);
    }
  }

  console.log('\n🎉 Restore complete!');
}

run().catch(e => { console.error(e.message); process.exit(1); });
