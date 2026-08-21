const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const dbPath = path.join(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
  // Query all tables to find columns related to team/currentTeam/league
  db.all("SELECT name FROM sqlite_master WHERE type='table'", [], (err, tables) => {
    if (err) return console.error(err);
    console.log("Tables in database:", tables.map(t => t.name));
    
    // Check players or teams table
    db.all("SELECT DISTINCT currentTeam FROM players WHERE currentTeam IS NOT NULL AND currentTeam != ''", [], (err, rows) => {
      if (err) {
        console.error("Error querying players:", err.message);
      } else {
        const teams = rows.map(r => r.currentTeam).sort();
        console.log(`\nFound ${teams.length} distinct teams in players table:`);
        console.log(teams);
        
        fs.writeFileSync(path.join(__dirname, 'db_all_teams.json'), JSON.stringify(teams, null, 2), 'utf-8');
      }
      db.close();
    });
  });
});
