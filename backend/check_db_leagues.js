const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const dbPath = path.join(__dirname, 'database.sqlite');
const jsonPath = path.join(__dirname, 'knowledge', 'players.json');
const desktopDbPath = 'C:\\Users\\franc\\OneDrive\\Escritorio\\Futbol AI Local\\backend\\database.sqlite';
const desktopJsonPath = 'C:\\Users\\franc\\OneDrive\\Escritorio\\Futbol AI Local\\backend\\knowledge\\players.json';

console.log("=== DB AUDIT FOR LEAGUES AND PLAYER COUNTS ===");

const db = new sqlite3.Database(dbPath);

db.all("SELECT league, count(*) as count FROM Players WHERE userId IS NULL GROUP BY league", [], (err, rows) => {
  if (err) console.error("SQLite Error:", err);
  else console.log("\n📊 Local Project Database (database.sqlite) Leagues:", rows);

  if (fs.existsSync(desktopDbPath)) {
    const desktopDb = new sqlite3.Database(desktopDbPath);
    desktopDb.all("SELECT league, count(*) as count FROM Players WHERE userId IS NULL GROUP BY league", [], (err, dRows) => {
      if (err) console.error("Desktop DB Error:", err);
      else console.log("\n🖥️ Desktop Local Folder Database (database.sqlite) Leagues:", dRows);
      
      process.exit(0);
    });
  } else {
    process.exit(0);
  }
});
