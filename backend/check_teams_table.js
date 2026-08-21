const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
  db.all("SELECT name FROM teams", [], (err, rows) => {
    if (err) return console.error(err);
    console.log("Teams from 'teams' table:", rows.map(r => r.name));
    db.close();
  });
});
