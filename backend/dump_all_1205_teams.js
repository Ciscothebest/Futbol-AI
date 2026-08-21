const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const dbPath = path.join(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
  db.all("SELECT id, name, leagueName, country FROM teams", [], (err, rows) => {
    if (err) {
      console.error(err);
    } else {
      console.log(`Total teams in 'teams' table: ${rows.length}`);
      const teamList = rows.map(r => ({
        id: r.id,
        name: r.name ? r.name.trim() : "",
        league: r.leagueName ? r.leagueName.trim() : "",
        country: r.country ? r.country.trim() : ""
      })).filter(t => t.name.length > 0);
      
      console.log(`Valid named teams: ${teamList.length}`);
      fs.writeFileSync(path.join(__dirname, 'all_1205_teams.json'), JSON.stringify(teamList, null, 2), 'utf-8');
    }
    db.close();
  });
});
