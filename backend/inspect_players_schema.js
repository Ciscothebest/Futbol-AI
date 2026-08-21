const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database.sqlite');

db.serialize(() => {
  db.all("PRAGMA table_info(players)", [], (err, rows) => {
    console.log("=== PLAYERS TABLE INFO ===");
    console.log(rows);
  });

  db.all("SELECT * FROM players LIMIT 5", [], (err, rows) => {
    console.log("=== SAMPLE PLAYERS ===");
    console.log(rows);
  });

  db.all("SELECT t.id, t.name, t.leagueName FROM teams t WHERE t.leagueName LIKE '%LDF%' OR t.leagueName LIKE '%Dominicana%'", [], (err, teams) => {
    console.log("=== LDF TEAMS IN DB ===");
    console.log(teams);
  });
});
