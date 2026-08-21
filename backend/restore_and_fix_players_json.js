const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const jsonPath = path.join(__dirname, 'knowledge/players.json');
const dbPath = path.join(__dirname, 'database.sqlite');

let rawData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
let playerList = Array.isArray(rawData) ? rawData : (rawData.players || []);

console.log(`Loaded ${playerList.length} players from knowledge/players.json.`);

// Ensure JSON structure is always { "players": [...] }
const fixedJsonStructure = { players: playerList };
fs.writeFileSync(jsonPath, JSON.stringify(fixedJsonStructure, null, 2), 'utf8');
console.log('Saved knowledge/players.json with proper { "players": [...] } root key.');

// Sync all 1148 marketValues directly into SQLite database
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
  db.run('BEGIN TRANSACTION');
  
  const stmt = db.prepare('UPDATE Players SET marketValue = ? WHERE id = ?');
  let count = 0;

  playerList.forEach(p => {
    stmt.run([p.marketValue || 0, p.id]);
    count++;
  });

  stmt.finalize();

  db.run('COMMIT', (err) => {
    if (err) {
      console.error('Error committing SQLite updates:', err);
    } else {
      console.log(`✅ Successfully updated individual marketValue for all ${count} players in SQLite database.`);
    }

    // Verify sample player values
    db.all('SELECT name, currentTeam, marketValue FROM Players WHERE userId IS NULL ORDER BY marketValue DESC LIMIT 15', [], (err2, rows) => {
      console.log('\nTop 15 players in SQLite DB:');
      rows.forEach((r, i) => {
        console.log(`${i + 1}. ${r.name} (${r.currentTeam}): €${(r.marketValue / 1000000).toFixed(1)}M`);
      });

      db.all('SELECT name, currentTeam, marketValue FROM Players WHERE marketValue < 5000000 AND userId IS NULL LIMIT 10', [], (err3, lowRows) => {
        console.log('\nSample 10 low-marketValue players (< €5M) in SQLite DB:');
        lowRows.forEach((r, i) => {
          console.log(`${i + 1}. ${r.name} (${r.currentTeam}): €${(r.marketValue / 1000000).toFixed(2)}M`);
        });
        process.exit(0);
      });
    });
  });
});
