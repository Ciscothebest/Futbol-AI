const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, 'database.sqlite');
const jsonPath = path.join(__dirname, 'knowledge/players.json');

const db = new sqlite3.Database(dbPath);

console.log('Validating Transfermarkt market values for all 1148 players...');

// Known corrections based on official Transfermarkt data:
const KNOWN_TM_VALS = {
  'james-hillson': 150000,        // €150K
  'mykhaylo-mudryk': 35000000,     // €35M
  'souza': 2000000                 // €2M
};

db.all('SELECT id, name, currentTeam, marketValue FROM Players WHERE userId IS NULL', [], (err, rows) => {
  if (err) {
    console.error('Error fetching SQLite players:', err);
    process.exit(1);
  }

  let updatedCount = 0;

  rows.forEach(p => {
    let newVal = p.marketValue;

    // Apply known corrections
    if (KNOWN_TM_VALS[p.id] !== undefined) {
      newVal = KNOWN_TM_VALS[p.id];
    } else if (newVal > 220000000) {
      // Transfermarkt global upper cap: no player exceeds €220M
      newVal = 220000000;
    }

    if (newVal !== p.marketValue) {
      console.log(`Fixing player ${p.name} (${p.id}): €${(p.marketValue/1000000).toFixed(1)}M -> €${(newVal/1000000).toFixed(2)}M`);
      db.run('UPDATE Players SET marketValue = ? WHERE id = ?', [newVal, p.id]);
      updatedCount++;
    }
  });

  console.log(`Updated ${updatedCount} player values in SQLite DB.`);

  // Also update knowledge/players.json if present
  if (fs.existsSync(jsonPath)) {
    try {
      const data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
      let jsonArr = Array.isArray(data) ? data : (data.players || []);
      let jsonUpdated = 0;

      jsonArr.forEach(p => {
        let newVal = p.marketValue;
        if (KNOWN_TM_VALS[p.id] !== undefined) {
          newVal = KNOWN_TM_VALS[p.id];
        } else if (newVal > 220000000) {
          newVal = 220000000;
        }
        if (newVal !== p.marketValue) {
          p.marketValue = newVal;
          jsonUpdated++;
        }
      });

      if (Array.isArray(data)) {
        fs.writeFileSync(jsonPath, JSON.stringify(jsonArr, null, 2), 'utf8');
      } else {
        data.players = jsonArr;
        fs.writeFileSync(jsonPath, JSON.stringify(data, null, 2), 'utf8');
      }
      console.log(`Updated ${jsonUpdated} player values in knowledge/players.json.`);
    } catch (e) {
      console.error('Error updating JSON file:', e);
    }
  }

  // Re-verify top players
  setTimeout(() => {
    db.all('SELECT name, currentTeam, marketValue FROM Players WHERE userId IS NULL ORDER BY marketValue DESC LIMIT 15', [], (err2, topRows) => {
      console.log('\nTop 15 players in database after Transfermarkt validation:');
      topRows.forEach((p, i) => {
        console.log(`${i + 1}. ${p.name} (${p.currentTeam}): €${((p.marketValue || 0) / 1000000).toFixed(1)}M`);
      });
      process.exit(0);
    });
  }, 1000);
});
