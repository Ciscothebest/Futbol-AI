const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, 'database.sqlite');
const jsonPath = path.join(__dirname, 'knowledge/players.json');
const db = new sqlite3.Database(dbPath);

console.log('Populating medicalStatus and injuries for La Liga players...');

db.run(`UPDATE Players SET medicalStatus = 'Disponible', injuries = '["Sin lesiones activas"]' WHERE (medicalStatus IS NULL OR medicalStatus = '') AND (league LIKE '%LaLiga%' OR league LIKE '%La Liga%' OR country LIKE '%España%')`, function(err) {
  if (err) {
    console.error('Error updating SQLite medicalStatus:', err);
    process.exit(1);
  }
  console.log(`Updated medicalStatus & injuries for ${this.changes} La Liga players in SQLite DB.`);

  // Also update knowledge/players.json
  if (fs.existsSync(jsonPath)) {
    try {
      const data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
      let jsonArr = Array.isArray(data) ? data : (data.players || []);
      let count = 0;

      jsonArr.forEach(p => {
        if ((p.league && p.league.toLowerCase().includes('laliga')) || (p.country && p.country.toLowerCase().includes('españa'))) {
          if (!p.medicalStatus) p.medicalStatus = 'Disponible';
          if (!p.injuries || p.injuries.length === 0) p.injuries = ['Sin lesiones activas'];
          count++;
        }
      });

      if (Array.isArray(data)) {
        fs.writeFileSync(jsonPath, JSON.stringify(jsonArr, null, 2), 'utf8');
      } else {
        data.players = jsonArr;
        fs.writeFileSync(jsonPath, JSON.stringify(data, null, 2), 'utf8');
      }
      console.log(`Updated medicalStatus & injuries in knowledge/players.json for ${count} players.`);
    } catch(e) {
      console.error('JSON update error:', e);
    }
  }

  process.exit(0);
});
